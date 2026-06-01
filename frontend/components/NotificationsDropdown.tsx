'use client';

import React, { useEffect, useState, useRef } from 'react';
import { apiClient } from '@/lib/api-client';
import { Badge, Spinner } from 'react-bootstrap';
import Link from 'next/link';

interface Notification {
    id: string;
    message: string;
    link: string;
    read_status: boolean;
    created_at: string;
}

const NotificationsDropdown: React.FC = () => {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const fetchNotifications = async () => {
        try {
            const response = await apiClient.get('/audit/notifications/');
            setNotifications(response.data);
            setUnreadCount(response.data.filter((n: Notification) => !n.read_status).length);
        } catch (err) {
            console.error('Failed to fetch notifications:', err);
        }
    };

    useEffect(() => {
        fetchNotifications();
        const interval = setInterval(fetchNotifications, 30000); // Poll every 30s
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const markAsRead = async (id: string) => {
        try {
            await apiClient.patch(`/audit/notifications/${id}/`, { read_status: true });
            fetchNotifications();
        } catch (err) {
            console.error('Failed to mark notification as read:', err);
        }
    };

    const markAllAsRead = async () => {
        // Simple implementation: sequential or custom endpoint if exists
        const unread = notifications.filter(n => !n.read_status);
        await Promise.all(unread.map(n => apiClient.patch(`/audit/notifications/${n.id}/`, { read_status: true })));
        fetchNotifications();
    };

    return (
        <div className="position-relative" ref={dropdownRef}>
            <div
                className="cursor-pointer position-relative p-2 rounded-circle hover-bg-white-10"
                onClick={() => setIsOpen(!isOpen)}
                style={{ transition: 'all 0.2s' }}
            >
                <i className="bi bi-bell fs-5 text-muted"></i>
                {unreadCount > 0 && (
                    <Badge
                        pill
                        bg="light"
                        className="position-absolute top-0 start-100 translate-middle border border-2 border-white text-danger"
                        style={{ fontSize: '0.6rem', padding: '0.35em 0.5em' }}
                    >
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </Badge>
                )}
            </div>

            {isOpen && (
                <div
                    className="position-absolute end-0 mt-2 bg-white shadow-lg border rounded-4 overflow-hidden animate-fade-in"
                    style={{ width: '320px', zIndex: 1050, top: '100%' }}
                >
                    <div className="p-3 border-bottom d-flex justify-content-between align-items-center bg-light bg-opacity-50">
                        <span className="fw-bold text-ledger">Notifications</span>
                        {unreadCount > 0 && (
                            <button
                                className="btn btn-sm btn-link text-decoration-none p-0 fw-bold small text-dark"
                                onClick={markAllAsRead}
                            >
                                Mark all as read
                            </button>
                        )}
                    </div>

                    <div className="overflow-auto" style={{ maxHeight: '400px' }}>
                        {notifications.length > 0 ? (
                            notifications.map((n) => (
                                <div
                                    key={n.id}
                                    className={`p-3 border-bottom hover-bg-light cursor-pointer ${!n.read_status ? 'bg-secondary bg-opacity-10' : ''}`}
                                    onClick={() => {
                                        if (!n.read_status) markAsRead(n.id);
                                        if (n.link) window.location.href = n.link;
                                    }}
                                >
                                    <div className="d-flex gap-3">
                                        <div className={`rounded-circle d-flex align-items-center justify-content-center flex-shrink-0 ${!n.read_status ? 'bg-dark text-white' : 'bg-light text-muted'}`} style={{ width: '36px', height: '36px' }}>
                                            <i className="bi bi-info-circle small"></i>
                                        </div>
                                        <div className="flex-grow-1">
                                            <div className={`small mb-1 ${!n.read_status ? 'fw-bold text-black' : 'text-black'}`}>
                                                {n.message}
                                            </div>
                                            <div className="text-black opacity-50" style={{ fontSize: '0.7rem' }}>
                                                {new Date(n.created_at).toLocaleString()}
                                            </div>
                                        </div>
                                        {!n.read_status && (
                                            <div className="bg-dark rounded-circle mt-1" style={{ width: '8px', height: '8px' }}></div>
                                        )}
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="p-5 text-center text-muted">
                                <i className="bi bi-bell-slash fs-2 opacity-25 mb-3 d-block"></i>
                                <div className="small fw-bold text-uppercase opacity-50" style={{ letterSpacing: '1px' }}>
                                    No Notifications
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="p-2 text-center border-top">
                        <Link href="/audit/logs" className="small text-decoration-none fw-bold text-muted hover-text-ledger" onClick={() => setIsOpen(false)}>
                            View Audit Trail
                        </Link>
                    </div>
                </div>
            )}
        </div>
    );
};

export default NotificationsDropdown;
