const { _electron: electron } = require('playwright-core');
const fs = require('node:fs/promises');
const path = require('node:path');
const assert = require('node:assert/strict');
const { setTimeout: delay } = require('node:timers/promises');

const median = values => [...values].sort((a,b)=>a-b)[Math.floor(values.length/2)];
async function main() {
  const output = path.resolve(process.env.DESKTOP_TEST_OUTPUT || '.test-output');
  await fs.mkdir(output,{recursive:true});
  const executablePath = path.resolve(process.argv[2]);
  const result = { executable:executablePath, startup:[], input:{}, pricing:{} };
  const env = {...process.env}; delete env.ELECTRON_RUN_AS_NODE;
  for (let run=0;run<3;run++) {
    const userData = await fs.mkdtemp(path.join(output,'benchmark-'));
    const start = performance.now();
    const application = await electron.launch({executablePath,args:[`--user-data-dir=${userData}`],env,timeout:45000});
    try {
      const page = await application.firstWindow();
      await page.locator('#dimensions').waitFor();
      const interactiveMs = performance.now()-start;
      await page.evaluate(()=>document.fonts.ready);
      const fontsReadyMs = performance.now()-start;
      const resources = await page.evaluate(()=>({
        domNodes:document.querySelectorAll('*').length,
        imageRequests:performance.getEntriesByType('resource').filter(r=>/\.jpg/.test(r.name)).length,
        firstPaintMs:performance.getEntriesByName('first-contentful-paint')[0]?.startTime
      }));
      result.startup.push({interactiveMs,fontsReadyMs,...resources});
      if (run!==2) continue;
      await page.getByRole('spinbutton',{name:'输入自定义单价 (元/㎡)',exact:true}).fill('50');
      for (const count of [1,100,1000]) {
        const samples=[];
        for (let sample=0;sample<5;sample++) {
          const lines = Array.from({length:count},(_,i)=>`${101+i%80}*${201+sample+i%9}`);
          const total = Math.round(lines.reduce((sum,line)=>{const[w,l]=line.split('*').map(Number);return sum+Math.round(w*l/10000*50*100)/100;},0)*100)/100;
          const ms = await page.evaluate(({text,total})=>new Promise(resolve=>{
            const input = document.querySelector('#dimensions');
            const started = performance.now();
            const observer = new MutationObserver(()=>{
              const amount = document.querySelector('.quote-amount>strong').textContent.replace(/[^\d.]/g,'');
              if(Number(amount)!==total) return;
              observer.disconnect();
              requestAnimationFrame(()=>resolve(performance.now()-started));
            });
            observer.observe(document.querySelector('.quote-card'),{subtree:true,childList:true,characterData:true});
            Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype,'value').set.call(input,text);
            input.dispatchEvent(new Event('input',{bubbles:true}));
          }),{text:lines.join('\n'),total});
          samples.push(ms);
        }
        result.input[count]={medianMs:median(samples),samples};
      }
      await page.getByRole('spinbutton',{name:'输入自定义单价 (元/㎡)',exact:true}).fill('74.88');
      const copyStart=performance.now();
      await page.locator('#dimensions').fill('100*101');
      while (await application.evaluate(({clipboard})=>clipboard.readText())!=='100*101的价格是75元') {
        assert.ok(performance.now()-copyStart<10000,'Automatic copy timed out');
        await delay(10);
      }
      result.autoCopyMs=performance.now()-copyStart;
    } finally { await application.close(); }
  }
  const {calculateQuote} = await import('../frontend/src/utils/pricing.js');
  const config=require('../config/prices.json');
  const product=config['产品'][0];
  const bulk=Array.from({length:1000},(_,i)=>`${101+i%80}*${201+i%9}`).join('\n');
  const large=structuredClone(config);
  large['现成尺寸价格']=Array.from({length:5000},(_,i)=>({'产品编号':'2','尺寸':`${100+i}*100`,'价格':10}));
  for (const [name,prices] of [['117Prices',config],['5000Prices',large]]) {
    for(let i=0;i<10;i++) calculateQuote(bulk,product,prices);
    const samples=[];
    for(let i=0;i<25;i++){const start=performance.now();calculateQuote(bulk,product,prices);samples.push(performance.now()-start);}
    result.pricing[name]={rows:1000,medianMs:median(samples)};
  }
  result.summary={startupMedianMs:median(result.startup.map(s=>s.interactiveMs)),fontsMedianMs:median(result.startup.map(s=>s.fontsReadyMs))};
  const report=path.resolve(process.argv[3] || path.join(output,'performance.json'));
  await fs.writeFile(report,JSON.stringify(result,null,2));
  console.log(JSON.stringify(result,null,2));
}
main().catch(error=>{console.error(error);process.exitCode=1;});
