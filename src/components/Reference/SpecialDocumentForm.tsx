import React, { useState } from 'react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Alert } from '../ui/Alert';
import { specialDocumentService, type NewSpecialDocument, type SpecialDocument } from '../../services/specialDocumentService';

interface SpecialDocumentFormProps {
  document?: SpecialDocument;
  onSuccess: () => void;
  onCancel: () => void;
}

export const SpecialDocumentForm: React.FC<SpecialDocumentFormProps> = ({
  document,
  onSuccess,
  onCancel,
}) => {
  const [formData, setFormData] = useState<NewSpecialDocument>({
    document_date: document?.document_date || new Date().toISOString().slice(0, 16),
    document_number: document?.document_number || '',
    counterparty: document?.counterparty || '',
    contract: document?.contract || '',
    amount_without_vat: document?.amount_without_vat || 0,
    amount_with_vat: document?.amount_with_vat || 0,
  });
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      if (document) {
        await specialDocumentService.update(document.id, formData);
      } else {
        await specialDocumentService.create(formData);
      }
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Произошла ошибка');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <Alert variant="error">{error}</Alert>}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Дата документа *
        </label>
        <Input
          type="datetime-local"
          value={formData.document_date.slice(0, 16)}
          onChange={(e) => setFormData({ ...formData, document_date: new Date(e.target.value).toISOString() })}
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Номер УПД *
        </label>
        <Input
          value={formData.document_number}
          onChange={(e) => setFormData({ ...formData, document_number: e.target.value })}
          placeholder="Реализация (акт, накладная, УПД) 00БП-000001 от..."
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Контрагент *
        </label>
        <Input
          value={formData.counterparty}
          onChange={(e) => setFormData({ ...formData, counterparty: e.target.value })}
          placeholder="Название контрагента"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Договор
        </label>
        <Input
          value={formData.contract}
          onChange={(e) => setFormData({ ...formData, contract: e.target.value })}
          placeholder="Договор №123 от 01.01.2023"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Сумма без НДС (₽) *
        </label>
        <Input
          type="number"
          step="0.01"
          value={formData.amount_without_vat}
          onChange={(e) => setFormData({ ...formData, amount_without_vat: parseFloat(e.target.value) || 0 })}
          placeholder="0"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Сумма с НДС (₽) *
        </label>
        <Input
          type="number"
          step="0.01"
          value={formData.amount_with_vat}
          onChange={(e) => setFormData({ ...formData, amount_with_vat: parseFloat(e.target.value) || 0 })}
          placeholder="0"
          required
        />
      </div>

      <div className="flex gap-2 justify-end pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Отмена
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Сохранение...' : document ? 'Обновить' : 'Создать'}
        </Button>
      </div>
    </form>
  );
};
