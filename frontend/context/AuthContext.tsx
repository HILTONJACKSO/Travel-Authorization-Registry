'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api-client';

interface User {
    email: string;
    role: string;
    first_name?: string;
    last_name?: string;
    profile_picture?: string;
}

interface AuthContextType {
    user: User | null;
    login: (email: string, password: string, rememberMe?: boolean) => Promise<any>;
    verifyOtp: (email: string, otp: string, rememberMe?: boolean) => Promise<void>;
    logout: () => void;
    updateUser: (data: Partial<User>) => void;
    isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();

    const lastActivity = React.useRef(Date.now());
    const [showTimeoutWarning, setShowTimeoutWarning] = useState(false);
    const [countdown, setCountdown] = useState(60);

    useEffect(() => {
        if (!user) {
            setShowTimeoutWarning(false);
            return;
        }

        // Reset lastActivity when user logs in so we don't immediately timeout
        lastActivity.current = Date.now();

        const updateActivity = () => {
            if (!showTimeoutWarning) {
                lastActivity.current = Date.now();
            }
        };

        const events = ['mousemove', 'mousedown', 'keydown', 'scroll', 'touchstart'];
        events.forEach(e => document.addEventListener(e, updateActivity, { passive: true }));

        const TIMEOUT_MS = 15 * 60 * 1000; // 15 mins
        const WARNING_MS = 14 * 60 * 1000; // 14 mins

        const interval = setInterval(() => {
            const idleTime = Date.now() - lastActivity.current;

            if (idleTime >= TIMEOUT_MS) {
                logout();
                setShowTimeoutWarning(false);
            } else if (idleTime >= WARNING_MS) {
                if (!showTimeoutWarning) setShowTimeoutWarning(true);
                setCountdown(Math.ceil((TIMEOUT_MS - idleTime) / 1000));
            }
        }, 1000);

        return () => {
            events.forEach(e => document.removeEventListener(e, updateActivity));
            clearInterval(interval);
        };
    }, [user, showTimeoutWarning]);

    const keepAlive = () => {
        lastActivity.current = Date.now();
        setShowTimeoutWarning(false);
    };

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const getStorageItem = (key: string) => localStorage.getItem(key) || sessionStorage.getItem(key);

            console.log('[Auth] Hydrating state from storage...');
            const email = getStorageItem('user_email');
            const role = getStorageItem('user_role');
            const token = getStorageItem('access_token');
            const profile_picture = getStorageItem('user_profile_pic') || undefined;
            const first_name = getStorageItem('user_first_name') || undefined;
            const last_name = getStorageItem('user_last_name') || undefined;

            if (email && role && token) {
                console.log('[Auth] Found session for:', email, 'Role:', role);
                setUser({ email, role, profile_picture, first_name, last_name });
            } else {
                console.warn('[Auth] No complete session found in storage. Email:', !!email, 'Role:', !!role, 'Token:', !!token);
            }
            setIsLoading(false);
        }
    }, []);

    const saveAuthData = (data: any, email: string, rememberMe: boolean = true) => {
        const storage = rememberMe ? localStorage : sessionStorage;

        storage.setItem('access_token', data.access);
        storage.setItem('refresh_token', data.refresh);
        storage.setItem('user_email', data.email || email);
        storage.setItem('user_role', data.role);

        if (data.profile_picture) storage.setItem('user_profile_pic', data.profile_picture);
        if (data.first_name) storage.setItem('user_first_name', data.first_name);
        if (data.last_name) storage.setItem('user_last_name', data.last_name);
    };

    const login = async (email: string, password: string, rememberMe: boolean = true) => {
        const response = await apiClient.post('/auth/login/', { email, password });
        const data = response.data;
        console.log('[Auth] Login API responded. Requires OTP:', !!data.requires_otp);

        if (!data.requires_otp) {
            console.log('[Auth] Saving session data...');
            saveAuthData(data, email, rememberMe);

            setUser({
                email: data.email || email,
                role: data.role,
                profile_picture: data.profile_picture,
                first_name: data.first_name,
                last_name: data.last_name
            });
        }
        return data;
    };

    const verifyOtp = async (email: string, otp: string, rememberMe: boolean = true) => {
        const response = await apiClient.post('/auth/verify-otp/', { email, otp });
        const data = response.data;

        saveAuthData(data, email, rememberMe);

        setUser({
            email: data.email || email,
            role: data.role,
            profile_picture: data.profile_picture,
            first_name: data.first_name,
            last_name: data.last_name
        });
    };

    const updateUser = (data: Partial<User>) => {
        setUser(prev => {
            if (!prev) return null;
            const updated = { ...prev, ...data };
            if (data.profile_picture) {
                localStorage.setItem('user_profile_pic', data.profile_picture);
            }
            if (data.first_name) localStorage.setItem('user_first_name', data.first_name);
            if (data.last_name) localStorage.setItem('user_last_name', data.last_name);
            return updated;
        });
    };

    const logout = () => {
        localStorage.clear();
        sessionStorage.clear();
        setUser(null);
        router.push('/');
    };

    return (
        <AuthContext.Provider value={{ user, login, verifyOtp, logout, updateUser, isLoading }}>
            {children}
            {showTimeoutWarning && (
                <div className="position-fixed top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center" style={{ backgroundColor: 'rgba(0,0,0,0.85)', zIndex: 9999, backdropFilter: 'blur(5px)' }}>
                    <div className="bg-white p-5 rounded-4 shadow-lg text-center border-top border-secondary border-5" style={{ maxWidth: '500px' }}>
                        <div className="mb-4">
                            <i className="bi bi-shield-lock-fill text-dark" style={{ fontSize: '4rem' }}></i>
                        </div>
                        <h3 className="fw-bolder text-dark mb-3">Session Expiring</h3>
                        <p className="text-muted mb-4 fs-5">
                            For your security, your authenticated session will be terminated due to inactivity.
                        </p>
                        <div className="d-flex justify-content-center align-items-center mb-5">
                            <div className="bg-secondary bg-opacity-10 text-dark rounded-circle d-flex justify-content-center align-items-center fw-bolder fs-1" style={{ width: '100px', height: '100px' }}>
                                {countdown}
                            </div>
                        </div>
                        <div className="d-flex gap-3 justify-content-center">
                            <button onClick={logout} className="btn btn-light px-4 py-2 fw-bold rounded-pill border">
                                Log Out Now
                            </button>
                            <button onClick={keepAlive} className="btn btn-dark px-4 py-2 fw-bold rounded-pill">
                                Keep Session Alive
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
