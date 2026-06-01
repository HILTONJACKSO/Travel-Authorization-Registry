'use client';

import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Card, Table, Button, Badge, Spinner, Alert } from 'react-bootstrap';
import { apiClient } from '@/lib/api-client';
import { useRouter } from 'next/navigation';

interface DashboardData {
    statistics: {
        total: number;
        pending: number;
        approved: number;
        rejected: number;
    };
    recent_documents: any[];
}

import DashboardHeader from '@/components/DashboardHeader';

const DashboardPage: React.FC = () => {
    const [data, setData] = useState<DashboardData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const router = useRouter();

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const response = await apiClient.get('/documents/dashboard/?t=' + new Date().getTime());
                setData(response.data);
            } catch (err: any) {
                setError('Failed to load dashboard data.');
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    if (loading) return (
        <div className="vh-100 d-flex align-items-center justify-content-center">
            <Spinner animation="border" variant="primary" />
        </div>
    );

    return (
        <Container fluid className="px-4 py-3">
            <DashboardHeader
                title="Authorization Overview"
                subtitle="Welcome back. The Ministry's travel registry is synchronized across all executive departments."
            />

            {error && <Alert variant="danger">{error}</Alert>}

            {/* Stats Cards */}
            <Row className="g-4 mb-5">
                <Col md={3}>
                    <div
                        className="card-stat border-0 text-white shadow-sm"
                        style={{ cursor: 'pointer', backgroundColor: '#0f172a' }}
                        onClick={() => router.push('/documents')}
                    >
                        <div className="d-flex justify-content-between align-items-start mb-3">
                            <span className="text-uppercase fw-bold small text-white opacity-75" style={{ letterSpacing: '0.5px' }}>Total Documents</span>
                            <div className="p-2 rounded-3" style={{ backgroundColor: 'rgba(255,255,255,0.1)' }}>
                                <i className="bi bi-box-seam text-white"></i>
                            </div>
                        </div>
                        <h2 className="fw-bold mb-2 text-white" style={{ fontSize: '2rem' }}>{data?.statistics.total.toLocaleString() || '0'}</h2>
                        <div className="small d-flex align-items-center fw-bold text-white opacity-75">
                            <i className="bi bi-graph-up-arrow me-2"></i>
                            <span>+0.0% from last month</span>
                        </div>
                    </div>
                </Col>
                <Col md={3}>
                    <div
                        className="card-stat border-0 text-white shadow-sm"
                        style={{ cursor: 'pointer', backgroundColor: '#78350f' }}
                        onClick={() => router.push('/approvals')}
                    >
                        <div className="d-flex justify-content-between align-items-start mb-3">
                            <span className="text-uppercase fw-bold small text-white opacity-75" style={{ letterSpacing: '0.5px' }}>Pending Approvals</span>
                            <div className="p-2 rounded-3" style={{ backgroundColor: 'rgba(255,255,255,0.1)' }}>
                                <i className="bi bi-clipboard-data text-white"></i>
                            </div>
                        </div>
                        <h2 className="fw-bold mb-2 text-white" style={{ fontSize: '2rem' }}>{data?.statistics.pending || '0'}</h2>
                        <div className="small fw-bold text-white opacity-75">Requiring immediate action</div>
                    </div>
                </Col>
                <Col md={3}>
                    <div
                        className="card-stat border-0 text-white shadow-sm"
                        style={{ cursor: 'pointer', backgroundColor: '#14532d' }}
                        onClick={() => router.push('/documents')}
                    >
                        <div className="d-flex justify-content-between align-items-start mb-3">
                            <span className="text-uppercase fw-bold small text-white opacity-75" style={{ letterSpacing: '0.5px' }}>Approved</span>
                            <div className="p-2 rounded-3" style={{ backgroundColor: 'rgba(255,255,255,0.1)' }}>
                                <i className="bi bi-patch-check text-white"></i>
                            </div>
                        </div>
                        <h2 className="fw-bold mb-2 text-white" style={{ fontSize: '2rem' }}>{data?.statistics.approved || '0'}</h2>
                        <div className="small fw-bold text-white opacity-75">Successfully processed</div>
                    </div>
                </Col>
                <Col md={3}>
                    <div
                        className="card-stat border-0 text-white shadow-sm"
                        style={{ cursor: 'pointer', backgroundColor: '#7f1d1d' }}
                        onClick={() => router.push('/documents')}
                    >
                        <div className="d-flex justify-content-between align-items-start mb-3">
                            <span className="text-uppercase fw-bold small text-white opacity-75" style={{ letterSpacing: '0.5px' }}>Rejected</span>
                            <div className="p-2 rounded-3" style={{ backgroundColor: 'rgba(255,255,255,0.1)' }}>
                                <i className="bi bi-x-circle text-white"></i>
                            </div>
                        </div>
                        <h2 className="fw-bold mb-2 text-white" style={{ fontSize: '2rem' }}>{data?.statistics.rejected || '0'}</h2>
                        <div className="small fw-bold text-white opacity-75">Archived as non-compliant</div>
                    </div>
                </Col>
            </Row>

            {/* Recent Archive Activity */}
            <Card className="border-0 shadow-sm overflow-hidden" style={{ borderRadius: '20px' }}>
                <Card.Header className="bg-white px-4 py-4 border-0">
                    <div className="d-flex justify-content-between align-items-center">
                        <div>
                            <h4 className="fw-bold text-ledger mb-1">Recent Authorization Activity</h4>
                            <p className="text-muted small mb-0">Live audit trail of the latest travel registry entries</p>
                        </div>
                        <div className="d-flex gap-2">
                            <Button variant="light" className="border d-flex align-items-center px-3" style={{ borderRadius: '10px' }}>
                                <i className="bi bi-filter me-2"></i> Filter
                            </Button>
                            <Button className="btn-ledger d-flex align-items-center" onClick={() => router.push('/documents')}>
                                <i className="bi bi-plus-lg me-2"></i> New Entry
                            </Button>
                        </div>
                    </div>
                </Card.Header>
                <Card.Body className="p-0">
                    <Table responsive hover className="mb-0 align-middle">
                        <thead className="bg-light text-uppercase small fw-bold text-nowrap" style={{ letterSpacing: '0.5px' }}>
                            <tr>
                                <th className="ps-4 py-3">Title</th>
                                <th className="py-3">Department</th>
                                <th className="py-3 text-center">Status</th>
                                <th className="py-3">Priority</th>
                                <th className="py-3">Submitted At</th>
                                <th className="py-3">Submitted By</th>
                                <th className="text-end pe-4 py-3">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {(data?.recent_documents.length || 0) > 0 ? data?.recent_documents.map((doc: any) => (
                                <tr key={doc.id} className="cursor-pointer" onClick={() => router.push(`/documents/${doc.id}`)}>
                                    <td className="ps-4">
                                        <div className="d-flex align-items-center py-2">
                                            <div className="bg-light p-2 rounded-3 me-3">
                                                <i className="bi bi-file-earmark-text text-muted"></i>
                                            </div>
                                            <div className="fw-bold">{doc.title}</div>
                                        </div>
                                    </td>
                                    <td><span className="text-muted fw-bold small">{doc.metadata?.department || 'Ministry'}</span></td>
                                    <td className="text-center">
                                        <span className={`status-badge ${doc.status === 'Approved' ? 'bg-success bg-opacity-10 text-success' :
                                            doc.status === 'Rejected' ? 'bg-danger bg-opacity-10 text-danger' :
                                                'bg-primary bg-opacity-10 text-primary'
                                            }`}>
                                            {doc.status}
                                        </span>
                                    </td>
                                    <td>
                                        <Badge bg={doc.metadata?.priority === 'Urgent' ? 'danger' : doc.metadata?.priority === 'Low' ? 'secondary' : 'info'} className="text-uppercase" style={{ fontSize: '10px' }}>
                                            {doc.metadata?.priority || 'Medium'}
                                        </Badge>
                                    </td>
                                    <td><span className="text-muted small">{new Date(doc.created_at).toLocaleDateString()}</span></td>
                                    <td><span className="text-muted small fw-bold">{doc.created_by_email}</span></td>
                                    <td className="text-end pe-4">
                                        <Button variant="link" className="text-muted p-0" onClick={(e) => { e.stopPropagation(); /* detail popup or similar */ }}>
                                            <i className="bi bi-three-dots fs-5"></i>
                                        </Button>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan={7} className="text-center py-5">
                                        <div className="opacity-25 mb-3">
                                            <i className="bi bi-inbox fs-1"></i>
                                        </div>
                                        <div className="text-muted small fw-bold text-uppercase" style={{ letterSpacing: '1px' }}>
                                            No recent registry entries detected
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </Table>
                    <div className="px-4 py-3 border-top bg-light d-flex justify-content-between align-items-center">
                        <div className="small text-muted fw-bold">
                            Showing {data?.recent_documents.length || 0} of {data?.statistics.total || 0} results
                        </div>
                        <div className="d-flex gap-2">
                            <Button variant="light" size="sm" className="border px-2 rounded-3" disabled><i className="bi bi-chevron-left"></i></Button>
                            <Button variant="light" size="sm" className="border px-2 rounded-3" disabled><i className="bi bi-chevron-right"></i></Button>
                        </div>
                    </div>
                </Card.Body>
            </Card>
        </Container>
    );
};

export default DashboardPage;
