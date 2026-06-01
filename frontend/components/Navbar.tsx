'use client';

import React, { useState } from 'react';
import { Navbar, Container, Form } from 'react-bootstrap';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import NotificationsDropdown from './NotificationsDropdown';

interface GovNavbarProps {
    onMenuClick?: () => void;
}

const GovNavbar: React.FC<GovNavbarProps> = ({ onMenuClick }) => {
    const { user } = useAuth();
    const [searchTerm, setSearchTerm] = useState('');
    const router = useRouter();

    const handleSearch = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            const term = searchTerm.trim().toLowerCase();
            if (!term) return;

            const routesMap: Record<string, string> = {
                'dashboard': '/dashboard',
                'documents': '/documents',
                'approvals': '/approvals',
                'reports': '/reports',
                'request travel': '/documents/upload?type=travel',
                'travel history': '/travel-history',
                'settings': '/settings',
                'user access': '/admin/users',
                'ministry list': '/admin/ministries',
                'official positions': '/admin/positions',
                'workflow rules': '/admin/workflow'
            };

            // Look for a match in our predefined routes
            const match = Object.keys(routesMap).find(key => key.includes(term) || term.includes(key));

            if (match) {
                router.push(routesMap[match]);
                setSearchTerm(''); // Clear after navigation
            } else {
                router.push(`/documents?search=${encodeURIComponent(searchTerm.trim())}`);
            }
        }
    };

    return (
        <Navbar expand="lg" className="navbar py-3">
            <Container fluid className="px-4">
                {/* Left: Branding and Mobile Menu */}
                <div className="d-flex align-items-center">
                    {onMenuClick && (
                        <button className="btn btn-link text-white d-lg-none p-0 me-3 border-0" onClick={onMenuClick}>
                            <i className="bi bi-list fs-3"></i>
                        </button>
                    )}
                    <Navbar.Brand className="fw-bold text-ledger text-uppercase tracking-wider d-flex align-items-center gap-2 m-0" style={{ fontSize: '1.1rem', letterSpacing: '0.5px' }}>
                        <i className="bi bi-shield-lock-fill opacity-50"></i>
                        <span className="d-none d-sm-inline">Travel Authorization Registry</span>
                        <span className="d-inline d-sm-none">TAR</span>
                    </Navbar.Brand>
                </div>

                {/* Center: Search */}
                <div className="d-none d-lg-flex position-relative align-items-center" style={{ width: '400px' }}>
                    <i className="bi bi-search position-absolute ms-3 text-muted"></i>
                    <Form.Control
                        type="text"
                        placeholder="Search archive..."
                        className="search-archive w-100"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        onKeyDown={handleSearch}
                    />
                </div>

                {/* Right: Actions */}
                <div className="d-flex align-items-center gap-4">
                    <NotificationsDropdown />

                    <div className="d-flex align-items-center gap-3">
                        <div className="text-end d-none d-sm-block">
                            <div className="fw-bold small">
                                {user?.first_name || user?.last_name
                                    ? `${user.first_name || ''} ${user.last_name || ''}`.trim()
                                    : user?.email || 'Administrator'}
                            </div>
                            <div className="text-muted small" style={{ fontSize: '0.75rem' }}>Full access</div>
                        </div>
                        <div className="rounded-circle overflow-hidden bg-light border d-flex align-items-center justify-content-center" style={{ width: '40px', height: '40px' }}>
                            {user?.profile_picture ? (
                                <img
                                    src={user.profile_picture.startsWith('http') ? user.profile_picture : `http://localhost:8000${user.profile_picture}`}
                                    alt="Profile"
                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                />
                            ) : (
                                <i className="bi bi-person-circle fs-2 text-muted"></i>
                            )}
                        </div>
                    </div>
                </div>
            </Container>
        </Navbar>
    );
};

export default GovNavbar;
