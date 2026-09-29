import React from 'react';
import { useRestaurant } from '../context/RestaurantContext';
import { formatVND, formatDateTime } from '../utils/formatters';
import { History, X, Clock, CheckCircle2, User, ShoppingBag, Utensils, CreditCard, Tag } from 'lucide-react';

export const OrderHistoryModal: React.FC = () => {
  const { activeOrderHistoryOrder, setActiveOrderHistoryOrder } = useRestaurant();

  if (!activeOrderHistoryOrder) return null;

  const order = activeOrderHistoryOrder;
  const historyList = order.history || [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-stone-200 flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-stone-100 flex items-center justify-between bg-stone-50">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-700">
              <History className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif text-base font-bold text-stone-900">
                Lịch Sử Thay Đổi Đơn Hàng #{order.orderCode}
              </h3>
              <p className="text-xs text-stone-500">
                {order.tableName || (order.orderType === 'takeaway' ? 'Khách Mang Về' : 'Tại quán')} · {order.customerName}
              </p>
            </div>
          </div>

          <button
            onClick={() => setActiveOrderHistoryOrder(null)}
            className="p-1.5 text-stone-400 hover:text-stone-700 hover:bg-stone-200 rounded-lg cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Order Summary Snapshot */}
        <div className="px-6 py-3 bg-stone-50/50 border-b border-stone-100 grid grid-cols-3 gap-2 text-center text-xs">
          <div>
            <span className="text-[10px] text-stone-500 block">Tổng món</span>
            <span className="font-bold text-stone-900 font-mono">
              {order.items.reduce((s, i) => s + i.quantity, 0)} phần
            </span>
          </div>
          <div>
            <span className="text-[10px] text-stone-500 block">Số đợt gọi</span>
            <span className="font-bold text-amber-800 font-mono">
              {order.rounds?.length || 1} đợt
            </span>
          </div>
          <div>
            <span className="text-[10px] text-stone-500 block">Thực thu</span>
            <span className="font-bold text-emerald-800 font-mono">
              {formatVND(order.finalAmount)}
            </span>
          </div>
        </div>

        {/* Timeline */}
        <div className="p-6 overflow-y-auto space-y-4">
          {historyList.length === 0 ? (
            <div className="p-8 text-center text-stone-400 space-y-2">
              <Clock className="w-8 h-8 mx-auto opacity-40" />
              <p className="text-xs">Đơn hàng được tạo lúc {formatDateTime(order.createdAt)}.</p>
            </div>
          ) : (
            <div className="relative pl-6 space-y-6 before:content-[''] before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-stone-200">
              {historyList.map((hist, idx) => (
                <div key={hist.id || idx} className="relative group">
                  {/* Dot */}
                  <div className="absolute -left-[27px] top-1 w-4 h-4 rounded-full bg-white border-2 border-amber-600 shadow-2xs group-hover:scale-125 transition-transform" />

                  <div className="bg-stone-50 p-3.5 rounded-xl border border-stone-200 space-y-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-bold text-xs text-stone-900">
                        {hist.action}
                      </span>
                      <span className="text-[10px] text-stone-400 font-mono">
                        {formatDateTime(hist.timestamp)}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 text-[11px] text-stone-500">
                      <User className="w-3 h-3 text-stone-400" />
                      <span>Thực hiện bởi: <strong>{hist.actor}</strong></span>
                    </div>

                    {hist.details && (
                      <p className="text-xs text-stone-700 pt-1 border-t border-stone-100 font-medium">
                        {hist.details}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-stone-200 bg-stone-50 flex justify-end">
          <button
            type="button"
            onClick={() => setActiveOrderHistoryOrder(null)}
            className="px-4 py-2 text-xs font-semibold text-stone-700 bg-white border border-stone-300 hover:bg-stone-100 rounded-xl cursor-pointer"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};
