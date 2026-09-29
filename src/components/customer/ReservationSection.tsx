import React, { useState } from 'react';
import { useRestaurant } from '../../context/RestaurantContext';
import { TableArea, Reservation } from '../../types/restaurant';
import { Calendar, Users, Clock, MapPin, Sparkles, CheckCircle2, Phone, User, Mail, MessageSquare } from 'lucide-react';

const TABLE_AREAS: { area: TableArea; description: string; tag: string }[] = [
  { area: 'Sân vườn biển', description: 'Gió biển lồng lộng, dưới bóng dừa mát rượi, ngắm sóng vỗ dập dềnh', tag: 'Thoáng đãng' },
  { area: 'Trong nhà máy lạnh', description: 'Không gian mát mẻ, yên tĩnh, phù hợp bữa cơm gia đình đầm ấm', tag: 'Mát mẻ' },
  { area: 'Sân thượng hoàng hôn', description: 'Tầm nhìn 360 độ ngắm hoàng hôn đỏ rực trên biển đảo Hòn Cau', tag: 'Lãng mạn' },
  { area: 'Phòng VIP Hòn Cau', description: 'Phòng tiệc riêng tư sang trọng, sức chứa 10-20 khách, có karaoke', tag: 'Riêng tư' },
];

const TIME_SLOTS = [
  '10:30', '11:00', '11:30', '12:00', '12:30', '13:00',
  '17:00', '17:30', '18:00', '18:30', '19:00', '19:30', '20:00', '20:30'
];

