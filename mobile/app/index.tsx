import { Redirect } from 'expo-router';
import { useAuth } from '../lib/AuthContext';
import { View, ActivityIndicator } from 'react-native';

export default function Index() {
    const { user, loading } = useAuth();

    if (loading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" color="#ea580c" />
            </View>
        );
    }

    if (user) {
        return <Redirect href="/(protected)/home" />;
    }

    return <Redirect href="/(auth)/login" />;
}
