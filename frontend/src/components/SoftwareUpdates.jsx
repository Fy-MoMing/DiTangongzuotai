import React, { useCallback, useEffect, useRef, useState } from 'react';
import { FiArrowUpRight, FiCheckCircle, FiDownload, FiRefreshCw, FiX } from 'react-icons/fi';
import UpdatePrompt from './UpdatePrompt';

const initialStatus = { currentVersion: __APP_VERSION__, status: 'idle', latestVersion: null, notes: '', checkedAt: null, error: null };

export default function SoftwareUpdates() {
  const [state, setState] = useState(initialStatus);
  const [open, setOpen] = useState(false);
  const [ask, setAsk] = useState(false);
  const deferred = useRef(null);
  const [actionError, setActionError] = useState('');
  const [autoCheck, setAutoCheck] = useState(() => localStorage.getItem('studioAutoCheckUpdates') !== 'false');
  const root = useRef(null);
  const checking = state.status === 'checking';
  const downloading = state.status === 'downloading';
  const ready = state.status === 'ready';
  const installing = state.status === 'installing';
  const available = ['available', 'downloading', 'download-error', 'ready', 'installing'].includes(state.status);
  const check = useCallback(async (force = true) => {
    if (!window.desktop?.checkUpdates) return;
    setActionError('');
    try { setState(await window.desktop.checkUpdates(force)); }
    catch { setActionError('暂时无法检查更新，请稍后重试。'); }
  }, []);

  useEffect(() => {
    let mounted = true;
    window.desktop?.getUpdateStatus().then(value => { if (mounted) setState(value); }).catch(() => {});
    const unsubscribe = window.desktop?.onUpdateStatus(value => { if (mounted) setState(value); });
    return () => { mounted = false; unsubscribe?.(); };
  }, []);
  useEffect(() => {
    localStorage.setItem('studioAutoCheckUpdates', String(autoCheck));
    if (!autoCheck) return;
    const timer = setTimeout(() => { void check(false); }, 8000);
    const interval = setInterval(() => { void check(false); }, 15 * 60 * 1000);
    return () => { clearTimeout(timer); clearInterval(interval); };
  }, [autoCheck, check]);
  useEffect(() => {
    if (!open || ask) return;
    const closeOutside = event => { if (!root.current?.contains(event.target)) setOpen(false); };
    const closeOnEscape = event => { if (event.key === 'Escape') { setOpen(false); root.current?.querySelector('.rail-version')?.focus(); } };
    document.addEventListener('pointerdown', closeOutside);
    document.addEventListener('keydown', closeOnEscape);
    return () => { document.removeEventListener('pointerdown', closeOutside); document.removeEventListener('keydown', closeOnEscape); };
  }, [open, ask]);
  useEffect(() => {
    if (ready && deferred.current !== state.latestVersion) { setOpen(false); setAsk(true); }
  }, [ready, state.latestVersion]);
  const later = useCallback(() => { deferred.current = state.latestVersion; setAsk(false); }, [state.latestVersion]);

  const download = async () => {
    setActionError('');
    try { const next = await window.desktop?.downloadUpdate(); if (next) setState(next); }
    catch { setActionError('下载失败，请检查网络后重试。'); }
  };
  const showRelease = async () => {
    setActionError('');
    try { await window.desktop?.openUpdateRelease(); }
    catch { setActionError('无法打开发布页，请稍后重试。'); }
  };
  const description = checking ? '正在检查新版本…' : downloading ? `正在后台下载 · ${Math.floor(state.progress?.percent || 0)}%` : ready ? `v${state.latestVersion} 已准备就绪` : installing ? '正在启动更新…' : state.status === 'download-error' ? '更新下载未完成' : available ? `发现新版本 v${state.latestVersion}` : state.status === 'current' ? '当前已是最新版本' : state.status === 'error' ? state.error : '保持最新，从容工作';

  return <div className="software-updates" ref={root}>
    <button className={`rail-version${available ? ' has-update' : ''}`} aria-label="检查软件更新" aria-expanded={open} aria-controls="software-update-panel" title={`当前版本 v${state.currentVersion} · 检查更新`} onClick={() => setOpen(value => !value)}><small><FiRefreshCw />{downloading ? `下载 ${Math.floor(state.progress?.percent || 0)}%` : ready ? '新版已就绪' : '检查更新'}</small><span className="rail-version-value">v{state.currentVersion}{available && <i />}</span></button>
    {open && <section id="software-update-panel" className="update-panel" aria-label="软件更新">
      <div className="update-panel-heading"><span><FiDownload />软件更新</span><button className="update-close" aria-label="关闭更新面板" onClick={() => setOpen(false)}><FiX /></button></div>
      <div className={`update-summary${available ? ' available' : ''}`}><span className="update-status-icon">{checking ? <FiRefreshCw className="update-spinning" /> : available ? <FiDownload /> : <FiCheckCircle />}</span><div><strong>{description}</strong><small>当前版本 v{state.currentVersion} · {state.portable ? '免安装版' : '安装版'}</small></div></div>
      {available && state.notes && <div className="update-notes"><span>这次更新</span><p>{state.notes}</p></div>}
      {downloading && <div className="update-progress"><progress aria-label="更新下载进度" max="100" value={state.progress?.total ? state.progress.percent : undefined} /><span>国内加速下载中，不影响当前工作</span></div>}
      {ready && <button className="primary-button update-download" onClick={() => { setOpen(false); setAsk(true); }}><FiCheckCircle />查看更新并安装<FiArrowUpRight /></button>}
      {state.status === 'download-error' && <button className="primary-button update-download" onClick={download}><FiDownload />重新下载</button>}
      {available && !state.downloadUrl && <button className="primary-button update-download" onClick={showRelease}>前往发布页下载<FiArrowUpRight /></button>}
      <p className="update-install-note">自动下载并校验文件，安装前会征求你的确认。</p>
      {state.status === 'download-error' && <p className="inline-error" role="alert">{state.error}</p>}
      {actionError && <p className="inline-error" role="alert">{actionError}</p>}
      <div className="update-panel-actions"><button className="secondary-button" disabled={checking || downloading || ready || installing || state.status === 'unconfigured' || !window.desktop} onClick={() => { void check(); }}><FiRefreshCw className={checking ? 'update-spinning' : ''} />{checking ? '正在检查…' : '检查更新'}</button><button className="text-button" disabled={!state.repository} onClick={showRelease}>发布页<FiArrowUpRight /></button></div>
      <label className="update-auto-check"><input type="checkbox" checked={autoCheck} onChange={event => setAutoCheck(event.target.checked)} />启动后自动检查更新<span>后台检查</span></label>
      {state.checkedAt && <div className="update-last-check">上次检查 {new Date(state.checkedAt).toLocaleString('zh-CN', { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</div>}
    </section>}
    {ask && <UpdatePrompt state={state} onLater={later} />}
  </div>;
}
