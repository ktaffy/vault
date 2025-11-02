import Constants from 'expo-constants';

type Environment = 'development' | 'staging' | 'production';

const ENV = {
    development: {
        apiUrl: process.env.EXPO_PUBLIC_API_URL,
    },
    staging: {
        apiUrl: process.env.EXPO_PUBLIC_API_URL,
    },
    production: {
        apiUrl: process.env.EXPO_PUBLIC_API_URL, // For future App Store release
    },
};

function getEnvironment(): Environment {
    const executionEnv = Constants.executionEnvironment;
    if (executionEnv === 'storeClient') {
        return 'development';
    }
    const channel = Constants.expoConfig?.extra?.eas?.channel;
    if (channel === 'production') {
        return 'production';
    }
    return 'staging';
}

const environment = getEnvironment();

export default ENV[environment];