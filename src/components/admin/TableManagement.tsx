import React, { useState } from 'react';
import { useRestaurant } from '../../context/RestaurantContext';
import { RestaurantTable, TableStatus, TableArea } from '../../types/restaurant';
import { formatVND } from '../../utils/formatters';
import { 
  Users, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  QrCode, 
  FileText, 
  Plus, 
  Utensils, 
  Sparkles,
  Layers,
  Edit2,
  Trash2,
  X,
  ShoppingBag
} from 'lucide-react';

const STATUS_LABELS: Record<TableStatus, { label: string; bg: string; text: string; border: string }> = {
  available: { label: 'Bàn Trống', bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
  occupied: { label: 'Đang Phục Vụ', bg: 'bg-amber-50', text: 'text-amber-800', border: 'border-amber-300' },
  reserved: { label: 'Đã Đặt Trước', bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200' },
  billing: { label: 'Chờ Thanh Toán', bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-300' },
};

const AREAS: TableArea[] = [
  'Sân vườn biển',
  'Trong nhà máy lạnh',
  'Sân thượng hoàng hôn',
  'Phòng VIP Hòn Cau',
];

export const TableManagement: React.FC = () => {
  const { 
    tables, 
    addTable,
    updateTable,
    deleteTable,
    updateTableStatus, 
    clearTable, 
    orders, 
    setActivePaymentOrder, 
    setActiveReceiptOrder,
    setAdminTab,
    setPrefillPosTableId,
    currentUser
  } = useRestaurant();

  const isManager = currentUser?.role === 'manager';

  const [selectedArea, setSelectedArea] = useState<TableArea | 'Tất cả'>('Tất cả');
  const [filterStatus, setFilterStatus] = useState<TableStatus | 'all'>('all');

  // Modal to seat guests
  const [seatingTable, setSeatingTable] = useState<RestaurantTable | null>(null);
  const [guestsInput, setGuestsInput] = useState(4);

  // Modal to Add / Edit Table
  const [isTableModalOpen, setIsTableModalOpen] = useState(false);
  const [editingTable, setEditingTable] = useState<RestaurantTable | null>(null);
  const [tableName, setTableName] = useState('');
  const [tableNumber, setTableNumber] = useState<number>(1);
  const [tableArea, setTableArea] = useState<TableArea>('Sân vườn biển');
  const [tableCapacity, setTableCapacity] = useState<number>(4);

  const filteredTables = tables.filter((tbl) => {
    const matchArea = selectedArea === 'Tất cả' || tbl.area === selectedArea;
    const matchStatus = filterStatus === 'all' || tbl.status === filterStatus;
    return matchArea && matchStatus;
  });

  const availableCount = tables.filter((t) => t.status === 'available').length;
  const occupiedCount = tables.filter((t) => t.status === 'occupied').length;
  const billingCount = tables.filter((t) => t.status === 'billing').length;
  const reservedCount = tables.filter((t) => t.status === 'reserved').length;
  const occupancyRate = tables.length > 0 ? Math.round((occupiedCount / tables.length) * 100) : 0;

  const handleOpenSeatModal = (tbl: RestaurantTable) => {
    setSeatingTable(tbl);
    setGuestsInput(Math.min(tbl.capacity, 4));
  };

  const handleConfirmSeat = () => {
    if (seatingTable) {
      updateTableStatus(seatingTable.id, 'occupied', guestsInput);
      setSeatingTable(null);
    }
  };

  const handleOpenAddTable = () => {
    setEditingTable(null);
    const nextNum = tables.length + 1;
    setTableNumber(nextNum);
    setTableName(`Bàn ${String(nextNum).padStart(2, '0')}`);
    setTableArea('Sân vườn biển');
    setTableCapacity(4);
    setIsTableModalOpen(true);
  };

  const handleOpenEditTable = (tbl: RestaurantTable) => {
    setEditingTable(tbl);
    setTableNumber(tbl.tableNumber);
    setTableName(tbl.name);
    setTableArea(tbl.area);
    setTableCapacity(tbl.capacity);
    setIsTableModalOpen(true);
  };

  const handleSaveTable = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tableName.trim()) return;

    if (editingTable) {
      updateTable(editingTable.id, {
        name: tableName.trim(),
        tableNumber,
        area: tableArea,
        capacity: tableCapacity,
      });
    } else {
      addTable({
        name: tableName.trim(),
        tableNumber,
        area: tableArea,
        capacity: tableCapacity,
      });
    }

    setIsTableModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Top Status Indicators */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-xs">
          <span className="text-xs text-stone-500 block">Tổng số bàn</span>
          <span className="text-2xl font-extrabold text-stone-900 font-mono tabular-nums">
            {tables.length}
          </span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-emerald-100 shadow-xs">
          <span className="text-xs text-emerald-700 block">Bàn trống</span>
          <span className="text-2xl font-extrabold text-emerald-800 font-mono tabular-nums">
            {availableCount}
          </span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-amber-100 shadow-xs">
          <span className="text-xs text-amber-700 block">Đang phục vụ</span>
          <span className="text-2xl font-extrabold text-amber-800 font-mono tabular-nums">
            {occupiedCount}
          </span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-rose-100 shadow-xs">
          <span className="text-xs text-rose-700 block">Chờ thanh toán</span>
          <span className="text-2xl font-extrabold text-rose-800 font-mono tabular-nums">
            {billingCount}
          </span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-xs col-span-2 sm:col-span-1">
          <span className="text-xs text-stone-500 block">Tỷ lệ lấp đầy</span>
          <span className="text-2xl font-extrabold text-stone-900 font-mono tabular-nums">
            {occupancyRate}%
          </span>
        </div>
      </div>

      {/* Area & Filter Tabs + Add Table Button */}
      <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          {/* Area switcher */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
            <button
              onClick={() => setSelectedArea('Tất cả')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all cursor-pointer ${
                selectedArea === 'Tất cả'
                  ? 'bg-stone-900 text-white font-semibold'
                  : 'bg-stone-100 text-stone-600 hover:bg-stone-200/80'
              }`}
            >
              Tất cả khu vực
            </button>
            {AREAS.map((ar) => (
              <button
                key={ar}
                onClick={() => setSelectedArea(ar)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all cursor-pointer ${
                  selectedArea === ar
                    ? 'bg-stone-900 text-white font-semibold'
                    : 'bg-stone-100 text-stone-600 hover:bg-stone-200/80'
                }`}
              >
                {ar}
              </button>
            ))}
          </div>

          {/* Right Action: Add Table (Manager) & Status filter */}
          <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
            <div className="flex items-center gap-1 text-xs">
              <button
                onClick={() => setFilterStatus('all')}
                className={`px-2.5 py-1 rounded text-[11px] font-medium transition-colors cursor-pointer ${
                  filterStatus === 'all' ? 'bg-amber-100 text-amber-900 font-bold' : 'text-stone-500 hover:text-stone-900'
                }`}
              >
                Tất cả
              </button>
              <button
                onClick={() => setFilterStatus('occupied')}
                className={`px-2.5 py-1 rounded text-[11px] font-medium transition-colors cursor-pointer ${
                  filterStatus === 'occupied' ? 'bg-amber-100 text-amber-900 font-bold' : 'text-stone-500 hover:text-stone-900'
                }`}
              >
                Có khách
              </button>
              <button
                onClick={() => setFilterStatus('available')}
                className={`px-2.5 py-1 rounded text-[11px] font-medium transition-colors cursor-pointer ${
                  filterStatus === 'available' ? 'bg-emerald-100 text-emerald-900 font-bold' : 'text-stone-500 hover:text-stone-900'
                }`}
              >
                Trống
              </button>
            </div>

            {isManager && (
              <button
                type="button"
                onClick={handleOpenAddTable}
                className="px-3 py-1.5 bg-stone-900 hover:bg-stone-800 text-white font-semibold text-xs rounded-xl flex items-center gap-1.5 shadow-2xs cursor-pointer shrink-0"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Thêm Bàn</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Grid of Tables */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredTables.map((tbl) => {
          const cfg = STATUS_LABELS[tbl.status];
          const activeOrder = orders.find(
            (o) => o.tableId === tbl.id && o.orderStatus !== 'completed' && o.orderStatus !== 'cancelled'
          );

          return (
            <div
              key={tbl.id}
              className={`bg-white rounded-2xl border ${cfg.border} p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-4 relative`}
            >
              {/* Header */}
              <div>
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-bold text-base text-stone-900 font-serif flex items-center gap-2">
                      <span>{tbl.name}</span>
                      {isManager && (
                        <button
                          type="button"
                          onClick={() => handleOpenEditTable(tbl)}
                          className="text-stone-400 hover:text-amber-800 p-0.5 cursor-pointer"
                          title="Sửa cấu hình bàn"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </h4>
                    <span className="text-[11px] text-stone-500">
                      {tbl.area}
                    </span>
                  </div>

                  <span className={`text-[11px] font-bold px-2 py-0.5 rounded-md border ${cfg.bg} ${cfg.text} ${cfg.border}`}>
                    {cfg.label}
                  </span>
                </div>

                <div className="flex items-center gap-3 text-xs text-stone-500 mt-3 pt-2 border-t border-stone-100">
                  <div className="flex items-center gap-1">
                    <Users className="w-3.5 h-3.5 text-stone-400" />
                    <span>Sức chứa: {tbl.capacity} người</span>
                  </div>
                  {tbl.seatedAt && (
                    <div className="flex items-center gap-1 text-stone-600 font-mono">
                      <Clock className="w-3.5 h-3.5 text-amber-600" />
                      <span>{tbl.seatedAt}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Active Order Details */}
              {activeOrder && (
                <div className="bg-stone-50 p-3 rounded-xl border border-stone-200/80 text-xs space-y-1.5">
                  <div className="flex items-center justify-between font-medium">
                    <span className="text-stone-700 font-bold">Đơn #{activeOrder.orderCode}</span>
                    <span className="font-extrabold text-amber-900 font-mono tabular-nums">
                      {formatVND(activeOrder.finalAmount)}
                    </span>
                  </div>
                  <div className="text-[11px] text-stone-500 truncate">
                    {activeOrder.items.map((i) => `${i.name} (x${i.quantity})`).join(', ')}
                  </div>
                  <div className="flex items-center justify-between text-[11px] pt-1">
                    <span className="text-stone-400">Khách: {activeOrder.customerName}</span>
                    <span className={`font-semibold ${activeOrder.paymentStatus === 'paid' ? 'text-emerald-700' : 'text-amber-700'}`}>
                      {activeOrder.paymentStatus === 'paid' ? 'Đã Thanh Toán' : 'Chưa TT'}
                    </span>
                  </div>
                </div>
              )}

              {/* Actions Footer */}
              <div className="pt-2 border-t border-stone-100 flex flex-wrap items-center gap-2">
                {tbl.status === 'available' && (
                  <>
                    <button
                      type="button"
                      onClick={() => {
                        setPrefillPosTableId(tbl.id);
                        setAdminTab('pos');
                      }}
                      className="flex-1 py-1.5 px-3 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold rounded-lg text-xs transition-colors cursor-pointer text-center flex items-center justify-center gap-1.5 shadow-2xs"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Mở Gọi Món (POS)</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleOpenSeatModal(tbl)}
                      className="py-1.5 px-2 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-lg text-xs font-semibold cursor-pointer"
                      title="Chỉ xếp khách vào chỗ trước"
                    >
                      Xếp Chỗ
                    </button>
                  </>
                )}

                {tbl.status === 'occupied' && (
                  <>
                    <button
                      type="button"
                      onClick={() => {
                        setPrefillPosTableId(tbl.id);
                        setAdminTab('pos');
                      }}
                      className="flex-1 py-1.5 px-2.5 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold rounded-lg text-xs transition-colors cursor-pointer flex items-center justify-center gap-1 shadow-2xs"
                      title="Gọi thêm món cho bàn"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Gọi Thêm Món</span>
                    </button>

                    {activeOrder && (
                      <button
                        type="button"
                        onClick={() => setActivePaymentOrder(activeOrder)}
                        className="py-1.5 px-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1 cursor-pointer shrink-0"
                        title="Thanh toán VietQR"
                      >
                        <QrCode className="w-3.5 h-3.5" />
                        <span>VietQR</span>
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => updateTableStatus(tbl.id, 'billing')}
                      className="py-1.5 px-2 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-lg text-xs font-medium cursor-pointer"
                      title="Chuyển sang chờ tính tiền"
                    >
                      Báo TT
                    </button>
                  </>
                )}

                {tbl.status === 'billing' && activeOrder && (
                  <>
                    <button
                      type="button"
                      onClick={() => setActivePaymentOrder(activeOrder)}
                      className="flex-1 py-1.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <QrCode className="w-3.5 h-3.5" />
                      <span>Thu Tiền Ngay</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => clearTable(tbl.id)}
                      className="py-1.5 px-2.5 bg-stone-100 hover:bg-rose-50 hover:text-rose-700 text-stone-600 rounded-lg text-xs font-semibold cursor-pointer"
                    >
                      Dọn Bàn
                    </button>
                  </>
                )}

                {tbl.status === 'reserved' && (
                  <button
                    type="button"
                    onClick={() => updateTableStatus(tbl.id, 'occupied', tbl.capacity)}
                    className="flex-1 py-1.5 px-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-semibold transition-colors cursor-pointer text-center"
                  >
                    Khách Đã Đến (Nhận Bàn)
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Seat Guest Modal */}
      {seatingTable && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full space-y-4 shadow-xl border border-stone-200">
            <h3 className="font-bold text-base text-stone-900 font-serif">
              Mở {seatingTable.name} ({seatingTable.area})
            </h3>
            <p className="text-xs text-stone-500">
              Nhập số lượng khách vào bàn để quản lý công suất phục vụ.
            </p>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Số lượng khách (Sức chứa tối đa {seatingTable.capacity}):
              </label>
              <input
                type="number"
                min="1"
                max={seatingTable.capacity}
                value={guestsInput}
                onChange={(e) => setGuestsInput(parseInt(e.target.value) || 1)}
                className="w-full px-3 py-2 text-sm font-bold bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/20"
              />
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setSeatingTable(null)}
                className="w-1/2 py-2 text-xs font-semibold text-stone-600 bg-stone-100 hover:bg-stone-200 rounded-xl cursor-pointer"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={handleConfirmSeat}
                className="w-1/2 py-2 text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 rounded-xl shadow-sm cursor-pointer"
              >
                Xác Nhận Mở Bàn
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Table Modal */}
      {isTableModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full space-y-4 shadow-2xl border border-stone-200">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <h3 className="font-serif text-base font-bold text-stone-900">
                {editingTable ? 'Chỉnh Sửa Cấu Hình Bàn' : 'Thêm Bàn Mới Vào Sơ Đồ'}
              </h3>
              <button
                type="button"
                onClick={() => setIsTableModalOpen(false)}
                className="text-stone-400 hover:text-stone-700 p-1 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveTable} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  Tên bàn *
                </label>
                <input
                  type="text"
                  value={tableName}
                  onChange={(e) => setTableName(e.target.value)}
                  required
                  placeholder="Ví dụ: Bàn 09, Bàn VIP 2..."
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/20 font-bold"
                />
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  Khu vực bàn
                </label>
                <select
                  value={tableArea}
                  onChange={(e) => setTableArea(e.target.value as TableArea)}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/20 font-medium cursor-pointer"
                >
                  {AREAS.map((ar) => (
                    <option key={ar} value={ar}>{ar}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">
                    Số thứ tự
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={tableNumber}
                    onChange={(e) => setTableNumber(parseInt(e.target.value) || 1)}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none font-bold"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 mb-1">
                    Sức chứa (người)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="50"
                    value={tableCapacity}
                    onChange={(e) => setTableCapacity(parseInt(e.target.value) || 4)}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none font-bold"
                  />
                </div>
              </div>

              {/* Danger Zone: Delete table */}
              {editingTable && (
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      if (window.confirm(`Bạn có chắc chắn muốn xóa "${editingTable.name}" khỏi sơ đồ bàn?`)) {
                        deleteTable(editingTable.id);
                        setIsTableModalOpen(false);
                      }
                    }}
                    className="text-rose-600 hover:text-rose-800 text-xs font-semibold flex items-center gap-1 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Xóa bàn này</span>
                  </button>
                </div>
              )}

              <div className="flex items-center gap-2 pt-3 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setIsTableModalOpen(false)}
                  className="w-1/2 py-2 text-xs font-semibold text-stone-600 bg-stone-100 hover:bg-stone-200 rounded-xl cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="w-1/2 py-2 text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 rounded-xl shadow-xs cursor-pointer"
                >
                  {editingTable ? 'Cập Nhật' : 'Thêm Bàn'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
