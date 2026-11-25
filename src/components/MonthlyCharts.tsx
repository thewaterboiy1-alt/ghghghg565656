import React, { useMemo, useState } from 'react';
import { CATEGORY_MAP } from '../data/categories';
import { CategoryId, Transaction, TransactionType } from '../types/finance';
import { formatBaht, formatThaiMonthYear, getDaysInMonth } from '../utils/format';
import { CategoryIcon } from './CategoryIcon';

interface MonthlyChartsProps {
  selectedMonth: string;
  monthTransactions: Transaction[];
  selectedCategoryFilter: CategoryId | null;
  onSelectCategoryFilter: (catId: CategoryId | null) => void;
}

interface SliceData {
  categoryId: CategoryId;
  name: string;
  color: string;
  amount: number;
  percent: number;
  count: number;
}

export const MonthlyCharts: React.FC<MonthlyChartsProps> = ({
  selectedMonth,
  monthTransactions,
  selectedCategoryFilter,
  onSelectCategoryFilter,
}) => {
  const [chartType, setChartType] = useState<TransactionType>('expense');
  const [activeSliceId, setActiveSliceId] = useState<CategoryId | null>(null);
  const [hoveredDay, setHoveredDay] = useState<number | null>(null);

  const categoryBreakdown = useMemo(() => {
    const filtered = monthTransactions.filter((t) => t.type === chartType);
    const total = filtered.reduce((s, t) => s + t.amount, 0);

    const map = new Map<CategoryId, { amount: number; count: number }>();
    for (const tx of filtered) {
      const curr = map.get(tx.category) || { amount: 0, count: 0 };
      map.set(tx.category, {
        amount: curr.amount + tx.amount,
        count: curr.count + 1,
      });
    }

    const slices: SliceData[] = Array.from(map.entries())
      .map(([categoryId, data]) => {
        const meta = CATEGORY_MAP[categoryId];
        return {
          categoryId,
          name: meta?.name || categoryId,
          color: meta?.color || '#64748B',
          amount: data.amount,
          percent: total > 0 ? (data.amount / total) * 100 : 0,
          count: data.count,
        };
      })
      .sort((a, b) => b.amount - a.amount);

    return { total, slices };
  }, [monthTransactions, chartType]);

  const highlightedSlice = useMemo(() => {
    const targetId = activeSliceId || selectedCategoryFilter;
    if (!targetId) return categoryBreakdown.slices[0] || null;
    return (
      categoryBreakdown.slices.find((s) => s.categoryId === targetId) ||
      categoryBreakdown.slices[0] ||
      null
    );
  }, [activeSliceId, selectedCategoryFilter, categoryBreakdown.slices]);

  // Daily Bar Chart Data
  const dailyData = useMemo(() => {
    const days = getDaysInMonth(selectedMonth);
    const byDate = new Map<string, { income: number; expense: number }>();
    for (const tx of monthTransactions) {
      const curr = byDate.get(tx.date) || { income: 0, expense: 0 };
      if (tx.type === 'income') curr.income += tx.amount;
      else curr.expense += tx.amount;
      byDate.set(tx.date, curr);
    }

    const items = days.map((dateStr, idx) => {
      const vals = byDate.get(dateStr) || { income: 0, expense: 0 };
      return {
        dayNum: idx + 1,
        dateStr,
        income: vals.income,
        expense: vals.expense,
      };
    });

    const maxVal = items.reduce(
      (max, d) => Math.max(max, d.income, d.expense),
      0
    );

    return { items, maxVal };
  }, [selectedMonth, monthTransactions]);

  const activeDayItem = useMemo(() => {
    if (hoveredDay !== null) {
      return dailyData.items.find((d) => d.dayNum === hoveredDay) || null;
    }
    const nonZero = dailyData.items.filter((d) => d.expense > 0 || d.income > 0);
    return nonZero.length > 0 ? nonZero[nonZero.length - 1] : null;
  }, [hoveredDay, dailyData.items]);

  // SVG Donut Geometry
  const radius = 72;
  const strokeWidth = 24;
  const circumference = 2 * Math.PI * radius;

  const donutSegments = useMemo(() => {
    let accumulatedPercent = 0;
    return categoryBreakdown.slices.map((slice) => {
      const dashLength = (slice.percent / 100) * circumference;
      const dashOffset = -((accumulatedPercent / 100) * circumference);
      accumulatedPercent += slice.percent;
      return {
        ...slice,
        dashArray: `${Math.max(0, dashLength - 1.5)} ${circumference}`,
        dashOffset,
      };
    });
  }, [categoryBreakdown.slices, circumference]);

  return (
    <div className="space-y-5">
      {/* Donut Breakdown Card */}
      <section
        aria-label="กราฟสัดส่วนรายรับรายจ่ายรายเดือน"
        className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs"
      >
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="font-display text-base sm:text-lg font-semibold text-slate-900">
              สัดส่วนรายเดือน
            </h2>
            <p className="text-xs text-slate-500">
              {formatThaiMonthYear(selectedMonth)}
            </p>
          </div>

          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl">
            <button
              type="button"
              onClick={() => {
                setChartType('expense');
                setActiveSliceId(null);
              }}
              className={`min-h-[36px] px-3 py-1.5 text-xs font-medium rounded-lg transition whitespace-nowrap shrink-0 ${
                chartType === 'expense'
                  ? 'bg-white text-rose-600 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              รายจ่าย
            </button>
            <button
              type="button"
              onClick={() => {
                setChartType('income');
                setActiveSliceId(null);
              }}
              className={`min-h-[36px] px-3 py-1.5 text-xs font-medium rounded-lg transition whitespace-nowrap shrink-0 ${
                chartType === 'income'
                  ? 'bg-white text-emerald-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              รายรับ
            </button>
          </div>
        </div>

        {categoryBreakdown.slices.length === 0 ? (
          <div className="py-10 text-center">
            <p className="text-sm text-slate-500">
              ยังไม่มีข้อมูล{chartType === 'expense' ? 'รายจ่าย' : 'รายรับ'}ในเดือนนี้
            </p>
          </div>
        ) : (
          <div className="mt-5">
            {/* Donut Chart */}
            <div className="relative flex items-center justify-center py-2">
              <svg
                viewBox="0 0 200 200"
                className="w-52 h-52 -rotate-90"
                role="img"
                aria-label="กราฟวงกลมแสดงสัดส่วนรายเดือน"
              >
                <circle
                  cx="100"
                  cy="100"
                  r={radius}
                  fill="none"
                  stroke="#F1F5F9"
                  strokeWidth={strokeWidth}
                />
                {donutSegments.map((seg) => {
                  const isFocused = highlightedSlice?.categoryId === seg.categoryId;
                  return (
                    <circle
                      key={seg.categoryId}
                      cx="100"
                      cy="100"
                      r={radius}
                      fill="none"
                      stroke={seg.color}
                      strokeWidth={isFocused ? strokeWidth + 4 : strokeWidth}
                      strokeDasharray={seg.dashArray}
                      strokeDashoffset={seg.dashOffset}
                      className="cursor-pointer transition-all duration-200"
                      style={{
                        opacity:
                          highlightedSlice && !isFocused ? 0.55 : 1,
                      }}
                      onClick={() => {
                        setActiveSliceId(seg.categoryId);
                        onSelectCategoryFilter(
                          selectedCategoryFilter === seg.categoryId
                            ? null
                            : seg.categoryId
                        );
                      }}
                      onMouseEnter={() => setActiveSliceId(seg.categoryId)}
                    />
                  );
                })}
              </svg>

              {/* Center Metric Readout */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none px-10 text-center">
                {highlightedSlice ? (
                  <>
                    <span className="text-[11px] font-medium text-slate-500 truncate max-w-[110px]">
                      {highlightedSlice.name}
                    </span>
                    <span className="mt-0.5 text-lg font-bold text-slate-900 tabular-nums">
                      {highlightedSlice.percent.toFixed(1)}%
                    </span>
                    <span className="text-xs font-medium text-slate-600 tabular-nums">
                      {formatBaht(highlightedSlice.amount)}
                    </span>
                  </>
                ) : (
                  <>
                    <span className="text-xs text-slate-500">รวมทั้งหมด</span>
                    <span className="text-lg font-bold text-slate-900 tabular-nums">
                      {formatBaht(categoryBreakdown.total)}
                    </span>
                  </>
                )}
              </div>
            </div>

            {/* Category Breakdown List */}
            <div className="mt-4 space-y-2">
              {categoryBreakdown.slices.map((slice) => {
                const meta = CATEGORY_MAP[slice.categoryId];
                const isSelected = selectedCategoryFilter === slice.categoryId;
                const isHighlighted = highlightedSlice?.categoryId === slice.categoryId;

                return (
                  <button
                    key={slice.categoryId}
                    type="button"
                    onClick={() => {
                      setActiveSliceId(slice.categoryId);
                      onSelectCategoryFilter(isSelected ? null : slice.categoryId);
                    }}
                    onMouseEnter={() => setActiveSliceId(slice.categoryId)}
                    className={`w-full min-h-[48px] rounded-xl px-3 py-2 text-left transition ${
                      isSelected
                        ? 'bg-teal-50/80 ring-1 ring-teal-600/30'
                        : isHighlighted
                        ? 'bg-slate-50'
                        : 'hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span
                          className="h-2.5 w-2.5 rounded-full shrink-0"
                          style={{ backgroundColor: slice.color }}
                        />
                        {meta && (
                          <CategoryIcon
                            iconName={meta.iconName}
                            className="w-4 h-4 text-slate-500 shrink-0"
                          />
                        )}
                        <span className="text-xs sm:text-sm font-medium text-slate-800 truncate">
                          {slice.name}
                        </span>
                        <span className="text-[11px] text-slate-400 tabular-nums shrink-0">
                          ({slice.count})
                        </span>
                      </div>

                      <div className="flex items-center gap-2.5 shrink-0 tabular-nums">
                        <span className="text-xs font-semibold text-slate-900">
                          {formatBaht(slice.amount)}
                        </span>
                        <span className="text-xs text-slate-500 w-11 text-right">
                          {slice.percent.toFixed(0)}%
                        </span>
                      </div>
                    </div>

                    <div className="mt-1.5 h-1.5 w-full rounded-full bg-slate-100 overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-300"
                        style={{
                          width: `${Math.max(3, slice.percent)}%`,
                          backgroundColor: slice.color,
                        }}
                      />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </section>

      {/* Daily Cashflow Bar Chart */}
      <section
        aria-label="กราฟรายรับรายจ่ายรายวันในเดือน"
        className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs"
      >
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div>
            <h3 className="font-display text-base font-semibold text-slate-900">
              ความเคลื่อนไหวรายวันในเดือน
            </h3>
            <p className="text-xs text-slate-500">
              แตะที่แท่งกราฟเพื่อดูยอดรับ-จ่ายของแต่ละวัน
            </p>
          </div>
          <div className="flex items-center gap-3 text-xs text-slate-600">
            <span className="inline-flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-xs bg-emerald-600" />
              รายรับ
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-xs bg-rose-500" />
              รายจ่าย
            </span>
          </div>
        </div>

        {activeDayItem && dailyData.maxVal > 0 && (
          <div className="mt-3 flex flex-wrap items-center justify-between gap-2 rounded-xl bg-slate-50 px-3 py-2 text-xs tabular-nums">
            <span className="font-medium text-slate-800">
              วันที่ {activeDayItem.dayNum}
            </span>
            <div className="flex items-center gap-3">
              <span className="text-emerald-700 font-medium">
                รับ +{formatBaht(activeDayItem.income)}
              </span>
              <span className="text-rose-600 font-medium">
                จ่าย -{formatBaht(activeDayItem.expense)}
              </span>
            </div>
          </div>
        )}

        {dailyData.maxVal === 0 ? (
          <div className="py-8 text-center text-xs text-slate-500">
            ยังไม่มีข้อมูลสำหรับแสดงกราฟรายวันในเดือนนี้
          </div>
        ) : (
          <div className="mt-4">
            <div className="h-36 flex items-end gap-[3px] sm:gap-1">
              {dailyData.items.map((item) => {
                const incHeight =
                  item.income > 0
                    ? Math.max(6, Math.round((item.income / dailyData.maxVal) * 100))
                    : 0;
                const expHeight =
                  item.expense > 0
                    ? Math.max(6, Math.round((item.expense / dailyData.maxVal) * 100))
                    : 0;
                const isSelected = activeDayItem?.dayNum === item.dayNum;

                return (
                  <button
                    key={item.dateStr}
                    type="button"
                    onClick={() => setHoveredDay(item.dayNum)}
                    onMouseEnter={() => setHoveredDay(item.dayNum)}
                    className={`flex-1 h-full flex flex-col justify-end items-center rounded-sm transition ${
                      isSelected ? 'bg-slate-100/90' : 'hover:bg-slate-50'
                    }`}
                    aria-label={`วันที่ ${item.dayNum} รายรับ ${item.income} รายจ่าย ${item.expense}`}
                  >
                    <div className="w-full flex items-end justify-center gap-[1px] h-full pt-2">
                      {incHeight > 0 && (
                        <div
                          className="w-1/2 max-w-[6px] rounded-t-xs bg-emerald-600"
                          style={{ height: `${incHeight}%` }}
                        />
                      )}
                      {expHeight > 0 && (
                        <div
                          className="w-1/2 max-w-[6px] rounded-t-xs bg-rose-500"
                          style={{ height: `${expHeight}%` }}
                        />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
            <div className="mt-1.5 flex items-center justify-between text-[10px] text-slate-400 tabular-nums">
              <span>วันที่ 1</span>
              <span>วันที่ 15</span>
              <span>วันที่ {dailyData.items.length}</span>
            </div>
          </div>
        )}
      </section>
    </div>
  );
};
