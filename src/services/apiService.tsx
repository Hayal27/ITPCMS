import axios, { AxiosRequestConfig, AxiosError } from 'axios';

export const BACKEND_URL = "http://localhost:5005"; // Base URL for your backend

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

// Helper to ensure image URLs are fully qualified
export const fixImageUrl = (url: string | null | undefined): string | null => {
  if (!url) return null;
  if (url.startsWith('http')) return url;
  if (url.startsWith('/uploads')) return `${BACKEND_URL}${url}`;
  return url;
};

export const getFullImageUrl = (baseUrl: string, imagePath?: string): string | undefined => {
  return fixImageUrl(imagePath) || undefined;
};

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
      image: Array.isArray(n.image)
        ? n.image.map(img => fixImageUrl(img) as string)
        : (n.image ? [fixImageUrl(n.image) as string] : []),
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
      image: fixImageUrl(e.image),
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

// --- INVESTOR INQUIRY API ---
export interface InvestorInquiry {
  id: number;
  full_name: string;
  email: string;
  organization?: string;
  area_of_interest?: string;
  status: 'pending' | 'read' | 'archived';
  created_at: string;
}

export const getInvestorInquiries = async (): Promise<InvestorInquiry[]> => {
  const response = await request<{ success: boolean, data: InvestorInquiry[] }>('/investor-inquiries/admin/inquiries', { method: 'GET' });
  if (response.success) {
    return response.data;
  }
  throw new Error("Failed to fetch investor inquiries");
};

