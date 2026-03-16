import axios from 'axios';

export const BASE_URL = 'https://tarisa.co.zw';

export const api = axios.create({
    baseURL: BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true, // For cookies
    timeout: 10000, // 10 seconds timeout
});

import { getSessionCookie, saveSessionCookie } from './auth-storage';

// Add request interceptor to measure time and attach cookie
api.interceptors.request.use(async config => {
    // @ts-ignore
    config.metadata = { startTime: new Date() };

    const cookie = await getSessionCookie();
    if (cookie) {
        config.headers['Cookie'] = cookie;
        config.headers['X-Session-ID'] = cookie; // Custom header for mobile reliability
        console.log(`[API Request] ${config.method?.toUpperCase()} ${config.url} - Attaching session ID: ${cookie.substring(0, 15)}...`);
    } else {
        console.log(`[API Request] ${config.method?.toUpperCase()} ${config.url} - No session cookie found`);
    }

    return config;
}, error => {
    return Promise.reject(error);
});

// Add response interceptor to log time and save cookie
api.interceptors.response.use(async response => {
    // @ts-ignore
    const startTime = response.config.metadata.startTime;
    const endTime = new Date();
    const duration = endTime.getTime() - startTime.getTime();

    // Save session cookie if present
    const setCookie = response.headers['set-cookie'] || response.headers['Set-Cookie'];
    if (setCookie) {
        console.log(`[API Response] ${response.config.method?.toUpperCase()} ${response.config.url} - set-cookie header found`);
        await saveSessionCookie(response.headers);
    }

    console.log(`[API] ${response.config.method?.toUpperCase()} ${response.config.url} - ${response.status} (${duration}ms)`);

    return response;
}, error => {
    if (error.config && error.config.metadata) {
        // @ts-ignore
        const startTime = error.config.metadata.startTime;
        const endTime = new Date();
        const duration = endTime.getTime() - startTime.getTime();
        console.log(`[API ERROR] ${error.config.method?.toUpperCase()} ${error.config.url} - ${error.message} (${duration}ms)`);
    }
    return Promise.reject(error);
});
