import React, { useState } from 'react';
import { useRestaurant } from '../../context/RestaurantContext';
import { GENERATE_SEPTEMBER_DAILY_DATA, MONTHLY_SUMMARY_DATA, DailyReportItem } from '../../data/initialData';
import { formatVND } from '../../utils/formatters';
import { 
  TrendingUp, 
  Calendar, 
  Download, 
  CreditCard, 
  QrCode, 
  Users, 
  ShoppingBag, 
  DollarSign, 
  Award, 
  FileSpreadsheet,
  ChevronRight,
  Filter,
  Printer,
  RefreshCw,
  Store
} from 'lucide-react';

export const RevenueReport: React.FC = () => {
  const { orders, setActiveReceiptOrder, showToast, syncOrdersToGoogleSheets, settings } = useRestaurant();
  
  const [reportPeriod, setReportPeriod] = useState<'today' | 'yesterday' | '7days' | 'daily_september' | 'monthly' | 'custom'>('daily_september');
  const [startDate, setStartDate] = useState<string>('2026-09-01');
  const [endDate, setEndDate] = useState<string>('2026-09-30');
  const [hoveredDataPoint, setHoveredDataPoint] = useState<any | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);

  // Daily data for September 2026
  const dailyData = GENERATE_SEPTEMBER_DAILY_DATA();

  // Calculate totals for September
  const totalSepRevenue = dailyData.reduce((sum, d) => sum + d.revenue, 0);
  const totalSepOrders = dailyData.reduce((sum, d) => sum + d.orderCount, 0);
  const totalSepGuests = dailyData.reduce((sum, d) => sum + d.guestCount, 0);
  const avgOrderValue = Math.round(totalSepRevenue / totalSepOrders);

  // Dine-in vs Takeaway stats from orders
  const dineInOrders = orders.filter((o) => o.orderType === 'dine_in');
  const takeawayOrders = orders.filter((o) => o.orderType === 'takeaway');
  const dineInRevenue = dineInOrders.reduce((s, o) => s + o.finalAmount, 0);
  const takeawayRevenue = takeawayOrders.reduce((s, o) => s + o.finalAmount, 0);
  const totalRealRevenue = dineInRevenue + takeawayRevenue || 1;
  const dineInPercent = Math.round((dineInRevenue / totalRealRevenue) * 100);
  const takeawayPercent = 100 - dineInPercent;

  // Today specific (Day 22)
  const todayData = dailyData[dailyData.length - 1];

  // Hourly distribution for today
  const todayHourly = [
    { hour: '08:00 - 11:00 (Sáng)', revenue: 1650000, orders: 12 },
    { hour: '11:00 - 14:00 (Bữa trưa)', revenue: 3850000, orders: 14 },
    { hour: '14:00 - 17:00 (Chiều)', revenue: 1420000, orders: 9 },
    { hour: '17:00 - 21:00 (Bữa tối cao điểm)', revenue: 4780000, orders: 18 },
    { hour: '21:00 - 23:00 (Tiệc muộn)', revenue: 1200000, orders: 5 },
  ];

  // Top selling items
  const bestSellers = [
    { rank: 1, name: 'Cua Huỳnh Đế rang muối tuyết', category: 'Hải sản Hòn Cau', sold: 92, revenue: 34960000 },
    { rank: 2, name: 'Lẩu Hải Sản Thuyền Chài Hòn Cau', category: 'Hải sản Hòn Cau', sold: 104, revenue: 30160000 },
    { rank: 3, name: 'Tôm sú nướng muối ớt xanh', category: 'Hải sản Hòn Cau', sold: 118, revenue: 21240000 },
    { rank: 4, name: 'Cà phê sữa đá Sài Gòn', category: 'Cà phê', sold: 340, revenue: 10200000 },
    { rank: 5, name: 'Mực một nắng nướng sa tế cay', category: 'Hải sản Hòn Cau', sold: 58, revenue: 9280000 },
    { rank: 6, name: 'Trà đào cam sả', category: 'Trà', sold: 210, revenue: 8400000 },
  ];

  // Payment method statistics
  const paymentStats = [
    { name: 'VietQR (MB / Vietcombank)', percent: 48, revenue: Math.round(totalSepRevenue * 0.48), color: 'bg-blue-600' },
    { name: 'Ví điện tử MoMo', percent: 22, revenue: Math.round(totalSepRevenue * 0.22), color: 'bg-pink-600' },
    { name: 'VNPay-QR / Thẻ', percent: 15, revenue: Math.round(totalSepRevenue * 0.15), color: 'bg-indigo-600' },
    { name: 'Tiền mặt tại quầy', percent: 15, revenue: Math.round(totalSepRevenue * 0.15), color: 'bg-emerald-600' },
  ];

  // Category breakdown
  const categoryStats = [
    { name: 'Hải sản tươi sống Hòn Cau', percent: 62, revenue: Math.round(totalSepRevenue * 0.62), color: 'bg-amber-600' },
    { name: 'Cà phê & Đồ uống giải nhiệt', percent: 25, revenue: Math.round(totalSepRevenue * 0.25), color: 'bg-sky-600' },
    { name: 'Đồ ăn nhẹ & Tráng miệng', percent: 13, revenue: Math.round(totalSepRevenue * 0.13), color: 'bg-orange-500' },
  ];

  // Export to CSV function
  const handleExportCSV = () => {
    let csvContent = '\uFEFF'; // UTF-8 BOM for Excel in Vietnamese
    csvContent += 'BÁO CÁO DOANH THU NHÀ HÀNG HÒN CAU QUÁN\n';
    csvContent += `Thời gian xuất: ${new Date().toLocaleString('vi-VN')}\n\n`;

    if (reportPeriod === 'monthly') {
      csvContent += 'Tháng,Doanh Thu (VND),Số Đơn Hàng,Khách Phục Vụ,TB Đơn (VND)\n';
      MONTHLY_SUMMARY_DATA.forEach((m) => {
        csvContent += `"${m.label}",${m.revenue},${m.orders},${m.guests},${Math.round(m.revenue / m.orders)}\n`;
      });
    } else {
      csvContent += 'Ngày,Doanh Thu (VND),Số Đơn,Số Khách,VietQR (VND),MoMo (VND),Hải Sản (VND),Đồ Uống (VND)\n';
      dailyData.forEach((d) => {
        csvContent += `"${d.dayLabel}",${d.revenue},${d.orderCount},${d.guestCount},${d.vietQrRevenue},${d.momoRevenue},${d.seafoodRevenue},${d.coffeeDrinkRevenue}\n`;
      });
    }

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Bao_Cao_Doanh_Thu_Hon_Cau_Quan_${reportPeriod}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Đã tải xuống file báo cáo doanh thu Excel / CSV');
  };

  // Export orders list to Excel / CSV
  const handleExportOrdersCSV = () => {
    let csvContent = '\uFEFF'; // UTF-8 BOM
    csvContent += `DANH SÁCH CHI TIẾT ĐƠN HÀNG - ${settings.name.toUpperCase()}\n`;
    csvContent += `Thời gian xuất: ${new Date().toLocaleString('vi-VN')}\n\n`;
    csvContent += 'Mã Đơn,Bàn / Khu Vực,Hình Thức,Khách Hàng,Số Điện Thoại,Món Đã Gọi,Tổng Món (VND),Giảm Giá (VND),Phụ Thu (VND),Thuế VAT (VND),Tổng Thu (VND),Phương Thức TT,Trạng Thái TT,Thời Gian Tạo\n';

    orders.forEach((o) => {
      const itemsSummary = o.items.map((i) => `${i.name} (x${i.quantity})`).join('; ');
      csvContent += `"${o.orderCode}","${o.tableName || ''}","${o.orderType === 'dine_in' ? 'Tại quán' : 'Mang về'}","${o.customerName}","${o.customerPhone}","${itemsSummary.replace(/"/g, '""')}",${o.totalAmount},${o.discountAmount || 0},${o.surchargeAmount || 0},${o.vatAmount || 0},${o.finalAmount},"${o.paymentMethod.toUpperCase()}","${o.paymentStatus === 'paid' ? 'Đã thanh toán' : 'Chưa thanh toán'}","${new Date(o.createdAt).toLocaleString('vi-VN')}"\n`;
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Danh_Sach_Don_Hang_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Đã xuất danh sách đơn hàng ra file Excel / CSV');
  };

  // Print Report / PDF
  const handlePrintReport = () => {
    window.print();
  };

  // Max value for SVG Bar Chart
  const maxDailyRevenue = Math.max(...dailyData.map((d) => d.revenue));
  const maxMonthlyRevenue = Math.max(...MONTHLY_SUMMARY_DATA.map((m) => m.revenue));

  return (
    <div className="space-y-6">
      {/* Top Header & Period Switcher */}
      <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="font-serif text-xl sm:text-2xl font-bold text-stone-900">
              Báo Cáo Doanh Thu & Hiệu Quả Kinh Doanh
            </h2>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
              {settings.name}
            </span>
          </div>
          <p className="text-xs text-stone-500 mt-1">
            Phân tích số liệu doanh thu theo ngày, theo tháng và tỷ trọng thanh toán điện tử VietQR / MoMo.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Period selector */}
          <div className="p-1 bg-stone-100 rounded-xl flex flex-wrap items-center gap-1 text-xs">
            <button
              onClick={() => setReportPeriod('today')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                reportPeriod === 'today'
                  ? 'bg-white text-stone-900 shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              Hôm nay
            </button>
            <button
              onClick={() => setReportPeriod('yesterday')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                reportPeriod === 'yesterday'
                  ? 'bg-white text-stone-900 shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              Hôm qua
            </button>
            <button
              onClick={() => setReportPeriod('7days')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                reportPeriod === '7days'
                  ? 'bg-white text-stone-900 shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              7 Ngày qua
            </button>
            <button
              onClick={() => setReportPeriod('daily_september')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                reportPeriod === 'daily_september'
                  ? 'bg-white text-stone-900 shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              Tháng 9/2026
            </button>
            <button
              onClick={() => setReportPeriod('monthly')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                reportPeriod === 'monthly'
                  ? 'bg-white text-stone-900 shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              Theo Các Tháng
            </button>
            <button
              onClick={() => setReportPeriod('custom')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                reportPeriod === 'custom'
                  ? 'bg-white text-stone-900 shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              Tùy chọn ngày
            </button>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={handleExportCSV}
              className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer shrink-0"
              title="Xuất báo cáo doanh thu ra Excel / CSV"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>Xuất Báo Cáo</span>
            </button>
            <button
              onClick={handleExportOrdersCSV}
              className="px-3 py-1.5 bg-blue-700 hover:bg-blue-800 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer shrink-0"
              title="Xuất toàn bộ đơn hàng chi tiết ra Excel / CSV"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Xuất Đơn Hàng</span>
            </button>
            <button
              onClick={handlePrintReport}
              className="px-3 py-1.5 bg-stone-800 hover:bg-stone-900 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer shrink-0"
              title="In báo cáo doanh thu ra máy in hoặc xuất file PDF"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>In PDF / Máy In</span>
            </button>
          </div>
        </div>
      </div>

      {/* Custom Date Filter Row if custom is selected */}
      {reportPeriod === 'custom' && (
        <div className="bg-amber-50/80 p-3.5 rounded-xl border border-amber-200/80 flex flex-wrap items-center gap-3 text-xs">
          <span className="font-semibold text-amber-900 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" />
            <span>Chọn khoảng thời gian lọc:</span>
          </span>
          <div className="flex items-center gap-2">
            <label className="text-stone-600">Từ ngày:</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="px-2.5 py-1 bg-white border border-stone-300 rounded-lg text-xs"
            />
          </div>
          <div className="flex items-center gap-2">
            <label className="text-stone-600">Đến ngày:</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="px-2.5 py-1 bg-white border border-stone-300 rounded-lg text-xs"
            />
          </div>
          <span className="text-[11px] text-stone-500">
            Dữ liệu tổng hợp từ {startDate} đến {endDate}
          </span>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Revenue */}
        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-xs text-stone-500">
            <span>
              {reportPeriod === 'today'
                ? 'Doanh thu hôm nay'
                : reportPeriod === 'monthly'
                ? 'Tổng doanh thu các tháng'
                : 'Doanh thu Tháng 9/2026'}
            </span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-stone-900 font-mono tracking-tight tabular-nums">
            {formatVND(
              reportPeriod === 'today'
                ? todayData.revenue
                : reportPeriod === 'monthly'
                ? MONTHLY_SUMMARY_DATA.reduce((sum, m) => sum + m.revenue, 0)
                : totalSepRevenue
            )}
          </div>
          <div className="flex items-center gap-1 text-xs text-emerald-700 font-medium pt-1">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>+14.8% so với cùng kỳ tháng trước</span>
          </div>
        </div>

        {/* Order Count */}
        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-xs text-stone-500">
            <span>Tổng số đơn đã phục vụ</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-stone-900 font-mono tracking-tight tabular-nums">
            {reportPeriod === 'today'
              ? todayData.orderCount
              : reportPeriod === 'monthly'
              ? MONTHLY_SUMMARY_DATA.reduce((sum, m) => sum + m.orders, 0)
              : totalSepOrders}{' '}
            <span className="text-sm font-normal text-stone-500">đơn</span>
          </div>
          <div className="text-xs text-stone-500 pt-1">
            Tỷ lệ hoàn thành món: <span className="font-semibold text-stone-800">98.5%</span>
          </div>
        </div>

        {/* Guest Count & AOV */}
        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-xs text-stone-500">
            <span>Giá trị đơn trung bình (AOV)</span>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-stone-900 font-mono tracking-tight tabular-nums">
            {formatVND(
              reportPeriod === 'today'
                ? Math.round(todayData.revenue / todayData.orderCount)
                : avgOrderValue
            )}
          </div>
          <div className="text-xs text-stone-500 pt-1">
            Số khách đón tiếp:{' '}
            <span className="font-semibold text-stone-800">
              {reportPeriod === 'today' ? todayData.guestCount : totalSepGuests} lượt
            </span>
          </div>
        </div>

        {/* Digital Payment Adoption */}
        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-xs text-stone-500">
            <span>Tỷ lệ Thanh toán điện tử</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <QrCode className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-emerald-800 font-mono tracking-tight tabular-nums">
            85.0%
          </div>
          <div className="text-xs text-stone-500 pt-1">
            VietQR + MoMo + VNPay chiếm <span className="font-semibold text-stone-800">85%</span>
          </div>
        </div>
      </div>

      {/* Main Interactive Revenue Chart */}
      <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="font-serif text-lg font-bold text-stone-900">
              {reportPeriod === 'today'
                ? 'Biểu đồ Doanh thu theo Khung giờ hôm nay'
                : reportPeriod === 'monthly'
                ? 'Biểu đồ Doanh thu Tổng hợp qua Các Tháng (2026)'
                : 'Biểu đồ Doanh thu Theo Từng Ngày (Tháng 9/2026)'}
            </h3>
            <p className="text-xs text-stone-500">
              Di chuột vào từng cột để xem chi tiết doanh thu và số lượng đơn
            </p>
          </div>

          {hoveredDataPoint && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl px-3 py-1.5 text-xs text-stone-800">
              <span className="font-bold text-amber-900">{hoveredDataPoint.label}: </span>
              <span className="font-mono font-extrabold text-stone-900">
                {formatVND(hoveredDataPoint.value)}
              </span>
              {hoveredDataPoint.orders && (
                <span className="text-stone-500 ml-1.5">({hoveredDataPoint.orders} đơn)</span>
              )}
            </div>
          )}
        </div>

        {/* SVG Chart Rendering */}
        {reportPeriod === 'daily_september' && (
          <div className="pt-4">
            <div className="h-64 flex items-end gap-1 sm:gap-2 border-b border-stone-200 pb-2 px-1">
              {dailyData.map((d, index) => {
                const heightPct = Math.max(12, Math.round((d.revenue / maxDailyRevenue) * 100));
                const isToday = index === dailyData.length - 1;

                return (
                  <div
                    key={d.date}
                    className="flex-1 flex flex-col items-center h-full justify-end group cursor-pointer relative"
                    onMouseEnter={() =>
                      setHoveredDataPoint({
                        label: `Ngày ${d.dayLabel}`,
                        value: d.revenue,
                        orders: d.orderCount,
                      })
                    }
                    onMouseLeave={() => setHoveredDataPoint(null)}
                  >
                    <div
                      className={`w-full rounded-t-md transition-all duration-300 ${
                        isToday
                          ? 'bg-amber-600 group-hover:bg-amber-700 shadow-sm ring-1 ring-amber-400'
                          : 'bg-stone-300 group-hover:bg-stone-500'
                      }`}
                      style={{ height: `${heightPct}%` }}
                    />
                    <span className="text-[9px] sm:text-[10px] text-stone-400 group-hover:text-stone-900 mt-1 truncate font-mono">
                      {d.dayLabel.split('/')[0]}
                    </span>
                  </div>
                );
              })}
            </div>
            <div className="flex justify-between text-[11px] text-stone-400 pt-1">
              <span>01/09</span>
              <span>Giữa tháng (15/09)</span>
              <span className="text-amber-700 font-bold">Hôm nay (22/09)</span>
            </div>
          </div>
        )}

        {reportPeriod === 'today' && (
          <div className="pt-4 space-y-3">
            {todayHourly.map((h, i) => {
              const maxHour = 4800000;
              const pct = Math.round((h.revenue / maxHour) * 100);
              return (
                <div key={i} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="font-semibold text-stone-800">{h.hour}</span>
                    <div className="space-x-2">
                      <span className="text-stone-500">{h.orders} đơn</span>
                      <span className="font-mono font-bold text-amber-900">{formatVND(h.revenue)}</span>
                    </div>
                  </div>
                  <div className="w-full bg-stone-100 h-3 rounded-full overflow-hidden">
                    <div
                      className="bg-amber-600 h-full rounded-full transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {reportPeriod === 'monthly' && (
          <div className="pt-4">
            <div className="h-64 flex items-end gap-3 sm:gap-6 border-b border-stone-200 pb-2 px-4">
              {MONTHLY_SUMMARY_DATA.map((m) => {
                const heightPct = Math.max(15, Math.round((m.revenue / maxMonthlyRevenue) * 100));

                return (
                  <div
                    key={m.month}
                    className="flex-1 flex flex-col items-center h-full justify-end group cursor-pointer relative"
                    onMouseEnter={() =>
                      setHoveredDataPoint({
                        label: m.label,
                        value: m.revenue,
                        orders: m.orders,
                      })
                    }
                    onMouseLeave={() => setHoveredDataPoint(null)}
                  >
                    <div
                      className="w-full max-w-[48px] rounded-t-lg bg-amber-600 group-hover:bg-amber-700 transition-all duration-300 shadow-xs"
                      style={{ height: `${heightPct}%` }}
                    />
                    <span className="text-xs font-semibold text-stone-600 group-hover:text-stone-900 mt-2 truncate">
                      {m.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Two Column Breakdown: Payment Methods & Category Revenue */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Payment Methods Breakdown */}
        <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-serif text-base sm:text-lg font-bold text-stone-900">
                Phương Thức Thanh Toán
              </h3>
              <p className="text-xs text-stone-500">
                Tỷ trọng doanh thu theo các kênh thanh toán điện tử và tiền mặt
              </p>
            </div>
            <CreditCard className="w-5 h-5 text-stone-400" />
          </div>

          {/* Bar representation */}
          <div className="w-full h-3 rounded-full flex overflow-hidden">
            {paymentStats.map((p, i) => (
              <div
                key={i}
                className={`${p.color} h-full`}
                style={{ width: `${p.percent}%` }}
                title={`${p.name}: ${p.percent}%`}
              />
            ))}
          </div>

          <div className="space-y-3 pt-1">
            {paymentStats.map((p, i) => (
              <div key={i} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className={`w-3 h-3 rounded-full ${p.color}`} />
                  <span className="font-medium text-stone-800">{p.name}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-stone-400 font-mono">{p.percent}%</span>
                  <span className="font-mono font-bold text-stone-900 tabular-nums">
                    {formatVND(p.revenue)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Product Category Breakdown */}
        <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-serif text-base sm:text-lg font-bold text-stone-900">
                Cơ Cấu Doanh Thu Theo Nhóm Món
              </h3>
              <p className="text-xs text-stone-500">
                Phân bổ đóng góp doanh số của hải sản, đồ uống và đồ ăn
              </p>
            </div>
            <Award className="w-5 h-5 text-stone-400" />
          </div>

          {/* Bar representation */}
          <div className="w-full h-3 rounded-full flex overflow-hidden">
            {categoryStats.map((c, i) => (
              <div
                key={i}
                className={`${c.color} h-full`}
                style={{ width: `${c.percent}%` }}
                title={`${c.name}: ${c.percent}%`}
              />
            ))}
          </div>

          <div className="space-y-3 pt-1">
            {categoryStats.map((c, i) => (
              <div key={i} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className={`w-3 h-3 rounded-full ${c.color}`} />
                  <span className="font-medium text-stone-800">{c.name}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-stone-400 font-mono">{c.percent}%</span>
                  <span className="font-mono font-bold text-stone-900 tabular-nums">
                    {formatVND(c.revenue)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Top Best Selling Dishes */}
      <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-serif text-base sm:text-lg font-bold text-stone-900">
              Top Món Bán Chạy Nhất Tại Hòn Cau Quán
            </h3>
            <p className="text-xs text-stone-500">
              Danh sách các món được gọi nhiều nhất và mang lại doanh số cao nhất
            </p>
          </div>
          <span className="text-xs font-semibold text-amber-800 bg-amber-50 px-2.5 py-1 rounded-lg">
            Tháng 9/2026
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-stone-200 text-stone-500 uppercase tracking-wider font-semibold">
                <th className="py-2.5 px-3">Xếp hạng</th>
                <th className="py-2.5 px-3">Tên món</th>
                <th className="py-2.5 px-3">Danh mục</th>
                <th className="py-2.5 px-3 text-right">Số lượng bán</th>
                <th className="py-2.5 px-3 text-right">Tổng doanh thu</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {bestSellers.map((item) => (
                <tr key={item.rank} className="hover:bg-stone-50/80 transition-colors">
                  <td className="py-3 px-3">
                    <span className={`w-5 h-5 rounded-full inline-flex items-center justify-center font-bold text-[11px] ${
                      item.rank === 1
                        ? 'bg-amber-500 text-white'
                        : item.rank === 2
                        ? 'bg-stone-400 text-white'
                        : item.rank === 3
                        ? 'bg-amber-700 text-white'
                        : 'bg-stone-100 text-stone-700'
                    }`}>
                      {item.rank}
                    </span>
                  </td>
                  <td className="py-3 px-3 font-semibold text-stone-900">
                    {item.name}
                  </td>
                  <td className="py-3 px-3 text-stone-500">
                    {item.category}
                  </td>
                  <td className="py-3 px-3 text-right font-mono font-medium text-stone-700 tabular-nums">
                    {item.sold} phần
                  </td>
                  <td className="py-3 px-3 text-right font-mono font-bold text-amber-900 tabular-nums">
                    {formatVND(item.revenue)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Today's Transactions / Orders Table */}
      <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-serif text-base sm:text-lg font-bold text-stone-900">
              Hóa Đơn & Đơn Hàng Gần Đây
            </h3>
            <p className="text-xs text-stone-500">
              Danh sách chi tiết các phiếu thanh toán điện tử và tiền mặt tại quán
            </p>
          </div>
          <span className="text-xs text-stone-500 font-mono">
            {orders.length} đơn lưu trữ
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-stone-200 text-stone-500 uppercase tracking-wider font-semibold">
                <th className="py-2.5 px-3">Mã đơn</th>
                <th className="py-2.5 px-3">Bàn / Khách</th>
                <th className="py-2.5 px-3">Hình thức</th>
                <th className="py-2.5 px-3">Trạng thái TT</th>
                <th className="py-2.5 px-3 text-right">Tổng tiền</th>
                <th className="py-2.5 px-3 text-center">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {orders.map((ord) => (
                <tr key={ord.id} className="hover:bg-stone-50/80 transition-colors">
                  <td className="py-3 px-3 font-mono font-bold text-stone-900">
                    {ord.orderCode}
                  </td>
                  <td className="py-3 px-3">
                    <div className="font-medium text-stone-800">{ord.tableName || 'Mang về'}</div>
                    <div className="text-[11px] text-stone-400">{ord.customerName}</div>
                  </td>
                  <td className="py-3 px-3">
                    <span className="uppercase text-[11px] font-semibold text-stone-700 bg-stone-100 px-2 py-0.5 rounded">
                      {ord.paymentMethod}
                    </span>
                  </td>
                  <td className="py-3 px-3">
                    <span
                      className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                        ord.paymentStatus === 'paid'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {ord.paymentStatus === 'paid' ? 'Đã Thanh Toán' : 'Chưa TT'}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-right font-mono font-bold text-stone-900 tabular-nums">
                    {formatVND(ord.finalAmount)}
                  </td>
                  <td className="py-3 px-3 text-center">
                    <button
                      type="button"
                      onClick={() => setActiveReceiptOrder(ord)}
                      className="px-2.5 py-1 text-xs font-semibold text-stone-700 bg-stone-100 hover:bg-stone-200 rounded-lg cursor-pointer"
                    >
                      Xem Bill
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
