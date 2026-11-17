import React, { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import { FiCopy, FiPlus, FiTrash2, FiCheck, FiArrowUpRight, FiLayers } from 'react-icons/fi';
import { calculateQuote, formatQuoteForCopy } from '../utils/pricing';
import { money } from '../utils/format';
import QuoteLines from './QuoteLines';
import SpotlightCard from './react-bits/SpotlightCard';
export default function QuoteCalculator({ selectedProduct, customPrice, config, readyMade, onReadyMadeChange }) {
  const [value, onDimensionsChange] = useState('');
  const [squareStyle, setSquareStyle] = useState(false);
  const [basket, setBasket] = useState([]);
  const [copyError, setCopyError] = useState('');
  const quote = useMemo(() => calculateQuote(value, selectedProduct, config, { customPrice, readyMade, squareStyle }), [value, selectedProduct, config, customPrice, readyMade, squareStyle]);
  const copyTimer = useRef(null);
  const copyQueue = useRef(Promise.resolve());
  const copy = useCallback(text => {
    if (!text) return;
    clearTimeout(copyTimer.current);
    copyQueue.current = copyQueue.current.then(async () => {
      setCopyError('');
      try { if (window.desktop?.copyText) await window.desktop.copyText(text); else await navigator.clipboard.writeText(text); }
      catch { setCopyError('复制失败，请点击复制按钮重试。'); }
    });
    return copyQueue.current;
  }, []);
  const priceText = useMemo(() => formatQuoteForCopy(quote), [quote]);
  const automaticText = useMemo(() => formatQuoteForCopy(quote, { automatic: true }), [quote]);
  useEffect(() => {
    if (!automaticText) return;
    copyTimer.current = setTimeout(() => { void copy(automaticText); }, 180);
    return () => clearTimeout(copyTimer.current);
  }, [quote, automaticText, copy]);
  useEffect(() => { const onKey = e => { if (e.key === 'Insert' && priceText) { e.preventDefault(); void copy(priceText); } }; window.addEventListener('keydown', onKey); return () => window.removeEventListener('keydown', onKey); }, [priceText, copy]);
  return <section className="studio-card quote-card">
    <div className="section-heading"><span className="step-number">02</span><div><h2>尺寸与报价</h2><p>输入尺寸，即时算价并自动复制</p></div><span className="live-indicator"><i />实时计算</span></div>
    <div className="dimension-label"><label htmlFor="dimensions">地毯尺寸 <span>厘米</span></label><label className="toggle-label"><input type="checkbox" checked={readyMade} onChange={e => onReadyMadeChange(e.target.checked)} /><span className="toggle-track" />现成价格优先</label></div>
    <textarea id="dimensions" className="dimension-input" value={value} onChange={e => onDimensionsChange(e.target.value)} placeholder={'每行一个尺寸：宽*长 或 宽*长*数量\n例如：120*150\n90*200*3'} spellCheck={false} />
    <div className="dimension-help"><span><kbd>*</kbd> 连接宽长，第三个数代表数量</span><button className="text-button" onClick={() => onDimensionsChange(value ? `${value}\n120*150` : '120*150')}>试填示例 <FiArrowUpRight /></button></div>
    {quote.rows.some(r => r.splicing) && <div className="notice warning">{selectedProduct?.['名称']}最大宽度 {selectedProduct?.['最大宽度'] || 200} 厘米，超宽尺寸需要拼接。</div>}
    {typeof selectedProduct?.['单位重量'] === 'object' && <label className="weight-option"><input type="checkbox" checked={squareStyle} onChange={e => setSquareStyle(e.target.checked)} />使用方格款式重量（{selectedProduct['单位重量']['方格款式']} kg / ㎡）</label>}
    {quote.rows.length ? <QuoteLines rows={quote.rows} /> : <div className="quote-empty"><div className="empty-icon"><FiLayers /></div><p>报价，从一个尺寸开始</p><span>选好材质，输入尺寸，即可查看计算明细</span></div>}
    <SpotlightCard className="quote-total" spotlightColor="#ed994f" intensity={0.06} borderGlow={0.18} proximity={0} flare={false}><div className="quote-meta"><span>共 <strong>{quote.quantity}</strong> 张</span><span><strong>{quote.area.toFixed(2)}</strong> ㎡</span>{quote.weight > 0 && <span>{quote.weight.toFixed(2)} kg</span>}</div><div className="quote-amount"><div><span>预估总价</span><small>人民币 / CNY</small></div><strong><small>¥</small>{money(quote.total)}</strong></div><div className="quote-actions"><button className="primary-button" disabled={!priceText} onClick={() => copy(priceText)}><FiCopy />复制所有尺寸价格 <kbd>Insert</kbd></button><button className="icon-action" title="添加到多产品" aria-label="添加到多产品" disabled={!quote.quantity} onClick={() => { setBasket(items => [...items, { ...quote, id: crypto.randomUUID(), name: selectedProduct?.['名称'] || '自定义材质' }]); }}><FiPlus /></button></div></SpotlightCard>
    {basket.length > 0 && <div className="basket"><div className="quote-lines-heading"><span>多产品汇总 · {basket.length} 项</span><button className="text-button" onClick={() => setBasket([])}>清空</button></div>{basket.map(item => <div className="basket-row" key={item.id}><span>{item.name}<small>{item.quantity} 张 / {item.area.toFixed(2)} ㎡</small></span><strong>¥{money(item.total)}</strong><button className="text-button" aria-label={`移除${item.name}`} onClick={() => setBasket(items => items.filter(r => r.id !== item.id))}><FiTrash2 /></button></div>)}<button className="basket-total" onClick={() => copy(`总价格是${Math.floor(basket.reduce((s, r) => s + r.total, 0))}元`)}><span><FiCheck />合计金额</span><strong>¥{money(basket.reduce((s, r) => s + r.total, 0))} <FiCopy /></strong></button></div>}
    {copyError && <p className="inline-error" role="alert">{copyError}</p>}
    <p className="copy-policy" title="自动复制：单张现成价保留小数，单张定制价取整；多张明细保留两位小数，总价取整。点击复制或按 Insert 保留小数。"><FiCheck />自动复制已开启 · 点击复制保留小数</p>
  </section>;
}
