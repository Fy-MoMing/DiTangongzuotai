import React, { useEffect, useRef, useState } from 'react';
import { FiArrowRight, FiCheckCircle, FiDownload } from 'react-icons/fi';

export default function UpdatePrompt({ state, onLater }) {
  const root = useRef(null);
  const [error, setError] = useState('');
  const busy = state.status === 'installing';
  useEffect(() => {
    const previous = document.activeElement;
    root.current?.querySelector('button')?.focus();
    const keydown = event => {
      if (event.key === 'Escape' && !busy) { event.preventDefault(); onLater(); }
      if (event.key === 'Tab') {
        const buttons = [...root.current.querySelectorAll('button:not(:disabled)')];
        const first = buttons[0], last = buttons.at(-1);
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
        if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
      }
    };
    document.addEventListener('keydown', keydown);
    return () => { document.removeEventListener('keydown', keydown); previous?.focus(); };
  }, [busy, onLater]);
  const install = async () => {
    setError('');
    try { if (!await window.desktop.installUpdate()) setError('无法启动更新，请重试或前往发布页下载。'); }
    catch { setError('无法启动更新，请稍后重试。'); }
  };
  return <div className="update-prompt-backdrop"><section ref={root} className="update-prompt" role="dialog" aria-modal="true" aria-labelledby="update-prompt-title" aria-describedby="update-prompt-description">
    <div className="update-prompt-icon"><FiDownload /></div><span className="update-eyebrow">为你准备的新版本</span><h2 id="update-prompt-title">更新已就绪，现在安装？</h2><p id="update-prompt-description">地毯工作台 v{state.latestVersion} 已下载并通过校验。{state.portable ? '更新将退出软件、替换程序并重新打开。' : '更新将退出软件并打开安装程序。'}现有价格配置会保留。</p>
    <div className="update-version-route"><span>v{state.currentVersion}</span><FiArrowRight /><strong>v{state.latestVersion}</strong><span className="verified-label"><FiCheckCircle />已校验</span></div>
    {state.notes && <div className="update-notes"><span>本次更新</span><p>{state.notes}</p></div>}
    {(error || state.error) && <p className="inline-error" role="alert">{error || state.error}</p>}
    <div className="update-prompt-actions"><button className="secondary-button" disabled={busy} onClick={onLater}>稍后再说</button><button className="primary-button" disabled={busy} onClick={install}>{busy ? '正在启动…' : '立即更新'}<FiArrowRight /></button></div>
  </section></div>;
}
