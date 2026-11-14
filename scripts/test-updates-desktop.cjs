const { _electron: electron } = require('playwright-core');
const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const path = require('node:path');
const version = require('../package.json').version;
const versionParts = version.split('.').map(Number);
const nextVersion = `${versionParts[0]}.${versionParts[1]}.${versionParts[2] + 1}`;

async function main() {
  const output = path.resolve(process.env.DESKTOP_TEST_OUTPUT || '.test-output');
  await fs.mkdir(output, {recursive:true});
  const userData = await fs.mkdtemp(path.join(output, 'updates-'));
  const executablePath = process.env.DESKTOP_TEST_EXE || path.resolve('release/win-unpacked/地毯工作台.exe');
  const env = {...process.env};delete env.ELECTRON_RUN_AS_NODE;
  const application = await electron.launch({executablePath,args:[`--user-data-dir=${userData}`],env,timeout:45000});
  try {
    const page = await application.firstWindow();
    const errors=[];page.on('pageerror',error=>errors.push(error.message));
    await application.evaluate(({session})=>{
      session.defaultSession.webRequest.onBeforeRequest({urls:['http://*/*','https://*/*']},(_details,callback)=>callback({cancel:true}));
      globalThis.fetch=async()=>{throw new Error('offline');};
    });
    await page.reload();
    await page.getByRole('heading',{name:'选择地毯材质',exact:true}).waitFor();
    await page.evaluate(()=>document.fonts.ready);
    const actualStatus=await page.evaluate(()=>window.desktop.getUpdateStatus());
    assert.equal(actualStatus.currentVersion,version);
    assert.equal(actualStatus.repository,'Fy-MoMing/DiTangongzuotai');
    assert.equal(await page.locator('.rail-version-value').innerText(),`v${version}`);
    assert.equal(await page.locator('.rail-version small').innerText(),'检查更新');
    await page.getByRole('button',{name:'检查软件更新',exact:true}).click();
    const panel=page.getByRole('region',{name:'软件更新',exact:true});
    await panel.waitFor();
    await panel.getByRole('checkbox',{name:/启动后自动检查更新/}).uncheck();
    await panel.getByRole('button',{name:'检查更新',exact:true}).click();
    await panel.getByText('连接 GitHub 失败，请检查网络后重试。',{exact:true}).waitFor();
    assert.equal(await panel.getByRole('button',{name:'检查更新',exact:true}).isEnabled(),true);
    console.log('PASS: real IPC version and repository; offline check gives an inline retry state');

    await application.evaluate(({ipcMain,app},latestVersion)=>{
      globalThis.__updateCheckCount=0;
      globalThis.__updateDownloads=0;
      ipcMain.removeHandler('updates:check');
      ipcMain.handle('updates:check',async(event,force)=>{
        globalThis.__updateCheckCount++;
        globalThis.__updateForced=force;
        const state={currentVersion:app.getVersion(),repository:'Fy-MoMing/DiTangongzuotai',portable:false,status:'checking',checkedAt:null};
        event.sender.send('updates:changed',state);
        await new Promise(resolve=>setTimeout(resolve,150));
        const result={...state,status:'available',latestVersion,checkedAt:Date.now(),notes:'优化报价体验。\n保留现有价格配置。',downloadUrl:`https://github.com/Fy-MoMing/DiTangongzuotai/releases/download/v${latestVersion}/setup.exe`};
        event.sender.send('updates:changed',result);return result;
      });
      ipcMain.removeHandler('updates:download');
      ipcMain.handle('updates:download',()=>{globalThis.__updateDownloads++;return true;});
    },nextVersion);
    await panel.getByRole('button',{name:'检查更新',exact:true}).click();
    await panel.getByText(`发现新版本 v${nextVersion}`,{exact:true}).waitFor();
    assert.equal(await page.locator('.rail-version.has-update').count(),1);
    assert.equal(await application.evaluate(()=>globalThis.__updateForced),true);
    await panel.getByRole('button',{name:'下载新版',exact:true}).click();
    assert.equal(await application.evaluate(()=>globalThis.__updateDownloads),1);
    assert.match(await panel.innerText(),/运行新版安装包/);
    await page.screenshot({path:path.join(output,'updates-light.png')});
    await page.keyboard.press('Escape');
    assert.equal(await panel.count(),0);
    assert.equal(await page.locator('.rail-version').evaluate(element=>element===document.activeElement),true);
    await page.getByRole('button',{name:'切换到夜间主题',exact:true}).click();
    await page.getByRole('button',{name:'检查软件更新',exact:true}).click();
    await page.screenshot({path:path.join(output,'updates-dark.png')});
    await application.evaluate(({BrowserWindow})=>BrowserWindow.getAllWindows()[0].setSize(1100,800));
    const bounds=await panel.boundingBox();
    assert.ok(bounds.x>=0&&bounds.y>=0&&bounds.x+bounds.width<=1100&&bounds.y+bounds.height<=800,JSON.stringify(bounds));
    await panel.getByRole('checkbox',{name:/启动后自动检查更新/}).check();
    await panel.getByRole('button',{name:'关闭更新面板',exact:true}).click();
    const count=await application.evaluate(()=>globalThis.__updateCheckCount);
    await page.waitForFunction(async expected=>{
      const value=await window.desktop.getUpdateStatus();
      return document.querySelector('.rail-version.has-update')&&value.currentVersion;
    },count);
    await new Promise(resolve=>setTimeout(resolve,8400));
    assert.equal(await application.evaluate(()=>globalThis.__updateCheckCount),count+1);
    assert.equal(await application.evaluate(()=>globalThis.__updateForced),false);
    assert.equal(await page.locator('#software-update-panel').count(),0);
    await page.getByRole('button',{name:'检查软件更新',exact:true}).click();
    await panel.getByRole('checkbox',{name:/启动后自动检查更新/}).uncheck();
    await page.reload();
    await page.getByRole('button',{name:'检查软件更新',exact:true}).click();
    assert.equal(await page.getByRole('checkbox',{name:/启动后自动检查更新/}).isChecked(),false);
    assert.deepEqual(errors,[]);
    console.log('PASS: available update, download action, background check without popup, preference persistence, day/night and narrow window');
  } finally {await application.close();}
}
main().catch(error=>{console.error(error);process.exitCode=1;});
