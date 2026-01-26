const memoryCache = new Map();
const PREFIX = "cultivos-cache:";
const DEFAULT_TTL = 5 * 60 * 1000;
export const getCache = (key) => {
  const mem = memoryCache.get(key);
  if (mem && Date.now() < mem.expire) {
    return mem.data;
  }
  const raw = localStorage.getItem(PREFIX + key);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    if (Date.now() > parsed.expire) {
      localStorage.removeItem(PREFIX + key);
      return null;
    }
    memoryCache.set(key, parsed);
    return parsed.data;
  } catch {
    localStorage.removeItem(PREFIX + key);
    return null;
  }
};
export const setCache = (key, data, ttl = DEFAULT_TTL) => {
  const record = {
    data,
    expire: Date.now() + ttl
  };
  memoryCache.set(key, record);
  localStorage.setItem(PREFIX + key, JSON.stringify(record));
};
export const clearCache = (key) => {
  memoryCache.delete(key);
  localStorage.removeItem(PREFIX + key);
};
export const clearAllCache = () => {
  memoryCache.clear();
  Object.keys(localStorage)
    .filter(k => k.startsWith(PREFIX))
    .forEach(k => localStorage.removeItem(k));
};