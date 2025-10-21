import { useState, useEffect, useRef } from 'react';
import { useAudioPlayer, useAudioPlayerStatus } from 'expo-audio';
import { setupAudioMode, formatTime, calculateProgress } from '../utils/audioHelpers';

interface UseAudioPlaybackOptions {
    autoPlay?: boolean;
    onEnd?: () => void;
    onProgress?: (progress: number) => void;
    startTime?: number;
    endTime?: number;
    cachedPlayer?: any;
}

interface UseAudioPlaybackReturn {
    isPlaying: boolean;
    progress: number;
    currentTime: number;
    duration: number;
    formattedCurrentTime: string;
    formattedDuration: string;
    play: () => Promise<void>;
    pause: () => void;
    togglePlayPause: () => Promise<void>;
    seekTo: (time: number) => void;
    isLoaded: boolean;
    error: Error | null;
}

/**
 * Custom hook for audio playback with full control
 * 
 * @param audioUrl - URL or URI of the audio file
 * @param options - Configuration options
 * @returns Audio playback controls and state
 * 
 * @example
 * const { isPlaying, progress, togglePlayPause, formattedCurrentTime } = useAudioPlayback(
 *   audioUrl,
 *   { autoPlay: false, onEnd: handleAudioEnd }
 * );
 */
export const useAudioPlayback = (
    audioUrl: string,
    options: UseAudioPlaybackOptions = {}
): UseAudioPlaybackReturn => {
    const {
        autoPlay = false,
        onEnd,
        onProgress,
        startTime = 0,
        endTime,
        cachedPlayer,
    } = options;

    const newPlayer = useAudioPlayer(audioUrl);
    const player = cachedPlayer || newPlayer;
    const status = useAudioPlayerStatus(player);

    const [isPlaying, setIsPlaying] = useState(false);
    const [progress, setProgress] = useState(0);
    const [error, setError] = useState<Error | null>(null);
    const hasStarted = useRef(false);

    useEffect(() => {
        setupAudioMode();

        return () => {
            try {
                if (player) {
                    player.pause();
                    setIsPlaying(false);
                    hasStarted.current = false;
                }
            } catch (error) {
                // Ignore cleanup errors
            }
        };
    }, []);

    useEffect(() => {
        setProgress(0);
        setIsPlaying(false);
        hasStarted.current = false;
    }, [audioUrl]);

    useEffect(() => {
        if (autoPlay && !hasStarted.current) {
            if (cachedPlayer || status.isLoaded) {
                play();
            }
        }
    }, [autoPlay, status.isLoaded, cachedPlayer]);

    useEffect(() => {
        if (status.isLoaded && status.duration > 0) {
            const currentProgress = calculateProgress(status.currentTime, status.duration);
            setProgress(currentProgress);

            if (onProgress) {
                onProgress(currentProgress);
            }
        }
    }, [status.currentTime, status.duration, onProgress]);

    useEffect(() => {
        if (hasStarted.current && status.isLoaded && status.playing) {
            const hasReachedEnd = endTime
                ? status.currentTime >= endTime
                : status.currentTime >= status.duration - 0.1;

            if (hasReachedEnd) {
                player.pause();
                setIsPlaying(false);
                hasStarted.current = false;
                if (onEnd) {
                    onEnd();
                }
            }
        }
    }, [status.playing, status.isLoaded, status.currentTime, endTime, onEnd]);

    useEffect(() => {
        setIsPlaying(status.playing);
    }, [status.playing]);

    useEffect(() => {
        return () => {
            try {
                if (player && status.isLoaded) {
                    player.pause();
                    setIsPlaying(false);
                    hasStarted.current = false;
                }
            } catch (error) {
                // Ignore cleanup errors
            }
        };
    }, [audioUrl, status.isLoaded]);

    const play = async () => {
        try {
            if (!status.isLoaded) {
                setError(new Error('Audio not loaded'));
                return;
            }

            if (startTime > 0 && status.currentTime < startTime) {
                player.seekTo(startTime);
            }

            player.play();
            hasStarted.current = true;
            setIsPlaying(true);
            setError(null);
        } catch (err) {
            setError(err as Error);
            setIsPlaying(false);
        }
    };

    const pause = () => {
        try {
            player.pause();
            setIsPlaying(false);
        } catch (err) {
            setError(err as Error);
        }
    };

    const togglePlayPause = async () => {
        if (isPlaying) {
            pause();
        } else {
            await play();
        }
    };

    const seekTo = (time: number) => {
        try {
            if (status.isLoaded) {
                player.seekTo(time);
            }
        } catch (err) {
            setError(err as Error);
        }
    };

    return {
        isPlaying,
        progress,
        currentTime: status.currentTime || 0,
        duration: status.duration || 0,
        formattedCurrentTime: formatTime(status.currentTime || 0),
        formattedDuration: formatTime(status.duration || 0),
        play,
        pause,
        togglePlayPause,
        seekTo,
        isLoaded: status.isLoaded,
        error,
    };
};