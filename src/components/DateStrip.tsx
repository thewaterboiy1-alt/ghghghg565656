import React, { useEffect, useRef } from 'react';
import { getDayInfo, getDaysInMonth } from '../utils/format';

interface DateStripProps {
  selectedMonth: string;
  selectedDate: string | null; // null = ทั้งเดือน
  todayStr: string;
  datesWithTransactions: Set<string>;
  onSelectDate: (date: string | null) => void;
}

export const DateStrip: React.FC<DateStripProps> = ({
  selectedMonth,
  selectedDate,
  todayStr,
  datesWithTransactions,
  onSelectDate,
}) => {
  const days = getDaysInMonth(selectedMonth);
  const activeRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    if (activeRef.current) {
      activeRef.current.scrollIntoView({
        behavior: 'smooth',
        inline: 'center',
        block: 'nearest',
      });
    }
  }, [selectedMonth, selectedDate]);

  return (
    <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
      <button
        type="button"
        onClick={() => onSelectDate(null)}
        className={`min-h-[44px] px-4 rounded-xl text-xs sm:text-sm font-medium transition whitespace-nowrap shrink-0 ${
          selectedDate === null
            ? 'bg-slate-900 text-white'
            : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
        }`}
      >
        ทั้งเดือน
      </button>

      {days.map((dateStr) => {
        const { dayNum, weekdayShort } = getDayInfo(dateStr);
        const isSelected = selectedDate === dateStr;
        const isToday = dateStr === todayStr;
        const hasData = datesWithTransactions.has(dateStr);

        return (
          <button
            key={dateStr}
            ref={isSelected || (selectedDate === null && isToday) ? activeRef : undefined}
            type="button"
            onClick={() => onSelectDate(isSelected ? null : dateStr)}
            className={`min-h-[48px] min-w-[46px] px-2.5 py-1.5 rounded-xl flex flex-col items-center justify-center transition shrink-0 ${
              isSelected
                ? 'bg-teal-700 text-white'
                : isToday
                ? 'bg-teal-50 border border-teal-200 text-teal-900 hover:bg-teal-100'
                : 'bg-white border border-slate-200/80 text-slate-700 hover:bg-slate-50'
            }`}
          >
            <span
              className={`text-[10px] leading-none ${
                isSelected ? 'text-teal-100' : 'text-slate-500'
              }`}
            >
              {isToday ? 'วันนี้' : weekdayShort}
            </span>
            <span className="mt-1 text-sm font-semibold tabular-nums leading-none">
              {dayNum}
            </span>
            <span
              className={`mt-1 h-1 w-1 rounded-full ${
                hasData
                  ? isSelected
                    ? 'bg-white'
                    : 'bg-teal-600'
                  : 'bg-transparent'
              }`}
            />
          </button>
        );
      })}
    </div>
  );
};
