import { View, Text, ScrollView, RefreshControl, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../lib/api';
import { formatDistanceToNow } from 'date-fns';
import { BellRing, Info, CheckCircle, AlertTriangle, ArrowRight, MessageSquare, Megaphone } from 'lucide-react-native';
import clsx from 'clsx';
import { useState, useMemo } from 'react';
import { useRouter } from 'expo-router';

export default function BroadcastsScreen() {
    const router = useRouter();
    const queryClient = useQueryClient();
    const [refreshing, setRefreshing] = useState(false);

    const { data: broadcasts, isLoading: loadingBroadcasts, refetch: refetchBroadcasts } = useQuery({
        queryKey: ['broadcasts'],
        queryFn: async () => {
            const res = await api.get('/api/broadcasts?limit=50');
            return res.data.map((b: any) => ({ ...b, itemType: 'broadcast' }));
        }
    });

    const { data: notifications, isLoading: loadingNotifications, refetch: refetchNotifications } = useQuery({
        queryKey: ['notifications'],
        queryFn: async () => {
            const res = await api.get('/api/notifications');
            return res.data.map((n: any) => ({ ...n, itemType: 'notification' }));
        }
    });

    const markReadMutation = useMutation({
        mutationFn: async (id: number) => {
            return await api.patch(`/api/notifications/${id}/read`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['notifications'] });
        }
    });

    const onRefresh = async () => {
        setRefreshing(true);
        await Promise.all([refetchBroadcasts(), refetchNotifications()]);
        setRefreshing(false);
    };

    const unifiedUpdates = useMemo(() => {
        const items = [...(broadcasts || []), ...(notifications || [])];
        return items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }, [broadcasts, notifications]);

    const getIcon = (item: any) => {
        if (item.itemType === 'broadcast') {
            switch (item.type) {
                case 'alert': return <AlertTriangle size={20} color="#dc2626" />;
                case 'success': return <CheckCircle size={20} color="#16a34a" />;
                default: return <Megaphone size={20} color="#2563eb" />;
            }
        }
        // Notifications
        switch (item.type) {
            case 'success': return <CheckCircle size={20} color="#16a34a" />;
            case 'warning': return <AlertTriangle size={20} color="#f59e0b" />;
            case 'error': return <AlertTriangle size={20} color="#dc2626" />;
            default: return <MessageSquare size={20} color="#2563eb" />;
        }
    };

    const getBgColor = (item: any) => {
        if (item.read === true) return 'bg-white border-gray-100 opacity-70';

        const type = item.type;
        switch (type) {
            case 'alert':
            case 'error': return 'bg-red-50 border-red-100';
            case 'warning': return 'bg-yellow-50 border-yellow-100';
            case 'success': return 'bg-green-50 border-green-100';
            default: return 'bg-blue-50 border-blue-100';
        }
    };

    const handlePress = (item: any) => {
        if (item.itemType === 'notification' && !item.read) {
            markReadMutation.mutate(item.id);
        }
        // If there's a related issue or broadcast detail, navigate there
        // For now, just mark as read
    };

    return (
        <SafeAreaView className="flex-1 bg-gray-50">
            <View className="px-6 py-6 border-b border-gray-100 bg-white flex-row items-center justify-between">
                <View>
                    <Text className="text-2xl font-bold text-gray-900">Updates</Text>
                    <Text className="text-xs text-gray-500">Community & personal news</Text>
                </View>
                <View className="bg-blue-50 p-2 rounded-full">
                    <BellRing size={20} color="#2563eb" />
                </View>
            </View>

            <ScrollView
                className="flex-1 px-6 pt-6"
                showsVerticalScrollIndicator={false}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
            >
                {(loadingBroadcasts || loadingNotifications) && !refreshing ? (
                    <View className="items-center py-10">
                        <Text className="text-gray-500">Checking for updates...</Text>
                    </View>
                ) : unifiedUpdates.length === 0 ? (
                    <View className="items-center justify-center mt-20">
                        <Info size={48} color="#9ca3af" />
                        <Text className="text-gray-500 mt-4 text-center">No updates at the moment.</Text>
                    </View>
                ) : (
                    unifiedUpdates.map((item: any, index: number) => (
                        <TouchableOpacity
                            key={`${item.itemType}-${item.id}-${index}`}
                            onPress={() => handlePress(item)}
                            className={clsx(
                                "p-5 rounded-3xl mb-4 border shadow-sm",
                                getBgColor(item)
                            )}
                        >
                            <View className="flex-row items-start mb-3">
                                <View className={clsx(
                                    "p-2 rounded-2xl mr-3",
                                    item.read ? "bg-gray-100" : "bg-white"
                                )}>
                                    {getIcon(item)}
                                </View>
                                <View className="flex-1">
                                    <View className="flex-row justify-between items-center mb-1">
                                        <Text className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                                            {item.itemType === 'broadcast' ? 'Official Update' : 'Status Alert'}
                                        </Text>
                                        <Text className="text-[10px] text-gray-400">
                                            {formatDistanceToNow(new Date(item.createdAt), { addSuffix: true })}
                                        </Text>
                                    </View>
                                    <Text className={clsx(
                                        "font-bold text-lg text-gray-900 leading-6",
                                        item.read && "text-gray-700"
                                    )}>
                                        {item.title}
                                    </Text>
                                </View>
                            </View>

                            <Text className="text-gray-600 leading-6 text-sm mb-2">
                                {item.message}
                            </Text>

                            <View className="flex-row items-center justify-end mt-2">
                                <Text className="text-xs font-bold text-blue-600 mr-1">View details</Text>
                                <ArrowRight size={14} color="#2563eb" />
                            </View>
                        </TouchableOpacity>
                    ))
                )}
                <View className="h-10" />
            </ScrollView>
        </SafeAreaView>
    );
}