// --- MEDIA API ---
export const getMediaItems = async (): Promise<MediaItem[]> => {
  const response = await request<{ success: boolean, mediaItems: MediaItem[] }>('/media', { method: 'GET' });
  if (response.success) {
    return response.mediaItems.map(item => ({
      ...item,
      src: fixImageUrl(item.src) as string,
      poster: fixImageUrl(item.poster) as string,
    }));
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

  if (mediaData.type === 'image' && mediaData.mediaFiles && mediaData.mediaFiles.length > 0) {
    mediaData.mediaFiles.forEach(file => {
      formData.append('mediaFiles', file, file.name); // Corrected key to 'mediaFiles'
    });
  } else if (mediaData.type === 'video') {
    if (mediaData.src) formData.append('src', mediaData.src);
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

export const updateMediaItem = async (id: number | string, mediaData: Partial<MediaFormData>): Promise<any> => {
  const formData = new FormData();
  if (mediaData.title) formData.append('title', mediaData.title);
  if (mediaData.date) formData.append('date', mediaData.date);
  if (mediaData.category) formData.append('category', mediaData.category);
  if (mediaData.type) formData.append('type', mediaData.type);
  if (mediaData.description) formData.append('description', mediaData.description);

  if (mediaData.type === 'image' && mediaData.mediaFiles && mediaData.mediaFiles.length > 0) {
    formData.append('mediaFiles', mediaData.mediaFiles[0]); // Update usually only takes one file
  } else if (mediaData.type === 'video') {
    if (mediaData.src) formData.append('src', mediaData.src);
    if (mediaData.youtubeUrl) formData.append('youtubeUrl', mediaData.youtubeUrl);
  }

  if (mediaData.posterFile) {
    formData.append('posterFile', mediaData.posterFile);
  }

  return request<any>(`/mediaup/${id}`, {
    method: 'PUT',
    data: formData,
  });
};

export const deleteMediaItem = async (id: number | string): Promise<void> => {
  await request<any>(`/media/${id}`, { method: 'DELETE' });
};

/* --- USER & ROLE API --- */

export interface Role {
  role_id: number;
  role_name: string;
  status: number;
}

export interface Department {
  department_id: number;
  name: string;
}

export interface User {
  user_id: number;
  user_name: string;
  role_id: number;
  status: number | string;
  created_at: string;
  name?: string;
  fname?: string;
  lname?: string;
  email?: string;
  phone?: string;
  role_name?: string;
  department_id?: number;
}

export const getUsers = async (): Promise<User[]> => {
  return request<User[]>('/users', { method: 'GET' });
};

export const addUser = async (userData: any): Promise<any> => {
  return request('/addUser', {
    method: 'POST',
    data: userData,
  });
};

export const updateUser = async (userId: number | string, userData: any): Promise<any> => {
  return request(`/updateUser/${userId}`, {
    method: 'PUT',
    data: userData,
  });
};

export const deleteUser = async (userId: number): Promise<void> => {
  await request<{ success: boolean }>(`/users/${userId}`, { method: 'DELETE' });
};

// --- BOARD MEMBERS & WHO WE ARE API ---
export interface BoardMember {
  id: number;
  name: string;
  english_name?: string;
  position?: string;
  bio?: string;
  image_url?: string;
  linkedin?: string;
  twitter?: string;
  order_index: number;
}

export interface WhoWeAreSection {
  id: number;
  section_type: 'hero' | 'section' | 'features' | 'voice' | 'cta';
  title?: string;
  subtitle?: string;
  content?: string;
  image_url?: string;
  order_index: number;
  is_active: boolean;
}

export const getBoardMembers = async (): Promise<BoardMember[]> => {
  const response = await request<{ success: boolean, boardMembers: BoardMember[] }>('/about/board-members', { method: 'GET' });
  if (response.success) {
    return response.boardMembers.map(member => ({
      ...member,
      image_url: fixImageUrl(member.image_url) as string
    }));
  }
  throw new Error("Failed to fetch board members");
};

export const addBoardMember = async (memberData: Partial<BoardMember> | FormData): Promise<any> => {
  const isFormData = memberData instanceof FormData;
  return request<any>('/about/board-members', {
    method: 'POST',
    headers: isFormData ? {} : { 'Content-Type': 'application/json' },
    data: memberData,
  });
};

export const updateBoardMember = async (id: number, memberData: Partial<BoardMember> | FormData): Promise<any> => {
  const isFormData = memberData instanceof FormData;
  return request<any>(`/about/board-members/${id}`, {
    method: 'PUT',
    headers: isFormData ? {} : { 'Content-Type': 'application/json' },
    data: memberData,
  });
};

export const deleteBoardMember = async (id: number): Promise<void> => {
  await request<any>(`/about/board-members/${id}`, { method: 'DELETE' });
};

export const getWhoWeAreSections = async (): Promise<WhoWeAreSection[]> => {
  const response = await request<{ success: boolean, sections: WhoWeAreSection[] }>('/about/who-we-are', { method: 'GET' });
  if (response.success) {
    return response.sections.map(section => ({
      ...section,
      image_url: fixImageUrl(section.image_url) as string
    }));
  }
  throw new Error("Failed to fetch who we are sections");
};

export const addWhoWeAreSection = async (sectionData: Partial<WhoWeAreSection>): Promise<any> => {
  return request<any>('/about/who-we-are', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    data: sectionData,
  });
};

export const updateWhoWeAreSection = async (id: number, sectionData: Partial<WhoWeAreSection>): Promise<any> => {
  return request<any>(`/about/who-we-are/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    data: sectionData,
  });
};

export const deleteWhoWeAreSection = async (id: number): Promise<void> => {
  await request<any>(`/about/who-we-are/${id}`, { method: 'DELETE' });
};

export const changeUserStatus = async (userId: number | string, status: number | string): Promise<any> => {
  return request(`/${userId}/status`, {
    method: 'PUT',
    data: { status },
  });
};

export const getRoles = async (): Promise<Role[]> => {
  return request<Role[]>('/roles', { method: 'GET' });
};

export const createRole = async (roleData: { role_name: string }): Promise<any> => {
  return request('/roles', {
    method: 'POST',
    data: roleData,
  });
};

export const updateRole = async (roleId: number | string, roleData: { role_name: string, status: number }): Promise<any> => {
  return request(`/roles/${roleId}`, {
    method: 'PUT',
    data: roleData,
  });
};

export const deleteRole = async (roleId: number | string): Promise<any> => {
  return request(`/roles/${roleId}`, { method: 'DELETE' });
};

export const getDepartments = async (): Promise<Department[]> => {
  return request<Department[]>('/department', { method: 'GET' });
};

// --- MENU & PERMISSIONS API ---
export interface Menu {
  id: number;
  title: string;
  path?: string;
  icon?: string;
  color?: string;
  parent_id?: number | null;
  order_index: number;
  is_section: boolean;
  is_dropdown: boolean;
  is_active: boolean;
}

export const getMyNavigation = async (): Promise<Menu[]> => {
  const response = await request<{ success: boolean, data: Menu[] }>('/menus/my-nav', { method: 'GET' });
  return response.data;
};

export const getAllMenus = async (): Promise<Menu[]> => {
  const response = await request<{ success: boolean, data: Menu[] }>('/menus/all', { method: 'GET' });
  return response.data;
};

export const createMenu = async (formData: any): Promise<any> => {
  return request('/menus/create', { method: 'POST', data: formData });
};

export const updateMenu = async (id: number, formData: any): Promise<any> => {
  return request(`/menus/${id}`, { method: 'PUT', data: formData });
};

export const deleteMenu = async (id: number): Promise<any> => {
  return request(`/menus/${id}`, { method: 'DELETE' });
};

export const getRolePermissions = async (roleId: number): Promise<number[]> => {
  const response = await request<{ success: boolean, data: number[] }>(`/menus/role/${roleId}`, { method: 'GET' });
  return response.data;
};

export const updateRolePermissions = async (roleId: number, menuIds: number[]): Promise<any> => {
  return request(`/menus/role/${roleId}`, { method: 'POST', data: { menu_ids: menuIds } });
};

export const getUserPermissions = async (userId: number): Promise<{ menu_id: number, permission_type: string }[]> => {
  const response = await request<{ success: boolean, data: { menu_id: number, permission_type: string }[] }>(`/menus/user/${userId}`, { method: 'GET' });
  return response.data;
};

export const updateUserPermissions = async (userId: number, permissions: { menu_id: number, permission_type: string }[]): Promise<any> => {
  return request(`/menus/user/${userId}`, { method: 'POST', data: { permissions } });
};
