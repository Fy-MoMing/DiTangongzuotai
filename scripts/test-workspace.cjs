const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const os = require('node:os');
const path = require('node:path');
const { createWeatherService } = require('../desktop/weather.cjs');
const greetingModel = import('../frontend/src/utils/greetings.js');
const weatherModel = import('../shared/weather.mjs');

test('100 unique greetings rotate without repeats, including the boundary between cycles', async () => {
  const { greetings, nextGreeting } = await greetingModel;
  assert.equal(greetings.length,100);
  assert.equal(new Set(greetings).size,100);
  let state, previous;
  for (let cycle=0;cycle<3;cycle++) {
    const seen=new Set();
    for (let i=0;i<100;i++) {
      const next=nextGreeting(state);
      assert.ok(greetings.includes(next.text));
      assert.notEqual(next.text,previous);
      assert.ok(!seen.has(next.text));
      seen.add(next.text);previous=next.text;state=next.state;
    }
    assert.equal(seen.size,100);
  }
  assert.ok(greetings.includes(nextGreeting({remaining:['broken'],previous:101}).text));
});

test('weather conditions cover sun, cloud, overcast, rain, snow, sleet and haze in Chinese', async () => {
  const { weatherCondition } = await weatherModel;
  for (const [code,label] of [[113,'晴天'],[116,'多云'],[122,'阴天'],[296,'雨天'],[326,'雪天'],[317,'雨夹雪'],[149,'雾霾'],[389,'雷雨']]) assert.equal(weatherCondition(code),label);
  assert.equal(weatherCondition(999),'天气未知');
});

test('direct public-IP lookup supplies explicit coordinates to weather instead of the proxy exit city', async () => {
  const { fetchCurrentWeather } = await weatherModel;
  const locationUrls=[],weatherUrls=[];
  const direct = async url => {
    locationUrls.push(url);
    if(url.includes('myip.ipip.net'))return {ok:true,text:async()=>'203.0.113.24\n'};
    assert.match(url,/ipwho\.is\/203\.0\.113\.24\?lang=zh-CN$/);
    return {ok:true,json:async()=>({success:true,ip:'203.0.113.24',city:'石家庄',latitude:38.04,longitude:114.51})};
  };
  const weather = async url => {weatherUrls.push(url);return {ok:true,json:async()=>({current_condition:[{weatherCode:'122',temp_C:'-3'}]})};};
  assert.deepEqual(await fetchCurrentWeather(weather,()=>1000,direct),{city:'石家庄',condition:'阴天',temperature:-3,updatedAt:1000,locationMethod:'public-ip-v2'});
  assert.equal(locationUrls.length,2);
  assert.match(weatherUrls[0],/wttr\.in\/38\.04,114\.51/);
  await assert.rejects(fetchCurrentWeather(async()=>({ok:true,json:async()=>({current_condition:[{weatherCode:'113',temp_C:''}]})}),Date.now,direct),/Temperature/);
});

test('private addresses are rejected, backup public-IP service works and mismatched geolocation is rejected', async () => {
  const {fetchCurrentWeather}=await weatherModel;
  const urls=[];
  const direct=async url=>{
    urls.push(url);
    if(url.includes('ipip.net'))return {ok:true,text:async()=>'192.168.1.5'};
    if(url.includes('checkip.amazonaws.com'))return {ok:true,text:async()=>'203.0.113.24\n'};
    return {ok:true,json:async()=>({success:true,ip:'203.0.113.24',city:'石家庄',latitude:38.04,longitude:114.51})};
  };
  const weather=async()=>({ok:true,json:async()=>({current_condition:[{weatherCode:'113',temp_C:'12'}]})});
  assert.equal((await fetchCurrentWeather(weather,Date.now,direct)).city,'石家庄');
  assert.match(urls[2],/ipwho\.is\/203\.0\.113\.24/);
  await assert.rejects(fetchCurrentWeather(weather,Date.now,async url=>url.includes('ipwho.is')
    ? {ok:true,json:async()=>({success:true,ip:'198.51.100.1',city:'儋州',latitude:19.5,longitude:109.5})}
    : {ok:true,text:async()=>'203.0.113.24'}),/Location/);
});

