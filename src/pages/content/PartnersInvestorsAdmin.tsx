import React, { useState, useEffect, FormEvent } from 'react';
import axios from 'axios';
import { FaHandshake, FaBuilding, FaPlus, FaEdit, FaTrash, FaSearch } from 'react-icons/fa';

const BACKEND_URL = "https://api-cms.startechaigroup.com/api/partners-investors";

interface Partner {
    id: number;
    partner_id: string;
    company_name: string;
    contact_name?: string;
    contact_email?: string;
    partnership_type?: string;
    country?: string;
    zone?: string;
    industry_type?: string;
    agreement_start_date?: string;
    agreement_end_date?: string;
    status: 'Active' | 'Inactive' | 'Ongoing';
    services_provided: string[];
    logo?: string;
    gallery?: string[];
    description?: string;
    meta_title?: string;
    meta_description?: string;
    meta_keywords?: string;
    slug?: string;
    website?: string;
    linkedin?: string;
    twitter?: string;
    facebook?: string;
}

interface Investor {
    id: number;
    investor_id: string;
    company_name: string;
    property_name?: string;
    industry_type?: string;
    availability_status?: string;
    zone?: string;
    country?: string;
    description?: string;
    contact_name?: string;
    contact_phone?: string;
    investment_type?: string;
    established_date?: string;
    website?: string;
    image?: string;
    gallery?: string[];
    meta_title?: string;
    meta_description?: string;
    meta_keywords?: string;
    slug?: string;
    linkedin?: string;
    twitter?: string;
    facebook?: string;
}

