'use client';

import React, { useEffect, useState } from 'react';
import { Container, Card, Table, Button, Form, Modal, Spinner, Alert, Badge } from 'react-bootstrap';
import { apiClient } from '@/lib/api-client';
import DashboardHeader from '@/components/DashboardHeader';
import { useRouter } from 'next/navigation';

interface Ministry {
    id: number;
    name: string;
    code: string;
    personnel_count: number;
}

const AdminMinistriesPage: React.FC = () => {
    const [ministries, setMinistries] = useState<Ministry[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [selectedMinistry, setSelectedMinistry] = useState<Ministry | null>(null);
    const [name, setName] = useState('');
    const [code, setCode] = useState('');
    const [error, setError] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const router = useRouter();

    useEffect(() => {
        fetchMinistries();
    }, []);

    const fetchMinistries = async () => {
        try {
            const response = await apiClient.get('/auth/admin/ministries/');
            setMinistries(response.data.results || response.data);
            setError('');
        } catch (err: any) {
            console.error('Fetch error:', err);
            setError('Failed to fetch agency data. Administrative clearance is required.');
        } finally {
            setLoading(false);
        }
    };

    const filteredMinistries = ministries.filter(m =>
        m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (m.code && m.code.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        setError('');
        try {
            const payload = { name, code: code || null };
            if (selectedMinistry) {
                await apiClient.patch(`/auth/admin/ministries/${selectedMinistry.id}/`, payload);
            } else {
                await apiClient.post('/auth/admin/ministries/', payload);
            }
            setShowModal(false);
            fetchMinistries();
            resetForm();
        } catch (err: any) {
            setError(err.response?.data?.name?.[0] || err.response?.data?.error || 'Failed to save agency record.');
        } finally {
            setSubmitting(false);
        }
    };

    const resetForm = () => {
        setSelectedMinistry(null);
        setName('');
        setCode('');
    };

    const handleEdit = (ministry: Ministry) => {
        setSelectedMinistry(ministry);
        setName(ministry.name);
        setCode(ministry.code || '');
        setShowModal(true);
    };

    const handleDelete = async (id: number) => {
        if (!window.confirm('Are you sure you want to decommission this Agency? This action is registered in the audit trail.')) return;
        try {
            await apiClient.delete(`/auth/admin/ministries/${id}/`);
            fetchMinistries();
        } catch (err: any) {
            setError('Cannot delete agency with active personnel or insufficient clearance.');
        }
    };

    if (loading) return (
        <div className="d-flex justify-content-center align-items-center vh-100 bg-white text-ledger">
            <div className="text-center">
                <Spinner animation="border" variant="dark" className="mb-3" />
                <div className="fw-bold text-uppercase small" style={{ letterSpacing: '1px' }}>Accessing Agency Ledger...</div>
            </div>
        </div>
    );

    return (
        <Container fluid className="py-2 px-xl-4 pb-5 h-full overflow-auto fade-in-up">
            <DashboardHeader
                title="FEDERATED AGENCY MANAGEMENT"
                subtitle="Oversee the government's organizational structure and departmental codes."
            />

            {/* Command Bar */}
            <div className="d-flex justify-content-between align-items-center mb-4 bg-white p-3 rounded-4 shadow-sm border border-secondary border-opacity-10 fade-in-up" style={{ animationDelay: '0.1s' }}>
                <div className="d-flex gap-3 align-items-center w-50">
                    <div className="position-relative flex-grow-1 hover-translate transition-all">
                        <i className="bi bi-search position-absolute top-50 start-0 translate-middle-y ms-4 text-muted"></i>
                        <Form.Control
                            type="text"
                            placeholder="Search by name or code..."
                            className="ps-5 border-0 bg-light rounded-pill shadow-sm"
                            style={{ height: '48px' }}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>
                <Button variant="dark" className="btn-ledger px-4 py-2 rounded-pill shadow-sm hover-translate transition-all" onClick={() => { resetForm(); setShowModal(true); }}>
                    <i className="bi bi-building-add me-2"></i> Register New Agency
                </Button>
            </div>

            {error && <Alert variant="danger" className="alert-glass-danger border border-danger border-opacity-50 shadow-sm rounded-4 mb-4 fade-in-up" style={{ animationDelay: '0.15s' }} dismissible onClose={() => setError('')}>
                <i className="bi bi-exclamation-octagon-fill me-2 fs-5"></i> <span className="fw-bold">{error}</span>
            </Alert>}

            <Card className="border-0 shadow-sm overflow-hidden bg-white fade-in-up" style={{ borderRadius: '32px', animationDelay: '0.2s' }}>
                <div className="table-responsive">
                    <Table responsive borderless hover className="mb-0 align-middle gov-table">
                        <thead className="bg-light border-bottom">
                            <tr className="text-muted small fw-bolder text-uppercase" style={{ letterSpacing: '1px' }}>
                                <th className="ps-5 py-4 text-dark opacity-75">Agency / Ministry Name</th>
                                <th className="py-4 text-dark opacity-75">Official Code</th>
                                <th className="py-4 text-center text-dark opacity-75">Active Personnel</th>
                                <th className="pe-5 py-4 text-end text-dark opacity-75">Management</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredMinistries.map((m, idx) => (
                                <tr key={m.id} className="border-bottom border-light hover-translate transition-all" style={{ animationDelay: `${0.2 + (idx * 0.05)}s` }}>
                                    <td className="ps-5 py-4">
                                        <div className="d-flex align-items-center gap-3">
                                            <div className="bg-dark bg-opacity-10 rounded-3 d-flex align-items-center justify-content-center fw-bolder text-dark shadow-sm" style={{ width: '44px', height: '44px' }}>
                                                <i className="bi bi-bank fs-5"></i>
                                            </div>
                                            <div>
                                                <div className="fw-bolder text-dark fs-6">{m.name}</div>
                                                <div className="text-muted small fw-bold mt-1" style={{ fontSize: '0.75rem', letterSpacing: '0.5px' }}>
                                                    <i className="bi bi-hash text-dark opacity-50"></i>AGCY-{m.id.toString().padStart(3, '0')}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="py-4">
                                        <Badge bg="dark" className="bg-opacity-10 text-dark px-3 py-2 rounded-pill small fw-bolder border border-dark border-opacity-25 shadow-sm">
                                            {m.code || 'UNASSIGNED'}
                                        </Badge>
                                    </td>
                                    <td className="py-4 text-center">
                                        <div className="fw-bolder text-dark fs-5">{m.personnel_count}</div>
                                        <div className="text-muted extra-small fw-bold opacity-75">Registered Staff</div>
                                    </td>
                                    <td className="pe-5 py-4 text-end">
                                        <div className="d-flex justify-content-end gap-2">
                                            <Button variant="white" className="btn-sm border shadow-sm rounded-circle p-2 hover-translate transition-all d-inline-flex align-items-center justify-content-center" style={{ width: '36px', height: '36px' }} onClick={() => handleEdit(m)}>
                                                <i className="bi bi-pencil text-dark fs-6"></i>
                                            </Button>
                                            <Button variant="white" className="btn-sm border shadow-sm rounded-circle p-2 hover-translate transition-all d-inline-flex align-items-center justify-content-center" style={{ width: '36px', height: '36px' }} onClick={() => handleDelete(m.id)}>
                                                <i className="bi bi-trash fs-6 text-danger"></i>
                                            </Button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                </div>
                {ministries.length === 0 && !loading && !error && (
                    <div className="text-center py-5 fade-in-up">
                        <i className="bi bi-building d-block fs-1 text-muted mb-3 opacity-25"></i>
                        <p className="text-muted fw-bold">No federated agencies have been registered in the system.</p>
                    </div>
                )}
            </Card>

            {/* Create/Edit Ministry Modal */}
            {/* Create/Edit Ministry Modal */}
            <Modal scrollable show={showModal} onHide={() => setShowModal(false)} centered contentClassName="border-0 shadow-lg bg-white" style={{ borderRadius: '24px' }}>
                <Modal.Header closeButton className="bg-light border-bottom border-secondary border-opacity-10 px-4 pt-4 pb-3" style={{ borderTopLeftRadius: '24px', borderTopRightRadius: '24px' }}>
                    <Modal.Title className="fw-bolder text-ledger fs-4 d-flex align-items-center">
                        <div className="bg-ledger bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center me-3" style={{ width: '40px', height: '40px' }}>
                            <i className="bi bi-bank-fill fs-5 text-ledger"></i>
                        </div>
                        {selectedMinistry ? 'Modify Agency Profile' : 'New Agency Registration'}
                    </Modal.Title>
                </Modal.Header>
                <Form onSubmit={handleSubmit}>
                    <Modal.Body className="bg-white p-4 p-md-5" style={{ maxHeight: '65vh', overflowY: 'auto' }}>
                        <div className="mb-4 text-muted small fw-bold opacity-75">Please define the official federated agency below. This registers a new organizational domain in the archive.</div>
                        <Form.Group className="mb-4 fade-in-up" style={{ animationDelay: '0.1s' }}>
                            <Form.Label className="fw-bold text-dark small text-uppercase mb-2" style={{ letterSpacing: '1px' }}>Official Agency Name</Form.Label>
                            <div className="input-group input-group-lg shadow-sm rounded-3 overflow-hidden">
                                <span className="input-group-text bg-light border-end-0 border-secondary border-opacity-25 px-3">
                                    <i className="bi bi-building-fill text-muted"></i>
                                </span>
                                <Form.Control
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    required
                                    className="border-start-0 border-secondary border-opacity-25 bg-light fs-6"
                                    placeholder="e.g. Ministry of Foreign Affairs"
                                    style={{ boxShadow: 'none' }}
                                />
                            </div>
                        </Form.Group>

                        <Form.Group className="mb-2 fade-in-up" style={{ animationDelay: '0.2s' }}>
                            <Form.Label className="fw-bold text-dark small text-uppercase mb-2" style={{ letterSpacing: '1px' }}>Administrative Code (Optional)</Form.Label>
                            <div className="input-group input-group-lg shadow-sm rounded-3 overflow-hidden">
                                <span className="input-group-text bg-light border-end-0 border-secondary border-opacity-25 px-3">
                                    <i className="bi bi-upc-scan text-muted"></i>
                                </span>
                                <Form.Control
                                    type="text"
                                    value={code}
                                    onChange={(e) => setCode(e.target.value)}
                                    className="border-start-0 border-secondary border-opacity-25 bg-light fs-6"
                                    placeholder="e.g. MOFA-01"
                                    style={{ boxShadow: 'none' }}
                                />
                            </div>
                        </Form.Group>
                        <Form.Text className="text-muted small d-block mb-3 fw-bold opacity-75 fade-in-up d-flex align-items-center mt-3" style={{ animationDelay: '0.3s' }}>
                            <i className="bi bi-signpost-split-fill text-primary me-2 fs-6"></i>Codes are used for inter-departmental document routing.
                        </Form.Text>
                    </Modal.Body>
                    <Modal.Footer className="bg-light border-top border-secondary border-opacity-10 px-4 py-3" style={{ borderBottomLeftRadius: '24px', borderBottomRightRadius: '24px' }}>
                        <Button variant="light" onClick={() => setShowModal(false)} className="fw-bold px-4 py-2 rounded-pill border shadow-sm hover-translate transition-all">Cancel</Button>
                        <Button variant="dark" type="submit" disabled={submitting} className="fw-bold px-4 py-2 rounded-pill shadow-sm btn-ledger d-flex align-items-center hover-translate transition-all">
                            {submitting ? <Spinner size="sm" animation="border" /> : (
                                <><i className="bi bi-check2-circle me-2"></i>{selectedMinistry ? 'Commit Changes' : 'Finalize Registration'}</>
                            )}
                        </Button>
                    </Modal.Footer>
                </Form>
            </Modal>
        </Container>
    );
};

export default AdminMinistriesPage;
