import React from 'react';
import { Bell, Home, PieChart, Plus } from 'lucide-react';
import { MobileTab } from '../types/finance';

interface MobileBottomNavProps {
  activeTab: MobileTab;
  onSelectTab: (tab: MobileTab) => void;
  onOpenAddModal: () => void;
  hasTodayReminder: boolean;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  activeTab,
  onSelectTab,
  onOpenAddModal,
  hasTodayReminder,
}) => {
  return (
    <nav
      aria-label="เมนูหลักบนมือถือ"
      className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/90 pb-safe"
    >
      <div className="grid grid-cols-4 items-center h-14 px-2">
        <button
          type="button"
          onClick={() => onSelectTab('ledger')}
          className={`min-h-[44px] flex flex-col items-center justify-center transition ${
            activeTab === 'ledger' ? 'text-teal-700 font-semibold' : 'text-slate-500'
          }`}
        >
          <Home className="w-5 h-5" />
          <span className="text-[10px] mt-0.5 leading-none whitespace-nowrap">หน้าหลัก</span>
        </button>

        <button
          type="button"
          onClick={() => onSelectTab('charts')}
          className={`min-h-[44px] flex flex-col items-center justify-center transition ${
            activeTab === 'charts' ? 'text-teal-700 font-semibold' : 'text-slate-500'
          }`}
        >
          <PieChart className="w-5 h-5" />
          <span className="text-[10px] mt-0.5 leading-none whitespace-nowrap">กราฟเดือน</span>
        </button>

        <button
          type="button"
          onClick={() => onSelectTab('settings')}
          className={`relative min-h-[44px] flex flex-col items-center justify-center transition ${
            activeTab === 'settings' ? 'text-teal-700 font-semibold' : 'text-slate-500'
          }`}
        >
          <div className="relative">
            <Bell className="w-5 h-5" />
            {hasTodayReminder && (
              <span className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-amber-500 ring-2 ring-white" />
            )}
          </div>
          <span className="text-[10px] mt-0.5 leading-none whitespace-nowrap">แจ้งเตือน</span>
        </button>

        <button
          type="button"
          onClick={onOpenAddModal}
          className="min-h-[44px] mx-1 rounded-xl bg-teal-700 text-white flex flex-col items-center justify-center active:scale-[0.97] transition"
        >
          <Plus className="w-5 h-5" />
          <span className="text-[10px] font-medium mt-0.5 leading-none whitespace-nowrap">
            จดรายการ
          </span>
        </button>
      </div>
    </nav>
  );
};
