const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const os = require('node:os');
const path = require('node:path');
const { createHash } = require('node:crypto');
const { execFile } = require('node:child_process');
const { promisify } = require('node:util');
const run = promisify(execFile);

test('Windows portable helper replaces only the executable after verification, and rejects a corrupt package', { skip: process.platform !== 'win32' }, async () => {
  const temp = await fs.mkdtemp(path.join(os.tmpdir(), 'carpet-portable-helper-'));
  const original = path.join(temp, '地毯工作台.exe');
  const payload = path.join(temp, 'new.exe');
  const prices = path.join(temp, 'prices.json');
  const powershell = path.join(process.env.WINDIR, 'System32/WindowsPowerShell/v1.0/powershell.exe');
  const utility = await fs.readFile(path.join(process.env.WINDIR, 'System32/where.exe'));
  try {
    await fs.writeFile(original, 'old version');
    await fs.writeFile(prices, '{"test":"retain user prices"}');
    await fs.writeFile(payload, utility);
    const args = ['-NoProfile', '-NonInteractive', '-ExecutionPolicy', 'Bypass', '-File', path.resolve('desktop/apply-portable-update.ps1'), '-OriginalPath', original, '-PackagePath', payload, '-PreviousProcessId', '99999999', '-ExpectedSHA256'];
    await assert.rejects(run(powershell, [...args, '0'.repeat(64)], { windowsHide: true, timeout: 20000 }));
    assert.equal(await fs.readFile(original, 'utf8'), 'old version');
    await run(powershell, [...args, createHash('sha256').update(utility).digest('hex')], { windowsHide: true, timeout: 20000 });
    assert.deepEqual(await fs.readFile(original), utility);
    assert.equal(await fs.readFile(prices, 'utf8'), '{"test":"retain user prices"}');
    assert.equal((await fs.readdir(temp)).some(name => name.includes('.update-')), false);
  } finally {
    assert.equal(path.dirname(temp), os.tmpdir());
    assert.ok(path.basename(temp).startsWith('carpet-portable-helper-'));
    await fs.rm(temp, { recursive: true, force: true, maxRetries: 5, retryDelay: 200 });
  }
});
