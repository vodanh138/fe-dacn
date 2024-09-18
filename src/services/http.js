import axios from 'axios';

axios.defaults.headers.common['ngrok-skip-browser-warning'] = 'any-value';
const http = axios.create({
  baseURL: process.env.REACT_APP_API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

export { http };
