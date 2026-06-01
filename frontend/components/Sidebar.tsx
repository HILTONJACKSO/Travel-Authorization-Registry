'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

interface SidebarProps {
    isOpen?: boolean;
    onClose?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
    const pathname = usePathname();
    const { user, logout } = useAuth();
    const isAdmin = user?.role === 'Admin';

    const menuItems = [
        { name: 'Dashboard', path: '/dashboard', icon: 'bi-grid-fill' },
        { name: 'Documents', path: '/documents', icon: 'bi-file-earmark-text' },
        { name: 'Approvals', path: '/approvals', icon: 'bi-check-square' },
        { name: 'Reports', path: '/reports', icon: 'bi-bar-chart' },
        { name: 'Request Travel', path: '/documents/upload?type=travel', icon: 'bi-plus-circle-fill' },
        { name: 'Travel History', path: '/travel-history', icon: 'bi-airplane-fill' },
        { name: 'Settings', path: '/settings', icon: 'bi-gear' },
    ];

    return (
        <div className={`sidebar d-flex flex-column ${isOpen ? 'open' : ''}`}>
            <div className="p-4 mb-2 d-flex align-items-center justify-content-between">
                <div className="d-flex align-items-center">
                    <div className="me-3 d-flex align-items-center justify-content-center overflow-hidden" style={{ width: '42px', height: '42px' }}>
                        <img src="/logo.png" alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                    </div>
                    <div>
                        <div className="fw-bold text-white lh-1" style={{ fontSize: '1.1rem' }}>Interface</div>
                        <div className="text-uppercase text-white opacity-75 fw-bold" style={{ fontSize: '0.65rem', letterSpacing: '1px' }}>Official Ledger</div>
                    </div>
                </div>
                {onClose && (
                    <button className="btn btn-link text-white d-lg-none p-0 border-0" onClick={onClose}>
                        <i className="bi bi-x-lg fs-4"></i>
                    </button>
                )}
            </div>

            <div className="flex-grow-1 mt-2">
                {menuItems.map((item) => (
                    <Link
                        key={item.path}
                        href={item.path}
                        className={`sidebar-link ${pathname === item.path ? 'active' : ''}`}
                    >
                        <i className={`bi ${item.icon}`}></i>
                        <span>{item.name}</span>
                    </Link>
                ))}

                {isAdmin && (
                    <>
                        <div className="mx-4 mt-4 mb-2 text-uppercase text-white opacity-50 fw-bold small" style={{ letterSpacing: '1px' }}>Admin</div>
                        <Link href="/travel-calendar" className={`sidebar-link ${pathname === '/travel-calendar' ? 'active' : ''}`}>
                            <i className="bi bi-calendar-event-fill"></i>
                            <span>Travel Calendar</span>
                        </Link>
                        <Link href="/admin/users" className={`sidebar-link ${pathname === '/admin/users' ? 'active' : ''}`}>
                            <i className="bi bi-people"></i>
                            <span>User Management</span>
                        </Link>
                        <Link href="/admin/positions" className={`sidebar-link ${pathname === '/admin/positions' ? 'active' : ''}`}>
                            <i className="bi bi-person-badge"></i>
                            <span>Official Positions</span>
                        </Link>
                        <Link href="/admin/ministries" className={`sidebar-link ${pathname === '/admin/ministries' ? 'active' : ''}`}>
                            <i className="bi bi-buildings-fill"></i>
                            <span>Agencies & Ministries</span>
                        </Link>
                        <Link href="/admin/workflow" className={`sidebar-link ${pathname === '/admin/workflow' ? 'active' : ''}`}>
                            <i className="bi bi-diagram-3"></i>
                            <span>Workflows</span>
                        </Link>
                    </>
                )}
            </div>

            <div className="p-3 border-top border-white border-opacity-10 mt-auto mb-3">
                <Link href="/support" className="sidebar-link mb-1">
                    <i className="bi bi-question-circle"></i>
                    <span>Support</span>
                </Link>
                <button onClick={logout} className="sidebar-link text-danger border-0 bg-transparent w-100 text-start">
                    <i className="bi bi-box-arrow-left"></i>
                    <span>Logout</span>
                </button>
            </div>
        </div>
    );
};

export default Sidebar;
