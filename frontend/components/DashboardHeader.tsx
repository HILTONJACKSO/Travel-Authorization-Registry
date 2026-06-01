'use client';

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

interface DashboardHeaderProps {
    title: string;
    subtitle?: string;
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({ title, subtitle }) => {
    const { user } = useAuth();
    const [searchTerm, setSearchTerm] = useState('');
    const router = useRouter();

    const handleSearch = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            if (searchTerm.trim()) {
                router.push(`/documents?search=${encodeURIComponent(searchTerm.trim())}`);
            }
        }
    };

    const [activeDelegation, setActiveDelegation] = useState<any>(null);

    React.useEffect(() => {
        if (user) {
            import('@/lib/api-client').then(({ apiClient }) => {
                apiClient.get('/workflow/delegations/')
                    .then(res => {
                        const now = new Date();
                        const active = res.data.find((d: any) =>
                            d.to_user_email === user.email &&
                            new Date(d.start_date) <= now &&
                            new Date(d.end_date) >= now
                        );
                        if (active) {
                            setActiveDelegation(active);
                        }
                    })
                    .catch(e => console.error("Failed to load proxies", e));
            });
        }
    }, [user]);

    return (
        <>
            {activeDelegation && (
                <div className="bg-white text-dark px-4 py-3 rounded-3 fw-bold mb-4 shadow-sm border border-secondary border-opacity-25 d-flex align-items-center justify-content-between">
                    <div>
                        <i className="bi bi-shield-exclamation fs-5 me-2" style={{ color: '#78350f' }}></i>
                        <strong>ACTIVE PROXY AUTHORITY:</strong> You are currently operating under the delegated authority of <strong>{activeDelegation.from_user_name || activeDelegation.from_user_email}</strong>.
                    </div>
                </div>
            )}
            <div className="d-flex justify-content-between align-items-center mb-5 mt-2">
                <div>
                    <h1 className="fw-bold text-ledger mb-1" style={{ fontSize: '2.4rem' }}>{title}</h1>
                    {subtitle && (
                        <p className="text-muted fs-5 opacity-75 mb-0">
                            {subtitle}
                        </p>
                    )}
                </div>

                <div className="d-flex align-items-center gap-4 text-muted">
                    <div className="position-relative d-none d-lg-block" style={{ width: '300px' }}>
                        <i className="bi bi-search position-absolute top-50 start-0 translate-middle-y ms-3 opacity-50"></i>
                        <input
                            type="text"
                            className="form-control bg-light border-0 ps-5 rounded-4 py-2"
                            placeholder="Search the ledger..."
                            style={{ fontSize: '0.9rem' }}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            onKeyDown={handleSearch}
                        />
                    </div>

                    <div className="d-flex align-items-center gap-3 ps-3 border-start">
                        <div className="text-end d-none d-sm-block">
                            <div className="fw-bold text-dark small lh-1 mb-1">
                                {user?.first_name || user?.last_name
                                    ? `${user.first_name || ''} ${user.last_name || ''}`.trim()
                                    : user?.email || 'Administrator'}
                            </div>
                            <div className="text-uppercase text-dark opacity-75 fw-bold d-flex align-items-center justify-content-end" style={{ fontSize: '0.65rem', letterSpacing: '0.5px' }}>
                                {user?.role || 'Authorized Official'} <span className="badge bg-success text-white ms-2" style={{ fontSize: '0.55rem', padding: '0.25em 0.5em' }}>Full access</span>
                            </div>
                        </div>
                        <div className="rounded-circle overflow-hidden bg-light border d-flex align-items-center justify-content-center" style={{ width: '40px', height: '40px' }}>
                            {user?.profile_picture ? (
                                <img
                                    src={user.profile_picture.startsWith('http') ? user.profile_picture : `http://localhost:8000${user.profile_picture}`}
                                    alt="Profile"
                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                />
                            ) : (
                                <i className="bi bi-person-circle fs-3 text-muted"></i>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default DashboardHeader;
