import React from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { AlertTriangle } from 'lucide-react';

interface DisbandConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  documentNumber: string;
  loading?: boolean;
}

export const DisbandConfirmationModal: React.FC<DisbandConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  documentNumber,
  loading = false,
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Подтверждение расформирования УПД">
      <div className="space-y-4">
        <div className="flex items-start space-x-3 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <h4 className="text-sm font-semibold text-yellow-800 mb-1">
              Внимание! Необратимое действие
            </h4>
            <p className="text-sm text-yellow-700">
              Вы собираетесь расформировать УПД <strong>{documentNumber}</strong>.
            </p>
          </div>
        </div>

        <div className="text-sm text-gray-600 space-y-2">
          <p>Это действие приведет к следующему:</p>
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li>УПД будет удален из системы</li>
            <li>Все позиции вернутся в Архив Приемок</li>
            <li>Позиции снова станут доступны для создания новых УПД</li>
          </ul>
        </div>

        <div className="flex justify-end space-x-3 pt-4">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={loading}
          >
            Отмена
          </Button>
          <Button
            variant="red"
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? 'Расформирование...' : 'Расформировать УПД'}
          </Button>
        </div>
      </div>
    </Modal>
  );
};
