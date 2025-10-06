import { clearAuth } from "../../store/slices/authSlice";
import { store } from "../../store/store";

const BASE_URL = 'https://medieval-jeanne-tormentingly.ngrok-free.dev'

interface RequestConfig {
    method: 'GET' | 'POST' | 'PUT' | 'DELETE';
    headers?: Record<string, string>
    body?: any;
    requiresAuth?: boolean;
}

class ApiClient {
    private baseURL: string;

    constructor(baseURL: string) {
        this.baseURL = baseURL;
    }

    private getAuthHeaders(): Record<string, string> {
        const state = store.getState();
        const token = state.auth.accessToken;

        if (token) {
            return {
                'Authorization': `Bearer ${token}`,
            };
        }
        return {};
    }

    async request<T>(endpoint: string, config: RequestConfig): Promise<T> {
        const { method, headers = {}, body, requiresAuth = false } = config;

        const url = `${this.baseURL}${endpoint}`;

        const requestHeaders: Record<string, string> = {
            'Content-Type': 'application/json',
            ...headers,
        };

        if (requiresAuth) {
            Object.assign(requestHeaders, this.getAuthHeaders());
        }

        const requestConfig: RequestInit = {
            method,
            headers: requestHeaders,
            credentials: 'include',
        };

        if (body) {
            if (body instanceof FormData) {
                delete requestHeaders['Content-Type'];
                requestConfig.body = body;
            } else {
                requestConfig.body = JSON.stringify(body);
            }
        }

        try {
            const response = await fetch(url, requestConfig);

            if (response.status === 401) {
                store.dispatch(clearAuth());
                throw new Error('Unauthorized - Please login again');
            }

            if (!response.ok) {
                const errorText = await response.text();
                console.error('API Error Response:', {
                    status: response.status,
                    statusText: response.statusText,
                    body: errorText
                });

                let errorData;
                try {
                    errorData = JSON.parse(errorText);
                } catch {
                    errorData = { message: errorText };
                }

                throw new Error(errorData.error || errorData.message || `Request failed with status ${response.status}`);
            }

            const contentType = response.headers.get('content-type');
            if (!contentType || !contentType.includes('application/json')) {
                return {} as T;
            }

            return await response.json();
        } catch (error) {
            if (error instanceof Error) {
                throw error;
            }
            throw new Error('Network error occurred');
        }
    }

    async get<T>(endpoint: string, requiresAuth = false): Promise<T> {
        return this.request<T>(endpoint, { method: 'GET', requiresAuth });
    }

    async post<T>(endpoint: string, body?: any, requiresAuth = false): Promise<T> {
        return this.request<T>(endpoint, { method: 'POST', body, requiresAuth });
    }

    async put<T>(endpoint: string, body?: any, requiresAuth = true): Promise<T> {
        return this.request<T>(endpoint, { method: 'PUT', body, requiresAuth });
    }

    async delete<T>(endpoint: string, requiresAuth = true): Promise<T> {
        return this.request<T>(endpoint, { method: 'DELETE', requiresAuth });
    }
}

export const apiClient = new ApiClient(BASE_URL);
