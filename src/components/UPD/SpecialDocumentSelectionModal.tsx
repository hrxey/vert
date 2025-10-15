import React, { useState, useEffect } from 'react';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { Alert } from '../ui/Alert';
import { specialDocumentService, type SpecialDocument } from '../../services/specialDocumentService';
import { Search } from 'lucide-react';

interface SpecialDocumentSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (document: SpecialDocument) => void;
}

export const SpecialDocumentSelectionModal: React.FC<SpecialDocumentSelectionModalProps> = ({
  isOpen,
  onClose,
  onSelect,
}) => {
  const [documents, setDocuments] = useState<SpecialDocument[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      loadDocuments();
    }
  }, [isOpen]);

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

  const handleSelect = (document: SpecialDocument) => {
    onSelect(document);
    onClose();
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
    <Modal isOpen={isOpen} onClose={onClose} title="Справочник Документов спец" size="5xl">
      <div className="space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Поиск по дате, номеру УПД или контрагенту..."
            className="pl-10 text-sm"
          />
        </div>

        {error && <Alert variant="error">{error}</Alert>}

        <div className="max-h-[600px] overflow-y-auto border rounded-lg">
          {isLoading ? (
            <div className="p-8 text-center text-gray-500 text-sm">Загрузка...</div>
          ) : documents.length === 0 ? (
            <div className="p-8 text-center text-gray-500 text-sm">
              {searchQuery ? 'Ничего не найдено' : 'Нет данных'}
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-50 sticky top-0">
                <tr>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Дата
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Номер УПД
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Контрагент
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Договор
                  </th>
                  <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Сумма без НДС
                  </th>
                  <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Сумма с НДС
                  </th>
                  <th className="px-3 py-2"></th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {documents.map((document) => (
                  <tr
                    key={document.id}
                    className="hover:bg-gray-50 cursor-pointer"
                    onClick={() => handleSelect(document)}
                  >
                    <td className="px-3 py-2 text-xs text-gray-900 whitespace-nowrap">
                      {formatDate(document.document_date)}
                    </td>
                    <td className="px-3 py-2 text-xs text-gray-900">
                      {document.document_number}
                    </td>
                    <td className="px-3 py-2 text-xs text-gray-900">
                      {document.counterparty}
                    </td>
                    <td className="px-3 py-2 text-xs text-gray-900">
                      {document.contract}
                    </td>
                    <td className="px-3 py-2 text-xs text-gray-900 text-right whitespace-nowrap">
                      {document.amount_without_vat.toLocaleString('ru-RU')} ₽
                    </td>
                    <td className="px-3 py-2 text-xs text-gray-900 text-right whitespace-nowrap">
                      {document.amount_with_vat.toLocaleString('ru-RU')} ₽
                    </td>
                    <td className="px-3 py-2 text-xs">
                      <Button
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSelect(document);
                        }}
                      >
                        Выбрать
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
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
};
