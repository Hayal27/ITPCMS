
import React, { useState, ChangeEvent, FormEvent, useEffect } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import axios, { AxiosRequestConfig, AxiosError } from 'axios';
// import './NewsEventsAdmin.css'; // Removed in favor of Tailwind

import { BACKEND_URL, request } from '../../services/apiService';

export { BACKEND_URL, request };

// --- Interfaces ---
export interface NewsItem {
    id: number | string;
    title: string;
    date: string;
    category: string;
    image: string[];
    description: string;
    featured: boolean;
    readTime?: string;
    tags?: string[];
    youtubeUrl?: string;
    comments?: number;
}

export interface EventItem {
    id: number | string;
    title: string;
    date: string;
    time: string;
    venue: string;
    image: string[];
    description: string;
    featured: boolean;
    registrationLink?: string;
    capacity?: string;
    tags?: string[];
    comments?: number;
}

export type NewsFormData = Omit<NewsItem, 'id' | 'comments' | 'image'> & {
    imageFiles?: File[];
    youtubeUrl?: string;
};

export type EventFormData = Omit<EventItem, 'id' | 'comments' | 'image'> & {
    imageFiles?: File[];
};

// --- Form Data Builders ---
const buildNewsFormData = (newsData: NewsFormData | Partial<NewsFormData>): FormData => {
    const formData = new FormData();
    (Object.keys(newsData) as Array<keyof typeof newsData>).forEach(key => {
        if (key === 'imageFiles' || key === 'tags') return;
        const value = newsData[key];
        if (value !== undefined && value !== null) {
            if (key === 'youtubeUrl' && value === '') return;
            formData.append(key, typeof value === 'boolean' ? String(value) : String(value));
        }
    });
    if (newsData.tags && newsData.tags.length > 0) {
        newsData.tags.forEach(tag => formData.append('tags', tag));
    }
    if (newsData.imageFiles && newsData.imageFiles.length > 0) {
        newsData.imageFiles.forEach(file => formData.append('newsImages', file, file.name));
    }
    return formData;
};

const buildEventFormData = (eventData: EventFormData): FormData => {
    const formData = new FormData();
    Object.keys(eventData).forEach(key => {
        if (key !== 'imageFiles' && key !== 'tags') {
            const value = eventData[key as keyof EventFormData];
            if (value !== undefined && value !== null) {
                formData.append(key, String(value));
            }
        }
    });

    if (eventData.tags && eventData.tags.length > 0) {
        eventData.tags.forEach(tag => formData.append('tags', tag));
    }

    if (eventData.imageFiles && eventData.imageFiles.length > 0) {
        eventData.imageFiles.forEach(file => {
            formData.append('newsImages', file);
        });
    }

    return formData;
};

// --- API Calls ---
export const addNews = async (newsData: NewsFormData): Promise<NewsItem> => {
    const formData = buildNewsFormData(newsData);
    return request<{ success: boolean; message: string; newsId: number; imageUrls: string[]; youtubeUrl?: string }>('/news', {
        method: 'POST',
        data: formData,
    }).then(response => ({
        ...newsData,
        id: response.newsId,
        image: response.imageUrls,
        youtubeUrl: response.youtubeUrl || newsData.youtubeUrl,
    }));
};

export const addEvent = async (eventData: EventFormData): Promise<EventItem> => {
    const formData = buildEventFormData(eventData);
    return request<{ success: boolean; message: string; eventId: number; imageUrls: string[] }>('/events', {
        method: 'POST',
        data: formData,
    }).then(response => ({
        ...eventData,
        id: response.eventId,
        image: response.imageUrls,
    }));
};

