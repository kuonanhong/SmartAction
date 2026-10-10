import { locations } from '../data/locations.js';

// These functions perform no network requests or permission prompts on import.
// Call getPosition/findNearby only from the user's explicit location button.
const photoCache = new Map();
const languageCode = lang => String(lang || 'en').toLowerCase().startsWith('zh') ? (String(lang).toLowerCase().includes('cn')?'zh-CN':'zh-TW') : String(lang || 'en').split('-')[0];
const shortLanguage = lang => String(lang || 'en').split('-')[0].toLowerCase();

function validPosition(position) {
  const lat = Number(position?.lat), lng = Number(position?.lng);
  if (!Number.isFinite(lat) || !Number.isFinite(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
    throw new TypeError('Invalid latitude or longitude');
  }
  return { lat, lng };
}

export function distanceKm(a, b) {
  a = validPosition(a); b = validPosition(b);
  const rad = value => value * Math.PI / 180;
  const dLat = rad(b.lat - a.lat), dLng = rad(b.lng - a.lng);
  const k = Math.sin(dLat / 2) ** 2 + Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 6371.0088 * 2 * Math.atan2(Math.sqrt(k), Math.sqrt(Math.max(0, 1 - k)));
}

export function mapsEmbedUrl(place, lang = 'en') {
  const { lat, lng } = validPosition(place);
  const url = new URL('https://maps.google.com/maps');
  url.search = new URLSearchParams({ q: `${lat},${lng}`, z: '15', output: 'embed', hl: languageCode(lang) });
  return url.href;
}

export function mapsLink(place, lang = 'en') {
  const { lat, lng } = validPosition(place);
  const url = new URL('https://www.google.com/maps/search/');
  url.search = new URLSearchParams({ api: '1', query: `${lat},${lng}`, hl: languageCode(lang) });
  return url.href;
}

export function nearbyMapsLink(position, lang = 'en', kind = 'dojo') {
  const { lat, lng } = validPosition(position);
  const words = kind === 'dojo' ? 'martial arts dojo' : 'parks tourist attractions';
  const url = new URL('https://www.google.com/maps/search/');
  url.search = new URLSearchParams({ api: '1', query: `${words} near ${lat},${lng}`, hl: languageCode(lang) });
  return url.href;
}

export function getPosition() {
  return new Promise((resolve, reject) => {
    if (!globalThis.navigator?.geolocation) return reject(new Error('Geolocation is not supported on this device.'));
    if (globalThis.isSecureContext === false) return reject(new Error('Location requires HTTPS or localhost.'));
    navigator.geolocation.getCurrentPosition(
      result => resolve({ lat: result.coords.latitude, lng: result.coords.longitude, accuracy: result.coords.accuracy }),
      error => {
        const messages = { 1: 'Location permission was denied.', 2: 'Your location is unavailable.', 3: 'Location request timed out.' };
        const failure = new Error(messages[error.code] || error.message || 'Location request failed.');
        failure.code = error.code;
        reject(failure);
      },
      { enableHighAccuracy: false, timeout: 12000, maximumAge: 60000 }
    );
  });
}

async function jsonFetch(url, options = {}, timeout = 10000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);
  try {
    const response = await fetch(url, { credentials: 'omit', referrerPolicy: 'no-referrer', ...options, signal: controller.signal });
    if (!response.ok) throw new Error(`Location service returned HTTP ${response.status}`);
    const json = await response.json();
    if (json.error) throw new Error(json.error.info || 'Location service error');
    return json;
  } finally {
    clearTimeout(timer);
  }
}

function plainText(value) {
  if (typeof DOMParser !== 'undefined') {
    const parsed = new DOMParser().parseFromString(String(value || ''), 'text/html');
    return parsed.body.textContent.trim();
  }
  return String(value || '').replace(/<[^>]*>/g, '').replace(/&amp;/g, '&').trim();
}

