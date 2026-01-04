import React, { useEffect, useState } from 'react';
import { getRoles, createRole, deleteRole, updateRole, Role, getAllMenus, getRolePermissions, updateRolePermissions, Menu } from '../../services/apiService';
import Pagination from '../../components/Pagination';
import { Modal, Button, Form, Spinner, Badge } from 'react-bootstrap';

const RolesPermissionsPage: React.FC = () => {
    const [roles, setRoles] = useState<Role[]>([]);
    const [roleName, setRoleName] = useState('');
    const [editingRole, setEditingRole] = useState<Role | null>(null);
    const [error, setError] = useState<string | null>(null);

    // Permissions State
    const [showPermsModal, setShowPermsModal] = useState(false);
    const [selectedRoleForPerms, setSelectedRoleForPerms] = useState<Role | null>(null);
    const [allMenus, setAllMenus] = useState<Menu[]>([]);
    const [selectedMenuIds, setSelectedMenuIds] = useState<number[]>([]);
    const [permsLoading, setPermsLoading] = useState(false);

    // Pagination State
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 8;

    const fetchRoles = async () => {
        try {
            const data = await getRoles();
            setRoles(data);
            setError(null);
        } catch (err: any) {
            setError(err.message);
        }
    };

    useEffect(() => {
        fetchRoles();
    }, []);

    const handleSubmitRole = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!roleName) return;
        try {
            if (editingRole) {
                await updateRole(editingRole.role_id, { role_name: roleName, status: editingRole.status });
            } else {
                await createRole({ role_name: roleName });
            }
            setRoleName('');
            setEditingRole(null);
            fetchRoles();
        } catch (err: any) {
            alert('Error saving role: ' + err.message);
        }
    };

    const handleEditRole = (role: Role) => {
        setEditingRole(role);
        setRoleName(role.role_name);
    };

    const handleCancelEdit = () => {
        setEditingRole(null);
        setRoleName('');
    };

    const handleDeleteRole = async (roleId: number) => {
        if (window.confirm('Delete this role?')) {
            try {
                await deleteRole(roleId);
                fetchRoles();
            } catch (err: any) {
                alert('Error deleting role: ' + err.message);
            }
        }
    };

    // Permissions Logic
    const handleOpenPerms = async (role: Role) => {
        setSelectedRoleForPerms(role);
        setShowPermsModal(true);
        setPermsLoading(true);
        try {
            const [menus, perms] = await Promise.all([
                getAllMenus(),
                getRolePermissions(role.role_id)
            ]);
            setAllMenus(menus);
            setSelectedMenuIds(perms);
        } catch (err: any) {
            alert('Error loading permissions: ' + err.message);
        } finally {
            setPermsLoading(false);
        }
    };

    const handleToggleMenu = (menuId: number) => {
        if (selectedMenuIds.includes(menuId)) {
            // Remove it and all its children recursively if needed? 
            // For now, simple toggle
            setSelectedMenuIds(selectedMenuIds.filter(id => id !== menuId));
        } else {
            setSelectedMenuIds([...selectedMenuIds, menuId]);
        }
    };

    const handleSavePermissions = async () => {
        if (!selectedRoleForPerms) return;
        setPermsLoading(true);
        try {
            await updateRolePermissions(selectedRoleForPerms.role_id, selectedMenuIds);
            setShowPermsModal(false);
            alert('Permissions updated successfully');
        } catch (err: any) {
            alert('Error updating permissions: ' + err.message);
        } finally {
            setPermsLoading(false);
        }
    };

    // Pagination Logic
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentRoles = roles.slice(indexOfFirstItem, indexOfLastItem);

    return (
        <div className="container-fluid mb-5">
            <h1 className="h3 mb-4 text-gray-800">Role & Menu Permissions</h1>
            <div className="row">
                <div className="col-md-4">
                    <div className="card shadow mb-4 border-0">
                        <div className="card-header py-3 bg-white border-bottom">
                            <h6 className="m-0 font-weight-bold text-primary">
                                {editingRole ? <><i className="fas fa-edit mr-2"></i>Edit Role</> : <><i className="fas fa-plus-circle mr-2"></i>Add New Role</>}
                            </h6>
                        </div>
                        <div className="card-body">
                            <form onSubmit={handleSubmitRole}>
                                <div className="form-group mb-4">
                                    <label className="text-gray-600 small font-weight-bold">Role Name</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        value={roleName}
                                        onChange={(e) => setRoleName(e.target.value)}
                                        placeholder="Enter role name..."
                                        required
                                    />
                                </div>
                                <div className="d-flex gap-2">
                                    <button type="submit" className={`btn btn-block flex-grow-1 ${editingRole ? 'btn-warning' : 'btn-primary'}`}>
                                        {editingRole ? 'Update Role' : 'Create Role'}
                                    </button>
                                    {editingRole && (
                                        <button
                                            type="button"
                                            className="btn btn-secondary flex-grow-1 ml-2"
                                            onClick={handleCancelEdit}
                                        >
                                            Cancel
                                        </button>
                                    )}
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
                <div className="col-md-8">
                    <div className="card shadow mb-4 border-0">
                        <div className="card-header py-3 bg-white border-bottom d-flex justify-content-between align-items-center">
                            <h6 className="m-0 font-weight-bold text-primary">Existing Roles <span className="text-gray-500 font-weight-normal ml-2">({roles.length})</span></h6>
                        </div>
                        <div className="card-body p-0">
                            {error && <div className="p-3 alert alert-danger m-3">{error}</div>}
                            <div className="table-responsive">
                                <table className="table table-hover align-middle mb-0 text-gray-800">
                                    <thead className="bg-light text-gray-600">
                                        <tr>
                                            <th className="px-4 py-3 border-0" style={{ width: '10%' }}>ID</th>
                                            <th className="px-4 py-3 border-0">Role Name</th>
                                            <th className="px-4 py-3 border-0 text-center" style={{ width: '30%' }}>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {currentRoles.map(role => (
                                            <tr key={role.role_id}>
                                                <td className="px-4 text-gray-600">{role.role_id}</td>
                                                <td className="px-4 font-weight-bold">{role.role_name}</td>
                                                <td className="px-4 text-center">
                                                    <div className="btn-group" role="group">
                                                        <button
                                                            className="btn btn-sm btn-outline-primary"
                                                            onClick={() => handleOpenPerms(role)}
                                                            title="Manage Menu Permissions"
                                                        >
                                                            <i className="fas fa-lock mr-1"></i> Permissions
                                                        </button>
                                                        <button
                                                            className="btn btn-sm btn-outline-info"
                                                            onClick={() => handleEditRole(role)}
                                                            title="Edit"
                                                        >
                                                            <i className="fas fa-edit"></i>
                                                        </button>
                                                        <button
                                                            className="btn btn-sm btn-outline-danger"
                                                            onClick={() => handleDeleteRole(role.role_id)}
                                                            title="Delete"
                                                        >
                                                            <i className="fas fa-trash"></i>
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                        {roles.length === 0 && (
                                            <tr>
                                                <td colSpan={3} className="text-center py-5 text-gray-500">
                                                    No roles found.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                        {roles.length > 0 && (
                            <div className="card-footer bg-white py-3 border-top">
                                <Pagination
                                    currentPage={currentPage}
                                    totalItems={roles.length}
                                    itemsPerPage={itemsPerPage}
                                    onPageChange={setCurrentPage}
                                />
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <Modal show={showPermsModal} onHide={() => setShowPermsModal(false)} size="lg" scrollable>
                <Modal.Header closeButton className="bg-light">
                    <Modal.Title>
                        Menu Permissions: <span className="text-primary">{selectedRoleForPerms?.role_name}</span>
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {permsLoading ? (
                        <div className="text-center py-5">
                            <Spinner animation="border" variant="primary" />
                            <p className="mt-2">Loading menus...</p>
                        </div>
                    ) : (
                        <div className="p-2">
                            <p className="text-muted small mb-4">Select the menu items this role can access. Root-level items are sections, followed by dropdowns and links.</p>
                            <div className="list-group list-group-flush border rounded overflow-hidden">
                                {allMenus.map(menu => {
                                    const isSelected = selectedMenuIds.includes(menu.id);
                                    const indent = menu.parent_id ? 'ml-4' : '';
                                    const isSubChild = menu.parent_id && allMenus.find(m => m.id === menu.parent_id)?.parent_id;

                                    return (
                                        <div
                                            key={menu.id}
                                            className={`list-group-item list-group-item-action d-flex align-items-center cursor-pointer ${isSelected ? 'bg-light' : ''} ${indent} ${isSubChild ? 'ml-5' : ''}`}
                                            onClick={() => handleToggleMenu(menu.id)}
                                            style={{ cursor: 'pointer' }}
                                        >
                                            <Form.Check
                                                type="checkbox"
                                                id={`menu-check-${menu.id}`}
                                                checked={isSelected}
                                                onChange={() => { }} // Controlled via parent div click
                                                className="mr-3"
                                            />
                                            <div
                                                className="mr-3 text-secondary"
                                                style={{ width: '20px' }}
                                                dangerouslySetInnerHTML={{ __html: menu.icon || '' }}
                                            />
                                            <div>
                                                <span className={menu.is_section ? 'font-weight-bold text-uppercase small tracking-wider' : (menu.is_dropdown ? 'font-weight-bold' : '')}>
                                                    {menu.title}
                                                </span>
                                                {menu.path && <span className="ml-2 text-muted x-small">({menu.path})</span>}
                                            </div>
                                            <div className="ml-auto">
                                                {menu.is_section && <Badge bg="dark" className='mr-1'>Section</Badge>}
                                                {menu.is_dropdown && <Badge bg="info" className='mr-1'>Dropdown</Badge>}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </Modal.Body>
                <Modal.Footer className="bg-light border-top">
                    <Button variant="secondary" onClick={() => setShowPermsModal(false)}>Cancel</Button>
                    <Button variant="primary" onClick={handleSavePermissions} disabled={permsLoading}>
                        {permsLoading ? 'Saving...' : 'Save Permissions'}
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};

export default RolesPermissionsPage;
