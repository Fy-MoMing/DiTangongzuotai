import React, { useMemo, useState } from 'react';
import { FiSearch, FiFilter } from 'react-icons/fi';
function PriceTable({ config }) {
  const [search, setSearch] = useState('');
  const [productId, setProductId] = useState('all');
  const names = Object.fromEntries(config['产品'].map(p => [p['编号'], p['名称']]));
  const rows = useMemo(() => config['现成尺寸价格'].filter(r => (productId === 'all' || r['产品编号'] === productId) && `${r['尺寸']} ${names[r['产品编号']]}`.includes(search.trim())), [config, productId, search]);
  return <section className="studio-card catalog-table-card"><div className="section-heading"><span className="step-number"><FiFilter /></span><div><h2>商品尺寸与价格表</h2><p>与报价共用同一份价格配置，改价同步生效</p></div><span className="small-label">{rows.length} 条规格</span></div><div className="table-toolbar"><label className="search-field"><FiSearch /><input aria-label="搜索尺寸或商品" placeholder="搜索尺寸或商品，例如 120*150" value={search} onChange={e => setSearch(e.target.value)} /></label><select aria-label="筛选商品" value={productId} onChange={e => setProductId(e.target.value)}><option value="all">全部材质</option>{config['产品'].filter(p => config['现成尺寸价格'].some(r => r['产品编号'] === p['编号'])).map(p => <option key={p['编号']} value={p['编号']}>{p['名称']}</option>)}</select></div><div className="table-scroll price-table"><table><thead><tr><th>序号</th><th>地毯材质</th><th>标准尺寸 / cm</th><th>面积 / ㎡</th><th className="align-right">现成价格 / 元</th></tr></thead><tbody>{rows.map((r, i) => <tr key={`${r['产品编号']}-${r['尺寸']}`}><td className="muted-text">{String(i + 1).padStart(2, '0')}</td><td><span className="table-material-dot" />{names[r['产品编号']]}</td><td><strong>{r['尺寸']}</strong></td><td>{(r['尺寸'].split('*').reduce((a, b) => Number(a) * Number(b)) / 10000).toFixed(2)}</td><td className="align-right"><strong>¥{r['价格'].toFixed(2)}</strong></td></tr>)}</tbody></table>{!rows.length && <div className="inline-empty">没有匹配的规格，请调整搜索或筛选条件。</div>}</div><div className="table-note">价格：元 / 张 · 尺寸：厘米 · 所有价格来自当前配置文件</div></section>;
}

export default React.memo(PriceTable);
