import React, { useState } from 'react';
import { useRestaurant } from '../../context/RestaurantContext';
import { Order, OrderStatus, OrderType } from '../../types/restaurant';
import { formatVND, formatDateTime, formatDateOnly } from '../../utils/formatters';
import { 
  ChefHat, 
  Clock, 
  CheckCircle, 
  QrCode, 
  FileText, 
  AlertCircle, 
  Search, 
  Filter, 
  Printer, 
  History, 
  Calendar,
  Layers,
  ShoppingBag,
  Store,
  User,
  Phone,
  Bell,
  BellRing,
  Smartphone,
  Volume2,
  VolumeX,
  Sparkles,
  Radio
} from 'lucide-react';

export const KitchenOrders: React.FC = () => {
  const { 
    orders, 
    updateOrderStatus, 
    setActivePaymentOrder, 
    setActiveReceiptOrder,
    setActiveKitchenPrintOrder,
    setActiveOrderHistoryOrder,
    kitchenNotifySettings,
    toggleKitchenVibrate,
    toggleKitchenSound,
    enableKitchenPush,
    testKitchenNotification,
    triggerKitchenAlert,
    showToast
  } = useRestaurant();

  const [filterStatus, setFilterStatus] = useState<OrderStatus | 'all'>('all');
  const [filterType, setFilterType] = useState<OrderType | 'all'>('all');
  const [filterDateMode, setFilterDateMode] = useState<'all' | 'today' | 'yesterday' | '7days' | 'custom'>('all');
  const [customDate, setCustomDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [searchQuery, setSearchQuery] = useState('');

  // Date filtering logic
  const now = new Date();
  const todayStr = now.toISOString().split('T')[0];
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split('T')[0];
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 3600 * 1000);

  const filteredOrders = orders.filter((ord) => {
    // Status
    const matchStatus = filterStatus === 'all' || ord.orderStatus === filterStatus;

    // Type
    const matchType = filterType === 'all' || ord.orderType === filterType;

    // Search query
    const matchSearch =
      !searchQuery.trim() ||
      ord.orderCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (ord.tableName && ord.tableName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      ord.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ord.customerPhone.includes(searchQuery);

    // Date
    const ordDate = ord.createdAt.split('T')[0];
    let matchDate = true;
    if (filterDateMode === 'today') {
      matchDate = ordDate === todayStr;
    } else if (filterDateMode === 'yesterday') {
      matchDate = ordDate === yesterdayStr;
    } else if (filterDateMode === '7days') {
      matchDate = new Date(ord.createdAt) >= sevenDaysAgo;
    } else if (filterDateMode === 'custom') {
      matchDate = ordDate === customDate;
    }

    return matchStatus && matchType && matchSearch && matchDate;
  });

  const handleSimulateNewOrderAlert = () => {
    const randomCode = Math.floor(100 + Math.random() * 900);
    triggerKitchenAlert({
      id: `alert-sim-${Date.now()}`,
      orderId: `mock-${Date.now()}`,
      orderCode: `HC-${randomCode}`,
      tableName: 'Bàn 8 (VIP Sân Vườn)',
      orderType: 'dine_in',
      itemCount: 4,
      itemsSummary: 'Lõi Nạc Bò Nướng (x2), Gỏi Mực Thái Chua Cay (x1), Lẩu Thái Hải Sản (x1)',
      totalAmount: 615000,
      timestamp: new Date().toISOString(),
      isNewRound: false,
    });
  };

  const pendingCount = orders.filter((o) => o.orderStatus === 'pending').length;
  const preparingCount = orders.filter((o) => o.orderStatus === 'preparing').length;

  return (
    <div className="space-y-6">
      {/* Kitchen Alert & Sound/Vibration Control Bar */}
      <div className="bg-gradient-to-br from-stone-900 via-stone-850 to-stone-900 text-stone-100 p-4 sm:p-5 rounded-2xl border border-stone-700/80 shadow-lg space-y-3.5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-start sm:items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0">
              <BellRing className="w-5 h-5 animate-wiggle" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-bold text-sm sm:text-base text-amber-300">
                  Trung tâm chuông báo & rung đơn bếp
                </h3>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-medium border border-emerald-500/30">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  Đang trực tiếp nhận đơn
                </span>
              </div>
              <p className="text-xs text-stone-400 mt-0.5">
                Tự động rung thiết bị & phát chuông âm thanh tức thời khi có khách đặt bàn, khách quét QR gọi món hoặc nhân viên gửi order.
              </p>
            </div>
          </div>

          {/* Quick Action Test Buttons */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={testKitchenNotification}
              className="py-1.5 px-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-semibold text-xs transition-all shadow-md cursor-pointer flex items-center gap-1.5"
              title="Phát thử âm thanh chuông bếp và rung mô-tơ trên thiết bị này"
            >
              <Bell className="w-3.5 h-3.5" />
              <span>Thử chuông & rung</span>
            </button>

            <button
              type="button"
              onClick={handleSimulateNewOrderAlert}
              className="py-1.5 px-3 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 hover:text-white font-medium text-xs border border-stone-700 transition-colors cursor-pointer flex items-center gap-1.5"
              title="Bắn một thông báo đơn hàng giả lập để thử toàn bộ chu trình"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Giả lập đơn mới</span>
            </button>
          </div>
        </div>

        {/* Toggles Strip */}
        <div className="pt-3 border-t border-stone-800 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex flex-wrap items-center gap-2">
            {/* Vibrate Toggle */}
            <button
              type="button"
              onClick={toggleKitchenVibrate}
              className={`px-3 py-1.5 rounded-xl font-medium flex items-center gap-1.5 cursor-pointer transition-all border ${
                kitchenNotifySettings.vibrateEnabled
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 hover:bg-amber-500/30'
                  : 'bg-stone-800/80 text-stone-400 border-stone-700 hover:bg-stone-800'
              }`}
            >
              <Smartphone className={`w-3.5 h-3.5 ${kitchenNotifySettings.vibrateEnabled ? 'text-amber-400' : 'text-stone-500'}`} />
              <span>Rung thiết bị: {kitchenNotifySettings.vibrateEnabled ? 'Bật' : 'Tắt'}</span>
            </button>

            {/* Sound Toggle */}
            <button
              type="button"
              onClick={toggleKitchenSound}
              className={`px-3 py-1.5 rounded-xl font-medium flex items-center gap-1.5 cursor-pointer transition-all border ${
                kitchenNotifySettings.soundEnabled
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 hover:bg-amber-500/30'
                  : 'bg-stone-800/80 text-stone-400 border-stone-700 hover:bg-stone-800'
              }`}
            >
              {kitchenNotifySettings.soundEnabled ? (
                <Volume2 className="w-3.5 h-3.5 text-amber-400" />
              ) : (
                <VolumeX className="w-3.5 h-3.5 text-stone-500" />
              )}
              <span>Chuông báo: {kitchenNotifySettings.soundEnabled ? 'Bật' : 'Tắt'}</span>
            </button>

            {/* Push Notification Toggle */}
            <button
              type="button"
              onClick={enableKitchenPush}
              className={`px-3 py-1.5 rounded-xl font-medium flex items-center gap-1.5 cursor-pointer transition-all border ${
                kitchenNotifySettings.pushEnabled
                  ? 'bg-blue-500/20 text-blue-300 border-blue-500/40 hover:bg-blue-500/30'
                  : 'bg-stone-800/80 text-stone-400 border-stone-700 hover:bg-stone-800'
              }`}
            >
              <Radio className={`w-3.5 h-3.5 ${kitchenNotifySettings.pushEnabled ? 'text-blue-400' : 'text-stone-500'}`} />
              <span>Thông báo đẩy trình duyệt: {kitchenNotifySettings.pushEnabled ? 'Đã bật' : 'Bấm để bật'}</span>
            </button>
          </div>

          <div className="flex items-center gap-3 text-stone-400 text-[11px]">
            <span>Đơn chờ duyệt: <strong className="text-amber-400">{pendingCount}</strong></span>
            <span>•</span>
            <span>Đang nấu: <strong className="text-blue-400">{preparingCount}</strong></span>
          </div>
        </div>
      </div>

      {/* Top Filter Bar: Status Tabs, Date Smart Filter, Search */}
      <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs space-y-3">
        {/* Status switcher */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
            <button
              onClick={() => setFilterStatus('all')}
              className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap cursor-pointer transition-colors ${
                filterStatus === 'all'
                  ? 'bg-stone-900 text-white font-semibold'
                  : 'bg-stone-100 text-stone-600 hover:bg-stone-200/80'
              }`}
            >
              Tất cả ({orders.length})
            </button>
            <button
              onClick={() => setFilterStatus('pending')}
              className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap cursor-pointer transition-colors ${
                filterStatus === 'pending'
                  ? 'bg-amber-600 text-white font-semibold'
                  : 'bg-stone-100 text-stone-600 hover:bg-stone-200/80'
              }`}
            >
              Chờ duyệt ({orders.filter((o) => o.orderStatus === 'pending').length})
            </button>
            <button
              onClick={() => setFilterStatus('preparing')}
              className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap cursor-pointer transition-colors ${
                filterStatus === 'preparing'
                  ? 'bg-blue-600 text-white font-semibold'
                  : 'bg-stone-100 text-stone-600 hover:bg-stone-200/80'
              }`}
            >
              Đang nấu ({orders.filter((o) => o.orderStatus === 'preparing').length})
            </button>
            <button
              onClick={() => setFilterStatus('served')}
              className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap cursor-pointer transition-colors ${
                filterStatus === 'served'
                  ? 'bg-indigo-600 text-white font-semibold'
                  : 'bg-stone-100 text-stone-600 hover:bg-stone-200/80'
              }`}
            >
              Đã lên món ({orders.filter((o) => o.orderStatus === 'served').length})
            </button>
            <button
              onClick={() => setFilterStatus('completed')}
              className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap cursor-pointer transition-colors ${
                filterStatus === 'completed'
                  ? 'bg-emerald-700 text-white font-semibold'
                  : 'bg-stone-100 text-stone-600 hover:bg-stone-200/80'
              }`}
            >
              Hoàn thành ({orders.filter((o) => o.orderStatus === 'completed').length})
            </button>
          </div>

          {/* Search Input */}
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm mã đơn, bàn, tên khách, SĐT..."
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/20"
            />
          </div>
        </div>

        {/* Date Filter & Sale Type Filter */}
        <div className="pt-2 border-t border-stone-100 flex flex-wrap items-center justify-between gap-3 text-xs">
          {/* Smart Date Filter */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-stone-500 font-medium flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-amber-600" />
              <span>Lọc theo ngày:</span>
            </span>
            <button
              type="button"
              onClick={() => setFilterDateMode('all')}
              className={`px-2.5 py-1 rounded-lg font-semibold cursor-pointer ${
                filterDateMode === 'all' ? 'bg-amber-100 text-amber-900 border border-amber-300' : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
              }`}
            >
              Toàn bộ
            </button>
            <button
              type="button"
              onClick={() => setFilterDateMode('today')}
              className={`px-2.5 py-1 rounded-lg font-semibold cursor-pointer ${
                filterDateMode === 'today' ? 'bg-amber-100 text-amber-900 border border-amber-300' : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
              }`}
            >
              Hôm nay
            </button>
            <button
              type="button"
              onClick={() => setFilterDateMode('yesterday')}
              className={`px-2.5 py-1 rounded-lg font-semibold cursor-pointer ${
                filterDateMode === 'yesterday' ? 'bg-amber-100 text-amber-900 border border-amber-300' : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
              }`}
            >
              Hôm qua
            </button>
            <button
              type="button"
              onClick={() => setFilterDateMode('7days')}
              className={`px-2.5 py-1 rounded-lg font-semibold cursor-pointer ${
                filterDateMode === '7days' ? 'bg-amber-100 text-amber-900 border border-amber-300' : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
              }`}
            >
              7 ngày qua
            </button>
            <div className="flex items-center gap-1">
              <input
                type="date"
                value={customDate}
                onChange={(e) => {
                  setCustomDate(e.target.value);
                  setFilterDateMode('custom');
                }}
                className={`px-2 py-0.5 rounded-lg border text-xs cursor-pointer ${
                  filterDateMode === 'custom' ? 'bg-amber-50 border-amber-400 font-bold text-amber-900' : 'bg-stone-50 border-stone-200 text-stone-600'
                }`}
              />
            </div>
          </div>

          {/* Type filter */}
          <div className="flex items-center gap-1">
            <span className="text-stone-500 font-medium">Hình thức:</span>
            <button
              type="button"
              onClick={() => setFilterType('all')}
              className={`px-2 py-0.5 rounded text-[11px] font-semibold cursor-pointer ${
                filterType === 'all' ? 'bg-stone-900 text-white' : 'text-stone-600 hover:bg-stone-100'
              }`}
            >
              Tất cả
            </button>
            <button
              type="button"
              onClick={() => setFilterType('dine_in')}
              className={`px-2 py-0.5 rounded text-[11px] font-semibold cursor-pointer ${
                filterType === 'dine_in' ? 'bg-stone-900 text-white' : 'text-stone-600 hover:bg-stone-100'
              }`}
            >
              Tại quán
            </button>
            <button
              type="button"
              onClick={() => setFilterType('takeaway')}
              className={`px-2 py-0.5 rounded text-[11px] font-semibold cursor-pointer ${
                filterType === 'takeaway' ? 'bg-stone-900 text-white' : 'text-stone-600 hover:bg-stone-100'
              }`}
            >
              Mang về
            </button>
          </div>
        </div>
      </div>

      {/* Orders Grid */}
      {filteredOrders.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-stone-200 space-y-2">
          <ChefHat className="w-12 h-12 text-stone-300 mx-auto" />
          <h4 className="text-base font-semibold text-stone-800">Không tìm thấy đơn hàng nào</h4>
          <p className="text-xs text-stone-500 max-w-sm mx-auto">
            Thử thay đổi bộ lọc ngày, trạng thái hoặc từ khóa tìm kiếm.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredOrders.map((ord) => {
            const isPaid = ord.paymentStatus === 'paid';
            const roundsCount = ord.rounds?.length || 1;
            const hasMultipleRounds = roundsCount > 1;

            return (
              <div
                key={ord.id}
                className="bg-white rounded-2xl border border-stone-200 p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-4 relative"
              >
                {/* Header */}
                <div className="flex items-start justify-between border-b border-stone-100 pb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-base text-stone-900 font-mono">
                        #{ord.orderCode}
                      </span>
                      <span className="text-xs text-stone-700 font-semibold px-2 py-0.5 rounded bg-stone-100">
                        {ord.tableName || (ord.orderType === 'takeaway' ? 'Mang về' : 'Tại quán')}
                      </span>
                    </div>

                    <div className="text-[11px] text-stone-400 flex items-center gap-1.5 mt-1 font-mono">
                      <Clock className="w-3 h-3 text-stone-400" />
                      <span>{formatDateTime(ord.createdAt)}</span>
                      {hasMultipleRounds && (
                        <span className="bg-amber-100 text-amber-900 font-bold px-1.5 rounded text-[10px]">
                          {roundsCount} đợt gọi
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-1">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        isPaid ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' : 'bg-amber-100 text-amber-900 border border-amber-300'
                      }`}
                    >
                      {isPaid ? 'Đã Thanh Toán' : 'Chưa TT'}
                    </span>
                    <span className="text-[10px] text-stone-400">
                      NV: {ord.staffName || 'Order'}
                    </span>
                  </div>
                </div>

                {/* Items list */}
                <div className="space-y-2 flex-1">
                  <div className="flex items-center justify-between text-[11px] font-bold text-stone-500 uppercase tracking-wider">
                    <span>Món đã gọi ({ord.items.reduce((s, i) => s + i.quantity, 0)} phần):</span>
                    {hasMultipleRounds && (
                      <span className="text-amber-800 font-semibold lowercase">
                        đợt mới: đợt {roundsCount}
                      </span>
                    )}
                  </div>

                  <div className="space-y-1.5 max-h-52 overflow-y-auto pr-1">
                    {ord.items.map((item, idx) => (
                      <div
                        key={idx}
                        className="bg-stone-50 p-2 rounded-lg border border-stone-200/80 flex items-start justify-between text-xs"
                      >
                        <div className="pr-2 flex-1">
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-stone-900">{item.name}</span>
                            <span className="text-stone-700 font-extrabold ml-1 bg-white px-1.5 py-0.2 rounded border border-stone-200">
                              × {item.quantity}
                            </span>
                            {item.round && item.round > 1 && (
                              <span className="text-[9px] font-bold px-1 rounded bg-amber-200 text-amber-900">
                                Đợt {item.round}
                              </span>
                            )}
                          </div>
                          {item.note && (
                            <p className="text-[10px] text-amber-800 bg-amber-50 px-1.5 py-0.5 rounded mt-0.5 inline-block font-medium">
                              Ghi chú: {item.note}
                            </p>
                          )}
                        </div>
                        <span className="font-mono font-medium text-stone-700 tabular-nums shrink-0">
                          {formatVND(item.price * item.quantity)}
                        </span>
                      </div>
                    ))}
                  </div>

                  {ord.note && (
                    <div className="text-xs text-stone-600 bg-amber-50/70 p-2 rounded-lg border border-amber-200/60">
                      <span className="font-bold text-amber-900">Ghi chú đơn: </span>
                      {ord.note}
                    </div>
                  )}
                </div>

                {/* Totals & Breakdown */}
                <div className="pt-2 border-t border-stone-100 flex items-baseline justify-between text-xs">
                  <div className="text-stone-500">
                    <span>Khách: <strong>{ord.customerName}</strong></span>
                    {ord.customerPhone && <span className="font-mono ml-1">({ord.customerPhone})</span>}
                  </div>
                  <div className="text-right">
                    <span className="text-base font-extrabold text-amber-900 font-mono tabular-nums">
                      {formatVND(ord.finalAmount)}
                    </span>
                    {(ord.discountAmount > 0 || (ord.vatAmount && ord.vatAmount > 0)) && (
                      <span className="block text-[10px] text-stone-400">
                        {ord.discountAmount > 0 ? `Giảm: -${formatVND(ord.discountAmount)} ` : ''}
                        {ord.vatAmount && ord.vatAmount > 0 ? `VAT: +${formatVND(ord.vatAmount)}` : ''}
                      </span>
                    )}
                  </div>
                </div>

                {/* Actions Pipeline */}
                <div className="pt-2 border-t border-stone-100 space-y-2">
                  <div className="flex items-center gap-2">
                    {/* Status progression */}
                    {ord.orderStatus === 'pending' && (
                      <button
                        type="button"
                        onClick={() => updateOrderStatus(ord.id, 'preparing')}
                        className="flex-1 py-1.5 px-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-all shadow-xs cursor-pointer flex items-center justify-center gap-1.5"
                      >
                        <ChefHat className="w-3.5 h-3.5" />
                        <span>Bếp Nhận Đơn (Nấu)</span>
                      </button>
                    )}

                    {ord.orderStatus === 'preparing' && (
                      <button
                        type="button"
                        onClick={() => updateOrderStatus(ord.id, 'served')}
                        className="flex-1 py-1.5 px-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold transition-all shadow-xs cursor-pointer flex items-center justify-center gap-1.5"
                      >
                        <CheckCircle className="w-3.5 h-3.5" />
                        <span>Xong Món (Lên Bàn)</span>
                      </button>
                    )}

                    {ord.orderStatus === 'served' && (
                      <button
                        type="button"
                        onClick={() => updateOrderStatus(ord.id, 'completed')}
                        className="flex-1 py-1.5 px-3 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-bold transition-all shadow-xs cursor-pointer flex items-center justify-center gap-1.5"
                      >
                        <CheckCircle className="w-3.5 h-3.5" />
                        <span>Hoàn Tất Đơn</span>
                      </button>
                    )}

                    {/* Payment button */}
                    {!isPaid ? (
                      <button
                        type="button"
                        onClick={() => setActivePaymentOrder(ord)}
                        className="py-1.5 px-2.5 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold rounded-lg text-xs flex items-center gap-1 cursor-pointer shrink-0"
                        title="Thu tiền nhanh VietQR"
                      >
                        <QrCode className="w-3.5 h-3.5" />
                        <span>VietQR</span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setActiveReceiptOrder(ord)}
                        className="py-1.5 px-2 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-lg text-xs font-medium flex items-center gap-1 cursor-pointer shrink-0"
                        title="Xem lại hóa đơn bán hàng"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        <span>Bill</span>
                      </button>
                    )}
                  </div>

                  {/* Secondary buttons: In Báo Bếp & Lịch Sử Thay Đổi */}
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <button
                      type="button"
                      onClick={() => setActiveKitchenPrintOrder({ order: ord, roundOnly: false })}
                      className="py-1.5 px-2 bg-stone-100 hover:bg-amber-50 hover:text-amber-800 rounded-lg font-medium flex items-center justify-center gap-1 transition-colors cursor-pointer"
                      title="In phiếu báo chế biến cho Bếp / Bar"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      <span>In Báo Bếp</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setActiveOrderHistoryOrder(ord)}
                      className="py-1.5 px-2 bg-stone-100 hover:bg-blue-50 hover:text-blue-800 rounded-lg font-medium flex items-center justify-center gap-1 transition-colors cursor-pointer"
                      title="Theo dõi lịch sử thay đổi của đơn hàng"
                    >
                      <History className="w-3.5 h-3.5" />
                      <span>Lịch Sử Đổi</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
