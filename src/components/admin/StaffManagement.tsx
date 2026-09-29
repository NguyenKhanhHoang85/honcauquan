import React, { useState } from 'react';
import { useRestaurant } from '../../context/RestaurantContext';
import { StaffAccount, UserRole } from '../../types/restaurant';
import {
  Users,
  UserPlus,
  KeyRound,
  Lock,
  Edit3,
  Trash2,
  ShieldCheck,
  Search,
  Phone,
  Clock,
  Eye,
  EyeOff,
  AlertTriangle,
  LogIn,
  Check,
  X,
  Sparkles,
  Shield,
  ChefHat
} from 'lucide-react';

const AVATAR_OPTIONS = ['👨‍💼', '👩‍💼', '👩‍🍳', '👨‍🍳', '🧑‍🍳', '🧑‍💼', '🍣', '🦐', '🦀', '🐟', '🍵', '⭐️'];
const SHIFT_OPTIONS = [
  'Ca Sáng (06:00 - 14:00)',
  'Ca Chiều (14:00 - 22:00)',
  'Ca Gãy (10:00 - 14:00 & 17:00 - 21:00)',
  'Toàn thời gian (Full-time)',
  'Bán thời gian (Part-time)'
];

export const StaffManagement: React.FC = () => {
  const {
    staffAccounts,
    currentUser,
    addStaffAccount,
    updateStaffAccount,
    deleteStaffAccount,
    changeUserPasswordOrPin,
    quickLoginRole,
    setAdminTab,
    isCloudConnected
  } = useRestaurant();

  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | 'manager' | 'staff'>('all');
  const [showPasswords, setShowPasswords] = useState<{ [id: string]: boolean }>({});

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<StaffAccount | null>(null);
  const [passwordChangeStaff, setPasswordChangeStaff] = useState<StaffAccount | null>(null);
  const [deletingStaff, setDeletingStaff] = useState<StaffAccount | null>(null);

  // Add form state
  const [formData, setFormData] = useState({
    username: '',
    fullName: '',
    role: 'staff' as UserRole,
    pin: '',
    password: '',
    phone: '',
    avatar: '👩‍🍳',
    shift: 'Ca Sáng (06:00 - 14:00)'
  });

  // Edit form state
  const [editFormData, setEditFormData] = useState({
    username: '',
    fullName: '',
    role: 'staff' as UserRole,
    phone: '',
    avatar: '👨‍💼',
    shift: 'Toàn thời gian (Full-time)'
  });

  // Password / PIN change form state
  const [newPassword, setNewPassword] = useState('');
  const [newPin, setNewPin] = useState('');
  const [modalError, setModalError] = useState<string | null>(null);

  // Toggle password visibility for an account
  const toggleShowPassword = (id: string) => {
    setShowPasswords((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // Open Edit modal with account info
  const handleOpenEdit = (staff: StaffAccount) => {
    setEditingStaff(staff);
    setEditFormData({
      username: staff.username,
      fullName: staff.fullName,
      role: staff.role,
      phone: staff.phone || '',
      avatar: staff.avatar || (staff.role === 'manager' ? '👨‍💼' : '👩‍🍳'),
      shift: staff.shift || 'Toàn thời gian (Full-time)'
    });
    setModalError(null);
  };

  // Open Password/PIN modal
  const handleOpenPasswordChange = (staff: StaffAccount) => {
    setPasswordChangeStaff(staff);
    setNewPassword(staff.password || '');
    setNewPin(staff.pin || '');
    setModalError(null);
  };

  // Submit Add Staff
  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setModalError(null);

    if (!formData.fullName.trim()) {
      setModalError('Vui lòng nhập họ và tên nhân sự.');
      return;
    }
    if (!formData.username.trim()) {
      setModalError('Vui lòng nhập tên đăng nhập.');
      return;
    }
    if (formData.pin && !/^\d{4}$/.test(formData.pin.trim())) {
      setModalError('Mã PIN bắt buộc phải có đúng 4 chữ số (Ví dụ: 1234, 8888).');
      return;
    }

    const res = addStaffAccount({
      username: formData.username.trim(),
      fullName: formData.fullName.trim(),
      role: formData.role,
      pin: formData.pin.trim() || '1111',
      password: formData.password.trim() || '123',
      phone: formData.phone.trim(),
      avatar: formData.avatar,
      shift: formData.shift
    });

    if (res.success) {
      setIsAddModalOpen(false);
      setFormData({
        username: '',
        fullName: '',
        role: 'staff',
        pin: '',
        password: '',
        phone: '',
        avatar: '👩‍🍳',
        shift: 'Ca Sáng (06:00 - 14:00)'
      });
    } else {
      setModalError(res.message || 'Thêm nhân viên thất bại.');
    }
  };

  // Submit Edit Staff
  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStaff) return;
    setModalError(null);

    if (!editFormData.fullName.trim()) {
      setModalError('Họ và tên không được để trống.');
      return;
    }
    if (!editFormData.username.trim()) {
      setModalError('Tên đăng nhập không được để trống.');
      return;
    }

    const res = updateStaffAccount(editingStaff.id, {
      fullName: editFormData.fullName.trim(),
      username: editFormData.username.trim(),
      role: editFormData.role,
      phone: editFormData.phone.trim(),
      avatar: editFormData.avatar,
      shift: editFormData.shift
    });

    if (res.success) {
      setEditingStaff(null);
    } else {
      setModalError(res.message || 'Cập nhật thất bại.');
    }
  };

  // Submit Password / PIN change
  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwordChangeStaff) return;
    setModalError(null);

    if (!newPassword.trim()) {
      setModalError('Mật khẩu không được để trống.');
      return;
    }
    if (!/^\d{4}$/.test(newPin.trim())) {
      setModalError('Mã PIN bảo mật phải gồm đúng 4 chữ số (Ví dụ: 1234, 8888).');
      return;
    }

    const res = changeUserPasswordOrPin(passwordChangeStaff.id, newPassword.trim(), newPin.trim());

    if (res.success) {
      setPasswordChangeStaff(null);
    } else {
      setModalError(res.message || 'Đổi mật khẩu thất bại.');
    }
  };

  // Confirm Delete
  const handleDeleteConfirm = () => {
    if (!deletingStaff) return;
    const res = deleteStaffAccount(deletingStaff.id);
    if (res.success) {
      setDeletingStaff(null);
    } else {
      alert(res.message || 'Không thể xóa tài khoản.');
    }
  };

  // Filtered accounts
  const filteredAccounts = staffAccounts.filter((acc) => {
    const matchSearch =
      acc.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      acc.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (acc.phone && acc.phone.includes(searchTerm));
    const matchRole = roleFilter === 'all' || acc.role === roleFilter;
    return matchSearch && matchRole;
  });

  const totalStaffCount = staffAccounts.length;
  const managerCount = staffAccounts.filter((a) => a.role === 'manager').length;
  const staffRoleCount = staffAccounts.filter((a) => a.role === 'staff').length;

  return (
    <div className="space-y-6">
      {/* Top Banner & Heading */}
      <div className="bg-white rounded-3xl p-6 border border-stone-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-700">
            <Users className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-serif text-2xl font-bold text-stone-900">
                Quản Lý Nhân Sự & Tài Khoản
              </h2>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span>{isCloudConnected ? 'Đồng bộ Đám mây' : 'Lưu trữ máy chủ'}</span>
              </span>
            </div>
            <p className="text-xs text-stone-500 mt-1">
              Quản lý danh sách nhân viên, cấp quyền Quản lý, điều chỉnh ca làm việc và thay đổi mật khẩu / mã PIN bảo mật cho người dùng.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => {
            setFormData({
              username: '',
              fullName: '',
              role: 'staff',
              pin: '',
              password: '123',
              phone: '',
              avatar: '👩‍🍳',
              shift: 'Ca Sáng (06:00 - 14:00)'
            });
            setModalError(null);
            setIsAddModalOpen(true);
          }}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs transition-all shadow-sm cursor-pointer shrink-0"
        >
          <UserPlus className="w-4 h-4" />
          <span>Thêm Nhân Sự Mới</span>
        </button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-stone-100 flex items-center justify-center text-stone-700">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-stone-500 font-medium block">Tổng Số Nhân Sự</span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-stone-900">{totalStaffCount}</span>
              <span className="text-xs text-stone-400">tài khoản</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-amber-200/80 bg-gradient-to-br from-white to-amber-50/30 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center text-amber-800">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-amber-900 font-medium block">Quản Lý (Toàn quyền)</span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-amber-950">{managerCount}</span>
              <span className="text-xs text-amber-700/80">người</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-blue-200/80 bg-gradient-to-br from-white to-blue-50/30 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center text-blue-700">
            <ChefHat className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-blue-900 font-medium block">Nhân Viên Order & Phục Vụ</span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-blue-950">{staffRoleCount}</span>
              <span className="text-xs text-blue-700/80">người</span>
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Tìm theo họ tên, tên đăng nhập, SĐT..."
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-stone-300 text-xs focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
          />
        </div>

        {/* Role Filters */}
        <div className="flex items-center gap-1.5 w-full sm:w-auto">
          <button
            type="button"
            onClick={() => setRoleFilter('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              roleFilter === 'all'
                ? 'bg-stone-900 text-white'
                : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
            }`}
          >
            Tất Cả ({staffAccounts.length})
          </button>
          <button
            type="button"
            onClick={() => setRoleFilter('manager')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              roleFilter === 'manager'
                ? 'bg-amber-500 text-stone-950'
                : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
            }`}
          >
            Quản Lý ({managerCount})
          </button>
          <button
            type="button"
            onClick={() => setRoleFilter('staff')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              roleFilter === 'staff'
                ? 'bg-blue-600 text-white'
                : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
            }`}
          >
            Nhân Viên ({staffRoleCount})
          </button>
        </div>
      </div>

      {/* Staff List Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredAccounts.map((account) => {
          const isCurrent = currentUser?.id === account.id;
          const isManager = account.role === 'manager';
          const isPasswordVisible = !!showPasswords[account.id];

          return (
            <div
              key={account.id}
              className={`bg-white rounded-2xl border p-5 transition-all shadow-xs hover:shadow-md flex flex-col justify-between relative ${
                isCurrent
                  ? 'border-amber-400 ring-2 ring-amber-400/20 bg-amber-50/10'
                  : 'border-stone-200'
              }`}
            >
              {isCurrent && (
                <div className="absolute top-3 right-3">
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                    Đang Đăng Nhập
                  </span>
                </div>
              )}

              <div className="space-y-3.5">
                {/* Header info */}
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-stone-100 border border-stone-200 flex items-center justify-center text-2xl shadow-xs shrink-0">
                    {account.avatar || (isManager ? '👨‍💼' : '👩‍🍳')}
                  </div>

                  <div className="flex-1 pr-14">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <h3 className="font-bold text-sm text-stone-900 leading-tight">
                        {account.fullName}
                      </h3>
                    </div>
                    <span className="text-[11px] font-mono text-stone-500 block mt-0.5">
                      @{account.username}
                    </span>
                    <div className="mt-1">
                      <span
                        className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          isManager
                            ? 'bg-amber-100 text-amber-900 border border-amber-300'
                            : 'bg-blue-100 text-blue-900 border border-blue-300'
                        }`}
                      >
                        {isManager ? <ShieldCheck className="w-3 h-3" /> : <ChefHat className="w-3 h-3" />}
                        <span>{isManager ? 'Quản Lý (Full)' : 'Nhân Viên Order'}</span>
                      </span>
                    </div>
                  </div>
                </div>

                {/* Account Details Box */}
                <div className="bg-stone-50 rounded-xl p-3 border border-stone-100 space-y-2 text-xs">
                  {/* Shift */}
                  <div className="flex items-center justify-between text-stone-600">
                    <span className="flex items-center gap-1.5 text-stone-500">
                      <Clock className="w-3.5 h-3.5 text-stone-400" />
                      <span>Ca làm việc:</span>
                    </span>
                    <span className="font-semibold text-stone-800 text-[11px]">
                      {account.shift || 'Toàn thời gian'}
                    </span>
                  </div>

                  {/* Phone */}
                  <div className="flex items-center justify-between text-stone-600">
                    <span className="flex items-center gap-1.5 text-stone-500">
                      <Phone className="w-3.5 h-3.5 text-stone-400" />
                      <span>Số điện thoại:</span>
                    </span>
                    <span className="font-semibold text-stone-800 text-[11px]">
                      {account.phone || 'Chưa cập nhật'}
                    </span>
                  </div>

                  {/* Password & PIN row */}
                  <div className="pt-2 border-t border-stone-200/70 flex items-center justify-between text-stone-600">
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] text-stone-500">Mật khẩu:</span>
                      <span className="font-mono font-bold text-[11px] text-stone-900 bg-white px-1.5 py-0.5 rounded border border-stone-200">
                        {isPasswordVisible ? (account.password || '123') : '••••••'}
                      </span>
                      <button
                        type="button"
                        onClick={() => toggleShowPassword(account.id)}
                        className="text-stone-400 hover:text-stone-700 p-0.5"
                        title={isPasswordVisible ? 'Ẩn mật khẩu' : 'Xem mật khẩu'}
                      >
                        {isPasswordVisible ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <span className="text-[11px] text-stone-500">PIN:</span>
                      <span className="font-mono font-bold text-[11px] text-amber-800 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                        {account.pin || '1111'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 mt-3 border-t border-stone-100 flex flex-col gap-2">
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => handleOpenEdit(account)}
                    className="py-1.5 px-2.5 rounded-lg border border-stone-300 hover:bg-stone-100 text-stone-700 text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Edit3 className="w-3.5 h-3.5 text-stone-500" />
                    <span>Sửa Thông Tin</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleOpenPasswordChange(account)}
                    className="py-1.5 px-2.5 rounded-lg bg-amber-50 hover:bg-amber-100 border border-amber-300 text-amber-900 text-xs font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <KeyRound className="w-3.5 h-3.5 text-amber-700" />
                    <span>Đổi Mật Khẩu</span>
                  </button>
                </div>

                <div className="flex items-center justify-between gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      quickLoginRole(account.role);
                      if (account.role === 'staff') {
                        setAdminTab('pos');
                      }
                    }}
                    className="text-[11px] font-semibold text-stone-500 hover:text-stone-900 flex items-center gap-1 hover:underline cursor-pointer"
                    title="Chuyển sang đăng nhập vai trò này để kiểm tra"
                  >
                    <LogIn className="w-3.5 h-3.5" />
                    <span>Đăng nhập thử</span>
                  </button>

                  {/* Delete button (disabled for self or last manager) */}
                  {!isCurrent && (
                    <button
                      type="button"
                      onClick={() => setDeletingStaff(account)}
                      className="text-[11px] font-semibold text-rose-600 hover:text-rose-800 flex items-center gap-1 p-1 hover:bg-rose-50 rounded transition-colors cursor-pointer"
                      title="Xóa tài khoản nhân sự này"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Xóa</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredAccounts.length === 0 && (
        <div className="bg-white rounded-3xl border border-stone-200 p-12 text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-stone-100 flex items-center justify-center mx-auto text-stone-400">
            <Search className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-stone-800 text-base">Không tìm thấy nhân sự phù hợp</h3>
          <p className="text-xs text-stone-500">
            Hãy thử tìm bằng từ khóa khác hoặc xóa bộ lọc để xem đầy đủ danh sách.
          </p>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 1: THÊM NHÂN SỰ MỚI                                */}
      {/* ========================================================= */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-stone-950/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-stone-200 overflow-hidden my-6">
            <div className="bg-gradient-to-r from-stone-900 via-stone-850 to-stone-900 text-white p-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
                  <UserPlus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-serif text-lg font-bold text-white">Thêm Nhân Sự Mới</h3>
                  <p className="text-[11px] text-stone-300">Tạo tài khoản phân quyền cho nhân viên hoặc quản lý</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="text-stone-400 hover:text-white p-1 rounded-lg hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              {modalError && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-xl flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
                  <span>{modalError}</span>
                </div>
              )}

              {/* Role Selection */}
              <div>
                <label className="block text-xs font-bold text-stone-800 mb-1.5">
                  Vai trò công việc <span className="text-rose-500">*</span>
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, role: 'staff', avatar: '👩‍🍳' })}
                    className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                      formData.role === 'staff'
                        ? 'border-blue-600 bg-blue-50/50 ring-2 ring-blue-500/20'
                        : 'border-stone-200 hover:bg-stone-50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-stone-900 flex items-center gap-1.5">
                        <ChefHat className="w-3.5 h-3.5 text-blue-600" />
                        <span>Nhân Viên (Staff)</span>
                      </span>
                      {formData.role === 'staff' && <Check className="w-4 h-4 text-blue-600" />}
                    </div>
                    <span className="text-[11px] text-stone-500 block mt-1">
                      Order bàn, xem sơ đồ bàn và bếp
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, role: 'manager', avatar: '👨‍💼' })}
                    className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                      formData.role === 'manager'
                        ? 'border-amber-500 bg-amber-50/50 ring-2 ring-amber-500/20'
                        : 'border-stone-200 hover:bg-stone-50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-stone-900 flex items-center gap-1.5">
                        <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
                        <span>Quản Lý (Manager)</span>
                      </span>
                      {formData.role === 'manager' && <Check className="w-4 h-4 text-amber-600" />}
                    </div>
                    <span className="text-[11px] text-stone-500 block mt-1">
                      Toàn quyền báo cáo, thực đơn, nhân sự
                    </span>
                  </button>
                </div>
              </div>

              {/* Full Name */}
              <div>
                <label className="block text-xs font-bold text-stone-800 mb-1">
                  Họ và tên nhân sự <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Hoàng Nhật Nam"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                />
              </div>

              {/* Username */}
              <div>
                <label className="block text-xs font-bold text-stone-800 mb-1">
                  Tên đăng nhập (Username) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: namhoang, linhlinh (viết liền không dấu)"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value.toLowerCase().replace(/\s+/g, '') })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                />
                <span className="text-[10px] text-stone-400 mt-1 block">Dùng để đăng nhập vào hệ thống Hòn Cau Quán</span>
              </div>

              {/* Password & PIN Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-stone-800 mb-1">
                    Mật khẩu đăng nhập
                  </label>
                  <input
                    type="text"
                    placeholder="Mặc định: 123"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-800 mb-1">
                    Mã PIN 4 số (Bàn phím cảm ứng)
                  </label>
                  <input
                    type="text"
                    maxLength={4}
                    placeholder="Ví dụ: 2468"
                    value={formData.pin}
                    onChange={(e) => setFormData({ ...formData, pin: e.target.value.replace(/\D/g, '').slice(0, 4) })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs font-mono tracking-widest text-center focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                  />
                </div>
              </div>

              {/* Phone & Shift Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-stone-800 mb-1">
                    Số điện thoại
                  </label>
                  <input
                    type="tel"
                    placeholder="Ví dụ: 0912 345 678"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-800 mb-1">
                    Ca làm việc
                  </label>
                  <select
                    value={formData.shift}
                    onChange={(e) => setFormData({ ...formData, shift: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl border border-stone-300 text-xs focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 bg-white"
                  >
                    {SHIFT_OPTIONS.map((sh) => (
                      <option key={sh} value={sh}>{sh}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Avatar Picker */}
              <div>
                <label className="block text-xs font-bold text-stone-800 mb-1.5">
                  Biểu tượng nhân sự
                </label>
                <div className="flex flex-wrap gap-2">
                  {AVATAR_OPTIONS.map((emoji) => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => setFormData({ ...formData, avatar: emoji })}
                      className={`w-9 h-9 rounded-xl text-lg flex items-center justify-center border transition-all cursor-pointer ${
                        formData.avatar === emoji
                          ? 'border-amber-500 bg-amber-50 scale-110 shadow-xs'
                          : 'border-stone-200 hover:bg-stone-50'
                      }`}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>

              {/* Form Buttons */}
              <div className="pt-3 border-t border-stone-200 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-stone-300 text-stone-700 text-xs font-semibold hover:bg-stone-50 cursor-pointer"
                >
                  Hủy Bỏ
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs shadow-md transition-colors cursor-pointer"
                >
                  Tạo Tài Khoản
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 2: SỬA THÔNG TIN NHÂN SỰ                           */}
      {/* ========================================================= */}
      {editingStaff && (
        <div className="fixed inset-0 z-50 bg-stone-950/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-stone-200 overflow-hidden my-6">
            <div className="bg-stone-900 text-white p-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
                  <Edit3 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-serif text-lg font-bold text-white">Chỉnh Sửa Thông Tin Nhân Sự</h3>
                  <p className="text-[11px] text-stone-300">Tài khoản: @{editingStaff.username}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setEditingStaff(null)}
                className="text-stone-400 hover:text-white p-1 rounded-lg hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              {modalError && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-xl flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
                  <span>{modalError}</span>
                </div>
              )}

              {/* Role Selection */}
              <div>
                <label className="block text-xs font-bold text-stone-800 mb-1.5">
                  Vai trò hệ thống
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setEditFormData({ ...editFormData, role: 'staff' })}
                    className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                      editFormData.role === 'staff'
                        ? 'border-blue-600 bg-blue-50/50 ring-2 ring-blue-500/20'
                        : 'border-stone-200 hover:bg-stone-50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-stone-900 flex items-center gap-1.5">
                        <ChefHat className="w-3.5 h-3.5 text-blue-600" />
                        <span>Nhân Viên (Staff)</span>
                      </span>
                      {editFormData.role === 'staff' && <Check className="w-4 h-4 text-blue-600" />}
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setEditFormData({ ...editFormData, role: 'manager' })}
                    className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                      editFormData.role === 'manager'
                        ? 'border-amber-500 bg-amber-50/50 ring-2 ring-amber-500/20'
                        : 'border-stone-200 hover:bg-stone-50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-stone-900 flex items-center gap-1.5">
                        <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
                        <span>Quản Lý (Manager)</span>
                      </span>
                      {editFormData.role === 'manager' && <Check className="w-4 h-4 text-amber-600" />}
                    </div>
                  </button>
                </div>
              </div>

              {/* Full Name */}
              <div>
                <label className="block text-xs font-bold text-stone-800 mb-1">
                  Họ và tên
                </label>
                <input
                  type="text"
                  required
                  value={editFormData.fullName}
                  onChange={(e) => setEditFormData({ ...editFormData, fullName: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                />
              </div>

              {/* Username */}
              <div>
                <label className="block text-xs font-bold text-stone-800 mb-1">
                  Tên đăng nhập (Username)
                </label>
                <input
                  type="text"
                  required
                  value={editFormData.username}
                  onChange={(e) => setEditFormData({ ...editFormData, username: e.target.value.toLowerCase().replace(/\s+/g, '') })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                />
              </div>

              {/* Phone & Shift */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-stone-800 mb-1">
                    Số điện thoại
                  </label>
                  <input
                    type="tel"
                    value={editFormData.phone}
                    onChange={(e) => setEditFormData({ ...editFormData, phone: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-800 mb-1">
                    Ca làm việc
                  </label>
                  <select
                    value={editFormData.shift}
                    onChange={(e) => setEditFormData({ ...editFormData, shift: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl border border-stone-300 text-xs focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 bg-white"
                  >
                    {SHIFT_OPTIONS.map((sh) => (
                      <option key={sh} value={sh}>{sh}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Avatar */}
              <div>
                <label className="block text-xs font-bold text-stone-800 mb-1.5">
                  Biểu tượng nhân sự
                </label>
                <div className="flex flex-wrap gap-2">
                  {AVATAR_OPTIONS.map((emoji) => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => setEditFormData({ ...editFormData, avatar: emoji })}
                      className={`w-9 h-9 rounded-xl text-lg flex items-center justify-center border transition-all cursor-pointer ${
                        editFormData.avatar === emoji
                          ? 'border-amber-500 bg-amber-50 scale-110 shadow-xs'
                          : 'border-stone-200 hover:bg-stone-50'
                      }`}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>

              {/* Buttons */}
              <div className="pt-3 border-t border-stone-200 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setEditingStaff(null)}
                  className="px-4 py-2.5 rounded-xl border border-stone-300 text-stone-700 text-xs font-semibold hover:bg-stone-50 cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs shadow-md transition-colors cursor-pointer"
                >
                  Lưu Thay Đổi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 3: ĐỔI MẬT KHẨU & MÃ PIN (Yêu cầu chính của khách)  */}
      {/* ========================================================= */}
      {passwordChangeStaff && (
        <div className="fixed inset-0 z-50 bg-stone-950/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl border border-stone-200 overflow-hidden my-6">
            <div className="bg-gradient-to-r from-amber-600 to-amber-700 text-white p-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center text-white">
                  <KeyRound className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-serif text-lg font-bold text-white">Đổi Mật Khẩu & Mã PIN</h3>
                  <p className="text-[11px] text-amber-100">Cấp lại quyền đăng nhập cho người dùng</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setPasswordChangeStaff(null)}
                className="text-white/70 hover:text-white p-1 rounded-lg hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handlePasswordSubmit} className="p-6 space-y-4">
              {modalError && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-xl flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
                  <span>{modalError}</span>
                </div>
              )}

              {/* Target User Info Banner */}
              <div className="p-3 rounded-2xl bg-stone-50 border border-stone-200 flex items-center gap-3">
                <span className="text-2xl">{passwordChangeStaff.avatar || '👤'}</span>
                <div>
                  <div className="font-bold text-xs text-stone-900 flex items-center gap-1.5">
                    <span>{passwordChangeStaff.fullName}</span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded font-semibold bg-stone-200 text-stone-700">
                      @{passwordChangeStaff.username}
                    </span>
                  </div>
                  <span className="text-[11px] text-stone-500">
                    Vai trò: {passwordChangeStaff.role === 'manager' ? 'Quản Lý' : 'Nhân Viên Order'}
                  </span>
                </div>
              </div>

              {/* New Password */}
              <div>
                <label className="block text-xs font-bold text-stone-800 mb-1">
                  Mật khẩu đăng nhập mới <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    placeholder="Nhập mật khẩu mới..."
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-stone-300 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                    autoFocus
                  />
                </div>
                <div className="flex items-center justify-between text-[11px] text-stone-500 mt-1">
                  <span>Gợi ý:</span>
                  <div className="flex gap-1.5">
                    <button
                      type="button"
                      onClick={() => setNewPassword('123456')}
                      className="text-amber-700 hover:underline font-mono"
                    >
                      123456
                    </button>
                    <span>·</span>
                    <button
                      type="button"
                      onClick={() => setNewPassword('honcau@2025')}
                      className="text-amber-700 hover:underline font-mono"
                    >
                      honcau@2025
                    </button>
                  </div>
                </div>
              </div>

              {/* New PIN */}
              <div>
                <label className="block text-xs font-bold text-stone-800 mb-1">
                  Mã PIN 4 số đăng nhập POS <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  maxLength={4}
                  placeholder="Ví dụ: 1234 hoặc 8888"
                  value={newPin}
                  onChange={(e) => setNewPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-base font-mono tracking-widest text-center focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 font-bold text-stone-900"
                />
                <span className="text-[11px] text-stone-400 text-center block mt-1">
                  Dùng để nhân viên nhập nhanh bằng màn hình cảm ứng tại quầy POS
                </span>
              </div>

              {/* Buttons */}
              <div className="pt-3 border-t border-stone-200 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setPasswordChangeStaff(null)}
                  className="px-4 py-2.5 rounded-xl border border-stone-300 text-stone-700 text-xs font-semibold hover:bg-stone-50 cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs shadow-md transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <KeyRound className="w-3.5 h-3.5" />
                  <span>Lưu Mật Khẩu & PIN</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 4: XÁC NHẬN XÓA TÀI KHOẢN                           */}
      {/* ========================================================= */}
      {deletingStaff && (
        <div className="fixed inset-0 z-50 bg-stone-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-sm rounded-3xl shadow-2xl border border-stone-200 p-6 text-center space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-7 h-7" />
            </div>

            <div>
              <h3 className="font-serif text-lg font-bold text-stone-900">
                Xóa Tài Khoản Nhân Sự?
              </h3>
              <p className="text-xs text-stone-500 mt-1">
                Bạn có chắc muốn xóa nhân sự <strong>{deletingStaff.fullName}</strong> (@{deletingStaff.username}) khỏi hệ thống Hòn Cau Quán?
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setDeletingStaff(null)}
                className="py-2.5 px-4 rounded-xl border border-stone-300 text-stone-700 text-xs font-semibold hover:bg-stone-50 cursor-pointer"
              >
                Hủy Bỏ
              </button>
              <button
                type="button"
                onClick={handleDeleteConfirm}
                className="py-2.5 px-4 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-sm transition-colors cursor-pointer"
              >
                Xác Nhận Xóa
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
