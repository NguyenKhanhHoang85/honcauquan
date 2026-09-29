import React from 'react';
import { useRestaurant } from '../context/RestaurantContext';
import { 
  ShoppingBag, 
  UtensilsCrossed, 
  LayoutDashboard, 
  Calendar, 
  Coffee, 
  FileText,
  UserCheck,
  Lock,
  LogOut,
  Sparkles,
  ChevronDown
} from 'lucide-react';

export const Header: React.FC = () => {
  const { 
    viewMode, 
    setViewMode, 
    adminTab, 
    setAdminTab, 
    customerTab, 
    setCustomerTab,
    cartCount,
    currentUser,
    setIsLoginModalOpen,
    quickLoginRole,
    logoutUser,
    hasPermission,
    isCloudConnected,
    settings,
    showToast
  } = useRestaurant();

  const isStaff = currentUser?.role === 'staff';
  const isManager = currentUser?.role === 'manager';

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-stone-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Zone 1: Brand wordmark & Logo */}
          <div className="flex items-center gap-3">
            <button 
              onClick={() => {
                if (viewMode === 'customer') setCustomerTab('menu');
                else setAdminTab(isStaff ? 'pos' : 'tables');
              }}
              className="text-left group cursor-pointer"
            >
              <div className="flex items-center gap-2">
                {settings.logoUrl ? (
                  <img 
                    src={settings.logoUrl} 
                    alt="Logo" 
                    className="w-8 h-8 rounded-lg object-contain bg-stone-100 border border-stone-200 shadow-xs"
                    onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }}
                  />
                ) : (
                  <span className="w-8 h-8 rounded-lg bg-amber-600 flex items-center justify-center text-white font-bold text-sm shadow-sm">
                    {settings.name ? settings.name.slice(0, 2).toUpperCase() : 'HC'}
                  </span>
                )}
                <span className="text-xl sm:text-2xl font-bold tracking-tight text-stone-900 group-hover:text-amber-700 transition-colors">
                  {settings.name || 'Hòn Cau Quán'}
                </span>
              </div>
            </button>

            {/* Cloud Realtime Status indicator */}
            <div 
              className="hidden lg:inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium bg-emerald-50 text-emerald-800 border border-emerald-200"
              title="Đang kết nối cơ sở dữ liệu đám mây - Dữ liệu tự động đồng bộ tức thì cho nhiều người cùng truy cập"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>{isCloudConnected ? 'Cloud Online' : 'Đang kết nối...'}</span>
            </div>
          </div>

          {/* Zone 2: Navigation Links (Domain Specific) */}
          <nav className="hidden md:flex items-center gap-1 text-sm font-medium">
            {viewMode === 'customer' ? (
              <>
                <button
                  onClick={() => setCustomerTab('menu')}
                  className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                    customerTab === 'menu'
                      ? 'bg-amber-50 text-amber-900 font-semibold'
                      : 'text-stone-600 hover:text-stone-900 hover:bg-stone-50'
                  }`}
                >
                  Thực đơn & gọi món
                </button>
                <button
                  onClick={() => setCustomerTab('reservation')}
                  className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                    customerTab === 'reservation'
                      ? 'bg-amber-50 text-amber-900 font-semibold'
                      : 'text-stone-600 hover:text-stone-900 hover:bg-stone-50'
                  }`}
                >
                  Đặt bàn trước
                </button>
                <button
                  onClick={() => setCustomerTab('my_order')}
                  className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                    customerTab === 'my_order'
                      ? 'bg-amber-50 text-amber-900 font-semibold'
                      : 'text-stone-600 hover:text-stone-900 hover:bg-stone-50'
                  }`}
                >
                  Đơn đã gọi & hóa đơn
                </button>
              </>
            ) : (
              <>
                {/* Pos tab for taking orders */}
                <button
                  onClick={() => setAdminTab('pos')}
                  className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                    adminTab === 'pos'
                      ? 'bg-amber-50 text-amber-900 font-semibold'
                      : 'text-stone-600 hover:text-stone-900 hover:bg-stone-50'
                  }`}
                >
                  Gọi món (POS)
                </button>
                <button
                  onClick={() => setAdminTab('tables')}
                  className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                    adminTab === 'tables'
                      ? 'bg-amber-50 text-amber-900 font-semibold'
                      : 'text-stone-600 hover:text-stone-900 hover:bg-stone-50'
                  }`}
                >
                  Sơ đồ bàn
                </button>
                <button
                  onClick={() => setAdminTab('orders')}
                  className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                    adminTab === 'orders'
                      ? 'bg-amber-50 text-amber-900 font-semibold'
                      : 'text-stone-600 hover:text-stone-900 hover:bg-stone-50'
                  }`}
                >
                  Bếp & đơn hàng
                </button>
                
                {/* Reports & Menu (highlighting role) */}
                <button
                  onClick={() => setAdminTab('reports')}
                  className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer flex items-center gap-1 ${
                    adminTab === 'reports'
                      ? 'bg-amber-50 text-amber-900 font-semibold'
                      : isStaff
                      ? 'text-stone-400 hover:text-stone-600'
                      : 'text-stone-600 hover:text-stone-900 hover:bg-stone-50'
                  }`}
                >
                  <span>Báo cáo doanh thu</span>
                  {isStaff && <Lock className="w-3 h-3 text-stone-400" />}
                </button>
                <button
                  onClick={() => setAdminTab('menu')}
                  className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer flex items-center gap-1 ${
                    adminTab === 'menu'
                      ? 'bg-amber-50 text-amber-900 font-semibold'
                      : isStaff
                      ? 'text-stone-400 hover:text-stone-600'
                      : 'text-stone-600 hover:text-stone-900 hover:bg-stone-50'
                  }`}
                >
                  <span>Quản lý món</span>
                  {isStaff && <Lock className="w-3 h-3 text-stone-400" />}
                </button>
                <button
                  onClick={() => setAdminTab('reservations')}
                  className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                    adminTab === 'reservations'
                      ? 'bg-amber-50 text-amber-900 font-semibold'
                      : 'text-stone-600 hover:text-stone-900 hover:bg-stone-50'
                  }`}
                >
                  Lịch đặt bàn
                </button>
              </>
            )}
          </nav>

          {/* Zone 3: Primary Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            {viewMode === 'customer' && (
              <button
                onClick={() => setCustomerTab('menu')}
                className="relative p-2 text-stone-700 hover:text-stone-900 hover:bg-stone-100 rounded-lg transition-colors cursor-pointer"
                title="Giỏ hàng gọi món"
                aria-label="Giỏ hàng"
              >
                <ShoppingBag className="w-5 h-5" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-amber-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center animate-pulse">
                    {cartCount}
                  </span>
                )}
              </button>
            )}

            {/* If in admin view: Personnel Badge & Quick Upgrade button */}
            {viewMode === 'admin' && (
              <div className="flex items-center gap-1.5 sm:gap-2">
                {currentUser && (
                  <button
                    type="button"
                    onClick={() => setIsLoginModalOpen(true)}
                    className="flex items-center gap-1.5 px-2.5 py-1.5 bg-stone-100 hover:bg-stone-200 border border-stone-200 rounded-lg text-xs font-medium text-stone-800 transition-colors cursor-pointer"
                    title="Đổi tài khoản đăng nhập"
                  >
                    <span>{currentUser.avatar || (isManager ? '👨‍💼' : '👩‍🍳')}</span>
                    <span className="font-bold hidden sm:inline">{currentUser.fullName}</span>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${
                      isManager ? 'bg-amber-200 text-amber-900 border border-amber-300' : 'bg-blue-200 text-blue-900 border border-blue-300'
                    }`}>
                      {isManager ? 'Quản lý' : 'Nhân viên'}
                    </span>
                    <ChevronDown className="w-3 h-3 text-stone-500" />
                  </button>
                )}

                {/* If logged in as staff, provide 1-click upgrade button to Manager right in header */}
                {isStaff && (
                  <button
                    type="button"
                    onClick={() => {
                      quickLoginRole('manager');
                      showToast('Đã chuyển sang quyền quản lý thành công!');
                    }}
                    className="px-2.5 py-1.5 bg-amber-500 hover:bg-amber-400 text-stone-950 font-semibold text-xs rounded-lg shadow-sm flex items-center gap-1 cursor-pointer transition-all animate-pulse"
                    title="Bấm để chuyển sang quyền quản lý"
                  >
                    <span>👑 Lên quản lý</span>
                  </button>
                )}
              </div>
            )}

            {/* When in Customer View: Direct Buttons to Enter Manager or Staff Mode */}
            {viewMode === 'customer' ? (
              <div className="flex items-center gap-1.5 sm:gap-2">
                <button
                  type="button"
                  onClick={() => {
                    quickLoginRole('manager');
                    setViewMode('admin');
                    setAdminTab('reports');
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-stone-950 text-xs sm:text-sm font-bold rounded-lg transition-all cursor-pointer shadow-sm active:scale-[0.98]"
                  title="Truy cập báo cáo doanh thu, quản lý thực đơn, cài đặt nhà hàng & nhân sự"
                >
                  <LayoutDashboard className="w-4 h-4 text-stone-950" />
                  <span>👑 Vào quản lý</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    quickLoginRole('staff');
                    setViewMode('admin');
                    setAdminTab('pos');
                  }}
                  className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-semibold rounded-lg border border-stone-200 transition-all cursor-pointer"
                  title="Chế độ nhân viên tạo order POS"
                >
                  <span>👩‍🍳 Nhân viên POS</span>
                </button>

                {/* Login Modal icon */}
                <button
                  type="button"
                  onClick={() => setIsLoginModalOpen(true)}
                  className="p-1.5 sm:p-2 text-stone-500 hover:text-stone-900 hover:bg-stone-100 rounded-lg transition-colors cursor-pointer"
                  title="Đăng nhập tài khoản / PIN / Google"
                >
                  <UserCheck className="w-4 h-4" />
                </button>
              </div>
            ) : (
              /* When in Admin View: Switch back to Customer view */
              <button
                type="button"
                onClick={() => setViewMode('customer')}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs sm:text-sm font-semibold rounded-lg transition-all cursor-pointer shadow-sm"
              >
                <UtensilsCrossed className="w-4 h-4" />
                <span className="hidden sm:inline">Xem giao diện khách</span>
                <span className="sm:hidden">Xem menu khách</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Sub-Navigation Bar */}
      <div className="md:hidden border-t border-stone-100 bg-stone-50/90 px-3 py-2 flex items-center justify-around overflow-x-auto text-xs font-medium">
        {viewMode === 'customer' ? (
          <>
            <button
              onClick={() => setCustomerTab('menu')}
              className={`px-2.5 py-1 rounded whitespace-nowrap ${customerTab === 'menu' ? 'bg-amber-600 text-white' : 'text-stone-600'}`}
            >
              Thực đơn
            </button>
            <button
              onClick={() => setCustomerTab('reservation')}
              className={`px-2.5 py-1 rounded whitespace-nowrap ${customerTab === 'reservation' ? 'bg-amber-600 text-white' : 'text-stone-600'}`}
            >
              Đặt bàn
            </button>
            <button
              onClick={() => setCustomerTab('my_order')}
              className={`px-2.5 py-1 rounded whitespace-nowrap ${customerTab === 'my_order' ? 'bg-amber-600 text-white' : 'text-stone-600'}`}
            >
              Đơn của tôi
            </button>
            <button
              type="button"
              onClick={() => {
                quickLoginRole('manager');
                setViewMode('admin');
                setAdminTab('reports');
              }}
              className="px-2.5 py-1 rounded whitespace-nowrap font-bold bg-amber-500 hover:bg-amber-400 text-stone-950 flex items-center gap-1 shadow-2xs"
            >
              <span>👑 Quản Lý</span>
            </button>
          </>
        ) : (
          <>
            <button
              onClick={() => setAdminTab('pos')}
              className={`px-2 py-1 rounded whitespace-nowrap ${adminTab === 'pos' ? 'bg-amber-600 text-white' : 'text-stone-600'}`}
            >
              Tạo Order
            </button>
            <button
              onClick={() => setAdminTab('tables')}
              className={`px-2 py-1 rounded whitespace-nowrap ${adminTab === 'tables' ? 'bg-amber-600 text-white' : 'text-stone-600'}`}
            >
              Sơ đồ bàn
            </button>
            <button
              onClick={() => setAdminTab('orders')}
              className={`px-2 py-1 rounded whitespace-nowrap ${adminTab === 'orders' ? 'bg-amber-600 text-white' : 'text-stone-600'}`}
            >
              Bếp & Đơn
            </button>
            <button
              onClick={() => setAdminTab('reports')}
              className={`px-2 py-1 rounded whitespace-nowrap flex items-center gap-0.5 ${adminTab === 'reports' ? 'bg-amber-600 text-white' : isStaff ? 'text-stone-400' : 'text-stone-600'}`}
            >
              <span>Doanh thu</span>
              {isStaff && <Lock className="w-2.5 h-2.5" />}
            </button>
            <button
              onClick={() => setAdminTab('menu')}
              className={`px-2 py-1 rounded whitespace-nowrap flex items-center gap-0.5 ${adminTab === 'menu' ? 'bg-amber-600 text-white' : isStaff ? 'text-stone-400' : 'text-stone-600'}`}
            >
              <span>Món</span>
              {isStaff && <Lock className="w-2.5 h-2.5" />}
            </button>
          </>
        )}
      </div>
    </header>
  );
};
