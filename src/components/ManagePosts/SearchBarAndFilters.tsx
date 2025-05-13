// src/components/ManagePosts/SearchBarAndFilters.tsx
import React, { ChangeEvent } from 'react';
import { Row, Col, Form, InputGroup } from 'react-bootstrap';

interface SearchBarAndFiltersProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
  filterFeatured: string; // 'all', 'yes', 'no'
  onFeaturedChange: (value: string) => void;
  itemType: 'news' | 'event';
  newsCategories?: string[];
  selectedCategory: string; // 'all' or specific category
  onCategoryChange?: (category: string) => void;
}

const SearchBarAndFilters: React.FC<SearchBarAndFiltersProps> = ({
  searchTerm,
  onSearchChange,
  filterFeatured,
  onFeaturedChange,
  itemType,
  newsCategories,
  selectedCategory,
  onCategoryChange,
}) => {
  return (
    <Row className="mb-3 gx-2 gy-2 align-items-end">
      <Col md={itemType === 'news' ? 4 : 6}>
        <Form.Group controlId="searchTerm">
          <Form.Label>Search by Title</Form.Label>
          <InputGroup>
            <InputGroup.Text><i className="bi bi-search"></i></InputGroup.Text>
            <Form.Control
              type="text"
              placeholder="Enter title..."
              value={searchTerm}
              onChange={(e: ChangeEvent<HTMLInputElement>) => onSearchChange(e.target.value)}
            />
          </InputGroup>
        </Form.Group>
      </Col>
      {itemType === 'news' && newsCategories && onCategoryChange && (
        <Col md={4}>
          <Form.Group controlId="filterCategory">
            <Form.Label>Filter by Category</Form.Label>
            <Form.Select
              value={selectedCategory}
              onChange={(e: ChangeEvent<HTMLSelectElement>) => onCategoryChange(e.target.value)}
            >
              <option value="all">All Categories</option>
              {newsCategories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </Form.Select>
          </Form.Group>
        </Col>
      )}
      <Col md={itemType === 'news' ? 4 : 6}>
        <Form.Group controlId="filterFeatured">
          <Form.Label>Filter by Featured</Form.Label>
          <Form.Select
            value={filterFeatured}
            onChange={(e: ChangeEvent<HTMLSelectElement>) => onFeaturedChange(e.target.value)}
          >
            <option value="all">All</option>
            <option value="yes">Featured</option>
            <option value="no">Not Featured</option>
          </Form.Select>
        </Form.Group>
      </Col>
    </Row>
  );
};

export default SearchBarAndFilters;