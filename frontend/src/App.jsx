import React, { lazy, Suspense, useCallback, useEffect, useState } from 'react';
import { FiGrid, FiImage, FiList, FiSettings, FiArrowUpRight, FiCheckCircle, FiTag, FiBox, FiSearch, FiMoon, FiSun, FiCommand } from 'react-icons/fi';
import defaults from '../../config/prices.json';
import { normalizePrices } from '../../config/normalize-prices.mjs';
import MaterialPicker from './components/MaterialPicker';
import QuoteCalculator from './components/QuoteCalculator';
import WorkspaceGreeting from './components/WorkspaceGreeting';
import SoftwareUpdates from './components/SoftwareUpdates';
import './styles/studio.css';

const PriceTable = lazy(() => import('./components/PriceTable'));
const PriceSettings = lazy(() => import('./components/PriceSettings'));
const ImageEditor = lazy(() => import('./components/ImageEditor'));

const pages = [
  { id: 'calculator', label: '地毯价格计算', icon: FiGrid, title: '报价控制台', subtitle: '选好材质，输入尺寸。每一份报价，即刻就绪。' },
  { id: 'images', label: '图片编辑工具', icon: FiImage, title: '图片工作室', subtitle: '把尺寸放进画面，让每一次沟通更直观。' },
  { id: 'table', label: '尺寸价格表', icon: FiList, title: '规格与价格', subtitle: '所有标准规格，一处收录。精准匹配，快速报价。' },
  { id: 'settings', label: '价格配置', icon: FiSettings, title: '价格管理中心', subtitle: '从材质单价到现成规格，自由定义你的价格体系。' }
];
function Workspace() {
  const [theme, setTheme] = useState(() => localStorage.getItem('studioThemePreference') === 'dark' ? 'dark' : 'light');
  useEffect(() => {
    localStorage.setItem('studioThemePreference', theme);
    document.documentElement.style.colorScheme = theme;
    void window.desktop?.setTheme(theme);
  }, [theme]);
  const [pageId, setPageId] = useState('calculator');
  const [openedPages, setOpenedPages] = useState(() => new Set(['calculator']));
  const navigate = useCallback(id => {
    setOpenedPages(current => current.has(id) ? current : new Set([...current, id]));
    setPageId(id);
  }, []);
  const [globalSearch, setGlobalSearch] = useState('');
  const workspaceScroll = React.useRef(null);
  useEffect(() => { workspaceScroll.current?.scrollTo({ top: 0 }); }, [pageId]);
  const [snapshot, setSnapshot] = useState({ config: defaults, path: '', error: null });
  const [selectedId, setSelectedId] = useState('1');
  const [customPrice, setCustomPrice] = useState(0);
  const [readyMade, setReadyMade] = useState(defaults['现成价格优先']);
  const config = snapshot.config;
  const page = pages.find(p => p.id === pageId);
  const selectedProduct = config['产品'].find(p => p['编号'] === selectedId) || config['产品'].find(p => p['支持定制']);
  const reload = useCallback(async () => {
    try {
      const next = window.desktop?.getPrices ? await window.desktop.getPrices() : (() => {
        const stored = JSON.parse(localStorage.getItem('priceConfig') || 'null') || defaults;
        const config = normalizePrices(stored, defaults);
        if (config !== stored) {
          if (!localStorage.getItem('priceConfigBefore132')) localStorage.setItem('priceConfigBefore132', JSON.stringify(stored));
          localStorage.setItem('priceConfig', JSON.stringify(config));
        }
        return { config, path: '', error: null };
      })();
      setSnapshot(next); setReadyMade(next.config['现成价格优先']);
    } catch (error) { setSnapshot(old => ({ ...old, error: error.message })); }
  }, []);
  useEffect(() => { void reload(); }, [reload]);
  const save = useCallback(async value => {
    const next = window.desktop?.savePrices ? await window.desktop.savePrices(value) : (() => { localStorage.setItem('priceConfig', JSON.stringify(value)); return { config: structuredClone(value), path: '', error: null }; })();
    setSnapshot(next); setReadyMade(value['现成价格优先']);
  }, []);
  return <div className="night-desktop" data-theme={theme}>
    <div className="night-titlebar"><span className="titlebar-appmark"><FiCommand /> 地毯工作台 <small>DESKTOP EDITION</small></span><span className="titlebar-status"><FiCheckCircle />{snapshot.error ? '使用已保留的价格' : '价格配置已同步'}</span></div>
    <header className="studio-topbar"><div className="topbar-brand"><span className="brand-symbol"><i /><i /><i /><i /></span><div><strong>地毯工作台<span>PRO</span></strong><small>CARPET STUDIO</small></div></div><WorkspaceGreeting /><label className="global-search"><FiSearch /><input aria-label="全局搜索材质" placeholder="搜索地毯材质…" value={globalSearch} onChange={e => { setGlobalSearch(e.target.value); navigate('calculator'); }} /><span>搜索</span></label><button className="topbar-config" onClick={() => navigate('settings')}><FiSettings />价格配置<FiArrowUpRight /></button><div className="topbar-local" title="所有报价在本地计算"><span /><span>本地运行</span></div></header>
    <div className="studio-shell"><aside className="studio-sidebar"><button className="rail-mode" aria-label={theme === 'dark' ? '切换到日间主题' : '切换到夜间主题'} title={theme === 'dark' ? '切换到日间主题' : '切换到夜间主题'} aria-pressed={theme === 'light'} onClick={() => setTheme(current => current === 'dark' ? 'light' : 'dark')}>{theme === 'dark' ? <FiMoon /> : <FiSun />}</button><div className="rail-divider" /><nav aria-label="工作台导航">{pages.map(p => <button key={p.id} aria-label={p.label} title={p.label} className={`nav-item ${pageId === p.id ? 'active' : ''}`} onClick={() => navigate(p.id)}><p.icon /><span>{p.label}</span></button>)}</nav><div className="rail-bottom"><span className="rail-signal"><i /><i /><i /></span><SoftwareUpdates /></div></aside>
    <main className="studio-main"><div className="workspace-content" ref={workspaceScroll}><div className="page-heading"><div><div className="page-eyebrow">WORKSPACE <span>/</span> {page.label}</div><h1>{page.title}<span className="page-title-dot" /></h1><p>{page.subtitle}</p></div><div className="heading-indicators"><span><i />实时计算</span><span><FiCheckCircle />本地数据</span></div></div>
    {snapshot.error && pageId !== 'settings' && <div role="alert" className="notice warning">{snapshot.error}<button className="text-button" onClick={() => navigate('settings')}>检查配置 <FiArrowUpRight /></button></div>}
    <div hidden={pageId !== 'calculator'}><div className="workspace-stats"><div className="stat-card balance-card"><span className="stat-icon warm"><FiTag /></span><div><span>当前材质单价</span><strong>¥{customPrice || selectedProduct?.['单价'] || 0}<small> / ㎡</small></strong></div><span className="stat-caption">{customPrice ? '临时单价' : selectedProduct?.['名称']}<FiArrowUpRight /></span></div><div className="stat-card"><span className="stat-icon green"><FiBox /></span><div><span>现成规格收录</span><strong>{config['现成尺寸价格'].length}<small> 款</small></strong></div><span className="stat-caption">价格实时同步</span></div></div><div className="calculator-layout"><MaterialPicker products={config['产品']} selectedProduct={selectedProduct} onSelectProduct={p => setSelectedId(p['编号'])} customPrice={customPrice} onCustomPriceChange={setCustomPrice} searchText={globalSearch} onSearchTextChange={setGlobalSearch} /><QuoteCalculator config={config} selectedProduct={selectedProduct} customPrice={customPrice} readyMade={readyMade} onReadyMadeChange={setReadyMade} /></div></div>
    <div hidden={pageId !== 'images'}>{openedPages.has('images') && <Suspense fallback={<div className="studio-card page-loading">正在打开图片工具…</div>}><div className="studio-card studio-image-editor"><ImageEditor /></div></Suspense>}</div>
    <div hidden={pageId !== 'table'}>{openedPages.has('table') && <Suspense fallback={<div className="studio-card page-loading">正在打开价格表…</div>}><PriceTable config={config} /></Suspense>}</div>
    <div hidden={pageId !== 'settings'}>{openedPages.has('settings') && <Suspense fallback={<div className="studio-card page-loading">正在打开价格配置…</div>}><PriceSettings snapshot={snapshot} onReload={reload} onSave={save} /></Suspense>}</div>
    <footer className="workspace-footer"><span><i />本地处理 · 随时就绪</span><span>CARPET STUDIO <b>精确，让工作更轻盈。</b></span></footer></div></main></div>
  </div>;
}
export default function App() { return <Workspace />; }
