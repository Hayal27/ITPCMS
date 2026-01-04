
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
    FaBriefcase, FaUserGraduate, FaPlus, FaEdit, FaTrash, FaCheck, FaTimes,
    FaEye, FaEnvelope, FaFilePdf, FaFilter, FaSearch, FaHistory, FaClock, FaSatellite, FaTimesCircle, FaTools, FaLinkedinIn, FaLink, FaBuilding, FaGraduationCap,
    FaCalendarAlt, FaMapMarkerAlt, FaCheckDouble, FaInbox, FaCheckCircle, FaChartBar, FaChartPie
} from 'react-icons/fa';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement,
} from 'chart.js';
import { Line, Bar, Doughnut, Pie } from 'react-chartjs-2';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default marker icon
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement
);

const API_BASE = "http://localhost:5005/api/careers";

interface Job {
    id: number;
    title: string;
    department: string;
    location: string;
    type: string;
    status: 'draft' | 'published' | 'closed';
    description: string;
    responsibilities: string;
    qualifications: string;
    start_date: string;
    deadline: string;
    created_at: string;
}

interface Application {
    id: number;
    job_id: number;
    jobTitle: string;
    full_name: string;
    email: string;
    phone: string;
    gender: string;
    address: string;
    linkedin: string;
    portfolio: string;
    status: 'pending' | 'reviewing' | 'shortlisted' | 'written_exam' | 'interview_shortlisted' | 'interviewing' | 'offered' | 'rejected';
    tracking_code: string;
    applied_at: string;
    resume_path: string;
    cover_letter: string;
    education: string;
    work_experience: string;
    skills: string;
    admin_notes: string;
    appointment_date: string;
    appointment_time: string;
    appointment_location: string;
    appointment_map_link: string;
    appointment_lat: number;
    appointment_lng: number;
    appointment_details: string;
}

