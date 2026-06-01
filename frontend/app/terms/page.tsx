'use client';

import React from 'react';
import { useRouter } from 'next/navigation';

const TermsOfUsePage: React.FC = () => {
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
                    <h1 className="fw-bold mb-4" style={{ color: '#0b224b' }}>Terms of Use</h1>
                    <p className="text-muted mb-4">Last updated: {new Date().toLocaleDateString()}</p>

                    <div className="lh-lg text-secondary">
                        <h4 className="fw-bold text-dark mt-4 mb-3">1. Acceptance of Terms</h4>
                        <p>By accessing and using the Government Integrated System, you accept and agree to be bound by the terms and provisions of this agreement. Unauthorized access is strictly prohibited and subject to legal action.</p>

                        <h4 className="fw-bold text-dark mt-4 mb-3">2. Authorized Use</h4>
                        <p>This system is restricted to authorized government personnel only. Users must maintain the confidentiality of their credentials and immediately report any suspected security breaches. Actions performed under your credentials are your responsibility.</p>

                        <h4 className="fw-bold text-dark mt-4 mb-3">3. System Auditing</h4>
                        <p>All activities within the system are subject to real-time auditing and logging. There is no expectation of privacy when using this official government system. Audit logs are immutable and permanent.</p>

                        <h4 className="fw-bold text-dark mt-4 mb-3">4. Limitation of Liability</h4>
                        <p>The Government assumes no responsibility for any delays or failures in system performance. Users must adhere to all departmental protocols when processing official documents.</p>

                        <hr className="my-5" />
                        <p className="small text-center">Failure to comply with these terms may result in immediate revocation of access privileges and disciplinary action.</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TermsOfUsePage;
