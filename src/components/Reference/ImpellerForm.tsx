import { useState } from 'react';
import { Button, Input, Modal } from '../ui';
import { NewImpeller } from '../../services/impellerService';

interface ImpellerFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (impeller: NewImpeller) => Promise<void>;
  initialData?: NewImpeller;
  title: string;
}

export function ImpellerForm({ isOpen, onClose, onSubmit, initialData, title }: ImpellerFormProps) {
  const [formData, setFormData] = useState<NewImpeller>(
    initialData || {
      name: '',
      mounting_diameter: 0,
      outer_diameter: 0,
      height: 0,
      blade_count: 0,
    }
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onSubmit(formData);
      onClose();
      setFormData({ name: '', mounting_diameter: 0, outer_diameter: 0, height: 0, blade_count: 0 });
    } catch (error) {
      console.error('Error submitting form:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (field: keyof NewImpeller, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Название
          </label>
          <Input
            type="text"
            value={formData.name}
            onChange={(e) => handleChange('name', e.target.value)}
            placeholder="Вентилятор (крыльчатка охлаждения 62/355/86-9)"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Посадочный диаметр (мм)
          </label>
          <Input
            type="number"
            value={formData.mounting_diameter}
            onChange={(e) => handleChange('mounting_diameter', parseInt(e.target.value) || 0)}
            placeholder="62"
            required
            min="0"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Наружный диаметр (мм)
          </label>
          <Input
            type="number"
            value={formData.outer_diameter}
            onChange={(e) => handleChange('outer_diameter', parseInt(e.target.value) || 0)}
            placeholder="355"
            required
            min="0"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Высота крыльчатки (мм)
          </label>
          <Input
            type="number"
            value={formData.height}
            onChange={(e) => handleChange('height', parseInt(e.target.value) || 0)}
            placeholder="86"
            required
            min="0"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Количество лопастей
          </label>
          <Input
            type="number"
            value={formData.blade_count}
            onChange={(e) => handleChange('blade_count', parseInt(e.target.value) || 0)}
            placeholder="9"
            required
            min="0"
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
