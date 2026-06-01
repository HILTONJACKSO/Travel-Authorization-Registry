'use client';

import React from 'react';
import { useRouter } from 'next/navigation';

const PrivacyPolicyPage: React.FC = () => {
    const router = useRouter();

    return (
        <div className="min-vh-100 bg-light py-5" style={{ fontFamily: 'Inter, sans-serif' }}>
            <div className="container" style={{ maxWidth: '800px' }}>
                <div className="mb-4">
                    <button 
                        className="btn btn-link text-decoration-none p-0 text-muted fw-bold"
                        onClick={() => router.back()}
                    >
                        <i className="bi bi-arrow-left me-2"></i>Back
                    </button>
                </div>
                
                <div className="bg-white p-5 rounded-4 shadow-sm">
                    <h1 className="fw-bold mb-4" style={{ color: '#0b224b' }}>Privacy Policy</h1>
                    <p className="text-muted mb-4">Last updated: {new Date().toLocaleDateString()}</p>

                    <div className="lh-lg text-secondary">
                        <h4 className="fw-bold text-dark mt-4 mb-3">1. Information Collection</h4>
                        <p>The Government Integrated System collects personal and professional information necessary to provide secure access to government services and portals. This includes, but is not limited to, your name, official email address, role, and biometric data where applicable.</p>

                        <h4 className="fw-bold text-dark mt-4 mb-3">2. Use of Information</h4>
                        <p>Information collected is used solely for the purpose of identity verification, authorization of official operations, and maintaining the integrity of our immutable audit logs. We do not share this information with third parties outside of authorized government departments.</p>

                        <h4 className="fw-bold text-dark mt-4 mb-3">3. Data Security</h4>
                        <p>We employ Tier-1 security measures, including multi-factor authentication and end-to-end encryption, to protect your data against unauthorized access, alteration, disclosure, or destruction.</p>

                        <h4 className="fw-bold text-dark mt-4 mb-3">4. Your Rights</h4>
                        <p>As an authorized user, you have the right to request access to your data and request corrections if necessary through your department administrator.</p>

                        <hr className="my-5" />
                        <p className="small text-center">For any privacy-related inquiries, please contact the central IT security bureau.</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PrivacyPolicyPage;
