import React, { useState, useEffect } from 'react';
import { updateUser, getRoles, getDepartments, getUsers, Role, Department, User } from '../../services/apiService';
import { useNavigate, useParams } from 'react-router-dom';

const EditUserPage: React.FC = () => {
    const navigate = useNavigate();
    const { userId } = useParams<{ userId: string }>();
    const [formData, setFormData] = useState({
        fname: '',
        lname: '',
        user_name: '',
        password: '',
        email: '',
        phone: '',
        department_id: '',
        role_id: ''
    });
    const [roles, setRoles] = useState<Role[]>([]);
    const [departments, setDepartments] = useState<Department[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const rolesData = await getRoles();
                setRoles(rolesData);
                const deptsData = await getDepartments();
                setDepartments(deptsData);

                // Fetch user details. Ideally, we should have a getUserById API. 
                // Using getUsers() and filtering for now as fallback or if API supports it.
                // Assuming getUsers returns all users. 
                const usersData = await getUsers();
                const user = usersData.find((u: User) => u.user_id === Number(userId));

                if (user) {
                    setFormData({
                        fname: user.fname || '',
                        lname: user.lname || '',
                        user_name: user.user_name || '',
                        password: '', // Password is not retrieved for security
                        email: user.email || '',
                        phone: user.phone || '',
                        department_id: user.department_id ? String(user.department_id) : '',
                        role_id: user.role_id ? String(user.role_id) : ''
                    });
                } else {
                    setError('User not found');
                }
            } catch (err: any) {
                console.error("Failed to load options", err);
                setError("Failed to load user data");
            } finally {
                setLoading(false);
            }
        };
        if (userId) {
            fetchData();
        }
    }, [userId]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        if (!userId) return;

        // Strong password policy check (only if password is provided)
        if (formData.password && formData.password.trim() !== "") {
            const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
            if (!passwordRegex.test(formData.password)) {
                setError("New password must be at least 8 characters long and include uppercase, lowercase, numbers, and special characters (@$!%*?&)");
                window.scrollTo(0, 0);
                return;
            }
        }

        try {
            await updateUser(userId, formData);
            alert('User updated successfully!');
            navigate('/users/all');
        } catch (err: any) {
            setError(err.message || 'Failed to update user');
        }
    };

    if (loading) return <div>Loading...</div>;
    if (error) return <div className="alert alert-danger">{error}</div>;

    return (
        <div className="container-fluid">
            <h1 className="h3 mb-4 text-gray-800">Edit User</h1>
            <div className="card shadow mb-4">
                <div className="card-header py-3">
                    <h6 className="m-0 font-weight-bold text-primary">User Details</h6>
                </div>
                <div className="card-body">
                    <form onSubmit={handleSubmit}>
                        <div className="row">
                            <div className="col-md-6 mb-3">
                                <label>First Name</label>
                                <input type="text" className="form-control" name="fname" value={formData.fname} required onChange={handleChange} />
                            </div>
                            <div className="col-md-6 mb-3">
                                <label>Last Name</label>
                                <input type="text" className="form-control" name="lname" value={formData.lname} required onChange={handleChange} />
                            </div>
                        </div>
                        <div className="row">
                            <div className="col-md-6 mb-3">
                                <label>Email</label>
                                <input type="email" className="form-control" name="email" value={formData.email} onChange={handleChange} disabled />
                                <small className="text-muted">Email cannot be changed directly.</small>
                            </div>
                            <div className="col-md-6 mb-3">
                                <label>Phone</label>
                                <input type="text" className="form-control" name="phone" value={formData.phone} onChange={handleChange} />
                            </div>
                        </div>
                        <div className="row">
                            <div className="col-md-6 mb-3">
                                <label>Username</label>
                                <input type="text" className="form-control" name="user_name" value={formData.user_name} required onChange={handleChange} />
                            </div>
                            <div className="col-md-6 mb-3">
                                <label>Password (Leave blank to keep current)</label>
                                <input type="password" className="form-control" name="password" value={formData.password} onChange={handleChange} placeholder="New Password" />
                                <small className="form-text text-muted">
                                    Min 8 characters, with Uppercase, Lowercase, Number & Special Character (@$!%*?&).
                                </small>
                            </div>
                        </div>
                        <div className="row">
                            <div className="col-md-6 mb-3">
                                <label>Department</label>
                                <select className="form-control" name="department_id" value={formData.department_id} onChange={handleChange} required>
                                    <option value="">Select Department</option>
                                    {departments.map(dept => (
                                        <option key={dept.department_id} value={dept.department_id}>{dept.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="col-md-6 mb-3">
                                <label>Role</label>
                                <select className="form-control" name="role_id" value={formData.role_id} onChange={handleChange} required>
                                    <option value="">Select Role</option>
                                    {roles.map(role => (
                                        <option key={role.role_id} value={role.role_id}>{role.role_name}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        <button type="submit" className="btn btn-primary">Update User</button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default EditUserPage;
