import React, { useState } from 'react';
import { useRestaurant } from '../../context/RestaurantContext';
import { convertDriveUrlToDirect } from '../../utils/formatters';
import { 
  Building2, 
  Palette, 
  QrCode, 
  Receipt, 
  FileSpreadsheet, 
  Save, 
  RefreshCw, 
  Wifi, 
  Phone, 
  MapPin, 
  Percent, 
  ShieldCheck, 
  Copy, 
  Check, 
  ExternalLink,
  Sparkles,
  Image as ImageIcon
} from 'lucide-react';

const PRESET_COLORS = [
  { name: 'Vàng Hổ Phách (Mặc định)', hex: '#d97706', bg: 'bg-amber-600' },
  { name: 'Xanh Biển Côn Đảo', hex: '#0284c7', bg: 'bg-sky-600' },
  { name: 'Xanh Ngọc Emerald', hex: '#059669', bg: 'bg-emerald-600' },
  { name: 'Đỏ San Hô', hex: '#dc2626', bg: 'bg-rose-600' },
  { name: 'Tím Quý Phái', hex: '#7c3aed', bg: 'bg-purple-600' },
  { name: 'Cam Hoàng Hôn', hex: '#ea580c', bg: 'bg-orange-600' },
  { name: 'Xanh Navy Đậm', hex: '#1e3a8a', bg: 'bg-blue-900' },
];

const POPULAR_BANKS = [
  { id: 'MB', name: 'MB Bank (Quân Đội)' },
  { id: 'VCB', name: 'Vietcombank' },
  { id: 'ICB', name: 'VietinBank' },
  { id: 'BIDV', name: 'BIDV' },
  { id: 'TCB', name: 'Techcombank' },
  { id: 'ACB', name: 'ACB' },
  { id: 'VPB', name: 'VPBank' },
  { id: 'TPB', name: 'TPBank' },
  { id: 'STB', name: 'Sacombank' },
  { id: 'HDB', name: 'HDBank' },
  { id: 'VIB', name: 'VIB' },
];

