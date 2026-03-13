import AsyncStorage from '@react-native-async-storage/async-storage';

const SESSION_COOKIE_KEY = 'user_session_cookie';

export const saveSessionCookie = async (headers: any) => {
    // Look for set-cookie header
    // Axios headers can be normalized to lower case
    let setCookie = headers['set-cookie'] || headers['Set-Cookie'];
    if (setCookie) {
        let cookie = '';
        if (Array.isArray(setCookie)) {
            const sidCookie = setCookie.find(c => c.trim().startsWith('connect.sid='));
            if (sidCookie) {
                cookie = sidCookie.split(';')[0];
            } else if (setCookie.length > 0) {
                cookie = setCookie[0].split(';')[0];
            }
        } else if (typeof setCookie === 'string') {
            cookie = setCookie.split(';')[0];
        }

        if (cookie) {
            console.log(`[STORAGE] Saving session cookie: ${cookie.substring(0, 20)}...`);
            await AsyncStorage.setItem(SESSION_COOKIE_KEY, cookie);
        } else {
            console.log(`[STORAGE] Could not extract cookie from set-cookie:`, setCookie);
        }
    } else {
        // console.log(`[STORAGE] No set-cookie header in response`);
    }
};

export const getSessionCookie = async () => {
    return await AsyncStorage.getItem(SESSION_COOKIE_KEY);
};

export const clearSessionCookie = async () => {
    await AsyncStorage.removeItem(SESSION_COOKIE_KEY);
};
