import { useCallback, useEffect, useRef } from 'react';
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
    const isFetching = useRef(false);

    const loadInitialFeed = useCallback(async () => {
        if (snippets.length === 0 && !loading) {
            dispatch(preloadSnippets(3));
        }
    }, [snippets.length, loading, dispatch]);

    const checkAndLoadMore = useCallback(() => {
        const remainingSnippets = snippets.length - currentIndex;
        if (isFetching.current || !hasMore || loading) {
            return;
        }
        if (remainingSnippets <= 5) {
            isFetching.current = true;
            dispatch(preloadSnippets(3)).finally(() => {
                isFetching.current = false;
            });
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
        const timer = setTimeout(() => {
            checkAndLoadMore();
        }, 100);
        return () => clearTimeout(timer);
    }, [currentIndex, checkAndLoadMore]);

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