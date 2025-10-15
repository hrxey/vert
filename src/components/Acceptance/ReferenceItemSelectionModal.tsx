import React, { useState, useEffect } from 'react'
import { Modal } from '../ui/Modal'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { fetchMotors } from '../../services/motorService'
import { getCounterparties, Counterparty } from '../../services/counterpartyService'
import { subdivisionService } from '../../services/subdivisionService'
import { wireService, Wire } from '../../services/wireService'
import { bearingService, Bearing } from '../../services/bearingService'
import { impellerService, Impeller } from '../../services/impellerService'
import { laborPaymentService, LaborPayment } from '../../services/laborPaymentService'
import { Motor, Subdivision } from '../../types/database'

interface ReferenceItemSelectionModalProps {
  isOpen: boolean
  onClose: () => void
  referenceType: 'motors' | 'counterparties' | 'subdivisions' | 'wires' | 'bearings' | 'impellers' | 'labor_payments'
  onSelectItem: (item: { name: string; price?: number }) => void
}

export const ReferenceItemSelectionModal: React.FC<ReferenceItemSelectionModalProps> = ({
  isOpen,
  onClose,
  referenceType,
  onSelectItem,
}) => {
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [motors, setMotors] = useState<Motor[]>([])
  const [counterparties, setCounterparties] = useState<Counterparty[]>([])
  const [subdivisions, setSubdivisions] = useState<Subdivision[]>([])
  const [wires, setWires] = useState<Wire[]>([])
  const [bearings, setBearings] = useState<Bearing[]>([])
  const [impellers, setImpellers] = useState<Impeller[]>([])
  const [laborPayments, setLaborPayments] = useState<LaborPayment[]>([])

  useEffect(() => {
    if (isOpen) {
      loadData()
    }
  }, [isOpen, referenceType])

  const loadData = async () => {
    setLoading(true)
    setError(null)
    try {
      if (referenceType === 'motors') {
        const data = await fetchMotors()
        setMotors(data)
      } else if (referenceType === 'counterparties') {
        const data = await getCounterparties()
        setCounterparties(data)
      } else if (referenceType === 'subdivisions') {
        const data = await subdivisionService.fetchSubdivisions()
        setSubdivisions(data)
      } else if (referenceType === 'wires') {
        const data = await wireService.getAll()
        setWires(data)
      } else if (referenceType === 'bearings') {
        const data = await bearingService.getAll()
        setBearings(data)
      } else if (referenceType === 'impellers') {
        const data = await impellerService.getAll()
        setImpellers(data)
      } else if (referenceType === 'labor_payments') {
        const data = await laborPaymentService.getAll()
        setLaborPayments(data)
      }
    } catch (err) {
      setError('Не удалось загрузить данные')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const getFilteredItems = () => {
    const query = searchQuery.toLowerCase()
    if (referenceType === 'motors') {
      return motors.filter(
        (motor) =>
          motor.name.toLowerCase().includes(query) ||
          motor.manufacturer?.toLowerCase().includes(query)
      )
    } else if (referenceType === 'counterparties') {
      return counterparties.filter(
        (cp) =>
          cp.name.toLowerCase().includes(query) ||
          cp.inn?.toLowerCase().includes(query)
      )
    } else if (referenceType === 'subdivisions') {
      return subdivisions.filter(
        (sub) =>
          sub.name.toLowerCase().includes(query) ||
          sub.code?.toLowerCase().includes(query)
      )
    } else if (referenceType === 'wires') {
      return wires.filter(
        (wire) =>
          wire.name.toLowerCase().includes(query) ||
          wire.brand.toLowerCase().includes(query) ||
          wire.cross_section.toLowerCase().includes(query)
      )
    } else if (referenceType === 'bearings') {
      return bearings.filter(
        (bearing) =>
          bearing.name.toLowerCase().includes(query) ||
          bearing.brand.toLowerCase().includes(query) ||
          bearing.number.toLowerCase().includes(query) ||
          bearing.type.toLowerCase().includes(query) ||
          bearing.diameter.toString().includes(query)
      )
    } else if (referenceType === 'impellers') {
      return impellers.filter(
        (impeller) =>
          impeller.name.toLowerCase().includes(query) ||
          impeller.mounting_diameter.toString().includes(query) ||
          impeller.outer_diameter.toString().includes(query) ||
          impeller.height.toString().includes(query) ||
          impeller.blade_count.toString().includes(query)
      )
    } else {
      return laborPayments.filter(
        (payment) =>
          payment.payment_name.toLowerCase().includes(query) ||
          payment.full_name.toLowerCase().includes(query) ||
          payment.short_name.toLowerCase().includes(query) ||
          payment.position.toLowerCase().includes(query)
      )
    }
  }

  const handleSelectMotor = (motor: Motor) => {
    const name = motor.manufacturer
      ? `${motor.name} - ${motor.manufacturer}`
      : motor.name
    onSelectItem({ name, price: motor.price_per_unit })
    onClose()
  }

  const handleSelectCounterparty = (counterparty: Counterparty) => {
    onSelectItem({ name: counterparty.name })
    onClose()
  }

  const handleSelectSubdivision = (subdivision: Subdivision) => {
    onSelectItem({ name: subdivision.name })
    onClose()
  }

  const handleSelectWire = (wire: Wire) => {
    onSelectItem({ name: wire.name, price: wire.price })
    onClose()
  }

  const handleSelectBearing = (bearing: Bearing) => {
    onSelectItem({ name: bearing.name })
    onClose()
  }

  const handleSelectImpeller = (impeller: Impeller) => {
    onSelectItem({ name: impeller.name })
    onClose()
  }

  const handleSelectLaborPayment = (payment: LaborPayment) => {
    onSelectItem({ name: payment.payment_name, price: payment.hourly_rate })
    onClose()
  }

  const getTitle = () => {
    if (referenceType === 'motors') return 'Выбор двигателя'
    if (referenceType === 'counterparties') return 'Выбор контрагента'
    if (referenceType === 'subdivisions') return 'Выбор подразделения'
    if (referenceType === 'wires') return 'Выбор провода'
    if (referenceType === 'bearings') return 'Выбор подшипника'
    if (referenceType === 'impellers') return 'Выбор крыльчатки'
    return 'Выбор оплаты труда'
  }

  const filteredItems = getFilteredItems()

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={getTitle()} size="lg">
      <div className="space-y-4">
        <div>
          <Input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Поиск"
            autoFocus
          />
        </div>

        {loading && (
          <div className="text-center py-8 text-gray-600">Загрузка...</div>
        )}

        {error && (
          <div className="text-center py-8 text-red-600">{error}</div>
        )}

        {!loading && !error && (
          <div className="max-h-96 overflow-y-auto space-y-2">
            {filteredItems.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                Ничего не найдено
              </div>
            )}

            {referenceType === 'motors' &&
              (filteredItems as Motor[]).map((motor) => (
                <button
                  key={motor.id}
                  onClick={() => handleSelectMotor(motor)}
                  className="w-full p-3 border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-gray-300 transition-colors text-left"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{motor.name}</p>
                      {motor.manufacturer && (
                        <p className="text-sm text-gray-600">
                          {motor.manufacturer}
                        </p>
                      )}
                      <div className="flex gap-4 mt-1 text-xs text-gray-500">
                        <span>{motor.power_kw} кВт</span>
                        <span>{motor.rpm} об/мин</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">
                        {motor.price_per_unit.toLocaleString('ru-RU')} ₽
                      </p>
                    </div>
                  </div>
                </button>
              ))}

            {referenceType === 'counterparties' &&
              (filteredItems as Counterparty[]).map((cp) => (
                <button
                  key={cp.id}
                  onClick={() => handleSelectCounterparty(cp)}
                  className="w-full p-3 border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-gray-300 transition-colors text-left"
                >
                  <p className="font-medium text-gray-900">{cp.name}</p>
                  {cp.inn && (
                    <p className="text-sm text-gray-600">ИНН: {cp.inn}</p>
                  )}
                  {cp.contact_person && (
                    <p className="text-sm text-gray-500">{cp.contact_person}</p>
                  )}
                </button>
              ))}

            {referenceType === 'subdivisions' &&
              (filteredItems as Subdivision[]).map((sub) => (
                <button
                  key={sub.id}
                  onClick={() => handleSelectSubdivision(sub)}
                  className="w-full p-3 border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-gray-300 transition-colors text-left"
                >
                  <p className="font-medium text-gray-900">{sub.name}</p>
                  {sub.code && (
                    <p className="text-sm text-gray-600">Код: {sub.code}</p>
                  )}
                  {sub.description && (
                    <p className="text-sm text-gray-500">{sub.description}</p>
                  )}
                </button>
              ))}

            {referenceType === 'wires' &&
              (filteredItems as Wire[]).map((wire) => (
                <button
                  key={wire.id}
                  onClick={() => handleSelectWire(wire)}
                  className="w-full p-3 border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-gray-300 transition-colors text-left"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{wire.name}</p>
                      <div className="flex gap-4 mt-1 text-xs text-gray-500">
                        <span>Вид: {wire.type}</span>
                        <span>Марка: {wire.brand}</span>
                        <span>Сечение: {wire.cross_section}</span>
                        <span>Форма: {wire.shape}</span>
                        {wire.heat_resistance && (
                          <span>Нагревостойкость: {wire.heat_resistance}</span>
                        )}
                      </div>
                    </div>
                    {wire.price > 0 && (
                      <div className="text-right">
                        <p className="font-semibold text-gray-900">
                          {wire.price.toLocaleString('ru-RU')} ₽
                        </p>
                      </div>
                    )}
                  </div>
                </button>
              ))}

            {referenceType === 'bearings' &&
              (filteredItems as Bearing[]).map((bearing) => (
                <button
                  key={bearing.id}
                  onClick={() => handleSelectBearing(bearing)}
                  className="w-full p-3 border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-gray-300 transition-colors text-left"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{bearing.name}</p>
                      <div className="flex gap-4 mt-1 text-xs text-gray-500">
                        <span>Марка: {bearing.brand}</span>
                        <span>Диаметр: {bearing.diameter} мм</span>
                        <span>Номер: {bearing.number}</span>
                        <span>Вид: {bearing.type}</span>
                      </div>
                    </div>
                  </div>
                </button>
              ))}

            {referenceType === 'impellers' &&
              (filteredItems as Impeller[]).map((impeller) => (
                <button
                  key={impeller.id}
                  onClick={() => handleSelectImpeller(impeller)}
                  className="w-full p-3 border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-gray-300 transition-colors text-left"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{impeller.name}</p>
                      <div className="flex gap-4 mt-1 text-xs text-gray-500">
                        <span>Посадочный Ø: {impeller.mounting_diameter} мм</span>
                        <span>Наружный Ø: {impeller.outer_diameter} мм</span>
                        <span>Высота: {impeller.height} мм</span>
                        <span>Лопасти: {impeller.blade_count}</span>
                      </div>
                    </div>
                  </div>
                </button>
              ))}

            {referenceType === 'labor_payments' &&
              (filteredItems as LaborPayment[]).map((payment) => (
                <button
                  key={payment.id}
                  onClick={() => handleSelectLaborPayment(payment)}
                  className="w-full p-3 border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-gray-300 transition-colors text-left"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{payment.payment_name}</p>
                      <div className="flex gap-4 mt-1 text-xs text-gray-500">
                        <span>ФИО: {payment.short_name}</span>
                        <span>Должность: {payment.position}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">
                        {payment.hourly_rate.toLocaleString('ru-RU')} ₽/час
                      </p>
                    </div>
                  </div>
                </button>
              ))}
          </div>
        )}

        <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
          <Button variant="secondary" onClick={onClose}>
            Отмена
          </Button>
        </div>
      </div>
    </Modal>
  )
}
