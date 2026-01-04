import React, { useState, useEffect } from 'react';
import { addUser, getRoles, getDepartments, Role, Department } from '../../services/apiService';
import { useNavigate } from 'react-router-dom';

const AddNewUserPage: React.FC = () => {
  const navigate = useNavigate();
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

  useEffect(() => {
    const fetchData = async () => {
      try {
        const rolesData = await getRoles();
        setRoles(rolesData);
        const deptsData = await getDepartments();
        setDepartments(deptsData);
      } catch (err: any) {
        console.error("Failed to load options", err);
      }
    };
    fetchData();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      await addUser(formData);
      alert('User created successfully!');
      navigate('/users/all');
    } catch (err: any) {
      setError(err.message || 'Failed to create user');
    }
  };

  return (
    <div className="container-fluid">
      <h1 className="h3 mb-4 text-gray-800">Add New User</h1>
      <div className="card shadow mb-4">
        <div className="card-header py-3">
          <h6 className="m-0 font-weight-bold text-primary">User Details</h6>
        </div>
        <div className="card-body">
          {error && <div className="alert alert-danger">{error}</div>}
          <form onSubmit={handleSubmit}>
            <div className="row">
              <div className="col-md-6 mb-3">
                <label>First Name</label>
                <input type="text" className="form-control" name="fname" required onChange={handleChange} />
              </div>
              <div className="col-md-6 mb-3">
                <label>Last Name</label>
                <input type="text" className="form-control" name="lname" required onChange={handleChange} />
              </div>
            </div>
            <div className="row">
              <div className="col-md-6 mb-3">
                <label>Email</label>
                <input type="email" className="form-control" name="email" required onChange={handleChange} />
              </div>
              <div className="col-md-6 mb-3">
                <label>Phone</label>
                <input type="text" className="form-control" name="phone" onChange={handleChange} />
              </div>
            </div>
            <div className="row">
              <div className="col-md-6 mb-3">
                <label>Username</label>
                <input type="text" className="form-control" name="user_name" required onChange={handleChange} />
              </div>
              <div className="col-md-6 mb-3">
                <label>Password</label>
                <input type="password" className="form-control" name="password" required onChange={handleChange} />
              </div>
            </div>
            <div className="row">
              <div className="col-md-6 mb-3">
                <label>Department</label>
                <select className="form-control" name="department_id" onChange={handleChange} required>
                  <option value="">Select Department</option>
                  {departments.map(dept => (
                    <option key={dept.department_id} value={dept.department_id}>{dept.name}</option>
                  ))}
                </select>
              </div>
              <div className="col-md-6 mb-3">
                <label>Role</label>
                <select className="form-control" name="role_id" onChange={handleChange} required>
                  <option value="">Select Role</option>
                  {roles.map(role => (
                    <option key={role.role_id} value={role.role_id}>{role.role_name}</option>
                  ))}
                </select>
              </div>
            </div>
            <button type="submit" className="btn btn-primary">Create User</button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddNewUserPage;