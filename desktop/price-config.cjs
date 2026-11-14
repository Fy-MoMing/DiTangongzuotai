const fs = require('node:fs/promises');
const path = require('node:path');

function validatePrices(config) {
  const fail = message => { throw new Error(message); };
  const amount = value => typeof value === 'number' && Number.isFinite(value) && value >= 0 && value <= 1000000;
  if (!config || config['版本'] !== 1) fail('“版本”必须为数字 1。');
  if (typeof config['现成价格优先'] !== 'boolean') fail('“现成价格优先”必须为 true 或 false。');
  if (!Array.isArray(config['产品']) || !config['产品'].length || config['产品'].length > 200) fail('“产品”需要包含 1 至 200 个产品。');
  const ids = new Set();
  for (const product of config['产品']) {
    if (!product || typeof product['编号'] !== 'string' || !/^[\w-]{1,32}$/.test(product['编号']) || ids.has(product['编号'])) fail('产品编号必须是唯一的数字或英文字母。');
    ids.add(product['编号']);
    if (typeof product['名称'] !== 'string' || !product['名称'].trim() || product['名称'].length > 80) fail(`产品 ${product['编号']} 的名称无效。`);
    if (!amount(product['单价'])) fail(`${product['名称']}的单价应为 0 至 1000000 之间的数字。`);
    if (typeof product['支持定制'] !== 'boolean') fail(`${product['名称']}的“支持定制”应为 true 或 false。`);
    if (!amount(product['最大宽度']) || product['最大宽度'] <= 0) fail(`${product['名称']}的最大宽度应为正数。`);
    const rule = product['窄幅规则'];
    if (rule && (!amount(rule['宽度小于']) || rule['宽度小于'] <= 0 || !amount(rule['单价']))) fail(`${product['名称']}的窄幅规则无效。`);
    const weight = product['单位重量'];
    if (weight !== undefined && !amount(weight) && !(weight && amount(weight['标准']) && amount(weight['方格款式'] ?? weight['加厚']))) fail(`${product['名称']}的单位重量无效。`);
  }
  if (!Array.isArray(config['现成尺寸价格']) || config['现成尺寸价格'].length > 5000) fail('“现成尺寸价格”应为数组，最多 5000 条。');
  const sizes = new Set();
  for (const item of config['现成尺寸价格']) {
    if (!item || !ids.has(item['产品编号'])) fail('现成尺寸价格中包含不存在的产品编号。');
    if (typeof item['尺寸'] !== 'string' || !/^\d+(?:\.\d+)?\*\d+(?:\.\d+)?$/.test(item['尺寸']) || item['尺寸'].split('*').some(n => Number(n) <= 0 || Number(n) > 100000)) fail(`尺寸“${item['尺寸']}”无效，请使用 120*150 这样的格式。`);
    if (!amount(item['价格'])) fail(`${item['尺寸']} 的价格应为非负数字。`);
    const key = `${item['产品编号']}:${item['尺寸']}`;
    if (sizes.has(key)) fail(`产品 ${item['产品编号']} 的 ${item['尺寸']} 重复，请保留一条。`);
    sizes.add(key);
  }
  return config;
}

async function createPriceStore({ defaultPath, configPath }) {
  const { normalizePrices } = await import('../config/normalize-prices.mjs');
  const defaults = validatePrices(JSON.parse(await fs.readFile(defaultPath, 'utf8')));
  let current = defaults;
  await fs.mkdir(path.dirname(configPath), { recursive: true });
  try {
    await fs.writeFile(configPath, JSON.stringify(defaults, null, 2) + '\n', { flag: 'wx' });
  } catch (error) {
    if (error.code !== 'EEXIST') throw error;
  }
  async function read() {
    try {
      const text = await fs.readFile(configPath, 'utf8');
      const loaded = validatePrices(JSON.parse(text.replace(/^\uFEFF/, '')));
      const parsed = validatePrices(normalizePrices(loaded, defaults));
      if (parsed !== loaded) {
        try { await fs.writeFile(`${configPath}.before-1.3.2.bak`, text, { flag: 'wx' }); }
        catch (error) { if (error.code !== 'EEXIST') throw error; }
        await fs.writeFile(`${configPath}.tmp`, JSON.stringify(parsed, null, 2) + '\n');
        await fs.rename(`${configPath}.tmp`, configPath);
      }
      current = parsed;
      const stat = await fs.stat(configPath);
      return { config: current, path: configPath, modifiedAt: stat.mtime.toISOString(), error: null };
    } catch (error) {
      return { config: current, path: configPath, modifiedAt: null, error: `配置未应用：${error.message} 正在使用上一次有效的价格。` };
    }
  }
  async function save(value) {
    validatePrices(value);
    value = validatePrices(normalizePrices(value, defaults));
    const previous = await fs.readFile(configPath, 'utf8');
    await fs.writeFile(`${configPath}.bak`, previous);
    const temporary = `${configPath}.tmp`;
    await fs.writeFile(temporary, JSON.stringify(value, null, 2) + '\n');
    await fs.rename(temporary, configPath);
    current = value;
    return read();
  }
  let pending = Promise.resolve();
  const enqueue = operation => {
    const result = pending.then(operation);
    pending = result.catch(() => {});
    return result;
  };
  // Serialize migration and writes so simultaneous reloads cannot share a temp file.
  return { read: () => enqueue(read), save: value => enqueue(() => save(value)), path: configPath };
}

module.exports = { validatePrices, createPriceStore };
