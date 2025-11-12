/**
 * Type adapters for mapping backend responses to frontend types
 */

import { FeedSnippet } from '../../types/snippet';

/**
 * Backend FeedItem response structure
 * This is what the Go backend returns
 */
interface BackendFeedItem {
    id: number;
    snippet_id: number;
    artist_id: number;
    artist_name: string;
    artist_profile_pic: string | null;
    title: string;
    audio_url: string;
    cover_art_url: string | null;
    duration_seconds: number;
    play_count: number;
    fire_count: number;
    fire_rate: number;
    uploaded_at: string;
}

/**
 * Adapts backend FeedItem to frontend FeedSnippet
 * Maps snippet_id to id for cleaner frontend usage
 */
export const adaptFeedItem = (backendItem: BackendFeedItem): FeedSnippet => {
    return {
        id: backendItem.snippet_id,
        title: backendItem.title,
        audio_url: backendItem.audio_url,
        cover_art_url: backendItem.cover_art_url,
        duration_seconds: backendItem.duration_seconds,
        uploaded_at: backendItem.uploaded_at,
        artist_id: backendItem.artist_id,
        artist_name: backendItem.artist_name,
        artist_profile_pic: backendItem.artist_profile_pic,
        play_count: backendItem.play_count,
        fire_count: backendItem.fire_count,
        fire_rate: backendItem.fire_rate,
    };
};