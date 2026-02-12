import React, { useEffect, useState, useMemo } from 'react';
import { getAllMenus, createMenu, updateMenu, deleteMenu, Menu } from '../../services/apiService';
import { Modal, Button, Form, Table, Badge, Spinner, Alert, InputGroup } from 'react-bootstrap';
import {
    HiPlus,
    HiSearch,
    HiOutlineChevronRight,
    HiOutlineChevronDown,
    HiOutlinePencilAlt,
    HiOutlineTrash,
    HiOutlineExternalLink,
    HiOutlineCollection,
    HiOutlineViewGrid,
    HiOutlineAdjustments,
    HiOutlineHashtag,
    HiShieldCheck,
    HiExclamation
} from 'react-icons/hi';
import { motion, AnimatePresence } from 'framer-motion';
import DOMPurify from 'dompurify';
import validator from 'validator';

interface MenuNode extends Menu {
    children: MenuNode[];
}

const MenuManagementPage: React.FC = () => {
    const [menus, setMenus] = useState<Menu[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showModal, setShowModal] = useState(false);
    const [editingMenu, setEditingMenu] = useState<Menu | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());
    const [filterType, setFilterType] = useState<'all' | 'section' | 'dropdown' | 'link'>('all');

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
            // Sort by order_index initially
            setMenus(data.sort((a, b) => a.order_index - b.order_index));
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

    const toggleRow = (id: number) => {
        const newExpanded = new Set(expandedRows);
        if (newExpanded.has(id)) {
            newExpanded.delete(id);
        } else {
            newExpanded.add(id);
        }
        setExpandedRows(newExpanded);
    };

    // Transform flat menus into a tree structure
    const menuTree = useMemo(() => {
        const buildTree = (parentId: number | null): MenuNode[] => {
            return menus
                .filter(m => m.parent_id === parentId)
                .map(m => ({
                    ...m,
                    children: buildTree(m.id)
                }))
                .sort((a, b) => a.order_index - b.order_index);
        };

        const filtered = menus.filter(m => {
            const matchesSearch = m.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                m.path?.toLowerCase().includes(searchTerm.toLowerCase());

            const matchesType = filterType === 'all' ||
                (filterType === 'section' && m.is_section) ||
                (filterType === 'dropdown' && m.is_dropdown) ||
                (filterType === 'link' && !m.is_section && !m.is_dropdown);

            return matchesSearch && matchesType;
        });

        // If searching or filtering, we might want a flat view or a partial tree
        // For simplicity, let's keep the tree structure but only show branches that have matches
        // Actually, for search, a flat view is often better, but the user asked for tree format.
        // Let's implement tree search: show parent if any child matches, or if parent itself matches.

        const getHierarchicalFiltered = (nodes: MenuNode[]): MenuNode[] => {
            return nodes.reduce((acc: MenuNode[], node) => {
                const childMatches = getHierarchicalFiltered(node.children);
                const nodeMatches = node.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    node.path?.toLowerCase().includes(searchTerm.toLowerCase());

                const typeMatches = filterType === 'all' ||
                    (filterType === 'section' && node.is_section) ||
                    (filterType === 'dropdown' && node.is_dropdown) ||
                    (filterType === 'link' && !node.is_section && !node.is_dropdown);

                if (nodeMatches && typeMatches || childMatches.length > 0) {
                    acc.push({ ...node, children: childMatches });
                    // Auto-expand if searching and there are children
                    if (searchTerm && childMatches.length > 0) {
                        setExpandedRows(prev => new Set(prev).add(node.id));
                    }
                }
                return acc;
            }, []);
        };

        const fullTree = buildTree(null);
        return (searchTerm || filterType !== 'all') ? getHierarchicalFiltered(fullTree) : fullTree;
    }, [menus, searchTerm, filterType]);

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

    const handleToggleStatus = async (menu: Menu) => {
        try {
            await updateMenu(menu.id, { ...menu, is_active: !menu.is_active });
            fetchMenus();
        } catch (err: any) {
            alert('Error updating status: ' + err.message);
        }
    };

    const handleCloseModal = () => setShowModal(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // 1. Frontend Security Validation & Sanitization
        const cleanTitle = DOMPurify.sanitize(formData.title, { ALLOWED_TAGS: [] }).trim();
        const cleanPath = DOMPurify.sanitize(formData.path, { ALLOWED_TAGS: [] }).trim();

        // For icons, we allow a very restricted subset of SVG if it's an SVG string
        // otherwise we strip it.
        const cleanIcon = formData.icon.includes('<svg')
            ? DOMPurify.sanitize(formData.icon, {
                USE_PROFILES: { svg: true },
                ALLOWED_TAGS: ['svg', 'path', 'circle', 'rect', 'line', 'polyline', 'polygon', 'ellipse', 'g'],
                ALLOWED_ATTR: ['d', 'cx', 'cy', 'r', 'x', 'y', 'width', 'height', 'fill', 'stroke', 'viewBox', 'xmlns', 'points']
            })
            : DOMPurify.sanitize(formData.icon, { ALLOWED_TAGS: [] }).trim();

        if (validator.isEmpty(cleanTitle)) {
            setError("Title cannot be empty after sanitization.");
            return;
        }

        try {
            const payload = {
                ...formData,
                title: cleanTitle,
                path: cleanPath,
                icon: cleanIcon,
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
            setError('Security or Server Error: ' + err.message);
        }
    };

    const handleDelete = async (id: number) => {
        if (window.confirm('Are you sure you want to delete this menu item? All children will also be deleted.')) {
            try {
                await deleteMenu(id);
                fetchMenus();
            } catch (err: any) {
                alert('Error deleting menu: ' + err.message);
            }
        }
    };

    const renderMenuRows = (nodes: MenuNode[], depth: number = 0) => {
        return nodes.map((menu) => (
            <React.Fragment key={menu.id}>
                <motion.tr
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                    className={`${menu.is_section ? 'bg-light/50 font-weight-bold' : ''} hover-row`}
                >
                    <td style={{ paddingLeft: `${depth * 2.5 + 1}rem` }}>
                        <div className="d-flex align-items-center">
                            {menu.children.length > 0 ? (
                                <button
                                    className="btn btn-link btn-sm p-0 mr-2 text-decoration-none text-dark"
                                    onClick={() => toggleRow(menu.id)}
                                >
                                    {expandedRows.has(menu.id) ? <HiOutlineChevronDown /> : <HiOutlineChevronRight />}
                                </button>
                            ) : (
                                <div style={{ width: '20px' }}></div>
                            )}
                            <div
                                className={`mr-3 border rounded p-1 bg-white shadow-sm d-flex align-items-center justify-content-center text-${menu.color || 'blue'}-500`}
                                style={{ width: '34px', height: '34px', overflow: 'hidden' }}
                                dangerouslySetInnerHTML={{
                                    __html: menu.icon && menu.icon.includes('<svg')
                                        ? DOMPurify.sanitize(menu.icon, { USE_PROFILES: { svg: true } })
                                        : ''
                                }}
                            >
                            </div>
                            {!menu.icon || !menu.icon.includes('<svg') ? (
                                <div className={`mr-1 text-${menu.color || 'blue'}-500`}><HiOutlineCollection size={20} /></div>
                            ) : null}
                            <div className="d-flex flex-column">
                                <span className="mb-0">{menu.title}</span>
                                {menu.is_section && <small className="text-muted text-uppercase" style={{ fontSize: '0.65rem', letterSpacing: '0.05em' }}>Section Divider</small>}
                            </div>
                        </div>
                    </td>
                    <td>
                        <code className="text-primary bg-light px-2 py-1 rounded small">
                            {menu.path || '/'}
                        </code>
                    </td>
                    <td>
                        <div className="d-flex gap-1 flex-wrap">
                            {menu.is_section && <Badge bg="dark" className="px-2 py-1 rounded-pill">Section</Badge>}
                            {menu.is_dropdown && <Badge bg="info" className="px-2 py-1 rounded-pill text-white">Dropdown</Badge>}
                            {!menu.is_section && !menu.is_dropdown && <Badge bg="secondary" className="px-2 py-1 rounded-pill bg-opacity-75">Link</Badge>}
                        </div>
                    </td>
                    <td>
                        <Badge pill bg="light" className="text-dark border px-3 py-1">
                            <HiOutlineHashtag className="mr-1" />{menu.order_index}
                        </Badge>
                    </td>
                    <td>
                        <Form.Check
                            type="switch"
                            id={`status-switch-${menu.id}`}
                            checked={menu.is_active}
                            onChange={() => handleToggleStatus(menu)}
                            className="status-toggle-switch"
                            label={menu.is_active ? 'Active' : 'Inactive'}
                        />
                    </td>
                    <td className="text-end">
                        <div className="d-flex justify-content-end gap-2">
                            <Button
                                variant="outline-primary"
                                size="sm"
                                className="rounded-circle p-2 shadow-sm border-0"
                                onClick={() => handleShowModal(menu)}
                                title="Edit"
                            >
                                <HiOutlinePencilAlt size={16} />
                            </Button>
                            <Button
                                variant="outline-danger"
                                size="sm"
                                className="rounded-circle p-2 shadow-sm border-0"
                                onClick={() => handleDelete(menu.id)}
                                title="Delete"
                            >
                                <HiOutlineTrash size={16} />
                            </Button>
                        </div>
                    </td>
                </motion.tr>
                <AnimatePresence>
                    {expandedRows.has(menu.id) && menu.children.length > 0 && (
                        renderMenuRows(menu.children, depth + 1)
                    )}
                </AnimatePresence>
            </React.Fragment>
        ));
    };

    return (
        <div className="container-fluid py-4 min-vh-100 bg-light/30">
            {/* Header Section */}
            <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-5 gap-3">
                <div>
                    <h1 className="h2 font-weight-bold text-dark mb-1 flex align-items-center">
                        <HiOutlineAdjustments className="mr-3 text-primary" />
                        Menu Management
                    </h1>
                    <p className="text-muted mb-0">Configure your application's navigation structure and visual identity.</p>
                </div>
                <Button
                    variant="primary"
                    className="shadow-lg px-4 py-2 rounded-xl border-0 bg-gradient-primary d-flex align-items-center"
                    onClick={() => handleShowModal()}
                >
                    <HiPlus className="mr-2" size={20} />
                    Add Menu Item
                </Button>
            </div>

            {error && <Alert variant="danger" className="rounded-xl shadow-sm mb-4">{error}</Alert>}

            {/* Controls Section */}
            <div className="row mb-4">
                <div className="col-lg-8">
                    <div className="card border-0 shadow-sm rounded-xl overflow-hidden mb-4 mb-lg-0">
                        <div className="card-body p-3">
                            <div className="row g-3">
                                <div className="col-md-7">
                                    <InputGroup className="bg-light border-0 rounded-lg overflow-hidden">
                                        <InputGroup.Text className="bg-transparent border-0 text-muted pl-3">
                                            <HiSearch size={20} />
                                        </InputGroup.Text>
                                        <Form.Control
                                            placeholder="Search menus by title or path..."
                                            className="bg-transparent border-0 py-3 shadow-none"
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                        />
                                    </InputGroup>
                                </div>
                                <div className="col-md-5">
                                    <Form.Select
                                        className="bg-light border-0 py-3 rounded-lg shadow-none"
                                        value={filterType}
                                        onChange={(e) => setFilterType(e.target.value as any)}
                                    >
                                        <option value="all">All Types</option>
                                        <option value="section">Section Dividers</option>
                                        <option value="dropdown">Dropdown Menus</option>
                                        <option value="link">Direct Links</option>
                                    </Form.Select>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="col-lg-4">
                    <div className="card border-0 shadow-sm rounded-xl h-100 text-center d-flex align-items-center justify-content-center p-3 bg-gradient-to-br from-white to-slate-50">
                        <div className="d-flex align-items-center gap-3">
                            <div className="d-flex flex-column">
                                <span className="h4 font-weight-bold mb-0 text-primary">{menus.length}</span>
                                <span className="text-muted small">Total Items</span>
                            </div>
                            <div className="vr mx-3 h-50"></div>
                            <div className="d-flex flex-column">
                                <span className="h4 font-weight-bold mb-0 text-success">{menus.filter(m => m.is_active).length}</span>
                                <span className="text-muted small">Active</span>
                            </div>
                            <div className="vr mx-3 h-50"></div>
                            <div className="d-flex flex-column">
                                <span className="h4 font-weight-bold mb-0 text-info">{menus.filter(m => m.parent_id === null).length}</span>
                                <span className="text-muted small">Root Nodes</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Table Card */}
            <div className="card border-0 shadow-xl rounded-2xl overflow-hidden">
                <div className="card-body p-0">
                    <div className="table-responsive" style={{ minHeight: '400px' }}>
                        <Table hover className="mb-0 custom-tree-table">
                            <thead className="bg-dark text-white opacity-90 border-0">
                                <tr>
                                    <th className="py-4 px-4 font-weight-semibold" style={{ width: '40%' }}>Title & Icon</th>
                                    <th className="py-4 font-weight-semibold">Path</th>
                                    <th className="py-4 font-weight-semibold">Type</th>
                                    <th className="py-4 font-weight-semibold">Order</th>
                                    <th className="py-4 font-weight-semibold">Status</th>
                                    <th className="py-4 px-4 text-end font-weight-semibold">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr>
                                        <td colSpan={6} className="text-center py-5">
                                            <Spinner animation="border" variant="primary" />
                                            <p className="mt-2 text-muted">Building navigation tree...</p>
                                        </td>
                                    </tr>
                                ) : menuTree.length > 0 ? (
                                    renderMenuRows(menuTree)
                                ) : (
                                    <tr>
                                        <td colSpan={6} className="text-center py-5">
                                            <div className="text-muted opacity-50 mb-3">
                                                <HiOutlineViewGrid size={64} />
                                            </div>
                                            <h5 className="text-dark">No menus found</h5>
                                            <p>Try adjusting your search or filter criteria.</p>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </Table>
                    </div>
                </div>
            </div>

            {/* Modal remains largely same but updated styling */}
            <Modal show={showModal} onHide={handleCloseModal} size="lg" centered className="premium-modal">
                <Modal.Header closeButton className="border-0 pb-0">
                    <Modal.Title className="h4 font-weight-bold">
                        {editingMenu ? (
                            <span className="d-flex align-items-center">
                                <HiOutlinePencilAlt className="mr-2 text-primary" /> Edit Menu Item
                            </span>
                        ) : (
                            <span className="d-flex align-items-center">
                                <HiPlus className="mr-2 text-primary" /> Add New Menu Item
                            </span>
                        )}
                    </Modal.Title>
                </Modal.Header>
                <Form onSubmit={handleSubmit}>
                    <Modal.Body className="pt-4">
                        <div className="row">
                            <div className="col-md-6 mb-4">
                                <Form.Group>
                                    <Form.Label className="font-weight-semibold small text-muted text-uppercase mb-2">Menu Title</Form.Label>
                                    <Form.Control
                                        type="text"
                                        className="bg-light border-0 py-3 rounded-lg shadow-none focus-primary"
                                        value={formData.title}
                                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                        placeholder="e.g. Dashboards"
                                        required
                                    />
                                </Form.Group>
                            </div>
                            <div className="col-md-6 mb-4">
                                <Form.Group>
                                    <Form.Label className="font-weight-semibold small text-muted text-uppercase mb-2">Navigation Path</Form.Label>
                                    <Form.Control
                                        type="text"
                                        className="bg-light border-0 py-3 rounded-lg shadow-none"
                                        value={formData.path}
                                        onChange={(e) => setFormData({ ...formData, path: e.target.value })}
                                        placeholder="/admin/dashboard"
                                    />
                                </Form.Group>
                            </div>
                            <div className="col-md-12 mb-4">
                                <Form.Group>
                                    <Form.Label className="font-weight-semibold small text-muted text-uppercase mb-2">SVG Icon or CSS Class</Form.Label>
                                    <Form.Control
                                        as="textarea"
                                        rows={2}
                                        className="bg-light border-0 py-3 rounded-lg shadow-none"
                                        value={formData.icon}
                                        onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                                        placeholder='<svg ...> or "fas fa-home"'
                                    />
                                </Form.Group>
                            </div>
                            <div className="col-md-4 mb-4">
                                <Form.Group>
                                    <Form.Label className="font-weight-semibold small text-muted text-uppercase mb-2">Color Accent</Form.Label>
                                    <Form.Select
                                        className="bg-light border-0 py-3 rounded-lg shadow-none"
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
                                    </Form.Select>
                                </Form.Group>
                            </div>
                            <div className="col-md-4 mb-4">
                                <Form.Group>
                                    <Form.Label className="font-weight-semibold small text-muted text-uppercase mb-2">Parent Item</Form.Label>
                                    <Form.Select
                                        className="bg-light border-0 py-3 rounded-lg shadow-none"
                                        value={formData.parent_id}
                                        onChange={(e) => setFormData({ ...formData, parent_id: e.target.value })}
                                    >
                                        <option value="">None (Root Level)</option>
                                        {menus.filter(m => (m.is_section || m.is_dropdown) && m.id !== editingMenu?.id).map(m => (
                                            <option key={m.id} value={m.id}>{m.title}</option>
                                        ))}
                                    </Form.Select>
                                </Form.Group>
                            </div>
                            <div className="col-md-4 mb-4">
                                <Form.Group>
                                    <Form.Label className="font-weight-semibold small text-muted text-uppercase mb-2">Sort Order</Form.Label>
                                    <Form.Control
                                        type="number"
                                        className="bg-light border-0 py-3 rounded-lg shadow-none"
                                        value={formData.order_index}
                                        onChange={(e) => setFormData({ ...formData, order_index: parseInt(e.target.value) })}
                                    />
                                </Form.Group>
                            </div>
                            <div className="col-md-12 mb-2">
                                <div className="p-4 bg-light rounded-xl d-flex flex-wrap gap-5">
                                    <Form.Check
                                        type="checkbox"
                                        label="Register as Section Head"
                                        checked={formData.is_section}
                                        onChange={(e) => setFormData({ ...formData, is_section: e.target.checked })}
                                        className="custom-control-input"
                                    />
                                    <Form.Check
                                        type="checkbox"
                                        checked={formData.is_dropdown}
                                        label="Contains Sub-menus"
                                        onChange={(e) => setFormData({ ...formData, is_dropdown: e.target.checked })}
                                    />
                                    <Form.Check
                                        type="checkbox"
                                        label="Visibility Active"
                                        checked={formData.is_active}
                                        onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                                    />
                                </div>
                            </div>
                        </div>
                    </Modal.Body>
                    <Modal.Footer className="border-0 pt-0 pb-4 px-4">
                        <Button variant="light" className="px-5 py-2 rounded-xl" onClick={handleCloseModal}>Cancel</Button>
                        <Button variant="primary" className="px-5 py-2 rounded-xl shadow-lg border-0 bg-gradient-primary" type="submit">
                            {editingMenu ? 'Save Updates' : 'Create Item'}
                        </Button>
                    </Modal.Footer>
                </Form>
            </Modal>

            <style>{`
                .hover-row:hover {
                    background-color: rgba(0, 123, 255, 0.02) !important;
                    transition: all 0.2s ease;
                }
                .bg-gradient-primary {
                    background: linear-gradient(135deg, #0d6efd 0%, #0046b3 100%);
                }
                .rounded-xl { border-radius: 1rem !important; }
                .rounded-2xl { border-radius: 1.5rem !important; }
                .status-toggle-switch .form-check-input {
                    width: 32px;
                    height: 18px;
                    cursor: pointer;
                }
                .status-toggle-switch .form-check-label {
                    font-size: 0.75rem;
                    margin-top: 1px;
                    margin-left: 4px;
                    font-weight: 500;
                }
                .custom-tree-table th {
                    border-bottom: none;
                    text-transform: uppercase;
                    font-size: 0.7rem;
                    letter-spacing: 0.05em;
                }
                .custom-tree-table td {
                    vertical-align: middle;
                    border-bottom: 1px solid rgba(0,0,0,0.03);
                    padding-top: 1.25rem;
                    padding-bottom: 1.25rem;
                }
                .focus-primary:focus {
                    background-color: transparent !important;
                    box-shadow: 0 0 0 4px rgba(13, 110, 253, 0.1) !important;
                    border: 1px solid rgba(13, 110, 253, 0.2) !important;
                }
            `}</style>
        </div>
    );
};

export default MenuManagementPage;

