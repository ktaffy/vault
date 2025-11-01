import Constants from 'expo-constants';

type Environment = 'development' | 'staging' | 'production';

const ENV = {
    development: {
        apiUrl: 'https://medieval-jeanne-tormentingly.ngrok-free.dev',
    },
    staging: {
        apiUrl: 'https://vault-production-b323.up.railway.app', // Will be filled in after deploying backend
    },
    production: {
        apiUrl: 'https://your-production-backend-url.com', // For future App Store release
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