import { Provider } from 'react-redux';
import { ThemeProvider } from './src/context/ThemeContext';
import { store } from './src/store/store';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { WelcomeScreen } from './src/screens/auth/WelcomeScreen';
import { LoginScreen } from './src/screens/auth/LoginScreen';
import { SignupScreen } from './src/screens/auth/SignupScreen';
import { EmailVerificationScreen } from './src/screens/auth/EmailVerificationScreen';
import { ForgotPasswordScreen } from './src/screens/auth/ForgotPasswordScreen';
import { ResetPasswordScreen } from './src/screens/auth/ResetPasswordScreen';
import { useTheme } from './src/hooks/useTheme';
import { AuthStackParamList } from './src/navigation/types';

const Stack = createNativeStackNavigator<AuthStackParamList>();

function AppContent() {
  const { theme } = useTheme();

  return (
    <>
      <StatusBar style={theme.isDark ? 'light' : 'dark'} />
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Welcome" component={WelcomeScreen} />
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Signup" component={SignupScreen} />
          <Stack.Screen name="EmailVerification" component={EmailVerificationScreen} />
          <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
          <Stack.Screen name="ResetPassword" component={ResetPasswordScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </>
  );
}

export default function App() {
  return (
    <Provider store={store}>
      <SafeAreaProvider>
        <ThemeProvider>
          <AppContent />
        </ThemeProvider>
      </SafeAreaProvider>
    </Provider>
  );
}