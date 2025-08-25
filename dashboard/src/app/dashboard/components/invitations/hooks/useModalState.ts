import { useState, useCallback } from 'react'
import { ModalState } from '../types'

interface UseModalStateReturn<T = any> {
  modalState: ModalState<T>
  openCreateModal: () => void
  openEditModal: (data: T) => void
  openViewModal: (data: T) => void
  openResendModal: (data: T) => void
  closeModal: () => void
  isCreateMode: boolean
  isEditMode: boolean
  isViewMode: boolean
  isResendMode: boolean
}

export const useModalState = <T = any>(): UseModalStateReturn<T> => {
  const [modalState, setModalState] = useState<ModalState<T>>({
    isOpen: false,
    mode: 'create',
    data: null
  })

  const openCreateModal = useCallback(() => {
    setModalState({
      isOpen: true,
      mode: 'create',
      data: null
    })
  }, [])

  const openEditModal = useCallback((data: T) => {
    setModalState({
      isOpen: true,
      mode: 'edit',
      data
    })
  }, [])

  const openViewModal = useCallback((data: T) => {
    setModalState({
      isOpen: true,
      mode: 'view',
      data
    })
  }, [])

  const openResendModal = useCallback((data: T) => {
    setModalState({
      isOpen: true,
      mode: 'resend',
      data
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
  const isResendMode = modalState.mode === 'resend'

  return {
    modalState,
    openCreateModal,
    openEditModal,
    openViewModal,
    openResendModal,
    closeModal,
    isCreateMode,
    isEditMode,
    isViewMode,
    isResendMode
  }
}
