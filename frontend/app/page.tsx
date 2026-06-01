'use client';

import React, { useState } from 'react';
import { Form, Button, Alert, Spinner } from 'react-bootstrap';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useNotification } from '@/context/NotificationContext';
import Image from 'next/image';

const LoginPage: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [otp, setOtp] = useState('');
    const [showOtp, setShowOtp] = useState(false);
    const [loading, setLoading] = useState(false);
    const [apiError, setApiError] = useState('');
    const [rememberMe, setRememberMe] = useState(true);
    const [showPassword, setShowPassword] = useState(false);
    const { showNotification } = useNotification();

    const { login, verifyOtp } = useAuth();
    const router = useRouter();

    const handleInitialLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setApiError('');
        try {
            const result = await login(email, password, rememberMe);
            if (result.requires_otp) {
                setShowOtp(true);
            } else {
                router.push('/dashboard');
            }
        } catch (err: any) {
            setApiError(err.response?.data?.error || 'Authentication failed. Please check credentials.');
        } finally {
            setLoading(false);
        }
    };

    const handleOtpVerify = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setApiError('');
        try {
            await verifyOtp(email, otp, rememberMe);
            router.push('/dashboard');
        } catch (err: any) {
            setApiError('Invalid OTP. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-vh-100 d-flex flex-column bg-light" style={{ fontFamily: 'Inter, sans-serif' }}>
            <div className="d-flex flex-grow-1">
                {/* Left Side */}
                <div 
                    className="d-none d-lg-flex flex-column justify-content-center p-5 position-relative"
                    style={{ 
                        flex: '1.2', 
                        backgroundImage: 'url("/bg-building-new.jpg")',
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        color: 'white'
                    }}
                >
                    <div 
                        className="position-absolute top-0 start-0 w-100 h-100" 
                        style={{ backgroundColor: 'rgba(11, 34, 75, 0.88)' }}
                    ></div>
                    <div className="position-relative" style={{ zIndex: 1, maxWidth: '600px', marginLeft: '5%' }}>
                        <div className="mb-4 bg-white d-inline-block rounded-3 p-2 shadow">
                            <Image src="/logo.png" alt="Ministry Seal" width={80} height={80} style={{ objectFit: 'contain' }} />
                        </div>
                        <h6 className="fw-bold text-uppercase mb-2" style={{ letterSpacing: '3px', color: '#d4af37' }}>Republic of Liberia</h6>
                        <h1 className="fw-bold display-4 mb-4">TRAVEL AUTHORIZATION</h1>
                        
                        <h3 className="fw-bold mb-2">One Ministry,</h3>
                        <h3 className="fw-bold mb-4">One Authorization.</h3>
                        
                        <div style={{ width: '60px', height: '4px', backgroundColor: '#d4af37', marginBottom: '2rem' }}></div>
                        
                        <p className="fs-5 opacity-75" style={{ color: '#e2e8f0', lineHeight: '1.6', maxWidth: '500px' }}>
                            Secure administrative portal for the <strong>Ministry of State</strong> to authorize, audit, and archive official travel authorizations with absolute transparency and real-time oversight.
                        </p>
                        
                        <div className="mt-5 pt-4 border-top border-secondary border-opacity-50 text-uppercase fw-bold small" style={{ letterSpacing: '1px', fontSize: '0.75rem', color: '#cbd5e1' }}>
                            AUTHORIZED PERSONNEL ONLY &bull; TIER-1 SECURITY ACTIVE &bull; ARCHIVE V2.1
                        </div>
                    </div>
                </div>

                {/* Right Side */}
                <div 
                    className="d-flex flex-column justify-content-center align-items-center"
                    style={{ flex: '1', padding: '2rem', backgroundColor: '#f8f9fa' }}
                >
                    <div className="bg-white p-5 rounded-4 shadow" style={{ width: '100%', maxWidth: '480px', border: '1px solid rgba(0,0,0,0.05)' }}>
                        <div className="text-center mb-4">
                            <div className="mb-3 d-inline-block p-2 bg-light rounded-circle shadow-sm border">
                                <Image src="/logo.png" alt="Ministry Seal" width={64} height={64} style={{ objectFit: 'contain', borderRadius: '50%' }} />
                            </div>
                            <h3 className="fw-bolder" style={{ color: '#0b224b', letterSpacing: '-0.5px' }}>
                                Ministry of State
                            </h3>
                            <p className="text-muted fw-bold text-uppercase small" style={{ letterSpacing: '1px' }}>
                                Authorized Hub
                            </p>
                        </div>
                        
                        {apiError && <Alert variant="danger" className="small py-2 border-0 fw-bold"><i className="bi bi-exclamation-circle-fill me-2"></i>{apiError}</Alert>}
                        
                        {!showOtp ? (
                            <Form onSubmit={handleInitialLogin}>
                                <div className="text-uppercase fw-bolder mb-3" style={{ fontSize: '0.8rem', letterSpacing: '1px', color: '#475569' }}>
                                    STATE OFFICIAL LOGIN
                                </div>
                                {/* Username */}
                                <Form.Group className="mb-3">
                                    <div className="input-group">
                                        <span className="input-group-text bg-light text-muted border-end-0 px-3">
                                            <i className="bi bi-person-fill"></i>
                                        </span>
                                        <Form.Control 
                                            type="text"
                                            placeholder="Official Email / Username"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            className="border-start-0 py-2 shadow-none bg-light"
                                            style={{ fontSize: '0.95rem' }}
                                            required
                                        />
                                    </div>
                                </Form.Group>

                                {/* Password */}
                                <Form.Group className="mb-4">
                                    <div className="input-group">
                                        <span className="input-group-text bg-light text-muted border-end-0 px-3">
                                            <i className="bi bi-lock-fill"></i>
                                        </span>
                                        <Form.Control 
                                            type={showPassword ? "text" : "password"}
                                            placeholder="Secure Password"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            className="border-start-0 border-end-0 py-2 shadow-none bg-light"
                                            style={{ fontSize: '0.95rem' }}
                                            required
                                        />
                                        <button 
                                            type="button"
                                            className="btn bg-light border border-start-0 text-muted shadow-none px-3"
                                            onClick={() => setShowPassword(!showPassword)}
                                        >
                                            <i className={`bi ${showPassword ? 'bi-eye-slash-fill' : 'bi-eye-fill'}`}></i>
                                        </button>
                                    </div>
                                </Form.Group>

                                <Button 
                                    type="submit"
                                    disabled={loading}
                                    className="w-100 py-3 mb-4 fw-bold border-0 shadow-sm"
                                    style={{ backgroundColor: '#0b224b', borderRadius: '8px', fontSize: '1rem', letterSpacing: '1px' }}
                                >
                                    {loading ? <Spinner animation="border" size="sm" /> : 'AUTHORIZE ACCESS'}
                                </Button>
                            </Form>
                        ) : (
                            <Form onSubmit={handleOtpVerify}>
                                <div className="text-uppercase fw-bolder mb-3 text-center" style={{ fontSize: '0.8rem', letterSpacing: '1px', color: '#475569' }}>
                                    SECURITY VERIFICATION
                                </div>
                                <Form.Group className="mb-4">
                                    <div className="input-group">
                                        <span className="input-group-text bg-light text-muted border-end-0 px-3">
                                            <i className="bi bi-shield-lock-fill"></i>
                                        </span>
                                        <Form.Control
                                            type="text"
                                            placeholder="Enter 6-Digit OTP"
                                            value={otp}
                                            onChange={(e) => setOtp(e.target.value)}
                                            required
                                            className="border-start-0 py-3 shadow-none text-center fw-bold bg-light"
                                            style={{ letterSpacing: '4px', fontSize: '1.2rem' }}
                                            maxLength={6}
                                        />
                                    </div>
                                    <Form.Text className="text-muted small text-center d-block mt-2">
                                        Check your secure government email for the code.
                                    </Form.Text>
                                </Form.Group>

                                <Button
                                    type="submit"
                                    disabled={loading}
                                    className="w-100 py-3 mb-3 fw-bold border-0 shadow-sm"
                                    style={{ backgroundColor: '#0b224b', borderRadius: '8px', fontSize: '1rem', letterSpacing: '1px' }}
                                >
                                    {loading ? <Spinner animation="border" size="sm" /> : 'VERIFY IDENTITY'}
                                </Button>

                                <div className="text-center mt-3">
                                    <button
                                        type="button"
                                        className="btn btn-link text-decoration-none text-muted small fw-bold"
                                        onClick={() => setShowOtp(false)}
                                    >
                                        <i className="bi bi-arrow-left me-1"></i> Cancel Authorization
                                    </button>
                                </div>
                            </Form>
                        )}

                        <div className="mt-4 pt-4 border-top text-center px-3">
                            <div className="d-flex align-items-center justify-content-center gap-2 mb-1">
                                <div className="spinner-grow text-success" style={{ width: '10px', height: '10px' }} role="status"></div>
                                <span className="fw-bold small text-dark" style={{ letterSpacing: '1px' }}>Registry Secure & Live</span>
                            </div>
                            <p className="text-muted small fw-bold mb-0 opacity-50" style={{ fontSize: '0.7rem' }}>
                                Integrity Check: 5/30/2026
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
