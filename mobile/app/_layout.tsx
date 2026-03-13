import "../global.css";
import { Stack } from 'expo-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

import { useEffect } from 'react';
import { registerForPushNotificationsAsync } from '../lib/notifications';
import * as Notifications from 'expo-notifications';

import * as SplashScreen from 'expo-splash-screen';

// Keep the splash screen visible while we fetch resources (if needed)
SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

import { AuthProvider } from '../lib/AuthContext';

export default function RootLayout() {
    useEffect(() => {
        // Hide splash screen immediately as requested
        SplashScreen.hideAsync();
    }, []);

    return (
        <QueryClientProvider client={queryClient}>
            <AuthProvider>
                <SafeAreaProvider>
                    <Stack screenOptions={{ headerShown: false }}>
                        <Stack.Screen name="index" />
                        <Stack.Screen name="(auth)" />
                        <Stack.Screen name="(protected)" />
                    </Stack>
                    <StatusBar style="auto" />
                </SafeAreaProvider>
            </AuthProvider>
        </QueryClientProvider>
    );
}
