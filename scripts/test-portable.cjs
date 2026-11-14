const { chromium } = require('playwright-core');
const { spawn, execFileSync } = require('node:child_process');
const net = require('node:net');
const fs = require('node:fs/promises');
const path = require('node:path');
const assert = require('node:assert/strict');
const { setTimeout: delay } = require('node:timers/promises');

async function main() {
  const executable = path.resolve(process.argv[2] || 'release/地毯工作台.exe');
  const output = path.resolve(process.env.DESKTOP_TEST_OUTPUT || '.test-output');
  await fs.mkdir(output, { recursive: true });
  const userData = await fs.mkdtemp(path.join(output, 'portable-'));
  const server = net.createServer();
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const port = server.address().port;
  await new Promise(resolve => server.close(resolve));
  const env = { ...process.env }; delete env.ELECTRON_RUN_AS_NODE;
  const child = spawn(executable, [`--remote-debugging-port=${port}`, '--remote-debugging-address=127.0.0.1', `--user-data-dir=${userData}`], { env, stdio:'ignore', windowsHide:true });
  let launchError; child.on('error', error => { launchError = error; });
  let browser;
  try {
    const deadline = Date.now() + 45000;
    let endpoint;
    while (Date.now() < deadline) {
      if (launchError) throw launchError;
      if (child.exitCode !== null) throw new Error(`Portable launcher exited with code ${child.exitCode}`);
      try { const response = await fetch(`http://127.0.0.1:${port}/json/version`, { signal:AbortSignal.timeout(1000) }); if(response.ok) { endpoint = await response.json(); break; } } catch {}
      await delay(200);
    }
    if(!endpoint) throw new Error('Portable app did not open its debugging endpoint');
    browser = await chromium.connectOverCDP(endpoint.webSocketDebuggerUrl);
    const page = browser.contexts()[0].pages().find(p=>p.url().startsWith('app://'));
    assert.ok(page, 'Portable application page exists');
    await page.getByRole('heading',{name:'选择地毯材质',exact:true}).waitFor();
    await page.evaluate(()=>document.fonts.ready);
    const updates = await page.evaluate(()=>window.desktop.getUpdateStatus());
    assert.equal(updates.currentVersion,require('../package.json').version);
    assert.equal(updates.portable,true);
    assert.equal(updates.repository,'Fy-MoMing/DiTangongzuotai');
    assert.equal(await page.locator('.rail-version-value').innerText(),`v${updates.currentVersion}`);
    const weather = await page.evaluate(()=>window.desktop.getWeather(true));
    assert.equal(weather.error,null,JSON.stringify(weather));
    assert.ok(weather.city);
    assert.equal(weather.locationMethod,'public-ip-v2');
    assert.equal(typeof weather.temperature,'number');
    await page.locator('.weather-temperature').waitFor();
    assert.equal(await page.getByText('YOUR EVERYDAY WORKSPACE',{exact:true}).count(),0);
    console.log(`PASS: live network weather: ${weather.city}, ${weather.condition}, ${weather.temperature}°C`);
    assert.equal(await page.locator('.night-desktop').getAttribute('data-theme'),'light');
    await page.getByRole('button',{name:'切换到夜间主题',exact:true}).click();
    assert.equal(await page.title(),'地毯工作台');
    assert.equal(await page.locator('.material-card img').count(),0);
    assert.match(await page.locator('.night-desktop').evaluate(element=>getComputedStyle(element).fontFamily),/Manrope/);
    assert.match(await page.locator('.topbar-config').evaluate(element=>getComputedStyle(element).backgroundImage),/255, 160, 91/);
    const prices = await page.evaluate(()=>window.desktop.getPrices());
    assert.deepEqual(prices.config['产品'].map(p=>p['名称']),['条纹','菱形方格','硬丝','平面','流星毯','丝圈','宽条纹','硅藻泥','菠萝纹']);
    assert.deepEqual(prices.config['产品'].map(p=>p['编号']),['1','2','3','4','5','6','7','8','9']);
    assert.equal(await page.getByText('累计完成计算',{exact:true}).count(),0);
    assert.equal(prices.config['产品'].find(p=>p['编号']==='8')['最大宽度'],160);
    await page.locator('#dimensions').fill('120*150\n90*200*3');
    await page.getByText('¥272.00',{exact:true}).first().waitFor();
    await page.screenshot({path:path.join(output,'desktop-preview.png')});
    await page.getByRole('button',{name:'切换到日间主题',exact:true}).click();
    assert.equal(await page.locator('.night-desktop').getAttribute('data-theme'),'light');
    await page.screenshot({path:path.join(output,'desktop-preview-light.png')});
    await page.getByRole('button',{name:'切换到夜间主题',exact:true}).click();
    const readClipboard = () => execFileSync('powershell.exe',['-NoProfile','-NonInteractive','-Command','[Console]::OutputEncoding = [System.Text.UTF8Encoding]::new($false); Get-Clipboard -Raw'],{encoding:'utf8',windowsHide:true}).trim().replace(/\r\n/g,'\n');
    await page.getByRole('button',{name:'菠萝纹',exact:true}).click();
    await page.locator('#dimensions').fill('100*100');
    await page.getByText('¥60.00',{exact:true}).first().waitFor();
    await delay(650);
    assert.equal(readClipboard(),'100*100的价格是60元');
    await page.getByRole('button',{name:'条纹',exact:true}).click();
    await page.locator('#dimensions').fill('60*90');
    await delay(650);
    assert.equal(readClipboard(),'60*90的价格是18.8元');
    await page.locator('#dimensions').fill('60*90\n123*540');
    await delay(650);
    assert.equal(readClipboard(),'60*90 = 18.80元\n123*540 = 265.68元\n两张\n总价格284元');
    await page.getByRole('button',{name:/复制所有尺寸价格/}).click();
    await delay(650);
    assert.equal(readClipboard(),'60*90 = 18.8元\n123*540 = 265.68元\n总价格284.48元');
    await page.getByRole('spinbutton',{name:'输入自定义单价 (元/㎡)',exact:true}).fill('74.88');
    await page.locator('#dimensions').fill('100*100');
    await page.getByText('¥74.88',{exact:true}).first().waitFor();
    await delay(800);
    assert.equal(readClipboard(),'100*100的价格是74元');
    await page.getByRole('button',{name:/复制所有尺寸价格/}).click();
    await delay(650);
    assert.equal(readClipboard(),'100*100 = 74.88元');
    await page.getByRole('spinbutton',{name:'输入自定义单价 (元/㎡)',exact:true}).fill('40');
    await page.locator('#dimensions').fill('100*100\n123*540');
    await delay(800);
    assert.equal(readClipboard(),'100*100 = 40.00元\n123*540 = 265.68元\n两张\n总价格305元');
    await page.getByRole('button',{name:/复制所有尺寸价格/}).click();
    await delay(650);
    assert.equal(readClipboard(),'100*100 = 40元\n123*540 = 265.68元\n总价格305.68元');
    await page.locator('#dimensions').fill('100*100\n200*200');
    await delay(650);
    assert.equal(readClipboard(),'100*100 = 40.00元\n200*200 = 160.00元\n两张\n总价格200元');
    await page.getByRole('button',{name:/复制所有尺寸价格/}).click();
    await delay(650);
    assert.equal(readClipboard(),'100*100 = 40元\n200*200 = 160元\n总价格200元');
    await page.locator('#dimensions').fill('124*240\n120*120');
    await delay(650);
    assert.equal(readClipboard(),'124*240 = 119.04元\n120*120 = 57.60元\n两张\n总价格176元');
    await page.getByRole('navigation',{name:'工作台导航'}).getByRole('button',{name:'价格配置',exact:true}).click();
    await page.locator('.settings-editor').waitFor();
    assert.deepEqual(await page.locator('.settings-price-table .product-number').allTextContents(),['1','2','3','4','5','6','7','8','9']);
    await page.getByRole('button',{name:'每平重量',exact:true}).click();
    await page.getByRole('spinbutton',{name:'条纹每平重量',exact:true}).fill('2.75');
    await page.getByRole('button',{name:'保存配置',exact:true}).click();
    await page.waitForFunction(async()=> (await window.desktop.getPrices()).config['产品'][0]['单位重量']===2.75);
    await page.screenshot({path:path.join(output,'portable-weights.png')});
    assert.equal(await page.locator('.chakra-toast').count(),0);
    console.log('PASS: actual portable exe, both themes, continuous IDs, editable weights and automatic/manual copy precision');
    console.log(`Screenshot: ${path.join(output,'desktop-preview.png')}`);
  } finally {
    if(browser) {
      try { const session = await browser.newBrowserCDPSession(); await session.send('Browser.close'); } catch {}
      await browser.close().catch(()=>{});
    }
    if(child.exitCode===null) {
      await Promise.race([new Promise(resolve=>child.once('exit',resolve)),delay(5000)]);
      if(child.exitCode===null) { try { execFileSync('taskkill',['/PID',String(child.pid),'/T','/F'],{windowsHide:true,stdio:'ignore'}); } catch {} }
    }
  }
}
main().catch(error=>{console.error(error);process.exitCode=1;});
