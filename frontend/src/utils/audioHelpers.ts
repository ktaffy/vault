import { setAudioModeAsync } from 'expo-audio';

/**
 * Formats seconds into MM:SS format
 * @param seconds - Number of seconds to format
 * @returns Formatted time string (e.g., "0:15", "1:23")
 */
export const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
};

/**
 * Formats seconds into short format (e.g., "0:15")
 * @param seconds - Number of seconds to format
 * @returns Short formatted time string
 */
export const formatShortTime = (seconds: number): string => {
    const secs = Math.floor(seconds);
    return `0:${secs.toString().padStart(2, '0')}`;
};

/**
 * Sets up audio mode for playback
 * Configures audio to play in silent mode
 */
export const setupAudioMode = async (): Promise<void> => {
    try {
        await setAudioModeAsync({
            playsInSilentMode: true,
        });
    } catch (error) {
        console.error('Audio mode setup error:', error);
    }
};

/**
 * Calculates progress as a percentage (0-1)
 * @param currentTime - Current playback time in seconds
 * @param duration - Total duration in seconds
 * @returns Progress value between 0 and 1
 */
export const calculateProgress = (currentTime: number, duration: number): number => {
    if (!duration || duration === 0) return 0;
    return Math.min(Math.max(currentTime / duration, 0), 1);
};

/**
 * Converts progress (0-1) to time in seconds
 * @param progress - Progress value between 0 and 1
 * @param duration - Total duration in seconds
 * @returns Time in seconds
 */
export const progressToTime = (progress: number, duration: number): number => {
    return progress * duration;
};