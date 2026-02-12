import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { api } from '../../lib/api';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Mail, Lock, UserCircle, AlertCircle } from 'lucide-react-native';

export default function Login() {
    const router = useRouter();
    const [isAdmin, setIsAdmin] = useState(false);
    const [email, setEmail] = useState('');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [focusedField, setFocusedField] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handleLogin = async () => {
        setError(null);

        if (isAdmin) {
            if (!username || !password) {
                setError('Please enter your username and password');
                return;
            }
        } else {
            if (!email || !password) {
                setError('Please enter your email and password');
                return;
            }
        }

        try {
            setLoading(true);
            if (isAdmin) {
                await api.post('/api/auth/login', { username, password });
            } else {
                await api.post('/api/auth/citizen/login', { email, password });
            }
            router.replace('/(protected)/home');
        } catch (error: any) {
            console.log("Login Error:", error);
            const msg = error.response?.data?.error || 'Invalid credentials. Please try again.';
            setError(msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView className="flex-1 bg-blue-600">
            <StatusBar style="light" />
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                className="flex-1"
            >
                <ScrollView
                    contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', padding: 24 }}
                    showsVerticalScrollIndicator={false}
                >
                    {/* Header Section */}
                    <View className="items-center mb-12">
                        <Text className="text-4xl font-bold text-white mb-2">Tarisa</Text>
                        <Text className="text-blue-50 text-lg">Civic Engagement Platform</Text>
                    </View>

                    {/* Login Card */}
                    <View className="bg-white rounded-3xl p-8 shadow-2xl mb-6">
                        <View className="flex-row justify-between items-center mb-6">
                            <View>
                                <Text className="text-2xl font-bold text-gray-900 mb-1">
                                    {isAdmin ? 'Staff Login' : 'Welcome Back'}
                                </Text>
                                <Text className="text-gray-500">Sign in to continue</Text>
                            </View>
                            <TouchableOpacity
                                onPress={() => setIsAdmin(!isAdmin)}
                                className={`px-4 py-2 rounded-full border ${isAdmin ? 'bg-amber-100 border-amber-300' : 'bg-blue-100 border-blue-300'}`}
                            >
                                <Text className={`font-bold text-xs ${isAdmin ? 'text-amber-700' : 'text-blue-700'}`}>
                                    {isAdmin ? 'STAFF MODE' : 'CITIZEN MODE'}
                                </Text>
                            </TouchableOpacity>
                        </View>

                        {/* Email/Username Input */}
                        <View className="mb-5">
                            <Text className="text-gray-700 font-semibold mb-2">
                                {isAdmin ? 'Username' : 'Email Address'}
                            </Text>
                            <View className="relative">
                                <View className="absolute left-4 top-4 z-10">
                                    {isAdmin ? (
                                        <UserCircle size={20} color={focusedField === 'username' ? '#f59e0b' : '#9ca3af'} />
                                    ) : (
                                        <Mail size={20} color={focusedField === 'email' ? '#f59e0b' : '#9ca3af'} />
                                    )}
                                </View>
                                <TextInput
                                    className={`w-full bg-gray-50 rounded-xl pl-12 pr-4 py-3.5 text-gray-900 text-base border-2 ${(isAdmin ? focusedField === 'username' : focusedField === 'email')
                                            ? 'border-amber-400 bg-amber-50'
                                            : 'border-gray-200'
                                        }`}
                                    placeholder={isAdmin ? "Enter username" : "you@example.com"}
                                    placeholderTextColor="#9ca3af"
                                    value={isAdmin ? username : email}
                                    onChangeText={isAdmin ? setUsername : setEmail}
                                    onFocus={() => setFocusedField(isAdmin ? 'username' : 'email')}
                                    onBlur={() => setFocusedField(null)}
                                    autoCapitalize="none"
                                    keyboardType={isAdmin ? "default" : "email-address"}
                                    autoComplete={isAdmin ? "username" : "email"}
                                    textContentType={isAdmin ? "username" : "emailAddress"}
                                />
                            </View>
                        </View>

                        {/* Password Input */}
                        <View className="mb-6">
                            <Text className="text-gray-700 font-semibold mb-2">Password</Text>
                            <View className="relative">
                                <View className="absolute left-4 top-4 z-10">
                                    <Lock size={20} color={focusedField === 'password' ? '#f59e0b' : '#9ca3af'} />
                                </View>
                                <TextInput
                                    className={`w-full bg-gray-50 rounded-xl pl-12 pr-4 py-3.5 text-gray-900 text-base border-2 ${focusedField === 'password'
                                        ? 'border-amber-400 bg-amber-50'
                                        : 'border-gray-200'
                                        }`}
                                    placeholder="Enter your password"
                                    placeholderTextColor="#9ca3af"
                                    value={password}
                                    onChangeText={setPassword}
                                    onFocus={() => setFocusedField('password')}
                                    onBlur={() => setFocusedField(null)}
                                    secureTextEntry
                                    autoComplete="password"
                                    textContentType="password"
                                />
                            </View>
                        </View>

                        {/* Forgot Password */}
                        {!isAdmin && (
                            <TouchableOpacity
                                onPress={() => router.push('/(auth)/forgot-password')}
                                className="mb-6"
                            >
                                <Text className="text-blue-600 font-semibold text-right">Forgot Password?</Text>
                            </TouchableOpacity>
                        )}

                        {/* Login Button */}
                        <TouchableOpacity
                            onPress={handleLogin}
                            disabled={loading}
                            className={`w-full ${isAdmin ? 'bg-amber-600' : 'bg-blue-600'} rounded-xl py-4 items-center shadow-lg ${loading ? 'opacity-70' : ''}`}
                            activeOpacity={0.8}
                        >
                            {loading ? (
                                <ActivityIndicator color="white" />
                            ) : (
                                <Text className="text-white font-bold text-lg">
                                    {isAdmin ? 'Staff Sign In' : 'Citizen Sign In'}
                                </Text>
                            )}
                        </TouchableOpacity>
                    </View>

                    {/* Error Message */}
                    {error && (
                        <View className="bg-red-50 border-2 border-red-200 rounded-xl p-4 mb-6 flex-row items-start">
                            <AlertCircle size={20} color="#dc2626" className="mt-0.5" />
                            <Text className="text-red-700 font-medium ml-3 flex-1">{error}</Text>
                        </View>
                    )}

                    {/* Bottom Actions */}
                    <View className="space-y-3">
                        {!isAdmin && (
                            <TouchableOpacity
                                className="w-full bg-white/20 backdrop-blur rounded-xl py-4 items-center border-2 border-white/30 mb-3"
                                onPress={() => router.push('/(auth)/register')}
                                activeOpacity={0.8}
                            >
                                <Text className="text-white font-bold text-lg">Create New Account</Text>
                            </TouchableOpacity>
                        )}

                        <TouchableOpacity
                            className="w-full py-4 items-center"
                            onPress={() => router.replace('/(protected)/home')}
                            activeOpacity={0.7}
                        >
                            <View className="flex-row items-center">
                                <UserCircle size={20} color="#ffffff" />
                                <Text className="text-white font-semibold text-base ml-2">Continue as Guest</Text>
                            </View>
                        </TouchableOpacity>
                    </View>

                    {/* Footer */}
                    <Text className="text-center text-white text-sm mt-8 opacity-75">
                        Staff? Use the web portal to login.
                    </Text>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}
