const CHECK_INTERVAL = 15 * 60 * 1000;

function parseVersion(value) {
  const match = typeof value === 'string' && value.trim().match(/^v?(\d+)\.(\d+)\.(\d+)(?:\+[\w.-]+)?$/);
  if (!match) return null;
  const parts = match.slice(1, 4).map(Number);
  return parts.every(Number.isSafeInteger) ? parts : null;
}

function compareVersions(left, right) {
  const a = parseVersion(left), b = parseVersion(right);
  if (!a || !b) return null;
  for (let index = 0; index < 3; index++) {
    if (a[index] !== b[index]) return a[index] > b[index] ? 1 : -1;
  }
  return 0;
}

function validRepository(value) {
  return typeof value === 'string' && /^[A-Za-z0-9][A-Za-z0-9-]{0,38}\/[A-Za-z0-9_.-]{1,100}$/.test(value) && !value.endsWith('/..') && !value.endsWith('/.');
}

function repositoryUrl(value, repository, kind) {
  try {
    const url = new URL(value);
    return url.protocol === 'https:' && url.hostname === 'github.com' && !url.port && !url.username && !url.password && url.pathname.startsWith(`/${repository}/releases/${kind}/`);
  } catch {
    return false;
  }
}

function createUpdateService({ currentVersion, repository, portable = false, fetchImpl = globalThis.fetch, fallbackFetchImpl, openExternal = async () => {}, onChange = () => {}, now = Date.now }) {
  const configured = validRepository(repository);
  let state = {
    currentVersion, repository: configured ? repository : '', portable,
    status: configured ? 'idle' : 'unconfigured', latestVersion: null,
    releaseUrl: configured ? `https://github.com/${repository}/releases/latest` : null,
    downloadUrl: null, notes: '', checkedAt: null, error: null
  };
  let pending;
  const getStatus = () => ({ ...state });
  const updateState = value => { state = { ...state, ...value }; onChange(getStatus()); return getStatus(); };
  async function fetchRelease(url, options) {
    try {
      const response = await fetchImpl(url, options);
      if (!fallbackFetchImpl || ![403, 429].includes(response.status) && response.status < 500) return response;
    } catch (error) {
      if (!fallbackFetchImpl) throw error;
    }
    return fallbackFetchImpl(url, { ...options, signal: AbortSignal.timeout(12000) });
  }
  async function request() {
    updateState({ status: 'checking', error: null });
    try {
      const response = await fetchRelease(`https://api.github.com/repos/${repository}/releases/latest`, {
        headers: { Accept: 'application/vnd.github+json', 'User-Agent': `CarpetStudio/${currentVersion}`, 'X-GitHub-Api-Version': '2022-11-28' },
        signal: AbortSignal.timeout(12000), cache: 'no-store'
      });
      if ([403, 429].includes(response.status)) throw new Error('检查过于频繁，请稍后再试。');
      if (response.status === 404) throw new Error('仓库还没有可用的公开正式版本。');
      if (!response.ok) throw new Error('连接 GitHub 失败，请稍后重试。');
      const release = await response.json();
      const compared = compareVersions(release.tag_name, currentVersion);
      if (release.draft || release.prerelease || compared === null) throw new Error('暂时没有可用的正式更新。');
      const assetNames = portable ? ['DiTan-Portable.exe', '地毯工作台.exe'] : ['DiTan-Setup.exe', '地毯工作台-安装版.exe'];
      const asset = Array.isArray(release.assets) && release.assets.find(item => assetNames.includes(item.name) && repositoryUrl(item.browser_download_url, repository, 'download'));
      return updateState({
        status: compared > 0 ? 'available' : 'current',
        latestVersion: parseVersion(release.tag_name).join('.'),
        releaseUrl: repositoryUrl(release.html_url, repository, 'tag') ? release.html_url : `https://github.com/${repository}/releases/latest`,
        downloadUrl: asset ? asset.browser_download_url : null,
        notes: typeof release.body === 'string' ? release.body.slice(0, 6000) : '',
        checkedAt: now(), error: null
      });
    } catch (error) {
      const known = ['检查过于频繁，请稍后再试。', '仓库还没有可用的公开正式版本。', '连接 GitHub 失败，请稍后重试。', '暂时没有可用的正式更新。'];
      return updateState({ status: 'error', downloadUrl: null, checkedAt: now(), error: known.includes(error.message) ? error.message : '连接 GitHub 失败，请检查网络后重试。' });
    }
  }
  function check(force = false) {
    if (!configured) return Promise.resolve(getStatus());
    if (pending) return pending;
    if (!force && state.checkedAt !== null && now() - state.checkedAt >= 0 && now() - state.checkedAt < (state.status === 'error' ? 60000 : CHECK_INTERVAL)) return Promise.resolve(getStatus());
    pending = request().finally(() => { pending = null; });
    return pending;
  }
  async function openDownload() {
    if (state.status !== 'available') return false;
    await openExternal(state.downloadUrl || state.releaseUrl);
    return true;
  }
  async function openRelease() {
    if (!configured) return false;
    await openExternal(state.releaseUrl);
    return true;
  }
  return { getStatus, check, openDownload, openRelease };
}

module.exports = { createUpdateService, compareVersions };
