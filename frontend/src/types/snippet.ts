/**
 * Unified Snippet Type System
 * 
 * This file defines the core snippet types used throughout the app.
 * All snippet-related types should be imported from here.
 */

/**
 * Base snippet properties - core data all snippets share
 * This represents a single audio snippet uploaded by an artist
 */
export interface BaseSnippet {
    id: number;
    title: string;
    audio_url: string;
    cover_art_url: string | null;
    duration_seconds: number;
    uploaded_at: string;
}

/**
 * Extended snippet with stats and management data
 * Used in artist dashboard, stats screens, and profile views
 */
export interface ArtistSnippet extends BaseSnippet {
    artist_id: number;
    play_count: number;
    fire_count: number;
    skip_count: number;
    fire_rate: number;
    is_active: boolean;
}

/**
 * Feed snippet with artist context
 * Used in the main feed when users are discovering music
 */
export interface FeedSnippet extends BaseSnippet {
    artist_id: number;
    artist_name: string;
    artist_profile_pic: string | null;
    play_count: number;
    fire_count: number;
    fire_rate: number;
}

/**
 * Response types for API calls
 */
export interface UploadSnippetResponse {
    id: number;
    title: string;
    audio_url: string;
    cover_art_url: string | null;
    message: string;
}

export interface UpdateSnippetRequest {
    title?: string;
}

export interface NextSnippetResponse {
    snippet: FeedSnippet | null;
    message?: string;
}

/**
 * Type guards for runtime type checking
 */
export const isFeedSnippet = (snippet: BaseSnippet | FeedSnippet | ArtistSnippet): snippet is FeedSnippet => {
    return 'artist_name' in snippet;
};

export const isArtistSnippet = (snippet: BaseSnippet | FeedSnippet | ArtistSnippet): snippet is ArtistSnippet => {
    return 'is_active' in snippet;
};