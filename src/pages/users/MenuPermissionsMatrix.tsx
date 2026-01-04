import React, { useEffect, useState } from 'react';
import { getRoles, Role, getAllMenus, getRolePermissions, updateRolePermissions, Menu } from '../../services/apiService';
import { Spinner, Table, Form, Button, Badge, Alert } from 'react-bootstrap';
import { Link } from 'react-router-dom';

const MenuPermissionsMatrix: React.FC = () => {
    const [roles, setRoles] = useState<Role[]>([]);
    const [menus, setMenus] = useState<Menu[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [saving, setSaving] = useState(false);

    // permissionsMap[roleId] = Set of menuIds
    const [permissionsMap, setPermissionsMap] = useState<Record<number, Set<number>>>({});

    const fetchData = async () => {
        setLoading(true);
        try {
            const [rolesData, menusData] = await Promise.all([getRoles(), getAllMenus()]);
            setRoles(rolesData);
            setMenus(menusData);

            // Fetch permissions for each role
            const permPromises = rolesData.map(role => getRolePermissions(role.role_id));
            const allPerms = await Promise.all(permPromises);

            const newMap: Record<number, Set<number>> = {};
            rolesData.forEach((role, index) => {
                newMap[role.role_id] = new Set(allPerms[index]);
            });
            setPermissionsMap(newMap);
            setError(null);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleToggle = (roleId: number, menuId: number) => {
        setPermissionsMap(prev => {
            const newSet = new Set(prev[roleId]);
            if (newSet.has(menuId)) {
                newSet.delete(menuId);
            } else {
                newSet.add(menuId);
            }
            return { ...prev, [roleId]: newSet };
        });
    };

    const handleSaveAll = async () => {
        setSaving(true);
        try {
            const promises = Object.entries(permissionsMap).map(([roleId, menuIds]) =>
                updateRolePermissions(parseInt(roleId), Array.from(menuIds))
            );
            await Promise.all(promises);
            alert('All permissions saved successfully!');
        } catch (err: any) {
            alert('Error saving permissions: ' + err.message);
        } finally {
            setSaving(false);
        }
    };

    if (loading) return (
        <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
            <Spinner animation="border" variant="primary" />
        </div>
    );

    return (
        <div className="container-fluid mb-5">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h1 className="h3 text-gray-800">Menu Access Matrix</h1>
                    <p className="text-muted small">Manage which roles can access specific menu items across the entire CMS.</p>
                </div>
                <Button variant="primary" onClick={handleSaveAll} disabled={saving}>
                    {saving ? <><Spinner size="sm" className="mr-2" /> Saving...</> : <><i className="fas fa-save mr-2"></i>Save All Changes</>}
                </Button>
            </div>

            {error && <Alert variant="danger">{error}</Alert>}

            <div className="card shadow border-0 overflow-hidden">
                <div className="card-body p-0">
                    <div className="table-responsive">
                        <Table bordered hover className="mb-0 align-middle">
                            <thead className="bg-light sticky-top">
                                <tr>
                                    <th className="px-4 py-3" style={{ minWidth: '250px', zIndex: 10 }}>Menu Item</th>
                                    {roles.map(role => (
                                        <th key={role.role_id} className="text-center px-3 py-3">
                                            <div className="text-uppercase small font-weight-bold">{role.role_name}</div>
                                            <Badge bg={role.role_id === 1 ? 'danger' : 'secondary'} className="x-small">ID: {role.role_id}</Badge>
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {menus.map(menu => {
                                    const indent = menu.parent_id ? 'pl-4' : '';
                                    const isSubChild = menu.parent_id && menus.find(m => m.id === menu.parent_id)?.parent_id;

                                    return (
                                        <tr key={menu.id} className={menu.is_section ? 'bg-light/50' : ''}>
                                            <td className={`${indent} ${isSubChild ? 'pl-5' : ''} px-4 py-2`}>
                                                <div className="d-flex align-items-center">
                                                    <div className="mr-2 opacity-50 small" dangerouslySetInnerHTML={{ __html: menu.icon || '' }} />
                                                    <span className={`${menu.is_section ? 'font-weight-bold text-uppercase x-small text-primary' : (menu.is_dropdown ? 'font-weight-bold' : '')}`}>
                                                        {menu.title}
                                                    </span>
                                                    {menu.is_section && <Badge bg="primary" className="ml-2" style={{ fontSize: '0.6rem' }}>Section</Badge>}
                                                </div>
                                            </td>
                                            {roles.map(role => (
                                                <td key={role.role_id} className="text-center">
                                                    <Form.Check
                                                        type="checkbox"
                                                        className="d-inline-block"
                                                        checked={permissionsMap[role.role_id]?.has(menu.id) || false}
                                                        onChange={() => handleToggle(role.role_id, menu.id)}
                                                        disabled={role.role_id === 1 && menu.title === 'Roles & Permissions'} // Prevent locking self out of roles page
                                                    />
                                                </td>
                                            ))}
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </Table>
                    </div>
                </div>
            </div>

            <div className="mt-4 p-3 bg-light rounded border border-dashed">
                <p className="mb-0 small text-muted">
                    <i className="fas fa-info-circle mr-2"></i>
                    Changes made in this matrix are only applied when you click the <strong>Save All Changes</strong> button.
                    Individual user overrides can still be managed in the <Link to="/users/all" className="font-weight-bold">All Users</Link> page.
                </p>
            </div>
        </div>
    );
};

export default MenuPermissionsMatrix;
