const readyMadeIndexes = new WeakMap();
function getReadyMadeIndex(prices) {
  let index = readyMadeIndexes.get(prices);
  if (!index) {
    index = new Map(prices.map(item => [`${item['产品编号']}:${item['尺寸']}`, item]));
    readyMadeIndexes.set(prices, index);
  }
  return index;
}

export function calculateQuote(input, product, config, { customPrice = 0, readyMade = true, squareStyle = false } = {}) {
  const readyPrices = !customPrice && readyMade && product && input.trim() ? getReadyMadeIndex(config['现成尺寸价格']) : null;
  const weightValue = product?.['单位重量'];
  const unitWeight = typeof weightValue === 'number' ? weightValue : weightValue?.[squareStyle ? '方格款式' : '标准'] || 0;
  const rows = input.split('\n').map(line => line.trim()).filter(Boolean).map(raw => {
    const parts = raw.split('*');
    const [width, length, quantity = 1] = parts.map(Number);
    if (![2, 3].includes(parts.length) || ![width, length, quantity].every(Number.isFinite) || width <= 0 || length <= 0 || !Number.isInteger(quantity) || quantity <= 0 || quantity > 100000 || width > 100000 || length > 100000) return { raw, valid: false, error: '尺寸格式无效', quantity: 0, area: 0, price: 0 };
    const size = `${width}*${length}`;
    const area = width * length / 10000;
    if (!(customPrice > 0) && (!product || !product['支持定制'])) return { raw, size, quantity, area: area * quantity, valid: false, error: product ? '该产品不支持定制' : '请选择材质', price: 0 };
    const standard = readyPrices?.get(`${product['编号']}:${size}`);
    const narrow = product?.['窄幅规则'];
    const unitPrice = standard ? standard['价格'] : customPrice || (narrow && width < narrow['宽度小于'] ? narrow['单价'] : product['单价']);
    const price = Math.round((standard ? standard['价格'] * quantity : unitPrice * area * quantity) * 100) / 100;
    return { raw, size, width, length, quantity, area: area * quantity, valid: true, price, unitPrice, priceUnit: standard ? '张' : '㎡', readyMade: Boolean(standard), narrow: Boolean(!standard && !customPrice && narrow && width < narrow['宽度小于']), weight: unitWeight * area * quantity, splicing: width > (product?.['最大宽度'] || 200) };
  });
  const valid = rows.filter(row => row.valid);
  return { rows, quantity: valid.reduce((s, r) => s + r.quantity, 0), area: valid.reduce((s, r) => s + r.area, 0), total: Math.round(valid.reduce((s, r) => s + r.price, 0) * 100) / 100, weight: valid.reduce((s, r) => s + r.weight, 0) };
}

export function formatQuoteForCopy(quote, { automatic = false } = {}) {
  if (!quote.quantity || quote.rows.some(row => !row.valid)) return '';
  const multiple = quote.quantity > 1;
  const prices = quote.rows.map(row => automatic && !multiple && !row.readyMade ? Math.floor(row.price) : Number(row.price.toFixed(2)));
  if (automatic && !multiple) {
    return `${quote.rows[0].size}的价格是${prices[0]}元`;
  }
  const lines = quote.rows.map((row, index) => `${row.size}${row.quantity > 1 ? `*${row.quantity}` : ''} = ${automatic && multiple ? prices[index].toFixed(2) : prices[index]}元`);
  if (automatic && multiple) lines.push(`${quantityForCopy(quote.quantity)}张`);
  const total = Number(prices.reduce((sum, price) => sum + price, 0).toFixed(2));
  if (multiple) lines.push(`总价格${automatic ? Math.floor(total) : total}元`);
  return lines.join('\n');
}

function quantityForCopy(quantity) {
  if (quantity === 2) return '两';
  if (quantity > 9999) return String(quantity);
  const digits = '零一二三四五六七八九';
  const units = ['', '十', '百', '千'];
  let text = '', pendingZero = false;
  for (let place = 3; place >= 0; place--) {
    const digit = Math.floor(quantity / 10 ** place) % 10;
    if (digit) {
      if (pendingZero) text += '零';
      text += digits[digit] + units[place];
      pendingZero = false;
    } else if (text) pendingZero = true;
  }
  return text.replace(/^一十/, '十');
}
