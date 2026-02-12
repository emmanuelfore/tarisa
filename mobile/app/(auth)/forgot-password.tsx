import { View, Text, TextInput, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState } from 'react';
import { useRouter } from 'expo-router';
import { api } from '../../lib/api';
import { ArrowLeft, Mail } from 'lucide-react-native';

export default function ForgotPasswordScreen() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);

    const handleReset = async () => {
        if (!email) {
            Alert.alert('Error', 'Please enter your email address');
            return;
        }

        setLoading(true);
        try {
            await api.post('/api/auth/forgot-password', { email });
            Alert.alert(
                'Check your email',
                'If an account exists with this email, we have sent password reset instructions.',
                [
                    { text: 'Enter Token', onPress: () => router.push({ pathname: '/(auth)/reset-password', params: { email } }) }
                ]
            );
        } catch (error) {
            Alert.alert('Error', 'Failed to request password reset. Please try again.');
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
                <Text className="text-3xl font-bold text-gray-900">Forgot Password?</Text>
                <Text className="text-gray-500 mt-2">Enter your email address to receive a reset token.</Text>
            </View>

            <View className="space-y-4">
                <View>
                    <Text className="text-sm font-medium text-gray-700 mb-1">Email Address</Text>
                    <View className="flex-row items-center border border-gray-300 rounded-lg h-12 px-4 bg-gray-50">
                        <Mail size={20} color="#9ca3af" />
                        <TextInput
                            className="flex-1 ml-3 text-gray-900"
                            placeholder="name@example.com"
                            value={email}
                            onChangeText={setEmail}
                            autoCapitalize="none"
                            keyboardType="email-address"
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
                        <Text className="text-white font-bold text-lg">Send Instructions</Text>
                    )}
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}
