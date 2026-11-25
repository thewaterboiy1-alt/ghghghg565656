import React, { useEffect, useState } from 'react';
import { Trash2, X } from 'lucide-react';
import { CATEGORIES } from '../data/categories';
import { CategoryId, Transaction, TransactionType } from '../types/finance';
import { getCurrentTimeString, getTodayDateString } from '../utils/format';
import { CategoryIcon } from './CategoryIcon';

interface TransactionModalProps {
  isOpen: boolean;
  editingTransaction: Transaction | null;
  defaultDate?: string;
  onClose: () => void;
  onSave: (data: Omit<Transaction, 'id' | 'createdAt'>, existingId?: string) => void;
  onDelete: (id: string) => void;
}

const QUICK_AMOUNTS = [20, 50, 100, 500, 1000];

export const TransactionModal: React.FC<TransactionModalProps> = ({
  isOpen,
  editingTransaction,
  defaultDate,
  onClose,
  onSave,
  onDelete,
}) => {
  const [type, setType] = useState<TransactionType>('expense');
  const [amountStr, setAmountStr] = useState('');
  const [category, setCategory] = useState<CategoryId>('food');
  const [note, setNote] = useState('');
  const [date, setDate] = useState(getTodayDateString());
  const [time, setTime] = useState(getCurrentTimeString());
  const [errorMsg, setErrorMsg] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    setErrorMsg('');
    setConfirmDelete(false);

    if (editingTransaction) {
      setType(editingTransaction.type);
      setAmountStr(String(editingTransaction.amount));
      setCategory(editingTransaction.category);
      setNote(editingTransaction.note);
      setDate(editingTransaction.date);
      setTime(editingTransaction.time);
    } else {
      setType('expense');
      setAmountStr('');
      setCategory('food');
      setNote('');
      setDate(defaultDate || getTodayDateString());
      setTime(getCurrentTimeString());
    }
  }, [isOpen, editingTransaction, defaultDate]);

  if (!isOpen) return null;

  const availableCategories = CATEGORIES.filter((c) => c.type === type);

  const handleTypeChange = (nextType: TransactionType) => {
    setType(nextType);
    const matching = CATEGORIES.filter((c) => c.type === nextType);
    if (!matching.some((c) => c.id === category)) {
      setCategory(matching[0].id);
    }
  };

  const handleQuickAddAmount = (val: number) => {
    const current = parseFloat(amountStr) || 0;
    setAmountStr(String(current + val));
    setErrorMsg('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numeric = parseFloat(amountStr);
    if (isNaN(numeric) || numeric <= 0) {
      setErrorMsg('กรุณาระบุจำนวนเงินที่มากกว่า 0 บาท');
      return;
    }

    onSave(
      {
        type,
        amount: Math.round(numeric * 100) / 100,
        category,
        note: note.trim(),
        date: date || getTodayDateString(),
        time: time || getCurrentTimeString(),
      },
      editingTransaction?.id
    );
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-900/50 backdrop-blur-sm p-0 sm:p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={editingTransaction ? 'แก้ไขรายการ' : 'บันทึกรายการใหม่'}
    >
      <div
        className="w-full sm:max-w-lg max-h-[92vh] overflow-y-auto rounded-t-3xl sm:rounded-2xl bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 z-10 bg-white px-5 pt-3 pb-3 border-b border-slate-100">
          <div className="w-10 h-1.5 bg-slate-200 rounded-full mx-auto mb-3 sm:hidden" />
          <div className="flex items-center justify-between gap-4">
            <h2 className="font-display text-lg font-bold text-slate-900">
              {editingTransaction ? 'แก้ไขรายการ' : 'บันทึกรายรับ-รายจ่าย'}
            </h2>
            <button
              type="button"
              onClick={onClose}
              className="min-h-[44px] min-w-[44px] -mr-2 flex items-center justify-center rounded-xl text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition"
              aria-label="ปิดหน้าต่าง"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-5">
          {/* Type Switch */}
          <div className="grid grid-cols-2 gap-1.5 p-1 bg-slate-100 rounded-xl">
            <button
              type="button"
              onClick={() => handleTypeChange('expense')}
              className={`min-h-[44px] rounded-lg text-sm font-semibold transition ${
                type === 'expense'
                  ? 'bg-white text-rose-600 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              รายจ่าย (-)
            </button>
            <button
              type="button"
              onClick={() => handleTypeChange('income')}
              className={`min-h-[44px] rounded-lg text-sm font-semibold transition ${
                type === 'income'
                  ? 'bg-white text-emerald-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              รายรับ (+)
            </button>
          </div>

          {/* Amount Input */}
          <div>
            <label
              htmlFor="tx-amount"
              className="block text-xs font-medium text-slate-600 mb-1.5"
            >
              จำนวนเงิน (บาท)
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl font-bold text-slate-400">
                ฿
              </span>
              <input
                id="tx-amount"
                type="number"
                inputMode="decimal"
                step="0.01"
                min="0"
                autoFocus
                value={amountStr}
                onChange={(e) => {
                  setAmountStr(e.target.value);
                  setErrorMsg('');
                }}
                placeholder="0.00"
                className="w-full min-h-[56px] rounded-2xl border border-slate-200 bg-slate-50/70 pl-11 pr-4 text-2xl sm:text-3xl font-bold text-slate-900 tabular-nums focus:border-teal-600 focus:bg-white focus:outline-none transition"
              />
            </div>

            {/* Quick Amount Buttons */}
            <div className="mt-2.5 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
              {QUICK_AMOUNTS.map((val) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => handleQuickAddAmount(val)}
                  className="min-h-[36px] px-3 rounded-lg border border-slate-200 bg-white text-xs font-medium text-slate-700 hover:bg-slate-50 active:scale-[0.97] transition tabular-nums shrink-0"
                >
                  +{val.toLocaleString()}
                </button>
              ))}
              {amountStr && (
                <button
                  type="button"
                  onClick={() => setAmountStr('')}
                  className="min-h-[36px] px-3 rounded-lg text-xs font-medium text-slate-500 hover:text-slate-800 shrink-0"
                >
                  ล้างยอด
                </button>
              )}
            </div>
            {errorMsg && (
              <p className="mt-1.5 text-xs font-medium text-rose-600">{errorMsg}</p>
            )}
          </div>

          {/* Category Grid */}
          <div>
            <span className="block text-xs font-medium text-slate-600 mb-2">
              หมวดหมู่
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {availableCategories.map((cat) => {
                const selected = category === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setCategory(cat.id)}
                    className={`min-h-[48px] px-3 py-2 rounded-xl border text-left flex items-center gap-2.5 transition ${
                      selected
                        ? 'border-teal-700 bg-teal-50/80 text-teal-950 font-semibold'
                        : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <span
                      className={`h-7 w-7 rounded-lg flex items-center justify-center shrink-0 ${cat.bgTint} ${cat.textTint}`}
                    >
                      <CategoryIcon iconName={cat.iconName} className="w-3.5 h-3.5" />
                    </span>
                    <span className="text-xs truncate">{cat.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Date & Time */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label
                htmlFor="tx-date"
                className="block text-xs font-medium text-slate-600 mb-1.5"
              >
                วันที่
              </label>
              <input
                id="tx-date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full min-h-[44px] rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 tabular-nums focus:border-teal-600 focus:outline-none"
              />
            </div>
            <div>
              <label
                htmlFor="tx-time"
                className="block text-xs font-medium text-slate-600 mb-1.5"
              >
                เวลา
              </label>
              <input
                id="tx-time"
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full min-h-[44px] rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 tabular-nums focus:border-teal-600 focus:outline-none"
              />
            </div>
          </div>

          {/* Note */}
          <div>
            <label
              htmlFor="tx-note"
              className="block text-xs font-medium text-slate-600 mb-1.5"
            >
              บันทึกช่วยจำ (ไม่บังคับ)
            </label>
            <input
              id="tx-note"
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="เช่น ข้าวมันไก่, ค่ารถไฟฟ้า, ค่าเน็ตบ้าน"
              className="w-full min-h-[44px] rounded-xl border border-slate-200 bg-white px-3.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-teal-600 focus:outline-none"
            />
          </div>

          {/* Submit & Delete Actions */}
          <div className="pt-2 flex flex-col sm:flex-row gap-2.5 pb-safe">
            {editingTransaction && (
              <button
                type="button"
                onClick={() => {
                  if (!confirmDelete) {
                    setConfirmDelete(true);
                    return;
                  }
                  onDelete(editingTransaction.id);
                  onClose();
                }}
                className={`min-h-[48px] px-4 rounded-xl border text-sm font-medium inline-flex items-center justify-center gap-2 transition ${
                  confirmDelete
                    ? 'border-rose-600 bg-rose-600 text-white hover:bg-rose-700'
                    : 'border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100'
                }`}
              >
                <Trash2 className="w-4 h-4 shrink-0" />
                <span>{confirmDelete ? 'ยืนยันลบรายการนี้' : 'ลบรายการ'}</span>
              </button>
            )}

            <button
              type="submit"
              className="flex-1 min-h-[48px] rounded-xl bg-teal-700 px-5 text-sm font-semibold text-white hover:bg-teal-800 active:scale-[0.99] transition"
            >
              {editingTransaction ? 'บันทึกการแก้ไข' : 'บันทึกรายการ'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
