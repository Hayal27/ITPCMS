import React, { useState, ChangeEvent, FormEvent, useEffect, useMemo } from 'react';
import { Container, Row, Col, Form, Button, Card, Alert, Spinner, Fade } from 'react-bootstrap';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import axios, { AxiosRequestConfig, AxiosError } from 'axios';
import './MediaGalleryAdmin.css';

// --- START: API service section ---
export const BACKEND_URL = "https://api-cms.startechaigroup.com";

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

export interface MediaItem {
  id: number | string;
  title: string;
  type: 'image' | 'video';
  src: string; // URL of the image, or YouTube embed URL for video
  date: string;
  category: string;
  description?: string;
  poster?: string; // URL of video poster (can be custom or YouTube-generated)
}

export type MediaFormData = Omit<MediaItem, 'id' | 'src' | 'poster'> & {
  mediaFile?: File;   // For image file
  posterFile?: File;  // Optional: for custom video poster
  youtubeUrl?: string; // For YouTube video link
};

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
    // Try regex for non-standard URLs or if URL constructor fails
    const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
    const match = url.match(regex);
    videoId = match ? match[1] : null;
    return videoId ? `https://www.youtube.com/embed/${videoId}` : null;
  }
};


const buildMediaFormData = (mediaData: MediaFormData | Partial<MediaFormData>): FormData => {
  const formData = new FormData();
  (Object.keys(mediaData) as Array<keyof typeof mediaData>).forEach(key => {
    if (key === 'mediaFile' || key === 'posterFile' || key === 'youtubeUrl') return;

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
      formData.append('src', embedUrl); // Send the embed URL as src
    }
    formData.append('youtubeUrl', mediaData.youtubeUrl); // Also send original for backend reference if needed
  }

  if (mediaData.posterFile instanceof File) {
    formData.append('posterFile', mediaData.posterFile, mediaData.posterFile.name);
  }
  return formData;
};

