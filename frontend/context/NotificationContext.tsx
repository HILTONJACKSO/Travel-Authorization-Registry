'use client';

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { Toast, ToastContainer } from 'react-bootstrap';

type NotificationType = 'success' | 'error' | 'info' | 'warning';

interface Notification {
    id: number;
    title: string;
    message: string;
    type: NotificationType;
}

interface NotificationContextType {
    showNotification: (title: string, message: string, type?: NotificationType) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [notifications, setNotifications] = useState<Notification[]>([]);

    const showNotification = useCallback((title: string, message: string, type: NotificationType = 'success') => {
        const id = Date.now();
        setNotifications((prev) => [...prev, { id, title, message, type }]);

        // Auto-remove after 5 seconds
        setTimeout(() => {
            setNotifications((prev) => prev.filter((n) => n.id !== id));
        }, 5000);
    }, []);

    const removeNotification = (id: number) => {
        setNotifications((prev) => prev.filter((n) => n.id !== id));
    };

    const getIcon = (type: NotificationType) => {
        switch (type) {
            case 'success': return <i className="bi bi-check-circle-fill me-2 fs-5" style={{ color: '#14532d' }}></i>;
            case 'error': return <i className="bi bi-exclamation-octagon-fill me-2 fs-5" style={{ color: '#7f1d1d' }}></i>;
            case 'warning': return <i className="bi bi-exclamation-triangle-fill me-2 fs-5" style={{ color: '#78350f' }}></i>;
            default: return <i className="bi bi-info-circle-fill me-2 fs-5 text-dark"></i>;
        }
    };

    const getProgressBg = (type: NotificationType) => {
        switch (type) {
            case 'success': return '#14532d';
            case 'error': return '#7f1d1d';
            case 'warning': return '#78350f';
            default: return '#0f172a';
        }
    };

    return (
        <NotificationContext.Provider value={{ showNotification }}>
            {children}

            <ToastContainer position="top-end" className="p-4" style={{ zIndex: 9999 }}>
                {notifications.map((n) => (
                    <Toast
                        key={n.id}
                        onClose={() => removeNotification(n.id)}
                        className="border-0 shadow-lg overflow-hidden mb-3"
                        style={{
                            borderRadius: '16px',
                            background: 'rgba(255, 255, 255, 0.95)',
                            backdropFilter: 'blur(10px)',
                            minWidth: '300px'
                        }}
                    >
                        <div className="p-3 d-flex align-items-start">
                            <div className="mt-1">{getIcon(n.type)}</div>
                            <div className="flex-grow-1 ms-2">
                                <div className="fw-bold text-black small mb-1">{n.title}</div>
                                <div className="text-black extra-small" style={{ fontSize: '0.75rem', lineHeight: '1.4' }}>
                                    {n.message}
                                </div>
                            </div>
                            <button
                                type="button"
                                className="btn-close ms-2 mt-1"
                                style={{ fontSize: '0.6rem' }}
                                onClick={() => removeNotification(n.id)}
                            ></button>
                        </div>
                        <div
                            className="Toast-progress"
                            style={{ height: '3px', width: '100%', opacity: 0.3, backgroundColor: getProgressBg(n.type) }}
                        ></div>
                    </Toast>
                ))}
            </ToastContainer>
        </NotificationContext.Provider>
    );
};

export const useNotification = () => {
    const context = useContext(NotificationContext);
    if (context === undefined) {
        throw new Error('useNotification must be used within a NotificationProvider');
    }
    return context;
};
