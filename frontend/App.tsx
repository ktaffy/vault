// App.tsx
import { Provider, useDispatch, useSelector } from 'react-redux';
import { ThemeProvider } from './src/context/ThemeContext';
import { store } from './src/store/store';
import { View, Text, StyleSheet, ScrollView, SafeAreaView } from 'react-native';
import { useTheme } from './src/hooks/useTheme';
import { Button } from './src/components/common';

// Import actions to test
import { setUser, clearAuth, selectUser, selectIsAuthenticated } from './src/store/slices/authSlice';
import { addSnippet, setCurrentIndex, selectSnippets, selectCurrentIndex } from './src/store/slices/feedSlice';
import { setPlaying, setProgress, selectIsPlaying, selectProgress } from './src/store/slices/audioSlice';
import type { AppDispatch } from './src/store/store';

const TestScreen = () => {
  const { theme, toggleTheme } = useTheme();
  const dispatch = useDispatch<AppDispatch>();

  // Test selectors
  const user = useSelector(selectUser);
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const snippets = useSelector(selectSnippets);
  const currentIndex = useSelector(selectCurrentIndex);
  const isPlaying = useSelector(selectIsPlaying);
  const progress = useSelector(selectProgress);

  // Test auth slice
  const testAuth = () => {
    dispatch(setUser({
      id: '1',
      username: 'testuser',
      email: 'test@vault.com',
      isArtist: true,
      emailVerified: true,
    }));
  };

  const testLogout = () => {
    dispatch(clearAuth());
  };

  // Test feed slice
  const testFeed = () => {
    dispatch(addSnippet({
      id: 1,
      title: 'Test Snippet',
      artistId: 1,
      artistName: 'Test Artist',
      audioUrl: 'https://test.com/audio.mp3',
      durationSeconds: 15,
      playCount: 100,
      fireCount: 50,
    }));
  };

  const testNextSnippet = () => {
    dispatch(setCurrentIndex(currentIndex + 1));
  };

  // Test audio slice
  const testPlay = () => {
    dispatch(setPlaying(true));
  };

  const testPause = () => {
    dispatch(setPlaying(false));
  };

  const testProgress = () => {
    dispatch(setProgress(0.5));
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.colors.background }]}>
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <Text style={[styles.title, { color: theme.colors.text }]}>
          Redux Store Test
        </Text>

        {/* Theme Test */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            Theme Slice ✅
          </Text>
          <Text style={[styles.info, { color: theme.colors.textSecondary }]}>
            Current: {theme.isDark ? 'Dark' : 'Light'}
          </Text>
          <Button title="Toggle Theme" onPress={toggleTheme} />
        </View>

        {/* Auth Test */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            Auth Slice
          </Text>
          <Text style={[styles.info, { color: theme.colors.textSecondary }]}>
            Authenticated: {isAuthenticated ? 'Yes' : 'No'}
          </Text>
          {user && (
            <Text style={[styles.info, { color: theme.colors.textSecondary }]}>
              User: {user.username} ({user.email})
            </Text>
          )}
          <Button title="Login Test User" onPress={testAuth} />
          <Button title="Logout" onPress={testLogout} variant="outline" />
        </View>

        {/* Feed Test */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            Feed Slice
          </Text>
          <Text style={[styles.info, { color: theme.colors.textSecondary }]}>
            Snippets: {snippets.length}
          </Text>
          <Text style={[styles.info, { color: theme.colors.textSecondary }]}>
            Current Index: {currentIndex}
          </Text>
          {snippets[currentIndex] && (
            <Text style={[styles.info, { color: theme.colors.textSecondary }]}>
              Playing: {snippets[currentIndex].title}
            </Text>
          )}
          <Button title="Add Snippet" onPress={testFeed} />
          <Button title="Next Snippet" onPress={testNextSnippet} variant="outline" />
        </View>

        {/* Audio Test */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            Audio Slice
          </Text>
          <Text style={[styles.info, { color: theme.colors.textSecondary }]}>
            Playing: {isPlaying ? 'Yes' : 'No'}
          </Text>
          <Text style={[styles.info, { color: theme.colors.textSecondary }]}>
            Progress: {Math.round(progress * 100)}%
          </Text>
          <Button title={isPlaying ? 'Pause' : 'Play'} onPress={isPlaying ? testPause : testPlay} />
          <Button title="Set Progress 50%" onPress={testProgress} variant="outline" />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default function App() {
  return (
    <Provider store={store}>
      <ThemeProvider>
        <TestScreen />
      </ThemeProvider>
    </Provider>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 30,
  },
  section: {
    marginBottom: 30,
    gap: 10,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 8,
  },
  info: {
    fontSize: 14,
    marginBottom: 4,
  },
});