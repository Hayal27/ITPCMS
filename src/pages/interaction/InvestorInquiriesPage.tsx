import React, { useState, useEffect } from 'react';
import { Table, Button, Badge, Spinner, Alert, Card, Modal } from 'react-bootstrap';
import { getInvestorInquiries, InvestorInquiry } from '../../services/apiService';

const InvestorInquiriesPage: React.FC = () => {
    const [inquiries, setInquiries] = useState<InvestorInquiry[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedInquiry, setSelectedInquiry] = useState<InvestorInquiry | null>(null);
    const [showModal, setShowModal] = useState(false);

    const loadInquiries = async () => {
        setLoading(true);
        try {
            const data = await getInvestorInquiries();
            setInquiries(data);
            setError(null);
        } catch (err: any) {
            setError(err.message || 'Failed to load inquiries');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadInquiries();
    }, []);

    const handleViewInquiry = (inquiry: InvestorInquiry) => {
        setSelectedInquiry(inquiry);
        setShowModal(true);
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'pending': return <Badge bg="warning" text="dark">Pending</Badge>;
            case 'read': return <Badge bg="info">Read</Badge>;
            case 'archived': return <Badge bg="secondary">Archived</Badge>;
            default: return <Badge bg="light" text="dark">{status}</Badge>;
        }
    };

    return (
        <div className="p-4">
            <Card className="shadow-sm">
                <Card.Header className="bg-white d-flex justify-content-between align-items-center">
                    <h3 className="mb-0">Investor Inquiries</h3>
                    <Button variant="outline-primary" size="sm" onClick={loadInquiries}>
                        Refresh
                    </Button>
                </Card.Header>
                <Card.Body>
                    {error && <Alert variant="danger">{error}</Alert>}

                    {loading ? (
                        <div className="text-center p-5">
                            <Spinner animation="border" variant="primary" />
                            <p className="mt-2 text-muted">Loading inquiries...</p>
                        </div>
                    ) : (
                        <Table responsive hover className="align-middle">
                            <thead className="bg-light">
                                <tr>
                                    <th>Status</th>
                                    <th>Investor Name</th>
                                    <th>Organization</th>
                                    <th>Email</th>
                                    <th>Date</th>
                                    <th className="text-end">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {inquiries.length > 0 ? (
                                    inquiries.map((iq) => (
                                        <tr key={iq.id}>
                                            <td>{getStatusBadge(iq.status)}</td>
                                            <td className="fw-semibold">{iq.full_name}</td>
                                            <td>{iq.organization || <span className="text-muted">N/A</span>}</td>
                                            <td><a href={`mailto:${iq.email}`}>{iq.email}</a></td>
                                            <td className="text-muted">
                                                {new Date(iq.created_at).toLocaleDateString()}
                                            </td>
                                            <td className="text-end">
                                                <Button
                                                    variant="primary"
                                                    size="sm"
                                                    onClick={() => handleViewInquiry(iq)}
                                                >
                                                    View Details
                                                </Button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={6} className="text-center py-4 text-muted">
                                            No investor inquiries found.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </Table>
                    )}
                </Card.Body>
            </Card>

            <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
                <Modal.Header closeButton>
                    <Modal.Title>Investor Inquiry Details</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {selectedInquiry && (
                        <div className="p-2">
                            <div className="row mb-4">
                                <div className="col-md-6 mb-3">
                                    <label className="text-muted small d-block">Full Name</label>
                                    <span className="h5">{selectedInquiry.full_name}</span>
                                </div>
                                <div className="col-md-6 mb-3">
                                    <label className="text-muted small d-block">Organization / Fund</label>
                                    <span className="h5">{selectedInquiry.organization || 'N/A'}</span>
                                </div>
                                <div className="col-md-6 mb-3">
                                    <label className="text-muted small d-block">Email Address</label>
                                    <span className="h5"><a href={`mailto:${selectedInquiry.email}`}>{selectedInquiry.email}</a></span>
                                </div>
                                <div className="col-md-6 mb-3">
                                    <label className="text-muted small d-block">Submission Date</label>
                                    <span>{new Date(selectedInquiry.created_at).toLocaleString()}</span>
                                </div>
                            </div>

                            <hr />

                            <div className="mb-3">
                                <label className="text-muted small d-block mb-2">Area of Interest</label>
                                <div className="bg-light p-3 rounded" style={{ whiteSpace: 'pre-wrap', minHeight: '100px' }}>
                                    {selectedInquiry.area_of_interest || <span className="text-muted italic">No specific area of interest provided.</span>}
                                </div>
                            </div>
                        </div>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowModal(false)}>
                        Close
                    </Button>
                    {selectedInquiry && (
                        <Button variant="primary" href={`mailto:${selectedInquiry.email}?subject=Follow-up on your Investment Inquiry - Ethiopian IT Park`}>
                            Send Executive Reply
                        </Button>
                    )}
                </Modal.Footer>
            </Modal>
        </div>
    );
};

export default InvestorInquiriesPage;
