import { Provider } from 'react-redux';
import { ThemeProvider } from './src/context/ThemeContext';
import { store } from './src/store/store';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from './src/hooks/useTheme';

// Test component
const TestScreen = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Text style={[styles.text, { color: theme.colors.text }]}>
        Current theme: {theme.isDark ? 'Dark' : 'Light'}
      </Text>
      <TouchableOpacity
        style={[styles.button, { backgroundColor: theme.colors.primary }]}
        onPress={toggleTheme}
      >
        <Text style={styles.buttonText}>Toggle Theme</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  text: { fontSize: 18, marginBottom: 20 },
  button: { padding: 15, borderRadius: 8 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});

export default function App() {
  return (
    <Provider store={store}>
      <ThemeProvider>
        <TestScreen />
      </ThemeProvider>
    </Provider>
  );
}