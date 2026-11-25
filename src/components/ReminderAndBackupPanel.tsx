import React, { useRef, useState } from 'react';
import {
  Bell,
  CalendarPlus,
  Check,
  Download,
  RotateCcw,
  Trash2,
  Upload,
} from 'lucide-react';
import { ReminderSettings, Transaction } from '../types/finance';
import { downloadDailyReminderICS, formatBaht } from '../utils/format';
import { PWAInstallButton } from './PWAInstallButton';

interface ReminderAndBackupPanelProps {
  reminderSettings: ReminderSettings;
  notificationPermission: NotificationPermission | 'unsupported';
  streak: number;
  todayCount: number;
  transactions: Transaction[];
  onUpdateReminder: (patch: Partial<ReminderSettings>) => void;
  onRequestPermission: () => Promise<NotificationPermission | 'unsupported'>;
  onTestReminder: () => Promise<void>;
  onExportCSV: () => void;
  onImportTransactions: (items: Transaction[]) => void;
  onRestoreSample: () => void;
  onClearAll: () => void;
}

export const ReminderAndBackupPanel: React.FC<ReminderAndBackupPanelProps> = ({
  reminderSettings,
  notificationPermission,
  streak,
  todayCount,
  transactions,
  onUpdateReminder,
  onRequestPermission,
  onTestReminder,
  onExportCSV,
  onImportTransactions,
  onRestoreSample,
  onClearAll,
}) => {
  const [budgetInput, setBudgetInput] = useState(
    String(reminderSettings.monthlyBudget || '')
  );
  const [budgetSaved, setBudgetSaved] = useState(false);
  const [confirmClear, setConfirmClear] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleSaveBudget = (e: React.FormEvent) => {
    e.preventDefault();
    const num = Math.max(0, parseFloat(budgetInput) || 0);
    onUpdateReminder({ monthlyBudget: num });
    setBudgetSaved(true);
    window.setTimeout(() => setBudgetSaved(false), 2000);
  };

  const handleExportJSON = () => {
    const payload = JSON.stringify(transactions, null, 2);
    const blob = new Blob([payload], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `samuttang-backup-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    setFeedbackMsg('ดาวน์โหลดไฟล์สำรองข้อมูล JSON เรียบร้อยแล้ว');
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result));
        if (Array.isArray(parsed)) {
          onImportTransactions(parsed);
          setFeedbackMsg(`นำเข้าข้อมูลสำเร็จ ${parsed.length} รายการ`);
        } else {
          setFeedbackMsg('รูปแบบไฟล์ไม่ถูกต้อง กรุณาเลือกไฟล์สำรองจากสมุดตังค์');
        }
      } catch {
        setFeedbackMsg('ไม่สามารถอ่านไฟล์ JSON ได้');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div className="space-y-5">
      {/* Daily Reminder Card */}
      <section
        aria-label="ตั้งค่าแจ้งเตือนบันทึกประจำวัน"
        className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-4"
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="font-display text-base sm:text-lg font-semibold text-slate-900">
              แจ้งเตือนบันทึกทุกวัน
            </h2>
            <p className="mt-0.5 text-xs text-slate-500">
              วันนี้บันทึกแล้ว {todayCount} รายการ · สถิติบันทึกต่อเนื่อง {streak} วัน
            </p>
          </div>

          <button
            type="button"
            role="switch"
            aria-checked={reminderSettings.enabled}
            onClick={() =>
              onUpdateReminder({ enabled: !reminderSettings.enabled })
            }
            className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors ${
              reminderSettings.enabled ? 'bg-teal-700' : 'bg-slate-200'
            }`}
            aria-label="เปิดหรือปิดการแจ้งเตือนประจำวัน"
          >
            <span
              className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-sm transition ${
                reminderSettings.enabled ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          <div>
            <label
              htmlFor="reminder-time"
              className="block text-xs font-medium text-slate-600 mb-1.5"
            >
              เวลาที่ต้องการให้แจ้งเตือนทุกวัน
            </label>
            <input
              id="reminder-time"
              type="time"
              value={reminderSettings.time}
              onChange={(e) =>
                onUpdateReminder({ time: e.target.value || '20:00' })
              }
              className="w-full min-h-[44px] rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 tabular-nums focus:border-teal-600 focus:outline-none"
            />
          </div>

          <div className="flex flex-col justify-end">
            <button
              type="button"
              onClick={onTestReminder}
              className="min-h-[44px] w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 text-xs sm:text-sm font-medium text-slate-800 hover:bg-slate-100 inline-flex items-center justify-center gap-2 transition"
            >
              <Bell className="w-4 h-4 text-teal-700 shrink-0" />
              <span>ทดสอบแจ้งเตือนทันที</span>
            </button>
          </div>
        </div>

        {/* Browser Notification Status + Native Mobile Calendar Reminder */}
        <div className="rounded-xl bg-slate-50 p-3.5 space-y-2.5 text-xs text-slate-600">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span>
              สิทธิ์แจ้งเตือนเบราว์เซอร์:{' '}
              <strong className="text-slate-900">
                {notificationPermission === 'granted'
                  ? 'อนุญาตแล้ว'
                  : notificationPermission === 'denied'
                  ? 'ถูกปิดกั้นในการตั้งค่าเบราว์เซอร์'
                  : notificationPermission === 'unsupported'
                  ? 'อุปกรณ์ไม่รองรับ Web Push'
                  : 'ยังไม่ได้ขออนุญาต'}
              </strong>
            </span>
            {notificationPermission === 'default' && (
              <button
                type="button"
                onClick={onRequestPermission}
                className="min-h-[36px] px-3 rounded-lg bg-teal-700 text-white font-medium hover:bg-teal-800 transition"
              >
                เปิดสิทธิ์แจ้งเตือน
              </button>
            )}
          </div>

          <div className="pt-2 border-t border-slate-200/70 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <span className="text-slate-600">
              อยากให้มือถือแจ้งเตือนแม้ปิดแอป? เพิ่มนัดหมายเตือนรายวันลงปฏิทินมือถือได้ทันที
            </span>
            <button
              type="button"
              onClick={() => downloadDailyReminderICS(reminderSettings.time)}
              className="min-h-[40px] px-3 rounded-lg border border-slate-200 bg-white text-slate-800 font-medium hover:bg-slate-100 inline-flex items-center justify-center gap-1.5 whitespace-nowrap shrink-0 transition"
            >
              <CalendarPlus className="w-4 h-4 text-teal-700 shrink-0" />
              <span>เพิ่มลงปฏิทินมือถือ</span>
            </button>
          </div>
        </div>
      </section>

      {/* Monthly Budget Card */}
      <section
        aria-label="ตั้งเป้างบประมาณรายเดือน"
        className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs"
      >
        <h2 className="font-display text-base font-semibold text-slate-900">
          งบประมาณรายจ่ายต่อเดือน
        </h2>
        <p className="mt-0.5 text-xs text-slate-500">
          ตั้งวงเงินรายเดือนเพื่อติดตามสัดส่วนการใช้จ่ายเทียบกับเป้าหมาย (ปัจจุบัน{' '}
          {formatBaht(reminderSettings.monthlyBudget)})
        </p>

        <form onSubmit={handleSaveBudget} className="mt-3 flex gap-2">
          <input
            type="number"
            inputMode="numeric"
            min="0"
            value={budgetInput}
            onChange={(e) => setBudgetInput(e.target.value)}
            placeholder="เช่น 15000"
            className="flex-1 min-h-[44px] rounded-xl border border-slate-200 bg-white px-3.5 text-sm text-slate-900 tabular-nums focus:border-teal-600 focus:outline-none"
          />
          <button
            type="submit"
            className="min-h-[44px] px-4 rounded-xl bg-slate-900 text-sm font-medium text-white hover:bg-slate-800 inline-flex items-center gap-1.5 whitespace-nowrap shrink-0 transition"
          >
            {budgetSaved ? (
              <>
                <Check className="w-4 h-4" />
                <span>บันทึกแล้ว</span>
              </>
            ) : (
              <span>บันทึกงบ</span>
            )}
          </button>
        </form>
      </section>

      {/* Mobile Install & Backup */}
      <section
        aria-label="ใช้งานบนโทรศัพท์และสำรองข้อมูล"
        className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-4"
      >
        <div>
          <h2 className="font-display text-base font-semibold text-slate-900">
            ติดตั้งบนมือถือและสำรองข้อมูล
          </h2>
          <p className="mt-0.5 text-xs text-slate-500">
            ข้อมูลบันทึกไว้ในเครื่องของคุณอย่างปลอดภัย ใช้งานได้แม้ไม่มีอินเทอร์เน็ต
          </p>
        </div>

        <PWAInstallButton variant="card" />

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
          <button
            type="button"
            onClick={onExportCSV}
            className="min-h-[44px] rounded-xl border border-slate-200 bg-white px-3 text-xs font-medium text-slate-800 hover:bg-slate-50 inline-flex items-center justify-center gap-1.5 transition"
          >
            <Download className="w-4 h-4 text-slate-600 shrink-0" />
            <span>ส่งออก CSV</span>
          </button>

          <button
            type="button"
            onClick={handleExportJSON}
            className="min-h-[44px] rounded-xl border border-slate-200 bg-white px-3 text-xs font-medium text-slate-800 hover:bg-slate-50 inline-flex items-center justify-center gap-1.5 transition"
          >
            <Download className="w-4 h-4 text-slate-600 shrink-0" />
            <span>สำรอง JSON</span>
          </button>

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="min-h-[44px] rounded-xl border border-slate-200 bg-white px-3 text-xs font-medium text-slate-800 hover:bg-slate-50 inline-flex items-center justify-center gap-1.5 transition"
          >
            <Upload className="w-4 h-4 text-slate-600 shrink-0" />
            <span>กู้คืน JSON</span>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="application/json"
            onChange={handleImportFile}
            className="hidden"
          />
        </div>

        {feedbackMsg && (
          <p className="text-xs font-medium text-teal-700">{feedbackMsg}</p>
        )}

        <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
          <button
            type="button"
            onClick={() => {
              onRestoreSample();
              setConfirmClear(false);
              setFeedbackMsg('โหลดชุดข้อมูลตัวอย่างเรียบร้อยแล้ว');
            }}
            className="min-h-[40px] px-3 rounded-lg text-xs font-medium text-slate-600 hover:bg-slate-100 inline-flex items-center gap-1.5 transition"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>โหลดข้อมูลตัวอย่าง</span>
          </button>

          <button
            type="button"
            onClick={() => {
              if (!confirmClear) {
                setConfirmClear(true);
                return;
              }
              onClearAll();
              setConfirmClear(false);
              setFeedbackMsg('ล้างข้อมูลทั้งหมดเรียบร้อยแล้ว');
            }}
            className={`min-h-[40px] px-3 rounded-lg text-xs font-medium inline-flex items-center gap-1.5 transition ${
              confirmClear
                ? 'bg-rose-600 text-white hover:bg-rose-700'
                : 'text-rose-600 hover:bg-rose-50'
            }`}
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>{confirmClear ? 'ยืนยันล้างข้อมูลทั้งหมด' : 'ล้างข้อมูลทั้งหมด'}</span>
          </button>
        </div>
      </section>
    </div>
  );
};
