import React, { useEffect, useState, useMemo } from 'react';
import { getRoles, createRole, deleteRole, updateRole, Role, getAllMenus, getRolePermissions, updateRolePermissions, Menu } from '../../services/apiService';
import Pagination from '../../components/Pagination';
import { Modal, Button, Form, Spinner, Badge } from 'react-bootstrap';

const RolesPermissionsPage: React.FC = () => {
    const [roles, setRoles] = useState<Role[]>([]);
    const [roleName, setRoleName] = useState('');
    const [editingRole, setEditingRole] = useState<Role | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    // Permissions State
    const [showPermsModal, setShowPermsModal] = useState(false);
    const [selectedRoleForPerms, setSelectedRoleForPerms] = useState<Role | null>(null);
    const [allMenus, setAllMenus] = useState<Menu[]>([]);
    const [selectedMenuIds, setSelectedMenuIds] = useState<number[]>([]);
    const [permsLoading, setPermsLoading] = useState(false);
    const [menuSearchTerm, setMenuSearchTerm] = useState('');

    // Pagination State
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 8;

    const fetchRoles = async () => {
        setLoading(true);
        try {
            const data = await getRoles();
            setRoles(data);
            setError(null);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
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
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleCancelEdit = () => {
        setEditingRole(null);
        setRoleName('');
    };

    const handleDeleteRole = async (roleId: number) => {
        if (window.confirm('Are you sure you want to delete this role? This action cannot be undone.')) {
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
        setMenuSearchTerm('');
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
        const menu = allMenus.find(m => m.id === menuId);
        if (!menu) return;

        // Find all children and sub-children recursively
        const getChildrenIds = (parentId: number): number[] => {
            const children = allMenus.filter(m => m.parent_id === parentId);
            let ids = children.map(c => c.id);
            children.forEach(c => {
                ids = [...ids, ...getChildrenIds(c.id)];
            });
            return ids;
        };

        const childrenIds = getChildrenIds(menuId);
        const allTargetIds = [menuId, ...childrenIds];

        setSelectedMenuIds(prev => {
            const isSelecting = !prev.includes(menuId);
            if (isSelecting) {
                // Add current and all children
                const newSelection = Array.from(new Set([...prev, ...allTargetIds]));
                // If it's a child, we should also ensure parents are selected? 
                // Usually yes, but for now let's keep it simple.
                return newSelection;
            } else {
                // Remove current and all children
                return prev.filter(id => !allTargetIds.includes(id));
            }
        });
    };

    const handleToggleRoleStatus = async (role: Role) => {
        try {
            const newStatus = role.status == 1 ? 0 : 1;
            await updateRole(role.role_id, { role_name: role.role_name, status: newStatus });
            fetchRoles();
        } catch (err: any) {
            alert('Error updating role status: ' + err.message);
        }
    };

    const handleSelectAll = (select: boolean) => {
        if (select) {
            setSelectedMenuIds(allMenus.map(m => m.id));
        } else {
            setSelectedMenuIds([]);
        }
    };

    const handleSavePermissions = async () => {
        if (!selectedRoleForPerms) return;
        setPermsLoading(true);
        try {
            await updateRolePermissions(selectedRoleForPerms.role_id, selectedMenuIds);
            setShowPermsModal(false);
            // In a real app, maybe a toast here
            alert('Permissions updated successfully for ' + selectedRoleForPerms.role_name);
        } catch (err: any) {
            alert('Error updating permissions: ' + err.message);
        } finally {
            setPermsLoading(false);
        }
    };

    const filteredMenus = useMemo(() => {
        if (!menuSearchTerm) return allMenus;
        return allMenus.filter(m =>
            m.title.toLowerCase().includes(menuSearchTerm.toLowerCase()) ||
            (m.path && m.path.toLowerCase().includes(menuSearchTerm.toLowerCase()))
        );
    }, [allMenus, menuSearchTerm]);

    // Pagination Logic
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentRoles = roles.slice(indexOfFirstItem, indexOfLastItem);

    return (
        <div className="p-4 bg-slate-50 dark:bg-slate-950 min-h-screen">
            {/* Header section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-1">Role Management</h1>
                    <p className="text-slate-500 dark:text-slate-400">Configure access levels and menu visibility for system roles.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Form part */}
                <div className="lg:col-span-4">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden sticky top-4">
                        <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-center gap-3">
                            <div className={`p-2 rounded-lg ${editingRole ? 'bg-amber-100 text-amber-600' : 'bg-blue-100 text-blue-600'}`}>
                                <i className={`fas ${editingRole ? 'fa-edit' : 'fa-plus-circle'}`}></i>
                            </div>
                            <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100">
                                {editingRole ? 'Modify Role' : 'Create New Role'}
                            </h2>
                        </div>
                        <div className="p-6">
                            <form onSubmit={handleSubmitRole}>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Role Designation</label>
                                        <input
                                            type="text"
                                            className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all dark:text-white"
                                            value={roleName}
                                            onChange={(e) => setRoleName(e.target.value)}
                                            placeholder="e.g. Content Manager..."
                                            required
                                        />
                                    </div>
                                    <div className="flex gap-3 pt-2">
                                        <button
                                            type="submit"
                                            className={`flex-1 py-2.5 rounded-xl font-medium transition-all shadow-sm ${editingRole ? 'bg-amber-500 hover:bg-amber-600 text-white' : 'bg-blue-600 hover:bg-blue-700 text-white'}`}
                                        >
                                            {editingRole ? 'Update Access' : 'Register Role'}
                                        </button>
                                        {editingRole && (
                                            <button
                                                type="button"
                                                className="px-4 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-all font-medium"
                                                onClick={handleCancelEdit}
                                            >
                                                Discard
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>

                {/* Table part */}
                <div className="lg:col-span-8">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
                        <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
                            <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100">Defined System Roles</h2>
                            <span className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-full text-xs font-bold">
                                {roles.length} TOTAL
                            </span>
                        </div>
                        <div className="overflow-x-auto">
                            {loading ? (
                                <div className="p-20 text-center text-slate-400">
                                    <Spinner animation="border" size="sm" className="mr-3" /> Fetching roles...
                                </div>
                            ) : error ? (
                                <div className="p-10 text-center">
                                    <p className="text-red-500 mb-4">{error}</p>
                                    <button onClick={fetchRoles} className="px-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-lg">Retry</button>
                                </div>
                            ) : (
                                <table className="w-full">
                                    <thead>
                                        <tr className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider">
                                            <th className="px-6 py-4 text-left font-semibold">Security Identifier</th>
                                            <th className="px-6 py-4 text-left font-semibold">Title</th>
                                            <th className="px-6 py-4 text-center font-semibold">Status</th>
                                            <th className="px-6 py-4 text-right font-semibold">Operations</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                        {currentRoles.map(role => (
                                            <tr key={role.role_id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors group">
                                                <td className="px-6 py-4 text-sm font-mono text-slate-400">#00{role.role_id}</td>
                                                <td className="px-6 py-4">
                                                    <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">{role.role_name}</span>
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    <button
                                                        onClick={() => handleToggleRoleStatus(role)}
                                                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${role.status == 1 ? 'bg-green-500' : 'bg-slate-300 dark:bg-slate-700'}`}
                                                    >
                                                        <span
                                                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${role.status == 1 ? 'translate-x-6' : 'translate-x-1'}`}
                                                        />
                                                    </button>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <div className="flex justify-end gap-2 text-[11px] font-bold uppercase tracking-tight">
                                                        <button
                                                            className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-all border border-blue-200/50 dark:border-blue-800/50"
                                                            onClick={() => handleOpenPerms(role)}
                                                        >
                                                            <i className="fas fa-key"></i>
                                                            <span>Perms</span>
                                                        </button>
                                                        <button
                                                            className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 rounded-lg hover:bg-amber-100 dark:hover:bg-amber-900/50 transition-all border border-amber-200/50 dark:border-amber-800/50"
                                                            onClick={() => handleEditRole(role)}
                                                        >
                                                            <i className="fas fa-edit"></i>
                                                            <span>Edit</span>
                                                        </button>
                                                        <button
                                                            className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-50 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 rounded-lg hover:bg-rose-100 dark:hover:bg-rose-900/50 transition-all border border-rose-200/50 dark:border-rose-800/50"
                                                            onClick={() => handleDeleteRole(role.role_id)}
                                                        >
                                                            <i className="fas fa-trash"></i>
                                                            <span>Del</span>
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                        {roles.length === 0 && (
                                            <tr>
                                                <td colSpan={3} className="text-center py-12 text-slate-400 italic">
                                                    No system roles currently registered.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            )}
                        </div>
                        {roles.length > 0 && (
                            <div className="p-4 border-t border-slate-100 dark:border-slate-800">
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

            <Modal
                show={showPermsModal}
                onHide={() => setShowPermsModal(false)}
                size="lg"
                scrollable
                contentClassName="bg-white dark:bg-slate-900 border-none shadow-2xl rounded-2xl"
            >
                <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <div>
                        <h3 className="text-xl font-bold dark:text-white">Menu Access Control</h3>
                        <p className="text-sm text-slate-500 mt-1">Configuring permissions for <span className="text-blue-600 font-bold font-mono uppercase">{selectedRoleForPerms?.role_name}</span></p>
                    </div>
                    <button onClick={() => setShowPermsModal(false)} className="text-slate-400 hover:text-slate-600">
                        <i className="fas fa-times text-xl"></i>
                    </button>
                </div>
                <Modal.Body className="p-0">
                    <div className="p-4 bg-slate-50 dark:bg-slate-800/30 sticky top-0 z-10 border-b border-slate-100 dark:border-slate-800">
                        <div className="flex flex-col md:flex-row gap-4 items-center">
                            <div className="relative flex-1">
                                <i className="fas fa-search absolute left-4 top-3.5 text-slate-400"></i>
                                <input
                                    type="text"
                                    placeholder="Search specific menu or path..."
                                    className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-800 border-none rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all dark:text-white"
                                    value={menuSearchTerm}
                                    onChange={e => setMenuSearchTerm(e.target.value)}
                                />
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => handleSelectAll(true)}
                                    className="px-3 py-2 text-xs font-bold bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg transition-colors border border-blue-100"
                                >
                                    Grant All
                                </button>
                                <button
                                    onClick={() => handleSelectAll(false)}
                                    className="px-3 py-2 text-xs font-bold bg-rose-50 text-rose-700 hover:bg-rose-100 rounded-lg transition-colors border border-rose-100"
                                >
                                    Revoke All
                                </button>
                            </div>
                        </div>
                    </div>

                    {permsLoading ? (
                        <div className="text-center py-20">
                            <Spinner animation="border" variant="primary" />
                            <p className="mt-4 text-slate-500 font-medium">Synchronizing permissions map...</p>
                        </div>
                    ) : (
                        <div className="p-2 divide-y divide-slate-50 dark:divide-slate-800">
                            {filteredMenus.map(menu => {
                                const isSelected = selectedMenuIds.includes(menu.id);
                                const isSub = menu.parent_id !== null;
                                const isGrandChild = isSub && allMenus.find(m => m.id === menu.parent_id)?.parent_id;

                                return (
                                    <div
                                        key={menu.id}
                                        className={`flex items-center px-6 py-4 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-all cursor-pointer group ${isSelected ? 'bg-blue-50/20 dark:bg-blue-900/10' : ''}`}
                                        onClick={() => handleToggleMenu(menu.id)}
                                    >
                                        <div className={`mr-4 transition-all ${isGrandChild ? 'ml-12' : (isSub ? 'ml-6' : 'ml-0')}`}>
                                            <div className={`w-6 h-6 rounded-md flex items-center justify-center transition-all ${isSelected ? 'bg-blue-600 text-white scale-110' : 'bg-slate-200 dark:bg-slate-700 text-transparent group-hover:text-slate-400'}`}>
                                                <i className="fas fa-check text-[10px]"></i>
                                            </div>
                                        </div>

                                        <div className="flex-1">
                                            <div className="flex items-center gap-2">
                                                <div className="text-slate-400 dark:text-slate-500" dangerouslySetInnerHTML={{ __html: menu.icon || '' }} />
                                                <span className={`${menu.is_section ? 'font-black uppercase tracking-widest text-xs text-slate-800 dark:text-slate-100' : (menu.is_dropdown ? 'font-bold text-slate-700 dark:text-slate-200' : 'text-slate-600 dark:text-slate-300 text-sm')}`}>
                                                    {menu.title}
                                                </span>
                                            </div>
                                            {menu.path && <p className="text-[10px] text-slate-400 font-mono mt-0.5 ml-7">{menu.path}</p>}
                                        </div>

                                        <div className="flex gap-1.5">
                                            {menu.is_section && <span className="px-2 py-0.5 bg-slate-800 text-white text-[9px] rounded font-bold uppercase tracking-tighter">Container</span>}
                                            {menu.is_dropdown && <span className="px-2 py-0.5 bg-indigo-600 text-white text-[9px] rounded font-bold uppercase tracking-tighter text-nowrap">Dropdown</span>}
                                        </div>
                                    </div>
                                );
                            })}
                            {filteredMenus.length === 0 && (
                                <div className="py-20 text-center text-slate-400 italic">
                                    No menu items match your search.
                                </div>
                            )}
                        </div>
                    )}
                </Modal.Body>
                <div className="p-6 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3 rounded-b-2xl">
                    <button
                        className="px-6 py-2.5 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 rounded-xl hover:bg-slate-100 border border-slate-200 dark:border-slate-700 font-medium transition-all"
                        onClick={() => setShowPermsModal(false)}
                    >
                        Close
                    </button>
                    <button
                        className="px-8 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-lg shadow-blue-500/25 transition-all flex items-center gap-2"
                        onClick={handleSavePermissions}
                        disabled={permsLoading}
                    >
                        {permsLoading ? <Spinner size="sm" /> : <i className="fas fa-save"></i>}
                        Deploy Permissions
                    </button>
                </div>
            </Modal>
        </div>
    );
};

export default RolesPermissionsPage;
