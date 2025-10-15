import React, { useState, useMemo } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { AvailableReceptionItem } from '../../services/updService';
import { UnifiedWorkGroup } from '../common/UnifiedHierarchyComponents';
import { formatCurrency } from '../common/HierarchyShared';

interface PositionableItem extends AvailableReceptionItem {}

interface HierarchicalTopLevelGroup {
  id: string;
  positionNumber: number;
  mainInfo: {
    service_description: string;
    subdivision: string | null;
    reception_number: string;
    reception_date: string;
  };
  workGroups: Array<{
    id: string;
    workGroup: string;
    positions: Array<{
      id: string;
      baseItemName: string;
      incomeItems: PositionableItem[];
      expenseItems: PositionableItem[];
    }>;
  }>;
  itemCount: number;
  allItemIds: string[];
}

const getBaseItemName = (description: string): string => {
  return description;
};


const PositionCard: React.FC<{
  group: HierarchicalTopLevelGroup;
  selectedItemIds: Set<string>;
  onToggleItem: (itemId: string) => void;
  onTogglePosition: (itemIds: string[]) => void;
}> = ({ group, selectedItemIds, onToggleItem, onTogglePosition }) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const selectedCount = useMemo(() => {
    return group.allItemIds.filter((id) => selectedItemIds.has(id)).length;
  }, [group.allItemIds, selectedItemIds]);

  const allSelected = selectedCount === group.allItemIds.length;
  const someSelected = selectedCount > 0 && selectedCount < group.allItemIds.length;

  const handleTogglePosition = (e: React.MouseEvent) => {
    e.stopPropagation();
    onTogglePosition(group.allItemIds);
  };

  const handleHeaderClick = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <div className="bg-white rounded-lg shadow border border-slate-200">
      <div className="flex items-start p-3 hover:bg-slate-50 rounded-t-lg">
        <input
          type="checkbox"
          checked={allSelected}
          ref={(input) => {
            if (input) input.indeterminate = someSelected;
          }}
          onChange={handleTogglePosition}
          onClick={(e) => e.stopPropagation()}
          className="rounded border-slate-400 text-blue-600 mt-1 mr-2 flex-shrink-0 focus:ring-blue-500"
        />
        <span className="flex items-center justify-center w-6 h-6 bg-blue-600 text-white rounded-full text-xs font-bold flex-shrink-0 mt-0.5">
          {group.positionNumber}
        </span>
        <div
          onClick={handleHeaderClick}
          className="flex-grow min-w-0 ml-3 cursor-pointer"
        >
          <h2 className="text-sm font-semibold text-slate-900">
            {group.mainInfo.service_description}
          </h2>
          <p className="mt-0.5 text-xs text-blue-600 font-medium">
            Приемка: {group.mainInfo.reception_number} от {new Date(group.mainInfo.reception_date).toLocaleDateString('ru-RU')}
          </p>
          {group.mainInfo.subdivision && (
            <p className="mt-0.5 text-xs text-slate-600">
              Подразделение: {group.mainInfo.subdivision}
            </p>
          )}
        </div>
        <div
          onClick={handleHeaderClick}
          className="flex items-center flex-shrink-0 ml-3 mt-0.5 cursor-pointer"
        >
          <div className="text-right mr-2">
            <span className="text-xs text-slate-600 font-medium">
              {selectedCount} / {group.itemCount} работ
            </span>
          </div>
          <div className="text-slate-500">
            {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
          </div>
        </div>
      </div>
      {isExpanded && (
        <div className="pb-2 mt-1 px-3 pl-11">
          {group.workGroups.map((workGroup) => (
            <UnifiedWorkGroup
              key={workGroup.id}
              workGroup={workGroup.workGroup}
              positions={workGroup.positions}
              mode="selection"
              selectedItemIds={selectedItemIds}
              onToggleItem={onToggleItem}
            />
          ))}
        </div>
      )}
    </div>
  );
};

// --- MAIN COMPONENT ---

export interface UPDItemsHierarchyProps {
  items: PositionableItem[];
  selectedItemIds: Set<string>;
  onToggleItem: (itemId: string) => void;
  onToggleAll: () => void;
  onToggleMultiple: (itemIds: string[]) => void;
}

