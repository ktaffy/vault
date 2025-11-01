# <span style="color: #9478e9ff;">Vault</span> Frontend Architecture

## Core App Flow
- **First-time user:** Welcome → Signup → Email verification → Feed
- **Returning user:** Login → Feed

## Screen Architecture

### Authentication Screens (`app/(auth)/`)
- WelcomeScreen - Landing/onboarding
- LoginScreen - Email/username + password login
- SignupScreen - Username, email, password signup
- EmailVerificationScreen - Enter verification code
- ForgotPasswordScreen - Request password reset
- ResetPasswordScreen - Set new password with token

### Main App Screens (`app/(tabs)/`)
- **FeedScreen** - Primary screen with snippet swiping
- **ProfileScreen** - User settings, liked snippets, account management
- **UploadScreen** - Upload snippet with cover art (artists only)
- **ArtistProfileScreen** - View any artist's profile and snippets

### Navigation Pattern
- **Expo Router** for file-based routing
- **Bottom tab navigator:**
  - Feed (home icon)
  - Upload (plus icon - conditional on artist status)
  - Profile (person icon)

## Tech Stack

### Core Libraries
- **React Native** with **Expo Router** (file-based routing)
- **Redux Toolkit** for global state (auth, feed, theme)
- **React Context** for theme and toast notifications
- **Expo AV** for audio playback
- **React Native Reanimated** for animations

### Key Dependencies
- `expo-router` - File-based navigation
- `@reduxjs/toolkit` - State management
- `expo-audio` - Audio playback
- `expo-image-picker` - Image/audio file selection
- `expo-linear-gradient` - Gradient backgrounds
- `react-native-reanimated` - Smooth animations
- `@expo/vector-icons` - Ionicons icon set

## Actual Folder Structure

```
frontend/
├── app/                           # Expo Router file-based routing
│   ├── _layout.tsx               # Root layout with providers
│   ├── (auth)/                   # Auth group (logged out)
│   │   ├── _layout.tsx
│   │   ├── welcome.tsx
│   │   ├── login.tsx
│   │   ├── signup.tsx
│   │   ├── email-verification.tsx
│   │   ├── forgot-password.tsx
│   │   └── reset-password.tsx
│   └── (tabs)/                   # Main app group (logged in)
│       ├── _layout.tsx
│       ├── index.tsx              # Feed screen (default)
│       ├── upload.tsx
│       ├── profile.tsx
│       └── artist-profile/
│           └── [id].tsx           # Dynamic artist profile
│
├── src/
│   ├── components/
│   │   ├── common/                # Reusable UI components
│   │   │   ├── Button.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── LoadingSpinner.tsx
│   │   │   ├── ErrorBoundary.tsx
│   │   │   ├── Toast.tsx
│   │   │   └── index.ts
│   │   ├── feed/                  # Feed-specific components
│   │   │   ├── SnippetCard.tsx    # Main snippet display card
│   │   │   └── SwipeActions.tsx   # Fire/Skip buttons
│   │   └── AuthScreenLayout.tsx   # Wrapper for auth screens
│   │
│   ├── screens/                   # Screen components (imported by app/)
│   │   ├── auth/
│   │   │   ├── WelcomeScreen.tsx
│   │   │   ├── LoginScreen.tsx
│   │   │   ├── SignupScreen.tsx
│   │   │   ├── EmailVerificationScreen.tsx
│   │   │   ├── ForgotPasswordScreen.tsx
│   │   │   └── ResetPasswordScreen.tsx
│   │   └── main/
│   │       ├── FeedScreen.tsx
│   │       ├── ProfileScreen.tsx
│   │       ├── UploadScreen.tsx
│   │       └── ArtistProfileScreen.tsx
│   │
│   ├── hooks/                     # Custom React hooks
│   │   ├── useAuth.ts             # Authentication logic
│   │   ├── useFeed.ts             # Feed data management
│   │   ├── useSwipe.ts            # Swipe actions (fire/skip)
│   │   ├── useFeedAudio.ts        # Audio playback for feed
│   │   ├── useAudioPlayback.ts    # Core audio playback hook
│   │   ├── useTheme.ts            # Theme context hook
│   │   ├── useScreenSetup.ts      # Common screen setup (insets, theme, router, toast)
│   │   └── useProfile.ts          # Profile management
│   │
│   ├── store/                     # Redux state management
│   │   ├── store.ts               # Redux store configuration
│   │   └── slices/
│   │       ├── authSlice.ts       # User auth & profile state
│   │       ├── feedSlice.ts       # Snippet feed state
│   │       └── themeSlice.ts      # Dark/light mode state
│   │
│   ├── services/                  # External service integrations
│   │   └── api/                   # Backend API calls
│   │       ├── client.ts          # Axios instance with interceptors
│   │       ├── auth.ts            # Auth endpoints
│   │       ├── feed.ts            # Feed endpoints
│   │       ├── snippets.ts        # Snippet endpoints
│   │       └── swipes.ts          # Swipe endpoints
│   │
│   ├── context/                   # React Context providers
│   │   ├── ThemeContext.tsx       # Theme provider (dark/light)
│   │   └── ToastContext.tsx       # Toast notification provider
│   │
│   ├── styles/                    # Styling system
│   │   └── theme.ts               # Theme definitions (colors, spacing)
│   │
│   ├── types/                     # TypeScript type definitions
│   │   ├── feed.ts                # Feed-related types
│   │   └── auth.ts                # Auth-related types
│   │
│   ├── utils/                     # Utility functions
│   │   ├── audioCache.ts          # Audio player caching
│   │   ├── validation.ts          # Form validation helpers
│   │   └── formatTime.ts          # Time formatting
│   │
│   └── config/
│       └── environment.ts         # Environment-based config (API URLs)
│
├── assets/                        # Static assets
├── eas.json                       # EAS Build configuration
├── app.json                       # Expo configuration
├── package.json                   # Dependencies
└── tsconfig.json                  # TypeScript configuration
```

