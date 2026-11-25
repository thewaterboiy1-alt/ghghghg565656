import React from 'react';
import { Bell, Plus, X } from 'lucide-react';

interface DailyReminderBannerProps {
  reminderTime: string;
  onQuickAddToday: () => void;
  onOpenReminderSettings: () => void;
  onDismiss: () => void;
}

export const DailyReminderBanner: React.FC<DailyReminderBannerProps> = ({
  reminderTime,
  onQuickAddToday,
  onOpenReminderSettings,
  onDismiss,
}) => {
  return (
    <div
      role="region"
      aria-label="แจ้งเตือนการบันทึกข้อมูลประจำวัน"
      className="rounded-2xl border border-amber-200/90 bg-amber-50/80 p-4 sm:p-5"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-800">
            <Bell className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-slate-900">
              วันนี้ยังไม่ได้บันทึกรายรับ-รายจ่าย
            </h2>
            <p className="mt-0.5 text-xs sm:text-sm text-slate-600">
              จดบันทึกสั้นๆ ทุกวันช่วยให้เห็นยอดคงเหลือแม่นยำ · ตั้งเตือนทุกวันเวลา {reminderTime} น.
            </p>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={onQuickAddToday}
                className="inline-flex items-center gap-1.5 min-h-[40px] rounded-xl bg-slate-900 px-3.5 py-2 text-xs sm:text-sm font-medium text-white hover:bg-slate-800 transition whitespace-nowrap shrink-0"
              >
                <Plus className="w-4 h-4 shrink-0" />
                <span>บันทึกวันนี้เลย</span>
              </button>
              <button
                type="button"
                onClick={onOpenReminderSettings}
                className="inline-flex items-center min-h-[40px] rounded-xl border border-amber-300/80 bg-white px-3 py-2 text-xs sm:text-sm font-medium text-slate-700 hover:bg-amber-100/50 transition whitespace-nowrap shrink-0"
              >
                ตั้งค่าแจ้งเตือน
              </button>
            </div>
          </div>
        </div>
        <button
          type="button"
          onClick={onDismiss}
          className="min-h-[44px] min-w-[44px] -mr-2 -mt-2 flex items-center justify-center rounded-xl text-slate-500 hover:bg-amber-100 hover:text-slate-800 transition shrink-0"
          aria-label="ซ่อนแจ้งเตือนวันนี้"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
