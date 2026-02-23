import axios from 'axios';
import { Platform } from 'react-native';

// AUTOMATICALLY DETECTED LOCAL IP
// For Android Emulator, use 10.0.2.2 (redirects to host localhost)
// For iOS, localhost works fine
// For generic LAN access (physical device), check your machine's IP (e.g. 192.168.1.97)
const LOCAL_IP = '192.168.8.122'; // Auto-detected LAN IP

export const BASE_URL = Platform.select({
    android: `http://${LOCAL_IP}:5000`, // Use LAN IP for physical device support
    ios: `http://${LOCAL_IP}:5000`, // Use LAN IP to avoid localhost binding issues on Simulator
    default: `http://${LOCAL_IP}:5000`, // Web or physical device fallback
});

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
        config.headers.Cookie = cookie;
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

    console.log(`[API] ${response.config.method?.toUpperCase()} ${response.config.url} - ${response.status} (${duration}ms)`);

    // Save session cookie if present
    if (response.headers['set-cookie']) {
        await saveSessionCookie(response.headers);
    }

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
