const { _electron: electron } = require('playwright-core');
const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const path = require('node:path');
const { createHash } = require('node:crypto');
const version = require('../package.json').version;
const nextVersion = `${version.split('.')[0]}.${Number(version.split('.')[1]) + 1}.0`;

async function main() {
  const output = path.resolve(process.env.DESKTOP_TEST_OUTPUT || '.test-output');
  await fs.mkdir(output, { recursive: true });
  const userData = await fs.mkdtemp(path.join(output, 'auto-updates-'));
  const env = { ...process.env }; delete env.ELECTRON_RUN_AS_NODE;
  const application = await electron.launch({ executablePath: process.env.DESKTOP_TEST_EXE || path.resolve('release/win-unpacked/地毯工作台.exe'), args: [`--user-data-dir=${userData}`], env, timeout: 45000 });
  try {
    const page = await application.firstWindow();
    const errors = []; page.on('pageerror', error => errors.push(error.message));
    await application.evaluate(({ session }) => {
      session.defaultSession.webRequest.onBeforeRequest({ urls: ['http://*/*', 'https://*/*'] }, (_details, callback) => callback({ cancel: true }));
      globalThis.fetch = async () => { throw new Error('offline'); };
    });
    await page.reload();
    await page.getByRole('heading', { name: '选择地毯材质', exact: true }).waitFor();
    assert.equal((await page.evaluate(() => window.desktop.getUpdateStatus())).currentVersion, version);
    await page.getByRole('button', { name: '检查软件更新', exact: true }).click();
    const panel = page.getByRole('region', { name: '软件更新', exact: true });
    await panel.getByRole('checkbox', { name: /启动后自动检查更新/ }).uncheck();
    await panel.getByRole('button', { name: '检查更新', exact: true }).click();
    await panel.getByText('连接 GitHub 失败，请检查网络后重试。', { exact: true }).waitFor();
    assert.equal(await page.getByRole('dialog').count(), 0);
    console.log('PASS: offline checks remain inline; no update prompt before verified download');

    await application.evaluate(({ net, ipcMain }, { latestVersion, digest }) => {
      const payload = Buffer.from('integration-test package; never executed');
      globalThis.__updateDownloads = []; globalThis.__installRequests = 0;
      const originalNetFetch = net.fetch.bind(net);
      globalThis.fetch = async () => ({ ok: true, status: 200, json: async () => ({ tag_name: `v${latestVersion}`, body: '新版界面与后台更新。', assets: [{ name: 'DiTan-Setup.exe', size: payload.length, digest: `sha256:${digest}`, browser_download_url: `https://github.com/Fy-MoMing/DiTangongzuotai/releases/download/v${latestVersion}/DiTan-Setup.exe` }] }) });
      net.fetch = async (url, options) => {
        if (!url.startsWith('https://ghfast.top/')) return originalNetFetch(url, options);
        globalThis.__updateDownloads.push(url); await new Promise(resolve => setTimeout(resolve, 400)); return new Response(payload);
      };
      ipcMain.removeHandler('updates:install');
      ipcMain.handle('updates:install', () => { globalThis.__installRequests++; return false; });
    }, { latestVersion: nextVersion, digest: createHash('sha256').update('integration-test package; never executed').digest('hex') });
    await panel.getByRole('button', { name: '检查更新', exact: true }).click();
    const prompt = page.getByRole('dialog', { name: '更新已就绪，现在安装？' });
    await prompt.waitFor();
    assert.equal(await application.evaluate(() => globalThis.__installRequests), 0);
    assert.deepEqual(await application.evaluate(() => globalThis.__updateDownloads), [`https://ghfast.top/https://github.com/Fy-MoMing/DiTangongzuotai/releases/download/v${nextVersion}/DiTan-Setup.exe`]);
    assert.equal((await page.evaluate(() => window.desktop.getUpdateStatus())).status, 'ready');
    assert.match(await prompt.innerText(), /已校验/);
    assert.equal(await prompt.getByRole('button', { name: '稍后再说' }).evaluate(element => element === document.activeElement), true);
    await page.keyboard.press('Shift+Tab');
    assert.equal(await prompt.getByRole('button', { name: '立即更新' }).evaluate(element => element === document.activeElement), true);
    await prompt.getByRole('button', { name: '稍后再说' }).click();
    await page.locator('#dimensions').fill('124*240\n120*120');
    await page.getByRole('button', { name: '复制所有尺寸价格', exact: false }).click();
    assert.equal(await application.evaluate(() => globalThis.__installRequests), 0);
    await page.getByRole('button', { name: '检查软件更新', exact: true }).click();
    await panel.getByRole('button', { name: '查看更新并安装' }).click();
    await prompt.waitFor();
    await page.screenshot({ path: path.join(output, 'update-prompt-light.png') });
    await page.keyboard.press('Escape');
    await page.getByRole('button', { name: '切换到夜间主题', exact: true }).click();
    await application.evaluate(({ BrowserWindow }) => BrowserWindow.getAllWindows()[0].setSize(1100, 800));
    await page.getByRole('button', { name: '检查软件更新', exact: true }).click();
    await panel.getByRole('button', { name: '查看更新并安装' }).click();
    await prompt.waitFor();
    const bounds = await prompt.boundingBox();
    assert.ok(bounds.x >= 0 && bounds.y >= 0 && bounds.x + bounds.width <= 1100 && bounds.y + bounds.height <= 800);
    await page.screenshot({ path: path.join(output, 'update-prompt-dark.png') });
    await prompt.getByRole('button', { name: '立即更新' }).click();
    assert.equal(await application.evaluate(() => globalThis.__installRequests), 1);
    await prompt.getByRole('alert').getByText('无法启动更新，请重试或前往发布页下载。').waitFor();
    await page.keyboard.press('Escape');
    await page.reload();
    // A verified cached package is offered again on a new launch/reload.
    await prompt.waitFor();
    await prompt.getByRole('button', { name: '稍后再说' }).click();
    await page.getByRole('button', { name: '检查软件更新', exact: true }).click();
    assert.equal(await panel.getByRole('checkbox', { name: /启动后自动检查更新/ }).isChecked(), false);
    assert.deepEqual(errors, []);
    console.log('PASS: real IPC automatically downloads and verifies via ghfast; explicit install consent, defer, keyboard focus, day/night, narrow window, and persisted preferences');
  } finally { await application.close(); }
}
main().catch(error => { console.error(error); process.exitCode = 1; });
