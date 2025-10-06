import { useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { authService } from '../services/api/auth';
import {
    setUser,
    setAccessToken,
    clearAuth,
    setLoading,
    setError,
    selectUser,
    selectIsAuthenticated,
    selectAuthLoading,
    selectAuthError
} from '../store/slices/authSlice';
import type { AppDispatch } from '../store/store';

export const useAuth = () => {
    const dispatch = useDispatch<AppDispatch>();
    const user = useSelector(selectUser);
    const isAuthenticated = useSelector(selectIsAuthenticated);
    const loading = useSelector(selectAuthLoading);
    const error = useSelector(selectAuthError);

    const signup = useCallback(async (username: string, email: string, password: string) => {
        dispatch(setLoading(true));
        dispatch(setError(null));

        try {
            console.log('Attempting signup with:', { username, email, password: '***' });
            const response = await authService.signup({ username, email, password });
            console.log('Signup response:', response);
            dispatch(setUser({
                id: response.id,
                username: response.username,
                email: response.email,
            }));
            return response;
        } catch (err: any) {
            console.error('Signup error details:', err);
            const errorMessage = err.message || 'Signup failed';
            dispatch(setError(errorMessage));
            throw err;
        } finally {
            dispatch(setLoading(false));
        }
    }, [dispatch]);

    const login = useCallback(async (identifier: string, password: string) => {
        dispatch(setLoading(true));
        dispatch(setError(null));

        try {
            const response = await authService.login({ identifier, password });
            dispatch(setAccessToken(response.access_token));
            dispatch(setUser({
                id: response.user.id,
                username: response.user.username,
                email: response.user.email,
            }));
            return response;
        } catch (err: any) {
            const errorMessage = err.message || 'Login failed';
            dispatch(setError(errorMessage));
            throw err;
        } finally {
            dispatch(setLoading(false));
        }
    }, [dispatch])

    const logout = useCallback(async () => {
        dispatch(setLoading(true));

        try {
            await authService.logout();
        } catch (err) {
            console.error('Logout error:', err);
        } finally {
            dispatch(clearAuth());
            dispatch(setLoading(false));
        }
    }, [dispatch]);

    const updateProfile = useCallback(async (username?: string, email?: string) => {
        dispatch(setLoading(true));
        dispatch(setError(null));

        try {
            const response = await authService.updateProfile({ username, email });
            dispatch(setUser({
                id: response.user.id,
                username: response.user.username,
                email: response.user.email,
            }));
            return response;
        } catch (err: any) {
            const errorMessage = err.message || 'Update failed';
            dispatch(setError(errorMessage));
            throw err;
        } finally {
            dispatch(setLoading(false));
        }
    }, [dispatch]);

    return {
        user,
        isAuthenticated,
        loading,
        error,
        signup,
        login,
        logout,
        updateProfile,
    };
};