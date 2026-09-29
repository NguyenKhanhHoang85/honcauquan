import React, { useState, useEffect } from 'react';
import { useRestaurant } from '../../context/RestaurantContext';
import { MenuItem, MenuCategory, OrderType, RestaurantTable, OrderItemRecord } from '../../types/restaurant';
import { formatVND } from '../../utils/formatters';
import { 
  Utensils, 
  Search, 
  Plus, 
  Minus, 
  Trash2, 
  Send, 
  CheckCircle2, 
  Clock, 
  Users, 
  ShoppingBag, 
  Sparkles, 
  Layers, 
  ChefHat, 
  FileText,
  Tag,
  Percent,
  DollarSign,
  Printer,
  ChevronDown,
  ChevronUp,
  QrCode
} from 'lucide-react';

interface PosCartItem {
  menuItem: MenuItem;
  quantity: number;
  note?: string;
  discount?: number; // Giảm giá từng món (VND)
}

export const StaffOrderPOS: React.FC = () => {
  const { 
    menuItems, 
    tables, 
    orders, 
    createOrder, 
    addItemsToExistingOrder,
    currentUser, 
    prefillPosTableId, 
    setPrefillPosTableId,
    setActivePaymentOrder, 
    setActiveReceiptOrder,
    setActiveKitchenPrintOrder,
    setAdminTab,
    settings
  } = useRestaurant();

  const [selectedTableId, setSelectedTableId] = useState<string>(prefillPosTableId || (tables[0]?.id ?? ''));
  const [orderType, setOrderType] = useState<OrderType>('dine_in');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [orderNote, setOrderNote] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<MenuCategory | 'Tất cả'>('Tất cả');
  const [searchQuery, setSearchQuery] = useState('');

  // Cart for this POS session
  const [posCart, setPosCart] = useState<PosCartItem[]>([]);

  // Flexible VAT, Surcharge & Order Discount
  const [showAdjustments, setShowAdjustments] = useState(false);
  const [vatEnabled, setVatEnabled] = useState(settings.isVatEnabled);
  const [vatRate, setVatRate] = useState(settings.defaultVatRate || 8);
  const [orderDiscountType, setOrderDiscountType] = useState<'percent' | 'fixed'>('fixed');
  const [orderDiscountValue, setOrderDiscountValue] = useState<number>(0);
  const [orderDiscountNote, setOrderDiscountNote] = useState<string>('');
  const [surchargeAmount, setSurchargeAmount] = useState<number>(settings.defaultSurcharge || 0);
  const [surchargeNote, setSurchargeNote] = useState<string>(settings.surchargeReason || 'Phụ thu dịch vụ');

  // Update selected table if prefill requested
  useEffect(() => {
    if (prefillPosTableId) {
      setSelectedTableId(prefillPosTableId);
      setPrefillPosTableId(null);
    }
  }, [prefillPosTableId, setPrefillPosTableId]);

  const selectedTable = tables.find((t) => t.id === selectedTableId);
  const activeTableOrder = orders.find(
    (o) => o.tableId === selectedTableId && o.orderStatus !== 'completed' && o.orderStatus !== 'cancelled'
  );

  const categories: (MenuCategory | 'Tất cả')[] = [
    'Tất cả',
    'Món Đặc Trưng',
    'Món Khai Vị & Gỏi',
    'Món Nướng',
    'Món Lẩu',
    'Cơm & Mì',
    'Món Khác',
    'Rau & Món Ăn Kèm',
    'Nước Giải Khát & Bia',
  ];

  const filteredMenuItems = menuItems.filter((item) => {
    const matchCategory = selectedCategory === 'Tất cả' || item.category === selectedCategory;
    const matchSearch =
      !searchQuery.trim() ||
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCategory && matchSearch && item.isAvailable;
  });

  const handleAddItem = (item: MenuItem) => {
    setPosCart((prev) => {
      const existing = prev.find((i) => i.menuItem.id === item.id);
      if (existing) {
        return prev.map((i) =>
          i.menuItem.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [...prev, { menuItem: item, quantity: 1, note: '', discount: 0 }];
    });
  };

  const handleUpdateQuantity = (itemId: string, delta: number) => {
    setPosCart((prev) => {
      return prev
        .map((i) => {
          if (i.menuItem.id === itemId) {
            const newQty = i.quantity + delta;
            return newQty > 0 ? { ...i, quantity: newQty } : null;
          }
          return i;
        })
        .filter(Boolean) as PosCartItem[];
    });
  };

  const handleUpdateItemNote = (itemId: string, note: string) => {
    setPosCart((prev) =>
      prev.map((i) => (i.menuItem.id === itemId ? { ...i, note } : i))
    );
  };

  const handleUpdateItemDiscount = (itemId: string, discount: number) => {
    setPosCart((prev) =>
      prev.map((i) => (i.menuItem.id === itemId ? { ...i, discount: Math.max(0, discount) } : i))
    );
  };

  const handleRemoveItem = (itemId: string) => {
    setPosCart((prev) => prev.filter((i) => i.menuItem.id !== itemId));
  };

  // Financial Calculations
  const rawSubtotal = posCart.reduce((sum, item) => sum + item.menuItem.price * item.quantity, 0);
  const itemDiscountsTotal = posCart.reduce((sum, item) => sum + (item.discount || 0) * item.quantity, 0);
  
  const calculatedOrderDiscount = orderDiscountType === 'percent'
    ? Math.round(((rawSubtotal - itemDiscountsTotal) * orderDiscountValue) / 100)
    : orderDiscountValue;
  const totalDiscount = itemDiscountsTotal + calculatedOrderDiscount;

  const currentSurcharge = surchargeAmount;
  const baseForVat = Math.max(0, rawSubtotal - totalDiscount + currentSurcharge);
  const vatAmount = vatEnabled && vatRate > 0 ? Math.round((baseForVat * vatRate) / 100) : 0;
  const finalAmount = Math.max(0, baseForVat + vatAmount);

  // Submit Order as NEW ORDER
  const handleSubmitNewOrder = () => {
    if (posCart.length === 0) return;

    const tableName = orderType === 'takeaway' ? 'Khách Mang Về' : selectedTable?.name || 'Bàn Quán';
    const finalCustomerName = customerName.trim() || (orderType === 'takeaway' ? 'Khách Mang Về' : `${tableName} (NV Order)`);
    
    const itemsFormatted: OrderItemRecord[] = posCart.map((i) => ({
      menuItemId: i.menuItem.id,
      name: i.menuItem.name,
      price: i.menuItem.price,
      quantity: i.quantity,
      category: i.menuItem.category,
      note: i.note,
      discount: i.discount || 0,
      round: 1,
    }));

    const newOrder = createOrder({
      customerName: finalCustomerName,
      customerPhone: customerPhone.trim() || '0903888666',
      orderType,
      tableId: orderType === 'dine_in' ? selectedTableId : undefined,
      tableName,
      items: itemsFormatted,
      paymentMethod: 'vietqr',
      note: orderNote.trim() ? `[NV: ${currentUser?.fullName || 'Nhân viên'}] ${orderNote}` : `Order bởi NV ${currentUser?.fullName || 'Nhân viên'}`,
      vatRate: vatEnabled ? vatRate : 0,
      vatAmount,
      surchargeAmount: currentSurcharge,
      surchargeNote,
      discountAmount: totalDiscount,
      discountNote: calculatedOrderDiscount > 0 ? (orderDiscountNote || (orderDiscountType === 'percent' ? `Giảm ${orderDiscountValue}%` : `Giảm ${formatVND(orderDiscountValue)}`)) : undefined,
      staffName: currentUser?.fullName || 'Nhân viên',
    });

    // Reset Form
    setPosCart([]);
    setOrderNote('');
    setCustomerName('');
    setCustomerPhone('');
    setOrderDiscountValue(0);

    // Prompt to print kitchen ticket
    setActiveKitchenPrintOrder({ order: newOrder, roundOnly: false });
  };

  // Submit as ROUND ADDITION ("Gọi thêm món")
  const handleSubmitAddItems = () => {
    if (!activeTableOrder || posCart.length === 0) return;

    const nextRound = (activeTableOrder.rounds?.length || 1) + 1;
    const itemsFormatted: OrderItemRecord[] = posCart.map((i) => ({
      menuItemId: i.menuItem.id,
      name: i.menuItem.name,
      price: i.menuItem.price,
      quantity: i.quantity,
      category: i.menuItem.category,
      note: i.note,
      discount: i.discount || 0,
      round: nextRound,
    }));

    const result = addItemsToExistingOrder(activeTableOrder.id, itemsFormatted, orderNote);
    
    // Reset Form
    setPosCart([]);
    setOrderNote('');
    setOrderDiscountValue(0);

    if (result.success && result.order) {
      // Prompt to print kitchen ticket for the newly added round
      setActiveKitchenPrintOrder({ order: result.order, roundOnly: true });
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner / Order Info */}
      <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-700">
            <Utensils className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-serif text-lg sm:text-xl font-bold text-stone-900">
                Thực Hiện Order Món (POS)
              </h2>
              <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-blue-100 text-blue-800 border border-blue-200">
                Ca trực: {currentUser?.fullName || 'Nhân viên'}
              </span>
            </div>
            <p className="text-xs text-stone-500 mt-0.5">
              Hỗ trợ 02 hình thức (Tại bàn & Mang về), gọi thêm món nhiều đợt, chiết khấu và thiết lập VAT.
            </p>
          </div>
        </div>

        {/* Order Type & Table Selector */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* Order Type: 02 Hình thức */}
          <div className="flex bg-stone-100 p-1 rounded-xl text-xs font-semibold">
            <button
              type="button"
              onClick={() => setOrderType('dine_in')}
              className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
                orderType === 'dine_in' ? 'bg-white text-stone-900 shadow-xs font-bold' : 'text-stone-600'
              }`}
            >
              <Utensils className="w-3.5 h-3.5" />
              <span>Ăn Tại Quán</span>
            </button>
            <button
              type="button"
              onClick={() => setOrderType('takeaway')}
              className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
                orderType === 'takeaway' ? 'bg-white text-stone-900 shadow-xs font-bold' : 'text-stone-600'
              }`}
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>Mang Về</span>
            </button>
          </div>

          {/* Table Selector */}
          {orderType === 'dine_in' && (
            <div className="flex items-center gap-2">
              <label className="text-xs font-semibold text-stone-700 whitespace-nowrap">
                Chọn Bàn:
              </label>
              <select
                value={selectedTableId}
                onChange={(e) => setSelectedTableId(e.target.value)}
                className="bg-white border border-stone-300 rounded-xl px-3 py-1.5 text-xs font-bold text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-500 cursor-pointer"
              >
                {tables.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name} ({t.area}) - {t.status === 'occupied' ? 'Đang có khách' : 'Trống'}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>

      {/* Main Split Layout: Menu Grid on Left, Order Ticket Cart on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Menu Selection (8 Cols) */}
        <div className="lg:col-span-7 xl:col-span-8 space-y-4">
          {/* Search & Category Filter */}
          <div className="bg-white p-3.5 rounded-2xl border border-stone-200 shadow-xs space-y-3">
            <div className="relative">
              <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm nhanh tên món, hải sản Hòn Cau, đồ uống..."
                className="w-full pl-10 pr-4 py-2 rounded-xl border border-stone-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
              />
            </div>

            {/* Categories */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all cursor-pointer ${
                    selectedCategory === cat
                      ? 'bg-amber-600 text-white font-bold shadow-xs'
                      : 'bg-stone-100 text-stone-600 hover:bg-stone-200/80'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Menu Items Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {filteredMenuItems.map((item) => {
              const inCart = posCart.find((i) => i.menuItem.id === item.id);

              return (
                <div
                  key={item.id}
                  onClick={() => handleAddItem(item)}
                  className={`bg-white rounded-2xl border p-3 shadow-xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between select-none relative group ${
                    inCart ? 'border-amber-500 ring-2 ring-amber-500/20 bg-amber-50/20' : 'border-stone-200'
                  }`}
                >
                  {inCart && (
                    <span className="absolute -top-2 -right-2 bg-amber-600 text-white font-bold text-xs rounded-full w-6 h-6 flex items-center justify-center shadow-md animate-in zoom-in-75">
                      {inCart.quantity}
                    </span>
                  )}

                  <div className="space-y-2">
                    <div className="aspect-4/3 rounded-xl overflow-hidden bg-stone-100 relative">
                      <img
                        src={item.imageUrl}
                        alt={item.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=600&q=80';
                        }}
                      />
                      {item.isSpecial && (
                        <span className="absolute top-1.5 left-1.5 bg-amber-600/90 text-white text-[9px] font-bold px-1.5 py-0.5 rounded backdrop-blur-xs">
                          Đặc sản
                        </span>
                      )}
                    </div>

                    <div>
                      <h4 className="font-serif font-bold text-xs sm:text-sm text-stone-900 line-clamp-2 leading-tight">
                        {item.name}
                      </h4>
                      <span className="text-[10px] text-stone-500 block mt-0.5">
                        {item.category} {item.unit ? `· ${item.unit}` : ''}
                      </span>
                    </div>
                  </div>

                  <div className="mt-2 pt-2 border-t border-stone-100 flex items-center justify-between">
                    <span className="font-extrabold text-amber-900 text-xs sm:text-sm font-mono tabular-nums">
                      {formatVND(item.price)}
                    </span>
                    <button
                      type="button"
                      className="w-7 h-7 rounded-lg bg-amber-500 hover:bg-amber-600 text-stone-950 flex items-center justify-center transition-colors cursor-pointer shadow-xs"
                      aria-label="Thêm món"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: POS Order Ticket / Cart (4-5 Cols) */}
        <div className="lg:col-span-5 xl:col-span-4 space-y-4">
          <div className="bg-white rounded-3xl border border-stone-200 shadow-sm p-5 space-y-4 sticky top-20">
            {/* Ticket Header */}
            <div className="border-b border-dashed border-stone-300 pb-3 flex items-start justify-between">
              <div>
                <span className="text-[10px] font-bold tracking-wider uppercase text-amber-700 block">
                  Phiếu Gọi Món POS
                </span>
                <h3 className="font-serif text-lg font-bold text-stone-900">
                  {orderType === 'dine_in' ? selectedTable?.name || 'Bàn Quán' : 'Khách Mang Về'}
                </h3>
                {orderType === 'dine_in' && selectedTable && (
                  <span className="text-xs text-stone-500">
                    Khu vực: {selectedTable.area} · Sức chứa {selectedTable.capacity} người
                  </span>
                )}
              </div>

              {posCart.length > 0 && (
                <button
                  type="button"
                  onClick={() => setPosCart([])}
                  className="text-stone-400 hover:text-rose-600 p-1 rounded-lg text-xs flex items-center gap-1 transition-colors cursor-pointer"
                  title="Xóa hết giỏ"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Xóa giỏ</span>
                </button>
              )}
            </div>

            {/* Existing Active Order notification on table */}
            {orderType === 'dine_in' && activeTableOrder && (
              <div className="p-3 bg-amber-50 border border-amber-300/80 rounded-xl text-xs space-y-1.5">
                <div className="flex items-center justify-between font-bold text-amber-950">
                  <span className="flex items-center gap-1">
                    <Layers className="w-3.5 h-3.5 text-amber-700" />
                    <span>Đang có đơn #{activeTableOrder.orderCode}</span>
                  </span>
                  <span className="font-mono">{formatVND(activeTableOrder.finalAmount)}</span>
                </div>
                <p className="text-[11px] text-amber-800">
                  Đã phục vụ <strong>{activeTableOrder.rounds?.length || 1} đợt gọi</strong>. Bạn có thể chọn <strong>GỌI THÊM ĐỢT {(activeTableOrder.rounds?.length || 1) + 1}</strong> để bổ sung món.
                </p>
              </div>
            )}

            {/* Items List */}
            <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
              {posCart.length === 0 ? (
                <div className="text-center py-10 text-stone-400 space-y-2">
                  <ShoppingBag className="w-10 h-10 mx-auto opacity-30" />
                  <p className="text-xs">Chưa có món nào được chọn.</p>
                  <p className="text-[11px] text-stone-400">
                    Chạm vào món trong thực đơn bên trái để thêm vào phiếu order.
                  </p>
                </div>
              ) : (
                posCart.map((item) => (
                  <div key={item.menuItem.id} className="p-3 rounded-xl bg-stone-50 border border-stone-200/80 space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <h4 className="font-bold text-xs text-stone-900">
                          {item.menuItem.name}
                        </h4>
                        <div className="flex items-center gap-1.5 text-[11px] font-mono">
                          <span className="text-amber-800 font-semibold">
                            {formatVND(item.menuItem.price)}
                          </span>
                          {item.discount !== undefined && item.discount > 0 && (
                            <span className="text-emerald-700 font-bold">
                              (-{formatVND(item.discount)}/món)
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Quantity Controls */}
                      <div className="flex items-center gap-1.5 bg-white border border-stone-200 rounded-lg p-0.5 shadow-2xs">
                        <button
                          type="button"
                          onClick={() => handleUpdateQuantity(item.menuItem.id, -1)}
                          className="w-6 h-6 rounded flex items-center justify-center text-stone-600 hover:bg-stone-100 cursor-pointer"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-5 text-center font-bold text-xs text-stone-900 font-mono">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleUpdateQuantity(item.menuItem.id, 1)}
                          className="w-6 h-6 rounded flex items-center justify-center text-stone-600 hover:bg-stone-100 cursor-pointer"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    </div>

                    {/* Note Input & Item Discount Row */}
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        value={item.note || ''}
                        onChange={(e) => handleUpdateItemNote(item.menuItem.id, e.target.value)}
                        placeholder="Ghi chú: Ít cay, không đường..."
                        className="text-[11px] px-2 py-1 bg-white border border-stone-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-500"
                      />
                      <input
                        type="number"
                        step="5000"
                        min="0"
                        value={item.discount || 0}
                        onChange={(e) => handleUpdateItemDiscount(item.menuItem.id, parseInt(e.target.value) || 0)}
                        placeholder="Giảm giá món (VND)..."
                        title="Giảm giá riêng cho món này (VND/món)"
                        className="text-[11px] px-2 py-1 bg-white border border-stone-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500 font-mono text-emerald-800"
                      />
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Note & Guest Name */}
            {posCart.length > 0 && (
              <div className="space-y-2 pt-2 border-t border-stone-100">
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Tên khách hàng (nếu có): Anh Hải, Chị Trang..."
                  className="w-full px-3 py-1.5 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-amber-500"
                />
                <input
                  type="text"
                  value={orderNote}
                  onChange={(e) => setOrderNote(e.target.value)}
                  placeholder="Ghi chú toàn đơn: Mang ra cùng lúc, ưu tiên trẻ em..."
                  className="w-full px-3 py-1.5 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-amber-500"
                />
              </div>
            )}

            {/* Flexible Adjustments Dropdown: VAT, Order Discount, Surcharge */}
            <div className="pt-2 border-t border-stone-100">
              <button
                type="button"
                onClick={() => setShowAdjustments(!showAdjustments)}
                className="w-full py-1.5 px-2 bg-stone-50 hover:bg-stone-100 rounded-xl border border-stone-200 text-xs font-semibold text-stone-700 flex items-center justify-between cursor-pointer"
              >
                <span className="flex items-center gap-1.5">
                  <Tag className="w-3.5 h-3.5 text-amber-600" />
                  <span>Thuế VAT, Giảm giá đơn, Phụ thu</span>
                </span>
                {showAdjustments ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>

              {showAdjustments && (
                <div className="p-3 bg-stone-50/70 border border-stone-200 rounded-xl mt-2 space-y-3 text-xs">
                  {/* Order Discount */}
                  <div className="space-y-1.5">
                    <label className="font-semibold text-stone-700 block">Giảm giá toàn đơn:</label>
                    <div className="flex items-center gap-2">
                      <div className="flex bg-white rounded-lg border border-stone-200 p-0.5 text-[11px] font-bold">
                        <button
                          type="button"
                          onClick={() => setOrderDiscountType('fixed')}
                          className={`px-2 py-0.5 rounded cursor-pointer ${orderDiscountType === 'fixed' ? 'bg-amber-600 text-white' : 'text-stone-600'}`}
                        >
                          Số tiền (đ)
                        </button>
                        <button
                          type="button"
                          onClick={() => setOrderDiscountType('percent')}
                          className={`px-2 py-0.5 rounded cursor-pointer ${orderDiscountType === 'percent' ? 'bg-amber-600 text-white' : 'text-stone-600'}`}
                        >
                          Phần trăm (%)
                        </button>
                      </div>

                      <input
                        type="number"
                        min="0"
                        value={orderDiscountValue}
                        onChange={(e) => setOrderDiscountValue(parseFloat(e.target.value) || 0)}
                        placeholder="0"
                        className="flex-1 px-2.5 py-1 bg-white border border-stone-200 rounded-lg text-xs font-mono font-bold"
                      />
                    </div>
                  </div>

                  {/* Surcharge */}
                  <div className="space-y-1.5">
                    <label className="font-semibold text-stone-700 block">Phụ thu (lễ tết/phòng VIP):</label>
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="number"
                        step="5000"
                        min="0"
                        value={surchargeAmount}
                        onChange={(e) => setSurchargeAmount(parseInt(e.target.value) || 0)}
                        placeholder="Số tiền phụ thu (VND)"
                        className="px-2.5 py-1 bg-white border border-stone-200 rounded-lg text-xs font-mono font-bold"
                      />
                      <input
                        type="text"
                        value={surchargeNote}
                        onChange={(e) => setSurchargeNote(e.target.value)}
                        placeholder="Lý do phụ thu"
                        className="px-2 py-1 bg-white border border-stone-200 rounded-lg text-[11px]"
                      />
                    </div>
                  </div>

                  {/* VAT */}
                  <div className="flex items-center justify-between pt-1 border-t border-stone-200/80">
                    <label className="flex items-center gap-1.5 font-semibold text-stone-700 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={vatEnabled}
                        onChange={(e) => setVatEnabled(e.target.checked)}
                        className="rounded text-amber-600"
                      />
                      <span>Áp dụng thuế VAT ({vatRate}%)</span>
                    </label>
                    {vatEnabled && (
                      <span className="font-mono font-bold text-amber-900 text-xs">
                        +{formatVND(vatAmount)}
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Calculations Breakdown */}
            <div className="pt-2 border-t border-stone-200 space-y-1 text-xs">
              <div className="flex items-center justify-between text-stone-600">
                <span>Tiền món:</span>
                <span className="font-mono tabular-nums">{formatVND(rawSubtotal)}</span>
              </div>

              {totalDiscount > 0 && (
                <div className="flex items-center justify-between text-emerald-700 font-semibold">
                  <span>Giảm giá:</span>
                  <span className="font-mono tabular-nums">-{formatVND(totalDiscount)}</span>
                </div>
              )}

              {currentSurcharge > 0 && (
                <div className="flex items-center justify-between text-stone-600">
                  <span>Phụ thu:</span>
                  <span className="font-mono tabular-nums">+{formatVND(currentSurcharge)}</span>
                </div>
              )}

              {vatAmount > 0 && (
                <div className="flex items-center justify-between text-stone-600">
                  <span>Thuế VAT ({vatRate}%):</span>
                  <span className="font-mono tabular-nums">+{formatVND(vatAmount)}</span>
                </div>
              )}

              <div className="flex items-center justify-between pt-1 border-t border-stone-200 text-sm">
                <span className="font-bold text-stone-900">TỔNG CỘNG:</span>
                <span className="font-extrabold text-amber-900 text-lg font-mono tabular-nums">
                  {formatVND(finalAmount)}
                </span>
              </div>
            </div>

            {/* Action Buttons: Handle both Round Addition ("Gọi thêm") and New Order */}
            <div className="space-y-2 pt-2">
              {orderType === 'dine_in' && activeTableOrder ? (
                <>
                  <button
                    type="button"
                    disabled={posCart.length === 0}
                    onClick={handleSubmitAddItems}
                    className={`w-full py-3 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer ${
                      posCart.length > 0
                        ? 'bg-amber-500 hover:bg-amber-400 text-stone-950'
                        : 'bg-stone-200 text-stone-400 cursor-not-allowed'
                    }`}
                  >
                    <Layers className="w-4 h-4" />
                    <span>GỌI THÊM VÀO ĐƠN #{activeTableOrder.orderCode} (ĐỢT {(activeTableOrder.rounds?.length || 1) + 1})</span>
                  </button>

                  <button
                    type="button"
                    disabled={posCart.length === 0}
                    onClick={handleSubmitNewOrder}
                    className="w-full py-2 rounded-xl text-xs font-semibold text-stone-600 border border-stone-200 hover:bg-stone-50 transition-colors cursor-pointer"
                  >
                    Tạo đơn mới riêng biệt cho bàn này
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  disabled={posCart.length === 0}
                  onClick={handleSubmitNewOrder}
                  className={`w-full py-3 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer ${
                    posCart.length > 0
                      ? 'bg-amber-500 hover:bg-amber-400 text-stone-950'
                      : 'bg-stone-200 text-stone-400 cursor-not-allowed'
                  }`}
                >
                  <ChefHat className="w-4 h-4" />
                  <span>Gửi Order Vào Bếp & Lên Món</span>
                </button>
              )}

              <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                <button
                  type="button"
                  onClick={() => setAdminTab('tables')}
                  className="py-2 px-3 rounded-xl border border-stone-200 hover:bg-stone-50 text-stone-700 font-semibold transition-colors cursor-pointer text-center"
                >
                  Xem Sơ Đồ Bàn
                </button>
                <button
                  type="button"
                  onClick={() => setAdminTab('orders')}
                  className="py-2 px-3 rounded-xl border border-stone-200 hover:bg-stone-50 text-stone-700 font-semibold transition-colors cursor-pointer text-center"
                >
                  Xem Bếp & Đơn
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
