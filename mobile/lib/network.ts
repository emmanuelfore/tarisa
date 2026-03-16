import { useState, useEffect } from 'react';
import NetInfo, { NetInfoState } from '@react-native-community/netinfo';

/**
 * Returns current online status and subscribes to changes.
 * `isOnline` starts as `true` to avoid flash of offline UI on mount.
 */
export function useNetworkStatus() {
    const [isOnline, setIsOnline] = useState(true);

    useEffect(() => {
        // Get initial state
        NetInfo.fetch().then((state: NetInfoState) => {
            setIsOnline(state.isConnected ?? true);
        });

        // Subscribe to changes
        const unsubscribe = NetInfo.addEventListener((state: NetInfoState) => {
            setIsOnline(state.isConnected ?? true);
        });

        return () => unsubscribe();
    }, []);

    return { isOnline };
}
