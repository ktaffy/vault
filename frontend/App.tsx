import { Provider } from 'react-redux';
import { ThemeProvider } from './src/context/ThemeContext';
import { store } from './src/store/store';
import { View, Text, StyleSheet, ScrollView, SafeAreaView } from 'react-native';
import { useTheme } from './src/hooks/useTheme';
import { Button, Input } from './src/components/common';

const TestScreen = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.colors.background }]}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.title, { color: theme.colors.text }]}>
            Vault Components
          </Text>
          <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
            Professional UI Testing
          </Text>
        </View>

        {/* Theme Toggle */}
        <Button
          title={`Switch to ${theme.isDark ? 'Light' : 'Dark'} Mode`}
          onPress={toggleTheme}
          variant="ghost"
          fullWidth
        />

        {/* Button Showcase */}
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
          Button Variants
        </Text>

        <Button title="Primary Action" variant="primary" fullWidth />
        <Button title="Secondary Action" variant="secondary" fullWidth />
        <Button title="Outline Action" variant="outline" fullWidth />
        <Button title="Ghost Action" variant="ghost" fullWidth />

        {/* Button States */}
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
          Button States
        </Text>

        <Button title="Loading..." loading variant="primary" fullWidth />
        <Button title="Disabled" disabled variant="primary" fullWidth />

        {/* Button Sizes */}
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
          Button Sizes
        </Text>

        <View style={styles.row}>
          <Button title="Small" size="small" variant="primary" />
          <Button title="Medium" size="medium" variant="primary" />
          <Button title="Large" size="large" variant="primary" />
        </View>

        {/* Input Showcase */}
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
          Input Fields
        </Text>

        <Input
          label="Email Address"
          placeholder="you@example.com"
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <Input
          label="Password"
          placeholder="Enter your password"
          isPassword
        />

        <Input
          label="Username"
          placeholder="@username"
          helperText="Choose a unique username for your profile"
        />

        <Input
          label="Full Name"
          placeholder="John Doe"
          error="This field is required"
        />

        {/* Call to Action */}
        <View style={styles.ctaSection}>
          <Button
            title="Create Account"
            variant="primary"
            size="large"
            fullWidth
          />
          <Button
            title="Already have an account? Sign In"
            variant="ghost"
            fullWidth
          />
        </View>

        <View style={styles.spacer} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  content: {
    padding: 24,
  },
  header: {
    marginBottom: 32,
    marginTop: 8,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 16,
    letterSpacing: 0.2,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginTop: 32,
    marginBottom: 16,
    letterSpacing: 0.3,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  ctaSection: {
    marginTop: 40,
    marginBottom: 20,
  },
  spacer: {
    height: 40,
  },
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