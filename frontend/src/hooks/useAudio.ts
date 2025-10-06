import { useCallback, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useAudioPlayer, setAudioModeAsync } from 'expo-audio';
import {
    setCurrentSnippet,
    setPlaying,
    setProgress,
    setDuration,
    setBuffering,
    selectCurrentSnippetId,
    selectIsPlaying,
    selectProgress,
    selectDuration,
    selectIsBuffering
} from '../store/slices/audioSlice';
import { selectCurrentSnippet } from '../store/slices/feedSlice';
import type { AppDispatch } from '../store/store';

export const useAudio = () => {
    const dispatch = useDispatch<AppDispatch>();
    const currentSnippet = useSelector(selectCurrentSnippet);
    const currentSnippetId = useSelector(selectCurrentSnippetId);
    const isPlaying = useSelector(selectIsPlaying);
    const progress = useSelector(selectProgress);
    const duration = useSelector(selectDuration);
    const isBuffering = useSelector(selectIsBuffering);

    useEffect(() => {
        setAudioModeAsync({
            playsInSilentMode: true,
        });
    }, []);

    const player = useAudioPlayer(currentSnippet?.audioUrl || '');

    useEffect(() => {
        if (currentSnippet && currentSnippet.id !== currentSnippetId) {
            console.log('=== NEW SNIPPET ===');
            console.log('Title:', currentSnippet.title);
            console.log('URL:', currentSnippet.audioUrl);
            console.log('Duration:', currentSnippet.durationSeconds);

            dispatch(setCurrentSnippet(currentSnippet.id));
            dispatch(setDuration(currentSnippet.durationSeconds));
            dispatch(setProgress(0));

            setTimeout(() => {
                console.log('=== ATTEMPTING PLAY ===');
                console.log('Player state before play:', {
                    playing: player.playing,
                    buffering: player.isBuffering,
                    duration: player.duration,
                    currentTime: player.currentTime
                });
                player.play();
            }, 1000);
        }
    }, [currentSnippet?.id, currentSnippetId, dispatch, player]);

    useEffect(() => {
        const interval = setInterval(() => {
            console.log('Player Status:', {
                playing: player.playing,
                buffering: player.isBuffering,
                currentTime: player.currentTime,
                duration: player.duration
            });
        }, 2000);

        return () => clearInterval(interval);
    }, [player]);

    useEffect(() => {
        dispatch(setPlaying(player.playing));
    }, [player.playing, dispatch]);

    useEffect(() => {
        if (player.duration > 0) {
            const progressValue = player.currentTime / player.duration;
            dispatch(setProgress(progressValue));
        }
    }, [player.currentTime, player.duration, dispatch]);

    useEffect(() => {
        dispatch(setBuffering(player.isBuffering));
    }, [player.isBuffering, dispatch]);

    const play = useCallback(() => {
        console.log('=== MANUAL PLAY ===');
        player.play();
    }, [player]);

    const pause = useCallback(() => {
        console.log('=== MANUAL PAUSE ===');
        player.pause();
    }, [player]);

    const togglePlayPause = useCallback(() => {
        if (isPlaying) {
            pause();
        } else {
            play();
        }
    }, [isPlaying, play, pause]);

    const seek = useCallback((position: number) => {
        if (player.duration > 0) {
            const seekTime = position * player.duration;
            console.log('=== SEEKING ===', seekTime);
            player.currentTime = seekTime;
        }
    }, [player]);

    return {
        isPlaying,
        progress,
        duration,
        isBuffering,
        play,
        pause,
        togglePlayPause,
        seek,
    };
};