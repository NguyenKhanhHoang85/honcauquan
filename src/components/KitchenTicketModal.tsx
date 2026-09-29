import React, { useState } from 'react';
import { useRestaurant } from '../context/RestaurantContext';
import { formatDateTime } from '../utils/formatters';
import { printElement, openPrintWindow, generatePrintableHtml } from '../utils/printHelpers';
import { Printer, X, ChefHat, CheckCircle2, Layers, Laptop, ExternalLink, Info } from 'lucide-react';

export const KitchenTicketModal: React.FC = () => {
  const { activeKitchenPrintOrder, setActiveKitchenPrintOrder, showToast } = useRestaurant();
  const [printScope, setPrintScope] = useState<'all' | 'new_round'>('all');
  const [paperSize, setPaperSize] = useState<'80mm' | '58mm' | 'auto'>('80mm');

  if (!activeKitchenPrintOrder) return null;

  const order = activeKitchenPrintOrder.order;
  const hasMultipleRounds = (order.rounds && order.rounds.length > 1);
  const latestRoundNumber = order.rounds ? Math.max(...order.rounds.map((r) => r.roundNumber)) : 1;

  // Determine items to display on ticket
  const itemsToPrint = printScope === 'new_round' && latestRoundNumber > 1
    ? order.items.filter((i) => i.round === latestRoundNumber)
    : order.items;

  const handlePrint = (forcePopup = false) => {
    if (forcePopup) {
      const el = document.getElementById('printable-kitchen-ticket');
      if (el) {
        const fullHtml = generatePrintableHtml(
          el.innerHTML, 
          `Phiếu Bếp #${order.orderCode} - Bàn ${order.tableName || 'Khách mang về'}`, 
          paperSize
        );
        openPrintWindow(fullHtml, `PhieuBep-${order.orderCode}`);
        showToast('Đang mở trang in phiếu bếp...');
        return;
      }
    }

    showToast('Đang kết nối máy in phiếu bếp...');
    printElement('printable-kitchen-ticket', {
      title: `Phiếu Bếp #${order.orderCode} - Bàn ${order.tableName || 'Khách mang về'}`,
      width: paperSize,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-stone-200 flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header (Hidden when printing) */}
        <div className="px-5 py-3.5 border-b border-stone-100 flex items-center justify-between bg-stone-50 print:hidden">
          <div className="flex items-center gap-2 text-stone-900 font-bold text-sm">
            <ChefHat className="w-5 h-5 text-amber-600" />
            <span>In Phiếu Báo Bếp (KOT)</span>
          </div>

          <button
            onClick={() => setActiveKitchenPrintOrder(null)}
            className="p-1.5 text-stone-400 hover:text-stone-700 hover:bg-stone-200 rounded-lg cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scope selector (If order has multiple rounds / gọi thêm) */}
        {hasMultipleRounds && (
          <div className="p-3 bg-amber-50/80 border-b border-amber-200/80 print:hidden">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-amber-900 flex items-center gap-1">
                <Layers className="w-3.5 h-3.5" />
                <span>Đơn có {order.rounds?.length} đợt gọi món:</span>
              </span>
              <div className="flex gap-1">
                <button
                  type="button"
                  onClick={() => setPrintScope('new_round')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
                    printScope === 'new_round'
                      ? 'bg-amber-600 text-white shadow-2xs'
                      : 'bg-white text-stone-700 border border-stone-200'
                  }`}
                >
                  Chỉ đợt mới (Đợt {latestRoundNumber})
                </button>
                <button
                  type="button"
                  onClick={() => setPrintScope('all')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
                    printScope === 'all'
                      ? 'bg-amber-600 text-white shadow-2xs'
                      : 'bg-white text-stone-700 border border-stone-200'
                  }`}
                >
                  Tất cả các món
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Printable Kitchen Thermal Ticket */}
        <div id="printable-kitchen-ticket" className="p-6 overflow-y-auto space-y-4 bg-white text-stone-900">
          {/* Top header */}
          <div className="text-center border-b-2 border-dashed border-stone-800 pb-3">
            <span className="text-xs uppercase font-extrabold tracking-widest text-stone-500 block">
              PHIẾU BÁO CHẾ BIẾN BẾP & BAR
            </span>
            <h2 className="font-serif text-2xl font-black tracking-tight text-stone-950 mt-1">
              {order.tableName || (order.orderType === 'takeaway' ? 'MANG VỀ' : 'BÀN QUÁN')}
            </h2>
            <div className="flex items-center justify-center gap-2 mt-1">
              <span className="font-mono font-bold text-sm bg-stone-100 px-2 py-0.5 rounded">
                Mã: #{order.orderCode}
              </span>
              {hasMultipleRounds && printScope === 'new_round' && (
                <span className="bg-amber-500 text-stone-950 font-black text-xs px-2 py-0.5 rounded uppercase">
                  GỌI THÊM ĐỢT {latestRoundNumber}
                </span>
              )}
            </div>
          </div>

          {/* Ticket metadata */}
          <div className="text-xs space-y-1 text-stone-700 border-b border-dashed border-stone-300 pb-3">
            <div className="flex justify-between">
              <span>Thời gian gọi:</span>
              <span className="font-bold font-mono">{formatDateTime(new Date().toISOString())}</span>
            </div>
            <div className="flex justify-between">
              <span>Nhân viên order:</span>
              <span className="font-bold">{order.staffName || 'Nhân viên'}</span>
            </div>
            <div className="flex justify-between">
              <span>Khách hàng:</span>
              <span>{order.customerName}</span>
            </div>
            {order.note && (
              <div className="pt-1 text-stone-900 font-bold bg-amber-50 p-1.5 rounded border border-amber-200">
                Ghi chú đơn: {order.note}
              </div>
            )}
          </div>

          {/* Items to Cook */}
          <div className="space-y-3">
            <div className="flex justify-between text-xs font-bold text-stone-500 uppercase border-b border-stone-200 pb-1">
              <span>Tên Món Chế Biến</span>
              <span className="text-right">Số Lượng</span>
            </div>

            <div className="space-y-2">
              {itemsToPrint.map((item, idx) => (
                <div key={idx} className="border-b border-stone-100 pb-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <span className="font-extrabold text-base text-stone-950 block leading-tight">
                        {item.name}
                      </span>
                      {item.round && item.round > 1 && (
                        <span className="text-[10px] font-bold text-amber-700 bg-amber-100 px-1.5 py-0.2 rounded mt-0.5 inline-block">
                          Đợt {item.round} (Gọi thêm)
                        </span>
                      )}
                    </div>
                    <span className="font-black text-xl font-mono text-stone-950 bg-stone-100 px-2 py-0.5 rounded shrink-0">
                      × {item.quantity}
                    </span>
                  </div>

                  {item.note && (
                    <div className="mt-1 text-xs font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200 inline-block">
                      👉 Ghi chú: {item.note}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Footer */}
          <div className="text-center pt-3 border-t-2 border-dashed border-stone-800 text-[11px] text-stone-500">
            <span>--- Chúc Quý Khách Ngon Miệng ---</span>
          </div>
        </div>

        {/* Printer Setup & Paper Size Controls */}
        <div className="px-5 py-2.5 bg-stone-100 border-t border-stone-200 flex flex-wrap items-center justify-between gap-2 text-xs print:hidden">
          <div className="flex items-center gap-1.5 text-stone-600 font-semibold">
            <Laptop className="w-3.5 h-3.5 text-amber-600" />
            <span>Khổ in máy in bếp:</span>
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

        {/* Action Buttons (Hidden when printing) */}
        <div className="p-4 border-t border-stone-200 bg-stone-50 flex flex-col gap-2 print:hidden">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handlePrint(false)}
              className="flex-1 py-2.5 px-4 text-xs sm:text-sm font-bold text-white bg-amber-600 hover:bg-amber-500 rounded-xl transition-all shadow flex items-center justify-center gap-2 cursor-pointer hover:scale-[1.01] active:scale-[0.99]"
            >
              <Printer className="w-4 h-4 text-white" />
              <span>In Ngay Ra Máy In Bếp</span>
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
              onClick={() => setActiveKitchenPrintOrder(null)}
              className="py-2.5 px-3 text-xs font-semibold text-stone-600 bg-stone-200/80 hover:bg-stone-300 rounded-xl transition-colors cursor-pointer"
            >
              Đóng
            </button>
          </div>

          <p className="text-[11px] text-stone-500 text-center flex items-center justify-center gap-1">
            <Info className="w-3 h-3 text-amber-600 shrink-0" />
            <span>Hộp thoại máy in sẽ mở ra: hãy chọn máy in bếp cài trên máy tính (Xprinter, Epson, Bixolon...)</span>
          </p>
        </div>
      </div>
    </div>
  );
};
