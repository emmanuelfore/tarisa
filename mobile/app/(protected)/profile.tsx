import { View, Text, TouchableOpacity, Alert, SafeAreaView, ScrollView } from 'react-native';
import { api } from '../../lib/api';
import { useRouter } from 'expo-router';
import { LogOut, User, Award, Shield, FileText, Settings, ChevronRight, UserCircle } from 'lucide-react-native';
import { useQuery } from '@tanstack/react-query';

export default function ProfileScreen() {
    const router = useRouter();

    const { data: user, isLoading } = useQuery({
        queryKey: ['user-me'],
        queryFn: async () => {
            try {
                const res = await api.get('/api/user');
                return res.data;
            } catch (e) {
                console.log(e);
                return null;
            }
        }
    });

    const handleLogout = async () => {
        try {
            await api.post('/api/auth/logout');
            Alert.alert('Logged out', 'See you soon!');
            router.replace('/(auth)/login');
        } catch (error) {
            router.replace('/(auth)/login');
        }
    };

    const { data: stats } = useQuery({
        queryKey: ['user-stats'],
        queryFn: async () => {
            const res = await api.get('/api/user/stats');
            return res.data;
        }
    });

    if (!isLoading && !user) {
        return (
            <SafeAreaView className="flex-1 bg-white items-center justify-center p-6">
                <View className="w-24 h-24 bg-gray-100 rounded-full items-center justify-center mb-6">
                    <UserCircle size={64} color="#9ca3af" />
                </View>
                <Text className="text-2xl font-bold text-gray-900 mb-2">Guest User</Text>
                <Text className="text-gray-500 text-center mb-8 px-4">
                    Sign in to track your reports, earn civic points, and see your community impact.
                </Text>
                <View className="w-full max-w-xs">
                    <TouchableOpacity
                        className="w-full bg-blue-600 rounded-xl py-4 items-center shadow-lg"
                        onPress={() => router.replace('/(auth)/login')}
                        activeOpacity={0.8}
                    >
                        <Text className="text-white font-bold text-lg">Sign In / Register</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView className="flex-1 bg-gray-50">
            <View className="bg-white px-6 py-10 items-center border-b border-gray-100">
                <View className="w-24 h-24 bg-blue-50 rounded-full items-center justify-center mb-4 border-2 border-blue-100">
                    <UserCircle size={56} color="#2563eb" />
                </View>
                <Text className="text-2xl font-bold text-gray-900">{user?.name || 'Citizen'}</Text>
                <Text className="text-gray-500 mb-2">{user?.email || 'citizen@tarisa.gov.zw'}</Text>
                <View className="flex-row items-center bg-blue-50 px-3 py-1 rounded-full">
                    <Shield size={12} color="#2563eb" />
                    <Text className="text-blue-700 font-bold text-[10px] uppercase ml-1">{user?.role || 'Citizen'}</Text>
                </View>
            </View>

            <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
                {/* Stats / Credits Section */}
                <View className="flex-row px-6 py-6 space-x-4">
                    <View className="bg-white flex-1 p-5 rounded-3xl border border-gray-100 shadow-sm items-center">
                        <Award size={32} color="#f59e0b" />
                        <Text className="text-2xl font-bold text-gray-900 mt-2">{stats?.totalCredits || 0}</Text>
                        <Text className="text-gray-500 text-xs font-medium">Civic Points</Text>
                    </View>
                    <View className="bg-white flex-1 p-5 rounded-3xl border border-gray-100 shadow-sm items-center">
                        <FileText size={32} color="#2563eb" />
                        <Text className="text-2xl font-bold text-gray-900 mt-2">{stats?.totalReports || 0}</Text>
                        <Text className="text-gray-500 text-xs font-medium">Reports</Text>
                    </View>
                </View>

                {/* Actions Section */}
                <View className="px-6 mb-8">
                    <Text className="text-gray-400 font-bold mb-4 text-xs uppercase tracking-widest pl-1">Accounts & Activity</Text>

                    <TouchableOpacity
                        onPress={() => router.push('/(protected)/profile/edit')}
                        className="bg-white flex-row items-center p-5 rounded-3xl border border-gray-100 shadow-sm mb-3"
                    >
                        <View className="w-10 h-10 bg-blue-50 rounded-2xl items-center justify-center">
                            <Settings size={20} color="#2563eb" />
                        </View>
                        <View className="ml-4 flex-1">
                            <Text className="font-bold text-gray-900 text-sm">Edit Profile</Text>
                            <Text className="text-gray-500 text-xs mt-0.5">Update your personal details</Text>
                        </View>
                        <ChevronRight size={18} color="#9ca3af" />
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={() => router.push('/(protected)/my-reports')}
                        className="bg-white flex-row items-center p-5 rounded-3xl border border-gray-100 shadow-sm mb-3"
                    >
                        <View className="w-10 h-10 bg-purple-50 rounded-2xl items-center justify-center">
                            <FileText size={20} color="#9333ea" />
                        </View>
                        <View className="ml-4 flex-1">
                            <Text className="font-bold text-gray-900 text-sm">My Reports</Text>
                            <Text className="text-gray-500 text-xs mt-0.5">Track your submitted issues</Text>
                        </View>
                        <ChevronRight size={18} color="#9ca3af" />
                    </TouchableOpacity>
                </View>

                {/* Support Section */}
                <View className="px-6 mb-10">
                    <Text className="text-gray-400 font-bold mb-4 text-xs uppercase tracking-widest pl-1">Support</Text>

                    <TouchableOpacity className="bg-white flex-row items-center p-5 rounded-3xl border border-gray-100 shadow-sm mb-3">
                        <View className="w-10 h-10 bg-gray-50 rounded-2xl items-center justify-center">
                            <Shield size={20} color="#4b5563" />
                        </View>
                        <View className="ml-4 flex-1">
                            <Text className="font-bold text-gray-900 text-sm">Privacy Policy</Text>
                        </View>
                        <ChevronRight size={18} color="#9ca3af" />
                    </TouchableOpacity>

                    <TouchableOpacity
                        className="flex-row items-center justify-center p-5 bg-red-50 rounded-3xl border border-red-100 mt-4"
                        onPress={handleLogout}
                    >
                        <LogOut size={20} color="#dc2626" />
                        <Text className="ml-2 font-bold text-red-600">Log Out</Text>
                    </TouchableOpacity>
                </View>

                <View className="h-10" />
            </ScrollView>
        </SafeAreaView>
    );
}
