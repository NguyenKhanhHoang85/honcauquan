import React, { useState } from 'react';
import { useRestaurant } from '../../context/RestaurantContext';
import { MenuSection } from './MenuSection';
import { ReservationSection } from './ReservationSection';
import { OrderHistorySection } from './OrderHistorySection';
import { CartDrawer } from './CartDrawer';
import { Utensils, Calendar, ShoppingBag, Clock, ShieldCheck, MapPin, Sparkles, ChevronRight } from 'lucide-react';

export const CustomerView: React.FC = () => {
  const { 
    customerTab, 
    setCustomerTab, 
    cartCount, 
    settings, 
    quickLoginRole, 
    setViewMode, 
    setAdminTab 
  } = useRestaurant();
  const [isCartOpen, setIsCartOpen] = useState(false);

  return (
    <div className="min-h-screen bg-stone-50 pb-20">
      {/* Hero Banner (Chỉ có chữ hiển thị, toàn bộ nền trong suốt thấy trọn vẹn hình nền) */}
      {customerTab === 'menu' && (
        <div className="relative text-white overflow-hidden mb-6 border-b border-stone-800/20 bg-transparent min-h-[380px] sm:min-h-[460px] flex items-center">
          {/* Background Image: Hiển thị 100% sáng rõ, toàn bộ nền trong suốt không che khuất */}
          <div className="absolute inset-0 z-0">
            <img
              src={settings.headerBannerUrl || '/1.jpg'}
              alt="Mặt tiền nhà hàng Hòn Cau Quán - Côn Đảo"
              className="w-full h-full object-cover object-[center_35%]"
              referrerPolicy="no-referrer"
              onError={(e) => {
                // Fallback to SVG banner if 1.jpg is not reachable
                (e.target as HTMLImageElement).src = '/hon_cau_hero.svg';
              }}
            />
          </div>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 relative z-10 w-full">
            {/* Khung nội dung trong suốt hoàn toàn - CHỈ CÓ CHỮ HIỂN THỊ */}
            <div className="max-w-2xl bg-transparent border-0 shadow-none p-0 space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-black/40 text-amber-300 text-xs font-semibold backdrop-blur-xs border border-white/20 shadow-md">
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>Nhà hàng Hòn Cau Quán - Tinh hoa ẩm thực Côn Đảo</span>
              </div>

              <h1 className="text-3xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-white leading-tight drop-shadow-[0_4px_14px_rgba(0,0,0,0.95)]">
                {settings.name || 'Hòn Cau Quán'}<br />
                <span className="text-amber-400 drop-shadow-[0_4px_14px_rgba(0,0,0,0.95)]">
                  {settings.slogan || 'Hải Sản Tươi Sống Côn Đảo'}
                </span>
              </h1>

              <p className="text-white text-xs sm:text-sm md:text-base leading-relaxed max-w-xl drop-shadow-[0_2px_8px_rgba(0,0,0,0.95)] font-medium">
                Thưởng thức hải sản tươi rói từ mẻ lưới sớm mai, nhâm nhi tách cà phê nguyên chất hoặc ly trà thanh mát giữa không gian gió biển lộng gió ngay dưới chân núi Côn Đảo.
              </p>

              {/* Action buttons */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setCustomerTab('reservation')}
                  className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs sm:text-sm rounded-xl transition-all shadow-xl flex items-center gap-1.5 cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
                >
                  <Calendar className="w-4 h-4" />
                  <span>Đặt bàn trước</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsCartOpen(true)}
                  className="px-5 py-2.5 bg-black/40 hover:bg-black/60 text-white font-semibold text-xs sm:text-sm rounded-xl border border-white/40 transition-all flex items-center gap-1.5 cursor-pointer backdrop-blur-xs hover:scale-[1.02] active:scale-[0.98] shadow-xl"
                >
                  <ShoppingBag className="w-4 h-4 text-amber-300" />
                  <span>Giỏ món của bạn ({cartCount})</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    quickLoginRole('manager');
                    setViewMode('admin');
                    setAdminTab('reports');
                  }}
                  className="px-5 py-2.5 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-stone-950 font-bold text-xs sm:text-sm rounded-xl transition-all shadow-xl flex items-center gap-1.5 cursor-pointer hover:scale-[1.02] active:scale-[0.98] border border-amber-300"
                  title="Truy cập doanh thu, thực đơn, sơ đồ bàn, bếp & cài đặt quán"
                >
                  <ShieldCheck className="w-4 h-4 text-stone-950" />
                  <span>👑 Vào trình quản lý</span>
                </button>
              </div>

              {/* Trust Points - Chữ rõ nét, nền hoàn toàn trong suốt */}
              <div className="flex flex-wrap items-center gap-3 sm:gap-6 pt-3 text-xs sm:text-sm text-white font-bold drop-shadow-[0_2px_8px_rgba(0,0,0,0.95)]">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-md" />
                  <span>Hải sản tươi sống 100%</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-sky-400 shadow-md" />
                  <span>VietQR / MoMo nhanh</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-400 shadow-md" />
                  <span>Phục vụ chu đáo 24/7</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
        {customerTab === 'menu' && <MenuSection />}
        {customerTab === 'reservation' && <ReservationSection />}
        {customerTab === 'my_order' && <OrderHistorySection />}
      </div>

      {/* Floating Bottom Cart Bar (if cart has items) */}
      {cartCount > 0 && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 max-w-md w-[92%] sm:w-auto">
          <button
            onClick={() => setIsCartOpen(true)}
            className="w-full sm:w-auto px-6 py-3.5 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-2xl shadow-xl flex items-center justify-between sm:justify-center gap-4 transition-all duration-200 cursor-pointer active:scale-98 border border-amber-500/50"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-full bg-white text-amber-800 flex items-center justify-center font-bold text-xs">
                {cartCount}
              </div>
              <span className="text-sm">Xem giỏ & gọi món</span>
            </div>
            <div className="flex items-center gap-1 text-amber-100 text-xs">
              <span>Mở giỏ</span>
              <ChevronRight className="w-4 h-4" />
            </div>
          </button>
        </div>
      )}

      {/* Cart Drawer */}
      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </div>
  );
};
