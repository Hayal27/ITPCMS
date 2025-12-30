import React, { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import axios from 'axios';
import { FaBuilding, FaPlus, FaEdit, FaTrash, FaCheck, FaTimes, FaSearch } from 'react-icons/fa';

const BACKEND_URL = "https://api-cms.startechaigroup.com/api/offices";

interface Building {
    id: number;
    name: string;
    description: string;
    total_offices: number;
    available_offices: number;
    total_size_sqm: number;
    icon_name: string;
}

interface Office {
    id: string;
    zone: string;
    building_id: number;
    building_name?: string;
    unit_number: string;
    floor: number;
    size_sqm: number;
    status: 'Available' | 'Rented';
    price_monthly: number;
    rented_by: string | null;
    available_from: string;
    contact_name: string;
    contact_phone: string;
}

const OfficeAdmin: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'offices' | 'buildings'>('offices');
    const [offices, setOffices] = useState<Office[]>([]);
    const [buildings, setBuildings] = useState<Building[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');

    // Form states
    const [showOfficeForm, setShowOfficeForm] = useState(false);
    const [showBuildingForm, setShowBuildingForm] = useState(false);
    const [editingOffice, setEditingOffice] = useState<Office | null>(null);
    const [editingBuilding, setEditingBuilding] = useState<Building | null>(null);

    const [officeForm, setOfficeForm] = useState<Partial<Office>>({
        id: '',
        zone: '',
        building_id: 0,
        unit_number: '',
        floor: 0,
        size_sqm: 0,
        status: 'Available',
        price_monthly: 0,
        rented_by: '',
        available_from: '',
        contact_name: '',
        contact_phone: ''
    });

    const [buildingForm, setBuildingForm] = useState<Partial<Building>>({
        name: '',
        description: '',
        total_offices: 0,
        available_offices: 0,
        total_size_sqm: 0,
        icon_name: 'FaBuilding'
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [officesRes, buildingsRes] = await Promise.all([
                axios.get(BACKEND_URL),
                axios.get(`${BACKEND_URL}/buildings`)
            ]);
            setOffices(officesRes.data);
            setBuildings(buildingsRes.data);
        } catch (err) {
            setError('Failed to fetch data');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleOfficeSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            if (editingOffice) {
                await axios.put(`${BACKEND_URL}/${editingOffice.id}`, officeForm);
                setSuccess('Office updated successfully');
            } else {
                await axios.post(BACKEND_URL, officeForm);
                setSuccess('Office created successfully');
            }
            setShowOfficeForm(false);
            setEditingOffice(null);
            fetchData();
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to save office');
        } finally {
            setLoading(false);
        }
    };

    const handleBuildingSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            if (editingBuilding) {
                await axios.put(`${BACKEND_URL}/buildings/${editingBuilding.id}`, buildingForm);
                setSuccess('Building updated successfully');
            } else {
                await axios.post(`${BACKEND_URL}/buildings`, buildingForm);
                setSuccess('Building created successfully');
            }
            setShowBuildingForm(false);
            setEditingBuilding(null);
            fetchData();
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to save building');
        } finally {
            setLoading(false);
        }
    };

    const deleteOffice = async (id: string) => {
        if (!window.confirm('Are you sure you want to delete this office?')) return;
        try {
            await axios.delete(`${BACKEND_URL}/${id}`);
            setSuccess('Office deleted successfully');
            fetchData();
        } catch (err) {
            setError('Failed to delete office');
        }
    };

    const deleteBuilding = async (id: number) => {
        if (!window.confirm('Are you sure you want to delete this building? All offices in this building will be deleted too.')) return;
        try {
            await axios.delete(`${BACKEND_URL}/buildings/${id}`);
            setSuccess('Building deleted successfully');
            fetchData();
        } catch (err) {
            setError('Failed to delete building');
        }
    };

    const filteredOffices = offices.filter(o =>
        o.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        o.building_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        o.unit_number.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const inputClass = "w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-slate-800 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none";
    const labelClass = "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1";

    return (
        <div className="p-6 max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold dark:text-white">Office Management</h1>
                <div className="flex space-x-2">
                    <button
                        onClick={() => { setActiveTab('offices'); fetchData(); }}
                        className={`px-4 py-2 rounded-lg ${activeTab === 'offices' ? 'bg-blue-600 text-white' : 'bg-gray-200 dark:bg-gray-700 dark:text-gray-300'}`}
                    >
                        Offices
                    </button>
                    <button
                        onClick={() => { setActiveTab('buildings'); fetchData(); }}
                        className={`px-4 py-2 rounded-lg ${activeTab === 'buildings' ? 'bg-blue-600 text-white' : 'bg-gray-200 dark:bg-gray-700 dark:text-gray-300'}`}
                    >
                        Buildings
                    </button>
                </div>
            </div>

            {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{error}</div>}
            {success && <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">{success}</div>}

            <div className="bg-white dark:bg-slate-900 rounded-xl shadow-lg p-6 border border-gray-100 dark:border-gray-800">
                {activeTab === 'offices' ? (
                    <>
                        <div className="flex justify-between items-center mb-4">
                            <div className="relative w-64">
                                <FaSearch className="absolute left-3 top-3 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Search offices..."
                                    className="pl-10 pr-4 py-2 w-full rounded-lg border dark:border-gray-700 dark:bg-slate-800 dark:text-white"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                            <button
                                onClick={() => { setEditingOffice(null); setOfficeForm({ status: 'Available' }); setShowOfficeForm(true); }}
                                className="bg-green-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-green-700"
                            >
                                <FaPlus /> <span>Add Office</span>
                            </button>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="border-b dark:border-gray-800">
                                        <th className="py-3 px-4 dark:text-gray-300">ID</th>
                                        <th className="py-3 px-4 dark:text-gray-300">Building</th>
                                        <th className="py-3 px-4 dark:text-gray-300">Unit</th>
                                        <th className="py-3 px-4 dark:text-gray-300">Size</th>
                                        <th className="py-3 px-4 dark:text-gray-300">Price</th>
                                        <th className="py-3 px-4 dark:text-gray-300">Status</th>
                                        <th className="py-3 px-4 dark:text-gray-300">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredOffices.map(o => (
                                        <tr key={o.id} className="border-b dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-slate-800/50">
                                            <td className="py-3 px-4 dark:text-gray-400">{o.id}</td>
                                            <td className="py-3 px-4 dark:text-gray-400">{o.building_name}</td>
                                            <td className="py-3 px-4 dark:text-gray-400">{o.unit_number} (F{o.floor})</td>
                                            <td className="py-3 px-4 dark:text-gray-400">{o.size_sqm} m²</td>
                                            <td className="py-3 px-4 dark:text-gray-400">{o.price_monthly} ETB</td>
                                            <td className="py-3 px-4">
                                                <span className={`px-2 py-1 rounded-full text-xs ${o.status === 'Available' ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'}`}>
                                                    {o.status}
                                                </span>
                                            </td>
                                            <td className="py-3 px-4">
                                                <div className="flex space-x-2">
                                                    <button onClick={() => { setEditingOffice(o); setOfficeForm(o); setShowOfficeForm(true); }} className="text-blue-600 hover:text-blue-800"><FaEdit /></button>
                                                    <button onClick={() => deleteOffice(o.id)} className="text-red-600 hover:text-red-800"><FaTrash /></button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </>
                ) : (
                    <>
                        <div className="flex justify-end mb-4">
                            <button
                                onClick={() => { setEditingBuilding(null); setBuildingForm({ icon_name: 'FaBuilding' }); setShowBuildingForm(true); }}
                                className="bg-green-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-green-700"
                            >
                                <FaPlus /> <span>Add Building</span>
                            </button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {buildings.map(b => (
                                <div key={b.id} className="border dark:border-gray-800 p-4 rounded-xl dark:bg-slate-800/50">
                                    <div className="flex justify-between items-start mb-2">
                                        <FaBuilding className="text-2xl text-blue-500" />
                                        <div className="flex space-x-2">
                                            <button onClick={() => { setEditingBuilding(b); setBuildingForm(b); setShowBuildingForm(true); }} className="text-blue-600 hover:text-blue-800"><FaEdit /></button>
                                            <button onClick={() => deleteBuilding(b.id)} className="text-red-600 hover:text-red-800"><FaTrash /></button>
                                        </div>
                                    </div>
                                    <h3 className="font-bold text-lg dark:text-white">{b.name}</h3>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 line-clamp-2">{b.description}</p>
                                    <div className="grid grid-cols-2 gap-2 text-xs">
                                        <div className="bg-gray-100 dark:bg-gray-700 p-2 rounded">
                                            <div className="text-gray-500">Offices</div>
                                            <div className="font-bold dark:text-white">{b.total_offices}</div>
                                        </div>
                                        <div className="bg-gray-100 dark:bg-gray-700 p-2 rounded">
                                            <div className="text-gray-500">Available</div>
                                            <div className="font-bold dark:text-white">{b.available_offices}</div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                )}
            </div>

            {/* Office Modal */}
            {showOfficeForm && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6">
                        <h2 className="text-xl font-bold mb-4 dark:text-white">{editingOffice ? 'Edit Office' : 'Add New Office'}</h2>
                        <form onSubmit={handleOfficeSubmit} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className={labelClass}>Office ID</label>
                                    <input type="text" value={officeForm.id} onChange={(e) => setOfficeForm({ ...officeForm, id: e.target.value })} className={inputClass} required disabled={!!editingOffice} />
                                </div>
                                <div>
                                    <label className={labelClass}>Building</label>
                                    <select value={officeForm.building_id} onChange={(e) => setOfficeForm({ ...officeForm, building_id: parseInt(e.target.value) })} className={inputClass} required>
                                        <option value="">Select Building</option>
                                        {buildings.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className={labelClass}>Zone</label>
                                    <input type="text" value={officeForm.zone} onChange={(e) => setOfficeForm({ ...officeForm, zone: e.target.value })} className={inputClass} required />
                                </div>
                                <div>
                                    <label className={labelClass}>Unit Number</label>
                                    <input type="text" value={officeForm.unit_number} onChange={(e) => setOfficeForm({ ...officeForm, unit_number: e.target.value })} className={inputClass} required />
                                </div>
                                <div>
                                    <label className={labelClass}>Floor</label>
                                    <input type="number" value={officeForm.floor} onChange={(e) => setOfficeForm({ ...officeForm, floor: parseInt(e.target.value) })} className={inputClass} required />
                                </div>
                                <div>
                                    <label className={labelClass}>Size (sqm)</label>
                                    <input type="number" value={officeForm.size_sqm} onChange={(e) => setOfficeForm({ ...officeForm, size_sqm: parseFloat(e.target.value) })} className={inputClass} required />
                                </div>
                                <div>
                                    <label className={labelClass}>Price Monthly</label>
                                    <input type="number" value={officeForm.price_monthly} onChange={(e) => setOfficeForm({ ...officeForm, price_monthly: parseFloat(e.target.value) })} className={inputClass} required />
                                </div>
                                <div>
                                    <label className={labelClass}>Status</label>
                                    <select value={officeForm.status} onChange={(e) => setOfficeForm({ ...officeForm, status: e.target.value as any })} className={inputClass}>
                                        <option value="Available">Available</option>
                                        <option value="Rented">Rented</option>
                                    </select>
                                </div>
                            </div>
                            <hr className="dark:border-gray-800" />
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className={labelClass}>Contact Name</label>
                                    <input type="text" value={officeForm.contact_name} onChange={(e) => setOfficeForm({ ...officeForm, contact_name: e.target.value })} className={inputClass} required />
                                </div>
                                <div>
                                    <label className={labelClass}>Contact Phone</label>
                                    <input type="text" value={officeForm.contact_phone} onChange={(e) => setOfficeForm({ ...officeForm, contact_phone: e.target.value })} className={inputClass} required />
                                </div>
                            </div>

                            {officeForm.status === 'Rented' && (
                                <div>
                                    <label className={labelClass}>Rented By</label>
                                    <input type="text" value={officeForm.rented_by || ''} onChange={(e) => setOfficeForm({ ...officeForm, rented_by: e.target.value })} className={inputClass} />
                                </div>
                            )}

                            <div className="flex justify-end space-x-3 pt-4">
                                <button type="button" onClick={() => setShowOfficeForm(false)} className="px-4 py-2 text-gray-500 hover:text-gray-700">Cancel</button>
                                <button type="submit" disabled={loading} className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700">
                                    {loading ? 'Saving...' : (editingOffice ? 'Update Office' : 'Add Office')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Building Modal */}
            {showBuildingForm && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-lg p-6">
                        <h2 className="text-xl font-bold mb-4 dark:text-white">{editingBuilding ? 'Edit Building' : 'Add New Building'}</h2>
                        <form onSubmit={handleBuildingSubmit} className="space-y-4">
                            <div>
                                <label className={labelClass}>Building Name</label>
                                <input type="text" value={buildingForm.name} onChange={(e) => setBuildingForm({ ...buildingForm, name: e.target.value })} className={inputClass} required />
                            </div>
                            <div>
                                <label className={labelClass}>Description</label>
                                <textarea value={buildingForm.description} onChange={(e) => setBuildingForm({ ...buildingForm, description: e.target.value })} className={inputClass} rows={3} />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className={labelClass}>Total Offices</label>
                                    <input type="number" value={buildingForm.total_offices} onChange={(e) => setBuildingForm({ ...buildingForm, total_offices: parseInt(e.target.value) })} className={inputClass} />
                                </div>
                                <div>
                                    <label className={labelClass}>Available</label>
                                    <input type="number" value={buildingForm.available_offices} onChange={(e) => setBuildingForm({ ...buildingForm, available_offices: parseInt(e.target.value) })} className={inputClass} />
                                </div>
                            </div>
                            <div>
                                <label className={labelClass}>Total Size (sqm)</label>
                                <input type="number" value={buildingForm.total_size_sqm} onChange={(e) => setBuildingForm({ ...buildingForm, total_size_sqm: parseFloat(e.target.value) })} className={inputClass} />
                            </div>
                            <div className="flex justify-end space-x-3 pt-4">
                                <button type="button" onClick={() => setShowBuildingForm(false)} className="px-4 py-2 text-gray-500 hover:text-gray-700">Cancel</button>
                                <button type="submit" disabled={loading} className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700">
                                    {loading ? 'Saving...' : (editingBuilding ? 'Update Building' : 'Add Building')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default OfficeAdmin;
