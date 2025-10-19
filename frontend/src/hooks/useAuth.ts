import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { authService } from '../services/api/auth';
import { secureStorage } from '../services/storage/SecureStorage';
import { decodeToken, isTokenExpired } from '../utils/jwt';
import { audioCache } from '../utils/audioCache';
import {
    setUser,
    setAccessToken,
    clearAuth,
    setLoading,
    setError,
    setAuthenticated,
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

    const checkAuth = useCallback(async () => {
        dispatch(setLoading(true));
        try {
            const token = await secureStorage.getAccessToken();
            if (token) {
                if (isTokenExpired(token)) {
                    await secureStorage.deleteAccessToken();
                    await secureStorage.deleteUser();
                    dispatch(clearAuth());
                    return;
                }

                const storedUser = await secureStorage.getUser(); 
                const userInfo = decodeToken(token);

                if (userInfo && storedUser) {
                    dispatch(setAccessToken(token));
                    dispatch(setUser(storedUser));
                    dispatch(setAuthenticated(true));
                } else {
                    await secureStorage.deleteAccessToken();
                    await secureStorage.deleteUser();
                    dispatch(clearAuth());
                }
            }
        } catch (error) {
            console.error('Auth check failed:', error);
            dispatch(clearAuth());
        } finally {
            dispatch(setLoading(false));
        }
    }, [dispatch]);

    const signup = useCallback(async (username: string, email: string, password: string) => {
        dispatch(setLoading(true));
        dispatch(setError(null));

        try {
            const response = await authService.signup({ username, email, password });
            dispatch(setUser({
                id: response.id,
                username: response.username,
                email: response.email,
            }));
            return response;
        } catch (err: any) {
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

            await secureStorage.saveAccessToken(response.access_token);
            await secureStorage.saveUser(response.user);

            dispatch(setAccessToken(response.access_token));
            dispatch(setUser({
                id: response.user.id,
                username: response.user.username,
                email: response.user.email,
                profile_pic: response.user.profile_pic,
            }));
            dispatch(setAuthenticated(true));

            return response;
        } catch (err: any) {
            const errorMessage = err.message || 'Login failed';
            dispatch(setError(errorMessage));
            throw err;
        } finally {
            dispatch(setLoading(false));
        }
    }, [dispatch]);

    const logout = useCallback(async () => {
        dispatch(setLoading(true));

        try {
            await authService.logout();
        } catch (err) {
            console.error('Logout error:', err);
        } finally {
            audioCache.clear();
            await secureStorage.deleteAccessToken();
            await secureStorage.deleteUser();
            dispatch(clearAuth());
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
        checkAuth,
    };
};