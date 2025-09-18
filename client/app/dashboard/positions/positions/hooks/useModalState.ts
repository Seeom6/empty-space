import { useState, useCallback } from 'react'
import { Position, ModalState } from '../types'

/**
 * Hook for managing modal state in Position management
 * Provides consistent modal state management across components
 */
export const useModalState = () => {
  const [modalState, setModalState] = useState<ModalState>({
    isOpen: false,
    mode: 'create',
    position: null
  })

  // Open modal for creating new position
  const openCreateModal = useCallback(() => {
    setModalState({
      isOpen: true,
      mode: 'create',
      position: null
    })
  }, [])

  // Open modal for editing existing position
  const openEditModal = useCallback((position: Position) => {
    setModalState({
      isOpen: true,
      mode: 'edit',
      position
    })
  }, [])

  // Open modal for viewing position details
  const openViewModal = useCallback((position: Position) => {
    setModalState({
      isOpen: true,
      mode: 'view',
      position
    })
  }, [])

  // Close modal
  const closeModal = useCallback(() => {
    setModalState({
      isOpen: false,
      mode: 'create',
      position: null
    })
  }, [])

  // Check if modal is in specific mode
  const isCreateMode = modalState.mode === 'create'
  const isEditMode = modalState.mode === 'edit'
  const isViewMode = modalState.mode === 'view'

  // Get modal title based on mode
  const getModalTitle = useCallback(() => {
    switch (modalState.mode) {
      case 'create':
        return 'Create New Position'
      case 'edit':
        return `Edit ${modalState.position?.name || 'Position'}`
      case 'view':
        return modalState.position?.name || 'Position Details'
      default:
        return 'Position'
    }
  }, [modalState.mode, modalState.position?.name])

  // Get modal action button text
  const getActionButtonText = useCallback(() => {
    switch (modalState.mode) {
      case 'create':
        return 'Create Position'
      case 'edit':
        return 'Update Position'
      case 'view':
        return 'Close'
      default:
        return 'Save'
    }
  }, [modalState.mode])

  return {
    // State
    modalState,
    isOpen: modalState.isOpen,
    mode: modalState.mode,
    position: modalState.position,
    
    // Mode checks
    isCreateMode,
    isEditMode,
    isViewMode,
    
    // Actions
    openCreateModal,
    openEditModal,
    openViewModal,
    closeModal,
    
    // Helpers
    getModalTitle,
    getActionButtonText
  }
}
