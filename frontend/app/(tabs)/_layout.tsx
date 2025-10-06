import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Platform } from 'react-native';
import { useTheme } from '../../src/hooks/useTheme';
import { useSelector } from 'react-redux';
import { selectUser } from '../../src/store/slices/authSlice';

export default function TabsLayout() {
    const { theme } = useTheme();
    const user = useSelector(selectUser);
    const isArtist = user?.isArtist || false;

    return (
        <Tabs
            screenOptions={{
                headerShown: false,
                tabBarStyle: {
                    backgroundColor: theme.colors.background,
                    borderTopColor: theme.isDark ? '#2a2a2a' : '#e5e5e5',
                    borderTopWidth: 0.1,
                    height: Platform.OS === 'ios' ? 85 : 65,
                    paddingBottom: Platform.OS === 'ios' ? 30 : 15,
                    paddingTop: 12,
                    elevation: 0,
                    shadowOpacity: 0,
                },
                tabBarActiveTintColor: theme.colors.primary,
                tabBarInactiveTintColor: theme.colors.textSecondary,
                tabBarShowLabel: false,
            }}
        >
            <Tabs.Screen
                name="index"
                options={{
                    tabBarIcon: ({ focused, color }) => (
                        <Ionicons
                            name={focused ? 'home' : 'home-outline'}
                            size={22}
                            color={color}
                        />
                    ),
                }}
            />
            <Tabs.Screen
                name="profile"
                options={{
                    tabBarIcon: ({ focused, color }) => (
                        <Ionicons
                            name={focused ? 'person' : 'person-outline'}
                            size={22}
                            color={color}
                        />
                    ),
                }}
            />
            {isArtist && (
                <Tabs.Screen
                    name="artist"
                    options={{
                        tabBarIcon: ({ focused, color }) => (
                            <Ionicons
                                name={focused ? 'add-circle' : 'add-circle-outline'}
                                size={22}
                                color={color}
                            />
                        ),
                    }}
                />
            )}
        </Tabs>
    );
}