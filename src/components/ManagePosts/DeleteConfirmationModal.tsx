// src/components/ManagePosts/DeleteConfirmationModal.tsx
import React from 'react';
import { Modal, Button, Spinner, Alert } from 'react-bootstrap';

interface DeleteConfirmationModalProps {
  show: boolean;
  onHide: () => void;
  onConfirm: () => void;
  itemName: string | undefined;
  loading: boolean;
  error: string | null;
  clearError: () => void;
}

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

export default DeleteConfirmationModal;