import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, Calendar } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Alert } from '../../components/ui/Alert';
import { AppLayout } from '../../components/Layout/AppLayout';
import { UPDItemsHierarchy } from '../../components/UPD/UPDItemsHierarchy';
import { CounterpartySelectionModal } from '../../components/Acceptance/CounterpartySelectionModal';
import { ReceptionSelectionModal } from '../../components/UPD/ReceptionSelectionModal';
import { SubdivisionSelectionModal } from '../../components/UPD/SubdivisionSelectionModal';
import {
  getAvailableReceptionItems,
  getCounterparties,
  getSubdivisions,
  getReceptionsByCounterparty,
  createUpdAndLinkReceptionItems,
  AvailableReceptionItem,
} from '../../services/updService';

interface Counterparty {
  id: string;
  name: string;
  inn: string;
}

interface Subdivision {
  id: string;
  name: string;
  code: string;
}

interface Reception {
  id: string;
  reception_number: string;
  reception_date: string;
}

export default function CreateUPD() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [counterparties, setCounterparties] = useState<Counterparty[]>([]);
  const [subdivisions, setSubdivisions] = useState<Subdivision[]>([]);
  const [receptions, setReceptions] = useState<Reception[]>([]);
  const [availableItems, setAvailableItems] = useState<AvailableReceptionItem[]>([]);

  const [selectedCounterpartyId, setSelectedCounterpartyId] = useState<string>('');
  const [selectedSubdivisionId, setSelectedSubdivisionId] = useState<string>('');
  const [selectedReceptionIds, setSelectedReceptionIds] = useState<string[]>([]);
  const [selectedItemIds, setSelectedItemIds] = useState<Set<string>>(new Set());

  const [documentNumber, setDocumentNumber] = useState('');
  const [documentDate, setDocumentDate] = useState(
    new Date().toISOString().split('T')[0]
  );

  const [isCounterpartyModalOpen, setIsCounterpartyModalOpen] = useState(false);
  const [isReceptionModalOpen, setIsReceptionModalOpen] = useState(false);
  const [isSubdivisionModalOpen, setIsSubdivisionModalOpen] = useState(false);

  useEffect(() => {
    loadCounterparties();
  }, []);

  useEffect(() => {
    if (selectedCounterpartyId) {
      loadReceptions();
      loadSubdivisions();
    } else {
      setReceptions([]);
      setSelectedReceptionIds([]);
      setSubdivisions([]);
      setSelectedSubdivisionId('');
      setAvailableItems([]);
      setSelectedItemIds(new Set());
    }
  }, [selectedCounterpartyId]);

  useEffect(() => {
    if (selectedCounterpartyId) {
      loadAvailableItems();
    } else {
      setAvailableItems([]);
      setSelectedItemIds(new Set());
    }
  }, [selectedCounterpartyId, selectedSubdivisionId, selectedReceptionIds]);

  async function loadCounterparties() {
    try {
      const data = await getCounterparties();
      setCounterparties(data);
    } catch (err) {
      setError('Ошибка загрузки контрагентов');
      console.error(err);
    }
  }

  async function loadSubdivisions() {
    try {
      const data = await getSubdivisions(selectedCounterpartyId);
      setSubdivisions(data);
    } catch (err) {
      setError('Ошибка загрузки подразделений');
      console.error(err);
    }
  }

  async function loadReceptions() {
    try {
      const data = await getReceptionsByCounterparty(selectedCounterpartyId);
      setReceptions(data);
    } catch (err) {
      setError('Ошибка загрузки приемок');
      console.error(err);
    }
  }

  async function loadAvailableItems() {
    setLoading(true);
    setError(null);
    try {
      const data = await getAvailableReceptionItems(
        selectedCounterpartyId,
        selectedSubdivisionId || undefined,
        selectedReceptionIds.length > 0 ? selectedReceptionIds : undefined
      );
      setAvailableItems(data);
      setSelectedItemIds(new Set());
    } catch (err) {
      setError('Ошибка загрузки доступных позиций');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  function toggleItemSelection(itemId: string) {
    const newSelection = new Set(selectedItemIds);
    if (newSelection.has(itemId)) {
      newSelection.delete(itemId);
    } else {
      newSelection.add(itemId);
    }
    setSelectedItemIds(newSelection);
  }

  function toggleMultipleItems(itemIds: string[]) {
    const newSelection = new Set(selectedItemIds);
    const allSelected = itemIds.every(id => newSelection.has(id));

    if (allSelected) {
      itemIds.forEach(id => newSelection.delete(id));
    } else {
      itemIds.forEach(id => newSelection.add(id));
    }

    setSelectedItemIds(newSelection);
  }

  function toggleSelectAll() {
    if (selectedItemIds.size === availableItems.length) {
      setSelectedItemIds(new Set());
    } else {
      setSelectedItemIds(new Set(availableItems.map((item) => item.id)));
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!documentNumber.trim()) {
      setError('Введите номер УПД');
      return;
    }

    if (selectedItemIds.size === 0) {
      setError('Выберите хотя бы одну позицию');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      await createUpdAndLinkReceptionItems({ // <-- ИСПРАВЛЕНО: Вызываем новую функцию
        counterpartyId: selectedCounterpartyId,
        subdivisionId: selectedSubdivisionId || undefined,
        documentNumber,
        documentDate,
        itemIds: Array.from(selectedItemIds),
      });

      setSuccess(true);
      setTimeout(() => {
        navigate('/upd');
      }, 1500);
    } catch (err) {
      setError('Ошибка при создании УПД');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  const isFormValid =
    selectedCounterpartyId &&
    documentNumber.trim() &&
    selectedItemIds.size > 0;

  return (
    <AppLayout
      title="Создание нового УПД"
      breadcrumbs={[
        { label: 'Создать УПД', path: '/upd' },
        { label: 'Новый Заказ', path: '/upd/create' },
      ]}
    >
      <div className="space-y-6">
        {error && (
          <Alert variant="error" onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert variant="success" onClose={() => setSuccess(false)}>
            УПД успешно создан! Перенаправление...
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4">
          <h2 className="text-sm font-semibold text-slate-900 mb-3">
            Фильтры
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">
                Контрагент:
              </label>
              <button
                type="button"
                onClick={() => setIsCounterpartyModalOpen(true)}
                className="w-full mt-1 px-2 py-1 text-xs border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 text-left hover:bg-slate-50"
              >
                {counterparties.find(cp => cp.id === selectedCounterpartyId)?.name || 'Выберите контрагента'}
              </button>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">
                Приемки:
              </label>
              <button
                type="button"
                onClick={() => setIsReceptionModalOpen(true)}
                disabled={!selectedCounterpartyId}
                className="w-full mt-1 px-2 py-1 text-xs border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 text-left hover:bg-slate-50 disabled:bg-slate-100 disabled:cursor-not-allowed"
              >
                {selectedReceptionIds.length === 0
                  ? 'Все приемки'
                  : selectedReceptionIds.length === 1
                  ? receptions.find(rec => rec.id === selectedReceptionIds[0])?.reception_number
                  : `Выбрано приемок: ${selectedReceptionIds.length}`}
              </button>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">
                Подразделение:
              </label>
              <button
                type="button"
                onClick={() => setIsSubdivisionModalOpen(true)}
                disabled={!selectedCounterpartyId}
                className="w-full mt-1 px-2 py-1 text-xs border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 text-left hover:bg-slate-50 disabled:bg-slate-100 disabled:cursor-not-allowed"
              >
                {selectedSubdivisionId
                  ? subdivisions.find(sub => sub.id === selectedSubdivisionId)?.name
                  : 'Все подразделения'}
              </button>
            </div>
          </div>
        </div>

        {selectedCounterpartyId && (
          <>
            {selectedReceptionIds.length > 0 && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <h3 className="text-sm font-semibold text-slate-900 mb-2">
                  Выбранные приемки:
                </h3>
                <div className="flex flex-wrap gap-2">
                  {selectedReceptionIds.map(recId => {
                    const reception = receptions.find(r => r.id === recId);
                    if (!reception) return null;
                    return (
                      <div key={recId} className="bg-white border border-blue-300 rounded px-3 py-1.5 text-xs">
                        <div className="font-medium text-slate-900">
                          {reception.reception_number}
                        </div>
                        <div className="text-slate-600 mt-0.5">
                          {new Date(reception.reception_date).toLocaleDateString('ru-RU')}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div className="lg:col-span-2 bg-white rounded-lg shadow-sm border border-slate-200 p-4">
                <h2 className="text-sm font-semibold text-slate-900 mb-3">
                  Доступные позиции ({availableItems.length})
                </h2>

                {loading ? (
                  <div className="text-center py-8 text-xs text-slate-600">
                    Загрузка позиций...
                  </div>
                ) : (
                  <UPDItemsHierarchy
                    items={availableItems}
                    selectedItemIds={selectedItemIds}
                    onToggleItem={toggleItemSelection}
                    onToggleAll={toggleSelectAll}
                    onToggleMultiple={toggleMultipleItems}
                  />
                )}
              </div>

              <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4">
                <h2 className="text-sm font-semibold text-slate-900 mb-3">
                  Данные документа
                </h2>
                <div className="space-y-3">
                  <div>
                    <label className="flex items-center text-xs font-medium text-slate-700 mb-1">
                      <FileText className="w-3 h-3 mr-1" />
                      Номер УПД *
                    </label>
                    <input
                      type="text"
                      value={documentNumber}
                      onChange={(e) => setDocumentNumber(e.target.value)}
                      placeholder="Например: 00БП-000001"
                      className="w-full px-2 py-1.5 text-xs border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="flex items-center text-xs font-medium text-slate-700 mb-1">
                      <Calendar className="w-3 h-3 mr-1" />
                      Дата УПД *
                    </label>
                    <input
                      type="date"
                      value={documentDate}
                      onChange={(e) => setDocumentDate(e.target.value)}
                      className="w-full px-2 py-1.5 text-xs border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                      required
                    />
                  </div>

                  <div className="pt-4 space-y-2">
                    <Button
                      type="submit"
                      variant="blue"
                      size="sm"
                      disabled={!isFormValid || loading}
                      className="w-full"
                    >
                      {loading ? 'Сохранение...' : 'Сохранить УПД'}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => navigate('/upd')}
                      className="w-full"
                    >
                      Отмена
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
        </form>

        <CounterpartySelectionModal
          isOpen={isCounterpartyModalOpen}
          onClose={() => setIsCounterpartyModalOpen(false)}
          onSelect={(counterparty) => {
            setSelectedCounterpartyId(counterparty.id);
            setIsCounterpartyModalOpen(false);
          }}
        />

        <ReceptionSelectionModal
          isOpen={isReceptionModalOpen}
          onClose={() => setIsReceptionModalOpen(false)}
          receptions={receptions}
          selectedReceptionIds={selectedReceptionIds}
          onSelect={(receptionIds) => {
            setSelectedReceptionIds(receptionIds);
          }}
        />

        <SubdivisionSelectionModal
          isOpen={isSubdivisionModalOpen}
          onClose={() => setIsSubdivisionModalOpen(false)}
          subdivisions={subdivisions}
          selectedSubdivisionId={selectedSubdivisionId}
          onSelect={(subdivisionId) => {
            setSelectedSubdivisionId(subdivisionId);
            setIsSubdivisionModalOpen(false);
          }}
        />
      </div>
    </AppLayout>
  );
}