export const UPDItemsHierarchy: React.FC<UPDItemsHierarchyProps> = ({
  items,
  selectedItemIds,
  onToggleItem,
  onToggleAll,
  onToggleMultiple,
}) => {
  const handleTogglePosition = (itemIds: string[]) => {
    onToggleMultiple(itemIds);
  };

  const hierarchicalData: HierarchicalTopLevelGroup[] = useMemo(() => {
    // Group by unique combination of reception_number and position_number
    const positionMap = new Map<string, PositionableItem[]>();
    items.forEach((item) => {
      const key = `${item.reception_number}-${item.position_number}`;
      if (!positionMap.has(key)) positionMap.set(key, []);
      positionMap.get(key)!.push(item);
    });

    // Sort by reception date (newest first), then by position number
    const sortedPositions = Array.from(positionMap.entries()).sort((a, b) => {
      const itemsA = a[1];
      const itemsB = b[1];
      const dateA = new Date(itemsA[0].reception_date).getTime();
      const dateB = new Date(itemsB[0].reception_date).getTime();
      if (dateB !== dateA) return dateB - dateA;
      return itemsA[0].position_number - itemsB[0].position_number;
    });

    return sortedPositions.map(([key, positionItems]) => {
      const firstItem = positionItems[0];
      const workGroupMap = new Map<string, PositionableItem[]>();
      positionItems.forEach((item) => {
        const workGroupName = item.work_group || 'Прочие работы';
        if (!workGroupMap.has(workGroupName)) workGroupMap.set(workGroupName, []);
        workGroupMap.get(workGroupName)!.push(item);
      });

      const workGroups = Array.from(workGroupMap.entries()).map(
        ([workGroupName, workItems]) => {
          const positionMap = new Map<string, PositionableItem[]>();
          workItems.forEach((item) => {
            const baseName = getBaseItemName(item.item_description);
            if (!positionMap.has(baseName)) positionMap.set(baseName, []);
            positionMap.get(baseName)!.push(item);
          });

          const positions = Array.from(positionMap.entries()).map(
            ([baseName, posItems]) => {
              const incomeItems = posItems.filter(item =>
                item.transaction_type === 'Приход' || item.transaction_type === 'Доходы'
              );
              const expenseItems = posItems.filter(item =>
                item.transaction_type !== 'Приход' && item.transaction_type !== 'Доходы'
              );

              return {
                id: baseName,
                baseItemName: baseName,
                incomeItems,
                expenseItems,
              };
            }
          );

          return {
            id: workGroupName,
            workGroup: workGroupName,
            positions,
          };
        }
      );

      return {
        id: key,
        positionNumber: firstItem.position_number,
        mainInfo: {
          service_description: firstItem.motor_service_description,
          subdivision: firstItem.subdivision_name,
          reception_number: firstItem.reception_number,
          reception_date: firstItem.reception_date,
        },
        workGroups,
        itemCount: positionItems.length,
        allItemIds: positionItems.map(item => item.id),
      };
    });
  }, [items]);

  if (items.length === 0) {
    return (
      <div className="text-center py-8 text-xs text-slate-500">
        Нет доступных позиций для выбранных фильтров
      </div>
    );
  }

  const allSelected = items.length > 0 && selectedItemIds.size === items.length;
  const someSelected = selectedItemIds.size > 0 && selectedItemIds.size < items.length;
  const totalSelectedAmount = items
    .filter((item) => selectedItemIds.has(item.id))
    .reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <div>
      <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200">
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={allSelected}
            ref={(input) => {
              if (input) input.indeterminate = someSelected;
            }}
            onChange={onToggleAll}
            className="rounded border-slate-400 text-blue-600 h-4 w-4 focus:ring-blue-500"
          />
          <label className="text-xs font-medium text-slate-700">
            {selectedItemIds.size === 0
              ? 'Выбрать все'
              : `Выбрано: ${selectedItemIds.size} из ${items.length}`}
          </label>
        </div>
        {selectedItemIds.size > 0 && (
          <div className="text-right">
            <p className="text-xs text-slate-600">Сумма выбранных позиций:</p>
            <p className="text-sm font-bold text-slate-900">
              {formatCurrency(totalSelectedAmount)}
            </p>
          </div>
        )}
      </div>

      <div className="space-y-3 mt-3">
        {hierarchicalData.map((group) => (
          <PositionCard
            key={group.id}
            group={group}
            selectedItemIds={selectedItemIds}
            onToggleItem={onToggleItem}
            onTogglePosition={handleTogglePosition}
          />
        ))}
      </div>
    </div>
  );
};
