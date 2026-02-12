import React, { useEffect, useState } from 'react';
import { getUsers, changeUserStatus, deleteUser, getRoles, User, Role, getAllMenus, getUserPermissions, updateUserPermissions, Menu, getDepartments, Department, addUser } from '../../services/apiService';
import { Link, useSearchParams } from 'react-router-dom';
import Pagination from '../../components/Pagination';
import { Modal, Button, Form, Spinner, Badge } from 'react-bootstrap';
import { FaUserPlus, FaShieldAlt, FaKey, FaEraser, FaEye, FaEyeSlash, FaDice, FaTimes, FaEnvelope, FaPhone, FaBuilding, FaUserTag, FaUserCircle } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import { createPortal } from 'react-dom';

const AllUsersPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // User Permissions State
  const [showPermsModal, setShowPermsModal] = useState(false);
  const [selectedUserForPerms, setSelectedUserForPerms] = useState<User | null>(null);
  const [allMenus, setAllMenus] = useState<Menu[]>([]);
  const [userOverrides, setUserOverrides] = useState<{ menu_id: number, permission_type: string }[]>([]);
  const [permsLoading, setPermsLoading] = useState(false);

  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  // Add User Modal State



  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const fetchData = async () => {
    try {
      setLoading(true);
      const [usersData, rolesData] = await Promise.all([getUsers(), getRoles()]);
      setUsers(usersData);
      setRoles(rolesData);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const fetchSelectData = async () => {
      try {
        const rolesData = await getRoles();
        setRoles(rolesData);
      } catch (err) {
        console.error("Error fetching form data", err);
      }
    };
    fetchSelectData();
  }, []);



  const handleStatusChange = async (userId: number, currentStatus: number | string) => {
    try {
      const newStatus = (currentStatus == 1 || currentStatus === '1') ? 0 : 1;
      await changeUserStatus(userId, newStatus);
      setUsers(users.map(u => u.user_id === userId ? { ...u, status: newStatus } : u));
    } catch (err: any) {
      alert('Failed to update status: ' + err.message);
    }
  };

  const handleDelete = async (userId: number) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await deleteUser(userId);
        setUsers(users.filter(u => u.user_id !== userId));
      } catch (err: any) {
        alert('Failed to delete user: ' + err.message);
      }
    }
  };

  // Permissions Logic
  const handleOpenPerms = async (user: User) => {
    setSelectedUserForPerms(user);
    setShowPermsModal(true);
    setPermsLoading(true);
    try {
      const [menus, overrides] = await Promise.all([
        getAllMenus(),
        getUserPermissions(user.user_id)
      ]);
      setAllMenus(menus);
      setUserOverrides(overrides);
    } catch (err: any) {
      alert('Error loading user permissions: ' + err.message);
    } finally {
      setPermsLoading(false);
    }
  };

  const handleSetOverride = (menuId: number, type: 'allow' | 'deny' | 'none') => {
    const updated = userOverrides.filter(o => o.menu_id !== menuId);
    if (type !== 'none') {
      updated.push({ menu_id: menuId, permission_type: type });
    }
    setUserOverrides(updated);
  };

  const handleSavePermissions = async () => {
    if (!selectedUserForPerms) return;
    setPermsLoading(true);
    try {
      await updateUserPermissions(selectedUserForPerms.user_id, userOverrides);
      setShowPermsModal(false);
      alert('User permission overrides updated successfully');
    } catch (err: any) {
      alert('Error updating user permissions: ' + err.message);
    } finally {
      setPermsLoading(false);
    }
  };



  // Filter Logic
  const filteredUsers = users.filter(user => {
    const matchesSearch =
      (user.user_name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (user.email?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (user.name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (user.fname?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (user.lname?.toLowerCase() || '').includes(searchTerm.toLowerCase());

    const matchesRole = filterRole ? String(user.role_id) === filterRole : true;
    const userStatus = (user.status == 1 || user.status === '1') ? '1' : '0';
    const matchesStatus = filterStatus ? userStatus === filterStatus : true;

    return matchesSearch && matchesRole && matchesStatus;
  });

  // Pagination Logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstItem, indexOfLastItem);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterRole, filterStatus]);

  if (loading && users.length === 0) return (
    <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '60vh' }}>
      <Spinner animation="border" variant="primary" />
    </div>
  );

  return (
    <div className="container-fluid mb-5">
      <div className="d-sm-flex align-items-center justify-content-between mb-4">
        <h1 className="h3 mb-0 text-gray-800">User Management</h1>
        <Link
          to="/users/add"
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl shadow-lg shadow-blue-500/20 flex items-center gap-2 transition-all transform hover:scale-105 active:scale-95 text-sm font-semibold decoration-none"
        >
          <FaUserPlus className="text-white/80" /> Add New User
        </Link>
      </div>

      {/* Filters */}
      <div className="card shadow mb-4 border-0">
        <div className="card-header py-3 bg-white border-bottom">
          <h6 className="m-0 font-weight-bold text-primary">Filter & Search</h6>
        </div>
        <div className="card-body">
          <div className="row g-3">
            <div className="col-md-4">
              <label className="form-label text-gray-600 small">Search</label>
              <div className="input-group">
                <span className="input-group-text bg-light border-end-0">
                  <i className="fas fa-search text-gray-400"></i>
                </span>
                <input
                  type="text"
                  className="form-control border-start-0 ps-0"
                  placeholder="Search by name, username, email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <div className="col-md-4">
              <label className="form-label text-gray-600 small">Role</label>
              <select
                className="form-select"
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value)}
              >
                <option value="">All Roles</option>
                {roles.map(role => (
                  <option key={role.role_id} value={role.role_id}>{role.role_name}</option>
                ))}
              </select>
            </div>
            <div className="col-md-4">
              <label className="form-label text-gray-600 small">Status</label>
              <select
                className="form-select"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="">All Statuses</option>
                <option value="1">Active</option>
                <option value="0">Inactive</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="card shadow mb-4 border-0">
        <div className="card-header py-3 bg-white border-bottom">
          <h6 className="m-0 font-weight-bold text-primary">User List <span className="text-gray-500 font-weight-normal ml-2">({filteredUsers.length} users)</span></h6>
        </div>
        <div className="card-body p-0 text-gray-800">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="bg-light text-gray-600">
                <tr>
                  <th className="px-4 py-3 border-0">ID</th>
                  <th className="px-4 py-3 border-0">User</th>
                  <th className="px-4 py-3 border-0">Role</th>
                  <th className="px-4 py-3 border-0 text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentUsers.map((user) => (
                  <tr key={user.user_id}>
                    <td className="px-4">{user.user_id}</td>
                    <td className="px-4">
                      <div className="d-flex align-items-center">
                        <div className="rounded-circle bg-gray-100 d-flex align-items-center justify-content-center mr-3" style={{ width: 40, height: 40 }}>
                          <i className="fas fa-user text-gray-400"></i>
                        </div>
                        <div>
                          <div className="font-weight-bold">{user.name || `${user.fname || ''} ${user.lname || ''}`}</div>
                          <div className="text-muted small">{user.email} | @{user.user_name}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4">
                      <span className="badge bg-light text-primary border border-primary-subtle px-2 py-1">
                        {user.role_name}
                      </span>
                    </td>
                    <td className="px-4 text-center">
                      <div className="flex items-center justify-center gap-3">
                        {/* Status Toggle */}
                        <div className="flex flex-col items-center gap-1">
                          <button
                            onClick={() => handleStatusChange(user.user_id, user.status)}
                            className={`relative inline-flex h-5 w-10 items-center rounded-full transition-colors focus:outline-none ${user.status == 1 ? 'bg-green-500' : 'bg-gray-300 dark:bg-slate-700'}`}
                            title={user.status == 1 ? 'Deactivate' : 'Activate'}
                          >
                            <span
                              className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${user.status == 1 ? 'translate-x-6' : 'translate-x-1'}`}
                            />
                          </button>
                          <span className="text-[9px] font-bold uppercase tracking-tighter text-gray-400">
                            {user.status == 1 ? 'Active' : 'N/A'}
                          </span>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-1.5 text-[10px] font-bold">
                          <button
                            className="bg-primary/10 text-primary border border-primary/20 hover:bg-primary hover:text-white px-2 py-1.5 rounded flex items-center gap-1 transition-all"
                            onClick={() => handleOpenPerms(user)}
                          >
                            <i className="fas fa-key"></i>
                            <span className="hidden lg:inline">Perms</span>
                          </button>

                          <Link
                            to={`/users/edit/${user.user_id}`}
                            className="bg-info/10 text-info border border-info/20 hover:bg-info hover:text-white px-2 py-1.5 rounded flex items-center gap-1 transition-all decoration-none"
                          >
                            <i className="fas fa-edit"></i>
                            <span className="hidden lg:inline">Edit</span>
                          </Link>

                          <button
                            className="bg-danger/10 text-danger border border-danger/20 hover:bg-danger hover:text-white px-2 py-1.5 rounded flex items-center gap-1 transition-all"
                            onClick={() => handleDelete(user.user_id)}
                          >
                            <i className="fas fa-trash"></i>
                            <span className="hidden lg:inline">Del</span>
                          </button>
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        {filteredUsers.length > 0 && (
          <div className="card-footer bg-white border-top py-3">
            <Pagination
              currentPage={currentPage}
              totalItems={filteredUsers.length}
              itemsPerPage={itemsPerPage}
              onPageChange={setCurrentPage}
            />
          </div>
        )}
      </div>

      <Modal show={showPermsModal} onHide={() => setShowPermsModal(false)} size="lg" scrollable>
        <Modal.Header closeButton className="bg-light">
          <Modal.Title>
            User Permission Overrides: <span className="text-primary">{selectedUserForPerms?.name || selectedUserForPerms?.user_name}</span>
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {permsLoading ? (
            <div className="text-center py-5">
              <Spinner animation="border" variant="primary" />
              <p className="mt-2">Loading...</p>
            </div>
          ) : (
            <div className="p-2">
              <p className="text-muted small mb-4">
                These settings override the role-based permissions for this specific user.
                <strong> Allow</strong> grants access, <strong>Deny</strong> explicitly blocks access, and <strong>None</strong> inherits from the user's role.
              </p>
              <div className="table-responsive">
                <table className="table table-sm align-middle">
                  <thead>
                    <tr>
                      <th>Menu Item</th>
                      <th className="text-center" style={{ width: '30%' }}>Override</th>
                    </tr>
                  </thead>
                  <tbody>
                    {allMenus.map(menu => {
                      const override = userOverrides.find(o => o.menu_id === menu.id);
                      const indent = menu.parent_id ? 'pl-4' : '';
                      const isSubChild = menu.parent_id && allMenus.find(m => m.id === menu.parent_id)?.parent_id;

                      return (
                        <tr key={menu.id}>
                          <td className={`${indent} ${isSubChild ? 'pl-5' : ''}`}>
                            <div className="d-flex align-items-center">
                              <div
                                className="mr-2 text-secondary small"
                                dangerouslySetInnerHTML={{ __html: menu.icon || '' }}
                              />
                              <span className={menu.is_section ? 'font-weight-bold text-uppercase x-small' : ''}>{menu.title}</span>
                            </div>
                          </td>
                          <td>
                            <div className="d-flex justify-content-center gap-1">
                              <button
                                className={`btn btn-xs ${override?.permission_type === 'allow' ? 'btn-success' : 'btn-outline-success'}`}
                                onClick={() => handleSetOverride(menu.id, 'allow')}
                                style={{ fontSize: '10px' }}
                              >Allow</button>
                              <button
                                className={`btn btn-xs ${override?.permission_type === 'deny' ? 'btn-danger' : 'btn-outline-danger'}`}
                                onClick={() => handleSetOverride(menu.id, 'deny')}
                                style={{ fontSize: '10px' }}
                              >Deny</button>
                              <button
                                className={`btn btn-xs ${!override ? 'btn-secondary' : 'btn-outline-secondary'}`}
                                onClick={() => handleSetOverride(menu.id, 'none')}
                                style={{ fontSize: '10px' }}
                              >None</button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer className="bg-light">
          <Button variant="secondary" onClick={() => setShowPermsModal(false)}>Cancel</Button>
          <Button variant="primary" onClick={handleSavePermissions} disabled={permsLoading}>
            Save Overrides
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Premium Add User Modal */}

    </div>
  );
};

export default AllUsersPage;
