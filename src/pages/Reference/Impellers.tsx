import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, Search, X } from 'lucide-react';
import { Button, Input } from '../../components/ui';
import { impellerService, Impeller, NewImpeller } from '../../services/impellerService';
import { ImpellerForm } from '../../components/Reference/ImpellerForm';

export default function Impellers() {
  const [impellers, setImpellers] = useState<Impeller[]>([]);
  const [filteredImpellers, setFilteredImpellers] = useState<Impeller[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingImpeller, setEditingImpeller] = useState<Impeller | null>(null);

  useEffect(() => {
    loadImpellers();
  }, []);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredImpellers(impellers);
    } else {
      performSearch();
    }
  }, [searchQuery, impellers]);

  const loadImpellers = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await impellerService.getAll();
      setImpellers(data);
      setFilteredImpellers(data);
    } catch (err) {
      setError('Ошибка загрузки крыльчаток');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const performSearch = async () => {
    try {
      const results = await impellerService.search(searchQuery);
      setFilteredImpellers(results);
    } catch (err) {
      setError('Ошибка поиска');
      console.error(err);
    }
  };

  const handleAdd = () => {
    setEditingImpeller(null);
    setShowForm(true);
  };

  const handleEdit = (impeller: Impeller) => {
    setEditingImpeller(impeller);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Вы уверены, что хотите удалить эту крыльчатку?')) return;

    try {
      await impellerService.delete(id);
      await loadImpellers();
    } catch (err) {
      setError('Ошибка удаления крыльчатки');
      console.error(err);
    }
  };

  const handleFormSubmit = async (impellerData: NewImpeller) => {
    try {
      if (editingImpeller) {
        await impellerService.update(editingImpeller.id, impellerData);
      } else {
        await impellerService.create(impellerData);
      }
      await loadImpellers();
      setShowForm(false);
      setEditingImpeller(null);
    } catch (err) {
      setError('Ошибка сохранения крыльчатки');
      console.error(err);
      throw err;
    }
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingImpeller(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Справочник Крыльчаток</h1>
        <Button onClick={handleAdd}>
          <Plus size={20} />
          Добавить крыльчатку
        </Button>
      </div>

      <ImpellerForm
        isOpen={showForm}
        onClose={handleFormClose}
        onSubmit={handleFormSubmit}
        initialData={editingImpeller ? {
          name: editingImpeller.name,
          mounting_diameter: editingImpeller.mounting_diameter,
          outer_diameter: editingImpeller.outer_diameter,
          height: editingImpeller.height,
          blade_count: editingImpeller.blade_count,
        } : undefined}
        title={editingImpeller ? 'Редактировать крыльчатку' : 'Добавить крыльчатку'}
      />

      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <Input
              type="text"
              placeholder="Поиск по названию, посадочному диаметру, наружному диаметру, высоте, количеству лопастей..."
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
        ) : filteredImpellers.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            {searchQuery ? 'Ничего не найдено' : 'Нет крыльчаток. Добавьте первую крыльчатку.'}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 border-b">Название</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 border-b">Посадочный диаметр (мм)</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 border-b">Наружный диаметр (мм)</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 border-b">Высота (мм)</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 border-b">Количество лопастей</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 border-b">Действия</th>
                </tr>
              </thead>
              <tbody>
                {filteredImpellers.map((impeller) => (
                  <tr key={impeller.id} className="hover:bg-gray-50">
                    <td className="px-4 py-2 text-sm border-b">{impeller.name}</td>
                    <td className="px-4 py-2 text-sm border-b">{impeller.mounting_diameter}</td>
                    <td className="px-4 py-2 text-sm border-b">{impeller.outer_diameter}</td>
                    <td className="px-4 py-2 text-sm border-b">{impeller.height}</td>
                    <td className="px-4 py-2 text-sm border-b">{impeller.blade_count}</td>
                    <td className="px-4 py-2 text-sm border-b">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(impeller)}
                          className="text-blue-600 hover:text-blue-800"
                          title="Редактировать"
                        >
                          <Pencil size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(impeller.id)}
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
