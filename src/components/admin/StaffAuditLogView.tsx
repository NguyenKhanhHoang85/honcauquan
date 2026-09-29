import React, { useState } from 'react';
import { useRestaurant } from '../../context/RestaurantContext';
import { StaffAuditLog } from '../../types/restaurant';
import { formatDateTime } from '../../utils/formatters';
import { 
  History, 
  Search, 
  Filter, 
  UserCheck, 
  Utensils, 
  ShoppingBag, 
  Tag, 
  CreditCard, 
  Settings, 
  Users,
  ShieldAlert,
  ArrowDownUp,
  FileSpreadsheet
} from 'lucide-react';

const ACTION_TYPE_CONFIG: Record<string, { label: string; bg: string; text: string; icon: any }> = {
  menu_add: { label: 'Thêm Món Mới', bg: 'bg-emerald-100', text: 'text-emerald-800', icon: Utensils },
  menu_edit: { label: 'Sửa Thông Tin Món', bg: 'bg-blue-100', text: 'text-blue-800', icon: Utensils },
  menu_delete: { label: 'Xóa Món', bg: 'bg-rose-100', text: 'text-rose-800', icon: Utensils },
  menu_toggle: { label: 'Bật / Tắt Hết Hàng', bg: 'bg-amber-100', text: 'text-amber-800', icon: Tag },
  order_create: { label: 'Tạo Đơn Hàng', bg: 'bg-indigo-100', text: 'text-indigo-800', icon: ShoppingBag },
  order_add_item: { label: 'Gọi Thêm Món', bg: 'bg-purple-100', text: 'text-purple-800', icon: ShoppingBag },
  order_discount: { label: 'Áp Dụng Giảm Giá', bg: 'bg-pink-100', text: 'text-pink-800', icon: Tag },
  order_status: { label: 'Đổi Trạng Thái Đơn', bg: 'bg-cyan-100', text: 'text-cyan-800', icon: History },
  order_pay: { label: 'Xác Nhận Thanh Toán', bg: 'bg-emerald-100', text: 'text-emerald-800', icon: CreditCard },
  table_change: { label: 'Thay Đổi Bàn', bg: 'bg-stone-100', text: 'text-stone-800', icon: History },
  settings_update: { label: 'Cập Nhật Cài Đặt', bg: 'bg-amber-100', text: 'text-amber-800', icon: Settings },
  staff_manage: { label: 'Quản Lý Tài Khoản', bg: 'bg-rose-100', text: 'text-rose-800', icon: Users },
};

