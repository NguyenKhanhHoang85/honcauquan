import React, { useState } from 'react';
import { useRestaurant } from '../../context/RestaurantContext';
import { formatVND } from '../../utils/formatters';
import { OrderType, PaymentMethod } from '../../types/restaurant';
import { ShoppingBag, X, Trash2, ArrowRight, Utensils, QrCode, Smartphone, Banknote, Sparkles } from 'lucide-react';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({ isOpen, onClose }) => {
  const { 
    cart, 
    updateCartQuantity, 
    removeFromCart, 
    clearCart, 
    cartTotal, 
    cartCount, 
    tables, 
    createOrder,
    setActivePaymentOrder,
    setCustomerTab 
  } = useRestaurant();

  const [orderType, setOrderType] = useState<OrderType>('dine_in');
  const [selectedTableId, setSelectedTableId] = useState<string>('tbl-1');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [orderNote, setOrderNote] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('vietqr');

  if (!isOpen) return null;

  const selectedTable = tables.find((t) => t.id === selectedTableId);

  const handleCheckout = (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) return;

    const items = cart.map((ci) => ({
      menuItemId: ci.menuItem.id,
      name: ci.menuItem.name,
      price: ci.menuItem.price,
      quantity: ci.quantity,
      category: ci.menuItem.category,
      note: ci.note,
    }));

    const newOrder = createOrder({
      customerName: customerName || 'Khách gọi món',
      customerPhone: customerPhone || '0900000000',
      orderType,
      tableId: orderType === 'dine_in' ? selectedTableId : undefined,
      tableName: orderType === 'dine_in' ? `${selectedTable?.name || 'Bàn'} (${selectedTable?.area || ''})` : 'Mang về',
      items,
      paymentMethod,
      note: orderNote,
    });

    onClose();
    // Open instant electronic payment modal for VietQR or MoMo
    setActivePaymentOrder(newOrder);
    setCustomerTab('my_order');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div 
        className="absolute inset-0 bg-stone-900/60 backdrop-blur-xs transition-opacity" 
        onClick={onClose} 
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col border-l border-stone-200">
          {/* Drawer Header */}
          <div className="px-5 py-4 border-b border-stone-100 flex items-center justify-between bg-stone-50/70">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-amber-700" />
              <h3 className="font-serif text-lg font-bold text-stone-900">
                Giỏ Món Của Bạn ({cartCount})
              </h3>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 text-stone-400 hover:text-stone-700 hover:bg-stone-200 rounded-lg transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Cart Content */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {cart.length === 0 ? (
              <div className="text-center py-16 space-y-3">
                <div className="w-16 h-16 bg-amber-50 text-amber-600 rounded-full flex items-center justify-center mx-auto">
                  <Utensils className="w-8 h-8" />
                </div>
                <h4 className="text-sm font-bold text-stone-800">Giỏ món đang trống</h4>
                <p className="text-xs text-stone-500 max-w-xs mx-auto">
                  Hãy chọn các món hải sản hoặc đồ uống hấp dẫn trong thực đơn để bắt đầu gọi món nhé.
                </p>
              </div>
            ) : (
              <>
                {/* Item List */}
                <div className="space-y-3">
                  {cart.map((ci) => (
                    <div
                      key={ci.menuItem.id}
                      className="bg-stone-50 border border-stone-200/80 rounded-xl p-3 flex gap-3 items-center"
                    >
                      <img
                        src={ci.menuItem.imageUrl}
                        alt={ci.menuItem.name}
                        referrerPolicy="no-referrer"
                        className="w-14 h-14 rounded-lg object-cover bg-stone-200 shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-xs sm:text-sm text-stone-900 truncate">
                          {ci.menuItem.name}
                        </h4>
                        <div className="text-xs font-semibold text-amber-900 font-mono tabular-nums">
                          {formatVND(ci.menuItem.price)}
                        </div>
                        {ci.note && (
                          <p className="text-[11px] text-stone-500 italic truncate">
                            Ghi chú: {ci.note}
                          </p>
                        )}
                      </div>

                      {/* Stepper */}
                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          type="button"
                          onClick={() => updateCartQuantity(ci.menuItem.id, ci.quantity - 1)}
                          className="w-6 h-6 rounded bg-white border border-stone-300 text-stone-700 hover:bg-stone-100 font-bold text-xs flex items-center justify-center cursor-pointer"
                        >
                          -
                        </button>
                        <span className="text-xs font-bold font-mono w-4 text-center">
                          {ci.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => updateCartQuantity(ci.menuItem.id, ci.quantity + 1)}
                          className="w-6 h-6 rounded bg-white border border-stone-300 text-stone-700 hover:bg-stone-100 font-bold text-xs flex items-center justify-center cursor-pointer"
                        >
                          +
                        </button>
                        <button
                          type="button"
                          onClick={() => removeFromCart(ci.menuItem.id)}
                          className="p-1 text-stone-400 hover:text-rose-600 transition-colors cursor-pointer ml-1"
                          title="Xóa"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Clear Cart Button */}
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={clearCart}
                    className="text-xs text-stone-500 hover:text-rose-600 underline cursor-pointer"
                  >
                    Xóa tất cả món
                  </button>
                </div>

                {/* Order Type & Table Selection */}
                <div className="border-t border-stone-200 pt-4 space-y-3">
                  <span className="text-xs font-bold text-stone-700 uppercase tracking-wider block">
                    Hình thức gọi món
                  </span>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setOrderType('dine_in')}
                      className={`py-2 text-xs font-semibold rounded-xl border transition-all cursor-pointer ${
                        orderType === 'dine_in'
                          ? 'border-amber-600 bg-amber-50 text-amber-900 ring-1 ring-amber-600'
                          : 'border-stone-200 text-stone-600 hover:bg-stone-50'
                      }`}
                    >
                      Dùng tại bàn
                    </button>
                    <button
                      type="button"
                      onClick={() => setOrderType('takeaway')}
                      className={`py-2 text-xs font-semibold rounded-xl border transition-all cursor-pointer ${
                        orderType === 'takeaway'
                          ? 'border-amber-600 bg-amber-50 text-amber-900 ring-1 ring-amber-600'
                          : 'border-stone-200 text-stone-600 hover:bg-stone-50'
                      }`}
                    >
                      Mang về (Takeaway)
                    </button>
                  </div>

                  {orderType === 'dine_in' && (
                    <div>
                      <label className="block text-xs font-medium text-stone-600 mb-1">
                        Chọn bàn của bạn:
                      </label>
                      <select
                        value={selectedTableId}
                        onChange={(e) => setSelectedTableId(e.target.value)}
                        className="w-full px-3 py-2 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/20 cursor-pointer font-medium"
                      >
                        {tables.map((tbl) => (
                          <option key={tbl.id} value={tbl.id}>
                            {tbl.name} ({tbl.area} - {tbl.capacity} người)
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  {/* Customer Quick Info */}
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[11px] font-medium text-stone-600 mb-0.5">
                        Tên của bạn:
                      </label>
                      <input
                        type="text"
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        placeholder="Ví dụ: Anh Nam"
                        className="w-full px-3 py-1.5 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-medium text-stone-600 mb-0.5">
                        Số điện thoại:
                      </label>
                      <input
                        type="tel"
                        value={customerPhone}
                        onChange={(e) => setCustomerPhone(e.target.value)}
                        placeholder="0901234567"
                        className="w-full px-3 py-1.5 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-stone-600 mb-0.5">
                      Ghi chú đơn hàng:
                    </label>
                    <input
                      type="text"
                      value={orderNote}
                      onChange={(e) => setOrderNote(e.target.value)}
                      placeholder="Ghi chú thêm về món ăn hoặc thời gian..."
                      className="w-full px-3 py-1.5 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                    />
                  </div>

                  {/* Payment Method Quick Choose */}
                  <div>
                    <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                      Phương thức thanh toán nhanh:
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      <button
                        type="button"
                        onClick={() => setPaymentMethod('vietqr')}
                        className={`flex items-center justify-center gap-1 py-1.5 px-2 rounded-lg border text-xs font-semibold cursor-pointer ${
                          paymentMethod === 'vietqr'
                            ? 'border-blue-600 bg-blue-50 text-blue-800'
                            : 'border-stone-200 text-stone-600'
                        }`}
                      >
                        <QrCode className="w-3.5 h-3.5 text-blue-600" />
                        <span>VietQR</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setPaymentMethod('momo')}
                        className={`flex items-center justify-center gap-1 py-1.5 px-2 rounded-lg border text-xs font-semibold cursor-pointer ${
                          paymentMethod === 'momo'
                            ? 'border-pink-600 bg-pink-50 text-pink-800'
                            : 'border-stone-200 text-stone-600'
                        }`}
                      >
                        <Smartphone className="w-3.5 h-3.5 text-pink-600" />
                        <span>MoMo</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setPaymentMethod('cash')}
                        className={`flex items-center justify-center gap-1 py-1.5 px-2 rounded-lg border text-xs font-semibold cursor-pointer ${
                          paymentMethod === 'cash'
                            ? 'border-emerald-600 bg-emerald-50 text-emerald-800'
                            : 'border-stone-200 text-stone-600'
                        }`}
                      >
                        <Banknote className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Tiền mặt</span>
                      </button>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Drawer Footer */}
          {cart.length > 0 && (
            <div className="p-4 border-t border-stone-200 bg-stone-50 space-y-3">
              <div className="flex items-baseline justify-between">
                <span className="text-xs font-bold text-stone-700">Tổng thanh toán:</span>
                <span className="text-xl font-extrabold text-amber-900 font-mono tabular-nums">
                  {formatVND(cartTotal)}
                </span>
              </div>

              <button
                type="button"
                onClick={handleCheckout}
                className="w-full py-3 bg-amber-600 hover:bg-amber-700 text-white font-bold text-sm rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Gửi Bếp & Thanh Toán Điện Tử</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
