import React, { useState, useEffect, useRef, useMemo } from 'react';
import { View, Text, StyleSheet, Pressable, ActivityIndicator, ScrollView, Image, PanResponder } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useScreenSetup } from '../../hooks/useScreenSetup';
import { Input } from '../../components/common';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import { snippetService } from '../../services/api/snippets';
import { useAudioPlayback } from '../../hooks/useAudioPlayback';
import { formatTime } from '../../utils/audioHelpers';

const MAX_DURATION = 15;

export const UploadScreen = () => {
    const { insets, theme, router, showToast } = useScreenSetup();

    const [title, setTitle] = useState('');
    const [audioFile, setAudioFile] = useState<any>(null);
    const [coverArtFile, setCoverArtFile] = useState<any>(null);
    const [audioDuration, setAudioDuration] = useState(0);
    const [startTime, setStartTime] = useState(0);
    const [endTime, setEndTime] = useState(15);
    const [uploading, setUploading] = useState(false);
    const waveformWidth = useRef(0);
    const [isDragging, setIsDragging] = useState(false);

    // REPLACED: All the manual audio player setup, useEffects, and cleanup
    // WITH: One clean hook call
    const {
        isPlaying,
        duration,
        play,
        pause,
    } = useAudioPlayback(audioFile?.uri || '', {
        autoPlay: false,
        startTime,
        endTime,
    });

    // Pan responder for the entire waveform - drag anywhere to position the 15s window
    const waveformPanResponder = useMemo(() =>
        PanResponder.create({
            onStartShouldSetPanResponder: () => true,
            onMoveShouldSetPanResponder: () => true,
            onPanResponderGrant: (evt) => {
                setIsDragging(true); // Disable scroll
                if (isPlaying) pause();

                // Calculate position from touch
                const touchX = evt.nativeEvent.locationX;
                if (waveformWidth.current === 0 || audioDuration === 0) return;

                // Calculate the center time of the 15s window based on touch
                const touchPercent = touchX / waveformWidth.current;
                const touchTime = touchPercent * audioDuration;

                // Center the 15s window on the touch point
                let newStartTime = touchTime - (MAX_DURATION / 2);

                // Adjust if it goes out of bounds
                if (newStartTime < 0) {
                    newStartTime = 0;
                } else if (newStartTime + MAX_DURATION > audioDuration) {
                    newStartTime = audioDuration - MAX_DURATION;
                }

                setStartTime(newStartTime);
                setEndTime(newStartTime + MAX_DURATION);
            },
            onPanResponderMove: (evt) => {
                if (waveformWidth.current === 0 || audioDuration === 0) return;

                // Calculate new position based on current touch location
                const touchX = evt.nativeEvent.locationX;
                const touchPercent = touchX / waveformWidth.current;
                const touchTime = touchPercent * audioDuration;

                // Center the 15s window on the current touch point
                let newStartTime = touchTime - (MAX_DURATION / 2);

                // Adjust if it goes out of bounds
                if (newStartTime < 0) {
                    newStartTime = 0;
                } else if (newStartTime + MAX_DURATION > audioDuration) {
                    newStartTime = audioDuration - MAX_DURATION;
                }

                setStartTime(newStartTime);
                setEndTime(newStartTime + MAX_DURATION);
            },
            onPanResponderRelease: () => {
                setIsDragging(false); // Re-enable scroll
            },
            onPanResponderTerminate: () => {
                setIsDragging(false); // Re-enable scroll if cancelled
            },
        }),
        [audioDuration, isPlaying, pause]
    );

    // Update audioDuration when audio loads
    useEffect(() => {
        if (duration && duration > 0) {
            const durationInSeconds = duration;

            if (durationInSeconds < 15) {
                showToast('Audio must be at least 15 seconds long', 'error');
                setAudioFile(null);
                return;
            }

            setAudioDuration(durationInSeconds);
            setStartTime(0);
            setEndTime(Math.min(15, durationInSeconds));
        }
    }, [duration]);

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

            const fileName = file.name.toLowerCase();
            if (!fileName.endsWith('.mp3') && !fileName.endsWith('.wav')) {
                showToast('Only MP3 and WAV files are supported', 'error');
                return;
            }

            if (!file.size) {
                showToast('Could not determine file size', 'error');
                return;
            }

            const fileSizeInMB = file.size / (1024 * 1024);

            if (fileSizeInMB > 50) {
                showToast('Audio file must be under 50MB', 'error');
                return;
            }

            setAudioFile(file);
        } catch (error) {
            showToast('Failed to load audio file', 'error');
        }
    };

    const pickCoverArt = async () => {
        try {
            const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

            if (permissionResult.granted === false) {
                showToast('Permission to access gallery is required', 'error');
                return;
            }

            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: 'images',
                allowsEditing: true,
                aspect: [1, 1],
                quality: 0.8,
            });

            if (result.canceled) {
                return;
            }

            const image = result.assets[0];
            setCoverArtFile(image);
        } catch (error) {
            showToast('Failed to load cover art', 'error');
        }
    };

    // REPLACED: Manual playPreview logic with timeout refs
    // WITH: Simple toggle using the hook
    const playPreview = () => {
        if (!audioFile || audioDuration === 0) return;

        if (isPlaying) {
            pause();
        } else {
            play();
        }
    };

    const handleUpload = async () => {
        if (!title.trim()) {
            showToast('Please enter a title for your snippet', 'error');
            return;
        }

        if (!audioFile) {
            showToast('Please select an audio file', 'error');
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

            if (coverArtFile) {
                formData.append('cover_art', {
                    uri: coverArtFile.uri,
                    type: coverArtFile.mimeType || 'image/jpeg',
                    name: coverArtFile.fileName || 'cover.jpg',
                } as any);
            }

            const response = await snippetService.upload(formData);

            showToast('Snippet uploaded successfully!', 'success');
            router.back();
        } catch (error: any) {
            showToast(error.message || 'Something went wrong', 'error');
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
                scrollEnabled={!isDragging}
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
                                        MP3, WAV, (Max 50MB, Min 15s)
                                    </Text>
                                </View>
                            )}
                        </Pressable>
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={[styles.label, { color: theme.colors.text }]}>
                            Cover Art <Text style={[styles.optionalLabel, { color: theme.colors.textSecondary }]}>(Optional)</Text>
                        </Text>
                        <Pressable
                            style={[styles.coverArtPicker, {
                                backgroundColor: coverArtFile ? (theme.isDark ? '#1a1a1a' : '#f7fafc') : 'transparent',
                                borderColor: coverArtFile ? theme.colors.primary : 'transparent',
                            }]}
                            onPress={pickCoverArt}
                        >
                            {coverArtFile ? (
                                <View style={styles.coverArtPreview}>
                                    <Image
                                        source={{ uri: coverArtFile.uri }}
                                        style={styles.coverArtImage}
                                    />
                                    <Pressable
                                        onPress={() => setCoverArtFile(null)}
                                        style={styles.removeButton}
                                        hitSlop={10}
                                    >
                                        <Ionicons name="close" size={24} color="rgba(150, 150, 150, 0.8)" />
                                    </Pressable>
                                </View>
                            ) : (
                                <View style={[styles.coverArtEmpty, { opacity: 0.6 }]}>
                                    <Ionicons name="image-outline" size={32} color={theme.colors.textSecondary} />
                                    <Text style={[styles.coverArtEmptyText, { color: theme.colors.text }]}>
                                        Choose Cover Art
                                    </Text>
                                    <Text style={[styles.coverArtEmptySubtext, { color: theme.colors.textSecondary }]}>
                                        Square image recommended
                                    </Text>
                                </View>
                            )}
                        </Pressable>
                    </View>

                    {audioFile && audioDuration >= 15 && (
                        <View style={styles.inputGroup}>
                            <View style={styles.trimHeader}>
                                <Text style={[styles.label, { color: theme.colors.text }]}>Trim Audio</Text>
                                <Pressable
                                    style={[styles.previewButton, {
                                        backgroundColor: isPlaying
                                            ? theme.colors.primary + '15'
                                            : 'transparent',
                                        borderWidth: 1,
                                        borderColor: theme.colors.primary,
                                    }]}
                                    onPress={playPreview}
                                >
                                    <Ionicons
                                        name={isPlaying ? "pause" : "play"}
                                        size={14}
                                        color={theme.colors.primary}
                                    />
                                    <Text style={[styles.previewText, { color: theme.colors.primary }]}>
                                        {isPlaying ? 'Pause' : 'Preview'}
                                    </Text>
                                </Pressable>
                            </View>

                            <View style={[styles.trimContainer, {
                                backgroundColor: theme.isDark ? '#0a0a0a' : '#fafafa',
                            }]}>
                                {/* Waveform-style Timeline */}
                                <View
                                    style={styles.waveformContainer}
                                    onLayout={(e) => {
                                        waveformWidth.current = e.nativeEvent.layout.width;
                                    }}
                                >
                                    <View
                                        {...waveformPanResponder.panHandlers}
                                        style={[styles.waveformTrack, {
                                            backgroundColor: theme.isDark ? '#1a1a1a' : '#e8e8e8',
                                        }]}
                                    >
                                        {/* Simulated waveform bars */}
                                        {Array.from({ length: 40 }).map((_, i) => {
                                            const height = 20 + Math.random() * 40;
                                            const isInSelection =
                                                (i / 40) >= (startTime / audioDuration) &&
                                                (i / 40) <= (endTime / audioDuration);

                                            return (
                                                <View
                                                    key={i}
                                                    style={[styles.waveformBar, {
                                                        height: `${height}%`,
                                                        backgroundColor: isInSelection
                                                            ? theme.colors.primary
                                                            : theme.isDark ? '#2a2a2a' : '#d0d0d0',
                                                        opacity: isInSelection ? 1 : 0.4,
                                                    }]}
                                                />
                                            );
                                        })}

                                        {/* Selection Overlay (visual indicator only) */}
                                        <View
                                            style={[styles.selectionOverlay, {
                                                left: `${(startTime / audioDuration) * 100}%`,
                                                width: `${((endTime - startTime) / audioDuration) * 100}%`,
                                            }]}
                                            pointerEvents="none"
                                        >
                                            {/* Left Edge Indicator */}
                                            <View style={[styles.draggableEdge, styles.leftEdge]}>
                                                <View style={[styles.edgeHandle, {
                                                    backgroundColor: theme.colors.primary,
                                                    shadowColor: theme.colors.primary,
                                                }]}>
                                                    <View style={[styles.edgeGrip, {
                                                        backgroundColor: theme.isDark ? '#000' : '#fff',
                                                    }]} />
                                                </View>
                                            </View>

                                            {/* Right Edge Indicator */}
                                            <View style={[styles.draggableEdge, styles.rightEdge]}>
                                                <View style={[styles.edgeHandle, {
                                                    backgroundColor: theme.colors.primary,
                                                    shadowColor: theme.colors.primary,
                                                }]}>
                                                    <View style={[styles.edgeGrip, {
                                                        backgroundColor: theme.isDark ? '#000' : '#fff',
                                                    }]} />
                                                </View>
                                            </View>
                                        </View>
                                    </View>
                                </View>

                                {/* Time Display */}
                                <View style={styles.timeDisplay}>
                                    <View style={[styles.timeChip, {
                                        backgroundColor: theme.isDark ? '#1a1a1a' : '#ffffff',
                                        borderColor: theme.colors.border,
                                    }]}>
                                        <Text style={[styles.timeLabel, { color: theme.colors.textSecondary }]}>
                                            Start
                                        </Text>
                                        <Text style={[styles.timeValue, { color: theme.colors.text }]}>
                                            {formatTime(startTime)}
                                        </Text>
                                    </View>

                                    <View style={[styles.durationChip, {
                                        backgroundColor: theme.colors.primary + '15',
                                        borderColor: theme.colors.primary,
                                    }]}>
                                        <Ionicons name="time-outline" size={14} color={theme.colors.primary} />
                                        <Text style={[styles.durationValue, { color: theme.colors.primary }]}>
                                            {formatTime(endTime - startTime)}
                                        </Text>
                                    </View>

                                    <View style={[styles.timeChip, {
                                        backgroundColor: theme.isDark ? '#1a1a1a' : '#ffffff',
                                        borderColor: theme.colors.border,
                                    }]}>
                                        <Text style={[styles.timeLabel, { color: theme.colors.textSecondary }]}>
                                            End
                                        </Text>
                                        <Text style={[styles.timeValue, { color: theme.colors.text }]}>
                                            {formatTime(endTime)}
                                        </Text>
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
        marginBottom: 12,
    },
    previewButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 8,
    },
    previewText: {
        fontSize: 13,
        fontWeight: '600',
    },
    trimContainer: {
        padding: 20,
        borderRadius: 20,
        gap: 16,
    },
    waveformContainer: {
        width: '100%',
        height: 80,
        justifyContent: 'center',
    },
    waveformTrack: {
        width: '100%',
        height: '100%',
        borderRadius: 12,
        position: 'relative',
        overflow: 'hidden',
        flexDirection: 'row',
        alignItems: 'center',
        gap: 2,
        paddingHorizontal: 4,
    },
    waveformBar: {
        flex: 1,
        borderRadius: 2,
    },
    selectionOverlay: {
        position: 'absolute',
        height: '100%',
        top: 0,
    },
    draggableEdge: {
        position: 'absolute',
        height: '100%',
        width: 40,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 10,
    },
    leftEdge: {
        left: -20,
    },
    rightEdge: {
        right: -20,
    },
    edgeHandle: {
        width: 6,
        height: '100%',
        borderRadius: 3,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.5,
        shadowRadius: 6,
        elevation: 5,
        justifyContent: 'center',
        alignItems: 'center',
    },
    edgeGrip: {
        width: 2,
        height: 20,
        borderRadius: 1,
        opacity: 0.6,
    },
    timeDisplay: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 4,
    },
    timeChip: {
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 10,
        borderWidth: 1,
        alignItems: 'center',
        minWidth: 70,
    },
    timeLabel: {
        fontSize: 10,
        fontWeight: '600',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
        marginBottom: 2,
    },
    timeValue: {
        fontSize: 15,
        fontWeight: '700',
        letterSpacing: -0.3,
    },
    durationChip: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderRadius: 12,
        borderWidth: 1.5,
    },
    durationValue: {
        fontSize: 16,
        fontWeight: '700',
        letterSpacing: -0.5,
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
    optionalLabel: {
        fontSize: 13,
        fontWeight: '500',
    },
    coverArtPicker: {
        borderRadius: 16,
        borderWidth: 2,
        overflow: 'hidden',
        aspectRatio: 1,
        maxHeight: 200,
        alignSelf: 'center',
        width: '100%',
        maxWidth: 200,
    },
    coverArtPreview: {
        flex: 1,
        position: 'relative',
    },
    coverArtImage: {
        width: '100%',
        height: '100%',
        borderRadius: 14,
    },
    removeButton: {
        position: 'absolute',
        top: 8,
        right: 8,
    },
    coverArtEmpty: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        gap: 6,
        padding: 32,
        backgroundColor: 'transparent',
    },
    coverArtEmptyText: {
        fontSize: 15,
        fontWeight: '600',
        marginTop: 6,
    },
    coverArtEmptySubtext: {
        fontSize: 12,
        fontWeight: '500',
        textAlign: 'center'
    },
});