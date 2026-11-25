import { useCallback, useEffect, useMemo, useState } from 'react';
import { createSampleTransactions } from '../data/categories';
import { ReminderSettings, Transaction } from '../types/finance';
import {
  calculateStreak,
  getCurrentTimeString,
  getMonthKey,
  getTodayDateString,
} from '../utils/format';

const STORAGE_KEYS = {
  TRANSACTIONS: 'samuttang_transactions_v1',
  REMINDER: 'samuttang_reminder_v1',
  INITIALIZED: 'samuttang_initialized_v1',
};

const DEFAULT_REMINDER: ReminderSettings = {
  enabled: true,
  time: '20:00',
  lastNotifiedDate: null,
  dismissedBannerDate: null,
  monthlyBudget: 15000,
};

function loadInitialTransactions(todayStr: string): Transaction[] {
  try {
    const initialized = localStorage.getItem(STORAGE_KEYS.INITIALIZED);
    const raw = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    }
    if (!initialized) {
      const sample = createSampleTransactions(todayStr);
      localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(sample));
      localStorage.setItem(STORAGE_KEYS.INITIALIZED, 'true');
      return sample;
    }
  } catch {
    // Fallback to empty array if localStorage fails
  }
  return [];
}

function loadReminderSettings(): ReminderSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.REMINDER);
    if (raw) {
      return { ...DEFAULT_REMINDER, ...JSON.parse(raw) };
    }
  } catch {
    // Ignore storage read errors
  }
  return DEFAULT_REMINDER;
}

