
import React, { useState, useEffect, FormEvent } from 'react';
import axios from 'axios';
import { FaPlus, FaEdit, FaTrash, FaSearch, FaFileAlt } from 'react-icons/fa';

const BACKEND_URL = "https://api-cms.startechaigroup.com/api/invest";

interface InvestmentStep {
    id: number;
    step_number: number;
    title: string;
    description: string;
    doc_url?: string;
    status: string;
}

interface InvestmentResource {
    id: number;
    label: string;
    icon: string;
    file_url: string;
    type: string;
}

const InvestmentStepsAdmin: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'steps' | 'resources'>('steps');
    const [steps, setSteps] = useState<InvestmentStep[]>([]);
    const [resources, setResources] = useState<InvestmentResource[]>([]);
    const [loading, setLoading] = useState(false);

    // Form state
    const [showStepForm, setShowStepForm] = useState(false);
    const [stepForm, setStepForm] = useState<Partial<InvestmentStep>>({ step_number: 1, title: '', description: '', status: 'active' });
    const [editingStep, setEditingStep] = useState<InvestmentStep | null>(null);
    const [stepFile, setStepFile] = useState<File | null>(null);

    const [showResourceForm, setShowResourceForm] = useState(false);
    const [resourceForm, setResourceForm] = useState<Partial<InvestmentResource>>({ label: '', icon: 'FaFileAlt', type: 'document' });
    const [resourceFile, setResourceFile] = useState<File | null>(null);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [stepsRes, resourcesRes] = await Promise.all([
                axios.get(`${BACKEND_URL}/steps`),
                axios.get(`${BACKEND_URL}/resources`)
            ]);
            setSteps(stepsRes.data);
            setResources(resourcesRes.data);
        } catch (err) {
            console.error("Failed to fetch data", err);
        } finally {
            setLoading(false);
        }
    };

    /* --- STEPS HANDLERS --- */
    const handleStepSubmit = async (e: FormEvent) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append('step_number', String(stepForm.step_number));
        formData.append('title', stepForm.title || '');
        formData.append('description', stepForm.description || '');
        formData.append('status', stepForm.status || 'active');
        if (stepFile) formData.append('doc', stepFile);
        else if (editingStep?.doc_url) formData.append('doc_url', editingStep.doc_url);

        try {
            if (editingStep) {
                await axios.put(`${BACKEND_URL}/steps/${editingStep.id}`, formData);
            } else {
                await axios.post(`${BACKEND_URL}/steps`, formData);
            }
            setShowStepForm(false);
            setEditingStep(null);
            setStepFile(null);
            setStepForm({ step_number: steps.length + 1, title: '', description: '', status: 'active' });
            fetchData();
        } catch (error) {
            console.error(error);
            alert('Operation failed');
        }
    };

    const deleteStep = async (id: number) => {
        if (!window.confirm('Delete this step?')) return;
        try {
            await axios.delete(`${BACKEND_URL}/steps/${id}`);
            fetchData();
        } catch (error) {
            console.error(error);
        }
    };

    /* --- RESOURCES HANDLERS --- */
    const handleResourceSubmit = async (e: FormEvent) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append('label', resourceForm.label || '');
        formData.append('icon', resourceForm.icon || 'FaFileAlt');
        formData.append('type', resourceForm.type || 'document');
        if (resourceFile) formData.append('file', resourceFile);
        else return alert('File is required for new resources'); // Simple validation

        try {
            await axios.post(`${BACKEND_URL}/resources`, formData);
            setShowResourceForm(false);
            setResourceFile(null);
            setResourceForm({ label: '', icon: 'FaFileAlt', type: 'document' });
            fetchData();
        } catch (error) {
            console.error(error);
            alert('Operation failed');
        }
    };

    const deleteResource = async (id: number) => {
        if (!window.confirm('Delete this resource?')) return;
        try {
            await axios.delete(`${BACKEND_URL}/resources/${id}`);
            fetchData();
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <div className="p-6 max-w-7xl mx-auto">
            <h1 className="text-3xl font-extrabold dark:text-white mb-6">Investment Steps & Resources</h1>

            <div className="flex space-x-4 mb-6 border-b dark:border-gray-700">
                <button
                    onClick={() => setActiveTab('steps')}
                    className={`pb-2 px-4 font-bold ${activeTab === 'steps' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500'}`}
                >
                    Roadmap Steps
                </button>
                <button
                    onClick={() => setActiveTab('resources')}
                    className={`pb-2 px-4 font-bold ${activeTab === 'resources' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500'}`}
                >
                    Resources (Toolkit)
                </button>
            </div>

            {/* STEPS TAB */}
            {activeTab === 'steps' && (
                <>
                    <button onClick={() => setShowStepForm(true)} className="mb-4 bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2">
                        <FaPlus /> Add Step
                    </button>
                    <div className="grid gap-4">
                        {steps.map(step => (
                            <div key={step.id} className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow border dark:border-gray-700 flex justify-between items-center">
                                <div>
                                    <h3 className="font-bold text-lg dark:text-white"><span className="text-blue-500">#{step.step_number}</span> {step.title}</h3>
                                    <p className="text-gray-600 dark:text-gray-400 text-sm">{step.description}</p>
                                </div>
                                <div className="flex gap-2">
                                    <button onClick={() => {
                                        setEditingStep(step);
                                        setStepForm(step);
                                        setShowStepForm(true);
                                    }} className="p-2 text-blue-500 hover:bg-blue-50 rounded"><FaEdit /></button>
                                    <button onClick={() => deleteStep(step.id)} className="p-2 text-red-500 hover:bg-red-50 rounded"><FaTrash /></button>
                                </div>
                            </div>
                        ))}
                    </div>
                </>
            )}

            {/* RESOURCES TAB */}
            {activeTab === 'resources' && (
                <>
                    <button onClick={() => setShowResourceForm(true)} className="mb-4 bg-teal-600 text-white px-4 py-2 rounded-lg flex items-center gap-2">
                        <FaPlus /> Add Resource
                    </button>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {resources.map(res => (
                            <div key={res.id} className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow border dark:border-gray-700 flex flex-col items-center text-center">
                                <div className="text-4xl text-teal-500 mb-2"><FaFileAlt /></div> {/* Icon rendering simplified for admin */}
                                <h4 className="font-bold dark:text-white">{res.label}</h4>
                                <a href={res.file_url.startsWith('http') ? res.file_url : `https://api-cms.startechaigroup.com${res.file_url}`} target="_blank" rel="noreferrer" className="text-blue-500 text-xs mt-2 underline">View File</a>
                                <button onClick={() => deleteResource(res.id)} className="mt-4 text-red-500 text-xs uppercase font-bold hover:underline">Remove</button>
                            </div>
                        ))}
                    </div>
                </>
            )}

            {/* STEP FORM MODAL */}
            {showStepForm && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl w-full max-w-lg">
                        <h2 className="text-xl font-bold mb-4 dark:text-white">{editingStep ? 'Edit Step' : 'New Step'}</h2>
                        <form onSubmit={handleStepSubmit} className="space-y-4">
                            <div className="flex gap-4">
                                <div className="w-1/4">
                                    <label className="block text-sm font-bold mb-1">Step #</label>
                                    <input type="number" required value={stepForm.step_number} onChange={e => setStepForm({ ...stepForm, step_number: parseInt(e.target.value) })} className="w-full border p-2 rounded" />
                                </div>
                                <div className="w-3/4">
                                    <label className="block text-sm font-bold mb-1">Title</label>
                                    <input type="text" required value={stepForm.title} onChange={e => setStepForm({ ...stepForm, title: e.target.value })} className="w-full border p-2 rounded" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-bold mb-1">Description</label>
                                <textarea required value={stepForm.description} onChange={e => setStepForm({ ...stepForm, description: e.target.value })} className="w-full border p-2 rounded" rows={3} />
                            </div>
                            <div>
                                <label className="block text-sm font-bold mb-1">Document (PDF/Zip)</label>
                                <input type="file" onChange={e => setStepFile(e.target.files?.[0] || null)} className="w-full" />
                            </div>
                            <div className="flex justify-end gap-2 mt-4">
                                <button type="button" onClick={() => setShowStepForm(false)} className="px-4 py-2 text-gray-500">Cancel</button>
                                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded">Save</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* RESOURCE FORM MODAL */}
            {showResourceForm && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl w-full max-w-lg">
                        <h2 className="text-xl font-bold mb-4 dark:text-white">New Resource</h2>
                        <form onSubmit={handleResourceSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-bold mb-1">Label</label>
                                <input type="text" required value={resourceForm.label} onChange={e => setResourceForm({ ...resourceForm, label: e.target.value })} className="w-full border p-2 rounded" />
                            </div>
                            <div>
                                <label className="block text-sm font-bold mb-1">Icon Name (React Icons)</label>
                                <select value={resourceForm.icon} onChange={e => setResourceForm({ ...resourceForm, icon: e.target.value })} className="w-full border p-2 rounded">
                                    <option value="FaFileAlt">FaFileAlt (Document)</option>
                                    <option value="FaFileSignature">FaFileSignature (Form)</option>
                                    <option value="FaGavel">FaGavel (Legal)</option>
                                    <option value="FaMapMarkedAlt">FaMapMarkedAlt (Map)</option>
                                    <option value="FaRegLightbulb">FaRegLightbulb (Idea/Info)</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-bold mb-1">File Upload</label>
                                <input type="file" required onChange={e => setResourceFile(e.target.files?.[0] || null)} className="w-full" />
                            </div>
                            <div className="flex justify-end gap-2 mt-4">
                                <button type="button" onClick={() => setShowResourceForm(false)} className="px-4 py-2 text-gray-500">Cancel</button>
                                <button type="submit" className="px-4 py-2 bg-teal-600 text-white rounded">Save</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default InvestmentStepsAdmin;
