import React, { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import { Container, Row, Col, Form, Button, Card, Alert, Spinner, Table, Badge, Modal } from 'react-bootstrap';
import { getMediaItems, addMediaItem, MediaItem, MediaFormData, BACKEND_URL } from '../../services/apiService';
import { FaUpload, FaTrash, FaEye, FaPlus, FaVideo, FaImage } from 'react-icons/fa';

const MediaLibraryPage: React.FC = () => {
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showUploadModal, setShowUploadModal] = useState(false);

  // Form Stats
  const [formData, setFormData] = useState<MediaFormData>({
    title: '',
    date: new Date().toISOString().split('T')[0],
    category: 'General',
    type: 'image',
    description: '',
    mediaFiles: [],
    youtubeUrl: ''
  });

  const categories = ['General', 'Architecture', 'Innovation', 'Events', 'Technology'];

  useEffect(() => {
    fetchMedia();
  }, []);

  const fetchMedia = async () => {
    try {
      const items = await getMediaItems();
      setMediaItems(items);
    } catch (err) {
      setError('Failed to fetch media items');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFormData(prev => ({ ...prev, mediaFiles: Array.from(e.target.files!) }));
    }
  };

  const getYoutubeEmbedUrl = (url: string): string | null => {
    if (!url) return null;
    let videoId = null;
    const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
    const match = url.match(regex);
    videoId = match ? match[1] : null;
    return videoId ? `https://www.youtube.com/embed/${videoId}` : null;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setUploading(true);
    setError(null);
    setSuccess(null);

    try {
      let finalData = { ...formData };
      if (formData.type === 'video' && formData.youtubeUrl) {
        const embedUrl = getYoutubeEmbedUrl(formData.youtubeUrl);
        if (!embedUrl) throw new Error('Invalid YouTube URL');
        finalData.src = embedUrl;
      }

      await addMediaItem(finalData);
      setSuccess('Media uploaded successfully!');
      setShowUploadModal(false);
      setFormData({
        title: '',
        date: new Date().toISOString().split('T')[0],
        category: 'General',
        type: 'image',
        description: '',
        mediaFiles: [],
        youtubeUrl: ''
      });
      fetchMedia();
    } catch (err: any) {
      setError(err.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="p-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold">Media Library</h2>
          <p className="text-muted">Manage your digital assets and gallery content</p>
        </div>
        <Button variant="primary" onClick={() => setShowUploadModal(true)} className="d-flex align-items-center gap-2">
          <FaPlus /> Upload Media
        </Button>
      </div>

      {error && <Alert variant="danger" dismissible onClose={() => setError(null)}>{error}</Alert>}
      {success && <Alert variant="success" dismissible onClose={() => setSuccess(null)}>{success}</Alert>}

      <Card className="border-0 shadow-sm">
        <Card.Body>
          {loading ? (
            <div className="text-center py-5">
              <Spinner animation="border" variant="primary" />
            </div>
          ) : (
            <Table responsive hover className="align-middle">
              <thead className="bg-light">
                <tr>
                  <th>Preview</th>
                  <th>Title</th>
                  <th>Type</th>
                  <th>Category</th>
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {mediaItems.map((item) => (
                  <tr key={item.id}>
                    <td>
                      {item.type === 'image' ? (
                        <img
                          src={`${BACKEND_URL}${item.src}`}
                          alt={item.title}
                          style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '8px' }}
                        />
                      ) : (
                        <div className="bg-dark d-flex align-items-center justify-content-center" style={{ width: '60px', height: '60px', borderRadius: '8px' }}>
                          <FaVideo className="text-white" />
                        </div>
                      )}
                    </td>
                    <td>
                      <div className="fw-bold">{item.title}</div>
                      <small className="text-muted d-block text-truncate" style={{ maxWidth: '200px' }}>
                        {item.description || 'No description'}
                      </small>
                    </td>
                    <td>
                      {item.type === 'image' ?
                        <Badge bg="info" className="text-white"><FaImage className="me-1" /> Image</Badge> :
                        <Badge bg="warning"><FaVideo className="me-1" /> Video</Badge>
                      }
                    </td>
                    <td><Badge bg="light" className="text-dark border">{item.category}</Badge></td>
                    <td>{new Date(item.date).toLocaleDateString()}</td>
                    <td>
                      <div className="d-flex gap-2">
                        <Button variant="outline-secondary" size="sm" onClick={() => window.open(item.type === 'image' ? `${BACKEND_URL}${item.src}` : item.src, '_blank')}>
                          <FaEye />
                        </Button>
                        <Button variant="outline-danger" size="sm">
                          <FaTrash />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
                {mediaItems.length === 0 && (
                  <tr>
                    <td colSpan={6} className="text-center py-4 text-muted">
                      No media items found. Start by uploading some!
                    </td>
                  </tr>
                )}
              </tbody>
            </Table>
          )}
        </Card.Body>
      </Card>

      {/* Upload Modal */}
      <Modal show={showUploadModal} onHide={() => setShowUploadModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Upload New Media</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit}>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Item Title</Form.Label>
                  <Form.Control
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    required
                    placeholder="e.g. Innovation Hub Opening"
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Category</Form.Label>
                  <Form.Select name="category" value={formData.category} onChange={handleInputChange}>
                    {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Media Type</Form.Label>
                  <div className="d-flex gap-3 mt-2">
                    <Form.Check
                      type="radio"
                      label="Image(s)"
                      name="type"
                      value="image"
                      checked={formData.type === 'image'}
                      onChange={handleInputChange}
                    />
                    <Form.Check
                      type="radio"
                      label="YouTube Video"
                      name="type"
                      value="video"
                      checked={formData.type === 'video'}
                      onChange={handleInputChange}
                    />
                  </div>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Date</Form.Label>
                  <Form.Control
                    type="date"
                    name="date"
                    value={formData.date}
                    onChange={handleInputChange}
                    required
                  />
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Label>Description</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Short description for the gallery..."
              />
            </Form.Group>

            {formData.type === 'image' ? (
              <Form.Group className="mb-3">
                <Form.Label>Select Images (Multiple allowed)</Form.Label>
                <div className="border p-4 rounded text-center bg-light" style={{ borderStyle: 'dashed !important' }}>
                  <input
                    type="file"
                    multiple
                    onChange={handleFileChange}
                    className="d-none"
                    id="fileInput"
                    accept="image/*"
                  />
                  <label htmlFor="fileInput" className="btn btn-outline-primary mb-2">
                    <FaUpload className="me-2" /> Choose Files
                  </label>
                  <p className="small text-muted mb-0">
                    {formData.mediaFiles && formData.mediaFiles.length > 0
                      ? `${formData.mediaFiles.length} files selected`
                      : 'Allowed formats: JPG, PNG, WEBP. You can select up to 20 images.'}
                  </p>
                </div>
              </Form.Group>
            ) : (
              <Form.Group className="mb-3">
                <Form.Label>YouTube URL</Form.Label>
                <Form.Control
                  type="url"
                  name="youtubeUrl"
                  value={formData.youtubeUrl}
                  onChange={handleInputChange}
                  placeholder="https://www.youtube.com/watch?v=..."
                  required={formData.type === 'video'}
                />
              </Form.Group>
            )}

            <div className="d-flex justify-content-end gap-2 mt-4">
              <Button variant="light" onClick={() => setShowUploadModal(false)}>Cancel</Button>
              <Button variant="primary" type="submit" disabled={uploading}>
                {uploading ? <Spinner size="sm" className="me-2" /> : <FaUpload className="me-2" />}
                {uploading ? 'Uploading...' : 'Start Upload'}
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default MediaLibraryPage;