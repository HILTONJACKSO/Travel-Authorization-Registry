'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Form, Button, Alert, Spinner, Container, Row, Col } from 'react-bootstrap';

const SupportPage: React.FC = () => {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [subject, setSubject] = useState('');
    const [message, setMessage] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        // Simulate API call
        setTimeout(() => {
            setSubmitting(false);
            setSuccess(true);
            setEmail('');
            setSubject('');
            setMessage('');
        }, 1500);
    };

    return (
        <div className="h-full overflow-auto bg-light pb-5 fade-in-up" style={{ fontFamily: 'Inter, sans-serif' }}>
            {/* Header Section */}
            <div className="bg-white border-bottom border-secondary border-opacity-10 py-5 mb-5 shadow-sm fade-in-up" style={{ animationDelay: '0.1s' }}>
                <Container>
                    <button
                        className="btn btn-link text-decoration-none p-0 text-dark fw-bolder mb-4 hover-translate transition-all"
                        onClick={() => router.back()}
                    >
                        <i className="bi bi-arrow-left me-2"></i>RETURN TO LEDGER
                    </button>
                    <div className="d-flex align-items-center gap-4">
                        <div className="bg-primary bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center shadow-sm" style={{ width: '80px', height: '80px' }}>
                            <i className="bi bi-headset text-primary fs-1"></i>
                        </div>
                        <div>
                            <h1 className="fw-bolder mb-1 text-dark fs-2">Help & Support</h1>
                            <p className="text-muted fw-bold opacity-75 mb-0 fs-5">Government Integrated System Service Desk</p>
                        </div>
                    </div>
                </Container>
            </div>

            <Container style={{ maxWidth: '900px' }}>
                {/* Contact Cards */}
                <Row className="g-4 mb-5 fade-in-up" style={{ animationDelay: '0.2s' }}>
                    <Col md={6}>
                        <div className="p-5 border-0 rounded-4 bg-white shadow-sm text-center h-100 hover-translate transition-all" style={{ borderRadius: '32px' }}>
                            <div className="bg-danger bg-opacity-10 rounded-circle d-inline-flex align-items-center justify-content-center mb-4" style={{ width: '64px', height: '64px' }}>
                                <i className="bi bi-telephone-fill text-danger fs-3"></i>
                            </div>
                            <h5 className="fw-bolder text-dark mb-2">Emergency Dispatch</h5>
                            <p className="small text-muted fw-bold mb-4 opacity-75">Critical system failures and security breaches.</p>
                            <div className="fw-bolder text-danger fs-5 bg-danger bg-opacity-10 py-2 px-4 rounded-pill d-inline-block border border-danger border-opacity-25">
                                +1 (800) GOV-HELP
                            </div>
                        </div>
                    </Col>
                    <Col md={6}>
                        <div className="p-5 border-0 rounded-4 bg-white shadow-sm text-center h-100 hover-translate transition-all" style={{ borderRadius: '32px' }}>
                            <div className="bg-primary bg-opacity-10 rounded-circle d-inline-flex align-items-center justify-content-center mb-4" style={{ width: '64px', height: '64px' }}>
                                <i className="bi bi-envelope-fill text-primary fs-3"></i>
                            </div>
                            <h5 className="fw-bolder text-dark mb-2">Technical Inquiry</h5>
                            <p className="small text-muted fw-bold mb-4 opacity-75">Routine administrative assistance.</p>
                            <div className="fw-bolder text-primary fs-5 bg-primary bg-opacity-10 py-2 px-4 rounded-pill d-inline-block border border-primary border-opacity-25">
                                support@gov.in
                            </div>
                        </div>
                    </Col>
                </Row>

                {/* Ticket Form */}
                <div className="bg-white p-5 rounded-4 shadow-sm fade-in-up" style={{ borderRadius: '32px', animationDelay: '0.3s' }}>
                    <h4 className="fw-bolder text-dark mb-4 pb-3 border-bottom border-secondary border-opacity-10">
                        <i className="bi bi-ticket-detailed me-2 text-primary"></i> Submit a Ticket
                    </h4>

                    {success && (
                        <Alert variant="success" className="rounded-pill border-success border-opacity-25 mb-4 shadow-sm fw-bold d-flex align-items-center fade-in-up bg-success bg-opacity-10 text-success" dismissible onClose={() => setSuccess(false)}>
                            <i className="bi bi-check-circle-fill me-2 fs-5"></i> Ticket submitted successfully to the Support Desk.
                        </Alert>
                    )}

                    <Form onSubmit={handleSubmit}>
                        <Form.Group className="mb-4">
                            <Form.Label className="form-label-gov">Official Email Address</Form.Label>
                            <Form.Control
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="form-control-gov shadow-sm"
                                placeholder="name@gov.in"
                            />
                        </Form.Group>
                        <Form.Group className="mb-4">
                            <Form.Label className="form-label-gov">Subject</Form.Label>
                            <Form.Control
                                type="text"
                                value={subject}
                                onChange={(e) => setSubject(e.target.value)}
                                required
                                className="form-control-gov shadow-sm"
                                placeholder="Brief description of the issue"
                            />
                        </Form.Group>
                        <Form.Group className="mb-5">
                            <Form.Label className="form-label-gov">Detailed Description</Form.Label>
                            <Form.Control
                                as="textarea"
                                rows={6}
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                required
                                className="form-control-gov shadow-sm"
                                placeholder="Provide detailed information or context..."
                                style={{ resize: 'none' }}
                            />
                        </Form.Group>
                        <Button
                            type="submit"
                            disabled={submitting}
                            className="btn-ledger w-100 py-3 shadow-sm rounded-pill hover-translate transition-all d-flex justify-content-center align-items-center fs-5"
                        >
                            {submitting ? <Spinner size="sm" animation="border" className="me-2" /> : <i className="bi bi-send-fill me-2"></i>}
                            {submitting ? 'Transmitting...' : 'Submit Support Request'}
                        </Button>
                    </Form>
                </div>
            </Container>
        </div>
    );
};

export default SupportPage;
