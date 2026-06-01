'use client';

import React, { useEffect, useState } from 'react';
import { Container, Card, Table, Button, Badge, Spinner, Alert } from 'react-bootstrap';
import { apiClient } from '@/lib/api-client';
import { useRouter } from 'next/navigation';
import DashboardHeader from '@/components/DashboardHeader';

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

const MyApprovalsPage: React.FC = () => {
    const [documents, setDocuments] = useState<Document[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const router = useRouter();

    useEffect(() => {
        const fetchMyApprovals = async () => {
            try {
                const response = await apiClient.get('/documents/pending_my_approval/');
                setDocuments(response.data);
            } catch (err: any) {
                setError('Failed to fetch approval queue.');
            } finally {
                setLoading(false);
            }
        };

        fetchMyApprovals();
    }, []);

    const getPriorityBadge = (priority: string) => {
        switch (priority) {
            case 'Urgent': return <span className="status-badge bg-danger bg-opacity-10 text-danger border border-danger border-opacity-25" style={{ fontSize: '10px', padding: '4px 8px' }}>URGENT</span>;
            case 'Medium': return <span className="status-badge bg-info bg-opacity-10 text-info border border-info border-opacity-25" style={{ fontSize: '10px', padding: '4px 8px' }}>MEDIUM</span>;
            case 'Low': return <span className="status-badge bg-secondary bg-opacity-10 text-secondary border border-secondary border-opacity-25" style={{ fontSize: '10px', padding: '4px 8px' }}>LOW</span>;
            default: return <span className="status-badge bg-secondary bg-opacity-10 text-secondary border border-secondary border-opacity-25" style={{ fontSize: '10px', padding: '4px 8px' }}>NORMAL</span>;
        }
    };

    return (
        <Container fluid className="px-4 py-3">
            <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-end mb-4">
                <DashboardHeader
                    title="My Approval Queue"
                    subtitle="Documents awaiting your official review and signature."
                />
                <div className="mt-3 mt-md-0">
                    <span className="badge bg-danger rounded-pill px-3 py-2 shadow-sm fs-6 d-flex align-items-center">
                        <i className="bi bi-exclamation-circle-fill me-2"></i>
                        {documents.length} Actions Required
                    </span>
                </div>
            </div>

            {error && (
                <Alert variant="danger" className="rounded-4 border-0 shadow-sm p-4 mb-4">
                    <i className="bi bi-exclamation-triangle-fill me-2"></i> {error}
                </Alert>
            )}

            <Card className="border-0 shadow-sm overflow-hidden bg-white mb-4" style={{ borderRadius: '20px' }}>
                <Card.Header className="bg-white px-4 py-4 border-bottom border-light d-flex justify-content-between align-items-center">
                    <div>
                        <h5 className="fw-bolder text-ledger mb-1">Pending Actions</h5>
                        <div className="text-muted small fw-bold" style={{ letterSpacing: '0.5px' }}>{documents.length} DOCUMENTS IN QUEUE</div>
                    </div>
                </Card.Header>
                <Card.Body className="p-0">
                    {loading ? (
                        <div className="text-center py-5 my-5">
                            <Spinner animation="border" style={{ width: '3rem', height: '3rem', color: 'var(--gov-deep)' }} />
                            <h5 className="mt-4 fw-bold text-ledger">Syncing Queue...</h5>
                            <p className="text-muted small">Retrieving documents requiring your signature.</p>
                        </div>
                    ) : (
                        <Table responsive hover className="mb-0 align-middle gov-table">
                            <thead className="bg-light text-uppercase small fw-bold text-nowrap" style={{ letterSpacing: '0.5px' }}>
                                <tr>
                                    <th className="ps-4 py-3 border-0">Document Detail</th>
                                    <th className="py-3 border-0">Department / Type</th>
                                    <th className="py-3 border-0 text-center">Priority</th>
                                    <th className="py-3 border-0">Submitted At</th>
                                    <th className="text-end pe-4 py-3 border-0">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {documents.length > 0 ? documents.map((doc, idx) => (
                                    <tr 
                                        key={doc.id} 
                                        className="cursor-pointer fade-in-up" 
                                        style={{ animationDelay: `${idx * 0.05}s` }}
                                        onClick={() => router.push(`/documents/${doc.id}`)}
                                    >
                                        <td className="ps-4">
                                            <div className="d-flex align-items-center py-2">
                                                <div className="bg-danger bg-opacity-10 p-2 rounded-3 me-3 text-danger border border-danger border-opacity-10">
                                                    <i className="bi bi-pen-fill fs-5"></i>
                                                </div>
                                                <div>
                                                    <div className="fw-bold text-dark fs-6">{doc.title}</div>
                                                    <div className="text-muted small font-monospace" style={{ fontSize: '0.7rem' }}>By: {doc.created_by_email}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            <div className="text-dark fw-bold small">{doc.metadata?.department || 'Ministry'}</div>
                                            <div className="text-muted x-small text-uppercase" style={{ letterSpacing: '0.5px' }}>{doc.metadata?.doc_type || 'General Record'}</div>
                                        </td>
                                        <td className="text-center">
                                            {getPriorityBadge(doc.metadata?.priority || 'Medium')}
                                        </td>
                                        <td>
                                            <div className="text-dark small fw-bold">{new Date(doc.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</div>
                                            <div className="text-muted x-small">{new Date(doc.created_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</div>
                                        </td>
                                        <td className="text-end pe-4">
                                            <Button
                                                variant="dark"
                                                className="btn-ledger px-3 py-2 rounded-pill fw-bold shadow-sm d-inline-flex align-items-center"
                                                onClick={(e) => { e.stopPropagation(); router.push(`/documents/${doc.id}`); }}
                                            >
                                                <i className="bi bi-pen me-2"></i> Review & Sign
                                            </Button>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan={5} className="text-center py-5">
                                            <div className="bg-success bg-opacity-10 rounded-circle d-inline-flex justify-content-center align-items-center mb-4" style={{ width: '100px', height: '100px' }}>
                                                <i className="bi bi-check2-all fs-1 text-success"></i>
                                            </div>
                                            <h5 className="fw-bolder text-dark mb-2">All Caught Up!</h5>
                                            <p className="text-muted small mb-0" style={{ maxWidth: '400px', margin: '0 auto' }}>You have no pending documents requiring your review or signature at this time.</p>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </Table>
                    )}
                </Card.Body>
            </Card>

            <div className="d-flex align-items-center p-3 rounded-4 border border-secondary border-opacity-10 bg-white shadow-sm mt-4">
                <div className="bg-light rounded-circle d-flex justify-content-center align-items-center me-3" style={{ width: '40px', height: '40px' }}>
                    <i className="bi bi-shield-lock-fill text-muted"></i>
                </div>
                <div className="small text-muted flex-grow-1">
                    <span className="fw-bold text-dark">Byzantine Security Protocol:</span> Approving a document automatically appends your cryptographic signature and advances the workflow. Rejecting it permanently stops the authorization process.
                </div>
            </div>
        </Container>
    );
};

export default MyApprovalsPage;
