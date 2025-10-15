import React, { useState, useEffect } from 'react';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { Alert } from '../ui/Alert';
import { laborPaymentService, type LaborPayment } from '../../services/laborPaymentService';
import { Search } from 'lucide-react';

interface LaborPaymentSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (payment: LaborPayment) => void;
}

export const LaborPaymentSelectionModal: React.FC<LaborPaymentSelectionModalProps> = ({
  isOpen,
  onClose,
  onSelect,
}) => {
  const [payments, setPayments] = useState<LaborPayment[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      loadPayments();
    }
  }, [isOpen]);

  const loadPayments = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await laborPaymentService.getAll();
      setPayments(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка загрузки данных');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    if (!query.trim()) {
      loadPayments();
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const data = await laborPaymentService.search(query);
      setPayments(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка поиска');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelect = (payment: LaborPayment) => {
    onSelect(payment);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Выбор оплаты труда">
      <div className="space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <Input
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Поиск по названию оплаты или полному ФИО..."
            className="pl-10"
          />
        </div>

        {error && <Alert variant="error">{error}</Alert>}

        <div className="max-h-96 overflow-y-auto border rounded-lg">
          {isLoading ? (
            <div className="p-8 text-center text-gray-500">Загрузка...</div>
          ) : payments.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              {searchQuery ? 'Ничего не найдено' : 'Нет данных'}
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-50 sticky top-0">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ФИО
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Полное ФИО
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Название оплаты
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Должность
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ставка ₽/час
                  </th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {payments.map((payment) => (
                  <tr
                    key={payment.id}
                    className="hover:bg-gray-50 cursor-pointer"
                    onClick={() => handleSelect(payment)}
                  >
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {payment.short_name}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {payment.full_name}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {payment.payment_name}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {payment.position}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {payment.hourly_rate}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <Button
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSelect(payment);
                        }}
                      >
                        Выбрать
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="flex justify-end">
          <Button variant="outline" onClick={onClose}>
            Отмена
          </Button>
        </div>
      </div>
    </Modal>
  );
};
