import AsyncStorage from '@react-native-async-storage/async-storage';

const SESSION_COOKIE_KEY = 'user_session_cookie';

export const saveSessionCookie = async (headers: any) => {
    // Look for set-cookie header
    // Axios headers can be normalized to lower case
    const setCookie = headers['set-cookie'] || headers['Set-Cookie'];
    if (setCookie && Array.isArray(setCookie) && setCookie.length > 0) {
        // Simple extraction: take the first one or join them.
        // Usually connect.sid is what we need.
        const cookie = setCookie[0].split(';')[0];
        await AsyncStorage.setItem(SESSION_COOKIE_KEY, cookie);
    }
};

export const getSessionCookie = async () => {
    return await AsyncStorage.getItem(SESSION_COOKIE_KEY);
};

export const clearSessionCookie = async () => {
    await AsyncStorage.removeItem(SESSION_COOKIE_KEY);
};
