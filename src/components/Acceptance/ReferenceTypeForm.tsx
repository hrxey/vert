import React, { useState } from 'react'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { ReferenceType } from '../../types/database'
import * as Icons from 'lucide-react'

interface ReferenceTypeFormProps {
  onSave: (referenceType: Omit<ReferenceType, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => Promise<void>
  onCancel: () => void
}

const availableIcons = [
  { name: 'Gauge', label: 'Датчик' },
  { name: 'Wallet', label: 'Оплата труда' },
  { name: 'Warehouse', label: 'Склад' },
  { name: 'FileText', label: 'Документ' },
  { name: 'Package', label: 'Пакет' },
  { name: 'Truck', label: 'Грузовик' },
  { name: 'Settings', label: 'Настройки' },
  { name: 'Disc2', label: 'Подшипники' },
  { name: 'Zap', label: 'Электричество' },
  { name: 'Fan', label: 'Крыльчатки' },
  { name: 'Clipboard', label: 'Буфер обмена' },
  { name: 'Cable', label: 'Провод' },
]

export const ReferenceTypeForm: React.FC<ReferenceTypeFormProps> = ({
  onSave,
  onCancel,
}) => {
  const [name, setName] = useState('')
  const [typeKey, setTypeKey] = useState('')
  const [iconName, setIconName] = useState('FileText')
  const [route, setRoute] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!name.trim() || !typeKey.trim() || !route.trim()) {
      setError('Пожалуйста, заполните все обязательные поля')
      return
    }

    if (!route.startsWith('/')) {
      setError('Маршрут должен начинаться с "/"')
      return
    }

    setLoading(true)

    try {
      await onSave({
        name: name.trim(),
        type_key: typeKey.trim().toLowerCase(),
        icon_name: iconName,
        route: route.trim(),
        is_active: true,
      } as Omit<ReferenceType, 'id' | 'user_id' | 'created_at' | 'updated_at'>)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Произошла ошибка при сохранении')
    } finally {
      setLoading(false)
    }
  }

  const getIcon = (name: string) => {
    const IconComponent = (Icons as any)[name]
    return IconComponent ? <IconComponent size={24} /> : <Icons.FileText size={24} />
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
          {error}
        </div>
      )}

      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
          Название справочника
        </label>
        <Input
          id="name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Например: Инструменты"
          required
          autoFocus
        />
      </div>

      <div>
        <label htmlFor="typeKey" className="block text-sm font-medium text-gray-700 mb-1">
          Системный ключ
        </label>
        <Input
          id="typeKey"
          type="text"
          value={typeKey}
          onChange={(e) => setTypeKey(e.target.value)}
          placeholder="Например: tools"
          required
        />
        <p className="mt-1 text-xs text-gray-500">
          Используется для идентификации в системе (только латинские буквы)
        </p>
      </div>

      <div>
        <label htmlFor="route" className="block text-sm font-medium text-gray-700 mb-1">
          Маршрут
        </label>
        <Input
          id="route"
          type="text"
          value={route}
          onChange={(e) => setRoute(e.target.value)}
          placeholder="/app/reference/tools"
          required
        />
        <p className="mt-1 text-xs text-gray-500">
          URL-адрес страницы справочника
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Выбор иконки
        </label>
        <div className="grid grid-cols-4 gap-2">
          {availableIcons.map((icon) => (
            <button
              key={icon.name}
              type="button"
              onClick={() => setIconName(icon.name)}
              className={`p-3 border rounded-lg hover:bg-gray-50 transition-colors flex flex-col items-center gap-1 ${
                iconName === icon.name
                  ? 'border-indigo-500 bg-indigo-50'
                  : 'border-gray-200'
              }`}
              title={icon.label}
            >
              <div className="text-gray-600">{getIcon(icon.name)}</div>
              <span className="text-xs text-gray-500">{icon.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
        <Button type="button" variant="secondary" onClick={onCancel} disabled={loading}>
          Отмена
        </Button>
        <Button type="submit" variant="primary" disabled={loading}>
          {loading ? 'Сохранение...' : 'Сохранить'}
        </Button>
      </div>
    </form>
  )
}
