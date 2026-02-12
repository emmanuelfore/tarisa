import { View, Text, TextInput, TouchableOpacity, Alert, ActivityIndicator, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState, useEffect } from 'react';
import { useRouter } from 'expo-router';
import { api } from '../../../lib/api'; // Fixed path
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, User, Phone, MapPin, Mail, Save } from 'lucide-react-native';

export default function EditProfileScreen() {
    const router = useRouter();
    const queryClient = useQueryClient();

    // Fetch current user data
    const { data: user, isLoading } = useQuery({
        queryKey: ['user-me'],
        queryFn: async () => {
            const res = await api.get('/api/user');
            return res.data;
        }
    });

    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [address, setAddress] = useState('');
    const [ward, setWard] = useState('');

    useEffect(() => {
        if (user) {
            setName(user.name || '');
            setPhone(user.phone || '');
            setAddress(user.address || '');
            setWard(user.ward || '');
        }
    }, [user]);

    const updateMutation = useMutation({
        mutationFn: async (data: any) => {
            return await api.patch('/api/auth/profile', data);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['user-me'] });
            Alert.alert('Success', 'Profile updated successfully', [
                { text: 'OK', onPress: () => router.back() }
            ]);
        },
        onError: (error: any) => {
            Alert.alert('Error', error.response?.data?.error || 'Failed to update profile');
        }
    });

    const handleSave = () => {
        if (!name) {
            Alert.alert('Error', 'Name is required');
            return;
        }
        updateMutation.mutate({ name, phone, address, ward });
    };

    if (isLoading) {
        return (
            <SafeAreaView className="flex-1 bg-white justify-center items-center">
                <ActivityIndicator size="large" color="#2563eb" />
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView className="flex-1 bg-white">
            <View className="px-6 py-4 border-b border-gray-100 flex-row items-center justify-between">
                <View className="flex-row items-center">
                    <TouchableOpacity onPress={() => router.back()} className="mr-4">
                        <ArrowLeft size={24} color="#1f2937" />
                    </TouchableOpacity>
                    <Text className="text-xl font-bold text-gray-900">Edit Profile</Text>
                </View>
                <TouchableOpacity
                    onPress={handleSave}
                    disabled={updateMutation.isPending}
                    className="flex-row items-center bg-blue-50 px-3 py-2 rounded-lg"
                >
                    {updateMutation.isPending ? (
                        <ActivityIndicator size="small" color="#2563eb" />
                    ) : (
                        <>
                            <Save size={18} color="#2563eb" />
                            <Text className="text-blue-600 font-bold ml-2">Save</Text>
                        </>
                    )}
                </TouchableOpacity>
            </View>

            <ScrollView className="flex-1 px-6 py-6">
                <View className="space-y-6">
                    <View>
                        <Text className="text-sm font-medium text-gray-700 mb-1">Full Name</Text>
                        <View className="flex-row items-center border border-gray-300 rounded-lg h-12 px-4 bg-white">
                            <User size={20} color="#9ca3af" />
                            <TextInput
                                className="flex-1 ml-3 text-gray-900"
                                value={name}
                                onChangeText={setName}
                                placeholder="Your full name"
                            />
                        </View>
                    </View>

                    <View>
                        <Text className="text-sm font-medium text-gray-700 mb-1">Email Address</Text>
                        <View className="flex-row items-center border border-gray-200 rounded-lg h-12 px-4 bg-gray-50">
                            <Mail size={20} color="#9ca3af" />
                            <Text className="flex-1 ml-3 text-gray-500">{user?.email}</Text>
                        </View>
                        <Text className="text-xs text-gray-400 mt-1">Email cannot be changed</Text>
                    </View>

                    <View>
                        <Text className="text-sm font-medium text-gray-700 mb-1">Phone Number</Text>
                        <View className="flex-row items-center border border-gray-300 rounded-lg h-12 px-4 bg-white">
                            <Phone size={20} color="#9ca3af" />
                            <TextInput
                                className="flex-1 ml-3 text-gray-900"
                                value={phone}
                                onChangeText={setPhone}
                                placeholder="Phone number"
                                keyboardType="phone-pad"
                            />
                        </View>
                    </View>

                    <View>
                        <Text className="text-sm font-medium text-gray-700 mb-1">Home Address</Text>
                        <View className="flex-row items-center border border-gray-300 rounded-lg h-12 px-4 bg-white">
                            <MapPin size={20} color="#9ca3af" />
                            <TextInput
                                className="flex-1 ml-3 text-gray-900"
                                value={address}
                                onChangeText={setAddress}
                                placeholder="Street address"
                            />
                        </View>
                    </View>

                    <View>
                        <Text className="text-sm font-medium text-gray-700 mb-1">Ward</Text>
                        <View className="flex-row items-center border border-gray-300 rounded-lg h-12 px-4 bg-white">
                            <MapPin size={20} color="#9ca3af" />
                            <TextInput
                                className="flex-1 ml-3 text-gray-900"
                                value={ward}
                                onChangeText={setWard}
                                placeholder="Ward (e.g. Ward 7)"
                            />
                        </View>
                    </View>
                </View>
                <View className="h-20" />
            </ScrollView>
        </SafeAreaView>
    );
}
