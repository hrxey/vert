import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, Search, X } from 'lucide-react';
import { Button, Input } from '../../components/ui';
import { wireService, Wire } from '../../services/wireService';
import WireForm from '../../components/Reference/WireForm';

export default function Wires() {
  const [wires, setWires] = useState<Wire[]>([]);
  const [filteredWires, setFilteredWires] = useState<Wire[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingWire, setEditingWire] = useState<Wire | null>(null);

  useEffect(() => {
    loadWires();
  }, []);

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
      const results = await wireService.search(searchQuery);
      setFilteredWires(results);
    } catch (err) {
      setError('Ошибка поиска');
      console.error(err);
    }
  };

  const handleAdd = () => {
    setEditingWire(null);
    setShowForm(true);
  };

  const handleEdit = (wire: Wire) => {
    setEditingWire(wire);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Вы уверены, что хотите удалить этот провод?')) return;

    try {
      await wireService.delete(id);
      await loadWires();
    } catch (err) {
      setError('Ошибка удаления провода');
      console.error(err);
    }
  };

  const handleFormSuccess = async () => {
    setShowForm(false);
    setEditingWire(null);
    await loadWires();
  };

  const handleFormCancel = () => {
    setShowForm(false);
    setEditingWire(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Справочник Проводов</h1>
        <Button onClick={handleAdd}>
          <Plus size={20} />
          Добавить провод
        </Button>
      </div>

      {showForm && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <WireForm
            wire={editingWire}
            onSuccess={handleFormSuccess}
            onCancel={handleFormCancel}
          />
        </div>
      )}

      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="mb-4">
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
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md text-red-800">
            {error}
          </div>
        )}

        {loading ? (
          <div className="text-center py-8 text-gray-500">Загрузка...</div>
        ) : filteredWires.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            {searchQuery ? 'Ничего не найдено' : 'Нет проводов. Добавьте первый провод.'}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 border-b">Вид</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 border-b">Марка</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 border-b">Название</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 border-b">Нагревостойкость</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 border-b">Сечение</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 border-b">Форма</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 border-b">Количество</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 border-b">Цена</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 border-b">Действия</th>
                </tr>
              </thead>
              <tbody>
                {filteredWires.map((wire) => (
                  <tr key={wire.id} className="hover:bg-gray-50">
                    <td className="px-4 py-2 text-sm border-b">{wire.type}</td>
                    <td className="px-4 py-2 text-sm border-b">{wire.brand}</td>
                    <td className="px-4 py-2 text-sm border-b">{wire.name}</td>
                    <td className="px-4 py-2 text-sm border-b">{wire.heat_resistance || '—'}</td>
                    <td className="px-4 py-2 text-sm border-b">{wire.cross_section}</td>
                    <td className="px-4 py-2 text-sm border-b">{wire.shape}</td>
                    <td className="px-4 py-2 text-sm border-b">{wire.quantity}</td>
                    <td className="px-4 py-2 text-sm border-b">{wire.price}</td>
                    <td className="px-4 py-2 text-sm border-b">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(wire)}
                          className="text-blue-600 hover:text-blue-800"
                          title="Редактировать"
                        >
                          <Pencil size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(wire.id)}
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
