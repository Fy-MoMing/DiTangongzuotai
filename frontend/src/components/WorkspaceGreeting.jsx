import React, { useCallback, useEffect, useState } from 'react';
import { FiCloud, FiCloudRain, FiCloudSnow, FiSun, FiRefreshCw, FiMapPin } from 'react-icons/fi';
import { getLaunchGreeting } from '../utils/greetings';
import { fetchCurrentWeather } from '../../../shared/weather.mjs';

function WorkspaceGreeting() {
  const [greeting] = useState(getLaunchGreeting);
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);
  const refresh = useCallback(async force => {
    setLoading(true);
    try {
      const next = window.desktop?.getWeather ? await window.desktop.getWeather(force) : await fetchCurrentWeather();
      setWeather(next);
    } catch { setWeather({ error: '天气暂不可用' }); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => {
    void refresh(false);
    const interval = setInterval(() => { void refresh(false); }, 15 * 60 * 1000);
    const online = () => { void refresh(true); };
    window.addEventListener('online', online);
    return () => { clearInterval(interval); window.removeEventListener('online', online); };
  }, [refresh]);
  const available = weather && !weather.error;
  const Icon = available ? weather.condition.includes('雪') ? FiCloudSnow : weather.condition.includes('雨') ? FiCloudRain : weather.condition === '晴天' ? FiSun : FiCloud : FiCloud;
  return <div className="topbar-greeting">
    <p className="greeting-copy">{greeting}</p>
    <div className="today-weather" aria-label="今日天气">
      <Icon className={`weather-symbol ${available && weather.condition === '晴天' ? 'sunny' : ''}`} />
      <span className="weather-label">今日天气</span>
      {available ? <>
        <span className="weather-city" title="根据本机公网 IP 查询的城市；IP 定位可能无法精确到区县"><FiMapPin />{weather.city}</span>
        <span className="weather-condition">{weather.condition}</span>
        <strong className="weather-temperature">{weather.temperature}°C</strong>
        {weather.cached && <span className="weather-cached" title="上次获取的天气，联网后会重新更新">上次更新</span>}
      </> : <span className="weather-state">{loading ? '正在查询位置…' : '暂不可用'}</span>}
      <button className={`weather-refresh ${loading ? 'loading' : ''}`} aria-label="刷新天气" title="刷新天气" disabled={loading} onClick={() => { void refresh(true); }}><FiRefreshCw /></button>
    </div>
  </div>;
}

export default React.memo(WorkspaceGreeting);
