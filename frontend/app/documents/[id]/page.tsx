'use client';

import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Card, Button, Badge, Form, ListGroup, Alert, Spinner, Modal } from 'react-bootstrap';
import { useParams, useRouter } from 'next/navigation';
import { apiClient, BASE_URL } from '@/lib/api-client';
import { useAuth } from '@/context/AuthContext';
import SignaturePad from '@/components/SignaturePad';

interface Document {
    id: string;
    title: string;
    file: string;
    status: string;
    can_approve?: boolean;
    current_step_role?: string;
    metadata?: {
        department: string;
        doc_type: string;
        priority: string;
        notes: string;
        destination?: string;
        start_date?: string;
        end_date?: string;
        purpose?: string;
        travel_roi_rating?: number;
        travel_outcome_report?: string;
    };
    approvals: Array<{
        user: string;
        user_email?: string;
        user_name?: string;
        action: string;
        comment: string;
        timestamp: string;
        signature_image?: string;
        digital_signature_hash?: string;
        verification_metadata?: {
            ip: string;
            user_agent: string;
            verified_at: string;
            protocol: string;
            acting_as_proxy?: boolean;
            delegated_by?: string;
            delegated_role?: string;
        };
    }>;
    created_by_email: string;
    created_at: string;
    updated_at: string;
}

const timeAgo = (dateStr: string) => {
    const now = new Date();
    const then = new Date(dateStr);
    const seconds = Math.floor((now.getTime() - then.getTime()) / 1000);

    if (seconds < 60) return 'Just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
};

