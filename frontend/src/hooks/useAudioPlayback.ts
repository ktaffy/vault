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
    const isValidCachedPlayer = cachedPlayer ? (() => {
        try {
            return cachedPlayer.playing !== undefined;
        } catch {
            return false;
        }
    })() : false;

    const player = (isValidCachedPlayer ? cachedPlayer : newPlayer);
    const status = useAudioPlayerStatus(player);

    const [isPlaying, setIsPlaying] = useState(false);
    const [progress, setProgress] = useState(0);
    const [error, setError] = useState<Error | null>(null);
    const hasStarted = useRef(false);
    const onProgressRef = useRef(onProgress);
    const hasEnded = useRef(false);

    useEffect(() => {
        onProgressRef.current = onProgress;
    }, [onProgress]);

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
        hasEnded.current = false;
    }, [audioUrl]);

    useEffect(() => {
        if (autoPlay && !hasStarted.current && status.isLoaded && !status.isBuffering) {
            play();
        }
    }, [autoPlay, status.isLoaded, status.isBuffering]);

    useEffect(() => {
        if (status.isLoaded && status.duration > 0) {
            const actualProgress = calculateProgress(status.currentTime, status.duration);
            setProgress(prev => {
                const drift = Math.abs(actualProgress - prev);
                const driftThreshold = 0.1 / status.duration; 
                if (drift > driftThreshold) {
                    return actualProgress;
                }
                return prev;
            });
        }
    }, [status.currentTime, status.duration, status.isLoaded]);

    useEffect(() => {
        if (hasStarted.current && status.isLoaded && !hasEnded.current) {
            const hasReachedEnd = endTime
                ? status.currentTime >= endTime
                : status.duration > 0 && status.currentTime >= status.duration - 0.5;

            if (hasReachedEnd && !hasEnded.current) {
                hasEnded.current = true;
                player.pause();
                setIsPlaying(false);
                hasStarted.current = false;
                if (onEnd) {
                    onEnd();
                }
            }
        }
    }, [status.isLoaded, status.currentTime, endTime]);

    useEffect(() => {
        setIsPlaying(status.playing);
    }, [status.playing]);

    useEffect(() => {
        return () => {
            try {
                if (player && player.playing) {
                    player.pause();
                }
                setIsPlaying(false);
                hasStarted.current = false;
            } catch (error) {
                // Player already destroyed, ignore
            }
        };
    }, [audioUrl]);

    useEffect(() => {
        if (!isPlaying || !status.isLoaded || status.duration === 0) {
            return;
        }

        let animationFrameId: number;
        let lastUpdateTime = Date.now();

        const animate = () => {
            const now = Date.now();
            const deltaTime = (now - lastUpdateTime) / 1000;
            lastUpdateTime = now;

            setProgress(prev => {
                const newProgress = prev + (deltaTime / status.duration);
                const clampedProgress = Math.min(Math.max(newProgress, 0), 1);

                return clampedProgress;
            });

            animationFrameId = requestAnimationFrame(animate);
        };

        animationFrameId = requestAnimationFrame(animate);

        return () => {
            if (animationFrameId) {
                cancelAnimationFrame(animationFrameId);
            }
        };
    }, [isPlaying, status.isLoaded, status.duration]);

    useEffect(() => {
        if (onProgressRef.current) {
            onProgressRef.current(progress);
        }
    }, [progress]);

    const play = async () => {
        try {
            if (!status.isLoaded) {
                setError(new Error('Audio not loaded'));
                return;
            }

            if (status.isBuffering) {
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
            hasStarted.current = false;
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