// --- Quill Configuration ---
export const quillModules = {
    toolbar: [
        [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
        ['bold', 'italic', 'underline', 'strike', 'blockquote'],
        [{ 'list': 'ordered' }, { 'list': 'bullet' }, { 'indent': '-1' }, { 'indent': '+1' }],
        ['link', 'image', 'video'],
        [{ 'align': [] }],
        [{ 'color': [] }, { 'background': [] }],
        ['clean']
    ],
};

export const quillFormats = [
    'header', 'bold', 'italic', 'underline', 'strike', 'blockquote',
    'list', 'bullet', 'indent', 'link', 'image', 'video', 'align', 'color', 'background'
];

const MAX_IMAGES = 10;

const initialNewsFormData: NewsFormData = {
    title: '', date: '', category: 'Innovation', description: '', featured: false, readTime: '', tags: [], imageFiles: [], youtubeUrl: '',
};

const initialEventFormData: EventFormData = {
    title: '', date: '', time: '', venue: '', description: '', featured: false, registrationLink: '', capacity: '', tags: [], imageFiles: [],
};

export const newsCategories = [
    'Infrastructure', 'Innovation', 'Startup Ecosystem', 'Strategic Partnerships',
    'Events & Summits', 'Awards & Recognition', 'Government Initiatives', 'Community Engagement'
];

export const stripHtml = (html: string): string => {
    const doc = new DOMParser().parseFromString(html, 'text/html');
    return doc.body.textContent || "";
};

// --- Main Component ---
const NewsEventsAdmin: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'news' | 'events'>('news');
    const [newsFormData, setNewsFormData] = useState<NewsFormData>(initialNewsFormData);
    const [eventFormData, setEventFormData] = useState<EventFormData>(initialEventFormData);
    const [newsImagePreviews, setNewsImagePreviews] = useState<string[]>([]);
    const [eventImagePreviews, setEventImagePreviews] = useState<string[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    // Helper to handle input changes
    const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>, formType: 'news' | 'event') => {
        const { name, value, type } = e.target;
        const setter = formType === 'news' ? setNewsFormData : setEventFormData;
        setter(prev => {
            if (type === 'checkbox') {
                return { ...prev, [name]: (e.target as HTMLInputElement).checked };
            }
            if (name === 'tags') {
                return { ...prev, tags: value.split(',').map(tag => tag.trim()).filter(tag => tag) };
            }
            return { ...prev, [name]: value };
        });
    };

    const handleDescriptionChange = (content: string, formType: 'news' | 'event') => {
        const setter = formType === 'news' ? setNewsFormData : setEventFormData;
        setter(prev => ({ ...prev, description: content }));
    };

    const handleFileChange = (e: ChangeEvent<HTMLInputElement>, formType: 'news' | 'event') => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        const setter = formType === 'news' ? setNewsFormData : setEventFormData;
        const previewSetter = formType === 'news' ? setNewsImagePreviews : setEventImagePreviews;
        const currentFiles = formType === 'news' ? newsFormData.imageFiles : eventFormData.imageFiles;

        const newFilesArray = Array.from(files);
        const combinedFiles = [...(currentFiles || []), ...newFilesArray].slice(0, MAX_IMAGES);

        setter(prev => ({ ...prev, imageFiles: combinedFiles }));

        const newPreviewsPromises = combinedFiles.map(file => {
            return new Promise<string>((resolve, reject) => {
                const reader = new FileReader();
                reader.onloadend = () => resolve(reader.result as string);
                reader.onerror = reject;
                reader.readAsDataURL(file);
            });
        });

        Promise.all(newPreviewsPromises)
            .then(generatedPreviews => {
                previewSetter(generatedPreviews);
            })
            .catch(error => {
                console.error("Error generating image previews:", error);
                setError("Could not generate all image previews. Please try again.");
            });

        if (e.target) e.target.value = '';
    };

    const handleRemoveImage = (indexToRemove: number, formType: 'news' | 'event') => {
        const setter = formType === 'news' ? setNewsFormData : setEventFormData;
        const previewSetter = formType === 'news' ? setNewsImagePreviews : setEventImagePreviews;
        const currentFiles = formType === 'news' ? newsFormData.imageFiles : eventFormData.imageFiles;

        const updatedFiles = currentFiles?.filter((_, index) => index !== indexToRemove) || [];
        setter(prev => ({ ...prev, imageFiles: updatedFiles }));

        const updatedPreviewsPromises = updatedFiles.map(file => {
            return new Promise<string>((resolve, reject) => {
                const reader = new FileReader();
                reader.onloadend = () => resolve(reader.result as string);
                reader.onerror = reject;
                reader.readAsDataURL(file);
            });
        });

        Promise.all(updatedPreviewsPromises)
            .then(generatedPreviews => previewSetter(generatedPreviews))
            .catch(error => console.error("Error regenerating previews after removal:", error));
    };

    const handleSubmit = async (e: FormEvent<HTMLFormElement>, formType: 'news' | 'event') => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setSuccess(null);

        const currentData = formType === 'news' ? newsFormData : eventFormData;
        if (!currentData.description || stripHtml(currentData.description).trim() === '') {
            setError(`Description is required for ${formType} items.`);
            setLoading(false);
            return;
        }

        try {
            if (formType === 'news') {
                const result = await addNews(newsFormData);
                setSuccess(`News item "${result.title}" added successfully!`);
                setNewsFormData(initialNewsFormData);
                setNewsImagePreviews([]);
            } else {
                const result = await addEvent(eventFormData);
                setSuccess(`Event item "${result.title}" added successfully!`);
                setEventFormData(initialEventFormData);
                setEventImagePreviews([]);
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : `Failed to add ${formType} item.`);
            console.error(`Error adding ${formType}:`, err);
        } finally {
            setLoading(false);
        }
    };

    // --- Render Helpers ---
    const renderImageUploadSection = (formType: 'news' | 'event') => {
        const previews = formType === 'news' ? newsImagePreviews : eventImagePreviews;
        const currentFiles = formType === 'news' ? newsFormData.imageFiles : eventFormData.imageFiles;

        return (
            <div className="bg-gray-50 dark:bg-slate-800/50 p-4 rounded-xl border border-dashed border-gray-300 dark:border-gray-600">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">Upload Images</label>
                <div className="flex items-center justify-center w-full">
                    <label className={`flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 dark:bg-gray-700 dark:border-gray-600 dark:hover:border-gray-500 dark:hover:bg-gray-600 ${(currentFiles?.length || 0) >= MAX_IMAGES ? 'opacity-50 cursor-not-allowed' : ''}`}>
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                            <svg className="w-8 h-8 mb-4 text-gray-500 dark:text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16">
                                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2" />
                            </svg>
                            <p className="mb-2 text-sm text-gray-500 dark:text-gray-400"><span className="font-semibold">Click to upload</span></p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Select up to {MAX_IMAGES} images ({(currentFiles?.length || 0)} selected)</p>
                        </div>
                        <input
                            type="file"
                            className="hidden"
                            accept="image/*"
                            onChange={(e) => handleFileChange(e, formType)}
                            multiple
                            disabled={(currentFiles?.length || 0) >= MAX_IMAGES}
                        />
                    </label>
                </div>

                {previews.length > 0 && (
                    <div className="grid grid-cols-3 gap-2 mt-4">
                        {previews.map((previewSrc, index) => (
                            <div key={index} className="relative group aspect-square bg-gray-100 rounded-lg overflow-hidden">
                                <img src={previewSrc} alt={`Preview ${index + 1}`} className="w-full h-full object-cover" />
                                <button
                                    type="button"
                                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                    onClick={() => handleRemoveImage(index, formType)}
                                >
                                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        );
    };

    // --- Input Styles ---
    const inputClass = "w-full px-4 py-2 bg-white dark:bg-slate-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-gray-700 dark:text-gray-100 placeholder-gray-400";
    const labelClass = "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1";

    const renderNewsForm = () => (
        <form onSubmit={(e) => handleSubmit(e, 'news')} className="space-y-6 animate-fade-in-up">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-4">
                    <div>
                        <label className={labelClass}>Title</label>
                        <input type="text" name="title" value={newsFormData.title} onChange={(e) => handleInputChange(e, 'news')} required className={inputClass} />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className={labelClass}>Date</label>
                            <input type="date" name="date" value={newsFormData.date} onChange={(e) => handleInputChange(e, 'news')} required className={inputClass} />
                        </div>
                        <div>
                            <label className={labelClass}>Category</label>
                            <select name="category" value={newsFormData.category} onChange={(e) => handleInputChange(e, 'news')} required className={inputClass}>
                                {newsCategories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className={labelClass}>Description</label>
                        <div className="prose-editor dark:text-white">
                            <ReactQuill theme="snow" value={newsFormData.description} onChange={(content) => handleDescriptionChange(content, 'news')} modules={quillModules} formats={quillFormats} className="bg-white dark:bg-slate-800 rounded-lg overflow-hidden" />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className={labelClass}>Read Time</label>
                            <input type="text" name="readTime" value={newsFormData.readTime} onChange={(e) => handleInputChange(e, 'news')} placeholder="e.g., 5 min read" required className={inputClass} />
                        </div>
                        <div>
                            <label className={labelClass}>Details (Tags)</label>
                            <input type="text" name="tags" value={newsFormData.tags?.join(', ') || ''} onChange={(e) => handleInputChange(e, 'news')} placeholder="featured, innovation (comma separated)" className={inputClass} />
                        </div>
                    </div>

                    <div>
                        <label className={labelClass}>YouTube URL (optional)</label>
                        <input type="url" name="youtubeUrl" value={newsFormData.youtubeUrl || ''} onChange={(e) => handleInputChange(e, 'news')} placeholder="https://www.youtube.com/watch?v=..." className={inputClass} />
                    </div>

                    <div className="flex items-center space-x-2">
                        <input type="checkbox" id="newsFeatured" name="featured" checked={newsFormData.featured} onChange={(e) => handleInputChange(e, 'news')} className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600" />
                        <label htmlFor="newsFeatured" className="text-sm font-medium text-gray-900 dark:text-gray-300">Mark as Featured Item</label>
                    </div>
                </div>

                <div className="space-y-4">
                    {renderImageUploadSection('news')}
                </div>
            </div>

            <div className="pt-4 border-t border-gray-100 dark:border-gray-700">
                <button type="submit" disabled={loading} className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow-lg shadow-blue-500/30 transition-all flex items-center justify-center min-w-[160px]">
                    {loading ? (
                        <><svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>Saving...</>
                    ) : 'Publish News'}
                </button>
            </div>
        </form>
    );

    const renderEventForm = () => (
        <form onSubmit={(e) => handleSubmit(e, 'events')} className="space-y-6 animate-fade-in-up">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-4">
                    <div>
                        <label className={labelClass}>Title</label>
                        <input type="text" name="title" value={eventFormData.title} onChange={(e) => handleInputChange(e, 'event')} required className={inputClass} />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className={labelClass}>Date</label>
                            <input type="date" name="date" value={eventFormData.date} onChange={(e) => handleInputChange(e, 'event')} required className={inputClass} />
                        </div>
                        <div>
                            <label className={labelClass}>Time</label>
                            <input type="time" name="time" value={eventFormData.time} onChange={(e) => handleInputChange(e, 'event')} required className={inputClass} />
                        </div>
                    </div>

                    <div>
                        <label className={labelClass}>Venue</label>
                        <input type="text" name="venue" value={eventFormData.venue} onChange={(e) => handleInputChange(e, 'event')} required className={inputClass} />
                    </div>

                    <div>
                        <label className={labelClass}>Description</label>
                        <div className="prose-editor dark:text-white">
                            <ReactQuill theme="snow" value={eventFormData.description} onChange={(content) => handleDescriptionChange(content, 'event')} modules={quillModules} formats={quillFormats} className="bg-white dark:bg-slate-800 rounded-lg overflow-hidden" />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className={labelClass}>Capacity (optional)</label>
                            <input type="text" name="capacity" value={eventFormData.capacity} onChange={(e) => handleInputChange(e, 'event')} placeholder="e.g., 200 seats" className={inputClass} />
                        </div>
                        <div>
                            <label className={labelClass}>Details (Tags)</label>
                            <input type="text" name="tags" value={eventFormData.tags?.join(', ') || ''} onChange={(e) => handleInputChange(e, 'event')} placeholder="summit, workshop..." className={inputClass} />
                        </div>
                    </div>

                    <div>
                        <label className={labelClass}>Registration Link (optional)</label>
                        <input type="url" name="registrationLink" value={eventFormData.registrationLink} onChange={(e) => handleInputChange(e, 'event')} placeholder="https://example.com/register" className={inputClass} />
                    </div>

                    <div className="flex items-center space-x-2">
                        <input type="checkbox" id="eventFeatured" name="featured" checked={eventFormData.featured} onChange={(e) => handleInputChange(e, 'event')} className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600" />
                        <label htmlFor="eventFeatured" className="text-sm font-medium text-gray-900 dark:text-gray-300">Mark as Featured Event</label>
                    </div>
                </div>

                <div className="space-y-4">
                    {renderImageUploadSection('event')}
                </div>
            </div>

            <div className="pt-4 border-t border-gray-100 dark:border-gray-700">
                <button type="submit" disabled={loading} className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow-lg shadow-blue-500/30 transition-all flex items-center justify-center min-w-[160px]">
                    {loading ? (
                        <><svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>Saving...</>
                    ) : 'Publish Event'}
                </button>
            </div>
        </form>
    );

    return (
        <div className="w-full max-w-7xl mx-auto py-8 px-4">
            {/* --- Page Header --- */}
            <div className="mb-8 text-center">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Manage Content</h1>
                <p className="text-gray-500 dark:text-gray-400">Create new news articles or schedule upcoming events.</p>
            </div>

            {/* --- Alerts --- */}
            {error && (
                <div className="mb-6 p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 flex items-center justify-between animate-fade-in-down">
                    <span>{error}</span>
                    <button onClick={() => setError(null)} className="text-red-500 hover:text-red-700">&times;</button>
                </div>
            )}
            {success && (
                <div className="mb-6 p-4 rounded-xl bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-300 flex items-center justify-between animate-fade-in-down">
                    <span>{success}</span>
                    <button onClick={() => setSuccess(null)} className="text-green-500 hover:text-green-700">&times;</button>
                </div>
            )}

            {/* --- Tab Navigation --- */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-800 overflow-hidden min-h-[600px]">
                <div className="flex border-b border-gray-100 dark:border-gray-800">
                    <button
                        onClick={() => { setActiveTab('news'); setError(null); setSuccess(null); }}
                        className={`flex-1 py-4 text-center font-medium transition-colors border-b-2 ${activeTab === 'news' ? 'border-blue-600 text-blue-600 bg-blue-50/50 dark:bg-blue-900/10' : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-slate-800'}`}
                    >
                        Add News
                    </button>
                    <button
                        onClick={() => { setActiveTab('events'); setError(null); setSuccess(null); }}
                        className={`flex-1 py-4 text-center font-medium transition-colors border-b-2 ${activeTab === 'events' ? 'border-blue-600 text-blue-600 bg-blue-50/50 dark:bg-blue-900/10' : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-slate-800'}`}
                    >
                        Add Event
                    </button>
                </div>

                {/* --- Tab Content --- */}
                <div className="p-6 md:p-8">
                    {activeTab === 'news' ? renderNewsForm() : renderEventForm()}
                </div>
            </div>
        </div>
    );
};

export default NewsEventsAdmin;