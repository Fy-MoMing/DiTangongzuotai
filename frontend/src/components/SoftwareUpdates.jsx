import React, { useCallback, useEffect, useRef, useState } from 'react';
import { FiArrowUpRight, FiCheckCircle, FiDownload, FiRefreshCw, FiX } from 'react-icons/fi';

const initialStatus = { currentVersion: __APP_VERSION__, status: 'idle', latestVersion: null, notes: '', checkedAt: null, error: null };

export default function SoftwareUpdates() {
  const [state, setState] = useState(initialStatus);
  const [open, setOpen] = useState(false);
  const [actionError, setActionError] = useState('');
  const [autoCheck, setAutoCheck] = useState(() => localStorage.getItem('studioAutoCheckUpdates') !== 'false');
  const root = useRef(null);
  const checking = state.status === 'checking';
  const available = state.status === 'available';
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
    return () => clearTimeout(timer);
  }, [autoCheck, check]);
  useEffect(() => {
    if (!open) return;
    const closeOutside = event => { if (!root.current?.contains(event.target)) setOpen(false); };
    const closeOnEscape = event => { if (event.key === 'Escape') { setOpen(false); root.current?.querySelector('.rail-version')?.focus(); } };
    document.addEventListener('pointerdown', closeOutside);
    document.addEventListener('keydown', closeOnEscape);
    return () => { document.removeEventListener('pointerdown', closeOutside); document.removeEventListener('keydown', closeOnEscape); };
  }, [open]);

  const download = async () => {
    setActionError('');
    try { await window.desktop?.downloadUpdate(); }
    catch { setActionError('无法打开下载地址，请稍后重试。'); }
  };
  const showRelease = async () => {
    setActionError('');
    try { await window.desktop?.openUpdateRelease(); }
    catch { setActionError('无法打开发布页，请稍后重试。'); }
  };
  const description = checking ? '正在连接 GitHub…' : available ? `发现新版本 v${state.latestVersion}` : state.status === 'current' ? '当前已是最新版本' : state.status === 'error' ? state.error : state.status === 'unconfigured' ? '连接发布仓库后即可检查更新' : '随时检查，保持最新';

  return <div className="software-updates" ref={root}>
    <button className={`rail-version${available ? ' has-update' : ''}`} aria-label="检查软件更新" aria-expanded={open} aria-controls="software-update-panel" title={`当前版本 v${state.currentVersion} · 检查更新`} onClick={() => setOpen(value => !value)}><small><FiRefreshCw />检查更新</small><span className="rail-version-value">v{state.currentVersion}{available && <i />}</span></button>
    {open && <section id="software-update-panel" className="update-panel" aria-label="软件更新">
      <div className="update-panel-heading"><span><FiDownload />软件更新</span><button className="update-close" aria-label="关闭更新面板" onClick={() => setOpen(false)}><FiX /></button></div>
      <div className={`update-summary${available ? ' available' : ''}`}><span className="update-status-icon">{checking ? <FiRefreshCw className="update-spinning" /> : available ? <FiDownload /> : <FiCheckCircle />}</span><div><strong>{description}</strong><small>当前版本 v{state.currentVersion} · {state.portable ? '免安装版' : '安装版'}</small></div></div>
      {available && state.notes && <div className="update-notes"><span>这次更新</span><p>{state.notes}</p></div>}
      {available && <><button className="primary-button update-download" onClick={download}><FiDownload />{state.downloadUrl ? '下载新版' : '前往发布页下载'}<FiArrowUpRight /></button><p className="update-install-note">{state.portable ? '下载完成后，退出软件并替换旧版 exe。' : '下载完成后，退出软件并运行新版安装包。'}</p></>}
      {actionError && <p className="inline-error" role="alert">{actionError}</p>}
      <div className="update-panel-actions"><button className="secondary-button" disabled={checking || state.status === 'unconfigured' || !window.desktop} onClick={() => { void check(); }}><FiRefreshCw className={checking ? 'update-spinning' : ''} />{checking ? '正在检查…' : '检查更新'}</button><button className="text-button" disabled={!state.repository} onClick={showRelease}>GitHub 发布页<FiArrowUpRight /></button></div>
      <label className="update-auto-check"><input type="checkbox" checked={autoCheck} onChange={event => setAutoCheck(event.target.checked)} />启动后自动检查更新<span>后台检查</span></label>
      {state.checkedAt && <div className="update-last-check">上次检查 {new Date(state.checkedAt).toLocaleString('zh-CN', { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</div>}
    </section>}
  </div>;
}
