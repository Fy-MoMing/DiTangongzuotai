const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const path = require('node:path');
const os = require('node:os');
const config = require('../config/prices.json');
const { validatePrices, createPriceStore } = require('../desktop/price-config.cjs');
const model = import('../frontend/src/utils/pricing.js');
const quote = async (input, id = '1', options = {}, prices = config) => (await model).calculateQuote(input, prices['产品'].find(p => p['编号'] === id), prices, options);
test('only the eight requested materials and their ready-made prices remain', () => {
  assert.equal(validatePrices(config), config);
  assert.deepEqual(config['产品'].map(p => p['名称']), ['条纹','菱形方格','硬丝','平面','流星毯','丝圈','宽条纹','硅藻泥']);
  assert.deepEqual(config['产品'].map(p => p['编号']), ['1','2','3','4','5','6','7','8']);
  assert.equal(config['现成尺寸价格'].length, 117);
  const ids = new Set(config['产品'].map(p => p['编号']));
  assert.ok(config['现成尺寸价格'].every(p => ids.has(p['产品编号'])));
});
test('custom price overrides ready-made and narrow-width rules', async () => { const result = await quote('60*90*2', '1', { customPrice: 50 }); assert.equal(result.total, 54); assert.equal(result.quantity, 2); assert.equal(result.rows[0].readyMade, false); assert.equal(result.rows[0].unitPrice,50); assert.equal(result.rows[0].priceUnit,'㎡'); });
test('ready-made unit price is per item; disabling it uses the area unit price', async () => {
  const ready = await quote('120*150*2');
  assert.equal(ready.total,136); assert.equal(ready.rows[0].unitPrice,68); assert.equal(ready.rows[0].priceUnit,'张');
  const custom = await quote('120*150*2','1',{readyMade:false});
  assert.equal(custom.total,144); assert.equal(custom.rows[0].unitPrice,40); assert.equal(custom.rows[0].priceUnit,'㎡');
});
test('edited base price and narrow-width rule are used', async () => { const prices = structuredClone(config); prices['产品'][0]['单价'] = 60; prices['产品'][0]['窄幅规则']['单价'] = 52; assert.equal((await quote('100*200', '1', { readyMade: false }, prices)).total, 120); assert.equal((await quote('60*100', '1', { readyMade: false }, prices)).total, 31.2); });
test('silicon mat warning only checks first dimension strictly greater than 160', async () => { for (const input of ['100*160','160*100','160*200']) assert.equal((await quote(input,'8')).rows[0].splicing,false); assert.equal((await quote('161*100','8')).rows[0].splicing,true); assert.equal((await quote('100*200','8')).rows[0].splicing,false); assert.equal((await quote('','8')).rows.length,0); });
test('invalid dimensions never contribute to totals', async () => { const result=await quote('invalid\n-2*100\n100*200*1.5\nInfinity*100\n100*200*0\n100*200*2','1',{customPrice:50}); assert.equal(result.total,200); assert.equal(result.quantity,2); assert.equal(result.rows.filter(r=>!r.valid).length,5); });
test('weight uses configured standard and square style densities', async () => { assert.equal((await quote('100*200','2',{squareStyle:false})).weight,4.6); assert.equal((await quote('100*200','2',{squareStyle:true})).weight,6); });

