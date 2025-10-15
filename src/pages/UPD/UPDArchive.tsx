import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AppLayout } from '../../components/Layout/AppLayout'
import { Button } from '../../components/ui/Button'
import { Alert } from '../../components/ui/Alert'
import { getUpdDocuments, disbandUpdDocument, UPDDocumentWithCounterparty } from '../../services/updService'
import { DisbandConfirmationModal } from '../../components/UPD/DisbandConfirmationModal'
import { SpecialDocumentSelectionModal } from '../../components/UPD/SpecialDocumentSelectionModal'
import { CreditCard as Edit, FileText, XCircle, Pencil, FileSpreadsheet } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { SpecialDocument } from '../../services/specialDocumentService'

const formatDate = (dateString: string): string => {
  const date = new Date(dateString)
  const months = [
    'января', 'февраля', 'марта', 'апреля', 'мая', 'июня',
    'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'
  ]
  const day = date.getDate()
  const month = months[date.getMonth()]
  const year = date.getFullYear()
  return `${day} ${month} ${year} г.`
}

const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    minimumFractionDigits: 2,
  }).format(amount)
}

export const UPDArchive: React.FC = () => {
  const navigate = useNavigate()
  const [updDocuments, setUpdDocuments] = useState<UPDDocumentWithCounterparty[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [disbandingId, setDisbandingId] = useState<string | null>(null)
  const [isDisbandModalOpen, setIsDisbandModalOpen] = useState(false)
  const [selectedUpd, setSelectedUpd] = useState<UPDDocumentWithCounterparty | null>(null)
  const [editingNumberId, setEditingNumberId] = useState<string | null>(null)
  const [editedNumber, setEditedNumber] = useState<string>('')
  const [isSpecialDocModalOpen, setIsSpecialDocModalOpen] = useState(false)
  const [currentUpdId, setCurrentUpdId] = useState<string | null>(null)

  useEffect(() => {
    loadUpdDocuments()
  }, [])

  const loadUpdDocuments = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await getUpdDocuments()
      setUpdDocuments(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка загрузки УПД')
    } finally {
      setLoading(false)
    }
  }

  const handleView = (updId: string) => {
    navigate(`/app/upd-archive/${updId}`)
  }

  const handleDisbandClick = (upd: UPDDocumentWithCounterparty) => {
    setSelectedUpd(upd)
    setIsDisbandModalOpen(true)
  }

  const handleConfirmDisband = async () => {
    if (!selectedUpd) return

    try {
      setDisbandingId(selectedUpd.id)
      setError(null)
      await disbandUpdDocument(selectedUpd.id)
      setSuccess('УПД успешно расформирован. Позиции возвращены в архив приемок.')
      setIsDisbandModalOpen(false)
      await loadUpdDocuments()
      setTimeout(() => setSuccess(null), 5000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка расформирования УПД')
    } finally {
      setDisbandingId(null)
      setSelectedUpd(null)
    }
  }

  const handleCloseDisbandModal = () => {
    setIsDisbandModalOpen(false)
    setSelectedUpd(null)
  }

  const handleEditNumber = (upd: UPDDocumentWithCounterparty) => {
    setEditingNumberId(upd.id)
    setEditedNumber(upd.document_number)
  }

  const handleSaveNumber = async (updId: string) => {
    try {
      setError(null)
      const { error: updateError } = await supabase
        .from('upd_documents')
        .update({ document_number: editedNumber })
        .eq('id', updId)

      if (updateError) throw updateError

      setEditingNumberId(null)
      await loadUpdDocuments()
      setSuccess('Номер УПД успешно обновлен')
      setTimeout(() => setSuccess(null), 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка обновления номера УПД')
    }
  }

  const handleCancelEdit = () => {
    setEditingNumberId(null)
    setEditedNumber('')
  }

  const handleOpenSpecialDocModal = (updId: string) => {
    setCurrentUpdId(updId)
    setIsSpecialDocModalOpen(true)
  }

  const handleSelectSpecialDocument = async (document: SpecialDocument) => {
    if (!currentUpdId) return

    try {
      setError(null)

      const { error: updateError } = await supabase
        .from('upd_documents')
        .update({ document_number: document.document_number })
        .eq('id', currentUpdId)

      if (updateError) throw updateError

      await loadUpdDocuments()
      setSuccess('Номер УПД успешно обновлен')
      setTimeout(() => setSuccess(null), 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка обновления номера УПД')
    } finally {
      setCurrentUpdId(null)
    }
  }

  if (loading) {
    return (
      <AppLayout title="Архив УПД">
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Загрузка...</div>
        </div>
      </AppLayout>
    )
  }

  return (
    <AppLayout title="Архив УПД">
      <div className="space-y-6">
        {error && (
          <Alert variant="error" onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert variant="success" onClose={() => setSuccess(null)}>
            {success}
          </Alert>
        )}

        {updDocuments.length === 0 ? (
          <div className="bg-white p-12 rounded-xl shadow-sm border border-gray-200 text-center">
            <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Нет сохраненных УПД</h3>
            <p className="text-gray-500 mb-6">
              Когда вы создадите УПД, они появятся здесь
            </p>
            <Button onClick={() => navigate('/app/upd-assembly')}>
              Создать УПД
            </Button>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Номер УПД
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Дата УПД
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Контрагент
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Сумма доходов
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Сумма расходов
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Действия
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {updDocuments.map((upd) => (
                  <tr key={upd.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      {editingNumberId === upd.id ? (
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            value={editedNumber}
                            onChange={(e) => setEditedNumber(e.target.value)}
                            className="text-sm font-medium text-gray-900 border border-gray-300 rounded px-2 py-1 w-32"
                            autoFocus
                          />
                          <button
                            onClick={() => handleSaveNumber(upd.id)}
                            className="text-green-600 hover:text-green-800 text-xs"
                          >
                            Сохранить
                          </button>
                          <button
                            onClick={handleCancelEdit}
                            className="text-gray-600 hover:text-gray-800 text-xs"
                          >
                            Отмена
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <div className="text-sm font-medium text-gray-900">
                            {upd.document_number}
                          </div>
                          <button
                            onClick={() => handleEditNumber(upd)}
                            className="text-gray-400 hover:text-indigo-600"
                            title="Редактировать номер УПД"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleOpenSpecialDocModal(upd.id)}
                            className="text-gray-400 hover:text-indigo-600"
                            title="Справочник Документов спец"
                          >
                            <FileSpreadsheet className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {formatDate(upd.document_date)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{upd.counterparties.name}</div>
                      {upd.counterparties.inn && (
                        <div className="text-xs text-gray-500">ИНН: {upd.counterparties.inn}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="text-sm font-medium text-green-600">
                        {formatCurrency(upd.total_income || 0)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="text-sm font-medium text-red-600">
                        {formatCurrency(upd.total_expense || 0)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDisbandClick(upd)}
                          disabled={disbandingId === upd.id}
                          title="Расформировать"
                        >
                          <XCircle className="w-4 h-4 mr-2" />
                          Расформировать УПД
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleView(upd.id)}
                        >
                          <Edit className="w-4 h-4 mr-2" />
                          Просмотр
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <DisbandConfirmationModal
          isOpen={isDisbandModalOpen}
          onClose={handleCloseDisbandModal}
          onConfirm={handleConfirmDisband}
          documentNumber={selectedUpd?.document_number || ''}
          loading={disbandingId !== null}
        />

        <SpecialDocumentSelectionModal
          isOpen={isSpecialDocModalOpen}
          onClose={() => setIsSpecialDocModalOpen(false)}
          onSelect={handleSelectSpecialDocument}
        />
      </div>
    </AppLayout>
  )
}
