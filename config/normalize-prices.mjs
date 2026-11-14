// Migrate both product IDs and ready-made references together, preserving edited values.
export function normalizePrices(config, defaults) {
  const legacyIds = ['1', '2', '3', '4', '7', '8', '14', '16'];
  const currentIds = config['编号版本'] === 2 || config['产品'].some(product =>
    (product['编号'] === '5' && ['流星毯', '流行毯'].includes(product['名称'])) ||
    (product['编号'] === '6' && product['名称'] === '丝圈') ||
    (product['编号'] === '8' && product['名称'] === '硅藻泥')
  );
  const idMap = new Map();
  const products = defaults['产品'].flatMap((standard, index) => {
    const oldId = currentIds ? standard['编号'] : legacyIds[index];
    let product = config['产品'].find(item => item['编号'] === oldId);
    if (!product) return [];
    const weight = product['单位重量'];
    if (weight && typeof weight === 'object' && Object.hasOwn(weight, '加厚')) {
      const { '加厚': legacyWeight, ...remaining } = weight;
      product = { ...product, '单位重量': { ...remaining, '方格款式': remaining['方格款式'] ?? legacyWeight } };
    }
    idMap.set(oldId, standard['编号']);
    return [product['编号'] === standard['编号'] && product['名称'] === standard['名称'] ? product : { ...product, '编号': standard['编号'], '名称': standard['名称'] }];
  });
  const sizes = config['现成尺寸价格'].filter(item => idMap.has(item['产品编号'])).map(item => {
    const id = idMap.get(item['产品编号']);
    return id === item['产品编号'] ? item : { ...item, '产品编号': id };
  });
  if (config['编号版本'] === 2 && products.length === config['产品'].length && products.every((product, index) => product === config['产品'][index]) && sizes.length === config['现成尺寸价格'].length && sizes.every((item, index) => item === config['现成尺寸价格'][index])) return config;
  return { ...config, '编号版本': 2, '产品': products, '现成尺寸价格': sizes };
}
