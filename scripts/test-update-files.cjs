const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const os = require('node:os');
const path = require('node:path');
const { createHash } = require('node:crypto');
const { createUpdateFiles } = require('../desktop/update-files.cjs');
const { createUpdateService } = require('../desktop/updates.cjs');
const payload = Buffer.from('test update payload; never executed');
const digest = createHash('sha256').update(payload).digest('hex');
const repository = 'Fy-MoMing/DiTangongzuotai';
const originalUrl = `https://github.com/${repository}/releases/download/v2.0.0/DiTan-Setup.exe`;
const asset = { name: 'DiTan-Setup.exe', version: '2.0.0', portable: false, url: `https://ghfast.top/${originalUrl}`, digest: `sha256:${digest}`, size: payload.length };
async function setup(t, fetchImpl) {
  const directory = await fs.mkdtemp(path.join(os.tmpdir(), 'carpet-update-'));
  t.after(() => fs.rm(directory, { recursive: true, force: true }));
  return { directory, files: createUpdateFiles({ directory, fetchImpl }) };
}

test('downloads a verified package, reports progress and reuses the verified cache', async t => {
  let calls = 0;
  const { files } = await setup(t, async url => { assert.equal(url, asset.url); calls++; return new Response(payload); });
  const progress = [];
  const result = await files.download(asset, value => progress.push(value));
  assert.equal(await files.verify(result), true);
  assert.deepEqual(await fs.readFile(result.file), payload);
  assert.equal(progress.at(-1).percent, 100);
  await files.download(asset, () => {});
  assert.equal(calls, 1);
  await fs.writeFile(result.file, 'tampered');
  assert.equal(await files.verify(result), false);
  await files.download(asset, () => {});
  assert.equal(calls, 2);
});

test('rejects modified and incomplete packages and removes partial downloads', async t => {
  for (const body of [Buffer.from('x'), Buffer.alloc(payload.length, 42)]) {
    const { files, directory } = await setup(t, async () => new Response(body));
    await assert.rejects(files.download(asset, () => {}), /校验失败/);
    assert.deepEqual(await fs.readdir(directory), []);
  }
});

test('uses the release checksum file when GitHub digest is unavailable', async t => {
  const calls = [];
  const { files } = await setup(t, async url => {
    calls.push(url);
    return new Response(url.endsWith('SHA256SUMS.txt') ? `\uFEFF${digest}  DiTan-Setup.exe\n` : payload);
  });
  const result = await files.download({ ...asset, digest: null, checksumUrl: 'https://example.test/SHA256SUMS.txt' }, () => {});
  assert.equal(await files.verify(result), true);
  assert.equal(calls.length, 2);
  await assert.rejects(files.download({ ...asset, digest: null }, () => {}), /缺少有效的校验/);
});

test('new release automatically downloads; installation requires an explicit action', async t => {
  const { files } = await setup(t, async () => new Response(payload));
  const changes = [], installed = [];
  const updater = createUpdateService({ currentVersion: '1.6.0', repository,
    fetchImpl: async () => ({ ok: true, json: async () => ({ tag_name: 'v2.0.0', assets: [{ name: asset.name, browser_download_url: originalUrl, size: payload.length, digest: asset.digest }] }) }),
    downloadAsset: files.download, installAsset: async result => installed.push(result), onChange: state => changes.push(state.status) });
  assert.equal(await updater.install(), false);
  assert.equal((await updater.check()).status, 'downloading');
  await updater.download();
  assert.equal(updater.getStatus().status, 'ready');
  assert.deepEqual(installed, []);
  assert.equal((await updater.check(true)).status, 'ready');
  assert.equal(await updater.install(), true);
  assert.equal(installed.length, 1);
  assert.equal(await updater.install(), false);
  assert.ok(changes.includes('downloading') && changes.includes('ready') && changes.includes('installing'));
});

test('failed downloads can retry without offering installation; unexpected release asset paths are rejected', async () => {
  let calls = 0;
  const release = { tag_name: 'v2.0.0', assets: [{ name: asset.name, browser_download_url: originalUrl, digest: asset.digest }] };
  const updater = createUpdateService({ currentVersion: '1.6.0', repository, fetchImpl: async () => ({ ok: true, json: async () => release }),
    downloadAsset: async () => { if (++calls === 1) throw new Error('offline'); return { file: 'test-only' }; } });
  await updater.check(); await updater.download();
  assert.equal(updater.getStatus().status, 'download-error');
  assert.equal(await updater.install(), false);
  await updater.download(); assert.equal(updater.getStatus().status, 'ready');
  for (const url of [originalUrl.replace('v2.0.0', 'v99.0.0'), originalUrl.replace(repository, 'other/repo')]) {
    const invalid = createUpdateService({ currentVersion: '1.6.0', repository, fetchImpl: async () => ({ ok: true, json: async () => ({ ...release, assets: [{ name: asset.name, browser_download_url: url }] }) }), downloadAsset: async () => assert.fail('must not download an unrelated artifact') });
    assert.equal((await invalid.check()).downloadUrl, null);
  }
});
