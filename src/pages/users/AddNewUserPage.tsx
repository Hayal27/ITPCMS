import React, { useState, useEffect } from 'react';
import { addUser, getRoles, getDepartments, Role, Department } from '../../services/apiService';
import { useNavigate } from 'react-router-dom';
import { FaUserPlus, FaShieldAlt, FaKey, FaEraser, FaEye, FaEyeSlash, FaDice, FaEnvelope, FaPhone, FaBuilding, FaUserTag, FaUserCircle, FaArrowLeft } from 'react-icons/fa';
import { motion } from 'framer-motion';
import { Spinner } from 'react-bootstrap';
import DOMPurify from 'dompurify';

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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [rolesData, deptsData] = await Promise.all([getRoles(), getDepartments()]);
        setRoles(rolesData);
        setDepartments(deptsData);
      } catch (err: any) {
        console.error("Failed to load options", err);
      }
    };
    fetchData();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) setError(null);
  };

  const handleGeneratePassword = () => {
    const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@$!%*?&";
    const requiredChars = [
      "abcdefghijklmnopqrstuvwxyz"[Math.floor(Math.random() * 26)],
      "ABCDEFGHIJKLMNOPQRSTUVWXYZ"[Math.floor(Math.random() * 26)],
      "0123456789"[Math.floor(Math.random() * 26)],
      "@$!%*?&"[Math.floor(Math.random() * 7)]
    ];

    let generated = "";
    for (let i = 0; i < 8; i++) {
      generated += charset.charAt(Math.floor(Math.random() * charset.length));
    }

    const pwdArray = (generated + requiredChars.join('')).split('');
    for (let i = pwdArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [pwdArray[i], pwdArray[j]] = [pwdArray[j], pwdArray[i]];
    }

    setFormData(prev => ({ ...prev, password: pwdArray.join('').slice(0, 12) }));
  };

  const handleClearPassword = () => {
    setFormData(prev => ({ ...prev, password: '' }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(formData.password)) {
      setError("Password must be at least 8 chars with uppercase, lowercase, number & special char.");
      window.scrollTo(0, 0);
      return;
    }

    // 1. Security Sanitization
    const cleanFname = DOMPurify.sanitize(formData.fname, { ALLOWED_TAGS: [] }).trim();
    const cleanLname = DOMPurify.sanitize(formData.lname, { ALLOWED_TAGS: [] }).trim();
    const cleanUsername = DOMPurify.sanitize(formData.user_name, { ALLOWED_TAGS: [] }).trim();
    const cleanEmail = DOMPurify.sanitize(formData.email, { ALLOWED_TAGS: [] }).trim();

    if (!cleanFname || !cleanLname || !cleanUsername) {
      setError("Names and username cannot contain HTML tags or be empty.");
      window.scrollTo(0, 0);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const payload = {
        ...formData,
        fname: cleanFname,
        lname: cleanLname,
        user_name: cleanUsername,
        email: cleanEmail
      };
      await addUser(payload);
      alert('User created successfully!');
      navigate('/users/all');
    } catch (err: any) {
      setError(err.message || 'Failed to create user');
      window.scrollTo(0, 0);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-fluid min-h-screen bg-gray-50 dark:bg-slate-950 py-10 px-4">
      <div className="max-w-xl mx-auto">
        {/* Back Button */}
        <button
          onClick={() => navigate('/users/all')}
          className="flex items-center gap-2 text-slate-400 hover:text-blue-600 transition-colors mb-4 text-xs font-bold uppercase tracking-widest group"
        >
          <FaArrowLeft className="group-hover:-translate-x-1 transition-transform" /> Back to Dashboard
        </button>

        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-gray-100 dark:border-slate-800 overflow-hidden"
        >
          <div className="p-6 md:p-8">
            {/* Compact Header */}
            <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-12 rounded-xl bg-blue-600 flex items-center justify-center text-white text-xl shadow-lg shadow-blue-500/20">
                <FaUserPlus />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-900 dark:text-white">New User Account</h1>
                <p className="text-slate-500 dark:text-slate-400 text-xs">Configure system access and profile</p>
              </div>
            </div>

            {error && (
              <div className="mb-6 p-3 bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/30 rounded-xl flex items-center gap-2 text-red-600 dark:text-red-400 text-[11px] font-bold">
                <FaShieldAlt /> {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-1">First Name</label>
                  <input
                    type="text" name="fname" required placeholder="John"
                    value={formData.fname} onChange={handleChange}
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:border-blue-500 outline-none transition-all dark:text-white"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-1">Last Name</label>
                  <input
                    type="text" name="lname" required placeholder="Doe"
                    value={formData.lname} onChange={handleChange}
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:border-blue-500 outline-none transition-all dark:text-white"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-1">Email Address</label>
                <input
                  type="email" name="email" required placeholder="john@example.com"
                  value={formData.email} onChange={handleChange}
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:border-blue-500 outline-none transition-all dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-1">Username</label>
                  <input
                    type="text" name="user_name" required placeholder="jdoe"
                    value={formData.user_name} onChange={handleChange}
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:border-blue-500 outline-none transition-all dark:text-white"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-1">Phone</label>
                  <input
                    type="text" name="phone" placeholder="+251..."
                    value={formData.phone} onChange={handleChange}
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:border-blue-500 outline-none transition-all dark:text-white"
                  />
                </div>
              </div>

              <div className="p-4 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Security Key</span>
                  <button
                    type="button" onClick={handleGeneratePassword}
                    className="text-[9px] bg-blue-600 text-white px-2 py-0.5 rounded-lg font-bold hover:bg-blue-700 transition-colors"
                  >
                    Auto-Generate
                  </button>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"} name="password" required placeholder="••••••••"
                    value={formData.password} onChange={handleChange}
                    className="w-full pr-10 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:border-blue-500 outline-none transition-all dark:text-white font-mono"
                  />
                  <button
                    type="button" onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-blue-500 transition-colors"
                  >
                    {showPassword ? <FaEyeSlash size={14} /> : <FaEye size={14} />}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-1">Department</label>
                  <select
                    name="department_id" required value={formData.department_id} onChange={handleChange}
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:border-blue-500 outline-none transition-all dark:text-white appearance-none cursor-pointer"
                  >
                    <option value="">Select Dept</option>
                    {departments.map(dept => (
                      <option key={dept.department_id} value={dept.department_id}>{dept.name}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-1">System Role</label>
                  <select
                    name="role_id" required value={formData.role_id} onChange={handleChange}
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:border-blue-500 outline-none transition-all dark:text-white appearance-none cursor-pointer"
                  >
                    <option value="">Select Role</option>
                    {roles.map(role => (
                      <option key={role.role_id} value={role.role_id}>{role.role_name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="pt-4">
                <button
                  type="submit" disabled={loading}
                  className="w-full py-4 rounded-2xl bg-blue-600 text-white font-bold text-sm shadow-xl shadow-blue-500/20 hover:bg-blue-700 hover:-translate-y-0.5 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <Spinner animation="border" size="sm" />
                      <span>Initializing...</span>
                    </>
                  ) : (
                    <>
                      <FaUserPlus /> Create Account
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default AddNewUserPage;