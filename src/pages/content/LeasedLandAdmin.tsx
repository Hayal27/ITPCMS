import React, { useState, useEffect, FormEvent } from 'react';
import { FaGlobeAfrica, FaPlus, FaEdit, FaTrash, FaSearch, FaMapMarkedAlt } from 'react-icons/fa';
import DOMPurify from 'dompurify';
import { request, BACKEND_URL as API_BASE_URL } from '../../services/apiService';

// The apiService request function already adds /api prefix
const LAND_ROOT = "/lands";

interface LandZone {
    id: number;
    name: string;
    description: string;
    total_size_sqm: number;
    available_size_sqm: number;
    icon_name: string;
}

interface LeasedLand {
    id: string;
    zone_id: number;
    zone_name?: string;
    land_type: string;
    location: string;
    size_sqm: number;
    available_size_sqm: number;
    status: 'Available' | 'Leased';
    leased_by: string | null;
    leased_from: string;
    contact_name: string;
    contact_phone: string;
}

const LeasedLandAdmin: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'lands' | 'zones'>('lands');
    const [lands, setLands] = useState<LeasedLand[]>([]);
    const [zones, setZones] = useState<LandZone[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');

    // Form states
    const [showLandForm, setShowLandForm] = useState(false);
    const [showZoneForm, setShowZoneForm] = useState(false);
    const [editingLand, setEditingLand] = useState<LeasedLand | null>(null);
    const [editingZone, setEditingZone] = useState<LandZone | null>(null);

    const [landForm, setLandForm] = useState<Partial<LeasedLand>>({
        zone_id: 0,
        land_type: '',
        location: '',
        size_sqm: 0,
        available_size_sqm: 0,
        status: 'Available',
        leased_by: '',
        leased_from: '',
        contact_name: '',
        contact_phone: ''
    });

    const [zoneForm, setZoneForm] = useState<Partial<LandZone>>({
        name: '',
        description: '',
        total_size_sqm: 0,
        available_size_sqm: 0,
        icon_name: 'FaGlobeAfrica'
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [lands, zones] = await Promise.all([
                request<LeasedLand[]>(LAND_ROOT),
                request<LandZone[]>(`${LAND_ROOT}/zones`)
            ]);
            setLands(lands);
            setZones(zones);
        } catch (err) {
            setError('Failed to fetch data');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleLandSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            // Sanitize inputs
            const cleanLandForm = {
                ...landForm,
                land_type: DOMPurify.sanitize(landForm.land_type || ''),
                location: DOMPurify.sanitize(landForm.location || ''),
                leased_by: DOMPurify.sanitize(landForm.leased_by || ''),
                contact_name: DOMPurify.sanitize(landForm.contact_name || ''),
                contact_phone: DOMPurify.sanitize(landForm.contact_phone || ''),
                zone_name: DOMPurify.sanitize(landForm.zone_name || '')
            };

            if (editingLand) {
                await request(`${LAND_ROOT}/${encodeURIComponent(editingLand.id)}`, { method: 'PUT', data: cleanLandForm });
                setSuccess('Land parcel updated successfully');
            } else {
                await request(LAND_ROOT, { method: 'POST', data: cleanLandForm });
                setSuccess('Land parcel created successfully');
            }
            setShowLandForm(false);
            setEditingLand(null);
            fetchData();
        } catch (err: any) {
            setError(err.message || 'Failed to save land parcel');
        } finally {
            setLoading(false);
        }
    };

    const handleZoneSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            // Sanitize inputs
            const cleanZoneForm = {
                ...zoneForm,
                name: DOMPurify.sanitize(zoneForm.name || ''),
                description: DOMPurify.sanitize(zoneForm.description || ''),
                icon_name: DOMPurify.sanitize(zoneForm.icon_name || '')
            };

            if (editingZone) {
                await request(`${LAND_ROOT}/zones/${editingZone.id}`, { method: 'PUT', data: cleanZoneForm });
                setSuccess('Zone updated successfully');
            } else {
                await request(`${LAND_ROOT}/zones`, { method: 'POST', data: cleanZoneForm });
                setSuccess('Zone created successfully');
            }
            setShowZoneForm(false);
            setEditingZone(null);
            fetchData();
        } catch (err: any) {
            setError(err.message || 'Failed to save zone');
        } finally {
            setLoading(false);
        }
    };

    const deleteLand = async (id: string) => {
        if (!window.confirm('Are you sure you want to delete this land parcel?')) return;
        try {
            await request(`${LAND_ROOT}/${encodeURIComponent(id)}`, { method: 'DELETE' });
            setSuccess('Land parcel deleted successfully');
            fetchData();
        } catch (err: any) {
            setError(err.message || 'Failed to delete land parcel');
        }
    };

    const deleteZone = async (id: number) => {
        if (!window.confirm('Are you sure you want to delete this zone? All land parcels in this zone will be deleted too.')) return;
        try {
            await request(`${LAND_ROOT}/zones/${id}`, { method: 'DELETE' });
            setSuccess('Zone deleted successfully');
            fetchData();
        } catch (err: any) {
            setError(err.message || 'Failed to delete zone');
        }
    };

    const filteredLands = lands.filter(l =>
        l.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        l.zone_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        l.location.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const inputClass = "w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-slate-800 dark:text-white focus:ring-2 focus:ring-green-500 outline-none";
    const labelClass = "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1";

    return (
        <div className="p-6 max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold dark:text-white">Land Management</h1>
                <div className="flex space-x-2">
                    <button
                        onClick={() => { setActiveTab('lands'); fetchData(); }}
                        className={`px-4 py-2 rounded-lg transition-all ${activeTab === 'lands' ? 'bg-green-600 text-white' : 'bg-gray-200 dark:bg-gray-700 dark:text-gray-300'}`}
                    >
                        Land Parcels
                    </button>
                    <button
                        onClick={() => { setActiveTab('zones'); fetchData(); }}
                        className={`px-4 py-2 rounded-lg transition-all ${activeTab === 'zones' ? 'bg-green-600 text-white' : 'bg-gray-200 dark:bg-gray-700 dark:text-gray-300'}`}
                    >
                        Zones
                    </button>
                </div>
            </div>

            {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{error}</div>}
            {success && <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">{success}</div>}

            <div className="bg-white dark:bg-slate-900 rounded-xl shadow-lg p-6 border border-gray-100 dark:border-gray-800">
                {activeTab === 'lands' ? (
                    <>
                        <div className="flex justify-between items-center mb-4">
                            <div className="relative w-64">
                                <FaSearch className="absolute left-3 top-3 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Search parcels..."
                                    className="pl-10 pr-4 py-2 w-full rounded-lg border dark:border-gray-700 dark:bg-slate-800 dark:text-white"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                            <button
                                onClick={() => {
                                    setEditingLand(null);
                                    setLandForm({
                                        zone_id: 0,
                                        land_type: '',
                                        location: '',
                                        size_sqm: 0,
                                        available_size_sqm: 0,
                                        status: 'Available',
                                        leased_by: '',
                                        leased_from: '',
                                        contact_name: '',
                                        contact_phone: ''
                                    });
                                    setShowLandForm(true);
                                }}
                                className="bg-green-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-green-700"
                            >
                                <FaPlus /> <span>Add Parcel</span>
                            </button>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="border-b dark:border-gray-800">
                                        <th className="py-3 px-4 dark:text-gray-300">ID</th>
                                        <th className="py-3 px-4 dark:text-gray-300">Zone</th>
                                        <th className="py-3 px-4 dark:text-gray-300">Type</th>
                                        <th className="py-3 px-4 dark:text-gray-300">Location</th>
                                        <th className="py-3 px-4 dark:text-gray-300">Size (m²)</th>
                                        <th className="py-3 px-4 dark:text-gray-300">Status</th>
                                        <th className="py-3 px-4 dark:text-gray-300">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredLands.map(l => (
                                        <tr key={l.id} className="border-b dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-slate-800/50">
                                            <td className="py-3 px-4 dark:text-gray-400 font-mono text-sm">{l.id}</td>
                                            <td className="py-3 px-4 dark:text-gray-400">{l.zone_name}</td>
                                            <td className="py-3 px-4 dark:text-gray-400 text-sm">{l.land_type}</td>
                                            <td className="py-3 px-4 dark:text-gray-400 text-sm truncate max-w-[150px]">{l.location}</td>
                                            <td className="py-3 px-4 dark:text-gray-400">{l.size_sqm}</td>
                                            <td className="py-3 px-4">
                                                <span className={`px-2 py-1 rounded-full text-xs ${l.status === 'Available' ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'}`}>
                                                    {l.status}
                                                </span>
                                            </td>
                                            <td className="py-3 px-4">
                                                <div className="flex space-x-2">
                                                    <button onClick={() => {
                                                        setEditingLand(l);
                                                        setLandForm(l);
                                                        setShowLandForm(true);
                                                    }} className="text-blue-600 hover:text-blue-800"><FaEdit /></button>
                                                    <button onClick={() => deleteLand(l.id)} className="text-red-600 hover:text-red-800"><FaTrash /></button>
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
                                onClick={() => { setEditingZone(null); setZoneForm({ icon_name: 'FaGlobeAfrica' }); setShowZoneForm(true); }}
                                className="bg-green-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-green-700"
                            >
                                <FaPlus /> <span>Add Zone</span>
                            </button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {zones.map(z => (
                                <div key={z.id} className="border dark:border-gray-800 p-4 rounded-xl dark:bg-slate-800/50">
                                    <div className="flex justify-between items-start mb-2">
                                        <FaGlobeAfrica className="text-2xl text-green-500" />
                                        <div className="flex space-x-2">
                                            <button onClick={() => { setEditingZone(z); setZoneForm(z); setShowZoneForm(true); }} className="text-blue-600 hover:text-blue-800"><FaEdit /></button>
                                            <button onClick={() => deleteZone(z.id)} className="text-red-600 hover:text-red-800"><FaTrash /></button>
                                        </div>
                                    </div>
                                    <h3 className="font-bold text-lg dark:text-white">{z.name}</h3>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 line-clamp-2">{z.description}</p>
                                    <div className="grid grid-cols-2 gap-2 text-xs">
                                        <div className="bg-gray-100 dark:bg-gray-700 p-2 rounded">
                                            <div className="text-gray-500">Total Area</div>
                                            <div className="font-bold dark:text-white">{z.total_size_sqm} m²</div>
                                        </div>
                                        <div className="bg-gray-100 dark:bg-gray-700 p-2 rounded">
                                            <div className="text-gray-500">Available</div>
                                            <div className="font-bold dark:text-white">{z.available_size_sqm} m²</div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                )}
            </div>

            {/* Land Modal */}
            {showLandForm && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 shadow-2xl">
                        <h2 className="text-xl font-bold mb-4 dark:text-white">{editingLand ? 'Edit Land Parcel' : 'Add New Land Parcel'}</h2>
                        <form onSubmit={handleLandSubmit} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {editingLand && (
                                    <div>
                                        <label className={labelClass}>Parcel ID (System Generated)</label>
                                        <input type="text" value={landForm.id} className={inputClass} disabled />
                                    </div>
                                )}
                                <div>
                                    <label className={labelClass}>Status</label>
                                    <select value={landForm.status} onChange={(e) => setLandForm({ ...landForm, status: e.target.value as any })} className={inputClass} required>
                                        <option value="Available">Available</option>
                                        <option value="Leased">Leased</option>
                                    </select>
                                </div>
                                <div>
                                    <label className={labelClass}>Zone</label>
                                    <select value={landForm.zone_id} onChange={(e) => setLandForm({ ...landForm, zone_id: parseInt(e.target.value) })} className={inputClass} required>
                                        <option value="">Select Zone</option>
                                        {zones.map(z => <option key={z.id} value={z.id}>{z.name}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className={labelClass}>Land Type</label>
                                    <input type="text" value={landForm.land_type || ''} onChange={(e) => setLandForm({ ...landForm, land_type: e.target.value })} className={inputClass} placeholder="e.g. Commercial" required />
                                </div>
                                <div>
                                    <label className={labelClass}>Location</label>
                                    <input type="text" value={landForm.location || ''} onChange={(e) => setLandForm({ ...landForm, location: e.target.value })} className={inputClass} required />
                                </div>
                                <div>
                                    <label className={labelClass}>Size (m²)</label>
                                    <input type="number" value={landForm.size_sqm || 0} onChange={(e) => setLandForm({ ...landForm, size_sqm: parseFloat(e.target.value) })} className={inputClass} required />
                                </div>
                                <div>
                                    <label className={labelClass}>Available Size (m²)</label>
                                    <input type="number" value={landForm.available_size_sqm || 0} onChange={(e) => setLandForm({ ...landForm, available_size_sqm: parseFloat(e.target.value) })} className={inputClass} />
                                </div>
                                <div>
                                    <label className={labelClass}>Available From</label>
                                    <input type="date" value={landForm.leased_from ? landForm.leased_from.split('T')[0] : ''} onChange={(e) => setLandForm({ ...landForm, leased_from: e.target.value })} className={inputClass} />
                                </div>
                            </div>
                            <hr className="dark:border-gray-800" />
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className={labelClass}>Contact Name</label>
                                    <input type="text" value={landForm.contact_name || ''} onChange={(e) => setLandForm({ ...landForm, contact_name: e.target.value })} className={inputClass} required />
                                </div>
                                <div>
                                    <label className={labelClass}>Contact Phone</label>
                                    <input type="text" value={landForm.contact_phone || ''} onChange={(e) => setLandForm({ ...landForm, contact_phone: e.target.value })} className={inputClass} required />
                                </div>
                            </div>

                            {landForm.status === 'Leased' && (
                                <div>
                                    <label className={labelClass}>Leased By</label>
                                    <input type="text" value={landForm.leased_by || ''} onChange={(e) => setLandForm({ ...landForm, leased_by: e.target.value })} className={inputClass} />
                                </div>
                            )}

                            <div className="flex justify-end space-x-3 pt-4 border-t dark:border-gray-800">
                                <button type="button" onClick={() => setShowLandForm(false)} className="px-4 py-2 text-gray-500 hover:text-gray-700">Cancel</button>
                                <button type="submit" disabled={loading} className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 shadow-lg transition-all">
                                    {loading ? 'Saving...' : (editingLand ? 'Update Parcel' : 'Add Parcel')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Zone Modal */}
            {showZoneForm && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-lg p-6 shadow-2xl">
                        <h2 className="text-xl font-bold mb-4 dark:text-white">{editingZone ? 'Edit Zone' : 'Add New Zone'}</h2>
                        <form onSubmit={handleZoneSubmit} className="space-y-4">
                            <div>
                                <label className={labelClass}>Zone Name</label>
                                <input type="text" value={zoneForm.name} onChange={(e) => setZoneForm({ ...zoneForm, name: e.target.value })} className={inputClass} required />
                            </div>
                            <div>
                                <label className={labelClass}>Description</label>
                                <textarea value={zoneForm.description} onChange={(e) => setZoneForm({ ...zoneForm, description: e.target.value })} className={inputClass} rows={3} />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className={labelClass}>Total Size (m²)</label>
                                    <input type="number" value={zoneForm.total_size_sqm} onChange={(e) => setZoneForm({ ...zoneForm, total_size_sqm: parseFloat(e.target.value) })} className={inputClass} />
                                </div>
                                <div>
                                    <label className={labelClass}>Available Size (m²)</label>
                                    <input type="number" value={zoneForm.available_size_sqm} onChange={(e) => setZoneForm({ ...zoneForm, available_size_sqm: parseFloat(e.target.value) })} className={inputClass} />
                                </div>
                            </div>
                            <div className="flex justify-end space-x-3 pt-4 border-t dark:border-gray-800">
                                <button type="button" onClick={() => setShowZoneForm(false)} className="px-4 py-2 text-gray-500 hover:text-gray-700">Cancel</button>
                                <button type="submit" disabled={loading} className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 shadow-lg">
                                    {loading ? 'Saving...' : (editingZone ? 'Update Zone' : 'Add Zone')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default LeasedLandAdmin;
