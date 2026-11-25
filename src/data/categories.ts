import { CategoryId, CategoryMeta, Transaction } from '../types/finance';

export const CATEGORIES: CategoryMeta[] = [
  {
    id: 'food',
    name: 'อาหารและเครื่องดื่ม',
    type: 'expense',
    color: '#0F766E',
    bgTint: 'bg-teal-50',
    textTint: 'text-teal-700',
    iconName: 'utensils',
  },
  {
    id: 'transport',
    name: 'เดินทาง',
    type: 'expense',
    color: '#0284C7',
    bgTint: 'bg-sky-50',
    textTint: 'text-sky-700',
    iconName: 'car',
  },
  {
    id: 'bills',
    name: 'ค่าบ้านและบิล',
    type: 'expense',
    color: '#D97706',
    bgTint: 'bg-amber-50',
    textTint: 'text-amber-700',
    iconName: 'home',
  },
  {
    id: 'shopping',
    name: 'ช้อปปิ้งและของใช้',
    type: 'expense',
    color: '#E11D48',
    bgTint: 'bg-rose-50',
    textTint: 'text-rose-700',
    iconName: 'shopping-bag',
  },
  {
    id: 'health',
    name: 'สุขภาพ',
    type: 'expense',
    color: '#059669',
    bgTint: 'bg-emerald-50',
    textTint: 'text-emerald-700',
    iconName: 'heart-pulse',
  },
  {
    id: 'entertainment',
    name: 'บันเทิงและพักผ่อน',
    type: 'expense',
    color: '#7C3AED',
    bgTint: 'bg-violet-50',
    textTint: 'text-violet-700',
    iconName: 'sparkles',
  },
  {
    id: 'other_expense',
    name: 'รายจ่ายอื่นๆ',
    type: 'expense',
    color: '#64748B',
    bgTint: 'bg-slate-100',
    textTint: 'text-slate-700',
    iconName: 'receipt',
  },
  {
    id: 'salary',
    name: 'เงินเดือน',
    type: 'income',
    color: '#059669',
    bgTint: 'bg-emerald-50',
    textTint: 'text-emerald-700',
    iconName: 'wallet',
  },
  {
    id: 'freelance',
    name: 'รายได้เสริม',
    type: 'income',
    color: '#0F766E',
    bgTint: 'bg-teal-50',
    textTint: 'text-teal-700',
    iconName: 'briefcase',
  },
  {
    id: 'bonus',
    name: 'โบนัสและของขวัญ',
    type: 'income',
    color: '#D97706',
    bgTint: 'bg-amber-50',
    textTint: 'text-amber-700',
    iconName: 'gift',
  },
  {
    id: 'other_income',
    name: 'รายรับอื่นๆ',
    type: 'income',
    color: '#0284C7',
    bgTint: 'bg-sky-50',
    textTint: 'text-sky-700',
    iconName: 'coins',
  },
];

export const CATEGORY_MAP: Record<CategoryId, CategoryMeta> = CATEGORIES.reduce(
  (acc, item) => {
    acc[item.id] = item;
    return acc;
  },
  {} as Record<CategoryId, CategoryMeta>
);

export function createSampleTransactions(todayStr: string): Transaction[] {
  const [y, m, d] = todayStr.split('-').map(Number);
  const pad = (n: number) => String(n).padStart(2, '0');
  const dayDate = (day: number) => `${y}-${pad(m)}-${pad(Math.max(1, day))}`;

  const entries: Omit<Transaction, 'id' | 'createdAt'>[] = [
    {
      type: 'income',
      amount: 32000,
      category: 'salary',
      note: 'เงินเดือนประจำเดือน',
      date: dayDate(1),
      time: '09:00',
    },
    {
      type: 'expense',
      amount: 6500,
      category: 'bills',
      note: 'ค่าเช่าห้องและค่าน้ำค่าไฟ',
      date: dayDate(2),
      time: '10:15',
    },
    {
      type: 'expense',
      amount: 699,
      category: 'bills',
      note: 'ค่าอินเทอร์เน็ตรายเดือน',
      date: dayDate(4),
      time: '14:20',
    },
    {
      type: 'expense',
      amount: 185,
      category: 'food',
      note: 'ข้าวเที่ยงและกาแฟเย็น',
      date: dayDate(Math.min(d > 1 ? d - 1 : 1, 8)),
      time: '12:30',
    },
    {
      type: 'expense',
      amount: 1290,
      category: 'shopping',
      note: 'ของใช้ในบ้านและสบู่แชมพู',
      date: dayDate(Math.min(d > 1 ? d - 1 : 1, 12)),
      time: '18:45',
    },
    {
      type: 'income',
      amount: 4500,
      category: 'freelance',
      note: 'รับออกแบบกราฟิกเสริม',
      date: dayDate(Math.min(d > 1 ? d - 1 : 1, 15)),
      time: '16:00',
    },
    {
      type: 'expense',
      amount: 540,
      category: 'entertainment',
      note: 'ดูหนังและค่าสมาชิกสตรีมมิง',
      date: dayDate(Math.min(d > 1 ? d - 1 : 1, 18)),
      time: '20:10',
    },
    {
      type: 'expense',
      amount: 420,
      category: 'health',
      note: 'วิตามินและยาสามัญ',
      date: dayDate(Math.min(d > 1 ? d - 1 : 1, 20)),
      time: '17:30',
    },
  ];

  if (d >= 3) {
    entries.push(
      {
        type: 'expense',
        amount: 94,
        category: 'transport',
        note: 'ค่ารถไฟฟ้าไปกลับ',
        date: dayDate(d - 2),
        time: '08:40',
      },
      {
        type: 'expense',
        amount: 240,
        category: 'food',
        note: 'มื้อเย็นกับเพื่อน',
        date: dayDate(d - 2),
        time: '19:15',
      }
    );
  }

  if (d >= 2) {
    entries.push(
      {
        type: 'expense',
        amount: 155,
        category: 'food',
        note: 'กาแฟและอาหารกลางวัน',
        date: dayDate(d - 1),
        time: '12:20',
      },
      {
        type: 'expense',
        amount: 88,
        category: 'transport',
        note: 'ค่ารถโดยสารและวินมอเตอร์ไซค์',
        date: dayDate(d - 1),
        time: '18:05',
      }
    );
  }

  return entries.map((entry, idx) => ({
    ...entry,
    id: `sample-${idx + 1}`,
    createdAt: Date.now() - (entries.length - idx) * 3600000,
  }));
}