async function commonsPhoto(fileTitle) {
  if (!/^File:.+\.(?:jpe?g|png|webp)$/i.test(fileTitle || '')) return null;
  if (photoCache.has(fileTitle)) return photoCache.get(fileTitle);
  const pending = (async () => {
    const url = new URL('https://commons.wikimedia.org/w/api.php');
    url.search = new URLSearchParams({ action: 'query', format: 'json', origin: '*', titles: fileTitle, prop: 'imageinfo', iiprop: 'url|extmetadata', iiurlwidth: '1280' });
    const data = await jsonFetch(url, {}, 7000);
    const page = Object.values(data.query?.pages || {})[0];
    const info = page?.imageinfo?.[0];
    if (!info) return null;
    const meta = info.extmetadata || {};
    const license = plainText(meta.LicenseShortName?.value);
    // Do not use non-commercial, no-derivatives, fair-use, or unknown licenses.
    if (!/^(?:CC BY(?:-SA)? (?:2\.0|2\.5|3\.0|4\.0)(?: [a-z]+)?|CC0|Public domain)$/i.test(license)) return null;
    const photo = info.thumburl || info.url;
    if (!/^https:\/\/(?:upload|thumb)\.wikimedia\.org\//.test(photo || '')) return null;
    let licenseUrl = meta.LicenseUrl?.value;
    if (!licenseUrl && license === 'Public domain') licenseUrl = 'https://commons.wikimedia.org/wiki/Commons:Public_domain';
    if (!licenseUrl && license === 'CC0') licenseUrl = 'https://creativecommons.org/publicdomain/zero/1.0/';
    if (!/^https?:\/\/(?:creativecommons\.org|commons\.wikimedia\.org)\//.test(licenseUrl || '')) return null;
    const author = plainText(meta.Attribution?.value) || plainText(meta.Artist?.value);
    if (!author && !/^(CC0|Public domain)$/i.test(license)) return null;
    return { photo, photoCredit: { author: author || 'See source file page', license, licenseUrl: licenseUrl.replace(/^http:/, 'https:'), url: info.descriptionurl, fileTitle } };
  })().catch(() => null);
  photoCache.set(fileTitle, pending);
  return pending;
}

async function linkedPhoto(tags) {
  if (/^File:/i.test(tags.wikimedia_commons || '')) return commonsPhoto(tags.wikimedia_commons);
  if (!/^Q\d+$/.test(tags.wikidata || '')) return null;
  try {
    const url = new URL('https://www.wikidata.org/w/api.php');
    url.search = new URLSearchParams({ action: 'wbgetentities', ids: tags.wikidata, props: 'claims', format: 'json', origin: '*' });
    const data = await jsonFetch(url, {}, 6500);
    const image = data.entities?.[tags.wikidata]?.claims?.P18?.find(claim => claim.mainsnak?.snaktype === 'value')?.mainsnak?.datavalue?.value;
    return image ? commonsPhoto(`File:${image}`) : null;
  } catch {
    return null;
  }
}

export function bundledByDistance(position, limit = 9) {
  position = validPosition(position);
  return locations.map(place => ({ ...place, distanceKm: distanceKm(position, place), source: 'bundled-distance-fallback', sourceLabel: 'Bundled scenes, sorted by distance; not a live nearby search', isLiveNearby: false })).sort((a, b) => a.distanceKm - b.distanceKm).slice(0, limit);
}

export async function findNearby(position, lang = 'en') {
  position = validPosition(position);
  if (globalThis.navigator?.onLine === false) return bundledByDistance(position);
  const { lat, lng } = position;
  const query = `[out:json][timeout:10];(nwr(around:10000,${lat},${lng})[leisure=park][name];nwr(around:10000,${lat},${lng})[amenity=dojo][name];nwr(around:10000,${lat},${lng})[leisure~"^(sports_centre|sports_hall|fitness_centre)$"][sport~"(^|;)(martial_arts|judo|karate|taekwondo|aikido|kung_fu|tai_chi|sumo)(;|$)"][name];);out center tags;`;
  try {
    const data = await jsonFetch('https://overpass-api.de/api/interpreter', { method: 'POST', body: new URLSearchParams({ data: query }) }, 14000);
    const local = [];
    const ids = new Set();
    for (const element of data.elements || []) {
      const tags = element.tags || {};
      if (tags.access === 'no' || tags.access === 'private') continue;
      const coordinates = { lat: element.lat ?? element.center?.lat, lng: element.lon ?? element.center?.lon };
      if (!Number.isFinite(coordinates.lat) || !Number.isFinite(coordinates.lng)) continue;
      const key = `${element.type}-${element.id}`;
      if (ids.has(key)) continue;
      ids.add(key);
      const baseName = tags[`name:${shortLanguage(lang)}`] || tags.name || tags['name:en'];
      const name = {};
      for (const code of ['zh', 'en', 'ja', 'ko', 'es']) name[code] = tags[`name:${code}`] || baseName;
      local.push({ id: `osm-${key}`, name, ...coordinates, kind: tags.leisure === 'park' ? 'park' : 'dojo', country: tags['addr:country'] || '', photo: null, photoCredit: null, photoStatus: 'no-verified-licensed-photo', source: 'OpenStreetMap / Overpass', sourceUrl: `https://www.openstreetmap.org/${element.type}/${element.id}`, isLiveNearby: true, distanceKm: distanceKm(position, coordinates), tags });
    }
    local.sort((a, b) => a.distanceKm - b.distanceKm);
    const selected = local.slice(0, 12);
    if (!selected.length) return bundledByDistance(position);
    // Only a place's explicitly linked image is eligible. A nearby generic image
    // must never be passed off as a photograph of a different park or dojo.
    await Promise.all(selected.map(async place => {
      const known = locations.find(item => distanceKm(item, place) < 0.25 && (place.tags.wikimedia_commons === item.photoCredit.fileTitle || place.name.en.includes(item.name.en.split(' · ')[0])));
      const verified = known ? { photo: known.photo, photoCredit: known.photoCredit } : await linkedPhoto(place.tags);
      if (verified) Object.assign(place, verified, { photoStatus: 'verified-licensed-photo' });
      delete place.tags;
    }));
    return selected;
  } catch {
    return bundledByDistance(position);
  }
}
