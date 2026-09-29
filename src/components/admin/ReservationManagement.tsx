import React, { useState } from 'react';
import { useRestaurant } from '../../context/RestaurantContext';
import { Reservation } from '../../types/restaurant';
import { formatDateTime } from '../../utils/formatters';
import { Calendar, Users, Phone, MapPin, CheckCircle2, XCircle, Search, Clock, MessageSquare } from 'lucide-react';

export const ReservationManagement: React.FC = () => {
  const { reservations, updateReservationStatus, tables, updateTableStatus } = useRestaurant();
  const [filterStatus, setFilterStatus] = useState<'all' | 'confirmed' | 'seated' | 'cancelled'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredReservations = reservations.filter((res) => {
    const matchStatus = filterStatus === 'all' || res.status === filterStatus;
    const matchSearch =
      !searchQuery.trim() ||
      res.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      res.customerPhone.includes(searchQuery) ||
      res.bookingCode.toLowerCase().includes(searchQuery.toLowerCase());
    return matchStatus && matchSearch;
  });

  const handleSeatGuests = (res: Reservation) => {
    updateReservationStatus(res.id, 'seated');
    if (res.tableId) {
      updateTableStatus(res.tableId, 'occupied', res.guestCount);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Bar */}
      <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          <button
            onClick={() => setFilterStatus('all')}
            className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap cursor-pointer transition-colors ${
              filterStatus === 'all'
                ? 'bg-stone-900 text-white font-semibold'
                : 'bg-stone-100 text-stone-600 hover:bg-stone-200/80'
            }`}
          >
            Tất cả lịch đặt ({reservations.length})
          </button>
          <button
            onClick={() => setFilterStatus('confirmed')}
            className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap cursor-pointer transition-colors ${
              filterStatus === 'confirmed'
                ? 'bg-purple-600 text-white font-semibold'
                : 'bg-stone-100 text-stone-600 hover:bg-stone-200/80'
            }`}
          >
            Đang giữ chỗ ({reservations.filter((r) => r.status === 'confirmed').length})
          </button>
          <button
            onClick={() => setFilterStatus('seated')}
            className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap cursor-pointer transition-colors ${
              filterStatus === 'seated'
                ? 'bg-emerald-600 text-white font-semibold'
                : 'bg-stone-100 text-stone-600 hover:bg-stone-200/80'
            }`}
          >
            Đã vào bàn ({reservations.filter((r) => r.status === 'seated').length})
          </button>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm theo tên khách, SĐT, mã..."
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/20"
          />
        </div>
      </div>

      {/* Grid of Reservations */}
      {filteredReservations.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-stone-200">
          <Calendar className="w-12 h-12 text-stone-300 mx-auto mb-3" />
          <h4 className="text-base font-semibold text-stone-800">Không có lượt đặt bàn nào</h4>
          <p className="text-xs text-stone-500 mt-1 max-w-sm mx-auto">
            Khi khách hàng đặt bàn trực tuyến, thông tin sẽ được tự động đồng bộ về đây.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredReservations.map((res) => {
            const assignedTbl = tables.find((t) => t.id === res.tableId);

            return (
              <div
                key={res.id}
                className="bg-white rounded-2xl border border-stone-200 p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-4"
              >
                <div>
                  <div className="flex items-start justify-between border-b border-stone-100 pb-3">
                    <div>
                      <div className="font-bold text-base text-stone-900 font-serif">
                        {res.customerName}
                      </div>
                      <div className="text-xs font-mono font-bold text-amber-800">
                        {res.bookingCode}
                      </div>
                    </div>
                    <span
                      className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                        res.status === 'confirmed'
                          ? 'bg-purple-100 text-purple-800'
                          : res.status === 'seated'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-stone-100 text-stone-600'
                      }`}
                    >
                      {res.status === 'confirmed'
                        ? 'Đã Giữ Bàn'
                        : res.status === 'seated'
                        ? 'Đã Vào Bàn'
                        : 'Đã Hủy'}
                    </span>
                  </div>

                  <div className="space-y-2 text-xs pt-3 text-stone-600">
                    <div className="flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5 text-stone-400" />
                      <span className="font-semibold text-stone-800">
                        {res.time} · {res.date}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Users className="w-3.5 h-3.5 text-stone-400" />
                      <span>{res.guestCount} người lớn & trẻ em</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-stone-400" />
                      <span className="font-medium text-amber-900 bg-amber-50 px-1.5 py-0.5 rounded">
                        {res.area} {assignedTbl ? `(${assignedTbl.name})` : ''}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-stone-400" />
                      <a
                        href={`tel:${res.customerPhone}`}
                        className="text-blue-600 hover:underline font-mono font-medium"
                      >
                        {res.customerPhone}
                      </a>
                    </div>

                    {res.specialRequests && (
                      <div className="bg-stone-50 p-2 rounded-lg border border-stone-100 text-[11px] text-stone-600 italic">
                        "{res.specialRequests}"
                      </div>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="pt-2 border-t border-stone-100 flex items-center gap-2">
                  {res.status === 'confirmed' && (
                    <>
                      <button
                        type="button"
                        onClick={() => handleSeatGuests(res)}
                        className="flex-1 py-1.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-all shadow-xs cursor-pointer flex items-center justify-center gap-1.5"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Khách Đến (Nhận Bàn)</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => updateReservationStatus(res.id, 'cancelled')}
                        className="py-1.5 px-2 text-stone-400 hover:text-rose-600 text-xs font-semibold rounded-lg hover:bg-rose-50 cursor-pointer"
                        title="Hủy đặt bàn"
                      >
                        Hủy
                      </button>
                    </>
                  )}

                  {res.status === 'seated' && (
                    <span className="text-xs text-emerald-700 font-medium flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Khách đang dùng bữa tại quán
                    </span>
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
