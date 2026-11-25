import { Transaction } from '../types/finance';
import { CATEGORY_MAP } from '../data/categories';

const THAI_MONTHS = [
  'มกราคม',
  'กุมภาพันธ์',
  'มีนาคม',
  'เมษายน',
  'พฤษภาคม',
  'มิถุนายน',
  'กรกฎาคม',
  'สิงหาคม',
  'กันยายน',
  'ตุลาคม',
  'พฤศจิกายน',
  'ธันวาคม',
];

const THAI_MONTHS_SHORT = [
  'ม.ค.',
  'ก.พ.',
  'มี.ค.',
  'เม.ย.',
  'พ.ค.',
  'มิ.ย.',
  'ก.ค.',
  'ส.ค.',
  'ก.ย.',
  'ต.ค.',
  'พ.ย.',
  'ธ.ค.',
];

const THAI_DAYS_SHORT = ['อา.', 'จ.', 'อ.', 'พ.', 'พฤ.', 'ศ.', 'ส.'];
const THAI_DAYS_FULL = ['อาทิตย์', 'จันทร์', 'อังคาร', 'พุธ', 'พฤหัสบดี', 'ศุกร์', 'เสาร์'];

export function getTodayDateString(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function getCurrentTimeString(): string {
  const now = new Date();
  return `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
}

export function getMonthKey(dateStr: string): string {
  return dateStr.slice(0, 7);
}

export function shiftMonthKey(monthKey: string, delta: number): string {
  const [y, m] = monthKey.split('-').map(Number);
  const date = new Date(y, m - 1 + delta, 1);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}

export function formatThaiMonthYear(monthKey: string): string {
  const [y, m] = monthKey.split('-').map(Number);
  const beYear = y + 543;
  return `${THAI_MONTHS[m - 1]} ${beYear}`;
}

export function formatThaiDateFull(dateStr: string, todayStr?: string): string {
  const [y, m, d] = dateStr.split('-').map(Number);
  const dateObj = new Date(y, m - 1, d);
  const dayName = THAI_DAYS_FULL[dateObj.getDay()];
  const monthShort = THAI_MONTHS_SHORT[m - 1];
  const beYear = y + 543;
  const label = `วัน${dayName}ที่ ${d} ${monthShort} ${beYear}`;
  if (todayStr && dateStr === todayStr) {
    return `วันนี้ · ${d} ${monthShort}`;
  }
  return label;
}

export function getDayInfo(dateStr: string): { dayNum: number; weekdayShort: string } {
  const [y, m, d] = dateStr.split('-').map(Number);
  const dateObj = new Date(y, m - 1, d);
  return {
    dayNum: d,
    weekdayShort: THAI_DAYS_SHORT[dateObj.getDay()],
  };
}

export function getDaysInMonth(monthKey: string): string[] {
  const [y, m] = monthKey.split('-').map(Number);
  const daysCount = new Date(y, m, 0).getDate();
  const result: string[] = [];
  for (let d = 1; d <= daysCount; d++) {
    result.push(`${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`);
  }
  return result;
}

export function formatBaht(amount: number, options?: { showSign?: boolean; type?: 'income' | 'expense' }): string {
  const absFormatted = new Intl.NumberFormat('th-TH', {
    minimumFractionDigits: amount % 1 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(Math.abs(amount));

  if (options?.showSign) {
    if (options.type === 'income') return `+฿${absFormatted}`;
    if (options.type === 'expense') return `-฿${absFormatted}`;
    if (amount > 0) return `+฿${absFormatted}`;
    if (amount < 0) return `-฿${absFormatted}`;
  } else if (amount < 0) {
    return `-฿${absFormatted}`;
  }
  return `฿${absFormatted}`;
}

export function calculateStreak(transactions: Transaction[], todayStr: string): number {
  const recordedDates = new Set(transactions.map((t) => t.date));
  let streak = 0;
  const [y, m, d] = todayStr.split('-').map(Number);
  let cursor = new Date(y, m - 1, d);

  // If today has no entries yet, check streak ending yesterday
  const cursorStr = `${cursor.getFullYear()}-${String(cursor.getMonth() + 1).padStart(2, '0')}-${String(cursor.getDate()).padStart(2, '0')}`;
  if (!recordedDates.has(cursorStr)) {
    cursor.setDate(cursor.getDate() - 1);
  }

  while (true) {
    const key = `${cursor.getFullYear()}-${String(cursor.getMonth() + 1).padStart(2, '0')}-${String(cursor.getDate()).padStart(2, '0')}`;
    if (recordedDates.has(key)) {
      streak += 1;
      cursor.setDate(cursor.getDate() - 1);
    } else {
      break;
    }
  }
  return streak;
}

export function exportTransactionsToCSV(transactions: Transaction[], filenamePrefix: string): void {
  const headers = ['วันที่', 'เวลา', 'ประเภท', 'หมวดหมู่', 'จำนวนเงิน (บาท)', 'บันทึกช่วยจำ'];
  const rows = transactions
    .slice()
    .sort((a, b) => (a.date === b.date ? b.time.localeCompare(a.time) : b.date.localeCompare(a.date)))
    .map((t) => {
      const catName = CATEGORY_MAP[t.category]?.name || t.category;
      const typeLabel = t.type === 'income' ? 'รายรับ' : 'รายจ่าย';
      const escapedNote = `"${(t.note || '').replace(/"/g, '""')}"`;
      return [t.date, t.time, typeLabel, catName, t.amount.toFixed(2), escapedNote].join(',');
    });

  const csvContent = '\uFEFF' + [headers.join(','), ...rows].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `${filenamePrefix}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function downloadDailyReminderICS(timeStr: string): void {
  const [hh, mm] = timeStr.split(':').map(Number);
  const pad = (n: number) => String(n).padStart(2, '0');
  const now = new Date();
  const dateStamp = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}`;
  const dtStart = `${dateStamp}T${pad(hh)}${pad(mm)}00`;
  const dtEnd = `${dateStamp}T${pad(hh)}${pad(Math.min(59, mm + 10))}00`;

  const ics = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//SamutTang//Daily Reminder//TH',
    'BEGIN:VEVENT',
    `UID:samuttang-daily-reminder-${Date.now()}@app`,
    `DTSTAMP:${dateStamp}T000000Z`,
    `DTSTART:${dtStart}`,
    `DTEND:${dtEnd}`,
    'RRULE:FREQ=DAILY',
    'SUMMARY:บันทึกรายรับ-รายจ่ายประจำวัน (สมุดตังค์)',
    'DESCRIPTION:อย่าลืมจดรายรับ-รายจ่ายของวันนี้เพื่อสรุปยอดคงเหลือและสัดส่วนรายเดือน',
    'BEGIN:VALARM',
    'TRIGGER:-PT0M',
    'ACTION:DISPLAY',
    'DESCRIPTION:ถึงเวลาบันทึกรายรับ-รายจ่ายประจำวันแล้ว',
    'END:VALARM',
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n');

  const blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', 'samuttang-daily-reminder.ics');
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
