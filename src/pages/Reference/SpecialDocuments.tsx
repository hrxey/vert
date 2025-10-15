import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Search } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import { Alert } from '../../components/ui/Alert';
import { SpecialDocumentForm } from '../../components/Reference/SpecialDocumentForm';
import { specialDocumentService, type SpecialDocument } from '../../services/specialDocumentService';

export const SpecialDocuments: React.FC = () => {
  const [documents, setDocuments] = useState<SpecialDocument[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDocument, setEditingDocument] = useState<SpecialDocument | undefined>();
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  useEffect(() => {
    loadDocuments();
  }, []);

  const loadDocuments = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await specialDocumentService.getAll();
      setDocuments(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка загрузки данных');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    if (!query.trim()) {
      loadDocuments();
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const data = await specialDocumentService.search(query);
      setDocuments(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка поиска');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await specialDocumentService.delete(id);
      setDeleteConfirm(null);
      loadDocuments();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка удаления');
    }
  };

  const handleEdit = (document: SpecialDocument) => {
    setEditingDocument(document);
    setIsModalOpen(true);
  };

  const handleAdd = () => {
    setEditingDocument(undefined);
    setIsModalOpen(true);
  };

  const handleSuccess = () => {
    setIsModalOpen(false);
    setEditingDocument(undefined);
    loadDocuments();
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Справочник Документов спец</h1>
        <Button onClick={handleAdd}>
          <Plus className="w-4 h-4 mr-2" />
          Добавить
        </Button>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <div className="mb-4 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <Input
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Поиск по дате, номеру УПД или контрагенту..."
            className="pl-10"
          />
        </div>

        {error && <Alert variant="error" className="mb-4">{error}</Alert>}

        {isLoading ? (
          <div className="text-center py-8 text-gray-500">Загрузка...</div>
        ) : documents.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            {searchQuery ? 'Ничего не найдено' : 'Нет данных'}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Дата
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Номер УПД
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Контрагент
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Договор
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Сумма без НДС
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Сумма с НДС
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Действия
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {documents.map((document) => (
                  <tr key={document.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-gray-900 whitespace-nowrap">
                      {formatDate(document.document_date)}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {document.document_number}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {document.counterparty}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {document.contract}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900 text-right">
                      {document.amount_without_vat.toLocaleString('ru-RU')} ₽
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900 text-right">
                      {document.amount_with_vat.toLocaleString('ru-RU')} ₽
                    </td>
                    <td className="px-4 py-3 text-sm text-right space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEdit(document)}
                      >
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setDeleteConfirm(document.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingDocument(undefined);
        }}
        title={editingDocument ? 'Редактировать документ' : 'Добавить документ'}
      >
        <SpecialDocumentForm
          document={editingDocument}
          onSuccess={handleSuccess}
          onCancel={() => {
            setIsModalOpen(false);
            setEditingDocument(undefined);
          }}
        />
      </Modal>

      <Modal
        isOpen={deleteConfirm !== null}
        onClose={() => setDeleteConfirm(null)}
        title="Подтверждение удаления"
      >
        <div className="space-y-4">
          <p className="text-gray-700">
            Вы уверены, что хотите удалить этот документ?
          </p>
          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={() => setDeleteConfirm(null)}>
              Отмена
            </Button>
            <Button
              variant="outline"
              onClick={() => deleteConfirm && handleDelete(deleteConfirm)}
            >
              Удалить
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
