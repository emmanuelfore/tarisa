import { View, Text, TextInput, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState } from 'react';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { api } from '../../lib/api';
import { ArrowLeft, Lock, Key } from 'lucide-react-native';

export default function ResetPasswordScreen() {
    const router = useRouter();
    const params = useLocalSearchParams();
    const emailProp = params.email as string || '';

    const [email, setEmail] = useState(emailProp);
    const [token, setToken] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleReset = async () => {
        if (!email || !token || !newPassword) {
            Alert.alert('Error', 'Please fill in all fields');
            return;
        }

        setLoading(true);
        try {
            await api.post('/api/auth/reset-password', { email, token, newPassword });
            Alert.alert(
                'Success',
                'Your password has been reset successfully.',
                [
                    { text: 'Login', onPress: () => router.replace('/(auth)/login') }
                ]
            );
        } catch (error: any) {
            Alert.alert('Error', error.response?.data?.error || 'Failed to reset password.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView className="flex-1 bg-white px-6">
            <View className="mt-4 mb-8">
                <TouchableOpacity onPress={() => router.back()} className="mb-6">
                    <ArrowLeft size={24} color="#1f2937" />
                </TouchableOpacity>
                <Text className="text-3xl font-bold text-gray-900">Reset Password</Text>
                <Text className="text-gray-500 mt-2">Enter the token sent to your email and your new password.</Text>
            </View>

            <View className="space-y-4 gap-4">
                <View>
                    <Text className="text-sm font-medium text-gray-700 mb-1">Email Address</Text>
                    <View className="border border-gray-300 rounded-lg h-12 px-4 bg-gray-50 justify-center">
                        <Text className="text-gray-600">{email}</Text>
                    </View>
                </View>

                <View>
                    <Text className="text-sm font-medium text-gray-700 mb-1">Reset Token</Text>
                    <View className="flex-row items-center border border-gray-300 rounded-lg h-12 px-4 bg-white">
                        <Key size={20} color="#9ca3af" />
                        <TextInput
                            className="flex-1 ml-3 text-gray-900"
                            placeholder="123456"
                            value={token}
                            onChangeText={setToken}
                            keyboardType="number-pad"
                        />
                    </View>
                </View>

                <View>
                    <Text className="text-sm font-medium text-gray-700 mb-1">New Password</Text>
                    <View className="flex-row items-center border border-gray-300 rounded-lg h-12 px-4 bg-white">
                        <Lock size={20} color="#9ca3af" />
                        <TextInput
                            className="flex-1 ml-3 text-gray-900"
                            placeholder="New Password"
                            value={newPassword}
                            onChangeText={setNewPassword}
                            secureTextEntry
                        />
                    </View>
                </View>

                <TouchableOpacity
                    onPress={handleReset}
                    disabled={loading}
                    className="h-12 bg-blue-600 rounded-lg justify-center items-center mt-4"
                >
                    {loading ? (
                        <ActivityIndicator color="white" />
                    ) : (
                        <Text className="text-white font-bold text-lg">Reset Password</Text>
                    )}
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}
