import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { swipeService } from '../services/api/swipes';
import {
    selectCurrentSnippet,
    selectCurrentIndex,
    selectSnippets,
    moveToNextSnippet,
    fetchNextSnippet,
    selectHasMore,
    removeCurrentSnippet
} from '../store/slices/feedSlice';
import type { AppDispatch } from '../store/store';

export const useSwipe = () => {
    const dispatch = useDispatch<AppDispatch>();
    const currentSnippet = useSelector(selectCurrentSnippet);
    const currentIndex = useSelector(selectCurrentIndex);
    const snippets = useSelector(selectSnippets);
    const hasMore = useSelector(selectHasMore);

    const handleSwipe = useCallback(async (action: 'fire' | 'skip') => {
        if (!currentSnippet) {
            console.warn('No current snippet to swipe');
            return;
        }

        console.log(`${action === 'fire' ? '🔥' : '⏭️'} Swiping:`, currentSnippet.title);

        try {
            dispatch(moveToNextSnippet());

            const response = await swipeService.recordSwipe(currentSnippet.snippet_id, action);

            if (action === 'fire' && response.followed_artist) {
                console.log('✅ Artist followed:', currentSnippet.artist_name);
            }

            const remainingSnippets = snippets.length - currentIndex - 1;
            if (remainingSnippets <= 2 && hasMore) {
                console.log('📥 Preloading next snippet...');
                dispatch(fetchNextSnippet());
            }

        } catch (err: any) {
            console.error('❌ Swipe error:', err);
        }
    }, [currentSnippet, snippets, currentIndex, hasMore, dispatch]);

    const fire = useCallback(() => {
        handleSwipe('fire');
    }, [handleSwipe]);

    const skip = useCallback(() => {
        handleSwipe('skip');
    }, [handleSwipe]);

    return {
        fire,
        skip,
        currentSnippet,
        isLoading: !currentSnippet && snippets.length === 0,
    };
};