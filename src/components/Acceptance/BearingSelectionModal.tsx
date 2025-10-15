import { useState, useEffect } from 'react';
import { Modal, Input, Button } from '../ui';
import { bearingService, Bearing } from '../../services/bearingService';
import { Search } from 'lucide-react';

interface BearingSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (bearing: Bearing) => void;
}

export function BearingSelectionModal({ isOpen, onClose, onSelect }: BearingSelectionModalProps) {
  const [bearings, setBearings] = useState<Bearing[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadBearings();
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      handleSearch();
    }
  }, [searchQuery, isOpen]);

  const loadBearings = async () => {
    try {
      setIsLoading(true);
      const data = await bearingService.getAll();
      setBearings(data);
    } catch (err) {
      console.error('Error loading bearings:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      loadBearings();
      return;
    }

    try {
      setIsLoading(true);
      const results = await bearingService.search(searchQuery);
      setBearings(results);
    } catch (err) {
      console.error('Search error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelect = (bearing: Bearing) => {
    onSelect(bearing);
    onClose();
    setSearchQuery('');
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Выбор подшипника">
      <div className="space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <Input
            type="text"
            placeholder="Поиск по названию, марке, диаметру, виду, номеру..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
            autoFocus
          />
        </div>

        <div className="max-h-96 overflow-y-auto">
          {isLoading ? (
            <div className="text-center py-8 text-gray-500">Загрузка...</div>
          ) : bearings.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              {searchQuery ? 'Подшипники не найдены' : 'Нет подшипников'}
            </div>
          ) : (
            <div className="space-y-2">
              {bearings.map((bearing) => (
                <button
                  key={bearing.id}
                  onClick={() => handleSelect(bearing)}
                  className="w-full text-left p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="font-medium text-gray-900">{bearing.name}</div>
                  <div className="text-sm text-gray-500 mt-1 flex gap-4">
                    <span>Марка: {bearing.brand}</span>
                    <span>Диаметр: {bearing.diameter} мм</span>
                    <span>Номер: {bearing.number}</span>
                    <span>Вид: {bearing.type}</span>
                  </div>
                </button>
              ))}
            </div>
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
}
