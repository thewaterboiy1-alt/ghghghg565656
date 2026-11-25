import { useMemo, useState } from 'react';
import { Bell, ChevronLeft, ChevronRight, WifiOff, X } from 'lucide-react';
import { BalanceHero } from './components/BalanceHero';
import { DailyReminderBanner } from './components/DailyReminderBanner';
import { DateStrip } from './components/DateStrip';
import { MobileBottomNav } from './components/MobileBottomNav';
import { MonthlyCharts } from './components/MonthlyCharts';
import { ReminderAndBackupPanel } from './components/ReminderAndBackupPanel';
import { TopBar } from './components/TopBar';
import { TransactionList } from './components/TransactionList';
import { TransactionModal } from './components/TransactionModal';
import { useFinanceStore } from './hooks/useFinanceStore';
import { useOnlineStatus } from './hooks/useOnlineStatus';
import { CategoryId, MobileTab, Transaction } from './types/finance';
import {
  exportTransactionsToCSV,
  formatThaiMonthYear,
  getMonthKey,
  shiftMonthKey,
} from './utils/format';

export default function App() {
  const store = useFinanceStore();
  const isOnline = useOnlineStatus();

  const [selectedMonth, setSelectedMonth] = useState<string>(() =>
    getMonthKey(store.todayStr)
  );
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedCategoryFilter, setSelectedCategoryFilter] =
    useState<CategoryId | null>(null);

  const [desktopSection, setDesktopSection] = useState<
    'overview' | 'charts' | 'settings'
  >('overview');
  const [mobileTab, setMobileTab] = useState<MobileTab>('ledger');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTx, setEditingTx] = useState<Transaction | null>(null);

  const monthSummary = useMemo(
    () => store.getMonthSummary(selectedMonth),
    [store, selectedMonth]
  );

  const datesWithTransactions = useMemo(
    () => new Set(monthSummary.items.map((t) => t.date)),
    [monthSummary.items]
  );

  const handleChangeMonth = (delta: number) => {
    setSelectedMonth((prev) => shiftMonthKey(prev, delta));
    setSelectedDate(null);
    setSelectedCategoryFilter(null);
  };

  const handleOpenAddModal = (prefillDate?: string) => {
    setEditingTx(null);
    if (prefillDate) {
      setSelectedDate(prefillDate);
    }
    setIsModalOpen(true);
  };

  const handleEditTransaction = (tx: Transaction) => {
    setEditingTx(tx);
    setIsModalOpen(true);
  };

  const handleSaveTransaction = (
    data: Omit<Transaction, 'id' | 'createdAt'>,
    existingId?: string
  ) => {
    if (existingId && editingTx) {
      store.updateTransaction({
        ...editingTx,
        ...data,
      });
    } else {
      store.addTransaction(data);
    }
    const savedMonth = getMonthKey(data.date);
    if (savedMonth !== selectedMonth) {
      setSelectedMonth(savedMonth);
    }
  };

  const handleExportCSV = () => {
    exportTransactionsToCSV(
      monthSummary.items.length > 0 ? monthSummary.items : store.transactions,
      `samuttang-${selectedMonth}`
    );
  };

  const handleSelectMobileTab = (tab: MobileTab) => {
    setMobileTab(tab);
    if (tab === 'ledger') setDesktopSection('overview');
    if (tab === 'charts') setDesktopSection('charts');
    if (tab === 'settings') setDesktopSection('settings');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDesktopNavigate = (section: 'overview' | 'charts' | 'settings') => {
    setDesktopSection(section);
    if (section === 'overview') setMobileTab('ledger');
    if (section === 'charts') setMobileTab('charts');
    if (section === 'settings') setMobileTab('settings');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div id="top" className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
      <TopBar
        activeSection={desktopSection}
        onNavigate={handleDesktopNavigate}
        onExportCSV={handleExportCSV}
        onOpenAddModal={() => handleOpenAddModal()}
      />

      {/* Main Content */}
      <main className="flex-1 w-full max-w-6xl mx-auto px-4 sm:px-6 pt-4 sm:pt-6 pb-24 lg:pb-12">
        {/* Mobile View Switching */}
        <div className="lg:hidden space-y-4">
          {mobileTab === 'ledger' && (
            <>
              <BalanceHero
                selectedMonth={selectedMonth}
                onChangeMonth={handleChangeMonth}
                monthBalance={monthSummary.balance}
                monthIncome={monthSummary.totalIncome}
                monthExpense={monthSummary.totalExpense}
                todayExpense={store.todayStats.expense}
                cumulativeBalance={store.cumulativeBalance}
                monthlyBudget={store.reminderSettings.monthlyBudget}
                streak={store.streak}
                recordedDaysCount={monthSummary.recordedDaysCount}
              />

              {store.showDailyReminderBanner && (
                <DailyReminderBanner
                  reminderTime={store.reminderSettings.time}
                  onQuickAddToday={() => handleOpenAddModal(store.todayStr)}
                  onOpenReminderSettings={() => handleSelectMobileTab('settings')}
                  onDismiss={store.dismissTodayBanner}
                />
              )}

              <DateStrip
                selectedMonth={selectedMonth}
                selectedDate={selectedDate}
                todayStr={store.todayStr}
                datesWithTransactions={datesWithTransactions}
                onSelectDate={setSelectedDate}
              />

              <TransactionList
                transactions={monthSummary.items}
                todayStr={store.todayStr}
                selectedDate={selectedDate}
                selectedCategoryFilter={selectedCategoryFilter}
                onClearCategoryFilter={() => setSelectedCategoryFilter(null)}
                onEditTransaction={handleEditTransaction}
                onOpenAddModal={() =>
                  handleOpenAddModal(selectedDate || store.todayStr)
                }
              />
            </>
          )}

          {mobileTab === 'charts' && (
            <>
              <div className="bg-white rounded-2xl border border-slate-200/80 px-4 py-2.5 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => handleChangeMonth(-1)}
                  className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl text-slate-600 hover:bg-slate-100"
                  aria-label="เดือนก่อนหน้า"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <span className="font-display text-base font-bold text-slate-900">
                  {formatThaiMonthYear(selectedMonth)}
                </span>
                <button
                  type="button"
                  onClick={() => handleChangeMonth(1)}
                  className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl text-slate-600 hover:bg-slate-100"
                  aria-label="เดือนถัดไป"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>

              <MonthlyCharts
                selectedMonth={selectedMonth}
                monthTransactions={monthSummary.items}
                selectedCategoryFilter={selectedCategoryFilter}
                onSelectCategoryFilter={(cat) => {
                  setSelectedCategoryFilter(cat);
                  if (cat) {
                    setMobileTab('ledger');
                  }
                }}
              />
            </>
          )}

          {mobileTab === 'settings' && (
            <ReminderAndBackupPanel
              reminderSettings={store.reminderSettings}
              notificationPermission={store.notificationPermission}
              streak={store.streak}
              todayCount={store.todayStats.count}
              transactions={store.transactions}
              onUpdateReminder={store.updateReminderSettings}
              onRequestPermission={store.requestNotificationPermission}
              onTestReminder={store.triggerTestReminder}
              onExportCSV={handleExportCSV}
              onImportTransactions={store.importTransactions}
              onRestoreSample={store.restoreSampleTransactions}
              onClearAll={store.clearAllTransactions}
            />
          )}
        </div>

        {/* Desktop Multi-Column Layout */}
        <div className="hidden lg:block">
          {desktopSection === 'overview' && (
            <div className="grid grid-cols-12 gap-6 items-start">
              <div className="col-span-7 space-y-5">
                <BalanceHero
                  selectedMonth={selectedMonth}
                  onChangeMonth={handleChangeMonth}
                  monthBalance={monthSummary.balance}
                  monthIncome={monthSummary.totalIncome}
                  monthExpense={monthSummary.totalExpense}
                  todayExpense={store.todayStats.expense}
                  cumulativeBalance={store.cumulativeBalance}
                  monthlyBudget={store.reminderSettings.monthlyBudget}
                  streak={store.streak}
                  recordedDaysCount={monthSummary.recordedDaysCount}
                />

                {store.showDailyReminderBanner && (
                  <DailyReminderBanner
                    reminderTime={store.reminderSettings.time}
                    onQuickAddToday={() => handleOpenAddModal(store.todayStr)}
                    onOpenReminderSettings={() => handleDesktopNavigate('settings')}
                    onDismiss={store.dismissTodayBanner}
                  />
                )}

                <DateStrip
                  selectedMonth={selectedMonth}
                  selectedDate={selectedDate}
                  todayStr={store.todayStr}
                  datesWithTransactions={datesWithTransactions}
                  onSelectDate={setSelectedDate}
                />

                <TransactionList
                  transactions={monthSummary.items}
                  todayStr={store.todayStr}
                  selectedDate={selectedDate}
                  selectedCategoryFilter={selectedCategoryFilter}
                  onClearCategoryFilter={() => setSelectedCategoryFilter(null)}
                  onEditTransaction={handleEditTransaction}
                  onOpenAddModal={() =>
                    handleOpenAddModal(selectedDate || store.todayStr)
                  }
                />
              </div>

              <div className="col-span-5 space-y-5">
                <MonthlyCharts
                  selectedMonth={selectedMonth}
                  monthTransactions={monthSummary.items}
                  selectedCategoryFilter={selectedCategoryFilter}
                  onSelectCategoryFilter={setSelectedCategoryFilter}
                />
              </div>
            </div>
          )}

          {desktopSection === 'charts' && (
            <div className="space-y-5">
              <BalanceHero
                selectedMonth={selectedMonth}
                onChangeMonth={handleChangeMonth}
                monthBalance={monthSummary.balance}
                monthIncome={monthSummary.totalIncome}
                monthExpense={monthSummary.totalExpense}
                todayExpense={store.todayStats.expense}
                cumulativeBalance={store.cumulativeBalance}
                monthlyBudget={store.reminderSettings.monthlyBudget}
                streak={store.streak}
                recordedDaysCount={monthSummary.recordedDaysCount}
              />
              <MonthlyCharts
                selectedMonth={selectedMonth}
                monthTransactions={monthSummary.items}
                selectedCategoryFilter={selectedCategoryFilter}
                onSelectCategoryFilter={(cat) => {
                  setSelectedCategoryFilter(cat);
                  if (cat) setDesktopSection('overview');
                }}
              />
            </div>
          )}

          {desktopSection === 'settings' && (
            <div className="max-w-3xl mx-auto">
              <ReminderAndBackupPanel
                reminderSettings={store.reminderSettings}
                notificationPermission={store.notificationPermission}
                streak={store.streak}
                todayCount={store.todayStats.count}
                transactions={store.transactions}
                onUpdateReminder={store.updateReminderSettings}
                onRequestPermission={store.requestNotificationPermission}
                onTestReminder={store.triggerTestReminder}
                onExportCSV={handleExportCSV}
                onImportTransactions={store.importTransactions}
                onRestoreSample={store.restoreSampleTransactions}
                onClearAll={store.clearAllTransactions}
              />
            </div>
          )}
        </div>
      </main>

      {/* Mobile Bottom Navigation */}
      <MobileBottomNav
        activeTab={mobileTab}
        onSelectTab={handleSelectMobileTab}
        onOpenAddModal={() => handleOpenAddModal(selectedDate || store.todayStr)}
        hasTodayReminder={store.showDailyReminderBanner}
      />

      {/* In-App Notification Toast */}
      {store.activeReminderToast && (
        <div
          role="status"
          className="fixed top-14 lg:top-20 right-4 left-4 sm:left-auto sm:w-96 z-50 rounded-2xl border border-teal-200 bg-white p-4 shadow-xl flex items-start justify-between gap-3"
        >
          <div className="flex items-start gap-3">
            <div className="h-9 w-9 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center shrink-0">
              <Bell className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-semibold text-teal-800">
                แจ้งเตือนบันทึกประจำวัน
              </p>
              <p className="mt-0.5 text-xs text-slate-600 leading-relaxed">
                {store.activeReminderToast}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => store.setActiveReminderToast(null)}
            className="min-h-[36px] min-w-[36px] flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-700"
            aria-label="ปิดการแจ้งเตือน"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Offline Status Banner */}
      {!isOnline && (
        <div className="fixed bottom-16 lg:bottom-4 left-4 z-50 flex items-center gap-2 rounded-xl bg-amber-600 px-3.5 py-2 text-xs font-medium text-white shadow-lg">
          <WifiOff className="w-3.5 h-3.5 shrink-0" />
          <span>โหมดออฟไลน์ · ข้อมูลจะถูกบันทึกไว้ในเครื่องอัตโนมัติ</span>
        </div>
      )}

      {/* Add / Edit Transaction Modal / Bottom Sheet */}
      <TransactionModal
        isOpen={isModalOpen}
        editingTransaction={editingTx}
        defaultDate={selectedDate || store.todayStr}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveTransaction}
        onDelete={store.deleteTransaction}
      />
    </div>
  );
}
