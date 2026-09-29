import React from 'react';
import { useRestaurant } from '../../context/RestaurantContext';
import { TableManagement } from './TableManagement';
import { KitchenOrders } from './KitchenOrders';
import { RevenueReport } from './RevenueReport';
import { MenuManagement } from './MenuManagement';
import { ReservationManagement } from './ReservationManagement';
import { StaffOrderPOS } from './StaffOrderPOS';
import { StaffManagement } from './StaffManagement';
import { StaffAuditLogView } from './StaffAuditLogView';
import { RestaurantSettingsView } from './RestaurantSettingsView';
import { 
  LayoutGrid, 
  ChefHat, 
  BarChart3, 
  UtensilsCrossed, 
  CalendarCheck, 
  Users,
  RotateCcw,
  Sparkles,
  Lock,
  ShieldCheck,
  ShieldAlert,
  LogIn,
  LogOut,
  User,
  ShoppingBag,
  ArrowRight,
  History,
  Settings
} from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const { 
    adminTab, 
    setAdminTab, 
    resetAllData, 
    currentUser, 
    setIsLoginModalOpen, 
    logoutUser,
    quickLoginRole,
    hasPermission
  } = useRestaurant();

  // If not logged in, prompt to log in
  if (!currentUser) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center p-4">
        <div className="bg-white max-w-md w-full p-8 rounded-3xl border border-stone-200 shadow-xl text-center space-y-5">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-700 mx-auto">
            <Lock className="w-8 h-8" />
          </div>

          <div className="space-y-1.5">
            <h3 className="text-2xl font-bold text-stone-900">
              Yêu cầu đăng nhập
            </h3>
            <p className="text-xs text-stone-500 leading-relaxed">
              Vui lòng đăng nhập với tài khoản nhân viên (gọi món, xem bàn, bếp) hoặc quản lý (toàn quyền) để truy cập hệ thống.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <button
              type="button"
              onClick={() => {
                quickLoginRole('manager');
                setAdminTab('reports');
              }}
              className="py-3.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-sm transition-all cursor-pointer shadow-md flex items-center justify-center gap-2"
            >
              <span>👑 Vào quản lý (1 chạm)</span>
            </button>
            <button
              type="button"
              onClick={() => {
                quickLoginRole('staff');
                setAdminTab('pos');
              }}
              className="py-3.5 px-4 rounded-xl bg-stone-100 hover:bg-stone-200 border border-stone-200 text-stone-800 font-medium text-xs transition-colors cursor-pointer flex items-center justify-center gap-1.5"
            >
              <span>👩‍🍳 Vào nhân viên (POS)</span>
            </button>
          </div>

          <button
            type="button"
            onClick={() => setIsLoginModalOpen(true)}
            className="w-full py-2.5 rounded-xl border border-stone-300 hover:bg-stone-50 text-stone-700 font-semibold text-xs transition-colors cursor-pointer"
          >
            Đăng nhập tài khoản / mật khẩu / Google
          </button>
        </div>
      </div>
    );
  }

  const isStaff = currentUser.role === 'staff';
  const isManager = currentUser.role === 'manager';

  return (
    <div className="min-h-screen bg-stone-50 pb-20">
      {/* If currently in staff role: display prominent notice to upgrade to Manager */}
      {isStaff && (
        <div className="bg-gradient-to-r from-amber-500/20 via-amber-500/25 to-amber-500/20 border-b border-amber-300/80 px-4 py-2.5 text-xs text-amber-950">
          <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="text-base">👑</span>
              <span>
                Bạn đang xem ở vai trò <strong>Nhân viên (gọi món & sơ đồ bàn)</strong>. Bạn muốn mở toàn quyền xem báo cáo doanh thu, thực đơn, nhân sự và cài đặt quán?
              </span>
            </div>
            <button
              type="button"
              onClick={() => quickLoginRole('manager')}
              className="px-3.5 py-1.5 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold rounded-lg shadow-sm transition-all cursor-pointer flex items-center gap-1 active:scale-95 text-xs"
            >
              <span>👉 Bấm vào đây để vào quyền quản lý (1 chạm)</span>
            </button>
          </div>
        </div>
      )}

      {/* Admin Subheader Bar with Personnel Badge */}
      <div className="bg-white border-b border-stone-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          {/* Active User Information Badge */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-stone-100/80 px-3 py-1.5 rounded-xl border border-stone-200">
              <span className="text-base">{currentUser.avatar || (isManager ? '👨‍💼' : '👩‍🍳')}</span>
              <div className="text-left">
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-xs text-stone-900 leading-none">
                    {currentUser.fullName}
                  </span>
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded leading-none ${
                    isManager ? 'bg-amber-100 text-amber-900 border border-amber-300' : 'bg-blue-100 text-blue-900 border border-blue-300'
                  }`}>
                    {isManager ? 'Quản lý' : 'Nhân viên'}
                  </span>
                </div>
                <span className="text-[10px] text-stone-500">
                  Tài khoản: {currentUser.username}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsLoginModalOpen(true)}
              className="text-[11px] text-stone-600 hover:text-amber-800 font-semibold px-2 py-1 rounded-lg hover:bg-stone-100 transition-colors cursor-pointer"
              title="Đổi nhân sự làm việc"
            >
              Đổi vai trò
            </button>
          </div>

          {/* Right actions: Reset (Manager only) & Logout */}
          <div className="flex items-center gap-2">
            {isManager && (
              <button
                type="button"
                onClick={() => {
                  if (window.confirm('Bạn có chắc muốn khôi phục dữ liệu mặc định của quán?')) {
                    resetAllData();
                  }
                }}
                className="text-stone-500 hover:text-stone-800 text-xs px-2.5 py-1.5 rounded-lg hover:bg-stone-100 flex items-center gap-1.5 transition-colors cursor-pointer"
                title="Khôi phục dữ liệu ban đầu"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Khôi phục mẫu</span>
              </button>
            )}

            <button
              type="button"
              onClick={logoutUser}
              className="text-rose-600 hover:text-rose-800 hover:bg-rose-50 text-xs px-2.5 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer font-medium"
              title="Đăng xuất khỏi ca"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Đăng xuất</span>
            </button>
          </div>
        </div>

        {/* Tab Selection Bar with Role Gating */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-1.5 border-t border-stone-100 overflow-x-auto py-2 text-xs font-medium">
            {/* Tab 1: Thực hiện Order (POS) - High priority for staff & manager */}
            <button
              onClick={() => setAdminTab('pos')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg whitespace-nowrap transition-all cursor-pointer ${
                adminTab === 'pos'
                  ? 'bg-amber-600 text-white font-bold shadow-xs'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
              }`}
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Gọi món (POS)</span>
              <span className="text-[10px] bg-amber-500/30 text-white px-1 rounded">POS</span>
            </button>

            {/* Tab 2: Sơ Đồ Bàn - Available for both */}
            <button
              onClick={() => setAdminTab('tables')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg whitespace-nowrap transition-all cursor-pointer ${
                adminTab === 'tables'
                  ? 'bg-amber-600 text-white font-bold shadow-xs'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
              }`}
            >
              <LayoutGrid className="w-4 h-4" />
              <span>Sơ đồ bàn</span>
            </button>

            {/* Tab 3: Bếp & Đơn Hàng - Available for both */}
            <button
              onClick={() => setAdminTab('orders')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg whitespace-nowrap transition-all cursor-pointer ${
                adminTab === 'orders'
                  ? 'bg-amber-600 text-white font-bold shadow-xs'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
              }`}
            >
              <ChefHat className="w-4 h-4" />
              <span>Bếp & đơn hàng</span>
            </button>

            {/* Tab 4: Báo Cáo Doanh Thu - Manager Only */}
            <button
              onClick={() => {
                if (isStaff) {
                  // Staff clicking locked tab
                  setAdminTab('reports');
                } else {
                  setAdminTab('reports');
                }
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg whitespace-nowrap transition-all cursor-pointer ${
                adminTab === 'reports'
                  ? 'bg-amber-600 text-white font-bold shadow-xs'
                  : isStaff
                  ? 'text-stone-400 hover:text-stone-600 hover:bg-stone-100'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              <span>Báo cáo doanh thu</span>
              {isStaff && (
                <span className="flex items-center gap-0.5 text-[10px] bg-stone-200 text-stone-600 px-1 py-0.2 rounded font-semibold">
                  <Lock className="w-2.5 h-2.5" />
                  <span>Quản lý</span>
                </span>
              )}
            </button>

            {/* Tab 5: Quản Lý Món & Giá - Manager Only */}
            <button
              onClick={() => {
                if (isStaff) {
                  setAdminTab('menu');
                } else {
                  setAdminTab('menu');
                }
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg whitespace-nowrap transition-all cursor-pointer ${
                adminTab === 'menu'
                  ? 'bg-amber-600 text-white font-bold shadow-xs'
                  : isStaff
                  ? 'text-stone-400 hover:text-stone-600 hover:bg-stone-100'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
              }`}
            >
              <UtensilsCrossed className="w-4 h-4" />
              <span>Quản lý món</span>
              {isStaff && (
                <span className="flex items-center gap-0.5 text-[10px] bg-stone-200 text-stone-600 px-1 py-0.2 rounded font-semibold">
                  <Lock className="w-2.5 h-2.5" />
                  <span>Quản lý</span>
                </span>
              )}
            </button>

            {/* Tab 6: Lịch Đặt Bàn */}
            <button
              onClick={() => setAdminTab('reservations')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg whitespace-nowrap transition-all cursor-pointer ${
                adminTab === 'reservations'
                  ? 'bg-amber-600 text-white font-bold shadow-xs'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
              }`}
            >
              <CalendarCheck className="w-4 h-4" />
              <span>Lịch đặt bàn</span>
            </button>

            {/* Tab 7: Quản Lý Nhân Sự & Tài Khoản - Manager Only */}
            <button
              onClick={() => {
                setAdminTab('staff');
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg whitespace-nowrap transition-all cursor-pointer ${
                adminTab === 'staff'
                  ? 'bg-amber-600 text-white font-bold shadow-xs'
                  : isStaff
                  ? 'text-stone-400 hover:text-stone-600 hover:bg-stone-100'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Nhân sự & quyền</span>
              {isStaff && (
                <span className="flex items-center gap-0.5 text-[10px] bg-stone-200 text-stone-600 px-1 py-0.2 rounded font-semibold">
                  <Lock className="w-2.5 h-2.5" />
                  <span>Quản lý</span>
                </span>
              )}
            </button>

            {/* Tab 8: Nhật Ký & Audit Log - Available for both */}
            <button
              onClick={() => setAdminTab('audit')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg whitespace-nowrap transition-all cursor-pointer ${
                adminTab === 'audit'
                  ? 'bg-amber-600 text-white font-bold shadow-xs'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
              }`}
            >
              <History className="w-4 h-4" />
              <span>Nhật ký thao tác</span>
            </button>

            {/* Tab 9: Cài Đặt Quán & Logo - Manager Only */}
            <button
              onClick={() => setAdminTab('settings')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg whitespace-nowrap transition-all cursor-pointer ${
                adminTab === 'settings'
                  ? 'bg-amber-600 text-white font-bold shadow-xs'
                  : isStaff
                  ? 'text-stone-400 hover:text-stone-600 hover:bg-stone-100'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
              }`}
            >
              <Settings className="w-4 h-4" />
              <span>Cài đặt quán</span>
              {isStaff && (
                <span className="flex items-center gap-0.5 text-[10px] bg-stone-200 text-stone-600 px-1 py-0.2 rounded font-semibold">
                  <Lock className="w-2.5 h-2.5" />
                  <span>Quản lý</span>
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Main Tab Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        {/* Tab POS: Staff Order */}
        {adminTab === 'pos' && <StaffOrderPOS />}

        {/* Tab Tables: Sơ Đồ Bàn */}
        {adminTab === 'tables' && <TableManagement />}

        {/* Tab Orders: Bếp & Đơn Hàng */}
        {adminTab === 'orders' && <KitchenOrders />}

        {/* Tab Reports: Báo Cáo Doanh Thu (Role-Gated) */}
        {adminTab === 'reports' && (
          isStaff ? (
            <div className="bg-white rounded-3xl border border-stone-200 p-8 sm:p-12 text-center max-w-xl mx-auto shadow-sm space-y-4 my-8">
              <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-700 flex items-center justify-center mx-auto">
                <Lock className="w-8 h-8" />
              </div>
              <div className="space-y-2">
                <h3 className="font-serif text-xl font-bold text-stone-900">
                  Chức Năng Giới Hạn: Dành Riêng Cho Quản Lý
                </h3>
                <p className="text-xs text-stone-500 leading-relaxed">
                  Tài khoản nhân viên <strong>{currentUser.fullName}</strong> chỉ được thực hiện <strong>order món</strong>, xem <strong>thông tin sơ đồ bàn</strong>, và theo dõi <strong>bếp & đơn hàng</strong>.
                </p>
                <p className="text-xs text-stone-600 bg-stone-50 p-3 rounded-xl border border-stone-200">
                  Báo cáo doanh thu theo ngày & tháng chứa số liệu kinh doanh nội bộ của Hòn Cau Quán, chỉ cấp quyền cho Quản lý / Chủ nhà hàng.
                </p>
              </div>

              <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={() => quickLoginRole('manager')}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs transition-colors shadow-sm cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>Chuyển sang Quản Lý (1 Chạm)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setAdminTab('pos')}
                  className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-stone-200 hover:bg-stone-50 text-stone-700 text-xs font-semibold cursor-pointer"
                >
                  Quay lại Tạo Order
                </button>
              </div>
            </div>
          ) : (
            <RevenueReport />
          )
        )}

        {/* Tab Menu: Quản Lý Món & Giá (Role-Gated) */}
        {adminTab === 'menu' && (
          isStaff ? (
            <div className="bg-white rounded-3xl border border-stone-200 p-8 sm:p-12 text-center max-w-xl mx-auto shadow-sm space-y-4 my-8">
              <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-700 flex items-center justify-center mx-auto">
                <Lock className="w-8 h-8" />
              </div>
              <div className="space-y-2">
                <h3 className="font-serif text-xl font-bold text-stone-900">
                  Quyền Chỉnh Sửa Thực Đơn Giới Hạn
                </h3>
                <p className="text-xs text-stone-500 leading-relaxed">
                  Nhân viên chỉ có quyền thực hiện order cho khách. Việc thêm/sửa món, đổi giá bán hoặc bật/tắt món thuộc quyền hạn của Quản Lý.
                </p>
              </div>

              <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={() => quickLoginRole('manager')}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs transition-colors shadow-sm cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>Đăng Nhập Quản Lý</span>
                </button>
                <button
                  type="button"
                  onClick={() => setAdminTab('tables')}
                  className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-stone-200 hover:bg-stone-50 text-stone-700 text-xs font-semibold cursor-pointer"
                >
                  Xem Sơ Đồ Bàn
                </button>
              </div>
            </div>
          ) : (
            <MenuManagement />
          )
        )}

        {/* Tab Reservations: Lịch Đặt Bàn */}
        {adminTab === 'reservations' && <ReservationManagement />}

        {/* Tab Staff: Quản Lý Nhân Sự & Tài Khoản (Role-Gated) */}
        {adminTab === 'staff' && (
          isStaff ? (
            <div className="bg-white rounded-3xl border border-stone-200 p-8 sm:p-12 text-center max-w-xl mx-auto shadow-sm space-y-4 my-8">
              <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-700 flex items-center justify-center mx-auto">
                <Lock className="w-8 h-8" />
              </div>
              <div className="space-y-2">
                <h3 className="font-serif text-xl font-bold text-stone-900">
                  Quyền Quản Trị Nhân Sự Giới Hạn
                </h3>
                <p className="text-xs text-stone-500 leading-relaxed">
                  Tài khoản nhân viên không có quyền quản lý danh sách nhân sự hoặc thay đổi mật khẩu của người dùng khác. Chức năng này dành riêng cho <strong>Quản Lý</strong> nhà hàng.
                </p>
              </div>

              <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={() => quickLoginRole('manager')}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs transition-colors shadow-sm cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>Đăng Nhập Quản Lý</span>
                </button>
                <button
                  type="button"
                  onClick={() => setAdminTab('pos')}
                  className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-stone-200 hover:bg-stone-50 text-stone-700 text-xs font-semibold cursor-pointer"
                >
                  Quay lại Tạo Order
                </button>
              </div>
            </div>
          ) : (
            <StaffManagement />
          )
        )}

        {/* Tab Audit: Nhật Ký Hoạt Động & Lịch Sử Thao Tác Nhân Viên */}
        {adminTab === 'audit' && <StaffAuditLogView />}

        {/* Tab Settings: Cài Đặt Quán, Logo & Google Sheets */}
        {adminTab === 'settings' && (
          isStaff ? (
            <div className="bg-white rounded-3xl border border-stone-200 p-8 sm:p-12 text-center max-w-xl mx-auto shadow-sm space-y-4 my-8">
              <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-700 flex items-center justify-center mx-auto">
                <Lock className="w-8 h-8" />
              </div>
              <div className="space-y-2">
                <h3 className="font-serif text-xl font-bold text-stone-900">
                  Cài Đặt Quán & Thương Hiệu Giới Hạn
                </h3>
                <p className="text-xs text-stone-500 leading-relaxed">
                  Thiết lập thông tin nhà hàng, logo, tài khoản nhận tiền VietQR, thuế VAT, phụ thu và kết nối Google Sheets dành riêng cho <strong>Quản Lý</strong>.
                </p>
              </div>

              <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={() => quickLoginRole('manager')}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs transition-colors shadow-sm cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>Đăng Nhập Quản Lý</span>
                </button>
                <button
                  type="button"
                  onClick={() => setAdminTab('pos')}
                  className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-stone-200 hover:bg-stone-50 text-stone-700 text-xs font-semibold cursor-pointer"
                >
                  Quay lại Tạo Order
                </button>
              </div>
            </div>
          ) : (
            <RestaurantSettingsView />
          )
        )}
      </div>
    </div>
  );
};
