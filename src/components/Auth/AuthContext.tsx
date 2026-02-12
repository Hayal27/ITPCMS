import React, { createContext, useContext, useReducer, useEffect, ReactNode, useCallback } from 'react';
import axios from 'axios';
import { registerLogoutCallback, BACKEND_URL } from '../../services/apiService';

// Unified API Base URL
const API_BASE_URL = `${BACKEND_URL}/api`;

console.log(`[AUTH] API Base URL configured as: ${API_BASE_URL}`);

// Configure axios for credentials (cookies)
axios.defaults.withCredentials = true;

// --- Interfaces ---
interface User {
    user_id: string | number;
    name: string;
    lname: string;
    role_id: string | number;
    user_name: string;
    email?: string;
    role_name?: string;
}

interface AuthState {
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;
    isLoading: boolean;
}

type AuthAction =
    | { type: 'INITIALIZE'; payload: { user: User | null } }
    | { type: 'LOGIN'; payload: { user: User } }
    | { type: 'LOGOUT' }
    | { type: 'SET_LOADING'; payload: boolean };

interface AuthContextProps extends AuthState {
    login: (credentials: Record<string, any>) => Promise<{ success: boolean; message?: string; locked?: boolean }>;
    logout: () => Promise<void>;
    dispatch: React.Dispatch<AuthAction>;
}

// --- Initial State ---
const getInitialState = (): AuthState => {
    return {
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: true, // Start in loading state until session is verified
    };
};

// --- Reducer ---
const authReducer = (state: AuthState, action: AuthAction): AuthState => {
    switch (action.type) {
        case 'INITIALIZE':
            // Security: Ensure sensitive data is never left in localStorage from legacy versions
            if (typeof window !== 'undefined' && window.localStorage) {
                localStorage.removeItem('user');
                localStorage.removeItem('token');
            }
            return {
                ...state,
                user: action.payload.user,
                token: null,
                isAuthenticated: !!action.payload.user,
                isLoading: false,
            };
        case 'LOGIN':
            // Security: Ensure sensitive data is never persisted in localStorage
            if (typeof window !== 'undefined' && window.localStorage) {
                localStorage.removeItem('user');
                localStorage.removeItem('token');
            }
            return {
                ...state,
                user: action.payload.user,
                token: null,
                isAuthenticated: true,
                isLoading: false,
            };
        case 'LOGOUT':
            // Security: Ensure sensitive data is explicitly wiped
            if (typeof window !== 'undefined' && window.localStorage) {
                localStorage.removeItem('user');
                localStorage.removeItem('token');
            }
            return {
                ...state,
                user: null,
                token: null,
                isAuthenticated: false,
                isLoading: false,
            };
        case 'SET_LOADING':
            return {
                ...state,
                isLoading: action.payload,
            };
        default:
            // Ensure exhaustive check or handle unknown action types
            const exhaustiveCheck: never = action;
            return state;
    }
};

// --- Context ---
const AuthContext = createContext<AuthContextProps | undefined>(undefined);

// --- Provider ---
interface AuthProviderProps {
    children: ReactNode;
}

const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const [state, dispatch] = useReducer(authReducer, getInitialState());

    // --- Actions ---
    const login = useCallback(async (credentials: Record<string, any>): Promise<{ success: boolean; message?: string; locked?: boolean }> => {
        dispatch({ type: 'SET_LOADING', payload: true });
        const cleanedCredentials = {
            ...credentials,
            user_name: typeof credentials.user_name === 'string' ? credentials.user_name.trim() : credentials.user_name
        };
        try {
            const response = await axios.post<{ success: boolean; token?: string; user?: User; message?: string; locked?: boolean }>(`${API_BASE_URL}/login`, cleanedCredentials, { withCredentials: true });


            if (response.data.success && response.data.user) {
                const { user } = response.data;
                dispatch({ type: 'LOGIN', payload: { user } });
                return { success: true };
            } else {
                console.error("Login API Error:", response.data.message || 'Unknown login error');
                dispatch({ type: 'SET_LOADING', payload: false });
                return {
                    success: false,
                    message: response.data.message || 'Login failed',
                    locked: response.data.locked
                };
            }
        } catch (error: any) {
            console.error("Login Request Failed:", error);

            // Extract detailed error info
            const errorData = error.response?.data;
            const message = errorData?.message || errorData?.error || error.message || "Login failed due to a network or server error.";
            const locked = errorData?.locked || false;

            console.log(`[AUTH] Login failed: ${message}`, { status: error.response?.status, data: errorData });

            dispatch({ type: 'SET_LOADING', payload: false });
            return { success: false, message, locked };
        }
        // No finally block needed as SET_LOADING(false) is handled in error cases and LOGIN action
    }, []); // Keep dependencies empty as dispatch is stable

    const logout = useCallback(async () => {
        const userId = state.user?.user_id;

        // Security: Ensure sensitive data is explicitly wiped locally
        if (typeof window !== 'undefined' && window.localStorage) {
            localStorage.removeItem('user');
            localStorage.removeItem('token');
        }

        dispatch({ type: 'LOGOUT' });

        if (userId) {
            try {
                // Notifying the server to clear cookies and revoke token
                await axios.put(`${API_BASE_URL}/logout/${userId}`, {}, { withCredentials: true });
            } catch (error) {
                // We log the error but don't stop the user from being logged out locally
                console.warn("[AUTH] Server-side logout failed, but local session cleared:", error);
            }
        }
    }, [state.user?.user_id]);

    // --- Effects ---
    useEffect(() => {
        const initializeAuth = async () => {
            // Priority: Clear any sensitive legacy data immediately
            if (typeof window !== 'undefined' && window.localStorage) {
                localStorage.removeItem('user');
                localStorage.removeItem('token');
            }

            try {
                const response = await axios.get<{ success: boolean; user: User }>(`${API_BASE_URL}/check-auth`, { withCredentials: true });
                if (response.data.success) {
                    dispatch({ type: 'INITIALIZE', payload: { user: response.data.user } });
                } else {
                    dispatch({ type: 'INITIALIZE', payload: { user: null } });
                }
            } catch (error) {
                console.error("[AUTH] Initialization failed:", error);
                dispatch({ type: 'INITIALIZE', payload: { user: null } });
            }
        };

        initializeAuth();

        // Register the logout callback to handle 401 Unauthorized responses (session expiration)
        registerLogoutCallback(() => {
            console.warn("[AUTH] Session expired. Executing automatic logout.");
            logout();
        });

        // PASSIVE HEARTBEAT: Ping server periodically to detect background expiration
        const heartbeatInterval = setInterval(async () => {
            if (state.isAuthenticated) {
                try {
                    const response = await axios.get(`${API_BASE_URL}/check-auth`, { withCredentials: true });
                    if (!response.data.success) {
                        console.warn("[AUTH] Passive heartbeat detected expired session.");
                        logout();
                    }
                } catch (error: any) {
                    if (error.response?.status === 401) {
                        console.warn("[AUTH] Passive heartbeat received 401.");
                        logout();
                    }
                }
            }
        }, 120000); // Check every 2 minutes

        return () => clearInterval(heartbeatInterval);

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [state.isAuthenticated, logout]); // Run only once on mount, but restart or clear if auth changes

    // --- Context Value ---
    const contextValue: AuthContextProps = {
        ...state,
        login,
        logout,
        dispatch,
    };

    return (
        <AuthContext.Provider value={contextValue}>
            {children}
        </AuthContext.Provider>
    );
};

// --- Hook ---
const useAuth = (): AuthContextProps => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export { AuthProvider, useAuth, AuthContext };