export const StaffAuditLogView: React.FC = () => {
  const { auditLogs, staffAccounts, showToast } = useRestaurant();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStaff, setSelectedStaff] = useState<string>('all');
  const [selectedActionGroup, setSelectedActionGroup] = useState<string>('all');

  const filteredLogs = auditLogs.filter((log) => {
    const matchSearch =
      !searchQuery.trim() ||
      log.details.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.staffName.toLowerCase().includes(searchQuery.toLowerCase());

    const matchStaff =
      selectedStaff === 'all' || log.staffName === selectedStaff;

    const matchAction =
      selectedActionGroup === 'all' ||
      (selectedActionGroup === 'menu' && log.actionType.startsWith('menu_')) ||
      (selectedActionGroup === 'order' && log.actionType.startsWith('order_')) ||
      (selectedActionGroup === 'settings' && (log.actionType === 'settings_update' || log.actionType === 'staff_manage'));

    return matchSearch && matchStaff && matchAction;
  });

  const handleExportLogs = () => {
    let csvContent = '\uFEFF'; // UTF-8 BOM
    csvContent += 'NHẬT KÝ HOẠT ĐỘNG NHÂN VIÊN & QUẢN LÝ - HÒN CAU QUÁN\n';
    csvContent += `Thời gian xuất: ${new Date().toLocaleString('vi-VN')}\n\n`;
    csvContent += 'Thời Gian,Người Thực Hiện,Vai Trò,Hành Động,Chi Tiết Thay Đổi\n';

    filteredLogs.forEach((l) => {
      const cfg = ACTION_TYPE_CONFIG[l.actionType] || { label: l.actionType };
      csvContent += `"${new Date(l.timestamp).toLocaleString('vi-VN')}","${l.staffName}","${l.staffRole === 'manager' ? 'Quản Lý' : 'Nhân Viên'}","${cfg.label}","${l.details.replace(/"/g, '""')}"\n`;
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Nhat_Ky_Hoat_Dong_Nhan_Vien_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Đã xuất lịch sử hoạt động ra file Excel / CSV');
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-700">
            <History className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-serif text-xl font-bold text-stone-900">
                Nhật Ký Hoạt Động & Lịch Sử Thao Tác
              </h2>
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">
                Audit Trail ({filteredLogs.length} ghi nhận)
              </span>
            </div>
            <p className="text-xs text-stone-500 mt-0.5">
              Theo dõi toàn bộ lịch sử thêm, sửa, xóa món, tạo đơn, gọi thêm món và xác nhận thanh toán của từng nhân viên.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleExportLogs}
          className="px-4 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs shadow-xs flex items-center gap-2 transition-colors cursor-pointer shrink-0"
        >
          <FileSpreadsheet className="w-4 h-4" />
          <span>Xuất File Excel</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-2">
          {/* Action category filter */}
          <div className="flex items-center bg-stone-100 p-1 rounded-xl">
            <button
              onClick={() => setSelectedActionGroup('all')}
              className={`px-3 py-1.5 rounded-lg font-medium cursor-pointer transition-colors ${
                selectedActionGroup === 'all' ? 'bg-white text-stone-900 font-bold shadow-xs' : 'text-stone-600'
              }`}
            >
              Tất cả hoạt động
            </button>
            <button
              onClick={() => setSelectedActionGroup('menu')}
              className={`px-3 py-1.5 rounded-lg font-medium cursor-pointer transition-colors ${
                selectedActionGroup === 'menu' ? 'bg-white text-stone-900 font-bold shadow-xs' : 'text-stone-600'
              }`}
            >
              Thao tác Món Ăn
            </button>
            <button
              onClick={() => setSelectedActionGroup('order')}
              className={`px-3 py-1.5 rounded-lg font-medium cursor-pointer transition-colors ${
                selectedActionGroup === 'order' ? 'bg-white text-stone-900 font-bold shadow-xs' : 'text-stone-600'
              }`}
            >
              Đơn hàng & Thu tiền
            </button>
            <button
              onClick={() => setSelectedActionGroup('settings')}
              className={`px-3 py-1.5 rounded-lg font-medium cursor-pointer transition-colors ${
                selectedActionGroup === 'settings' ? 'bg-white text-stone-900 font-bold shadow-xs' : 'text-stone-600'
              }`}
            >
              Cài đặt & Nhân sự
            </button>
          </div>

          {/* Staff filter */}
          <select
            value={selectedStaff}
            onChange={(e) => setSelectedStaff(e.target.value)}
            className="px-3 py-1.5 bg-stone-50 border border-stone-200 rounded-xl font-medium text-stone-700 cursor-pointer focus:outline-none"
          >
            <option value="all">Tất cả nhân viên</option>
            {staffAccounts.map((s) => (
              <option key={s.id} value={s.fullName}>
                {s.fullName} ({s.role === 'manager' ? 'Quản lý' : 'Nhân viên'})
              </option>
            ))}
          </select>
        </div>

        {/* Search */}
        <div className="relative w-full md:w-64">
          <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm theo nội dung hoặc nhân viên..."
            className="w-full pl-9 pr-3 py-1.5 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/20"
          />
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-white rounded-2xl border border-stone-200 shadow-xs overflow-hidden">
        {filteredLogs.length === 0 ? (
          <div className="p-12 text-center text-stone-400 space-y-2">
            <History className="w-10 h-10 mx-auto opacity-30" />
            <p className="text-sm font-semibold">Chưa có nhật ký hoạt động nào phù hợp.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-stone-50 border-b border-stone-200 text-stone-600 uppercase text-[10px] tracking-wider font-bold">
                <tr>
                  <th className="py-3 px-4">Thời Gian</th>
                  <th className="py-3 px-4">Nhân Sự Thực Hiện</th>
                  <th className="py-3 px-4">Loại Hành Động</th>
                  <th className="py-3 px-4">Nội Dung Chi Tiết</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {filteredLogs.map((log) => {
                  const cfg = ACTION_TYPE_CONFIG[log.actionType] || {
                    label: log.actionType,
                    bg: 'bg-stone-100',
                    text: 'text-stone-800',
                    icon: History,
                  };
                  const Icon = cfg.icon;

                  return (
                    <tr key={log.id} className="hover:bg-stone-50/80 transition-colors">
                      <td className="py-3 px-4 text-stone-500 font-mono whitespace-nowrap">
                        {formatDateTime(log.timestamp)}
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-stone-900">{log.staffName}</span>
                          <span
                            className={`text-[9px] font-bold px-1.5 py-0.2 rounded ${
                              log.staffRole === 'manager'
                                ? 'bg-amber-100 text-amber-900'
                                : 'bg-blue-100 text-blue-900'
                            }`}
                          >
                            {log.staffRole === 'manager' ? 'Quản lý' : 'Nhân viên'}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold ${cfg.bg} ${cfg.text}`}
                        >
                          <Icon className="w-3 h-3" />
                          <span>{cfg.label}</span>
                        </span>
                      </td>
                      <td className="py-3 px-4 text-stone-700 font-medium leading-relaxed">
                        {log.details}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
