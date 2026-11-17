const { _electron: electron } = require('playwright-core');
const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const path = require('node:path');

async function main() {
  const output = path.resolve(process.env.DESKTOP_TEST_OUTPUT || '.test-output');
  await fs.mkdir(output, { recursive: true });
  const userData = await fs.mkdtemp(path.join(output, 'linear-user-'));
  const env = { ...process.env }; delete env.ELECTRON_RUN_AS_NODE;
  const application = await electron.launch({
    executablePath: process.env.DESKTOP_TEST_EXE || path.resolve('release/win-unpacked/地毯工作台.exe'),
    args: [`--user-data-dir=${userData}`], env, timeout: 45000,
  });
  try {
    const page = await application.firstWindow();
    await application.evaluate(({ ipcMain, session }) => {
      session.defaultSession.webRequest.onBeforeRequest({ urls: ['http://*/*', 'https://*/*'] }, (_details, callback) => callback({ cancel: true }));
      ipcMain.removeHandler('weather:read');
      ipcMain.handle('weather:read', () => ({ city: '石家庄', condition: '阴天', temperature: 8, cached: false }));
      globalThis.fetch = async () => { throw new Error('offline'); };
    });
    await page.reload();
    await page.getByRole('heading', { name: '选择地毯材质', exact: true }).waitFor();
    await page.evaluate(() => document.fonts.ready);
    const greeting = await page.locator('.greeting-copy').innerText();
    const { greetings } = await import('../frontend/src/utils/greetings.js');
    assert.ok(greetings.includes(greeting));
    assert.equal(await page.locator('.night-desktop').getAttribute('data-theme'), 'light');
    await page.locator('#dimensions').fill('124*240\n120*120');
    const nav = page.getByRole('navigation', { name: '工作台导航' });
    const pages = [
      ['地毯价格计算', '.quote-card', 'calculator'],
      ['尺寸价格表', '.catalog-table-card', 'prices'],
      ['价格配置', '.settings-editor', 'settings'],
      ['图片编辑工具', '.studio-image-editor', 'images'],
    ];
    for (const width of [1440, 1100]) {
      await application.evaluate(({ BrowserWindow }, size) => BrowserWindow.getAllWindows()[0].setSize(size, 960), width);
      for (const theme of ['light', 'dark']) {
        if (await page.locator('.night-desktop').getAttribute('data-theme') !== theme) await page.locator('.rail-mode').click();
        for (const [name, selector, file] of pages) {
          await nav.getByRole('button', { name, exact: true }).click();
          await page.locator(selector).waitFor();
          if (file === 'images') await page.waitForFunction(() => document.querySelector('canvas')?.width > 300);
          const layout = await page.evaluate(() => ({
            viewport: window.innerWidth,
            overflow: document.documentElement.scrollWidth > window.innerWidth,
            contentOverflow: document.querySelector('.workspace-content').scrollWidth > document.querySelector('.workspace-content').clientWidth + 1,
            sidebarOverflow: document.querySelector('.studio-sidebar').scrollWidth > document.querySelector('.studio-sidebar').clientWidth + 1,
          }));
          assert.equal(layout.overflow, false, JSON.stringify({ width, theme, file, ...layout }));
          assert.equal(layout.contentOverflow, false, JSON.stringify({ width, theme, file, ...layout }));
          assert.equal(layout.sidebarOverflow, false, JSON.stringify({ width, theme, file, ...layout }));
          assert.equal(await page.locator('.greeting-copy').isVisible(), true);
          assert.equal(await page.locator('.today-weather').isVisible(), true);
          assert.equal(await page.locator('.weather-temperature').innerText(), '8°C');
          assert.equal(await page.locator('.greeting-copy').innerText(), greeting);
          await page.waitForTimeout(350);
          await page.screenshot({ path: path.join(output, `linear-${file}-${theme}-${width}.png`) });
        }
      }
    }
    await nav.getByRole('button', { name: '地毯价格计算', exact: true }).click();
    const fields = await page.locator('.material-info b').evaluateAll(elements => [...new Set(elements.map(el => getComputedStyle(el).color))]);
    assert.equal(fields.length, 1);
    assert.equal(await page.locator('.material-card img').count(), 0);
    const readableType = await page.evaluate(() => ({
      material: parseFloat(getComputedStyle(document.querySelector('.material-info>strong')).fontSize),
      body: parseFloat(getComputedStyle(document.querySelector('.quote-lines td')).fontSize),
      navigation: parseFloat(getComputedStyle(document.querySelector('.nav-item>span')).fontSize),
    }));
    assert.ok(readableType.material >= 18 && readableType.body >= 14 && readableType.navigation >= 13, JSON.stringify(readableType));
    const logo = await page.locator('.brand-symbol').evaluate(element => {
      const icon = element.querySelector('svg').getBoundingClientRect(), box = element.getBoundingClientRect();
      return { dx: Math.abs(icon.x + icon.width / 2 - box.x - box.width / 2), dy: Math.abs(icon.y + icon.height / 2 - box.y - box.height / 2), transform: getComputedStyle(element).transform };
    });
    assert.ok(logo.dx < 1 && logo.dy < 1 && logo.transform === 'none', JSON.stringify(logo));
    await page.emulateMedia({ reducedMotion: 'reduce' });
    assert.equal(await page.locator('.spotlight-card__light').evaluate(element => getComputedStyle(element).display), 'none');
    assert.equal(await page.locator('.material-tile.selected').evaluate(element => getComputedStyle(element).animationName), 'none');
    await page.emulateMedia({ reducedMotion: 'no-preference' });
    await page.getByRole('button', { name: '检查软件更新', exact: true }).click();
    const updatePanel = await page.locator('#software-update-panel').boundingBox();
    assert.ok(updatePanel.x >= 0 && updatePanel.y >= 0 && updatePanel.x + updatePanel.width <= 1100, JSON.stringify(updatePanel));
    console.log('PASS: four pages at 1440 and 1100 in both themes; weather and launch greeting remain visible, uniform text-only materials, update panel stays on screen');
  } finally { await application.close(); }
}
main().catch(error => { console.error(error); process.exitCode = 1; });
