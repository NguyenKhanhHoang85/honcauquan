import React, { useState, useRef } from 'react';
import { useRestaurant } from '../../context/RestaurantContext';
import { MenuItem, MenuCategory } from '../../types/restaurant';
import { formatVND, convertDriveUrlToDirect } from '../../utils/formatters';
import { compressImageFile } from '../../utils/imageHelpers';
import { 
  Plus, 
  Edit2, 
  Trash2, 
  CheckCircle2, 
  XCircle, 
  Search, 
  Sparkles, 
  Image as ImageIcon,
  UploadCloud,
  Laptop,
  Link2,
  X,
  Loader2,
  Check
} from 'lucide-react';

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

export const MenuManagement: React.FC = () => {
  const { 
    menuItems, 
    addMenuItem, 
    updateMenuItem, 
    toggleItemAvailability, 
    deleteMenuItem, 
    reloadOfficialMenu,
    showToast 
  } = useRestaurant();
  const [selectedCategory, setSelectedCategory] = useState<MenuCategory>('Tất cả');
  const [searchQuery, setSearchQuery] = useState('');

  // Add / Edit Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [category, setCategory] = useState<string>('Món Đặc Trưng');
  const [price, setPrice] = useState<number>(50000);
  const [imageUrl, setImageUrl] = useState('');
  const [description, setDescription] = useState('');
  const [unit, setUnit] = useState('Phần');
  const [preparationTime, setPreparationTime] = useState(15);
  const [isSpecial, setIsSpecial] = useState(false);

  // Image upload from computer state
  const [imageUploadMode, setImageUploadMode] = useState<'upload' | 'url'>('upload');
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const filteredItems = menuItems.filter((item) => {
    const matchCat = selectedCategory === 'Tất cả' || item.category === selectedCategory;
    const matchSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchSearch;
  });

  const handleOpenAdd = () => {
    setEditingItem(null);
    setName('');
    setCategory('Món Đặc Trưng');
    setPrice(65000);
    setImageUrl('');
    setImageUploadMode('upload');
    setDescription('');
    setUnit('Phần');
    setPreparationTime(15);
    setIsSpecial(false);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item: MenuItem) => {
    setEditingItem(item);
    setName(item.name);
    setCategory(item.category);
    setPrice(item.price);
    setImageUrl(item.imageUrl);
    setImageUploadMode('upload');
    setDescription(item.description);
    setUnit(item.unit || 'Phần');
    setPreparationTime(item.preparationTime || 10);
    setIsSpecial(!!item.isSpecial);
    setIsModalOpen(true);
  };

  const handleFileSelect = async (file: File) => {
    try {
      setIsUploadingImage(true);
      const optimizedDataUrl = await compressImageFile(file, 1000, 1000, 0.85);
      setImageUrl(optimizedDataUrl);
      showToast('Đã đính kèm ảnh món ăn từ máy tính thành công!');
    } catch (err: any) {
      showToast(err.message || 'Lỗi khi đọc ảnh từ máy tính');
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
    e.target.value = '';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      await handleFileSelect(file);
    }
  };

  const handlePaste = async (e: React.ClipboardEvent) => {
    const items = e.clipboardData?.items;
    if (!items) return;
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf('image') !== -1) {
        const file = items[i].getAsFile();
        if (file) {
          await handleFileSelect(file);
          setImageUploadMode('upload');
          break;
        }
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    if (editingItem) {
      updateMenuItem(editingItem.id, {
        name,
        category,
        price,
        imageUrl: imageUrl || 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=600&q=80',
        description,
        unit,
        preparationTime,
        isSpecial,
      });
      showToast(`Đã cập nhật món "${name}" thành công!`);
    } else {
      addMenuItem({
        name,
        category,
        price,
        imageUrl: imageUrl || 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=600&q=80',
        description,
        unit,
        preparationTime,
        isSpecial,
        isAvailable: true,
      });
      showToast(`Đã thêm món "${name}" vào thực đơn quán!`);
    }
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Top Bar */}
      <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-colors cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-amber-600 text-white font-semibold'
                  : 'bg-stone-100 text-stone-600 hover:bg-stone-200/80'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <div className="relative flex-1 sm:w-60">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm kiếm món..."
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/20"
            />
          </div>

          <button
            type="button"
            onClick={() => {
              if (window.confirm('Bạn có muốn đồng bộ lại toàn bộ 68 món chuẩn theo hình ảnh menu của Hòn Cau Quán?')) {
                reloadOfficialMenu();
              }
            }}
            className="px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 text-xs font-semibold rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer shrink-0"
            title="Đồng bộ lại danh sách 68 món chuẩn theo hình ảnh menu"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            <span className="hidden sm:inline">Nạp 68 Món Menu Gốc</span>
            <span className="sm:hidden">Menu 68 Món</span>
          </button>

          <button
            onClick={handleOpenAdd}
            className="px-3.5 py-1.5 bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Thêm Món Mới</span>
          </button>
        </div>
      </div>

      {/* Menu List Table */}
      <div className="bg-white rounded-2xl border border-stone-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-stone-200 text-stone-500 uppercase tracking-wider font-semibold bg-stone-50/70">
                <th className="py-3 px-4">Món ăn / Đồ uống</th>
                <th className="py-3 px-4">Danh mục</th>
                <th className="py-3 px-4 text-right">Đơn giá</th>
                <th className="py-3 px-4 text-center">Trạng thái</th>
                <th className="py-3 px-4 text-center">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {filteredItems.map((item) => (
                <tr key={item.id} className="hover:bg-stone-50/80 transition-colors">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={item.imageUrl}
                        alt={item.name}
                        referrerPolicy="no-referrer"
                        className="w-12 h-12 rounded-lg object-cover bg-stone-100 shrink-0"
                        onError={(e) => {
                          const target = e.currentTarget;
                          target.src = 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=600&q=80';
                        }}
                      />
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-stone-900 text-sm">{item.name}</span>
                          {item.isSpecial && (
                            <span className="text-[10px] font-bold text-amber-800 bg-amber-100 px-1.5 py-0.2 rounded">
                              Đặc sản
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-stone-400 line-clamp-1 max-w-sm mt-0.5">
                          {item.description}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-stone-600 font-medium">
                    {item.category}
                  </td>
                  <td className="py-3 px-4 text-right font-mono font-bold text-amber-900 tabular-nums text-sm">
                    {formatVND(item.price)}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <button
                      type="button"
                      onClick={() => toggleItemAvailability(item.id)}
                      className={`px-2.5 py-1 rounded-full text-[11px] font-bold transition-all cursor-pointer ${
                        item.isAvailable
                          ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                          : 'bg-rose-100 text-rose-800 hover:bg-rose-200'
                      }`}
                    >
                      {item.isAvailable ? 'Đang phục vụ' : 'Hết hàng'}
                    </button>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleOpenEdit(item)}
                        className="p-1.5 text-stone-500 hover:text-stone-900 hover:bg-stone-100 rounded-lg transition-colors cursor-pointer"
                        title="Chỉnh sửa món"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => deleteMenuItem(item.id)}
                        className="p-1.5 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                        title="Xóa món"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl p-5 sm:p-6 max-w-lg w-full max-h-[92vh] overflow-y-auto space-y-4 shadow-xl border border-stone-200">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <h3 className="font-bold text-base text-stone-900 font-serif">
                {editingItem ? 'Chỉnh Sửa Món Ăn' : 'Thêm Món Mới Vào Thực Đơn'}
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-stone-400 hover:text-stone-600 hover:bg-stone-100 cursor-pointer transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-stone-700 mb-1">Tên món *</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  placeholder="Ví dụ: Cua Huỳnh Đế sốt tiêu đen"
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Danh mục</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/20 cursor-pointer font-medium"
                  >
                    {CATEGORIES.filter((c) => c !== 'Tất cả').map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Đơn vị tính</label>
                  <input
                    type="text"
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                    placeholder="Phần, Đĩa, Ly, Nồi..."
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Đơn giá (VND) *</label>
                  <input
                    type="number"
                    step="1000"
                    min="0"
                    value={price}
                    onChange={(e) => setPrice(parseInt(e.target.value) || 0)}
                    required
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/20 font-bold"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Thời gian làm (phút)</label>
                  <input
                    type="number"
                    min="1"
                    max="120"
                    value={preparationTime}
                    onChange={(e) => setPreparationTime(parseInt(e.target.value) || 10)}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                  />
                </div>
              </div>

              {/* Image attachment: Computer upload (Default) or Link/Drive */}
              <div 
                className="bg-stone-50 p-3.5 rounded-2xl border border-stone-200/90 space-y-2.5"
                onPaste={handlePaste}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-stone-800 flex items-center gap-1.5 text-xs">
                    <ImageIcon className="w-3.5 h-3.5 text-amber-600" />
                    <span>Hình ảnh món ăn</span>
                  </span>

                  {/* Mode switcher */}
                  <div className="flex items-center bg-stone-200/80 p-0.5 rounded-lg text-[11px]">
                    <button
                      type="button"
                      onClick={() => setImageUploadMode('upload')}
                      className={`px-2.5 py-1 rounded-md font-semibold transition-all cursor-pointer flex items-center gap-1 ${
                        imageUploadMode === 'upload'
                          ? 'bg-white text-stone-900 shadow-xs'
                          : 'text-stone-500 hover:text-stone-800'
                      }`}
                    >
                      <Laptop className="w-3 h-3 text-amber-600" />
                      <span>Từ máy tính</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setImageUploadMode('url')}
                      className={`px-2.5 py-1 rounded-md font-semibold transition-all cursor-pointer flex items-center gap-1 ${
                        imageUploadMode === 'url'
                          ? 'bg-white text-stone-900 shadow-xs'
                          : 'text-stone-500 hover:text-stone-800'
                      }`}
                    >
                      <Link2 className="w-3 h-3 text-stone-600" />
                      <span>Dán link / Mẫu</span>
                    </button>
                  </div>
                </div>

                {imageUploadMode === 'upload' ? (
                  <div className="space-y-2">
                    {/* Hidden file input */}
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleFileInputChange}
                    />

                    {isUploadingImage ? (
                      <div className="border-2 border-dashed border-amber-300 bg-amber-50/50 rounded-xl p-6 flex flex-col items-center justify-center gap-2">
                        <Loader2 className="w-6 h-6 text-amber-600 animate-spin" />
                        <span className="text-xs font-semibold text-stone-700">Đang tối ưu & nạp ảnh từ máy tính...</span>
                      </div>
                    ) : imageUrl ? (
                      /* Preview of attached image */
                      <div className="bg-white p-3 rounded-xl border border-stone-200 flex flex-col sm:flex-row items-center gap-3">
                        <div className="relative shrink-0 w-24 h-24 sm:w-20 sm:h-20 rounded-xl overflow-hidden border border-stone-200 shadow-xs bg-stone-100">
                          <img
                            src={imageUrl}
                            alt="Ảnh món ăn"
                            className="w-full h-full object-cover"
                            onError={(e) => { (e.target as HTMLElement).style.opacity = '0.3'; }}
                          />
                        </div>

                        <div className="flex-1 space-y-1 text-center sm:text-left min-w-0">
                          <div className="flex items-center gap-1.5 justify-center sm:justify-start">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                            <span className="font-bold text-xs text-stone-900 truncate">
                              {imageUrl.startsWith('data:') ? 'Ảnh đính kèm từ máy tính của bạn' : 'Ảnh món ăn đã chọn'}
                            </span>
                          </div>
                          <p className="text-[11px] text-stone-500">
                            Ảnh đã sẵn sàng. Tự động tương thích và hiển thị sắc nét trên menu.
                          </p>

                          <div className="flex flex-wrap items-center gap-2 pt-1 justify-center sm:justify-start">
                            <button
                              type="button"
                              onClick={() => fileInputRef.current?.click()}
                              className="px-2.5 py-1 bg-amber-500 hover:bg-amber-600 text-stone-950 font-bold rounded-lg text-xs cursor-pointer flex items-center gap-1 transition-colors shadow-xs"
                            >
                              <UploadCloud className="w-3.5 h-3.5" />
                              <span>Chọn ảnh khác từ máy tính</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => setImageUrl('')}
                              className="px-2 py-1 bg-stone-100 hover:bg-rose-50 hover:text-rose-600 text-stone-500 rounded-lg text-xs cursor-pointer flex items-center gap-1 transition-colors"
                            >
                              <X className="w-3.5 h-3.5" />
                              <span>Gỡ ảnh</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      /* Drag & drop upload box */
                      <div
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                        onClick={() => fileInputRef.current?.click()}
                        className={`border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-2 ${
                          isDragging
                            ? 'border-amber-500 bg-amber-100/60 scale-[1.01]'
                            : 'border-stone-300 hover:border-amber-500 bg-white hover:bg-amber-50/30'
                        }`}
                      >
                        <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shadow-xs">
                          <UploadCloud className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="font-bold text-xs text-stone-900">
                            <span className="text-amber-700 underline decoration-amber-400">Bấm để chọn ảnh từ máy tính</span> hoặc kéo thả ảnh vào đây
                          </p>
                          <p className="text-[11px] text-stone-500 pt-0.5">
                            Hỗ trợ JPG, PNG, WebP (Tự động nén tối ưu dung lượng)
                          </p>
                        </div>
                        <span className="text-[10px] text-stone-400 bg-stone-100 px-2 py-0.5 rounded-md">
                          Mẹo: Có thể dán ảnh trực tiếp bằng phím tắt Ctrl + V
                        </span>
                      </div>
                    )}
                  </div>
                ) : (
                  /* URL & Google Drive Mode */
                  <div className="space-y-2">
                    <input
                      type="text"
                      value={imageUrl}
                      onChange={(e) => setImageUrl(convertDriveUrlToDirect(e.target.value))}
                      placeholder="Dán link Drive (drive.google.com/file/d/...) hoặc URL ảnh..."
                      className="w-full px-3 py-1.5 bg-white border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/20 text-xs font-mono"
                    />

                    <div className="flex items-center gap-1.5 pt-1 overflow-x-auto text-[10px]">
                      <span className="text-stone-400 shrink-0">Chọn mẫu nhanh:</span>
                      <button
                        type="button"
                        onClick={() => setImageUrl('https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=600&q=80')}
                        className="px-2 py-0.5 rounded bg-white border border-stone-200 text-stone-600 hover:bg-stone-100 cursor-pointer shrink-0"
                      >
                        Hải sản rang
                      </button>
                      <button
                        type="button"
                        onClick={() => setImageUrl('https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=600&q=80')}
                        className="px-2 py-0.5 rounded bg-white border border-stone-200 text-stone-600 hover:bg-stone-100 cursor-pointer shrink-0"
                      >
                        Lẩu hải sản
                      </button>
                      <button
                        type="button"
                        onClick={() => setImageUrl('https://images.unsplash.com/photo-1559742811-822873691df8?auto=format&fit=crop&w=600&q=80')}
                        className="px-2 py-0.5 rounded bg-white border border-stone-200 text-stone-600 hover:bg-stone-100 cursor-pointer shrink-0"
                      >
                        Mực nướng
                      </button>
                      <button
                        type="button"
                        onClick={() => setImageUrl('https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=600&q=80')}
                        className="px-2 py-0.5 rounded bg-white border border-stone-200 text-stone-600 hover:bg-stone-100 cursor-pointer shrink-0"
                      >
                        Cà phê
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">Mô tả món ăn</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={2}
                  placeholder="Mô tả nguyên liệu, hương vị đặc trưng..."
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="isSpecialCheck"
                  checked={isSpecial}
                  onChange={(e) => setIsSpecial(e.target.checked)}
                  className="rounded text-amber-600 focus:ring-amber-500"
                />
                <label htmlFor="isSpecialCheck" className="text-stone-700 font-medium">
                  Đánh dấu là món Đặc Sản Nổi Bật của quán
                </label>
              </div>

              <div className="flex items-center gap-2 pt-3 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="w-1/2 py-2 text-stone-600 bg-stone-100 hover:bg-stone-200 font-semibold rounded-xl cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="w-1/2 py-2 text-white bg-amber-600 hover:bg-amber-700 font-bold rounded-xl shadow-xs cursor-pointer"
                >
                  Lưu Thông Tin
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
