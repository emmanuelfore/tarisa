import { View, Text, TouchableOpacity, Image, TextInput, ScrollView, Alert, Platform, ActivityIndicator, KeyboardAvoidingView } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { Camera, MapPin, AlertTriangle, CheckCircle, ChevronLeft, ChevronRight, Image as ImageIcon, X, Trash2, Check } from 'lucide-react-native';
import { useSafeAreaInsets, SafeAreaView } from 'react-native-safe-area-context';
import { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../../lib/api';
import MapView, { Marker } from 'react-native-maps';
import { formatDistanceToNow } from 'date-fns';

const STEPS = {
    PHOTO: 1,
    LOCATION: 2,
    DETAILS: 3,
    REVIEW: 4,
    SUCCESS: 5
};

const CATEGORY_ICONS: Record<string, string> = {
    'pothole': '🚧',
    'water_leak': '💧',
    'street_light': '💡',
    'refuse_collection': '🗑️',
    'traffic_lights': '🚦',
    'sewer': '🕳️',
    'other': '📝'
};

const DEFAULT_ICON = '📝';

const SEVERITIES = ['Low', 'Medium', 'High', 'Critical'];

export default function ReportScreen() {
    const router = useRouter();
    const queryClient = useQueryClient();
    const [step, setStep] = useState(STEPS.PHOTO);
    const [loading, setLoading] = useState(false);

    // Form Data
    const [image, setImage] = useState<string | null>(null);
    const [location, setLocation] = useState<Location.LocationObject | null>(null);
    const [address, setAddress] = useState<string>('Detecting location...');
    const [category, setCategory] = useState<string | null>(null);
    const [severity, setSeverity] = useState<string>('Medium');
    const [description, setDescription] = useState('');
    const [duplicateStatus, setDuplicateStatus] = useState<'checking' | 'clean' | 'found'>('checking');

    const resetForm = () => {
        setStep(STEPS.PHOTO);
        setImage(null);
        setLocation(null);
        setAddress('Detecting location...');
        setCategory(null);
        setSeverity('Medium');
        setDescription('');
        setDuplicateStatus('checking');
        setNearbyIssues([]);
        setConfirmedUnique(false);
    };

    // Reset form when screen is focused or mounted
    useEffect(() => {
        resetForm();
    }, []);

    const { data: categories = [] } = useQuery({
        queryKey: ['/api/categories'],
        queryFn: async () => {
            const res = await api.get('/api/categories');
            return res.data;
        }
    });

    // Step 1: Image
    const pickImage = async (useCamera: boolean) => {
        let result;
        if (useCamera) {
            const perm = await ImagePicker.requestCameraPermissionsAsync();
            if (!perm.granted) {
                Alert.alert('Permission needed', 'Camera permission is required');
                return;
            }
            result = await ImagePicker.launchCameraAsync({ quality: 0.5 });
        } else {
            result = await ImagePicker.launchImageLibraryAsync({ quality: 0.5 });
        }

        if (!result.canceled) {
            setImage(result.assets[0].uri);
        }
    };

    // Step 2: Location
    useEffect(() => {
        if (step === STEPS.LOCATION && !location) {
            (async () => {
                let { status } = await Location.requestForegroundPermissionsAsync();
                if (status !== 'granted') {
                    setAddress('Permission to access location was denied');
                    return;
                }

                // Use highest accuracy
                let loc = await Location.getCurrentPositionAsync({
                    accuracy: Location.Accuracy.Highest,
                    timeInterval: 1000
                });
                setLocation(loc);

                // Reverse geocode
                try {
                    let reversed = await Location.reverseGeocodeAsync({
                        latitude: loc.coords.latitude,
                        longitude: loc.coords.longitude
                    });
                    if (reversed.length > 0) {
                        const r = reversed[0];
                        // Format: 123 Street Name, City, Region
                        const addrParts = [
                            r.streetNumber,
                            r.street,
                            r.city || r.subregion,
                            r.region
                        ].filter(Boolean);
                        setAddress(addrParts.join(', '));
                    }
                } catch (e) {
                    setAddress(`${loc.coords.latitude.toFixed(6)}, ${loc.coords.longitude.toFixed(6)}`);
                }
            })();
        }
    }, [step]);

    const [nearbyIssues, setNearbyIssues] = useState<any[]>([]);

    // Step 4: Duplicate Check
    useEffect(() => {
        if (step === STEPS.REVIEW && location) {
            setDuplicateStatus('checking');
            const checkDuplicates = async () => {
                try {
                    const res = await api.get('/api/issues/nearby', {
                        params: {
                            lat: location.coords.latitude,
                            lng: location.coords.longitude,
                            radius: 0.1 // 100 meters
                        }
                    });

                    // Filter out resolved issues (backend already does this, but being safe)
                    // and maybe filter by category if needed
                    const header = res.data.filter((i: any) => i.status !== 'resolved');

                    setNearbyIssues(header);
                    setDuplicateStatus(header.length > 0 ? 'found' : 'clean');
                } catch (e) {
                    console.error("Duplicate check failed", e);
                    setDuplicateStatus('clean'); // Assume clean on error to not block user
                }
            };
            checkDuplicates();
        }
    }, [step, location]);


    const handleSubmit = async () => {
        if (!location || !category || !description) {
            Alert.alert("Missing Info", "Please ensure all fields are filled.");
            return;
        }

        setLoading(true);
        try {
            let photoUrl = null;

            // 1. Upload Photo if exists
            if (image) {
                const formData = new FormData();
                const filename = image.split('/').pop() || 'photo.jpg';
                const match = /\.(\w+)$/.exec(filename);
                const type = match ? `image/${match[1]}` : `image`;
                // @ts-ignore
                formData.append('photos', { uri: image, name: filename, type });

                // Backend /api/upload/photo expects 'photos' (array)
                const uploadRes = await api.post('/api/upload/photo', formData, {
                    headers: { 'Content-Type': 'multipart/form-data' },
                });

                if (uploadRes.data.urls && uploadRes.data.urls.length > 0) {
                    photoUrl = uploadRes.data.urls[0];
                }
            }

            // 2. Submit Issue JSON
            const payload = {
                title: `${category} Issue`, // Backend requires title
                description: description,
                category: category,
                location: address, // Backend requires location string
                priority: severity.toLowerCase(),
                // Fix: Schema expects string for coordinates (text column), but we were sending object
                coordinates: `${location.coords.latitude},${location.coords.longitude}`,
                // Backend automatically links issue to logged-in user's citizen profile
                imageUrl: photoUrl,
                photos: photoUrl ? [photoUrl] : []
            };

            await api.post('/api/issues', payload);

            // Invalidate queries to refresh data on other screens
            queryClient.invalidateQueries({ queryKey: ['issues-map'] });
            queryClient.invalidateQueries({ queryKey: ['my-issues'] });
            queryClient.invalidateQueries({ queryKey: ['my-issues-full'] });
            queryClient.invalidateQueries({ queryKey: ['community-issues'] });
            queryClient.invalidateQueries({ queryKey: ['active-issues'] });
            queryClient.invalidateQueries({ queryKey: ['user-stats'] });

            setStep(STEPS.SUCCESS);
        } catch (error: any) {
            console.error("Submit Error:", error.response?.data || error);
            Alert.alert("Error", error.response?.data?.error || "Failed to submit report. Please try again.");
        } finally {
            setLoading(false);
        }
    };


    const renderStep1 = () => (
        <View className="flex-1 px-6">
            <View className="items-center mb-8 mt-10">
                <View className="w-16 h-16 bg-blue-100 rounded-full items-center justify-center mb-4">
                    <Camera size={32} color="#2563eb" />
                </View>
                <Text className="text-2xl font-bold text-center text-gray-900">Snap a Photo</Text>
                <Text className="text-center text-gray-500 mt-2 px-8">Take a clear picture of the issue to help us locate and fix it.</Text>
            </View>

            {image ? (
                <View className="flex-1 items-center">
                    <Image source={{ uri: image }} className="w-full h-64 rounded-xl mb-6 bg-gray-100" resizeMode="cover" />
                    <TouchableOpacity onPress={() => setImage(null)} className="flex-row items-center bg-red-50 px-4 py-2 rounded-lg">
                        <Trash2 size={20} color="#dc2626" />
                        <Text className="text-red-600 font-bold ml-2">Remove Photo</Text>
                    </TouchableOpacity>
                </View>
            ) : (
                <View className="space-y-4">
                    <TouchableOpacity
                        className="bg-blue-600 p-4 rounded-xl flex-row items-center justify-center"
                        onPress={() => pickImage(true)}
                    >
                        <Camera color="white" size={24} />
                        <Text className="text-white font-bold ml-3 text-lg">Take Photo</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        className="bg-white border border-gray-200 p-4 rounded-xl flex-row items-center justify-center"
                        onPress={() => pickImage(false)}
                    >
                        <ImageIcon color="#374151" size={24} />
                        <Text className="text-gray-700 font-bold ml-3 text-lg">Select from Gallery</Text>
                    </TouchableOpacity>
                </View>
            )}

            {/* Removed Skip Button */}
        </View>
    );

    const renderStep2 = () => (
        <View className="flex-1 px-6 relative">
            <View className="items-center mb-4 mt-6">
                <Text className="text-xl font-bold text-gray-900">Confirm Location</Text>
                <Text className="text-gray-500 text-center mt-1">Drag the pin to adjust precise location.</Text>
            </View>

            <View className="bg-gray-100 h-80 rounded-2xl mb-6 relative border border-gray-200 overflow-hidden">
                {location ? (
                    <MapView
                        style={{ flex: 1 }}
                        initialRegion={{
                            latitude: location.coords.latitude,
                            longitude: location.coords.longitude,
                            latitudeDelta: 0.005,
                            longitudeDelta: 0.005,
                        }}
                        onPress={(e) => {
                            // Allow tapping to move pin
                            const { latitude, longitude } = e.nativeEvent.coordinate;
                            setLocation({ ...location, coords: { ...location.coords, latitude, longitude } });
                        }}
                    >
                        <Marker
                            coordinate={{
                                latitude: location.coords.latitude,
                                longitude: location.coords.longitude,
                            }}
                            draggable
                            onDragEnd={(e) => {
                                const { latitude, longitude } = e.nativeEvent.coordinate;
                                setLocation({ ...location, coords: { ...location.coords, latitude, longitude } });
                            }}
                        />
                    </MapView>
                ) : (
                    <View className="flex-1 items-center justify-center">
                        <Text>Loading Map...</Text>
                    </View>
                )}
            </View>

            <View className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm mb-6">
                <Text className="text-xs text-gray-400 font-bold uppercase mb-1">Detected Address</Text>
                <Text className="text-lg font-bold text-gray-900 mb-2">{address}</Text>

                {location && (
                    <View className="flex-row items-center bg-blue-50 px-3 py-1 rounded self-start">
                        <MapPin size={12} color="#2563eb" />
                        <Text className="text-blue-700 text-xs font-bold ml-1">
                            {location.coords.latitude.toFixed(6)}, {location.coords.longitude.toFixed(6)}
                        </Text>
                    </View>
                )}
            </View>
        </View>
    );

    const renderStep3 = () => (
        <ScrollView
            className="flex-1 px-6"
            contentContainerStyle={{ paddingBottom: 100 }}
            automaticallyAdjustKeyboardInsets={true}
        >
            <Text className="text-xl font-bold text-gray-900 mt-6 mb-6">Issue Details</Text>

            <Text className="text-gray-900 font-bold text-lg mb-4">Category</Text>
            <View className="flex-row flex-wrap -mx-1">
                {categories.map((cat: any) => (
                    <TouchableOpacity
                        key={cat.code}
                        className={`px-4 py-3 rounded-xl m-1 border-2 flex-row items-center ${category === cat.code ? 'bg-blue-600 border-blue-600' : 'bg-white border-gray-100'}`}
                        onPress={() => setCategory(cat.code)}
                    >
                        <Text className="text-xl mr-2">{CATEGORY_ICONS[cat.code] || DEFAULT_ICON}</Text>
                        <Text className={`font-bold ${category === cat.code ? 'text-white' : 'text-gray-700'}`}>{cat.name}</Text>
                    </TouchableOpacity>
                ))}
            </View>

            <Text className="text-sm font-bold text-gray-700 mb-3">Severity Level</Text>
            <View className="flex-row mb-6">
                {SEVERITIES.map((sev) => (
                    <TouchableOpacity
                        key={sev}
                        onPress={() => setSeverity(sev)}
                        className={`mr-2 px-4 py-2 rounded-full border ${severity === sev ? 'bg-gray-900 border-gray-900' : 'bg-white border-gray-200'}`}
                    >
                        <Text className={`font-medium ${severity === sev ? 'text-white' : 'text-gray-700'}`}>{sev}</Text>
                    </TouchableOpacity>
                ))}
            </View>

            <Text className="text-sm font-bold text-gray-700 mb-3">Description *</Text>
            <TextInput
                className="bg-gray-50 p-4 rounded-xl border border-gray-200 min-h-[150px] text-gray-900 text-base"
                placeholder="Explain the issue in detail (Required)..."
                multiline
                numberOfLines={6}
                textAlignVertical="top"
                value={description}
                onChangeText={setDescription}
                placeholderTextColor="#9ca3af"
            />
        </ScrollView>
    );

    const renderStep4 = () => (
        <ScrollView
            className="flex-1 px-6"
            contentContainerStyle={{ paddingBottom: 60 }}
        >
            <Text className="text-2xl font-bold text-gray-900 mt-6 mb-2">Review Report</Text>
            <Text className="text-gray-500 mb-6">Check if everything looks correct before submitting.</Text>

            <View className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm mb-6">
                <View className="flex-row items-center mb-4">
                    <Text className="text-3xl mr-3">{CATEGORY_ICONS[category!] || DEFAULT_ICON}</Text>
                    <View>
                        <Text className="text-lg font-bold text-gray-900">
                            {categories.find((c: any) => c.code === category)?.name || category}
                        </Text>
                        <Text className="bg-red-100 text-red-800 text-xs font-bold px-2 py-0.5 rounded self-start mt-1">{severity} Severity</Text>
                    </View>
                </View>

                <View className="flex-row items-start mb-4">
                    <MapPin size={18} color="#6b7280" className="mt-0.5" />
                    <Text className="text-gray-600 ml-2 flex-1">{address}</Text>
                </View>

                {description ? (
                    <View className="bg-gray-50 p-3 rounded-lg mb-4">
                        <Text className="text-gray-700 italic">"{description}"</Text>
                    </View>
                ) : null}

                {image && (
                    <Image source={{ uri: image }} className="w-full h-40 rounded-lg bg-gray-100" resizeMode="cover" />
                )}
            </View>

            <View className={`p-4 rounded-xl border flex-row items-start ${duplicateStatus === 'clean' ? 'bg-green-50 border-green-100' : 'bg-blue-50 border-blue-100'}`}>
                {duplicateStatus === 'checking' ? (
                    <ActivityIndicator color="#2563eb" size="small" />
                ) : duplicateStatus === 'clean' ? (
                    <CheckCircle size={24} color="#16a34a" />
                ) : (
                    <AlertTriangle size={24} color="#dc2626" />
                )}

                <View className="ml-3 flex-1">
                    {duplicateStatus === 'checking' && <Text className="text-blue-800 font-bold">Checking for duplicates...</Text>}
                    {duplicateStatus === 'clean' && (
                        <>
                            <Text className="text-green-800 font-bold">You're good to go!</Text>
                            <Text className="text-green-600 text-xs mt-1">We checked for duplicates and found no similar reports in this area.</Text>
                        </>
                    )}
                    {duplicateStatus === 'found' && (
                        <>
                            <Text className="text-blue-800 font-bold">Similar reports found</Text>
                            <Text className="text-blue-600 text-xs mt-1">
                                We found {nearbyIssues.length} existing issue(s) nearby. Please check if your issue is already reported.
                            </Text>
                        </>
                    )}
                </View>
            </View>

            {/* List Duplicates */}
            {duplicateStatus === 'found' && nearbyIssues.length > 0 && (
                <View className="mb-6">
                    <Text className="text-sm font-bold text-gray-700 mb-2">Possible Duplicates:</Text>
                    {nearbyIssues.map((issue: any) => (
                        <View key={issue.id} className="bg-gray-50 p-3 rounded-lg mb-2 border border-gray-100">
                            <View className="flex-row justify-between mb-1">
                                <Text className="font-bold text-gray-900 text-xs">{issue.title}</Text>
                                <Text className="text-gray-500 text-xs font-bold uppercase">{issue.status}</Text>
                            </View>
                            <Text className="text-gray-500 text-xs">{issue.category} • {formatDistanceToNow(new Date(issue.createdAt))} ago</Text>
                        </View>
                    ))}
                </View>
            )}

        </ScrollView>
    );

    const renderSuccessStep = () => (
        <View className="flex-1 px-6 items-center justify-center">
            <View className="w-24 h-24 bg-green-100 rounded-full items-center justify-center mb-6">
                <Check size={48} color="#16a34a" />
            </View>
            <Text className="text-3xl font-bold text-gray-900 mb-2">Success!</Text>
            <Text className="text-gray-500 text-center text-lg mb-10">
                Your report has been submitted successfully and is being reviewed.
            </Text>

            <View className="w-full bg-gray-50 p-6 rounded-2xl border border-gray-100 mb-10">
                <View className="flex-row items-center mb-4">
                    <Text className="text-2xl mr-3">{CATEGORY_ICONS[category!] || DEFAULT_ICON}</Text>
                    <Text className="text-lg font-bold text-gray-900">
                        {categories.find((c: any) => c.code === category)?.name || category}
                    </Text>
                </View>
                <View className="flex-row items-start">
                    <MapPin size={18} color="#6b7280" className="mt-0.5" />
                    <Text className="text-gray-600 ml-2 flex-1">{address}</Text>
                </View>
            </View>

            <TouchableOpacity
                className="w-full bg-blue-600 p-4 rounded-xl items-center shadow-lg mb-4"
                onPress={resetForm}
            >
                <Text className="text-white font-bold text-lg">Report Another Issue</Text>
            </TouchableOpacity>

            <TouchableOpacity
                className="w-full bg-white border border-gray-200 p-4 rounded-xl items-center"
                onPress={() => {
                    resetForm();
                    router.replace('/(protected)/home');
                }}
            >
                <Text className="text-gray-700 font-bold text-base">Return Home</Text>
            </TouchableOpacity>
        </View>
    );

    const isStepValid = () => {
        if (step === STEPS.PHOTO) return !!image;
        if (step === STEPS.LOCATION) return !!location;
        if (step === STEPS.DETAILS) return !!category && description.trim().length > 5;
        return true;
    };

    const [confirmedUnique, setConfirmedUnique] = useState(false);

    // Reset confirmation when location changes
    useEffect(() => {
        setConfirmedUnique(false);
    }, [location]);

    const renderFooter = () => {
        if (step === STEPS.SUCCESS) return null;
        return (
            <View className="p-6 bg-white border-t border-gray-100">
                {/* Confirmation Checkbox for Duplicates */}
                {duplicateStatus === 'found' && (
                    <TouchableOpacity
                        className="flex-row items-center mb-4 bg-orange-50 p-3 rounded-lg border border-orange-100"
                        onPress={() => setConfirmedUnique(!confirmedUnique)}
                    >
                        <View className={`w-5 h-5 rounded border-2 mr-3 items-center justify-center ${confirmedUnique ? 'bg-orange-500 border-orange-500' : 'border-gray-400 bg-white'}`}>
                            {confirmedUnique && <Check size={14} color="white" />}
                        </View>
                        <Text className="text-gray-700 font-bold text-sm flex-1">
                            I confirm this is a <Text className="text-orange-600">NEW</Text> issue, not a duplicate.
                        </Text>
                    </TouchableOpacity>
                )}

                <View className="flex-row space-x-4">
                    {step > 1 && (
                        <TouchableOpacity
                            onPress={() => setStep(step - 1)}
                            className="p-4 bg-gray-100 rounded-xl"
                        >
                            <ChevronLeft size={24} color="#374151" />
                        </TouchableOpacity>
                    )}

                    {step < STEPS.REVIEW ? (
                        <TouchableOpacity
                            className={`flex-1 p-4 rounded-xl flex-row items-center justify-center ${isStepValid() ? 'bg-blue-600' : 'bg-gray-300'}`}
                            onPress={() => setStep(step + 1)}
                            disabled={!isStepValid()}
                        >
                            <Text className={`font-bold text-lg mr-2 ${isStepValid() ? 'text-white' : 'text-gray-500'}`}>Next Step</Text>
                            <ChevronRight size={20} color={isStepValid() ? 'white' : '#6b7280'} />
                        </TouchableOpacity>
                    ) : (
                        <TouchableOpacity
                            className={`flex-1 p-4 rounded-xl flex-row items-center justify-center ${(loading || duplicateStatus === 'checking' || (duplicateStatus === 'found' && !confirmedUnique)) ? 'bg-gray-300' : 'bg-blue-600'}`}
                            onPress={handleSubmit}
                            disabled={loading || duplicateStatus === 'checking' || (duplicateStatus === 'found' && !confirmedUnique)}
                        >
                            {loading ? <ActivityIndicator color="white" /> : <Text className="text-white font-bold text-lg">Submit Report</Text>}
                        </TouchableOpacity>
                    )}
                </View>
            </View>
        );
    };

    const renderHeader = () => {
        if (step === STEPS.SUCCESS) return null;
        return (
            <View className="px-6 py-4 border-b border-gray-100 flex-row justify-between items-center">
                <View>
                    <Text className="text-gray-900 font-bold text-lg">Report Issue</Text>
                    <Text className="text-gray-400 text-xs">{step}/4 Steps</Text>
                </View>
                <TouchableOpacity onPress={() => router.back()} className="w-8 h-8 bg-gray-100 rounded-full items-center justify-center">
                    <X size={18} color="#6b7280" />
                </TouchableOpacity>
            </View>
        );
    };

    const CheckCircle = ({ size, color }: { size: number, color: string }) => (
        <View style={{ width: size, height: size, borderRadius: size / 2, backgroundColor: color + '20', alignItems: 'center', justifyContent: 'center' }}>
            <Check size={size * 0.7} color={color} />
        </View>
    );


    return (
        <SafeAreaView className="flex-1 bg-white">
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                className="flex-1"
                keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
            >
                {renderHeader()}

                <View className="flex-1">
                    {step === STEPS.PHOTO && renderStep1()}
                    {step === STEPS.LOCATION && renderStep2()}
                    {step === STEPS.DETAILS && renderStep3()}
                    {step === STEPS.REVIEW && renderStep4()}
                    {step === STEPS.SUCCESS && renderSuccessStep()}
                </View>

                {renderFooter()}
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}
