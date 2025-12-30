import React, { useState, useEffect, FormEvent } from 'react';
import axios from 'axios';
import { FaRocket, FaLightbulb, FaPlus, FaEdit, FaTrash, FaSearch, FaChevronDown, FaChevronUp } from 'react-icons/fa';

const BACKEND_URL = "https://api-cms.startechaigroup.com/api/incubation";

interface Program {
    id: number;
    title: string;
    icon: string;
    description: string;
    link: string;
}

interface SuccessStory {
    id: number;
    image_url: string;
    title: string;
    description: string[];
    stats: { number: string; label: string }[];
    link: string;
}

const IncubationAdmin: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'programs' | 'stories'>('programs');
    const [programs, setPrograms] = useState<Program[]>([]);
    const [stories, setStories] = useState<SuccessStory[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');

    // Form states
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);

    // Program Form State
    const [programForm, setProgramForm] = useState({
        title: '',
        icon: 'FaRocket',
        description: '',
        link: ''
    });

    // Story Form State
    const [storyForm, setStoryForm] = useState({
        title: '',
        description: [''],
        stats: [{ number: '', label: '' }],
        link: '',
        image_url: ''
    });
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);

    useEffect(() => {
        fetchData();
    }, [activeTab]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const endpoint = activeTab === 'programs' ? '/programs' : '/stories';
            const response = await axios.get(`${BACKEND_URL}${endpoint}`);
            if (activeTab === 'programs') setPrograms(response.data);
            else setStories(response.data);
        } catch (err: any) {
            setError(err.response?.data?.message || `Failed to fetch ${activeTab}`);
        } finally {
            setLoading(false);
        }
    };

    const handleProgramSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            if (editingId) {
                await axios.put(`${BACKEND_URL}/programs/${editingId}`, programForm);
                setSuccess('Program updated successfully');
            } else {
                await axios.post(`${BACKEND_URL}/programs`, programForm);
                setSuccess('Program created successfully');
            }
            setShowForm(false);
            setEditingId(null);
            resetForms();
            fetchData();
        } catch (err: any) {
            setError(err.response?.data?.message || 'Action failed');
        } finally {
            setLoading(false);
        }
    };

    const handleStorySubmit = async (e: FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const formData = new FormData();
            formData.append('title', storyForm.title);
            formData.append('description', JSON.stringify(storyForm.description.filter(d => d.trim() !== '')));
            formData.append('stats', JSON.stringify(storyForm.stats.filter(s => s.number && s.label)));
            formData.append('link', storyForm.link);
            if (imageFile) formData.append('image', imageFile);
            else if (storyForm.image_url) formData.append('image_url', storyForm.image_url);

            if (editingId) {
                await axios.put(`${BACKEND_URL}/stories/${editingId}`, formData);
                setSuccess('Story updated successfully');
            } else {
                await axios.post(`${BACKEND_URL}/stories`, formData);
                setSuccess('Story created successfully');
            }
            setShowForm(false);
            setEditingId(null);
            resetForms();
            fetchData();
        } catch (err: any) {
            setError(err.response?.data?.message || 'Action failed');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!window.confirm(`Are you sure you want to delete this ${activeTab === 'programs' ? 'program' : 'story'}?`)) return;
        setLoading(true);
        try {
            const endpoint = activeTab === 'programs' ? `/programs/${id}` : `/stories/${id}`;
            await axios.delete(`${BACKEND_URL}${endpoint}`);
            setSuccess('Deleted successfully');
            fetchData();
        } catch (err: any) {
            setError(err.response?.data?.message || 'Delete failed');
        } finally {
            setLoading(false);
        }
    };

    const resetForms = () => {
        setProgramForm({ title: '', icon: 'FaRocket', description: '', link: '' });
        setStoryForm({ title: '', description: [''], stats: [{ number: '', label: '' }], link: '', image_url: '' });
        setImageFile(null);
        setImagePreview(null);
    };

    const handleEdit = (item: any) => {
        setEditingId(item.id);
        setShowForm(true);
        if (activeTab === 'programs') {
            setProgramForm({ ...item });
        } else {
            setStoryForm({ ...item });
            setImagePreview(item.image_url);
        }
    };

    const addStat = () => setStoryForm({ ...storyForm, stats: [...storyForm.stats, { number: '', label: '' }] });
    const removeStat = (index: number) => setStoryForm({ ...storyForm, stats: storyForm.stats.filter((_, i) => i !== index) });
    const addDesc = () => setStoryForm({ ...storyForm, description: [...storyForm.description, ''] });
    const removeDesc = (index: number) => setStoryForm({ ...storyForm, description: storyForm.description.filter((_, i) => i !== index) });

    return (
        <div className="p-6 bg-gray-50 dark:bg-slate-900 min-h-screen">
            <div className="max-w-7xl mx-auto">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                            {activeTab === 'programs' ? <FaRocket className="text-blue-500" /> : <FaLightbulb className="text-amber-500" />}
                            Incubation Management
                        </h1>
                        <p className="text-gray-500 dark:text-gray-400 mt-1">Manage incubation programs and success stories</p>
                    </div>
                    <button
                        onClick={() => { resetForms(); setShowForm(true); setEditingId(null); }}
                        className="flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-lg transition-all"
                    >
                        <FaPlus /> Add New {activeTab === 'programs' ? 'Program' : 'Story'}
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex gap-2 mb-6 bg-white dark:bg-slate-800 p-1 rounded-2xl shadow-sm max-w-md">
                    <button
                        onClick={() => setActiveTab('programs')}
                        className={`flex-1 py-3 px-4 rounded-xl text-sm font-bold transition-all ${activeTab === 'programs' ? 'bg-blue-600 text-white shadow-md' : 'text-gray-500 hover:bg-gray-50 dark:hover:bg-slate-700'}`}
                    >
                        Programs
                    </button>
                    <button
                        onClick={() => setActiveTab('stories')}
                        className={`flex-1 py-3 px-4 rounded-xl text-sm font-bold transition-all ${activeTab === 'stories' ? 'bg-amber-500 text-white shadow-md' : 'text-gray-500 hover:bg-gray-50 dark:hover:bg-slate-700'}`}
                    >
                        Success Stories
                    </button>
                </div>

                {/* Main Content Area */}
                <div className="space-y-6">
                    {/* Form Modal Overlay */}
                    {showForm && (
                        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                            <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                                <form onSubmit={activeTab === 'programs' ? handleProgramSubmit : handleStorySubmit} className="p-8">
                                    <div className="flex items-center justify-between mb-8">
                                        <h2 className="text-2xl font-bold dark:text-white">
                                            {editingId ? 'Edit' : 'Add New'} {activeTab === 'programs' ? 'Program' : 'Story'}
                                        </h2>
                                        <button type="button" onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600">&times;</button>
                                    </div>

                                    {activeTab === 'programs' ? (
                                        <div className="space-y-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Title</label>
                                                <input
                                                    type="text"
                                                    value={programForm.title}
                                                    onChange={e => setProgramForm({ ...programForm, title: e.target.value })}
                                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                                                    required
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Icon (FaIcon Name)</label>
                                                <input
                                                    type="text"
                                                    value={programForm.icon}
                                                    onChange={e => setProgramForm({ ...programForm, icon: e.target.value })}
                                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
                                                <textarea
                                                    value={programForm.description}
                                                    onChange={e => setProgramForm({ ...programForm, description: e.target.value })}
                                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-slate-700 dark:bg-slate-900 dark:text-white h-32"
                                                    required
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Link Path</label>
                                                <input
                                                    type="text"
                                                    value={programForm.link}
                                                    onChange={e => setProgramForm({ ...programForm, link: e.target.value })}
                                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                                                />
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="space-y-6">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Title</label>
                                                <input
                                                    type="text"
                                                    value={storyForm.title}
                                                    onChange={e => setStoryForm({ ...storyForm, title: e.target.value })}
                                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                                                    required
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Success Story Image</label>
                                                <div className="flex items-start gap-4">
                                                    <div className="flex-1">
                                                        <input
                                                            type="file"
                                                            onChange={e => {
                                                                const file = e.target.files?.[0];
                                                                if (file) {
                                                                    setImageFile(file);
                                                                    setImagePreview(URL.createObjectURL(file));
                                                                }
                                                            }}
                                                            className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                                                        />
                                                    </div>
                                                    {imagePreview && (
                                                        <img src={imagePreview.startsWith('blob') ? imagePreview : `https://api-cms.startechaigroup.com${imagePreview}`} className="w-24 h-24 rounded-xl object-cover shadow-md" alt="Preview" />
                                                    )}
                                                </div>
                                            </div>

                                            <div>
                                                <div className="flex justify-between items-center mb-2">
                                                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Description Paragraphs</label>
                                                    <button type="button" onClick={addDesc} className="text-blue-600 text-xs font-bold">+ Add Paragraph</button>
                                                </div>
                                                <div className="space-y-2">
                                                    {storyForm.description.map((desc, idx) => (
                                                        <div key={idx} className="flex gap-2">
                                                            <textarea
                                                                value={desc}
                                                                onChange={e => {
                                                                    const newDesc = [...storyForm.description];
                                                                    newDesc[idx] = e.target.value;
                                                                    setStoryForm({ ...storyForm, description: newDesc });
                                                                }}
                                                                className="flex-1 px-4 py-2 rounded-xl border border-gray-200 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                                                            />
                                                            <button type="button" onClick={() => removeDesc(idx)} className="p-2 text-red-500"><FaTrash /></button>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>

                                            <div>
                                                <div className="flex justify-between items-center mb-2">
                                                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Achievement Stats</label>
                                                    <button type="button" onClick={addStat} className="text-blue-600 text-xs font-bold">+ Add Stat</button>
                                                </div>
                                                <div className="grid grid-cols-1 gap-2">
                                                    {storyForm.stats.map((stat, idx) => (
                                                        <div key={idx} className="flex gap-2 bg-gray-50 dark:bg-slate-900 p-3 rounded-xl border border-gray-200 dark:border-slate-700">
                                                            <input
                                                                placeholder="Number (e.g. 250+)"
                                                                value={stat.number}
                                                                onChange={e => {
                                                                    const newStats = [...storyForm.stats];
                                                                    newStats[idx].number = e.target.value;
                                                                    setStoryForm({ ...storyForm, stats: newStats });
                                                                }}
                                                                className="w-1/3 px-3 py-2 rounded-lg border border-gray-200 dark:border-slate-700"
                                                            />
                                                            <input
                                                                placeholder="Label (e.g. Clients)"
                                                                value={stat.label}
                                                                onChange={e => {
                                                                    const newStats = [...storyForm.stats];
                                                                    newStats[idx].label = e.target.value;
                                                                    setStoryForm({ ...storyForm, stats: newStats });
                                                                }}
                                                                className="flex-1 px-3 py-2 rounded-lg border border-gray-200 dark:border-slate-700"
                                                            />
                                                            <button type="button" onClick={() => removeStat(idx)} className="p-2 text-red-500"><FaTrash /></button>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Full Article / Website Link</label>
                                                <input
                                                    type="text"
                                                    value={storyForm.link}
                                                    onChange={e => setStoryForm({ ...storyForm, link: e.target.value })}
                                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                                                />
                                            </div>
                                        </div>
                                    )}

                                    <div className="flex gap-4 mt-8 pt-6 border-t dark:border-slate-700">
                                        <button
                                            type="submit"
                                            disabled={loading}
                                            className="flex-1 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold shadow-lg shadow-blue-500/30 transition-all disabled:opacity-50"
                                        >
                                            {loading ? 'Saving...' : editingId ? 'Update Item' : 'Create Item'}
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setShowForm(false)}
                                            className="px-8 py-4 bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-white rounded-2xl font-bold transition-all"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    )}

                    {/* Content List */}
                    {loading && !showForm ? (
                        <div className="flex flex-col items-center justify-center p-20 bg-white dark:bg-slate-800 rounded-3xl border border-dashed border-gray-200 dark:border-slate-700">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-4"></div>
                            <p className="text-gray-500">Retrieving {activeTab}...</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {activeTab === 'programs' ? (
                                programs.map(program => (
                                    <div key={program.id} className="bg-white dark:bg-slate-800 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-slate-700 group hover:shadow-xl transition-all">
                                        <div className="flex gap-6">
                                            <div className="w-16 h-16 rounded-2xl bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 text-2xl group-hover:scale-110 transition-all">
                                                <FaRocket />
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex justify-between items-start">
                                                    <h3 className="text-xl font-bold dark:text-white">{program.title}</h3>
                                                    <div className="flex gap-2">
                                                        <button onClick={() => handleEdit(program)} className="p-2.5 bg-gray-50 dark:bg-slate-900 border border-gray-100 dark:border-slate-700 rounded-lg text-blue-600 hover:bg-blue-600 hover:text-white transition-all"><FaEdit /></button>
                                                        <button onClick={() => handleDelete(program.id)} className="p-2.5 bg-gray-50 dark:bg-slate-900 border border-gray-100 dark:border-slate-700 rounded-lg text-red-500 hover:bg-red-500 hover:text-white transition-all"><FaTrash /></button>
                                                    </div>
                                                </div>
                                                <p className="text-gray-500 dark:text-gray-400 mt-2 text-sm line-clamp-2">{program.description}</p>
                                                <div className="mt-4 flex items-center gap-2">
                                                    <span className="text-xs font-bold text-gray-400 uppercase">Link:</span>
                                                    <span className="text-xs text-blue-500 font-medium italic">{program.link}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                stories.map(story => (
                                    <div key={story.id} className="bg-white dark:bg-slate-800 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-slate-700 group hover:shadow-xl transition-all">
                                        <div className="flex gap-6">
                                            <img src={story.image_url.startsWith('http') ? story.image_url : `https://api-cms.startechaigroup.com${story.image_url}`} className="w-32 h-40 rounded-2xl object-cover shadow-sm group-hover:scale-105 transition-all" alt={story.title} />
                                            <div className="flex-1">
                                                <div className="flex justify-between items-start mb-2">
                                                    <h3 className="text-xl font-bold dark:text-white">{story.title}</h3>
                                                    <div className="flex gap-2">
                                                        <button onClick={() => handleEdit(story)} className="p-2.5 bg-gray-50 dark:bg-slate-900 border border-gray-100 dark:border-slate-700 rounded-lg text-blue-600 hover:bg-blue-600 hover:text-white transition-all"><FaEdit /></button>
                                                        <button onClick={() => handleDelete(story.id)} className="p-2.5 bg-gray-50 dark:bg-slate-900 border border-gray-100 dark:border-slate-700 rounded-lg text-red-500 hover:bg-red-500 hover:text-white transition-all"><FaTrash /></button>
                                                    </div>
                                                </div>
                                                <div className="flex gap-2 flex-wrap mb-4">
                                                    {story.stats.slice(0, 2).map((s, i) => (
                                                        <span key={i} className="text-[10px] font-bold bg-amber-50 dark:bg-amber-900/30 text-amber-600 px-2 py-1 rounded-md uppercase tracking-wider">{s.number} {s.label}</span>
                                                    ))}
                                                </div>
                                                <p className="text-gray-500 dark:text-gray-400 text-sm line-clamp-3 mb-4">{story.description[0]}</p>
                                                <a href={story.link} target="_blank" rel="noopener noreferrer" className="text-blue-500 text-xs font-bold hover:underline">View Destination &rarr;</a>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default IncubationAdmin;
