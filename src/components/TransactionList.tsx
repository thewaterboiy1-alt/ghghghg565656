import React, { useMemo, useState } from 'react';
import { Plus, Search, X } from 'lucide-react';
import { CATEGORY_MAP } from '../data/categories';
import { CategoryId, Transaction, TransactionType } from '../types/finance';
import { formatBaht, formatThaiDateFull } from '../utils/format';
import { CategoryIcon } from './CategoryIcon';

interface TransactionListProps {
  transactions: Transaction[];
  todayStr: string;
  selectedDate: string | null;
  selectedCategoryFilter: CategoryId | null;
  onClearCategoryFilter: () => void;
  onEditTransaction: (tx: Transaction) => void;
  onOpenAddModal: () => void;
}

export const TransactionList: React.FC<TransactionListProps> = ({
  transactions,
  todayStr,
  selectedDate,
  selectedCategoryFilter,
  onClearCategoryFilter,
  onEditTransaction,
  onOpenAddModal,
}) => {
  const [typeFilter, setTypeFilter] = useState<'all' | TransactionType>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filtered = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return transactions
      .filter((t) => {
        if (selectedDate && t.date !== selectedDate) return false;
        if (typeFilter !== 'all' && t.type !== typeFilter) return false;
        if (selectedCategoryFilter && t.category !== selectedCategoryFilter) return false;
        if (q) {
          const catName = CATEGORY_MAP[t.category]?.name.toLowerCase() || '';
          const note = (t.note || '').toLowerCase();
          if (!catName.includes(q) && !note.includes(q)) return false;
        }
        return true;
      })
      .sort((a, b) => {
        if (a.date !== b.date) return b.date.localeCompare(a.date);
        if (a.time !== b.time) return b.time.localeCompare(a.time);
        return b.createdAt - a.createdAt;
      });
  }, [transactions, selectedDate, typeFilter, selectedCategoryFilter, searchQuery]);

  const groupedByDate = useMemo(() => {
    const map = new Map<string, Transaction[]>();
    for (const tx of filtered) {
      const list = map.get(tx.date) || [];
      list.push(tx);
      map.set(tx.date, list);
    }
    return Array.from(map.entries());
  }, [filtered]);

  const activeCategoryName = selectedCategoryFilter
    ? CATEGORY_MAP[selectedCategoryFilter]?.name
    : null;

  return (
    <section
      aria-label="รายการรายรับรายจ่าย"
      className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden"
    >
      {/* Controls Header */}
      <div className="p-4 sm:p-5 border-b border-slate-100 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-display text-base sm:text-lg font-semibold text-slate-900">
            {selectedDate ? `รายการวันที่ ${formatThaiDateFull(selectedDate, todayStr)}` : 'ประวัติรายการรายวัน'}
          </h2>
          <span className="text-xs text-slate-500 tabular-nums">
            {filtered.length} รายการ
          </span>
        </div>

        {/* Search + Segmented Filter */}
        <div className="flex flex-col sm:flex-row gap-2.5">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ค้นหาหมวดหมู่ หรือบันทึกช่วยจำ..."
              className="w-full min-h-[44px] rounded-xl border border-slate-200 bg-slate-50/60 pl-9 pr-9 text-sm text-slate-900 placeholder:text-slate-400 focus:border-teal-600 focus:bg-white focus:outline-none transition"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="min-h-[44px] min-w-[44px] flex items-center justify-center absolute right-0 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
                aria-label="ล้างคำค้นหา"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl shrink-0">
            <button
              type="button"
              onClick={() => setTypeFilter('all')}
              className={`min-h-[36px] px-3 py-1.5 text-xs font-medium rounded-lg transition whitespace-nowrap shrink-0 ${
                typeFilter === 'all'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              ทั้งหมด
            </button>
            <button
              type="button"
              onClick={() => setTypeFilter('expense')}
              className={`min-h-[36px] px-3 py-1.5 text-xs font-medium rounded-lg transition whitespace-nowrap shrink-0 ${
                typeFilter === 'expense'
                  ? 'bg-white text-rose-600 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              รายจ่าย
            </button>
            <button
              type="button"
              onClick={() => setTypeFilter('income')}
              className={`min-h-[36px] px-3 py-1.5 text-xs font-medium rounded-lg transition whitespace-nowrap shrink-0 ${
                typeFilter === 'income'
                  ? 'bg-white text-emerald-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              รายรับ
            </button>
          </div>
        </div>

        {activeCategoryName && (
          <div className="flex items-center justify-between gap-2 pt-1 text-xs text-slate-600">
            <span>
              กำลังกรองหมวดหมู่: <strong className="text-slate-900">{activeCategoryName}</strong>
            </span>
            <button
              type="button"
              onClick={onClearCategoryFilter}
              className="text-teal-700 font-medium hover:underline whitespace-nowrap shrink-0"
            >
              แสดงทุกหมวดหมู่
            </button>
          </div>
        )}
      </div>

      {/* Empty State */}
      {groupedByDate.length === 0 ? (
        <div className="px-6 py-12 text-center">
          <p className="text-sm font-medium text-slate-800">
            ยังไม่มีรายการในเงื่อนไขที่เลือก
          </p>
          <p className="mt-1 text-xs text-slate-500">
            เพิ่มรายการรายรับหรือรายจ่ายเพื่อดูยอดคงเหลือและสัดส่วนรายเดือน
          </p>
          <button
            type="button"
            onClick={onOpenAddModal}
            className="mt-4 inline-flex items-center gap-1.5 min-h-[44px] rounded-xl bg-teal-700 px-4 py-2 text-sm font-medium text-white hover:bg-teal-800 transition"
          >
            <Plus className="w-4 h-4" />
            <span>บันทึกรายการใหม่</span>
          </button>
        </div>
      ) : (
        <div className="divide-y divide-slate-100">
          {groupedByDate.map(([dateKey, dayItems]) => {
            const dayIncome = dayItems
              .filter((t) => t.type === 'income')
              .reduce((s, t) => s + t.amount, 0);
            const dayExpense = dayItems
              .filter((t) => t.type === 'expense')
              .reduce((s, t) => s + t.amount, 0);

            return (
              <div key={dateKey}>
                {/* Day Header */}
                <div className="flex items-center justify-between gap-2 bg-slate-50/70 px-4 sm:px-5 py-2.5 text-xs">
                  <span className="font-semibold text-slate-700">
                    {formatThaiDateFull(dateKey, todayStr)}
                  </span>
                  <div className="flex items-center gap-3 tabular-nums text-slate-500">
                    {dayIncome > 0 && (
                      <span className="text-emerald-700 font-medium">
                        รับ +{formatBaht(dayIncome)}
                      </span>
                    )}
                    {dayExpense > 0 && (
                      <span className="text-rose-600 font-medium">
                        จ่าย -{formatBaht(dayExpense)}
                      </span>
                    )}
                  </div>
                </div>

                {/* Day Transaction Rows */}
                <div className="divide-y divide-slate-100">
                  {dayItems.map((tx) => {
                    const cat = CATEGORY_MAP[tx.category] || CATEGORY_MAP.other_expense;
                    return (
                      <button
                        key={tx.id}
                        type="button"
                        onClick={() => onEditTransaction(tx)}
                        className="w-full min-h-[64px] px-4 sm:px-5 py-3 flex items-center justify-between gap-3 text-left hover:bg-slate-50/80 active:bg-slate-100/70 transition"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div
                            className={`h-10 w-10 rounded-full flex items-center justify-center shrink-0 ${cat.bgTint} ${cat.textTint}`}
                          >
                            <CategoryIcon iconName={cat.iconName} className="w-4 h-4" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-slate-900 truncate">
                              {tx.note.trim() ? tx.note : cat.name}
                            </p>
                            <p className="mt-0.5 text-xs text-slate-500 flex items-center gap-1.5 truncate">
                              <span>{cat.name}</span>
                              <span aria-hidden="true">·</span>
                              <span className="tabular-nums">{tx.time} น.</span>
                              <span aria-hidden="true">·</span>
                              <span>{tx.type === 'income' ? 'รายรับ' : 'รายจ่าย'}</span>
                            </p>
                          </div>
                        </div>

                        <div className="text-right shrink-0 pl-2">
                          <span
                            className={`text-sm sm:text-base font-semibold tabular-nums ${
                              tx.type === 'income' ? 'text-emerald-700' : 'text-rose-600'
                            }`}
                          >
                            {formatBaht(tx.amount, { showSign: true, type: tx.type })}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
};
