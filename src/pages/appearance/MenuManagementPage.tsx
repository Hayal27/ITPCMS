import React, { useEffect, useState } from 'react';
import { getAllMenus, createMenu, updateMenu, deleteMenu, Menu } from '../../services/apiService';
import { Modal, Button, Form, Table, Badge, Spinner, Alert } from 'react-bootstrap';

const MenuManagementPage: React.FC = () => {
    const [menus, setMenus] = useState<Menu[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showModal, setShowModal] = useState(false);
    const [editingMenu, setEditingMenu] = useState<Menu | null>(null);

    const [formData, setFormData] = useState({
        title: '',
        path: '',
        icon: '',
        color: 'blue',
        parent_id: '',
        order_index: 0,
        is_section: false,
        is_dropdown: false,
        is_active: true
    });

    const fetchMenus = async () => {
        setLoading(true);
        try {
            const data = await getAllMenus();
            setMenus(data);
            setError(null);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMenus();
    }, []);

    const handleShowModal = (menu: Menu | null = null) => {
        if (menu) {
            setEditingMenu(menu);
            setFormData({
                title: menu.title,
                path: menu.path || '',
                icon: menu.icon || '',
                color: menu.color || 'blue',
                parent_id: menu.parent_id?.toString() || '',
                order_index: menu.order_index,
                is_section: menu.is_section,
                is_dropdown: menu.is_dropdown,
                is_active: menu.is_active
            });
        } else {
            setEditingMenu(null);
            setFormData({
                title: '',
                path: '',
                icon: '',
                color: 'blue',
                parent_id: '',
                order_index: (menus.length > 0 ? Math.max(...menus.map(m => m.order_index)) + 1 : 0),
                is_section: false,
                is_dropdown: false,
                is_active: true
            });
        }
        setShowModal(true);
    };

    const handleCloseModal = () => setShowModal(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const payload = {
                ...formData,
                parent_id: formData.parent_id === '' ? null : parseInt(formData.parent_id)
            };
            if (editingMenu) {
                await updateMenu(editingMenu.id, payload);
            } else {
                await createMenu(payload);
            }
            handleCloseModal();
            fetchMenus();
        } catch (err: any) {
            alert('Error saving menu: ' + err.message);
        }
    };

    const handleDelete = async (id: number) => {
        if (window.confirm('Are you sure you want to delete this menu item? All children will also be deleted (cascade).')) {
            try {
                await deleteMenu(id);
                fetchMenus();
            } catch (err: any) {
                alert('Error deleting menu: ' + err.message);
            }
        }
    };

    const getParentTitle = (parentId: number | null | undefined) => {
        if (!parentId) return '-';
        const parent = menus.find(m => m.id === parentId);
        return parent ? parent.title : 'Unknown';
    };

    if (loading && menus.length === 0) {
        return (
            <div className="d-flex justify-content-center align-items-center" style={{ height: '400px' }}>
                <Spinner animation="border" variant="primary" />
            </div>
        );
    }

    return (
        <div className="container-fluid mb-5">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h1 className="h3 text-gray-800">Menu Management</h1>
                <Button variant="primary" onClick={() => handleShowModal()}>
                    <i className="fas fa-plus mr-2"></i>Add Menu Item
                </Button>
            </div>

            {error && <Alert variant="danger">{error}</Alert>}

            <div className="card shadow border-0">
                <div className="card-body p-0">
                    <Table hover responsive className="mb-0">
                        <thead className="bg-light">
                            <tr>
                                <th>#</th>
                                <th>Title</th>
                                <th>Path</th>
                                <th>Parent</th>
                                <th>Type</th>
                                <th>Order</th>
                                <th>Status</th>
                                <th className="text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {menus.map((menu, index) => (
                                <tr key={menu.id}>
                                    <td>{index + 1}</td>
                                    <td>
                                        <div className="d-flex align-items-center">
                                            <div
                                                className="mr-3 border rounded p-1 bg-light d-flex align-items-center justify-content-center"
                                                style={{ width: '32px', height: '32px' }}
                                                dangerouslySetInnerHTML={{ __html: menu.icon || '' }}
                                            />
                                            <span className={menu.is_section ? 'font-weight-bold' : ''}>{menu.title}</span>
                                        </div>
                                    </td>
                                    <td><code>{menu.path || '-'}</code></td>
                                    <td>{getParentTitle(menu.parent_id)}</td>
                                    <td>
                                        {menu.is_section && <Badge bg="dark" className='mr-1'>Section</Badge>}
                                        {menu.is_dropdown && <Badge bg="info" className='mr-1'>Dropdown</Badge>}
                                        {!menu.is_section && !menu.is_dropdown && <Badge bg="secondary">Link</Badge>}
                                    </td>
                                    <td>{menu.order_index}</td>
                                    <td>
                                        {menu.is_active ? <Badge bg="success">Active</Badge> : <Badge bg="danger">Inactive</Badge>}
                                    </td>
                                    <td className="text-center">
                                        <div className="btn-group">
                                            <Button variant="outline-info" size="sm" onClick={() => handleShowModal(menu)}>
                                                <i className="fas fa-edit"></i>
                                            </Button>
                                            <Button variant="outline-danger" size="sm" onClick={() => handleDelete(menu.id)}>
                                                <i className="fas fa-trash"></i>
                                            </Button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                </div>
            </div>

            <Modal show={showModal} onHide={handleCloseModal} size="lg">
                <Modal.Header closeButton>
                    <Modal.Title>{editingMenu ? 'Edit Menu Item' : 'Add Menu Item'}</Modal.Title>
                </Modal.Header>
                <Form onSubmit={handleSubmit}>
                    <Modal.Body>
                        <div className="row">
                            <div className="col-md-6 mb-3">
                                <Form.Group>
                                    <Form.Label>Title</Form.Label>
                                    <Form.Control
                                        type="text"
                                        value={formData.title}
                                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                        required
                                    />
                                </Form.Group>
                            </div>
                            <div className="col-md-6 mb-3">
                                <Form.Group>
                                    <Form.Label>Path (URL)</Form.Label>
                                    <Form.Control
                                        type="text"
                                        value={formData.path}
                                        onChange={(e) => setFormData({ ...formData, path: e.target.value })}
                                        placeholder="/example"
                                    />
                                </Form.Group>
                            </div>
                            <div className="col-md-12 mb-3">
                                <Form.Group>
                                    <Form.Label>Icon (SVG HTML or Icon Class)</Form.Label>
                                    <Form.Control
                                        as="textarea"
                                        rows={3}
                                        value={formData.icon}
                                        onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                                        placeholder='<svg ...> or "fas fa-home"'
                                    />
                                </Form.Group>
                            </div>
                            <div className="col-md-4 mb-3">
                                <Form.Group>
                                    <Form.Label>Color Theme</Form.Label>
                                    <Form.Select
                                        value={formData.color}
                                        onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                                    >
                                        <option value="blue">Blue</option>
                                        <option value="emerald">Emerald</option>
                                        <option value="amber">Amber</option>
                                        <option value="rose">Rose</option>
                                        <option value="violet">Violet</option>
                                        <option value="indigo">Indigo</option>
                                        <option value="cyan">Cyan</option>
                                        <option value="orange">Orange</option>
                                        <option value="pink">Pink</option>
                                        <option value="lime">Lime</option>
                                        <option value="sky">Sky</option>
                                        <option value="fuchsia">Fuchsia</option>
                                        <option value="slate">Slate</option>
                                        <option value="red">Red</option>
                                        <option value="green">Green</option>
                                        <option value="purple">Purple</option>
                                        <option value="teal">Teal</option>
                                    </Form.Select>
                                </Form.Group>
                            </div>
                            <div className="col-md-4 mb-3">
                                <Form.Group>
                                    <Form.Label>Parent Menu</Form.Label>
                                    <Form.Select
                                        value={formData.parent_id}
                                        onChange={(e) => setFormData({ ...formData, parent_id: e.target.value })}
                                    >
                                        <option value="">None (Root)</option>
                                        {menus.filter(m => (m.is_section || m.is_dropdown) && m.id !== editingMenu?.id).map(m => (
                                            <option key={m.id} value={m.id}>{m.title}</option>
                                        ))}
                                    </Form.Select>
                                </Form.Group>
                            </div>
                            <div className="col-md-4 mb-3">
                                <Form.Group>
                                    <Form.Label>Order Index</Form.Label>
                                    <Form.Control
                                        type="number"
                                        value={formData.order_index}
                                        onChange={(e) => setFormData({ ...formData, order_index: parseInt(e.target.value) })}
                                    />
                                </Form.Group>
                            </div>
                            <div className="col-md-12">
                                <div className="d-flex gap-4">
                                    <Form.Check
                                        type="checkbox"
                                        label="Is Section Divider?"
                                        checked={formData.is_section}
                                        onChange={(e) => setFormData({ ...formData, is_section: e.target.checked })}
                                    />
                                    <Form.Check
                                        type="checkbox"
                                        label="Is Dropdown?"
                                        checked={formData.is_dropdown}
                                        onChange={(e) => setFormData({ ...formData, is_dropdown: e.target.checked })}
                                    />
                                    <Form.Check
                                        type="checkbox"
                                        label="Is Active?"
                                        checked={formData.is_active}
                                        onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                                    />
                                </div>
                            </div>
                        </div>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={handleCloseModal}>Cancel</Button>
                        <Button variant="primary" type="submit">save Changes</Button>
                    </Modal.Footer>
                </Form>
            </Modal>
        </div>
    );
};

export default MenuManagementPage;
