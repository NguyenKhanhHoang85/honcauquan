import React, { useState } from 'react';
import { useRestaurant } from '../../context/RestaurantContext';
import { formatVND, formatDateTime } from '../../utils/formatters';
import { Order, OrderStatus } from '../../types/restaurant';
import { Clock, QrCode, FileText, CheckCircle2, Search, Utensils, AlertCircle } from 'lucide-react';

const STATUS_CONFIG: Record<OrderStatus, { label: string; color: string; step: number }> = {
  pending: { label: 'Chờ nhà bếp nhận đơn', color: 'bg-amber-100 text-amber-900 border-amber-300', step: 1 },
  preparing: { label: 'Bếp đang chế biến', color: 'bg-blue-100 text-blue-900 border-blue-300', step: 2 },
  served: { label: 'Món đã sẵn sàng tại bàn', color: 'bg-indigo-100 text-indigo-900 border-indigo-300', step: 3 },
  completed: { label: 'Đơn đã hoàn tất', color: 'bg-emerald-100 text-emerald-900 border-emerald-300', step: 4 },
  cancelled: { label: 'Đã hủy', color: 'bg-rose-100 text-rose-900 border-rose-300', step: 0 },
};

export const OrderHistorySection: React.FC = () => {
  const { orders, setActivePaymentOrder, setActiveReceiptOrder } = useRestaurant();
  const [searchCode, setSearchCode] = useState('');

  const filteredOrders = orders.filter((ord) => {
    if (!searchCode.trim()) return true;
    return (
      ord.orderCode.toLowerCase().includes(searchCode.toLowerCase()) ||
      ord.customerPhone.includes(searchCode) ||
      ord.customerName.toLowerCase().includes(searchCode.toLowerCase())
    );
  });

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header & Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="font-serif text-2xl font-bold text-stone-900">
            Đơn Món & Hóa Đơn Của Bạn
          </h2>
          <p className="text-xs text-stone-500 mt-0.5">
            Theo dõi tiến độ ra món tại bếp và thanh toán điện tử nhanh chóng bất kỳ lúc nào.
          </p>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
          <input
            type="text"
            value={searchCode}
            onChange={(e) => setSearchCode(e.target.value)}
            placeholder="Tra cứu theo mã đơn (#HC...) hoặc SĐT"
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/20"
          />
        </div>
      </div>

      {filteredOrders.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-stone-200">
          <Utensils className="w-12 h-12 text-stone-300 mx-auto mb-3" />
          <h4 className="text-base font-semibold text-stone-800">Chưa có đơn gọi món nào</h4>
          <p className="text-xs text-stone-500 mt-1 max-w-sm mx-auto">
            Khi bạn hoặc nhân viên đặt món tại bàn, thông tin đơn hàng và mã thanh toán VietQR sẽ xuất hiện ở đây.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order) => {
            const statusCfg = STATUS_CONFIG[order.orderStatus] || STATUS_CONFIG.pending;
            const isPaid = order.paymentStatus === 'paid';

            return (
              <div
                key={order.id}
                className="bg-white rounded-2xl border border-stone-200/90 shadow-sm overflow-hidden p-5 sm:p-6 space-y-4"
              >
                {/* Top Row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-100 pb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center font-serif font-bold text-amber-800 text-sm">
                      HC
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-stone-900 font-mono text-base">
                          {order.orderCode}
                        </span>
                        <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${statusCfg.color}`}>
                          {statusCfg.label}
                        </span>
                      </div>
                      <div className="text-xs text-stone-500 mt-0.5">
                        {order.tableName || 'Khách mang về'} · {formatDateTime(order.createdAt)}
                      </div>
                    </div>
                  </div>

                  {/* Payment Badge */}
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-xs font-bold px-2.5 py-1 rounded-lg ${
                        isPaid
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-amber-100 text-amber-900'
                      }`}
                    >
                      {isPaid ? 'Đã Thanh Toán' : 'Chưa Thanh Toán'}
                    </span>
                    <span className="text-lg font-extrabold text-stone-900 font-mono tabular-nums">
                      {formatVND(order.finalAmount)}
                    </span>
                  </div>
                </div>

                {/* Items List */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  {order.items.map((it, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-2 rounded-lg bg-stone-50 border border-stone-100"
                    >
                      <div className="truncate pr-2">
                        <span className="font-semibold text-stone-800">{it.name}</span>
                        <span className="text-stone-400"> × {it.quantity}</span>
                        {it.note && (
                          <span className="text-[10px] text-stone-500 block italic truncate">
                            Ghi chú: {it.note}
                          </span>
                        )}
                      </div>
                      <span className="font-mono font-medium text-stone-700 shrink-0 tabular-nums">
                        {formatVND(it.price * it.quantity)}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Progress bar */}
                {order.orderStatus !== 'cancelled' && (
                  <div className="pt-2">
                    <div className="w-full bg-stone-100 h-1.5 rounded-full overflow-hidden">
                      <div
                        className="bg-amber-600 h-full transition-all duration-500"
                        style={{ width: `${(statusCfg.step / 4) * 100}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-[11px] text-stone-400 mt-1">
                      <span>Nhận đơn</span>
                      <span>Nấu / Pha chế</span>
                      <span>Đã lên bàn</span>
                      <span>Hoàn tất</span>
                    </div>
                  </div>
                )}

                {/* Footer Buttons */}
                <div className="flex flex-wrap items-center justify-end gap-2.5 pt-2 border-t border-stone-100">
                  <button
                    type="button"
                    onClick={() => setActiveReceiptOrder(order)}
                    className="px-3 py-1.5 text-xs font-semibold text-stone-700 bg-stone-100 hover:bg-stone-200 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>Xem Hóa Đơn</span>
                  </button>

                  {!isPaid && (
                    <button
                      type="button"
                      onClick={() => setActivePaymentOrder(order)}
                      className="px-4 py-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                      <QrCode className="w-3.5 h-3.5" />
                      <span>Thanh Toán VietQR / MoMo</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
