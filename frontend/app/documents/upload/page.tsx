'use client';

import React, { useState, useRef } from 'react';
import { Container, Row, Col, Form, Button, Card, Badge, Spinner } from 'react-bootstrap';
import { useNotification } from '@/context/NotificationContext';
import { apiClient } from '@/lib/api-client';
import { useRouter, useSearchParams } from 'next/navigation';

const DocumentUploadPage: React.FC = () => {
    const { showNotification } = useNotification();
    const router = useRouter();
    const searchParams = useSearchParams();
    const isTravelRequest = searchParams.get('type') === 'travel';

    // Form States
    const [title, setTitle] = useState('');
    const [department, setDepartment] = useState('');
    const [docType, setDocType] = useState('');
    const [priority, setPriority] = useState('Medium');
    const [notes, setNotes] = useState('');
    const [destination, setDestination] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [purpose, setPurpose] = useState('');
    const [file, setFile] = useState<File | null>(null);
    const [roles, setRoles] = useState<Array<{ id: number; name: string }>>([]);
    const [targetRole, setTargetRole] = useState<string>('');
    const [loading, setLoading] = useState(false);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    React.useEffect(() => {
        if (isTravelRequest) {
            setDocType('Travel Authorization');
        }
    }, [isTravelRequest]);

    React.useEffect(() => {
        const fetchRoles = async () => {
            try {
                const res = await apiClient.get('/auth/admin/roles/');
                const workflowRoles = res.data.filter((r: any) => ['Director', 'Deputy Minister', 'Minister'].includes(r.name));
                setRoles(workflowRoles);
            } catch (err) {
                console.error('Failed to fetch roles', err);
                showNotification('Registry Fetch Error', 'The system was unable to retrieve official workflow roles from the registry.', 'error');
            }
        };
        fetchRoles();
    }, [showNotification]);

    React.useEffect(() => {
        if (!file) {
            setPreviewUrl(null);
            return;
        }
        const url = URL.createObjectURL(file);
        setPreviewUrl(url);
        return () => URL.revokeObjectURL(url);
    }, [file]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
        }
    };

    const onDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const onDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const onDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            setFile(e.dataTransfer.files[0]);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!file) {
            showNotification('Selection Required', 'No file has been staged for upload. Please select a valid document to proceed.', 'warning');
            return;
        }

        setLoading(true);

        const formData = new FormData();
        formData.append('title', title);
        formData.append('file', file);
        formData.append('metadata.department', department);
        formData.append('metadata.doc_type', docType);
        formData.append('metadata.priority', priority);
        formData.append('metadata.notes', notes);
        if (docType === 'Travel Authorization') {
            formData.append('metadata.destination', destination);
            formData.append('metadata.start_date', startDate);
            formData.append('metadata.end_date', endDate);
            formData.append('metadata.purpose', purpose);
        }
        if (targetRole) {
            formData.append('target_role', targetRole);
        }

        try {
            await apiClient.post('/documents/', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            showNotification('Submission Confirmed', 'The official document has been successfully committed to the ledger.', 'success');
            setTimeout(() => router.push('/documents'), 2000);
        } catch (err: any) {
            showNotification('Submission Failed', err.response?.data?.error || 'The system encountered an error while processing the submission.', 'error');
        } finally {
            setLoading(false);
        }
    };

    const getFileIcon = () => {
        if (!file) return 'bi-file-earmark';
        const name = file.name.toLowerCase();
        if (name.endsWith('.pdf')) return 'bi-file-earmark-pdf text-danger';
        if (name.endsWith('.docx') || name.endsWith('.doc')) return 'bi-file-earmark-word text-primary';
        if (name.endsWith('.xlsx') || name.endsWith('.xls')) return 'bi-file-earmark-excel text-success';
        if (file.type.startsWith('image/')) return 'bi-file-earmark-image text-info';
        return 'bi-file-earmark-text text-dark';
    };

    const isPreviewable = () => {
        if (!file) return false;
        return file.type === 'application/pdf' || file.type.startsWith('image/');
    };

    return (
        <Container fluid className="px-4 py-3 h-full pb-5">
            {/* Breadcrumbs & Header */}
            <div className="mb-5 mt-2 fade-in-up">
                <div className="d-flex align-items-center gap-2 mb-3 breadcrumb-gov">
                    <span className="opacity-50">Ledger</span>
                    <i className="bi bi-chevron-right small opacity-25"></i>
                    <span className="opacity-50">Submissions</span>
                    <i className="bi bi-chevron-right small opacity-25"></i>
                    <span className="active">Upload</span>
                </div>
                <h1 className="fw-bold text-ledger mb-1" style={{ fontSize: '2.4rem' }}>
                    {isTravelRequest ? 'Official Travel Request' : 'Submit Official Document'}
                </h1>
                <p className="text-muted fs-5 opacity-75">
                    {isTravelRequest
                        ? 'Submit departmental mission parameters for administrative approval and ledger tracking.'
                        : 'Securely upload and categorize documentation for inter-departmental review.'}
                </p>
            </div>

            <Row className="g-5">
                <Col lg={8}>
                    <Card className="border-0 shadow-sm rounded-4 p-4 p-xl-5 bg-white fade-in-up" style={{ animationDelay: '0.1s' }}>
                        <Form onSubmit={handleSubmit}>
                            {/* Premium Upload Zone */}
                            <div
                                className={`upload-zone mb-5 p-5 text-center rounded-4 border-2 border-dashed transition-all hover-translate cursor-pointer ${isDragging ? 'bg-primary bg-opacity-10 border-primary' : 'bg-light border-secondary border-opacity-25'}`}
                                onDragOver={onDragOver}
                                onDragLeave={onDragLeave}
                                onDrop={onDrop}
                                onClick={() => fileInputRef.current?.click()}
                                style={{ minHeight: '250px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}
                            >
                                <input
                                    type="file"
                                    hidden
                                    ref={fileInputRef}
                                    onChange={handleFileChange}
                                    accept=".pdf,.docx,.xlsx"
                                />
                                <div className="bg-white p-3 rounded-circle d-inline-flex justify-content-center align-items-center mb-3 shadow-sm border" style={{ width: '80px', height: '80px' }}>
                                    <i className={`${getFileIcon()} m-0`} style={{ fontSize: '2.5rem' }}></i>
                                </div>
                                <h4 className="fw-bold mb-2 text-dark">
                                    {file ? file.name : 'Drag & Drop Document Here'}
                                </h4>
                                <p className="text-muted small mb-4 px-5">
                                    Supported formats: PDF, DOCX, XLSX (Max 50MB).<br />Ensure all embedded digital seals are intact prior to submission.
                                </p>
                                <Button variant="dark" className="btn-ledger px-4 py-2 rounded-pill fw-bold shadow-sm d-inline-flex align-items-center justify-content-center gap-2">
                                    <i className="bi bi-folder2-open m-0 d-flex align-items-center"></i> Browse Files
                                </Button>
                            </div>

                            {/* Form Fields */}
                            <Row className="g-4 mb-4">
                                <Col md={12}>
                                    <Form.Label className="form-label-gov text-uppercase small fw-bold">Document Title</Form.Label>
                                    <Form.Control
                                        type="text"
                                        className="form-control-gov py-3 fs-5 bg-light"
                                        placeholder="e.g. Q4 Budgetary Allocations - Infrastructure"
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                        required
                                    />
                                </Col>
                                <Col md={6}>
                                    <Form.Label className="form-label-gov text-uppercase small fw-bold">Target Department</Form.Label>
                                    <Form.Select
                                        className="form-control-gov form-select py-3 bg-light"
                                        value={department}
                                        onChange={(e) => setDepartment(e.target.value)}
                                        required
                                    >
                                        <option value="">Select Department...</option>
                                        <option>Ministry of Finance</option>
                                        <option>Public Works</option>
                                        <option>Health & Human Services</option>
                                        <option>Education Board</option>
                                    </Form.Select>
                                </Col>
                                <Col md={6}>
                                    <Form.Label className="form-label-gov text-uppercase small fw-bold">Document Type</Form.Label>
                                    <Form.Select
                                        className="form-control-gov form-select py-3 bg-light"
                                        value={docType}
                                        onChange={(e) => setDocType(e.target.value)}
                                        required
                                    >
                                        <option value="">Select Type...</option>
                                        <option>Travel Authorization</option>
                                        <option>Budget Report</option>
                                        <option>Policy Draft</option>
                                        <option>Formal Memo</option>
                                        <option>Legal Contract</option>
                                    </Form.Select>
                                </Col>
                            </Row>

                            {/* Official Mission Coordination Block */}
                            {(docType === 'Travel Authorization' || isTravelRequest) && (
                                <div className="mb-5 p-4 p-xl-5 border-0 rounded-4 bg-dark text-white shadow-sm position-relative overflow-hidden fade-in-up" style={{ animationDelay: '0.2s' }}>
                                    {/* Decorative Background Icon */}
                                    <i className="bi bi-globe position-absolute" style={{ fontSize: '15rem', right: '-30px', top: '-40px', opacity: 0.05, zIndex: 0 }}></i>
                                    
                                    <div className="position-relative z-1">
                                        <h4 className="fw-bolder mb-4 d-flex align-items-center text-white" style={{ letterSpacing: '0.5px' }}>
                                            <div className="bg-white bg-opacity-10 rounded-circle p-2 me-3 d-flex align-items-center justify-content-center border border-white border-opacity-25" style={{ width: '48px', height: '48px' }}>
                                                <i className="bi bi-airplane-engines-fill fs-4 m-0 text-white"></i>
                                            </div>
                                            Mission Coordination Parameters
                                        </h4>
                                        <p className="small mb-4 opacity-75 fw-light" style={{ maxWidth: '90%' }}>
                                            Provide authoritative mission coordinates. The system will cross-reference this against the historical ledger to prevent logistical session conflicts.
                                        </p>
                                        <Row className="g-4">
                                            <Col md={12}>
                                                <Form.Label className="form-label-gov text-white opacity-75 text-uppercase small fw-bold">Official Destination</Form.Label>
                                                <Form.Control
                                                    type="text"
                                                    className="form-control-gov fs-5 py-3 bg-white bg-opacity-10 border-0 text-white shadow-none"
                                                    placeholder="City, Country or Specific Installation"
                                                    value={destination}
                                                    onChange={(e) => setDestination(e.target.value)}
                                                    required={docType === 'Travel Authorization'}
                                                    style={{ color: '#fff' }}
                                                />
                                            </Col>
                                            <Col md={6}>
                                                <Form.Label className="form-label-gov text-white opacity-75 text-uppercase small fw-bold">Departure Date</Form.Label>
                                                <Form.Control
                                                    type="date"
                                                    className="form-control-gov py-3 bg-white bg-opacity-10 border-0 text-white shadow-none"
                                                    value={startDate}
                                                    onChange={(e) => setStartDate(e.target.value)}
                                                    required={docType === 'Travel Authorization'}
                                                    style={{ colorScheme: 'dark' }}
                                                />
                                            </Col>
                                            <Col md={6}>
                                                <Form.Label className="form-label-gov text-white opacity-75 text-uppercase small fw-bold">Return Date</Form.Label>
                                                <Form.Control
                                                    type="date"
                                                    className="form-control-gov py-3 bg-white bg-opacity-10 border-0 text-white shadow-none"
                                                    value={endDate}
                                                    onChange={(e) => setEndDate(e.target.value)}
                                                    required={docType === 'Travel Authorization'}
                                                    style={{ colorScheme: 'dark' }}
                                                />
                                            </Col>
                                            <Col md={12}>
                                                <Form.Label className="form-label-gov text-white opacity-75 text-uppercase small fw-bold">Mission Objective & Institutional Purpose</Form.Label>
                                                <Form.Control
                                                    as="textarea"
                                                    rows={3}
                                                    className="form-control-gov py-3 bg-white bg-opacity-10 border-0 text-white shadow-none"
                                                    placeholder="Provide a detailed justification for this diplomatic or administrative mission..."
                                                    value={purpose}
                                                    onChange={(e) => setPurpose(e.target.value)}
                                                    required={docType === 'Travel Authorization'}
                                                />
                                            </Col>
                                        </Row>
                                    </div>
                                </div>
                            )}

                            <div className="mb-5 fade-in-up" style={{ animationDelay: '0.3s' }}>
                                <Form.Label className="form-label-gov text-uppercase small fw-bold">
                                    <i className="bi bi-send-check me-2 text-dark"></i>
                                    Direct Dispatch to Role (Optional)
                                </Form.Label>
                                <Form.Select
                                    className="form-control-gov form-select py-3 bg-light border-secondary border-opacity-25"
                                    value={targetRole}
                                    onChange={(e) => setTargetRole(e.target.value)}
                                >
                                    <option value="">Standard Workflow Sequence (Director Start)</option>
                                    {roles.map(role => (
                                        <option key={role.id} value={role.id}>Direct to {role.name}</option>
                                    ))}
                                </Form.Select>
                                <Form.Text className="text-muted small fw-bold opacity-50">
                                    Skips intermediate steps and sends notice directly to the selected official.
                                </Form.Text>
                            </div>

                            {/* Priority Level */}
                            <div className="mb-5 fade-in-up" style={{ animationDelay: '0.4s' }}>
                                <Form.Label className="form-label-gov text-uppercase small fw-bold mb-3">Priority Classification</Form.Label>
                                <Row className="g-3">
                                    <Col md={4}>
                                        <div
                                            className={`p-3 rounded-4 border transition-all cursor-pointer d-flex flex-column align-items-center justify-content-center text-center ${priority === 'Low' ? 'bg-success bg-opacity-10 border-success border-opacity-50 shadow-sm hover-translate' : 'bg-light border-secondary border-opacity-10 hover-bg-white'}`}
                                            onClick={() => setPriority('Low')}
                                            style={{ minHeight: '100px' }}
                                        >
                                            <i className={`bi bi-check-circle-fill mb-2 fs-4 ${priority === 'Low' ? 'text-success' : 'text-muted opacity-25'}`}></i>
                                            <span className={`fw-bold ${priority === 'Low' ? 'text-success' : 'text-muted'}`}>Low Priority</span>
                                        </div>
                                    </Col>
                                    <Col md={4}>
                                        <div
                                            className={`p-3 rounded-4 border transition-all cursor-pointer d-flex flex-column align-items-center justify-content-center text-center ${priority === 'Medium' ? 'bg-warning bg-opacity-10 border-warning border-opacity-50 shadow-sm hover-translate' : 'bg-light border-secondary border-opacity-10 hover-bg-white'}`}
                                            onClick={() => setPriority('Medium')}
                                            style={{ minHeight: '100px' }}
                                        >
                                            <i className={`bi bi-dash-circle-fill mb-2 fs-4 ${priority === 'Medium' ? 'text-warning' : 'text-muted opacity-25'}`} style={{ color: priority === 'Medium' ? '#d97706' : '' }}></i>
                                            <span className={`fw-bold ${priority === 'Medium' ? 'text-dark' : 'text-muted'}`}>Standard</span>
                                        </div>
                                    </Col>
                                    <Col md={4}>
                                        <div
                                            className={`p-3 rounded-4 border transition-all cursor-pointer d-flex flex-column align-items-center justify-content-center text-center ${priority === 'Urgent' ? 'bg-danger bg-opacity-10 border-danger border-opacity-50 shadow-sm hover-translate' : 'bg-light border-secondary border-opacity-10 hover-bg-white'}`}
                                            onClick={() => setPriority('Urgent')}
                                            style={{ minHeight: '100px' }}
                                        >
                                            <i className={`bi bi-exclamation-triangle-fill mb-2 fs-4 ${priority === 'Urgent' ? 'text-danger' : 'text-muted opacity-25'}`}></i>
                                            <span className={`fw-bold ${priority === 'Urgent' ? 'text-danger' : 'text-muted'}`}>Urgent Action</span>
                                        </div>
                                    </Col>
                                </Row>
                            </div>

                            {/* Notes */}
                            <div className="mb-4 fade-in-up" style={{ animationDelay: '0.5s' }}>
                                <Form.Label className="form-label-gov text-uppercase small fw-bold">Submission Notes</Form.Label>
                                <Form.Control
                                    as="textarea"
                                    rows={4}
                                    className="form-control-gov py-3 bg-light"
                                    placeholder="Enter context or specific instructions for the approval board..."
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                />
                            </div>
                        </Form>
                    </Card>
                </Col>

                {/* Sidebar Panel */}
                <Col lg={4}>
                    <div className="sticky-top" style={{ top: '24px' }}>
                        {/* Live Preview Pane */}
                        <Card className="border-0 shadow-sm rounded-4 overflow-hidden mb-4 bg-white fade-in-up" style={{ animationDelay: '0.6s' }}>
                            <div className="p-3 bg-light border-bottom border-secondary border-opacity-10 d-flex justify-content-between align-items-center">
                                <span className="text-uppercase small fw-bold text-muted" style={{ letterSpacing: '1px' }}>
                                    <i className="bi bi-eye me-2"></i>Official Preview
                                </span>
                                {file && <Badge bg="dark" className="rounded-pill fw-bold">{file.name.split('.').pop()?.toUpperCase()}</Badge>}
                            </div>

                            <div className="preview-pane overflow-hidden position-relative bg-light shadow-inner" style={{ minHeight: '400px' }}>
                                {previewUrl ? (
                                    <div className="w-100 h-100 d-flex flex-column align-items-center justify-content-center p-0" style={{ height: '400px' }}>
                                        {isPreviewable() ? (
                                            file?.type === 'application/pdf' ? (
                                                <iframe
                                                    src={previewUrl}
                                                    className="w-100 h-100 border-0"
                                                    title="Document Preview"
                                                    style={{ minHeight: '400px' }}
                                                />
                                            ) : (
                                                <div className="w-100 h-100 p-4 d-flex align-items-center justify-content-center">
                                                    <img
                                                        src={previewUrl}
                                                        alt="Document Preview"
                                                        className="img-fluid shadow-sm border"
                                                        style={{ maxHeight: '100%', objectFit: 'contain' }}
                                                    />
                                                </div>
                                            )
                                        ) : (
                                            <div className="d-flex flex-column align-items-center justify-content-center h-100 w-100 p-5 bg-white text-center">
                                                <div className="bg-light p-4 rounded-circle mb-4 border border-secondary border-opacity-10">
                                                    <i className={`${getFileIcon()} m-0`} style={{ fontSize: '3rem' }}></i>
                                                </div>
                                                <h6 className="fw-bold text-ledger mb-2 text-truncate w-100">{file?.name}</h6>
                                                <div className="alert border-warning border-opacity-25 bg-warning bg-opacity-10 text-dark small py-2 px-3 mt-3 shadow-none">
                                                    <i className="bi bi-info-circle-fill me-2 text-warning" style={{ color: '#d97706' }}></i>
                                                    External application required for rendering.
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <div className="d-flex flex-column align-items-center justify-content-center h-100 py-5 px-4 text-center">
                                        <div className="bg-white p-4 shadow-sm rounded-4 mb-4 border" style={{ width: '160px', height: '200px', opacity: 0.6 }}>
                                            <div className="bg-light w-100 h-25 mb-2 rounded-1"></div>
                                            <div className="bg-light w-75 h-25 mb-3 rounded-1"></div>
                                            <div className="bg-light w-100 h-25 mb-2 rounded-1 opacity-25"></div>
                                            <div className="bg-light w-100 h-25 mb-3 rounded-1 opacity-25"></div>
                                        </div>
                                        <p className="small fw-bold opacity-50 px-3">Stage a document to activate the high-resolution preview engine.</p>
                                    </div>
                                )}
                            </div>
                        </Card>

                        {/* Action Buttons */}
                        <div className="bg-white p-4 rounded-4 shadow-sm border-0 fade-in-up" style={{ animationDelay: '0.7s' }}>
                            <Button
                                onClick={handleSubmit}
                                disabled={loading}
                                className="btn-ledger w-100 py-3 rounded-pill d-flex align-items-center justify-content-center mb-3 fs-6 shadow-sm hover-translate"
                            >
                                {loading ? (
                                    <Spinner size="sm" animation="border" className="me-2" />
                                ) : (
                                    <i className="bi bi-send-fill me-2"></i>
                                )}
                                Commit to Ledger
                            </Button>
                            <Button
                                variant="light"
                                className="w-100 py-3 fw-bold text-ledger border rounded-pill hover-bg-light transition-all"
                                onClick={() => router.push('/documents')}
                            >
                                Cancel Submission
                            </Button>

                            <div className="text-center mt-4 border-top border-light pt-4">
                                <i className="bi bi-shield-lock-fill fs-3 text-success mb-2 opacity-50 d-block"></i>
                                <p className="text-muted small fw-bold px-2 lh-sm opacity-50" style={{ fontSize: '0.65rem', letterSpacing: '0.2px' }}>
                                    BY SUBMITTING, YOU CERTIFY THAT THIS DOCUMENT COMPLIES WITH <span className="text-dark fw-bolder">PROTOCOL 44-A</span> AND CONTAINS NO RESTRICTED CLEARANCE DATA.
                                </p>
                            </div>
                        </div>
                    </div>
                </Col>
            </Row>
        </Container>
    );
};

export default DocumentUploadPage;
