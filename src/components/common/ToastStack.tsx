import type { MouseEvent } from 'react';

export interface ToastMessage {
  id: number;
  title: string;
  body: string;
}

interface ToastStackProps {
  toasts: ToastMessage[];
  onDismiss: (id: number) => void;
}

export const ToastStack = ({ toasts, onDismiss }: ToastStackProps) => {
  if (toasts.length === 0) {
    return null;
  }

  const handleDismiss = (event: MouseEvent<HTMLButtonElement>, id: number) => {
    event.stopPropagation();
    onDismiss(id);
  };

  return (
    <div className="toast-stack" aria-live="polite" aria-atomic="true">
      {toasts.map((toast) => (
        <div key={toast.id} className="toast-item">
          <div className="toast-content">
            <p className="toast-title">{toast.title}</p>
            <p className="toast-body">{toast.body}</p>
          </div>
          <button type="button" className="toast-close" onClick={(event) => handleDismiss(event, toast.id)}>
            ×
          </button>
        </div>
      ))}
    </div>
  );
};
