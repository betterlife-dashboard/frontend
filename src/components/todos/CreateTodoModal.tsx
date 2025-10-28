import { useEffect } from 'react';
import { type TodoRequestPayload } from '@/types/todo';
import { CreateTodoForm } from './CreateTodoForm';

interface CreateTodoModalProps {
  isOpen: boolean;
  selectedDate: string;
  onSubmit: (payload: TodoRequestPayload) => Promise<void>;
  onClose: () => void;
}

export const CreateTodoModal = ({ isOpen, selectedDate, onSubmit, onClose }: CreateTodoModalProps) => {
  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }

    const keyHandler = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', keyHandler);
    return () => window.removeEventListener('keydown', keyHandler);
  }, [isOpen, onClose]);

  if (!isOpen) {
    return null;
  }

  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true">
      <div className="modal-card card">
        <div className="modal-header">
          <h2 className="section-title" style={{ fontSize: '24px' }}>
            새로운 할 일
          </h2>
          <button type="button" className="muted-button" onClick={onClose}>
            닫기
          </button>
        </div>
        <p className="text-caption">선택한 날짜에 추가할 할 일을 아래에 입력하세요.</p>
        <CreateTodoForm
          selectedDate={selectedDate}
          withIntro={false}
          onSubmit={async (payload) => {
            await onSubmit(payload);
            onClose();
          }}
        />
      </div>
    </div>
  );
};
