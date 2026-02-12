import { useLocalSearchParams, Stack, useRouter } from 'expo-router';
import { View, Text, ScrollView, ActivityIndicator, Image, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../lib/api';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, MapPin, Calendar, Clock, AlertTriangle, ThumbsUp, MessageSquare, Send, CheckCircle, AlertCircle } from 'lucide-react-native';
import { format, formatDistanceToNow } from 'date-fns';
import { cn } from '../../lib/utils';
import MapView, { Marker } from 'react-native-maps';
import { useState } from 'react';

export default function IssueDetail() {
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const queryClient = useQueryClient();
    const [commentText, setCommentText] = useState('');
    const [error, setError] = useState<string | null>(null);

    const { data: issue, isLoading, error: loadError } = useQuery({
        queryKey: ['issue', id],
        queryFn: async () => {
            const res = await api.get(`/api/issues/${id}`);
            return res.data;
        },
    });

    const { data: upvotes } = useQuery({
        queryKey: ['issue-upvotes', id],
        enabled: !!id,
        queryFn: async () => {
            const res = await api.get(`/api/issues/${id}/upvotes`);
            return res.data;
        }
    });

    const { data: timeline } = useQuery({
        queryKey: ['issue-timeline', id],
        enabled: !!id,
        queryFn: async () => {
            try {
                const res = await api.get(`/api/issues/${id}/timeline`);
                return res.data;
            } catch {
                return [
                    { type: 'created', title: 'Issue Reported', date: issue?.createdAt, description: 'Report submitted' },
                    issue?.resolvedAt ? { type: 'resolved', title: 'Issue Resolved', date: issue?.resolvedAt, description: 'Issue marked as resolved' } : null
                ].filter(Boolean);
            }
        }
    });

    const { data: comments } = useQuery({
        queryKey: ['issue-comments', id],
        enabled: !!id,
        queryFn: async () => {
            try {
                const res = await api.get(`/api/issues/${id}/comments`);
                return res.data;
            } catch { return []; }
        }
    });

    const upvoteMutation = useMutation({
        mutationFn: async () => {
            return await api.post(`/api/issues/${id}/upvote`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['issue-upvotes', id] });
            setError(null);
        },
        onError: (err: any) => {
            const errorData = err.response?.data?.error;
            const message = typeof errorData === 'string'
                ? errorData
                : typeof errorData === 'object'
                    ? JSON.stringify(errorData)
                    : 'Failed to upvote. Please try again.';
            setError(message);
        }
    });

    const commentMutation = useMutation({
        mutationFn: async (text: string) => {
            return await api.post(`/api/issues/${id}/comments`, { text });
        },
        onSuccess: () => {
            setCommentText('');
            queryClient.invalidateQueries({ queryKey: ['issue-comments', id] });
            setError(null);
        },
        onError: (err: any) => {
            const errorData = err.response?.data?.error;
            const message = typeof errorData === 'string'
                ? errorData
                : typeof errorData === 'object'
                    ? JSON.stringify(errorData)
                    : 'Failed to post comment. Please try again.';
            setError(message);
        }
    });

    if (isLoading) {
        return (
            <View className="flex-1 justify-center items-center bg-white">
                <ActivityIndicator size="large" color="#2563eb" />
            </View>
        );
    }

    if (loadError || !issue) {
        return (
            <View className="flex-1 justify-center items-center bg-white px-6">
                <Text className="text-red-500 text-lg text-center mb-4">Failed to load issue details</Text>
                <TouchableOpacity onPress={() => router.back()} className="bg-gray-100 px-6 py-3 rounded-lg">
                    <Text className="text-gray-900 font-medium">Go Back</Text>
                </TouchableOpacity>
            </View>
        );
    }

    const isResolved = issue.status === 'resolved';

    return (
        <View className="flex-1 bg-white">
            <Stack.Screen options={{ headerShown: false }} />

            {/* Header / Nav */}
            <SafeAreaView edges={['top']} className="bg-white border-b border-gray-100 z-10">
                <View className="px-4 py-3 flex-row items-center space-x-4">
                    <TouchableOpacity onPress={() => router.back()} className="p-2 -ml-2 rounded-full active:bg-gray-50">
                        <ArrowLeft size={24} color="#111827" />
                    </TouchableOpacity>
                    <View className="flex-1">
                        <Text className="text-gray-500 text-xs font-bold uppercase tracking-wider">{issue.category}</Text>
                        <View className="flex-row items-center space-x-2">
                            {isResolved && <CheckCircle size={14} color="#16a34a" />}
                            <Text className="font-bold text-gray-900 text-lg" numberOfLines={1}>{issue.trackingId}</Text>
                        </View>
                    </View>
                    <View className={`px-2 py-1 rounded text-xs font-bold ${isResolved ? 'bg-green-100' : 'bg-blue-100'}`}>
                        <Text className={`text-xs font-bold uppercase ${isResolved ? 'text-green-700' : 'text-blue-700'}`}>
                            {issue.status.replace('_', ' ')}
                        </Text>
                    </View>
                </View>
            </SafeAreaView>

            <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 100 }}>
                {/* Map or Image Hero */}
                {issue.coordinates ? (
                    <View className="h-48 w-full relative">
                        <MapView
                            style={{ flex: 1 }}
                            initialRegion={{
                                latitude: parseFloat(issue.coordinates.split(',')[0]),
                                longitude: parseFloat(issue.coordinates.split(',')[1]),
                                latitudeDelta: 0.005,
                                longitudeDelta: 0.005,
                            }}
                            scrollEnabled={false}
                            zoomEnabled={false}
                        >
                            <Marker coordinate={{
                                latitude: parseFloat(issue.coordinates.split(',')[0]),
                                longitude: parseFloat(issue.coordinates.split(',')[1]),
                            }} />
                        </MapView>
                        <View className="absolute bottom-4 left-4 bg-white/90 px-3 py-1.5 rounded-lg shadow-sm backdrop-blur-md flex-row items-center">
                            <MapPin size={14} color="#4b5563" />
                            <Text className="text-xs font-bold text-gray-700 ml-1">{issue.location}</Text>
                        </View>
                    </View>
                ) : (
                    <View className="h-32 bg-gray-100 items-center justify-center">
                        <Text className="text-gray-400">No Location Data</Text>
                    </View>
                )}

                <View className="px-6 py-6">
                    {/* Timestamp & Ward */}
                    <Text className="text-gray-400 text-sm mb-4">
                        {formatDistanceToNow(new Date(issue.createdAt))} ago • {issue.ward || 'Unknown Ward'}
                    </Text>

                    {/* Description */}
                    <Text className="text-sm font-bold text-gray-900 mb-2 uppercase tracking-wide">Description</Text>
                    <Text className="text-gray-800 text-base leading-relaxed mb-6">
                        {issue.description}
                    </Text>

                    {/* Photos */}
                    {issue.photos && issue.photos.length > 0 && (
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-6 -mx-6 px-6">
                            {issue.photos.map((photo: string, index: number) => (
                                <Image
                                    key={index}
                                    source={{ uri: photo.startsWith('http') ? photo : `${api.defaults.baseURL}${photo}` }}
                                    className="w-64 h-48 rounded-xl mr-3 bg-gray-100 border border-gray-100"
                                    resizeMode="cover"
                                />
                            ))}
                        </ScrollView>
                    )}

                    {/* Action Bar */}
                    <View className="flex-row items-center justify-between border-y border-gray-100 py-4 mb-8">
                        <TouchableOpacity
                            className="flex-row items-center space-x-2"
                            onPress={() => upvoteMutation.mutate()}
                        >
                            <ThumbsUp
                                size={20}
                                color={upvotes?.userUpvoted ? "#2563eb" : "#6b7280"}
                                fill={upvotes?.userUpvoted ? "#2563eb" : "none"}
                            />
                            <Text className={`font-bold text-base ${upvotes?.userUpvoted ? 'text-blue-600' : 'text-gray-600'}`}>
                                Upvote ({upvotes?.count || 0})
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity className="flex-row items-center space-x-2">
                            <MessageSquare size={20} color="#6b7280" />
                            <Text className="font-bold text-base text-gray-600">
                                Comment ({comments?.length || 0})
                            </Text>
                        </TouchableOpacity>
                    </View>

                    {/* Status Updates */}
                    <Text className="text-lg font-bold text-gray-900 mb-4">Status Updates</Text>
                    <View className="pl-4 border-l-2 border-gray-100 space-y-6 mb-8">
                        {timeline?.map((event: any, i: number) => (
                            <View key={i}>
                                <Text className="text-xs font-bold text-gray-400 uppercase mb-1">
                                    {event.type.replace('_', ' ')}
                                </Text>
                                <Text className="text-gray-400 text-xs mb-1">
                                    • {formatDistanceToNow(new Date(event.createdAt || event.date))} ago
                                </Text>
                                <Text className="text-gray-800 font-medium">
                                    {event.description || event.title}
                                </Text>
                            </View>
                        ))}
                        {/* Fallback Initial State */}
                        <View>
                            <Text className="text-xs font-bold text-gray-400 uppercase mb-1">SUBMITTED</Text>
                            <Text className="text-gray-400 text-xs mb-1">• {formatDistanceToNow(new Date(issue.createdAt))} ago</Text>
                            <Text className="text-gray-800 font-medium">Report submitted.</Text>
                        </View>
                    </View>

                    {/* Discussion */}
                    <Text className="text-lg font-bold text-gray-900 mb-4">Discussion</Text>

                    {comments?.length === 0 ? (
                        <Text className="text-gray-400 italic mb-6">No comments yet. Be the first to discuss.</Text>
                    ) : (
                        <View className="space-y-4 mb-6">
                            {comments?.map((comment: any) => (
                                <View key={comment.id} className="bg-gray-50 p-3 rounded-lg">
                                    <View className="flex-row justify-between mb-1">
                                        <Text className="font-bold text-gray-900 text-xs">{comment.userName || 'User'}</Text>
                                        <Text className="text-gray-400 text-xs">{formatDistanceToNow(new Date(comment.createdAt))} ago</Text>
                                    </View>
                                    <Text className="text-gray-700 text-sm">{comment.text}</Text>
                                </View>
                            ))}
                        </View>
                    )}

                    {/* Error Message */}
                    {error && (
                        <View className="bg-red-50 border-2 border-red-200 rounded-2xl p-4 mb-4 flex-row items-start">
                            <AlertCircle size={20} color="#dc2626" />
                            <Text className="text-red-700 font-medium ml-3 flex-1">{error}</Text>
                        </View>
                    )}

                    {/* Add Comment Input */}
                    <View className="flex-row items-center bg-gray-50 p-2 rounded-full border border-gray-200">
                        <TextInput
                            className="flex-1 px-4 py-2 text-gray-900"
                            placeholder="Add a comment..."
                            value={commentText}
                            onChangeText={setCommentText}
                            onSubmitEditing={() => commentText.trim() && commentMutation.mutate(commentText)}
                        />
                        <TouchableOpacity
                            className="bg-blue-600 p-2 rounded-full"
                            onPress={() => commentText.trim() && commentMutation.mutate(commentText)}
                            disabled={commentMutation.isPending}
                        >
                            {commentMutation.isPending ? (
                                <ActivityIndicator size={16} color="white" />
                            ) : (
                                <Send size={16} color="white" />
                            )}
                        </TouchableOpacity>
                    </View>
                </View>
            </ScrollView>
        </View>
    );
}
