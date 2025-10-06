import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { swipeService } from '../services/api/swipes';
import { selectCurrentSnippet, setCurrentIndex, selectCurrentIndex, selectSnippets } from '../store/slices/feedSlice';
import type { AppDispatch } from '../store/store';

export const useSwipe = () => {
    const dispatch = useDispatch<AppDispatch>();
    const currentSnippet = useSelector(selectCurrentSnippet);
    const currentIndex = useSelector(selectCurrentIndex);
    const snippets = useSelector(selectSnippets);

    const handleSwipe = useCallback(async (action: 'fire' | 'skip') => {
        const snippetToSwipe = snippets[currentIndex];

        if (!snippetToSwipe) {
            console.warn('No snippet at current index:', currentIndex);
            console.warn('Snippets array:', snippets);
            return;
        }

        console.log('Swiping snippet:', snippetToSwipe);

        try {
            console.log('Recording swipe for snippet:', snippetToSwipe.id, 'action:', action);
            const response = await swipeService.recordSwipe(snippetToSwipe.id, action);
            console.log('Swipe successful:', response);

            if (action === 'fire' && response.followed_artist) {
                console.log('🔥 Artist followed!');
            }

            if (currentIndex < snippets.length - 1) {
                dispatch(setCurrentIndex(currentIndex + 1));
            } else {
                console.log('📥 No more snippets, need to fetch more');
            }
        } catch (err: any) {
            console.error('Swipe error:', err);
        }
    }, [snippets, currentIndex, dispatch]);

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
    };
};