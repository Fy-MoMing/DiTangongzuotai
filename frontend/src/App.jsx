import React, { lazy, Suspense, useCallback, useEffect, useState } from 'react';
import { FiGrid, FiImage, FiList, FiSettings, FiArrowUpRight, FiCheckCircle, FiSearch, FiMoon, FiSun, FiChevronDown } from 'react-icons/fi';
import defaults from '../../config/prices.json';
import { normalizePrices } from '../../config/normalize-prices.mjs';
import MaterialPicker from './components/MaterialPicker';
import QuoteCalculator from './components/QuoteCalculator';
import WorkspaceGreeting, { LaunchGreeting } from './components/WorkspaceGreeting';
import SoftwareUpdates from './components/SoftwareUpdates';
import './styles/studio.css';
import './styles/linear.css';

const PriceTable = lazy(() => import('./components/PriceTable'));
const PriceSettings = lazy(() => import('./components/PriceSettings'));
const ImageEditor = lazy(() => import('./components/ImageEditor'));

const pages = [
  { id: 'calculator', label: '地毯价格计算', icon: FiGrid, title: '专注此刻，从容报价。', subtitle: '选择材质，输入尺寸。每一份报价，即刻就绪。' },
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
  useEffect(() => {
    if (pageId !== 'calculator') return;
    const onMaterialKey = event => {
      if (event.defaultPrevented || event.isComposing || event.keyCode === 229 || event.repeat || event.ctrlKey || event.altKey || event.metaKey || event.shiftKey) return;
      const materialId = /^[1-9]$/.test(event.key) ? event.key : /^Numpad([1-9])$/.exec(event.code)?.[1];
      if (!materialId) return;
      const target = event.target;
      if (target instanceof HTMLElement && (target.isContentEditable || target.closest('input, textarea, select, [role="textbox"], [role="spinbutton"], [role="combobox"], [role="dialog"], #software-update-panel'))) return;
      const product = config['产品'].find(item => item['编号'] === materialId && item['支持定制']);
      if (!product) return;
      event.preventDefault();
      setSelectedId(product['编号']);
      setGlobalSearch('');
    };
    window.addEventListener('keydown', onMaterialKey);
    return () => window.removeEventListener('keydown', onMaterialKey);
  }, [pageId, config]);
  const reload = useCallback(async () => {
    try {
      const next = window.desktop?.getPrices ? await window.desktop.getPrices() : (() => {
        const stored = JSON.parse(localStorage.getItem('priceConfig') || 'null') || defaults;
        const config = normalizePrices(stored, defaults);
        if (config !== stored) {
          if (!stored['产品'].some(product => product['编号'] === '9' && product['名称'] === '菠萝纹') && !localStorage.getItem('priceConfigBefore145')) localStorage.setItem('priceConfigBefore145', JSON.stringify(stored));
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
    <div className="night-titlebar"><span className="titlebar-appmark"><FiGrid />地毯工作台</span><span className="titlebar-status"><FiCheckCircle />{snapshot.error ? '使用已保留的价格' : '价格配置已同步'}</span></div>
    <div className="studio-shell">
    <aside className="studio-sidebar">
      <div className="topbar-brand"><span className="brand-symbol"><FiGrid /></span><strong>地毯工作台</strong><FiChevronDown /></div>
      <label className="global-search"><FiSearch /><input aria-label="全局搜索材质" placeholder="搜索材质…" value={globalSearch} onChange={e => { setGlobalSearch(e.target.value); navigate('calculator'); }} /></label>
      <span className="sidebar-label">工作空间</span>
      <nav aria-label="工作台导航">{pages.map(p => <React.Fragment key={p.id}>{p.id === 'settings' && <><div className="rail-divider" /><span className="sidebar-label">管理</span></>}<button aria-label={p.label} aria-current={pageId === p.id ? 'page' : undefined} title={p.label} className={`nav-item ${pageId === p.id ? 'active' : ''}`} onClick={() => navigate(p.id)}><p.icon /><span>{p.label}</span></button></React.Fragment>)}</nav>
      <div className="rail-bottom"><button className="rail-mode" aria-label={theme === 'dark' ? '切换到日间主题' : '切换到夜间主题'} title={theme === 'dark' ? '切换到日间主题' : '切换到夜间主题'} aria-pressed={theme === 'light'} onClick={() => setTheme(current => current === 'dark' ? 'light' : 'dark')}><span className={theme === 'light' ? 'selected' : ''}><FiSun />日间</span><span className={theme === 'dark' ? 'selected' : ''}><FiMoon />夜间</span></button><SoftwareUpdates /></div>
    </aside>
    <main className="studio-main">
    <header className="studio-topbar"><div className="workspace-breadcrumb"><FiGrid /><span>工作台</span><i>/</i><strong>{page.label}</strong></div><div className="topbar-tools"><WorkspaceGreeting /><button className="topbar-config" onClick={() => navigate('settings')}><FiSettings />价格配置</button></div></header>
    <div className="workspace-content" ref={workspaceScroll}><div className="page-heading"><div className="page-heading-copy"><LaunchGreeting /><h1>{page.title}</h1><p>{page.subtitle}</p></div><div className="workspace-stats" hidden={pageId !== 'calculator'}><div className="stat-card balance-card"><div><span>{customPrice ? '临时单价' : selectedProduct?.['名称']} · 当前单价</span><strong>¥{customPrice || selectedProduct?.['单价'] || 0}<small> / ㎡</small></strong></div></div><div className="stat-card"><div><span>现成规格</span><strong>{config['现成尺寸价格'].length}<small> 款</small></strong></div></div></div></div>
    {snapshot.error && pageId !== 'settings' && <div role="alert" className="notice warning">{snapshot.error}<button className="text-button" onClick={() => navigate('settings')}>检查配置 <FiArrowUpRight /></button></div>}
    <div hidden={pageId !== 'calculator'}><div className="calculator-layout"><MaterialPicker products={config['产品']} selectedProduct={selectedProduct} onSelectProduct={p => setSelectedId(p['编号'])} customPrice={customPrice} onCustomPriceChange={setCustomPrice} searchText={globalSearch} onSearchTextChange={setGlobalSearch} /><QuoteCalculator config={config} selectedProduct={selectedProduct} customPrice={customPrice} readyMade={readyMade} onReadyMadeChange={setReadyMade} /></div></div>
    <div hidden={pageId !== 'images'}>{openedPages.has('images') && <Suspense fallback={<div className="studio-card page-loading">正在打开图片工具…</div>}><div className="studio-card studio-image-editor"><ImageEditor /></div></Suspense>}</div>
    <div hidden={pageId !== 'table'}>{openedPages.has('table') && <Suspense fallback={<div className="studio-card page-loading">正在打开价格表…</div>}><PriceTable config={config} /></Suspense>}</div>
    <div hidden={pageId !== 'settings'}>{openedPages.has('settings') && <Suspense fallback={<div className="studio-card page-loading">正在打开价格配置…</div>}><PriceSettings snapshot={snapshot} onReload={reload} onSave={save} /></Suspense>}</div>
    <footer className="workspace-footer"><span><FiCheckCircle />{snapshot.error ? '配置未应用 · 保留上一份有效价格' : '价格配置已同步 · 数据保存在本机'}</span><span>本地处理 · 随时就绪</span></footer></div></main></div>
  </div>;
}
export default function App() { return <Workspace />; }
