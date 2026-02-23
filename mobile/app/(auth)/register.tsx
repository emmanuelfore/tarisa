import { useState, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { api } from '../../lib/api';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Mail, Lock, User, Phone, MapPin, AlertCircle, Home as HomeIcon } from 'lucide-react-native';


// You'll need to add your Google Places API key here or in environment variables


type ValidationErrors = {
    fullName?: string;
    email?: string;
    password?: string;
    phone?: string;
    nationalId?: string;
    address?: string;
};

export default function Register() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        password: '',
        phone: '',
        nationalId: '',
        address: '',
    });
    const [loading, setLoading] = useState(false);
    const [focusedField, setFocusedField] = useState<string | null>(null);
    const [errors, setErrors] = useState<ValidationErrors>({});
    const [touched, setTouched] = useState<Set<string>>(new Set());
    const [generalError, setGeneralError] = useState<string | null>(null);


    const validateField = (field: string, value: string): string | undefined => {
        switch (field) {
            case 'fullName':
                if (!value.trim()) return 'Full name is required';
                if (value.trim().length < 2) return 'Name must be at least 2 characters';
                break;
            case 'email':
                if (!value.trim()) return 'Email is required';
                if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return 'Invalid email format';
                break;
            case 'password':
                if (!value) return 'Password is required';
                if (value.length < 6) return 'Password must be at least 6 characters';
                break;
            case 'phone':
                if (!value.trim()) return 'Phone number is required';
                if (!/^[0-9+\s()-]{10,}$/.test(value)) return 'Invalid phone number';
                break;
            case 'nationalId':
                if (!value.trim()) return 'National ID is required';
                break;
            case 'address':
                if (!value.trim()) return 'Address is required';
                break;
        }
        return undefined;
    };

    const handleFieldChange = (field: keyof typeof formData, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        setTouched(prev => new Set(prev).add(field));

        const error = validateField(field, value);
        setErrors(prev => {
            const newErrors = { ...prev };
            if (error) {
                newErrors[field] = error;
            } else {
                delete newErrors[field];
            }
            return newErrors;
        });
    };



    const handleRegister = async () => {
        setGeneralError(null);

        // Validate all fields
        const newErrors: ValidationErrors = {};
        Object.keys(formData).forEach(key => {
            const error = validateField(key, formData[key as keyof typeof formData]);
            if (error) {
                newErrors[key as keyof ValidationErrors] = error;
            }
        });

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            setTouched(new Set(Object.keys(formData)));
            setGeneralError('Please fix all errors before submitting');
            return;
        }

        try {
            setLoading(true);
            const payload = {
                name: formData.fullName,
                email: formData.email,
                password: formData.password,
                phone: formData.phone,
                nationalId: formData.nationalId,
                address: formData.address,
            };

            await api.post('/api/auth/citizen/register', payload);
            router.replace('/(protected)/home');
        } catch (error: any) {
            console.log("Registration Error:", error);
            let errorMessage = 'Registration failed';

            if (error.response?.data?.error) {
                errorMessage = error.response.data.error;
            } else if (error.response?.data?.details) {
                errorMessage = error.response.data.details;
            } else if (error.message) {
                errorMessage = error.message;
            }

            setGeneralError(errorMessage);
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
                    contentContainerStyle={{ flexGrow: 1, padding: 24 }}
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                >
                    {/* Header Section */}
                    <View className="items-center mb-8 mt-4">
                        <Text className="text-4xl font-bold text-white mb-2">Join Tarisa</Text>
                        <Text className="text-blue-50 text-base">Create your account</Text>
                    </View>

                    {/* Registration Card */}
                    <View className="bg-white rounded-3xl p-6 shadow-2xl mb-6">
                        <Text className="text-2xl font-bold text-gray-900 mb-1">Get Started</Text>
                        <Text className="text-gray-500 mb-6">Fill in your details below</Text>

                        {/* Full Name Input */}
                        <View className="mb-4">
                            <Text className="text-gray-700 font-semibold mb-2">Full Name</Text>
                            <View className="relative">
                                <View className="absolute left-4 top-4 z-10">
                                    <User size={20} color={focusedField === 'fullName' ? '#f59e0b' : '#9ca3af'} />
                                </View>
                                <TextInput
                                    className={`w-full bg-gray-50 rounded-xl pl-12 pr-4 py-3.5 text-gray-900 text-base border-2 ${focusedField === 'fullName'
                                        ? 'border-amber-400 bg-amber-50'
                                        : errors.fullName && touched.has('fullName')
                                            ? 'border-red-400'
                                            : 'border-gray-200'
                                        }`}
                                    placeholder="John Doe"
                                    placeholderTextColor="#9ca3af"
                                    value={formData.fullName}
                                    onChangeText={val => handleFieldChange('fullName', val)}
                                    onFocus={() => setFocusedField('fullName')}
                                    onBlur={() => setFocusedField(null)}
                                    autoCapitalize="words"
                                    autoComplete="name"
                                    textContentType="name"
                                />
                            </View>
                            {errors.fullName && touched.has('fullName') && (
                                <Text className="text-red-600 text-xs mt-1 ml-1">{errors.fullName}</Text>
                            )}
                        </View>

                        {/* Email Input */}
                        <View className="mb-4">
                            <Text className="text-gray-700 font-semibold mb-2">Email Address</Text>
                            <View className="relative">
                                <View className="absolute left-4 top-4 z-10">
                                    <Mail size={20} color={focusedField === 'email' ? '#f59e0b' : '#9ca3af'} />
                                </View>
                                <TextInput
                                    className={`w-full bg-gray-50 rounded-xl pl-12 pr-4 py-3.5 text-gray-900 text-base border-2 ${focusedField === 'email'
                                        ? 'border-amber-400 bg-amber-50'
                                        : errors.email && touched.has('email')
                                            ? 'border-red-400'
                                            : 'border-gray-200'
                                        }`}
                                    placeholder="you@example.com"
                                    placeholderTextColor="#9ca3af"
                                    value={formData.email}
                                    onChangeText={val => handleFieldChange('email', val)}
                                    onFocus={() => setFocusedField('email')}
                                    onBlur={() => setFocusedField(null)}
                                    autoCapitalize="none"
                                    keyboardType="email-address"
                                    autoComplete="email"
                                    textContentType="emailAddress"
                                />
                            </View>
                            {errors.email && touched.has('email') && (
                                <Text className="text-red-600 text-xs mt-1 ml-1">{errors.email}</Text>
                            )}
                        </View>

                        {/* Password Input */}
                        <View className="mb-4">
                            <Text className="text-gray-700 font-semibold mb-2">Password</Text>
                            <View className="relative">
                                <View className="absolute left-4 top-4 z-10">
                                    <Lock size={20} color={focusedField === 'password' ? '#f59e0b' : '#9ca3af'} />
                                </View>
                                <TextInput
                                    className={`w-full bg-gray-50 rounded-xl pl-12 pr-4 py-3.5 text-gray-900 text-base border-2 ${focusedField === 'password'
                                        ? 'border-amber-400 bg-amber-50'
                                        : errors.password && touched.has('password')
                                            ? 'border-red-400'
                                            : 'border-gray-200'
                                        }`}
                                    placeholder="Create a password"
                                    placeholderTextColor="#9ca3af"
                                    value={formData.password}
                                    onChangeText={val => handleFieldChange('password', val)}
                                    onFocus={() => setFocusedField('password')}
                                    onBlur={() => setFocusedField(null)}
                                    secureTextEntry
                                    autoComplete="password-new"
                                    textContentType="newPassword"
                                />
                            </View>
                            {errors.password && touched.has('password') && (
                                <Text className="text-red-600 text-xs mt-1 ml-1">{errors.password}</Text>
                            )}
                        </View>

                        {/* Phone Input */}
                        <View className="mb-4">
                            <Text className="text-gray-700 font-semibold mb-2">Phone Number</Text>
                            <View className="relative">
                                <View className="absolute left-4 top-4 z-10">
                                    <Phone size={20} color={focusedField === 'phone' ? '#f59e0b' : '#9ca3af'} />
                                </View>
                                <TextInput
                                    className={`w-full bg-gray-50 rounded-xl pl-12 pr-4 py-3.5 text-gray-900 text-base border-2 ${focusedField === 'phone'
                                        ? 'border-amber-400 bg-amber-50'
                                        : errors.phone && touched.has('phone')
                                            ? 'border-red-400'
                                            : 'border-gray-200'
                                        }`}
                                    placeholder="+263 712 345 678"
                                    placeholderTextColor="#9ca3af"
                                    value={formData.phone}
                                    onChangeText={val => handleFieldChange('phone', val)}
                                    onFocus={() => setFocusedField('phone')}
                                    onBlur={() => setFocusedField(null)}
                                    keyboardType="phone-pad"
                                    autoComplete="tel"
                                    textContentType="telephoneNumber"
                                />
                            </View>
                            {errors.phone && touched.has('phone') && (
                                <Text className="text-red-600 text-xs mt-1 ml-1">{errors.phone}</Text>
                            )}
                        </View>

                        {/* National ID Input */}
                        <View className="mb-4">
                            <Text className="text-gray-700 font-semibold mb-2">National ID</Text>
                            <View className="relative">
                                <View className="absolute left-4 top-4 z-10">
                                    <HomeIcon size={20} color={focusedField === 'nationalId' ? '#f59e0b' : '#9ca3af'} />
                                </View>
                                <TextInput
                                    className={`w-full bg-gray-50 rounded-xl pl-12 pr-4 py-3.5 text-gray-900 text-base border-2 ${focusedField === 'nationalId'
                                        ? 'border-amber-400 bg-amber-50'
                                        : errors.nationalId && touched.has('nationalId')
                                            ? 'border-red-400'
                                            : 'border-gray-200'
                                        }`}
                                    placeholder="63-1234567A12"
                                    placeholderTextColor="#9ca3af"
                                    value={formData.nationalId}
                                    onChangeText={val => handleFieldChange('nationalId', val)}
                                    onFocus={() => setFocusedField('nationalId')}
                                    onBlur={() => setFocusedField(null)}
                                    autoCapitalize="characters"
                                />
                            </View>
                            {errors.nationalId && touched.has('nationalId') && (
                                <Text className="text-red-600 text-xs mt-1 ml-1">{errors.nationalId}</Text>
                            )}
                        </View>

                        {/* Address Input (Free Text) */}
                        <View className="mb-4">
                            <Text className="text-gray-700 font-semibold mb-2">Address</Text>
                            <View className="relative">
                                <View className="absolute left-4 top-4 z-10">
                                    <MapPin size={20} color={focusedField === 'address' ? '#f59e0b' : '#9ca3af'} />
                                </View>
                                <TextInput
                                    className={`w-full bg-gray-50 rounded-xl pl-12 pr-4 py-3.5 text-gray-900 text-base border-2 ${focusedField === 'address'
                                        ? 'border-amber-400 bg-amber-50'
                                        : errors.address && touched.has('address')
                                            ? 'border-red-400'
                                            : 'border-gray-200'
                                        }`}
                                    placeholder="Click to enter your address manually"
                                    placeholderTextColor="#9ca3af"
                                    value={formData.address}
                                    onChangeText={val => handleFieldChange('address', val)}
                                    onFocus={() => setFocusedField('address')}
                                    onBlur={() => setFocusedField(null)}
                                    autoCapitalize="words"
                                    autoComplete="street-address"
                                    textContentType="fullStreetAddress"
                                    multiline
                                    numberOfLines={1}
                                />
                            </View>
                            {errors.address && touched.has('address') && (
                                <Text className="text-red-600 text-xs mt-1 ml-1">{errors.address}</Text>
                            )}
                        </View>

                        {/* Register Button */}
                        <TouchableOpacity
                            onPress={handleRegister}
                            disabled={loading}
                            className={`w-full bg-blue-600 rounded-xl py-4 items-center shadow-lg mt-2 ${loading ? 'opacity-70' : ''}`}
                            activeOpacity={0.8}
                        >
                            {loading ? (
                                <ActivityIndicator color="white" />
                            ) : (
                                <Text className="text-white font-bold text-lg">Create Account</Text>
                            )}
                        </TouchableOpacity>
                    </View>

                    {/* Error Message */}
                    {generalError && (
                        <View className="bg-red-50 border-2 border-red-200 rounded-xl p-4 mb-6 flex-row items-start">
                            <AlertCircle size={20} color="#dc2626" className="mt-0.5" />
                            <Text className="text-red-700 font-medium ml-3 flex-1">{generalError}</Text>
                        </View>
                    )}

                    {/* Bottom Actions */}
                    <View className="space-y-3 mb-6">
                        <TouchableOpacity
                            className="w-full bg-white/20 backdrop-blur rounded-xl py-4 items-center border-2 border-white/30"
                            onPress={() => router.back()}
                            activeOpacity={0.8}
                        >
                            <Text className="text-white font-bold text-base">Already have an account? Sign In</Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}