export function useFinanceStore() {
  const todayStr = getTodayDateString();
  const [transactions, setTransactions] = useState<Transaction[]>(() =>
    loadInitialTransactions(todayStr)
  );
  const [reminderSettings, setReminderSettings] = useState<ReminderSettings>(() =>
    loadReminderSettings()
  );
  const [activeReminderToast, setActiveReminderToast] = useState<string | null>(null);
  const [notificationPermission, setNotificationPermission] = useState<
    NotificationPermission | 'unsupported'
  >(() => {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      return 'unsupported';
    }
    return Notification.permission;
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(transactions));
      localStorage.setItem(STORAGE_KEYS.INITIALIZED, 'true');
    } catch {
      // Ignore storage quota errors
    }
  }, [transactions]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.REMINDER, JSON.stringify(reminderSettings));
    } catch {
      // Ignore storage quota errors
    }
  }, [reminderSettings]);

  const sendBrowserNotification = useCallback(
    (title: string, body: string) => {
      if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
        try {
          if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
            navigator.serviceWorker.ready.then((reg) => {
              reg.showNotification(title, {
                body,
                icon: '/pwa-192x192.png',
                badge: '/pwa-192x192.png',
                tag: 'samuttang-daily-reminder',
              });
            });
          } else {
            new Notification(title, {
              body,
              icon: '/pwa-192x192.png',
            });
          }
        } catch {
          // Fallback to in-app toast
        }
      }
      setActiveReminderToast(body);
    },
    []
  );

  // Check daily reminder schedule every 30 seconds while app is open
  useEffect(() => {
    if (!reminderSettings.enabled) return;

    const checkReminder = () => {
      const currentDate = getTodayDateString();
      const currentTime = getCurrentTimeString();
      if (
        reminderSettings.lastNotifiedDate !== currentDate &&
        currentTime >= reminderSettings.time
      ) {
        const hasTodayEntry = transactions.some((t) => t.date === currentDate);
        const body = hasTodayEntry
          ? 'ทบทวนรายรับ-รายจ่ายวันนี้ครบถ้วนแล้วหรือยัง? กดเพื่อเพิ่มรายการเพิ่มเติมได้ทันที'
          : 'วันนี้คุณยังไม่ได้บันทึกรายรับ-รายจ่ายเลย มาจดรายการวันนี้กันเถอะ';

        sendBrowserNotification('สมุดตังค์ · แจ้งเตือนบันทึกประจำวัน', body);
        setReminderSettings((prev) => ({
          ...prev,
          lastNotifiedDate: currentDate,
        }));
      }
    };

    checkReminder();
    const timer = window.setInterval(checkReminder, 30000);
    return () => window.clearInterval(timer);
  }, [reminderSettings.enabled, reminderSettings.time, reminderSettings.lastNotifiedDate, transactions, sendBrowserNotification]);

  const requestNotificationPermission = useCallback(async () => {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      setNotificationPermission('unsupported');
      return 'unsupported' as const;
    }
    const result = await Notification.requestPermission();
    setNotificationPermission(result);
    if (result === 'granted') {
      setReminderSettings((prev) => ({ ...prev, enabled: true }));
    }
    return result;
  }, []);

  const triggerTestReminder = useCallback(async () => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      if (Notification.permission === 'default') {
        const perm = await Notification.requestPermission();
        setNotificationPermission(perm);
      }
    }
    sendBrowserNotification(
      'สมุดตังค์ · ทดสอบการแจ้งเตือนรายวัน',
      `ระบบพร้อมแจ้งเตือนทุกวันเวลา ${reminderSettings.time} น. แล้ว`
    );
  }, [reminderSettings.time, sendBrowserNotification]);

  const addTransaction = useCallback(
    (input: Omit<Transaction, 'id' | 'createdAt'>) => {
      const newItem: Transaction = {
        ...input,
        id: `tx-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        createdAt: Date.now(),
      };
      setTransactions((prev) => [newItem, ...prev]);
      return newItem;
    },
    []
  );

  const updateTransaction = useCallback((updated: Transaction) => {
    setTransactions((prev) =>
      prev.map((item) => (item.id === updated.id ? updated : item))
    );
  }, []);

  const deleteTransaction = useCallback((id: string) => {
    setTransactions((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const clearAllTransactions = useCallback(() => {
    setTransactions([]);
  }, []);

  const restoreSampleTransactions = useCallback(() => {
    const sample = createSampleTransactions(getTodayDateString());
    setTransactions(sample);
  }, []);

  const importTransactions = useCallback((items: Transaction[]) => {
    setTransactions(items);
  }, []);

  const updateReminderSettings = useCallback(
    (patch: Partial<ReminderSettings>) => {
      setReminderSettings((prev) => ({ ...prev, ...patch }));
    },
    []
  );

  const dismissTodayBanner = useCallback(() => {
    const today = getTodayDateString();
    setReminderSettings((prev) => ({
      ...prev,
      dismissedBannerDate: today,
    }));
  }, []);

  const cumulativeBalance = useMemo(() => {
    return transactions.reduce(
      (sum, t) => sum + (t.type === 'income' ? t.amount : -t.amount),
      0
    );
  }, [transactions]);

  const todayStats = useMemo(() => {
    const todayItems = transactions.filter((t) => t.date === todayStr);
    const income = todayItems
      .filter((t) => t.type === 'income')
      .reduce((s, t) => s + t.amount, 0);
    const expense = todayItems
      .filter((t) => t.type === 'expense')
      .reduce((s, t) => s + t.amount, 0);
    return {
      count: todayItems.length,
      income,
      expense,
    };
  }, [transactions, todayStr]);

  const streak = useMemo(
    () => calculateStreak(transactions, todayStr),
    [transactions, todayStr]
  );

  const showDailyReminderBanner = useMemo(() => {
    if (!reminderSettings.enabled) return false;
    if (todayStats.count > 0) return false;
    if (reminderSettings.dismissedBannerDate === todayStr) return false;
    return true;
  }, [reminderSettings.enabled, reminderSettings.dismissedBannerDate, todayStats.count, todayStr]);

  const getMonthSummary = useCallback(
    (monthKey: string) => {
      const monthItems = transactions.filter((t) => getMonthKey(t.date) === monthKey);
      const totalIncome = monthItems
        .filter((t) => t.type === 'income')
        .reduce((s, t) => s + t.amount, 0);
      const totalExpense = monthItems
        .filter((t) => t.type === 'expense')
        .reduce((s, t) => s + t.amount, 0);
      const balance = totalIncome - totalExpense;
      const recordedDaysCount = new Set(monthItems.map((t) => t.date)).size;
      return {
        items: monthItems,
        totalIncome,
        totalExpense,
        balance,
        recordedDaysCount,
      };
    },
    [transactions]
  );

  return {
    todayStr,
    transactions,
    reminderSettings,
    notificationPermission,
    activeReminderToast,
    setActiveReminderToast,
    cumulativeBalance,
    todayStats,
    streak,
    showDailyReminderBanner,
    getMonthSummary,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    clearAllTransactions,
    restoreSampleTransactions,
    importTransactions,
    updateReminderSettings,
    dismissTodayBanner,
    requestNotificationPermission,
    triggerTestReminder,
  };
}