test('copy formats match single automatic, multi-sheet automatic and precise button quotes', async () => {
  const { formatQuoteForCopy } = await model;
  const result = await quote('100*100', '1', { customPrice: 74.88 });
  assert.equal(result.total, 74.88);
  assert.equal(formatQuoteForCopy(result, {automatic:true}), '100*100的价格是74元');
  assert.equal(formatQuoteForCopy(result), '100*100 = 74.88元');
  const example = await quote('100*100\n123*540', '1', {customPrice:40});
  assert.equal(formatQuoteForCopy(example, {automatic:true}), '100*100 = 40.00元\n123*540 = 265.68元\n两张\n总价格305元');
  assert.equal(formatQuoteForCopy(example), '100*100 = 40元\n123*540 = 265.68元\n总价格305.68元');
  const requested = await quote('100*100\n200*200','1',{customPrice:40});
  assert.equal(formatQuoteForCopy(requested,{automatic:true}),'100*100 = 40.00元\n200*200 = 160.00元\n两张\n总价格200元');
  assert.equal(formatQuoteForCopy(requested),'100*100 = 40元\n200*200 = 160元\n总价格200元');
  assert.equal(formatQuoteForCopy(await quote('100*100','1',{customPrice:40}),{automatic:true}),'100*100的价格是40元');
  const multiple = await quote('100*100*2\n100*100', '1', { customPrice: 74.88 });
  assert.equal(formatQuoteForCopy(multiple, {automatic:true}), '100*100*2 = 149.76元\n100*100 = 74.88元\n三张\n总价格224元');
  assert.equal(formatQuoteForCopy(multiple), '100*100*2 = 149.76元\n100*100 = 74.88元\n总价格224.64元');
  const repeated = await quote('100*100*2','1',{customPrice:40});
  assert.equal(formatQuoteForCopy(repeated,{automatic:true}),'100*100*2 = 80.00元\n两张\n总价格80元');
  assert.equal(formatQuoteForCopy(repeated),'100*100*2 = 80元\n总价格80元');
  assert.equal(formatQuoteForCopy(await quote('100*100', '1', { customPrice: 0.99 }), {automatic:true}), '100*100的价格是0元');
  const ready = await quote('60*90');
  assert.equal(ready.rows[0].readyMade,true);
  assert.equal(formatQuoteForCopy(ready,{automatic:true}),'60*90的价格是18.8元');
  assert.equal(formatQuoteForCopy(ready),'60*90 = 18.8元');
  const mixed = await quote('60*90\n123*540');
  assert.deepEqual(mixed.rows.map(row=>row.readyMade),[true,false]);
  assert.equal(formatQuoteForCopy(mixed,{automatic:true}),'60*90 = 18.80元\n123*540 = 265.68元\n两张\n总价格284元');
  assert.equal(formatQuoteForCopy(mixed),'60*90 = 18.8元\n123*540 = 265.68元\n总价格284.48元');
  assert.equal(formatQuoteForCopy(await quote('60*90*2'),{automatic:true}),'60*90*2 = 37.60元\n两张\n总价格37元');
  assert.equal(formatQuoteForCopy(await quote('60*90','1',{readyMade:false}),{automatic:true}),'60*90的价格是24元');
  for (const automatic of [false,true]) {
    assert.equal(formatQuoteForCopy(await quote(''), {automatic}), '');
    assert.equal(formatQuoteForCopy(await quote('100*200\ninvalid'), {automatic}), '');
  }
});

test('multi-sheet automatic copy keeps cents on each row and truncates only the final sum', async () => {
  const { formatQuoteForCopy } = await model;
  const requested = await quote('124*240\n120*120', '1', {customPrice:40});
  assert.equal(formatQuoteForCopy(requested, {automatic:true}), '124*240 = 119.04元\n120*120 = 57.60元\n两张\n总价格176元');
  assert.equal(formatQuoteForCopy(requested), '124*240 = 119.04元\n120*120 = 57.6元\n总价格176.64元');
  const carriedCents = await quote('100*100\n100*100', '1', {customPrice:0.99});
  assert.equal(formatQuoteForCopy(carriedCents, {automatic:true}), '100*100 = 0.99元\n100*100 = 0.99元\n两张\n总价格1元');
});

test('edited and newly configured weights apply to quantity and both styles', async () => {
  const prices = structuredClone(config);
  prices['产品'][0]['单位重量'] = 2.75;
  prices['产品'][1]['单位重量'] = {'标准':2.4, '方格款式':3.6};
  prices['产品'][3]['单位重量'] = 1.25;
  assert.equal(validatePrices(prices), prices);
  assert.equal((await quote('100*200*3','1',{},prices)).weight,16.5);
  assert.equal((await quote('100*200*2','2',{},prices)).weight,9.6);
  assert.equal((await quote('100*200*2','2',{squareStyle:true},prices)).weight,14.4);
  assert.equal((await quote('100*200','4',{},prices)).weight,2.5);
  for (const weight of [-1, '', null, {'标准':2,'方格款式':-1}]) {
    prices['产品'][0]['单位重量'] = weight;
    assert.throws(()=>validatePrices(prices),/单位重量无效/);
  }
});

