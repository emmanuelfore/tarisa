import { View, Text, ScrollView, RefreshControl, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../lib/api';
import { formatDistanceToNow } from 'date-fns';
import { Bell, CheckCircle, AlertTriangle, Info, XCircle } from 'lucide-react-native';
import clsx from 'clsx';
import { useState } from 'react';
import { useRouter } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';

export default function NotificationsScreen() {
    const router = useRouter();
    const queryClient = useQueryClient();
    const [refreshing, setRefreshing] = useState(false);

    const { data: notifications, refetch, isLoading } = useQuery({
        queryKey: ['notifications'],
        queryFn: async () => {
            const res = await api.get('/api/notifications');
            return res.data;
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
        await refetch();
        setRefreshing(false);
    };

    const handlePress = (notification: any) => {
        if (!notification.read) {
            markReadMutation.mutate(notification.id);
        }
    };

    const getIcon = (type: string) => {
        switch (type) {
            case 'error': return <XCircle size={24} color="#dc2626" />;
            case 'warning': return <AlertTriangle size={24} color="#f59e0b" />;
            case 'success': return <CheckCircle size={24} color="#16a34a" />;
            default: return <Info size={24} color="#2563eb" />;
        }
    };

    const getBgColor = (type: string, read: boolean) => {
        if (read) return 'bg-white opacity-60';
        switch (type) {
            case 'error': return 'bg-red-50 border-red-100';
            case 'warning': return 'bg-yellow-50 border-yellow-100';
            case 'success': return 'bg-green-50 border-green-100';
            default: return 'bg-blue-50 border-blue-100';
        }
    };

    return (
        <SafeAreaView className="flex-1 bg-white">
            <View className="px-6 py-4 border-b border-gray-100 flex-row items-center">
                <TouchableOpacity onPress={() => router.back()} className="mr-4">
                    <ArrowLeft size={24} color="#1f2937" />
                </TouchableOpacity>
                <Text className="text-xl font-bold text-gray-900">Notifications</Text>
            </View>

            <ScrollView
                className="flex-1 px-6 pt-4"
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
            >
                {isLoading ? (
                    <Text className="text-center text-gray-500 mt-10">Loading notifications...</Text>
                ) : notifications?.length === 0 ? (
                    <View className="items-center justify-center mt-20">
                        <Bell size={48} color="#9ca3af" />
                        <Text className="text-gray-500 mt-4 text-center">No notifications yet.</Text>
                    </View>
                ) : (
                    notifications?.map((item: any) => (
                        <TouchableOpacity
                            key={item.id}
                            onPress={() => handlePress(item)}
                            className={clsx(
                                "p-4 rounded-xl mb-3 border",
                                getBgColor(item.type, item.read),
                                !item.read && "border-l-4"
                            )}
                        >
                            <View className="flex-row items-start">
                                <View className="mt-1 mr-3">
                                    {getIcon(item.type)}
                                </View>
                                <View className="flex-1">
                                    <View className="flex-row justify-between items-start mb-1">
                                        <Text className={clsx("text-base font-bold text-gray-900", !item.read && "text-blue-900")}>
                                            {item.title}
                                        </Text>
                                        {!item.read && (
                                            <View className="w-2 h-2 bg-blue-500 rounded-full mt-2" />
                                        )}
                                    </View>
                                    <Text className="text-gray-600 text-sm leading-5 mb-2">
                                        {item.message}
                                    </Text>
                                    <Text className="text-gray-400 text-xs">
                                        {formatDistanceToNow(new Date(item.createdAt), { addSuffix: true })}
                                    </Text>
                                </View>
                            </View>
                        </TouchableOpacity>
                    ))
                )}
                <View className="h-10" />
            </ScrollView>
        </SafeAreaView>
    );
}