const DocumentDetailsPage: React.FC = () => {
    const { id } = useParams();
    const router = useRouter();
    const { user } = useAuth();
    const [doc, setDoc] = useState<Document | null>(null);
    const [auditLogs, setAuditLogs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [comment, setComment] = useState('');
    const [roiRating, setRoiRating] = useState('');
    const [roiOutcome, setRoiOutcome] = useState('');
    const [submittingRoi, setSubmittingRoi] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [showSignatureModal, setShowSignatureModal] = useState(false);
    const [pendingAction, setPendingAction] = useState<string | null>(null);

    const getFileUrl = (path: string) => {
        if (!path) return '';
        if (path.startsWith('http')) return path;
        return `${BASE_URL}${path}`;
    };

    const fileUrl = doc ? getFileUrl(doc.file) : '';

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [docRes, logsRes] = await Promise.all([
                    apiClient.get(`/documents/${id}/`),
                    apiClient.get(`/audit/logs/?search=${id}`)
                ]);
                setDoc(docRes.data);
                setAuditLogs(logsRes.data);
            } catch (err: any) {
                setError('Document not found or access denied.');
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [id]);

    const handleAction = async (action: string, signatureData?: string) => {
        if (action === 'Approve' && !signatureData) {
            setPendingAction(action);
            setShowSignatureModal(true);
            return;
        }

        setSubmitting(true);
        setError('');
        try {
            await apiClient.post('/workflow/approvals/', {
                document: id,
                action,
                comment,
                signature_image: signatureData
            });
            setShowSignatureModal(false);
            // Refresh document data
            const response = await apiClient.get(`/documents/${id}/`);
            setDoc(response.data);
            setComment('');
        } catch (err: any) {
            setError(err.response?.data?.error || 'Failed to submit approval. please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    const handleRoiSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmittingRoi(true);
        setError('');
        try {
            await apiClient.post(`/documents/${id}/submit_roi_report/`, {
                travel_outcome_report: roiOutcome,
                travel_roi_rating: roiRating
            });
            const response = await apiClient.get(`/documents/${id}/`);
            setDoc(response.data);
        } catch (err: any) {
            setError(err.response?.data?.error || 'Failed to submit ROI debrief.');
        } finally {
            setSubmittingRoi(false);
        }
    };

    if (loading) return <div className="text-center py-5"><Spinner animation="border" /></div>;
    if (!doc) return <Container className="py-5"><Alert variant="danger">{error}</Alert></Container>;

    const canApprove = user && (user.role === 'Admin' || doc.can_approve);

    return (
        <div className="pb-5 mb-5 position-relative">
            {/* Top Header */}
            <div className="d-flex justify-content-between align-items-center mb-4 pb-3 border-bottom border-secondary border-opacity-10">
                <div className="d-flex align-items-center cursor-pointer text-muted hover-text-dark" onClick={() => router.push('/documents')}>
                    <i className="bi bi-arrow-left me-3 fs-5"></i>
                    <span className="fw-bold text-uppercase" style={{ letterSpacing: '1px', fontSize: '0.8rem' }}>DOCUMENT REF: #{doc.id.substring(0, 8).toUpperCase()}</span>
                </div>
                <div className="d-flex align-items-center gap-4 text-muted">
                    <i className="bi bi-search cursor-pointer"></i>
                    <div className="position-relative cursor-pointer">
                        <i className="bi bi-bell"></i>
                        <span className="position-absolute top-0 start-100 translate-middle p-1 bg-danger border border-light rounded-circle"></span>
                    </div>
                    <div className="rounded-circle overflow-hidden bg-secondary border border-2 border-white shadow-sm" style={{ width: '32px', height: '32px' }}>
                        <i className="bi bi-person-fill text-white d-flex justify-content-center align-items-center h-100"></i>
                    </div>
                </div>
            </div>

            {/* Title & Top Level Actions Section */}
            <div className="d-flex flex-column flex-md-row justify-content-between align-items-start mb-4 pb-2">
                <div className="pe-md-4">
                    <div className="d-flex align-items-center gap-3 mb-2">
                        <Badge bg={doc.status === 'Approved' ? 'success' : doc.status === 'Rejected' ? 'danger' : 'secondary'} className="px-3 py-2 text-uppercase rounded-1" style={{ letterSpacing: '0.5px' }}>
                            {doc.status === 'Under Review' && doc.current_step_role ? `PENDING ${doc.current_step_role.toUpperCase()}` : doc.status === 'Pending' ? 'PENDING REVIEW' : doc.status}
                        </Badge>
                        <span className="text-muted small">Updated {timeAgo(doc.updated_at)}</span>
                    </div>
                    <h1 className="fw-bolder text-ledger mb-3 lh-sm" style={{ fontSize: '2.2rem', maxWidth: '800px' }}>
                        {doc.title}
                    </h1>
                    <div className="d-flex align-items-center text-muted small fw-bold mt-2">
                        <div className="rounded-circle overflow-hidden bg-secondary me-2" style={{ width: '28px', height: '28px' }}>
                            <i className="bi bi-person-fill text-white d-flex justify-content-center align-items-center h-100"></i>
                        </div>
                        <span className="text-dark me-1">{doc.created_by_email.split('@')[0].replace('.', ' ').replace(/\b\w/g, l => l.toUpperCase())}</span>
                        <span className="me-3 opacity-75">&middot; Dept. of {doc.metadata?.department || 'Urban Planning'}</span>
                        <i className="bi bi-calendar3 me-2"></i>
                        <span className="opacity-75">{new Date(doc.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                    </div>
                </div>
                {(doc.status === 'Pending' || doc.status === 'Under Review') && canApprove && (
                    <div className="d-flex flex-column gap-2 mt-4 mt-md-0 d-none d-md-flex" style={{ minWidth: '200px' }}>
                        <Button variant="dark" className="btn-ledger fw-bold d-flex align-items-center justify-content-center py-2 shadow-sm" onClick={() => handleAction('Approve')}>
                            <i className="bi bi-check-circle-fill me-2 fs-5"></i> Approve Document
                        </Button>
                        <Button variant="white" className="fw-bold border py-2 bg-white shadow-sm text-dark hover-bg-light" onClick={() => handleAction('Reject')}>
                            Request Revision
                        </Button>
                    </div>
                )}
            </div>

            {/* Travel Specific Mission Card */}
            {doc.metadata?.doc_type === 'Travel Authorization' && doc.metadata.destination && (
                <Card className="border-0 shadow-sm rounded-4 mb-4 border-secondary border-opacity-10 bg-secondary bg-opacity-10 animate-fade-in overflow-hidden">
                    <Row className="g-0">
                        <Col md={3} className="bg-white d-flex align-items-center justify-content-center p-4 border-end border-secondary border-opacity-10">
                            <div className="text-center">
                                <i className="bi bi-airplane-fill fs-1 text-dark mb-2 d-block"></i>
                                <div className="text-uppercase fw-bold text-dark small" style={{ letterSpacing: '2px' }}>Diplomatic Mission</div>
                            </div>
                        </Col>
                        <Col md={9} className="p-4 p-xl-5 bg-white bg-opacity-75 backdrop-blur-md">
                            <Row className="g-4">
                                <Col md={6}>
                                    <div className="text-uppercase x-small fw-bold text-muted mb-1" style={{ letterSpacing: '1px' }}>Official Destination</div>
                                    <div className="fs-4 fw-bold text-ledger">{doc.metadata.destination}</div>
                                </Col>
                                <Col md={6}>
                                    <div className="text-uppercase x-small fw-bold text-muted mb-1" style={{ letterSpacing: '1px' }}>Period of Operation</div>
                                    <div className="fs-5 fw-bold text-ledger">
                                        {new Date(doc.metadata.start_date!).toLocaleDateString()} &mdash; {new Date(doc.metadata.end_date!).toLocaleDateString()}
                                    </div>
                                </Col>
                                <Col md={12}>
                                    <div className="text-uppercase x-small fw-bold text-muted mb-2" style={{ letterSpacing: '1px' }}>Institutional Mission Purpose</div>
                                    <div className="text-secondary fs-6 lh-base border-start border-secondary border-3 ps-3 py-1">
                                        {doc.metadata.purpose}
                                    </div>
                                </Col>
                            </Row>
                        </Col>
                    </Row>
                </Card>
            )}

            {/* Post-Travel ROI Submission Prompt */}
            {doc.metadata?.doc_type === 'Travel Authorization' && doc.status === 'Approved' && doc.metadata?.end_date && new Date(doc.metadata.end_date) < new Date() && user?.email === doc.created_by_email && !doc.metadata?.travel_roi_rating && (
                <Card className="border-0 shadow-sm rounded-4 mb-4 border-warning border-opacity-25 bg-warning bg-opacity-10">
                    <Card.Body className="p-4 p-xl-5">
                        <div className="d-flex align-items-center mb-4">
                            <i className="bi bi-shield-check fs-2 text-warning me-3"></i>
                            <div>
                                <h4 className="fw-bold text-dark mb-1">Mandatory Post-Travel Debrief</h4>
                                <div className="text-muted small">Your authorized deployment has officially concluded. Please submit the operational outcome report and evaluate the trip's direct benefit to the country.</div>
                            </div>
                        </div>
                        <Form onSubmit={handleRoiSubmit}>
                            <Row className="g-4">
                                <Col md={6}>
                                    <Form.Group>
                                        <Form.Label className="form-label-gov">Strategic Impact & Benefit Rating</Form.Label>
                                        <Form.Select required value={roiRating} onChange={(e) => setRoiRating(e.target.value)} className="form-control-gov border-warning border-opacity-25">
                                            <option value="">Evaluate Return on Investment...</option>
                                            <option value="Negligible Impact">Negligible Impact</option>
                                            <option value="Low Impact">Low Impact</option>
                                            <option value="Moderate Benefit">Moderate Benefit</option>
                                            <option value="High Strategic Impact">High Strategic Impact</option>
                                            <option value="Critical National Benefit">Critical National Benefit</option>
                                        </Form.Select>
                                    </Form.Group>
                                </Col>
                                <Col md={12}>
                                    <Form.Group>
                                        <Form.Label className="form-label-gov">Operational Outcome / Justification Report</Form.Label>
                                        <Form.Control as="textarea" rows={4} required value={roiOutcome} onChange={(e) => setRoiOutcome(e.target.value)} className="form-control-gov border-warning border-opacity-25" placeholder="Detail the results, engagements, and acquired intelligence from this mission..." />
                                    </Form.Group>
                                </Col>
                            </Row>
                            <div className="mt-4 text-end">
                                <Button variant="warning" type="submit" className="py-2 px-4 fw-bold shadow-sm" disabled={submittingRoi}>
                                    {submittingRoi ? <Spinner size="sm" /> : <span><i className="bi bi-send-fill me-2"></i> Submit Debrief</span>}
                                </Button>
                            </div>
                        </Form>
                    </Card.Body>
                </Card>
            )}

            {/* Existing Completed ROI Display */}
            {doc.metadata?.doc_type === 'Travel Authorization' && doc.metadata?.travel_roi_rating && (
                <Card className="border-0 shadow-sm rounded-4 mb-4 border-success border-opacity-25 bg-success bg-opacity-10 animate-fade-in">
                    <Card.Body className="p-4 p-xl-5">
                        <div className="d-flex align-items-center mb-4">
                            <i className="bi bi-bookmark-star-fill fs-2 text-success me-3"></i>
                            <div>
                                <h5 className="fw-bold text-dark mb-0">Post-Travel Debrief Finalized</h5>
                                <div className="text-muted small">Evaluating Official: {doc.created_by_email}</div>
                            </div>
                        </div>
                        <Row className="g-4">
                            <Col md={4}>
                                <div className="text-uppercase x-small fw-bold text-muted mb-1" style={{ letterSpacing: '1px' }}>Benefit Rating</div>
                                <div className="fs-5 fw-bold text-success">{doc.metadata.travel_roi_rating}</div>
                            </Col>
                            <Col md={8}>
                                <div className="text-uppercase x-small fw-bold text-muted mb-1" style={{ letterSpacing: '1px' }}>Operational Outcome</div>
                                <div className="text-dark small lh-base border-start border-success border-2 ps-3 py-2 bg-white bg-opacity-50 ms-1 rounded-end mt-1">
                                    {doc.metadata.travel_outcome_report}
                                </div>
                            </Col>
                        </Row>
                    </Card.Body>
                </Card>
            )}

            <Row className="g-4 mb-5">
                {/* Left Column: Preview & Discussion */}
                <Col lg={7} xl={8}>
                    {/* Document Preview Pane */}
                    <div className="bg-light rounded-4 overflow-hidden d-flex flex-column mb-4" style={{ height: '700px', border: '1px solid #e2e8f0' }}>
                        <div className="d-flex justify-content-between align-items-center px-4 py-3 border-bottom border-secondary border-opacity-10">
                            <div className="fw-bold text-dark small d-flex align-items-center text-uppercase" style={{ letterSpacing: '1px' }}>
                                <i className="bi bi-file-earmark-pdf-fill me-2 fs-5 text-muted"></i> DOCUMENT PREVIEW (1 PAGES)
                            </div>
                            <div className="d-flex gap-4 text-muted fs-6">
                                <i className="bi bi-zoom-in cursor-pointer hover-text-dark"></i>
                                <i className="bi bi-download cursor-pointer hover-text-dark" onClick={() => window.open(fileUrl, '_blank')}></i>
                                <i className="bi bi-arrows-fullscreen cursor-pointer hover-text-dark"></i>
                            </div>
                        </div>

                        {/* Document Canvas (Dynamic Preview) */}
                        <div className="flex-grow-1 p-0 d-flex justify-content-center overflow-hidden" style={{ backgroundColor: '#f1f5f9' }}>
                            {fileUrl ? (
                                <div className="w-100 h-100 d-flex justify-content-center align-items-center">
                                    {fileUrl.toLowerCase().endsWith('.pdf') ? (
                                        <iframe
                                            src={`${fileUrl}#toolbar=0`}
                                            width="100%"
                                            height="100%"
                                            style={{ border: 'none' }}
                                            title="Document Preview"
                                        />
                                    ) : (fileUrl.match(/\.(png|jpe?g|gif|webp)$/i)) ? (
                                        <div className="p-4 p-md-5 w-100 h-100 overflow-auto d-flex justify-content-center align-items-start">
                                            <img
                                                src={fileUrl}
                                                alt={doc?.title}
                                                className="shadow-lg bg-white"
                                                style={{ maxWidth: '100%', height: 'auto', minHeight: '800px', objectFit: 'contain' }}
                                            />
                                        </div>
                                    ) : (
                                        <div className="text-center p-5">
                                            <div className="bg-white p-5 rounded-4 shadow-sm border text-center" style={{ maxWidth: '400px' }}>
                                                <i className="bi bi-file-earmark-arrow-down fs-1 text-dark mb-3 d-block"></i>
                                                <h5 className="fw-bold text-dark mb-2">Preview Unavailable</h5>
                                                <p className="text-muted small mb-4">This file type ({fileUrl.split('.').pop()?.toUpperCase()}) cannot be previewed in the browser.</p>
                                                <Button variant="dark" className="btn-ledger px-4 py-2" onClick={() => window.open(fileUrl, '_blank')}>
                                                    Download to View
                                                </Button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="m-auto text-center opacity-50">
                                    <i className="bi bi-file-earmark-break fs-1 d-block mb-3"></i>
                                    <div className="fw-bold text-uppercase small">Document source unavailable</div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Official Discussion Thread */}
                    <div className="bg-white rounded-4 p-4 p-xl-5 shadow-sm border border-light">
                        <h4 className="fw-bold text-ledger mb-4 d-flex align-items-center">
                            <i className="bi bi-chat-square-text-fill me-3 fs-3 text-muted"></i> Official Discussion
                        </h4>

                        <div className="d-flex flex-column gap-4 mb-5">
                            {doc.approvals.map((app, idx) => (
                                <div key={idx} className="d-flex gap-3">
                                    <div className="rounded-circle bg-secondary text-white fw-bold d-flex justify-content-center align-items-center flex-shrink-0 mt-1" style={{ width: '40px', height: '40px', fontSize: '1.2rem' }}>
                                        {app.user.charAt(0).toUpperCase()}
                                    </div>
                                    <div className="flex-grow-1">
                                        <div className="d-flex justify-content-between align-items-baseline w-100 mb-2">
                                            <div className="d-flex align-items-center gap-2">
                                                <span className="fw-bold text-dark">{(app.user_name || app.user_email || app.user).split('@')[0].replace('.', ' ').replace(/\b\w/g, l => l.toUpperCase())}</span>
                                                <Badge bg="light" text="dark" className="border fw-normal px-2 py-1">{app.action}</Badge>
                                                {app.verification_metadata && app.verification_metadata.acting_as_proxy && (
                                                    <Badge bg="warning" text="dark" className="px-2 py-1 ms-1 d-flex align-items-center gap-1">
                                                        <i className="bi bi-person-fill-gear"></i> PROXY ACTING FOR {app.verification_metadata.delegated_role?.toUpperCase()}
                                                    </Badge>
                                                )}
                                            </div>
                                            <span className="text-muted small" style={{ fontSize: '0.75rem' }}>
                                                {new Date(app.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}, {new Date(app.timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        </div>
                                        <div className="text-secondary lh-base" style={{ fontSize: '0.95rem' }}>
                                            {app.comment || `Action logged: ${app.action} applied to document.`}
                                        </div>

                                        {app.signature_image && (
                                            <div className="mt-3 p-3 bg-light rounded-3 border border-secondary border-opacity-10 d-inline-block">
                                                <div className="text-uppercase x-small fw-bold text-muted mb-2" style={{ letterSpacing: '1px' }}>Official Digital Signature</div>
                                                <img src={app.signature_image} alt="Signature" style={{ maxHeight: '60px', filter: 'contrast(1.2)' }} />
                                                <div className="mt-2 border-top pt-2">
                                                    <div className="x-small text-muted font-monospace text-truncate" style={{ maxWidth: '300px' }}>
                                                        HASH: {app.digital_signature_hash}
                                                    </div>
                                                    <div className="x-small text-ledger fw-bold mt-1">
                                                        <i className="bi bi-shield-check me-1"></i>
                                                        BYZANTINE PROTOCOL VERIFIED &middot; {app.verification_metadata?.protocol}
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                            {doc.approvals.length === 0 && (
                                <p className="text-muted fst-italic fs-6">No previous discussion exists for this record.</p>
                            )}
                        </div>

                        {/* Comment Input Box */}
                        <div className="d-flex gap-3 bg-light p-3 rounded-4 border border-light">
                            <div className="rounded-circle bg-dark text-white fw-bold d-flex justify-content-center align-items-center flex-shrink-0" style={{ width: '40px', height: '40px' }}>
                                {user?.email.charAt(0).toUpperCase() || 'U'}
                            </div>
                            <div className="flex-grow-1 d-flex flex-column position-relative">
                                <textarea
                                    className="form-control bg-transparent border-0 px-0 shadow-none text-dark"
                                    rows={2}
                                    placeholder="Add a comment or annotation..."
                                    style={{ resize: 'none' }}
                                    value={comment}
                                    onChange={(e) => setComment(e.target.value)}
                                ></textarea>
                                <div className="d-flex justify-content-between align-items-center mt-2 border-top border-secondary border-opacity-10 pt-3">
                                    <i className="bi bi-paperclip text-muted fs-5 cursor-pointer hover-text-dark"></i>
                                    <Button variant="dark" className="btn-ledger fw-bold px-4" size="sm" onClick={() => handleAction('Comment')} disabled={submitting || !comment}>
                                        POST COMMENT
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                </Col>

                {/* Right Column: Information Timeline */}
                <Col lg={5} xl={4}>
                    <div className="d-flex flex-column gap-4">

                        {/* Chain of Custody Card */}
                        <Card className="border-0 shadow-sm p-4 p-xl-5 rounded-4 border border-light">
                            <h6 className="fw-bolder text-uppercase tracking-wider text-dark mb-4" style={{ letterSpacing: '2px', fontSize: '0.75rem' }}>Chain of Custody</h6>
                            <div className="timeline position-relative ps-4 ps-md-4 pt-1 pb-2" style={{ borderLeft: '2px solid #e2e8f0' }}>

                                {/* Step 1: Staff Submitted */}
                                <div className="position-relative mb-4 pb-2">
                                    <div className="position-absolute bg-white rounded-circle d-flex" style={{ left: '-33px', top: '0px', padding: '4px' }}>
                                        <i className="bi bi-check-circle-fill text-success fs-5 bg-white"></i>
                                    </div>
                                    <div className="ps-2 ps-md-3">
                                        <div className="fw-bold text-dark fs-6 lh-sm mb-1">Staff Submitted</div>
                                        <div className="text-muted small lh-1 mb-2">
                                            {doc.created_by_email.split('@')[0]} &middot; {new Date(doc.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                        </div>
                                        <div className="d-inline-flex bg-success bg-opacity-10 text-success fw-bold px-2 py-1 rounded-1" style={{ fontSize: '0.6rem', letterSpacing: '1px' }}>VERIFIED</div>
                                    </div>
                                </div>

                                {/* Step 2/3 Based on Approvals */}
                                {doc.approvals.map((app, idx) => (
                                    <div key={idx} className="position-relative mb-4 pb-2">
                                        <div className="position-absolute bg-white rounded-circle d-flex" style={{ left: '-33px', top: '0px', padding: '4px' }}>
                                            <i className={`bi bi-${app.action === 'Approve' ? 'check-circle-fill text-success' : 'x-circle-fill text-danger'} fs-5 bg-white`}></i>
                                        </div>
                                        <div className="ps-2 ps-md-3">
                                            <div className="fw-bold text-dark fs-6 lh-sm mb-1">{(app.user_name || app.user_email || app.user).split('@')[0]} Reviewed</div>
                                            <div className="text-muted small lh-1 mb-2">
                                                {new Date(app.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}, {new Date(app.timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                                            </div>
                                            <div className={`d-inline-flex ${app.action === 'Approve' ? 'bg-success bg-opacity-10 text-success' : 'bg-danger bg-opacity-10 text-danger'} fw-bold px-2 py-1 rounded-1`} style={{ fontSize: '0.6rem', letterSpacing: '1px' }}>
                                                {app.action.toUpperCase()}
                                            </div>
                                        </div>
                                    </div>
                                ))}

                                {/* Step: Current Pending */}
                                {doc.status === 'Pending' && (
                                    <div className="position-relative mb-4 pb-2">
                                        <div className="position-absolute bg-white rounded-circle d-flex border border-2 border-dark" style={{ left: '-33px', top: '0px', width: '24px', height: '24px', }}>
                                            <div className="bg-dark rounded-circle m-auto" style={{ width: '10px', height: '10px' }}></div>
                                        </div>
                                        <div className="ps-2 ps-md-3">
                                            <div className="fw-bold text-dark fs-6 lh-sm mb-1">Minister Review</div>
                                            <div className="text-muted small fst-italic lh-1 mb-2">In Progress...</div>
                                            <div className="d-flex align-items-center mt-3 p-2 bg-light rounded-2 border">
                                                <div className="rounded-circle bg-secondary me-2 overflow-hidden" style={{ width: '20px', height: '20px' }}>
                                                    <i className="bi bi-person-fill text-white d-flex justify-content-center h-100"></i>
                                                </div>
                                                <span className="small text-muted" style={{ fontSize: '0.75rem' }}>Assigned to: Exec Reviewers</span>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Step: Finalization Schedule */}
                                <div className="position-relative">
                                    <div className="position-absolute bg-white rounded-circle d-flex border border-2 border-secondary border-opacity-25" style={{ left: '-33px', top: '0px', width: '24px', height: '24px', }}>
                                        <div className={doc.status === 'Approved' ? "bg-success rounded-circle m-auto" : "bg-secondary bg-opacity-25 rounded-circle m-auto"} style={{ width: '10px', height: '10px' }}></div>
                                    </div>
                                    <div className={doc.status === 'Approved' ? "ps-2 ps-md-3" : "ps-2 ps-md-3 opacity-50"}>
                                        <div className="fw-bold text-dark fs-6 lh-sm mb-1">
                                            {doc.status === 'Approved' ? 'Official Seal & Ledger Entry' : 'Manual Ledger Finalization'}
                                        </div>
                                        <div className="text-muted small lh-1">
                                            {doc.status === 'Approved' ? `Applied on ${new Date(doc.updated_at).toLocaleDateString()}` : 'Scheduled Step'}
                                        </div>
                                        {doc.status === 'Approved' && (
                                            <div className="mt-2 p-2 bg-success bg-opacity-10 border border-success border-opacity-20 rounded-2 text-success fw-bold" style={{ fontSize: '0.6rem', letterSpacing: '1px' }}>
                                                <i className="bi bi-shield-lock-fill me-1"></i> LOGGED TO BLOCKCHAIN LEDGER
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </Card>

                        {/* Security Level Card */}
                        <Card className="border-0 shadow-sm p-4 rounded-4 border border-light">
                            <h6 className="fw-bolder text-uppercase tracking-wider text-muted mb-3" style={{ letterSpacing: '2px', fontSize: '0.65rem' }}>Security Level</h6>
                            <div className="d-flex align-items-center bg-light p-3 rounded-3 fw-bold text-dark">
                                <i className="bi bi-shield-fill-check fs-4 me-3 text-ledger"></i> Tier 2 Confidential
                            </div>
                        </Card>

                        {/* Linked Entities */}
                        <Card className="border-0 shadow-sm p-4 rounded-4 border border-light">
                            <h6 className="fw-bolder text-uppercase tracking-wider text-muted mb-3" style={{ letterSpacing: '2px', fontSize: '0.65rem' }}>Linked Entities</h6>
                            <div className="d-flex flex-wrap gap-2">
                                <Badge bg="light" text="dark" className="border fw-normal px-3 py-2 text-dark">Dept: {doc.metadata?.department}</Badge>
                                <Badge bg="light" text="dark" className="border fw-normal px-3 py-2 text-dark">Type: {doc.metadata?.doc_type}</Badge>
                                <Badge bg="light" text="dark" className="border fw-normal px-3 py-2 text-dark">Priority: {doc.metadata?.priority}</Badge>
                            </div>
                        </Card>

                        {/* Access Logs */}
                        <Card className="border-0 shadow-sm p-4 rounded-4 border border-light bg-light" style={{ backgroundColor: '#f8fafc' }}>
                            <h6 className="fw-bolder text-uppercase tracking-wider text-muted mb-4" style={{ letterSpacing: '2px', fontSize: '0.65rem' }}>Access Logs</h6>
                            {auditLogs.slice(0, 3).map((log, idx) => {
                                const actionParts = log.action.split(' - ');
                                const shortAction = actionParts.length > 1 ? actionParts[1] : log.action;
                                return (
                                    <div key={idx} className="d-flex justify-content-between text-muted small mb-3 border-bottom pb-2 border-secondary border-opacity-10">
                                        <div className="d-flex flex-column" style={{ maxWidth: '180px' }}>
                                            <span className="text-truncate fw-bold text-dark" style={{ fontSize: '0.7rem' }}>{log.user_email ? log.user_email.split('@')[0] : 'System'}</span>
                                            <span className="text-truncate opacity-75">{shortAction}</span>
                                        </div>
                                        <span>{new Date(log.timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</span>
                                    </div>
                                );
                            })}
                            {auditLogs.length === 0 && (
                                <div className="text-muted small mb-3 italic">No recent access events recorded.</div>
                            )}
                            <div className="fw-bold text-dark text-uppercase small cursor-pointer hover-text-ledger mt-2" style={{ letterSpacing: '0.5px', fontSize: '0.7rem' }} onClick={() => router.push('/reports')}>
                                VIEW FULL AUDIT TRAIL
                            </div>
                        </Card>
                    </div>
                </Col>
            </Row>

            {/* Sticky Bottom Bar */}
            <div className="position-fixed bottom-0 end-0 bg-white shadow-lg border-top p-3 d-flex flex-column flex-md-row justify-content-between align-items-center z-3 sticky-action-bar">
                <div className="d-flex gap-4 ms-md-4 mb-3 mb-md-0 w-100 justify-content-center justify-content-md-start flex-wrap">
                    <div className="d-flex align-items-center text-dark fw-bold cursor-pointer hover-text-ledger small" onClick={() => window.print()}>
                        <i className="bi bi-printer me-2 fs-5 text-muted"></i> <span className="d-none d-sm-inline">Print Ledger Record</span><span className="d-inline d-sm-none">Print</span>
                    </div>
                    <div className="d-flex align-items-center text-dark fw-bold cursor-pointer hover-text-ledger small" onClick={() => alert('Review invitation system is pending Minister approval for rollout.')}>
                        <i className="bi bi-share me-2 fs-5 text-muted"></i> <span className="d-none d-sm-inline">Invite Reviewer</span><span className="d-inline d-sm-none">Invite</span>
                    </div>
                    <div className="d-flex align-items-center text-muted fw-bold small ms-md-4">
                        <i className="bi bi-cloud-check me-2 fs-5"></i> <span className="d-none d-sm-inline">Auto-saved to Ledger at {new Date(doc.updated_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</span><span className="d-inline d-sm-none">Saved</span>
                    </div>
                </div>

                <div className="d-flex gap-3 me-md-4 w-100 justify-content-center justify-content-md-end">
                    <Button variant="light" className="fw-bold border py-2 px-4 shadow-sm text-dark bg-secondary bg-opacity-10 border-0" onClick={() => router.push('/documents')}>
                        Close
                    </Button>
                    {(doc.status === 'Pending' || doc.status === 'Under Review') && canApprove && (
                        <Button variant="dark" className="btn-ledger fw-bold px-5 shadow-sm py-2" onClick={() => handleAction('Approve')}>
                            Execute Approval
                        </Button>
                    )}
                </div>
            </div>

            {/* Signature Modal */}
            <Modal show={showSignatureModal} onHide={() => setShowSignatureModal(false)} centered size="lg" className="gov-modal">
                <Modal.Header closeButton className="border-0 pb-0">
                    <Modal.Title className="fw-bold text-ledger">Executive Authentication Required</Modal.Title>
                </Modal.Header>
                <Modal.Body className="p-4 pt-2">
                    <p className="text-muted mb-4 fs-6">
                        By providing your digital signature, you are officially authorizing <strong>{doc.title}</strong> and committing this action to the Ministry's permanent ledger.
                    </p>
                    <SignaturePad onSave={(data) => handleAction('Approve', data)} />
                    <div className="mt-3 text-center">
                        <p className="text-muted x-small">
                            Identity Verification: {user?.email} &middot; {new Date().toLocaleDateString()}
                        </p>
                    </div>
                </Modal.Body>
            </Modal>
        </div>
    );
};

export default DocumentDetailsPage;
