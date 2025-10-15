import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, Search, X } from 'lucide-react';
import { Button, Input } from '../../components/ui';
import { bearingService, Bearing, NewBearing } from '../../services/bearingService';
import { BearingForm } from '../../components/Reference/BearingForm';

export default function Bearings() {
  const [bearings, setBearings] = useState<Bearing[]>([]);
  const [filteredBearings, setFilteredBearings] = useState<Bearing[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingBearing, setEditingBearing] = useState<Bearing | null>(null);

  useEffect(() => {
    loadBearings();
  }, []);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredBearings(bearings);
    } else {
      performSearch();
    }
  }, [searchQuery, bearings]);

  const loadBearings = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await bearingService.getAll();
      setBearings(data);
      setFilteredBearings(data);
    } catch (err) {
      setError('Ошибка загрузки подшипников');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const performSearch = async () => {
    try {
      const results = await bearingService.search(searchQuery);
      setFilteredBearings(results);
    } catch (err) {
      setError('Ошибка поиска');
      console.error(err);
    }
  };

  const handleAdd = () => {
    setEditingBearing(null);
    setShowForm(true);
  };

  const handleEdit = (bearing: Bearing) => {
    setEditingBearing(bearing);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Вы уверены, что хотите удалить этот подшипник?')) return;

    try {
      await bearingService.delete(id);
      await loadBearings();
    } catch (err) {
      setError('Ошибка удаления подшипника');
      console.error(err);
    }
  };

  const handleFormSubmit = async (bearingData: NewBearing) => {
    try {
      if (editingBearing) {
        await bearingService.update(editingBearing.id, bearingData);
      } else {
        await bearingService.create(bearingData);
      }
      await loadBearings();
      setShowForm(false);
      setEditingBearing(null);
    } catch (err) {
      setError('Ошибка сохранения подшипника');
      console.error(err);
      throw err;
    }
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingBearing(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Справочник Подшипников</h1>
        <Button onClick={handleAdd}>
          <Plus size={20} />
          Добавить подшипник
        </Button>
      </div>

      <BearingForm
        isOpen={showForm}
        onClose={handleFormClose}
        onSubmit={handleFormSubmit}
        initialData={editingBearing ? {
          brand: editingBearing.brand,
          name: editingBearing.name,
          diameter: editingBearing.diameter,
          number: editingBearing.number,
          type: editingBearing.type,
        } : undefined}
        title={editingBearing ? 'Редактировать подшипник' : 'Добавить подшипник'}
      />

      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <Input
              type="text"
              placeholder="Поиск по названию, марке, номеру, виду, диаметру..."
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
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md text-red-800">
            {error}
          </div>
        )}

        {loading ? (
          <div className="text-center py-8 text-gray-500">Загрузка...</div>
        ) : filteredBearings.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            {searchQuery ? 'Ничего не найдено' : 'Нет подшипников. Добавьте первый подшипник.'}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 border-b">Марка</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 border-b">Название</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 border-b">Номер</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 border-b">Вид</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 border-b">Диаметр (мм)</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 border-b">Действия</th>
                </tr>
              </thead>
              <tbody>
                {filteredBearings.map((bearing) => (
                  <tr key={bearing.id} className="hover:bg-gray-50">
                    <td className="px-4 py-2 text-sm border-b">{bearing.brand}</td>
                    <td className="px-4 py-2 text-sm border-b">{bearing.name}</td>
                    <td className="px-4 py-2 text-sm border-b">{bearing.number}</td>
                    <td className="px-4 py-2 text-sm border-b">{bearing.type}</td>
                    <td className="px-4 py-2 text-sm border-b">{bearing.diameter}</td>
                    <td className="px-4 py-2 text-sm border-b">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(bearing)}
                          className="text-blue-600 hover:text-blue-800"
                          title="Редактировать"
                        >
                          <Pencil size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(bearing.id)}
                          className="text-red-600 hover:text-red-800"
                          title="Удалить"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
