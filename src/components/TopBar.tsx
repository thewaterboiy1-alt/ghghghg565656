import React from 'react';
import { Plus } from 'lucide-react';
import { PWAInstallButton } from './PWAInstallButton';

interface TopBarProps {
  activeSection: 'overview' | 'charts' | 'settings';
  onNavigate: (section: 'overview' | 'charts' | 'settings') => void;
  onExportCSV: () => void;
  onOpenAddModal: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  activeSection,
  onNavigate,
  onExportCSV,
  onOpenAddModal,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/80">
      {/* Desktop 3-Zone Top Bar */}
      <div className="hidden lg:flex max-w-6xl mx-auto h-16 px-6 items-center justify-between gap-8">
        <a
          href="#top"
          onClick={(e) => {
            e.preventDefault();
            onNavigate('overview');
          }}
          className="font-display text-xl font-bold tracking-tight text-slate-900 whitespace-nowrap shrink-0"
        >
          สมุดตังค์
        </a>

        <nav className="flex items-center gap-6 text-sm font-medium">
          <button
            type="button"
            onClick={() => onNavigate('overview')}
            className={`py-1.5 transition-colors whitespace-nowrap shrink-0 ${
              activeSection === 'overview'
                ? 'text-teal-700 font-semibold border-b-2 border-teal-700'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            ภาพรวมรายวัน
          </button>
          <button
            type="button"
            onClick={() => onNavigate('charts')}
            className={`py-1.5 transition-colors whitespace-nowrap shrink-0 ${
              activeSection === 'charts'
                ? 'text-teal-700 font-semibold border-b-2 border-teal-700'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            สัดส่วนรายเดือน
          </button>
          <button
            type="button"
            onClick={() => onNavigate('settings')}
            className={`py-1.5 transition-colors whitespace-nowrap shrink-0 ${
              activeSection === 'settings'
                ? 'text-teal-700 font-semibold border-b-2 border-teal-700'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            แจ้งเตือนและสำรองข้อมูล
          </button>
          <button
            type="button"
            onClick={onExportCSV}
            className="py-1.5 text-slate-600 hover:text-slate-900 transition-colors whitespace-nowrap shrink-0"
          >
            ส่งออก CSV
          </button>
        </nav>

        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={onOpenAddModal}
            className="inline-flex items-center gap-2 min-h-[40px] rounded-xl bg-teal-700 px-4 py-2 text-sm font-medium text-white hover:bg-teal-800 active:scale-[0.98] transition whitespace-nowrap shrink-0"
          >
            <Plus className="w-4 h-4 shrink-0" />
            <span>บันทึกรายการ</span>
          </button>
        </div>
      </div>

      {/* Mobile Compact Top App Bar (48px height to respect 15% sticky cap) */}
      <div className="flex lg:hidden h-12 px-4 items-center justify-between gap-3">
        <span className="font-display text-lg font-bold tracking-tight text-slate-900 whitespace-nowrap shrink-0">
          สมุดตังค์
        </span>
        <div className="flex items-center gap-2 shrink-0">
          <PWAInstallButton variant="compact" />
        </div>
      </div>
    </header>
  );
};
