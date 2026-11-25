export type TransactionType = 'income' | 'expense';

export type CategoryId =
  | 'food'
  | 'transport'
  | 'bills'
  | 'shopping'
  | 'health'
  | 'entertainment'
  | 'other_expense'
  | 'salary'
  | 'freelance'
  | 'bonus'
  | 'other_income';

export interface CategoryMeta {
  id: CategoryId;
  name: string;
  type: TransactionType;
  color: string;
  bgTint: string;
  textTint: string;
  iconName:
    | 'utensils'
    | 'car'
    | 'home'
    | 'shopping-bag'
    | 'heart-pulse'
    | 'sparkles'
    | 'receipt'
    | 'wallet'
    | 'briefcase'
    | 'gift'
    | 'coins';
}

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  category: CategoryId;
  note: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  createdAt: number;
}

export interface ReminderSettings {
  enabled: boolean;
  time: string; // HH:mm
  lastNotifiedDate: string | null;
  dismissedBannerDate: string | null;
  monthlyBudget: number;
}

export type MobileTab = 'ledger' | 'charts' | 'settings';
