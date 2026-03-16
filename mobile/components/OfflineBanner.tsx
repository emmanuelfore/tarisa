import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, Animated } from 'react-native';
import { WifiOff, RefreshCcw } from 'lucide-react-native';
import { useNetworkStatus } from '../lib/network';
import { getQueueCount, syncQueue } from '../lib/offline-queue';
import { api } from '../lib/api';
import { useQueryClient } from '@tanstack/react-query';

export default function OfflineBanner() {
    const { isOnline } = useNetworkStatus();
    const [queueCount, setQueueCount] = useState(0);
    const [syncing, setSyncing] = useState(false);
    const queryClient = useQueryClient();
    const fadeAnim = React.useRef(new Animated.Value(0)).current;

    const refreshQueue = async () => {
        const count = await getQueueCount();
        setQueueCount(count);
    };

    useEffect(() => {refreshQueue();}, []);

    // Also poll queue count occasionally when offline
    useEffect(() => {
        let interval: any;
        if (!isOnline) {
            interval = setInterval(refreshQueue, 5000);
        }
        return () => clearInterval(interval);
    }, [isOnline]);

    // Show/hide animation
    useEffect(() => {
        Animated.timing(fadeAnim, {
            toValue: (!isOnline || queueCount > 0) ? 1 : 0,
            duration: 300,
            useNativeDriver: true,
        }).start();
    }, [isOnline, queueCount]);

    useEffect(() => {
        if (isOnline && queueCount > 0 && !syncing) {
            handleSync();
        }
    }, [isOnline, queueCount]);

    const handleSync = async () => {
        setSyncing(true);
        try {
            const result = await syncQueue(api);
            if (result.synced > 0) {
                queryClient.invalidateQueries({ queryKey: ['my-issues'] });
                queryClient.invalidateQueries({ queryKey: ['community-issues'] });
            }
        } finally {
            setSyncing(false);
            refreshQueue();
        }
    };

    if (isOnline && queueCount === 0) return null;

    return (
        <Animated.View 
            style={{ opacity: fadeAnim }}
            className={`px-4 py-2 flex-row items-center justify-between ${!isOnline ? 'bg-red-600' : 'bg-orange-600'}`}
        >
            <View className="flex-row items-center flex-1">
                {!isOnline ? (
                    <WifiOff size={16} color="white" />
                ) : (
                    <RefreshCcw size={16} color="white" className={syncing ? 'animate-spin' : ''} />
                )}
                <Text className="text-white text-xs font-bold ml-2">
                    {!isOnline 
                        ? (queueCount > 0 ? `Offline • ${queueCount} report(s) queued` : 'Offline • No internet connection')
                        : (syncing ? 'Syncing queued reports...' : `${queueCount} report(s) waiting to sync`)}
                </Text>
            </View>
            
            {isOnline && queueCount > 0 && !syncing && (
                <TouchableOpacity onPress={handleSync} className="bg-white/25 px-3 py-1.5 rounded-full backdrop-blur-sm border border-white/20">
                    <Text className="text-white text-[10px] font-bold tracking-wider">SYNC NOW</Text>
                </TouchableOpacity>
            )}
        </Animated.View>
    );
}
