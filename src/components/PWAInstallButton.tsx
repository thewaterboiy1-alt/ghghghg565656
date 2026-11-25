import React, { useState } from 'react';
import { Download, Share, X } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface PWAInstallButtonProps {
  variant?: 'compact' | 'card';
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({ variant = 'compact' }) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  if (isInstalled) {
    if (variant === 'card') {
      return (
        <div className="text-sm text-emerald-700 font-medium">
          ติดตั้งแอปบนอุปกรณ์นี้เรียบร้อยแล้ว
        </div>
      );
    }
    return null;
  }

  if (isInstallable) {
    return (
      <button
        type="button"
        onClick={install}
        className={
          variant === 'card'
            ? 'inline-flex items-center justify-center gap-2 min-h-[44px] w-full rounded-xl bg-teal-700 px-4 py-2.5 text-sm font-medium text-white hover:bg-teal-800 active:scale-[0.99] transition whitespace-nowrap shrink-0'
            : 'inline-flex items-center gap-1.5 min-h-[40px] rounded-lg border border-teal-200 bg-teal-50 px-3 py-1.5 text-xs font-medium text-teal-800 hover:bg-teal-100 transition whitespace-nowrap shrink-0'
        }
      >
        <Download className="w-4 h-4 shrink-0" />
        <span>ติดตั้งแอปลงมือถือ</span>
      </button>
    );
  }

  if (isIOS || variant === 'card') {
    return (
      <>
        <button
          type="button"
          onClick={() => setShowIOSGuide(true)}
          className={
            variant === 'card'
              ? 'inline-flex items-center justify-center gap-2 min-h-[44px] w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-800 hover:bg-slate-50 transition whitespace-nowrap shrink-0'
              : 'inline-flex items-center gap-1.5 min-h-[40px] rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 transition whitespace-nowrap shrink-0'
          }
        >
          <Share className="w-3.5 h-3.5 shrink-0" />
          <span>เพิ่มลงหน้าจอมือถือ</span>
        </button>

        {showIOSGuide && (
          <div
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-900/50 backdrop-blur-sm p-0 sm:p-4"
            onClick={() => setShowIOSGuide(false)}
          >
            <div
              className="w-full sm:max-w-md rounded-t-3xl sm:rounded-2xl bg-white p-6 shadow-xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="w-10 h-1.5 bg-slate-200 rounded-full mx-auto mb-4 sm:hidden" />
              <div className="flex items-center justify-between gap-4">
                <h3 className="text-lg font-semibold text-slate-900">
                  วิธีติดตั้งสมุดตังค์บนโทรศัพท์
                </h3>
                <button
                  type="button"
                  onClick={() => setShowIOSGuide(false)}
                  className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl text-slate-500 hover:bg-slate-100"
                  aria-label="ปิดหน้าต่าง"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="mt-4 space-y-3 text-sm text-slate-600 leading-relaxed">
                <p>
                  <strong className="text-slate-900">สำหรับ iPhone / iPad (Safari):</strong> กดปุ่ม{' '}
                  <span className="font-medium text-slate-900">แชร์ (Share)</span>{' '}
                  ที่แถบด้านล่างของเบราว์เซอร์ แล้วเลือก{' '}
                  <span className="font-medium text-slate-900">เพิ่มไปยังหน้าจอโฮม (Add to Home Screen)</span>
                </p>
                <p>
                  <strong className="text-slate-900">สำหรับ Android (Chrome):</strong> กดเมนูจุด 3 จุดมุมขวาบน แล้วเลือก{' '}
                  <span className="font-medium text-slate-900">ติดตั้งแอป (Install app)</span> หรือ{' '}
                  <span className="font-medium text-slate-900">เพิ่มลงในหน้าจอหลัก</span>
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowIOSGuide(false)}
                className="mt-6 w-full min-h-[44px] rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-slate-800 transition"
              >
                เข้าใจแล้ว
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  return null;
};
