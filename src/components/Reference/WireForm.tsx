import { useState, useEffect } from 'react';
import { Button, Input, Alert } from '../ui';
import { wireService, Wire } from '../../services/wireService';

interface WireFormProps {
  wire: Wire | null;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function WireForm({ wire, onSuccess, onCancel }: WireFormProps) {
  const [formData, setFormData] = useState({
    type: '',
    brand: '',
    name: '',
    heat_resistance: '',
    cross_section: '',
    shape: '',
    quantity: 1,
    price: 0,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (wire) {
      setFormData({
        type: wire.type,
        brand: wire.brand,
        name: wire.name,
        heat_resistance: wire.heat_resistance || '',
        cross_section: wire.cross_section,
        shape: wire.shape,
        quantity: wire.quantity,
        price: wire.price,
      });
    }
  }, [wire]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'quantity' || name === 'price' ? parseFloat(value) || 0 : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.type || !formData.brand || !formData.name || !formData.cross_section || !formData.shape) {
      setError('Заполните все обязательные поля');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const wireData = {
        ...formData,
        heat_resistance: formData.heat_resistance || null,
      };

      if (wire) {
        await wireService.update(wire.id, wireData);
      } else {
        await wireService.create(wireData);
      }

      onSuccess();
    } catch (err) {
      setError('Ошибка сохранения провода');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h2 className="text-xl font-semibold mb-4">
        {wire ? 'Редактировать провод' : 'Добавить провод'}
      </h2>

      {error && <Alert variant="error">{error}</Alert>}

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Вид <span className="text-red-500">*</span>
          </label>
          <select
            name="type"
            value={formData.type}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          >
            <option value="">Выберите вид</option>
            <option value="Обмоточный провод">Обмоточный провод</option>
            <option value="Шина">Шина</option>
            <option value="Кабель">Кабель</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Марка <span className="text-red-500">*</span>
          </label>
          <Input
            type="text"
            name="brand"
            value={formData.brand}
            onChange={handleChange}
            required
          />
        </div>

        <div className="col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Название <span className="text-red-500">*</span>
          </label>
          <Input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Нагревостойкость
          </label>
          <Input
            type="text"
            name="heat_resistance"
            value={formData.heat_resistance}
            onChange={handleChange}
            placeholder="Например: 155°C"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Сечение <span className="text-red-500">*</span>
          </label>
          <Input
            type="text"
            name="cross_section"
            value={formData.cross_section}
            onChange={handleChange}
            placeholder="Например: 2,5х4 или 1,32"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Форма <span className="text-red-500">*</span>
          </label>
          <select
            name="shape"
            value={formData.shape}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          >
            <option value="">Выберите форму</option>
            <option value="Круглый">Круглый</option>
            <option value="Прямоугольный">Прямоугольный</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Количество
          </label>
          <Input
            type="number"
            name="quantity"
            value={formData.quantity}
            onChange={handleChange}
            min="0"
            step="1"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Цена
          </label>
          <Input
            type="number"
            name="price"
            value={formData.price}
            onChange={handleChange}
            min="0"
            step="0.01"
          />
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="secondary" onClick={onCancel}>
          Отмена
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? 'Сохранение...' : wire ? 'Сохранить' : 'Добавить'}
        </Button>
      </div>
    </form>
  );
}
