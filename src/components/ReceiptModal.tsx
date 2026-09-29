import React, { useState } from 'react';
import { useRestaurant } from '../context/RestaurantContext';
import { formatVND, formatDateTime } from '../utils/formatters';
import { printElement, openPrintWindow, generatePrintableHtml } from '../utils/printHelpers';
import { Printer, X, CheckCircle, Share2, Receipt, ExternalLink, Laptop, Info } from 'lucide-react';

export const ReceiptModal: React.FC = () => {
  const { activeReceiptOrder, setActiveReceiptOrder, showToast, settings } = useRestaurant();
  const [paperSize, setPaperSize] = useState<'80mm' | '58mm' | 'auto'>('80mm');

  if (!activeReceiptOrder) return null;

  const order = activeReceiptOrder;

  const handlePrint = (forcePopup = false) => {
    if (forcePopup) {
      const el = document.getElementById('printable-receipt');
      if (el) {
        const fullHtml = generatePrintableHtml(
          el.innerHTML, 
          `Phiếu Thanh Toán #${order.orderCode} - ${settings.name}`, 
          paperSize
        );
        openPrintWindow(fullHtml, `HoaDon-${order.orderCode}`);
        showToast('Đang mở trang in máy tính...');
        return;
      }
    }

    showToast('Đang kết nối máy in máy tính...');
    printElement('printable-receipt', {
      title: `Phiếu Thanh Toán #${order.orderCode} - ${settings.name}`,
      width: paperSize,
    });
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `Hóa đơn ${order.orderCode} - ${settings.name}`,
        text: `Hóa đơn thanh toán tại ${settings.name}. Tổng tiền: ${formatVND(order.finalAmount)}`,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(
        `Hóa đơn ${order.orderCode} - ${settings.name}: ${formatVND(order.finalAmount)}`
      );
      showToast('Đã sao chép thông tin hóa đơn');
    }
  };

  // VietQR embedded on receipt
  const vietQrReceiptUrl = `https://img.vietqr.io/image/${settings.bankId}-${settings.accountNo}-compact2.png?amount=${order.finalAmount}&addInfo=${encodeURIComponent(`HD ${order.orderCode}`)}&accountName=${encodeURIComponent(settings.accountName)}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-stone-200 flex flex-col max-h-[95vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Top Bar */}
        <div className="px-5 py-3 border-b border-stone-100 flex items-center justify-between bg-stone-50 print:hidden">
          <div className="flex items-center gap-2 text-emerald-800 font-semibold text-xs">
            <CheckCircle className="w-4 h-4 text-emerald-600" />
            <span>Hóa đơn điện tử</span>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => handlePrint(false)}
              className="p-1.5 text-stone-600 hover:text-stone-900 hover:bg-stone-200 rounded-lg transition-colors cursor-pointer"
              title="In hóa đơn"
              aria-label="In hóa đơn"
            >
              <Printer className="w-4 h-4" />
            </button>
            <button
              onClick={handleShare}
              className="p-1.5 text-stone-600 hover:text-stone-900 hover:bg-stone-200 rounded-lg transition-colors cursor-pointer"
              title="Chia sẻ"
              aria-label="Chia sẻ"
            >
              <Share2 className="w-4 h-4" />
            </button>
            <button
              onClick={() => setActiveReceiptOrder(null)}
              className="p-1.5 text-stone-400 hover:text-stone-700 hover:bg-stone-200 rounded-lg transition-colors cursor-pointer"
              aria-label="Đóng"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Printable Thermal Receipt Card */}
        <div id="printable-receipt" className="p-6 overflow-y-auto space-y-4 text-stone-800 bg-white">
          {/* Restaurant Header */}
          <div className="text-center border-b border-dashed border-stone-300 pb-4">
            {settings.logoUrl && (
              <img
                src={settings.logoUrl}
                alt="Logo"
                className="w-12 h-12 object-contain mx-auto mb-1.5 rounded-full"
                onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }}
              />
            )}
            <h2 className="font-serif text-xl font-bold tracking-tight text-stone-900 uppercase">
              {settings.name}
            </h2>
            <p className="text-xs text-stone-600 mt-0.5">
              {settings.slogan}
            </p>
            <p className="text-[11px] text-stone-500 mt-1">
              {settings.address}
            </p>
            <p className="text-[11px] text-stone-500">
              Hotline: {settings.hotline} {settings.taxId ? `· MST: ${settings.taxId}` : ''}
            </p>
          </div>

          {/* Receipt Info */}
          <div className="text-center my-2">
            <h3 className="font-bold text-sm tracking-wider uppercase text-stone-900">
              PHIẾU THANH TOÁN
            </h3>
            <p className="text-xs font-mono font-bold text-stone-700 mt-0.5">
              Số: #{order.orderCode}
            </p>
          </div>

          <div className="text-xs space-y-1 text-stone-600 border-b border-dashed border-stone-200 pb-3">
            <div className="flex justify-between">
              <span>Bàn/Khu vực:</span>
              <span className="font-bold text-stone-900">{order.tableName || (order.orderType === 'takeaway' ? 'Khách mang về' : 'Tại quán')}</span>
            </div>
            <div className="flex justify-between">
              <span>Khách hàng:</span>
              <span className="font-medium text-stone-800">{order.customerName}</span>
            </div>
            <div className="flex justify-between">
              <span>Thời gian:</span>
              <span className="tabular-nums font-mono">{formatDateTime(order.paidAt || order.createdAt)}</span>
            </div>
            <div className="flex justify-between">
              <span>Nhân viên / Thu ngân:</span>
              <span>{order.staffName || 'Hòn Cau POS'}</span>
            </div>
            <div className="flex justify-between">
              <span>Hình thức:</span>
              <span className="font-semibold uppercase text-stone-900">{order.paymentMethod}</span>
            </div>
          </div>

          {/* Itemized Table */}
          <div className="space-y-2 border-b border-dashed border-stone-200 pb-3">
            <div className="grid grid-cols-12 text-[11px] font-bold text-stone-500 uppercase pb-1">
              <span className="col-span-6">Tên món</span>
              <span className="col-span-2 text-center">SL</span>
              <span className="col-span-4 text-right">T.Tiền</span>
            </div>
            {order.items.map((it, idx) => (
              <div key={idx} className="grid grid-cols-12 text-xs py-1 items-start">
                <div className="col-span-6 pr-1">
                  <div className="font-medium text-stone-900 leading-snug">{it.name}</div>
                  <div className="text-[10px] text-stone-500 tabular-nums">
                    {formatVND(it.price)}
                    {it.discount && it.discount > 0 ? (
                      <span className="text-emerald-700 ml-1">(-{formatVND(it.discount)})</span>
                    ) : null}
                  </div>
                </div>
                <div className="col-span-2 text-center font-mono text-stone-700">
                  {it.quantity}
                </div>
                <div className="col-span-4 text-right font-mono font-semibold text-stone-900 tabular-nums">
                  {formatVND(Math.max(0, (it.price - (it.discount || 0)) * it.quantity))}
                </div>
              </div>
            ))}
          </div>

          {/* Totals Breakdown */}
          <div className="space-y-1.5 text-xs text-stone-700 border-b border-dashed border-stone-300 pb-3">
            <div className="flex justify-between">
              <span>Tổng tiền món:</span>
              <span className="font-mono tabular-nums">{formatVND(order.totalAmount)}</span>
            </div>

            {order.discountAmount > 0 && (
              <div className="flex justify-between text-emerald-700 font-medium">
                <span>Ưu đãi / Giảm giá{order.discountNote ? ` (${order.discountNote})` : ''}:</span>
                <span className="font-mono tabular-nums">-{formatVND(order.discountAmount)}</span>
              </div>
            )}

            {order.surchargeAmount !== undefined && order.surchargeAmount > 0 && (
              <div className="flex justify-between text-stone-700">
                <span>Phụ thu{order.surchargeNote ? ` (${order.surchargeNote})` : ''}:</span>
                <span className="font-mono tabular-nums">+{formatVND(order.surchargeAmount)}</span>
              </div>
            )}

            {order.vatAmount !== undefined && order.vatAmount > 0 && (
              <div className="flex justify-between text-stone-700">
                <span>Thuế VAT ({order.vatRate || 8}%):</span>
                <span className="font-mono tabular-nums">+{formatVND(order.vatAmount)}</span>
              </div>
            )}

            <div className="flex justify-between items-baseline pt-1 border-t border-stone-100">
              <span className="font-bold text-stone-900 text-sm">TỔNG THANH TOÁN:</span>
              <span className="font-extrabold text-base text-amber-900 font-mono tabular-nums">
                {formatVND(order.finalAmount)}
              </span>
            </div>
          </div>

          {/* Footer Note & VietQR Code */}
          <div className="text-center pt-2 space-y-2">
            <div className="inline-block p-1 border border-stone-200 rounded-xl bg-white shadow-2xs">
              <img
                src={vietQrReceiptUrl}
                alt="VietQR Hóa đơn"
                className="w-24 h-24 mx-auto"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = `https://api.qrserver.com/v1/create-qr-code/?size=96x96&data=HONCAU-${order.orderCode}`;
                }}
              />
            </div>
            <p className="text-[11px] text-stone-500 leading-snug">
              Quét mã VietQR để thanh toán hoặc lưu đối soát
              <br />
              Cảm ơn Quý khách & Hẹn gặp lại tại {settings.name}!
              <br />
              <span className="italic font-medium">Wifi: {settings.wifiName} / Mật khẩu: {settings.wifiPass}</span>
            </p>
          </div>
        </div>

        {/* Printer Setup & Paper Size Controls */}
        <div className="px-5 py-2.5 bg-stone-100 border-t border-stone-200 flex flex-wrap items-center justify-between gap-2 text-xs print:hidden">
          <div className="flex items-center gap-1.5 text-stone-600 font-semibold">
            <Laptop className="w-3.5 h-3.5 text-amber-600" />
            <span>Khổ in máy tính:</span>
          </div>

          <div className="flex items-center gap-1 bg-white p-0.5 rounded-lg border border-stone-200 shadow-2xs">
            <button
              type="button"
              onClick={() => setPaperSize('80mm')}
              className={`px-2 py-0.5 rounded-md font-semibold text-[11px] transition-colors cursor-pointer ${
                paperSize === '80mm'
                  ? 'bg-amber-600 text-white shadow-2xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              K80 (80mm)
            </button>
            <button
              type="button"
              onClick={() => setPaperSize('58mm')}
              className={`px-2 py-0.5 rounded-md font-semibold text-[11px] transition-colors cursor-pointer ${
                paperSize === '58mm'
                  ? 'bg-amber-600 text-white shadow-2xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              K58 (58mm)
            </button>
            <button
              type="button"
              onClick={() => setPaperSize('auto')}
              className={`px-2 py-0.5 rounded-md font-semibold text-[11px] transition-colors cursor-pointer ${
                paperSize === 'auto'
                  ? 'bg-amber-600 text-white shadow-2xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              A4 / A5
            </button>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="p-4 border-t border-stone-200 bg-stone-50 flex flex-col gap-2 print:hidden">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handlePrint(false)}
              className="flex-1 py-2.5 px-4 text-xs sm:text-sm font-bold text-white bg-stone-900 hover:bg-stone-800 rounded-xl transition-all shadow flex items-center justify-center gap-2 cursor-pointer hover:scale-[1.01] active:scale-[0.99]"
            >
              <Printer className="w-4 h-4 text-amber-400" />
              <span>In Ngay Ra Máy In Máy Tính</span>
            </button>

            <button
              type="button"
              onClick={() => handlePrint(true)}
              className="py-2.5 px-3 text-xs font-semibold text-stone-700 bg-white border border-stone-300 hover:bg-stone-100 rounded-xl transition-colors cursor-pointer flex items-center gap-1.5 shadow-2xs"
              title="Mở cửa sổ in toàn màn hình nếu trình duyệt đang chặn in trong khung nhúng"
            >
              <ExternalLink className="w-3.5 h-3.5 text-stone-600" />
              <span className="hidden sm:inline">Cửa sổ in riêng</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveReceiptOrder(null)}
              className="py-2.5 px-3 text-xs font-semibold text-stone-600 bg-stone-200/80 hover:bg-stone-300 rounded-xl transition-colors cursor-pointer"
            >
              Đóng
            </button>
          </div>

          <p className="text-[11px] text-stone-500 text-center flex items-center justify-center gap-1">
            <Info className="w-3 h-3 text-amber-600 shrink-0" />
            <span>Hộp thoại máy in sẽ mở ra: hãy chọn máy in cài trên máy tính của bạn (Xprinter, Epson, Canon...)</span>
          </p>
        </div>
      </div>
    </div>
  );
};
