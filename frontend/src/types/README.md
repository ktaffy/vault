# Snippet Type System

## Type Hierarchy
```
BaseSnippet (core properties)
    ├── ArtistSnippet (+ stats & management)
    └── FeedSnippet (+ artist context)
```

## When to Use Each Type

### `BaseSnippet`
**Use for:** Generic snippet data without context
**Has:** id, title, audio_url, cover_art_url, duration_seconds, uploaded_at
**Example:** Utility functions, base components

### `ArtistSnippet`
**Use for:** Artist dashboard, stats, and management screens
**Has:** All BaseSnippet fields + artist_id, play_count, fire_count, skip_count, fire_rate, is_active
**Screens:** DashboardScreen, StatsScreen, ArtistProfileScreen, UploadScreen
**API:** snippetService methods

### `FeedSnippet`
**Use for:** Main feed and discovery features
**Has:** All BaseSnippet fields + artist_id, artist_name, artist_profile_pic, play_count, fire_count, fire_rate
**Screens:** FeedScreen
**State:** Redux feedSlice
**API:** feedService methods

## Key Changes from Old System

### Before (Confusing):
```typescript
// Two different types with same name
import { Snippet } from 'services/api/snippets';  // One definition
import { FeedSnippet } from 'types/feed';         // Different definition

// Inconsistent ID access
snippet.id              // In artist screens
snippet.snippet_id      // In feed screens
```

### After (Clear):
```typescript
// Single source of truth
import { ArtistSnippet, FeedSnippet } from 'types/snippet';

// Consistent ID access
snippet.id              // ALWAYS
```

## Type Guards

Use these to check types at runtime:
```typescript
import { isFeedSnippet, isArtistSnippet } from 'types/snippet';

if (isFeedSnippet(snippet)) {
    // TypeScript knows snippet is FeedSnippet
    console.log(snippet.artist_name);
}

if (isArtistSnippet(snippet)) {
    // TypeScript knows snippet is ArtistSnippet
    console.log(snippet.is_active);
}
```

## Migration Checklist

✅ Created unified type system in `types/snippet.ts`
✅ Updated `types/feed.ts` to re-export from unified types
✅ Updated `services/api/snippets.ts` to use ArtistSnippet
✅ Updated all artist screens (Dashboard, Stats, Profile)
✅ Updated Redux feedSlice imports
✅ Updated hooks (useFeedAudio, useSwipe) to use `id` instead of `snippet_id`
✅ Created adapter for backend FeedItem → FeedSnippet mapping
✅ Updated feedService to use adapter

## Next Phase: Audio Management

Phase 2 will centralize audio playback management using a similar pattern.