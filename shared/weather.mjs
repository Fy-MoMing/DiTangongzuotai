const rainy = new Set([176,185,263,266,281,284,293,296,299,302,305,308,311,314,353,356,359]);
const snowy = new Set([179,227,230,323,326,329,332,335,338,368,371,392,395]);
const sleet = new Set([182,317,320,350,362,365,374,377]);
export function weatherCondition(code) {
  code = Number(code);
  if (code === 113) return '晴天';
  if ([116,119].includes(code)) return '多云';
  if (code === 122) return '阴天';
  if ([143,248,260].includes(code)) return '雾天';
  if (code === 149) return '雾霾';
  if ([200,386,389].includes(code)) return '雷雨';
  if (snowy.has(code)) return '雪天';
  if (sleet.has(code)) return '雨夹雪';
  if (rainy.has(code)) return '雨天';
  return '天气未知';
}

export function isWeatherSnapshot(value) {
  return Boolean(value && typeof value.city === 'string' && value.city.trim() && value.city.length <= 80
    && typeof value.condition === 'string' && value.condition.trim() && value.condition.length <= 20
    && typeof value.temperature === 'number' && Number.isFinite(value.temperature) && value.temperature >= -100 && value.temperature <= 70
    && typeof value.updatedAt === 'number' && Number.isFinite(value.updatedAt));
}

export const WEATHER_LOCATION_METHOD = 'public-ip-v2';

function publicIPv4(value) {
  if (typeof value !== 'string' || !/^\d{1,3}(?:\.\d{1,3}){3}$/.test(value)) return false;
  const parts = value.split('.').map(Number);
  if (parts.some(part => part > 255)) return false;
  const [a,b] = parts;
  return a > 0 && a < 224 && a !== 10 && a !== 127 && !(a === 169 && b === 254)
    && !(a === 172 && b >= 16 && b <= 31) && !(a === 192 && b === 168) && !(a === 100 && b >= 64 && b <= 127);
}

async function getPublicIP(fetchImpl) {
  for (const url of ['https://myip.ipip.net/', 'https://checkip.amazonaws.com/']) {
    try {
      const response = await fetchImpl(url, { signal: AbortSignal.timeout(5000), headers: { Accept: 'text/plain' } });
      if (!response.ok) continue;
      const text = await response.text();
      const address = text.match(/\b\d{1,3}(?:\.\d{1,3}){3}\b/)?.[0];
      if (publicIPv4(address)) return address;
    } catch { /* Try the other public-IP service without changing to proxy-based geolocation. */ }
  }
  throw new Error('Public IP unavailable');
}

export async function fetchCurrentWeather(fetchImpl = globalThis.fetch, now = Date.now, locationFetchImpl = fetchImpl) {
  const json = async (url, timeout, request = fetchImpl) => {
    const response = await request(url, { signal: AbortSignal.timeout(timeout), headers: { Accept: 'application/json' } });
    if (!response.ok) throw new Error('Weather service unavailable');
    return response.json();
  };
  const address = await getPublicIP(locationFetchImpl);
  const location = await json(`https://ipwho.is/${address}?lang=zh-CN`, 8000, locationFetchImpl);
  const latitude = Number(location.latitude), longitude = Number(location.longitude);
  const city = typeof location.city === 'string' && location.city.trim() ? location.city.trim() : location.region?.trim();
  if (location.success !== true || (location.ip && location.ip !== address) || !city || [location.latitude,location.longitude].some(value => value == null || String(value).trim() === '') || !Number.isFinite(latitude) || !Number.isFinite(longitude)
    || latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) throw new Error('Location unavailable');
  const snapshot = (rawTemperature, condition) => {
    if (rawTemperature === undefined || rawTemperature === null || String(rawTemperature).trim() === '') throw new Error('Temperature unavailable');
    const result = { city, condition, temperature: Number(rawTemperature), updatedAt: now(), locationMethod: WEATHER_LOCATION_METHOD };
    if (!isWeatherSnapshot(result)) throw new Error('Invalid weather response');
    return result;
  };
  try {
    const weather = await json(`https://wttr.in/${latitude},${longitude}?format=j1&lang=zh-cn`, 8000);
    const current = weather.current_condition?.[0];
    return snapshot(current?.temp_C, weatherCondition(current?.weatherCode));
  } catch {
    const weather = await json(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,weather_code`, 10000);
    return snapshot(weather.current?.temperature_2m, openMeteoCondition(weather.current?.weather_code));
  }
}

function openMeteoCondition(code) {
  if (code === 0) return '晴天';
  if ([1,2].includes(code)) return '多云';
  if (code === 3) return '阴天';
  if ([45,48].includes(code)) return '雾天';
  if ([51,53,55,56,57,61,63,65,66,67,80,81,82].includes(code)) return '雨天';
  if ([71,73,75,77,85,86].includes(code)) return '雪天';
  if ([95,96,99].includes(code)) return '雷雨';
  return '天气未知';
}