export const RestaurantSettingsView: React.FC = () => {
  const { settings, updateSettings, showToast, syncOrdersToGoogleSheets } = useRestaurant();

  // Local form state
  const [formData, setFormData] = useState(settings);
  const [isCopiedScript, setIsCopiedScript] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [showScriptModal, setShowScriptModal] = useState(false);

  const handleInputChange = (field: keyof typeof settings, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleLogoUrlChange = (val: string) => {
    const directUrl = convertDriveUrlToDirect(val);
    setFormData((prev) => ({ ...prev, logoUrl: directUrl }));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings(formData);
  };

  const handleManualSync = async () => {
    setIsSyncing(true);
    await syncOrdersToGoogleSheets(formData.googleSheetsWebhookUrl);
    setIsSyncing(false);
  };

  const googleAppsScriptTemplate = `// Google Apps Script để nhận đơn hàng từ Hòn Cau Quán và ghi vào Google Sheets
// Bước 1: Mở Google Sheets -> Tiện ích mở rộng -> Apps Script
// Bước 2: Xóa code cũ, dán toàn bộ đoạn code này vào -> Nhấn Lưu
// Bước 3: Triển khai -> Tùy chọn triển khai mới -> Loại: Ứng dụng web
//         (Quyền truy cập: "Bất kỳ ai" / Anyone)
// Bước 4: Copy link Webhook URL nhận được và dán vào phần cài đặt của quán!

function doPost(e) {
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    var data = JSON.parse(e.postData.contents);
    
    // Tạo tiêu đề nếu bảng tính còn trống
    if (sheet.getLastRow() === 0) {
      sheet.appendRow([
        "Thời Gian Đồng Bộ",
        "Mã Đơn",
        "Bàn / Khu Vực",
        "Hình Thức",
        "Tên Khách Hàng",
        "Số Điện Thoại",
        "Danh Sách Món",
        "Tổng Tiền Món",
        "Giảm Giá",
        "Phụ Thu",
        "Thuế VAT",
        "Thực Thu",
        "Phương Thức TT",
        "Trạng Thái TT",
        "Trạng Thái Đơn",
        "Giờ Đặt Đơn"
      ]);
      sheet.getRange(1, 1, 1, 16).setFontWeight("bold").setBackground("#fef3c7");
    }
    
    // Ghi các đơn hàng mới
    if (data.orders && data.orders.length > 0) {
      data.orders.forEach(function(o) {
        sheet.appendRow([
          new Date(),
          o.orderCode,
          o.tableName,
          o.orderType,
          o.customerName,
          o.customerPhone,
          o.itemsSummary,
          o.totalAmount,
          o.discountAmount,
          o.surchargeAmount,
          o.vatAmount,
          o.finalAmount,
          o.paymentMethod,
          o.paymentStatus,
          o.orderStatus,
          o.createdAt
        ]);
      });
    }
    
    return ContentService.createTextOutput(JSON.stringify({ status: "success", count: data.orders.length }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ status: "error", message: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}`;

  const copyScriptToClipboard = () => {
    navigator.clipboard.writeText(googleAppsScriptTemplate);
    setIsCopiedScript(true);
    showToast('Đã sao chép kịch bản Google Apps Script!');
    setTimeout(() => setIsCopiedScript(false), 2500);
  };

  const testQrUrl = `https://img.vietqr.io/image/${formData.bankId}-${formData.accountNo}-compact2.png?amount=50000&addInfo=${encodeURIComponent('TEST QR')}&accountName=${encodeURIComponent(formData.accountName)}`;

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Top Banner */}
      <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-700">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <h2 className="font-serif text-xl font-bold text-stone-900">
              Cài Đặt Quán & Nhận Diện Thương Hiệu
            </h2>
            <p className="text-xs text-stone-500 mt-0.5">
              Tùy biến tên nhà hàng, logo, tài khoản VietQR, thuế VAT, phụ thu và màu sắc giao diện theo logo.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleSave}
          className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs shadow-sm flex items-center gap-2 transition-all cursor-pointer shrink-0"
        >
          <Save className="w-4 h-4" />
          <span>Lưu Cài Đặt (Áp dụng ngay)</span>
        </button>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Section 1: Thông Tin Chung & Logo */}
        <div className="bg-white rounded-2xl border border-stone-200 shadow-xs p-6 space-y-5">
          <div className="flex items-center gap-2 border-b border-stone-100 pb-3">
            <Building2 className="w-4 h-4 text-amber-600" />
            <h3 className="font-serif text-base font-bold text-stone-900">
              1. Thông Tin Cơ Bản & Logo Nhà Hàng
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-stone-700 mb-1">
                Tên quán / Nhà hàng *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                required
                placeholder="Ví dụ: Hòn Cau Quán"
                className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/20 font-bold text-stone-900"
              />
            </div>

            <div>
              <label className="block font-semibold text-stone-700 mb-1">
                Khẩu hiệu / Slogan
              </label>
              <input
                type="text"
                value={formData.slogan}
                onChange={(e) => handleInputChange('slogan', e.target.value)}
                placeholder="Ví dụ: Hải Sản Tươi Sống & Ẩm Thực Biển Côn Đảo"
                className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/20"
              />
            </div>

            <div>
              <label className="block font-semibold text-stone-700 mb-1 flex items-center gap-1">
                <Phone className="w-3.5 h-3.5 text-stone-400" />
                <span>Hotline liên hệ / Đặt bàn</span>
              </label>
              <input
                type="text"
                value={formData.hotline}
                onChange={(e) => handleInputChange('hotline', e.target.value)}
                placeholder="0903 888 666"
                className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/20 font-medium"
              />
            </div>

            <div>
              <label className="block font-semibold text-stone-700 mb-1">
                Mã số thuế (In trên hóa đơn)
              </label>
              <input
                type="text"
                value={formData.taxId}
                onChange={(e) => handleInputChange('taxId', e.target.value)}
                placeholder="3401234567"
                className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/20"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block font-semibold text-stone-700 mb-1 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-stone-400" />
                <span>Địa chỉ quán</span>
              </label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
                placeholder="Đường Hùng Vương, Khu 2, Côn Đảo, Bà Rịa - Vũng Tàu"
                className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/20"
              />
            </div>

            <div>
              <label className="block font-semibold text-stone-700 mb-1 flex items-center gap-1">
                <Wifi className="w-3.5 h-3.5 text-stone-400" />
                <span>Tên Wi-Fi quán</span>
              </label>
              <input
                type="text"
                value={formData.wifiName}
                onChange={(e) => handleInputChange('wifiName', e.target.value)}
                placeholder="HonCauQuan_5G"
                className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/20"
              />
            </div>

            <div>
              <label className="block font-semibold text-stone-700 mb-1">
                Mật khẩu Wi-Fi (In lên hóa đơn cho khách)
              </label>
              <input
                type="text"
                value={formData.wifiPass}
                onChange={(e) => handleInputChange('wifiPass', e.target.value)}
                placeholder="honcau888"
                className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/20 font-mono"
              />
            </div>

            {/* Logo Link (Supports Google Drive & Web URLs) */}
            <div className="md:col-span-2 bg-stone-50 p-4 rounded-xl border border-stone-200/80 space-y-3">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                <div>
                  <label className="block font-semibold text-stone-800 flex items-center gap-1.5">
                    <ImageIcon className="w-4 h-4 text-amber-600" />
                    <span>Logo Nhà Hàng (Hỗ trợ link Google Drive hoặc Web URL bất kỳ)</span>
                  </label>
                  <p className="text-[11px] text-stone-500 mt-0.5">
                    Dán link chia sẻ từ Google Drive (ví dụ: drive.google.com/file/d/...) hệ thống sẽ tự động chuyển thành ảnh hiển thị.
                  </p>
                </div>

                {formData.logoUrl && (
                  <div className="flex items-center gap-2 bg-white px-2.5 py-1.5 rounded-lg border border-stone-200 shrink-0">
                    <span className="text-[10px] text-stone-500">Xem trước:</span>
                    <img
                      src={formData.logoUrl}
                      alt="Logo preview"
                      className="w-8 h-8 rounded-lg object-cover border border-stone-200 shadow-2xs"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=200&q=80';
                      }}
                    />
                  </div>
                )}
              </div>

              <input
                type="text"
                value={formData.logoUrl}
                onChange={(e) => handleLogoUrlChange(e.target.value)}
                placeholder="https://drive.google.com/file/d/... hoặc https://..."
                className="w-full px-3 py-2 bg-white border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/20 text-xs font-mono"
              />
            </div>

            {/* Header Banner Image (Ảnh Bìa Nền Khung Đầu Trang) */}
            <div className="md:col-span-2 bg-stone-50 p-4 rounded-xl border border-stone-200/80 space-y-3">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                <div>
                  <label className="block font-semibold text-stone-800 flex items-center gap-1.5">
                    <ImageIcon className="w-4 h-4 text-amber-600" />
                    <span>Ảnh Bìa Nền Khung Đầu Trang (Banner mặt tiền quán Hòn Cau Quán)</span>
                  </label>
                  <p className="text-[11px] text-stone-500 mt-0.5">
                    Ảnh hiển thị làm nền ở đầu trang khách gọi món. Bạn có thể tải file ảnh từ máy (file 1.jpg) hoặc dán link ảnh bất kỳ.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <label className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-medium cursor-pointer shadow-xs transition-colors flex items-center gap-1.5">
                    <span>📁 Tải ảnh từ máy (1.jpg)</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onload = (event) => {
                            const result = event.target?.result as string;
                            if (result) {
                              setFormData((prev) => ({ ...prev, headerBannerUrl: result }));
                              showToast('Đã nạp ảnh bìa mới thành công! Nhấn "Lưu Cài Đặt" để áp dụng.');
                            }
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                    />
                  </label>

                  <button
                    type="button"
                    onClick={() => {
                      setFormData((prev) => ({ ...prev, headerBannerUrl: '/1.jpg' }));
                      showToast('Đã chọn lại ảnh mặt tiền Hòn Cau Quán mặc định!');
                    }}
                    className="px-2.5 py-1.5 bg-white hover:bg-stone-100 text-stone-700 border border-stone-200 rounded-lg text-xs font-medium cursor-pointer transition-colors"
                  >
                    Dùng ảnh quán (/1.jpg)
                  </button>
                </div>
              </div>

              {/* Banner Preview */}
              <div className="relative w-full h-44 sm:h-52 rounded-2xl overflow-hidden border border-stone-200 shadow-md bg-stone-900 group">
                <img
                  src={formData.headerBannerUrl || '/1.jpg'}
                  alt="Header Banner preview"
                  className="w-full h-full object-cover object-[center_35%]"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/hon_cau_hero.svg';
                  }}
                />
                <div className="absolute inset-0 bg-transparent flex items-center p-6">
                  {/* Khung nội dung trong suốt hoàn toàn - Chỉ có chữ hiển thị */}
                  <div className="bg-transparent border-0 p-0 text-white max-w-sm space-y-1">
                    <span className="inline-block text-[10px] font-bold text-amber-300 uppercase tracking-wide bg-black/40 px-2 py-0.5 rounded-full border border-white/20 shadow-sm">
                      Nền trong suốt 100%
                    </span>
                    <h4 className="font-serif text-lg sm:text-xl font-extrabold text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.95)]">
                      {formData.name || 'Hòn Cau Quán'}
                    </h4>
                    <p className="text-xs text-amber-400 font-bold drop-shadow-[0_2px_8px_rgba(0,0,0,0.95)]">
                      {formData.slogan || 'Hải Sản Tươi Sống Côn Đảo'}
                    </p>
                    <p className="text-[11px] text-white font-medium drop-shadow-[0_1px_4px_rgba(0,0,0,0.95)] line-clamp-2">
                      Chỉ có chữ hiển thị, toàn bộ hình nền quán được thấy rõ ràng 100% không bị che.
                    </p>
                  </div>
                </div>
              </div>

              <div className="text-[11px] text-stone-600 flex items-center gap-1.5 bg-amber-50/70 p-2.5 rounded-xl border border-amber-200/60">
                <Sparkles className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                <span><strong>Nền trong suốt hoàn toàn:</strong> Banner chỉ hiển thị chữ nghệ thuật nổi bật, toàn bộ nền trong suốt 100% giúp khách hàng ngắm trọn vẹn cảnh quán bạn đã cài đặt.</span>
              </div>

              <input
                type="text"
                value={formData.headerBannerUrl || ''}
                onChange={(e) => {
                  const directUrl = convertDriveUrlToDirect(e.target.value);
                  setFormData((prev) => ({ ...prev, headerBannerUrl: directUrl }));
                }}
                placeholder="Link ảnh: https://... hoặc /1.jpg"
                className="w-full px-3 py-2 bg-white border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/20 text-xs font-mono"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Tùy Chỉnh Màu Sắc Chủ Đạo Theo Logo */}
        <div className="bg-white rounded-2xl border border-stone-200 shadow-xs p-6 space-y-4">
          <div className="flex items-center gap-2 border-b border-stone-100 pb-3">
            <Palette className="w-4 h-4 text-amber-600" />
            <h3 className="font-serif text-base font-bold text-stone-900">
              2. Tùy Chỉnh Màu Sắc Chủ Đạo Theo Logo
            </h3>
          </div>

          <p className="text-xs text-stone-500">
            Chọn tông màu phù hợp nhất với logo của quán. Màu này sẽ tự động áp dụng đồng bộ lên hệ thống, nút bấm, điểm nhấn và hóa đơn.
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-3">
            {PRESET_COLORS.map((c) => {
              const isSelected = formData.primaryColor.toLowerCase() === c.hex.toLowerCase();
              return (
                <button
                  type="button"
                  key={c.hex}
                  onClick={() => handleInputChange('primaryColor', c.hex)}
                  className={`p-3 rounded-xl border text-left flex flex-col justify-between h-20 transition-all cursor-pointer ${
                    isSelected
                      ? 'border-stone-900 ring-2 ring-stone-900 shadow-sm'
                      : 'border-stone-200 hover:border-stone-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className={`w-5 h-5 rounded-full ${c.bg} shadow-2xs border border-white`} />
                    {isSelected && <Check className="w-4 h-4 text-stone-900 font-bold" />}
                  </div>
                  <div>
                    <span className="text-[11px] font-bold text-stone-800 block line-clamp-1">
                      {c.name}
                    </span>
                    <span className="text-[10px] text-stone-400 font-mono">
                      {c.hex}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-3 pt-2">
            <label className="text-xs font-semibold text-stone-700 whitespace-nowrap">
              Hoặc nhập mã Hex màu logo tùy ý:
            </label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={formData.primaryColor}
                onChange={(e) => handleInputChange('primaryColor', e.target.value)}
                className="w-8 h-8 rounded-lg border border-stone-200 cursor-pointer"
              />
              <input
                type="text"
                value={formData.primaryColor}
                onChange={(e) => handleInputChange('primaryColor', e.target.value)}
                placeholder="#d97706"
                className="px-3 py-1.5 text-xs font-mono font-bold bg-stone-50 border border-stone-200 rounded-lg w-28 uppercase"
              />
            </div>
          </div>
        </div>

        {/* Section 3: Cài Đặt VietQR Thanh Toán Tự Động */}
        <div className="bg-white rounded-2xl border border-stone-200 shadow-xs p-6 space-y-4">
          <div className="flex items-center gap-2 border-b border-stone-100 pb-3">
            <QrCode className="w-4 h-4 text-blue-600" />
            <h3 className="font-serif text-base font-bold text-stone-900">
              3. Cài Đặt Thanh Toán Quét Mã VietQR Tự Động
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  Ngân hàng thụ hưởng *
                </label>
                <select
                  value={formData.bankId}
                  onChange={(e) => {
                    const sel = POPULAR_BANKS.find((b) => b.id === e.target.value);
                    setFormData((prev) => ({
                      ...prev,
                      bankId: e.target.value,
                      bankName: sel ? sel.name : prev.bankName,
                    }));
                  }}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-medium cursor-pointer"
                >
                  {POPULAR_BANKS.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.id} - {b.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  Số tài khoản nhận tiền *
                </label>
                <input
                  type="text"
                  value={formData.accountNo}
                  onChange={(e) => handleInputChange('accountNo', e.target.value.replace(/\s+/g, ''))}
                  required
                  placeholder="0903888666"
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-mono font-bold text-stone-900 text-sm"
                />
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  Tên chủ tài khoản (Viết hoa không dấu) *
                </label>
                <input
                  type="text"
                  value={formData.accountName}
                  onChange={(e) => handleInputChange('accountName', e.target.value.toUpperCase())}
                  required
                  placeholder="HON CAU QUAN"
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-bold uppercase text-stone-900"
                />
              </div>
            </div>

            {/* Test VietQR Live Preview */}
            <div className="bg-stone-50 p-4 rounded-xl border border-stone-200 text-center flex flex-col items-center justify-center space-y-2">
              <span className="text-[11px] font-bold text-stone-600 uppercase tracking-wider">
                Mã VietQR Mẫu Thử
              </span>
              <div className="bg-white p-2 rounded-xl border border-stone-200 shadow-2xs">
                <img
                  src={testQrUrl}
                  alt="VietQR Test"
                  className="w-28 h-28 object-contain"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = `https://api.qrserver.com/v1/create-qr-code/?size=112x112&data=VIETQR-${formData.bankId}-${formData.accountNo}`;
                  }}
                />
              </div>
              <p className="text-[10px] text-stone-500">
                Tự động sinh kèm số tiền & nội dung đơn khi khách thanh toán
              </p>
            </div>
          </div>
        </div>

        {/* Section 4: Thiết Lập Thuế VAT & Phụ Thu */}
        <div className="bg-white rounded-2xl border border-stone-200 shadow-xs p-6 space-y-4">
          <div className="flex items-center gap-2 border-b border-stone-100 pb-3">
            <Percent className="w-4 h-4 text-emerald-600" />
            <h3 className="font-serif text-base font-bold text-stone-900">
              4. Thiết Lập Thuế VAT & Phụ Thu Linh Hoạt
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            {/* VAT Config */}
            <div className="bg-stone-50 p-4 rounded-xl border border-stone-200/80 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-stone-900">Thuế Giá Trị Gia Tăng (VAT)</h4>
                  <p className="text-[11px] text-stone-500">Tự động tính thuế vào đơn hàng</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isVatEnabled}
                    onChange={(e) => handleInputChange('isVatEnabled', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-stone-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                </label>
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  Thuế suất VAT (%) mặc định:
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="0"
                    max="30"
                    value={formData.defaultVatRate}
                    onChange={(e) => handleInputChange('defaultVatRate', parseFloat(e.target.value) || 0)}
                    disabled={!formData.isVatEnabled}
                    className="w-24 px-3 py-1.5 bg-white border border-stone-200 rounded-lg text-sm font-bold text-stone-900 disabled:opacity-50"
                  />
                  <span className="font-bold text-stone-600">%</span>
                  <div className="flex gap-1.5 ml-2">
                    {[0, 8, 10].map((rate) => (
                      <button
                        type="button"
                        key={rate}
                        onClick={() => handleInputChange('defaultVatRate', rate)}
                        disabled={!formData.isVatEnabled}
                        className="px-2 py-1 rounded bg-white border border-stone-200 text-[11px] font-semibold hover:bg-stone-100 disabled:opacity-50 cursor-pointer"
                      >
                        {rate}%
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Surcharge Config */}
            <div className="bg-stone-50 p-4 rounded-xl border border-stone-200/80 space-y-3">
              <div>
                <h4 className="font-bold text-stone-900">Phụ Thu Dịch Vụ / Lễ Tết</h4>
                <p className="text-[11px] text-stone-500">Có thể bật/tắt hoặc điều chỉnh linh hoạt từng đơn</p>
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  Số tiền phụ thu mặc định (VND):
                </label>
                <input
                  type="number"
                  step="5000"
                  min="0"
                  value={formData.defaultSurcharge}
                  onChange={(e) => handleInputChange('defaultSurcharge', parseInt(e.target.value) || 0)}
                  placeholder="0"
                  className="w-full px-3 py-1.5 bg-white border border-stone-200 rounded-lg text-xs font-mono font-bold text-stone-900"
                />
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  Lý do phụ thu hiển thị trên hóa đơn:
                </label>
                <input
                  type="text"
                  value={formData.surchargeReason}
                  onChange={(e) => handleInputChange('surchargeReason', e.target.value)}
                  placeholder="Phụ thu phòng VIP / Phí lễ"
                  className="w-full px-3 py-1.5 bg-white border border-stone-200 rounded-lg text-xs"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Section 5: Đồng Bộ Dữ Liệu Tức Thời Lên Google Sheets */}
        <div className="bg-white rounded-2xl border border-stone-200 shadow-xs p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-stone-100 pb-3">
            <div className="flex items-center gap-2">
              <FileSpreadsheet className="w-4 h-4 text-emerald-700" />
              <h3 className="font-serif text-base font-bold text-stone-900">
                5. Đồng Bộ Dữ Liệu Tức Thời Lên Google Sheets
              </h3>
            </div>
            {formData.lastGoogleSheetsSync && (
              <span className="text-[10px] text-stone-500 bg-stone-100 px-2 py-0.5 rounded">
                Đồng bộ gần nhất: {formData.lastGoogleSheetsSync}
              </span>
            )}
          </div>

          <p className="text-xs text-stone-500 leading-relaxed">
            Hệ thống hỗ trợ gửi dữ liệu đơn hàng và doanh thu theo thời gian thực về bảng tính Google Sheets của bạn thông qua Google Apps Script Webhook.
          </p>

          <div className="space-y-3 text-xs">
            <div>
              <label className="block font-semibold text-stone-700 mb-1">
                Link Webhook Google Apps Script (URL Web App):
              </label>
              <input
                type="url"
                value={formData.googleSheetsWebhookUrl || ''}
                onChange={(e) => handleInputChange('googleSheetsWebhookUrl', e.target.value)}
                placeholder="https://script.google.com/macros/s/AKfycbx.../exec"
                className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 font-mono text-xs"
              />
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.autoSyncGoogleSheets}
                  onChange={(e) => handleInputChange('autoSyncGoogleSheets', e.target.checked)}
                  className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                />
                <span className="text-xs font-medium text-stone-700">
                  Tự động đẩy đơn lên Google Sheets khi khách thanh toán thành công
                </span>
              </label>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => setShowScriptModal(true)}
                  className="px-3 py-1.5 rounded-lg border border-stone-300 hover:bg-stone-50 text-stone-700 text-xs font-semibold flex items-center gap-1 cursor-pointer"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Xem Code Apps Script mẫu</span>
                </button>

                <button
                  type="button"
                  disabled={isSyncing}
                  onClick={handleManualSync}
                  className="px-4 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                  <span>{isSyncing ? 'Đang gửi...' : 'Đồng Bộ Ngay'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Save Action */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="submit"
            className="w-full sm:w-auto px-8 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-sm shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            <Save className="w-4 h-4" />
            <span>Lưu Toàn Bộ Cài Đặt Quán</span>
          </button>
        </div>
      </form>

      {/* Script Template Modal */}
      {showScriptModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl p-6 max-w-2xl w-full space-y-4 shadow-2xl border border-stone-200 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <div>
                <h3 className="font-serif text-base font-bold text-stone-900">
                  Mã Nguồn Google Apps Script Đồng Bộ Google Sheets
                </h3>
                <p className="text-xs text-stone-500">
                  Copy mã này và dán vào Google Sheets của bạn trong 30 giây để kích hoạt đồng bộ tự động.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowScriptModal(false)}
                className="text-stone-400 hover:text-stone-700 p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="flex-1 overflow-y-auto">
              <pre className="p-3 bg-stone-900 text-amber-200 text-xs rounded-xl overflow-x-auto font-mono leading-relaxed select-all">
                {googleAppsScriptTemplate}
              </pre>
            </div>

            <div className="pt-2 border-t border-stone-100 flex items-center justify-between">
              <span className="text-xs text-stone-500">
                Cực kỳ an toàn, chạy trực tiếp trên Google Drive cá nhân của bạn.
              </span>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={copyScriptToClipboard}
                  className="px-4 py-2 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 shadow-sm"
                >
                  {isCopiedScript ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  <span>{isCopiedScript ? 'Đã Copy!' : 'Sao Chép Toàn Bộ Mã'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowScriptModal(false)}
                  className="px-4 py-2 border border-stone-300 hover:bg-stone-100 rounded-xl text-xs font-semibold text-stone-700 cursor-pointer"
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
