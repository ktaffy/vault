import * as SecureStore from 'expo-secure-store';

const ACCESS_TOKEN_KEY = 'access_token';

export const secureStorage = {
    saveAccessToken: async (token: string): Promise<void> => {
        try {
            await SecureStore.setItemAsync(ACCESS_TOKEN_KEY, token);
        } catch (error) {
            console.error('Error saving access token:', error);
        }
    },

    getAccessToken: async (): Promise<string | null> => {
        try {
            return await SecureStore.getItemAsync(ACCESS_TOKEN_KEY);
        } catch (error) {
            console.error('Error getting access token', error);
            return null;
        }
    },

    deleteAccessToken: async (): Promise<void> => {
        try {
            await SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY);
        } catch (error) {
            console.error('Error deleting access token:', error);
        }
    },
};