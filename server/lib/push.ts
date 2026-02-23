import axios from 'axios';

export async function sendPushNotification(expoPushToken: string, title: string, body: string, data?: any) {
    // Disabled for now to speed up operations
    return;
    if (!expoPushToken) return;

    const message = {
        to: expoPushToken,
        sound: 'default',
        title: title,
        body: body,
        data: data || {},
    };

    try {
        await axios.post('https://exp.host/--/api/v2/push/send', message, {
            headers: {
                Accept: 'application/json',
                'Accept-encoding': 'gzip, deflate',
                'Content-Type': 'application/json',
            },
        });
    } catch (error) {
        console.error('Error sending push notification:', error);
    }
}
