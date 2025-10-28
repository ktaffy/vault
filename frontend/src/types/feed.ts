export interface FeedSnippet {
    id: number;
    snippet_id: number;
    artist_id: number;
    artist_name: string;
    artist_profile_pic?: string | null;
    title: string;
    audio_url: string;
    cover_art_url?: string | null;
    duration_seconds: number;
    play_count: number;
    fire_count: number;
    fire_rate: number;
    uploaded_at: string;
}

export interface NextSnippetResponse {
    snippet: FeedSnippet | null;
    message?: string;
}