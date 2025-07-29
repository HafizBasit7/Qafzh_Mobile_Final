import { useState, useCallback } from 'react';

export const useModal = () => {
  const [modalState, setModalState] = useState({
    visible: false,
    type: 'success',
    title: '',
    message: '',
    actionText: '',
    onAction: null,
    autoClose: true,
    duration: 3000,
  });

  const showModal = useCallback(({
    type = 'success',
    title,
    message,
    actionText,
    onAction,
    autoClose = true,
    duration = 3000,
  }) => {
    setModalState({
      visible: true,
      type,
      title,
      message,
      actionText,
      onAction,
      autoClose,
      duration,
    });
  }, []);

  const hideModal = useCallback(() => {
    setModalState(prev => ({ ...prev, visible: false }));
  }, []);

  // Convenience methods
  const showSuccess = useCallback((title, message, options = {}) => {
    showModal({
      type: 'success',
      title,
      message,
      ...options,
    });
  }, [showModal]);

  const showError = useCallback((title, message, options = {}) => {
    showModal({
      type: 'error',
      title,
      message,
      autoClose: false, // Error modals should not auto-close
      ...options,
    });
  }, [showModal]);

  const showWarning = useCallback((title, message, options = {}) => {
    showModal({
      type: 'warning',
      title,
      message,
      ...options,
    });
  }, [showModal]);

  const showInfo = useCallback((title, message, options = {}) => {
    showModal({
      type: 'info',
      title,
      message,
      ...options,
    });
  }, [showModal]);

  return {
    modalState,
    showModal,
    hideModal,
    showSuccess,
    showError,
    showWarning,
    showInfo,
  };
}; 