import { useState } from 'react';
import { Button, Input, Modal } from '../ui';
import { NewBearing } from '../../services/bearingService';

interface BearingFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (bearing: NewBearing) => Promise<void>;
  initialData?: NewBearing;
  title: string;
}

export function BearingForm({ isOpen, onClose, onSubmit, initialData, title }: BearingFormProps) {
  const [formData, setFormData] = useState<NewBearing>(
    initialData || {
      brand: '',
      name: '',
      diameter: 0,
      number: '',
      type: '',
    }
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onSubmit(formData);
      onClose();
      setFormData({ brand: '', name: '', diameter: 0, number: '', type: '' });
    } catch (error) {
      console.error('Error submitting form:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (field: keyof NewBearing, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Марка
          </label>
          <Input
            type="text"
            value={formData.brand}
            onChange={(e) => handleChange('brand', e.target.value)}
            placeholder="UTR, SKF, CRAFT..."
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Название
          </label>
          <Input
            type="text"
            value={formData.name}
            onChange={(e) => handleChange('name', e.target.value)}
            placeholder="Подшипник 6206-2RZ/C3 UTR"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Диаметр (мм)
          </label>
          <Input
            type="number"
            value={formData.diameter}
            onChange={(e) => handleChange('diameter', parseInt(e.target.value) || 0)}
            placeholder="30"
            required
            min="0"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Номер
          </label>
          <Input
            type="text"
            value={formData.number}
            onChange={(e) => handleChange('number', e.target.value)}
            placeholder="6206-2RZ"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Вид
          </label>
          <Input
            type="text"
            value={formData.type}
            onChange={(e) => handleChange('type', e.target.value)}
            placeholder="Шариковый, Цилиндрический роликовый..."
            required
          />
        </div>

        <div className="flex justify-end gap-2 pt-4">
          <Button type="button" variant="outline" onClick={onClose}>
            Отмена
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Сохранение...' : 'Сохранить'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
