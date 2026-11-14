const { chromium } = require('playwright-core');
const { spawn, execFileSync } = require('node:child_process');
const net = require('node:net');
const fs = require('node:fs/promises');
const path = require('node:path');
const { setTimeout: delay } = require('node:timers/promises');

async function main() {
  const executable=path.resolve(process.argv[2]);
  const output=path.resolve(process.env.DESKTOP_TEST_OUTPUT||'.test-output');
  await fs.mkdir(output,{recursive:true});
  const samples=[];
  for(let i=0;i<3;i++) {
    const userData=await fs.mkdtemp(path.join(output,'portable-benchmark-'));
    const server=net.createServer();
    await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
    const port=server.address().port;
    await new Promise(resolve=>server.close(resolve));
    const env={...process.env};delete env.ELECTRON_RUN_AS_NODE;
    const started=performance.now();
    const child=spawn(executable,[`--remote-debugging-port=${port}`,'--remote-debugging-address=127.0.0.1',`--user-data-dir=${userData}`],{env,stdio:'ignore',windowsHide:true});
    let browser,launchError;child.on('error',error=>{launchError=error;});
    try {
      let endpoint;
      while(performance.now()-started<45000) {
        if(launchError) throw launchError;
        try {const response=await fetch(`http://127.0.0.1:${port}/json/version`,{signal:AbortSignal.timeout(500)});if(response.ok){endpoint=await response.json();break;}}catch{}
        await delay(50);
      }
      if(!endpoint)throw Error('Portable startup timed out');
      browser=await chromium.connectOverCDP(endpoint.webSocketDebuggerUrl);
      const page=browser.contexts()[0].pages()[0];
      await page.locator('#dimensions').waitFor();
      const interactiveMs=performance.now()-started;
      await page.evaluate(()=>document.fonts.ready);
      samples.push({interactiveMs,fontsReadyMs:performance.now()-started});
    } finally {
      if(browser){try {const session=await browser.newBrowserCDPSession();await session.send('Browser.close');}catch{}await browser.close().catch(()=>{});}
      if(child.exitCode===null){await Promise.race([new Promise(resolve=>child.once('exit',resolve)),delay(5000)]);if(child.exitCode===null){try{execFileSync('taskkill',['/PID',String(child.pid),'/T','/F'],{stdio:'ignore',windowsHide:true});}catch{}}}
    }
  }
  const result={executable,samples,medianMs:samples.map(s=>s.interactiveMs).sort((a,b)=>a-b)[1]};
  if(process.argv[3])await fs.writeFile(process.argv[3],JSON.stringify(result,null,2));
  console.log(JSON.stringify(result,null,2));
}
main().catch(error=>{console.error(error);process.exitCode=1;});
