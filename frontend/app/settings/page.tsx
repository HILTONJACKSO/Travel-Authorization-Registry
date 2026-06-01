'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Container, Row, Col, Card, Nav, Form, Button, Badge, Spinner, Table } from 'react-bootstrap';
import { useAuth } from '@/context/AuthContext';
import { useNotification } from '@/context/NotificationContext';
import { apiClient } from '@/lib/api-client';

const SettingsPage: React.FC = () => {
    const { user, updateUser } = useAuth();
    const { showNotification } = useNotification();
    const [activeTab, setActiveTab] = useState('profile');
    const [uploading, setUploading] = useState(false);
    const [saving, setSaving] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Form States
    const [fullName, setFullName] = useState('');
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    useEffect(() => {
        if (user) {
            setFullName(`${user.first_name || ''} ${user.last_name || ''}`.trim());
        }
    }, [user]);

    const handleUploadClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);
        const formData = new FormData();
        formData.append('profile_picture', file);

        try {
            const response = await apiClient.patch('/auth/admin/users/me/', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            updateUser({ profile_picture: response.data.profile_picture });
            showNotification('Profile Photo Updated', 'Your official registry photo has been successfully synchronized.', 'success');
        } catch (err) {
            console.error('Upload failed:', err);
            showNotification('Upload Error', 'The system was unable to synchronize the selected file. Please verify file integrity.', 'error');
        } finally {
            setUploading(false);
        }
    };

    const handleSaveProfile = async (e: React.FormEvent) => {
        e.preventDefault();

        if (newPassword && newPassword !== confirmPassword) {
            showNotification('Password Mismatch', 'The provided security credentials do not match. Please re-verify the input.', 'error');
            return;
        }

        setSaving(true);
        const [first_name, ...last_name_parts] = fullName.split(' ');
        const last_name = last_name_parts.join(' ');

        const payload: any = { first_name, last_name };
        if (newPassword) {
            payload.password = newPassword;
        }

        try {
            const response = await apiClient.patch('/auth/admin/users/me/', payload);
            updateUser({
                first_name: response.data.first_name,
                last_name: response.data.last_name
            });
            showNotification('Registry Entry Updated', 'Your official credentials and account profile have been successfully updated.', 'success');
            // Clear passwords
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
        } catch (err) {
            console.error('Update failed:', err);
            showNotification('Update Failed', 'The system encountered an error while attempting to commit profile changes.', 'error');
        } finally {
            setSaving(false);
        }
    };

    const handleDiscard = () => {
        if (user) {
            setFullName(`${user.first_name || ''} ${user.last_name || ''}`.trim());
        }
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
    };

    return (
        <Container fluid className="py-2 px-xl-4 pb-5 h-full overflow-auto">
            {/* Top Header */}
            <div className="d-flex justify-content-between align-items-center mb-5 pb-3 border-bottom border-secondary border-opacity-10 fade-in-up">
                <div className="d-flex align-items-center">
                    <h1 className="fw-bolder text-ledger mb-0" style={{ fontSize: '1.8rem', letterSpacing: '-0.5px' }}>
                        REGISTRY SYSTEM SETTINGS
                    </h1>
                </div>
                <div className="d-flex align-items-center gap-4 text-muted">
                    <i className="bi bi-search cursor-pointer hover-translate transition-all fs-5"></i>
                    <i className="bi bi-bell cursor-pointer hover-translate transition-all fs-5"></i>
                    <div className="rounded-circle overflow-hidden bg-secondary border border-2 border-white shadow-sm hover-translate transition-all cursor-pointer" style={{ width: '36px', height: '36px' }}>
                        {user?.profile_picture ? (
                            <img
                                src={user.profile_picture.startsWith('http') ? user.profile_picture : `http://localhost:8000${user.profile_picture}`}
                                alt="Profile"
                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            />
                        ) : (
                            <i className="bi bi-person-fill text-white d-flex justify-content-center align-items-center h-100 fs-5"></i>
                        )}
                    </div>
                </div>
            </div>

            <Row className="g-4">
                {/* Left Mini-Nav */}
                <Col lg={3}>
                    <Card className="border-0 shadow-sm p-3 bg-white fade-in-up" style={{ borderRadius: '24px', animationDelay: '0.1s' }}>
                        <Nav variant="pills" className="flex-column gap-2 settings-nav">
                            <Nav.Item>
                                <Nav.Link
                                    active={activeTab === 'profile'}
                                    onClick={() => setActiveTab('profile')}
                                    className={`rounded-3 px-4 py-3 fw-bold d-flex align-items-center gap-3 transition-all hover-translate cursor-pointer ${activeTab === 'profile' ? 'bg-primary bg-opacity-10 text-primary shadow-sm' : 'text-muted hover-bg-light'}`}
                                >
                                    <i className="bi bi-person-badge fs-5"></i> User Profile
                                </Nav.Link>
                            </Nav.Item>
                            <Nav.Item>
                                <Nav.Link
                                    active={activeTab === 'security'}
                                    onClick={() => setActiveTab('security')}
                                    className={`rounded-3 px-4 py-3 fw-bold d-flex align-items-center gap-3 transition-all hover-translate cursor-pointer ${activeTab === 'security' ? 'bg-primary bg-opacity-10 text-primary shadow-sm' : 'text-muted hover-bg-light'}`}
                                >
                                    <i className="bi bi-shield-lock fs-5"></i> Security & Access
                                </Nav.Link>
                            </Nav.Item>
                            <Nav.Item>
                                <Nav.Link
                                    active={activeTab === 'preferences'}
                                    onClick={() => setActiveTab('preferences')}
                                    className={`rounded-3 px-4 py-3 fw-bold d-flex align-items-center gap-3 transition-all hover-translate cursor-pointer ${activeTab === 'preferences' ? 'bg-primary bg-opacity-10 text-primary shadow-sm' : 'text-muted hover-bg-light'}`}
                                >
                                    <i className="bi bi-sliders fs-5"></i> Preferences
                                </Nav.Link>
                            </Nav.Item>
                            <Nav.Item>
                                <Nav.Link
                                    active={activeTab === 'delegations'}
                                    onClick={() => setActiveTab('delegations')}
                                    className={`rounded-3 px-4 py-3 fw-bold d-flex align-items-center gap-3 transition-all hover-translate cursor-pointer ${activeTab === 'delegations' ? 'bg-warning bg-opacity-10 text-warning shadow-sm' : 'text-muted hover-bg-light'}`}
                                >
                                    <i className="bi bi-diagram-3 fs-5"></i> Delegations
                                </Nav.Link>
                            </Nav.Item>
                        </Nav>
                    </Card>
                </Col>

                {/* Right Content Area */}
                <Col lg={9}>
                    {activeTab === 'profile' && (
                        <Card className="border-0 shadow-sm p-4 p-xl-5 bg-white fade-in-up" style={{ borderRadius: '32px', animationDelay: '0.2s' }}>
                            <div className="mb-5">
                                <h4 className="fw-bolder text-ledger mb-1 fs-3">User Profile</h4>
                                <p className="text-muted small fw-bold opacity-75">Manage your identity and official registry credentials</p>
                            </div>

                            <div className="d-flex align-items-center gap-4 mb-5 pb-5 border-bottom border-secondary border-opacity-10">
                                <div
                                    className="rounded-circle overflow-hidden bg-secondary d-flex justify-content-center align-items-center position-relative hover-translate transition-all shadow-sm"
                                    style={{ width: '100px', height: '100px', border: '3px solid #fff' }}
                                >
                                    {user?.profile_picture ? (
                                        <img
                                            src={user.profile_picture.startsWith('http') ? user.profile_picture : `http://localhost:8000${user.profile_picture}`}
                                            alt="Profile"
                                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                        />
                                    ) : (
                                        <i className="bi bi-person-fill text-white" style={{ fontSize: '3rem' }}></i>
                                    )}
                                    {uploading && (
                                        <div className="position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center bg-dark bg-opacity-50">
                                            <Spinner animation="border" variant="light" size="sm" />
                                        </div>
                                    )}
                                </div>
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    style={{ display: 'none' }}
                                    accept="image/*"
                                    onChange={handleFileChange}
                                />
                                <div>
                                    <h3 className="fw-bolder mb-1 text-dark">
                                        {user?.first_name || user?.last_name
                                            ? `${user.first_name || ''} ${user.last_name || ''}`.trim()
                                            : user?.email.split('@')[0].replace('.', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                    </h3>
                                    <div className="text-muted mb-3 fw-bold opacity-75">{user?.email}</div>
                                    <Badge bg="dark" className="bg-opacity-10 text-dark px-3 py-2 rounded-pill text-uppercase fw-bold shadow-sm border border-secondary border-opacity-25" style={{ fontSize: '0.75rem', letterSpacing: '0.5px' }}>
                                        <i className="bi bi-shield-fill-check me-2 text-success"></i>
                                        {user?.role || 'AUTHORIZED USER'}
                                    </Badge>
                                </div>
                                <Button
                                    variant="light"
                                    className="ms-auto rounded-pill px-4 py-2 fw-bold shadow-sm border hover-translate transition-all"
                                    onClick={handleUploadClick}
                                    disabled={uploading}
                                >
                                    <i className="bi bi-cloud-upload me-2"></i>
                                    {uploading ? 'Processing...' : 'Update Photo'}
                                </Button>
                            </div>

                            <Form>
                                <Row className="g-4 mb-4">
                                    <Col md={6}>
                                        <Form.Group>
                                            <Form.Label className="form-label-gov">Full Name (Legal)</Form.Label>
                                            <Form.Control
                                                type="text"
                                                className="form-control-gov shadow-sm"
                                                value={fullName}
                                                onChange={(e) => setFullName(e.target.value)}
                                                placeholder="e.g. John Doe"
                                            />
                                        </Form.Group>
                                    </Col>
                                    <Col md={6}>
                                        <Form.Group>
                                            <Form.Label className="form-label-gov">Email Address (Official)</Form.Label>
                                            <Form.Control type="email" className="form-control-gov shadow-sm bg-light text-muted" defaultValue={user?.email} disabled />
                                        </Form.Group>
                                    </Col>
                                </Row>

                                <div className="mt-5">
                                    <h5 className="fw-bolder mb-4 text-dark"><i className="bi bi-key-fill me-2 text-muted"></i> Update Password</h5>
                                    <Row className="g-4">
                                        <Col md={4}>
                                            <Form.Group>
                                                <Form.Label className="form-label-gov">Current Password</Form.Label>
                                                <Form.Control
                                                    type="password"
                                                    className="form-control-gov shadow-sm"
                                                    placeholder="••••••••"
                                                    value={currentPassword}
                                                    onChange={(e) => setCurrentPassword(e.target.value)}
                                                />
                                            </Form.Group>
                                        </Col>
                                        <Col md={4}>
                                            <Form.Group>
                                                <Form.Label className="form-label-gov">New Password</Form.Label>
                                                <Form.Control
                                                    type="password"
                                                    className="form-control-gov shadow-sm"
                                                    placeholder="Min. 12 characters"
                                                    value={newPassword}
                                                    onChange={(e) => setNewPassword(e.target.value)}
                                                />
                                            </Form.Group>
                                        </Col>
                                        <Col md={4}>
                                            <Form.Group>
                                                <Form.Label className="form-label-gov">Confirm New Password</Form.Label>
                                                <Form.Control
                                                    type="password"
                                                    className="form-control-gov shadow-sm"
                                                    value={confirmPassword}
                                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                                />
                                            </Form.Group>
                                        </Col>
                                    </Row>
                                </div>

                                <div className="mt-5 pt-4 border-top border-secondary border-opacity-10 d-flex gap-3">
                                    <Button
                                        variant="dark"
                                        className="btn-ledger px-5 py-3 fw-bold rounded-pill shadow-sm hover-translate transition-all"
                                        onClick={handleSaveProfile}
                                        disabled={saving}
                                    >
                                        {saving ? (
                                            <>
                                                <Spinner animation="border" size="sm" className="me-2" /> Saving...
                                            </>
                                        ) : (
                                            <><i className="bi bi-save me-2"></i> Save Profile Changes</>
                                        )}
                                    </Button>
                                    <Button
                                        variant="light"
                                        className="px-5 py-3 border rounded-pill fw-bold shadow-sm hover-translate transition-all"
                                        onClick={handleDiscard}
                                        disabled={saving}
                                    >
                                        Discard
                                    </Button>
                                </div>
                            </Form>
                        </Card>
                    )}

                    {activeTab === 'security' && (
                        <Card className="border-0 shadow-sm p-4 p-xl-5 bg-white fade-in-up" style={{ borderRadius: '32px', animationDelay: '0.2s' }}>
                            <div className="mb-5">
                                <h4 className="fw-bolder text-ledger mb-1 fs-3">Security & Access</h4>
                                <p className="text-muted small fw-bold opacity-75">Configure high-clearance access protocols</p>
                            </div>

                            <div className="d-flex flex-column gap-4">
                                <div className="d-flex justify-content-between align-items-center p-4 rounded-4 border border-success border-opacity-25 bg-success bg-opacity-10 hover-translate transition-all cursor-pointer">
                                    <div className="d-flex gap-4 align-items-center">
                                        <div className="bg-success text-white p-3 rounded-circle shadow-sm d-flex align-items-center justify-content-center" style={{ width: '56px', height: '56px' }}>
                                            <i className="bi bi-shield-check fs-3"></i>
                                        </div>
                                        <div>
                                            <h5 className="fw-bold mb-1 text-success">Two-Factor Authentication (2FA)</h5>
                                            <p className="text-success small opacity-75 max-w-lg mb-0 fw-bold">Secure your account with an extra layer of identity verification.</p>
                                        </div>
                                    </div>
                                    <Form.Check type="switch" id="2fa-switch" className="custom-switch fs-3" defaultChecked />
                                </div>

                                <div className="d-flex justify-content-between align-items-center p-4 rounded-4 border shadow-sm hover-translate transition-all cursor-pointer bg-white">
                                    <div className="d-flex gap-4 align-items-center">
                                        <div className="bg-dark text-white p-3 rounded-circle shadow-sm d-flex align-items-center justify-content-center" style={{ width: '56px', height: '56px' }}>
                                            <i className="bi bi-usb-symbol fs-3"></i>
                                        </div>
                                        <div>
                                            <h5 className="fw-bold mb-1">Hardware Token Authorization</h5>
                                            <p className="text-muted small max-w-lg mb-0 fw-bold opacity-75">Required for official document signing and ledger modification.</p>
                                            <div className="mt-2">
                                                <Badge bg="light" text="dark" className="border px-3 py-2 rounded-pill shadow-sm"><i className="bi bi-link-45deg me-1"></i> Linked: #S-888210-KYC</Badge>
                                            </div>
                                        </div>
                                    </div>
                                    <Button variant="outline-dark" className="rounded-pill px-4 py-2 fw-bold shadow-sm">Manage Token</Button>
                                </div>

                                <div className="mt-4">
                                    <h6 className="fw-bolder mb-3 text-uppercase small text-muted" style={{ letterSpacing: '1px' }}>Active Sessions</h6>
                                    <div className="d-flex justify-content-between align-items-center p-4 bg-light rounded-4 border shadow-sm hover-translate transition-all">
                                        <div className="d-flex align-items-center gap-4">
                                            <div className="bg-white p-3 rounded-circle border shadow-sm d-flex align-items-center justify-content-center" style={{ width: '56px', height: '56px' }}>
                                                <i className="bi bi-laptop fs-3 text-dark"></i>
                                            </div>
                                            <div>
                                                <div className="fw-bold text-dark fs-6">Chrome on Windows (Current)</div>
                                                <div className="text-muted small fw-bold opacity-75 mt-1">Abu Dhabi, UAE &middot; 102.11.45.2</div>
                                            </div>
                                        </div>
                                        <Badge bg="success" className="bg-opacity-10 text-success border border-success border-opacity-25 rounded-pill px-4 py-2 shadow-sm fw-bold">
                                            <i className="bi bi-check-circle-fill me-2"></i>ACTIVE
                                        </Badge>
                                    </div>
                                </div>
                            </div>
                        </Card>
                    )}

                    {activeTab === 'preferences' && (
                        <Card className="border-0 shadow-sm p-4 p-xl-5 bg-white fade-in-up" style={{ borderRadius: '32px', animationDelay: '0.2s' }}>
                            <div className="mb-5">
                                <h4 className="fw-bolder text-ledger mb-1 fs-3">System Preferences</h4>
                                <p className="text-muted small fw-bold opacity-75">Customize your workspace experience</p>
                            </div>

                            <div className="d-flex flex-column gap-5">
                                <div>
                                    <h6 className="fw-bolder text-uppercase small text-muted mb-4" style={{ letterSpacing: '1px' }}>Appearance</h6>
                                    <div className="d-flex gap-4 flex-wrap">
                                        <div className="cursor-pointer hover-translate transition-all">
                                            <div className="bg-light rounded-4 mb-3 border border-dark border-3 shadow-sm d-flex align-items-center justify-content-center" style={{ width: '140px', height: '100px', padding: '10px' }}>
                                                <div className="bg-white rounded-3 w-100 h-100 shadow-sm"></div>
                                            </div>
                                            <div className="text-center fw-bold text-dark">Daylight</div>
                                        </div>
                                        <div className="cursor-pointer opacity-50 hover-translate transition-all">
                                            <div className="bg-dark rounded-4 mb-3 shadow-sm d-flex align-items-center justify-content-center" style={{ width: '140px', height: '100px', padding: '10px' }}>
                                                <div className="bg-secondary bg-opacity-25 rounded-3 w-100 h-100"></div>
                                            </div>
                                            <div className="text-center fw-bold text-dark">Midnight</div>
                                        </div>
                                        <div className="cursor-pointer opacity-50 hover-translate transition-all">
                                            <div className="bg-ledger rounded-4 mb-3 shadow-sm d-flex align-items-center justify-content-center" style={{ width: '140px', height: '100px', padding: '10px' }}>
                                                <div className="bg-secondary bg-opacity-10 rounded-3 w-100 h-100"></div>
                                            </div>
                                            <div className="text-center fw-bold text-dark">High Clearance</div>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <h6 className="fw-bolder text-uppercase small text-muted mb-4" style={{ letterSpacing: '1px' }}>Notifications</h6>
                                    <div className="d-flex flex-column gap-3">
                                        <div className="d-flex justify-content-between align-items-center p-3 px-4 border rounded-pill shadow-sm hover-bg-light transition-all cursor-pointer">
                                            <div>
                                                <div className="fw-bold text-dark">Email Alerts on Submission</div>
                                                <div className="text-muted small opacity-75 fw-bold">Receive immediate notifications for new document arrivals.</div>
                                            </div>
                                            <Form.Check type="switch" className="custom-switch fs-4 m-0" defaultChecked />
                                        </div>
                                        <div className="d-flex justify-content-between align-items-center p-3 px-4 border rounded-pill shadow-sm hover-bg-light transition-all cursor-pointer">
                                            <div>
                                                <div className="fw-bold text-dark">Workflow Status Updates</div>
                                                <div className="text-muted small opacity-75 fw-bold">Notify when a document passes through a lifecycle node.</div>
                                            </div>
                                            <Form.Check type="switch" className="custom-switch fs-4 m-0" defaultChecked />
                                        </div>
                                        <div className="d-flex justify-content-between align-items-center p-3 px-4 border rounded-pill shadow-sm hover-bg-light transition-all cursor-pointer">
                                            <div>
                                                <div className="fw-bold text-dark">System Maintenance Logs</div>
                                                <div className="text-muted small opacity-75 fw-bold">Updates regarding administrative downtime.</div>
                                            </div>
                                            <Form.Check type="switch" className="custom-switch fs-4 m-0" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </Card>
                    )}

                    {activeTab === 'delegations' && (
                        <DelegationsPanel />
                    )}
                </Col>
            </Row>
        </Container>
    );
};

const DelegationsPanel: React.FC = () => {
    const { showNotification } = useNotification();
    const { user } = useAuth();
    const [delegations, setDelegations] = useState<any[]>([]);
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    // Form state
    const [toUserId, setToUserId] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    useEffect(() => {
        fetchDelegations();
        fetchUsers();
    }, []);

    const fetchDelegations = async () => {
        try {
            const res = await apiClient.get('/workflow/delegations/');
            setDelegations(res.data.filter((d: any) => d.from_user_email === user?.email));
        } catch (e) {
            console.error(e);
        }
    };

    const fetchUsers = async () => {
        try {
            const res = await apiClient.get('/auth/admin/users/');
            setUsers(res.data.filter((u: any) => u.email !== user?.email));
        } catch (e) {
            console.error("User fetch failed - proxy access may be limited", e);
        }
    };

    const handleCreateProxy = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!toUserId || !startDate || !endDate) return;
        setLoading(true);
        try {
            await apiClient.post('/workflow/delegations/', {
                to_user: toUserId,
                start_date: new Date(startDate).toISOString(),
                end_date: new Date(endDate).toISOString()
            });
            showNotification('Proxy Assigned', 'Authority delegation has been successfully activated.', 'success');
            fetchDelegations();
            setToUserId(''); setStartDate(''); setEndDate('');
        } catch (e: any) {
            showNotification('Assignment Failed', 'Could not establish delegation. Please verify parameters.', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleRevoke = async (id: number) => {
        try {
            await apiClient.delete(`/workflow/delegations/${id}/`);
            showNotification('Proxy Revoked', 'The assigned authority has been rescinded.', 'success');
            fetchDelegations();
        } catch (e) {
            showNotification('Revocation Failed', 'Failed to rescind authority.', 'error');
        }
    };

    return (
        <Card className="border-0 shadow-sm p-4 p-xl-5 bg-white fade-in-up" style={{ borderRadius: '32px', animationDelay: '0.2s' }}>
            <div className="mb-5">
                <h4 className="fw-bolder text-ledger mb-1 fs-3">Authority Delegation</h4>
                <p className="text-muted small fw-bold opacity-75">Temporarily assign administrative signing authority to a secondary official</p>
            </div>

            <Form onSubmit={handleCreateProxy} className="bg-light p-5 rounded-4 mb-5 border border-warning border-opacity-50 shadow-sm fade-in-up" style={{ animationDelay: '0.3s' }}>
                <h5 className="fw-bolder text-dark mb-4"><i className="bi bi-shield-plus me-2 text-warning fs-3 align-middle"></i> Assign New Proxy</h5>
                <Row className="g-4">
                    <Col md={12}>
                        <Form.Group>
                            <Form.Label className="small fw-bolder text-dark">Select Active Official</Form.Label>
                            <Form.Select className="form-control-gov shadow-sm py-3" value={toUserId} onChange={e => setToUserId(e.target.value)} required>
                                <option value="">Select a registry official...</option>
                                {users.map(u => (
                                    <option key={u.id} value={u.id}>{u.first_name} {u.last_name} ({u.email}) - {u.role}</option>
                                ))}
                            </Form.Select>
                        </Form.Group>
                    </Col>
                    <Col md={6}>
                        <Form.Group>
                            <Form.Label className="small fw-bolder text-dark">Effective From</Form.Label>
                            <Form.Control type="datetime-local" className="form-control-gov shadow-sm" value={startDate} onChange={e => setStartDate(e.target.value)} required />
                        </Form.Group>
                    </Col>
                    <Col md={6}>
                        <Form.Group>
                            <Form.Label className="small fw-bolder text-dark">Expiration</Form.Label>
                            <Form.Control type="datetime-local" className="form-control-gov shadow-sm" value={endDate} onChange={e => setEndDate(e.target.value)} required />
                        </Form.Group>
                    </Col>
                    <Col md={12} className="text-end mt-5">
                        <Button type="submit" variant="warning" className="fw-bold py-3 px-5 rounded-pill shadow-sm hover-translate transition-all border-0" disabled={loading}>
                            {loading ? <Spinner animation="border" size="sm" /> : <><i className="bi bi-check-circle-fill me-2"></i> Establish Delegation</>}
                        </Button>
                    </Col>
                </Row>
            </Form>

            <h6 className="fw-bolder text-uppercase small text-muted mb-4" style={{ letterSpacing: '1px' }}>Active & Scheduled Proxies</h6>
            {delegations.length === 0 ? (
                <div className="text-center py-5 bg-light rounded-4 border border-dashed fade-in-up" style={{ animationDelay: '0.4s' }}>
                    <i className="bi bi-diagram-3 fs-1 text-muted mb-3 opacity-50"></i>
                    <div className="text-muted fw-bold">No delegations currently active</div>
                </div>
            ) : (
                <div className="table-responsive fade-in-up" style={{ animationDelay: '0.4s' }}>
                    <Table responsive hover className="gov-table align-middle mb-0">
                        <thead>
                            <tr>
                                <th className="ps-4 py-3 text-uppercase small fw-bold text-muted" style={{ letterSpacing: '1px' }}>Official</th>
                                <th className="py-3 text-uppercase small fw-bold text-muted" style={{ letterSpacing: '1px' }}>Duration</th>
                                <th className="pe-4 py-3 text-end text-uppercase small fw-bold text-muted" style={{ letterSpacing: '1px' }}>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {delegations.map((d) => (
                                <tr key={d.id} className="hover-translate cursor-pointer transition-all" style={{ transformOrigin: 'left' }}>
                                    <td className="ps-4">
                                        <div className="d-flex align-items-center py-2">
                                            <div className="bg-warning bg-opacity-10 text-warning rounded-circle p-2 me-3 d-flex align-items-center justify-content-center border border-warning border-opacity-25 shadow-sm" style={{ width: '48px', height: '48px' }}>
                                                <i className="bi bi-person-fill-lock fs-5"></i>
                                            </div>
                                            <div>
                                                <div className="fw-bolder text-dark mb-1 fs-6">{d.to_user_name || d.to_user_email}</div>
                                                <div className="text-muted small fw-bold opacity-75">Assigned Proxy</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        <div className="fw-bolder text-dark mb-1">
                                            <i className="bi bi-calendar-event me-2 opacity-50"></i>
                                            {new Date(d.start_date).toLocaleDateString()} {new Date(d.start_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </div>
                                        <div className="text-muted small fw-bold opacity-75 ms-4">
                                            to {new Date(d.end_date).toLocaleDateString()} {new Date(d.end_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </div>
                                    </td>
                                    <td className="pe-4 text-end">
                                        <Button variant="outline-danger" className="rounded-pill px-4 py-2 fw-bold shadow-sm hover-translate transition-all" onClick={() => handleRevoke(d.id)}>
                                            <i className="bi bi-x-circle-fill me-2"></i>Revoke
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                </div>
            )}
        </Card>
    );
};

export default SettingsPage;
