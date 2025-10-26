import { apiClient } from './client';

export interface SignupRequest {
    username: string;
    email: string;
    password: string;
}

export interface SignupResponse {
    id: string;
    username: string;
    email: string;
}

export interface LoginRequest {
    identifier: string;
    password: string;
}

export interface LoginResponse {
    access_token: string;
    expires_in: number;
    user: {
        id: string;
        username: string;
        email: string;
        profile_pic?: string;
        spotify_url?: string;
        soundcloud_url?: string;
        linktree_url?: string;
    };
}

export interface UpdateProfileRequest {
    username?: string;
    email?: string;
    profile_pic?: any;
    spotify_url?: string;
    soundcloud_url?: string;
    linktree_url?: string;
}

export interface UpdateProfileResponse {
    message: string;
    user: {
        id: string;
        username: string;
        email: string;
        profile_pic?: string;
        spotify_url?: string;
        soundcloud_url?: string;
        linktree_url?: string;
    };
}

export interface VerifyEmailRequest {
    token: string;
}

export interface ForgotPasswordRequest {
    email: string;
}

export interface ResetPasswordRequest {
    token: string;
    new_password: string;
}

export const authService = {
    signup: async (data: SignupRequest): Promise<SignupResponse> => {
        return apiClient.post<SignupResponse>('/signup', data);
    },

    login: async (data: LoginRequest): Promise<LoginResponse> => {
        return apiClient.post<LoginResponse>('/login', data);
    },

    logout: async (): Promise<void> => {
        return apiClient.get<void>('/logout', true);
    },

    refreshToken: async (): Promise<LoginResponse> => {
        return apiClient.post<LoginResponse>('/refresh');
    },

    updateProfile: async (data: UpdateProfileRequest): Promise<UpdateProfileResponse> => {
        const formData = new FormData();

        if (data.username) {
            formData.append('username', data.username);
        }

        if (data.email) {
            formData.append('email', data.email);
        }

        if (data.profile_pic) {
            formData.append('profile_pic', data.profile_pic);
        }

        if (data.spotify_url !== undefined) {
            formData.append('spotify_url', data.spotify_url);
        }

        if (data.soundcloud_url !== undefined) {
            formData.append('soundcloud_url', data.soundcloud_url);
        }

        if (data.linktree_url !== undefined) {
            formData.append('linktree_url', data.linktree_url);
        }

        return apiClient.put<UpdateProfileResponse>('/update-profile', formData, true);
    },

    verifyEmail: async (data: VerifyEmailRequest): Promise<{ message: string }> => {
        return apiClient.post<{ message: string }>('/verify-email', data);
    },

    resendVerification: async (): Promise<{ message: string }> => {
        return apiClient.post<{ message: string }>('/resend-verification', {}, true);
    },

    forgotPassword: async (data: ForgotPasswordRequest): Promise<{ message: string }> => {
        return apiClient.post<{ message: string }>('/forgot-password', data);
    },

    resetPassword: async (data: ResetPasswordRequest): Promise<{ message: string }> => {
        return apiClient.post<{ message: string }>('/reset-password', data);
    },
};