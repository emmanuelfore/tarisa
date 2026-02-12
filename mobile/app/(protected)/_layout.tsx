import { Tabs } from 'expo-router';
import { Home, Users, Plus, UserCircle, BellRing } from 'lucide-react-native';
import { View } from 'react-native';

export default function ProtectedLayout() {
    return (
        <Tabs
            screenOptions={{
                headerShown: false,
                tabBarStyle: {
                    borderTopWidth: 1,
                    borderTopColor: '#f3f4f6',
                    height: 65,
                    paddingBottom: 10,
                    paddingTop: 10,
                },
                tabBarActiveTintColor: '#2563eb',
                tabBarInactiveTintColor: '#9ca3af',
                tabBarLabelStyle: {
                    fontSize: 12,
                    fontWeight: '500',
                }
            }}
        >
            <Tabs.Screen
                name="home"
                options={{
                    tabBarLabel: 'Home',
                    tabBarIcon: ({ color, size }) => <Home size={size} color={color} />,
                }}
            />
            <Tabs.Screen
                name="community"
                options={{
                    tabBarLabel: 'Community',
                    tabBarIcon: ({ color, size }) => <Users size={size} color={color} />,
                }}
            />
            <Tabs.Screen
                name="report"
                options={{
                    tabBarLabel: '',
                    tabBarIcon: ({ color }) => (
                        <View className="bg-blue-600 p-3 rounded-full -mt-8 shadow-lg border-4 border-white">
                            <Plus size={28} color="white" />
                        </View>
                    ),
                }}
            />
            <Tabs.Screen
                name="broadcasts"
                options={{
                    tabBarLabel: 'Updates',
                    tabBarIcon: ({ color, size }) => <BellRing size={size} color={color} />,
                }}
            />
            <Tabs.Screen
                name="profile"
                options={{
                    tabBarLabel: 'Profile',
                    tabBarIcon: ({ color, size }) => <UserCircle size={size} color={color} />,
                }}
            />
            {/* Hidden tabs that still need routes */}
            <Tabs.Screen name="map" options={{ href: null }} />
            <Tabs.Screen name="credits" options={{ href: null }} />
            <Tabs.Screen name="my-reports" options={{ href: null }} />
            <Tabs.Screen name="notifications" options={{ href: null }} />
            <Tabs.Screen name="profile/edit" options={{ href: null }} />
        </Tabs>
    );
}