export const addMediaItem = async (mediaData: MediaFormData): Promise<MediaItem> => {
  const formData = buildMediaFormData(mediaData);
  return request<MediaItem>('/media', {
    method: 'POST',
    data: formData,
  });
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
  'header', 'bold', 'italic', 'underline', 'strike',
  'list', 'bullet', 'link', 'image', 'video', 'align'
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

const MediaGalleryAdmin: React.FC = () => {
  const [formData, setFormData] = useState<MediaFormData>(initialMediaFormData);
  const [mediaFilePreview, setMediaFilePreview] = useState<string | null>(null);
  const [posterFilePreview, setPosterFilePreview] = useState<string | null>(null);

  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isCardVisible, setIsCardVisible] = useState(false);

  useEffect(() => { setIsCardVisible(true); }, []);

  const youtubeEmbedPreviewUrl = useMemo(() => {
    if (formData.type === 'video' && formData.youtubeUrl) {
      return getYoutubeEmbedUrl(formData.youtubeUrl);
    }
    return null;
  }, [formData.type, formData.youtubeUrl]);

  const handleInputChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => {
      const newState = { ...prev, [name]: value };
      if (name === 'type') {
        if (value === 'image') {
          newState.youtubeUrl = ''; // Clear YouTube URL if switching to image
        } else if (value === 'video') {
          newState.mediaFile = undefined; // Clear media file if switching to video
          setMediaFilePreview(null);
          const mediaInput = document.getElementById('mediaFile') as HTMLInputElement | null;
          if (mediaInput) mediaInput.value = "";
        }
      }
      return newState;
    });
    if (name === 'type' && value === 'image') {
      // Clear poster file and preview if type changes to image AND it was a video before
      // (assuming poster is mainly for videos)
      // If poster can be for images too, this logic might change
      setFormData(prev => ({ ...prev, posterFile: undefined }));
      setPosterFilePreview(null);
      const posterInput = document.getElementById('mediaPosterFile') as HTMLInputElement | null;
      if (posterInput) posterInput.value = "";
    }
  };

  const handleDescriptionChange = (content: string) => {
    setFormData(prev => ({ ...prev, description: content }));
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>, fileType: 'mediaFile' | 'posterFile') => {
    const file = e.target.files?.[0];
    const setPreview = fileType === 'mediaFile' ? setMediaFilePreview : setPosterFilePreview;

    if (file) {
      // Ensure mediaFile is only set if type is 'image'
      if (fileType === 'mediaFile' && formData.type !== 'image') {
        setError("Cannot upload a media file when type is not 'image'.");
        if (e.target) e.target.value = ''; // Clear the input
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
    // if (e.target) e.target.value = ''; // Allow re-selecting the same file - commented out as it can be annoying
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    if (!formData.description || stripHtml(formData.description).trim() === '') {
      setError('Description is required.');
      setLoading(false); return;
    }

    if (formData.type === 'image' && !formData.mediaFile) {
      setError('An image file is required for type "Image".');
      setLoading(false); return;
    }
    if (formData.type === 'image' && formData.mediaFile && !formData.mediaFile.type.startsWith('image/')) {
      setError('Please select a valid image file.');
      setLoading(false); return;
    }

    if (formData.type === 'video') {
      if (!formData.youtubeUrl) {
        setError('A YouTube URL is required for type "Video".');
        setLoading(false); return;
      }
      const embedUrl = getYoutubeEmbedUrl(formData.youtubeUrl);
      if (!embedUrl) {
        setError('Invalid YouTube URL format. Please provide a valid YouTube video link.');
        setLoading(false); return;
      }
    }

    if (formData.posterFile && !formData.posterFile.type.startsWith('image/')) {
      setError('Please select a valid image file for the poster.');
      setLoading(false); return;
    }

    try {
      const result = await addMediaItem(formData);
      setSuccess(`Media item "${result.title}" added successfully!`);
      setFormData(initialMediaFormData);
      setMediaFilePreview(null);
      setPosterFilePreview(null);

      const mediaInput = document.getElementById('mediaFile') as HTMLInputElement | null;
      if (mediaInput) mediaInput.value = "";
      const posterInput = document.getElementById('mediaPosterFile') as HTMLInputElement | null;
      if (posterInput) posterInput.value = "";
      // No need to clear youtubeUrl input as setFormData(initialMediaFormData) handles it.

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add media item.');
      console.error('Error adding media item:', err);
    } finally {
      setLoading(false);
    }
  };

  const renderMediaForm = () => (
    <Form onSubmit={handleSubmit}>
      <Row>
        <Col md={8}>
          <Form.Group className="mb-3" controlId="mediaTitle">
            <Form.Label>Title</Form.Label>
            <Form.Control type="text" name="title" value={formData.title} onChange={handleInputChange} required />
          </Form.Group>

          <Row>
            <Col md={6}>
              <Form.Group className="mb-3" controlId="mediaDate">
                <Form.Label>Date</Form.Label>
                <Form.Control type="date" name="date" value={formData.date} onChange={handleInputChange} required />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3" controlId="mediaCategory">
                <Form.Label>Category</Form.Label>
                <Form.Select name="category" value={formData.category} onChange={handleInputChange} required>
                  {mediaCategories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>

          <Form.Group className="mb-3" controlId="mediaType">
            <Form.Label>Type</Form.Label>
            <Form.Select name="type" value={formData.type} onChange={handleInputChange} required>
              {mediaTypes.map(type => <option key={type} value={type}>{type.charAt(0).toUpperCase() + type.slice(1)}</option>)}
            </Form.Select>
          </Form.Group>

          <Form.Group className="mb-3" controlId="mediaDescription">
            <Form.Label>Description</Form.Label>
            <ReactQuill
              theme="snow"
              value={formData.description}
              onChange={handleDescriptionChange}
              modules={quillModules}
              formats={quillFormats}
              className="quill-editor-container"
            />
          </Form.Group>
        </Col>

        <Col md={4}>
          {formData.type === 'image' && (
            <Form.Group className="mb-3" controlId="mediaFile">
              <Form.Label>Image File</Form.Label>
              <Form.Control
                type="file"
                name="mediaFile"
                accept="image/*"
                onChange={(e: ChangeEvent<HTMLInputElement>) => handleFileChange(e, 'mediaFile')}
                required={formData.type === 'image'}
              />
            </Form.Group>
          )}
          {mediaFilePreview && formData.type === 'image' && (
            <div className="image-preview-container mt-2 text-center">
              <p className="small text-muted mb-1">Image Preview:</p>
              <img src={mediaFilePreview} alt="Media preview" className="image-preview" />
            </div>
          )}

          {formData.type === 'video' && (
            <>
              <Form.Group className="mb-3" controlId="youtubeUrl">
                <Form.Label>YouTube Video URL</Form.Label>
                <Form.Control
                  type="url"
                  name="youtubeUrl"
                  value={formData.youtubeUrl || ''}
                  onChange={handleInputChange}
                  placeholder="e.g., https://www.youtube.com/watch?v=VIDEO_ID"
                  required={formData.type === 'video'}
                />
              </Form.Group>
              {youtubeEmbedPreviewUrl && (
                <div className="image-preview-container mt-2 text-center">
                  <p className="small text-muted mb-1">Video Preview:</p>
                  <iframe
                    className="image-preview" // Re-use class, might need specific styling for aspect ratio
                    src={youtubeEmbedPreviewUrl}
                    title="YouTube video player"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    style={{ width: '100%', aspectRatio: '16/9' }} // Basic responsive iframe
                  ></iframe>
                </div>
              )}
            </>
          )}

          {/* Poster File input - can be used for custom video thumbnails */}
          <Form.Group className="mb-3 mt-3" controlId="mediaPosterFile">
            <Form.Label>
              {formData.type === 'video' ? 'Custom Video Poster (Optional)' : 'Poster Image (Optional)'}
            </Form.Label>
            <Form.Control
              type="file"
              name="posterFile"
              accept="image/*"
              onChange={(e: ChangeEvent<HTMLInputElement>) => handleFileChange(e, 'posterFile')}
            />
          </Form.Group>
          {posterFilePreview && (
            <div className="image-preview-container mt-2 text-center">
              <p className="small text-muted mb-1">Poster Preview:</p>
              <img src={posterFilePreview} alt="Poster preview" className="image-preview" />
            </div>
          )}
        </Col>
      </Row>

      <Button variant="primary" type="submit" disabled={loading} className="mt-3 submit-button">
        {loading ? <><Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" /> Adding Media...</> : 'Add Media Item'}
      </Button>
    </Form>
  );

  return (
    <Container className="py-5 media-gallery-admin-page">
      <Row className="justify-content-center">
        <Col lg={10} xl={8}>
          <Fade in={isCardVisible} timeout={500}>
            <Card className={`shadow-sm admin-card ${isCardVisible ? 'fade-in-card' : ''}`}>
              <Card.Header as="h2" className="text-center text-primary">Manage Media Gallery</Card.Header>
              <Card.Body>
                <Fade in={!!error} unmountOnExit>
                  <Alert variant="danger" onClose={() => setError(null)} dismissible>{error}</Alert>
                </Fade>
                <Fade in={!!success} unmountOnExit>
                  <Alert variant="success" onClose={() => setSuccess(null)} dismissible>{success}</Alert>
                </Fade>

                <div className="tab-content-custom p-3">
                  {renderMediaForm()}
                </div>

              </Card.Body>
            </Card>
          </Fade>
        </Col>
      </Row>
    </Container>
  );
};

export default MediaGalleryAdmin;