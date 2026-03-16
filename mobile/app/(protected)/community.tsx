
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, TextInput } from 'react-native';
import { Stack, useRouter, Link } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../lib/api';
import { formatDistanceToNow } from 'date-fns';
import { ArrowLeft, Clock, Filter, MapPin, Search, Users, TrendingUp, MessageCircle, ThumbsUp, AlertTriangle } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ScrollView } from 'react-native';
import { useState } from 'react';
import clsx from 'clsx';

export default function CommunityScreen() {
    const router = useRouter();
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');

    const { data: categories = [] } = useQuery({
        queryKey: ['/api/categories'],
        queryFn: async () => {
            const res = await api.get('/api/categories');
            return res.data;
        }
    });

    const displayCategories = [
        { id: 'all', label: 'All' },
        ...categories.map((c: any) => ({ id: c.code, label: c.name }))
    ];

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
            case 'resolved': return { bg: 'bg-green-100', text: 'text-green-700', dot: '#16a34a' };
            case 'in_progress': return { bg: 'bg-orange-100', text: 'text-orange-700', dot: '#ea580c' };
            default: return { bg: 'bg-slate-100', text: 'text-slate-700', dot: '#475569' };
        }
    };

    const getSeverityColor = (severity: string) => {
        switch (severity) {
            case 'high': return { bg: 'bg-red-100', text: 'text-red-700', icon: '#dc2626' };
            case 'medium': return { bg: 'bg-amber-100', text: 'text-amber-700', icon: '#d97706' };
            default: return { bg: 'bg-slate-100', text: 'text-slate-700', icon: '#475569' };
        }
    };

    const renderCategoryItem = ({ item }: { item: any }) => (
        <TouchableOpacity
            onPress={() => setSelectedCategory(item.id)}
            className={clsx(
                "px-4 py-2 rounded-full mr-2 border-2",
                selectedCategory === item.id
                    ? 'bg-orange-600 border-orange-600 shadow-orange-200/50'
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
    );

    const filteredIssues = issues?.filter((i: any) =>
        i.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        i.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        i.location?.toLowerCase().includes(searchQuery.toLowerCase())
    ) || [];

    const renderIssueItem = ({ item }: { item: any }) => {
        const statusColors = getStatusColor(item.status);
        const severityColors = getSeverityColor(item.severity);
        return (
            <Link href={`/issue/${item.id}`} asChild>
                <TouchableOpacity
                    className="bg-white p-3.5 mb-3 rounded-2xl border-2 border-gray-200 shadow-md"
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
                            <View style={{
                                paddingHorizontal: 8,
                                paddingVertical: 2,
                                borderRadius: 6,
                                flexDirection: 'row',
                                alignItems: 'center',
                                gap: 4,
                                backgroundColor: severityColors.bg
                            }}>
                                <AlertTriangle size={10} color={severityColors.icon} strokeWidth={2.5} />
                                <Text style={{
                                    fontSize: 9,
                                    fontWeight: 'bold',
                                    textTransform: 'uppercase',
                                    color: severityColors.text
                                }}>
                                    {item.severity}
                                </Text>
                            </View>
                        )}
                        <View style={{
                            paddingHorizontal: 10,
                            paddingVertical: 4,
                            borderRadius: 9999,
                            flexDirection: 'row',
                            alignItems: 'center',
                            gap: 4,
                            backgroundColor: statusColors.bg
                        }}>
                            <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: statusColors.dot }} />
                            <Text style={{
                                fontSize: 10,
                                fontWeight: 'bold',
                                textTransform: 'uppercase',
                                color: statusColors.text
                            }}>
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
            </Link>
        );
    };

    return (
        <SafeAreaView className="flex-1 bg-gray-50" edges={['top']}>
            {/* Header */}
            <View className="px-6 py-5 bg-white border-b-2 border-gray-200">
                <View className="flex-row items-center mb-4">
                    <View className="bg-orange-50 p-2.5 rounded-2xl mr-3 border border-orange-100">
                        <Users size={26} color="#ea580c" strokeWidth={2.5} />
                    </View>
                    <View>
                        <Text className="text-2xl font-bold text-gray-900">Community</Text>
                        <Text className="text-sm text-gray-600 font-medium">Public reports & updates</Text>
                    </View>
                </View>

                {/* Search Bar */}
                <View className="flex-row items-center bg-gray-50 rounded-2xl px-4 mb-3 border-2 border-gray-200" style={{ height: 48 }}>
                    <Search size={20} color="#6b7280" strokeWidth={2} />
                    <TextInput
                        style={{ flex: 1, marginLeft: 12, color: '#111827', fontSize: 16, fontWeight: '500', height: '100%' }}
                        placeholder="Search reports..."
                        placeholderTextColor="#9ca3af"
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        returnKeyType="search"
                        autoCapitalize="none"
                        autoCorrect={false}
                        clearButtonMode="while-editing"
                    />
                </View>

                {/* Category Filter */}
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    style={{ marginHorizontal: -8 }}
                    contentContainerStyle={{ paddingHorizontal: 8 }}
                >
                    {displayCategories.map(item => (
                        <TouchableOpacity
                            key={item.id}
                            onPress={() => setSelectedCategory(item.id)}
                            style={{ 
                                paddingHorizontal: 16, 
                                paddingVertical: 8, 
                                borderRadius: 9999, 
                                marginRight: 8, 
                                borderWidth: 2,
                                backgroundColor: selectedCategory === item.id ? '#ea580c' : '#ffffff',
                                borderColor: selectedCategory === item.id ? '#ea580c' : '#d1d5db'
                            }}
                            activeOpacity={0.8}
                        >
                            <Text style={{
                                fontSize: 12,
                                fontWeight: 'bold',
                                color: selectedCategory === item.id ? '#ffffff' : '#374151'
                            }}>
                                {item.label}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>

            {isLoading ? (
                <View className="flex-1 items-center justify-center">
                    <ActivityIndicator size="large" color="#ea580c" />
                </View>
            ) : filteredIssues.length === 0 ? (
                <View className="flex-1 items-center justify-center px-10">
                    <View className="w-20 h-20 bg-orange-50 rounded-full items-center justify-center mb-4">
                        <Filter size={36} color="#ea580c" strokeWidth={2.5} />
                    </View>
                    <Text className="text-gray-900 font-bold text-xl mb-2">No Reports Found</Text>
                    <Text className="text-gray-600 text-center font-medium">Try adjusting your filters or search query.</Text>
                </View>
            ) : (
                <ScrollView
                    contentContainerStyle={{ padding: 20 }}
                    showsVerticalScrollIndicator={false}
                >
                    {filteredIssues.map((item: any) => (
                        <View key={item.id}>
                            {renderIssueItem({ item })}
                        </View>
                    ))}
                </ScrollView>
            )}
        </SafeAreaView>
    );
}
