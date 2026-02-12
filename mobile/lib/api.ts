import axios from 'axios';
import { Platform } from 'react-native';

// AUTOMATICALLY DETECTED LOCAL IP
// For Android Emulator, use 10.0.2.2 (redirects to host localhost)
// For iOS, localhost works fine
// For generic LAN access (physical device), check your machine's IP (e.g. 192.168.1.97)
const LOCAL_IP = '192.168.1.97'; // Auto-detected LAN IP

export const BASE_URL = Platform.select({
    android: 'http://10.0.2.2:5000', // Standard Android Emulator localhost alias
    ios: `http://${LOCAL_IP}:5000`, // Use LAN IP to avoid localhost binding issues on Simulator
    default: `http://${LOCAL_IP}:5000`, // Web or physical device fallback
});

export const api = axios.create({
    baseURL: BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true, // For cookies
});

// Since standard cookies don't work reliably in RN across restarts without extra work,
// we might need to manually handle headers or use a cookie manager.
// For now, valid session within app run.
