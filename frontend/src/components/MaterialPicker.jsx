import React from 'react';
import { FiCheck, FiSliders, FiCommand, FiRotateCcw, FiLock } from 'react-icons/fi';
import { featuredIds } from '../utils/catalog';
export default function MaterialPicker({ products, onSelectProduct, selectedProduct, customPrice, onCustomPriceChange, keepCustomPrice, onKeepCustomPriceChange, onResetCustomPrice }) {
  const displayed = featuredIds.map(id => products.find(p => p['编号'] === id)).filter(Boolean);
  return <section className="studio-card material-card">
    <div className="section-heading"><span className="step-number">01</span><div><h2>选择地毯材质</h2></div><span className="small-label">{products.length} 款材质</span></div>
    <div className={`custom-price ${customPrice ? 'is-active' : ''}`}>
      <div className="custom-price-heading"><label htmlFor="custom-unit-price"><FiSliders aria-hidden="true" />临时单价</label><span>{keepCustomPrice ? '连续使用' : '仅本单'}</span></div>
      <div className="price-input"><span>¥</span><input id="custom-unit-price" type="number" min="0" max="1000000" step="0.01" placeholder="使用默认价" aria-label="输入自定义单价 (元/㎡)" aria-describedby="custom-price-hint" value={customPrice || ''} onChange={e => { const n = Number(e.target.value); if (Number.isFinite(n) && n >= 0 && n <= 1000000) onCustomPriceChange(n); }} /><span>/ ㎡</span>{customPrice > 0 && <button className="price-reset" aria-label="恢复默认单价" title="恢复默认单价" onClick={onResetCustomPrice}><FiRotateCcw /></button>}</div>
      <label className="custom-price-lock"><input type="checkbox" checked={keepCustomPrice} onChange={e => onKeepCustomPriceChange(e.target.checked)} /><FiLock aria-hidden="true" />连续使用临时价</label>
      <p id="custom-price-hint">{keepCustomPrice ? '跨报价保留；关闭后仅用于本单' : '清空尺寸、整组替换或换材质时恢复默认'}</p>
    </div>
    <div className="material-grid">{displayed.map(p => <button key={p['编号']} data-material={p['编号']} className={`material-tile ${selectedProduct?.['编号'] === p['编号'] ? 'selected' : ''}`} onClick={() => onSelectProduct(p)} disabled={!p['支持定制']} aria-label={p['名称']} aria-pressed={selectedProduct?.['编号'] === p['编号']} aria-keyshortcuts={p['编号']} title={`${p['名称']} · 快捷键 ${p['编号']}`}>
      {selectedProduct?.['编号'] === p['编号'] && <span className="material-check"><FiCheck /></span>}
      <div className="material-info"><strong>{p['名称']}</strong><span>{p['支持定制'] ? <><b>¥{p['单价']}</b><small> / ㎡</small></> : '不支持定制'}</span></div>
      <kbd className="material-shortcut" aria-hidden="true">{p['编号']}</kbd>
    </button>)}</div>
    <p className="material-keyboard-hint"><FiCommand />数字键 <kbd>1–9</kbd> 快速选择材质</p>
  </section>;
}
