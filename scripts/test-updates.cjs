const test = require('node:test');
const assert = require('node:assert/strict');
const { createUpdateService, compareVersions } = require('../desktop/updates.cjs');
const repository = 'Fy-MoMing/DiTangongzuotai';
const prefix = `https://github.com/${repository}`;
const manifest = (version = 'v1.5.0') => ({
  tag_name: version, html_url: `${prefix}/releases/tag/${version}`, body: '材质显示与更新体验优化。',
  draft: false, prerelease: false,
  assets: ['地毯工作台.exe', '地毯工作台-安装版.exe'].map(name => ({name, browser_download_url:`${prefix}/releases/download/${version}/${encodeURIComponent(name)}`}))
});
const ok = release => ({ok:true,status:200,json:async()=>release});
const service = options => createUpdateService({currentVersion:'1.4.0', repository, fetchImpl:async()=>ok(manifest()), ...options});

test('stable version comparison handles numeric components and rejects invalid tags', () => {
  assert.equal(compareVersions('v1.10.0', '1.9.9'), 1);
  assert.equal(compareVersions('1.4.0+build.2', 'v1.4.0'), 0);
  assert.equal(compareVersions('1.3.9', '1.4.0'), -1);
  for (const value of ['v1.5', 'latest', '1.4.1-beta.1', '1.4.0/../../', null]) assert.equal(compareVersions(value, '1.4.0'), null);
});

test('check uses the configured GitHub repository, returns notes and broadcasts progress', async () => {
  const changes = [], requests = [];
  const updater = service({now:()=>1000,onChange:state=>changes.push(state.status),fetchImpl:async(url,options)=>{
    requests.push(url);assert.ok(options.signal);assert.equal(options.headers['X-GitHub-Api-Version'],'2022-11-28');
    return ok(manifest());
  }});
  const result = await updater.check();
  assert.equal(result.currentVersion,'1.4.0');assert.equal(result.latestVersion,'1.5.0');assert.equal(result.status,'available');
  assert.equal(result.checkedAt,1000);assert.match(result.notes,/更新体验/);
  assert.deepEqual(changes,['checking','available']);
  assert.deepEqual(requests,[`https://api.github.com/repos/${repository}/releases/latest`]);
});

test('portable and installed editions open the matching asset; user action is required to download', async () => {
  for (const portable of [true,false]) {
    const opened=[];const updater=service({portable,openExternal:async url=>opened.push(url)});
    assert.equal(await updater.openDownload(),false);
    await updater.check();assert.deepEqual(opened,[]);
    assert.equal(await updater.openDownload(),true);
    assert.equal(decodeURIComponent(opened[0]),`${prefix}/releases/download/v1.5.0/${portable?'地毯工作台.exe':'地毯工作台-安装版.exe'}`);
    await updater.openRelease();assert.equal(opened[1],`${prefix}/releases/tag/v1.5.0`);
  }
});

test('same or older release is current and never offers a downgrade', async () => {
  for (const version of ['v1.4.0','v1.3.9']) {
    const updater=service({fetchImpl:async()=>ok(manifest(version))});
    assert.equal((await updater.check()).status,'current');assert.equal(await updater.openDownload(),false);
  }
});

test('requests deduplicate, cache for 15 minutes, and manual checking bypasses cache', async () => {
  let calls=0,time=1000;
  const updater=service({now:()=>time,fetchImpl:async()=>{calls++;await new Promise(resolve=>setImmediate(resolve));return ok(manifest());}});
  const [a,b]=await Promise.all([updater.check(),updater.check(true)]);assert.deepEqual(a,b);assert.equal(calls,1);
  time+=10000;await updater.check();assert.equal(calls,1);
  await updater.check(true);assert.equal(calls,2);
  time+=16*60*1000;await updater.check();assert.equal(calls,3);
});

test('offline, rate limits, missing release and malformed manifests give inline errors', async () => {
  const cases=[
    [async()=>{throw Error('offline');},/网络/],
    [async()=>({ok:false,status:403}),/频繁/],
    [async()=>({ok:false,status:429}),/频繁/],
    [async()=>({ok:false,status:404}),/公开正式版本/],
    [async()=>ok({...manifest(),draft:true}),/正式更新/],
    [async()=>ok({...manifest(),prerelease:true}),/正式更新/],
    [async()=>ok(manifest('not-a-version')),/正式更新/]
  ];
  for(const [fetchImpl,message] of cases) {
    const updater=service({fetchImpl});const result=await updater.check();
    assert.equal(result.status,'error');assert.match(result.error,message);assert.equal(result.downloadUrl,null);
    assert.equal(await updater.openDownload(),false);
  }
});

test('download URLs stay on the configured GitHub repository; missing assets fall back to release page', async () => {
  const release=manifest();release.html_url='https://example.com';
  release.assets[1].browser_download_url='https://github.com/other/repository/releases/download/v9/malware.exe';
  const opened=[];const updater=service({fetchImpl:async()=>ok(release),openExternal:async url=>opened.push(url)});
  const result=await updater.check();assert.equal(result.downloadUrl,null);
  await updater.openDownload();assert.deepEqual(opened,[`${prefix}/releases/latest`]);
});

test('unconfigured repository never makes requests or opens a URL', async () => {
  for(const value of ['',undefined,'../invalid','owner/repo/extra']) {
    const updater=service({repository:value,fetchImpl:async()=>{throw Error('must not request');},openExternal:async()=>assert.fail('must not open')});
    assert.equal((await updater.check(true)).status,'unconfigured');assert.equal(await updater.openDownload(),false);assert.equal(await updater.openRelease(),false);
  }
});
