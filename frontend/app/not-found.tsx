'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Button, Container } from 'react-bootstrap';
import Image from 'next/image';

export default function NotFound() {
    const router = useRouter();

    return (
        <div className="d-flex flex-column align-items-center justify-content-center py-5 h-100 position-relative overflow-hidden" style={{ fontFamily: 'Inter, sans-serif', minHeight: '70vh' }}>
            {/* Background elements */}
            <div className="position-absolute w-100 h-100" style={{ opacity: 0.03, pointerEvents: 'none' }}>
                <i className="bi bi-shield-lock-fill position-absolute" style={{ fontSize: '30vw', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', color: '#0b224b' }}></i>
            </div>

            <Container className="text-center position-relative z-index-1 fade-in-up">
                <div className="mb-4 bg-white d-inline-block rounded-circle p-4 shadow-sm border border-light pulse-slow">
                    <Image src="/logo.png" alt="Ministry Seal" width={100} height={100} style={{ objectFit: 'contain' }} />
                </div>
                
                <h1 className="fw-bolder" style={{ fontSize: 'clamp(6rem, 15vw, 12rem)', color: '#0b224b', lineHeight: '1', letterSpacing: '-5px', textShadow: '0 10px 30px rgba(11,34,75,0.1)' }}>
                    404
                </h1>
                
                <div className="mx-auto my-4" style={{ width: '80px', height: '4px', backgroundColor: '#d4af37', borderRadius: '2px' }}></div>
                
                <h2 className="fw-bold mb-3 text-dark">Classified Sector Not Found</h2>
                <p className="fs-5 text-muted mx-auto mb-5" style={{ maxWidth: '600px' }}>
                    The official document, record, or sector you are attempting to access does not exist in the active Sovereign Ledger registry, or you lack the clearance to view it.
                </p>

                <Button 
                    onClick={() => router.push('/')}
                    className="btn-ledger shadow-lg px-5 py-3 rounded-pill fw-bold text-uppercase d-inline-flex align-items-center justify-content-center hover-translate"
                    style={{ letterSpacing: '1px' }}
                >
                    <i className="bi bi-arrow-left-circle-fill me-2 fs-5"></i>
                    Return to Registry Hub
                </Button>
            </Container>

            <div className="position-absolute bottom-0 w-100 text-center py-4 text-muted small fw-bold text-uppercase opacity-50" style={{ letterSpacing: '2px' }}>
                Ministry of State &bull; Secure Integrated System
            </div>
        </div>
    );
}
