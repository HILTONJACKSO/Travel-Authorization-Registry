'use client';

import React, { useEffect, useState } from 'react';
import { Container, Card, Table, Button, Form, Modal, Row, Col, Badge, Spinner, Alert } from 'react-bootstrap';
import { apiClient } from '@/lib/api-client';
import DashboardHeader from '@/components/DashboardHeader';

interface User {
    id: string;
    email: string;
    role: number | string;
    role_details?: { id: number; name: string };
    ministry?: number | string;
    ministry_details?: { id: number; name: string; code?: string };
    is_active: boolean;
}

interface Role {
    id: number;
    name: string;
}

interface Ministry {
    id: number;
    name: string;
    code?: string;
}

const AdminUsersPage: React.FC = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [roles, setRoles] = useState<Role[]>([]);
    const [ministries, setMinistries] = useState<Ministry[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [email, setEmail] = useState('');
    const [roleId, setRoleId] = useState('');
    const [ministryId, setMinistryId] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [usersRes, rolesRes, ministriesRes] = await Promise.all([
                apiClient.get('/auth/admin/users/'),
                apiClient.get('/auth/admin/roles/'),
                apiClient.get('/auth/admin/ministries/')
            ]);
            setUsers(usersRes.data.results || usersRes.data);
            setRoles(rolesRes.data.results || rolesRes.data);
            setMinistries(ministriesRes.data.results || ministriesRes.data);
            setError('');
        } catch (err: any) {
            console.error('Fetch error:', err);
            setError('Failed to fetch user data. Please ensure you have administrative clearance.');
        } finally {
            setLoading(false);
        }
    };

    const filteredUsers = users.filter(user =>
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (user.role_details?.name && user.role_details.name.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        setError('');
        try {
            const payload = { email, role: roleId, ministry: ministryId || null, ...(password && { password }) };
            if (selectedUser) {
                await apiClient.patch(`/auth/admin/users/${selectedUser.id}/`, payload);
            } else {
                await apiClient.post('/auth/admin/users/', payload);
            }
            setShowModal(false);
            fetchData();
            resetForm();
        } catch (err: any) {
            setError(err.response?.data?.error || 'Failed to save user registry entry.');
        } finally {
            setSubmitting(false);
        }
    };

    const resetForm = () => {
        setSelectedUser(null);
        setEmail('');
        setRoleId('');
        setMinistryId('');
        setPassword('');
    };

    const handleEdit = (user: User) => {
        setSelectedUser(user);
        setEmail(user.email);
        setRoleId(typeof user.role === 'object' ? (user.role as any)?.id?.toString() : user.role?.toString() || '');
        setMinistryId(typeof user.ministry === 'object' ? (user.ministry as any)?.id?.toString() : user.ministry?.toString() || '');
        setShowModal(true);
    };

    if (loading) return (
        <div className="d-flex justify-content-center align-items-center vh-100 bg-white text-ledger">
            <div className="text-center">
                <Spinner animation="border" variant="dark" className="mb-3" />
                <div className="fw-bold text-uppercase small" style={{ letterSpacing: '1px' }}>Accessing User Ledger...</div>
            </div>
        </div>
    );

    return (
        <Container fluid className="py-2 px-xl-4 pb-5 h-full overflow-auto fade-in-up">
            <DashboardHeader
                title="REGISTRY USER MANAGEMENT"
                subtitle="Assign administrative clearances and oversee official position access."
            />

            {/* Command Bar */}
            <div className="d-flex justify-content-between align-items-center mb-4 bg-white p-3 rounded-4 shadow-sm border border-secondary border-opacity-10 fade-in-up" style={{ animationDelay: '0.1s' }}>
                <div className="d-flex gap-3 align-items-center w-50">
                    <div className="position-relative flex-grow-1 hover-translate transition-all">
                        <i className="bi bi-search position-absolute top-50 start-0 translate-middle-y ms-4 text-muted"></i>
                        <Form.Control
                            type="text"
                            placeholder="Search by email or role..."
                            className="ps-5 border-0 bg-light rounded-pill shadow-sm"
                            style={{ height: '48px' }}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <Button variant="light" className="border shadow-sm rounded-circle p-2 hover-translate transition-all d-flex align-items-center justify-content-center" style={{ width: '48px', height: '48px' }}>
                        <i className="bi bi-filter fs-5"></i>
                    </Button>
                </div>
                <Button variant="dark" className="btn-ledger px-4 py-2 rounded-pill shadow-sm hover-translate transition-all" onClick={() => { resetForm(); setShowModal(true); }}>
                    <i className="bi bi-person-plus-fill me-2"></i> Authorized Entry
                </Button>
            </div>

            {error && <Alert variant="danger" className="alert-glass-danger border border-danger border-opacity-50 shadow-sm rounded-4 mb-4 fade-in-up" style={{ animationDelay: '0.15s' }} dismissible onClose={() => setError('')}>
                <i className="bi bi-exclamation-octagon-fill me-2 fs-5"></i> <span className="fw-bold">{error}</span>
            </Alert>}

            {/* User Ledger Card */}
            <Card className="border-0 shadow-sm overflow-hidden bg-white fade-in-up" style={{ borderRadius: '32px', animationDelay: '0.2s' }}>
                <div className="table-responsive">
                    <Table responsive borderless hover className="mb-0 align-middle gov-table">
                        <thead className="bg-light border-bottom">
                            <tr className="text-muted small fw-bolder text-uppercase" style={{ letterSpacing: '1px' }}>
                                <th className="ps-5 py-4 text-dark opacity-75">Identity / Email</th>
                                <th className="py-4 text-dark opacity-75">Designated Role</th>
                                <th className="py-4 text-center text-dark opacity-75">Security Status</th>
                                <th className="pe-5 py-4 text-end text-dark opacity-75">Action Log</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredUsers.map((user, idx) => (
                                <tr key={user.id} className="border-bottom border-light cursor-pointer hover-translate transition-all" onClick={() => handleEdit(user)} style={{ animationDelay: `${0.2 + (idx * 0.05)}s` }}>
                                    <td className="ps-5 py-4">
                                        <div className="d-flex align-items-center gap-3">
                                            <div className="bg-dark bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center fw-bolder text-dark shadow-sm" style={{ width: '44px', height: '44px' }}>
                                                {user.email.substring(0, 1).toUpperCase()}
                                            </div>
                                            <div>
                                                <div className="fw-bolder text-dark fs-6">{user.email}</div>
                                                <div className="text-muted small fw-bold mt-1" style={{ fontSize: '0.75rem', letterSpacing: '0.5px' }}>
                                                    <i className="bi bi-hash text-dark opacity-50"></i>REG-{user.id.toString().padStart(4, '0')}
                                                    {user.ministry_details?.name && <span className="ms-2 border-start border-2 ps-2 border-dark border-opacity-25">{user.ministry_details.name.toUpperCase()}</span>}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="py-4">
                                        <Badge bg="dark" className="bg-opacity-10 text-dark px-3 py-2 rounded-pill small fw-bolder border border-dark border-opacity-25 shadow-sm">
                                            {user.role_details?.name?.toUpperCase() || 'UNAFFILIATED'}
                                        </Badge>
                                    </td>
                                    <td className="py-4 text-center">
                                        {user.is_active ? (
                                            <div className="d-flex align-items-center justify-content-center gap-2 text-success small fw-bolder">
                                                <div className="bg-success rounded-circle shadow-sm" style={{ width: '10px', height: '10px', animation: 'pulse 2s infinite' }}></div>
                                                VERIFIED ACTIVE
                                            </div>
                                        ) : (
                                            <div className="d-flex align-items-center justify-content-center gap-2 text-muted small fw-bolder">
                                                <div className="bg-secondary rounded-circle shadow-sm" style={{ width: '10px', height: '10px' }}></div>
                                                ACCESS SUSPENDED
                                            </div>
                                        )}
                                    </td>
                                    <td className="pe-5 py-4 text-end">
                                        <Button variant="white" className="btn-sm border shadow-sm rounded-circle p-2 hover-translate transition-all d-inline-flex align-items-center justify-content-center" style={{ width: '36px', height: '36px' }} onClick={(e) => { e.stopPropagation(); handleEdit(user); }}>
                                            <i className="bi bi-pencil-square text-dark fs-6"></i>
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                </div>
                {users.length === 0 && !loading && !error && (
                    <div className="text-center py-5 fade-in-up">
                        <i className="bi bi-shield-lock d-block fs-1 text-muted mb-3 opacity-25"></i>
                        <p className="text-muted fw-bold">No administrative users found in the active archive.</p>
                    </div>
                )}
            </Card>

            {/* Create/Edit User Modal */}
            {/* Create/Edit User Modal */}
            <Modal scrollable show={showModal} onHide={() => setShowModal(false)} centered contentClassName="border-0 shadow-lg bg-white" style={{ borderRadius: '24px' }}>
                <Modal.Header closeButton className="bg-light border-bottom border-secondary border-opacity-10 px-4 pt-4 pb-3" style={{ borderTopLeftRadius: '24px', borderTopRightRadius: '24px' }}>
                    <Modal.Title className="fw-bolder text-ledger fs-4 d-flex align-items-center">
                        <div className="bg-ledger bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center me-3" style={{ width: '40px', height: '40px' }}>
                            <i className="bi bi-person-plus-fill fs-5 text-ledger"></i>
                        </div>
                        {selectedUser ? 'Modify Authorized Entry' : 'New Registry Credential'}
                    </Modal.Title>
                </Modal.Header>
                <Form onSubmit={handleSubmit}>
                    <Modal.Body className="bg-white p-4 p-md-5" style={{ maxHeight: '65vh', overflowY: 'auto' }}>
                        <div className="mb-4 text-muted small fw-bold opacity-75">Please provide the official credentials below. All fields are securely encrypted and logged in the immutable archive.</div>
                        
                        <Form.Group className="mb-4 fade-in-up" style={{ animationDelay: '0.1s' }}>
                            <Form.Label className="fw-bold text-dark small text-uppercase mb-2" style={{ letterSpacing: '1px' }}>Official Identity (Email)</Form.Label>
                            <div className="input-group input-group-lg shadow-sm rounded-3 overflow-hidden">
                                <span className="input-group-text bg-light border-end-0 border-secondary border-opacity-25 px-3">
                                    <i className="bi bi-envelope-at-fill text-muted"></i>
                                </span>
                                <Form.Control
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    className="border-start-0 border-secondary border-opacity-25 bg-light fs-6"
                                    placeholder="name@ministry.gov"
                                    style={{ boxShadow: 'none' }}
                                />
                            </div>
                        </Form.Group>

                        <Form.Group className="mb-4 fade-in-up" style={{ animationDelay: '0.2s' }}>
                            <Form.Label className="fw-bold text-dark small text-uppercase mb-2" style={{ letterSpacing: '1px' }}>Assigned Role & Authorization</Form.Label>
                            <div className="input-group input-group-lg shadow-sm rounded-3 overflow-hidden">
                                <span className="input-group-text bg-light border-end-0 border-secondary border-opacity-25 px-3">
                                    <i className="bi bi-shield-lock-fill text-muted"></i>
                                </span>
                                <Form.Select
                                    value={roleId}
                                    onChange={(e) => setRoleId(e.target.value)}
                                    required
                                    className="border-start-0 border-secondary border-opacity-25 bg-light fs-6"
                                    style={{ boxShadow: 'none' }}
                                >
                                    <option value="">Identify authorization level...</option>
                                    {roles.map(role => (
                                        <option key={role.id} value={role.id}>{role.name}</option>
                                    ))}
                                </Form.Select>
                            </div>
                        </Form.Group>

                        <Form.Group className="mb-4 fade-in-up" style={{ animationDelay: '0.3s' }}>
                            <Form.Label className="fw-bold text-dark small text-uppercase mb-2" style={{ letterSpacing: '1px' }}>Affiliated Ministry / Agency</Form.Label>
                            <div className="input-group input-group-lg shadow-sm rounded-3 overflow-hidden">
                                <span className="input-group-text bg-light border-end-0 border-secondary border-opacity-25 px-3">
                                    <i className="bi bi-building-fill text-muted"></i>
                                </span>
                                <Form.Select
                                    value={ministryId}
                                    onChange={(e) => setMinistryId(e.target.value)}
                                    className="border-start-0 border-secondary border-opacity-25 bg-light fs-6"
                                    style={{ boxShadow: 'none' }}
                                >
                                    <option value="">Global / Unaffiliated...</option>
                                    {ministries.map(ministry => (
                                        <option key={ministry.id} value={ministry.id}>{ministry.name}</option>
                                    ))}
                                </Form.Select>
                            </div>
                        </Form.Group>

                        <Form.Group className="mb-2 fade-in-up" style={{ animationDelay: '0.4s' }}>
                            <Form.Label className="fw-bold text-dark small text-uppercase mb-2" style={{ letterSpacing: '1px' }}>{selectedUser ? 'Reset Security Key (Optional)' : 'Initial Security Key'}</Form.Label>
                            <div className="input-group input-group-lg shadow-sm rounded-3 overflow-hidden">
                                <span className="input-group-text bg-light border-end-0 border-secondary border-opacity-25 px-3">
                                    <i className="bi bi-key-fill text-muted"></i>
                                </span>
                                <Form.Control
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required={!selectedUser}
                                    className="border-start-0 border-secondary border-opacity-25 bg-light fs-6"
                                    placeholder="Min. 12 characters"
                                    style={{ boxShadow: 'none' }}
                                />
                            </div>
                        </Form.Group>
                        <Form.Text className="text-muted small d-block mb-3 fw-bold opacity-75 fade-in-up d-flex align-items-center mt-2" style={{ animationDelay: '0.5s' }}>
                            <i className="bi bi-shield-check text-success me-2 fs-6"></i>Security keys must meet Ministry entropy standards.
                        </Form.Text>
                    </Modal.Body>
                    <Modal.Footer className="bg-light border-top border-secondary border-opacity-10 px-4 py-3" style={{ borderBottomLeftRadius: '24px', borderBottomRightRadius: '24px' }}>
                        <Button variant="light" onClick={() => setShowModal(false)} className="fw-bold px-4 py-2 rounded-pill border shadow-sm hover-translate transition-all">
                            Cancel
                        </Button>
                        <Button variant="dark" type="submit" disabled={submitting} className="fw-bold px-4 py-2 rounded-pill shadow-sm btn-ledger d-flex align-items-center hover-translate transition-all">
                            {submitting ? <Spinner size="sm" animation="border" /> : (
                                <><i className="bi bi-check2-circle me-2"></i>{selectedUser ? 'Update Entry' : 'Issue Credential'}</>
                            )}
                        </Button>
                    </Modal.Footer>
                </Form>
            </Modal>
        </Container>
    );
};

export default AdminUsersPage;
