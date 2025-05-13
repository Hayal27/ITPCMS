import axios, { AxiosRequestConfig, AxiosError } from 'axios';

export const BACKEND_URL = "http://localhost:5001"; // Base URL for your backend

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
    // Backend expects 'tags' for each tag if sent as individual fields,
    // or a single 'tags' field if it's a JSON string or comma-separated.
    // Assuming backend from profileUploadController.js handles 'tags' as an array from FormData
    newsData.tags.forEach(tag => formData.append('tags', tag));
  } else if (newsData.tags === undefined || (Array.isArray(newsData.tags) && newsData.tags.length === 0)) {
    // If you need to explicitly send an empty array or clear tags,
    // your backend needs to handle an empty 'tags' field or absence of it.
    // formData.append('tags', ''); // This might be interpreted as one tag that is an empty string.
    // It's often better to just not send 'tags' if it's empty, unless backend requires it.
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
    // Similar consideration for empty tags as in buildNewsFormData
  }

  if (eventData.imageFile instanceof File) {
    formData.append('imageFile', eventData.imageFile, eventData.imageFile.name); // Backend expects 'imageFile' for events
  }
  return formData;
};

// --- NEWS API ---
// The addNews function would be in NewsEventsAdmin.tsx or similar, using buildNewsFormData
// This file primarily focuses on GET, PUT, DELETE for existing items.

export const getNews = async (): Promise<NewsItem[]> => {
  // The backend response structure for news items (item.image is string[])
  // is now correctly typed by NewsItem[]
  const response = await request<{ success: boolean, news: NewsItem[] }>('/news', { method: 'GET' });
  if (response.success) {
    // Ensure date is yyyy-mm-dd for date inputs, and tags/image are arrays
    return response.news.map(n => ({
        ...n, 
        date: n.date ? n.date.split('T')[0] : '', // Handle potentially null/undefined date
        tags: Array.isArray(n.tags) ? n.tags : [],
        image: Array.isArray(n.image) ? n.image : (n.image ? [n.image] : []), // Ensure image is always array
    }));
  }
  throw new Error("Failed to fetch news or backend response was not successful.");
};

export const updateNewsItem = async (id: string | number, newsData: Partial<NewsFormData>): Promise<NewsItem> => {
  const formData = buildNewsFormData(newsData); // Uses updated helper
  const updatedItem = await request<NewsItem>(`/editNews/${id}`, {
    method: 'PUT',
    data: formData,
  });
  // Ensure date is yyyy-mm-dd and image/tags are arrays after update
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
  // The backend response structure for event items (item.image is string | null)
  // is now correctly typed by EventItem[]
  const response = await request<{ success: boolean, events: EventItem[] }>('/events', { method: 'GET' });
  if (response.success) {
    // Ensure date is yyyy-mm-dd and tags is an array
    return response.events.map(e => ({
        ...e, 
        date: e.date ? e.date.split('T')[0] : '',
        tags: Array.isArray(e.tags) ? e.tags : [],
        // image is already string | null, no specific transformation needed here unless to ensure null for empty strings
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
   // Ensure date is yyyy-mm-dd and tags is an array after update
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

// Note: The addNews and addEvent functions that use NewsFormData/EventFormData
// are typically located in the component that handles the form submission (e.g., NewsEventsAdmin.tsx)
// and would use these buildFormData helpers. If you want them here, they would look like:

/*
export const addNewsItemAPI = async (newsData: NewsFormData): Promise<NewsItem> => {
  const formData = buildNewsFormData(newsData);
  // Assuming backend returns the created news item matching NewsItem structure
  const response = await request<{ success: boolean; message: string; newsId: number; imageUrls: string[]; youtubeUrl?: string }>('/news', {
    method: 'POST',
    data: formData,
  });
  // Construct a NewsItem-like object from response
  // This part depends heavily on the exact structure of your POST /news response
  return {
    id: response.newsId,
    title: newsData.title,
    date: newsData.date.split('T')[0],
    category: newsData.category,
    image: response.imageUrls, // from backend
    description: newsData.description,
    featured: newsData.featured,
    readTime: newsData.readTime,
    tags: newsData.tags,
    youtubeUrl: response.youtubeUrl || newsData.youtubeUrl,
    // createdAt, updatedAt would typically come from the backend response if needed
  };
};

export const addEventItemAPI = async (eventData: EventFormData): Promise<EventItem> => {
  const formData = buildEventFormData(eventData);
  // Assuming backend returns the created event item matching EventItem structure
  const response = await request<{ success: boolean; message: string; eventId: number; imageUrl: string | null; }>('/events', {
    method: 'POST',
    data: formData,
  });
  // Construct an EventItem-like object from response
  return {
    id: response.eventId,
    title: eventData.title,
    date: eventData.date.split('T')[0],
    time: eventData.time,
    venue: eventData.venue,
    image: response.imageUrl, // from backend
    description: eventData.description,
    featured: eventData.featured,
    registrationLink: eventData.registrationLink,
    capacity: eventData.capacity,
    tags: eventData.tags,
    // createdAt, updatedAt would typically come from the backend response if needed
  };
};
*/