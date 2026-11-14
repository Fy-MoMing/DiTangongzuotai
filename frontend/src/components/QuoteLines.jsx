import React, { memo, useLayoutEffect, useRef, useState } from 'react';
import { money } from '../utils/format';

const ROW_HEIGHT = 52;
const WINDOW_SIZE = 18;
function QuoteLines({ rows }) {
  const [scrollTop, setScrollTop] = useState(0);
  const scroll = useRef(null);
  const virtual = rows.length > 80;
  const start = virtual ? Math.min(Math.max(0, Math.floor((scrollTop - 40) / ROW_HEIGHT) - 4), Math.max(0, rows.length - WINDOW_SIZE)) : 0;
  const visible = virtual ? rows.slice(start, start + WINDOW_SIZE) : rows;
  const end = start + visible.length;
  useLayoutEffect(() => { setScrollTop(0); if (scroll.current) scroll.current.scrollTop = 0; }, [rows]);
  const spacer = height => <tr aria-hidden="true"><td colSpan={5} style={{ height, padding: 0, border: 0 }} /></tr>;
  return <div className="quote-lines">
    <div className="quote-lines-heading"><span>报价明细</span><span>{rows.filter(row => row.valid).length} 组尺寸</span></div>
    <div ref={scroll} className={`table-scroll ${virtual ? 'quote-virtual-scroll' : ''}`} onScroll={virtual ? event => setScrollTop(event.currentTarget.scrollTop) : undefined}>
      <table aria-rowcount={rows.length + 1}><thead><tr><th>尺寸 / cm</th><th>数量</th><th>面积</th><th>单价</th><th className="align-right">金额</th></tr></thead><tbody>
        {start > 0 && spacer(start * ROW_HEIGHT)}
        {visible.map((row, offset) => <tr key={start + offset} aria-rowindex={start + offset + 2}>
          <td><strong>{row.size || row.raw}</strong>{row.readyMade && <span className="row-tag">现成价</span>}{row.narrow && <span className="row-tag muted">窄幅价</span>}</td>
          <td>{row.quantity} 张</td><td>{row.valid ? `${row.area.toFixed(2)} ㎡` : '—'}</td>
          <td>{row.valid ? <span className="quote-unit-price">¥{money(row.unitPrice)}<small> / {row.priceUnit}</small></span> : '—'}</td>
          <td className="align-right">{row.valid ? <strong>¥{money(row.price)}</strong> : <span className="error-text">{row.error}</span>}</td>
        </tr>)}
        {end < rows.length && spacer((rows.length - end) * ROW_HEIGHT)}
      </tbody></table>
    </div>
  </div>;
}
export default memo(QuoteLines);