## Component Architecture

### FeedScreen Flow
```
FeedScreen
├── Uses hooks:
│   ├── useFeed() → current snippet, loading state
│   ├── useSwipe() → fire/skip actions
│   └── useFeedAudio() → playback controls
├── Renders:
│   ├── SnippetCard (full screen)
│   │   ├── Cover art background
│   │   ├── Play/pause indicator
│   │   ├── Progress bar (seekable)
│   │   └── Snippet title + artist info
│   └── SwipeActions (overlay)
│       ├── Fire button (🔥)
│       └── Skip button (➡️)
```

### SnippetCard Component
- Full-screen card with cover art background
- Animated sound bars when playing
- Interactive progress bar for seeking
- Artist profile navigation
- Play/pause tap controls

### SwipeActions Component
- Floating fire/skip buttons
- Haptic feedback on press
- Disabled state during loading

## State Management

### Redux Slices

#### authSlice
```typescript
{
  user: User | null,
  accessToken: string | null,
  isAuthenticated: boolean,
  isLoading: boolean,
  error: string | null
}
```

#### feedSlice
```typescript
{
  snippets: FeedSnippet[],
  currentIndex: number,
  isLoading: boolean,
  isRefreshing: boolean,
  hasMore: boolean,
  error: string | null
}
```

#### themeSlice
```typescript
{
  isDark: boolean
}
```

### Context Providers

**ThemeContext**
- Manages dark/light mode
- Provides theme colors and spacing
- Persists preference to Redux

**ToastContext**
- Global toast notification system
- Success/error/info message types
- Auto-dismiss with configurable duration

## Custom Hooks

### useScreenSetup()
Consolidates common screen needs:
```typescript
const { insets, theme, router, showToast } = useScreenSetup();
```

### useFeed()
Manages feed state:
```typescript
const { currentSnippet, loading, currentIndex, refetch } = useFeed();
```

### useSwipe()
Handles swipe actions:
```typescript
const { fire, skip, currentSnippet } = useSwipe();
```

### useFeedAudio()
Controls audio playback:
```typescript
const {
  isPlaying,
  progress,
  duration,
  seekTo,
  togglePlayPause,
  pause
} = useFeedAudio();
```

