import React from 'react';
import { useToast } from '../../context/ToastContext';
import ToastContainer from './Toast';

const ToastWrapper: React.FC = () => {
  const { toasts, removeToast } = useToast();

  return <ToastContainer toasts={toasts} onRemove={removeToast} />;
};

export default ToastWrapper;
