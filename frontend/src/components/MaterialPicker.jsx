import React, { useState } from 'react';
import { FiSearch, FiCheck, FiSliders } from 'react-icons/fi';
import { featuredIds } from '../utils/catalog';
export default function MaterialPicker({ products, onSelectProduct, selectedProduct, customPrice, onCustomPriceChange, searchText, onSearchTextChange }) {
  const [localSearch, setLocalSearch] = useState('');
  const search = searchText ?? localSearch;
  const setSearch = onSearchTextChange || setLocalSearch;
  const displayed = search.trim() ? products.filter(p => `${p['名称']} ${p['编号']} ${p['描述'] || ''}`.includes(search.trim())) : featuredIds.map(id => products.find(p => p['编号'] === id)).filter(Boolean);
  return <section className="studio-card material-card">
    <div className="section-heading"><span className="step-number">01</span><div><h2>选择地毯材质</h2><p>为每一种材质，找到合适的报价</p></div><span className="small-label">{products.length} 款材质</span></div>
    <label className="search-field"><FiSearch /><input placeholder="输入产品名称搜索..." aria-label="搜索地毯材质" value={search} onChange={e => setSearch(e.target.value)} /></label>
    <div className="material-grid">{displayed.map(p => <button key={p['编号']} data-material={p['编号']} className={`material-tile ${selectedProduct?.['编号'] === p['编号'] ? 'selected' : ''}`} onClick={() => onSelectProduct(p)} disabled={!p['支持定制']} aria-label={p['名称']} aria-pressed={selectedProduct?.['编号'] === p['编号']}>
      {selectedProduct?.['编号'] === p['编号'] && <span className="material-check"><FiCheck /></span>}
      <div className="material-info"><strong>{p['名称']}</strong><span>{p['支持定制'] ? <><b>¥{p['单价']}</b><small> / ㎡</small></> : '不支持定制'}</span></div>
    </button>)}</div>
    {!displayed.length && <div className="inline-empty">没有找到这款材质，换个关键词试试。</div>}
    <div className="custom-price"><div className="custom-price-label"><FiSliders /><div><strong>临时调整单价</strong><p>仅用于本次报价，优先于现成价和窄幅价</p></div></div><div className="price-input"><span>¥</span><input type="number" min="0" max="1000000" step="0.01" placeholder="使用默认价" aria-label="输入自定义单价 (元/㎡)" value={customPrice || ''} onChange={e => { const n = Number(e.target.value); if (Number.isFinite(n) && n >= 0 && n <= 1000000) onCustomPriceChange(n); }} /><span>/ ㎡</span></div></div>
  </section>;
}
