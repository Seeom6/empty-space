import { useState, useCallback } from 'react'
import { Technology, ModalState } from '../types'

interface UseModalStateReturn {
  modalState: ModalState
  openCreateModal: () => void
  openEditModal: (technology: Technology) => void
  openViewModal: (technology: Technology) => void
  closeModal: () => void
  isCreateMode: boolean
  isEditMode: boolean
  isViewMode: boolean
}

export const useModalState = (): UseModalStateReturn => {
  const [modalState, setModalState] = useState<ModalState>({
    isOpen: false,
    mode: 'create',
    technology: null
  })

  const openCreateModal = useCallback(() => {
    setModalState({
      isOpen: true,
      mode: 'create',
      technology: null
    })
  }, [])

  const openEditModal = useCallback((technology: Technology) => {
    setModalState({
      isOpen: true,
      mode: 'edit',
      technology
    })
  }, [])

  const openViewModal = useCallback((technology: Technology) => {
    setModalState({
      isOpen: true,
      mode: 'view',
      technology
    })
  }, [])

  const closeModal = useCallback(() => {
    setModalState(prev => ({
      ...prev,
      isOpen: false
    }))
  }, [])

  const isCreateMode = modalState.mode === 'create'
  const isEditMode = modalState.mode === 'edit'
  const isViewMode = modalState.mode === 'view'

  return {
    modalState,
    openCreateModal,
    openEditModal,
    openViewModal,
    closeModal,
    isCreateMode,
    isEditMode,
    isViewMode
  }
}