test('legacy configuration migration removes other materials and preserves retained custom prices', async () => {
  const directory = await fs.mkdtemp(path.join(os.tmpdir(), 'carpet-migration-test-'));
  const configPath = path.join(directory, 'prices.json');
  const legacy = structuredClone(config);
  const oldIds = ['1','2','3','4','7','8','14','16'];
  const idMap = new Map(legacy['产品'].map((p,i)=>[p['编号'],oldIds[i]]));
  delete legacy['编号版本'];
  legacy['产品'].forEach(p=>{p['编号']=idMap.get(p['编号']);});
  legacy['现成尺寸价格'].forEach(p=>{p['产品编号']=idMap.get(p['产品编号']);});
  legacy['产品'][0]['单价'] = 74.88;
  legacy['产品'][0]['单位重量'] = 2.75;
  legacy['产品'][1]['单位重量'] = {'标准':2.4,'加厚':3.6};
  legacy['产品'][4]['单价'] = 123.45;
  legacy['产品'][5]['最大宽度'] = 130;
  legacy['产品'].find(p => p['编号'] === '7')['名称'] = '流行毯';
  legacy['产品'].push({ '编号':'5','名称':'旧材质','单价':60,'支持定制':true,'最大宽度':200 });
  legacy['现成尺寸价格'][0]['价格'] = 12.34;
  legacy['现成尺寸价格'].push({ '产品编号':'5','尺寸':'100*100','价格':60 });
  const original = JSON.stringify(legacy, null, 2);
  await fs.writeFile(configPath, original);
  const store = await createPriceStore({ defaultPath:path.join(__dirname,'../config/prices.json'), configPath });
  const [one, two] = await Promise.all([store.read(), store.read()]);
  for (const snapshot of [one, two]) {
    assert.equal(snapshot.error, null);
    assert.equal(snapshot.config['产品'].length, 8);
    assert.equal(snapshot.config['产品'][0]['单价'], 74.88);
    assert.deepEqual(snapshot.config['产品'].map(p=>p['编号']),['1','2','3','4','5','6','7','8']);
    assert.equal(snapshot.config['产品'][0]['单位重量'],2.75);
    assert.deepEqual(snapshot.config['产品'][1]['单位重量'],{'标准':2.4,'方格款式':3.6});
    assert.equal(snapshot.config['产品'].find(p => p['编号'] === '5')['名称'], '流星毯');
    assert.equal(snapshot.config['产品'].find(p => p['编号'] === '5')['单价'],123.45);
    assert.equal(snapshot.config['产品'].find(p => p['编号'] === '6')['最大宽度'],130);
    assert.equal(snapshot.config['现成尺寸价格'][0]['价格'], 12.34);
    assert.equal(snapshot.config['现成尺寸价格'].length, 117);
    assert.deepEqual(snapshot.config['现成尺寸价格'],config['现成尺寸价格'].map((r,i)=>i===0?{...r,'价格':12.34}:r));
  }
  assert.equal(await fs.readFile(`${configPath}.before-1.3.2.bak`, 'utf8'), original);
  assert.equal(JSON.parse(await fs.readFile(configPath, 'utf8'))['产品'].length, 8);
  const {normalizePrices} = await import('../config/normalize-prices.mjs');
  assert.equal(normalizePrices(one.config,config),one.config);
  const withoutMarker = structuredClone(one.config); delete withoutMarker['编号版本'];
  assert.deepEqual(normalizePrices(withoutMarker,config),one.config);
});
test('duplicate sizes and invalid money are rejected', () => { const duplicate=structuredClone(config); duplicate['现成尺寸价格'].push(duplicate['现成尺寸价格'][0]); assert.throws(()=>validatePrices(duplicate),/重复/); const bad=structuredClone(config); bad['产品'][0]['单价']=-1; assert.throws(()=>validatePrices(bad),/单价/); });
test('file save backs up original; broken external file keeps last valid data', async () => {
  const directory=await fs.mkdtemp(path.join(os.tmpdir(),'carpet-pricing-test-'));
  const configPath=path.join(directory,'prices.json');
  const store=await createPriceStore({defaultPath:path.join(__dirname,'../config/prices.json'),configPath});
  const original=await fs.readFile(configPath,'utf8');
  const changed=structuredClone(config); changed['产品'][0]['单价']=77;
  assert.equal((await store.save(changed)).config['产品'][0]['单价'],77);
  assert.equal(await fs.readFile(`${configPath}.bak`,'utf8'),original);
  await fs.writeFile(configPath,'{ broken json');
  const snapshot=await store.read(); assert.ok(snapshot.error); assert.equal(snapshot.config['产品'][0]['单价'],77);
  assert.equal(await fs.readFile(configPath,'utf8'),'{ broken json');
});
