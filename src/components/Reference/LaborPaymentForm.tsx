import React, { useState } from 'react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Alert } from '../ui/Alert';
import { laborPaymentService, type NewLaborPayment, type LaborPayment } from '../../services/laborPaymentService';

interface LaborPaymentFormProps {
  payment?: LaborPayment;
  onSuccess: () => void;
  onCancel: () => void;
}

export const LaborPaymentForm: React.FC<LaborPaymentFormProps> = ({
  payment,
  onSuccess,
  onCancel,
}) => {
  const [formData, setFormData] = useState<NewLaborPayment>({
    short_name: payment?.short_name || '',
    full_name: payment?.full_name || '',
    payment_name: payment?.payment_name || '',
    position: payment?.position || '',
    hourly_rate: payment?.hourly_rate || 0,
  });
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      if (payment) {
        await laborPaymentService.update(payment.id, formData);
      } else {
        await laborPaymentService.create(formData);
      }
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Произошла ошибка');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <Alert variant="error">{error}</Alert>}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          ФИО (краткое) *
        </label>
        <Input
          value={formData.short_name}
          onChange={(e) => setFormData({ ...formData, short_name: e.target.value })}
          placeholder="Иванов И.И."
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Полное ФИО *
        </label>
        <Input
          value={formData.full_name}
          onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
          placeholder="Иванов Иван Иванович"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Название оплаты *
        </label>
        <Input
          value={formData.payment_name}
          onChange={(e) => setFormData({ ...formData, payment_name: e.target.value })}
          placeholder="Зарплата слесаря Иванов И.И."
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Должность *
        </label>
        <Input
          value={formData.position}
          onChange={(e) => setFormData({ ...formData, position: e.target.value })}
          placeholder="Слесарь"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Часовая ставка (₽) *
        </label>
        <Input
          type="number"
          step="0.01"
          value={formData.hourly_rate}
          onChange={(e) => setFormData({ ...formData, hourly_rate: parseFloat(e.target.value) || 0 })}
          placeholder="300"
          required
        />
      </div>

      <div className="flex gap-2 justify-end pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Отмена
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Сохранение...' : payment ? 'Обновить' : 'Создать'}
        </Button>
      </div>
    </form>
  );
};
