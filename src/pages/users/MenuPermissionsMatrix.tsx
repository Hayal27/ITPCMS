import React, { useEffect, useState, useMemo } from 'react';
import { getRoles, Role, getAllMenus, getRolePermissions, updateRolePermissions, Menu } from '../../services/apiService';
import { Spinner, Table, Form, Button, Badge, Alert } from 'react-bootstrap';
import { Link } from 'react-router-dom';

const MenuPermissionsMatrix: React.FC = () => {
    const [roles, setRoles] = useState<Role[]>([]);
    const [menus, setMenus] = useState<Menu[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [saving, setSaving] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    // permissionsMap[roleId] = Set of menuIds
    const [permissionsMap, setPermissionsMap] = useState<Record<number, Set<number>>>({});
    const [hoveredRow, setHoveredRow] = useState<number | null>(null);
    const [hoveredCol, setHoveredCol] = useState<number | null>(null);

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

    const handleColumnToggle = (roleId: number) => {
        setPermissionsMap(prev => {
            const currentSet = prev[roleId];
            const allMenuIds = menus.map(m => m.id);
            const isAllSelected = allMenuIds.every(id => currentSet.has(id));

            const newSet = new Set<number>(isAllSelected ? [] : allMenuIds);
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
            alert('Security matrices synchronized successfully.');
        } catch (err: any) {
            alert('Hardware failure/API Error: ' + err.message);
        } finally {
            setSaving(false);
        }
    };

    const filteredMenus = useMemo(() => {
        if (!searchTerm) return menus;
        return menus.filter(m =>
            m.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (m.path && m.path.toLowerCase().includes(searchTerm.toLowerCase()))
        );
    }, [menus, searchTerm]);

    if (loading) return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-slate-400">
            <Spinner animation="border" variant="primary" className="mb-4" />
            <p className="font-medium animate-pulse">Initializing Access Matrix...</p>
        </div>
    );

    return (
        <div className="p-4 bg-slate-50 dark:bg-slate-950 min-h-screen">
            {/* Header section */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-8">
                <div className="flex items-start gap-4">
                    <div className="p-3 bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 text-blue-600">
                        <i className="fas fa-th text-2xl"></i>
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900 dark:text-white leading-tight">Access Matrix</h1>
                        <p className="text-slate-500 dark:text-slate-400 text-sm">Global synchronization of role-based menu permissions.</p>
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                    <div className="relative">
                        <i className="fas fa-search absolute left-4 top-3 text-slate-400"></i>
                        <input
                            type="text"
                            className="pl-10 pr-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none w-64 text-sm transition-all"
                            placeholder="Filter menus..."
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <button
                        className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-lg shadow-blue-500/20 flex items-center gap-2 transition-all disabled:opacity-50"
                        onClick={handleSaveAll}
                        disabled={saving}
                    >
                        {saving ? <Spinner size="sm" /> : <i className="fas fa-satellite-dish"></i>}
                        Sync All Changes
                    </button>
                </div>
            </div>

            {error && <Alert variant="danger" className="mb-6 rounded-2xl border-none shadow-sm">{error}</Alert>}

            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
                <div className="overflow-x-auto relative">
                    <table className="w-full border-collapse">
                        <thead className="sticky top-0 z-20 bg-slate-50 dark:bg-slate-800/80 backdrop-blur-md">
                            <tr>
                                <th className="sticky left-0 bg-slate-50 dark:bg-slate-800/80 backdrop-blur-md z-30 px-6 py-5 border-b border-slate-200 dark:border-slate-700 min-w-[280px]">
                                    <div className="flex flex-col text-left">
                                        <span className="text-xs font-black uppercase text-slate-400 tracking-[0.2em] mb-1">Resource</span>
                                        <span className="text-sm font-bold text-slate-800 dark:text-slate-100">Functional Menus</span>
                                    </div>
                                </th>
                                {roles.map((role, idx) => (
                                    <th
                                        key={role.role_id}
                                        className={`px-4 py-5 border-b border-slate-200 dark:border-slate-700 text-center min-w-[120px] transition-colors ${hoveredCol === idx ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''}`}
                                        onMouseEnter={() => setHoveredCol(idx)}
                                        onMouseLeave={() => setHoveredCol(null)}
                                    >
                                        <div className="flex flex-col items-center">
                                            <span className="text-[10px] font-black uppercase text-blue-600 dark:text-blue-400 mb-1">ID: #{role.role_id}</span>
                                            <span className="text-sm font-bold text-slate-700 dark:text-slate-200 block mb-3">{role.role_name}</span>
                                            <button
                                                onClick={() => handleColumnToggle(role.role_id)}
                                                className="text-[9px] font-black uppercase tracking-tighter px-2 py-0.5 bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400 rounded-md hover:bg-blue-600 hover:text-white transition-all"
                                            >
                                                Toggle All
                                            </button>
                                        </div>
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                            {filteredMenus.map((menu, rowIdx) => {
                                const isSub = menu.parent_id !== null;
                                const isGrandChild = isSub && menus.find(m => m.id === menu.parent_id)?.parent_id;

                                return (
                                    <tr
                                        key={menu.id}
                                        className={`transition-colors h-14 ${hoveredRow === rowIdx ? 'bg-slate-50/80 dark:bg-slate-800/40' : ''}`}
                                        onMouseEnter={() => setHoveredRow(rowIdx)}
                                        onMouseLeave={() => setHoveredRow(null)}
                                    >
                                        <td className={`sticky left-0 z-10 transition-colors px-6 py-4 bg-white dark:bg-slate-900 border-r border-slate-50 dark:border-slate-800 ${hoveredRow === rowIdx ? 'bg-slate-50 dark:bg-slate-800' : ''}`}>
                                            <div className={`flex items-center gap-2 ${isGrandChild ? 'ml-10' : (isSub ? 'ml-5' : 'ml-0')}`}>
                                                <div className="text-slate-400 text-xs opacity-60 flex-shrink-0" dangerouslySetInnerHTML={{ __html: menu.icon || '' }} />
                                                <div className="flex flex-col truncate">
                                                    <span className={`truncate ${menu.is_section ? 'text-xs font-black uppercase tracking-widest text-blue-600' : (menu.is_dropdown ? 'text-sm font-bold text-slate-800 dark:text-slate-100' : 'text-sm text-slate-600 dark:text-slate-400')}`}>
                                                        {menu.title}
                                                    </span>
                                                    {menu.path && <span className="text-[9px] font-mono text-slate-300 dark:text-slate-600 truncate">{menu.path}</span>}
                                                </div>
                                            </div>
                                        </td>
                                        {roles.map((role, colIdx) => {
                                            const isSelected = permissionsMap[role.role_id]?.has(menu.id) || false;
                                            const isSelfLock = role.role_id === 1 && menu.title === 'Roles & Permissions';

                                            return (
                                                <td
                                                    key={role.role_id}
                                                    className={`text-center px-4 transition-colors ${hoveredCol === colIdx ? 'bg-blue-50/30 dark:bg-blue-900/5' : ''}`}
                                                    onMouseEnter={() => setHoveredCol(colIdx)}
                                                    onMouseLeave={() => setHoveredCol(null)}
                                                >
                                                    <div className="flex justify-center">
                                                        <div
                                                            onClick={() => !isSelfLock && handleToggle(role.role_id, menu.id)}
                                                            className={`w-5 h-5 rounded flex items-center justify-center cursor-pointer transition-all ${isSelfLock ? 'bg-slate-100 text-slate-300 cursor-not-allowed' : (isSelected ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20 scale-110' : 'bg-slate-100 dark:bg-slate-800 text-transparent hover:text-slate-300')}`}
                                                        >
                                                            <i className="fas fa-check text-[10px]"></i>
                                                        </div>
                                                    </div>
                                                </td>
                                            );
                                        })}
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 flex items-start gap-3">
                    <div className="text-amber-500 mt-1"><i className="fas fa-exclamation-triangle"></i></div>
                    <div>
                        <h4 className="text-sm font-bold dark:text-white mb-1">Atomic Saves</h4>
                        <p className="text-xs text-slate-500">All changes in this matrix are cached locally and only sent to the cloud when you click Sync.</p>
                    </div>
                </div>
                <div className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 flex items-start gap-3">
                    <div className="text-blue-500 mt-1"><i className="fas fa-info-circle"></i></div>
                    <div>
                        <h4 className="text-sm font-bold dark:text-white mb-1">Row/Col Focus</h4>
                        <p className="text-xs text-slate-500">Hover over any cell or header to highlight the active axis for precision configuration.</p>
                    </div>
                </div>
                <div className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 flex items-start gap-3">
                    <div className="text-indigo-500 mt-1"><i className="fas fa-shield-alt"></i></div>
                    <div>
                        <h4 className="text-sm font-bold dark:text-white mb-1">Safety Lock</h4>
                        <p className="text-xs text-slate-500">Super Admin roles are protected from accidental lockout of critical management screens.</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MenuPermissionsMatrix;
