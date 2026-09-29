import React, { useState } from 'react';
import { useRestaurant } from '../context/RestaurantContext';
import { UserRole, StaffAccount } from '../types/restaurant';
import { 
  ShieldCheck, 
  User, 
  KeyRound, 
  Lock, 
  X, 
  CheckCircle2, 
  AlertCircle, 
  Sparkles,
  ChevronRight,
  ArrowRight,
  ChefHat,
  Eye,
  EyeOff,
  Users
} from 'lucide-react';

export const LoginModal: React.FC = () => {
  const { 
    isLoginModalOpen, 
    setIsLoginModalOpen, 
    currentUser, 
    loginWithCredentials, 
    loginWithPin, 
    loginWithGoogle,
    quickLoginRole, 
    availableStaffAccounts,
    setViewMode,
    setAdminTab
  } = useRestaurant();

  const [activeTab, setActiveTab] = useState<'quick' | 'credentials' | 'pin'>('quick');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [pin, setPin] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoadingGoogle, setIsLoadingGoogle] = useState(false);

  if (!isLoginModalOpen) return null;

  const handleClose = () => {
    setIsLoginModalOpen(false);
    setErrorMessage(null);
  };

  const handleQuickLogin = (role: UserRole) => {
    quickLoginRole(role);
    setViewMode('admin');
    if (role === 'staff') {
      setAdminTab('pos');
    } else {
      setAdminTab('reports');
    }
    setIsLoginModalOpen(false);
  };

  const handleGoogleLogin = async () => {
    setIsLoadingGoogle(true);
    setErrorMessage(null);
    try {
      const res = await loginWithGoogle();
      if (!res.success && res.message) {
        setErrorMessage(res.message);
      } else {
        setViewMode('admin');
        setAdminTab('reports');
        setIsLoginModalOpen(false);
      }
    } finally {
      setIsLoadingGoogle(false);
    }
  };

  const handleSelectAccount = (acc: StaffAccount) => {
    loginWithCredentials(acc.username, acc.password || '');
    setViewMode('admin');
    if (acc.role === 'staff') {
      setAdminTab('pos');
    } else {
      setAdminTab('reports');
    }
    setIsLoginModalOpen(false);
  };

  const handleSubmitCredentials = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    const targetUser = username.trim() || 'admin';
    const targetPass = password.trim() || '123';
    const res = loginWithCredentials(targetUser, targetPass);
    if (res.success) {
      setViewMode('admin');
      setIsLoginModalOpen(false);
    } else {
      setErrorMessage(res.message || 'Đăng nhập không thành công.');
    }
  };

  const handlePinDigit = (digit: string) => {
    setErrorMessage(null);
    if (pin.length < 4) {
      const newPin = pin + digit;
      setPin(newPin);
      if (newPin.length === 4) {
        // Auto submit PIN
        const res = loginWithPin(newPin);
        if (res.success) {
          setViewMode('admin');
          setPin('');
          setIsLoginModalOpen(false);
        } else {
          setErrorMessage(res.message || 'Mã PIN sai.');
          setTimeout(() => setPin(''), 600);
        }
      }
    }
  };

  const handlePinDelete = () => {
    setPin((prev) => prev.slice(0, -1));
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-950/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div 
        className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-stone-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-stone-900 via-stone-850 to-stone-900 text-white p-6 relative">
          <button
            onClick={handleClose}
            className="absolute top-5 right-5 text-stone-400 hover:text-white p-1.5 rounded-full hover:bg-white/10 transition-colors cursor-pointer"
            aria-label="Đóng"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 font-serif font-bold text-xl shadow-inner">
              HC
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-[11px] font-semibold">
                <Sparkles className="w-3 h-3 text-amber-400" />
                <span>Hệ Thống Phân Quyền Hòn Cau Quán</span>
              </div>
              <h3 className="font-serif text-xl sm:text-2xl font-bold tracking-tight text-white mt-1">
                Đăng Nhập Nhân Sự
              </h3>
            </div>
          </div>

          {/* Mode Tabs */}
          <div className="grid grid-cols-3 gap-1 bg-white/10 p-1 rounded-xl mt-5 text-xs font-semibold">
            <button
              onClick={() => { setActiveTab('quick'); setErrorMessage(null); }}
              className={`py-2 px-2 rounded-lg transition-all cursor-pointer text-center ${
                activeTab === 'quick' ? 'bg-amber-500 text-stone-950 shadow-sm' : 'text-stone-300 hover:text-white'
              }`}
            >
              1 Chạm Nhanh
            </button>
            <button
              onClick={() => { setActiveTab('credentials'); setErrorMessage(null); }}
              className={`py-2 px-2 rounded-lg transition-all cursor-pointer text-center ${
                activeTab === 'credentials' ? 'bg-amber-500 text-stone-950 shadow-sm' : 'text-stone-300 hover:text-white'
              }`}
            >
              Tài Khoản
            </button>
            <button
              onClick={() => { setActiveTab('pin'); setErrorMessage(null); }}
              className={`py-2 px-2 rounded-lg transition-all cursor-pointer text-center ${
                activeTab === 'pin' ? 'bg-amber-500 text-stone-950 shadow-sm' : 'text-stone-300 hover:text-white'
              }`}
            >
              Mã PIN 4 Số
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-5">
          {errorMessage && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Direct 1-Click Fast Login Banner (Always visible for maximum convenience) */}
          <div className="bg-gradient-to-r from-amber-500/10 via-amber-500/15 to-amber-500/10 border-2 border-amber-400/60 rounded-2xl p-4 shadow-sm space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-amber-900 flex items-center gap-1.5 uppercase tracking-wide">
                <Sparkles className="w-4 h-4 text-amber-600" />
                <span>Vào Trình Quản Lý Siêu Tốc</span>
              </span>
              <span className="text-[10px] bg-amber-500 text-stone-950 font-bold px-2 py-0.5 rounded-full">
                Khuyên Dùng
              </span>
            </div>

            <button
              type="button"
              onClick={() => handleQuickLogin('manager')}
              className="w-full py-3 px-4 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 font-black text-sm rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99]"
            >
              <ShieldCheck className="w-5 h-5 text-stone-950" />
              <span>👑 BẤM ĐỂ VÀO QUYỀN QUẢN LÝ NGAY (1 CHẠM)</span>
            </button>

            <p className="text-[11px] text-stone-600 text-center">
              Toàn quyền: Xem Doanh thu, Cài đặt quán & Logo, Quản lý món & giá, Nhân sự.
            </p>
          </div>

          {/* Google Sign-in button */}
          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={isLoadingGoogle}
            className="w-full py-2.5 px-4 bg-white hover:bg-stone-50 text-stone-800 border border-stone-300 font-semibold text-xs rounded-xl shadow-2xs transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
            </svg>
            <span>{isLoadingGoogle ? 'Đang xác thực Google...' : 'Đăng nhập bằng tài khoản Google (Quản Lý)'}</span>
          </button>

          {/* Tab 1: Quick Role Switch (Fastest & most intuitive) */}
          {activeTab === 'quick' && (
            <div className="space-y-4">
              <p className="text-xs text-stone-500 text-center">
                Chọn vai trò của bạn để đăng nhập ngay vào hệ thống làm việc:
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {/* Quản Lý */}
                <button
                  type="button"
                  onClick={() => handleQuickLogin('manager')}
                  className="group relative p-4 rounded-2xl border-2 border-stone-200 hover:border-amber-500 bg-stone-50/50 hover:bg-amber-50/40 text-left transition-all cursor-pointer shadow-xs hover:shadow-md flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="w-10 h-10 rounded-xl bg-amber-500 text-stone-950 font-bold flex items-center justify-center text-lg shadow-sm">
                        👨‍💼
                      </span>
                      <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300">
                        Toàn Quyền
                      </span>
                    </div>

                    <div>
                      <h4 className="font-bold text-stone-900 text-sm group-hover:text-amber-900 flex items-center gap-1.5">
                        Quản Lý (Manager)
                      </h4>
                      <p className="text-xs text-stone-600 font-medium">Lê Hoàng Nam</p>
                    </div>

                    <ul className="text-[11px] text-stone-500 space-y-1 pt-1 border-t border-stone-200/60">
                      <li className="flex items-center gap-1 text-emerald-700">
                        <CheckCircle2 className="w-3 h-3 shrink-0" />
                        <span>Xem Báo Cáo Doanh Thu</span>
                      </li>
                      <li className="flex items-center gap-1 text-emerald-700">
                        <CheckCircle2 className="w-3 h-3 shrink-0" />
                        <span>Quản lý món & điều chỉnh giá</span>
                      </li>
                      <li className="flex items-center gap-1 text-emerald-700">
                        <CheckCircle2 className="w-3 h-3 shrink-0" />
                        <span>Sơ đồ bàn, Bếp & Đặt bàn</span>
                      </li>
                    </ul>
                  </div>

                  <div className="mt-3 pt-2 text-xs font-bold text-amber-700 flex items-center justify-end gap-1">
                    <span>Vào quyền Quản Lý</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </div>
                </button>

                {/* Nhân Viên */}
                <button
                  type="button"
                  onClick={() => handleQuickLogin('staff')}
                  className="group relative p-4 rounded-2xl border-2 border-stone-200 hover:border-blue-500 bg-stone-50/50 hover:bg-blue-50/40 text-left transition-all cursor-pointer shadow-xs hover:shadow-md flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="w-10 h-10 rounded-xl bg-blue-600 text-white font-bold flex items-center justify-center text-lg shadow-sm">
                        👩‍🍳
                      </span>
                      <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-blue-100 text-blue-900 border border-blue-300">
                        Chuyên Trách
                      </span>
                    </div>

                    <div>
                      <h4 className="font-bold text-stone-900 text-sm group-hover:text-blue-900 flex items-center gap-1.5">
                        Nhân Viên (Staff)
                      </h4>
                      <p className="text-xs text-stone-600 font-medium">Trần Mỹ Linh</p>
                    </div>

                    <ul className="text-[11px] text-stone-500 space-y-1 pt-1 border-t border-stone-200/60">
                      <li className="flex items-center gap-1 text-emerald-700 font-medium">
                        <CheckCircle2 className="w-3 h-3 shrink-0" />
                        <span>Thực hiện Order cho khách</span>
                      </li>
                      <li className="flex items-center gap-1 text-emerald-700 font-medium">
                        <CheckCircle2 className="w-3 h-3 shrink-0" />
                        <span>Xem thông tin Sơ đồ bàn</span>
                      </li>
                      <li className="flex items-center gap-1 text-emerald-700 font-medium">
                        <CheckCircle2 className="w-3 h-3 shrink-0" />
                        <span>Theo dõi Bếp & Đơn hàng</span>
                      </li>
                    </ul>
                  </div>

                  <div className="mt-3 pt-2 text-xs font-bold text-blue-700 flex items-center justify-end gap-1">
                    <span>Vào quyền Nhân Viên</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </div>
                </button>
              </div>

              {/* Specific personnel list */}
              <div className="pt-2 border-t border-stone-100">
                <span className="text-[11px] font-semibold text-stone-400 uppercase tracking-wider block mb-2">
                  Danh sách nhân sự đang phân ca:
                </span>
                <div className="space-y-1.5">
                  {availableStaffAccounts.map((acc) => (
                    <div
                      key={acc.id}
                      onClick={() => handleSelectAccount(acc)}
                      className="p-2.5 rounded-xl border border-stone-200 hover:border-amber-400 bg-white hover:bg-stone-50 flex items-center justify-between transition-colors cursor-pointer text-xs"
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="text-lg">{acc.avatar || '👤'}</span>
                        <div>
                          <div className="font-bold text-stone-900 flex items-center gap-2">
                            <span>{acc.fullName}</span>
                            <span className={`text-[10px] px-1.5 py-0.2 rounded font-semibold ${
                              acc.role === 'manager' ? 'bg-amber-100 text-amber-800' : 'bg-blue-100 text-blue-800'
                            }`}>
                              {acc.role === 'manager' ? 'Quản Lý' : 'Nhân Viên Order'}
                            </span>
                          </div>
                          <span className="text-[11px] text-stone-500">Tài khoản: {acc.username} · PIN: {acc.pin}</span>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-stone-400" />
                    </div>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() => {
                    quickLoginRole('manager');
                    setViewMode('admin');
                    setAdminTab('staff');
                    setIsLoginModalOpen(false);
                  }}
                  className="w-full mt-2.5 py-2.5 px-3 rounded-xl border border-dashed border-amber-300 hover:border-amber-500 bg-amber-50/50 hover:bg-amber-100/60 text-amber-900 text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-2xs"
                >
                  <Users className="w-4 h-4 text-amber-700" />
                  <span>Quản Lý Nhân Sự & Cấp Mật Khẩu (Quản lý)</span>
                </button>
              </div>
            </div>
          )}

          {/* Tab 2: Username & Password */}
          {activeTab === 'credentials' && (
            <form onSubmit={handleSubmitCredentials} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                  Tên tài khoản (Username)
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="quanly hoặc nhanvien"
                    className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-stone-300 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                    autoFocus
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                  Mật khẩu
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Mặc định: 123"
                    className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-stone-300 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 p-1"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-amber-50/70 border border-amber-200 text-xs text-stone-700 space-y-2">
                <span className="font-bold text-amber-900 block flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                  <span>Bấm vào tài khoản dưới đây để điền nhanh:</span>
                </span>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setUsername('admin');
                      setPassword('123');
                      loginWithCredentials('admin', '123');
                      setViewMode('admin');
                      setAdminTab('reports');
                      setIsLoginModalOpen(false);
                    }}
                    className="px-2.5 py-1.5 rounded-lg bg-white hover:bg-amber-100 border border-amber-300 font-mono text-xs font-semibold text-amber-900 transition-colors shadow-2xs cursor-pointer flex items-center gap-1 active:scale-95"
                    title="Bấm để đăng nhập ngay tài khoản admin"
                  >
                    <span>👑 admin (Vào ngay)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setUsername('quanly');
                      setPassword('123');
                      loginWithCredentials('quanly', '123');
                      setViewMode('admin');
                      setAdminTab('reports');
                      setIsLoginModalOpen(false);
                    }}
                    className="px-2.5 py-1.5 rounded-lg bg-white hover:bg-amber-100 border border-amber-300 font-mono text-xs font-semibold text-amber-900 transition-colors shadow-2xs cursor-pointer flex items-center gap-1 active:scale-95"
                    title="Bấm để đăng nhập ngay tài khoản quanly"
                  >
                    <span>👨‍💼 quanly (Vào ngay)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setUsername('nhanvien');
                      setPassword('123');
                      loginWithCredentials('nhanvien', '123');
                      setViewMode('admin');
                      setAdminTab('pos');
                      setIsLoginModalOpen(false);
                    }}
                    className="px-2.5 py-1.5 rounded-lg bg-white hover:bg-blue-100 border border-blue-300 font-mono text-xs font-semibold text-blue-900 transition-colors shadow-2xs cursor-pointer flex items-center gap-1 active:scale-95"
                    title="Bấm để đăng nhập ngay tài khoản nhân viên POS"
                  >
                    <span>👩‍🍳 nhanvien (Vào ngay)</span>
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-sm rounded-xl transition-all shadow-md cursor-pointer flex items-center justify-center gap-2"
              >
                <span>Đăng Nhập Hệ Thống</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}

          {/* Tab 3: Fast 4-Digit PIN */}
          {activeTab === 'pin' && (
            <div className="space-y-4">
              <div className="text-center space-y-2">
                <span className="text-xs text-stone-500">
                  Nhập mã PIN 4 chữ số cá nhân của bạn:
                </span>
                
                {/* PIN Display Dots */}
                <div className="flex items-center justify-center gap-3 py-2">
                  {[0, 1, 2, 3].map((idx) => (
                    <div
                      key={idx}
                      className={`w-4 h-4 rounded-full transition-all ${
                        pin.length > idx
                          ? 'bg-amber-600 scale-110 shadow-sm'
                          : 'bg-stone-200 border border-stone-300'
                      }`}
                    />
                  ))}
                </div>
                <div className="flex items-center justify-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setPin('8888');
                      loginWithPin('8888');
                      setViewMode('admin');
                    }}
                    className="px-3 py-1 bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300 rounded-lg text-xs font-semibold cursor-pointer transition-colors"
                  >
                    👑 Điền nhanh PIN Quản Lý (8888)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setPin('1111');
                      loginWithPin('1111');
                      setViewMode('admin');
                    }}
                    className="px-3 py-1 bg-blue-100 hover:bg-blue-200 text-blue-900 border border-blue-300 rounded-lg text-xs font-semibold cursor-pointer transition-colors"
                  >
                    👩‍🍳 PIN Nhân Viên (1111)
                  </button>
                </div>
              </div>

              {/* Keypad */}
              <div className="grid grid-cols-3 gap-2.5 max-w-xs mx-auto">
                {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => handlePinDigit(d)}
                    className="h-14 rounded-2xl bg-stone-100 hover:bg-amber-100 hover:border-amber-300 border border-stone-200 text-lg font-bold text-stone-800 transition-all cursor-pointer active:scale-95 flex items-center justify-center shadow-xs"
                  >
                    {d}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => setPin('')}
                  className="h-14 rounded-2xl bg-stone-100 hover:bg-stone-200 text-xs font-semibold text-stone-600 transition-all cursor-pointer flex items-center justify-center"
                >
                  Xóa hết
                </button>
                <button
                  type="button"
                  onClick={() => handlePinDigit('0')}
                  className="h-14 rounded-2xl bg-stone-100 hover:bg-amber-100 hover:border-amber-300 border border-stone-200 text-lg font-bold text-stone-800 transition-all cursor-pointer active:scale-95 flex items-center justify-center shadow-xs"
                >
                  0
                </button>
                <button
                  type="button"
                  onClick={handlePinDelete}
                  className="h-14 rounded-2xl bg-stone-100 hover:bg-rose-100 hover:text-rose-700 text-xs font-semibold text-stone-600 transition-all cursor-pointer flex items-center justify-center"
                >
                  ⌫ Xóa
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer info */}
        <div className="bg-stone-50 px-6 py-3.5 border-t border-stone-200 flex items-center justify-between text-[11px] text-stone-500">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Phân quyền POS & Quản Trị Hòn Cau</span>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="hover:text-stone-800 underline cursor-pointer"
          >
            Quay lại xem Menu khách
          </button>
        </div>
      </div>
    </div>
  );
};
