import axios from 'axios';

const ADMIN_KEY_STORAGE = 'skate_admin_key';

/** Admin key for write APIs — sessionStorage (set on Admin form) or local Vite env. */
export function getAdminApiKey() {
  if (typeof window !== 'undefined') {
    const fromSession = window.sessionStorage.getItem(ADMIN_KEY_STORAGE);
    if (fromSession) return fromSession;
  }
  return import.meta.env.VITE_ADMIN_API_KEY || '';
}

export function setAdminApiKey(key) {
  if (typeof window === 'undefined') return;
  const trimmed = String(key || '').trim();
  if (trimmed) {
    window.sessionStorage.setItem(ADMIN_KEY_STORAGE, trimmed);
  } else {
    window.sessionStorage.removeItem(ADMIN_KEY_STORAGE);
  }
}

function adminHeaders() {
  const key = getAdminApiKey();
  return key ? { 'x-admin-key': key } : {};
}

function parseResponseData(data, url) {
  if (typeof data === 'string') {
    const trimmed = data.trimStart();
    if (trimmed.startsWith('<!DOCTYPE') || trimmed.startsWith('<html')) {
      throw new Error(
        `Got the website HTML instead of park data from ${url}. ` +
          'The server must proxy /api/* to the Node backend (see deploy/nginx-skatedir.conf).'
      );
    }
    throw new Error(`Expected JSON from ${url}, got plain text.`);
  }
  return data;
}

const PostData = async (url = '', body = {}) => {
  try {
    const response = await axios.post(url, body, {
      headers: { 'Content-Type': 'application/json', ...adminHeaders() },
      validateStatus: (status) => status >= 200 && status < 300,
    });
    return parseResponseData(response.data, url);
  } catch (err) {
    console.error('POST failed:', url, err.response?.data ?? err.message);
    throw err;
  }
};

const FetchData = async (url = '') => {
  try {
    const response = await axios.get(url, {
      headers: { Accept: 'application/json' },
      validateStatus: (status) => status >= 200 && status < 300,
    });
    return parseResponseData(response.data, url);
  } catch (err) {
    const apiMsg = err.response?.data?.message;
    console.error('GET failed:', url, apiMsg ?? err.response?.data ?? err.message);
    if (apiMsg) {
      throw new Error(apiMsg);
    }
    throw err;
  }
};

export { PostData, FetchData, adminHeaders };
