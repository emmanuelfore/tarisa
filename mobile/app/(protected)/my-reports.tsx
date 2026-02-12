
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../lib/api';
import { formatDistanceToNow } from 'date-fns';
import { ArrowLeft, Clock, CheckCircle, AlertCircle } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function MyReportsScreen() {
    const router = useRouter();

    const { data: issues, isLoading, error } = useQuery({
        queryKey: ['my-issues-full'],
        queryFn: async () => {
            const res = await api.get('/api/issues/my'); // Uses existing endpoint
            return res.data;
        }
    });

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'resolved': return 'bg-green-100 text-green-700';
            case 'in_progress': return 'bg-blue-100 text-blue-700';
            default: return 'bg-yellow-100 text-yellow-700';
        }
    };

    const renderItem = ({ item }: { item: any }) => (
        <TouchableOpacity
            className="bg-white p-4 mb-3 rounded-xl border border-gray-100 shadow-sm"
            onPress={() => router.push(`/issue/${item.id}`)}
        >
            <View className="flex-row justify-between items-start mb-2">
                <Text className="font-bold text-gray-900 text-base" numberOfLines={1}>{item.title}</Text>
                <View className={`px-2 py-1 rounded ${getStatusColor(item.status).split(' ')[0]}`}>
                    <Text className={`text-xs font-bold uppercase ${getStatusColor(item.status).split(' ')[1]}`}>
                        {item.status.replace('_', ' ')}
                    </Text>
                </View>
            </View>

            <Text className="text-gray-500 text-sm mb-3 line-clamp-2" numberOfLines={2}>{item.description}</Text>

            <View className="flex-row items-center justify-between border-t border-gray-50 pt-3">
                <View className="flex-row items-center">
                    <Clock size={12} color="#9ca3af" />
                    <Text className="text-xs text-gray-400 ml-1">
                        {formatDistanceToNow(new Date(item.createdAt))} ago
                    </Text>
                </View>
                <Text className="text-xs text-gray-400 font-medium">{item.category}</Text>
            </View>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView className="flex-1 bg-gray-50" edges={['top']}>
            <Stack.Screen options={{ headerShown: false }} />

            {/* Header */}
            <View className="px-6 py-4 bg-white border-b border-gray-200 flex-row items-center">
                <TouchableOpacity onPress={() => router.back()} className="mr-4">
                    <ArrowLeft size={24} color="#1f2937" />
                </TouchableOpacity>
                <View>
                    <Text className="text-xl font-bold text-gray-900">My Reports</Text>
                    <Text className="text-xs text-gray-500">Track status of your submissions</Text>
                </View>
            </View>

            {isLoading ? (
                <View className="flex-1 items-center justify-center">
                    <ActivityIndicator size="large" color="#2563eb" />
                </View>
            ) : issues?.length === 0 ? (
                <View className="flex-1 items-center justify-center px-10">
                    <View className="w-16 h-16 bg-gray-100 rounded-full items-center justify-center mb-4">
                        <AlertCircle size={32} color="#9ca3af" />
                    </View>
                    <Text className="text-gray-900 font-bold text-lg mb-2">No Reports Yet</Text>
                    <Text className="text-gray-500 text-center">You haven't submitted any issues yet. Tap the + button on the home screen to start.</Text>
                </View>
            ) : (
                <FlatList
                    data={issues}
                    renderItem={renderItem}
                    keyExtractor={item => item.id.toString()}
                    contentContainerStyle={{ padding: 24 }}
                    showsVerticalScrollIndicator={false}
                />
            )}
        </SafeAreaView>
    );
}
