const fs = require('node:fs/promises');
const path = require('node:path');

async function createWeatherService({ cachePath, fetchImpl = globalThis.fetch, locationFetchImpl = fetchImpl, now = Date.now }) {
  const { fetchCurrentWeather, isWeatherSnapshot, WEATHER_LOCATION_METHOD } = await import('../shared/weather.mjs');
  let cached;
  try {
    const saved = JSON.parse(await fs.readFile(cachePath, 'utf8'));
    if (isWeatherSnapshot(saved) && saved.locationMethod === WEATHER_LOCATION_METHOD) cached = saved;
  } catch { /* The weather can start without a cache. */ }
  let pending, lastResult, lastAttempt;
  const recentCache = () => cached && now() - cached.updatedAt >= -300000 && now() - cached.updatedAt < 2 * 60 * 60 * 1000;
  async function update() {
    try {
      const weather = await fetchCurrentWeather(fetchImpl, now, locationFetchImpl);
      cached = weather;
      try {
        await fs.mkdir(path.dirname(cachePath), { recursive: true });
        await fs.writeFile(`${cachePath}.tmp`, JSON.stringify(weather));
        await fs.rename(`${cachePath}.tmp`, cachePath);
      } catch { /* A cache write failure must not hide live weather. */ }
      lastResult = { ...weather, cached: false, error: null };
    } catch {
      lastResult = recentCache() ? { ...cached, cached: true, error: null } : { error: '天气暂不可用', cached: false };
    }
    return lastResult;
  }
  function getWeather(force = false) {
    if (pending) return pending;
    if (!force && lastResult && now() - lastAttempt < (lastResult.error || lastResult.cached ? 60000 : 15 * 60 * 1000)) return Promise.resolve(lastResult);
    lastAttempt = now();
    pending = update().finally(() => { pending = null; });
    return pending;
  }
  return { getWeather };
}

module.exports = { createWeatherService };
