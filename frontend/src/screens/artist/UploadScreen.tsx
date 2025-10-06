import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Pressable, Alert, ActivityIndicator, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../hooks/useTheme';
import { useRouter } from 'expo-router';
import { Input } from '../../components/common';
import * as DocumentPicker from 'expo-document-picker';
import { useAudioPlayer, useAudioPlayerStatus, setAudioModeAsync } from 'expo-audio';
import Slider from '@react-native-community/slider';
import { snippetService } from '../../services/api/snippets';

const MAX_DURATION = 15;

export const UploadScreen = () => {
    const insets = useSafeAreaInsets();
    const { theme } = useTheme();
    const router = useRouter();

    const [title, setTitle] = useState('');
    const [audioFile, setAudioFile] = useState<any>(null);
    const [audioDuration, setAudioDuration] = useState(0);
    const [startTime, setStartTime] = useState(0);
    const [endTime, setEndTime] = useState(15);
    const [uploading, setUploading] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);

    const player = useAudioPlayer(audioFile?.uri || '');
    const status = useAudioPlayerStatus(player);
    const previewTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        const setupAudio = async () => {
            try {
                await setAudioModeAsync({
                    playsInSilentMode: true,
                });
            } catch (error) {
                console.error('Failed to setup audio mode:', error);
            }
        };

        setupAudio();
    }, []);

    useEffect(() => {
        if (status.duration && status.duration > 0) {
            const durationInSeconds = status.duration;

            if (durationInSeconds < 15) {
                Alert.alert('Audio Too Short', 'Audio must be at least 15 seconds long');
                setAudioFile(null);
                return;
            }

            setAudioDuration(durationInSeconds);
            setStartTime(0);
            setEndTime(Math.min(15, durationInSeconds));
        }
    }, [status.duration]);

    useEffect(() => {
        if (status.playing) {
            setIsPlaying(true);
        } else {
            setIsPlaying(false);
        }
    }, [status.playing]);

    const pickAudio = async () => {
        try {
            const result = await DocumentPicker.getDocumentAsync({
                type: 'audio/*',
                copyToCacheDirectory: true,
            });

            if (result.canceled) {
                return;
            }

            const file = result.assets[0];

            if (!file.size) {
                Alert.alert('Error', 'Could not determine file size');
                return;
            }

            const fileSizeInMB = file.size / (1024 * 1024);

            if (fileSizeInMB > 50) {
                Alert.alert('File Too Large', 'Audio file must be under 50MB');
                return;
            }

            setAudioFile(file);
        } catch (error) {
            Alert.alert('Error', 'Failed to load audio file');
        }
    };

    const playPreview = () => {
        if (!audioFile || audioDuration === 0) return;

        if (previewTimeoutRef.current) {
            clearTimeout(previewTimeoutRef.current);
        }

        if (isPlaying) {
            player.pause();
            return;
        }

        player.seekTo(startTime);
        player.play();

        previewTimeoutRef.current = setTimeout(() => {
            player.pause();
            player.seekTo(startTime);
        }, (endTime - startTime) * 1000);
    };

    useEffect(() => {
        return () => {
            if (previewTimeoutRef.current) {
                clearTimeout(previewTimeoutRef.current);
            }
        };
    }, []);

    const handleStartTimeChange = (value: number) => {
        setStartTime(value);
        if (endTime - value > MAX_DURATION) {
            setEndTime(value + MAX_DURATION);
        }
        if (endTime <= value) {
            setEndTime(Math.min(value + 1, audioDuration));
        }
    };

    const handleEndTimeChange = (value: number) => {
        setEndTime(value);
        if (value - startTime > MAX_DURATION) {
            setStartTime(value - MAX_DURATION);
        }
        if (value <= startTime) {
            setStartTime(Math.max(0, value - 1));
        }
    };

    const handleUpload = async () => {
        if (!title.trim()) {
            Alert.alert('Missing Title', 'Please enter a title for your snippet');
            return;
        }

        if (!audioFile) {
            Alert.alert('Missing Audio', 'Please select an audio file');
            return;
        }

        setUploading(true);

        try {
            const formData = new FormData();
            formData.append('title', title.trim());
            formData.append('start_time', startTime.toString());
            formData.append('end_time', endTime.toString());
            formData.append('audio', {
                uri: audioFile.uri,
                type: audioFile.mimeType || 'audio/mpeg',
                name: audioFile.name,
            } as any);

            const response = await snippetService.upload(formData);

            Alert.alert('Success', 'Snippet uploaded successfully!', [
                { text: 'OK', onPress: () => router.back() }
            ]);
        } catch (error: any) {
            Alert.alert('Upload Failed', error.message || 'Something went wrong');
        } finally {
            setUploading(false);
        }
    };

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
                <Pressable onPress={() => router.back()} hitSlop={20}>
                    <Ionicons name="close" size={28} color={theme.colors.text} />
                </Pressable>
                <Text style={[styles.headerTitle, { color: theme.colors.text }]}>Upload Snippet</Text>
                <View style={{ width: 28 }} />
            </View>

            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 20 }]}
                showsVerticalScrollIndicator={false}
            >
                <View style={styles.form}>
                    <View style={styles.inputGroup}>
                        <Text style={[styles.label, { color: theme.colors.text }]}>Title</Text>
                        <Input
                            value={title}
                            onChangeText={setTitle}
                            placeholder="Enter snippet title"
                            maxLength={100}
                        />
                        <Text style={[styles.helperText, { color: theme.colors.textSecondary }]}>
                            {title.length}/100 characters
                        </Text>
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={[styles.label, { color: theme.colors.text }]}>Audio File</Text>
                        <Pressable
                            style={[styles.filePicker, {
                                backgroundColor: theme.isDark ? '#1a1a1a' : '#f7fafc',
                                borderColor: audioFile ? theme.colors.primary : (theme.isDark ? '#2a2a2a' : '#e5e5e5'),
                            }]}
                            onPress={pickAudio}
                        >
                            {audioFile ? (
                                <View style={styles.fileSelected}>
                                    <Ionicons name="musical-note" size={24} color={theme.colors.primary} />
                                    <View style={styles.fileInfo}>
                                        <Text style={[styles.fileName, { color: theme.colors.text }]} numberOfLines={1}>
                                            {audioFile.name}
                                        </Text>
                                        <Text style={[styles.fileSize, { color: theme.colors.textSecondary }]}>
                                            {audioDuration > 0 ? `${audioDuration.toFixed(1)}s · ` : ''}{audioFile.size ? (audioFile.size / (1024 * 1024)).toFixed(2) : '0.00'} MB
                                        </Text>
                                    </View>
                                    <Ionicons name="checkmark-circle" size={24} color={theme.colors.primary} />
                                </View>
                            ) : (
                                <View style={styles.fileEmpty}>
                                    <Ionicons name="cloud-upload-outline" size={32} color={theme.colors.textSecondary} />
                                    <Text style={[styles.fileEmptyText, { color: theme.colors.text }]}>
                                        Choose Audio File
                                    </Text>
                                    <Text style={[styles.fileEmptySubtext, { color: theme.colors.textSecondary }]}>
                                        MP3, WAV, M4A (Max 50MB, Min 15s)
                                    </Text>
                                </View>
                            )}
                        </Pressable>
                    </View>

                    {audioFile && audioDuration >= 15 && (
                        <View style={styles.inputGroup}>
                            <View style={styles.trimHeader}>
                                <Text style={[styles.label, { color: theme.colors.text }]}>Select Clip</Text>
                                <Pressable style={styles.previewButton} onPress={playPreview}>
                                    <Ionicons name={isPlaying ? "pause" : "play"} size={16} color={theme.colors.primary} />
                                    <Text style={[styles.previewText, { color: theme.colors.primary }]}>
                                        {isPlaying ? 'Pause' : 'Preview'}
                                    </Text>
                                </Pressable>
                            </View>
                            <View style={[styles.trimContainer, {
                                backgroundColor: theme.isDark ? '#1a1a1a' : '#f7fafc',
                                borderColor: theme.isDark ? '#2a2a2a' : '#e5e5e5',
                            }]}>
                                <View style={styles.timelineContainer}>
                                    <View style={styles.timelineTrack}>
                                        <View
                                            style={[
                                                styles.selectionWindow,
                                                {
                                                    backgroundColor: theme.colors.primary + '20',
                                                    borderColor: theme.colors.primary,
                                                    left: `${(startTime / audioDuration) * 100}%`,
                                                    width: `${((endTime - startTime) / audioDuration) * 100}%`,
                                                }
                                            ]}
                                        >
                                            <View style={[styles.windowEdge, { backgroundColor: theme.colors.primary }]} />
                                            <View style={[styles.windowEdge, { backgroundColor: theme.colors.primary }]} />
                                        </View>
                                    </View>
                                </View>
                                <View style={styles.timeLabels}>
                                    <Text style={[styles.timeText, { color: theme.colors.text }]}>
                                        {formatTime(startTime)}
                                    </Text>
                                    <Text style={[styles.timeText, { color: theme.colors.primary, fontWeight: '700' }]}>
                                        {formatTime(endTime - startTime)}
                                    </Text>
                                    <Text style={[styles.timeText, { color: theme.colors.text }]}>
                                        {formatTime(endTime)}
                                    </Text>
                                </View>
                                <View style={styles.slidersContainer}>
                                    <View>
                                        <Text style={[styles.sliderLabel, { color: theme.colors.textSecondary }]}>
                                            Start
                                        </Text>
                                        <Slider
                                            style={styles.slider}
                                            minimumValue={0}
                                            maximumValue={audioDuration - 1}
                                            value={startTime}
                                            onValueChange={handleStartTimeChange}
                                            minimumTrackTintColor={theme.colors.primary}
                                            maximumTrackTintColor={theme.colors.textSecondary + '40'}
                                            thumbTintColor={theme.colors.primary}
                                        />
                                    </View>
                                    <View>
                                        <Text style={[styles.sliderLabel, { color: theme.colors.textSecondary }]}>
                                            End (max 15s)
                                        </Text>
                                        <Slider
                                            style={styles.slider}
                                            minimumValue={1}
                                            maximumValue={audioDuration}
                                            value={endTime}
                                            onValueChange={handleEndTimeChange}
                                            minimumTrackTintColor={theme.colors.primary}
                                            maximumTrackTintColor={theme.colors.textSecondary + '40'}
                                            thumbTintColor={theme.colors.primary}
                                        />
                                    </View>
                                </View>
                            </View>
                        </View>
                    )}

                    <Pressable
                        style={[styles.uploadButton, {
                            backgroundColor: (!title.trim() || !audioFile || uploading)
                                ? theme.colors.textSecondary + '40'
                                : theme.colors.primary
                        }]}
                        onPress={handleUpload}
                        disabled={!title.trim() || !audioFile || uploading}
                    >
                        {uploading ? (
                            <ActivityIndicator color="#FFFFFF" />
                        ) : (
                            <>
                                <Ionicons name="cloud-upload" size={20} color="#FFFFFF" />
                                <Text style={styles.uploadButtonText}>Upload Snippet</Text>
                            </>
                        )}
                    </Pressable>
                </View>
            </ScrollView>
        </View>
    );
};

