// src/pages/content/ManageGallery.tsx
import React, { useState, ChangeEvent, FormEvent, useEffect, useMemo } from 'react';
import { Container, Row, Col, Form, Button, Card, Alert, Spinner, Fade } from 'react-bootstrap';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import axios, { AxiosRequestConfig, AxiosError } from 'axios';
import './MediaGalleryAdmin.css'; // Assuming this file exists

// --- START: API service section ---
export const BACKEND_URL = "https://api-cms.startechaigroup.com";

export async function request<T>(url: string, options: AxiosRequestConfig = {}): Promise<T> {
  try {
    const response = await axios({
      url: `${BACKEND_URL}/api${url}`,
      ...options,
      headers: {
        // Example: 'Authorization': `Bearer ${localStorage.getItem('token')}`,
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

export const getFullImageUrl = (baseUrl: string, imagePath?: string): string | undefined => {
  if (!imagePath) {
    return undefined;
  }
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://') || imagePath.startsWith('//')) {
    return imagePath;
  }
  const cleanBaseUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
  const cleanImagePath = imagePath.startsWith('/') ? imagePath : `/${imagePath}`;
  return `${cleanBaseUrl}${cleanImagePath}`;
};

export interface MediaItem {
  id: number | string;
  title: string;
  type: 'image' | 'video';
  src: string;
  youtubeUrl?: string;
  date: string;
  category: string;
  description?: string;
  poster?: string;
}

export type MediaFormData = Omit<MediaItem, 'id' | 'src'> & {
  mediaFile?: File;
  posterFile?: File;
  youtubeUrl?: string;
};

interface BaseApiResponse {
  success: boolean;
  message: string;
}

interface GetMediaResponse extends BaseApiResponse {
  mediaItems: MediaItem[];
}

interface MutateMediaResponse extends BaseApiResponse, MediaItem { }

const getYoutubeEmbedUrl = (url: string): string | null => {
  if (!url) return null;
  let videoId = null;
  try {
    const urlObj = new URL(url);
    if (urlObj.hostname === 'youtu.be') {
      videoId = urlObj.pathname.slice(1);
    } else if (urlObj.hostname.includes('youtube.com')) {
      videoId = urlObj.searchParams.get('v');
    }
    return videoId ? `https://www.youtube.com/embed/${videoId}` : null;
  } catch (e) {
    const regex = /(?:youtube\.com\/(?:[^/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?/\\s]{11})/;
    const match = url.match(regex);
    videoId = match ? match[1] : null;
    return videoId ? `https://www.youtube.com/embed/${videoId}` : null;
  }
};

const buildMediaFormData = (mediaData: MediaFormData | Partial<MediaFormData>): FormData => {
  const formData = new FormData();
  (Object.keys(mediaData) as Array<keyof typeof mediaData>).forEach(key => {
    if (key === 'mediaFile' || key === 'posterFile' || key === 'src') return;

    const value = mediaData[key];
    if (value !== undefined && value !== null) {
      formData.append(key, String(value));
    }
  });

  if (mediaData.type === 'image' && mediaData.mediaFile instanceof File) {
    formData.append('mediaFile', mediaData.mediaFile, mediaData.mediaFile.name);
  } else if (mediaData.type === 'video' && mediaData.youtubeUrl) {
    const embedUrl = getYoutubeEmbedUrl(mediaData.youtubeUrl);
    if (embedUrl) {
      formData.append('src', embedUrl); // Server should handle this 'src' for YouTube videos
    }
  }


  if (mediaData.posterFile instanceof File) {
    formData.append('posterFile', mediaData.posterFile, mediaData.posterFile.name);
  }
  return formData;
};

export const getMediaItems = async (): Promise<MediaItem[]> => {
  const response = await request<GetMediaResponse>('/media', { method: 'GET' });
  if (response.success && Array.isArray(response.mediaItems)) {
    return response.mediaItems;
  }
  throw new Error(response.message || 'Failed to retrieve media items or invalid data format.');
};

export const addMediaItem = async (mediaData: MediaFormData): Promise<MediaItem> => {
  const formData = buildMediaFormData(mediaData);
  const response = await request<MutateMediaResponse>('/media', { method: 'POST', data: formData });
  if (response.success) {
    const { success, message, ...newItem } = response;
    return newItem as MediaItem;
  }
  throw new Error(response.message || 'Failed to add media item.');
};

export const updateMediaItem = async (id: number | string, mediaData: Partial<MediaFormData>): Promise<MediaItem> => {
  const formData = buildMediaFormData(mediaData);
  const response = await request<MutateMediaResponse>(`/mediaup/${id}`, { method: 'PUT', data: formData });
  if (response.success) {
    const { success, message, ...updatedItem } = response;
    return updatedItem as MediaItem;
  }
  throw new Error(response.message || 'Failed to update media item.');
};

export const deleteMediaItem = async (id: number | string): Promise<void> => {
  const response = await request<BaseApiResponse>(`/media/${id}`, { method: 'DELETE' });
  if (!response.success) {
    throw new Error(response.message || 'Failed to delete media item.');
  }
};
// --- END: API service section ---

export const quillModules = {
  toolbar: [
    [{ 'header': [1, 2, 3, false] }],
    ['bold', 'italic', 'underline', 'strike'],
    [{ 'list': 'ordered' }, { 'list': 'bullet' }],
    ['link', 'image', 'video'],
    [{ 'align': [] }],
    ['clean']
  ],
};

export const quillFormats = [
  'header', 'bold', 'italic', 'underline', 'strike', 'list', 'bullet', 'link', 'image', 'video', 'align'
];

export const mediaCategories = [
  'Technology', 'Events', 'Campus Life', 'Innovation', 'Community', 'Behind the Scenes'
];
export const mediaTypes = ['image', 'video'] as const;

const initialMediaFormData: MediaFormData = {
  title: '',
  date: new Date().toISOString().split('T')[0],
  category: mediaCategories[0],
  type: 'image',
  description: '',
  mediaFile: undefined,
  posterFile: undefined,
  youtubeUrl: '',
};

export const stripHtml = (html: string): string => {
  const doc = new DOMParser().parseFromString(html, 'text/html');
  return doc.body.textContent || "";
};

const ManageGallery: React.FC = () => {
  const [formData, setFormData] = useState<MediaFormData>(initialMediaFormData);
  const [mediaFilePreview, setMediaFilePreview] = useState<string | null>(null);
  const [posterFilePreview, setPosterFilePreview] = useState<string | null>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [isCardVisible, setIsCardVisible] = useState(false);

  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [isLoadingList, setIsLoadingList] = useState(true);
  const [listError, setListError] = useState<string | null>(null);
  const [editingItem, setEditingItem] = useState<MediaItem | null>(null);

  // State for filtering and searching
  const [filterCategory, setFilterCategory] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>('');

  const fetchMedia = async () => {
    setIsLoadingList(true);
    setListError(null);
    try {
      const items = await getMediaItems();
      setMediaItems(items);
    } catch (err) {
      setListError(err instanceof Error ? err.message : 'Failed to fetch media items.');
      console.error('Error fetching media items:', err);
      setMediaItems([]);
    } finally {
      setIsLoadingList(false);
    }
  };

  useEffect(() => {
    setIsCardVisible(true);
    fetchMedia();
  }, []);

  const youtubeEmbedPreviewUrl = useMemo(() => {
    if (formData.type === 'video' && formData.youtubeUrl) {
      return getYoutubeEmbedUrl(formData.youtubeUrl);
    }
    return null;
  }, [formData.type, formData.youtubeUrl]);

  const handleInputChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => {
      const newState = { ...prev, [name]: value };
      if (name === 'type' && !editingItem) {
        if (value === 'image') {
          newState.youtubeUrl = '';
        } else if (value === 'video') {
          newState.mediaFile = undefined;
          setMediaFilePreview(null);
          const mediaInput = document.getElementById('mediaFile') as HTMLInputElement | null;
          if (mediaInput) mediaInput.value = "";
        }
      }
      return newState;
    });

    if (name === 'type' && value === 'image' && !editingItem) {
      setFormData(prev => ({ ...prev, posterFile: undefined }));
      setPosterFilePreview(null);
      const posterInput = document.getElementById('mediaPosterFile') as HTMLInputElement | null;
      if (posterInput) posterInput.value = "";
    }
  };

  const handleDescriptionChange = (content: string) => {
    setFormData(prev => ({ ...prev, description: content }));
  };

  const handleFileChange = (
    e: ChangeEvent<HTMLInputElement>,
    fileType: 'mediaFile' | 'posterFile'
  ) => {
    const file = e.target.files?.[0];
    const setPreview = fileType === 'mediaFile' ? setMediaFilePreview : setPosterFilePreview;

    if (file) {
      if (fileType === 'mediaFile' && formData.type !== 'image') {
        setError("Cannot upload a media file when type is not 'image'.");
        if (e.target) e.target.value = '';
        return;
      }
      setFormData(prev => ({ ...prev, [fileType]: file }));
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result as string);
      reader.readAsDataURL(file);
    } else {
      setFormData(prev => ({ ...prev, [fileType]: undefined }));
      setPreview(null);
    }
  };

  const resetForm = () => {
    setFormData(initialMediaFormData);
    setMediaFilePreview(null);
    setPosterFilePreview(null);
    setEditingItem(null);
    setError(null);
    setSuccess(null);
    const mediaInput = document.getElementById('mediaFile') as HTMLInputElement | null;
    if (mediaInput) mediaInput.value = "";
    const posterInput = document.getElementById('mediaPosterFile') as HTMLInputElement | null;
    if (posterInput) posterInput.value = "";
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    if (!formData.description || stripHtml(formData.description).trim() === '') {
      setError('Description is required.');
      setLoading(false);
      return;
    }
    if (formData.type === 'image' && !formData.mediaFile && !editingItem) {
      setError('An image file is required for new "Image" type items.');
      setLoading(false);
      return;
    }
    if (formData.type === 'image' && formData.mediaFile && !formData.mediaFile.type.startsWith('image/')) {
      setError('Please select a valid image file for the media.');
      setLoading(false);
      return;
    }
    if (formData.type === 'video') {
      if (!formData.youtubeUrl) {
        setError('A YouTube URL is required for type "Video".');
        setLoading(false);
        return;
      }
      if (!getYoutubeEmbedUrl(formData.youtubeUrl)) {
        setError('Invalid YouTube URL format.');
        setLoading(false);
        return;
      }
    }
    if (formData.posterFile && !formData.posterFile.type.startsWith('image/')) {
      setError('Please select a valid image file for the poster.');
      setLoading(false);
      return;
    }

    try {
      let resultMessage: string;
      if (editingItem) {
        const payload: Partial<MediaFormData> = { ...formData };
        // Ensure mediaFile and posterFile are only sent if they are new files
        if (!formData.mediaFile) delete payload.mediaFile;
        if (!formData.posterFile) delete payload.posterFile;

        const updatedItem = await updateMediaItem(editingItem.id, payload);
        resultMessage = `Media item "${updatedItem.title}" updated successfully!`;
      } else {
        const newItem = await addMediaItem(formData);
        resultMessage = `Media item "${newItem.title}" added successfully!`;
      }
      setSuccess(resultMessage);
      resetForm();
      fetchMedia();
    } catch (err) {
      setError(err instanceof Error ? err.message : `Failed to ${editingItem ? 'update' : 'add'} media item.`);
      console.error(`Error ${editingItem ? 'updating' : 'adding'} media item:`, err);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (item: MediaItem) => {
    setEditingItem(item);
    setFormData({
      title: item.title,
      date: item.date.split('T')[0],
      category: item.category,
      type: item.type,
      description: item.description || '',
      youtubeUrl: item.type === 'video' ? item.youtubeUrl || '' : '',
      mediaFile: undefined,
      posterFile: undefined,
    });
    setMediaFilePreview(null);
    setPosterFilePreview(null);
    setError(null);
    setSuccess(null);
    document.getElementById('mediaTitle')?.focus();
  };

  const handleDelete = async (id: number | string) => {
    if (window.confirm('Are you sure you want to delete this media item?')) {
      setLoading(true);
      setError(null);
      setSuccess(null);
      try {
        await deleteMediaItem(id);
        setSuccess('Media item deleted successfully!');
        fetchMedia();
        if (editingItem && editingItem.id === id) {
          resetForm();
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to delete media item.');
        console.error('Error deleting media item:', err);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleCancelEdit = () => {
    resetForm();
  };

  // Event handlers for filter and search
  const handleFilterChange = (e: ChangeEvent<HTMLSelectElement>) => {
    setFilterCategory(e.target.value);
  };

  const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  // Memoized list for filtered and searched items
  const filteredAndSearchedMediaItems = useMemo(() => {
    return mediaItems
      .filter(item => filterCategory === '' || item.category === filterCategory)
      .filter(item => item.title.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [mediaItems, filterCategory, searchTerm]);


  const renderMediaForm = () => (
    <Card className="mb-4 shadow-sm">
      <Card.Header as="h5" className="bg-dark text-white">
        {editingItem ? `Edit Media Item: ${editingItem.title}` : 'Add New Media Item'}
      </Card.Header>
      <Card.Body>
        <Form onSubmit={handleSubmit}>
          <Form.Group as={Row} className="mb-3" controlId="mediaTitle">
            <Form.Label column sm={3}>Title</Form.Label>
            <Col sm={9}><Form.Control type="text" name="title" value={formData.title} onChange={handleInputChange} required /></Col>
          </Form.Group>

          <Form.Group as={Row} className="mb-3" controlId="mediaDate">
            <Form.Label column sm={3}>Date</Form.Label>
            <Col sm={9}><Form.Control type="date" name="date" value={formData.date} onChange={handleInputChange} required /></Col>
          </Form.Group>

          <Form.Group as={Row} className="mb-3" controlId="mediaCategory">
            <Form.Label column sm={3}>Category</Form.Label>
            <Col sm={9}>
              <Form.Select name="category" value={formData.category} onChange={handleInputChange} required>
                {mediaCategories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
              </Form.Select>
            </Col>
          </Form.Group>

          <Form.Group as={Row} className="mb-3" controlId="mediaType">
            <Form.Label column sm={3}>Type</Form.Label>
            <Col sm={9}>
              <Form.Select name="type" value={formData.type} onChange={handleInputChange} required disabled={!!editingItem}>
                {mediaTypes.map(type => <option key={type} value={type}>{type.charAt(0).toUpperCase() + type.slice(1)}</option>)}
              </Form.Select>
              {editingItem && <Form.Text muted>Type cannot be changed after creation.</Form.Text>}
            </Col>
          </Form.Group>

          <Form.Group as={Row} className="mb-3" controlId="mediaDescription">
            <Form.Label column sm={3}>Description</Form.Label>
            <Col sm={9}>
              <ReactQuill theme="snow" value={formData.description} onChange={handleDescriptionChange} modules={quillModules} formats={quillFormats} style={{ minHeight: '150px', marginBottom: '40px' }} />
            </Col>
          </Form.Group>

          {formData.type === 'image' && (
            <Form.Group as={Row} className="mb-3" controlId="mediaFile">
              <Form.Label column sm={3}>Image File</Form.Label>
              <Col sm={9}>
                <Form.Control type="file" accept="image/*" onChange={(e: ChangeEvent<HTMLInputElement>) => handleFileChange(e, 'mediaFile')} required={!editingItem && formData.type === 'image'} />
                {editingItem && editingItem.type === 'image' && editingItem.src && !mediaFilePreview && (
                  <div className="mt-2">
                    <small className="text-muted d-block mb-1">Current Image (select new file to change):</small>
                    <img src={getFullImageUrl(BACKEND_URL, editingItem.src)} alt="Current media" style={{ maxWidth: '200px', maxHeight: '150px', borderRadius: '4px', border: '1px solid #dee2e6' }} />
                  </div>
                )}
              </Col>
            </Form.Group>
          )}
          {mediaFilePreview && formData.type === 'image' && (
            <Row className="mb-3"><Col sm={{ span: 9, offset: 3 }}><Card body className="text-center" style={{ width: 'fit-content' }}><Card.Text>New Image Preview:</Card.Text><img src={mediaFilePreview} alt="Media preview" style={{ maxWidth: '200px', maxHeight: '150px' }} /></Card></Col></Row>
          )}

          {formData.type === 'video' && (
            <>
              <Form.Group as={Row} className="mb-3" controlId="youtubeUrl">
                <Form.Label column sm={3}>YouTube Video URL</Form.Label>
                <Col sm={9}><Form.Control type="url" name="youtubeUrl" value={formData.youtubeUrl || ''} onChange={handleInputChange} placeholder="e.g., https://www.youtube.com/watch?v=dQw4w9WgXcQ" required /></Col>
              </Form.Group>
              {youtubeEmbedPreviewUrl && (
                <Row className="mb-3"><Col sm={{ span: 9, offset: 3 }}><Card body className="text-center" style={{ width: 'fit-content' }}><Card.Text>Video Preview:</Card.Text><iframe width="200" height="113" src={youtubeEmbedPreviewUrl} title="YouTube video player" frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen></iframe></Card></Col></Row>
              )}
              {editingItem && editingItem.type === 'video' && editingItem.src && !youtubeEmbedPreviewUrl && (
                <Row className="mb-3">
                  <Col sm={{ span: 9, offset: 3 }}>
                    <small className="text-muted d-block mb-1">Current Video (enter new URL to change):</small>
                    <iframe width="200" height="113" src={editingItem.src} title="Current YouTube video player" frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen></iframe>
                  </Col>
                </Row>
              )}
            </>
          )}

          <Form.Group as={Row} className="mb-3" controlId="mediaPosterFile">
            <Form.Label column sm={3}>{formData.type === 'video' ? 'Custom Video Poster (Optional)' : 'Poster Image (Optional)'}</Form.Label>
            <Col sm={9}>
              <Form.Control type="file" accept="image/*" onChange={(e: ChangeEvent<HTMLInputElement>) => handleFileChange(e, 'posterFile')} />
              {editingItem && editingItem.poster && !posterFilePreview && (
                <div className="mt-2">
                  <small className="text-muted d-block mb-1">Current Poster (select new file to change):</small>
                  <img src={getFullImageUrl(BACKEND_URL, editingItem.poster)} alt="Current poster" style={{ maxWidth: '200px', maxHeight: '150px', borderRadius: '4px', border: '1px solid #dee2e6' }} />
                </div>
              )}
            </Col>
          </Form.Group>
          {posterFilePreview && (
            <Row className="mb-3"><Col sm={{ span: 9, offset: 3 }}><Card body className="text-center" style={{ width: 'fit-content' }}><Card.Text>New Poster Preview:</Card.Text><img src={posterFilePreview} alt="Poster preview" style={{ maxWidth: '200px', maxHeight: '150px' }} /></Card></Col></Row>
          )}

          <Row>
            <Col sm={{ span: 9, offset: 3 }} className="d-flex">
              <Button type="submit" variant="primary" disabled={loading} className="me-2">
                {loading ? <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" /> : (editingItem ? 'Update Media Item' : 'Add Media Item')}
              </Button>
              {editingItem && <Button variant="outline-secondary" onClick={handleCancelEdit} disabled={loading}>Cancel Edit</Button>}
            </Col>
          </Row>
        </Form>
      </Card.Body>
    </Card>
  );

  const renderMediaList = () => {
    if (isLoadingList) return <div className="text-center p-5"><Spinner animation="border" role="status"><span className="visually-hidden">Loading media items...</span></Spinner></div>;
    if (listError) return <Alert variant="danger" className="text-center">{listError}</Alert>;

    return (
      <Card className="shadow-sm">
        <Card.Header as="h5" className="bg-dark text-white">Existing Media Items</Card.Header>
        <Card.Body>
          <Row className="mb-4 align-items-center">
            <Col md={5} lg={4} className="mb-2 mb-md-0">
              <Form.Group controlId="filterCategory">
                <Form.Label className="visually-hidden">Filter by Category</Form.Label>
                <Form.Select value={filterCategory} onChange={handleFilterChange} aria-label="Filter by category">
                  <option value="">All Categories</option>
                  {mediaCategories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={7} lg={8}>
              <Form.Group controlId="searchTerm">
                <Form.Label className="visually-hidden">Search by Title</Form.Label>
                <Form.Control
                  type="search"
                  placeholder="Search by title..."
                  value={searchTerm}
                  onChange={handleSearchChange}
                  aria-label="Search by title"
                />
              </Form.Group>
            </Col>
          </Row>

          {filteredAndSearchedMediaItems.length === 0 ? (
            <Alert variant="info" className="text-center">
              {mediaItems.length === 0 ? "No media items found. Add some using the form above." : "No media items match your current filters."}
            </Alert>
          ) : (
            <Row xs={1} sm={2} md={2} lg={3} xl={4} className="g-4">
              {filteredAndSearchedMediaItems.map(item => (
                <Col key={item.id}>
                  <Card className="h-100 shadow-hover">
                    {item.type === 'image' ? (
                      <Card.Img variant="top" src={getFullImageUrl(BACKEND_URL, item.src)} alt={item.title} style={{ height: '200px', objectFit: 'cover' }} />
                    ) : (
                      <div className="video-responsive-wrapper bg-dark" style={{ position: 'relative', paddingTop: '56.25%', height: 0, overflow: 'hidden', borderTopLeftRadius: 'var(--bs-card-inner-border-radius)', borderTopRightRadius: 'var(--bs-card-inner-border-radius)' }}>
                        <iframe
                          style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
                          src={item.src} // This should be the YouTube embed URL
                          title={item.title}
                          frameBorder="0"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                          loading="lazy"
                          poster={getFullImageUrl(BACKEND_URL, item.poster)}
                        ></iframe>
                      </div>
                    )}
                    <Card.Body className="d-flex flex-column">
                      <Card.Title className="h6">{item.title}</Card.Title>
                      <Card.Subtitle className="mb-2 text-muted small">{item.category} - {new Date(item.date).toLocaleDateString()}</Card.Subtitle>
                      <div className="media-description-truncate small flex-grow-1" dangerouslySetInnerHTML={{ __html: item.description || "" }} style={{ maxHeight: '70px', overflowY: 'auto', WebkitMaskImage: 'linear-gradient(to bottom, black 80%, transparent 100%)', maskImage: 'linear-gradient(to bottom, black 80%, transparent 100%)' }} />
                    </Card.Body>
                    <Card.Footer className="text-center bg-light">
                      <Button variant="outline-primary" size="sm" onClick={() => handleEdit(item)} className="me-2 px-3">Edit</Button>
                      <Button variant="outline-danger" size="sm" onClick={() => handleDelete(item.id)} className="px-3">Delete</Button>
                    </Card.Footer>
                  </Card>
                </Col>
              ))}
            </Row>
          )}
        </Card.Body>
      </Card>
    );
  };

  return (
    <Fade in={isCardVisible} timeout={300}>
      <Container fluid className="media-gallery-admin-page py-4 px-md-4">
        <Row className="justify-content-center">
          <Col lg={11} xl={10}>
            <h2 className="mb-4 text-center display-6">Manage Media Gallery</h2>
            {error && <Alert variant="danger" onClose={() => setError(null)} dismissible className="shadow-sm">{error}</Alert>}
            {success && <Alert variant="success" onClose={() => setSuccess(null)} dismissible className="shadow-sm">{success}</Alert>}

            {renderMediaForm()}

            <hr className="my-5" />

            {renderMediaList()}
          </Col>
        </Row>
      </Container>
    </Fade>
  );
};

export default ManageGallery;