### useAudioPlayback()
Core audio hook (used by useFeedAudio):
```typescript
const { play, pause, seekTo, isLoaded } = useAudioPlayback(url, options);
```

## Theme System

### Color Scheme
```typescript
// Dark Theme (Primary)
colors: {
  background: '#000000',
  surface: '#1a1a1a',
  primary: '#9478e9',      // Purple
  secondary: '#b794f6',    // Light purple
  text: '#ffffff',
  textSecondary: '#a0aec0',
  border: '#2d3748',
  error: '#f56565',
  success: '#48bb78'
}

// Light Theme
colors: {
  background: '#ffffff',
  surface: '#f7fafc',
  primary: '#9478e9',      // Same purple
  secondary: '#805ad5',
  text: '#1a202c',
  textSecondary: '#718096',
  border: '#e2e8f0',
  error: '#f56565',
  success: '#48bb78'
}
```

## Key Features Implementation

### Audio Playback
- **Expo AV** for audio playback
- **Audio caching** via `audioCache` utility
- Preloads next snippets in feed
- Pauses when app loses focus
- Seekable progress bar

### Feed Algorithm
- Backend determines personalized vs random feed
- Frontend preloads next 3 snippets
- Auto-fetches more when < 3 snippets remaining
- Optimistic UI updates on swipe

### Animations
- **React Native Reanimated** for smooth transitions
- Slide animation between snippets
- Pulsing play button when active
- Animated sound bars
- Progress bar seek animation

### Form Validation
- Centralized validation utilities
- Real-time error display
- Field-level validation rules:
  - Username: 3-30 chars, alphanumeric + underscore
  - Email: Valid format
  - Password: Min 8 chars, 1 uppercase, 1 number

### Image/Audio Upload
- **expo-image-picker** for file selection
- Multipart/form-data uploads
- Cover art support (jpg, png, webp)
- Audio validation (mp3, wav, m4a, max 15s)

## Navigation Flow

```
App Start
├── Check auth status (checkAuth hook)
├── If authenticated:
│   └── → (tabs) → Feed (index.tsx)
└── If not authenticated:
    └── → (auth) → Welcome

Auth Flow:
Welcome → Signup → Email Verification → Feed
    ↓
  Login → Feed

Main App Flow:
Feed ⇄ Upload ⇄ Profile
  ↓
Artist Profile (modal/stack)
```

## Performance Optimizations

### Audio Management
- Cached audio players for reuse
- Cleanup on component unmount
- Pause all other players when one plays
- Preload next 3 snippets

### Feed Rendering
- Single snippet rendered at a time (not FlatList)
- Slide animation for transitions
- Image caching via Expo Image
- Debounced API calls

### State Updates
- Optimistic UI for swipe actions
- Redux Toolkit for efficient re-renders
- Selective component re-renders with proper selectors

## Development Notes

### Common Patterns

**Error Handling:**
```typescript
try {
  await someApiCall();
  showToast('Success!', 'success');
} catch (error: any) {
  showToast(error.message || 'Something went wrong', 'error');
}
```

**Form Validation:**
```typescript
const validation = validateFields({
  email: validateEmail(email),
  password: validatePassword(password)
});

if (!validation.valid) {
  setErrors(validation.errors);
  return;
}
```

**Theme Usage:**
```typescript
const { theme } = useTheme();
<View style={{ backgroundColor: theme.colors.background }}>
```

### Testing Locally
```bash
# Start Expo with tunnel (for physical devices)
make app-dev

# Or start with Expo Go
make app-expo

# Check logs
npx expo start
```

## Current Implementation Status

**✅ Fully Implemented:**
- Authentication flow (signup, login, email verification, password reset)
- Feed with swipe actions (fire/skip)
- Audio playback with controls
- Profile management
- Snippet upload with cover art
- Artist profiles
- Dark/light theme
- Toast notifications
- Liked snippets library

**🔄 In Progress:**
- Feed preloading optimization
- Background audio continuation

**📋 Planned:**
- Push notifications
- Social features (share snippets)
- Comments on snippets
- Artist verification badge