export const ReservationSection: React.FC = () => {
  const { tables, createReservation } = useRestaurant();

  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [guestCount, setGuestCount] = useState<number>(4);
  const [date, setDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });
  const [time, setTime] = useState('18:30');
  const [selectedArea, setSelectedArea] = useState<TableArea>('Sân vườn biển');
  const [specialRequests, setSpecialRequests] = useState('');

  const [createdReservation, setCreatedReservation] = useState<Reservation | null>(null);

  // Filter available table candidates
  const availableTablesInArea = tables.filter(
    (t) => t.area === selectedArea && t.status === 'available' && t.capacity >= guestCount
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim() || !customerPhone.trim()) return;

    const assignedTable = availableTablesInArea[0];

    const res = createReservation({
      customerName,
      customerPhone,
      customerEmail,
      guestCount,
      date,
      time,
      area: selectedArea,
      tableId: assignedTable ? assignedTable.id : undefined,
      specialRequests,
    });

    setCreatedReservation(res);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Intro Header */}
      <div className="text-center space-y-2">
        <span className="text-xs font-bold uppercase tracking-wider text-amber-800 bg-amber-50 px-3 py-1 rounded-full border border-amber-200/50">
          Đặt Bàn Trực Tuyến 24/7
        </span>
        <h2 className="font-serif text-2xl sm:text-3xl font-bold text-stone-900">
          Trải Nghiệm Ẩm Thực Biển Tại Hòn Cau Quán
        </h2>
        <p className="text-xs sm:text-sm text-stone-600 max-w-xl mx-auto">
          Đặt chỗ trước để nhận bàn có view đẹp nhất và được ưu tiên chuẩn bị món ăn tươi ngon kịp thời.
        </p>
      </div>

      {createdReservation ? (
        /* Booking Confirmation Card */
        <div className="bg-white rounded-2xl border border-stone-200 p-6 sm:p-8 shadow-sm space-y-6 animate-in zoom-in-95 duration-200">
          <div className="flex flex-col items-center text-center">
            <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mb-3">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <span className="text-xs font-semibold text-emerald-700 uppercase tracking-wider">
              Xác Nhận Giữ Chỗ Thành Công
            </span>
            <h3 className="text-2xl font-bold text-stone-900 font-serif mt-1">
              Hẹn Gặp Lại Quý Khách Tại Hòn Cau!
            </h3>
            <p className="text-xs text-stone-500 mt-1 max-w-md">
              Nhà hàng đã ghi nhận thông tin đặt bàn của bạn. Nhân viên sẽ chuẩn bị bàn chu đáo nhất trước giờ đến.
            </p>
          </div>

          {/* Ticket Information */}
          <div className="bg-stone-50 border border-stone-200 rounded-2xl p-5 sm:p-6 space-y-4">
            <div className="flex flex-col sm:flex-row items-center justify-between border-b border-stone-200 pb-4 gap-2">
              <div>
                <span className="text-xs text-stone-500">Mã phiếu đặt bàn</span>
                <div className="text-2xl font-extrabold text-amber-800 font-mono tracking-wider">
                  {createdReservation.bookingCode}
                </div>
              </div>
              <div className="inline-block p-1 bg-white border border-stone-200 rounded-lg">
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=80x80&data=BOOKING-${createdReservation.bookingCode}`}
                  alt="Mã QR giữ chỗ"
                  className="w-16 h-16"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div>
                <span className="text-stone-400 block">Khách hàng:</span>
                <span className="font-semibold text-stone-800">{createdReservation.customerName}</span>
              </div>
              <div>
                <span className="text-stone-400 block">Số điện thoại:</span>
                <span className="font-semibold text-stone-800 font-mono">{createdReservation.customerPhone}</span>
              </div>
              <div>
                <span className="text-stone-400 block">Ngày & Giờ:</span>
                <span className="font-semibold text-stone-800">{createdReservation.time} · {createdReservation.date}</span>
              </div>
              <div>
                <span className="text-stone-400 block">Số lượng khách:</span>
                <span className="font-semibold text-stone-800">{createdReservation.guestCount} người</span>
              </div>
            </div>

            <div className="text-xs pt-2 border-t border-stone-200/80 flex items-center justify-between">
              <span className="text-stone-500">Khu vực bàn:</span>
              <span className="font-semibold text-amber-900 bg-amber-100/70 px-2 py-0.5 rounded">
                {createdReservation.area}
              </span>
            </div>

            {createdReservation.specialRequests && (
              <div className="text-xs text-stone-600 bg-white p-2.5 rounded-lg border border-stone-200">
                <span className="font-medium text-stone-700">Yêu cầu riêng: </span>
                {createdReservation.specialRequests}
              </div>
            )}
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => setCreatedReservation(null)}
              className="w-full sm:w-auto px-6 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs sm:text-sm rounded-xl shadow-sm transition-colors cursor-pointer"
            >
              Đặt thêm bàn khác
            </button>
            <button
              type="button"
              onClick={() => window.print()}
              className="w-full sm:w-auto px-6 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-800 font-semibold text-xs sm:text-sm rounded-xl transition-colors cursor-pointer"
            >
              Lưu / In phiếu giữ bàn
            </button>
          </div>
        </div>
      ) : (
        /* Booking Form */
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-stone-200/90 p-5 sm:p-8 shadow-sm space-y-6">
          {/* Step 1: Area Selection */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-amber-600 text-white text-xs font-bold flex items-center justify-center">1</span>
              <h3 className="font-bold text-stone-900 text-sm sm:text-base">
                Chọn khu vực bàn yêu thích
              </h3>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {TABLE_AREAS.map((item) => (
                <div
                  key={item.area}
                  onClick={() => setSelectedArea(item.area)}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                    selectedArea === item.area
                      ? 'border-amber-600 bg-amber-50/50 ring-1 ring-amber-600 shadow-sm'
                      : 'border-stone-200 hover:border-stone-300 hover:bg-stone-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-stone-900 text-sm">{item.area}</span>
                    <span className="text-[11px] font-medium text-amber-800 bg-amber-100/60 px-2 py-0.5 rounded">
                      {item.tag}
                    </span>
                  </div>
                  <p className="text-xs text-stone-500 mt-1 leading-relaxed">
                    {item.description}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Step 2: Time & Date & Guests */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-amber-600 text-white text-xs font-bold flex items-center justify-center">2</span>
              <h3 className="font-bold text-stone-900 text-sm sm:text-base">
                Thời gian & Số lượng khách
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Date */}
              <div>
                <label className="block text-xs font-semibold text-stone-600 mb-1 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  Ngày dùng bữa
                </label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-3 py-2 text-xs sm:text-sm bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                  required
                />
              </div>

              {/* Time */}
              <div>
                <label className="block text-xs font-semibold text-stone-600 mb-1 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  Giờ đến
                </label>
                <select
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="w-full px-3 py-2 text-xs sm:text-sm bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/20 cursor-pointer"
                >
                  {TIME_SLOTS.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>

              {/* Guests Count */}
              <div>
                <label className="block text-xs font-semibold text-stone-600 mb-1 flex items-center gap-1">
                  <Users className="w-3.5 h-3.5" />
                  Số khách
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="1"
                    max="50"
                    value={guestCount}
                    onChange={(e) => setGuestCount(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-full px-3 py-2 text-xs sm:text-sm bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/20 font-bold"
                  />
                  <span className="text-xs text-stone-500 shrink-0">Người</span>
                </div>
              </div>
            </div>
          </div>

          {/* Step 3: Customer Information */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-amber-600 text-white text-xs font-bold flex items-center justify-center">3</span>
              <h3 className="font-bold text-stone-900 text-sm sm:text-base">
                Thông tin người đặt
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-stone-600 mb-1 flex items-center gap-1">
                  <User className="w-3.5 h-3.5" />
                  Họ và tên *
                </label>
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Ví dụ: Hoàng Tuấn"
                  required
                  className="w-full px-3 py-2 text-xs sm:text-sm bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-600 mb-1 flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5" />
                  Số điện thoại *
                </label>
                <input
                  type="tel"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  placeholder="Ví dụ: 0903123456"
                  required
                  className="w-full px-3 py-2 text-xs sm:text-sm bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-600 mb-1 flex items-center gap-1">
                  <Mail className="w-3.5 h-3.5" />
                  Email (nhận xác nhận)
                </label>
                <input
                  type="email"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  placeholder="email@example.com"
                  className="w-full px-3 py-2 text-xs sm:text-sm bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-600 mb-1 flex items-center gap-1">
                <MessageSquare className="w-3.5 h-3.5" />
                Yêu cầu đặc biệt (sinh nhật, hoa trang trí, dị ứng thức ăn...)
              </label>
              <textarea
                value={specialRequests}
                onChange={(e) => setSpecialRequests(e.target.value)}
                placeholder="Ví dụ: Cần bàn sát view biển, có ghế em bé, chuẩn bị đĩa trái cây sinh nhật..."
                rows={2}
                className="w-full px-3 py-2 text-xs sm:text-sm bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/20"
              />
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="w-full py-3 bg-amber-600 hover:bg-amber-700 text-white font-bold text-sm sm:text-base rounded-xl shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              <span>Xác Nhận Đặt Bàn Ngay</span>
            </button>
          </div>
        </form>
      )}
    </div>
  );
};