const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingBottom: 16,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '600',
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        paddingHorizontal: 24,
        paddingTop: 8,
    },
    form: {
        gap: 20,
    },
    inputGroup: {
        gap: 8,
    },
    label: {
        fontSize: 15,
        fontWeight: '600',
        marginBottom: 4,
    },
    helperText: {
        fontSize: 13,
        fontWeight: '500',
    },
    filePicker: {
        borderRadius: 16,
        borderWidth: 2,
        overflow: 'hidden',
    },
    fileEmpty: {
        padding: 32,
        alignItems: 'center',
        gap: 6,
    },
    fileEmptyText: {
        fontSize: 15,
        fontWeight: '600',
        marginTop: 6,
    },
    fileEmptySubtext: {
        fontSize: 12,
        fontWeight: '500',
    },
    fileSelected: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        gap: 12,
    },
    fileInfo: {
        flex: 1,
    },
    fileName: {
        fontSize: 15,
        fontWeight: '600',
        marginBottom: 4,
    },
    fileSize: {
        fontSize: 13,
        fontWeight: '500',
    },
    trimHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 4,
    },
    previewButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    previewText: {
        fontSize: 14,
        fontWeight: '600',
    },
    trimContainer: {
        padding: 16,
        borderRadius: 16,
        borderWidth: 1,
        gap: 10,
    },
    timeLabels: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    timeText: {
        fontSize: 13,
        fontWeight: '600',
    },
    timelineContainer: {
        width: '100%',
        height: 50,
        justifyContent: 'center',
        marginBottom: -8,
    },
    timelineTrack: {
        width: '100%',
        height: 36,
        backgroundColor: 'rgba(150, 150, 150, 0.2)',
        borderRadius: 8,
        position: 'relative',
        overflow: 'hidden',
    },
    selectionWindow: {
        position: 'absolute',
        height: '100%',
        borderWidth: 2,
        borderRadius: 6,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    windowEdge: {
        width: 4,
        height: '60%',
        borderRadius: 2,
    },
    slidersContainer: {
        gap: 10,
        marginTop: 6,
    },
    sliderLabel: {
        fontSize: 12,
        fontWeight: '500',
        marginBottom: 2,
    },
    slider: {
        width: '100%',
        height: 32,
    },
    uploadButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 8,
        paddingVertical: 16,
        borderRadius: 12,
        gap: 8,
    },
    uploadButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
    },
});