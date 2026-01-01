import axios, { AxiosRequestConfig, AxiosError } from 'axios';

export const BACKEND_URL = import.meta.env.VITE_API_URL || "https://api.ethiopianitpark.et"; // Base URL for your backend

// Generic request function using axios
export async function request<T>(url: string, options: AxiosRequestConfig = {}): Promise<T> {
  try {
    const response = await axios({
      url: `${BACKEND_URL}/api${url}`,
      ...options,
      headers: {
        // Authorization headers or other common headers can be added here
        ...options.headers,
      },
    });
    return response.data as T;
  } catch (error) {
    const axiosError = error as AxiosError;
    if (axiosError.response) {
      const errorData = axiosError.response.data as { message?: string; error?: string };
      console.error('API Error Response:', errorData);
      throw new Error(errorData?.message || errorData?.error || `Request failed with status ${axiosError.response.status}`);
    } else if (axiosError.request) {
      console.error('API No Response:', axiosError.request);
      throw new Error('No response received from server. Please check your network connection and backend server.');
    } else {
      console.error('API Request Setup Error:', axiosError.message);
      throw new Error(axiosError.message || 'An unknown error occurred during the request setup.');
    }
  }
}

export interface NewsItem {
  id: number | string;
  title: string;
  date: string; // ISO string format expected from backend for date
  category: string;
  image: string[]; // Updated: Expect an array of image URLs from backend
  imageAltText?: string; // General alt text or for the primary image
  description: string;
  featured: boolean;
  readTime: string;
  youtubeUrl?: string;
  tags?: string[];
  comments?: number;
  createdAt?: string;
  updatedAt?: string; // Added based on your JSON response
}

export interface EventItem {
  id: number | string;
  title: string;
  date: string; // ISO string format expected from backend for date
  time: string;
  venue: string;
  image: string | null; // Updated: Expect a single image URL or null
  imageAltText?: string;
  description: string;
  featured: boolean;
  registrationLink: string;
  capacity: string;
  youtubeUrl?: string; // Added for consistency, though not in your event example
  tags?: string[];
  comments?: number;
  createdAt?: string;
  updatedAt?: string; // Added based on your JSON response (assuming events might have it too)
}

// FormData types for creating/updating posts
// NewsFormData now uses imageFiles for multiple image uploads
export type NewsFormData = Omit<NewsItem, 'id' | 'comments' | 'image' | 'createdAt' | 'updatedAt'> & {
  imageFiles?: File[]; // For multiple file uploads
};

export type EventFormData = Omit<EventItem, 'id' | 'comments' | 'image' | 'createdAt' | 'updatedAt'> & {
  imageFile?: File; // For single file upload
};

// --- MEDIA GALLERY API ---
export interface MediaItem {
  id: number | string;
  title: string;
  type: 'image' | 'video';
  src: string;
  date: string;
  category: string;
  description?: string;
  poster?: string;
}

export interface MediaFormData {
  title: string;
  date: string;
  category: string;
  type: 'image' | 'video';
  description?: string;
  mediaFiles?: File[]; // Support multiple files for batch upload
  posterFile?: File;
  youtubeUrl?: string;
  src?: string; // For video embed URL
}


// Helper to build FormData for News
const buildNewsFormData = (newsData: Partial<NewsFormData>): FormData => {
  const formData = new FormData();
  (Object.keys(newsData) as Array<keyof Partial<NewsFormData>>).forEach(key => {
    // Skip imageFiles and tags as they are handled separately
    if (key === 'imageFiles' || key === 'tags') return;

    const value = newsData[key];
    if (value !== undefined && value !== null) {
      if (key === 'youtubeUrl' && value === '') { // Don't append empty youtubeUrl
        return;
      }
      formData.append(key, typeof value === 'boolean' ? String(value) : String(value));
    }
  });

  if (newsData.tags && newsData.tags.length > 0) {
    newsData.tags.forEach(tag => formData.append('tags', tag));
  } else if (newsData.tags === undefined || (Array.isArray(newsData.tags) && newsData.tags.length === 0)) {
  }

  // Handle multiple image files for News
  if (newsData.imageFiles && newsData.imageFiles.length > 0) {
    newsData.imageFiles.forEach(file => {
      formData.append('newsImages', file, file.name); // Backend expects 'newsImages'
    });
  }
  return formData;
};

// Helper to build FormData for Events (remains for single image)
const buildEventFormData = (eventData: Partial<EventFormData>): FormData => {
  const formData = new FormData();
  (Object.keys(eventData) as Array<keyof Partial<EventFormData>>).forEach(key => {
    if (key === 'imageFile' || key === 'tags') return;
    const value = eventData[key];
    if (value !== undefined && value !== null) {
      if (typeof value === 'boolean') {
        formData.append(key, String(value));
      } else {
        formData.append(key, String(value));
      }
    }
  });
  if (eventData.tags && eventData.tags.length > 0) {
    eventData.tags.forEach(tag => formData.append('tags', tag));
  } else if (eventData.tags === undefined || (Array.isArray(eventData.tags) && eventData.tags.length === 0)) {
  }

  if (eventData.imageFile instanceof File) {
    formData.append('imageFile', eventData.imageFile, eventData.imageFile.name); // Backend expects 'imageFile' for events
  }
  return formData;
};

