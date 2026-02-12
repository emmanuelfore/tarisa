import { Platform } from 'react-native';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import { api } from './api';

Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
        shouldShowBanner: true,
        shouldShowList: true,
    }),
});

export async function registerForPushNotificationsAsync() {
    let token;

    if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
            name: 'default',
            importance: Notifications.AndroidImportance.MAX,
            vibrationPattern: [0, 250, 250, 250],
            lightColor: '#FF231F7C',
        });
    }

    if (Device.isDevice) {
        const { status: existingStatus } = await Notifications.getPermissionsAsync();
        let finalStatus = existingStatus;
        if (existingStatus !== 'granted') {
            const { status } = await Notifications.requestPermissionsAsync();
            finalStatus = status;
        }
        if (finalStatus !== 'granted') {
            // alert('Failed to get push token for push notification!');
            console.log('Failed to get push token for push notification!');
            return;
        }

        // Project ID logic
        const projectId = Constants?.expoConfig?.extra?.eas?.projectId || Constants?.easConfig?.projectId;

        if (!projectId) {
            console.error("Error getting push token: No 'projectId' found in app.json. Please ensure it is defined in expo.extra.eas.projectId.");
            return;
        }

        // If no projectId (e.g. dev client without config), try getting without it or fail gracefully
        try {
            token = (await Notifications.getExpoPushTokenAsync({
                projectId,
            })).data;
            console.log("Push Token:", token);

            // Send to backend
            await api.post('/api/user/push-token', { token });

        } catch (e) {
            console.warn("Push token fetch skipped or failed. This is expected in development without a valid Expo Project ID:", e.message);
        }
    } else {
        console.log('Must use physical device for Push Notifications');
    }

    return token;
}
