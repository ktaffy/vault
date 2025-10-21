import { useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { useAudioPlayback } from './useAudioPlayback';
import { useSwipe } from './useSwipe';
import {
    selectCurrentSnippet,
    selectSnippets,
    selectCurrentIndex
} from '../store/slices/feedSlice';

export const useFeedAudio = () => {
    const currentSnippet = useSelector(selectCurrentSnippet);
    const snippets = useSelector(selectSnippets);
    const currentIndex = useSelector(selectCurrentIndex);
    const { skip } = useSwipe();

    const previousSnippetId = useRef<number | null>(null);

    const audio = useAudioPlayback(
        currentSnippet?.audio_url || '',
        {
            autoPlay: true,
            onEnd: () => {
                // Snippet ended - no log
            },
            onProgress: (progress) => {
                // Track engagement silently - no log
            }
        }
    );

    useEffect(() => {
        if (currentSnippet && currentSnippet.snippet_id !== previousSnippetId.current) {
            console.log('🎵 Now playing:', currentSnippet.title, 'by', currentSnippet.artist_name);
            previousSnippetId.current = currentSnippet.snippet_id;
        }
    }, [currentSnippet]);

    return {
        ...audio,
        currentSnippet,
        snippetTitle: currentSnippet?.title || '',
        artistName: currentSnippet?.artist_name || '',
        hasAudio: !!currentSnippet?.audio_url,
    };
};