const CareerAdmin: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'jobs' | 'applications' | 'analytics'>('jobs');
    const [jobs, setJobs] = useState<Job[]>([]);
    const [applications, setApplications] = useState<Application[]>([]);
    const [loading, setLoading] = useState(false);

    // Filtering States
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [jobFilter, setJobFilter] = useState("all");
    const [skillFilter, setSkillFilter] = useState("");
    const [genderFilter, setGenderFilter] = useState("all");
    const [minGpa, setMinGpa] = useState("");
    const [minExpYears, setMinExpYears] = useState("");
    const [universityFilter, setUniversityFilter] = useState("");
    const [qualificationFilter, setQualificationFilter] = useState("");
    const [locationFilter, setLocationFilter] = useState("");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

    // Form States
    const [showJobForm, setShowJobForm] = useState(false);
    const [editingJob, setEditingJob] = useState<Job | null>(null);
    const [jobFormData, setJobFormData] = useState({
        title: '',
        department: '',
        location: '',
        type: 'Full-time',
        description: '',
        responsibilities: '',
        qualifications: '',
        status: 'draft',
        start_date: '',
        deadline: ''
    });

    // Detail States
    const [selectedApp, setSelectedApp] = useState<Application | null>(null);
    const [selectedAppIds, setSelectedAppIds] = useState<number[]>([]);

    // Appointment / Bulk Status Form States
    const [showStatusModal, setShowStatusModal] = useState(false);
    const [modalMode, setModalMode] = useState<'single' | 'bulk'>('single');
    const [targetStatus, setTargetStatus] = useState<string>('');
    const [appointmentForm, setAppointmentForm] = useState({
        date: '',
        time: '',
        location: '',
        lat: 51.505,
        lng: -0.09,
        mapLink: '',
        details: '',
        adminNotes: ''
    });

    useEffect(() => {
        if (activeTab === 'jobs') fetchJobs();
        else if (activeTab === 'applications') fetchApplications();
        else if (activeTab === 'analytics') {
            fetchJobs();
            fetchApplications();
        }
    }, [activeTab]);

    const fetchJobs = async () => {
        setLoading(true);
        try {
            const res = await axios.get(`${API_BASE}/admin/jobs`);
            setJobs(res.data);
        } catch (err) {
            console.error("Error fetching jobs", err);
        } finally {
            setLoading(false);
        }
    };

    const fetchApplications = async () => {
        setLoading(true);
        try {
            const res = await axios.get(`${API_BASE}/admin/applications`);
            setApplications(res.data);
        } catch (err) {
            console.error("Error fetching apps", err);
        } finally {
            setLoading(false);
        }
    };

    const handleJobSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const data = {
                ...jobFormData,
                responsibilities: jobFormData.responsibilities.split('\n'),
                qualifications: jobFormData.qualifications.split('\n')
            };

            if (editingJob) {
                await axios.put(`${API_BASE}/admin/jobs/${editingJob.id}`, data);
            } else {
                await axios.post(`${API_BASE}/admin/jobs`, data);
            }
            setShowJobForm(false);
            setEditingJob(null);
            fetchJobs();
        } catch (err) {
            console.error("Error saving job", err);
        }
    };

    const updateAppStatus = async (appId: number, status: string, formData: any) => {
        try {
            await axios.put(`${API_BASE}/admin/applications/${appId}/status`, {
                status,
                adminNotes: formData.adminNotes,
                appointmentDate: formData.date,
                appointmentTime: formData.time,
                appointmentLocation: formData.location,
                appointmentLat: formData.lat,
                appointmentLng: formData.lng,
                appointmentMapLink: formData.mapLink,
                appointmentDetails: formData.details
            });
            alert("Status updated and applicant notified.");
            setShowStatusModal(false);
            fetchApplications();
            setSelectedApp(null);
        } catch (err) {
            console.error("Error updating status", err);
            alert("Failed to update status.");
        }
    };

    const handleBulkUpdate = async () => {
        if (selectedAppIds.length === 0) return;
        try {
            setLoading(true);
            await axios.post(`${API_BASE}/admin/applications/bulk-status`, {
                ids: selectedAppIds,
                status: targetStatus,
                adminNotes: appointmentForm.adminNotes,
                appointmentDate: appointmentForm.date,
                appointmentTime: appointmentForm.time,
                appointmentLocation: appointmentForm.location,
                appointmentLat: appointmentForm.lat,
                appointmentLng: appointmentForm.lng,
                appointmentMapLink: appointmentForm.mapLink,
                appointmentDetails: appointmentForm.details
            });
            alert(`Successfully updated ${selectedAppIds.length} applications.`);
            setSelectedAppIds([]);
            setShowStatusModal(false);
            fetchApplications();
        } catch (err) {
            console.error("Bulk update error", err);
            alert("Bulk update failed.");
        } finally {
            setLoading(false);
        }
    };

    const toggleAppSelection = (id: number) => {
        setSelectedAppIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
    };

    const getFilteredApplications = () => {
        return applications.filter(app => {
            const matchesSearch = app.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                app.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                app.tracking_code.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesStatus = statusFilter === 'all' || app.status === statusFilter;
            const matchesJob = jobFilter === 'all' || app.jobTitle === jobFilter;
            const matchesSkill = !skillFilter || (app.skills && app.skills.toLowerCase().includes(skillFilter.toLowerCase()));
            const matchesGender = genderFilter === 'all' || app.gender === genderFilter;
            const matchesLocation = !locationFilter || (app.address && app.address.toLowerCase().includes(locationFilter.toLowerCase()));

            // Date Filtering
            const appDate = new Date(app.applied_at);
            const matchesStartDate = !startDate || appDate >= new Date(startDate);
            const matchesEndDate = !endDate || appDate <= new Date(endDate + 'T23:59:59');

            let eduData: any[] = [];
            try { eduData = JSON.parse(app.education || "[]"); } catch (e) { }
            const matchesUniv = !universityFilter || eduData.some(e => e.institutionName.toLowerCase().includes(universityFilter.toLowerCase()));
            const matchesQual = !qualificationFilter || eduData.some(e => e.degree.toLowerCase().includes(qualificationFilter.toLowerCase()));

            const maxGpa = eduData.length > 0 ? Math.max(...eduData.map(e => {
                const val = parseFloat(e.gpa || "0");
                return isNaN(val) ? 0 : val;
            })) : 0;
            const matchesGpa = !minGpa || maxGpa >= parseFloat(minGpa);

            let expData: any[] = [];
            try { expData = JSON.parse(app.work_experience || "[]"); } catch (e) { }
            const totalMonths = expData.reduce((acc, curr) => {
                const start = new Date(curr.startDate);
                const end = curr.isCurrent ? new Date() : new Date(curr.endDate);
                const diff = (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24 * 30.4375);
                return acc + (isNaN(diff) ? 0 : diff);
            }, 0);
            const expYears = totalMonths / 12;
            const matchesExp = !minExpYears || expYears >= parseFloat(minExpYears);

            return matchesSearch && matchesStatus && matchesJob && matchesSkill &&
                matchesGender && matchesLocation && matchesUniv && matchesQual &&
                matchesGpa && matchesExp && matchesStartDate && matchesEndDate;
        });
    };

    const selectAllFiltered = () => {
        const filtered = getFilteredApplications();
        const filteredIds = filtered.map(a => a.id);
        const allSelected = filteredIds.every(id => selectedAppIds.includes(id));

        if (allSelected) {
            setSelectedAppIds(prev => prev.filter(id => !filteredIds.includes(id)));
        } else {
            setSelectedAppIds(prev => Array.from(new Set([...prev, ...filteredIds])));
        }
    };

    const inputClass = "w-full bg-white dark:bg-slate-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all";

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-black dark:text-white tracking-tight flex items-center gap-3">
                        <div className="bg-blue-600 p-2.5 rounded-2xl shadow-xl shadow-blue-500/20">
                            <FaBriefcase className="text-white" />
                        </div>
                        Recruitment Hub
                    </h1>
                    <p className="text-gray-500 text-sm mt-1 font-medium">Manage job postings and screen incoming talent.</p>
                </div>
                <div className="flex bg-gray-100 dark:bg-slate-900 p-1.5 rounded-2xl border border-gray-200 dark:border-gray-800 self-start">
                    <button
                        onClick={() => setActiveTab('jobs')}
                        className={`px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'jobs' ? 'bg-white dark:bg-slate-800 text-blue-600 shadow-md' : 'text-gray-500'}`}
                    >
                        Jobs
                    </button>
                    <button
                        onClick={() => setActiveTab('applications')}
                        className={`px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'applications' ? 'bg-white dark:bg-slate-800 text-blue-600 shadow-md' : 'text-gray-500'}`}
                    >
                        Applications
                    </button>
                    <button
                        onClick={() => setActiveTab('analytics')}
                        className={`px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'analytics' ? 'bg-white dark:bg-slate-800 text-blue-600 shadow-md' : 'text-gray-500'}`}
                    >
                        Analytics
                    </button>
                </div>
            </div>


            {selectedAppIds.length > 0 && (
                <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-40 bg-slate-900 text-white p-2 pl-6 pr-2 rounded-2xl shadow-2xl flex items-center gap-6 animate-in slide-in-from-bottom-4">
                    <div className="text-xs font-bold flex items-center gap-2">
                        <span className="bg-blue-600 text-white px-2 py-0.5 rounded-lg">{selectedAppIds.length}</span>
                        <span className="uppercase tracking-widest text-[10px] text-gray-400">Selected</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => {
                                setModalMode('bulk');
                                setTargetStatus('shortlisted');
                                setAppointmentForm({ date: '', time: '', location: '', lat: 8.964682194440629, lng: 38.84064004666328, mapLink: '', details: '', adminNotes: '' });
                                setShowStatusModal(true);
                            }}
                            className="px-4 py-2 hover:bg-white/10 rounded-xl text-[10px] uppercase font-black transition-colors"
                        >
                            Shortlist
                        </button>
                        <button
                            onClick={() => {
                                setModalMode('bulk');
                                setTargetStatus('written_exam');
                                setAppointmentForm({ date: '', time: '', location: '', lat: 8.964682194440629, lng: 38.84064004666328, mapLink: '', details: '', adminNotes: '' });
                                setShowStatusModal(true);
                            }}
                            className="px-4 py-2 hover:bg-white/10 rounded-xl text-[10px] uppercase font-black transition-colors text-orange-400"
                        >
                            Exam
                        </button>
                        <button
                            onClick={() => {
                                setModalMode('bulk');
                                setTargetStatus('interview_shortlisted');
                                setAppointmentForm({ date: '', time: '', location: '', lat: 8.964682194440629, lng: 38.84064004666328, mapLink: '', details: '', adminNotes: '' });
                                setShowStatusModal(true);
                            }}
                            className="px-4 py-2 hover:bg-white/10 rounded-xl text-[10px] uppercase font-black transition-colors text-indigo-400"
                        >
                            Interview
                        </button>
                        <button
                            onClick={() => {
                                setModalMode('bulk');
                                setTargetStatus('rejected');
                                setAppointmentForm({ date: '', time: '', location: '', lat: 8.964682194440629, lng: 38.84064004666328, mapLink: '', details: '', adminNotes: '' });
                                setShowStatusModal(true);
                            }}
                            className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-xl text-[10px] uppercase font-black transition-colors"
                        >
                            Reject
                        </button>
                    </div>
                    <button onClick={() => setSelectedAppIds([])} className="p-2 hover:bg-white/10 rounded-full"><FaTimes /></button>
                </div>
            )}

            {showStatusModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex items-center justify-center p-6">
                    <div className="bg-white dark:bg-slate-900 rounded-[32px] w-full max-w-lg shadow-2xl p-8 border border-gray-100 dark:border-gray-800 animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
                        <h3 className="text-xl font-black uppercase dark:text-white mb-6">
                            {modalMode === 'bulk' ? `Update ${selectedAppIds.length} Applications` : 'Update Status'}
                        </h3>

                        <div className="space-y-4">
                            <div>
                                <label className="text-[10px] font-black uppercase text-gray-400 block mb-2">New Status</label>
                                <div className="px-4 py-3 bg-gray-100 dark:bg-slate-800 rounded-xl text-sm font-bold capitalize text-slate-700 dark:text-slate-300">
                                    {targetStatus.replace('_', ' ')}
                                </div>
                            </div>

                            {(targetStatus === 'written_exam' || targetStatus === 'interview_shortlisted' || targetStatus === 'interviewing') && (
                                <div className="space-y-4 p-4 bg-blue-50 dark:bg-blue-900/10 rounded-2xl border border-blue-100 dark:border-blue-500/20">
                                    <h4 className="text-[10px] font-black uppercase text-blue-600 flex items-center gap-2">
                                        <FaCalendarAlt /> Appointment Details
                                    </h4>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-[10px] font-bold uppercase text-gray-400 block mb-1">Date</label>
                                            <input
                                                type="date"
                                                value={appointmentForm.date}
                                                onChange={e => setAppointmentForm({ ...appointmentForm, date: e.target.value })}
                                                className="w-full bg-white dark:bg-slate-900 border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2 text-xs font-bold outline-none focus:ring-2 focus:ring-blue-500"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-[10px] font-bold uppercase text-gray-400 block mb-1">Time</label>
                                            <input
                                                type="time"
                                                value={appointmentForm.time}
                                                onChange={e => setAppointmentForm({ ...appointmentForm, time: e.target.value })}
                                                className="w-full bg-white dark:bg-slate-900 border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2 text-xs font-bold outline-none focus:ring-2 focus:ring-blue-500"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-bold uppercase text-gray-400 block mb-1">Location</label>
                                        <input
                                            type="text"
                                            placeholder="e.g. Building A, Room 304"
                                            value={appointmentForm.location}
                                            onChange={e => setAppointmentForm({ ...appointmentForm, location: e.target.value })}
                                            className="w-full bg-white dark:bg-slate-900 border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2 text-xs font-bold outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>
                                    <div className="col-span-2">
                                        <div className="flex justify-between items-end mb-1">
                                            <label className="text-[10px] font-bold uppercase text-gray-400 block">Select Location on Map</label>
                                            <button
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    if (navigator.geolocation) {
                                                        navigator.geolocation.getCurrentPosition(position => {
                                                            setAppointmentForm(prev => ({
                                                                ...prev,
                                                                lat: position.coords.latitude,
                                                                lng: position.coords.longitude
                                                            }));
                                                        });
                                                    }
                                                }}
                                                className="text-[9px] font-black uppercase text-blue-500 hover:underline flex items-center gap-1"
                                            >
                                                <FaSatellite /> Use My Location
                                            </button>
                                        </div>

                                        <div className="flex gap-2 mb-2">
                                            <input
                                                type="text"
                                                id="mapSearchInput"
                                                placeholder="Search place..."
                                                className="flex-1 bg-white dark:bg-slate-900 border border-gray-200 dark:border-gray-700 rounded-lg px-2 py-1 text-xs outline-none"
                                                onKeyDown={async (e) => {
                                                    if (e.key === 'Enter') {
                                                        e.preventDefault();
                                                        const query = e.currentTarget.value;
                                                        if (!query) return;
                                                        try {
                                                            const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}`);
                                                            const data = await response.json();
                                                            if (data && data.length > 0) {
                                                                setAppointmentForm(prev => ({
                                                                    ...prev,
                                                                    lat: parseFloat(data[0].lat),
                                                                    lng: parseFloat(data[0].lon)
                                                                }));
                                                            }
                                                        } catch (err) {
                                                            console.error("Search failed", err);
                                                        }
                                                    }
                                                }}
                                            />
                                            <button
                                                onClick={async (e) => {
                                                    e.preventDefault();
                                                    const input = document.getElementById('mapSearchInput') as HTMLInputElement;
                                                    const query = input?.value;
                                                    if (!query) return;
                                                    try {
                                                        const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}`);
                                                        const data = await response.json();
                                                        if (data && data.length > 0) {
                                                            setAppointmentForm(prev => ({
                                                                ...prev,
                                                                lat: parseFloat(data[0].lat),
                                                                lng: parseFloat(data[0].lon)
                                                            }));
                                                        }
                                                    } catch (err) {
                                                        console.error("Search failed", err);
                                                    }
                                                }}
                                                className="bg-blue-600 text-white px-3 py-1 rounded-lg text-xs font-bold"
                                            >
                                                Search
                                            </button>
                                        </div>

                                        <div className="h-48 w-full rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 z-0 relative">
                                            <MapContainer
                                                center={[appointmentForm.lat, appointmentForm.lng]}
                                                zoom={13}
                                                style={{ height: '100%', width: '100%' }}
                                                ref={null}
                                            >
                                                <TileLayer
                                                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                                                />
                                                <Marker position={[appointmentForm.lat, appointmentForm.lng]} />
                                                <MapEventsHandler
                                                    onLocationSelect={(lat, lng) => setAppointmentForm(prev => ({ ...prev, lat, lng }))}
                                                />
                                                <RecenterMap lat={appointmentForm.lat} lng={appointmentForm.lng} />
                                            </MapContainer>
                                        </div>
                                        <div className="flex gap-2 mt-2">
                                            <div className="flex-1">
                                                <label className="text-[9px] font-bold text-gray-400">Lat</label>
                                                <input
                                                    type="number"
                                                    step="0.000001"
                                                    value={appointmentForm.lat}
                                                    onChange={(e) => setAppointmentForm(prev => ({ ...prev, lat: parseFloat(e.target.value) }))}
                                                    className="w-full bg-slate-50 border border-gray-200 rounded px-2 py-1 text-xs font-mono"
                                                />
                                            </div>
                                            <div className="flex-1">
                                                <label className="text-[9px] font-bold text-gray-400">Lng</label>
                                                <input
                                                    type="number"
                                                    step="0.000001"
                                                    value={appointmentForm.lng}
                                                    onChange={(e) => setAppointmentForm(prev => ({ ...prev, lng: parseFloat(e.target.value) }))}
                                                    className="w-full bg-slate-50 border border-gray-200 rounded px-2 py-1 text-xs font-mono"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="text-[10px] font-bold uppercase text-gray-400 block mb-1">Instructions</label>
                                        <textarea
                                            rows={2}
                                            placeholder="Bring your ID and laptop..."
                                            value={appointmentForm.details}
                                            onChange={e => setAppointmentForm({ ...appointmentForm, details: e.target.value })}
                                            className="w-full bg-white dark:bg-slate-900 border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2 text-xs font-bold outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>
                                </div>
                            )}

                            <div>
                                <label className="text-[10px] font-black uppercase text-gray-400 block mb-2">Internal Admin Notes</label>
                                <textarea
                                    rows={3}
                                    value={appointmentForm.adminNotes}
                                    onChange={e => setAppointmentForm({ ...appointmentForm, adminNotes: e.target.value })}
                                    className="w-full bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Add internal notes about this status change..."
                                />
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button
                                    onClick={() => setShowStatusModal(false)}
                                    className="flex-1 py-3 bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-gray-300 font-bold uppercase text-xs rounded-xl hover:bg-gray-200 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={() => modalMode === 'bulk' ? handleBulkUpdate() : (selectedApp && updateAppStatus(selectedApp.id, targetStatus, appointmentForm))}
                                    className="flex-1 py-3 bg-blue-600 text-white font-bold uppercase text-xs rounded-xl hover:bg-blue-700 shadow-lg shadow-blue-500/20 transition-all"
                                >
                                    Confirm Update
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )
            }

            {
                activeTab === 'jobs' && (
                    <div className="space-y-6">
                        <div className="flex justify-between items-center">
                            <h2 className="text-xl font-bold dark:text-white">Active Postings ({jobs.length})</h2>
                            <button
                                onClick={() => {
                                    setEditingJob(null);
                                    setJobFormData({
                                        title: '', department: '', location: '', type: 'Full-time',
                                        description: '', responsibilities: '', qualifications: '', status: 'draft',
                                        start_date: '', deadline: ''
                                    });
                                    setShowJobForm(true);
                                }}
                                className="bg-slate-900 text-white px-6 py-3 rounded-2xl flex items-center gap-2 hover:bg-black transition shadow-xl font-black text-xs uppercase tracking-widest"
                            >
                                <FaPlus /> Post New Job
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {jobs.map(job => (
                                <div key={job.id} className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-xl transition-all group">
                                    <div className="flex justify-between items-start mb-4">
                                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter ${job.status === 'published' ? 'bg-green-100 text-green-600' :
                                            job.status === 'closed' ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-500'
                                            }`}>
                                            {job.status}
                                        </span>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => {
                                                    setEditingJob(job);
                                                    setJobFormData({
                                                        ...job,
                                                        responsibilities: Array.isArray(JSON.parse(job.responsibilities)) ? JSON.parse(job.responsibilities).join('\n') : '',
                                                        qualifications: Array.isArray(JSON.parse(job.qualifications)) ? JSON.parse(job.qualifications).join('\n') : '',
                                                        start_date: job.start_date ? job.start_date.split('T')[0] : '',
                                                        deadline: job.deadline ? job.deadline.split('T')[0] : ''
                                                    });
                                                    setShowJobForm(true);
                                                }}
                                                className="p-2 text-gray-400 hover:text-blue-600 transition"
                                            ><FaEdit /></button>
                                            <button className="p-2 text-gray-400 hover:text-red-500 transition"><FaTrash /></button>
                                        </div>
                                    </div>
                                    <h3 className="font-black text-lg dark:text-white group-hover:text-blue-600 transition-colors uppercase leading-tight mb-2">{job.title}</h3>
                                    <p className="text-gray-500 text-xs font-bold mb-4">{job.department} • {job.location}</p>
                                    <div className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase">
                                        <FaClock /> {new Date(job.created_at).toLocaleDateString()}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )
            }

            {
                activeTab === 'applications' && (
                    <div className="space-y-6">
                        <div className="bg-white dark:bg-slate-900 rounded-[32px] border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
                            <div className="p-8 border-b dark:border-gray-800 bg-gray-50/50 dark:bg-slate-800/50">
                                <div className="flex flex-col gap-6">
                                    <div className="flex items-center justify-between">
                                        <h2 className="font-black text-sm uppercase tracking-widest flex items-center gap-2 shrink-0">
                                            <FaUserGraduate className="text-blue-600" /> Advanced Talent Search
                                        </h2>
                                        <button
                                            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                                            className="text-[10px] font-black uppercase text-blue-600 hover:text-blue-700 transition flex items-center gap-2"
                                        >
                                            <FaFilter /> {showAdvancedFilters ? 'Hide Advanced' : 'Show Advanced Filters'}
                                        </button>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
                                        <div className="relative">
                                            <FaSearch size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                            <input
                                                type="text"
                                                placeholder="Name, Email, or Code..."
                                                value={searchQuery}
                                                onChange={(e) => setSearchQuery(e.target.value)}
                                                className="w-full pl-9 pr-4 py-2 bg-white dark:bg-slate-800 border border-gray-200 dark:border-gray-700 rounded-xl text-[10px] focus:ring-2 focus:ring-blue-500 outline-none"
                                            />
                                        </div>
                                        <select
                                            value={jobFilter}
                                            onChange={(e) => setJobFilter(e.target.value)}
                                            className="w-full px-4 py-2 bg-white dark:bg-slate-800 border border-gray-200 dark:border-gray-700 rounded-xl text-[10px] font-bold uppercase outline-none"
                                        >
                                            <option value="all">Role: All Postings</option>
                                            {[...new Set(applications.map(a => a.jobTitle))].map(role => (
                                                <option key={role} value={role}>{role}</option>
                                            ))}
                                        </select>
                                        <select
                                            value={statusFilter}
                                            onChange={(e) => setStatusFilter(e.target.value)}
                                            className="w-full px-4 py-2 bg-white dark:bg-slate-800 border border-gray-200 dark:border-gray-700 rounded-xl text-[10px] font-bold uppercase outline-none"
                                        >
                                            <option value="all">Status: All</option>
                                            <option value="pending">Pending</option>
                                            <option value="reviewing">Reviewing</option>
                                            <option value="shortlisted">Shortlisted</option>
                                            <option value="interviewing">Interviewing</option>
                                            <option value="rejected">Rejected</option>
                                        </select>
                                        <div className="relative">
                                            <FaTools size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                            <input
                                                type="text"
                                                placeholder="Skill Search (React, etc)..."
                                                value={skillFilter}
                                                onChange={(e) => setSkillFilter(e.target.value)}
                                                className="w-full pl-9 pr-4 py-2 bg-white dark:bg-slate-800 border border-gray-200 dark:border-gray-700 rounded-xl text-[10px] focus:ring-2 focus:ring-blue-500 outline-none"
                                            />
                                        </div>
                                    </div>

                                    {showAdvancedFilters && (
                                        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 animate-in slide-in-from-top-4 duration-300">
                                            <select
                                                value={genderFilter}
                                                onChange={(e) => setGenderFilter(e.target.value)}
                                                className="w-full px-4 py-2 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-[10px] font-bold uppercase outline-none"
                                            >
                                                <option value="all">Gender: Any</option>
                                                <option value="Male">Male</option>
                                                <option value="Female">Female</option>
                                            </select>

                                            <div className="relative">
                                                <label className="absolute -top-3 left-2 text-[8px] font-bold text-gray-400 bg-white dark:bg-slate-900 px-1">Applied After</label>
                                                <input
                                                    type="date"
                                                    value={startDate}
                                                    onChange={(e) => setStartDate(e.target.value)}
                                                    className="w-full px-4 py-2 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-[10px] font-bold outline-none"
                                                />
                                            </div>

                                            <div className="relative">
                                                <label className="absolute -top-3 left-2 text-[8px] font-bold text-gray-400 bg-white dark:bg-slate-900 px-1">Applied Before</label>
                                                <input
                                                    type="date"
                                                    value={endDate}
                                                    onChange={(e) => setEndDate(e.target.value)}
                                                    className="w-full px-4 py-2 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-[10px] font-bold outline-none"
                                                />
                                            </div>

                                            <input
                                                type="number" step="0.1" placeholder="Min GPA (e.g. 3.5)"
                                                value={minGpa} onChange={(e) => setMinGpa(e.target.value)}
                                                className="w-full px-4 py-2 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-[10px] font-bold outline-none"
                                            />

                                            <input
                                                type="number" placeholder="Min Exp Years"
                                                value={minExpYears} onChange={(e) => setMinExpYears(e.target.value)}
                                                className="w-full px-4 py-2 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-[10px] font-bold outline-none"
                                            />

                                            <input
                                                type="text" placeholder="University"
                                                value={universityFilter} onChange={(e) => setUniversityFilter(e.target.value)}
                                                className="w-full px-4 py-2 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-[10px] font-bold outline-none"
                                            />

                                            <input
                                                type="text" placeholder="Qualification"
                                                value={qualificationFilter} onChange={(e) => setQualificationFilter(e.target.value)}
                                                className="w-full px-4 py-2 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-[10px] font-bold outline-none"
                                            />

                                            <input
                                                type="text" placeholder="Location Search"
                                                value={locationFilter} onChange={(e) => setLocationFilter(e.target.value)}
                                                className="w-full px-4 py-2 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-[10px] font-bold outline-none"
                                            />
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead className="text-[10px] font-black uppercase text-gray-400 bg-gray-50 dark:bg-slate-800/50">
                                        <tr>
                                            <th className="px-6 py-4 w-10">
                                                <input
                                                    type="checkbox"
                                                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                                    onChange={selectAllFiltered}
                                                    checked={selectedAppIds.length > 0 && selectedAppIds.length === getFilteredApplications().length}
                                                />
                                            </th>
                                            <th className="px-6 py-4">Applicant Profile</th>
                                            <th className="px-6 py-4">Target Role</th>
                                            <th className="px-6 py-4">Education & Exp</th>
                                            <th className="px-6 py-4">Decision Phase</th>
                                            <th className="px-6 py-4">Timestamp</th>
                                            <th className="px-6 py-4 text-right">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y dark:divide-gray-800">
                                        {getFilteredApplications()
                                            .map(app => (
                                                <tr key={app.id} className={`hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors group ${selectedAppIds.includes(app.id) ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''}`}>
                                                    <td className="px-6 py-4">
                                                        <input
                                                            type="checkbox"
                                                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                                            checked={selectedAppIds.includes(app.id)}
                                                            onChange={() => toggleAppSelection(app.id)}
                                                        />
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-black text-[10px] text-slate-400 group-hover:bg-blue-600 group-hover:text-white transition-all uppercase">
                                                                {app.gender === 'Female' ? 'F' : 'M'}
                                                            </div>
                                                            <div>
                                                                <div className="font-bold dark:text-white uppercase text-[11px] leading-tight">{app.full_name}</div>
                                                                <div className="text-[9px] text-gray-500 font-medium">{app.email}</div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="text-[10px] font-black text-slate-900 dark:text-white uppercase tracking-tight">{app.jobTitle}</div>
                                                        <div className="text-[9px] text-blue-500 font-bold uppercase mt-0.5 tracking-tighter">{app.tracking_code}</div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-2">
                                                            {(() => {
                                                                try {
                                                                    const edu = JSON.parse(app.education || "[]");
                                                                    const maxGpa = edu.length > 0 ? Math.max(...edu.map((e: any) => parseFloat(e.gpa || "0"))) : 0;
                                                                    if (maxGpa > 0) return <span className="bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 px-1.5 py-0.5 rounded text-[8px] font-black">GPA: {maxGpa.toFixed(1)}</span>;
                                                                } catch (e) { }
                                                                return null;
                                                            })()}
                                                            {(() => {
                                                                try {
                                                                    const exp = JSON.parse(app.work_experience || "[]");
                                                                    const totalM = exp.reduce((acc: number, curr: any) => {
                                                                        const start = new Date(curr.startDate);
                                                                        const end = curr.isCurrent ? new Date() : new Date(curr.endDate);
                                                                        return acc + ((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24 * 30.44));
                                                                    }, 0);
                                                                    const y = Math.floor(totalM / 12);
                                                                    if (y > 0) return <span className="bg-blue-50 dark:bg-blue-900/30 text-blue-600 px-1.5 py-0.5 rounded text-[8px] font-black">{y}Y EXP</span>;
                                                                } catch (e) { }
                                                                return null;
                                                            })()}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase ${app.status === 'pending' ? 'bg-gray-100 text-gray-500' :
                                                            app.status === 'rejected' ? 'bg-red-100 text-red-600' :
                                                                app.status === 'offered' ? 'bg-green-600 text-white' :
                                                                    app.status === 'written_exam' ? 'bg-orange-100 text-orange-600' :
                                                                        app.status === 'interview_shortlisted' ? 'bg-indigo-100 text-indigo-600' :
                                                                            'bg-blue-100 text-blue-600'
                                                            }`}>
                                                            {app.status.replace('_', ' ')}
                                                        </span>
                                                        {app.appointment_date && (
                                                            <div className="mt-1 flex items-center gap-1 text-[8px] font-bold text-gray-400 uppercase">
                                                                <FaCalendarAlt /> {new Date(app.appointment_date).toLocaleDateString()}
                                                            </div>
                                                        )}
                                                    </td>
                                                    <td className="px-6 py-4 text-[10px] text-gray-400 font-bold uppercase">{new Date(app.applied_at).toLocaleDateString()}</td>
                                                    <td className="px-6 py-4 text-right">
                                                        <button
                                                            onClick={() => setSelectedApp(app)}
                                                            className="bg-slate-100 hover:bg-slate-900 hover:text-white dark:bg-slate-800 dark:hover:bg-blue-600 p-2.5 rounded-xl transition-all shadow-sm"
                                                        >
                                                            <FaEye size={12} />
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )
            }

            {
                activeTab === 'analytics' && (
                    <div className="space-y-8">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                            <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-600">
                                        <FaInbox size={20} />
                                    </div>
                                    <div>
                                        <h4 className="text-2xl font-black dark:text-white">{applications.length}</h4>
                                        <p className="text-[10px] uppercase font-bold text-gray-400">Total Applications</p>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-2xl bg-orange-50 dark:bg-orange-900/20 flex items-center justify-center text-orange-600">
                                        <FaHistory size={20} />
                                    </div>
                                    <div>
                                        <h4 className="text-2xl font-black dark:text-white">{applications.filter(a => a.status === 'reviewing').length}</h4>
                                        <p className="text-[10px] uppercase font-bold text-gray-400">Reviewing</p>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center text-indigo-600">
                                        <FaCheckDouble size={20} />
                                    </div>
                                    <div>
                                        <h4 className="text-2xl font-black dark:text-white">{applications.filter(a => ['shortlisted', 'written_exam', 'interview_shortlisted', 'interviewing'].includes(a.status)).length}</h4>
                                        <p className="text-[10px] uppercase font-bold text-gray-400">Shortlisted / Exam</p>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-2xl bg-green-50 dark:bg-green-900/20 flex items-center justify-center text-green-600">
                                        <FaCheckCircle size={20} />
                                    </div>
                                    <div>
                                        <h4 className="text-2xl font-black dark:text-white">{applications.filter(a => a.status === 'offered').length}</h4>
                                        <p className="text-[10px] uppercase font-bold text-gray-400">Offered Position</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            {/* Applications by Job Role (Bar Chart) */}
                            <div className="bg-white dark:bg-slate-900 p-8 rounded-[32px] border border-gray-100 dark:border-gray-800 shadow-sm h-[400px]">
                                <div className="mb-6 flex justify-between items-center">
                                    <h3 className="font-black text-sm uppercase tracking-widest flex items-center gap-2">
                                        <FaChartBar className="text-blue-600" /> Applications by Role
                                    </h3>
                                </div>
                                <div className="h-full pb-8">
                                    <Bar
                                        data={{
                                            labels: [...new Set(applications.map(a => a.jobTitle))],
                                            datasets: [{
                                                label: 'Applicants',
                                                data: [...new Set(applications.map(a => a.jobTitle))].map(title => applications.filter(a => a.jobTitle === title).length),
                                                backgroundColor: '#3b82f6',
                                                borderRadius: 8,
                                            }]
                                        }}
                                        options={{
                                            responsive: true,
                                            maintainAspectRatio: false,
                                            plugins: { legend: { display: false } },
                                            scales: {
                                                y: { grid: { display: false }, border: { display: false } },
                                                x: { grid: { display: false }, border: { display: false } }
                                            }
                                        }}
                                    />
                                </div>
                            </div>

                            {/* Application Status (Doughnut) */}
                            <div className="bg-white dark:bg-slate-900 p-8 rounded-[32px] border border-gray-100 dark:border-gray-800 shadow-sm h-[400px]">
                                <div className="mb-6 flex justify-between items-center">
                                    <h3 className="font-black text-sm uppercase tracking-widest flex items-center gap-2">
                                        <FaChartPie className="text-pink-600" /> Pipeline Status
                                    </h3>
                                </div>
                                <div className="h-full pb-8 relative flex items-center justify-center">
                                    <Doughnut
                                        data={{
                                            labels: ['Pending', 'Reviewing', 'Exam/Interview', 'Rejected', 'Offered'],
                                            datasets: [{
                                                data: [
                                                    applications.filter(a => a.status === 'pending').length,
                                                    applications.filter(a => a.status === 'reviewing').length,
                                                    applications.filter(a => ['shortlisted', 'written_exam', 'interview_shortlisted', 'interviewing'].includes(a.status)).length,
                                                    applications.filter(a => a.status === 'rejected').length,
                                                    applications.filter(a => a.status === 'offered').length
                                                ],
                                                backgroundColor: ['#94a3b8', '#fb923c', '#4f46e5', '#ef4444', '#16a34a'],
                                                borderWidth: 0
                                            }]
                                        }}
                                        options={{
                                            responsive: true,
                                            maintainAspectRatio: false,
                                            cutout: '70%',
                                            plugins: {
                                                legend: { position: 'right', labels: { usePointStyle: true, boxWidth: 8, font: { size: 10, weight: 'bold' } } }
                                            }
                                        }}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="bg-white dark:bg-slate-900 p-8 rounded-[32px] border border-gray-100 dark:border-gray-800 shadow-sm h-[400px]">
                            <div className="mb-6 flex justify-between items-center">
                                <h3 className="font-black text-sm uppercase tracking-widest flex items-center gap-2">
                                    <FaHistory className="text-purple-600" /> Application Trends (Last 7 Days)
                                </h3>
                            </div>
                            <div className="h-full pb-8">
                                <Line
                                    data={{
                                        labels: Array.from({ length: 7 }, (_, i) => {
                                            const d = new Date();
                                            d.setDate(d.getDate() - i);
                                            return d.toLocaleDateString();
                                        }).reverse(),
                                        datasets: [{
                                            label: 'New Applications',
                                            data: Array.from({ length: 7 }, (_, i) => {
                                                const d = new Date();
                                                d.setDate(d.getDate() - i);
                                                const dateStr = d.toISOString().split('T')[0];
                                                return applications.filter(a => a.applied_at.startsWith(dateStr)).length;
                                            }).reverse(),
                                            borderColor: '#8b5cf6',
                                            backgroundColor: '#8b5cf6',
                                            tension: 0.4,
                                            fill: false
                                        }]
                                    }}
                                    options={{
                                        responsive: true,
                                        maintainAspectRatio: false,
                                        plugins: { legend: { display: false } },
                                        scales: {
                                            y: { grid: { color: '#f1f5f9' }, border: { display: false }, ticks: { precision: 0 } },
                                            x: { grid: { display: false }, border: { display: false } }
                                        }
                                    }}
                                />
                            </div>
                        </div>
                    </div>
                )
            }

            {
                showJobForm && (
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-6">
                        <form onSubmit={handleJobSubmit} className="bg-white dark:bg-slate-900 rounded-[32px] w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
                            <div className="p-8 border-b dark:border-gray-800 flex justify-between items-center bg-gray-50/50 dark:bg-slate-800/20">
                                <h2 className="text-2xl font-black dark:text-white">{editingJob ? 'EDIT POSTING' : 'NEW POSTING'}</h2>
                                <button onClick={() => setShowJobForm(false)} className="p-3 hover:bg-gray-100 rounded-2xl transition"><FaTimes /></button>
                            </div>
                            <div className="p-10 space-y-6 overflow-y-auto">
                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase text-gray-400">Position Title</label>
                                        <input value={jobFormData.title} onChange={e => setJobFormData({ ...jobFormData, title: e.target.value })} className={inputClass} required />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase text-gray-400">Department</label>
                                        <input value={jobFormData.department} onChange={e => setJobFormData({ ...jobFormData, department: e.target.value })} className={inputClass} />
                                    </div>
                                </div>
                                <div className="grid grid-cols-3 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase text-gray-400">Location</label>
                                        <input value={jobFormData.location} onChange={e => setJobFormData({ ...jobFormData, location: e.target.value })} className={inputClass} />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase text-gray-400">Type</label>
                                        <select value={jobFormData.type} onChange={e => setJobFormData({ ...jobFormData, type: e.target.value })} className={inputClass}>
                                            <option>Full-time</option>
                                            <option>Part-time</option>
                                            <option>Contract</option>
                                            <option>Internship</option>
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase text-gray-400">Status</label>
                                        <select value={jobFormData.status} onChange={e => setJobFormData({ ...jobFormData, status: e.target.value as any })} className={inputClass}>
                                            <option value="draft">Draft</option>
                                            <option value="published">Published (Live)</option>
                                            <option value="closed">Closed</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase text-gray-400 text-blue-500">Application Start Date</label>
                                        <input type="date" value={jobFormData.start_date} onChange={e => setJobFormData({ ...jobFormData, start_date: e.target.value })} className={inputClass} />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase text-gray-400 text-red-500">Application Deadline</label>
                                        <input type="date" value={jobFormData.deadline} onChange={e => setJobFormData({ ...jobFormData, deadline: e.target.value })} className={inputClass} />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase text-gray-400">Description</label>
                                    <textarea rows={3} value={jobFormData.description} onChange={e => setJobFormData({ ...jobFormData, description: e.target.value })} className={inputClass} />
                                </div>
                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase text-gray-400">Responsibilities (One per line)</label>
                                        <textarea rows={5} value={jobFormData.responsibilities} onChange={e => setJobFormData({ ...jobFormData, responsibilities: e.target.value })} className={inputClass} />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase text-gray-400">Qualifications (One per line)</label>
                                        <textarea rows={5} value={jobFormData.qualifications} onChange={e => setJobFormData({ ...jobFormData, qualifications: e.target.value })} className={inputClass} />
                                    </div>
                                </div>
                            </div>
                            <div className="p-8 border-t dark:border-gray-800 flex justify-end gap-4 bg-gray-50/50 dark:bg-slate-800/20">
                                <button type="submit" className="bg-blue-600 text-white px-10 py-4 rounded-2xl font-black hover:bg-blue-700 shadow-xl transition-all uppercase tracking-widest text-xs">Save Posting</button>
                            </div>
                        </form>
                    </div>
                )
            }

            {
                selectedApp && (
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-6">
                        <div className="bg-white dark:bg-slate-900 rounded-[32px] w-full max-w-5xl max-h-[95vh] overflow-hidden flex flex-col shadow-2xl border border-white/20 animate-in zoom-in-95 duration-300">
                            {/* Modal Header */}
                            <div className="p-8 border-b dark:border-gray-800 flex justify-between items-center bg-gray-50/50 dark:bg-slate-800/80 sticky top-0 z-20">
                                <div className="flex items-center gap-6">
                                    <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-blue-500/20 font-black text-2xl uppercase">
                                        {selectedApp.full_name.charAt(0)}
                                    </div>
                                    <div>
                                        <h2 className="text-2xl font-black dark:text-white uppercase tracking-tight">{selectedApp.full_name}</h2>
                                        <p className="text-[10px] font-black text-blue-500 uppercase tracking-widest flex items-center gap-2">
                                            Candidate ID: {selectedApp.tracking_code} • Applied for {selectedApp.jobTitle}
                                        </p>
                                    </div>
                                </div>
                                <button onClick={() => setSelectedApp(null)} className="p-4 bg-white dark:bg-slate-700 text-gray-400 hover:text-red-500 rounded-2xl transition-all shadow-sm"><FaTimes /></button>
                            </div>

                            {/* Modal Body */}
                            <div className="flex-1 overflow-y-auto p-10 space-y-12 custom-scrollbar">
                                <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                                    {/* Left Column: Identity & Contact */}
                                    <div className="space-y-8">
                                        <section>
                                            <h5 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4 flex items-center gap-2">
                                                <FaUserGraduate className="text-blue-500" /> Identity & Contact
                                            </h5>
                                            <div className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-3xl space-y-4 border border-slate-100 dark:border-slate-800">
                                                <div className="space-y-1">
                                                    <p className="text-[9px] font-black uppercase text-slate-400">Email Address</p>
                                                    <p className="text-xs font-bold dark:text-white break-all">{selectedApp.email}</p>
                                                </div>
                                                <div className="space-y-1">
                                                    <p className="text-[9px] font-black uppercase text-slate-400">Gender Identity</p>
                                                    <p className="text-xs font-bold dark:text-white">{selectedApp.gender || "Not specified"}</p>
                                                </div>
                                                <div className="space-y-1">
                                                    <p className="text-[9px] font-black uppercase text-slate-400">Phone Connection</p>
                                                    <p className="text-xs font-bold dark:text-white">{selectedApp.phone}</p>
                                                </div>
                                                <div className="space-y-1">
                                                    <p className="text-[9px] font-black uppercase text-slate-400">Residential Address</p>
                                                    <p className="text-xs font-bold dark:text-white">{selectedApp.address || "Not provided"}</p>
                                                </div>
                                                <div className="flex gap-3 pt-4 border-t dark:border-gray-800">
                                                    {selectedApp.linkedin && (
                                                        <a href={selectedApp.linkedin} target="_blank" rel="noreferrer" className="w-10 h-10 bg-[#0077B5] text-white rounded-xl flex items-center justify-center hover:scale-110 transition-transform"><FaLinkedinIn /></a>
                                                    )}
                                                    {selectedApp.portfolio && (
                                                        <a href={selectedApp.portfolio} target="_blank" rel="noreferrer" className="w-10 h-10 bg-slate-900 text-white rounded-xl flex items-center justify-center hover:scale-110 transition-transform"><FaLink /></a>
                                                    )}
                                                </div>
                                            </div>
                                        </section>

                                        <section>
                                            <h5 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4 flex items-center gap-2">
                                                <FaTools className="text-blue-500" /> Core Competencies
                                            </h5>
                                            <div className="flex flex-wrap gap-2">
                                                {(() => {
                                                    try {
                                                        const skills = JSON.parse(selectedApp.skills || "[]");
                                                        return skills.map((s: string) => (
                                                            <span key={s} className="bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-tight border border-blue-100 dark:border-blue-500/20">{s}</span>
                                                        ));
                                                    } catch (e) { return <span className="text-xs italic text-gray-500">None listed</span>; }
                                                })()}
                                            </div>
                                        </section>

                                        {selectedApp.resume_path && (
                                            <a
                                                href={`http://localhost:5005/${selectedApp.resume_path}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="block w-full text-center bg-blue-600 hover:bg-slate-900 text-white py-5 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl transition-all flex items-center justify-center gap-3"
                                            >
                                                <FaFilePdf size={14} /> ANALYZE RESUME / CV
                                            </a>
                                        )}
                                    </div>

                                    {/* Right Column: Detailed Experience & Education */}
                                    <div className="lg:col-span-2 space-y-10">
                                        <section>
                                            <h5 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-6 flex items-center gap-2">
                                                <FaBriefcase className="text-blue-500" /> Professional Experience Timeline
                                            </h5>
                                            <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px before:h-full before:w-0.5 before:bg-gradient-to-b before:from-blue-500 before:via-slate-200 before:to-transparent">
                                                {(() => {
                                                    try {
                                                        const exp = JSON.parse(selectedApp.work_experience || "[]");
                                                        if (exp.length === 0) return <p className="text-xs text-gray-400 italic pl-10">No history available</p>;
                                                        return exp.map((item: any, i: number) => (
                                                            <div key={i} className="relative pl-12 group">
                                                                <div className="absolute left-0 w-10 h-10 bg-white dark:bg-slate-900 border-2 border-blue-500 rounded-xl flex items-center justify-center text-blue-600 group-hover:scale-110 transition-transform shadow-lg z-10">
                                                                    <FaBuilding size={12} />
                                                                </div>
                                                                <div className="bg-white dark:bg-slate-800/50 p-6 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow">
                                                                    <div className="flex justify-between items-start mb-2">
                                                                        <h6 className="font-black text-xs uppercase text-slate-900 dark:text-white mb-1 leading-none">{item.jobTitle}</h6>
                                                                        <span className="text-[9px] font-black uppercase bg-blue-50 dark:bg-blue-900 text-blue-600 dark:text-blue-300 px-2 py-0.5 rounded italic">
                                                                            {item.startDate} - {item.isCurrent ? 'Current' : item.endDate}
                                                                        </span>
                                                                    </div>
                                                                    <p className="text-[10px] font-bold text-blue-500 uppercase mb-3 tracking-widest">{item.companyName}</p>
                                                                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-medium">{item.responsibilities}</p>
                                                                </div>
                                                            </div>
                                                        ));
                                                    } catch (e) { return null; }
                                                })()}
                                            </div>
                                        </section>

                                        <section>
                                            <h5 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-6 flex items-center gap-2">
                                                <FaGraduationCap className="text-emerald-500" /> Educational Pedigree
                                            </h5>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                {(() => {
                                                    try {
                                                        const edu = JSON.parse(selectedApp.education || "[]");
                                                        return edu.map((item: any, i: number) => (
                                                            <div key={i} className="bg-emerald-50/50 dark:bg-emerald-500/5 p-6 rounded-3xl border border-emerald-100 dark:border-emerald-500/10">
                                                                <p className="text-[9px] font-black uppercase text-emerald-600 dark:text-emerald-400 mb-2">{item.degree} • {item.graduationYear}</p>
                                                                <h6 className="font-black text-xs uppercase text-slate-900 dark:text-white mb-1">{item.fieldOfStudy}</h6>
                                                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">{item.institutionName}</p>
                                                                {item.gpa && <p className="mt-3 text-[10px] font-black text-emerald-700 bg-emerald-100 dark:bg-emerald-900 px-2 py-0.5 rounded-lg inline-block">GPA: {item.gpa}</p>}
                                                            </div>
                                                        ));
                                                    } catch (e) { return null; }
                                                })()}
                                            </div>
                                        </section>

                                        {selectedApp.cover_letter && (
                                            <section>
                                                <h5 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4 flex items-center gap-2">
                                                    <FaEnvelope className="text-orange-500" /> Professional Pitch
                                                </h5>
                                                <div className="bg-orange-50/50 dark:bg-orange-900/10 p-8 rounded-[2rem] border border-orange-100 dark:border-orange-500/10 text-xs font-medium text-slate-600 dark:text-slate-400 leading-relaxed italic whitespace-pre-wrap shadow-inner">
                                                    "{selectedApp.cover_letter}"
                                                </div>
                                            </section>
                                        )}
                                    </div>
                                </div>

                                {/* Detailed Step: Application Status Management Hub */}
                                <div className="pt-12 border-t dark:border-gray-800">
                                    <h5 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-6 text-center">Executive Decision Hub</h5>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                        <button
                                            onClick={() => updateAppStatus(selectedApp.id, 'reviewing', 'Starting initial review.')}
                                            className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 p-6 rounded-[2rem] font-black text-[10px] uppercase hover:bg-blue-600 hover:text-white transition-all shadow-sm flex flex-col items-center gap-3 border border-slate-200 dark:border-slate-700 active:scale-95"
                                        >
                                            <FaSearch size={20} /> Mark Reviewing
                                        </button>
                                        <button
                                            onClick={() => updateAppStatus(selectedApp.id, 'shortlisted', 'Candidate shortlisted for role.')}
                                            className="bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 p-6 rounded-[2rem] font-black text-[10px] uppercase hover:bg-emerald-600 hover:text-white transition-all shadow-sm flex flex-col items-center gap-3 border border-emerald-100 dark:border-emerald-500/20 active:scale-95"
                                        >
                                            <FaCheck size={20} /> Shortlist Talent
                                        </button>
                                        <button
                                            onClick={() => updateAppStatus(selectedApp.id, 'interviewing', 'Invite to phase 2 interview.')}
                                            className="bg-purple-50 dark:bg-purple-900/20 text-purple-600 p-6 rounded-[2rem] font-black text-[10px] uppercase hover:bg-purple-600 hover:text-white transition-all shadow-sm flex flex-col items-center gap-3 border border-purple-100 dark:border-purple-500/20 active:scale-95"
                                        >
                                            <FaSatellite size={20} /> Schedule Sync
                                        </button>
                                        <button
                                            onClick={() => updateAppStatus(selectedApp.id, 'rejected', 'Application declined.')}
                                            className="bg-red-50 dark:bg-red-900/20 text-red-600 p-6 rounded-[2rem] font-black text-[10px] uppercase hover:bg-red-600 hover:text-white transition-all shadow-sm flex flex-col items-center gap-3 border border-red-100 dark:border-red-500/20 active:scale-95"
                                        >
                                            <FaTimesCircle size={20} /> Decline
                                        </button>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                                        <button
                                            onClick={() => {
                                                setModalMode('single');
                                                setTargetStatus('written_exam');
                                                setAppointmentForm({ date: '', time: '', location: '', lat: 8.964682194440629, lng: 38.84064004666328, mapLink: '', details: '', adminNotes: '' });
                                                setShowStatusModal(true);
                                            }}
                                            className="bg-orange-50 dark:bg-orange-900/20 text-orange-600 p-4 rounded-2xl font-black text-[10px] uppercase hover:bg-orange-600 hover:text-white transition-all shadow-sm flex items-center justify-center gap-3 border border-orange-100 dark:border-orange-500/20"
                                        >
                                            <FaEdit size={16} /> Schedule Written Exam
                                        </button>
                                        <button
                                            onClick={() => {
                                                setModalMode('single');
                                                setTargetStatus('interview_shortlisted');
                                                setAppointmentForm({ date: '', time: '', location: '', lat: 8.964682194440629, lng: 38.84064004666328, mapLink: '', details: '', adminNotes: '' });
                                                setShowStatusModal(true);
                                            }}
                                            className="bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 p-4 rounded-2xl font-black text-[10px] uppercase hover:bg-indigo-600 hover:text-white transition-all shadow-sm flex items-center justify-center gap-3 border border-indigo-100 dark:border-indigo-500/20"
                                        >
                                            <FaCalendarAlt size={16} /> Shortlist for Interview
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )
            }
        </div >
    );
};

const RecenterMap = ({ lat, lng }: { lat: number, lng: number }) => {
    const map = useMap();
    useEffect(() => {
        map.setView([lat, lng]);
    }, [lat, lng, map]);
    return null;
};

const MapEventsHandler = ({ onLocationSelect }: { onLocationSelect: (lat: number, lng: number) => void }) => {
    useMapEvents({
        click(e: L.LeafletMouseEvent) {
            onLocationSelect(e.latlng.lat, e.latlng.lng);
        },
    });
    return null;
};

export default CareerAdmin;
