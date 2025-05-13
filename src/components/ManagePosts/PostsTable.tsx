// src/components/ManagePosts/PostsTable.tsx
import React from 'react';
import { Table, Button, Badge } from 'react-bootstrap'; // Added Badge
import { NewsItem, EventItem } from '../../services/apiService'; // Adjusted path

type ItemType = 'news' | 'event';

interface PostsTableProps<T extends NewsItem | EventItem> {
  items: T[];
  itemType: ItemType;
  onEdit: (item: T, type: ItemType) => void;
  onDelete: (item: T, type: ItemType) => void;
  getYouTubeEmbedUrl: (url: string) => string | null; // Pass helper
}

const PostsTable = <T extends NewsItem | EventItem>({
  items,
  itemType,
  onEdit,
  onDelete,
  getYouTubeEmbedUrl,
}: PostsTableProps<T>) => {
  const isNewsItem = (item: NewsItem | EventItem): item is NewsItem => itemType === 'news';

  return (
    <Table striped bordered hover responsive="sm" className="mt-3 posts-table">
      <thead>
        <tr>
          <th style={{ width: '120px' }}>Image</th> {/* Adjusted width for potential badge */}
          <th>Title</th>
          <th>Date</th>
          {itemType === 'news' && <th>Category</th>}
          {itemType === 'event' && <><th>Time</th><th>Venue</th></>}
          <th>Featured</th>
          <th>YouTube</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        {items.map(item => (
          <tr key={item.id}>
            <td>
              {isNewsItem(item) && (item as NewsItem).image && (item as NewsItem).image.length > 0 ? (
                <div style={{ position: 'relative', width: '100px', height: '75px', margin: 'auto' }}>
                  <img
                    src={(item as NewsItem).image[0]} // Display the first image
                    alt={(item as NewsItem).imageAltText || item.title}
                    style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '4px' }}
                  />
                  {(item as NewsItem).image.length > 1 && (
                    <Badge 
                      pill 
                      bg="dark" 
                      style={{ 
                        position: 'absolute', 
                        bottom: '5px', 
                        right: '5px',
                        fontSize: '0.65rem',
                        opacity: 0.85
                      }}
                      title={`${(item as NewsItem).image.length} images total`}
                    >
                      1 / {(item as NewsItem).image.length}
                    </Badge>
                  )}
                </div>
              ) : !isNewsItem(item) && (item as EventItem).image ? (
                <img
                  src={(item as EventItem).image as string} // Image is string | null
                  alt={(item as EventItem).imageAltText || item.title}
                  style={{ width: '100px', height: 'auto', maxHeight: '75px', objectFit: 'cover', borderRadius: '4px', margin: 'auto', display: 'block' }}
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

export default PostsTable