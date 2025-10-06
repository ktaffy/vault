import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { feedService } from '../services/api/feed';
import {
    addSnippet,
    setCurrentIndex,
    setHasMore,
    setLoading,
    setError,
    selectSnippets,
    selectCurrentIndex,
    selectHasMore,
    selectFeedLoading,
    selectCurrentSnippet
} from '../store/slices/feedSlice';
import type { AppDispatch } from '../store/store';

export const useFeed = () => {
    const dispatch = useDispatch<AppDispatch>();
    const snippets = useSelector(selectSnippets);
    const currentIndex = useSelector(selectCurrentIndex);
    const currentSnippet = useSelector(selectCurrentSnippet);
    const hasMore = useSelector(selectHasMore);
    const loading = useSelector(selectFeedLoading);

    const fetchNextSnippet = useCallback(async () => {
        if (loading || !hasMore) return;

        dispatch(setLoading(true));
        dispatch(setError(null));

        try {
            console.log('Fetching next snippet from API...');
            const response = await feedService.getNextSnippet();
            console.log('API returned response:', response);

            const snippet = response?.snippet;

            if (snippet) {
                const mappedSnippet = {
                    id: snippet.snippet_id,
                    title: snippet.title,
                    artistId: snippet.artist_id,
                    artistName: snippet.artist_name,
                    audioUrl: snippet.audio_url,
                    durationSeconds: snippet.duration_seconds,
                    playCount: snippet.play_count,
                    fireCount: snippet.fire_count,
                    fireRate: snippet.fire_rate,
                    uploadedAt: snippet.uploaded_at,
                };
                console.log('Mapped snippet to Redux format:', mappedSnippet);

                dispatch(addSnippet(mappedSnippet));
                console.log('Snippet added to Redux');
            } else {
                console.log('No more snippets available');
                dispatch(setHasMore(false));
            }
        } catch (err: any) {
            const errorMessage = err.message || 'Failed to fetch snippet';
            dispatch(setError(errorMessage));
            console.error('Feed fetch error:', err);
        } finally {
            dispatch(setLoading(false));
        }
    }, [dispatch, loading, hasMore]);

    const loadInitialFeed = useCallback(async () => {
        try {
            await fetchNextSnippet();
            await fetchNextSnippet();
            await fetchNextSnippet();
        } catch (err) {
            console.error('Failed to load initial feed:', err);
        }
    }, [fetchNextSnippet]);

    const checkAndLoadMore = useCallback(() => {
        const snippetsLength = snippets.length;
        const remainingSnippets = snippetsLength - currentIndex;

        if (remainingSnippets < 3 && hasMore && !loading) {
            fetchNextSnippet();
        }
    }, [snippets.length, currentIndex, hasMore, loading, fetchNextSnippet]);

    const nextSnippet = useCallback(() => {
        const snippetsLength = snippets.length;
        if (currentIndex < snippetsLength - 1) {
            dispatch(setCurrentIndex(currentIndex + 1));
        }
        checkAndLoadMore();
    }, [currentIndex, snippets.length, dispatch, checkAndLoadMore]);

    return {
        snippets,
        currentSnippet,
        currentIndex,
        hasMore,
        loading,
        fetchNextSnippet,
        loadInitialFeed,
        nextSnippet,
    };
};