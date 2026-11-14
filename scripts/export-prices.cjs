const fs = require('node:fs/promises');
const path = require('node:path');
const { createPriceStore } = require('../desktop/price-config.cjs');
const output = process.argv[2] || path.join(__dirname, '..', 'release');
async function main() {
  await fs.mkdir(output, { recursive: true });
  const store = await createPriceStore({ defaultPath: path.join(__dirname, '..', 'config', 'prices.json'), configPath: path.join(output, 'prices.json') });
  const snapshot = await store.read();
  if (snapshot.error) throw new Error(snapshot.error);
  console.log('Price configuration ready:', store.path);
}
main().catch(error => { console.error(error); process.exitCode = 1; });
