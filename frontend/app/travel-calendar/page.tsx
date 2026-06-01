'use client';

import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Badge, Spinner, Alert, Button } from 'react-bootstrap';
import { useAuth } from '@/context/AuthContext';
import { apiClient } from '@/lib/api-client';
import DashboardHeader from '@/components/DashboardHeader';
import { useRouter } from 'next/navigation';

interface TravelEvent {
    id: number;
    title: string;
    user_name: string;
    user_role: string;
    destination: string;
    start_date: string;
    end_date: string;
}

const TravelCalendarPage: React.FC = () => {
    const { user, isLoading: authLoading } = useAuth();
    const router = useRouter();
    const [events, setEvents] = useState<TravelEvent[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentDate, setCurrentDate] = useState(new Date());

    useEffect(() => {
        if (!authLoading && user?.role !== 'Admin' && (!user || !user.role)) {
           // Basic fallback, API protects this anyway
           router.push('/dashboard');
        }
    }, [user, authLoading, router]);

    useEffect(() => {
        const fetchEvents = async () => {
            try {
                const res = await apiClient.get('/documents/calendar_events/');
                setEvents(res.data);
            } catch (err) {
                console.error("Failed to load calendar events:", err);
            } finally {
                setLoading(false);
            }
        };
        if (!authLoading && user) {
            fetchEvents();
        }
    }, [user, authLoading]);

    // Calendar Math
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth(); // 0 - 11
    
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDayOfMonth = new Date(year, month, 1).getDay(); // 0 (Sun) to 6 (Sat)
    
    const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));
    const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
    const today = () => setCurrentDate(new Date());

    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

    // Compute active deployed users
    const currentlyDeployed = events.filter(e => {
        const now = new Date();
        const start = new Date(e.start_date);
        const end = new Date(e.end_date);
        return start <= now && end >= now;
    });

    // Compute Leadership Conflicts (overlapping dates for Admin/Director roles)
    const activeVIPs = currentlyDeployed.filter(e => ['Admin', 'Director', 'Minister'].includes(e.user_role));
    const hasConflict = activeVIPs.length > 1;

    if (authLoading || loading) {
        return <div className="d-flex justify-content-center pt-5 mt-5"><Spinner animation="border" variant="dark" /></div>;
    }

    // Helper: Is event active on a specific day?
    const getEventsForDay = (day: number) => {
        const checkDate = new Date(year, month, day);
        return events.filter(e => {
            const start = new Date(e.start_date);
            start.setHours(0,0,0,0);
            const end = new Date(e.end_date);
            end.setHours(23,59,59,999);
            return checkDate >= start && checkDate <= end;
        });
    };

    return (
        <Container fluid className="py-2 px-xl-4 pb-5 h-full overflow-auto fade-in-up">
            <DashboardHeader title="Travel Calendar" subtitle="Global mapping of official itineraries and leadership deployment." />

            <Row className="g-4">
                <Col lg={9}>
                    <Card className="border-0 shadow-sm rounded-4 p-4 p-xl-5 bg-white fade-in-up" style={{ borderRadius: '32px', animationDelay: '0.1s' }}>
                        <div className="d-flex justify-content-between align-items-center border-bottom border-secondary border-opacity-10 pb-4 mb-4">
                            <h2 className="fw-bolder m-0 text-dark fs-2">
                                {monthNames[month]} <span className="text-muted fw-bold">{year}</span>
                            </h2>
                            <div className="d-flex gap-2">
                                <Button variant="outline-dark" size="sm" className="rounded-pill px-4 fw-bold shadow-sm hover-translate transition-all" onClick={prevMonth}>
                                    <i className="bi bi-chevron-left me-1"></i> Prev
                                </Button>
                                <Button variant="light" size="sm" className="rounded-pill px-5 fw-bold shadow-sm border hover-translate transition-all" onClick={today}>
                                    <i className="bi bi-calendar-event me-2 text-primary"></i>Today
                                </Button>
                                <Button variant="outline-dark" size="sm" className="rounded-pill px-4 fw-bold shadow-sm hover-translate transition-all" onClick={nextMonth}>
                                    Next <i className="bi bi-chevron-right ms-1"></i>
                                </Button>
                            </div>
                        </div>

                        {/* Calendar Grid Header */}
                        <div className="d-grid mb-3" style={{ gridTemplateColumns: 'repeat(7, 1fr)', gap: '15px' }}>
                            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
                                <div key={d} className="text-center fw-bolder text-muted small text-uppercase" style={{ letterSpacing: '1px' }}>{d}</div>
                            ))}
                        </div>

                        {/* Calendar Grid Body */}
                        <div className="d-grid" style={{ gridTemplateColumns: 'repeat(7, 1fr)', gap: '15px' }}>
                            {/* Empty Prev Month Blocks */}
                            {Array.from({ length: firstDayOfMonth }).map((_, i) => (
                                <div key={`empty-${i}`} className="bg-light rounded-4 opacity-50 border border-dashed" style={{ minHeight: '140px' }}></div>
                            ))}

                            {/* Actual Days */}
                            {Array.from({ length: daysInMonth }).map((_, i) => {
                                const day = i + 1;
                                const isToday = new Date().getDate() === day && new Date().getMonth() === month && new Date().getFullYear() === year;
                                const dayEvents = getEventsForDay(day);

                                return (
                                    <div key={day} className={`border rounded-4 p-3 position-relative hover-translate cursor-pointer transition-all shadow-sm ${isToday ? 'border-primary border-opacity-50 bg-primary bg-opacity-10' : 'bg-white'}`} style={{ minHeight: '140px' }}>
                                        <div className={`mb-3 d-flex justify-content-between align-items-center`}>
                                            {isToday ? (
                                                <div className="fw-bolder text-primary bg-white rounded-circle shadow-sm d-flex align-items-center justify-content-center" style={{ width: '32px', height: '32px' }}>
                                                    {day}
                                                </div>
                                            ) : (
                                                <div className="fw-bolder text-dark opacity-75">{day}</div>
                                            )}
                                            {dayEvents.length > 0 && (
                                                <Badge bg="dark" className="bg-opacity-10 text-dark rounded-pill px-2">{dayEvents.length}</Badge>
                                            )}
                                        </div>
                                        <div className="d-flex flex-column gap-2 overflow-hidden" style={{ maxHeight: '90px' }}>
                                            {dayEvents.slice(0, 3).map((e, idx) => (
                                                <div key={idx} className="bg-dark text-white rounded-pill px-2 py-1 small text-truncate shadow-sm d-flex align-items-center" style={{ fontSize: '0.7rem' }}>
                                                    <i className="bi bi-geo-alt-fill text-danger me-1" style={{ fontSize: '0.6rem' }}></i>
                                                    <strong className="me-1">{e.user_name.split(' ')[0]}:</strong> {e.destination}
                                                </div>
                                            ))}
                                            {dayEvents.length > 3 && (
                                                <div className="text-muted text-center fw-bold" style={{ fontSize: '0.65rem' }}>+{dayEvents.length - 3} more</div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </Card>
                </Col>

                <Col lg={3}>
                    {hasConflict && (
                        <Alert variant="danger" className="border border-danger border-opacity-50 shadow-sm rounded-4 mb-4 fade-in-up alert-glass-danger" style={{ animationDelay: '0.2s' }}>
                            <h6 className="fw-bolder mb-2 d-flex align-items-center">
                                <i className="bi bi-exclamation-triangle-fill me-2 fs-4" style={{ animation: 'pulse 2s infinite' }}></i>
                                Protocol 44-A Conflict
                            </h6>
                            <p className="small mb-0 fw-bold opacity-75">Multiple high-clearance officials are deployed simultaneously. This violates continuity of government directives.</p>
                        </Alert>
                    )}

                    <Card className="border-0 shadow-sm rounded-4 p-4 p-xl-5 bg-white border-top border-4 border-dark fade-in-up" style={{ animationDelay: '0.3s' }}>
                        <div className="d-flex align-items-center gap-3 mb-4">
                            <div className="bg-dark text-white p-2 rounded-circle shadow-sm d-flex align-items-center justify-content-center" style={{ width: '40px', height: '40px' }}>
                                <i className="bi bi-airplane-fill fs-5"></i>
                            </div>
                            <h6 className="fw-bolder text-uppercase small text-dark mb-0" style={{ letterSpacing: '1px' }}>Active Deployments</h6>
                        </div>
                        
                        {currentlyDeployed.length === 0 ? (
                            <div className="text-center py-4 bg-light rounded-4 border border-dashed">
                                <i className="bi bi-shield-check fs-2 text-muted mb-2 opacity-50"></i>
                                <div className="text-muted small fw-bold">All personnel localized.</div>
                            </div>
                        ) : (
                            <div className="d-flex flex-column gap-3">
                                {currentlyDeployed.map(e => (
                                    <div key={e.id} className="p-3 bg-light rounded-4 border shadow-sm hover-translate transition-all">
                                        <div className="d-flex justify-content-between align-items-start mb-2">
                                            <div>
                                                <div className="fw-bolder text-dark fs-6 lh-1 mb-1">{e.user_name}</div>
                                                <div className="text-uppercase text-muted fw-bold" style={{ fontSize: '0.65rem', letterSpacing: '0.5px' }}>{e.user_role}</div>
                                            </div>
                                            <Badge bg="dark" className="rounded-pill px-2 py-1 shadow-sm"><i className="bi bi-broadcast"></i> DEPLOYED</Badge>
                                        </div>
                                        
                                        <div className="bg-white p-2 rounded-3 border mt-3">
                                            <div className="d-flex align-items-center gap-2 small text-dark fw-bold mb-2">
                                                <i className="bi bi-geo-alt-fill text-danger"></i> {e.destination}
                                            </div>
                                            <div className="d-flex align-items-center gap-2 small text-muted fw-bold opacity-75" style={{ fontSize: '0.75rem' }}>
                                                <i className="bi bi-calendar-range"></i> 
                                                {new Date(e.start_date).toLocaleDateString([], { month: 'short', day: 'numeric'})} - {new Date(e.end_date).toLocaleDateString([], { month: 'short', day: 'numeric'})}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </Card>
                </Col>
            </Row>
        </Container>
    );
};

export default TravelCalendarPage;