// --- NEWS API ---
export const getNews = async (): Promise<NewsItem[]> => {
  const response = await request<{ success: boolean, news: NewsItem[] }>('/news', { method: 'GET' });
  if (response.success) {
    return response.news.map(n => ({
      ...n,
      date: n.date ? n.date.split('T')[0] : '',
      tags: Array.isArray(n.tags) ? n.tags : [],
      image: Array.isArray(n.image) ? n.image : (n.image ? [n.image] : []),
    }));
  }
  throw new Error("Failed to fetch news or backend response was not successful.");
};

export const updateNewsItem = async (id: string | number, newsData: Partial<NewsFormData>): Promise<NewsItem> => {
  const formData = buildNewsFormData(newsData);
  const updatedItem = await request<NewsItem>(`/editNews/${id}`, {
    method: 'PUT',
    data: formData,
  });
  return {
    ...updatedItem,
    date: updatedItem.date ? updatedItem.date.split('T')[0] : '',
    tags: Array.isArray(updatedItem.tags) ? updatedItem.tags : [],
    image: Array.isArray(updatedItem.image) ? updatedItem.image : (updatedItem.image ? [updatedItem.image] : []),
  };
};

export const deleteNewsItem = async (id: string | number): Promise<void> => {
  await request<{ success: boolean, message?: string }>(`/deleteNews/${id}`, { method: 'DELETE' });
};

// --- EVENTS API ---
export const getEvents = async (): Promise<EventItem[]> => {
  const response = await request<{ success: boolean, events: EventItem[] }>('/events', { method: 'GET' });
  if (response.success) {
    return response.events.map(e => ({
      ...e,
      date: e.date ? e.date.split('T')[0] : '',
      tags: Array.isArray(e.tags) ? e.tags : [],
      image: e.image === "" ? null : e.image,
    }));
  }
  throw new Error("Failed to fetch events or backend response was not successful.");
};

export const updateEventItem = async (id: string | number, eventData: Partial<EventFormData>): Promise<EventItem> => {
  const formData = buildEventFormData(eventData);
  const updatedItem = await request<EventItem>(`/editEvent/${id}`, {
    method: 'PUT',
    data: formData,
  });
  return {
    ...updatedItem,
    date: updatedItem.date ? updatedItem.date.split('T')[0] : '',
    tags: Array.isArray(updatedItem.tags) ? updatedItem.tags : [],
    image: updatedItem.image === "" ? null : updatedItem.image,
  };
};

export const deleteEventItem = async (id: string | number): Promise<void> => {
  await request<{ success: boolean, message?: string }>(`/deleteEvent/${id}`, { method: 'DELETE' });
};

// --- CONTACT API ---
export interface ContactMessage {
  id: number;
  name: string;
  email: string;
  phone?: string;
  message: string;
  status: 'new' | 'read' | 'replied';
  created_at: string;
}

export const getContactMessages = async (): Promise<ContactMessage[]> => {
  const response = await request<{ success: boolean, data: ContactMessage[] }>('/admin/messages', { method: 'GET' });
  if (response.success) {
    return response.data;
  }
  throw new Error("Failed to fetch contact messages");
};

export const markMessageAsRead = async (id: number | string): Promise<void> => {
  await request<{ success: boolean, message: string }>(`/admin/messages/${id}/read`, { method: 'PUT' });
};

export const deleteContactMessage = async (id: number | string): Promise<void> => {
  await request<{ success: boolean, message: string }>(`/admin/messages/${id}`, { method: 'DELETE' });
};

// --- MEDIA API ---
export const getMediaItems = async (): Promise<MediaItem[]> => {
  const response = await request<{ success: boolean, mediaItems: MediaItem[] }>('/media', { method: 'GET' });
  if (response.success) {
    return response.mediaItems;
  }
  throw new Error("Failed to fetch media items");
};

export const addMediaItem = async (mediaData: MediaFormData): Promise<any> => {
  const formData = new FormData();
  formData.append('title', mediaData.title);
  formData.append('date', mediaData.date);
  formData.append('category', mediaData.category);
  formData.append('type', mediaData.type);
  if (mediaData.description) formData.append('description', mediaData.description);

  if (mediaData.type === 'image' && mediaData.mediaFiles) {
    mediaData.mediaFiles.forEach(file => {
      formData.append('mediaFile', file, file.name);
    });
  } else if (mediaData.type === 'video' && mediaData.src) {
    formData.append('src', mediaData.src);
    if (mediaData.youtubeUrl) formData.append('youtubeUrl', mediaData.youtubeUrl);
  }

  if (mediaData.posterFile) {
    formData.append('posterFile', mediaData.posterFile);
  }

  return request<any>('/media', {
    method: 'POST',
    data: formData,
  });
};