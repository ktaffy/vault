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
            return;
        }

        try {
            dispatch(moveToNextSnippet());

            const response = await swipeService.recordSwipe(currentSnippet.snippet_id, action);

            const remainingSnippets = snippets.length - currentIndex - 1;
            if (remainingSnippets <= 2 && hasMore) {
                dispatch(fetchNextSnippet());
            }

        } catch (err: any) {
            console.error('Swipe error:', err);
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