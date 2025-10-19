import * as SecureStore from 'expo-secure-store';

const ACCESS_TOKEN_KEY = 'access_token';
const USER_KEY = 'user';

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

    saveUser: async (user: any): Promise<void> => {
        try {
            await SecureStore.setItemAsync(USER_KEY, JSON.stringify(user));
        } catch (error) {
            console.error('Error saving user:', error);
        }
    },

    getUser: async (): Promise<any | null> => {
        try {
            const userJson = await SecureStore.getItemAsync(USER_KEY);
            return userJson ? JSON.parse(userJson) : null;
        } catch (error) {
            console.error('Error getting user:', error);
            return null;
        }
    },

    deleteUser: async (): Promise<void> => {
        try {
            await SecureStore.deleteItemAsync(USER_KEY);
        } catch (error) {
            console.error('Error deleting user:', error);
        }
    },
};