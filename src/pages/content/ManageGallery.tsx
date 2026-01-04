// src/pages/content/ManageGallery.tsx
import React, { useState, ChangeEvent, FormEvent, useEffect, useMemo, useRef } from 'react';
import { Container, Row, Col, Form, Button, Card, Alert, Spinner, Fade, Badge } from 'react-bootstrap';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import {
  getMediaItems,
  addMediaItem,
  updateMediaItem,
  deleteMediaItem,
  MediaItem,
  MediaFormData,
  BACKEND_URL,
  getFullImageUrl
} from '../../services/apiService';
import './MediaGalleryAdmin.css';

// --- HELPERS ---
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

const stripHtml = (html: string): string => {
  const doc = new DOMParser().parseFromString(html, 'text/html');
  return doc.body.textContent || "";
};

const mediaCategories = [
  'Technology', 'Events', 'Campus Life', 'Innovation', 'Community', 'Behind the Scenes'
];

const mediaTypes = ['image', 'video'] as const;

const initialMediaFormData: MediaFormData = {
  title: '',
  date: new Date().toISOString().split('T')[0],
  category: mediaCategories[0],
  type: 'image',
  description: '',
  mediaFiles: [],
  posterFile: undefined,
  youtubeUrl: '',
};

const ManageGallery: React.FC = () => {
  const [formData, setFormData] = useState<MediaFormData>(initialMediaFormData);
  const [mediaFilePreviews, setMediaFilePreviews] = useState<{ file: File, url: string }[]>([]);
  const [posterFilePreview, setPosterFilePreview] = useState<string | null>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [isLoadingList, setIsLoadingList] = useState(true);
  const [editingItem, setEditingItem] = useState<MediaItem | null>(null);

  // Filter states
  const [filterCategory, setFilterCategory] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchMedia = async () => {
    setIsLoadingList(true);
    try {
      const items = await getMediaItems();
      setMediaItems(items);
    } catch (err) {
      console.error('Error fetching media items:', err);
    } finally {
      setIsLoadingList(false);
    }
  };

  useEffect(() => {
    fetchMedia();
  }, []);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleDescriptionChange = (content: string) => {
    setFormData(prev => ({ ...prev, description: content }));
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>, fileType: 'mediaFiles' | 'posterFile') => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    if (fileType === 'mediaFiles') {
      const fileArray = Array.from(files);
      const newPreviews = fileArray.map(file => ({
        file,
        url: URL.createObjectURL(file)
      }));
      setMediaFilePreviews(prev => [...prev, ...newPreviews]);
      setFormData(prev => ({
        ...prev,
        mediaFiles: [...(prev.mediaFiles || []), ...fileArray]
      }));
    } else {
      const file = files[0];
      setFormData(prev => ({ ...prev, posterFile: file }));
      setPosterFilePreview(URL.createObjectURL(file));
    }
  };

  const removeMediaFile = (index: number) => {
    setMediaFilePreviews(prev => {
      const updated = [...prev];
      URL.revokeObjectURL(updated[index].url);
      updated.splice(index, 1);
      return updated;
    });
    setFormData(prev => {
      const updatedFiles = [...(prev.mediaFiles || [])];
      updatedFiles.splice(index, 1);
      return { ...prev, mediaFiles: updatedFiles };
    });
  };

  const resetForm = () => {
    setFormData(initialMediaFormData);
    mediaFilePreviews.forEach(p => URL.revokeObjectURL(p.url));
    setMediaFilePreviews([]);
    if (posterFilePreview) URL.revokeObjectURL(posterFilePreview);
    setPosterFilePreview(null);
    setEditingItem(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    if (!formData.description || stripHtml(formData.description).trim() === '') {
      setError('Description is required.');
      setLoading(false); return;
    }

    try {
      if (editingItem) {
        // Only take the first file if multiple were selected during edit (usually edit is 1-to-1)
        const payload = { ...formData };
        await updateMediaItem(editingItem.id, payload);
        setSuccess('Media item updated successfully!');
      } else {
        await addMediaItem(formData);
        setSuccess(formData.mediaFiles && formData.mediaFiles.length > 1
          ? `Successfully added ${formData.mediaFiles.length} items!`
          : 'Media item added successfully!');
      }
      resetForm();
      fetchMedia();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Operation failed');
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
      youtubeUrl: item.type === 'video' ? item.src : '',
      mediaFiles: [],
      posterFile: undefined,
    });
    setMediaFilePreviews([]);
    setPosterFilePreview(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id: number | string) => {
    if (window.confirm('Delete this media item?')) {
      try {
        await deleteMediaItem(id);
        setSuccess('Item deleted');
        fetchMedia();
      } catch (err) {
        setError('Failed to delete');
      }
    }
  };

  const filteredMediaItems = useMemo(() => {
    return mediaItems
      .filter(item => !filterCategory || item.category === filterCategory)
      .filter(item => item.title.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [mediaItems, filterCategory, searchTerm]);

  return (
    <Container fluid className="media-gallery-admin-page py-5 px-md-5">
      <Row className="justify-content-center">
        <Col lg={11} xl={10}>
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h2 className="premium-title">Manage Media Gallery</h2>
            {success && <Badge bg="success" className="p-2 animate-slide-in">{success}</Badge>}
          </div>

          <Card className="admin-card mb-5">
            <div className="card-header-premium">
              <h5>{editingItem ? 'Edit Media Item' : 'Add New Media'}</h5>
              {editingItem && <Button variant="link" onClick={resetForm} className="text-muted p-0">Cancel Edit</Button>}
            </div>
            <Card.Body className="p-4">
              <Form onSubmit={handleSubmit}>
                <Row className="g-4">
                  <Col md={7}>
                    <Form.Group className="mb-3">
                      <Form.Label className="form-label-premium">Title</Form.Label>
                      <Form.Control
                        className="form-control-premium"
                        name="title"
                        value={formData.title}
                        onChange={handleInputChange}
                        required
                        placeholder="Enter catchy title..."
                      />
                    </Form.Group>

                    <Row>
                      <Col sm={6}>
                        <Form.Group className="mb-3">
                          <Form.Label className="form-label-premium">Date</Form.Label>
                          <Form.Control className="form-control-premium" type="date" name="date" value={formData.date} onChange={handleInputChange} required />
                        </Form.Group>
                      </Col>
                      <Col sm={6}>
                        <Form.Group className="mb-3">
                          <Form.Label className="form-label-premium">Category</Form.Label>
                          <Form.Select className="form-control-premium" name="category" value={formData.category} onChange={handleInputChange} required>
                            {mediaCategories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                          </Form.Select>
                        </Form.Group>
                      </Col>
                    </Row>

                    <Form.Group className="mb-3">
                      <Form.Label className="form-label-premium">Description</Form.Label>
                      <ReactQuill
                        theme="snow"
                        value={formData.description}
                        onChange={handleDescriptionChange}
                        style={{ height: '200px', marginBottom: '3rem' }}
                      />
                    </Form.Group>
                  </Col>

                  <Col md={5}>
                    <Form.Group className="mb-4">
                      <Form.Label className="form-label-premium">Media Type</Form.Label>
                      <div className="d-flex gap-3">
                        {mediaTypes.map(type => (
                          <Form.Check
                            key={type}
                            type="radio"
                            label={type.charAt(0).toUpperCase() + type.slice(1)}
                            name="type"
                            id={`type-${type}`}
                            checked={formData.type === type}
                            onChange={() => setFormData(prev => ({ ...prev, type }))}
                            className="premium-radio"
                          />
                        ))}
                      </div>
                    </Form.Group>

                    {formData.type === 'image' ? (
                      <div className="mb-4">
                        <Form.Label className="form-label-premium">Images</Form.Label>
                        <div
                          className="media-upload-zone"
                          onClick={() => fileInputRef.current?.click()}
                        >
                          <div className="upload-icon">📁</div>
                          <h6>Click to upload images</h6>
                          <p className="small text-muted">Supports JPG, PNG, WEBP (Multiple allowed)</p>
                          <input
                            type="file"
                            ref={fileInputRef}
                            multiple={!editingItem}
                            hidden
                            accept="image/*"
                            onChange={(e) => handleFileChange(e, 'mediaFiles')}
                          />
                        </div>
                        {mediaFilePreviews.length > 0 && (
                          <div className="preview-grid">
                            {mediaFilePreviews.map((p, idx) => (
                              <div key={idx} className="preview-item">
                                <img src={p.url} alt="preview" />
                                <button type="button" className="remove-btn" onClick={() => removeMediaFile(idx)}>×</button>
                              </div>
                            ))}
                          </div>
                        )}
                        {editingItem && !mediaFilePreviews.length && (
                          <div className="mt-2 text-center">
                            <img src={getFullImageUrl(BACKEND_URL, editingItem.src)} alt="current" className="img-thumbnail" style={{ maxHeight: '100px' }} />
                            <div className="small text-muted mt-1">Current Image</div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="mb-4">
                        <Form.Group className="mb-3">
                          <Form.Label className="form-label-premium">YouTube URL</Form.Label>
                          <Form.Control
                            className="form-control-premium"
                            placeholder="https://youtube.com/watch?v=..."
                            name="youtubeUrl"
                            value={formData.youtubeUrl}
                            onChange={handleInputChange}
                          />
                        </Form.Group>
                        {formData.youtubeUrl && getYoutubeEmbedUrl(formData.youtubeUrl) && (
                          <div className="ratio ratio-16x9 rounded overflow-hidden shadow-sm">
                            <iframe src={getYoutubeEmbedUrl(formData.youtubeUrl)!} title="preview" allowFullScreen></iframe>
                          </div>
                        )}
                      </div>
                    )}

                    <Form.Group className="mb-4">
                      <Form.Label className="form-label-premium">Poster Image (Optional)</Form.Label>
                      <Form.Control type="file" className="form-control-premium" accept="image/*" onChange={(e: any) => handleFileChange(e, 'posterFile')} />
                      {posterFilePreview && (
                        <div className="mt-2">
                          <img src={posterFilePreview} alt="poster" className="img-thumbnail" style={{ maxHeight: '80px' }} />
                        </div>
                      )}
                    </Form.Group>

                    <Button
                      type="submit"
                      variant="primary"
                      className="w-100 py-3 shadow-sm mt-3"
                      disabled={loading}
                      style={{ background: 'var(--primary-gradient)', border: 'none', fontWeight: 700 }}
                    >
                      {loading ? <Spinner size="sm" /> : (editingItem ? 'Update Item' : 'Add to Gallery')}
                    </Button>
                  </Col>
                </Row>
              </Form>
            </Card.Body>
          </Card>

          {/* LIST SECTION */}
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h4 className="fw-bold">Gallery Items ({filteredMediaItems.length})</h4>
            <div className="d-flex gap-2">
              <Form.Control
                size="sm"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="form-control-premium"
                style={{ width: '200px' }}
              />
              <Form.Select
                size="sm"
                className="form-control-premium"
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
              >
                <option value="">All Categories</option>
                {mediaCategories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
              </Form.Select>
            </div>
          </div>

          {isLoadingList ? (
            <div className="text-center py-5"><Spinner animation="grow" variant="primary" /></div>
          ) : (
            <Row className="g-4">
              {filteredMediaItems.map(item => (
                <Col key={item.id} xs={12} sm={6} md={4} xl={3} className="media-grid-item animate-slide-in">
                  <Card className="media-card-premium">
                    <div className="media-container">
                      {item.type === 'image' ? (
                        <img src={getFullImageUrl(BACKEND_URL, item.src)} alt={item.title} />
                      ) : (
                        <iframe src={item.src} title={item.title}></iframe>
                      )}
                      <div className="badge-category">{item.category}</div>
                    </div>
                    <Card.Body className="d-flex flex-column">
                      <Card.Title>{item.title}</Card.Title>
                      <div className="card-meta">
                        <span>📅 {new Date(item.date).toLocaleDateString()}</span>
                        <span>•</span>
                        <span>{item.type.toUpperCase()}</span>
                      </div>
                      <div className="action-buttons">
                        <Button className="btn-action btn-edit" onClick={() => handleEdit(item)}>Edit</Button>
                        <Button className="btn-action btn-delete" onClick={() => handleDelete(item.id)}>Delete</Button>
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
              ))}
            </Row>
          )}

          {error && <Alert variant="danger" className="mt-4 shadow-sm">{error}</Alert>}
        </Col>
      </Row>
    </Container>
  );
};

export default ManageGallery;
