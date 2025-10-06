import { Stack } from 'expo-router';

export default function ArtistLayout() {
    return (
        <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="index" />
            <Stack.Screen name="upload" />
            <Stack.Screen name="stats/[id]" />
        </Stack>
    );
}