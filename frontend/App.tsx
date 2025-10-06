import { Provider, useDispatch } from 'react-redux';
import { ThemeProvider } from './src/context/ThemeContext';
import { store } from './src/store/store';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, Alert, TextInput } from 'react-native';
import { useTheme } from './src/hooks/useTheme';
import { useAuth } from './src/hooks/useAuth';
import { useFeed } from './src/hooks/useFeed';
import { useSwipe } from './src/hooks/useSwipe';
import { useAudio } from './src/hooks/useAudio';
import { Button } from './src/components/common';
import { useState, useEffect } from 'react';
import type { AppDispatch } from './src/store/store';
import { clearFeed } from './src/store/slices/feedSlice';

const TestScreen = () => {
  const { theme, toggleTheme } = useTheme();
  const dispatch = useDispatch<AppDispatch>();

  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [signupUsername, setSignupUsername] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');

  const { user, isAuthenticated, loading: authLoading, error: authError, login, signup, logout } = useAuth();
  const { snippets, currentSnippet, currentIndex, hasMore, loading: feedLoading, fetchNextSnippet } = useFeed();
  const { fire, skip } = useSwipe();
  const { isPlaying, progress, duration, isBuffering, play, pause, togglePlayPause, seek } = useAudio();

  useEffect(() => {
    if (currentSnippet) {
      play();
    }
  }, [currentSnippet]);

  const testLogin = async () => {
    if (!loginIdentifier || !loginPassword) {
      Alert.alert('❌ Error', 'Please enter identifier and password');
      return;
    }
    try {
      await login(loginIdentifier, loginPassword);
      Alert.alert('✅ Success', 'Login successful!');
      setLoginIdentifier('');
      setLoginPassword('');
    } catch (err: any) {
      Alert.alert('❌ Error', err.message);
    }
  };

  const testSignup = async () => {
    if (!signupUsername || !signupEmail || !signupPassword) {
      Alert.alert('❌ Error', 'Please fill all signup fields');
      return;
    }
    try {
      await signup(signupUsername, signupEmail, signupPassword);
      Alert.alert('✅ Success', 'Signup successful!');
      setSignupUsername('');
      setSignupEmail('');
      setSignupPassword('');
    } catch (err: any) {
      Alert.alert('❌ Error', err.message);
    }
  };

  const testLogout = async () => {
    await logout();
    Alert.alert('✅ Success', 'Logged out!');
  };

  const testFetchSnippet = async () => {
    await fetchNextSnippet();
  };

  const testFire = () => {
    fire();
  };

  const testSkip = () => {
    skip();
  };

  const clearFeedState = () => {
    dispatch(clearFeed());
    Alert.alert('✅', 'Feed state cleared!');
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.colors.background }]}>
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <Text style={[styles.title, { color: theme.colors.text }]}>
          🧪 Vault Hook Tester
        </Text>

        <View style={[styles.card, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
          <Text style={[styles.cardTitle, { color: theme.colors.primary }]}>
            🎨 useTheme
          </Text>
          <View style={styles.infoRow}>
            <Text style={[styles.label, { color: theme.colors.text }]}>Mode:</Text>
            <Text style={[styles.value, { color: theme.colors.textSecondary }]}>
              {theme.isDark ? '🌙 Dark' : '☀️ Light'}
            </Text>
          </View>
          <Button title="Toggle Theme" onPress={toggleTheme} variant="outline" size="small" />
        </View>

        <View style={[styles.card, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
          <Text style={[styles.cardTitle, { color: theme.colors.primary }]}>
            🔐 useAuth
          </Text>
          <View style={styles.infoRow}>
            <Text style={[styles.label, { color: theme.colors.text }]}>Status:</Text>
            <Text style={[styles.value, { color: isAuthenticated ? theme.colors.success : theme.colors.error }]}>
              {isAuthenticated ? '✅ Authenticated' : '❌ Not Authenticated'}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={[styles.label, { color: theme.colors.text }]}>Loading:</Text>
            <Text style={[styles.value, { color: theme.colors.textSecondary }]}>
              {authLoading ? '⏳ Yes' : 'No'}
            </Text>
          </View>
          {user && (
            <View style={styles.infoRow}>
              <Text style={[styles.label, { color: theme.colors.text }]}>User:</Text>
              <Text style={[styles.value, { color: theme.colors.textSecondary }]}>
                {user.username}
              </Text>
            </View>
          )}
          {authError && (
            <Text style={[styles.error, { color: theme.colors.error }]}>
              ⚠️ {authError}
            </Text>
          )}

          <View style={styles.authSection}>
            <Text style={[styles.sectionLabel, { color: theme.colors.text }]}>Login</Text>
            <TextInput
              style={[styles.input, {
                backgroundColor: theme.colors.background,
                color: theme.colors.text,
                borderColor: theme.colors.border
              }]}
              placeholder="Username or Email"
              placeholderTextColor={theme.colors.textSecondary}
              value={loginIdentifier}
              onChangeText={setLoginIdentifier}
              autoCapitalize="none"
            />
            <TextInput
              style={[styles.input, {
                backgroundColor: theme.colors.background,
                color: theme.colors.text,
                borderColor: theme.colors.border
              }]}
              placeholder="Password"
              placeholderTextColor={theme.colors.textSecondary}
              value={loginPassword}
              onChangeText={setLoginPassword}
              secureTextEntry
            />
            <Button title="Login" onPress={testLogin} size="small" disabled={authLoading} />
          </View>

          <View style={styles.authSection}>
            <Text style={[styles.sectionLabel, { color: theme.colors.text }]}>Signup</Text>
            <TextInput
              style={[styles.input, {
                backgroundColor: theme.colors.background,
                color: theme.colors.text,
                borderColor: theme.colors.border
              }]}
              placeholder="Username"
              placeholderTextColor={theme.colors.textSecondary}
              value={signupUsername}
              onChangeText={setSignupUsername}
              autoCapitalize="none"
            />
            <TextInput
              style={[styles.input, {
                backgroundColor: theme.colors.background,
                color: theme.colors.text,
                borderColor: theme.colors.border
              }]}
              placeholder="Email"
              placeholderTextColor={theme.colors.textSecondary}
              value={signupEmail}
              onChangeText={setSignupEmail}
              autoCapitalize="none"
              keyboardType="email-address"
            />
            <TextInput
              style={[styles.input, {
                backgroundColor: theme.colors.background,
                color: theme.colors.text,
                borderColor: theme.colors.border
              }]}
              placeholder="Password"
              placeholderTextColor={theme.colors.textSecondary}
              value={signupPassword}
              onChangeText={setSignupPassword}
              secureTextEntry
            />
            <Button title="Signup" onPress={testSignup} size="small" variant="outline" disabled={authLoading} />
          </View>

          <Button title="Logout" onPress={testLogout} size="small" variant="ghost" disabled={authLoading} />
        </View>

        <View style={[styles.card, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
          <Text style={[styles.cardTitle, { color: theme.colors.primary }]}>
            📱 useFeed
          </Text>
          <View style={styles.infoRow}>
            <Text style={[styles.label, { color: theme.colors.text }]}>Snippets:</Text>
            <Text style={[styles.value, { color: theme.colors.textSecondary }]}>
              {snippets.length} loaded
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={[styles.label, { color: theme.colors.text }]}>Current Index:</Text>
            <Text style={[styles.value, { color: theme.colors.textSecondary }]}>
              {currentIndex}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={[styles.label, { color: theme.colors.text }]}>Has More:</Text>
            <Text style={[styles.value, { color: theme.colors.textSecondary }]}>
              {hasMore ? '✅ Yes' : '❌ No'}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={[styles.label, { color: theme.colors.text }]}>Loading:</Text>
            <Text style={[styles.value, { color: theme.colors.textSecondary }]}>
              {feedLoading ? '⏳ Yes' : 'No'}
            </Text>
          </View>

          {currentSnippet && (
            <View style={[styles.snippetPreview, { backgroundColor: theme.colors.background, borderColor: theme.colors.primary }]}>
              <Text style={[styles.snippetTitle, { color: theme.colors.text }]}>
                🎵 {currentSnippet.title}
              </Text>
              <Text style={[styles.snippetArtist, { color: theme.colors.textSecondary }]}>
                by {currentSnippet.artistName}
              </Text>
              <Text style={[styles.snippetStats, { color: theme.colors.textSecondary }]}>
                🔥 {currentSnippet.fireCount} • ▶️ {currentSnippet.playCount}
              </Text>
            </View>
          )}

          <View style={styles.buttonRow}>
            <Button
              title="📥 Fetch"
              onPress={testFetchSnippet}
              variant="primary"
              size="small"
              disabled={feedLoading || !hasMore}
            />
            <Button
              title="🗑️ Clear"
              onPress={clearFeedState}
              variant="ghost"
              size="small"
            />
          </View>
        </View>

        <View style={[styles.card, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
          <Text style={[styles.cardTitle, { color: theme.colors.primary }]}>
            🎧 useAudio - NOW PLAYING
          </Text>
          <View style={styles.infoRow}>
            <Text style={[styles.label, { color: theme.colors.text }]}>Status:</Text>
            <Text style={[styles.value, { color: isPlaying ? theme.colors.success : theme.colors.textSecondary }]}>
              {isPlaying ? '▶️ PLAYING' : '⏸️ PAUSED'}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={[styles.label, { color: theme.colors.text }]}>Progress:</Text>
            <Text style={[styles.value, { color: theme.colors.textSecondary }]}>
              {Math.round(progress * 100)}%
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={[styles.label, { color: theme.colors.text }]}>Duration:</Text>
            <Text style={[styles.value, { color: theme.colors.textSecondary }]}>
              {Math.round(duration)}s
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={[styles.label, { color: theme.colors.text }]}>Buffering:</Text>
            <Text style={[styles.value, { color: theme.colors.textSecondary }]}>
              {isBuffering ? '⏳ Yes' : 'No'}
            </Text>
          </View>

          <View style={[styles.progressBar, { backgroundColor: theme.colors.border }]}>
            <View
              style={[
                styles.progressFill,
                { width: `${progress * 100}%`, backgroundColor: theme.colors.primary }
              ]}
            />
          </View>

          <View style={styles.buttonRow}>
            <Button
              title={isPlaying ? '⏸️ Pause' : '▶️ Play'}
              onPress={togglePlayPause}
              variant="primary"
              size="small"
            />
            
            <Button
              title="⏪ 0%"
              onPress={() => seek(0)}
              variant="outline"
              size="small"
            />
            <Button
              title="⏩ 50%"
              onPress={() => seek(0.5)}
              variant="outline"
              size="small"
            />
          </View>
        </View>

        <View style={[styles.card, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
          <Text style={[styles.cardTitle, { color: theme.colors.primary }]}>
            👆 useSwipe
          </Text>
          <View style={styles.infoRow}>
            <Text style={[styles.label, { color: theme.colors.text }]}>Current:</Text>
            <Text style={[styles.value, { color: theme.colors.textSecondary }]} numberOfLines={1}>
              {currentSnippet ? currentSnippet.title : 'None'}
            </Text>
          </View>
          <View style={styles.buttonRow}>
            <Button
              title="🔥 Fire"
              onPress={testFire}
              variant="primary"
              disabled={!currentSnippet}
            />
            <Button
              title="⏭️ Skip"
              onPress={testSkip}
              variant="outline"
              disabled={!currentSnippet}
            />
          </View>
        </View>

        <View style={[styles.summary, { backgroundColor: theme.colors.surface, borderColor: theme.colors.primary }]}>
          <Text style={[styles.summaryTitle, { color: theme.colors.primary }]}>
            ✅ All Hooks Ready + Audio Playing!
          </Text>
          <Text style={[styles.summaryText, { color: theme.colors.textSecondary }]}>
            useTheme • useAuth • useFeed • useSwipe • useAudio
          </Text>
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
    padding: 16,
    paddingBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  card: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 16,
    gap: 12,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    flex: 0,
  },
  value: {
    fontSize: 14,
    flex: 1,
    textAlign: 'right',
  },
  error: {
    fontSize: 13,
    fontWeight: '500',
  },
  authSection: {
    gap: 8,
    marginTop: 8,
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  snippetPreview: {
    padding: 12,
    borderRadius: 8,
    marginTop: 4,
    borderWidth: 2,
  },
  snippetTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  snippetArtist: {
    fontSize: 13,
    marginBottom: 4,
  },
  snippetStats: {
    fontSize: 12,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
    marginTop: 8,
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  summary: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    marginTop: 8,
    alignItems: 'center',
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  summaryText: {
    fontSize: 13,
    textAlign: 'center',
  },
});