import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Form, Table, Modal, Alert, Spinner } from 'react-bootstrap';
import { FaPlus, FaEdit, FaTrash, FaLinkedin, FaTwitter } from 'react-icons/fa';
import {
    getBoardMembers,
    addBoardMember,
    updateBoardMember,
    deleteBoardMember,
    BoardMember,
    fixImageUrl
} from '../../services/apiService';
import DOMPurify from 'dompurify';
import './ManageBoard.css';

const ManageBoard: React.FC = () => {
    const [boardMembers, setBoardMembers] = useState<BoardMember[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingMember, setEditingMember] = useState<BoardMember | null>(null);
    const [alert, setAlert] = useState<{ type: 'success' | 'danger'; message: string } | null>(null);
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string>('');
    const [useUrlInput, setUseUrlInput] = useState(true);

    const [formData, setFormData] = useState({
        name: '',
        english_name: '',
        position: '',
        bio: '',
        image_url: '',
        linkedin: '',
        twitter: '',
        order_index: 0
    });

    useEffect(() => {
        fetchBoardMembers();
    }, []);

    const fetchBoardMembers = async () => {
        try {
            setLoading(true);
            const data = await getBoardMembers();
            setBoardMembers(data);
        } catch (error) {
            showAlert('danger', 'Failed to fetch board members');
        } finally {
            setLoading(false);
        }
    };

    const showAlert = (type: 'success' | 'danger', message: string) => {
        setAlert({ type, message });
        setTimeout(() => setAlert(null), 5000);
    };

    const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setImageFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleOpenModal = (member?: BoardMember) => {
        if (member) {
            setEditingMember(member);
            setFormData({
                name: member.name,
                english_name: member.english_name || '',
                position: member.position || '',
                bio: member.bio || '',
                image_url: member.image_url || '',
                linkedin: member.linkedin || '',
                twitter: member.twitter || '',
                order_index: member.order_index
            });
            setImagePreview(member.image_url || '');
            setUseUrlInput(true);
        } else {
            setEditingMember(null);
            setFormData({
                name: '',
                english_name: '',
                position: '',
                bio: '',
                image_url: '',
                linkedin: '',
                twitter: '',
                order_index: boardMembers.length
            });
            setImagePreview('');
            setUseUrlInput(true);
        }
        setImageFile(null);
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setEditingMember(null);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            // Security: Frontend Sanitization
            const cleanName = DOMPurify.sanitize(formData.name, { ALLOWED_TAGS: [] }).trim();
            const cleanEnglishName = DOMPurify.sanitize(formData.english_name || '', { ALLOWED_TAGS: [] }).trim();
            const cleanPosition = DOMPurify.sanitize(formData.position, { ALLOWED_TAGS: [] }).trim();
            const cleanBio = DOMPurify.sanitize(formData.bio || '', { ALLOWED_TAGS: [] }).trim();
            const cleanLinkedin = DOMPurify.sanitize(formData.linkedin || '', { ALLOWED_TAGS: [] }).trim();
            const cleanTwitter = DOMPurify.sanitize(formData.twitter || '', { ALLOWED_TAGS: [] }).trim();

            if (!cleanName || !cleanPosition) {
                showAlert('danger', 'Name and Position cannot be empty after sanitization.');
                return;
            }

            let dataToSend: any;

            if (imageFile) {
                // Use FormData for file upload
                const formDataToSend = new FormData();
                formDataToSend.append('name', cleanName);
                formDataToSend.append('english_name', cleanEnglishName);
                formDataToSend.append('position', cleanPosition);
                formDataToSend.append('bio', cleanBio);
                formDataToSend.append('linkedin', cleanLinkedin);
                formDataToSend.append('twitter', cleanTwitter);
                formDataToSend.append('order_index', formData.order_index.toString());
                formDataToSend.append('imageFile', imageFile);
                dataToSend = formDataToSend;
            } else {
                // Use JSON for URL-based image
                dataToSend = {
                    ...formData,
                    name: cleanName,
                    english_name: cleanEnglishName,
                    position: cleanPosition,
                    bio: cleanBio,
                    linkedin: cleanLinkedin,
                    twitter: cleanTwitter
                };
            }

            if (editingMember) {
                await updateBoardMember(editingMember.id, dataToSend);
                showAlert('success', 'Board member updated successfully');
            } else {
                await addBoardMember(dataToSend);
                showAlert('success', 'Board member added successfully');
            }
            handleCloseModal();
            fetchBoardMembers();
        } catch (error) {
            showAlert('danger', `Failed to ${editingMember ? 'update' : 'add'} board member`);
        }
    };

    const handleDelete = async (id: number) => {
        if (window.confirm('Are you sure you want to delete this board member?')) {
            try {
                await deleteBoardMember(id);
                showAlert('success', 'Board member deleted successfully');
                fetchBoardMembers();
            } catch (error) {
                showAlert('danger', 'Failed to delete board member');
            }
        }
    };

    return (
        <Container fluid className="manage-board-container py-4">
            <Row className="mb-4">
                <Col>
                    <h2 className="page-title">Manage Board Members</h2>
                </Col>
                <Col className="text-end">
                    <Button variant="primary" onClick={() => handleOpenModal()}>
                        <FaPlus className="me-2" /> Add Board Member
                    </Button>
                </Col>
            </Row>

            {alert && (
                <Alert variant={alert.type} dismissible onClose={() => setAlert(null)}>
                    {alert.message}
                </Alert>
            )}

            {loading ? (
                <div className="text-center py-5">
                    <Spinner animation="border" variant="primary" />
                    <p className="mt-3">Loading board members...</p>
                </div>
            ) : (
                <Card>
                    <Card.Body>
                        <Table responsive hover>
                            <thead>
                                <tr>
                                    <th>Order</th>
                                    <th>Name (Amharic)</th>
                                    <th>Name (English)</th>
                                    <th>Position</th>
                                    <th>Social Links</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {boardMembers.map((member) => (
                                    <tr key={member.id}>
                                        <td>{member.order_index}</td>
                                        <td>{member.name}</td>
                                        <td>{member.english_name}</td>
                                        <td className="text-truncate" style={{ maxWidth: '300px' }}>{member.position}</td>
                                        <td>
                                            {member.linkedin && member.linkedin !== '#' && (
                                                <a href={member.linkedin} target="_blank" rel="noopener noreferrer" className="me-2">
                                                    <FaLinkedin />
                                                </a>
                                            )}
                                            {member.twitter && member.twitter !== '#' && (
                                                <a href={member.twitter} target="_blank" rel="noopener noreferrer">
                                                    <FaTwitter />
                                                </a>
                                            )}
                                        </td>
                                        <td>
                                            <Button
                                                variant="outline-primary"
                                                size="sm"
                                                className="me-2"
                                                onClick={() => handleOpenModal(member)}
                                            >
                                                <FaEdit />
                                            </Button>
                                            <Button
                                                variant="outline-danger"
                                                size="sm"
                                                onClick={() => handleDelete(member.id)}
                                            >
                                                <FaTrash />
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </Table>
                    </Card.Body>
                </Card>
            )}

            <Modal show={showModal} onHide={handleCloseModal} size="lg">
                <Modal.Header closeButton>
                    <Modal.Title>{editingMember ? 'Edit' : 'Add'} Board Member</Modal.Title>
                </Modal.Header>
                <Form onSubmit={handleSubmit}>
                    <Modal.Body>
                        <Row>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Name (Amharic) *</Form.Label>
                                    <Form.Control
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        required
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Name (English)</Form.Label>
                                    <Form.Control
                                        type="text"
                                        value={formData.english_name}
                                        onChange={(e) => setFormData({ ...formData, english_name: e.target.value })}
                                    />
                                </Form.Group>
                            </Col>
                        </Row>

                        <Form.Group className="mb-3">
                            <Form.Label>Position *</Form.Label>
                            <Form.Control
                                type="text"
                                value={formData.position}
                                onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                                required
                            />
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>Bio</Form.Label>
                            <Form.Control
                                as="textarea"
                                rows={4}
                                value={formData.bio}
                                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                            />
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>Member Image</Form.Label>
                            <div className="mb-2">
                                <Form.Check
                                    inline
                                    type="radio"
                                    label="Use URL"
                                    checked={useUrlInput}
                                    onChange={() => {
                                        setUseUrlInput(true);
                                        setImageFile(null);
                                    }}
                                />
                                <Form.Check
                                    inline
                                    type="radio"
                                    label="Upload File"
                                    checked={!useUrlInput}
                                    onChange={() => setUseUrlInput(false)}
                                />
                            </div>

                            {useUrlInput ? (
                                <Form.Control
                                    type="text"
                                    value={formData.image_url}
                                    onChange={(e) => {
                                        setFormData({ ...formData, image_url: e.target.value });
                                        setImagePreview(e.target.value);
                                    }}
                                    placeholder="/images/member.jpg or https://example.com/image.jpg"
                                />
                            ) : (
                                <Form.Control
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageFileChange}
                                />
                            )}

                            {imagePreview && (
                                <div className="mt-3">
                                    <img
                                        src={imagePreview.startsWith('blob:') ? imagePreview : (fixImageUrl(imagePreview) || '')}
                                        alt="Preview"
                                        style={{ maxWidth: '200px', maxHeight: '200px', objectFit: 'cover', borderRadius: '8px' }}
                                    />
                                </div>
                            )}
                        </Form.Group>

                        <Row>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>LinkedIn URL</Form.Label>
                                    <Form.Control
                                        type="url"
                                        value={formData.linkedin}
                                        onChange={(e) => setFormData({ ...formData, linkedin: e.target.value })}
                                        placeholder="https://linkedin.com/in/..."
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Twitter URL</Form.Label>
                                    <Form.Control
                                        type="url"
                                        value={formData.twitter}
                                        onChange={(e) => setFormData({ ...formData, twitter: e.target.value })}
                                        placeholder="https://x.com/..."
                                    />
                                </Form.Group>
                            </Col>
                        </Row>

                        <Form.Group className="mb-3">
                            <Form.Label>Display Order</Form.Label>
                            <Form.Control
                                type="number"
                                value={formData.order_index}
                                onChange={(e) => setFormData({ ...formData, order_index: parseInt(e.target.value) })}
                            />
                        </Form.Group>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={handleCloseModal}>
                            Cancel
                        </Button>
                        <Button variant="primary" type="submit">
                            {editingMember ? 'Update' : 'Add'} Member
                        </Button>
                    </Modal.Footer>
                </Form>
            </Modal>
        </Container>
    );
};

export default ManageBoard;
