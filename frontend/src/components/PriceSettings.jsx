import React, { useEffect, useState } from 'react';
import { FiFileText, FiRefreshCw, FiSave, FiSearch, FiCheckCircle, FiExternalLink } from 'react-icons/fi';
function PriceSettings({ snapshot, onReload, onSave }) {
  const [draft, setDraft] = useState(() => structuredClone(snapshot.config));
  const [search, setSearch] = useState('');
  const [tab, setTab] = useState('products');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);
  useEffect(() => { setDraft(structuredClone(snapshot.config)); setDirty(false); }, [snapshot.config]);
  const updateProduct = (index, key, value) => { setDraft(old => ({ ...old, '产品': old['产品'].map((p, i) => i === index ? { ...p, [key]: value } : p) })); setDirty(true); };
  const number = e => e.target.value === '' ? '' : Number(e.target.value);
  const updateWeight = (index, product, kind, value) => {
    const weight = product['单位重量'];
    updateProduct(index, '单位重量', weight && typeof weight === 'object'
      ? { ...weight, [kind]: value }
      : value === '' ? undefined : value);
  };
  const save = async () => { setSaving(true); setError(''); try { await onSave(draft); } catch (e) { setError(e.message.replace(/^Error invoking remote method '[^']+': Error: /, '')); } finally { setSaving(false); } };
  const reload = async () => { setError(''); await onReload(); };
  return <div className="settings-layout"><section className="studio-card settings-file-card"><div className="file-icon"><FiFileText /></div><div className="file-description"><h2>一份配置，管理价格与重量</h2><p>修改下方价格或每平重量并保存，或用记事本编辑 prices.json。配置错误时会保留上一次有效配置。</p><code>{snapshot.path || '浏览器本地配置'}</code></div><div className="file-actions"><button className="secondary-button" disabled={!window.desktop?.openPrices} onClick={() => window.desktop.openPrices()}><FiExternalLink />打开配置文件</button><button className="secondary-button" onClick={reload}><FiRefreshCw />重新加载</button></div></section>
    {(error || snapshot.error) && <div role="alert" className="notice warning">{error || snapshot.error}</div>}
    <section className="studio-card settings-editor"><div className="settings-toolbar"><div className="segmented-control"><button className={tab === 'products' ? 'active' : ''} onClick={() => setTab('products')}>材质单价</button><button className={tab === 'sizes' ? 'active' : ''} onClick={() => setTab('sizes')}>现成规格价格</button><button className={tab === 'weights' ? 'active' : ''} onClick={() => setTab('weights')}>每平重量</button></div><label className="search-field compact-search"><FiSearch /><input aria-label="搜索配置" placeholder="搜索材质或尺寸" value={search} onChange={e => setSearch(e.target.value)} /></label></div>
      {tab === 'products' ? <div className="table-scroll settings-price-table"><table><thead><tr><th>编号 / 材质</th><th>单价（元 / ㎡）</th><th>最宽（厘米）</th><th>窄幅单价（元 / ㎡）</th><th>支持定制</th></tr></thead><tbody>{draft['产品'].map((p, i) => `${p['名称']} ${p['编号']}`.includes(search) && <tr key={p['编号']}><td><span className="muted-text product-number">{p['编号']}</span><strong>{p['名称']}</strong></td><td><input className="table-number-input" aria-label={`${p['名称']}单价`} type="number" min="0" step="0.01" value={p['单价']} onChange={e => updateProduct(i, '单价', number(e))} /></td><td><input className="table-number-input" aria-label={`${p['名称']}最大宽度`} type="number" min="1" value={p['最大宽度']} onChange={e => updateProduct(i, '最大宽度', number(e))} /></td><td>{p['窄幅规则'] ? <div className="narrow-price-field"><input className="table-number-input" type="number" min="0" step="0.01" aria-label={`${p['名称']}窄幅单价`} value={p['窄幅规则']['单价']} onChange={e => updateProduct(i, '窄幅规则', { ...p['窄幅规则'], '单价': number(e) })} /><span>宽 &lt; {p['窄幅规则']['宽度小于']} cm</span></div> : <span className="muted-text">—</span>}</td><td><input type="checkbox" aria-label={`${p['名称']}支持定制`} checked={p['支持定制']} onChange={e => updateProduct(i, '支持定制', e.target.checked)} /></td></tr>)}</tbody></table></div> : tab === 'weights' ? <>
        <div className="table-scroll settings-price-table weight-settings-table"><table><thead><tr><th>编号 / 材质</th><th>每平重量（kg / ㎡）</th><th>方格款式（kg / ㎡）</th></tr></thead><tbody>{draft['产品'].map((p, i) => {
          if (!`${p['名称']} ${p['编号']}`.includes(search)) return null;
          const weight = p['单位重量'];
          const variants = weight && typeof weight === 'object';
          return <tr key={p['编号']}><td><span className="muted-text product-number">{p['编号']}</span><strong>{p['名称']}</strong></td>
            <td><input className="table-number-input" aria-label={`${p['名称']}每平重量`} type="number" min="0" max="1000000" step="0.01" placeholder="未设置" value={(variants ? weight['标准'] : weight) ?? ''} onChange={e => updateWeight(i, p, '标准', number(e))} /></td>
            <td>{variants ? <input className="table-number-input" aria-label={`${p['名称']}方格款式每平重量`} type="number" min="0" max="1000000" step="0.01" value={weight['方格款式']} onChange={e => updateWeight(i, p, '方格款式', number(e))} /> : <span className="muted-text">—</span>}</td></tr>;
        })}</tbody></table></div>
        <p className="table-note">单位：千克 / 平方米 · 总重量按面积 × 数量 × 每平重量计算。未设置的材质不计算重量。</p>
      </> : <div className="table-scroll settings-price-table"><table><thead><tr><th>材质</th><th>现成尺寸 / cm</th><th>每张价格 / 元</th></tr></thead><tbody>{draft['现成尺寸价格'].map((r, i) => { const name = draft['产品'].find(p => p['编号'] === r['产品编号'])?.['名称']; return `${name} ${r['尺寸']}`.includes(search) && <tr key={`${r['产品编号']}-${r['尺寸']}`}><td>{name}</td><td>{r['尺寸']}</td><td><input className="table-number-input" type="number" min="0" step="0.01" aria-label={`${name}${r['尺寸']}价格`} value={r['价格']} onChange={e => { const amount = number(e); setDraft(old => ({ ...old, '现成尺寸价格': old['现成尺寸价格'].map((row, n) => n === i ? { ...row, '价格': amount } : row) })); setDirty(true); }} /></td></tr>; })}</tbody></table></div>}
      <div className="settings-save-bar"><span className={dirty ? 'unsaved-label' : 'saved-label'}><FiCheckCircle />{dirty ? '有尚未保存的修改' : '当前配置已同步'}<small>保存前自动备份为 prices.json.bak</small></span><button className="primary-button" disabled={!dirty || saving} onClick={save}><FiSave />{saving ? '正在保存…' : '保存配置'}</button></div>
    </section><div className="config-tips"><strong>计价顺序</strong><span>临时单价 → 现成规格价格 → 窄幅规则 → 材质单价</span><span>修改单价时，匹配的现成规格仍按现成价格计费，可在报价区关闭“现成价格优先”。</span></div>
  </div>;
}

export default React.memo(PriceSettings);
