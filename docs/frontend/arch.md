# <span style="color: #9478e9ff;">Vault</span> Frontend Architecture

## Core App Flow
- **First-time user:** Onboarding → Signup → Email verification → Random feed (20 swipes) → Personalized feed
- **Returning user:** Login → Personalized feed

## Screen Architecture

### Authentication Stack
- Welcome/Landing, Login, Signup, Email Verification, Forgot/Reset Password

### Main App Stack  
- **Feed** (primary - endless scroll swiping)
- **Profile** (settings, account management)
- **Artist Dashboard** (snippet management, stats - conditional)

### Navigation Pattern
Bottom tab navigator:
- Feed (home icon)
- Profile (person icon)
- Upload (plus icon - artists only)

## Tech Stack Decisions

### State Management
- **Redux Toolkit** for complex app state
- **React Context** for theme management

### Audio Library
- **react-native-track-player** for streaming and background audio

### Styling
- **StyleSheet** with theme system
- **Dark mode:** Black & purple scheme
- **Light mode:** White & purple scheme

### Key Libraries
- `@react-navigation/native` - Navigation
- `react-native-gesture-handler` - Swipe detection
- `react-native-reanimated` - Smooth animations
- `@reduxjs/toolkit` - State management

## Folder Structure

```
src/
├── components/
│   ├── common/
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── LoadingSpinner.tsx
│   │   └── ErrorBoundary.tsx
│   ├── feed/
│   │   ├── FeedList.tsx
│   │   ├── SnippetItem.tsx
│   │   ├── ActionButtons.tsx
│   │   ├── SnippetInfo.tsx
│   │   └── AudioVisualizer.tsx
│   ├── audio/
│   │   ├── AudioPlayer.tsx
│   │   ├── PlayButton.tsx
│   │   └── ProgressBar.tsx
│   ├── auth/
│   │   ├── AuthForm.tsx
│   │   └── EmailVerification.tsx
│   └── upload/
│       ├── AudioPicker.tsx
│       ├── AudioRecorder.tsx
│       └── UploadProgress.tsx
├── screens/
│   ├── auth/
│   │   ├── WelcomeScreen.tsx
│   │   ├── LoginScreen.tsx
│   │   ├── SignupScreen.tsx
│   │   └── EmailVerificationScreen.tsx
│   ├── main/
│   │   ├── FeedScreen.tsx
│   │   └── ProfileScreen.tsx
│   └── artist/
│       ├── ArtistDashboardScreen.tsx
│       ├── UploadScreen.tsx
│       └── StatsScreen.tsx
├── navigation/
│   ├── AppNavigator.tsx
│   ├── AuthNavigator.tsx
│   ├── MainTabNavigator.tsx
│   └── types.ts
├── services/
│   ├── api/
│   │   ├── auth.ts
│   │   ├── feed.ts
│   │   ├── snippets.ts
│   │   ├── swipes.ts
│   │   └── client.ts
│   ├── audio/
│   │   ├── AudioManager.ts
│   │   ├── AudioQueue.ts
│   │   └── AudioPreloader.ts
│   └── storage/
│       ├── SecureStorage.ts
│       └── CacheManager.ts
├── store/
│   ├── slices/
│   │   ├── authSlice.ts
│   │   ├── feedSlice.ts
│   │   ├── audioSlice.ts
│   │   └── themeSlice.ts
│   └── store.ts
├── hooks/
│   ├── useAuth.ts
│   ├── useAudio.ts
│   ├── useFeed.ts
│   ├── useSwipe.ts
│   ├── useTheme.ts
│   └── useInfiniteScroll.ts
├── styles/
│   ├── themes/
│   │   ├── dark.ts      // Black & purple
│   │   ├── light.ts     // White & purple  
│   │   ├── colors.ts
│   │   ├── typography.ts
│   │   └── index.ts
│   └── components/
│       ├── feed.styles.ts
│       └── common.styles.ts
├── types/
│   ├── api.ts
│   ├── audio.ts
│   ├── navigation.ts
│   └── theme.ts
├── utils/
│   ├── constants.ts
│   ├── validation.ts
│   └── permissions.ts
└── assets/
    ├── images/icons/
    ├── fonts/
    └── sounds/
```

## Component Architecture

### Feed (Core Experience)
- **FeedList:** Vertical FlatList with infinite scroll
- **SnippetItem:** Full-screen snippet with auto-play on viewport enter
- **ActionButtons:** Fire/Skip overlay buttons
- **Audio Management:** Global player switches sources seamlessly

### Key Components
```
FeedScreen
├── FeedList (FlatList)
│   ├── SnippetItem (repeating)
│   │   ├── AudioVisualizer
│   │   ├── SnippetInfo (title, artist)
│   │   └── ActionButtons (fire/skip)
│   └── LoadingIndicator
└── GlobalAudioManager
```

## State Management Structure

### Redux Slices
- **authSlice:** User authentication, profile data
- **feedSlice:** Snippet array, pagination, current playing index
- **audioSlice:** Playback state, queue, current track
- **themeSlice:** Dark/light mode toggle

### Critical Audio State
- Current playing snippet ID
- Play/pause status  
- Audio queue for preloading
- Viewport detection for auto-play

## Theme System

### Color Schemes
```typescript
// Dark Theme: Black & Purple
background: '#000000'
surface: '#1a1a1a'
primary: '#9478e9'
accent: '#b794f6'

// Light Theme: White & Purple  
background: '#ffffff'
surface: '#f7fafc'
primary: '#9478e9'
accent: '#805ad5'
```

## Key Features Implementation

### Endless Scroll
- Auto-play snippet when 50%+ visible
- Horizontal swipes for fire/skip actions
- Preload next 3 audio files
- Optimistic UI updates

### Audio Management
- Global AudioManager service
- Background playback capability
- Smart preloading based on scroll
- Smooth transitions between tracks

### Performance Optimizations
- `getItemLayout` for smooth scrolling
- `removeClippedSubviews` for memory management
- Audio resource cleanup for off-screen items
- Debounced viewport detection

## Navigation Flow
```
AppNavigator (auth conditional)
├── AuthNavigator (stack)
└── MainTabNavigator
    ├── FeedScreen
    ├── ProfileScreen
    └── ArtistStack (conditional)
        ├── DashboardScreen
        ├── UploadScreen
        └── StatsScreen
```

## Development Priorities
1. **Core Feed Experience** - Endless scroll with audio
2. **Authentication Flow** - Login/signup with backend integration  
3. **Audio Management** - Smooth playback and transitions
4. **Artist Dashboard** - Upload and stats for creators
5. **Theme System** - Dark/light mode implementation