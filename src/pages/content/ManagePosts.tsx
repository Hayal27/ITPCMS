// src/pages/content/ManagePosts.tsx
import React, { useState, useEffect, useCallback, useMemo, ChangeEvent, FormEvent } from 'react';
import { Container, Row, Col, Tabs, Tab, Spinner, Alert, Card, Fade, Button, Table, Badge, Form, Modal, ListGroup, InputGroup, Dropdown } from 'react-bootstrap';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import axios, { AxiosRequestConfig, AxiosError } from 'axios'; 

import { newsCategories, stripHtml } from './NewsEventsAdmin';
import SearchBarAndFilters from '../../components/ManagePosts/SearchBarAndFilters'; 
import './NewsEventsAdmin.css'; 

// --- START: Inlined API Service Content ---

export const BACKEND_URL = "http://localhost:5001"; // Base URL for your backend

// Generic request function using axios
export async function request<T>(url: string, options: AxiosRequestConfig = {}): Promise<T> {
  try {
    const response = await axios({
      url: `${BACKEND_URL}/api${url}`,
      ...options,
      headers: {
        ...options.headers,
      },
    });
    return response.data as T;
  } catch (error) {
    const axiosError = error as AxiosError;
    if (axiosError.response) {
      const errorData = axiosError.response.data as { success?: boolean; message?: string; error?: string };
      console.error('API Error Response:', errorData);
      if (errorData.success === false && errorData.message) {
        throw new Error(errorData.message);
      }
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

// --- Data Interfaces ---
export interface Comment {
  id: string | number;
  postId: string | number;
  name: string;
  email?: string; 
  text: string;
  date: string; // ISO string
  parentId?: string | number | null;
  replies?: Comment[];
  approved: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface NewCommentData { // For admin submitting new replies
  postId: string | number;
  text: string;
  parentId?: string | number | null;
}

export interface NewsItem {
  id: number | string;
  title: string;
  date: string; 
  category: string;
  image: string[]; 
  imageAltText?: string; 
  description: string;
  featured: boolean;
  readTime: string;
  youtubeUrl?: string;
  tags?: string[];
  comments?: number; // Original total count from backend if available
  commentsCount?: number; // Processed total comments count
  approvedCommentsCount?: number; // Count of approved comments
  pendingCommentsCount?: number; // Count of pending comments
  commentsData?: Comment[]; 
  createdAt?: string;
  updatedAt?: string; 
}

export interface EventItem {
  id: number | string;
  title: string;
  date: string; 
  time: string;
  venue: string;
  image: string | null; 
  imageAltText?: string;
  description: string;
  featured: boolean;
  registrationLink: string;
  capacity: string;
  youtubeUrl?: string; 
  tags?: string[];
  comments?: number; 
  createdAt?: string;
  updatedAt?: string; 
}

export type NewsFormData = Omit<NewsItem, 'id' | 'comments' | 'commentsCount' | 'approvedCommentsCount' | 'pendingCommentsCount' | 'commentsData' | 'image' | 'createdAt' | 'updatedAt'> & { 
  imageFiles?: File[]; 
};

export type EventFormData = Omit<EventItem, 'id' | 'comments' | 'image' | 'createdAt' | 'updatedAt'> & { 
  imageFile?: File; 
};


// Helper to build FormData for News
const buildNewsFormData = (newsData: Partial<NewsFormData>): FormData => {
  const formData = new FormData();
  (Object.keys(newsData) as Array<keyof Partial<NewsFormData>>).forEach(key => {
    if (key === 'imageFiles' || key === 'tags') return;

    const value = newsData[key];
    if (value !== undefined && value !== null) {
      if (key === 'youtubeUrl' && value === '') { 
        return;
      }
      formData.append(key, typeof value === 'boolean' ? String(value) : String(value));
    }
  });

  if (newsData.tags && newsData.tags.length > 0) {
    newsData.tags.forEach(tag => formData.append('tags', tag));
  }
  
  if (newsData.imageFiles && newsData.imageFiles.length > 0) {
    newsData.imageFiles.forEach(file => {
      formData.append('newsImages', file, file.name); 
    });
  }
  return formData;
};

// Helper to build FormData for Events
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
  }

  if (eventData.imageFile instanceof File) {
    formData.append('imageFile', eventData.imageFile, eventData.imageFile.name); 
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
        // These counts will be initially set from backend, then potentially overridden by frontend calculation
        commentsCount: n.commentsCount !== undefined ? n.commentsCount : (n.comments || 0),
        approvedCommentsCount: n.approvedCommentsCount !== undefined ? n.approvedCommentsCount : 0,
        pendingCommentsCount: n.pendingCommentsCount !== undefined ? n.pendingCommentsCount : 0,
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
  // Note: After an update, the counts might be stale until a full refresh with comment fetching.
  // Or, the backend could return the updated item with fresh counts.
  return {
      ...updatedItem, 
      date: updatedItem.date ? updatedItem.date.split('T')[0] : '',
      tags: Array.isArray(updatedItem.tags) ? updatedItem.tags : [],
      image: Array.isArray(updatedItem.image) ? updatedItem.image : (updatedItem.image ? [updatedItem.image] : []),
      commentsCount: updatedItem.commentsCount !== undefined ? updatedItem.commentsCount : (updatedItem.comments || 0),
      approvedCommentsCount: updatedItem.approvedCommentsCount !== undefined ? updatedItem.approvedCommentsCount : 0,
      pendingCommentsCount: updatedItem.pendingCommentsCount !== undefined ? updatedItem.pendingCommentsCount : 0,
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

// --- COMMENTS API ---
export const getCommentsForPost = async (postId: string | number): Promise<Comment[]> => {
  const response = await request<{ success: boolean, comments: Comment[] }>(`/news/${postId}/comments`, { method: 'GET' });
  if (response.success && Array.isArray(response.comments)) {
    const mapComments = (comments: Comment[]): Comment[] => {
        return comments.map(c => ({
            ...c,
            replies: c.replies && c.replies.length > 0 ? mapComments(c.replies) : [],
            date: c.date 
        })).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    };
    return mapComments(response.comments);
  }
  // If response.success is false but response.message exists, use it.
  throw new Error(response.message || "Failed to fetch comments or invalid data format.");
};

export const addAdminReply = async (replyData: NewCommentData): Promise<Comment> => {
  const response = await request<Comment>(`/news/${replyData.postId}/comments`, {
    method: 'POST',
    data: { 
      ...replyData, 
      name: "Admin", 
      email: "admin@itpark.com", 
      approved: true, 
    },
  });
  return { ...response, replies: response.replies || [] };
};

export const toggleCommentApproval = async (commentId: string | number, currentStatus: boolean): Promise<Comment> => {
  const response = await request<Comment>(`/comments/${commentId}/approve`, {
    method: 'PUT', 
    data: { approved: !currentStatus },
  });
   return { ...response, replies: response.replies || [] };
};

export const deleteCommentAdmin = async (commentId: string | number): Promise<void> => {
  await request<{ success: boolean, message?: string }>(`/comments/${commentId}`, { method: 'DELETE' });
};

// --- END: Inlined API Service Content ---

type ItemType = 'news' | 'event';

// --- START: New Utility function for calculating comment counts ---
interface CommentCounts {
  totalComments: number;
  approvedComments: number;
  pendingComments: number;
}

export const calculateCommentCounts = (comments: Comment[] | undefined): CommentCounts => {
  if (!comments || comments.length === 0) {
    return { totalComments: 0, approvedComments: 0, pendingComments: 0 };
  }
  let total = 0;
  let approved = 0;

  const countRecursive = (commentList: Comment[]): void => {
    for (const c of commentList) {
      total++;
      if (c.approved) {
        approved++;
      }
      if (c.replies && c.replies.length > 0) {
        countRecursive(c.replies);
      }
    }
  };
  countRecursive(comments);
  return {
    totalComments: total,
    approvedComments: approved,
    pendingComments: total - approved,
  };
};
// --- END: New Utility function for calculating comment counts ---


export const getYouTubeEmbedUrl = (url: string): string | null => {
  if (!url) return null;
  let videoId = null;
  try {
    const urlObj = new URL(url); 
    if (urlObj.hostname === 'youtu.be') {
      videoId = urlObj.pathname.slice(1).split('?')[0];
    } else if (urlObj.hostname.includes('youtube.com')) {
      if (urlObj.pathname === '/watch') {
        videoId = urlObj.searchParams.get('v');
      } else if (urlObj.pathname.startsWith('/embed/')) {
        videoId = urlObj.pathname.split('/embed/')[1].split('?')[0];
      } else if (urlObj.pathname.startsWith('/shorts/')) {
         videoId = urlObj.pathname.split('/shorts/')[1].split('?')[0];
      }
    }
    return videoId ? `https://www.youtube.com/embed/${videoId}` : null;
  } catch (e) {
    console.warn("Invalid YouTube URL:", url, e);
    return null;
  }
};

const MAX_NEWS_IMAGES_EDIT = 5; 

const quillModules = {
  toolbar: [
    [{ 'header': '1'}, {'header': '2'}, { 'font': [] }],
    [{size: []}],
    ['bold', 'italic', 'underline', 'strike', 'blockquote'],
    [{'list': 'ordered'}, {'list': 'bullet'}, 
     {'indent': '-1'}, {'indent': '+1'}],
    ['link', 'image', 'video'],
    ['clean']
  ],
  clipboard: {
    matchVisual: false,
  }
};

const quillFormats = [
  'header', 'font', 'size',
  'bold', 'italic', 'underline', 'strike', 'blockquote',
  'list', 'bullet', 'indent',
  'link', 'image', 'video'
];

// --- Props Interfaces for Inlined Components ---
interface PostsTableProps<T extends NewsItem | EventItem> {
  items: T[];
  itemType: ItemType;
  onEdit: (item: T, type: ItemType) => void;
  onDelete: (item: T, type: ItemType) => void;
  onManageComments: (item: NewsItem) => void; 
  getYouTubeEmbedUrl: (url: string) => string | null;
}

interface EditPostModalProps {
  show: boolean;
  onHide: () => void;
  item: NewsItem | EventItem | null;
  itemType: ItemType | null;
  onSubmit: (formData: Partial<NewsFormData> | Partial<EventFormData>, type: ItemType) => void;
  loading: boolean;
  error: string | null;
  clearError: () => void;
}

interface DeleteConfirmationModalProps {
  show: boolean;
  onHide: () => void;
  onConfirm: () => void;
  itemName?: string | null;
  loading: boolean;
  error: string | null;
  clearError: () => void;
}

interface ManageCommentsModalProps {
  show: boolean;
  onHide: () => void;
  newsItem: NewsItem | null;
  onCommentsUpdated: (postId: string | number) => void; 
}


// --- Inlined PostsTable Component ---
const PostsTable = <T extends NewsItem | EventItem>({
  items,
  itemType,
  onEdit,
  onDelete,
  onManageComments, 
  getYouTubeEmbedUrl,
}: PostsTableProps<T>) => {
  const isNewsItem = (item: NewsItem | EventItem): item is NewsItem => itemType === 'news';

  return (
    <Table striped bordered hover responsive="sm" className="mt-3 posts-table">
      <thead>
        <tr>
          <th style={{ width: '100px' }}>Image</th>
          <th>Title</th>
          <th>Date</th>
          {itemType === 'news' && <th>Category</th>}
          {itemType === 'event' && <><th>Time</th><th>Venue</th></>}
          <th>Featured</th>
          <th>YouTube</th>
          {itemType === 'news' && <th style={{width: '180px'}}>Comment Status</th>}
          <th style={{width: '150px'}}>Actions</th>
        </tr>
      </thead>
      <tbody>
        {items.map(item => (
          <tr key={item.id}>
            <td>
              {isNewsItem(item) && (item as NewsItem).image && (item as NewsItem).image.length > 0 ? (
                <div style={{ position: 'relative', width: '90px', height: '65px', margin: 'auto' }}>
                  <img
                    src={(item as NewsItem).image[0]} 
                    alt={(item as NewsItem).imageAltText || item.title}
                    style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '4px' }}
                  />
                  {(item as NewsItem).image.length > 1 && (
                    <Badge 
                      pill bg="dark" 
                      style={{ position: 'absolute', bottom: '5px', right: '5px', fontSize: '0.6rem', opacity: 0.85 }}
                      title={`${(item as NewsItem).image.length} images total`}
                    >
                      1 / {(item as NewsItem).image.length}
                    </Badge>
                  )}
                </div>
              ) : !isNewsItem(item) && (item as EventItem).image ? (
                <img
                  src={(item as EventItem).image as string} 
                  alt={(item as EventItem).imageAltText || item.title}
                  style={{ width: '90px', height: 'auto', maxHeight: '65px', objectFit: 'cover', borderRadius: '4px', margin: 'auto', display: 'block' }}
                />
              ) : (
                <span className="text-muted small" style={{ display: 'block', textAlign: 'center' }}>No Image</span>
              )}
            </td>
            <td>{item.title}</td>
            <td>{new Date(item.date).toLocaleDateString()}</td>
            {isNewsItem(item) && <td>{(item as NewsItem).category}</td>}
            {itemType === 'event' && (
              <>
                <td>{(item as EventItem).time}</td>
                <td>{(item as EventItem).venue}</td>
              </>
            )}
            <td>{item.featured ? <Badge bg="success">Yes</Badge> : <Badge bg="secondary">No</Badge>}</td>
            <td>
              {item.youtubeUrl && getYouTubeEmbedUrl(item.youtubeUrl) ? (
                <a href={item.youtubeUrl} target="_blank" rel="noopener noreferrer" title="Watch on YouTube">
                  <i className="bi bi-youtube text-danger me-1"></i> View
                </a>
              ) : (
                '-'
              )}
            </td>
            {isNewsItem(item) && (
              <td className="text-center">
                <div className="mb-1">
                  <Badge pill bg="success" className="me-1 fs-7" title="Approved Comments">
                    <i className="bi bi-check-circle me-1"></i>
                    {(item as NewsItem).approvedCommentsCount ?? 0}
                  </Badge>
                  <Badge pill bg="warning" text="dark" className="fs-7" title="Pending Comments">
                    <i className="bi bi-hourglass-split me-1"></i>
                    {(item as NewsItem).pendingCommentsCount ?? 0}
                  </Badge>
                </div>
                <Button variant="outline-info" size="sm" onClick={() => onManageComments(item as NewsItem)} title="Manage All Comments">
                  <i className="bi bi-chat-dots"></i> <span className="d-none d-lg-inline">Manage</span>
                </Button>
              </td>
            )}
            <td>
              <Button
                variant="outline-primary"
                size="sm"
                onClick={() => onEdit(item, itemType)}
                className="me-2 mb-1 mb-md-0 action-button"
                title="Edit item"
              >
                <i className="bi bi-pencil-square"></i> <span className="d-none d-md-inline">Edit</span>
              </Button>
              <Button
                variant="outline-danger"
                size="sm"
                onClick={() => onDelete(item, itemType)}
                className="action-button"
                title="Delete item"
              >
                <i className="bi bi-trash"></i> <span className="d-none d-md-inline">Delete</span>
              </Button>
            </td>
          </tr>
        ))}
      </tbody>
    </Table>
  );
};

// --- Inlined EditPostModal Component ---
const EditPostModal: React.FC<EditPostModalProps> = ({
  show,
  onHide,
  item,
  itemType,
  onSubmit,
  loading,
  error,
  clearError,
}) => {
  const [formData, setFormData] = useState<Partial<NewsFormData> | Partial<EventFormData>>({});
  const [imagePreview, setImagePreview] = useState<string | null>(null); 
  const [newNewsImagePreviews, setNewNewsImagePreviews] = useState<string[]>([]);
  const [imageDimensions, setImageDimensions] = useState<{ width: number; height: number } | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);


  useEffect(() => {
    if (item && itemType) {
      clearError();
      setValidationError(null); 
      let initialImagePreview: string | null = null;

      if (itemType === 'news') {
        const news = item as NewsItem;
        setFormData({
          title: news.title,
          date: news.date?.split('T')[0] || '', 
          category: news.category,
          description: news.description,
          featured: news.featured,
          readTime: news.readTime,
          tags: news.tags || [],
          youtubeUrl: news.youtubeUrl || '',
          imageAltText: news.imageAltText || '',
        });
        if (news.image && news.image.length > 0) {
          initialImagePreview = news.image[0]; 
        }
      } else { 
        const event = item as EventItem;
        setFormData({
          title: event.title,
          date: event.date?.split('T')[0] || '',
          time: event.time,
          venue: event.venue,
          description: event.description,
          featured: event.featured,
          registrationLink: event.registrationLink,
          capacity: event.capacity,
          tags: event.tags || [],
          youtubeUrl: event.youtubeUrl || '',
          imageAltText: event.imageAltText || '',
        });
        initialImagePreview = event.image || null; 
      }
      setImagePreview(initialImagePreview);
      setNewNewsImagePreviews([]); 
      setImageDimensions(null); 
    } else {
      setFormData({});
      setImagePreview(null);
      setNewNewsImagePreviews([]);
      setImageDimensions(null);
      setValidationError(null);
    }
  }, [item, itemType, show, clearError]);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const { checked } = e.target as HTMLInputElement;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else if (name === 'tags') {
      setFormData(prev => ({ ...prev, tags: value.split(',').map(tag => tag.trim()).filter(tag => tag) }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleDescriptionChange = (content: string) => {
    setFormData(prev => ({ ...prev, description: content }));
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    setImageDimensions(null); 
    setValidationError(null); 

    if (itemType === 'news') {
      if (files && files.length > 0) {
        const fileArray = Array.from(files).slice(0, MAX_NEWS_IMAGES_EDIT); 
        setFormData(prev => ({ ...prev, imageFiles: fileArray } as Partial<NewsFormData>));
        
        const previewsPromises = fileArray.map(file => {
          return new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result as string);
            reader.onerror = reject;
            reader.readAsDataURL(file);
          });
        });

        Promise.all(previewsPromises).then(generatedPreviews => {
          setNewNewsImagePreviews(generatedPreviews);
          setImagePreview(generatedPreviews[0] || null); 
          if (generatedPreviews[0]) {
            const img = new Image();
            img.onload = () => setImageDimensions({ width: img.width, height: img.height });
            img.src = generatedPreviews[0];
          }
        }).catch(err => console.error("Error generating news previews:", err));

      } else { 
        setFormData(prev => {
          const { imageFiles, ...rest } = prev as Partial<NewsFormData>; 
          return rest;
        });
        setNewNewsImagePreviews([]);
        const newsItem = item as NewsItem;
        setImagePreview(newsItem?.image?.[0] || null); 
      }
    } else { 
      const file = files?.[0];
      if (file) {
        setFormData(prev => ({ ...prev, imageFile: file } as Partial<EventFormData>));
        const reader = new FileReader();
        reader.onloadend = () => {
          const resultStr = reader.result as string;
          setImagePreview(resultStr);
          const img = new Image();
          img.onload = () => setImageDimensions({ width: img.width, height: img.height });
          img.src = resultStr;
        };
        reader.readAsDataURL(file);
      } else {
        setFormData(prev => {
            const { imageFile, ...rest } = prev as Partial<EventFormData>; 
            return rest;
        });
        const eventItem = item as EventItem;
        setImagePreview(eventItem?.image || null);
      }
    }
    if (e.target) e.target.value = ''; 
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!itemType) return;

    clearError(); 
    setValidationError(null); 

    if (!formData.description || stripHtml(formData.description).trim() === '') {
        setValidationError("Description is required.");
        return;
    }
    onSubmit(formData, itemType);
  };
  
  if (!item || !itemType) return null;
  const isNews = itemType === 'news';

  const currentNewsPreviews = newNewsImagePreviews.length > 0 
    ? newNewsImagePreviews 
    : (isNews && (item as NewsItem).image && (item as NewsItem).image.length > 0 ? (item as NewsItem).image : []);


  return (
    <Modal show={show} onHide={onHide} size="lg" backdrop="static" keyboard={false}>
      <Modal.Header closeButton>
        <Modal.Title>Edit {isNews ? 'News' : 'Event'} Item: {item.title}</Modal.Title>
      </Modal.Header>
      <Modal.Body style={{ maxHeight: '75vh', overflowY: 'auto' }}>
        {error && <Alert variant="danger" onClose={clearError} dismissible>{error}</Alert>}
        {validationError && <Alert variant="warning" onClose={() => setValidationError(null)} dismissible>{validationError}</Alert>}
        
        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3" controlId="editTitle">
            <Form.Label>Title</Form.Label>
            <Form.Control type="text" name="title" value={formData.title || ''} onChange={handleInputChange} required />
          </Form.Group>

          <Row>
            <Col md={isNews ? 12 : 6}>
              <Form.Group className="mb-3" controlId="editDate">
                <Form.Label>Date</Form.Label>
                <Form.Control type="date" name="date" value={formData.date || ''} onChange={handleInputChange} required />
              </Form.Group>
            </Col>
            {!isNews && ( 
              <Col md={6}>
                <Form.Group className="mb-3" controlId="editTime">
                  <Form.Label>Time</Form.Label>
                  <Form.Control type="time" name="time" value={(formData as Partial<EventFormData>).time || ''} onChange={handleInputChange} required />
                </Form.Group>
              </Col>
            )}
          </Row>
          
          {isNews && (
            <>
              <Form.Group className="mb-3" controlId="editCategory">
                <Form.Label>Category</Form.Label>
                <Form.Select name="category" value={(formData as Partial<NewsFormData>).category || ''} onChange={handleInputChange} required>
                  <option value="">Select Category</option>
                  {newsCategories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                </Form.Select>
              </Form.Group>
              <Form.Group className="mb-3" controlId="editReadTime">
                <Form.Label>Read Time (e.g., 5 min read)</Form.Label>
                <Form.Control type="text" name="readTime" value={(formData as Partial<NewsFormData>).readTime || ''} onChange={handleInputChange} required />
              </Form.Group>
            </>
          )}

          {!isNews && (
            <>
              <Form.Group className="mb-3" controlId="editVenue">
                <Form.Label>Venue</Form.Label>
                <Form.Control type="text" name="venue" value={(formData as Partial<EventFormData>).venue || ''} onChange={handleInputChange} required />
              </Form.Group>
              <Form.Group className="mb-3" controlId="editCapacity">
                <Form.Label>Capacity (e.g., 100, Unlimited)</Form.Label>
                <Form.Control type="text" name="capacity" value={(formData as Partial<EventFormData>).capacity || ''} onChange={handleInputChange} required />
              </Form.Group>
              <Form.Group className="mb-3" controlId="editRegistrationLink">
                <Form.Label>Registration Link</Form.Label>
                <Form.Control type="url" name="registrationLink" placeholder="https://example.com/register" value={(formData as Partial<EventFormData>).registrationLink || ''} onChange={handleInputChange} />
              </Form.Group>
            </>
          )}

          <Form.Group className="mb-3" controlId="editDescription">
            <Form.Label>Description</Form.Label>
            <ReactQuill 
              theme="snow" 
              value={formData.description || ''} 
              onChange={handleDescriptionChange} 
              modules={quillModules} 
              formats={quillFormats}
              style={{backgroundColor: 'white', color: 'black'}} 
            />
          </Form.Group>

          <Form.Group className="mb-3" controlId="editTags">
            <Form.Label>Tags (comma-separated)</Form.Label>
            <Form.Control type="text" name="tags" placeholder="e.g., tech, innovation, event" value={Array.isArray(formData.tags) ? formData.tags.join(', ') : ''} onChange={handleInputChange} />
          </Form.Group>

          <Form.Group className="mb-3" controlId="editYoutubeUrl">
            <Form.Label>YouTube Video URL (optional)</Form.Label>
            <Form.Control type="url" name="youtubeUrl" placeholder="https://www.youtube.com/watch?v=..." value={formData.youtubeUrl || ''} onChange={handleInputChange} />
          </Form.Group>
          
          <Form.Group className="mb-3" controlId="editImageFile">
            <Form.Label>
              {isNews ? "Update Images (Optional - Replaces current images if new ones are uploaded)" : "Update Image (Optional)"}
            </Form.Label>
            <Form.Control 
              type="file" 
              name={isNews ? "imageFiles" : "imageFile"} 
              accept="image/*" 
              onChange={handleFileChange} 
              multiple={isNews} 
            />
            <Form.Text muted>
              {isNews 
                ? `Optionally upload new images (up to ${MAX_NEWS_IMAGES_EDIT}) to replace the current ones. If no new images are selected, the existing images will be kept.`
                : "Upload a new image to replace the current one. If no new image is selected for an event, the existing image will be kept (requires backend support)."}
              <br/>For best results, use images with a 16:9 or 4:3 aspect ratio.
            </Form.Text>
          </Form.Group>

          {isNews ? (
            currentNewsPreviews.length > 0 && (
              <div className="mb-3">
                <p className="small text-muted mb-1">
                  {newNewsImagePreviews.length > 0 ? "New Image Previews (to be uploaded):" : "Current Image(s) (will be replaced if new images are uploaded above):"}
                </p>
                <div className="image-preview-grid-edit">
                  {currentNewsPreviews.map((src, index) => (
                    <div key={index} className="image-preview-item-edit">
                      <img 
                        src={src} 
                        alt={`Preview ${index + 1}`} 
                        className="image-preview-thumbnail-edit"
                        onLoad={(e) => {
                            if ((newNewsImagePreviews.length > 0 && index === 0) || (newNewsImagePreviews.length === 0 && index === 0 && src === imagePreview)) {
                                const img = e.target as HTMLImageElement;
                                setImageDimensions({ width: img.width, height: img.height });
                            }
                        }}
                      />
                    </div>
                  ))}
                </div>
                {imageDimensions && (newNewsImagePreviews.length > 0 || (currentNewsPreviews.length > 0 && currentNewsPreviews[0] === imagePreview)) && (
                     <p className="small text-muted mt-1 text-center">
                        First image dimensions: {imageDimensions.width}px x {imageDimensions.height}px
                     </p>
                )}
              </div>
            )
          ) : (
            imagePreview && (
              <div className="image-preview-container mt-2 mb-3 text-center">
                <p className="small text-muted mb-1">Image Preview:</p>
                <img 
                  src={imagePreview} 
                  alt="Preview" 
                  className="image-preview" 
                  style={{ maxHeight: '200px', maxWidth: '100%', width: 'auto', objectFit: 'contain', border: '1px solid #ddd', padding: '4px' }}
                  onLoad={(e) => {
                    const img = e.target as HTMLImageElement;
                    setImageDimensions({ width: img.width, height: img.height });
                  }}
                />
                {imageDimensions && (
                  <p className="small text-muted mt-1">
                    Dimensions: {imageDimensions.width}px x {imageDimensions.height}px
                  </p>
                )}
              </div>
            )
          )}

          <Form.Group className="mb-3" controlId="editImageAltText">
            <Form.Label>Image Alt Text (Recommended for SEO & Accessibility)</Form.Label>
            <Form.Control 
              type="text" 
              name="imageAltText" 
              placeholder="Descriptive text for the image(s)" 
              value={formData.imageAltText || ''} 
              onChange={handleInputChange} 
            />
          </Form.Group>
          
          <Form.Group className="mb-3" controlId="editFeatured">
            <Form.Check type="checkbox" name="featured" label="Featured Item" checked={formData.featured || false} onChange={handleInputChange} />
          </Form.Group>

          <div className="d-flex justify-content-end">
            <Button variant="secondary" onClick={onHide} className="me-2" disabled={loading}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" disabled={loading}>
              {loading ? <><Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" /> Saving...</> : 'Save Changes'}
            </Button>
          </div>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

// --- Inlined DeleteConfirmationModal Component ---
const DeleteConfirmationModal: React.FC<DeleteConfirmationModalProps> = ({
  show,
  onHide,
  onConfirm,
  itemName,
  loading,
  error,
  clearError
}) => {
  
  const handleHide = () => {
    clearError();
    onHide();
  }

  return (
    <Modal show={show} onHide={handleHide} backdrop="static" keyboard={false}>
      <Modal.Header closeButton>
        <Modal.Title>Confirm Deletion</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        Are you sure you want to delete "{itemName || 'this item'}"? This action cannot be undone.
        {error && <Alert variant="danger" className="mt-3" onClose={clearError} dismissible>{error}</Alert>}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleHide} disabled={loading}>
          Cancel
        </Button>
        <Button variant="danger" onClick={onConfirm} disabled={loading}>
          {loading ? <><Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true"/> Deleting...</> : 'Delete'}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

// --- Inlined ManageCommentsModal Component (from previous response) ---
const ManageCommentsModal: React.FC<ManageCommentsModalProps> = ({
  show,
  onHide,
  newsItem,
  onCommentsUpdated,
}) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loadingComments, setLoadingComments] = useState(false);
  const [errorComments, setErrorComments] = useState<string | null>(null);
  const [replyingTo, setReplyingTo] = useState<{ commentId: string | number; parentId: string | number | null } | null>(null);
  const [replyText, setReplyText] = useState('');
  const [operationLoading, setOperationLoading] = useState<Record<string, boolean>>({});

  const fetchComments = useCallback(async () => {
    if (!newsItem) return;
    setLoadingComments(true);
    setErrorComments(null);
    try {
      const fetchedComments = await getCommentsForPost(newsItem.id);
      setComments(fetchedComments);
    } catch (err) {
      setErrorComments(err instanceof Error ? err.message : "Failed to load comments.");
      setComments([]);
    } finally {
      setLoadingComments(false);
    }
  }, [newsItem]);

  useEffect(() => {
    if (show && newsItem) {
      fetchComments();
    } else if (!show) {
      setComments([]);
      setReplyingTo(null);
      setReplyText('');
      setErrorComments(null);
    }
  }, [show, newsItem, fetchComments]);

  const { totalCommentsCount, unapprovedCommentsCount } = useMemo(() => {
    if (!comments || comments.length === 0) return { totalCommentsCount: 0, unapprovedCommentsCount: 0 };
    // Use the global calculateCommentCounts for consistency if preferred,
    // or keep this local version. For this example, we use the local calculation.
    let total = 0;
    let unapproved = 0;
    const countRecursive = (commentList: Comment[]): void => {
      for (const c of commentList) {
        total++;
        if (!c.approved) {
          unapproved++;
        }
        if (c.replies && c.replies.length > 0) {
          countRecursive(c.replies);
        }
      }
    };
    countRecursive(comments); 
    return { totalCommentsCount: total, unapprovedCommentsCount: unapproved };
  }, [comments]);

  const handleToggleApproval = async (comment: Comment) => {
    setOperationLoading(prev => ({ ...prev, [`approve-${comment.id}`]: true }));
    setErrorComments(null);
    try {
      await toggleCommentApproval(comment.id, comment.approved);
      fetchComments(); 
      onCommentsUpdated(newsItem!.id); 
    } catch (err) {
      setErrorComments(err instanceof Error ? err.message : "Failed to update approval status.");
    } finally {
      setOperationLoading(prev => ({ ...prev, [`approve-${comment.id}`]: false }));
    }
  };

  const handleDeleteComment = async (commentId: string | number) => {
    if (!window.confirm("Are you sure you want to delete this comment and all its replies?")) return;
    setOperationLoading(prev => ({ ...prev, [`delete-${commentId}`]: true }));
    setErrorComments(null);
    try {
      await deleteCommentAdmin(commentId);
      fetchComments(); 
      onCommentsUpdated(newsItem!.id);
    } catch (err) {
      setErrorComments(err instanceof Error ? err.message : "Failed to delete comment.");
    } finally {
      setOperationLoading(prev => ({ ...prev, [`delete-${commentId}`]: false }));
    }
  };

  const handleStartReply = (commentId: string | number, parentId: string | number | null) => {
    setReplyingTo({ commentId, parentId });
    setReplyText('');
  };

  const handleCancelReply = () => {
    setReplyingTo(null);
    setReplyText('');
  };

  const handleSubmitReply = async (e: FormEvent) => {
    e.preventDefault();
    if (!replyText.trim() || !replyingTo || !newsItem) return;

    const { parentId } = replyingTo; 
    setOperationLoading(prev => ({ ...prev, [`reply-${replyingTo.commentId}`]: true }));
    setErrorComments(null);
    try {
      const newReplyData: NewCommentData = {
        postId: newsItem.id,
        text: replyText,
        parentId: parentId, 
      };
      await addAdminReply(newReplyData);
      fetchComments(); 
      onCommentsUpdated(newsItem.id);
      handleCancelReply();
    } catch (err) {
      setErrorComments(err instanceof Error ? err.message : "Failed to post reply.");
    } finally {
       if (replyingTo) { 
        setOperationLoading(prev => ({ ...prev, [`reply-${replyingTo!.commentId}`]: false }));
      }
    }
  };
  
  const formatCommentDate = (dateString: string): string => {
    try {
      return new Date(dateString).toLocaleString();
    } catch {
      return "Invalid Date";
    }
  };

  const renderComment = (comment: Comment, level: number = 0): React.ReactNode => (
    <ListGroup.Item key={comment.id} style={{ marginLeft: `${level * 20}px`, borderLeft: level > 0 ? '3px solid #eee' : 'none' }} className="mb-2 shadow-sm comment-item">
      <div className="d-flex justify-content-between align-items-start">
        <div>
          <strong className="me-2">{comment.name}</strong>
          {comment.email && <small className="text-muted me-2">({comment.email})</small>}
          <small className="text-muted">{formatCommentDate(comment.date)}</small>
        </div>
        <Badge bg={comment.approved ? "success" : "warning"} pill>
          {comment.approved ? "Approved" : "Pending"}
        </Badge>
      </div>
      <p className="mt-1 mb-2 comment-text">{comment.text}</p>
      
      <div className="comment-actions mb-2">
        <Button 
          variant={comment.approved ? "outline-warning" : "outline-success"} 
          size="sm" 
          className="me-2"
          onClick={() => handleToggleApproval(comment)}
          disabled={operationLoading[`approve-${comment.id}`]}
        >
          {operationLoading[`approve-${comment.id}`] ? <Spinner size="sm" animation="border"/> : (comment.approved ? "Unapprove" : "Approve")}
        </Button>
        <Button 
          variant="outline-primary" 
          size="sm" 
          className="me-2"
          onClick={() => replyingTo?.commentId === comment.id ? handleCancelReply() : handleStartReply(comment.id, comment.id)}
        >
          {replyingTo?.commentId === comment.id ? "Cancel Reply" : "Reply"}
        </Button>
        <Button 
          variant="outline-danger" 
          size="sm"
          onClick={() => handleDeleteComment(comment.id)}
          disabled={operationLoading[`delete-${comment.id}`]}
        >
         {operationLoading[`delete-${comment.id}`] ? <Spinner size="sm" animation="border"/> : "Delete"}
        </Button>
      </div>

      {replyingTo?.commentId === comment.id && (
        <Form onSubmit={handleSubmitReply} className="mt-2 mb-2 p-2 border rounded bg-light reply-form">
          <Form.Group controlId={`reply-text-${comment.id}`}>
            <Form.Label className="small">Your Reply (as Admin):</Form.Label>
            <Form.Control
              as="textarea"
              rows={2}
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              required
              placeholder="Write your reply..."
            />
          </Form.Group>
          <div className="mt-2 text-end">
            <Button variant="secondary" size="sm" onClick={handleCancelReply} className="me-2" disabled={operationLoading[`reply-${comment.id}`]}>Cancel</Button>
            <Button type="submit" variant="primary" size="sm" disabled={!replyText.trim() || operationLoading[`reply-${comment.id}`]}>
              {operationLoading[`reply-${comment.id}`] ? <Spinner size="sm" animation="border"/> : "Post Reply"}
            </Button>
          </div>
        </Form>
      )}

      {comment.replies && comment.replies.length > 0 && (
        <div className="comment-replies mt-2">
          {comment.replies.map(reply => renderComment(reply, level + 1))}
        </div>
      )}
    </ListGroup.Item>
  );

  return (
    <Modal show={show} onHide={onHide} size="lg" backdrop="static" keyboard={false} centered>
      <Modal.Header closeButton>
        <Modal.Title>Manage Comments for "{newsItem?.title}"</Modal.Title>
      </Modal.Header>
      <Modal.Body style={{ maxHeight: '70vh', overflowY: 'auto' }}>
        {errorComments && <Alert variant="danger" dismissible onClose={() => setErrorComments(null)}>{errorComments}</Alert>}
        
        {loadingComments ? (
          <div className="text-center p-3"><Spinner animation="border" /> Loading comments...</div>
        ) : (
          <>
            {comments.length > 0 ? (
              <>
                <Alert variant="light" className="mb-3 d-flex justify-content-around align-items-center border shadow-sm">
                  <span>
                    Total Comments: <Badge bg="primary" pill className="fs-6">{totalCommentsCount}</Badge>
                  </span>
                  <span>
                    Pending Approval: <Badge bg={unapprovedCommentsCount > 0 ? "warning" : "success"} pill className="fs-6">{unapprovedCommentsCount}</Badge>
                  </span>
                </Alert>
                <ListGroup variant="flush">
                  {comments.filter(c => !c.parentId).map(comment => renderComment(comment))}
                </ListGroup>
              </>
            ) : (
              <Alert variant="info" className="text-center">No comments found for this post.</Alert>
            )}
          </>
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>Close</Button>
      </Modal.Footer>
    </Modal>
  );
};


// --- Main ManagePosts Component ---
const ManagePosts: React.FC = () => {
  const [activeTab, setActiveTab] = useState<ItemType>('news');
  
  const [newsItems, setNewsItems] = useState<NewsItem[]>([]);
  const [eventItems, setEventItems] = useState<EventItem[]>([]);
  
  const [loading, setLoading] = useState<boolean>(false); 
  const [pageError, setPageError] = useState<string | null>(null);
  const [modalError, setModalError] = useState<string | null>(null); 
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const [showEditModal, setShowEditModal] = useState<boolean>(false);
  const [editingItem, setEditingItem] = useState<NewsItem | EventItem | null>(null);
  const [editingItemType, setEditingItemType] = useState<ItemType | null>(null);
  
  const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);
  const [itemToDelete, setItemToDelete] = useState<NewsItem | EventItem | null>(null);
  const [itemToDeleteType, setItemToDeleteType] = useState<ItemType | null>(null);
  
  const [isInitialTabLoad, setIsInitialTabLoad] = useState(true);

  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterFeatured, setFilterFeatured] = useState('all');

  const [showCommentsModal, setShowCommentsModal] = useState<boolean>(false);
  const [selectedNewsItemForComments, setSelectedNewsItemForComments] = useState<NewsItem | null>(null);


  const clearPageMessages = () => {
    setPageError(null);
    setSuccessMessage(null);
  };

  const clearModalError = useCallback(() => {
    setModalError(null);
  }, []);

  // --- START: Modified fetchAllNews ---
  const fetchAllNews = useCallback(async (showLoadingSpinner = true) => {
    if (showLoadingSpinner) setLoading(true);
    clearPageMessages();
    try {
      // 1. Fetch basic news items
      const basicNewsItems = await getNews();

      // 2. For each news item, fetch its comments and calculate counts
      const enrichedNewsItemsPromises = basicNewsItems.map(async (item) => {
        try {
          const commentsData = await getCommentsForPost(item.id);
          const counts = calculateCommentCounts(commentsData); // Use the new utility function
          return {
            ...item,
            commentsData: commentsData, // Store raw comments
            commentsCount: counts.totalComments,
            approvedCommentsCount: counts.approvedComments,
            pendingCommentsCount: counts.pendingComments,
          };
        } catch (commentError) {
          console.warn(`Failed to fetch or process comments for news item ${item.id}:`, commentError instanceof Error ? commentError.message : String(commentError));
          // Return item with its original/default counts if comments fail
          // This ensures the page still loads the news item, albeit with potentially stale/default counts
          return {
            ...item,
            commentsData: item.commentsData || [], // Keep existing or empty array
            // Keep existing counts from getNews() or default to 0
            commentsCount: item.commentsCount || 0,
            approvedCommentsCount: item.approvedCommentsCount || 0,
            pendingCommentsCount: item.pendingCommentsCount || 0,
          };
        }
      });
      
      const enrichedNewsItems = await Promise.all(enrichedNewsItemsPromises);
      setNewsItems(enrichedNewsItems);

    } catch (err) {
      setPageError(err instanceof Error ? err.message : 'Failed to fetch news items.');
      setNewsItems([]); // Clear news items on main error
    } finally {
      if (showLoadingSpinner) setLoading(false);
      setIsInitialTabLoad(false);
    }
  }, [setLoading, setPageError, setNewsItems, setIsInitialTabLoad]); // Dependencies for useCallback
  // --- END: Modified fetchAllNews ---


  const fetchAllEvents = useCallback(async (showLoadingSpinner = true) => {
    if(showLoadingSpinner) setLoading(true);
    clearPageMessages();
    try {
      const data = await getEvents(); 
      setEventItems(data);
    } catch (err) {
      setPageError(err instanceof Error ? err.message : 'Failed to fetch event items.');
      setEventItems([]);
    } finally {
      if(showLoadingSpinner) setLoading(false);
      setIsInitialTabLoad(false);
    }
  }, []);

  useEffect(() => {
    setIsInitialTabLoad(true);
    if (activeTab === 'news') {
      fetchAllNews();
    } else {
      fetchAllEvents();
    }
  }, [activeTab, fetchAllNews, fetchAllEvents]);

  const filteredNewsItems = useMemo(() => {
    return newsItems
      .filter(item => item.title.toLowerCase().includes(searchTerm.toLowerCase()))
      .filter(item => filterCategory === 'all' || item.category === filterCategory)
      .filter(item => {
        if (filterFeatured === 'all') return true;
        return filterFeatured === 'yes' ? item.featured : !item.featured;
      });
  }, [newsItems, searchTerm, filterCategory, filterFeatured]);

  const filteredEventItems = useMemo(() => {
    return eventItems
      .filter(item => item.title.toLowerCase().includes(searchTerm.toLowerCase()))
      .filter(item => {
        if (filterFeatured === 'all') return true;
        return filterFeatured === 'yes' ? item.featured : !item.featured;
      });
  }, [eventItems, searchTerm, filterFeatured]);


  const handleEdit = (item: NewsItem | EventItem, type: ItemType) => {
    setEditingItem(item); 
    setEditingItemType(type);
    clearModalError();
    clearPageMessages();
    setShowEditModal(true);
  };

  const handleDeleteConfirmation = (item: NewsItem | EventItem, type: ItemType) => {
    setItemToDelete(item);
    setItemToDeleteType(type);
    clearModalError();
    clearPageMessages();
    setShowDeleteModal(true);
  };

  const handleManageComments = (item: NewsItem) => {
    setSelectedNewsItemForComments(item);
    setShowCommentsModal(true);
    clearPageMessages(); 
  };

  const handleCommentsUpdated = useCallback((postId: string | number) => {
    // When comments are updated for a specific post, re-fetch all news data.
    // fetchAllNews will now also re-fetch comments and recalculate counts.
    if (activeTab === 'news') {
      fetchAllNews(false); // Pass false to avoid double loading spinner if one is already active
    }
  }, [activeTab, fetchAllNews]);


  const confirmDelete = async () => {
    if (!itemToDelete || !itemToDeleteType) return;
    setLoading(true); 
    clearModalError();
    clearPageMessages();
    try {
      if (itemToDeleteType === 'news') {
        await deleteNewsItem(itemToDelete.id);
        setSuccessMessage(`News item "${itemToDelete.title}" deleted successfully.`);
        fetchAllNews(); // This will re-fetch news and their comments with new counts
      } else {
        await deleteEventItem(itemToDelete.id);
        setSuccessMessage(`Event item "${itemToDelete.title}" deleted successfully.`);
        fetchAllEvents(); 
      }
      setShowDeleteModal(false);
    } catch (err) {
      setModalError(err instanceof Error ? err.message : `Failed to delete ${itemToDeleteType} item.`);
    } finally {
      setLoading(false);
      if (!(modalError && err instanceof Error && modalError !== (err as Error).message)) { 
         setItemToDelete(null);
         setItemToDeleteType(null);
      }
    }
  };

  const handleEditSubmit = async (formData: Partial<NewsFormData> | Partial<EventFormData>, type: ItemType) => {
    if (!editingItem) return;
    setLoading(true); 
    clearModalError();
    clearPageMessages();

    if (!formData.description || stripHtml(formData.description).trim() === '') {
        setModalError(`Description is required.`);
        setLoading(false);
        return;
    }

    try {
      if (type === 'news') {
        const result = await updateNewsItem(editingItem.id, formData as Partial<NewsFormData>);
        setSuccessMessage(`News item "${result.title}" updated successfully!`);
        fetchAllNews(); // This will re-fetch news and their comments with new counts
      } else {
        const result = await updateEventItem(editingItem.id, formData as Partial<EventFormData>);
        setSuccessMessage(`Event item "${result.title}" updated successfully!`);
        fetchAllEvents(); 
      }
      setShowEditModal(false);
    } catch (err) {
      setModalError(err instanceof Error ? err.message : `Failed to update ${type} item.`);
    } finally {
      setLoading(false);
      if (!(modalError && err instanceof Error && modalError !== (err as Error).message)) { 
        setEditingItem(null);
      }
    }
  };
  
  const renderContent = () => {
    if (loading && isInitialTabLoad) {
      return <div className="text-center p-5"><Spinner animation="border" variant="primary" /><p className="mt-2">Loading {activeTab}...</p></div>;
    }

    const itemsToDisplay = activeTab === 'news' ? filteredNewsItems : filteredEventItems;
    const allItems = activeTab === 'news' ? newsItems : eventItems;

    if (!loading && allItems.length === 0 && !isInitialTabLoad && !pageError) { 
      return <Alert variant="info" className="mt-3">No {activeTab} items found. You can add new items from the "Add News & Events" page.</Alert>;
    }
    
    if (allItems.length > 0 && itemsToDisplay.length === 0 && (searchTerm || (activeTab === 'news' && filterCategory !== 'all') || filterFeatured !== 'all')) {
       return <Alert variant="warning" className="mt-3">No {activeTab} items match your current search/filter criteria.</Alert>;
    }

    if (itemsToDisplay.length > 0) {
      return (
        <PostsTable
          items={itemsToDisplay}
          itemType={activeTab}
          onEdit={handleEdit}
          onDelete={handleDeleteConfirmation}
          onManageComments={activeTab === 'news' ? handleManageComments : ()=>{}} 
          getYouTubeEmbedUrl={getYouTubeEmbedUrl}
        />
      );
    }
    if (pageError && allItems.length === 0) {
        // If there's a page error and no items, the error alert will be shown above the tabs.
        // Avoid showing "No items match" or "No items found" in this case.
        return null; 
    }
    return null; // Should be covered by other conditions, but as a fallback.
  };

  return (
    <Container fluid className="py-4 py-md-5 manage-posts-page">
      <Row className="justify-content-center">
        <Col lg={11} xl={10}>
           <Card className="shadow-sm admin-card">
            <Card.Header as="h2" className="text-center text-white bg-dark py-3">
              Manage Existing Posts
            </Card.Header>
            <Card.Body className="p-3 p-md-4">
              {/* Page-level messages are shown above tabs */}
              <Fade in={!!pageError && !showEditModal && !showDeleteModal && !showCommentsModal} unmountOnExit>
                <Alert variant="danger" onClose={() => setPageError(null)} dismissible className="mt-0 mb-3">{pageError}</Alert>
              </Fade>
              <Fade in={!!successMessage && !showEditModal && !showDeleteModal && !showCommentsModal} unmountOnExit>
                <Alert variant="success" onClose={() => setSuccessMessage(null)} dismissible className="mt-0 mb-3">{successMessage}</Alert>
              </Fade>

              <SearchBarAndFilters
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
                filterFeatured={filterFeatured}
                onFeaturedChange={setFilterFeatured}
                itemType={activeTab}
                newsCategories={newsCategories}
                selectedCategory={filterCategory}
                onCategoryChange={activeTab === 'news' ? setFilterCategory : undefined}
              />

              <Tabs
                activeKey={activeTab}
                onSelect={(k) => {
                  if (k) {
                    setActiveTab(k as ItemType);
                    // clearPageMessages(); // Cleared by fetchAllNews/Events
                    setSearchTerm('');
                    setFilterCategory('all');
                    setFilterFeatured('all');
                  }
                }}
                className="mb-3 nav-tabs-custom"
                fill
                transition={Fade}
              >
                <Tab eventKey="news" title={<><i className="bi bi-newspaper me-2"></i>Manage News</>}>
                  {renderContent()}
                </Tab>
                <Tab eventKey="event" title={<><i className="bi bi-calendar-event me-2"></i>Manage Events</>}>
                  {renderContent()}
                </Tab>
              </Tabs>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {editingItem && showEditModal && (
        <EditPostModal
          show={showEditModal}
          onHide={() => { setShowEditModal(false); setEditingItem(null); clearModalError(); }}
          item={editingItem}
          itemType={editingItemType}
          onSubmit={handleEditSubmit}
          loading={loading && (!!editingItem)} 
          error={modalError}
          clearError={clearModalError}
        />
      )}

      {itemToDelete && showDeleteModal && (
         <DeleteConfirmationModal
            show={showDeleteModal}
            onHide={() => { setShowDeleteModal(false); setItemToDelete(null); clearModalError();}}
            onConfirm={confirmDelete}
            itemName={itemToDelete?.title}
            loading={loading && (!!itemToDelete)} 
            error={modalError}
            clearError={clearModalError}
        />
      )}

      {selectedNewsItemForComments && showCommentsModal && (
        <ManageCommentsModal
          show={showCommentsModal}
          onHide={() => { setShowCommentsModal(false); setSelectedNewsItemForComments(null); }}
          newsItem={selectedNewsItemForComments}
          onCommentsUpdated={handleCommentsUpdated}
        />
      )}
    </Container>
  );
};

export default ManagePosts;
