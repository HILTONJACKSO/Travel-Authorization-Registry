'use client';

import React, { useEffect, useState } from 'react';
import { Container, Card, Table, Button, Form, Row, Col, Badge, Spinner, Alert } from 'react-bootstrap';
import { apiClient } from '@/lib/api-client';
import DashboardHeader from '@/components/DashboardHeader';

interface WorkflowStep {
    id: number;
    step_order: number;
    role_required: { id: number; name: string };
}

interface Role {
    id: number;
    name: string;
}

const AdminWorkflowPage: React.FC = () => {
    const [steps, setSteps] = useState<WorkflowStep[]>([]);
    const [roles, setRoles] = useState<Role[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [stepsRes, rolesRes] = await Promise.all([
                apiClient.get('/workflow/steps/'),
                apiClient.get('/auth/admin/roles/')
            ]);
            setSteps(stepsRes.data.results || stepsRes.data);
            setRoles(rolesRes.data.results || rolesRes.data);
            setError('');
        } catch (err: any) {
            console.error('Fetch error:', err);
            setError('Failed to fetch workflow configuration. Verify administrative clearance.');
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateRole = async (stepId: number, roleId: string) => {
        setSubmitting(true);
        try {
            await apiClient.patch(`/workflow/steps/${stepId}/`, { role_required: roleId });
            fetchData();
        } catch (err: any) {
            setError('Failed to update workflow step authorization.');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return (
        <div className="d-flex justify-content-center align-items-center vh-100 bg-white">
            <div className="text-center">
                <Spinner animation="border" variant="dark" className="mb-3" />
                <div className="fw-bolder text-uppercase small text-muted" style={{ letterSpacing: '1px' }}>Accessing Workflow Hub...</div>
            </div>
        </div>
    );

    return (
        <Container fluid className="py-2 px-xl-4 pb-5 h-full overflow-auto fade-in-up">
            <DashboardHeader
                title="REGISTRY WORKFLOW CONFIGURATION"
                subtitle="Configure the mandatory architectural nodes and official clearance stages."
            />

            <div className="d-flex justify-content-end mb-4 gap-2 align-items-center fade-in-up" style={{ animationDelay: '0.1s' }}>
                <Badge bg="dark" className="text-white px-4 py-2 rounded-pill small fw-bolder border border-secondary border-opacity-25 shadow-sm">
                    <i className="bi bi-diagram-3-fill me-2"></i> LINEAR SEQUENCE ONLY
                </Badge>
            </div>

            {error && <Alert variant="danger" className="alert-glass-danger border border-danger border-opacity-50 shadow-sm rounded-4 mb-4 fade-in-up" style={{ animationDelay: '0.15s' }} dismissible onClose={() => setError('')}>
                <i className="bi bi-exclamation-octagon-fill me-2 fs-5"></i> <span className="fw-bold">{error}</span>
            </Alert>}

            <Row className="g-5">
                <Col lg={8}>
                    <Card className="border-0 shadow-sm p-4 p-xl-5 bg-white fade-in-up" style={{ borderRadius: '32px', animationDelay: '0.2s' }}>
                        <div className="mb-5">
                            <h4 className="fw-bolder text-dark mb-1">Defined Approval Chain</h4>
                            <p className="text-muted small fw-bold opacity-75">Configure the mandatory lifecycle nodes for document clearance</p>
                        </div>

                        {/* Workflow Timeline Design */}
                        <div className="workflow-timeline ps-4 border-start border-2 border-secondary border-opacity-10 ms-3">
                            {steps.sort((a, b) => a.step_order - b.step_order).map((step, idx) => (
                                <div key={step.id} className="position-relative mb-5 pb-2 fade-in-up" style={{ animationDelay: `${0.2 + (idx * 0.1)}s` }}>
                                    {/* Timeline Pin */}
                                    <div
                                        className="position-absolute translate-middle-x bg-dark rounded-circle shadow-sm d-flex align-items-center justify-content-center border border-4 border-white"
                                        style={{ width: '48px', height: '48px', left: '-25px', top: '0', zIndex: 10 }}
                                    >
                                        <span className="text-white fw-bolder fs-5">{step.step_order}</span>
                                    </div>

                                    {/* Step Content */}
                                    <div className="ms-4 ps-3">
                                        <div className="d-flex justify-content-between align-items-center mb-3">
                                            <div>
                                                <h5 className="fw-bolder text-dark mb-1">
                                                    {step.step_order === 1 ? 'Entry Review Node' : step.step_order === steps.length ? 'Executive Approval Node' : 'Secondary Validation Node'}
                                                </h5>
                                                <div className="text-muted small fw-bold opacity-75">
                                                    {step.step_order === 1
                                                        ? 'Initial verification of document integrity and metadata accuracy.'
                                                        : step.step_order === steps.length
                                                            ? 'Final clearance for archive entry and cryptographic signing.'
                                                            : 'Cross-departmental audit and compliance check.'}
                                                </div>
                                            </div>
                                            <Badge bg="light" className="text-dark rounded-pill px-4 py-2 fw-bolder border shadow-sm">
                                                ORDINAL {step.step_order}
                                            </Badge>
                                        </div>

                                        <div className="bg-light bg-opacity-50 p-4 rounded-4 border border-secondary border-opacity-10 d-flex align-items-center justify-content-between shadow-sm transition-all hover-translate">
                                            <div className="w-50">
                                                <Form.Label className="form-label-gov mb-2">Role Group Required</Form.Label>
                                                <Form.Select
                                                    value={step.role_required?.id || ''}
                                                    onChange={(e) => handleUpdateRole(step.id, e.target.value)}
                                                    disabled={submitting}
                                                    className="form-control-gov shadow-sm"
                                                    style={{ cursor: submitting ? 'not-allowed' : 'pointer' }}
                                                >
                                                    <option value="">Select role group...</option>
                                                    {roles.map(role => (
                                                        <option key={role.id} value={role.id}>{role.name}</option>
                                                    ))}
                                                </Form.Select>
                                            </div>
                                            <div className="text-end ps-4 border-start border-secondary border-opacity-10">
                                                <div className="form-label-gov mb-2">Node Logic</div>
                                                <div className="fw-bolder text-dark fs-6 d-flex align-items-center justify-content-end gap-2">
                                                    {step.step_order === 1 ? (
                                                        <><i className="bi bi-shield-check text-primary fs-5"></i> GATEKEEPER</>
                                                    ) : (
                                                        <><i className="bi bi-diagram-3-fill text-primary fs-5"></i> SEQUENTIAL VALIDATOR</>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Card>
                </Col>

                <Col lg={4}>
                    <div className="sticky-top" style={{ top: '2rem' }}>
                        <Card className="border-0 shadow-sm text-white p-4 mb-4 fade-in-up" style={{ borderRadius: '32px', animationDelay: '0.3s', background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)' }}>
                            <Card.Body className="p-0">
                                <div className="d-flex align-items-center gap-3 mb-4">
                                    <div className="bg-white bg-opacity-10 p-2 rounded-3 shadow-sm border border-white border-opacity-10">
                                        <i className="bi bi-info-circle-fill fs-4 text-white"></i>
                                    </div>
                                    <h5 className="fw-bolder mb-0 text-white">System Architecture</h5>
                                </div>
                                <p className="small opacity-75 mb-4 lh-lg fw-bold">
                                    The Registry Workflow maintains a <strong>Linear Sequence</strong>. Any document entering the archive must pass through every defined node in the designated order.
                                </p>
                                <hr className="bg-white opacity-25 mb-4" />
                                <div className="d-flex align-items-start gap-2 text-warning mb-0 p-3 bg-warning bg-opacity-10 rounded-3 border border-warning border-opacity-25">
                                    <i className="bi bi-exclamation-triangle-fill fs-5"></i>
                                    <p className="small mb-0 fw-bolder">Modifications will impact all documents currently in the live review cycle.</p>
                                </div>
                            </Card.Body>
                        </Card>

                        <Card className="border-0 shadow-sm p-4 bg-white fade-in-up" style={{ borderRadius: '32px', animationDelay: '0.4s' }}>
                            <h6 className="fw-bolder mb-4 text-dark opacity-75 text-uppercase small" style={{ letterSpacing: '1px' }}>
                                <i className="bi bi-shield-lock-fill me-2"></i>Workflow Integrity
                            </h6>
                            <div className="d-grid gap-3">
                                <Button variant="light" className="border shadow-sm rounded-pill py-3 fw-bolder small transition-all hover-translate text-dark" onClick={fetchData}>
                                    <i className="bi bi-arrow-repeat me-2"></i> SYNC CONFIGURATION
                                </Button>
                                <Button variant="outline-danger" className="rounded-pill py-3 fw-bolder small border-danger border-opacity-25 text-danger bg-danger bg-opacity-10 hover-translate transition-all">
                                    <i className="bi bi-lock-fill me-2"></i> EMERGENCY NODE LOCK
                                </Button>
                            </div>
                            <div className="mt-4 pt-2 text-center">
                                <span className="text-muted fw-bold extra-small text-uppercase" style={{ letterSpacing: '1px' }}>Last Check: {new Date().toLocaleTimeString()}</span>
                            </div>
                        </Card>
                    </div>
                </Col>
            </Row >
        </Container >
    );
};

export default AdminWorkflowPage;
