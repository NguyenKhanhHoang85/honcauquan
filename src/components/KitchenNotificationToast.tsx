import React, { useEffect, useState } from 'react';
import { useRestaurant } from '../context/RestaurantContext';
import { 
  BellRing, 
  ChefHat, 
  Printer, 
  X, 
  Smartphone, 
  Volume2, 
  Check, 
  Clock, 
  ArrowRight,
  Sparkles
} from 'lucide-react';
import { formatVND } from '../utils/formatters';

export const KitchenNotificationToast: React.FC = () => {
  const { 
    kitchenAlert, 
    dismissKitchenAlert, 
    orders, 
    setActiveKitchenPrintOrder, 
    setViewMode, 
    setAdminTab,
    quickLoginRole,
    currentUser,
    kitchenNotifySettings,
    testKitchenNotification
  } = useRestaurant();

  const [isPaused, setIsPaused] = useState(false);
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    if (!kitchenAlert) {
      setProgress(100);
      return;
    }

    setProgress(100);
    const duration = 12000; // 12 seconds
    const intervalTime = 100;
    const step = (intervalTime / duration) * 100;

    const timer = setInterval(() => {
      if (!isPaused) {
        setProgress((prev) => {
          if (prev <= step) {
            clearInterval(timer);
            dismissKitchenAlert();
            return 0;
          }
          return prev - step;
        });
      }
    }, intervalTime);

    return () => clearInterval(timer);
  }, [kitchenAlert, isPaused, dismissKitchenAlert]);

  if (!kitchenAlert) return null;

  // Find corresponding order if available for printing
  const targetOrder = orders.find((o) => o.id === kitchenAlert.orderId);

  const handleGoToKitchen = () => {
    // If not logged in, log in as staff or manager
    if (!currentUser) {
      quickLoginRole('staff');
    }
    setViewMode('admin');
    setAdminTab('orders');
    dismissKitchenAlert();
  };

  const handlePrintKitchenTicket = () => {
    if (targetOrder) {
      setActiveKitchenPrintOrder({ 
        order: targetOrder, 
        roundOnly: kitchenAlert.isNewRound 
      });
      dismissKitchenAlert();
    } else {
      handleGoToKitchen();
    }
  };

  return (
    <div 
      className="fixed top-4 right-4 sm:top-6 sm:right-6 z-50 max-w-md w-[calc(100vw-2rem)] sm:w-[420px] transition-all duration-300"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="bg-stone-900 text-stone-100 rounded-2xl shadow-2xl border-2 border-amber-500/80 overflow-hidden ring-4 ring-amber-500/20 animate-bounce-short">
        {/* Top Header Bar */}
        <div className="bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700 px-4 py-2.5 flex items-center justify-between text-white">
          <div className="flex items-center gap-2">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-white"></span>
            </span>
            <div className="flex items-center gap-1.5 font-bold text-xs tracking-wide">
              <BellRing className="w-4 h-4 animate-wiggle" />
              <span>
                {kitchenAlert.isNewRound 
                  ? `🔔 Bếp: Gọi thêm món (đợt ${kitchenAlert.roundNumber || 2})` 
                  : '🔔 Bếp: Có đơn hàng mới'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={dismissKitchenAlert}
              className="p-1 rounded-lg hover:bg-black/20 text-white/90 hover:text-white transition-colors cursor-pointer"
              title="Đóng thông báo"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-4 space-y-3">
          <div className="flex items-start justify-between gap-2">
            <div>
              <div className="flex items-center gap-2">
                <h4 className="font-bold text-base text-amber-300">
                  {kitchenAlert.tableName || (kitchenAlert.orderType === 'takeaway' ? 'Khách mang về' : 'Tại quán')}
                </h4>
                <span className="px-2 py-0.5 rounded-full bg-stone-800 text-amber-400 font-mono text-[11px] font-bold border border-amber-500/30">
                  #{kitchenAlert.orderCode}
                </span>
              </div>
              <p className="text-[11px] text-stone-400 mt-0.5 flex items-center gap-1">
                <Clock className="w-3 h-3 text-stone-500" />
                <span>
                  {new Date(kitchenAlert.timestamp).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                </span>
                <span>•</span>
                <span className="font-semibold text-stone-300">{kitchenAlert.itemCount} món cần làm</span>
              </p>
            </div>

            <div className="text-right">
              <span className="text-xs font-bold text-emerald-400 font-mono">
                {formatVND(kitchenAlert.totalAmount)}
              </span>
            </div>
          </div>

          {/* Dishes Summary preview */}
          <div className="bg-stone-950/70 p-2.5 rounded-xl border border-stone-800 text-xs text-stone-300 space-y-1">
            <div className="text-[11px] font-semibold text-stone-400 flex items-center gap-1">
              <ChefHat className="w-3.5 h-3.5 text-amber-400" />
              <span>Các món cần chuẩn bị:</span>
            </div>
            <p className="line-clamp-2 leading-relaxed font-medium text-stone-200">
              {kitchenAlert.itemsSummary || 'Vui lòng mở phiếu bếp để xem chi tiết đầy đủ.'}
            </p>
          </div>

          {/* Indicators for sound & vibrate */}
          <div className="flex items-center justify-between text-[11px] text-stone-400 pt-0.5 border-t border-stone-800/80">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1 text-amber-400/90 font-medium">
                <Smartphone className="w-3.5 h-3.5" />
                <span>{kitchenNotifySettings.vibrateEnabled ? 'Rung chuông' : 'Rung tắt'}</span>
              </span>
              <span className="flex items-center gap-1 text-amber-400/90 font-medium">
                <Volume2 className="w-3.5 h-3.5" />
                <span>{kitchenNotifySettings.soundEnabled ? 'Âm báo' : 'Âm tắt'}</span>
              </span>
            </div>

            <button
              type="button"
              onClick={testKitchenNotification}
              className="text-[10px] text-stone-400 hover:text-amber-300 underline cursor-pointer"
            >
              Thử lại chuông/rung
            </button>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-2 pt-1">
            <button
              type="button"
              onClick={handleGoToKitchen}
              className="py-2 px-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs transition-all shadow-md cursor-pointer flex items-center justify-center gap-1.5"
            >
              <ChefHat className="w-3.5 h-3.5" />
              <span>Xem đơn bếp</span>
            </button>

            <button
              type="button"
              onClick={handlePrintKitchenTicket}
              className="py-2 px-3 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 hover:text-white font-semibold text-xs border border-stone-700 transition-colors cursor-pointer flex items-center justify-center gap-1.5"
            >
              <Printer className="w-3.5 h-3.5 text-stone-300" />
              <span>In phiếu bếp</span>
            </button>
          </div>
        </div>

        {/* Auto Dismiss Progress Bar */}
        <div className="h-1 w-full bg-stone-800">
          <div 
            className="h-full bg-gradient-to-r from-amber-500 to-orange-500 transition-all duration-100 ease-linear"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  );
};
