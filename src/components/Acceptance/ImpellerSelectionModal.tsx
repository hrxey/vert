import { useState, useEffect } from 'react';
import { Search, X } from 'lucide-react';
import { Modal, Button, Input } from '../ui';
import { impellerService, Impeller } from '../../services/impellerService';

interface ImpellerSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (impeller: Impeller) => void;
}

export function ImpellerSelectionModal({ isOpen, onClose, onSelect }: ImpellerSelectionModalProps) {
  const [impellers, setImpellers] = useState<Impeller[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadImpellers();
    }
  }, [isOpen]);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      loadImpellers();
    } else {
      performSearch();
    }
  }, [searchQuery]);

  const loadImpellers = async () => {
    try {
      setLoading(true);
      const data = await impellerService.getAll();
      setImpellers(data);
    } catch (err) {
      console.error('Error loading impellers:', err);
    } finally {
      setLoading(false);
    }
  };

  const performSearch = async () => {
    try {
      setLoading(true);
      const results = await impellerService.search(searchQuery);
      setImpellers(results);
    } catch (err) {
      console.error('Error searching impellers:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (impeller: Impeller) => {
    onSelect(impeller);
    onClose();
    setSearchQuery('');
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Выбор крыльчатки">
      <div className="space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <Input
            type="text"
            placeholder="Поиск по названию, диаметру, высоте, количеству лопастей..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X size={20} />
            </button>
          )}
        </div>

        {loading ? (
          <div className="text-center py-8 text-gray-500">Загрузка...</div>
        ) : impellers.length === 0 ? (
          <div className="text-center py-8 text-gray-500">Ничего не найдено</div>
        ) : (
          <div className="max-h-96 overflow-y-auto">
            <table className="w-full border-collapse">
              <thead className="bg-gray-50 sticky top-0">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 border-b">Название</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 border-b">Посад. Ø</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 border-b">Нар. Ø</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 border-b">Высота</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 border-b">Лопасти</th>
                </tr>
              </thead>
              <tbody>
                {impellers.map((impeller) => (
                  <tr
                    key={impeller.id}
                    onClick={() => handleSelect(impeller)}
                    className="hover:bg-blue-50 cursor-pointer"
                  >
                    <td className="px-4 py-2 text-sm border-b">{impeller.name}</td>
                    <td className="px-4 py-2 text-sm border-b">{impeller.mounting_diameter}</td>
                    <td className="px-4 py-2 text-sm border-b">{impeller.outer_diameter}</td>
                    <td className="px-4 py-2 text-sm border-b">{impeller.height}</td>
                    <td className="px-4 py-2 text-sm border-b">{impeller.blade_count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="flex justify-end">
          <Button variant="outline" onClick={onClose}>
            Отмена
          </Button>
        </div>
      </div>
    </Modal>
  );
}
