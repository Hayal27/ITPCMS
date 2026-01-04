
import React, { useState, useEffect, FormEvent } from 'react';
import axios from 'axios';
import { FaChalkboardTeacher, FaPlus, FaEdit, FaTrash, FaSearch, FaCalendarAlt, FaMapMarkerAlt, FaUsers, FaLink } from 'react-icons/fa';

const BACKEND_URL = "http://localhost:5005/api/trainings";

interface Training {
    id: number;
    title: string;
    image_url?: string;
    event_date: string;
    duration: string;
    location: string;
    type: string;
    instructor: string;
    capacity: number;
    summary: string;
    description: string;
    tags: string[];
    link?: string;
    status: 'Upcoming' | 'Ongoing' | 'Completed' | 'Cancelled';
}

const TrainingAdmin: React.FC = () => {
    const [trainings, setTrainings] = useState<Training[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [editingTraining, setEditingTraining] = useState<Training | null>(null);
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);

    const initialForm: Partial<Training> = {
        title: '',
        event_date: '',
        duration: '',
        location: '',
        type: 'Workshop',
        instructor: '',
        capacity: 0,
        summary: '',
        description: '',
        tags: [],
        link: '',
        status: 'Upcoming'
    };

    const [form, setForm] = useState<Partial<Training>>(initialForm);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const res = await axios.get(BACKEND_URL);
            setTrainings(res.data);
        } catch (err) {
            setError('Failed to fetch trainings');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            const formData = new FormData();
            Object.keys(form).forEach(key => {
                const value = (form as any)[key];
                if (key === 'tags') {
                    formData.append(key, JSON.stringify(value || []));
                } else if (value !== undefined && value !== null) {
                    formData.append(key, value);
                }
            });

            if (imageFile) {
                formData.append('image', imageFile);
            }

            if (editingTraining) {
                await axios.put(`${BACKEND_URL}/${editingTraining.id}`, formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                setSuccess('Training updated successfully');
            } else {
                await axios.post(BACKEND_URL, formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                setSuccess('Training created successfully');
            }
            setShowForm(false);
            setEditingTraining(null);
            setImageFile(null);
            setImagePreview(null);
            fetchData();
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to save training');
        } finally {
            setLoading(false);
        }
    };

    const deleteTraining = async (id: number) => {
        if (!window.confirm('Are you sure you want to delete this training?')) return;
        try {
            await axios.delete(`${BACKEND_URL}/${id}`);
            setSuccess('Training deleted successfully');
            fetchData();
        } catch (err) {
            setError('Failed to delete training');
        }
    };

    const filteredTrainings = trainings.filter(t =>
        t.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.instructor.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const inputClass = "w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-slate-800 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all";
    const labelClass = "block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1";

    return (
        <div className="p-6 max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-extrabold dark:text-white">Training & Workshops</h1>
                    <p className="text-gray-500 dark:text-gray-400">Manage all educational events and bootcamps</p>
                </div>
                <button
                    onClick={() => {
                        setEditingTraining(null);
                        setForm(initialForm);
                        setImagePreview(null);
                        setImageFile(null);
                        setShowForm(true);
                    }}
                    className="bg-blue-600 text-white px-5 py-2.5 rounded-xl flex items-center space-x-2 hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/30"
                >
                    <FaPlus /> <span>New Training</span>
                </button>
            </div>

            {error && <div className="bg-red-50 border-l-4 border-red-500 text-red-700 px-4 py-3 rounded-lg mb-6 flex items-center justify-between">
                <span>{error}</span>
                <button onClick={() => setError(null)}>&times;</button>
            </div>}
            {success && <div className="bg-green-50 border-l-4 border-green-500 text-green-700 px-4 py-3 rounded-lg mb-6 flex items-center justify-between">
                <span>{success}</span>
                <button onClick={() => setSuccess(null)}>&times;</button>
            </div>}

            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl overflow-hidden border border-gray-100 dark:border-gray-800">
                <div className="p-5 border-b dark:border-gray-800 bg-gray-50/50 dark:bg-slate-800/50">
                    <div className="relative w-full max-w-md">
                        <FaSearch className="absolute left-3 top-3 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search by title or instructor..."
                            className="pl-10 pr-4 py-2 w-full rounded-xl border dark:border-gray-700 dark:bg-slate-800 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-gray-50 dark:bg-slate-800/50 text-gray-600 dark:text-gray-300 text-xs uppercase tracking-wider font-bold">
                                <th className="py-4 px-6">Event</th>
                                <th className="py-4 px-6">Date & Location</th>
                                <th className="py-4 px-6">Type</th>
                                <th className="py-4 px-6">Capacity</th>
                                <th className="py-4 px-6">Status</th>
                                <th className="py-4 px-6">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y dark:divide-gray-800">
                            {filteredTrainings.map(t => (
                                <tr key={t.id} className="hover:bg-gray-50 dark:hover:bg-slate-800/30 transition-colors">
                                    <td className="py-4 px-6">
                                        <div className="flex items-center space-x-3">
                                            <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100 dark:bg-gray-700">
                                                <img
                                                    src={t.image_url?.startsWith('http') ? t.image_url : `http://localhost:5005${t.image_url}`}
                                                    alt={t.title}
                                                    className="w-full h-full object-cover"
                                                    onError={(e) => (e.currentTarget.src = 'https://via.placeholder.com/150')}
                                                />
                                            </div>
                                            <div>
                                                <div className="font-bold text-gray-900 dark:text-white">{t.title}</div>
                                                <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center">
                                                    <FaChalkboardTeacher className="mr-1" /> {t.instructor}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="py-4 px-6">
                                        <div className="text-sm text-gray-600 dark:text-gray-300 flex items-center mb-1">
                                            <FaCalendarAlt className="mr-2 text-blue-500" /> {new Date(t.event_date).toLocaleDateString()}
                                        </div>
                                        <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center">
                                            <FaMapMarkerAlt className="mr-2 text-red-500" /> {t.location}
                                        </div>
                                    </td>
                                    <td className="py-4 px-6">
                                        <span className="px-3 py-1 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-full text-xs font-bold">
                                            {t.type}
                                        </span>
                                    </td>
                                    <td className="py-4 px-6">
                                        <div className="text-sm font-semibold dark:text-gray-300 flex items-center">
                                            <FaUsers className="mr-2 text-gray-400" /> {t.capacity}
                                        </div>
                                    </td>
                                    <td className="py-4 px-6">
                                        <span className={`px-2 py-1 rounded-md text-[10px] font-black uppercase tracking-widest ${t.status === 'Upcoming' ? 'bg-blue-100 text-blue-700' :
                                            t.status === 'Ongoing' ? 'bg-green-100 text-green-700' :
                                                t.status === 'Completed' ? 'bg-gray-100 text-gray-700' :
                                                    'bg-red-100 text-red-700'
                                            }`}>
                                            {t.status}
                                        </span>
                                    </td>
                                    <td className="py-4 px-6">
                                        <div className="flex items-center space-x-3">
                                            <button
                                                onClick={() => {
                                                    setEditingTraining(t);
                                                    setForm({ ...t, event_date: t.event_date.split('T')[0] });
                                                    setImagePreview(null);
                                                    setShowForm(true);
                                                }}
                                                className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                                            >
                                                <FaEdit />
                                            </button>
                                            <button
                                                onClick={() => deleteTraining(t.id)}
                                                className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                            >
                                                <FaTrash />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Form Modal */}
            {showForm && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl animate-in fade-in zoom-in duration-300">
                        <div className="sticky top-0 bg-white dark:bg-slate-900 z-10 p-6 border-b dark:border-gray-800 flex justify-between items-center">
                            <h2 className="text-2xl font-black dark:text-white">{editingTraining ? 'Edit Workshop' : 'Launch New Training'}</h2>
                            <button onClick={() => setShowForm(false)} className="text-gray-500 hover:bg-gray-100 dark:hover:bg-slate-800 p-2 rounded-full transition-all">&times;</button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-8 space-y-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className={labelClass}>Title</label>
                                    <input type="text" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className={inputClass} required placeholder="e.g. Advanced AI Bootcamp" />
                                </div>
                                <div className="space-y-2">
                                    <label className={labelClass}>Instructor</label>
                                    <input type="text" value={form.instructor} onChange={(e) => setForm({ ...form, instructor: e.target.value })} className={inputClass} required placeholder="Name of instructor" />
                                </div>
                                <div className="space-y-2">
                                    <label className={labelClass}>Event Date</label>
                                    <input type="date" value={form.event_date} onChange={(e) => setForm({ ...form, event_date: e.target.value })} className={inputClass} required />
                                </div>
                                <div className="space-y-2">
                                    <label className={labelClass}>Duration</label>
                                    <input type="text" value={form.duration} onChange={(e) => setForm({ ...form, duration: e.target.value })} className={inputClass} placeholder="e.g. 3 Days, 6 Weeks" />
                                </div>
                                <div className="space-y-2">
                                    <label className={labelClass}>Location</label>
                                    <input type="text" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} className={inputClass} placeholder="e.g. IT Park Hall A, Virtual" />
                                </div>
                                <div className="space-y-2">
                                    <label className={labelClass}>Type</label>
                                    <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} className={inputClass}>
                                        <option value="Workshop">Workshop</option>
                                        <option value="Bootcamp">Bootcamp</option>
                                        <option value="Seminar">Seminar</option>
                                        <option value="Certification">Certification</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className={labelClass}>Capacity</label>
                                    <input type="number" value={form.capacity} onChange={(e) => setForm({ ...form, capacity: parseInt(e.target.value) })} className={inputClass} />
                                </div>
                                <div className="space-y-2">
                                    <label className={labelClass}>Status</label>
                                    <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as any })} className={inputClass}>
                                        <option value="Upcoming">Upcoming</option>
                                        <option value="Ongoing">Ongoing</option>
                                        <option value="Completed">Completed</option>
                                        <option value="Cancelled">Cancelled</option>
                                    </select>
                                </div>
                            </div>

                            <div className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div className="md:col-span-1">
                                        <label className={labelClass}>Cover Image</label>
                                        <div className="mt-2 flex flex-col items-center">
                                            <div className="w-full aspect-video rounded-2xl overflow-hidden bg-gray-100 dark:bg-gray-800 border-2 border-dashed border-gray-300 dark:border-gray-700 flex items-center justify-center relative group">
                                                {imagePreview || form.image_url ? (
                                                    <img src={imagePreview || (form.image_url?.startsWith('http') ? form.image_url : `http://localhost:5005${form.image_url}`)} alt="Preview" className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="text-center p-4">
                                                        <FaPlus className="text-gray-400 mb-2 mx-auto" size={24} />
                                                        <span className="text-xs text-gray-500">Click to upload image</span>
                                                    </div>
                                                )}
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    onChange={(e) => {
                                                        const file = e.target.files?.[0];
                                                        if (file) {
                                                            setImageFile(file);
                                                            setImagePreview(URL.createObjectURL(file));
                                                        }
                                                    }}
                                                    className="absolute inset-0 opacity-0 cursor-pointer"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="md:col-span-2 space-y-4">
                                        <div className="space-y-2">
                                            <label className={labelClass}>Summary</label>
                                            <textarea value={form.summary} onChange={(e) => setForm({ ...form, summary: e.target.value })} className={inputClass} rows={2} placeholder="Brief highlight of the event" />
                                        </div>
                                        <div className="space-y-2">
                                            <label className={labelClass}>Tags (Comma separated)</label>
                                            <input
                                                type="text"
                                                value={form.tags?.join(', ')}
                                                onChange={(e) => setForm({ ...form, tags: e.target.value.split(',').map(s => s.trim()).filter(s => s !== '') })}
                                                className={inputClass}
                                                placeholder="e.g. AI, Machine Learning, Python"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className={labelClass}>Full Description</label>
                                    <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className={`${inputClass} min-h-[150px]`} rows={5} placeholder="Detailed content, curriculum, or requirements..." />
                                </div>

                                <div className="space-y-2">
                                    <label className={labelClass}>Application/Info Link</label>
                                    <input type="url" value={form.link} onChange={(e) => setForm({ ...form, link: e.target.value })} className={inputClass} placeholder="https://apply.itpark.com/bootcamp" />
                                </div>
                            </div>

                            <div className="flex justify-end space-x-4 pt-8 border-t dark:border-gray-800">
                                <button type="button" onClick={() => setShowForm(false)} className="px-6 py-2.5 text-gray-600 dark:text-gray-400 font-bold hover:text-gray-900 transition-colors">Discard</button>
                                <button type="submit" disabled={loading} className="bg-blue-600 text-white px-10 py-2.5 rounded-xl font-black hover:bg-blue-700 transition-all shadow-xl shadow-blue-500/30">
                                    {loading ? 'Processing...' : (editingTraining ? 'Update Event' : 'Launch Training')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TrainingAdmin;
