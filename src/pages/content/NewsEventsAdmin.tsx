
import React, { useState, ChangeEvent, FormEvent, useEffect } from 'react';
import { Container, Row, Col, Form, Button, Card, Alert, Spinner, Tabs, Tab, Fade } from 'react-bootstrap';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import axios, { AxiosRequestConfig, AxiosError } from 'axios';
import './NewsEventsAdmin.css';

export const BACKEND_URL = "http://localhost:5001";

export async function request<T>(url: string, options: AxiosRequestConfig = {}): Promise<T> {
  try {
    const response = await axios({
      url: `${BACKEND_URL}/api${url}`,
      ...options,
      headers: { ...options.headers },
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
    
    // Add all non-file fields
    Object.keys(eventData).forEach(key => {
        if (key !== 'imageFiles' && key !== 'tags') {
            const value = eventData[key as keyof EventFormData];
            if (value !== undefined && value !== null) {
                formData.append(key, String(value));
            }
        }
    });

    // Add tags
    if (eventData.tags && eventData.tags.length > 0) {
        eventData.tags.forEach(tag => formData.append('tags', tag));
    }

    // Add images using the same field name as news
    if (eventData.imageFiles && eventData.imageFiles.length > 0) {
        eventData.imageFiles.forEach(file => {
            formData.append('newsImages', file);
        });
    }

    return formData;
};

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

// Other API functions remain the same...

export const quillModules = {
  toolbar: [
    [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
    ['bold', 'italic', 'underline', 'strike', 'blockquote'],
    [{'list': 'ordered'}, {'list': 'bullet'}, {'indent': '-1'}, {'indent': '+1'}],
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
  title: '', 
  date: '', 
  category: 'Innovation', 
  description: '',
  featured: false, 
  readTime: '', 
  tags: [], 
  imageFiles: [], 
  youtubeUrl: '',
};

const initialEventFormData: EventFormData = {
  title: '', 
  date: '', 
  time: '', 
  venue: '', 
  description: '',
  featured: false, 
  registrationLink: '', 
  capacity: '', 
  tags: [], 
  imageFiles: [],
};

export const newsCategories = [
  'Infrastructure', 'Innovation', 'Startup Ecosystem', 'Strategic Partnerships', 
  'Events & Summits', 'Awards & Recognition', 'Government Initiatives', 'Community Engagement'
];

export const stripHtml = (html: string): string => {
  const doc = new DOMParser().parseFromString(html, 'text/html');
  return doc.body.textContent || "";
};

const NewsEventsAdmin: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'news' | 'events'>('news');
  const [newsFormData, setNewsFormData] = useState<NewsFormData>(initialNewsFormData);
  const [eventFormData, setEventFormData] = useState<EventFormData>(initialEventFormData);
  const [newsImagePreviews, setNewsImagePreviews] = useState<string[]>([]);
  const [eventImagePreviews, setEventImagePreviews] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isCardVisible, setIsCardVisible] = useState(false);

  useEffect(() => { setIsCardVisible(true); }, []);

  const handleInputChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
    formType: 'news' | 'event'
  ) => {
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
      .then(generatedPreviews => {
        previewSetter(generatedPreviews);
      })
      .catch(error => {
        console.error("Error regenerating previews after removal:", error);
        previewSetter(prev => prev.filter((_, index) => index !== indexToRemove));
      });
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

  const renderImageUploadSection = (formType: 'news' | 'event') => {
    const previews = formType === 'news' ? newsImagePreviews : eventImagePreviews;
    const currentFiles = formType === 'news' ? newsFormData.imageFiles : eventFormData.imageFiles;

    return (
      <>
        <Form.Group className="mb-3" controlId={`${formType}ImageFiles`}>
          <Form.Label>Images</Form.Label>
          <Form.Control 
            type="file" 
            name="imageFiles" 
            accept="image/*" 
            onChange={(e) => handleFileChange(e, formType)} 
            multiple
            disabled={(currentFiles?.length || 0) >= MAX_IMAGES}
          />
          <Form.Text className="text-muted">
            Select up to {MAX_IMAGES} images. ({(currentFiles?.length || 0)} selected)
          </Form.Text>
        </Form.Group>

        {previews.length > 0 && (
          <div className="image-preview-grid mt-2">
            {previews.map((previewSrc, index) => (
              <div key={index} className="image-preview-item">
                <img
                  src={previewSrc}
                  alt={`Preview ${index + 1}`}
                  className="image-preview-thumbnail"
                />
                <Button
                  variant="danger"
                  size="sm"
                  className="image-remove-button"
                  onClick={() => handleRemoveImage(index, formType)}
                  title="Remove image"
                >
                  &times;
                </Button>
              </div>
            ))}
          </div>
        )}
        {(currentFiles?.length || 0) >= MAX_IMAGES && (
          <Alert variant="info" className="mt-2 small">
            Maximum number of images ({MAX_IMAGES}) reached.
          </Alert>
        )}
      </>
    );
  };

  const renderNewsForm = () => (
    <Form onSubmit={(e) => handleSubmit(e, 'news')}>
      <Row>
        <Col md={8}>
          <Form.Group className="mb-3" controlId="newsTitle">
            <Form.Label>Title</Form.Label>
            <Form.Control 
              type="text" 
              name="title" 
              value={newsFormData.title} 
              onChange={(e) => handleInputChange(e, 'news')} 
              required 
            />
          </Form.Group>

          <Form.Group className="mb-3" controlId="newsDate">
            <Form.Label>Date</Form.Label>
            <Form.Control 
              type="date" 
              name="date" 
              value={newsFormData.date} 
              onChange={(e) => handleInputChange(e, 'news')} 
              required 
            />
          </Form.Group>

          <Form.Group className="mb-3" controlId="newsCategory">
            <Form.Label>Category</Form.Label>
            <Form.Select 
              name="category" 
              value={newsFormData.category} 
              onChange={(e) => handleInputChange(e, 'news')} 
              required
            >
              {newsCategories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </Form.Select>
          </Form.Group>

          <Form.Group className="mb-3" controlId="newsDescription">
            <Form.Label>Description</Form.Label>
            <ReactQuill 
              theme="snow" 
              value={newsFormData.description} 
              onChange={(content) => handleDescriptionChange(content, 'news')} 
              modules={quillModules} 
              formats={quillFormats} 
              className="quill-editor-container"
            />
          </Form.Group>

          <Form.Group className="mb-3" controlId="newsReadTime">
            <Form.Label>Read Time (optional)</Form.Label>
            <Form.Control 
              type="text" 
              name="readTime" 
              value={newsFormData.readTime} 
              onChange={(e) => handleInputChange(e, 'news')} 
              placeholder="e.g., 5 min read"
            />
          </Form.Group>

          <Form.Group className="mb-3" controlId="newsTags">
            <Form.Label>Tags (optional)</Form.Label>
            <Form.Control 
              type="text" 
              name="tags" 
              value={newsFormData.tags?.join(', ') || ''} 
              onChange={(e) => handleInputChange(e, 'news')} 
              placeholder="e.g., featured, innovation, tech" 
            />
          </Form.Group>

          <Form.Group className="mb-3" controlId="newsYoutubeUrl">
            <Form.Label>YouTube URL (optional)</Form.Label>
            <Form.Control 
              type="url" 
              name="youtubeUrl" 
              value={newsFormData.youtubeUrl || ''} 
              onChange={(e) => handleInputChange(e, 'news')} 
              placeholder="e.g., https://www.youtube.com/watch?v=videoID" 
            />
          </Form.Group>

          <Form.Group className="mb-3" controlId="newsFeatured">
            <Form.Check 
              type="checkbox" 
              name="featured" 
              label="Featured Item" 
              checked={newsFormData.featured} 
              onChange={(e) => handleInputChange(e, 'news')} 
            />
          </Form.Group>
        </Col>
        <Col md={4}>
          {renderImageUploadSection('news')}
        </Col>
      </Row>
      <Button variant="primary" type="submit" disabled={loading} className="mt-3 submit-button">
        {loading ? (
          <>
            <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" /> Adding News...
          </>
        ) : 'Add News Item'}
      </Button>
    </Form>
  );

  const renderEventForm = () => (
    <Form onSubmit={(e) => handleSubmit(e, 'events')}>
      <Row>
        <Col md={8}>
          <Form.Group className="mb-3" controlId="eventTitle">
            <Form.Label>Title</Form.Label>
            <Form.Control 
              type="text" 
              name="title" 
              value={eventFormData.title} 
              onChange={(e) => handleInputChange(e, 'event')} 
              required 
            />
          </Form.Group>

          <Row>
            <Col md={6}>
              <Form.Group className="mb-3" controlId="eventDate">
                <Form.Label>Date</Form.Label>
                <Form.Control 
                  type="date" 
                  name="date" 
                  value={eventFormData.date} 
                  onChange={(e) => handleInputChange(e, 'event')} 
                  required 
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3" controlId="eventTime">
                <Form.Label>Time</Form.Label>
                <Form.Control 
                  type="time" 
                  name="time" 
                  value={eventFormData.time} 
                  onChange={(e) => handleInputChange(e, 'event')} 
                  required 
                />
              </Form.Group>
            </Col>
          </Row>

          <Form.Group className="mb-3" controlId="eventVenue">
            <Form.Label>Venue</Form.Label>
            <Form.Control 
              type="text" 
              name="venue" 
              value={eventFormData.venue} 
              onChange={(e) => handleInputChange(e, 'event')} 
              required 
            />
          </Form.Group>

          <Form.Group className="mb-3" controlId="eventDescription">
            <Form.Label>Description</Form.Label>
            <ReactQuill 
              theme="snow" 
              value={eventFormData.description} 
              onChange={(content) => handleDescriptionChange(content, 'event')} 
              modules={quillModules} 
              formats={quillFormats} 
              className="quill-editor-container"
            />
          </Form.Group>

          <Form.Group className="mb-3" controlId="eventCapacity">
            <Form.Label>Capacity (optional)</Form.Label>
            <Form.Control 
              type="text" 
              name="capacity" 
              value={eventFormData.capacity} 
              onChange={(e) => handleInputChange(e, 'event')} 
              placeholder="e.g., 200 seats"
            />
          </Form.Group>

          <Form.Group className="mb-3" controlId="eventRegistrationLink">
            <Form.Label>Registration Link (optional)</Form.Label>
            <Form.Control 
              type="url" 
              name="registrationLink" 
              value={eventFormData.registrationLink} 
              onChange={(e) => handleInputChange(e, 'event')} 
              placeholder="https://example.com/register" 
            />
          </Form.Group>

          <Form.Group className="mb-3" controlId="eventTags">
            <Form.Label>Tags (optional)</Form.Label>
            <Form.Control 
              type="text" 
              name="tags" 
              value={eventFormData.tags?.join(', ') || ''} 
              onChange={(e) => handleInputChange(e, 'event')} 
              placeholder="e.g., summit, workshop, featured" 
            />
          </Form.Group>

          <Form.Group className="mb-3" controlId="eventFeatured">
            <Form.Check 
              type="checkbox" 
              name="featured" 
              label="Featured Item" 
              checked={eventFormData.featured} 
              onChange={(e) => handleInputChange(e, 'event')} 
            />
          </Form.Group>
        </Col>
        <Col md={4}>
          {renderImageUploadSection('event')}
        </Col>
      </Row>
      <Button variant="primary" type="submit" disabled={loading} className="mt-3 submit-button">
        {loading ? (
          <>
            <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" /> Adding Event...
          </>
        ) : 'Add Event Item'}
      </Button>
    </Form>
  );

  return (
    <Container className="py-5 news-events-admin-page">
      <Row className="justify-content-center">
        <Col lg={10} xl={8}>
          <Fade in={isCardVisible} timeout={500}>
            <Card className={`shadow-sm admin-card ${isCardVisible ? 'fade-in-card' : ''}`}>
              <Card.Header as="h2" className="text-center text-gray">
                Manage News & Events
              </Card.Header>
              <Card.Body>
                <Fade in={!!error} unmountOnExit>
                  <Alert variant="danger" onClose={() => setError(null)} dismissible>
                    {error}
                  </Alert>
                </Fade>
                <Fade in={!!success} unmountOnExit>
                  <Alert variant="success" onClose={() => setSuccess(null)} dismissible>
                    {success}
                  </Alert>
                </Fade>
                <Tabs 
                  activeKey={activeTab} 
                  onSelect={(k) => {
                    setActiveTab(k as 'news' | 'events');
                    setError(null);
                    setSuccess(null);
                    if (k === 'news') {
                      setEventFormData(initialEventFormData);
                      setEventImagePreviews([]);
                    } else if (k === 'events') {
                      setNewsFormData(initialNewsFormData);
                      setNewsImagePreviews([]);
                    }
                  }} 
                  className="mb-4 nav-tabs-custom" 
                  id="admin-news-events-tabs" 
                  fill 
                  transition={Fade}
                >
                  <Tab eventKey="news" title={<><i className="bi bi-newspaper me-2"></i>Add News</>}>
                    <div className="tab-content-custom p-3 border border-top-0">
                      {renderNewsForm()}
                    </div>
                  </Tab>
                  <Tab eventKey="events" title={<><i className="bi bi-calendar-event me-2"></i>Add Event</>}>
                    <div className="tab-content-custom p-3 border border-top-0">
                      {renderEventForm()}
                    </div>
                  </Tab>
                </Tabs>
              </Card.Body>
            </Card>
          </Fade>
        </Col>
      </Row>
    </Container>
  );
};

export default NewsEventsAdmin;