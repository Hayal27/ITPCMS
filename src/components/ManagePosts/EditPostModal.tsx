// src/components/ManagePosts/EditPostModal.tsx
import React, { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import { Modal, Form, Button, Row, Col, Spinner, Alert } from 'react-bootstrap';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { NewsItem, EventItem, NewsFormData, EventFormData } from '../../services/apiService'; // Adjusted path
import { newsCategories as allNewsCategories, quillModules, quillFormats, stripHtml } from '../../pages/content/NewsEventsAdmin'; // Assuming these are still relevant and correctly pathed
import './NewsEdit.css'; // Assuming this CSS is still relevant

type ItemType = 'news' | 'event';
const MAX_NEWS_IMAGES_EDIT = 10; // Max images for news item edit

interface EditPostModalProps {
  show: boolean;
  onHide: () => void;
  item: NewsItem | EventItem | null;
  itemType: ItemType | null;
  onSubmit: (formData: Partial<NewsFormData> | Partial<EventFormData>, type: ItemType) => Promise<void>;
  loading: boolean;
  error: string | null;
  clearError: () => void;
}

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
      setValidationError(null); // Clear local validation errors
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
          // imageFiles will be populated if the user selects new files
        });
        if (news.image && news.image.length > 0) {
          initialImagePreview = news.image[0]; // Preview first existing image for reference
        }
      } else { // Event
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
          // imageFile will be set if user selects a new file
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
    setValidationError(null); // Clear validation error on new file selection

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
        setImagePreview(newsItem?.image?.[0] || null); // Revert to original first image for main preview if selection cleared
      }
    } else { // Event (single file)
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

    clearError(); // Clear backend error from previous attempts
    setValidationError(null); // Clear local validation error

    if (!formData.description || stripHtml(formData.description).trim() === '') {
        setValidationError("Description is required.");
        return;
    }

    // Removed mandatory image upload check for news items.
    // The backend will handle whether images are updated or not based on `req.files`.

    onSubmit(formData, itemType);
  };
  
  if (!item || !itemType) return null;
  const isNews = itemType === 'news';

  // Determine which previews to show for News
  // If new files are selected, show them. Otherwise, show existing images for reference.
  const currentNewsPreviews = newNewsImagePreviews.length > 0 
    ? newNewsImagePreviews 
    : (isNews && (item as NewsItem).image && (item as NewsItem).image.length > 0 ? (item as NewsItem).image : []);


  return (
    <Modal show={show} onHide={onHide} size="lg" backdrop="static" keyboard={false}>
      <Modal.Header closeButton>
        <Modal.Title>Edit {isNews ? 'News' : 'Event'} Item: {item.title}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {error && <Alert variant="danger" onClose={clearError} dismissible>{error}</Alert>}
        {validationError && <Alert variant="warning" onClose={() => setValidationError(null)} dismissible>{validationError}</Alert>}
        
        <Form onSubmit={handleSubmit}>
          {/* --- Common Fields --- */}
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
                  {allNewsCategories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
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

export default EditPostModal;