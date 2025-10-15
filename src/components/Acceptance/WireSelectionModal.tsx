import { useState, useEffect } from 'react';
import { Modal, Button, Input } from '../ui';
import { wireService, Wire } from '../../services/wireService';
import { Search, X } from 'lucide-react';

interface WireSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (wire: Wire) => void;
}

export default function WireSelectionModal({ isOpen, onClose, onSelect }: WireSelectionModalProps) {
  const [wires, setWires] = useState<Wire[]>([]);
  const [filteredWires, setFilteredWires] = useState<Wire[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      loadWires();
      setSearchQuery('');
    }
  }, [isOpen]);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredWires(wires);
    } else {
      performSearch();
    }
  }, [searchQuery, wires]);

  const loadWires = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await wireService.getAll();
      setWires(data);
      setFilteredWires(data);
    } catch (err) {
      setError('Ошибка загрузки проводов');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const performSearch = async () => {
    try {
      setLoading(true);
      setError(null);
      const results = await wireService.search(searchQuery);
      setFilteredWires(results);
    } catch (err) {
      setError('Ошибка поиска');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (wire: Wire) => {
    onSelect(wire);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Выбор провода">
      <div className="space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <Input
            type="text"
            placeholder="Поиск по названию, марке, сечению, форме..."
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

        {error && (
          <div className="text-red-600 text-sm">{error}</div>
        )}

        {loading ? (
          <div className="text-center py-8 text-gray-500">Загрузка...</div>
        ) : filteredWires.length === 0 ? (
          <div className="text-center py-8 text-gray-500">Ничего не найдено</div>
        ) : (
          <div className="max-h-96 overflow-y-auto">
            <table className="w-full border-collapse">
              <thead className="bg-gray-50 sticky top-0">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 border-b">Вид</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 border-b">Марка</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 border-b">Название</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 border-b">Нагревостойкость</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 border-b">Сечение</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 border-b">Форма</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 border-b">Действие</th>
                </tr>
              </thead>
              <tbody>
                {filteredWires.map((wire) => (
                  <tr
                    key={wire.id}
                    className="hover:bg-gray-50 cursor-pointer"
                    onClick={() => handleSelect(wire)}
                  >
                    <td className="px-4 py-2 text-sm border-b">{wire.type}</td>
                    <td className="px-4 py-2 text-sm border-b">{wire.brand}</td>
                    <td className="px-4 py-2 text-sm border-b">{wire.name}</td>
                    <td className="px-4 py-2 text-sm border-b">{wire.heat_resistance || '—'}</td>
                    <td className="px-4 py-2 text-sm border-b">{wire.cross_section}</td>
                    <td className="px-4 py-2 text-sm border-b">{wire.shape}</td>
                    <td className="px-4 py-2 text-sm border-b">
                      <Button
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSelect(wire);
                        }}
                      >
                        Выбрать
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="flex justify-end">
          <Button variant="secondary" onClick={onClose}>
            Отмена
          </Button>
        </div>
      </div>
    </Modal>
  );
}
