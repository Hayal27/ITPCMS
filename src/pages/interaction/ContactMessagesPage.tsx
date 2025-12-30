import React, { useState, useEffect } from 'react';
import { Table, Button, Badge, Spinner, Alert, Card, Modal } from 'react-bootstrap';
import { getContactMessages, markMessageAsRead, deleteContactMessage, ContactMessage } from '../../services/apiService';

const ContactMessagesPage: React.FC = () => {
    const [messages, setMessages] = useState<ContactMessage[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null);
    const [showModal, setShowModal] = useState(false);

    const loadMessages = async () => {
        setLoading(true);
        try {
            const data = await getContactMessages();
            setMessages(data);
            setError(null);
        } catch (err: any) {
            setError(err.message || 'Failed to load messages');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadMessages();
    }, []);

    const handleViewMessage = async (message: ContactMessage) => {
        setSelectedMessage(message);
        setShowModal(true);
        if (message.status === 'new') {
            try {
                await markMessageAsRead(message.id);
                setMessages(messages.map(m => m.id === message.id ? { ...m, status: 'read' } : m));
            } catch (err) {
                console.error('Failed to mark message as read', err);
            }
        }
    };

    const handleDelete = async (id: number) => {
        if (window.confirm('Are you sure you want to delete this message?')) {
            try {
                await deleteContactMessage(id);
                setMessages(messages.filter(m => m.id !== id));
            } catch (err: any) {
                alert(err.message || 'Failed to delete message');
            }
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'new': return <Badge bg="primary">New</Badge>;
            case 'read': return <Badge bg="secondary">Read</Badge>;
            case 'replied': return <Badge bg="success">Replied</Badge>;
            default: return <Badge bg="info">{status}</Badge>;
        }
    };

    return (
        <div className="p-4">
            <Card className="shadow-sm">
                <Card.Header className="bg-white d-flex justify-content-between align-items-center">
                    <h3 className="mb-0">Contact Messages</h3>
                    <Button variant="outline-primary" size="sm" onClick={loadMessages}>
                        Refresh
                    </Button>
                </Card.Header>
                <Card.Body>
                    {error && <Alert variant="danger">{error}</Alert>}

                    {loading ? (
                        <div className="text-center p-5">
                            <Spinner animation="border" variant="primary" />
                            <p className="mt-2 text-muted">Loading messages...</p>
                        </div>
                    ) : (
                        <Table responsive hover className="align-middle">
                            <thead className="bg-light">
                                <tr>
                                    <th>Status</th>
                                    <th>From</th>
                                    <th>Email</th>
                                    <th>Date</th>
                                    <th className="text-end">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {messages.length > 0 ? (
                                    messages.map((msg) => (
                                        <tr key={msg.id}>
                                            <td>{getStatusBadge(msg.status)}</td>
                                            <td className="fw-semibold">{msg.name}</td>
                                            <td><a href={`mailto:${msg.email}`}>{msg.email}</a></td>
                                            <td className="text-muted">
                                                {new Date(msg.created_at).toLocaleDateString()}
                                            </td>
                                            <td className="text-end">
                                                <Button
                                                    variant="info"
                                                    size="sm"
                                                    className="me-2 text-white"
                                                    onClick={() => handleViewMessage(msg)}
                                                >
                                                    View
                                                </Button>
                                                <Button
                                                    variant="danger"
                                                    size="sm"
                                                    onClick={() => handleDelete(msg.id)}
                                                >
                                                    Delete
                                                </Button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={5} className="text-center py-4 text-muted">
                                            No messages found.
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
                    <Modal.Title>Message Content</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {selectedMessage && (
                        <div>
                            <div className="row mb-3">
                                <div className="col-md-6">
                                    <strong>From:</strong> {selectedMessage.name}
                                </div>
                                <div className="col-md-6">
                                    <strong>Email:</strong> {selectedMessage.email}
                                </div>
                            </div>
                            <div className="row mb-3">
                                <div className="col-md-6">
                                    <strong>Phone:</strong> {selectedMessage.phone || 'N/A'}
                                </div>
                                <div className="col-md-6">
                                    <strong>Date:</strong> {new Date(selectedMessage.created_at).toLocaleString()}
                                </div>
                            </div>
                            <hr />
                            <div className="bg-light p-3 rounded">
                                <p style={{ whiteSpace: 'pre-wrap' }}>{selectedMessage.message}</p>
                            </div>
                        </div>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowModal(false)}>
                        Close
                    </Button>
                    {selectedMessage && (
                        <Button variant="primary" href={`mailto:${selectedMessage.email}`}>
                            Reply via Email
                        </Button>
                    )}
                </Modal.Footer>
            </Modal>
        </div>
    );
};

export default ContactMessagesPage;
