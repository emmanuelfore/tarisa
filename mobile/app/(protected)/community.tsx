
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, TextInput } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../lib/api';
import { formatDistanceToNow } from 'date-fns';
import { ArrowLeft, Clock, Filter, MapPin, Search, Users, TrendingUp, MessageCircle, ThumbsUp, AlertTriangle } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState } from 'react';
import clsx from 'clsx';

const CATEGORIES = [
    { id: 'all', label: 'All' },
    { id: 'Roads', label: 'Roads' },
    { id: 'Water', label: 'Water' },
    { id: 'Sewer', label: 'Sewer' },
    { id: 'Waste', label: 'Waste' },
    { id: 'Lights', label: 'Lights' },
    { id: 'Other', label: 'Other' },
];

export default function CommunityScreen() {
    const router = useRouter();
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');

    const { data: issues, isLoading, error } = useQuery({
        queryKey: ['community-issues', selectedCategory],
        queryFn: async () => {
            const params: any = {};
            if (selectedCategory !== 'all') params.category = selectedCategory;

            const res = await api.get('/api/issues', { params });
            return res.data;
        }
    });

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'resolved': return { bg: 'bg-green-100', text: 'text-green-700', dot: '#10b981' };
            case 'in_progress': return { bg: 'bg-blue-100', text: 'text-blue-700', dot: '#3b82f6' };
            default: return { bg: 'bg-orange-100', text: 'text-orange-700', dot: '#f97316' };
        }
    };

    const getSeverityColor = (severity: string) => {
        switch (severity) {
            case 'high': return { bg: 'bg-red-100', text: 'text-red-700', icon: '#dc2626' };
            case 'medium': return { bg: 'bg-orange-100', text: 'text-orange-700', icon: '#ea580c' };
            default: return { bg: 'bg-blue-100', text: 'text-blue-700', icon: '#2563eb' };
        }
    };

    const filteredIssues = issues?.filter((i: any) =>
        i.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        i.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        i.location?.toLowerCase().includes(searchQuery.toLowerCase())
    ) || [];

    const renderItem = ({ item }: { item: any }) => {
        const statusColors = getStatusColor(item.status);
        const severityColors = getSeverityColor(item.severity);
        return (
            <TouchableOpacity
                className="bg-white p-3.5 mb-3 rounded-2xl border-2 border-gray-200 shadow-md"
                onPress={() => router.push(`/issue/${item.id}`)}
                activeOpacity={0.9}
            >
                <View className="flex-row justify-between items-start mb-2.5">
                    <View className="flex-1 mr-3">
                        <Text className="font-bold text-gray-900 text-base mb-1 leading-tight" numberOfLines={1}>
                            {item.title}
                        </Text>
                        <View className="flex-row items-center">
                            <MapPin size={11} color="#6b7280" strokeWidth={2} />
                            <Text className="text-gray-600 text-xs ml-1 font-medium" numberOfLines={1}>
                                {item.location || 'Location not specified'}
                            </Text>
                        </View>
                    </View>
                    <View className="flex-col gap-1.5 items-end">
                        {item.severity && (
                            <View className={clsx("px-2 py-0.5 rounded-md flex-row items-center gap-1", severityColors.bg)}>
                                <AlertTriangle size={10} color={severityColors.icon} strokeWidth={2.5} />
                                <Text className={clsx("text-[9px] font-bold uppercase", severityColors.text)}>
                                    {item.severity}
                                </Text>
                            </View>
                        )}
                        <View className={clsx("px-2.5 py-1 rounded-full flex-row items-center gap-1", statusColors.bg)}>
                            <View className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: statusColors.dot }} />
                            <Text className={clsx("text-[10px] font-bold uppercase", statusColors.text)}>
                                {item.status.replace('_', ' ')}
                            </Text>
                        </View>
                    </View>
                </View>

                <Text className="text-gray-600 text-sm mb-2.5 leading-snug" numberOfLines={2}>
                    {item.description}
                </Text>

                <View className="flex-row items-center justify-between border-t border-gray-200 pt-2.5">
                    <View className="flex-row items-center">
                        <Clock size={11} color="#9ca3af" strokeWidth={2} />
                        <Text className="text-xs text-gray-500 ml-1 font-medium">
                            {formatDistanceToNow(new Date(item.createdAt))} ago
                        </Text>
                    </View>
                    <View className="flex-row items-center gap-3">
                        <View className="flex-row items-center">
                            <ThumbsUp size={12} color="#6b7280" strokeWidth={2} />
                            <Text className="text-xs text-gray-600 ml-1 font-bold">{item.upvotes || 0}</Text>
                        </View>
                        <View className="flex-row items-center">
                            <MessageCircle size={12} color="#6b7280" strokeWidth={2} />
                            <Text className="text-xs text-gray-600 ml-1 font-bold">{item.comments || 0}</Text>
                        </View>
                    </View>
                </View>
            </TouchableOpacity>
        );
    };

    return (
        <SafeAreaView className="flex-1 bg-gray-50" edges={['top']}>
            <Stack.Screen options={{ headerShown: false }} />

            {/* Header */}
            <View className="px-6 py-5 bg-white border-b-2 border-gray-200">
                <View className="flex-row items-center mb-4">
                    <View className="bg-blue-100 p-2.5 rounded-2xl mr-3">
                        <Users size={26} color="#1d4ed8" strokeWidth={2.5} />
                    </View>
                    <View>
                        <Text className="text-2xl font-bold text-gray-900">Community</Text>
                        <Text className="text-sm text-gray-600 font-medium">Public reports & updates</Text>
                    </View>
                </View>

                {/* Search Bar */}
                <View className="flex-row items-center bg-gray-50 rounded-2xl px-4 py-3.5 mb-3 border-2 border-gray-200">
                    <Search size={20} color="#6b7280" strokeWidth={2} />
                    <TextInput
                        className="flex-1 ml-3 text-gray-900 font-medium text-base"
                        placeholder="Search reports..."
                        placeholderTextColor="#9ca3af"
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                </View>

                {/* Category Filter */}
                <FlatList
                    data={CATEGORIES}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    className="-mx-2"
                    contentContainerStyle={{ paddingHorizontal: 8 }}
                    renderItem={({ item }) => (
                        <TouchableOpacity
                            onPress={() => setSelectedCategory(item.id)}
                            className={clsx(
                                "px-4 py-2 rounded-full mr-2 border-2",
                                selectedCategory === item.id
                                    ? 'bg-blue-600 border-blue-600'
                                    : 'bg-white border-gray-300'
                            )}
                            activeOpacity={0.8}
                        >
                            <Text className={clsx(
                                "text-xs font-bold",
                                selectedCategory === item.id ? 'text-white' : 'text-gray-700'
                            )}>
                                {item.label}
                            </Text>
                        </TouchableOpacity>
                    )}
                />
            </View>

            {isLoading ? (
                <View className="flex-1 items-center justify-center">
                    <ActivityIndicator size="large" color="#2563eb" />
                </View>
            ) : filteredIssues.length === 0 ? (
                <View className="flex-1 items-center justify-center px-10">
                    <View className="w-20 h-20 bg-blue-50 rounded-full items-center justify-center mb-4">
                        <Filter size={36} color="#3b82f6" strokeWidth={2} />
                    </View>
                    <Text className="text-gray-900 font-bold text-xl mb-2">No Reports Found</Text>
                    <Text className="text-gray-600 text-center font-medium">Try adjusting your filters or search query.</Text>
                </View>
            ) : (
                <FlatList
                    data={filteredIssues}
                    renderItem={renderItem}
                    keyExtractor={item => item.id.toString()}
                    contentContainerStyle={{ padding: 20 }}
                    showsVerticalScrollIndicator={false}
                />
            )}
        </SafeAreaView>
    );
}
