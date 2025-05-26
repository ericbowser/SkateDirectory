import axios from 'axios';

const PostData = async (url = '', body = {}) => {
  try {
    const headers = {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*'
    }
    const response = await axios.post(url, body, {...headers});
    if (response.status === 200) {
      return response.data;
    }
  } catch (ae) {
    console.log(ae);
    throw ae;
  }

  return null;
}

const FetchData = async (url = '') => {
  try {
    const headers = {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*'
    }
    const response = await axios.get(url, {...headers});
    if (response.status === 200) {
      return response.data;
    }
  } catch (ae) {
    console.log(ae);
    throw ae;
  }

  return null;
}

export {PostData, FetchData};