test('weather fallback keeps the IP-derived coordinates and translates Open-Meteo conditions', async () => {
  const { fetchCurrentWeather } = await weatherModel;
  const direct = async url => url.includes('myip.ipip.net')
    ? {ok:true,text:async()=>'203.0.113.24'}
    : {ok:true,json:async()=>({success:true,ip:'203.0.113.24',city:'石家庄',latitude:38.04,longitude:114.51})};
  for (const [code,condition] of [[0,'晴天'],[3,'阴天'],[61,'雨天'],[71,'雪天'],[95,'雷雨']]) {
    const urls=[];
    const request=async url=>{
      urls.push(url);
      if(url.includes('wttr.in')) return {ok:false,status:503};
      return {ok:true,json:async()=>({current:{temperature_2m:9.8,weather_code:code}})};
    };
    const result=await fetchCurrentWeather(request,()=>1000,direct);
    assert.deepEqual(result,{city:'石家庄',condition,temperature:9.8,updatedAt:1000,locationMethod:'public-ip-v2'});
    assert.equal(urls.length,2);
    const fallback=new URL(urls[1]);
    assert.equal(fallback.host,'api.open-meteo.com');
    assert.equal(fallback.searchParams.get('latitude'),'38.04');
    assert.equal(fallback.searchParams.get('longitude'),'114.51');
  }
  for (const primary of [async()=>{throw new Error('timeout');}, async()=>({ok:true,json:async()=>({current_condition:[{temp_C:''}]})})]) {
    const request=async url=>url.includes('wttr.in') ? primary() : {ok:true,json:async()=>({current:{temperature_2m:0,weather_code:3}})};
    assert.equal((await fetchCurrentWeather(request,Date.now,direct)).temperature,0);
  }
});

test('weather requests deduplicate; a recent cache works offline but an old cache is not shown as today', async () => {
  const directory=await fs.mkdtemp(path.join(os.tmpdir(),'carpet-weather-test-'));
  const cachePath=path.join(directory,'weather-cache.json');
  let timestamp=1000000,calls=0,offline=false;
  const fetchImpl=async url=>{
    calls++;
    if(offline)throw new Error('offline');
    if(url.includes('myip.ipip.net'))return {ok:true,text:async()=>'203.0.113.24'};
    return {ok:true,json:async()=>url.includes('ipwho.is')
      ? {success:true,city:'石家庄',latitude:38.04,longitude:114.51}
      : {current_condition:[{weatherCode:'113',temp_C:'12'}]}};
  };
  const service=await createWeatherService({cachePath,fetchImpl,now:()=>timestamp});
  const [first,second]=await Promise.all([service.getWeather(),service.getWeather()]);
  assert.deepEqual(first,second);assert.equal(calls,3);assert.equal(first.cached,false);
  assert.equal(JSON.parse(await fs.readFile(cachePath,'utf8')).temperature,12);
  offline=true;timestamp+=20*60*1000;
  const reopened=await createWeatherService({cachePath,fetchImpl,now:()=>timestamp});
  assert.equal((await reopened.getWeather()).cached,true);
  timestamp+=2*60*60*1000;
  const expired=await reopened.getWeather(true);
  assert.equal(expired.error,'天气暂不可用');assert.equal(expired.temperature,undefined);
});

test('old proxy-based location cache is discarded, including when offline', async () => {
  const directory=await fs.mkdtemp(path.join(os.tmpdir(),'carpet-weather-old-location-'));
  const cachePath=path.join(directory,'weather-cache.json');
  await fs.writeFile(cachePath,JSON.stringify({city:'儋州',condition:'晴天',temperature:30,updatedAt:1000000}));
  const service=await createWeatherService({cachePath,now:()=>1000010,fetchImpl:async()=>{throw Error('offline');}});
  const result=await service.getWeather();
  assert.equal(result.error,'天气暂不可用');
  assert.equal(result.city,undefined);
});
