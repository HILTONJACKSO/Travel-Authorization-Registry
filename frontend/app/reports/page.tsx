'use client';

import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Card, Badge, Spinner, Table, Button } from 'react-bootstrap';
import { useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api-client';
import { useAuth } from '@/context/AuthContext';
import DashboardHeader from '@/components/DashboardHeader';

interface Stats {
    total_documents: number;
    pending_approvals: number;
    approved_documents: number;
    rejected_documents: number;
}

const ReportsPage: React.FC = () => {
    const router = useRouter();
    const { user } = useAuth();
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await apiClient.get('/documents/reports/?t=' + new Date().getTime());
                setData(response.data);
            } catch (err: any) {
                setError('Failed to load real-time analytics data.');
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'Approved': return <span className="status-badge bg-success bg-opacity-10 text-success border border-success border-opacity-25 px-3 py-1">APPROVED</span>;
            case 'Rejected': return <span className="status-badge bg-danger bg-opacity-10 text-danger border border-danger border-opacity-25 px-3 py-1">REJECTED</span>;
            case 'Pending': return <span className="status-badge bg-warning bg-opacity-10 text-dark border border-warning border-opacity-50 px-3 py-1">PENDING</span>;
            case 'Under Review': return <span className="status-badge bg-primary bg-opacity-10 text-primary border border-primary border-opacity-25 px-3 py-1">REVIEW</span>;
            default: return <span className="status-badge bg-secondary bg-opacity-10 text-secondary border border-secondary border-opacity-25 px-3 py-1">{status?.toUpperCase() || 'UNKNOWN'}</span>;
        }
    };

    if (loading) return (
        <div className="d-flex justify-content-center align-items-center vh-100 bg-light">
            <div className="text-center">
                <Spinner animation="border" style={{ width: '3rem', height: '3rem', color: 'var(--gov-deep)' }} />
                <h5 className="mt-4 fw-bold text-ledger">Compiling Analytics...</h5>
            </div>
        </div>
    );

    return (
        <Container fluid className="px-4 py-3">
            <DashboardHeader
                title="REGISTRY ANALYTICS & REPORTS"
                subtitle="Live performance metrics and administrative throughput for the Sovereign Ledger."
            />

            {/* KPI Cards */}
            <Row className="g-4 mb-5">
                <Col md={3}>
                    <Card className="border border-secondary border-opacity-10 shadow-sm overflow-hidden bg-white hover-translate transition-all fade-in-up" style={{ borderRadius: '24px', animationDelay: '0.1s' }}>
                        <div className="p-4 position-relative">
                            <div className="position-absolute top-0 end-0 p-4" style={{ opacity: 0.05 }}>
                                <i className="bi bi-files display-4"></i>
                            </div>
                            <div className="d-flex justify-content-between align-items-start mb-3 position-relative z-1">
                                <div className="bg-primary bg-opacity-10 p-2 rounded-3 text-primary border border-primary border-opacity-10">
                                    <i className="bi bi-files fs-4"></i>
                                </div>
                                <span className="text-muted small fw-bold">+0.0% <i className="bi bi-dash"></i></span>
                            </div>
                            <h6 className="text-muted fw-bold text-uppercase small mb-1" style={{ letterSpacing: '1px' }}>Total Ledger Entries</h6>
                            <h2 className="fw-bolder mb-0 text-dark">{data?.stats?.total_documents || 0}</h2>
                        </div>
                    </Card>
                </Col>
                <Col md={3}>
                    <Card className="border border-secondary border-opacity-10 shadow-sm overflow-hidden bg-white hover-translate transition-all fade-in-up" style={{ borderRadius: '24px', animationDelay: '0.2s' }}>
                        <div className="p-4 position-relative">
                            <div className="position-absolute top-0 end-0 p-4" style={{ opacity: 0.05 }}>
                                <i className="bi bi-clock-history display-4"></i>
                            </div>
                            <div className="d-flex justify-content-between align-items-start mb-3 position-relative z-1">
                                <div className="bg-purple bg-opacity-10 p-2 rounded-3 border border-purple border-opacity-10" style={{ color: '#7c3aed' }}>
                                    <i className="bi bi-clock-history fs-4"></i>
                                </div>
                                <span className="text-muted small fw-bold">{data?.stats?.avg_approval_time || 0}h <i className="bi bi-dash"></i></span>
                            </div>
                            <h6 className="text-muted fw-bold text-uppercase small mb-1" style={{ letterSpacing: '1px' }}>Avg. Approval Time</h6>
                            <h2 className="fw-bolder mb-0 text-dark">{data?.stats?.avg_approval_time || 0}h</h2>
                        </div>
                    </Card>
                </Col>
                <Col md={3}>
                    <Card className="border border-secondary border-opacity-10 shadow-sm overflow-hidden bg-white hover-translate transition-all fade-in-up" style={{ borderRadius: '24px', animationDelay: '0.3s' }}>
                        <div className="p-4 position-relative">
                            <div className="position-absolute top-0 end-0 p-4" style={{ opacity: 0.05 }}>
                                <i className="bi bi-exclamation-triangle display-4"></i>
                            </div>
                            <div className="d-flex justify-content-between align-items-start mb-3 position-relative z-1">
                                <div className="bg-warning bg-opacity-10 p-2 rounded-3 text-warning border border-warning border-opacity-10">
                                    <i className="bi bi-exclamation-triangle fs-4"></i>
                                </div>
                                <span className="text-muted small fw-bold">0% <i className="bi bi-dash"></i></span>
                            </div>
                            <h6 className="text-muted fw-bold text-uppercase small mb-1" style={{ letterSpacing: '1px' }}>Processing Bottlenecks</h6>
                            <h2 className="fw-bolder mb-0 text-dark">{data?.stats?.pending_approvals || 0}</h2>
                        </div>
                    </Card>
                </Col>
                <Col md={3}>
                    <Card className="border border-secondary border-opacity-10 shadow-sm overflow-hidden bg-white hover-translate transition-all fade-in-up" style={{ borderRadius: '24px', animationDelay: '0.4s' }}>
                        <div className="p-4 position-relative">
                            <div className="position-absolute top-0 end-0 p-4" style={{ opacity: 0.05 }}>
                                <i className="bi bi-shield-check display-4"></i>
                            </div>
                            <div className="d-flex justify-content-between align-items-start mb-3 position-relative z-1">
                                <div className="bg-success bg-opacity-10 p-2 rounded-3 text-success border border-success border-opacity-10">
                                    <i className="bi bi-shield-check fs-4"></i>
                                </div>
                                <span className="text-muted small fw-bold">{data?.stats?.compliance_rate || 0}% <i className="bi bi-dash"></i></span>
                            </div>
                            <h6 className="text-muted fw-bold text-uppercase small mb-1" style={{ letterSpacing: '1px' }}>Compliance Rate</h6>
                            <h2 className="fw-bolder mb-0 text-dark">{data?.stats?.compliance_rate || 0}%</h2>
                        </div>
                    </Card>
                </Col>
            </Row>

            <Row className="g-4">
                {/* Departmental Throughput Chart (CSS Bar Chart) */}
                <Col lg={8}>
                    <Card className="border-0 shadow-sm p-4 p-xl-5 bg-white fade-in-up" style={{ borderRadius: '32px', animationDelay: '0.5s' }}>
                        <div className="d-flex justify-content-between align-items-center mb-5">
                            <div>
                                <h4 className="fw-bold text-ledger mb-1">Departmental Throughput</h4>
                                <p className="text-muted small mb-0">Volume of documents processed by administrative unit</p>
                            </div>
                            <div className="d-flex gap-2">
                                <div className="bg-light p-2 rounded-circle cursor-pointer border hover-bg-light transition-all"><i className="bi bi-three-dots"></i></div>
                            </div>
                        </div>

                        <div className="d-flex flex-column gap-4">
                            {(data?.departmental_throughput && data.departmental_throughput.length > 0) ? (
                                data.departmental_throughput.map((dept: any, idx: number) => {
                                    const gradients = [
                                        'linear-gradient(90deg, #3b82f6, #60a5fa)',
                                        'linear-gradient(90deg, #8b5cf6, #a78bfa)',
                                        'linear-gradient(90deg, #ef4444, #f87171)',
                                        'linear-gradient(90deg, #10b981, #34d399)',
                                        'linear-gradient(90deg, #f59e0b, #fbbf24)'
                                    ];
                                    return (
                                        <div key={idx} className="d-flex align-items-center gap-4">
                                            <div className="text-dark fw-bold small flex-shrink-0" style={{ width: '140px' }}>{dept.name}</div>
                                            <div className="flex-grow-1 bg-light rounded-pill overflow-hidden shadow-inner" style={{ height: '32px' }}>
                                                <div
                                                    className="h-100 rounded-pill d-flex align-items-center px-3 chart-bar shadow-sm"
                                                    style={{
                                                        width: `${dept.percentage}%`,
                                                        background: gradients[idx % 5],
                                                        transition: 'width 1s ease-out'
                                                    }}
                                                >
                                                    <span className="text-white fw-bold small" style={{ fontSize: '0.7rem' }}>{dept.percentage}%</span>
                                                </div>
                                            </div>
                                            <div className="text-muted fw-bold small flex-shrink-0" style={{ width: '40px' }}>{dept.count}</div>
                                        </div>
                                    );
                                })
                            ) : (
                                <div className="text-center py-4 opacity-50">
                                    <div className="text-muted small fw-bold text-uppercase">Waiting for Data...</div>
                                </div>
                            )}
                        </div>
                    </Card>
                </Col>

                {/* Status Breakdown */}
                <Col lg={4}>
                    <Card className="border-0 shadow-sm p-4 p-xl-5 bg-white fade-in-up" style={{ borderRadius: '32px', animationDelay: '0.6s' }}>
                        <h4 className="fw-bold text-ledger mb-4">Lifecycle Velocity</h4>
                        <div className="d-flex flex-column gap-4">
                            {['Approved', 'Under Review', 'Rejected'].map((status) => {
                                const stat = data?.status_breakdown?.find((s: any) => s.name === status);
                                const colorClass = status === 'Approved' ? 'bg-success' : status === 'Rejected' ? 'bg-danger' : 'bg-warning';
                                const iconClass = status === 'Approved' ? 'bi-check-circle-fill text-success' : status === 'Rejected' ? 'bi-x-circle-fill text-danger' : 'bi-hourglass-split text-warning';
                                return (
                                    <div key={status} className="d-flex align-items-center justify-content-between pb-3 border-bottom border-light">
                                        <div className="d-flex align-items-center gap-3">
                                            <div className={`${colorClass} bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center border border-${colorClass.replace('bg-','')} border-opacity-25`} style={{ width: '32px', height: '32px' }}>
                                                <i className={`bi ${iconClass} small`}></i>
                                            </div>
                                            <span className="text-dark fw-bold">{status === 'Under Review' ? 'Pending Review' : status === 'Rejected' ? 'Rejected / Flawed' : status}</span>
                                        </div>
                                        <span className="text-muted small fw-bold">{stat?.percentage || 0}%</span>
                                    </div>
                                );
                            })}
                        </div>

                        <div className="mt-5 pt-3">
                            <div className="bg-light p-4 rounded-4 border border-secondary border-opacity-10 text-center shadow-inner">
                                <div className="text-muted small fw-bold text-uppercase mb-2" style={{ letterSpacing: '1px' }}>System Efficiency</div>
                                <div className="display-6 fw-bolder text-ledger mb-2">{(data?.stats?.compliance_rate || 0).toFixed(1)}%</div>
                                <div className="text-muted small fw-bold"><i className="bi bi-clock-history me-1"></i> Optimizing Access</div>
                            </div>
                        </div>
                    </Card>
                </Col>
            </Row>

            <Row className="g-4 mt-1">
                {/* ROI Impact Breakdown */}
                <Col lg={12}>
                    <Card className="border-0 shadow-sm p-4 p-xl-5 bg-white fade-in-up" style={{ borderRadius: '32px', animationDelay: '0.7s' }}>
                        <div className="d-flex justify-content-between align-items-center mb-5">
                            <div>
                                <h4 className="fw-bold text-ledger mb-1">Strategic Return on Investment</h4>
                                <p className="text-muted small mb-0">Compiled from Post-Travel Debrief Evaluations</p>
                            </div>
                            <div className="d-flex gap-2">
                                <div className="bg-light p-2 rounded-circle cursor-pointer border hover-bg-light transition-all"><i className="bi bi-pie-chart-fill"></i></div>
                            </div>
                        </div>

                        <Row className="g-4">
                            {data?.roi_breakdown && data.roi_breakdown.length > 0 ? (
                                data.roi_breakdown.map((roi: any, idx: number) => {
                                    const colorMap: any = {
                                        'Critical National Benefit': 'bg-success',
                                        'High Strategic Impact': 'bg-primary',
                                        'Moderate Benefit': 'bg-info',
                                        'Low Impact': 'bg-warning',
                                        'Negligible Impact': 'bg-danger'
                                    };
                                    const bgClass = colorMap[roi.name] || 'bg-secondary';
                                    const textClass = bgClass.replace('bg-', 'text-');
                                    
                                    return (
                                        <Col md={4} key={idx}>
                                            <div className="bg-white rounded-4 p-4 border border-secondary border-opacity-10 shadow-sm h-100 hover-translate transition-all">
                                                <div className="d-flex justify-content-between align-items-start mb-3">
                                                    <div className={`${bgClass} bg-opacity-10 p-2 rounded-3 border border-${bgClass.replace('bg-','')} border-opacity-25`}>
                                                        <i className={`bi bi-graph-up-arrow ${textClass}`}></i>
                                                    </div>
                                                    <h3 className="fw-bolder text-dark mb-0">{roi.count}</h3>
                                                </div>
                                                <div className="fw-bold text-dark mb-1 lh-sm" style={{ letterSpacing: '0.5px' }}>{roi.name}</div>
                                                <div className="text-muted small">{roi.percentage}% of filed reports</div>
                                            </div>
                                        </Col>
                                    );
                                })
                            ) : (
                                <Col md={12}>
                                    <div className="text-center py-5 opacity-50 bg-light rounded-4 border border-secondary border-opacity-10">
                                        <i className="bi bi-bar-chart fs-1 mb-2 d-block"></i>
                                        <div className="text-muted small fw-bold text-uppercase">Awaiting Strategic Evaluations...</div>
                                    </div>
                                </Col>
                            )}
                        </Row>
                    </Card>
                </Col>
            </Row>

            {/* Analytics Ledger */}
            <Card className="border-0 shadow-sm mt-5 overflow-hidden bg-white fade-in-up" style={{ borderRadius: '32px', animationDelay: '0.8s' }}>
                <div className="p-4 p-xl-5 pb-0">
                    <h4 className="fw-bold text-ledger mb-1">Analytics Ledger</h4>
                    <p className="text-muted small">Transactional breakdown of document lifecycle events</p>
                </div>
                <div className="table-responsive p-4 p-xl-5 pt-2">
                    <Table responsive hover className="mb-0 align-middle gov-table">
                        <thead className="bg-light">
                            <tr className="text-muted small fw-bold text-uppercase" style={{ letterSpacing: '1px' }}>
                                <th className="ps-4 py-3 border-0">Reference ID</th>
                                <th className="py-3 border-0">Type</th>
                                <th className="py-3 border-0">Department</th>
                                <th className="py-3 border-0">Velocity</th>
                                <th className="py-3 border-0">Status</th>
                                <th className="pe-4 py-3 border-0 text-end">Action Log</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data?.recent_ledger?.length > 0 ? (
                                data.recent_ledger.map((doc: any, idx: number) => (
                                    <tr key={doc.id} className="fade-in-up" style={{ animationDelay: `${0.8 + (idx * 0.05)}s` }}>
                                        <td className="ps-4 py-3">
                                            <div className="d-flex align-items-center">
                                                <div className="bg-light p-2 rounded-3 me-3 text-muted border border-secondary border-opacity-10">
                                                    <i className="bi bi-hash"></i>
                                                </div>
                                                <div className="fw-bold text-dark font-monospace">REF-{doc.id.substring(0, 8).toUpperCase()}</div>
                                            </div>
                                        </td>
                                        <td className="py-3">
                                            <span className="text-dark small fw-bold">{doc.metadata?.doc_type || 'N/A'}</span>
                                        </td>
                                        <td className="py-3 small fw-bold text-muted">{doc.metadata?.department}</td>
                                        <td className="py-3">
                                            <div className="d-flex align-items-center gap-2">
                                                <div className="bg-light rounded-pill overflow-hidden shadow-inner" style={{ width: '60px', height: '6px' }}>
                                                    <div className="bg-primary h-100 shadow-sm" style={{ width: doc.status === 'Approved' ? '100%' : '50%' }}></div>
                                                </div>
                                                <span className="small opacity-50 fw-bold" style={{ fontSize: '0.65rem' }}>{doc.status === 'Approved' ? 'CRITICAL' : 'ACTIVE'}</span>
                                            </div>
                                        </td>
                                        <td className="py-3">
                                            {getStatusBadge(doc.status)}
                                        </td>
                                        <td className="pe-4 py-3 text-end">
                                            <Button variant="dark" size="sm" className="btn-ledger px-3 py-2 rounded-pill fw-bold shadow-sm d-inline-flex align-items-center" onClick={() => router.push(`/documents/${doc.id}`)}>
                                                <i className="bi bi-eye me-2"></i> View Trail
                                            </Button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={6} className="text-center py-5">
                                        <div className="bg-light rounded-circle d-inline-flex justify-content-center align-items-center mb-4" style={{ width: '100px', height: '100px' }}>
                                            <i className="bi bi-bar-chart-steps fs-1 text-muted opacity-50"></i>
                                        </div>
                                        <h5 className="fw-bolder text-dark mb-2">No Lifecycle Events</h5>
                                        <p className="text-muted small mb-0" style={{ maxWidth: '400px', margin: '0 auto' }}>There are currently no records in the analytics ledger.</p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </Table>
                </div>
            </Card>
        </Container>
    );
};

export default ReportsPage;
