import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Form, Table, Modal, Alert, Spinner, Badge } from 'react-bootstrap';
import { FaPlus, FaEdit, FaTrash, FaEye, FaEyeSlash } from 'react-icons/fa';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import {
    getWhoWeAreSections,
    addWhoWeAreSection,
    updateWhoWeAreSection,
    deleteWhoWeAreSection,
    WhoWeAreSection
} from '../../services/apiService';
import DOMPurify from 'dompurify';
import './ManageWhoWeAre.css';

const ManageWhoWeAre: React.FC = () => {
    const [sections, setSections] = useState<WhoWeAreSection[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingSection, setEditingSection] = useState<WhoWeAreSection | null>(null);
    const [alert, setAlert] = useState<{ type: 'success' | 'danger'; message: string } | null>(null);

    const [formData, setFormData] = useState({
        section_type: 'section' as 'hero' | 'section' | 'features' | 'voice' | 'cta',
        title: '',
        subtitle: '',
        content: '',
        image_url: '',
        order_index: 0,
        is_active: true
    });

    const quillModules = {
        toolbar: [
            [{ 'header': [1, 2, 3, false] }],
            ['bold', 'italic', 'underline', 'strike'],
            [{ 'list': 'ordered' }, { 'list': 'bullet' }],
            ['link'],
            ['clean']
        ],
    };

    useEffect(() => {
        fetchSections();
    }, []);

    const fetchSections = async () => {
        try {
            setLoading(true);
            const data = await getWhoWeAreSections();
            setSections(data);
        } catch (error) {
            showAlert('danger', 'Failed to fetch sections');
        } finally {
            setLoading(false);
        }
    };

    const showAlert = (type: 'success' | 'danger', message: string) => {
        setAlert({ type, message });
        setTimeout(() => setAlert(null), 5000);
    };

    const handleOpenModal = (section?: WhoWeAreSection) => {
        if (section) {
            setEditingSection(section);
            setFormData({
                section_type: section.section_type,
                title: section.title || '',
                subtitle: section.subtitle || '',
                content: section.content || '',
                image_url: section.image_url || '',
                order_index: section.order_index,
                is_active: section.is_active
            });
        } else {
            setEditingSection(null);
            setFormData({
                section_type: 'section',
                title: '',
                subtitle: '',
                content: '',
                image_url: '',
                order_index: sections.length,
                is_active: true
            });
        }
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setEditingSection(null);
    };


    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            // Sanitize inputs
            const cleanFormData = {
                ...formData,
                title: DOMPurify.sanitize(formData.title || '', { ALLOWED_TAGS: [] }),
                subtitle: DOMPurify.sanitize(formData.subtitle || '', { ALLOWED_TAGS: [] }),
                section_type: DOMPurify.sanitize(formData.section_type || 'section', { ALLOWED_TAGS: [] }) as any,
                // For content (Rich Text), allow default safe tags
                content: DOMPurify.sanitize(formData.content || ''),
                image_url: DOMPurify.sanitize(formData.image_url || '', { ALLOWED_TAGS: [] })
            };

            if (editingSection) {
                await updateWhoWeAreSection(editingSection.id, cleanFormData);
                showAlert('success', 'Section updated successfully');
            } else {
                await addWhoWeAreSection(cleanFormData);
                showAlert('success', 'Section added successfully');
            }
            handleCloseModal();
            fetchSections();
        } catch (error) {
            showAlert('danger', `Failed to ${editingSection ? 'update' : 'add'} section`);
        }
    };

    const handleDelete = async (id: number) => {
        if (window.confirm('Are you sure you want to delete this section?')) {
            try {
                await deleteWhoWeAreSection(id);
                showAlert('success', 'Section deleted successfully');
                fetchSections();
            } catch (error) {
                showAlert('danger', 'Failed to delete section');
            }
        }
    };

    const getSectionTypeBadge = (type: string) => {
        const colors: Record<string, string> = {
            hero: 'primary',
            section: 'info',
            features: 'success',
            voice: 'warning',
            cta: 'danger'
        };
        return <Badge bg={colors[type] || 'secondary'}>{type}</Badge>;
    };

    return (
        <Container fluid className="manage-who-we-are-container py-4">
            <Row className="mb-4">
                <Col>
                    <h2 className="page-title">Manage "Who We Are" Content</h2>
                </Col>
                <Col className="text-end">
                    <Button variant="primary" onClick={() => handleOpenModal()}>
                        <FaPlus className="me-2" /> Add Section
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
                    <p className="mt-3">Loading sections...</p>
                </div>
            ) : (
                <Card>
                    <Card.Body>
                        <Table responsive hover>
                            <thead>
                                <tr>
                                    <th>Order</th>
                                    <th>Type</th>
                                    <th>Title</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {sections.map((section) => (
                                    <tr key={section.id}>
                                        <td>{section.order_index}</td>
                                        <td>{getSectionTypeBadge(section.section_type)}</td>
                                        <td>{section.title || <em className="text-muted">No title</em>}</td>
                                        <td>
                                            {section.is_active ? (
                                                <Badge bg="success"><FaEye /> Active</Badge>
                                            ) : (
                                                <Badge bg="secondary"><FaEyeSlash /> Inactive</Badge>
                                            )}
                                        </td>
                                        <td>
                                            <Button
                                                variant="outline-primary"
                                                size="sm"
                                                className="me-2"
                                                onClick={() => handleOpenModal(section)}
                                            >
                                                <FaEdit />
                                            </Button>
                                            <Button
                                                variant="outline-danger"
                                                size="sm"
                                                onClick={() => handleDelete(section.id)}
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

            <Modal show={showModal} onHide={handleCloseModal} size="xl">
                <Modal.Header closeButton>
                    <Modal.Title>{editingSection ? 'Edit' : 'Add'} Section</Modal.Title>
                </Modal.Header>
                <Form onSubmit={handleSubmit}>
                    <Modal.Body>
                        <Row>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Section Type *</Form.Label>
                                    <Form.Select
                                        value={formData.section_type}
                                        onChange={(e) => setFormData({ ...formData, section_type: e.target.value as any })}
                                        required
                                    >
                                        <option value="hero">Hero</option>
                                        <option value="section">Section</option>
                                        <option value="features">Features</option>
                                        <option value="voice">Voice/Quote</option>
                                        <option value="cta">Call to Action</option>
                                    </Form.Select>
                                </Form.Group>
                            </Col>
                            <Col md={3}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Display Order</Form.Label>
                                    <Form.Control
                                        type="number"
                                        value={formData.order_index}
                                        onChange={(e) => setFormData({ ...formData, order_index: parseInt(e.target.value) })}
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={3}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Status</Form.Label>
                                    <Form.Check
                                        type="switch"
                                        label={formData.is_active ? 'Active' : 'Inactive'}
                                        checked={formData.is_active}
                                        onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                                    />
                                </Form.Group>
                            </Col>
                        </Row>

                        <Form.Group className="mb-3">
                            <Form.Label>Title</Form.Label>
                            <Form.Control
                                type="text"
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                placeholder="Section title"
                            />
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>Subtitle</Form.Label>
                            <Form.Control
                                as="textarea"
                                rows={2}
                                value={formData.subtitle}
                                onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                                placeholder="Short description or subtitle"
                            />
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>Content (HTML/JSON)</Form.Label>
                            <ReactQuill
                                theme="snow"
                                value={formData.content}
                                onChange={(value) => setFormData({ ...formData, content: value })}
                                modules={quillModules}
                                style={{ height: '200px', marginBottom: '50px' }}
                            />
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>Image URL</Form.Label>
                            <Form.Control
                                type="text"
                                value={formData.image_url}
                                onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                                placeholder="/images/section.jpg or https://..."
                            />
                        </Form.Group>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={handleCloseModal}>
                            Cancel
                        </Button>
                        <Button variant="primary" type="submit">
                            {editingSection ? 'Update' : 'Add'} Section
                        </Button>
                    </Modal.Footer>
                </Form>
            </Modal>
        </Container>
    );
};

export default ManageWhoWeAre;
