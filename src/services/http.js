import axios from 'axios';

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
      headers: { 'Content-Type': 'application/json' },
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

export { PostData, FetchData };
