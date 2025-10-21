import { useCallback, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    fetchNextSnippet,
    preloadSnippets,
    selectSnippets,
    selectCurrentIndex,
    selectCurrentSnippet,
    selectHasMore,
    selectIsLoading,
    setCurrentIndex,
    moveToNextSnippet,
} from '../store/slices/feedSlice';
import type { AppDispatch } from '../store/store';

export const useFeed = () => {
    const dispatch = useDispatch<AppDispatch>();
    const snippets = useSelector(selectSnippets);
    const currentIndex = useSelector(selectCurrentIndex);
    const currentSnippet = useSelector(selectCurrentSnippet);
    const hasMore = useSelector(selectHasMore);
    const loading = useSelector(selectIsLoading);

    const loadInitialFeed = useCallback(async () => {
        if (snippets.length === 0 && !loading) {
            console.log('📥 Loading initial feed...');
            dispatch(preloadSnippets(3));
        }
    }, [snippets.length, loading, dispatch]);

    const checkAndLoadMore = useCallback(() => {
        const remainingSnippets = snippets.length - currentIndex;

        if (remainingSnippets < 3 && hasMore && !loading) {
            console.log('📥 Preloading more snippets... (remaining:', remainingSnippets, ')');
            dispatch(fetchNextSnippet());
        }
    }, [snippets.length, currentIndex, hasMore, loading, dispatch]);

    const nextSnippet = useCallback(() => {
        dispatch(moveToNextSnippet());
        checkAndLoadMore();
    }, [dispatch, checkAndLoadMore]);

    const goToIndex = useCallback((index: number) => {
        if (index >= 0 && index < snippets.length) {
            dispatch(setCurrentIndex(index));
            checkAndLoadMore();
        }
    }, [snippets.length, dispatch, checkAndLoadMore]);

    useEffect(() => {
        loadInitialFeed();
    }, [loadInitialFeed]);

    useEffect(() => {
        checkAndLoadMore();
    }, [currentIndex]);

    return {
        snippets,
        currentSnippet,
        currentIndex,
        hasMore,
        loading,
        loadInitialFeed,
        nextSnippet,
        goToIndex,
        totalSnippets: snippets.length,
    };
};