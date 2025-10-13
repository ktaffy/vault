// frontend/src/screens/main/ProfileScreen.tsx
import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    Pressable,
    ActivityIndicator,
    Switch,
    Image,
    Modal, TextInput, KeyboardAvoidingView, Platform,
    RefreshControl
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../hooks/useTheme';
import { useAuth } from '../../hooks/useAuth';
import { useDispatch } from 'react-redux';
import { updateUserProfile } from '../../store/slices/authSlice';
import { authService } from '../../services/api/auth';
import type { AppDispatch } from '../../store/store';
import { swipeService } from '../../services/api/swipes';
import type { Snippet } from '../../services/api/snippets';

export const ProfileScreen = () => {
    const insets = useSafeAreaInsets();
    const { theme, toggleTheme } = useTheme();
    const { user, isAuthenticated, logout } = useAuth();
    const [likedSnippets, setLikedSnippets] = useState<Snippet[]>([]);
    const [loadingSnippets, setLoadingSnippets] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [editUsername, setEditUsername] = useState(user?.username || '');
    const [editEmail, setEditEmail] = useState(user?.email || '');
    const [editLoading, setEditLoading] = useState(false);
    const [editError, setEditError] = useState('');
    const [editProfilePic, setEditProfilePic] = useState<string | null>(null);
    const [refreshing, setRefreshing] = useState(false);
    const dispatch = useDispatch<AppDispatch>();

    const onRefresh = async () => {
        setRefreshing(true);
        try {
            const response = await swipeService.getLikedSnippets();
            setLikedSnippets(response.snippets || []);
        } catch (error) {
            console.error('Failed to refresh liked snippets:', error);
        } finally {
            setRefreshing(false);
        }
    };

    const handlePickImage = async () => {
        try {
            // Request permission
            const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

            if (status !== 'granted') {
                setEditError('Permission to access gallery is required');
                return;
            }

            // Launch image picker
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [1, 1],
                quality: 0.8,
            });

            if (!result.canceled && result.assets[0]) {
                setEditProfilePic(result.assets[0].uri);
                setEditError('');
            }
        } catch (error) {
            console.error('Error picking image:', error);
            setEditError('Failed to pick image');
        }
    };

    const handleUpdateProfile = async () => {
        if (!user) {
            setEditError('User not found');
            return;
        }

        if (!editUsername.trim()) {
            setEditError('Username is required');
            return;
        }

        if (!editEmail.trim()) {
            setEditError('Email is required');
            return;
        }

        // Check if anything actually changed
        if (editUsername === user.username && editEmail === user.email && !editProfilePic) {
            setShowEditModal(false);
            return;
        }

        setEditLoading(true);
        setEditError('');

        try {
            const response = await authService.updateProfile({
                username: editUsername !== user.username ? editUsername : undefined,
                email: editEmail !== user.email ? editEmail : undefined,
            });

            // Update local user state
            dispatch(updateUserProfile({
                username: response.user.username,
                email: response.user.email,
            }));

            setShowEditModal(false);
            setEditProfilePic(null);

            // Show success toast if you have toast context
            // showToast('Profile updated successfully', 'success');
        } catch (error: any) {
            setEditError(error.message || 'Failed to update profile');
        } finally {
            setEditLoading(false);
        }
    };

    useEffect(() => {
        const fetchLikedSnippets = async () => {
            if (!user) return;

            setLoadingSnippets(true);
            try {
                const response = await swipeService.getLikedSnippets();
                setLikedSnippets(response.snippets || []);
            } catch (error) {
                console.error('Failed to fetch liked snippets:', error);
            } finally {
                setLoadingSnippets(false);
            }
        };

        fetchLikedSnippets();
    }, [user]);

    if (isAuthenticated && !user) {
        return (
            <View style={[styles.container, styles.centered, { backgroundColor: theme.colors.background }]}>
                <ActivityIndicator size="large" color={theme.colors.primary} />
            </View>
        );
    }

    if (!user) {
        return (
            <View style={[styles.container, styles.centered, { backgroundColor: theme.colors.background }]}>
                <Text style={{ color: theme.colors.textSecondary }}>No user data available</Text>
            </View>
        );
    }

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={[styles.scrollContent, { paddingTop: insets.top + 20, paddingBottom: insets.bottom + 24 }]}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        tintColor={theme.colors.primary}
                        colors={[theme.colors.primary]}
                    />
                }
            >
                {/* Profile Info */}
                <View style={styles.profileSection}>
                    <View style={[styles.avatarContainer, {
                        backgroundColor: theme.isDark ? 'rgba(148,120,233,0.15)' : 'rgba(148,120,233,0.1)'
                    }]}>
                        <Text style={[styles.avatarText, { color: theme.colors.primary }]}>
                            {user.username.charAt(0).toUpperCase()}
                        </Text>
                    </View>

                    <Text style={[styles.username, { color: theme.colors.text }]}>
                        {user.username}
                    </Text>

                    <Text style={[styles.email, { color: theme.colors.textSecondary }]}>
                        {user.email}
                    </Text>

                    {user.isArtist && (
                        <View style={[styles.artistBadge, {
                            backgroundColor: theme.isDark ? 'rgba(148,120,233,0.15)' : 'rgba(148,120,233,0.1)'
                        }]}>
                            <Ionicons name="musical-note" size={14} color={theme.colors.primary} />
                            <Text style={[styles.artistBadgeText, { color: theme.colors.primary }]}>
                                Artist
                            </Text>
                        </View>
                    )}

                    {/* Edit Profile Button */}
                    <Pressable
                        style={[styles.editButton, {
                            backgroundColor: theme.colors.primary,
                        }]}
                        onPress={() => {
                            setEditUsername(user.username);
                            setEditEmail(user.email);
                            setEditError('');
                            setEditProfilePic(null);
                            setShowEditModal(true);
                        }}
                    >
                        <Text style={styles.editButtonText}>Edit Profile</Text>
                    </Pressable>
                </View>

                {/* Divider */}
                <View style={[styles.divider, { backgroundColor: theme.colors.border }]} />

                {/* Theme Toggle */}
                <View style={styles.settingItem}>
                    <View style={styles.settingLeft}>
                        <Ionicons
                            name={theme.isDark ? "moon" : "sunny"}
                            size={22}
                            color={theme.colors.text}
                        />
                        <Text style={[styles.settingText, { color: theme.colors.text }]}>
                            Dark Mode
                        </Text>
                    </View>
                    <Switch
                        value={theme.isDark}
                        onValueChange={toggleTheme}
                        trackColor={{ false: '#d1d5db', true: theme.colors.primary }}
                        thumbColor="#ffffff"
                    />
                </View>

                {/* Divider */}
                <View style={[styles.divider, { backgroundColor: theme.colors.border }]} />

                {/* Liked Snippets Section */}
                <View style={styles.likedSection}>
                    <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
                        Snippets You Liked
                    </Text>

                    {loadingSnippets ? (
                        <View style={styles.emptyState}>
                            <ActivityIndicator size="small" color={theme.colors.primary} />
                        </View>
                    ) : likedSnippets.length === 0 ? (
                        <View style={styles.emptyState}>
                            <Ionicons name="flame-outline" size={48} color={theme.colors.textSecondary} />
                            <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
                                No liked snippets yet
                            </Text>
                            <Text style={[styles.emptySubtext, { color: theme.colors.textSecondary }]}>
                                Fire some tracks in your feed!
                            </Text>
                        </View>
                    ) : (
                        <View style={styles.snippetsList}>
                            {likedSnippets.map((snippet) => (
                                <Pressable
                                    key={snippet.id}
                                    style={[styles.snippetCard, {
                                        backgroundColor: theme.colors.surface,
                                        borderColor: theme.colors.border,
                                    }]}
                                    onPress={() => {
                                        // TODO: Navigate to snippet detail or play it
                                        console.log('Play snippet:', snippet.id);
                                    }}
                                >
                                    {/* Cover Art or Placeholder */}
                                    {snippet.cover_art_url ? (
                                        <Image
                                            source={{ uri: snippet.cover_art_url }}
                                            style={styles.snippetCover}
                                        />
                                    ) : (
                                        <View style={[styles.snippetCoverPlaceholder, {
                                            backgroundColor: theme.isDark ? 'rgba(148,120,233,0.15)' : 'rgba(148,120,233,0.1)'
                                        }]}>
                                            <Ionicons name="musical-note" size={24} color={theme.colors.primary} />
                                        </View>
                                    )}

                                    {/* Snippet Info */}
                                    <View style={styles.snippetInfo}>
                                        <Text style={[styles.snippetTitle, { color: theme.colors.text }]} numberOfLines={1}>
                                            {snippet.title}
                                        </Text>
                                        <View style={styles.snippetMeta}>
                                            <Ionicons name="flame" size={14} color={theme.colors.primary} />
                                            <Text style={[styles.snippetMetaText, { color: theme.colors.textSecondary }]}>
                                                {snippet.fire_count} fires
                                            </Text>
                                        </View>
                                    </View>

                                    <Ionicons name="chevron-forward" size={20} color={theme.colors.textSecondary} />
                                </Pressable>
                            ))}
                        </View>
                    )}
                </View>

                {/* Divider */}
                <View style={[styles.divider, { backgroundColor: theme.colors.border }]} />

                {/* Logout Button */}
                <Pressable
                    style={[styles.logoutButton, {
                        borderColor: theme.colors.error,
                    }]}
                    onPress={logout}
                >
                    <Ionicons name="log-out-outline" size={20} color={theme.colors.error} />
                    <Text style={[styles.logoutText, { color: theme.colors.error }]}>
                        Logout
                    </Text>
                </Pressable>
            </ScrollView>
            {/* Edit Profile Modal */}
            <Modal
                visible={showEditModal}
                transparent
                animationType="fade"
                onRequestClose={() => setShowEditModal(false)}
            >
                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    style={styles.modalOverlay}
                >
                    <Pressable
                        style={styles.modalBackdrop}
                        onPress={() => !editLoading && setShowEditModal(false)}
                    />

                    <View style={[styles.modalContent, {
                        backgroundColor: theme.colors.background,
                        borderColor: theme.colors.border,
                    }]}>
                        {/* Modal Header */}
                        <View style={styles.modalHeader}>
                            <Text style={[styles.modalTitle, { color: theme.colors.text }]}>
                                Edit Profile
                            </Text>
                            <Pressable
                                onPress={() => !editLoading && setShowEditModal(false)}
                                style={styles.modalCloseButton}
                            >
                                <Ionicons name="close" size={24} color={theme.colors.text} />
                            </Pressable>
                        </View>
                        {/* Profile Picture Picker */}
                        <Pressable
                            style={styles.profilePicSection}
                            onPress={handlePickImage}
                            disabled={editLoading}
                        >
                            <View style={[styles.modalAvatarContainer, {
                                backgroundColor: theme.isDark ? 'rgba(148,120,233,0.15)' : 'rgba(148,120,233,0.1)'
                            }]}>
                                {editProfilePic ? (
                                    <Image
                                        source={{ uri: editProfilePic }}
                                        style={styles.modalAvatarImage}
                                    />
                                ) : (
                                    <Text style={[styles.modalAvatarText, { color: theme.colors.primary }]}>
                                        {editUsername.charAt(0).toUpperCase()}
                                    </Text>
                                )}
                            </View>
                            <Text style={[styles.changePhotoText, { color: theme.colors.primary }]}>
                                Change Photo
                            </Text>
                        </Pressable>

                        {/* Form */}
                        <View style={styles.modalForm}>
                            <View style={styles.inputGroup}>
                                <Text style={[styles.inputLabel, { color: theme.colors.text }]}>
                                    Username
                                </Text>
                                <TextInput
                                    value={editUsername}
                                    onChangeText={(text) => {
                                        setEditUsername(text);
                                        setEditError('');
                                    }}
                                    style={[styles.input, {
                                        backgroundColor: theme.colors.surface,
                                        color: theme.colors.text,
                                        borderColor: theme.colors.border,
                                    }]}
                                    placeholder="Enter username"
                                    placeholderTextColor={theme.colors.textSecondary}
                                    autoCapitalize="none"
                                    autoCorrect={false}
                                    editable={!editLoading}
                                />
                            </View>

                            <View style={styles.inputGroup}>
                                <Text style={[styles.inputLabel, { color: theme.colors.text }]}>
                                    Email
                                </Text>
                                <TextInput
                                    value={editEmail}
                                    onChangeText={(text) => {
                                        setEditEmail(text);
                                        setEditError('');
                                    }}
                                    style={[styles.input, {
                                        backgroundColor: theme.colors.surface,
                                        color: theme.colors.text,
                                        borderColor: theme.colors.border,
                                    }]}
                                    placeholder="Enter email"
                                    placeholderTextColor={theme.colors.textSecondary}
                                    keyboardType="email-address"
                                    autoCapitalize="none"
                                    autoCorrect={false}
                                    editable={!editLoading}
                                />
                            </View>

                            {editError ? (
                                <Text style={[styles.errorText, { color: theme.colors.error }]}>
                                    {editError}
                                </Text>
                            ) : null}
                        </View>

                        {/* Action Buttons */}
                        <View style={styles.modalActions}>
                            <Pressable
                                style={[styles.modalButton, styles.modalButtonSecondary, {
                                    backgroundColor: theme.colors.surface,
                                    borderColor: theme.colors.border,
                                }]}
                                onPress={() => setShowEditModal(false)}
                                disabled={editLoading}
                            >
                                <Text style={[styles.modalButtonText, { color: theme.colors.text }]}>
                                    Cancel
                                </Text>
                            </Pressable>

                            <Pressable
                                style={[styles.modalButton, styles.modalButtonPrimary, {
                                    backgroundColor: theme.colors.primary,
                                    opacity: editLoading ? 0.6 : 1,
                                }]}
                                onPress={handleUpdateProfile}
                                disabled={editLoading}
                            >
                                {editLoading ? (
                                    <ActivityIndicator size="small" color="#FFFFFF" />
                                ) : (
                                    <Text style={styles.modalButtonTextPrimary}>
                                        Save Changes
                                    </Text>
                                )}
                            </Pressable>
                        </View>
                    </View>
                </KeyboardAvoidingView>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    centered: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    scrollContent: {
        paddingHorizontal: 20,
    },
    profileSection: {
        alignItems: 'center',
        paddingVertical: 24,
    },
    avatarContainer: {
        width: 96,
        height: 96,
        borderRadius: 48,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },
    avatarText: {
        fontSize: 40,
        fontWeight: '700',
    },
    username: {
        fontSize: 24,
        fontWeight: '700',
        letterSpacing: -0.5,
        marginBottom: 4,
    },
    email: {
        fontSize: 15,
        fontWeight: '400',
        marginBottom: 12,
    },
    artistBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 20,
        marginBottom: 16,
    },
    artistBadgeText: {
        fontSize: 13,
        fontWeight: '600',
    },
    editButton: {
        paddingVertical: 12,
        paddingHorizontal: 32,
        borderRadius: 12,
        marginTop: 4,
    },
    editButtonText: {
        color: '#FFFFFF',
        fontSize: 15,
        fontWeight: '600',
    },
    divider: {
        height: 1,
        marginVertical: 20,
    },
    settingItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 4,
    },
    settingLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    settingText: {
        fontSize: 16,
        fontWeight: '500',
    },
    likedSection: {
        gap: 16,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        letterSpacing: -0.3,
    },
    emptyState: {
        alignItems: 'center',
        paddingVertical: 40,
        gap: 8,
    },
    emptyText: {
        fontSize: 16,
        fontWeight: '600',
        marginTop: 8,
    },
    emptySubtext: {
        fontSize: 14,
        fontWeight: '400',
    },
    logoutButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        paddingVertical: 14,
        borderRadius: 12,
        borderWidth: 1.5,
        marginTop: 8,
    },
    logoutText: {
        fontSize: 15,
        fontWeight: '600',
    },
    modalOverlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    modalBackdrop: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
    },
    modalContent: {
        width: '100%',
        maxWidth: 400,
        borderRadius: 20,
        borderWidth: 1,
        padding: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 20,
        elevation: 10,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: '700',
        letterSpacing: -0.3,
    },
    modalCloseButton: {
        width: 32,
        height: 32,
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalForm: {
        gap: 20,
        marginBottom: 24,
    },
    inputGroup: {
        gap: 8,
    },
    inputLabel: {
        fontSize: 14,
        fontWeight: '600',
    },
    input: {
        paddingVertical: 14,
        paddingHorizontal: 16,
        borderRadius: 12,
        fontSize: 16,
        borderWidth: 1,
    },
    errorText: {
        fontSize: 13,
        fontWeight: '500',
        textAlign: 'center',
    },
    modalActions: {
        flexDirection: 'row',
        gap: 12,
    },
    modalButton: {
        flex: 1,
        paddingVertical: 14,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    modalButtonSecondary: {
        borderWidth: 1,
    },
    modalButtonPrimary: {
        shadowColor: '#9B59D0',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
    },
    modalButtonText: {
        fontSize: 15,
        fontWeight: '600',
    },
    modalButtonTextPrimary: {
        color: '#FFFFFF',
        fontSize: 15,
        fontWeight: '600',
    },
    profilePicSection: {
        alignItems: 'center',
        marginBottom: 24,
        gap: 12,
    },
    modalAvatarContainer: {
        width: 80,
        height: 80,
        borderRadius: 40,
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
        overflow: 'hidden',
    },
    modalAvatarImage: {
        width: '100%',
        height: '100%',
    },
    modalAvatarText: {
        fontSize: 32,
        fontWeight: '700',
    },
    changePhotoText: {
        fontSize: 14,
        fontWeight: '600',
    },
    snippetsList: {
        gap: 12,
    },
    snippetCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        borderRadius: 12,
        borderWidth: 1,
        gap: 12,
    },
    snippetCover: {
        width: 56,
        height: 56,
        borderRadius: 8,
    },
    snippetCoverPlaceholder: {
        width: 56,
        height: 56,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
    },
    snippetInfo: {
        flex: 1,
        gap: 4,
    },
    snippetTitle: {
        fontSize: 15,
        fontWeight: '600',
    },
    snippetMeta: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    snippetMetaText: {
        fontSize: 13,
        fontWeight: '400',
    },
});