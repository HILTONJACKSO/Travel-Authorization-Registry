'use client';

import React, { useEffect, useState } from 'react';
import { Container, Card, Table, Button, Form, Modal, Spinner, Alert, Badge } from 'react-bootstrap';
import { apiClient } from '@/lib/api-client';
import DashboardHeader from '@/components/DashboardHeader';

interface Role {
    id: number;
    name: string;
    permissions: any;
}

const AdminPositionsPage: React.FC = () => {
    const [roles, setRoles] = useState<Role[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [selectedRole, setSelectedRole] = useState<Role | null>(null);
    const [name, setName] = useState('');
    const [error, setError] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchRoles();
    }, []);

    const fetchRoles = async () => {
        try {
            const res = await apiClient.get('/auth/admin/roles/');
            setRoles(res.data.results || res.data);
            setError('');
        } catch (err: any) {
            console.error('Fetch error:', err);
            setError('Failed to fetch official positions. Please ensure you have administrative clearance.');
        } finally {
            setLoading(false);
        }
    };

    const filteredRoles = roles.filter(role =>
        role.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        setError('');
        try {
            const payload = { name };
            if (selectedRole) {
                await apiClient.patch(`/auth/admin/roles/${selectedRole.id}/`, payload);
            } else {
                await apiClient.post('/auth/admin/roles/', payload);
            }
            setShowModal(false);
            fetchRoles();
            resetForm();
        } catch (err: any) {
            setError(err.response?.data?.error || 'Failed to save position registry entry.');
        } finally {
            setSubmitting(false);
        }
    };

    const resetForm = () => {
        setSelectedRole(null);
        setName('');
    };

    const handleEdit = (role: Role) => {
        setSelectedRole(role);
        setName(role.name);
        setShowModal(true);
    };

    const handleDelete = async (id: number) => {
        if (!window.confirm('Are you sure you want to decommission this position? This may affect active workflows.')) return;
        try {
            await apiClient.delete(`/auth/admin/roles/${id}/`);
            fetchRoles();
        } catch (err: any) {
            setError('Could not decommission position. It may be assigned to active personnel or workflows.');
        }
    };

    if (loading) return (
        <div className="d-flex justify-content-center align-items-center vh-100 bg-white text-ledger">
            <div className="text-center">
                <Spinner animation="border" variant="dark" className="mb-3" />
                <div className="fw-bold text-uppercase small" style={{ letterSpacing: '1px' }}>Accessing Position Ledger...</div>
            </div>
        </div>
    );

    return (
        <Container fluid className="py-2 px-xl-4 pb-5 h-full overflow-auto fade-in-up">
            <DashboardHeader
                title="OFFICIAL POSITION REGISTRY"
                subtitle="Design and decommission formal government roles and clearance tiers."
            />

            {/* Command Bar */}
            <div className="d-flex justify-content-between align-items-center mb-4 bg-white p-3 rounded-4 shadow-sm border border-secondary border-opacity-10 fade-in-up" style={{ animationDelay: '0.1s' }}>
                <div className="d-flex gap-3 align-items-center w-50">
                    <div className="position-relative flex-grow-1 hover-translate transition-all">
                        <i className="bi bi-search position-absolute top-50 start-0 translate-middle-y ms-4 text-muted"></i>
                        <Form.Control
                            type="text"
                            placeholder="Search by position name..."
                            className="ps-5 border-0 bg-light rounded-pill shadow-sm"
                            style={{ height: '48px' }}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>
                <Button variant="dark" className="btn-ledger px-4 py-2 rounded-pill shadow-sm hover-translate transition-all" onClick={() => { resetForm(); setShowModal(true); }}>
                    <i className="bi bi-plus-circle-fill me-2"></i> Create New Position
                </Button>
            </div>

            {error && <Alert variant="danger" className="alert-glass-danger border border-danger border-opacity-50 shadow-sm rounded-4 mb-4 fade-in-up" style={{ animationDelay: '0.15s' }} dismissible onClose={() => setError('')}>
                <i className="bi bi-exclamation-octagon-fill me-2 fs-5"></i> <span className="fw-bold">{error}</span>
            </Alert>}

            {/* Position Ledger Card */}
            <Card className="border-0 shadow-sm overflow-hidden bg-white fade-in-up" style={{ borderRadius: '32px', animationDelay: '0.2s' }}>
                <div className="table-responsive">
                    <Table responsive hover className="mb-0 align-middle gov-table">
                        <thead className="bg-light border-bottom">
                            <tr className="text-muted small fw-bolder text-uppercase" style={{ letterSpacing: '1px' }}>
                                <th className="ps-5 py-4 text-dark opacity-75">Position Name</th>
                                <th className="py-4 text-dark opacity-75">Authorization Level</th>
                                <th className="py-4 text-center text-dark opacity-75">Status</th>
                                <th className="pe-5 py-4 text-end text-dark opacity-75">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredRoles.map((role, idx) => (
                                <tr key={role.id} className="border-bottom border-light hover-translate transition-all" style={{ animationDelay: `${0.2 + (idx * 0.05)}s` }}>
                                    <td className="ps-5 py-4">
                                        <div className="d-flex align-items-center gap-3">
                                            <div className="bg-primary bg-opacity-10 rounded-3 d-flex align-items-center justify-content-center fw-bolder text-primary shadow-sm" style={{ width: '44px', height: '44px' }}>
                                                <i className="bi bi-person-badge fs-5"></i>
                                            </div>
                                            <div>
                                                <div className="fw-bolder text-dark fs-6">{role.name}</div>
                                                <div className="text-muted small fw-bold mt-1" style={{ fontSize: '0.75rem', letterSpacing: '0.5px' }}>
                                                    <i className="bi bi-hash text-dark opacity-50"></i>POS-{role.id.toString().padStart(3, '0')}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="py-4">
                                        <Badge bg="dark" className="bg-opacity-10 text-dark px-3 py-2 rounded-pill small fw-bolder border border-dark border-opacity-25 shadow-sm">
                                            {role.name === 'Admin' ? 'SYSTEM OVERRIDE' : 'REGULATED WORKFLOW'}
                                        </Badge>
                                    </td>
                                    <td className="py-4 text-center">
                                        <div className="d-flex align-items-center justify-content-center gap-2 text-success small fw-bolder">
                                            <div className="bg-success rounded-circle shadow-sm" style={{ width: '10px', height: '10px', animation: 'pulse 2s infinite' }}></div>
                                            ACTIVE IN LEDGER
                                        </div>
                                    </td>
                                    <td className="pe-5 py-4 text-end">
                                        <div className="d-flex justify-content-end gap-2">
                                            <Button variant="white" className="btn-sm border shadow-sm rounded-circle p-2 hover-translate transition-all d-inline-flex align-items-center justify-content-center" style={{ width: '36px', height: '36px' }} onClick={() => handleEdit(role)}>
                                                <i className="bi bi-pencil text-dark fs-6"></i>
                                            </Button>
                                            <Button variant="white" className="btn-sm border shadow-sm rounded-circle p-2 hover-translate transition-all d-inline-flex align-items-center justify-content-center" style={{ width: '36px', height: '36px' }} onClick={() => handleDelete(role.id)} disabled={role.name === 'Admin'}>
                                                <i className={`bi bi-trash fs-6 ${role.name === 'Admin' ? 'text-muted opacity-50' : 'text-danger'}`}></i>
                                            </Button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                </div>
            </Card>

            {/* Create/Edit Position Modal */}
            <Modal scrollable show={showModal} onHide={() => setShowModal(false)} centered contentClassName="border-0 shadow-lg bg-white" style={{ borderRadius: '24px' }}>
                <Modal.Header closeButton className="bg-light border-bottom border-secondary border-opacity-10 px-4 pt-4 pb-3" style={{ borderTopLeftRadius: '24px', borderTopRightRadius: '24px' }}>
                    <Modal.Title className="fw-bolder text-ledger fs-4 d-flex align-items-center">
                        <div className="bg-ledger bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center me-3" style={{ width: '40px', height: '40px' }}>
                            <i className="bi bi-bookmark-star-fill fs-5 text-ledger"></i>
                        </div>
                        {selectedRole ? 'Modify Official Position' : 'New Position Registry'}
                    </Modal.Title>
                </Modal.Header>
                <Form onSubmit={handleSubmit}>
                    <Modal.Body className="bg-white p-4 p-md-5" style={{ maxHeight: '65vh', overflowY: 'auto' }}>
                        <div className="mb-4 text-muted small fw-bold opacity-75">Please define the official position parameters below. Titles will be bound to authorization nodes.</div>
                        <Form.Group className="mb-4 fade-in-up" style={{ animationDelay: '0.1s' }}>
                            <Form.Label className="fw-bold text-dark small text-uppercase mb-2" style={{ letterSpacing: '1px' }}>Position Name / Title</Form.Label>
                            <div className="input-group input-group-lg shadow-sm rounded-3 overflow-hidden">
                                <span className="input-group-text bg-light border-end-0 border-secondary border-opacity-25 px-3">
                                    <i className="bi bi-person-badge-fill text-muted"></i>
                                </span>
                                <Form.Control
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    required
                                    className="border-start-0 border-secondary border-opacity-25 bg-light fs-6"
                                    placeholder="e.g. Chief Financial Officer"
                                    style={{ boxShadow: 'none' }}
                                />
                            </div>
                            <Form.Text className="text-muted small d-block fw-bold opacity-75 fade-in-up d-flex align-items-center mt-3" style={{ animationDelay: '0.2s' }}>
                                <i className="bi bi-info-circle-fill text-primary me-2 fs-6"></i>This name will be displayed in approval sequences and identity markers.
                            </Form.Text>
                        </Form.Group>
                    </Modal.Body>
                    <Modal.Footer className="bg-light border-top border-secondary border-opacity-10 px-4 py-3" style={{ borderBottomLeftRadius: '24px', borderBottomRightRadius: '24px' }}>
                        <Button variant="light" onClick={() => setShowModal(false)} className="fw-bold px-4 py-2 rounded-pill border shadow-sm hover-translate transition-all">Cancel</Button>
                        <Button variant="dark" type="submit" disabled={submitting} className="fw-bold px-4 py-2 rounded-pill shadow-sm btn-ledger d-flex align-items-center hover-translate transition-all">
                            {submitting ? <Spinner size="sm" animation="border" /> : (
                                <><i className="bi bi-check2-circle me-2"></i>{selectedRole ? 'Commence Update' : 'Finalize Registry'}</>
                            )}
                        </Button>
                    </Modal.Footer>
                </Form>
            </Modal>
        </Container>
    );
};

export default AdminPositionsPage;