const PartnersInvestorsAdmin: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'partners' | 'investors'>('partners');
    const [partners, setPartners] = useState<Partner[]>([]);
    const [investors, setInvestors] = useState<Investor[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');

    // Form states
    const [showPartnerForm, setShowPartnerForm] = useState(false);
    const [showInvestorForm, setShowInvestorForm] = useState(false);
    const [editingPartner, setEditingPartner] = useState<Partner | null>(null);
    const [editingInvestor, setEditingInvestor] = useState<Investor | null>(null);
    const [logoFile, setLogoFile] = useState<File | null>(null);
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [logoPreview, setLogoPreview] = useState<string | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [galleryFiles, setGalleryFiles] = useState<File[]>([]);
    const [galleryPreviews, setGalleryPreviews] = useState<string[]>([]);

    const initialPartnerForm: Partial<Partner> = {
        partner_id: '',
        company_name: '',
        contact_name: '',
        contact_email: '',
        partnership_type: 'Strategic',
        country: 'Ethiopia',
        zone: 'IT Park, Addis Ababa',
        industry_type: '',
        status: 'Active',
        services_provided: [],
        logo: '',
        gallery: [],
        description: '',
        meta_title: '',
        meta_description: '',
        meta_keywords: '',
        slug: '',
        website: '',
        linkedin: '',
        twitter: '',
        facebook: ''
    };

    const initialInvestorForm: Partial<Investor> = {
        investor_id: '',
        company_name: '',
        property_name: '',
        industry_type: '',
        availability_status: 'Operational',
        zone: 'IT Park, Addis Ababa',
        country: 'Ethiopia',
        description: '',
        contact_name: '',
        contact_phone: '',
        investment_type: '',
        website: '',
        image: '',
        gallery: [],
        meta_title: '',
        meta_description: '',
        meta_keywords: '',
        slug: '',
        linkedin: '',
        twitter: '',
        facebook: ''
    };

    const [partnerForm, setPartnerForm] = useState<Partial<Partner>>(initialPartnerForm);
    const [investorForm, setInvestorForm] = useState<Partial<Investor>>(initialInvestorForm);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [partnersRes, investorsRes] = await Promise.all([
                axios.get(`${BACKEND_URL}/partners`),
                axios.get(`${BACKEND_URL}/investors`)
            ]);
            setPartners(partnersRes.data);
            setInvestors(investorsRes.data);
        } catch (err) {
            setError('Failed to fetch data');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handlePartnerSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            const formData = new FormData();
            Object.keys(partnerForm).forEach(key => {
                const value = (partnerForm as any)[key];
                if (key === 'services_provided' || key === 'gallery') {
                    formData.append(key, JSON.stringify(value || []));
                } else if (value !== undefined && value !== null) {
                    formData.append(key, value);
                }
            });

            if (logoFile) {
                formData.append('logo', logoFile);
            }

            if (galleryFiles.length > 0) {
                galleryFiles.forEach(file => {
                    formData.append('gallery', file);
                });
            }

            if (editingPartner) {
                await axios.put(`${BACKEND_URL}/partners/${editingPartner.id}`, formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                setSuccess('Partner updated successfully');
            } else {
                await axios.post(`${BACKEND_URL}/partners`, formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                setSuccess('Partner created successfully');
            }
            setShowPartnerForm(false);
            setEditingPartner(null);
            setLogoFile(null);
            setLogoPreview(null);
            setGalleryFiles([]);
            setGalleryPreviews([]);
            fetchData();
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to save partner');
        } finally {
            setLoading(false);
        }
    };

    const handleInvestorSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            const formData = new FormData();
            Object.keys(investorForm).forEach(key => {
                const value = (investorForm as any)[key];
                if (key === 'gallery') {
                    formData.append(key, JSON.stringify(value || []));
                } else if (value !== undefined && value !== null) {
                    formData.append(key, value);
                }
            });

            if (imageFile) {
                formData.append('image', imageFile);
            }

            if (galleryFiles.length > 0) {
                galleryFiles.forEach(file => {
                    formData.append('gallery', file);
                });
            }

            if (editingInvestor) {
                await axios.put(`${BACKEND_URL}/investors/${editingInvestor.id}`, formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                setSuccess('Investor updated successfully');
            } else {
                await axios.post(`${BACKEND_URL}/investors`, formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                setSuccess('Investor created successfully');
            }
            setShowInvestorForm(false);
            setEditingInvestor(null);
            setImageFile(null);
            setImagePreview(null);
            setGalleryFiles([]);
            setGalleryPreviews([]);
            fetchData();
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to save investor');
        } finally {
            setLoading(false);
        }
    };

    const deletePartner = async (id: number) => {
        if (!window.confirm('Are you sure you want to delete this partner?')) return;
        try {
            await axios.delete(`${BACKEND_URL}/partners/${id}`);
            setSuccess('Partner deleted successfully');
            fetchData();
        } catch (err) {
            setError('Failed to delete partner');
        }
    };

    const deleteInvestor = async (id: number) => {
        if (!window.confirm('Are you sure you want to delete this investor?')) return;
        try {
            await axios.delete(`${BACKEND_URL}/investors/${id}`);
            setSuccess('Investor deleted successfully');
            fetchData();
        } catch (err) {
            setError('Failed to delete investor');
        }
    };

    const filteredPartners = partners.filter(p =>
        p.company_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.partner_id.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const filteredInvestors = investors.filter(i =>
        i.company_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        i.investor_id.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const inputClass = "w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-slate-800 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none";
    const labelClass = "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1";
    const sectionTitleClass = "text-lg font-semibold dark:text-gray-200 mt-6 mb-3 border-b pb-2";

    return (
        <div className="p-6 max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold dark:text-white">Partners & Investors Management</h1>
                <div className="flex space-x-2">
                    <button
                        onClick={() => setActiveTab('partners')}
                        className={`px-4 py-2 rounded-lg flex items-center space-x-2 ${activeTab === 'partners' ? 'bg-blue-600 text-white' : 'bg-gray-200 dark:bg-gray-700 dark:text-gray-300'}`}
                    >
                        <FaHandshake /> <span>Partners</span>
                    </button>
                    <button
                        onClick={() => setActiveTab('investors')}
                        className={`px-4 py-2 rounded-lg flex items-center space-x-2 ${activeTab === 'investors' ? 'bg-blue-600 text-white' : 'bg-gray-200 dark:bg-gray-700 dark:text-gray-300'}`}
                    >
                        <FaBuilding /> <span>Investors</span>
                    </button>
                </div>
            </div>

            {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{error}</div>}
            {success && <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">{success}</div>}

            <div className="bg-white dark:bg-slate-900 rounded-xl shadow-lg p-6 border border-gray-100 dark:border-gray-800">
                <div className="flex justify-between items-center mb-4">
                    <div className="relative w-64">
                        <FaSearch className="absolute left-3 top-3 text-gray-400" />
                        <input
                            type="text"
                            placeholder={`Search ${activeTab}...`}
                            className="pl-10 pr-4 py-2 w-full rounded-lg border dark:border-gray-700 dark:bg-slate-800 dark:text-white"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <button
                        onClick={() => {
                            if (activeTab === 'partners') {
                                setEditingPartner(null);
                                setPartnerForm(initialPartnerForm);
                                setLogoPreview(null);
                                setGalleryPreviews([]);
                                setGalleryFiles([]);
                                setShowPartnerForm(true);
                            } else {
                                setEditingInvestor(null);
                                setInvestorForm(initialInvestorForm);
                                setImagePreview(null);
                                setGalleryPreviews([]);
                                setGalleryFiles([]);
                                setShowInvestorForm(true);
                            }
                        }}
                        className="bg-green-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-green-700"
                    >
                        <FaPlus /> <span>Add {activeTab === 'partners' ? 'Partner' : 'Investor'}</span>
                    </button>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b dark:border-gray-800">
                                <th className="py-3 px-4 dark:text-gray-300">ID</th>
                                <th className="py-3 px-4 dark:text-gray-300">Company Name</th>
                                <th className="py-3 px-4 dark:text-gray-300">Type / Industry</th>
                                <th className="py-3 px-4 dark:text-gray-300">Status</th>
                                <th className="py-3 px-4 dark:text-gray-300">Slug</th>
                                <th className="py-3 px-4 dark:text-gray-300">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {activeTab === 'partners' ? (
                                filteredPartners.map(p => (
                                    <tr key={p.id} className="border-b dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-slate-800/50">
                                        <td className="py-3 px-4 dark:text-gray-400">{p.partner_id}</td>
                                        <td className="py-3 px-4 dark:text-gray-400 font-medium">{p.company_name}</td>
                                        <td className="py-3 px-4 dark:text-gray-400">{p.partnership_type} / {p.industry_type}</td>
                                        <td className="py-3 px-4">
                                            <span className={`px-2 py-1 rounded-full text-xs ${p.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                                {p.status}
                                            </span>
                                        </td>
                                        <td className="py-3 px-4 dark:text-gray-400 text-sm">{p.slug || '-'}</td>
                                        <td className="py-3 px-4">
                                            <div className="flex space-x-2">
                                                <button onClick={() => { setEditingPartner(p); setPartnerForm(p); setLogoPreview(null); setGalleryPreviews([]); setShowPartnerForm(true); }} className="text-blue-600 hover:text-blue-800"><FaEdit /></button>
                                                <button onClick={() => deletePartner(p.id)} className="text-red-600 hover:text-red-800"><FaTrash /></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                filteredInvestors.map(i => (
                                    <tr key={i.id} className="border-b dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-slate-800/50">
                                        <td className="py-3 px-4 dark:text-gray-400">{i.investor_id}</td>
                                        <td className="py-3 px-4 dark:text-gray-400 font-medium">{i.company_name}</td>
                                        <td className="py-3 px-4 dark:text-gray-400">{i.investment_type} / {i.industry_type}</td>
                                        <td className="py-3 px-4">
                                            <span className={`px-2 py-1 rounded-full text-xs ${i.availability_status === 'Operational' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}`}>
                                                {i.availability_status}
                                            </span>
                                        </td>
                                        <td className="py-3 px-4 dark:text-gray-400 text-sm">{i.slug || '-'}</td>
                                        <td className="py-3 px-4">
                                            <div className="flex space-x-2">
                                                <button onClick={() => { setEditingInvestor(i); setInvestorForm(i); setImagePreview(null); setGalleryPreviews([]); setShowInvestorForm(true); }} className="text-blue-600 hover:text-blue-800"><FaEdit /></button>
                                                <button onClick={() => deleteInvestor(i.id)} className="text-red-600 hover:text-red-800"><FaTrash /></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Partner Modal */}
            {showPartnerForm && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto p-6">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold dark:text-white">{editingPartner ? 'Edit Partner' : 'Add New Partner'}</h2>
                            <button onClick={() => setShowPartnerForm(false)} className="text-gray-500 hover:text-gray-700">&times;</button>
                        </div>
                        <form onSubmit={handlePartnerSubmit} className="space-y-4">
                            <h3 className={sectionTitleClass}>Basic Information</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className={labelClass}>Partner ID</label>
                                    <input type="text" value={partnerForm.partner_id} onChange={(e) => setPartnerForm({ ...partnerForm, partner_id: e.target.value })} className={inputClass} required />
                                </div>
                                <div>
                                    <label className={labelClass}>Company Name</label>
                                    <input type="text" value={partnerForm.company_name} onChange={(e) => setPartnerForm({ ...partnerForm, company_name: e.target.value })} className={inputClass} required />
                                </div>
                                <div>
                                    <label className={labelClass}>Partnership Type</label>
                                    <select value={partnerForm.partnership_type} onChange={(e) => setPartnerForm({ ...partnerForm, partnership_type: e.target.value })} className={inputClass}>
                                        <option value="Strategic">Strategic</option>
                                        <option value="Government">Government</option>
                                        <option value="International">International</option>
                                        <option value="Technology">Technology</option>
                                    </select>
                                </div>
                                <div>
                                    <label className={labelClass}>Status</label>
                                    <select value={partnerForm.status} onChange={(e) => setPartnerForm({ ...partnerForm, status: e.target.value as any })} className={inputClass}>
                                        <option value="Active">Active</option>
                                        <option value="Inactive">Inactive</option>
                                        <option value="Ongoing">Ongoing</option>
                                    </select>
                                </div>
                                <div>
                                    <label className={labelClass}>Industry Type</label>
                                    <input type="text" value={partnerForm.industry_type} onChange={(e) => setPartnerForm({ ...partnerForm, industry_type: e.target.value })} className={inputClass} />
                                </div>
                                <div>
                                    <label className={labelClass}>Country</label>
                                    <input type="text" value={partnerForm.country} onChange={(e) => setPartnerForm({ ...partnerForm, country: e.target.value })} className={inputClass} />
                                </div>
                                <div>
                                    <label className={labelClass}>Zone</label>
                                    <input type="text" value={partnerForm.zone} onChange={(e) => setPartnerForm({ ...partnerForm, zone: e.target.value })} className={inputClass} />
                                </div>
                                <div className="md:col-span-1">
                                    <label className={labelClass}>Logo</label>
                                    <div className="flex items-center space-x-4">
                                        <div className="w-16 h-16 rounded overflow-hidden bg-gray-100 dark:bg-gray-800 border flex items-center justify-center">
                                            {logoPreview || partnerForm.logo ? (
                                                <img src={logoPreview || (partnerForm.logo?.startsWith('http') ? partnerForm.logo : `https://api-cms.startechaigroup.com${partnerForm.logo}`)} alt="Logo Preview" className="w-full h-full object-contain" />
                                            ) : (
                                                <FaHandshake className="text-gray-400" />
                                            )}
                                        </div>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={(e) => {
                                                const file = e.target.files?.[0];
                                                if (file) {
                                                    setLogoFile(file);
                                                    setLogoPreview(URL.createObjectURL(file));
                                                }
                                            }}
                                            className={inputClass}
                                        />
                                    </div>
                                </div>
                                <div className="md:col-span-2">
                                    <label className={labelClass}>Services Provided (Comma separated)</label>
                                    <input
                                        type="text"
                                        value={partnerForm.services_provided?.join(', ')}
                                        onChange={(e) => setPartnerForm({ ...partnerForm, services_provided: e.target.value.split(',').map(s => s.trim()).filter(s => s !== '') })}
                                        className={inputClass}
                                        placeholder="Service 1, Service 2, Service 3"
                                    />
                                </div>
                                <div className="md:col-span-2">
                                    <label className={labelClass}>Additional Gallery</label>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                                        {partnerForm.gallery?.map((img, idx) => (
                                            <div key={idx} className="relative group aspect-video rounded-lg overflow-hidden border">
                                                <img src={img.startsWith('http') ? img : `https://api-cms.startechaigroup.com${img}`} className="w-full h-full object-cover" />
                                                <button
                                                    type="button"
                                                    onClick={() => setPartnerForm({ ...partnerForm, gallery: partnerForm.gallery?.filter((_, i) => i !== idx) })}
                                                    className="absolute top-1 right-1 bg-red-600 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                                >
                                                    <FaTrash size={10} />
                                                </button>
                                            </div>
                                        ))}
                                        {galleryPreviews.map((img, idx) => (
                                            <div key={idx} className="relative group aspect-video rounded-lg overflow-hidden border border-blue-500">
                                                <img src={img} className="w-full h-full object-cover" />
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setGalleryFiles(galleryFiles.filter((_, i) => i !== idx));
                                                        setGalleryPreviews(galleryPreviews.filter((_, i) => i !== idx));
                                                    }}
                                                    className="absolute top-1 right-1 bg-red-600 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                                >
                                                    <FaTrash size={10} />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                    <input
                                        type="file"
                                        multiple
                                        accept="image/*"
                                        onChange={(e) => {
                                            const files = Array.from(e.target.files || []);
                                            setGalleryFiles([...galleryFiles, ...files]);
                                            setGalleryPreviews([...galleryPreviews, ...files.map(f => URL.createObjectURL(f))]);
                                        }}
                                        className={inputClass}
                                    />
                                </div>
                            </div>

                            <h3 className={sectionTitleClass}>Contact & Agreement</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className={labelClass}>Contact Name</label>
                                    <input type="text" value={partnerForm.contact_name} onChange={(e) => setPartnerForm({ ...partnerForm, contact_name: e.target.value })} className={inputClass} />
                                </div>
                                <div>
                                    <label className={labelClass}>Contact Email</label>
                                    <input type="email" value={partnerForm.contact_email} onChange={(e) => setPartnerForm({ ...partnerForm, contact_email: e.target.value })} className={inputClass} />
                                </div>
                                <div>
                                    <label className={labelClass}>Start Date</label>
                                    <input type="date" value={partnerForm.agreement_start_date?.split('T')[0]} onChange={(e) => setPartnerForm({ ...partnerForm, agreement_start_date: e.target.value })} className={inputClass} />
                                </div>
                                <div>
                                    <label className={labelClass}>End Date</label>
                                    <input type="date" value={partnerForm.agreement_end_date?.split('T')[0]} onChange={(e) => setPartnerForm({ ...partnerForm, agreement_end_date: e.target.value })} className={inputClass} />
                                </div>
                            </div>

                            <div>
                                <label className={labelClass}>Description</label>
                                <textarea value={partnerForm.description} onChange={(e) => setPartnerForm({ ...partnerForm, description: e.target.value })} className={inputClass} rows={3} />
                            </div>

                            <h3 className={sectionTitleClass}>Web & Social Links</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className={labelClass}>Website URL</label>
                                    <input type="url" value={partnerForm.website} onChange={(e) => setPartnerForm({ ...partnerForm, website: e.target.value })} className={inputClass} placeholder="https://example.com" />
                                </div>
                                <div>
                                    <label className={labelClass}>LinkedIn URL</label>
                                    <input type="url" value={partnerForm.linkedin} onChange={(e) => setPartnerForm({ ...partnerForm, linkedin: e.target.value })} className={inputClass} placeholder="https://linkedin.com/company/..." />
                                </div>
                                <div>
                                    <label className={labelClass}>Twitter URL</label>
                                    <input type="url" value={partnerForm.twitter} onChange={(e) => setPartnerForm({ ...partnerForm, twitter: e.target.value })} className={inputClass} placeholder="https://twitter.com/..." />
                                </div>
                                <div>
                                    <label className={labelClass}>Facebook URL</label>
                                    <input type="url" value={partnerForm.facebook} onChange={(e) => setPartnerForm({ ...partnerForm, facebook: e.target.value })} className={inputClass} placeholder="https://facebook.com/..." />
                                </div>
                            </div>

                            <h3 className={sectionTitleClass}>SEO Optimization</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="md:col-span-2">
                                    <label className={labelClass}>Slug (Unique URL identifier)</label>
                                    <input type="text" value={partnerForm.slug} onChange={(e) => setPartnerForm({ ...partnerForm, slug: e.target.value })} className={inputClass} placeholder="e.g. zergaw-cloud" />
                                </div>
                                <div>
                                    <label className={labelClass}>Meta Title</label>
                                    <input type="text" value={partnerForm.meta_title} onChange={(e) => setPartnerForm({ ...partnerForm, meta_title: e.target.value })} className={inputClass} />
                                </div>
                                <div>
                                    <label className={labelClass}>Meta Keywords</label>
                                    <input type="text" value={partnerForm.meta_keywords} onChange={(e) => setPartnerForm({ ...partnerForm, meta_keywords: e.target.value })} className={inputClass} placeholder="keyword1, keyword2" />
                                </div>
                                <div className="md:col-span-2">
                                    <label className={labelClass}>Meta Description</label>
                                    <textarea value={partnerForm.meta_description} onChange={(e) => setPartnerForm({ ...partnerForm, meta_description: e.target.value })} className={inputClass} rows={2} />
                                </div>
                            </div>

                            <div className="flex justify-end space-x-3 pt-6 border-t dark:border-gray-800">
                                <button type="button" onClick={() => setShowPartnerForm(false)} className="px-4 py-2 text-gray-500 hover:text-gray-700">Cancel</button>
                                <button type="submit" disabled={loading} className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700">
                                    {loading ? 'Saving...' : (editingPartner ? 'Update Partner' : 'Add Partner')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Investor Modal */}
            {showInvestorForm && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto p-6">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold dark:text-white">{editingInvestor ? 'Edit Investor' : 'Add New Investor'}</h2>
                            <button onClick={() => setShowInvestorForm(false)} className="text-gray-500 hover:text-gray-700">&times;</button>
                        </div>
                        <form onSubmit={handleInvestorSubmit} className="space-y-4">
                            <h3 className={sectionTitleClass}>Basic Information</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className={labelClass}>Investor ID</label>
                                    <input type="text" value={investorForm.investor_id} onChange={(e) => setInvestorForm({ ...investorForm, investor_id: e.target.value })} className={inputClass} required />
                                </div>
                                <div>
                                    <label className={labelClass}>Company Name</label>
                                    <input type="text" value={investorForm.company_name} onChange={(e) => setInvestorForm({ ...investorForm, company_name: e.target.value })} className={inputClass} required />
                                </div>
                                <div>
                                    <label className={labelClass}>Property Name</label>
                                    <input type="text" value={investorForm.property_name} onChange={(e) => setInvestorForm({ ...investorForm, property_name: e.target.value })} className={inputClass} />
                                </div>
                                <div>
                                    <label className={labelClass}>Industry Type</label>
                                    <input type="text" value={investorForm.industry_type} onChange={(e) => setInvestorForm({ ...investorForm, industry_type: e.target.value })} className={inputClass} />
                                </div>
                                <div>
                                    <label className={labelClass}>Availability Status</label>
                                    <select value={investorForm.availability_status} onChange={(e) => setInvestorForm({ ...investorForm, availability_status: e.target.value })} className={inputClass}>
                                        <option value="Operational">Operational</option>
                                        <option value="Under Construction">Under Construction</option>
                                        <option value="Coming Soon">Coming Soon</option>
                                        <option value="Active">Active</option>
                                    </select>
                                </div>
                                <div>
                                    <label className={labelClass}>Investment Type</label>
                                    <input type="text" value={investorForm.investment_type} onChange={(e) => setInvestorForm({ ...investorForm, investment_type: e.target.value })} className={inputClass} />
                                </div>
                                <div>
                                    <label className={labelClass}>Country</label>
                                    <input type="text" value={investorForm.country} onChange={(e) => setInvestorForm({ ...investorForm, country: e.target.value })} className={inputClass} />
                                </div>
                                <div>
                                    <label className={labelClass}>Zone</label>
                                    <input type="text" value={investorForm.zone} onChange={(e) => setInvestorForm({ ...investorForm, zone: e.target.value })} className={inputClass} />
                                </div>
                                <div>
                                    <label className={labelClass}>Established Date</label>
                                    <input type="date" value={investorForm.established_date?.split('T')[0]} onChange={(e) => setInvestorForm({ ...investorForm, established_date: e.target.value })} className={inputClass} />
                                </div>
                                <div>
                                    <label className={labelClass}>Website</label>
                                    <input type="text" value={investorForm.website} onChange={(e) => setInvestorForm({ ...investorForm, website: e.target.value })} className={inputClass} />
                                </div>
                                <div className="md:col-span-1">
                                    <label className={labelClass}>Main Image</label>
                                    <div className="flex items-center space-x-4">
                                        <div className="w-24 h-16 rounded overflow-hidden bg-gray-100 dark:bg-gray-800 border flex items-center justify-center">
                                            {imagePreview || investorForm.image ? (
                                                <img src={imagePreview || (investorForm.image?.startsWith('http') ? investorForm.image : `https://api-cms.startechaigroup.com${investorForm.image}`)} alt="Investor Preview" className="w-full h-full object-cover" />
                                            ) : (
                                                <FaBuilding className="text-gray-400" />
                                            )}
                                        </div>
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
                                            className={inputClass}
                                        />
                                    </div>
                                </div>
                                <div className="md:col-span-2 mt-4">
                                    <label className={labelClass}>Additional Gallery</label>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                                        {investorForm.gallery?.map((img, idx) => (
                                            <div key={idx} className="relative group aspect-video rounded-lg overflow-hidden border">
                                                <img src={img.startsWith('http') ? img : `https://api-cms.startechaigroup.com${img}`} className="w-full h-full object-cover" />
                                                <button
                                                    type="button"
                                                    onClick={() => setInvestorForm({ ...investorForm, gallery: investorForm.gallery?.filter((_, i) => i !== idx) })}
                                                    className="absolute top-1 right-1 bg-red-600 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                                >
                                                    <FaTrash size={10} />
                                                </button>
                                            </div>
                                        ))}
                                        {galleryPreviews.map((img, idx) => (
                                            <div key={idx} className="relative group aspect-video rounded-lg overflow-hidden border border-blue-500">
                                                <img src={img} className="w-full h-full object-cover" />
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setGalleryFiles(galleryFiles.filter((_, i) => i !== idx));
                                                        setGalleryPreviews(galleryPreviews.filter((_, i) => i !== idx));
                                                    }}
                                                    className="absolute top-1 right-1 bg-red-600 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                                >
                                                    <FaTrash size={10} />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                    <input
                                        type="file"
                                        multiple
                                        accept="image/*"
                                        onChange={(e) => {
                                            const files = Array.from(e.target.files || []);
                                            setGalleryFiles([...galleryFiles, ...files]);
                                            setGalleryPreviews([...galleryPreviews, ...files.map(f => URL.createObjectURL(f))]);
                                        }}
                                        className={inputClass}
                                    />
                                </div>
                            </div>

                            <h3 className={sectionTitleClass}>Contact Information</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className={labelClass}>Contact Name</label>
                                    <input type="text" value={investorForm.contact_name} onChange={(e) => setInvestorForm({ ...investorForm, contact_name: e.target.value })} className={inputClass} />
                                </div>
                                <div>
                                    <label className={labelClass}>Contact Phone</label>
                                    <input type="text" value={investorForm.contact_phone} onChange={(e) => setInvestorForm({ ...investorForm, contact_phone: e.target.value })} className={inputClass} />
                                </div>
                            </div>

                            <div>
                                <label className={labelClass}>Description</label>
                                <textarea value={investorForm.description} onChange={(e) => setInvestorForm({ ...investorForm, description: e.target.value })} className={inputClass} rows={3} />
                            </div>

                            <h3 className={sectionTitleClass}>Social Links</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className={labelClass}>LinkedIn URL</label>
                                    <input type="url" value={investorForm.linkedin} onChange={(e) => setInvestorForm({ ...investorForm, linkedin: e.target.value })} className={inputClass} placeholder="https://linkedin.com/company/..." />
                                </div>
                                <div>
                                    <label className={labelClass}>Twitter URL</label>
                                    <input type="url" value={investorForm.twitter} onChange={(e) => setInvestorForm({ ...investorForm, twitter: e.target.value })} className={inputClass} placeholder="https://twitter.com/..." />
                                </div>
                                <div>
                                    <label className={labelClass}>Facebook URL</label>
                                    <input type="url" value={investorForm.facebook} onChange={(e) => setInvestorForm({ ...investorForm, facebook: e.target.value })} className={inputClass} placeholder="https://facebook.com/..." />
                                </div>
                            </div>

                            <h3 className={sectionTitleClass}>SEO Optimization</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="md:col-span-2">
                                    <label className={labelClass}>Slug (Unique URL identifier)</label>
                                    <input type="text" value={investorForm.slug} onChange={(e) => setInvestorForm({ ...investorForm, slug: e.target.value })} className={inputClass} placeholder="e.g. raxio-ethiopia" />
                                </div>
                                <div>
                                    <label className={labelClass}>Meta Title</label>
                                    <input type="text" value={investorForm.meta_title} onChange={(e) => setInvestorForm({ ...investorForm, meta_title: e.target.value })} className={inputClass} />
                                </div>
                                <div>
                                    <label className={labelClass}>Meta Keywords</label>
                                    <input type="text" value={investorForm.meta_keywords} onChange={(e) => setInvestorForm({ ...investorForm, meta_keywords: e.target.value })} className={inputClass} placeholder="keyword1, keyword2" />
                                </div>
                                <div className="md:col-span-2">
                                    <label className={labelClass}>Meta Description</label>
                                    <textarea value={investorForm.meta_description} onChange={(e) => setInvestorForm({ ...investorForm, meta_description: e.target.value })} className={inputClass} rows={2} />
                                </div>
                            </div>

                            <div className="flex justify-end space-x-3 pt-6 border-t dark:border-gray-800">
                                <button type="button" onClick={() => setShowInvestorForm(false)} className="px-4 py-2 text-gray-500 hover:text-gray-700">Cancel</button>
                                <button type="submit" disabled={loading} className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700">
                                    {loading ? 'Saving...' : (editingInvestor ? 'Update Investor' : 'Add Investor')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PartnersInvestorsAdmin;
