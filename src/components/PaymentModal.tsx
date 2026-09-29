import React, { useState } from 'react';
import { useRestaurant } from '../context/RestaurantContext';
import { formatVND, generateVietQRUrl } from '../utils/formatters';
import { PaymentMethod } from '../types/restaurant';
import { X, QrCode, CheckCircle2, Copy, Smartphone, CreditCard, Banknote, ShieldCheck, Sparkles, Check } from 'lucide-react';

export const PaymentModal: React.FC = () => {
  const { activePaymentOrder, setActivePaymentOrder, processPayment, showToast, settings } = useRestaurant();
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>('vietqr');
  const [isProcessing, setIsProcessing] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  if (!activePaymentOrder) return null;

  const order = activePaymentOrder;
  const qrUrl = generateVietQRUrl(
    order.finalAmount, 
    order.orderCode,
    settings.bankId,
    settings.accountNo,
    settings.accountName
  );

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(label);
    showToast(`Đã sao chép ${label}`);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleConfirmPayment = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      processPayment(order.id, selectedMethod);
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-stone-200 flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-stone-100 flex items-center justify-between bg-stone-50/70">
          <div>
            <h3 className="text-lg font-bold text-stone-900 font-serif">
              Thanh Toán Điện Tử Nhanh Chóng
            </h3>
            <p className="text-xs text-stone-500">
              Đơn hàng: <span className="font-semibold text-stone-800">{order.orderCode}</span> · {order.tableName || 'Khách mang về'}
            </p>
          </div>
          <button
            onClick={() => setActivePaymentOrder(null)}
            className="text-stone-400 hover:text-stone-700 p-1.5 rounded-lg hover:bg-stone-200/50 transition-colors cursor-pointer"
            aria-label="Đóng"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-6 overflow-y-auto space-y-5">
          {/* Amount Badge */}
          <div className="bg-amber-50/60 border border-amber-200/60 rounded-xl p-4 text-center">
            <span className="text-xs font-medium text-amber-800 uppercase tracking-wider">
              Số tiền cần thanh toán
            </span>
            <div className="text-3xl font-extrabold text-amber-900 tracking-tight mt-0.5 tabular-nums">
              {formatVND(order.finalAmount)}
            </div>
            {order.discountAmount > 0 && (
              <span className="text-xs text-emerald-700 font-medium">
                (Đã giảm {formatVND(order.discountAmount)})
              </span>
            )}
          </div>

          {/* Payment Method Tabs */}
          <div>
            <label className="text-xs font-semibold text-stone-600 uppercase tracking-wider block mb-2">
              Chọn phương thức thanh toán
            </label>
            <div className="grid grid-cols-4 gap-2">
              <button
                type="button"
                onClick={() => setSelectedMethod('vietqr')}
                className={`flex flex-col items-center justify-center p-2.5 rounded-xl border text-xs font-medium transition-all cursor-pointer ${
                  selectedMethod === 'vietqr'
                    ? 'border-blue-600 bg-blue-50/80 text-blue-900 shadow-sm ring-1 ring-blue-600'
                    : 'border-stone-200 hover:border-stone-300 text-stone-700'
                }`}
              >
                <QrCode className="w-5 h-5 mb-1 text-blue-600" />
                <span>VietQR</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedMethod('momo')}
                className={`flex flex-col items-center justify-center p-2.5 rounded-xl border text-xs font-medium transition-all cursor-pointer ${
                  selectedMethod === 'momo'
                    ? 'border-pink-600 bg-pink-50/80 text-pink-900 shadow-sm ring-1 ring-pink-600'
                    : 'border-stone-200 hover:border-stone-300 text-stone-700'
                }`}
              >
                <Smartphone className="w-5 h-5 mb-1 text-pink-600" />
                <span>Ví MoMo</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedMethod('vnpay')}
                className={`flex flex-col items-center justify-center p-2.5 rounded-xl border text-xs font-medium transition-all cursor-pointer ${
                  selectedMethod === 'vnpay'
                    ? 'border-indigo-600 bg-indigo-50/80 text-indigo-900 shadow-sm ring-1 ring-indigo-600'
                    : 'border-stone-200 hover:border-stone-300 text-stone-700'
                }`}
              >
                <CreditCard className="w-5 h-5 mb-1 text-indigo-600" />
                <span>VNPay</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedMethod('cash')}
                className={`flex flex-col items-center justify-center p-2.5 rounded-xl border text-xs font-medium transition-all cursor-pointer ${
                  selectedMethod === 'cash'
                    ? 'border-emerald-600 bg-emerald-50/80 text-emerald-900 shadow-sm ring-1 ring-emerald-600'
                    : 'border-stone-200 hover:border-stone-300 text-stone-700'
                }`}
              >
                <Banknote className="w-5 h-5 mb-1 text-emerald-600" />
                <span>Tiền mặt</span>
              </button>
            </div>
          </div>

          {/* Dynamic Details based on Method */}
          {selectedMethod === 'vietqr' && (
            <div className="bg-stone-50 border border-stone-200 rounded-xl p-4 space-y-4">
              <div className="flex flex-col items-center text-center">
                <div className="bg-white p-2.5 rounded-xl border border-stone-200 shadow-inner mb-2 inline-block">
                  <img
                    src={qrUrl}
                    alt="VietQR Hòn Cau Quán"
                    className="w-48 h-48 sm:w-56 sm:h-56 object-contain"
                    onError={(e) => {
                      // Fallback QR simulation
                      const target = e.currentTarget;
                      target.src = 'https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=VIETQR-HONCAU-' + order.orderCode;
                    }}
                  />
                </div>
                <div className="flex items-center gap-1.5 text-xs text-blue-700 font-medium">
                  <ShieldCheck className="w-4 h-4" />
                  Mã QR chuyển khoản tự động khớp lệnh 24/7
                </div>
              </div>

              {/* Bank Details Card */}
              <div className="bg-white rounded-lg p-3 border border-stone-200 text-xs space-y-2">
                <div className="flex items-center justify-between pb-1.5 border-b border-stone-100">
                  <span className="text-stone-500">Ngân hàng:</span>
                  <span className="font-semibold text-stone-800">{settings.bankName || settings.bankId}</span>
                </div>
                <div className="flex items-center justify-between pb-1.5 border-b border-stone-100">
                  <span className="text-stone-500">Số tài khoản:</span>
                  <div className="flex items-center gap-1">
                    <span className="font-bold text-stone-900 font-mono">{settings.accountNo}</span>
                    <button
                      type="button"
                      onClick={() => handleCopy(settings.accountNo, 'Số tài khoản')}
                      className="p-1 hover:bg-stone-100 rounded text-stone-500 hover:text-stone-900 cursor-pointer"
                      title="Sao chép"
                    >
                      {copiedField === 'Số tài khoản' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
                <div className="flex items-center justify-between pb-1.5 border-b border-stone-100">
                  <span className="text-stone-500">Chủ tài khoản:</span>
                  <span className="font-semibold text-stone-800">{settings.accountName}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-stone-500">Nội dung CK:</span>
                  <div className="flex items-center gap-1">
                    <span className="font-bold text-amber-800 font-mono">THANH TOAN {order.orderCode}</span>
                    <button
                      type="button"
                      onClick={() => handleCopy(`THANH TOAN ${order.orderCode}`, 'Nội dung')}
                      className="p-1 hover:bg-stone-100 rounded text-stone-500 hover:text-stone-900 cursor-pointer"
                      title="Sao chép"
                    >
                      {copiedField === 'Nội dung' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {selectedMethod === 'momo' && (
            <div className="bg-pink-50/50 border border-pink-200 rounded-xl p-5 text-center space-y-3">
              <div className="w-12 h-12 bg-pink-600 text-white rounded-xl flex items-center justify-center mx-auto shadow-md">
                <Smartphone className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-stone-900 text-sm">Thanh toán qua Ví MoMo</h4>
                <p className="text-xs text-stone-600 mt-1">
                  Mở ứng dụng MoMo và quét mã hoặc bấm xác nhận thanh toán trực tiếp
                </p>
              </div>
              <div className="bg-white p-3 rounded-lg border border-pink-100 inline-block">
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=2|99|${settings.accountNo || '0915550539'}|HON%20CAU%20QUAN||0|0|${order.finalAmount}|Thanh+toan+${order.orderCode}`}
                  alt="MoMo QR"
                  className="w-40 h-40 mx-auto"
                />
              </div>
              <div className="text-xs text-pink-900 font-medium">
                Số ĐT MoMo: <span className="font-mono font-bold">{settings.hotline || '0915.550.539'}</span> ({settings.name || 'Hòn Cau Quán'})
              </div>
            </div>
          )}

          {selectedMethod === 'vnpay' && (
            <div className="bg-indigo-50/50 border border-indigo-200 rounded-xl p-5 text-center space-y-3">
              <div className="w-12 h-12 bg-indigo-600 text-white rounded-xl flex items-center justify-center mx-auto shadow-md">
                <CreditCard className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-stone-900 text-sm">Cổng thanh toán VNPay-QR</h4>
                <p className="text-xs text-stone-600 mt-1">
                  Sử dụng ứng dụng hơn 30 ngân hàng (VCB, BIDV, Agribank...) hoặc ví VNPAY
                </p>
              </div>
              <div className="bg-white p-3 rounded-lg border border-indigo-100 inline-block">
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=VNPAYQR-HONCAU-${order.orderCode}-${order.finalAmount}`}
                  alt="VNPay QR"
                  className="w-40 h-40 mx-auto"
                />
              </div>
            </div>
          )}

          {selectedMethod === 'cash' && (
            <div className="bg-stone-50 border border-stone-200 rounded-xl p-5 text-center space-y-2">
              <div className="w-12 h-12 bg-emerald-600 text-white rounded-xl flex items-center justify-center mx-auto shadow-md">
                <Banknote className="w-6 h-6" />
              </div>
              <h4 className="font-bold text-stone-900 text-sm">Thanh toán tiền mặt tại quầy</h4>
              <p className="text-xs text-stone-600 max-w-xs mx-auto">
                Nhân viên thu ngân sẽ nhận tiền mặt trực tiếp và in hóa đơn trao tận tay quý khách.
              </p>
            </div>
          )}

          {/* Itemized Order Preview */}
          <div className="border-t border-stone-100 pt-3">
            <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider block mb-2">
              Danh sách món ({order.items.length})
            </span>
            <div className="space-y-1.5 max-h-32 overflow-y-auto pr-1">
              {order.items.map((it, idx) => (
                <div key={idx} className="flex items-center justify-between text-xs py-0.5">
                  <div className="truncate pr-2">
                    <span className="font-medium text-stone-800">{it.name}</span>
                    <span className="text-stone-400"> × {it.quantity}</span>
                  </div>
                  <span className="font-mono text-stone-700 font-semibold tabular-nums shrink-0">
                    {formatVND(it.price * it.quantity)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Action Footer */}
        <div className="p-4 border-t border-stone-200 bg-stone-50/80 flex items-center gap-3">
          <button
            type="button"
            onClick={() => setActivePaymentOrder(null)}
            className="w-1/3 py-2.5 px-4 text-xs font-semibold text-stone-600 hover:text-stone-900 bg-white border border-stone-300 rounded-xl hover:bg-stone-50 transition-colors cursor-pointer"
          >
            Đóng
          </button>
          
          <button
            type="button"
            onClick={handleConfirmPayment}
            disabled={isProcessing}
            className="flex-1 py-2.5 px-4 text-xs sm:text-sm font-bold text-white bg-emerald-700 hover:bg-emerald-800 rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70"
          >
            {isProcessing ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Đang xử lý kết nối...</span>
              </div>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4" />
                <span>Xác Nhận Đã Thanh Toán</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
