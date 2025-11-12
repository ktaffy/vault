import { useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { useAudioPlayback } from './useAudioPlayback';
import {
    selectCurrentSnippet,
    selectCurrentIndex
} from '../store/slices/feedSlice';
import { audioCache } from '../utils/audioCache';

export const useFeedAudio = () => {
    const currentSnippet = useSelector(selectCurrentSnippet);
    const currentIndex = useSelector(selectCurrentIndex);
    const previousSnippetId = useRef<number | null>(null);

    const cachedPlayer = currentSnippet?.audio_url
        ? audioCache.get(currentSnippet.audio_url)
        : undefined;

    const audio = useAudioPlayback(
        currentSnippet?.audio_url || '',
        {
            autoPlay: false,
            onEnd: () => {
            },
            onProgress: (progress) => {
            },
            cachedPlayer,
        }
    );

    useEffect(() => {
        if (currentSnippet && currentSnippet.id !== previousSnippetId.current) {
            audioCache.cleanup();
            audioCache.forEach((player, url) => {
                if (url !== currentSnippet.audio_url) {
                    try {
                        if (player.playing) {
                            player.pause();
                        }
                    } catch (error) {
                        // Ignore - player may be destroyed
                    }
                }
            });

            if (cachedPlayer) {
                try {
                    if (cachedPlayer.playing) {
                        cachedPlayer.pause();
                    }
                    cachedPlayer.seekTo(0);
                } catch (error) {
                    // Ignore - player may be destroyed
                }
            }

            previousSnippetId.current = currentSnippet.id;
        }
    }, [currentSnippet?.id, currentSnippet?.audio_url, cachedPlayer]);

    return {
        ...audio,
        currentSnippet,
        snippetTitle: currentSnippet?.title || '',
        artistName: currentSnippet?.artist_name || '',
        hasAudio: !!currentSnippet?.audio_url,
    };
};