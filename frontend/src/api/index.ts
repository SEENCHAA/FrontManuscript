import { Api } from './Api';
import { API_URL } from '../config';

const api = new Api({
    baseURL: API_URL,
    securityWorker: (token) => {
        return token ? { headers: { Authorization: `Bearer ${token}` } } : {};
    },
});

api.instance.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export { api };