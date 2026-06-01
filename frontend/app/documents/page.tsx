'use client';

import React, { useEffect, useState } from 'react';
import { Container, Card, Table, Form, Button, Row, Col, Badge, Spinner, Alert } from 'react-bootstrap';
import { apiClient } from '@/lib/api-client';
import { useRouter, useSearchParams } from 'next/navigation';

interface Document {
    id: string;
    title: string;
    status: string;
    created_at: string;
    created_by_email: string;
    metadata?: {
        department: string;
        priority: string;
        doc_type?: string;
    };
}

import DashboardHeader from '@/components/DashboardHeader';

const DocumentsListPage: React.FC = () => {
    const [documents, setDocuments] = useState<Document[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const router = useRouter();
    const searchParams = useSearchParams();
    const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');

    useEffect(() => {
        const querySearch = searchParams.get('search');
        if (querySearch !== null) {
            setSearchTerm(querySearch);
        }
    }, [searchParams]);

    useEffect(() => {
        const fetchDocuments = async () => {
            try {
                const response = await apiClient.get('/documents/');
                setDocuments(response.data.results || response.data);
            } catch (err: any) {
                setError('Failed to fetch documents list.');
            } finally {
                setLoading(false);
            }
        };

        fetchDocuments();
    }, []);

    const filteredDocs = documents.filter(doc =>
        doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (doc.metadata?.department && doc.metadata.department.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (doc.metadata?.doc_type && doc.metadata.doc_type.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'Approved': return <span className="status-badge bg-success bg-opacity-10 text-success border border-success border-opacity-25">Approved</span>;
            case 'Rejected': return <span className="status-badge bg-danger bg-opacity-10 text-danger border border-danger border-opacity-25">Rejected</span>;
            case 'Pending': return <span className="status-badge bg-warning bg-opacity-10 text-dark border border-warning border-opacity-50">Pending</span>;
            case 'Under Review': return <span className="status-badge bg-primary bg-opacity-10 text-primary border border-primary border-opacity-25">Under Review</span>;
            default: return <span className="status-badge bg-secondary bg-opacity-10 text-secondary border border-secondary border-opacity-25">{status}</span>;
        }
    };

    const getPriorityBadge = (priority: string) => {
        switch (priority) {
            case 'Urgent': return <Badge bg="danger" className="text-uppercase" style={{ fontSize: '10px', letterSpacing: '0.5px' }}>Urgent</Badge>;
            case 'Medium': return <Badge bg="info" className="text-uppercase" style={{ fontSize: '10px', letterSpacing: '0.5px' }}>Medium</Badge>;
            case 'Low': return <Badge bg="secondary" className="text-uppercase" style={{ fontSize: '10px', letterSpacing: '0.5px' }}>Low</Badge>;
            default: return <Badge bg="secondary" className="text-uppercase" style={{ fontSize: '10px', letterSpacing: '0.5px' }}>Normal</Badge>;
        }
    };

    return (
        <Container fluid className="px-4 py-3">
            <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-end mb-4">
                <DashboardHeader
                    title="Document Repository"
                    subtitle="Official archive of all legislative and administrative records."
                />
                <Button variant="dark" className="btn-ledger shadow-sm px-4 py-2 mt-3 mt-md-0 d-flex align-items-center" onClick={() => router.push('/documents/upload')}>
                    <i className="bi bi-file-earmark-plus-fill me-2 fs-5"></i>
                    <span className="fw-bold">New Document</span>
                </Button>
            </div>

            {/* Command Center Search Bar */}
            <Card className="border-0 shadow-sm rounded-4 mb-4 bg-white">
                <Card.Body className="p-4">
                    <Row className="align-items-center g-3">
                        <Col lg={8}>
                            <div className="position-relative">
                                <i className="bi bi-search position-absolute text-muted" style={{ top: '50%', left: '16px', transform: 'translateY(-50%)', fontSize: '1.2rem' }}></i>
                                <Form.Control
                                    type="text"
                                    className="border-0 bg-light py-3 pe-4 shadow-none form-control-gov transition-all"
                                    style={{ paddingLeft: '48px', fontSize: '1.05rem', borderRadius: '12px' }}
                                    placeholder="Search by exact title, department, or document type..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                        </Col>
                        <Col lg={4} className="d-flex justify-content-lg-end gap-2">
                            <Button variant="light" className="border px-4 py-3 rounded-3 text-muted fw-bold d-flex align-items-center hover-bg-light transition-all">
                                <i className="bi bi-funnel-fill me-2"></i> Filter List
                            </Button>
                            <Button variant="light" className="border px-4 py-3 rounded-3 text-muted fw-bold d-flex align-items-center hover-bg-light transition-all">
                                <i className="bi bi-download me-2"></i> Export CSV
                            </Button>
                        </Col>
                    </Row>
                </Card.Body>
            </Card>

            {loading ? (
                <div className="text-center py-5 my-5">
                    <Spinner animation="border" style={{ width: '3rem', height: '3rem', color: 'var(--gov-deep)' }} />
                    <h5 className="mt-4 fw-bold text-ledger">Accessing Secure Archives...</h5>
                    <p className="text-muted small">Verifying credentials and decrypting ledger records.</p>
                </div>
            ) : error ? (
                <Alert variant="danger" className="rounded-4 border-0 shadow-sm p-4">
                    <i className="bi bi-exclamation-triangle-fill me-2"></i> {error}
                </Alert>
            ) : (
                <Card className="border-0 shadow-sm overflow-hidden" style={{ borderRadius: '20px' }}>
                    <Card.Header className="bg-white px-4 py-4 border-bottom border-light d-flex justify-content-between align-items-center">
                        <div>
                            <h5 className="fw-bolder text-ledger mb-1">Official Registry</h5>
                            <div className="text-muted small fw-bold" style={{ letterSpacing: '0.5px' }}>{filteredDocs.length} RECORDS FOUND</div>
                        </div>
                    </Card.Header>
                    <Card.Body className="p-0">
                        <Table responsive hover className="mb-0 align-middle gov-table">
                            <thead className="bg-light text-uppercase small fw-bold text-nowrap" style={{ letterSpacing: '0.5px' }}>
                                <tr>
                                    <th className="ps-4 py-3 border-0">Document Title</th>
                                    <th className="py-3 border-0">Department / Type</th>
                                    <th className="py-3 border-0 text-center">Current Status</th>
                                    <th className="py-3 border-0">Priority</th>
                                    <th className="py-3 border-0">Submitted At</th>
                                    <th className="py-3 border-0">Authorizing Agent</th>
                                    <th className="text-end pe-4 py-3 border-0">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredDocs.length > 0 ? filteredDocs.map((doc, idx) => (
                                    <tr 
                                        key={doc.id} 
                                        className="cursor-pointer fade-in-up" 
                                        style={{ animationDelay: `${idx * 0.05}s` }}
                                        onClick={() => router.push(`/documents/${doc.id}`)}
                                    >
                                        <td className="ps-4">
                                            <div className="d-flex align-items-center py-2">
                                                <div className="bg-light p-2 rounded-3 me-3 text-muted border border-secondary border-opacity-10">
                                                    <i className="bi bi-file-earmark-text-fill fs-5"></i>
                                                </div>
                                                <div>
                                                    <div className="fw-bold text-dark fs-6">{doc.title}</div>
                                                    <div className="text-muted small font-monospace" style={{ fontSize: '0.7rem' }}>REF: #{doc.id.substring(0, 8).toUpperCase()}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            <div className="text-dark fw-bold small">{doc.metadata?.department || 'Ministry'}</div>
                                            <div className="text-muted x-small text-uppercase" style={{ letterSpacing: '0.5px' }}>{doc.metadata?.doc_type || 'General Record'}</div>
                                        </td>
                                        <td className="text-center">{getStatusBadge(doc.status)}</td>
                                        <td>{getPriorityBadge(doc.metadata?.priority || 'Medium')}</td>
                                        <td>
                                            <div className="text-dark small fw-bold">{new Date(doc.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</div>
                                            <div className="text-muted x-small">{new Date(doc.created_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</div>
                                        </td>
                                        <td>
                                            <div className="d-flex align-items-center">
                                                <div className="rounded-circle bg-secondary text-white d-flex justify-content-center align-items-center me-2 fw-bold" style={{ width: '28px', height: '28px', fontSize: '0.7rem' }}>
                                                    {doc.created_by_email.charAt(0).toUpperCase()}
                                                </div>
                                                <span className="text-dark small fw-bold">{doc.created_by_email.split('@')[0].replace('.', ' ').replace(/\b\w/g, l => l.toUpperCase())}</span>
                                            </div>
                                        </td>
                                        <td className="text-end pe-4 text-nowrap">
                                            <Button variant="light" className="btn-sm rounded-circle me-2 border-0 bg-secondary bg-opacity-10 hover-text-ledger" style={{ width: '36px', height: '36px' }} onClick={(e) => { e.stopPropagation(); router.push(`/documents/${doc.id}`); }}>
                                                <i className="bi bi-eye-fill"></i>
                                            </Button>
                                            <Button variant="light" className="btn-sm rounded-circle border-0 bg-secondary bg-opacity-10 hover-text-ledger" style={{ width: '36px', height: '36px' }} onClick={(e) => { e.stopPropagation(); }}>
                                                <i className="bi bi-download"></i>
                                            </Button>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan={7} className="text-center py-5">
                                            <div className="bg-light rounded-circle d-inline-flex justify-content-center align-items-center mb-4" style={{ width: '100px', height: '100px' }}>
                                                <i className="bi bi-search fs-1 text-muted opacity-50"></i>
                                            </div>
                                            <h5 className="fw-bolder text-dark mb-2">No Matching Records Found</h5>
                                            <p className="text-muted small mb-4" style={{ maxWidth: '400px', margin: '0 auto' }}>We couldn't find any documents matching your current search parameters in the official archive.</p>
                                            <Button variant="outline-dark" className="px-4 fw-bold rounded-pill" onClick={() => setSearchTerm('')}>
                                                Clear Search Criteria
                                            </Button>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </Table>
                    </Card.Body>
                </Card>
            )}
        </Container>
    );
};

export default DocumentsListPage;
