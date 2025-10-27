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
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { validateEmail } from '../../utils/validation';
import { useScreenSetup } from '../../hooks/useScreenSetup';
import { useAuth } from '../../hooks/useAuth';
import { useDispatch } from 'react-redux';
import { updateUserProfile } from '../../store/slices/authSlice';
import { authService } from '../../services/api/auth';
import type { AppDispatch } from '../../store/store';
import { swipeService } from '../../services/api/swipes';
import type { Snippet } from '../../services/api/snippets';

export const ProfileScreen = () => {
    const { insets, theme, toggleTheme, showToast } = useScreenSetup();
    const router = useRouter();
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
    const [showLinksModal, setShowLinksModal] = useState(false);
    const [editSpotifyURL, setEditSpotifyURL] = useState(user?.spotify_url || '');
    const [editSoundCloudURL, setEditSoundCloudURL] = useState(user?.soundcloud_url || '');
    const [editLinktreeURL, setEditLinktreeURL] = useState(user?.linktree_url || '');
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
            const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

            if (status !== 'granted') {
                setEditError('Permission to access gallery is required');
                return;
            }

            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: 'images',
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

        if (editUsername.trim().length < 3) {
            setEditError('Username must be at least 3 characters');
            return;
        }

        if (editUsername.trim().length > 50) {
            setEditError('Username must be no more than 50 characters');
            return;
        }

        if (!editEmail.trim()) {
            setEditError('Email is required');
            return;
        }

        const emailValidation = validateEmail(editEmail.trim());
        if (!emailValidation.valid) {
            setEditError(emailValidation.error || 'Invalid email format');
            return;
        }

        const usernameChanged = editUsername !== user.username;
        const emailChanged = editEmail !== user.email;
        const spotifyChanged = editSpotifyURL !== (user.spotify_url || '');
        const soundcloudChanged = editSoundCloudURL !== (user.soundcloud_url || '');
        const linktreeChanged = editLinktreeURL !== (user.linktree_url || '');

        if (!usernameChanged && !emailChanged && !editProfilePic && !spotifyChanged && !soundcloudChanged && !linktreeChanged) {
            setShowEditModal(false);
            setShowLinksModal(false);
            return;
        }

        setEditLoading(true);
        setEditError('');

        try {
            const updateData: any = {
                username: editUsername !== user.username ? editUsername : undefined,
                email: editEmail !== user.email ? editEmail : undefined,
                spotify_url: editSpotifyURL,
                soundcloud_url: editSoundCloudURL,
                linktree_url: editLinktreeURL,
            };

            if (editProfilePic) {
                const filename = editProfilePic.split('/').pop();
                const match = /\.(\w+)$/.exec(filename || '');
                const type = match ? `image/${match[1]}` : 'image/jpeg';

                updateData.profile_pic = {
                    uri: editProfilePic,
                    type: type,
                    name: filename || 'profile.jpg',
                };
            }

            console.log('Sending update data:', updateData);
            const response = await authService.updateProfile(updateData);

            dispatch(updateUserProfile({
                username: response.user.username,
                email: response.user.email,
                profile_pic: response.user.profile_pic,
                spotify_url: response.user.spotify_url,
                soundcloud_url: response.user.soundcloud_url,
                linktree_url: response.user.linktree_url,
            }));

            setShowEditModal(false);
            setShowLinksModal(false);
            setEditProfilePic(null);
            showToast('Profile updated successfully', 'success');

        } catch (error: any) {
            const errorMessage = error.message || 'Failed to update profile';

            if (errorMessage.includes('username already taken')) {
                setEditError('This username is already taken');
            } else if (errorMessage.includes('email already in use')) {
                setEditError('This email is already in use');
            } else if (errorMessage.includes('username must be between')) {
                setEditError('Username must be between 3-50 characters');
            } else if (errorMessage.includes('invalid email')) {
                setEditError('Please enter a valid email address');
            } else if (errorMessage.includes('failed to upload profile picture')) {
                setEditError('Failed to upload profile picture. Please try again');
            } else {
                setEditError(errorMessage);
            }
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
                        {user.profile_pic ? (
                            <Image
                                source={{ uri: user.profile_pic }}
                                style={styles.avatarImage}
                            />
                        ) : (
                            <Text style={[styles.avatarText, { color: theme.colors.primary }]}>
                                {user.username.charAt(0).toUpperCase()}
                            </Text>
                        )}
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

                    <Pressable
                        style={[styles.editLinksButton, {
                            borderColor: theme.colors.border,
                        }]}
                        onPress={() => {
                            setEditSpotifyURL(user.spotify_url || '');
                            setEditSoundCloudURL(user.soundcloud_url || '');
                            setEditLinktreeURL(user.linktree_url || '');
                            setEditError('');
                            setShowLinksModal(true);
                        }}
                    >
                        <Ionicons name="link-outline" size={18} color={theme.colors.primary} />
                        <Text style={[styles.editLinksButtonText, { color: theme.colors.text }]}>
                            Edit Links
                        </Text>
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
                                        router.push(`/(tabs)/artist-profile/${snippet.artist_id}`);
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
                                ) : user.profile_pic ? (
                                    <Image
                                        source={{ uri: user.profile_pic }}
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

            {/* Edit Links Modal*/}
            <Modal
                visible={showLinksModal}
                transparent
                animationType="fade"
                onRequestClose={() => setShowLinksModal(false)}
            >
                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    style={styles.modalOverlay}
                >
                    <Pressable
                        style={styles.modalBackdrop}
                        onPress={() => !editLoading && setShowLinksModal(false)}
                    />

                    <View style={[styles.linksModalContent, {
                        backgroundColor: theme.colors.background,
                        borderColor: theme.colors.border,
                    }]}>
                        {/* Header */}
                        <View style={styles.modalHeader}>
                            <Text style={[styles.modalTitle, { color: theme.colors.text }]}>
                                Social Links
                            </Text>
                            <Pressable
                                onPress={() => !editLoading && setShowLinksModal(false)}
                                style={styles.modalCloseButton}
                            >
                                <Ionicons name="close" size={24} color={theme.colors.text} />
                            </Pressable>
                        </View>

                        <Text style={[styles.linksModalSubtext, { color: theme.colors.textSecondary }]}>
                            Connect your music profiles so fans can find you
                        </Text>

                        {/* Links Form */}
                        <View style={styles.linksForm}>
                            {/* Spotify */}
                            <View style={[styles.linkInputCard, {
                                backgroundColor: theme.colors.surface,
                                borderColor: editSpotifyURL ? '#1DB954' : theme.colors.border,
                            }]}>
                                <View style={styles.linkInputHeader}>
                                    <Image
                                        source={require('../../assets/logos/spotify.png')}
                                        style={styles.linkLogo}
                                    />
                                    <Text style={[styles.linkInputLabel, { color: theme.colors.text }]}>
                                        Spotify
                                    </Text>
                                </View>
                                <TextInput
                                    value={editSpotifyURL}
                                    onChangeText={setEditSpotifyURL}
                                    style={[styles.linkInput, { color: theme.colors.text }]}
                                    placeholder="open.spotify.com/artist/..."
                                    placeholderTextColor={theme.colors.textSecondary}
                                    autoCapitalize="none"
                                    autoCorrect={false}
                                    editable={!editLoading}
                                />
                            </View>

                            {/* SoundCloud */}
                            <View style={[styles.linkInputCard, {
                                backgroundColor: theme.colors.surface,
                                borderColor: editSoundCloudURL ? '#FF5500' : theme.colors.border,
                            }]}>
                                <View style={styles.linkInputHeader}>
                                    <Image
                                        source={require('../../assets/logos/soundcloud.png')}
                                        style={styles.linkLogo}
                                    />
                                    <Text style={[styles.linkInputLabel, { color: theme.colors.text }]}>
                                        SoundCloud
                                    </Text>
                                </View>
                                <TextInput
                                    value={editSoundCloudURL}
                                    onChangeText={setEditSoundCloudURL}
                                    style={[styles.linkInput, { color: theme.colors.text }]}
                                    placeholder="soundcloud.com/username"
                                    placeholderTextColor={theme.colors.textSecondary}
                                    autoCapitalize="none"
                                    autoCorrect={false}
                                    editable={!editLoading}
                                />
                            </View>

                            {/* Linktree */}
                            <View style={[styles.linkInputCard, {
                                backgroundColor: theme.colors.surface,
                                borderColor: editLinktreeURL ? '#39E09B' : theme.colors.border,
                            }]}>
                                <View style={styles.linkInputHeader}>
                                    <Image
                                        source={require('../../assets/logos/linktree.png')}
                                        style={styles.linkLogo}
                                    />
                                    <Text style={[styles.linkInputLabel, { color: theme.colors.text }]}>
                                        Linktree
                                    </Text>
                                </View>
                                <TextInput
                                    value={editLinktreeURL}
                                    onChangeText={setEditLinktreeURL}
                                    style={[styles.linkInput, { color: theme.colors.text }]}
                                    placeholder="linktr.ee/username"
                                    placeholderTextColor={theme.colors.textSecondary}
                                    autoCapitalize="none"
                                    autoCorrect={false}
                                    editable={!editLoading}
                                />
                            </View>
                        </View>

                        {/* Action Buttons */}
                        <View style={styles.modalActions}>
                            <Pressable
                                style={[styles.modalButton, styles.modalButtonSecondary, {
                                    backgroundColor: theme.colors.surface,
                                    borderColor: theme.colors.border,
                                }]}
                                onPress={() => setShowLinksModal(false)}
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
                                        Save Links
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
        borderRadius: 40,
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
    avatarImage: {
        width: '100%',
        height: '100%',
        borderRadius: 48,
    },
    editLinksButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        paddingVertical: 8,
        marginTop: 8,
    },
    editLinksButtonText: {
        fontSize: 14,
        fontWeight: '600',
    },
    linksModalContent: {
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
    linksModalSubtext: {
        fontSize: 14,
        lineHeight: 20,
        marginBottom: 24,
    },
    linksForm: {
        gap: 16,
        marginBottom: 24,
    },
    linkInputCard: {
        padding: 16,
        borderRadius: 12,
        borderWidth: 1.5,
        gap: 12,
    },
    linkInputHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    linkLogo: {
        width: 28,
        height: 28,
        borderRadius: 6,
    },
    linkInputLabel: {
        fontSize: 16,
        fontWeight: '600',
    },
    linkInput: {
        fontSize: 14,
        paddingVertical: 4,
    },
});