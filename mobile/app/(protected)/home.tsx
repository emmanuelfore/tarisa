import { View, Text, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../lib/api';
import {
    FileText, Award, CheckCircle, ArrowRight, PlusCircle,
    Users, Bell, MapPin, Clock, Sparkles,
    LayoutDashboard, ChevronRight, Zap, AlertTriangle,
    ThumbsUp, MessageCircle
} from 'lucide-react-native';
import clsx from 'clsx';

const { width } = Dimensions.get('window');

export default function HomeScreen() {
    const router = useRouter();

    const { data: issues } = useQuery({
        queryKey: ['my-issues'],
        queryFn: async () => {
            try { return (await api.get('/api/issues/my')).data; }
            catch { return []; }
        }
    });

    const { data: statsData } = useQuery({
        queryKey: ['user-stats'],
        queryFn: async () => {
            try {
                const res = await api.get('/api/user/stats');
                return res.data;
            } catch (error) {
                return null;
            }
        }
    });

    const { data: communityIssues } = useQuery({
        queryKey: ['active-issues-public'],
        queryFn: async () => {
            // Fetch all public issues. We can filter by status query param if we want, or client side.
            // Listing all allows us to filter client side easily.
            try {
                const res = await api.get('/api/issues');
                return res.data;
            } catch {
                return [];
            }
        }
    });

    const activeIssues = communityIssues?.filter((i: any) =>
        i.status === 'submitted' || i.status === 'in_progress'
    ) || [];

    const stats = {
        reports: statsData?.totalReports || 0,
        credits: statsData?.totalCredits || 0,
        resolved: statsData?.resolvedReports || 0
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'resolved': return { bg: 'bg-green-100', text: 'text-green-700', icon: '#059669', dot: '#10b981' };
            case 'in_progress': return { bg: 'bg-blue-100', text: 'text-blue-700', icon: '#2563eb', dot: '#3b82f6' };
            default: return { bg: 'bg-orange-100', text: 'text-orange-700', icon: '#ea580c', dot: '#f97316' };
        }
    };

    const getSeverityColor = (severity: string) => {
        switch (severity) {
            case 'high': return { bg: 'bg-red-100', text: 'text-red-700', icon: '#dc2626' };
            case 'medium': return { bg: 'bg-orange-100', text: 'text-orange-700', icon: '#ea580c' };
            default: return { bg: 'bg-blue-100', text: 'text-blue-700', icon: '#2563eb' };
        }
    };

    return (
        <SafeAreaView className="flex-1 bg-gray-50">
            <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>

                {/* Premium Header */}
                <View className="bg-blue-600 px-6 pt-8 pb-20">
                    <View className="flex-row justify-between items-start mb-10">
                        <View className="flex-1">
                            <Text className="text-white font-bold text-4xl mb-1">Tarisa</Text>
                            <Text className="text-white text-base opacity-90">Your civic engagement platform</Text>
                        </View>
                        <TouchableOpacity
                            onPress={() => router.push('/(protected)/broadcasts')}
                            className="w-14 h-14 bg-white/20 rounded-2xl items-center justify-center border border-white/30 relative"
                            activeOpacity={0.7}
                        >
                            <Bell size={24} color="white" strokeWidth={2} />
                            <View className="absolute top-2 right-2 w-3 h-3 bg-red-500 rounded-full border-2 border-blue-600" />
                        </TouchableOpacity>
                    </View>

                    {/* Stats Cards */}
                    <View className="flex-row gap-3">
                        <View className="flex-1 bg-white/20 backdrop-blur-xl p-4 rounded-2xl border border-white/30">
                            <FileText size={20} color="white" strokeWidth={2.5} className="mb-2" />
                            <Text className="text-white font-bold text-2xl mb-0.5">{stats.reports}</Text>
                            <Text className="text-white text-xs font-semibold uppercase tracking-wide opacity-90">Reports</Text>
                        </View>

                        <View className="flex-1 bg-white/20 backdrop-blur-xl p-4 rounded-2xl border border-white/30">
                            <Award size={20} color="#fbbf24" strokeWidth={2.5} className="mb-2" />
                            <Text className="text-yellow-300 font-bold text-2xl mb-0.5">{stats.credits}</Text>
                            <Text className="text-white text-xs font-semibold uppercase tracking-wide opacity-90">Points</Text>
                        </View>

                        <View className="flex-1 bg-white/20 backdrop-blur-xl p-4 rounded-2xl border border-white/30">
                            <CheckCircle size={20} color="#4ade80" strokeWidth={2.5} className="mb-2" />
                            <Text className="text-green-300 font-bold text-2xl mb-0.5">{stats.resolved}</Text>
                            <Text className="text-white text-xs font-semibold uppercase tracking-wide opacity-90">Solved</Text>
                        </View>
                    </View>
                </View>

                {/* Main Content Container */}
                <View className="px-6 -mt-12 pb-8">

                    {/* Primary Action Cards */}
                    <View className="flex-row gap-4 mb-8">
                        <TouchableOpacity
                            className="flex-1 bg-blue-600 p-6 rounded-3xl shadow-xl"
                            onPress={() => router.push('/report')}
                            activeOpacity={0.8}
                        >
                            <View className="w-14 h-14 bg-white/20 rounded-2xl items-center justify-center mb-3">
                                <PlusCircle color="white" size={28} strokeWidth={2.5} />
                            </View>
                            <Text className="font-bold text-white text-lg mb-0.5">New Report</Text>
                            <Text className="text-white text-xs opacity-90 font-medium">Help your community</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            className="flex-1 bg-white p-6 rounded-3xl border-2 border-gray-200 shadow-lg"
                            onPress={() => router.push('/(protected)/community')}
                            activeOpacity={0.8}
                        >
                            <View className="w-14 h-14 bg-blue-100 rounded-2xl items-center justify-center mb-3">
                                <Users color="#1d4ed8" size={28} strokeWidth={2.5} />
                            </View>
                            <Text className="font-bold text-gray-900 text-lg mb-0.5">Community</Text>
                            <Text className="text-gray-600 text-xs font-medium">Explore reports</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Active Issues Section */}
                    <View className="mb-8">
                        <View className="flex-row justify-between items-center mb-4">
                            <View>
                                <Text className="font-bold text-gray-900 text-2xl mb-0.5">Community Activity</Text>
                                <Text className="text-gray-600 text-sm font-medium">Recent active reports</Text>
                            </View>
                            <TouchableOpacity
                                onPress={() => router.push('/(protected)/community')}
                                className="flex-row items-center bg-blue-600 px-4 py-2.5 rounded-full"
                                activeOpacity={0.8}
                            >
                                <Text className="text-white font-bold text-sm">View All</Text>
                                <ChevronRight size={16} color="white" strokeWidth={3} />
                            </TouchableOpacity>
                        </View>

                        {activeIssues && activeIssues.length > 0 ? (
                            <ScrollView horizontal showsHorizontalScrollIndicator={false} className="-mx-6 px-6">
                                <View className="flex-row gap-2.5">
                                    {activeIssues.slice(0, 10).map((issue: any) => {
                                        const statusColors = getStatusColor(issue.status);
                                        const severityColors = getSeverityColor(issue.severity);
                                        return (
                                            <TouchableOpacity
                                                key={issue.id}
                                                className="bg-white p-3 rounded-2xl border-2 border-gray-200 shadow-md w-48"
                                                onPress={() => router.push(`/issue/${issue.id}`)}
                                                activeOpacity={0.9}
                                            >
                                                <View className="flex-row items-start justify-between mb-2">
                                                    <View className={clsx("w-8 h-8 rounded-lg items-center justify-center", statusColors.bg)}>
                                                        <LayoutDashboard size={16} color={statusColors.icon} strokeWidth={2} />
                                                    </View>
                                                    <View className="flex-row gap-1">
                                                        {issue.severity && (
                                                            <View className={clsx("px-1.5 py-0.5 rounded-md flex-row items-center", severityColors.bg)}>
                                                                <AlertTriangle size={8} color={severityColors.icon} strokeWidth={2.5} />
                                                            </View>
                                                        )}
                                                        <View className={clsx("px-2 py-0.5 rounded-full flex-row items-center gap-1", statusColors.bg)}>
                                                            <View className="w-1 h-1 rounded-full" style={{ backgroundColor: statusColors.dot }} />
                                                            <Text className={clsx("text-[9px] font-bold", statusColors.text)}>
                                                                {issue.status.replace('_', ' ').toUpperCase()}
                                                            </Text>
                                                        </View>
                                                    </View>
                                                </View>

                                                <Text className="font-bold text-gray-900 text-xs mb-1.5 leading-tight" numberOfLines={2}>
                                                    {issue.title}
                                                </Text>

                                                <View className="flex-row items-center mb-1.5">
                                                    <MapPin size={10} color="#6b7280" strokeWidth={2} />
                                                    <Text className="text-gray-600 text-[10px] ml-1 flex-1 font-medium" numberOfLines={1}>
                                                        {issue.location || 'Location not specified'}
                                                    </Text>
                                                </View>

                                                <View className="flex-row items-center justify-between pt-1.5 border-t border-gray-200">
                                                    <View className="flex-row items-center">
                                                        <Clock size={9} color="#9ca3af" strokeWidth={2} />
                                                        <Text className="text-gray-500 text-[9px] ml-1 font-medium">
                                                            {new Date(issue.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                                        </Text>
                                                    </View>
                                                    <View className="flex-row items-center gap-2">
                                                        <View className="flex-row items-center">
                                                            <ThumbsUp size={9} color="#6b7280" strokeWidth={2} />
                                                            <Text className="text-[9px] text-gray-600 ml-0.5 font-bold">{issue.upvotes || 0}</Text>
                                                        </View>
                                                        <View className="flex-row items-center">
                                                            <MessageCircle size={9} color="#6b7280" strokeWidth={2} />
                                                            <Text className="text-[9px] text-gray-600 ml-0.5 font-bold">{issue.comments || 0}</Text>
                                                        </View>
                                                    </View>
                                                </View>
                                            </TouchableOpacity>
                                        );
                                    })}
                                </View>
                            </ScrollView>
                        ) : (
                            <View className="items-center py-10 bg-white rounded-3xl border-2 border-dashed border-gray-300">
                                <View className="w-16 h-16 bg-blue-50 rounded-full items-center justify-center mb-3">
                                    <Sparkles size={28} color="#3b82f6" strokeWidth={2} />
                                </View>
                                <Text className="text-gray-900 font-bold text-lg mb-1">All Clear!</Text>
                                <Text className="text-gray-600 text-sm font-medium">No active issues right now</Text>
                            </View>
                        )}
                    </View>

                    {/* My Recent Reports */}
                    <View className="mb-4">
                        <View className="flex-row justify-between items-center mb-4">
                            <View>
                                <Text className="font-bold text-gray-900 text-2xl mb-0.5">My Reports</Text>
                                <Text className="text-gray-600 text-sm font-medium">Your contributions</Text>
                            </View>
                            <TouchableOpacity
                                onPress={() => router.push('/(protected)/my-reports')}
                                className="flex-row items-center bg-gray-200 px-4 py-2.5 rounded-full"
                                activeOpacity={0.8}
                            >
                                <Text className="text-gray-900 font-bold text-sm">History</Text>
                                <ChevronRight size={16} color="#111827" strokeWidth={3} />
                            </TouchableOpacity>
                        </View>

                        {issues && issues.length > 0 ? (
                            issues.slice(0, 3).map((issue: any) => {
                                const statusColors = getStatusColor(issue.status);
                                return (
                                    <TouchableOpacity
                                        key={issue.id}
                                        className="bg-white p-5 rounded-3xl border-2 border-gray-200 shadow-lg mb-4"
                                        onPress={() => router.push(`/issue/${issue.id}`)}
                                        activeOpacity={0.9}
                                    >
                                        <View className="flex-row justify-between items-start mb-3">
                                            <View className="flex-1 mr-4">
                                                <Text className="font-bold text-gray-900 text-lg mb-1 leading-snug" numberOfLines={1}>
                                                    {issue.title}
                                                </Text>
                                                <View className="flex-row items-center">
                                                    <Clock size={12} color="#6b7280" strokeWidth={2} />
                                                    <Text className="text-gray-700 text-sm ml-1.5 font-medium">
                                                        {new Date(issue.createdAt).toLocaleDateString(undefined, {
                                                            month: 'short', day: 'numeric', year: 'numeric'
                                                        })}
                                                    </Text>
                                                </View>
                                            </View>
                                            <View className={clsx("px-3 py-2 rounded-full flex-row items-center gap-1.5", statusColors.bg)}>
                                                <View className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: statusColors.dot }} />
                                                <Text className={clsx("text-xs font-bold", statusColors.text)}>
                                                    {issue.status.replace('_', ' ').toUpperCase()}
                                                </Text>
                                            </View>
                                        </View>

                                        <View className="flex-row items-center pt-3 border-t border-gray-200">
                                            <MapPin size={14} color="#6b7280" strokeWidth={2} />
                                            <Text className="text-gray-700 text-sm ml-2 flex-1 font-medium" numberOfLines={1}>
                                                {issue.location || 'Location not specified'}
                                            </Text>
                                            <ArrowRight size={18} color="#2563eb" strokeWidth={2.5} />
                                        </View>
                                    </TouchableOpacity>
                                );
                            })
                        ) : (
                            <View className="bg-white p-10 rounded-3xl border-2 border-gray-200 items-center shadow-lg">
                                <View className="w-20 h-20 bg-blue-100 rounded-full items-center justify-center mb-4">
                                    <Zap size={36} color="#1d4ed8" strokeWidth={2} />
                                </View>
                                <Text className="text-gray-900 font-bold text-xl mb-2">No reports yet</Text>
                                <Text className="text-gray-600 text-sm text-center px-4 mb-6 leading-relaxed font-medium">
                                    Start making a difference in your community today
                                </Text>
                                <TouchableOpacity
                                    className="bg-blue-600 px-8 py-4 rounded-full shadow-lg"
                                    onPress={() => router.push('/report')}
                                    activeOpacity={0.8}
                                >
                                    <Text className="text-white font-bold text-base">Create First Report</Text>
                                </TouchableOpacity>
                            </View>
                        )}
                    </View>

                </View>
            </ScrollView>
        </SafeAreaView>
    );
}
