'use client';

import React, { useState, useEffect } from 'react';
import { Container, Table, Badge, Card, Spinner, Row, Col } from 'react-bootstrap';
import { apiClient } from '@/lib/api-client';
import { useNotification } from '@/context/NotificationContext';
import Link from 'next/link';

interface TravelRecord {
    id: string;
    title: string;
    status: string;
    created_at: string;
    metadata: {
        destination: string;
        start_date: string;
        end_date: string;
        purpose: string;
        priority: string;
        department: string;
    };
}

const TravelHistoryPage: React.FC = () => {
    const [records, setRecords] = useState<TravelRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const { showNotification } = useNotification();

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const res = await apiClient.get('/documents/travel_history/');
                setRecords(res.data);
            } catch (err) {
                console.error('Failed to fetch travel history', err);
                showNotification('Ledger Access Error', 'The system was unable to retrieve your official travel records.', 'error');
            } finally {
                setLoading(false);
            }
        };
        fetchHistory();
    }, [showNotification]);

    const getPriorityBadge = (priority: string) => {
        switch (priority) {
            case 'Urgent': return <Badge bg="danger" className="bg-opacity-10 text-danger border border-danger border-opacity-25 rounded-pill px-3 py-2 status-badge">Urgent</Badge>;
            case 'Medium': return <Badge bg="warning" className="bg-opacity-10 text-warning border border-warning border-opacity-50 rounded-pill px-3 py-2 status-badge" style={{ color: '#d97706' }}>Standard</Badge>;
            default: return <Badge bg="success" className="bg-opacity-10 text-success border border-success border-opacity-25 rounded-pill px-3 py-2 status-badge">Low</Badge>;
        }
    };

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    return (
        <Container fluid className="px-4 py-3 h-full pb-5">
            <div className="mb-5 mt-2 fade-in-up">
                <div className="d-flex align-items-center gap-2 mb-3 breadcrumb-gov">
                    <span className="opacity-50">Personnel</span>
                    <i className="bi bi-chevron-right small opacity-25"></i>
                    <span className="opacity-50">Records</span>
                    <i className="bi bi-chevron-right small opacity-25"></i>
                    <span className="active">Travel History</span>
                </div>
                <div className="d-flex justify-content-between align-items-end mb-1">
                    <div>
                        <h1 className="fw-bold text-ledger mb-1" style={{ fontSize: '2.4rem' }}>Official Travel Ledger</h1>
                        <p className="text-muted fs-5 opacity-75">
                            Authoritative historical record of all approved diplomatic and administrative missions.
                        </p>
                    </div>
                    <div className="text-end d-none d-md-block">
                        <div className="text-uppercase small fw-bold text-muted mb-1" style={{ letterSpacing: '1px' }}>Total Records</div>
                        <div className="fs-2 fw-bold text-ledger">{records.length}</div>
                    </div>
                </div>
            </div>

            {loading ? (
                <div className="d-flex flex-column align-items-center justify-content-center py-5 fade-in-up" style={{ animationDelay: '0.1s' }}>
                    <Spinner animation="border" variant="dark" className="mb-4" style={{ width: '3rem', height: '3rem', opacity: 0.5 }} />
                    <p className="text-muted fw-bold text-uppercase" style={{ letterSpacing: '2px' }}>Accessing Secure Archives...</p>
                </div>
            ) : records.length === 0 ? (
                <Card className="border-0 shadow-sm rounded-4 p-5 text-center bg-white fade-in-up" style={{ animationDelay: '0.2s', minHeight: '400px', display: 'flex', justifyContent: 'center' }}>
                    <div className="bg-light rounded-circle d-inline-flex align-items-center justify-content-center mx-auto mb-4 border" style={{ width: '100px', height: '100px' }}>
                        <i className="bi bi-airplane text-ledger fs-1 opacity-50"></i>
                    </div>
                    <h3 className="fw-bolder text-ledger mb-3">No Historical Records Found</h3>
                    <p className="text-muted mx-auto mb-5 opacity-75 fs-5" style={{ maxWidth: '500px' }}>
                        You currently have no approved travel authorizations registered in the official ledger.
                    </p>
                    <div>
                        <Link href="/documents/upload?type=travel">
                            <button className="btn btn-ledger px-5 py-3 rounded-pill fw-bold shadow-sm hover-translate d-inline-flex align-items-center">
                                <i className="bi bi-plus-circle-fill me-2 fs-5"></i>
                                Submit New Mission Request
                            </button>
                        </Link>
                    </div>
                </Card>
            ) : (
                <Card className="border-0 shadow-sm rounded-4 overflow-hidden bg-white fade-in-up" style={{ animationDelay: '0.2s' }}>
                    <div className="table-responsive">
                        <Table responsive hover className="gov-table align-middle mb-0">
                            <thead>
                                <tr>
                                    <th className="ps-4 py-3 text-uppercase small fw-bold text-muted" style={{ letterSpacing: '1px' }}>Mission / Destination</th>
                                    <th className="py-3 text-uppercase small fw-bold text-muted" style={{ letterSpacing: '1px' }}>Duration</th>
                                    <th className="py-3 text-uppercase small fw-bold text-muted" style={{ letterSpacing: '1px' }}>Objective</th>
                                    <th className="py-3 text-uppercase small fw-bold text-muted" style={{ letterSpacing: '1px' }}>Priority</th>
                                    <th className="pe-4 py-3 text-end text-uppercase small fw-bold text-muted" style={{ letterSpacing: '1px' }}>Record</th>
                                </tr>
                            </thead>
                            <tbody>
                                {records.map((record) => (
                                    <tr key={record.id} className="hover-translate cursor-pointer transition-all" style={{ transformOrigin: 'left' }}>
                                        <td className="ps-4">
                                            <div className="d-flex align-items-center py-2">
                                                <div className="bg-light text-dark rounded-circle p-2 me-3 d-flex align-items-center justify-content-center border shadow-sm" style={{ width: '48px', height: '48px' }}>
                                                    <i className="bi bi-geo-alt-fill fs-5 opacity-75"></i>
                                                </div>
                                                <div>
                                                    <div className="fw-bolder text-ledger mb-1 fs-6">{record.metadata.destination}</div>
                                                    <div className="text-muted small fw-bold opacity-75">{record.title}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            <div className="fw-bolder text-dark mb-1">
                                                <i className="bi bi-calendar-event me-2 opacity-50"></i>
                                                {formatDate(record.metadata.start_date)}
                                            </div>
                                            <div className="text-muted small fw-bold opacity-75 ms-4">
                                                to {formatDate(record.metadata.end_date)}
                                            </div>
                                        </td>
                                        <td style={{ maxWidth: '300px' }}>
                                            <div className="text-muted small text-truncate fw-bold opacity-75" title={record.metadata.purpose}>
                                                {record.metadata.purpose}
                                            </div>
                                        </td>
                                        <td>{getPriorityBadge(record.metadata.priority)}</td>
                                        <td className="pe-4 text-end">
                                            <Link href={`/documents/${record.id}`} className="btn btn-light btn-sm rounded-pill px-4 py-2 fw-bold border text-ledger shadow-sm hover-bg-white transition-all">
                                                View Auth
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </Table>
                    </div>
                </Card>
            )}

            <div className="mt-5 p-4 p-xl-5 bg-dark text-white border-0 rounded-4 shadow-sm position-relative overflow-hidden fade-in-up" style={{ animationDelay: '0.3s' }}>
                {/* Background Pattern */}
                <i className="bi bi-shield-lock position-absolute" style={{ fontSize: '15rem', right: '-20px', top: '-40px', opacity: 0.05, zIndex: 0 }}></i>
                
                <Row className="align-items-center position-relative z-1">
                    <Col md={1} className="text-center text-md-start mb-4 mb-md-0">
                        <div className="bg-white bg-opacity-10 text-white rounded-circle d-inline-flex align-items-center justify-content-center border border-white border-opacity-25" style={{ width: '56px', height: '56px' }}>
                            <i className="bi bi-shield-check fs-3 m-0"></i>
                        </div>
                    </Col>
                    <Col md={8}>
                        <h5 className="fw-bolder mb-2 text-white" style={{ letterSpacing: '0.5px' }}>Duplication Ledger Integrity</h5>
                        <p className="small mb-0 opacity-75 fw-light" style={{ maxWidth: '90%' }}>
                            The system automatically cross-references all mission requests against the historical ledger to prevent redundant
                            official expenditures and personnel logistical conflicts. Overlapping missions are explicitly blocked by <strong className="text-white">Protocol 12-B</strong>.
                        </p>
                    </Col>
                    <Col md={3} className="text-md-end text-center mt-4 mt-md-0">
                        <Badge bg="success" className="bg-opacity-10 text-success border border-success border-opacity-25 px-4 py-2 rounded-pill fs-6 shadow-sm">
                            <i className="bi bi-check-circle-fill me-2"></i>
                            Protocol Active
                        </Badge>
                    </Col>
                </Row>
            </div>
        </Container>
    );
};

export default TravelHistoryPage;
