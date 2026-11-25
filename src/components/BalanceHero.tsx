import React from 'react';
import { ChevronLeft, ChevronRight, TrendingDown, TrendingUp } from 'lucide-react';
import { formatBaht, formatThaiMonthYear } from '../utils/format';

interface BalanceHeroProps {
  selectedMonth: string;
  onChangeMonth: (delta: number) => void;
  monthBalance: number;
  monthIncome: number;
  monthExpense: number;
  todayExpense: number;
  cumulativeBalance: number;
  monthlyBudget: number;
  streak: number;
  recordedDaysCount: number;
}

export const BalanceHero: React.FC<BalanceHeroProps> = ({
  selectedMonth,
  onChangeMonth,
  monthBalance,
  monthIncome,
  monthExpense,
  todayExpense,
  cumulativeBalance,
  monthlyBudget,
  streak,
  recordedDaysCount,
}) => {
  const budgetRatio =
    monthlyBudget > 0 ? Math.min(100, Math.round((monthExpense / monthlyBudget) * 100)) : 0;
  const isOverBudget = monthlyBudget > 0 && monthExpense > monthlyBudget;
  const remainingBudget = monthlyBudget - monthExpense;

  return (
    <section
      aria-label="สรุปยอดเงินคงเหลือ"
      className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-xs"
    >
      {/* Month Switcher + Meta */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-100">
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => onChangeMonth(-1)}
            className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition"
            aria-label="เดือนก่อนหน้า"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <h1 className="font-display text-lg sm:text-xl font-bold text-slate-900 px-1 whitespace-nowrap">
            {formatThaiMonthYear(selectedMonth)}
          </h1>
          <button
            type="button"
            onClick={() => onChangeMonth(1)}
            className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition"
            aria-label="เดือนถัดไป"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-500 tabular-nums">
          <span>บันทึกแล้ว {recordedDaysCount} วันในเดือนนี้</span>
          {streak > 0 && (
            <>
              <span aria-hidden="true">·</span>
              <span className="text-teal-700 font-medium">ต่อเนื่อง {streak} วัน</span>
            </>
          )}
        </div>
      </div>

      {/* Dominant Net Balance Anchor */}
      <div className="pt-5 pb-5">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <span className="text-sm font-medium text-slate-500">
            ยอดเงินคงเหลือสุทธิประจำเดือน
          </span>
          <span className="text-xs text-slate-500 tabular-nums">
            คงเหลือสะสมทั้งหมด {formatBaht(cumulativeBalance)}
          </span>
        </div>

        <div className="mt-1.5 flex items-baseline gap-3">
          <span
            className={`font-display text-3xl sm:text-4xl font-bold tracking-tight tabular-nums ${
              monthBalance >= 0 ? 'text-slate-900' : 'text-rose-600'
            }`}
          >
            {formatBaht(monthBalance)}
          </span>
          <span
            className={`text-xs font-medium ${
              monthBalance >= 0 ? 'text-emerald-700' : 'text-rose-600'
            }`}
          >
            {monthBalance >= 0 ? 'รายรับมากกว่ารายจ่าย' : 'รายจ่ายเกินรายรับ'}
          </span>
        </div>
      </div>

      {/* 3-Column Financial Breakdown (no nested boxes, clean dividers) */}
      <div className="grid grid-cols-3 gap-3 sm:gap-6 pt-4 border-t border-slate-100">
        <div>
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <TrendingUp className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span className="truncate">รายรับเดือนนี้</span>
          </div>
          <p className="mt-1 text-base sm:text-lg font-semibold text-emerald-700 tabular-nums">
            +{formatBaht(monthIncome)}
          </p>
        </div>

        <div className="border-l border-slate-100 pl-3 sm:pl-6">
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <TrendingDown className="w-3.5 h-3.5 text-rose-600 shrink-0" />
            <span className="truncate">รายจ่ายเดือนนี้</span>
          </div>
          <p className="mt-1 text-base sm:text-lg font-semibold text-rose-600 tabular-nums">
            -{formatBaht(monthExpense)}
          </p>
        </div>

        <div className="border-l border-slate-100 pl-3 sm:pl-6">
          <div className="text-xs text-slate-500 truncate">ใช้จ่ายวันนี้</div>
          <p className="mt-1 text-base sm:text-lg font-semibold text-slate-900 tabular-nums">
            {formatBaht(todayExpense)}
          </p>
        </div>
      </div>

      {/* Monthly Budget Bar */}
      {monthlyBudget > 0 && (
        <div className="mt-5 pt-4 border-t border-slate-100">
          <div className="flex items-center justify-between gap-2 text-xs">
            <span className="text-slate-600">
              งบรายจ่ายรายเดือน{' '}
              <span className="font-medium text-slate-900 tabular-nums">
                {formatBaht(monthlyBudget)}
              </span>
            </span>
            <span
              className={`font-medium tabular-nums ${
                isOverBudget ? 'text-rose-600' : 'text-slate-700'
              }`}
            >
              {isOverBudget
                ? `เกินงบ ${formatBaht(Math.abs(remainingBudget))} (${budgetRatio}%)`
                : `เหลืองบ ${formatBaht(remainingBudget)} (ใช้ไป ${budgetRatio}%)`}
            </span>
          </div>
          <div className="mt-2 h-2 w-full rounded-full bg-slate-100 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-300 ${
                isOverBudget
                  ? 'bg-rose-600'
                  : budgetRatio >= 80
                  ? 'bg-amber-500'
                  : 'bg-teal-700'
              }`}
              style={{ width: `${budgetRatio}%` }}
            />
          </div>
        </div>
      )}
    </section>
  );
};
