import React, { useState } from 'react';
import { useRestaurant } from '../../context/RestaurantContext';
import { MenuItem, MenuCategory } from '../../types/restaurant';
import { formatVND } from '../../utils/formatters';
import { Search, Plus, Sparkles, Utensils, Clock, Flame, Check } from 'lucide-react';

const CATEGORIES: MenuCategory[] = [
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

export const MenuSection: React.FC = () => {
  const { menuItems, addToCart } = useRestaurant();
  const [selectedCategory, setSelectedCategory] = useState<MenuCategory>('Tất cả');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOption, setSortOption] = useState<'default' | 'price_asc' | 'price_desc'>('default');
  
  // Customization note modal
  const [customizingItem, setCustomizingItem] = useState<MenuItem | null>(null);
  const [itemNote, setItemNote] = useState('');
  const [itemQuantity, setItemQuantity] = useState(1);

  // Filter items
  const filteredItems = menuItems.filter((item) => {
    const matchesCategory =
      selectedCategory === 'Tất cả' || item.category === selectedCategory;
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Sort items
  const sortedItems = [...filteredItems].sort((a, b) => {
    if (sortOption === 'price_asc') return a.price - b.price;
    if (sortOption === 'price_desc') return b.price - a.price;
    if (a.isSpecial && !b.isSpecial) return -1;
    if (!a.isSpecial && b.isSpecial) return 1;
    return 0;
  });

  const handleQuickAdd = (item: MenuItem, e: React.MouseEvent) => {
    e.stopPropagation();
    addToCart(item, 1);
  };

  const handleOpenCustomize = (item: MenuItem) => {
    setCustomizingItem(item);
    setItemNote('');
    setItemQuantity(1);
  };

  const handleConfirmCustomize = () => {
    if (customizingItem) {
      addToCart(customizingItem, itemQuantity, itemNote);
      setCustomizingItem(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Category Pills & Filters */}
      <div className="bg-white p-4 rounded-2xl border border-stone-200/80 shadow-sm space-y-3">
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
          {/* Search bar */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm kiếm món ăn, cà phê, hải sản Hòn Cau..."
              className="w-full pl-10 pr-4 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600 transition-all placeholder:text-stone-400"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 text-xs"
              >
                Xóa
              </button>
            )}
          </div>

          {/* Sort dropdown */}
          <div className="flex items-center gap-2 shrink-0 text-xs">
            <span className="text-stone-500 hidden sm:inline">Sắp xếp:</span>
            <select
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value as any)}
              className="bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-stone-700 font-medium focus:outline-none focus:ring-2 focus:ring-amber-500/20 cursor-pointer"
            >
              <option value="default">Nổi bật nhất</option>
              <option value="price_asc">Giá tăng dần</option>
              <option value="price_desc">Giá giảm dần</option>
            </select>
          </div>
        </div>

        {/* Category selector */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-1 no-scrollbar">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-amber-600 text-white shadow-sm font-semibold'
                  : 'bg-stone-100 hover:bg-stone-200/70 text-stone-700'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of Dishes */}
      {sortedItems.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-stone-200">
          <Utensils className="w-10 h-10 text-stone-300 mx-auto mb-3" />
          <h4 className="text-base font-semibold text-stone-800">Không tìm thấy món phù hợp</h4>
          <p className="text-xs text-stone-500 mt-1 max-w-sm mx-auto">
            Vui lòng thử tìm với từ khóa khác hoặc đổi sang danh mục khác.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
          {sortedItems.map((item) => (
            <div
              key={item.id}
              onClick={() => handleOpenCustomize(item)}
              className="group bg-white rounded-2xl border border-stone-200/90 overflow-hidden shadow-sm hover:shadow-md transition-all duration-200 flex flex-col cursor-pointer"
            >
              {/* Image Frame */}
              <div className="relative aspect-[4/3] bg-stone-100 overflow-hidden">
                <img
                  src={item.imageUrl}
                  alt={item.name}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  onError={(e) => {
                    const target = e.currentTarget;
                    target.src = 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=600&q=80';
                  }}
                />
                
                {/* Special Tag */}
                {item.isSpecial && (
                  <div className="absolute top-2.5 left-2.5 bg-amber-600/90 backdrop-blur-md text-white text-[11px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1 shadow-sm">
                    <Sparkles className="w-3 h-3" />
                    Đặc sản quán
                  </div>
                )}

                {/* Availability Overlay */}
                {!item.isAvailable && (
                  <div className="absolute inset-0 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center text-white text-xs font-bold">
                    Tạm hết hàng
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="p-4 flex-1 flex flex-col justify-between space-y-2">
                <div>
                  <div className="flex items-center justify-between gap-1 text-[11px] text-stone-500">
                    <span className="font-medium text-amber-800">{item.category}</span>
                    {item.preparationTime && (
                      <span className="flex items-center gap-0.5 text-stone-400">
                        <Clock className="w-3 h-3" />
                        {item.preparationTime}p
                      </span>
                    )}
                  </div>
                  <h3 className="font-bold text-stone-900 text-sm sm:text-base group-hover:text-amber-800 transition-colors line-clamp-1">
                    {item.name}
                  </h3>
                  <p className="text-xs text-stone-500 line-clamp-2 leading-relaxed">
                    {item.description}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-stone-100">
                  <div className="font-extrabold text-amber-900 text-base tabular-nums">
                    {formatVND(item.price)}
                  </div>

                  <button
                    type="button"
                    onClick={(e) => handleQuickAdd(item, e)}
                    disabled={!item.isAvailable}
                    className="p-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white transition-all shadow-sm active:scale-95 disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
                    title="Thêm vào giỏ"
                    aria-label={`Thêm ${item.name} vào giỏ`}
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Item Customization Modal */}
      {customizingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div 
            className="bg-white rounded-2xl shadow-xl max-w-md w-full overflow-hidden border border-stone-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative aspect-video bg-stone-100">
              <img
                src={customizingItem.imageUrl}
                alt={customizingItem.name}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
              <button
                onClick={() => setCustomizingItem(null)}
                className="absolute top-3 right-3 bg-stone-900/60 hover:bg-stone-900 text-white w-8 h-8 rounded-full flex items-center justify-center transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="p-5 space-y-4">
              <div>
                <div className="text-xs font-semibold text-amber-800">
                  {customizingItem.category}
                </div>
                <h3 className="text-lg font-bold text-stone-900">
                  {customizingItem.name}
                </h3>
                <p className="text-xs text-stone-500 mt-1">
                  {customizingItem.description}
                </p>
                <div className="text-xl font-extrabold text-amber-900 mt-2 tabular-nums">
                  {formatVND(customizingItem.price)}
                </div>
              </div>

              {/* Quantity Stepper */}
              <div className="flex items-center justify-between bg-stone-50 p-3 rounded-xl border border-stone-200">
                <span className="text-xs font-medium text-stone-700">Số lượng:</span>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setItemQuantity(Math.max(1, itemQuantity - 1))}
                    className="w-7 h-7 rounded-lg bg-white border border-stone-300 font-bold text-stone-700 hover:bg-stone-100 flex items-center justify-center cursor-pointer"
                  >
                    -
                  </button>
                  <span className="font-bold text-stone-900 text-sm font-mono tabular-nums">
                    {itemQuantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => setItemQuantity(itemQuantity + 1)}
                    className="w-7 h-7 rounded-lg bg-white border border-stone-300 font-bold text-stone-700 hover:bg-stone-100 flex items-center justify-center cursor-pointer"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Special Note Input */}
              <div>
                <label className="block text-xs font-semibold text-stone-600 mb-1">
                  Ghi chú cho bếp / pha chế:
                </label>
                <input
                  type="text"
                  value={itemNote}
                  onChange={(e) => setItemNote(e.target.value)}
                  placeholder="Ví dụ: ít đường, nhiều đá, hấp sả thơm, không cay..."
                  className="w-full px-3 py-2 text-xs border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600"
                />
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setCustomizingItem(null)}
                  className="w-1/3 py-2.5 text-xs font-semibold text-stone-600 bg-stone-100 hover:bg-stone-200 rounded-xl cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="button"
                  onClick={handleConfirmCustomize}
                  className="flex-1 py-2.5 text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 rounded-xl shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <Check className="w-4 h-4" />
                  <span>Thêm {formatVND(customizingItem.price * itemQuantity)}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
