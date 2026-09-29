export type MenuCategory = 
  | 'Tất cả'
  | 'Món Đặc Trưng'
  | 'Món Khai Vị & Gỏi'
  | 'Món Nướng'
  | 'Món Lẩu'
  | 'Cơm & Mì'
  | 'Món Khác'
  | 'Rau & Món Ăn Kèm'
  | 'Nước Giải Khát & Bia';

export interface MenuItem {
  id: string;
  category: MenuCategory | string;
  name: string;
  price: number;
  imageUrl: string;
  description: string;
  isAvailable: boolean;
  isSpecial?: boolean;
  unit?: string;
  preparationTime?: number; // minutes
}

export type TableArea = 
  | 'Sân vườn biển' 
  | 'Trong nhà máy lạnh' 
  | 'Sân thượng hoàng hôn' 
  | 'Phòng VIP Hòn Cau';

export type TableStatus = 'available' | 'occupied' | 'reserved' | 'billing';

export interface RestaurantTable {
  id: string;
  tableNumber: number;
  name: string;
  area: TableArea;
  capacity: number;
  status: TableStatus;
  activeOrderId?: string;
  guestCount?: number;
  seatedAt?: string;
}

export interface CartItem {
  menuItem: MenuItem;
  quantity: number;
  note?: string;
}

export type PaymentMethod = 'vietqr' | 'momo' | 'vnpay' | 'zalopay' | 'cash' | 'card';
export type PaymentStatus = 'unpaid' | 'paid';
export type OrderStatus = 'pending' | 'preparing' | 'served' | 'completed' | 'cancelled';
export type OrderType = 'dine_in' | 'takeaway';

export interface OrderItemRecord {
  menuItemId: string;
  name: string;
  price: number;
  quantity: number;
  category?: string;
  imageUrl?: string;
  note?: string;
  discount?: number; // Giảm giá trực tiếp trên món này (VND)
  round?: number; // Đợt gọi món (1, 2, 3...)
}

export interface OrderHistoryLog {
  id: string;
  timestamp: string;
  actor: string;
  action: string;
  details?: string;
}

export interface OrderRound {
  roundNumber: number;
  addedAt: string;
  addedBy: string;
  items: OrderItemRecord[];
  printedToKitchen?: boolean;
}

export interface Order {
  id: string;
  orderCode: string;
  tableId?: string;
  tableName?: string;
  orderType: OrderType;
  customerName: string;
  customerPhone: string;
  items: OrderItemRecord[];
  totalAmount: number;
  vatRate?: number; // e.g. 8 or 10%
  vatAmount?: number;
  surchargeAmount?: number;
  surchargeNote?: string;
  discountAmount: number;
  discountNote?: string;
  finalAmount: number;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  orderStatus: OrderStatus;
  createdAt: string;
  paidAt?: string;
  note?: string;
  staffName?: string;
  rounds?: OrderRound[];
  history?: OrderHistoryLog[];
}

export interface RestaurantSettings {
  name: string;
  slogan: string;
  hotline: string;
  address: string;
  taxId: string;
  wifiName: string;
  wifiPass: string;
  logoUrl: string;
  bankId: string;
  bankName: string;
  accountNo: string;
  accountName: string;
  defaultVatRate: number;
  isVatEnabled: boolean;
  defaultSurcharge: number;
  surchargeReason: string;
  primaryColor: string; // Hex color code
  headerBannerUrl?: string; // Background image for the header banner
  googleSheetsWebhookUrl?: string;
  autoSyncGoogleSheets: boolean;
  lastGoogleSheetsSync?: string;
}

export interface StaffAuditLog {
  id: string;
  timestamp: string;
  staffName: string;
  staffRole: UserRole;
  actionType: 
    | 'menu_add' 
    | 'menu_edit' 
    | 'menu_delete' 
    | 'menu_toggle'
    | 'order_create' 
    | 'order_add_item' 
    | 'order_discount' 
    | 'order_status' 
    | 'order_pay' 
    | 'table_change' 
    | 'settings_update'
    | 'staff_manage';
  details: string;
  targetId?: string;
}

export interface Reservation {
  id: string;
  bookingCode: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  guestCount: number;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  area: TableArea;
  tableId?: string;
  specialRequests?: string;
  status: 'confirmed' | 'seated' | 'cancelled';
  createdAt: string;
}

export interface RevenueRecord {
  id: string;
  date: string; // YYYY-MM-DD
  month: string; // YYYY-MM
  hour: number; // 0-23
  revenue: number;
  orderCount: number;
  guestCount: number;
  paymentMethod: PaymentMethod;
  category: string;
}

export type UserRole = 'staff' | 'manager';

export interface StaffAccount {
  id: string;
  username: string;
  password?: string;
  pin: string;
  fullName: string;
  role: UserRole;
  phone?: string;
  avatar?: string;
  shift?: string;
}

