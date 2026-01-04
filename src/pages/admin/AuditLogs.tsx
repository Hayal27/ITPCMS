import React, { useState, useEffect, useMemo } from 'react';
import { Container, Row, Col, Card, Form, Table, Button, Spinner, Badge, Nav } from 'react-bootstrap';
import { getAuditLogs, AuditLogItem, AuditLogFilters, getBlockedIPs, unblockIP, BlockedIP } from '../../services/AuditLogService';
import Pagination from '../../components/Pagination';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement,
    PointElement,
    LineElement,
    Filler
} from 'chart.js';
import { Bar, Pie, Line } from 'react-chartjs-2';

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement,
    PointElement,
    LineElement,
    Filler
);

const AuditLogs: React.FC = () => {
    const [logs, setLogs] = useState<AuditLogItem[]>([]);
    const [loading, setLoading] = useState<boolean>(true);

    // Filters State
    const [filters, setFilters] = useState<AuditLogFilters>({
        action: '',
        entity: '',
        startDate: '',
        endDate: '',
    });

    // Pagination State
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 15;

    // Blocked IPs State
    const [blockedIPs, setBlockedIPs] = useState<BlockedIP[]>([]);
    const [activeTab, setActiveTab] = useState<'logs' | 'blocked'>('logs');

    const fetchBlocked = async () => {
        try {
            const data = await getBlockedIPs();
            setBlockedIPs(data);
        } catch (error) {
            console.error("Error fetching blocked IPs:", error);
        }
    };

    const handleUnblock = async (id: number, type: 'ip' | 'user') => {
        const msg = type === 'user' ? "Are you sure you want to unlock this user account?" : "Are you sure you want to unblock this IP?";
        if (!window.confirm(msg)) return;
        try {
            await unblockIP(id, type);
            fetchBlocked();
        } catch (error) {
            alert(type === 'user' ? "Failed to unlock user" : "Failed to unblock IP");
        }
    };

    useEffect(() => {
        if (activeTab === 'blocked') {
            fetchBlocked();
        }
    }, [activeTab]);

    const fetchLogs = async () => {
        setLoading(true);
        try {
            const data = await getAuditLogs(filters);
            const sorted = data.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
            setLogs(sorted);
        } catch (error) {
            console.error("Error fetching audit logs:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLogs();
    }, []);

    // Analytics Data
    const analytics = useMemo(() => {
        const actionCounts: { [key: string]: number } = {};
        const entityCounts: { [key: string]: number } = {};
        const timeline: { [key: string]: number } = {};

        logs.forEach(log => {
            // Action Counts
            actionCounts[log.action] = (actionCounts[log.action] || 0) + 1;
            // Entity Counts
            entityCounts[log.entity] = (entityCounts[log.entity] || 0) + 1;
            // Timeline (by date)
            const date = new Date(log.created_at).toLocaleDateString();
            timeline[date] = (timeline[date] || 0) + 1;
        });

        return { actionCounts, entityCounts, timeline };
    }, [logs]);

    // Chart Data Config
    const actionChartData = {
        labels: Object.keys(analytics.actionCounts),
        datasets: [
            {
                label: '# of Actions',
                data: Object.values(analytics.actionCounts),
                backgroundColor: [
                    'rgba(54, 162, 235, 0.6)',
                    'rgba(255, 99, 132, 0.6)',
                    'rgba(75, 192, 192, 0.6)',
                    'rgba(255, 206, 86, 0.6)',
                    'rgba(153, 102, 255, 0.6)',
                    'rgba(255, 159, 64, 0.6)',
                    'rgba(201, 203, 207, 0.6)'
                ],
                borderWidth: 1,
            },
        ],
    };

    const timelineChartData = {
        labels: Object.keys(analytics.timeline).reverse().slice(0, 10).reverse(), // Last 10 days
        datasets: [{
            label: 'Activity Volume',
            data: Object.values(analytics.timeline).reverse().slice(0, 10).reverse(),
            fill: true,
            borderColor: 'rgb(53, 162, 235)',
            backgroundColor: 'rgba(53, 162, 235, 0.2)',
            tension: 0.4
        }]
    };

    const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        setCurrentPage(1);
        fetchLogs();
    };

    const handleResetFilters = () => {
        setFilters({ action: '', entity: '', startDate: '', endDate: '' });
        setCurrentPage(1);
        setTimeout(() => fetchLogs(), 100);
    };

    const formatDetails = (details: string | null) => {
        if (!details) return '-';
        try {
            const parsed = JSON.parse(details);
            if (typeof parsed !== 'object' || parsed === null) {
                return <span className="text-muted small">{String(parsed)}</span>;
            }

            return (
                <div style={{ maxHeight: '150px', overflowY: 'auto', fontSize: '0.8rem' }}>
                    {Object.entries(parsed).map(([key, value]) => (
                        <div key={key} className="mb-1">
                            <span className="font-weight-bold text-dark mr-1">{key}:</span>
                            <span className="text-secondary text-break">
                                {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                            </span>
                        </div>
                    ))}
                </div>
            );
        } catch (e) {
            return <span className="text-muted small">{details}</span>;
        }
    };

    // Pagination Logic
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentLogs = logs.slice(indexOfFirstItem, indexOfLastItem);

    return (
        <Container fluid className="mb-5">
            <div className="d-sm-flex align-items-center justify-content-between mb-4">
                <h1 className="h3 mb-0 text-gray-800">System Security & Audit</h1>
                <div className="d-flex text-right">
                    <span className="small text-muted align-self-center mr-3">Last updated: {new Date().toLocaleTimeString()}</span>
                    <Button variant="outline-primary" size="sm" onClick={() => activeTab === 'logs' ? fetchLogs() : fetchBlocked()} disabled={loading}>
                        {loading ? <Spinner animation="border" size="sm" /> : <><i className="fas fa-sync-alt mr-1"></i> Refresh</>}
                    </Button>
                </div>
            </div>

            <Nav variant="tabs" className="mb-4" activeKey={activeTab} onSelect={(k) => setActiveTab(k as 'logs' | 'blocked')}>
                <Nav.Item>
                    <Nav.Link eventKey="logs">Audit Trail & Analytics</Nav.Link>
                </Nav.Item>
                <Nav.Item>
                    <Nav.Link eventKey="blocked">Blocked IPs & Accounts</Nav.Link>
                </Nav.Item>
            </Nav>

            {activeTab === 'logs' && (
                <>
                    {/* Analytics Section */}
                    {!loading && logs.length > 0 && (
                        <Row className="mb-4">
                            <Col lg={4} md={6} className="mb-4">
                                <Card className="shadow h-100 border-0">
                                    <Card.Header className="py-3 bg-white d-flex align-items-center justify-content-between">
                                        <h6 className="m-0 font-weight-bold text-primary">Actions Distribution</h6>
                                    </Card.Header>
                                    <Card.Body className="d-flex align-items-center justify-content-center p-3" style={{ height: '300px' }}>
                                        <div style={{ position: 'relative', width: '90%', height: '100%' }}>
                                            <Pie data={actionChartData} options={{ maintainAspectRatio: false }} />
                                        </div>
                                    </Card.Body>
                                </Card>
                            </Col>
                            <Col lg={8} md={6} className="mb-4">
                                <Card className="shadow h-100 border-0">
                                    <Card.Header className="py-3 bg-white d-flex align-items-center justify-content-between">
                                        <h6 className="m-0 font-weight-bold text-primary">Activity Over Time (Last 10 Days)</h6>
                                    </Card.Header>
                                    <Card.Body className="p-3" style={{ height: '300px' }}>
                                        <div style={{ position: 'relative', width: '100%', height: '100%' }}>
                                            <Line data={timelineChartData} options={{ maintainAspectRatio: false, scales: { y: { beginAtZero: true, ticks: { precision: 0 } } } }} />
                                        </div>
                                    </Card.Body>
                                </Card>
                            </Col>
                        </Row>
                    )}

                    <Card className="shadow mb-4 border-0">
                        <Card.Header className="py-3 bg-white d-flex flex-row align-items-center justify-content-between">
                            <h6 className="m-0 font-weight-bold text-primary">Filter Logs</h6>
                            {(filters.action || filters.entity || filters.startDate) &&
                                <Button variant="link" size="sm" className="text-danger p-0" onClick={handleResetFilters}>Clear Filters</Button>
                            }
                        </Card.Header>
                        <Card.Body>
                            <Form onSubmit={handleSearch}>
                                <Row className="g-3">
                                    <Col md={3}>
                                        <Form.Group>
                                            <Form.Label className="small text-gray-600">Action Type</Form.Label>
                                            <Form.Control
                                                type="text"
                                                placeholder="e.g. LOGIN, UPDATE..."
                                                name="action"
                                                value={filters.action}
                                                onChange={handleFilterChange}
                                                size="sm"
                                            />
                                        </Form.Group>
                                    </Col>
                                    <Col md={3}>
                                        <Form.Group>
                                            <Form.Label className="small text-gray-600">Entity / Module</Form.Label>
                                            <Form.Control
                                                type="text"
                                                placeholder="e.g. User, Article..."
                                                name="entity"
                                                value={filters.entity}
                                                onChange={handleFilterChange}
                                                size="sm"
                                            />
                                        </Form.Group>
                                    </Col>
                                    <Col md={3}>
                                        <Form.Group>
                                            <Form.Label className="small text-gray-600">From Date</Form.Label>
                                            <Form.Control
                                                type="date"
                                                name="startDate"
                                                value={filters.startDate}
                                                onChange={handleFilterChange}
                                                size="sm"
                                            />
                                        </Form.Group>
                                    </Col>
                                    <Col md={3} className="d-flex align-items-end">
                                        <Button variant="primary" type="submit" className="w-100" size="sm" disabled={loading}>
                                            <i className="fas fa-filter mr-1"></i> Apply Filters
                                        </Button>
                                    </Col>
                                </Row>
                            </Form>
                        </Card.Body>
                    </Card>

                    <Card className="shadow mb-4 border-0">
                        <Card.Header className="py-3 bg-white">
                            <h6 className="m-0 font-weight-bold text-primary">Audit Trail <span className="text-gray-500 font-weight-normal ml-2">({logs.length} entries)</span></h6>
                        </Card.Header>
                        <Card.Body className="p-0">
                            <div className="table-responsive">
                                <Table hover className="mb-0 align-middle">
                                    <thead className="bg-light text-gray-600">
                                        <tr>
                                            <th className="px-4 py-3 border-0">Time</th>
                                            <th className="px-4 py-3 border-0">User</th>
                                            <th className="px-4 py-3 border-0">Action</th>
                                            <th className="px-4 py-3 border-0">Entity</th>
                                            <th className="px-4 py-3 border-0">Details</th>
                                            <th className="px-4 py-3 border-0">IP Address</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {loading ? (
                                            <tr>
                                                <td colSpan={6} className="text-center py-5">
                                                    <Spinner animation="border" variant="primary" />
                                                </td>
                                            </tr>
                                        ) : currentLogs.length > 0 ? (
                                            currentLogs.map((log) => (
                                                <tr key={log.id}>
                                                    <td className="px-4 py-3 text-nowrap text-secondary small">
                                                        {new Date(log.created_at).toLocaleString()}
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <div className="font-weight-bold text-gray-800 text-sm">
                                                            {log.user_name || <em className="text-muted">Unknown</em>}
                                                        </div>
                                                        {log.user_id && <div className="text-xs text-muted">ID: {log.user_id}</div>}
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <Badge bg={
                                                            log.action?.includes('DELETE') ? 'danger' :
                                                                log.action?.includes('UPDATE') ? 'warning' :
                                                                    log.action?.includes('CREATE') ? 'success' :
                                                                        log.action === 'LOGIN' ? 'primary' : 'info'
                                                        } className="px-2 py-1">
                                                            {log.action}
                                                        </Badge>
                                                    </td>
                                                    <td className="px-4 py-3 text-sm">
                                                        <span className="font-weight-bold">{log.entity}</span>
                                                        {log.entity_id && <span className="text-muted ml-1">#{log.entity_id}</span>}
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        {formatDetails(log.details)}
                                                    </td>
                                                    <td className="px-4 py-3 text-xs text-muted font-monospace">{log.ip_address}</td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan={6} className="text-center py-5 text-gray-500">
                                                    <i className="fas fa-clipboard-list fa-3x mb-3 text-gray-300"></i>
                                                    <p>No audit logs found matching criteria.</p>
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </Table>
                            </div>
                        </Card.Body>
                        {logs.length > 0 && (
                            <div className="card-footer bg-white py-3">
                                <Pagination
                                    currentPage={currentPage}
                                    totalItems={logs.length}
                                    itemsPerPage={itemsPerPage}
                                    onPageChange={setCurrentPage}
                                />
                            </div>
                        )}
                    </Card>
                </>
            )}

            {activeTab === 'blocked' && (
                <Card className="shadow mb-4 border-0">
                    <Card.Header className="py-3 bg-white">
                        <h6 className="m-0 font-weight-bold text-danger">Blocked IPs & Security Incidents</h6>
                    </Card.Header>
                    <Card.Body className="p-0">
                        <Table hover className="mb-0 align-middle">
                            <thead className="bg-light text-gray-600">
                                <tr>
                                    <th className="px-4 py-3 border-0">IP Address</th>
                                    <th className="px-4 py-3 border-0">Blocked At</th>
                                    <th className="px-4 py-3 border-0">Reason</th>
                                    <th className="px-4 py-3 border-0">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {blockedIPs.length > 0 ? (
                                    blockedIPs.map((ip) => (
                                        <tr key={`${ip.type}-${ip.id}`}>
                                            <td className="px-4 py-3">
                                                <Badge bg={ip.type === 'user' ? 'warning' : 'danger'} className="mr-2 px-2 py-1">
                                                    {ip.type === 'user' ? 'USER' : 'IP'}
                                                </Badge>
                                                <span className="font-monospace font-weight-bold">{ip.ip_address}</span>
                                            </td>
                                            <td className="px-4 py-3 text-secondary small">{new Date(ip.blocked_at).toLocaleString()}</td>
                                            <td className="px-4 py-3">
                                                <span className={ip.type === 'user' ? 'text-warning' : 'text-danger'}>{ip.reason}</span>
                                            </td>
                                            <td className="px-4 py-3">
                                                <Button
                                                    variant={ip.type === 'user' ? 'outline-primary' : 'outline-success'}
                                                    size="sm"
                                                    onClick={() => handleUnblock(ip.id, ip.type)}
                                                >
                                                    <i className={`fas ${ip.type === 'user' ? 'fa-user-check' : 'fa-unlock'} mr-1`}></i>
                                                    {ip.type === 'user' ? 'Unlock Account' : 'Unblock IP'}
                                                </Button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={4} className="text-center py-5 text-success">
                                            <i className="fas fa-shield-alt fa-3x mb-3"></i>
                                            <p className="mb-0">No IPs are currently blocked.</p>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </Table>
                    </Card.Body>
                </Card>
            )}
        </Container>
    );
};

export default AuditLogs;
