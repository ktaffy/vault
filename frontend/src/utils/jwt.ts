import { jwtDecode } from 'jwt-decode';

interface JWTPayload {
    id: string;
    username: string;
    exp: number;
    iat: number;
}

export const decodeToken = (token: string): { id: string; username: string } | null => {
    try {
        const decoded = jwtDecode<JWTPayload>(token);
        return {
            id: decoded.id,
            username: decoded.username,
        };
    } catch (error) {
        if (__DEV__) {
            console.error('Failed to decode token:', error);
        }
        return null;
    }
};

export const isTokenExpired = (token: string): boolean => {
    try {
        const decoded = jwtDecode<JWTPayload>(token);
        const currentTime = Date.now() / 1000;
        return decoded.exp < currentTime;
    } catch (error) {
        return true;
    }
};