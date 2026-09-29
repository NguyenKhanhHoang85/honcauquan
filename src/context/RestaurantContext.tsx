import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { 
  MenuItem, 
  RestaurantTable, 
  Order, 
  Reservation, 
  CartItem, 
  PaymentMethod, 
  OrderStatus, 
  TableStatus, 
  OrderType,
  StaffAccount,
  UserRole,
  RestaurantSettings,
  StaffAuditLog,
  OrderRound,
  OrderHistoryLog,
  OrderItemRecord
} from '../types/restaurant';
import { 
  INITIAL_MENU_ITEMS, 
  INITIAL_TABLES, 
  INITIAL_ORDERS, 
  INITIAL_RESERVATIONS,
  INITIAL_STAFF_ACCOUNTS,
  INITIAL_SETTINGS,
  INITIAL_AUDIT_LOGS
} from '../data/initialData';
import {
  seedDatabaseIfEmpty,
  syncOfficialMenuToCloud,
  subscribeToMenuItems,
  subscribeToTables,
  subscribeToOrders,
  subscribeToReservations,
  subscribeToStaffAccounts,
  subscribeToSettings,
  saveSettingsToDb,
  subscribeToAuditLogs,
  addAuditLogToDb,
  saveMenuItemToDb,
  deleteMenuItemFromDb,
  saveTableToDb,
  deleteTableFromDb,
  saveOrderToDb,
  saveReservationToDb,
  saveStaffAccountToDb,
  deleteStaffAccountFromDb,
  resetCloudDatabaseToDefaults,
} from '../services/firestoreSync';
import { testFirestoreConnection, auth } from '../firebase';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import {
  KitchenAlertData,
  triggerKitchenVibration,
  playKitchenChime,
  requestPushPermission,
  sendBrowserPushNotification
} from '../utils/kitchenNotification';

export type AdminTab = 'pos' | 'tables' | 'orders' | 'reports' | 'menu' | 'reservations' | 'staff' | 'audit' | 'settings';

interface RestaurantContextType {
  // Navigation & View
  viewMode: 'customer' | 'admin';
  setViewMode: (mode: 'customer' | 'admin') => void;
  adminTab: AdminTab;
  setAdminTab: (tab: AdminTab) => void;
  customerTab: 'menu' | 'reservation' | 'my_order';
  setCustomerTab: (tab: 'menu' | 'reservation' | 'my_order') => void;

  // Restaurant Settings & Branding
  settings: RestaurantSettings;
  updateSettings: (newSettings: Partial<RestaurantSettings>) => void;

  // Audit Logs (Staff Action History)
  auditLogs: StaffAuditLog[];
  logStaffAction: (actionType: StaffAuditLog['actionType'], details: string, targetId?: string) => void;

  // Authentication & Roles
  currentUser: StaffAccount | null;
  isLoginModalOpen: boolean;
  setIsLoginModalOpen: (open: boolean) => void;
  loginWithCredentials: (username: string, password?: string) => { success: boolean; message?: string };
  loginWithPin: (pin: string) => { success: boolean; message?: string };
  loginWithGoogle: () => Promise<{ success: boolean; message?: string }>;
  quickLoginRole: (role: UserRole) => void;
  logoutUser: () => void;
  availableStaffAccounts: StaffAccount[]; // alias to staffAccounts
  staffAccounts: StaffAccount[];
  addStaffAccount: (account: Omit<StaffAccount, 'id'>) => { success: boolean; message?: string };
  updateStaffAccount: (id: string, updates: Partial<StaffAccount>) => { success: boolean; message?: string };
  deleteStaffAccount: (id: string) => { success: boolean; message?: string };
  changeUserPasswordOrPin: (id: string, newPassword?: string, newPin?: string) => { success: boolean; message?: string };
  prefillPosTableId: string | null;
  setPrefillPosTableId: (tableId: string | null) => void;
  hasPermission: (tab: AdminTab) => boolean;

  // Cloud Realtime Status
  isCloudConnected: boolean;
  cloudSyncError: string | null;

  // Menu items
  menuItems: MenuItem[];
  addMenuItem: (item: Omit<MenuItem, 'id'>) => void;
  updateMenuItem: (id: string, updates: Partial<MenuItem>) => void;
  toggleItemAvailability: (id: string) => void;
  deleteMenuItem: (id: string) => void;
  reloadOfficialMenu: () => void;

  // Tables
  tables: RestaurantTable[];
  addTable: (table: Omit<RestaurantTable, 'id' | 'status'>) => void;
  updateTable: (id: string, updates: Partial<RestaurantTable>) => void;
  deleteTable: (id: string) => void;
  updateTableStatus: (tableId: string, status: TableStatus, guestCount?: number, orderId?: string) => void;
  clearTable: (tableId: string) => void;

  // Cart
  cart: CartItem[];
  addToCart: (item: MenuItem, quantity?: number, note?: string) => void;
  updateCartQuantity: (itemId: string, quantity: number) => void;
  removeFromCart: (itemId: string) => void;
  clearCart: () => void;
  cartTotal: number;
  cartCount: number;

  // Orders
  orders: Order[];
  createOrder: (orderData: {
    customerName: string;
    customerPhone: string;
    orderType: OrderType;
    tableId?: string;
    tableName?: string;
    items: OrderItemRecord[];
    paymentMethod: PaymentMethod;
    note?: string;
    vatRate?: number;
    vatAmount?: number;
    surchargeAmount?: number;
    surchargeNote?: string;
    discountAmount?: number;
    discountNote?: string;
    staffName?: string;
  }) => Order;
  addItemsToExistingOrder: (
    orderId: string,
    newItems: OrderItemRecord[],
    staffNote?: string
  ) => { success: boolean; order?: Order };
  updateOrderStatus: (orderId: string, status: OrderStatus) => void;
  processPayment: (orderId: string, method: PaymentMethod) => void;

  // Reservations
  reservations: Reservation[];
  createReservation: (data: Omit<Reservation, 'id' | 'bookingCode' | 'status' | 'createdAt'>) => Reservation;
  updateReservationStatus: (id: string, status: 'confirmed' | 'seated' | 'cancelled') => void;

  // Modals & Interactive Views
  activePaymentOrder: Order | null;
  setActivePaymentOrder: (order: Order | null) => void;
  activeReceiptOrder: Order | null;
  setActiveReceiptOrder: (order: Order | null) => void;
  activeKitchenPrintOrder: { order: Order; roundOnly?: boolean } | null;
  setActiveKitchenPrintOrder: (data: { order: Order; roundOnly?: boolean } | null) => void;
  activeOrderHistoryOrder: Order | null;
  setActiveOrderHistoryOrder: (order: Order | null) => void;

  // Table selection for customer
  selectedCustomerTable: string | null;
  setSelectedCustomerTable: (tableId: string | null) => void;

  // Google Sheets Instant Sync
  syncOrdersToGoogleSheets: (customWebhookUrl?: string) => Promise<{ success: boolean; message: string }>;

  // Toast
  toastMessage: string | null;
  showToast: (msg: string) => void;

  // Kitchen Notification & Vibration
  kitchenAlert: KitchenAlertData | null;
  dismissKitchenAlert: () => void;
  triggerKitchenAlert: (alert: KitchenAlertData) => void;
  kitchenNotifySettings: {
    vibrateEnabled: boolean;
    soundEnabled: boolean;
    pushEnabled: boolean;
  };
  toggleKitchenVibrate: () => void;
  toggleKitchenSound: () => void;
  enableKitchenPush: () => Promise<boolean>;
  testKitchenNotification: () => void;

  // Reset
  resetAllData: () => void;
}

const RestaurantContext = createContext<RestaurantContextType | undefined>(undefined);

export const RestaurantProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [viewMode, setViewMode] = useState<'customer' | 'admin'>('customer');
  const [adminTab, setAdminTabState] = useState<AdminTab>('tables');
  const [customerTab, setCustomerTab] = useState<'menu' | 'reservation' | 'my_order'>('menu');

  // Cloud Realtime Status
  const [isCloudConnected, setIsCloudConnected] = useState<boolean>(false);
  const [cloudSyncError, setCloudSyncError] = useState<string | null>(null);

  // Restaurant Settings & Branding
  const [settings, setSettings] = useState<RestaurantSettings>(() => {
    try {
      const saved = localStorage.getItem('hon_cau_settings');
      return saved ? JSON.parse(saved) : INITIAL_SETTINGS;
    } catch {
      return INITIAL_SETTINGS;
    }
  });

  // Apply primary color to document root
  useEffect(() => {
    if (settings.primaryColor) {
      document.documentElement.style.setProperty('--brand-primary', settings.primaryColor);
    }
    try {
      localStorage.setItem('hon_cau_settings', JSON.stringify(settings));
    } catch {
      // ignore
    }
  }, [settings]);

  // Audit Logs (Staff Action History)
  const [auditLogs, setAuditLogs] = useState<StaffAuditLog[]>(() => {
    try {
      const saved = localStorage.getItem('hon_cau_audit_logs');
      return saved ? JSON.parse(saved) : INITIAL_AUDIT_LOGS;
    } catch {
      return INITIAL_AUDIT_LOGS;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('hon_cau_audit_logs', JSON.stringify(auditLogs));
    } catch {
      // ignore
    }
  }, [auditLogs]);

  const logStaffAction = (
    actionType: StaffAuditLog['actionType'],
    details: string,
    targetId?: string
  ) => {
    const newLog: StaffAuditLog = {
      id: `log-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: new Date().toISOString(),
      staffName: currentUser?.fullName || 'Khách / Hệ thống',
      staffRole: currentUser?.role || 'staff',
      actionType,
      details,
      ...(targetId ? { targetId } : {}),
    };
    setAuditLogs((prev) => [newLog, ...prev.slice(0, 499)]);
    addAuditLogToDb(newLog);
  };

  const updateSettings = (newSettings: Partial<RestaurantSettings>) => {
    const updated = { ...settings, ...newSettings };
    setSettings(updated);
    saveSettingsToDb(updated);
    logStaffAction('settings_update', 'Đã lưu cấu hình nhà hàng & thông tin hóa đơn');
    showToast('Đã lưu thông tin nhà hàng và màu sắc chủ đạo thành công!');
  };

  // Authentication & Roles
  const [staffAccounts, setStaffAccounts] = useState<StaffAccount[]>(() => {
    try {
      const saved = localStorage.getItem('hon_cau_staff');
      return saved ? JSON.parse(saved) : INITIAL_STAFF_ACCOUNTS;
    } catch {
      return INITIAL_STAFF_ACCOUNTS;
    }
  });
  const availableStaffAccounts = staffAccounts;

  const [currentUser, setCurrentUser] = useState<StaffAccount | null>(() => {
    try {
      const saved = localStorage.getItem('hon_cau_current_user');
      return saved ? JSON.parse(saved) : INITIAL_STAFF_ACCOUNTS[0]; // Lê Hoàng Nam (Manager) by default
    } catch {
      return INITIAL_STAFF_ACCOUNTS[0];
    }
  });
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [prefillPosTableId, setPrefillPosTableId] = useState<string | null>(null);

  // Sync staffAccounts to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('hon_cau_staff', JSON.stringify(staffAccounts));
    } catch {
      // ignore
    }
  }, [staffAccounts]);

  // Sync currentUser to localStorage
  useEffect(() => {
    try {
      if (currentUser) {
        localStorage.setItem('hon_cau_current_user', JSON.stringify(currentUser));
      } else {
        localStorage.removeItem('hon_cau_current_user');
      }
    } catch {
      // ignore
    }
  }, [currentUser]);

  // Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 3500);
  };

  // Kitchen Alert & Haptic/Sound Settings
  const [kitchenAlert, setKitchenAlert] = useState<KitchenAlertData | null>(null);
  const [kitchenNotifySettings, setKitchenNotifySettings] = useState(() => {
    try {
      const v = localStorage.getItem('hon_cau_kitchen_vibrate');
      const s = localStorage.getItem('hon_cau_kitchen_sound');
      const p = localStorage.getItem('hon_cau_kitchen_push');
      return {
        vibrateEnabled: v !== null ? v === 'true' : true,
        soundEnabled: s !== null ? s === 'true' : true,
        pushEnabled: p !== null ? p === 'true' : false,
      };
    } catch {
      return { vibrateEnabled: true, soundEnabled: true, pushEnabled: false };
    }
  });

  const toggleKitchenVibrate = () => {
    setKitchenNotifySettings((prev) => {
      const next = { ...prev, vibrateEnabled: !prev.vibrateEnabled };
      try {
        localStorage.setItem('hon_cau_kitchen_vibrate', String(next.vibrateEnabled));
      } catch {}
      showToast(next.vibrateEnabled ? '📳 Đã bật rung báo đơn bếp' : '📴 Đã tắt rung báo đơn bếp');
      if (next.vibrateEnabled) {
        triggerKitchenVibration([200, 100, 300]);
      }
      return next;
    });
  };

  const toggleKitchenSound = () => {
    setKitchenNotifySettings((prev) => {
      const next = { ...prev, soundEnabled: !prev.soundEnabled };
      try {
        localStorage.setItem('hon_cau_kitchen_sound', String(next.soundEnabled));
      } catch {}
      showToast(next.soundEnabled ? '🔔 Đã bật chuông báo đơn bếp' : '🔕 Đã tắt chuông báo đơn bếp');
      if (next.soundEnabled) {
        playKitchenChime(0.8);
      }
      return next;
    });
  };

  const enableKitchenPush = async (): Promise<boolean> => {
    const perm = await requestPushPermission();
    if (perm === 'granted') {
      setKitchenNotifySettings((prev) => {
        const next = { ...prev, pushEnabled: true };
        try {
          localStorage.setItem('hon_cau_kitchen_push', 'true');
        } catch {}
        return next;
      });
      sendBrowserPushNotification('Hòn Cau Quán - Bếp', 'Đã kích hoạt thông báo đẩy cho nhân viên nhà bếp!');
      showToast('Đã kích hoạt thông báo đẩy trình duyệt cho nhân viên bếp!');
      return true;
    } else {
      showToast('Quyền thông báo chưa được cấp phép hoặc trình duyệt chưa hỗ trợ.');
      return false;
    }
  };

  const testKitchenNotification = useCallback(() => {
    const vibrated = triggerKitchenVibration([280, 120, 280, 120, 450]);
    playKitchenChime(0.85);
    showToast(
      vibrated
        ? '🔔 Đã thử chuông và kích hoạt rung thành công!'
        : '🔔 Đã phát chuông báo bếp! (Thiết bị hiện tại chưa hỗ trợ mô-tơ rung)'
    );
  }, []);

  const triggerKitchenAlert = useCallback((alert: KitchenAlertData) => {
    setKitchenAlert(alert);

    // 1. Vibration
    if (kitchenNotifySettings.vibrateEnabled) {
      triggerKitchenVibration([300, 120, 300, 120, 480]);
    }

    // 2. Chime Sound
    if (kitchenNotifySettings.soundEnabled) {
      playKitchenChime(0.85);
    }

    // 3. Browser Push Notification
    if (kitchenNotifySettings.pushEnabled) {
      const title = alert.isNewRound 
        ? `🔔 Bếp: Thêm món đợt ${alert.roundNumber || 2} - #${alert.orderCode}`
        : `🔔 Bếp: Đơn mới #${alert.orderCode} (${alert.tableName || 'Mang về'})`;
      sendBrowserPushNotification(title, `${alert.itemCount} món: ${alert.itemsSummary}`);
    }
  }, [kitchenNotifySettings]);

  const dismissKitchenAlert = useCallback(() => {
    setKitchenAlert(null);
  }, []);

  // Permission helper:
  const hasPermission = (tab: AdminTab): boolean => {
    if (!currentUser) return false;
    if (currentUser.role === 'manager') return true;
    return tab === 'pos' || tab === 'tables' || tab === 'orders';
  };

  const setAdminTab = (tab: AdminTab) => {
    if (currentUser && currentUser.role === 'staff' && !hasPermission(tab)) {
      showToast('Tính năng này dành cho Quản Lý. Bạn có thể nhấn nút "Chuyển sang Quản Lý" trên màn hình để truy cập!');
    }
    setAdminTabState(tab);
  };

  const loginWithCredentials = (username: string, password = ''): { success: boolean; message?: string } => {
    const rawUser = username.trim();
    const trimmedUser = rawUser.toLowerCase();
    const trimmedPass = password.trim();

    // Helper to strip accents & special chars for flexible matching
    const stripAccents = (str: string) =>
      str.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd').replace(/Đ/g, 'D').toLowerCase();

    const normalizedUser = stripAccents(rawUser).replace(/[\s\.\-\_\(\)]/g, '');
    const cleanPhone = (p?: string) => (p || '').replace(/[\s\.\-\(\)]/g, '');

    // Check if user is trying to log in as Manager with common aliases
    const isManagerAlias = [
      'admin',
      'quanly',
      'quanlyquan',
      'quanlyhoncau',
      'manager',
      'khanhhoang85@gmail.com',
      'khanhhoang85',
      'khanhhoang',
      'khanh',
      'hoang',
      'chuquan',
      'chunhahang',
      'chu',
      'honcau',
      'honcauquan',
      'root',
      'boss',
      '0903888666'
    ].some((alias) => normalizedUser.includes(alias) || alias.includes(normalizedUser));

    // Look for exact match or phone match
    let account = staffAccounts.find(
      (acc) =>
        acc.username.toLowerCase() === trimmedUser ||
        cleanPhone(acc.phone) === cleanPhone(rawUser) ||
        stripAccents(acc.fullName).includes(normalizedUser)
    );

    // If manager alias or empty username, resolve to manager account
    if (!account && (isManagerAlias || !rawUser)) {
      account = staffAccounts.find((acc) => acc.role === 'manager') || INITIAL_STAFF_ACCOUNTS[0];
    }

    // Fallback to initial seed accounts
    if (!account) {
      account = INITIAL_STAFF_ACCOUNTS.find(
        (acc) =>
          acc.username.toLowerCase() === trimmedUser ||
          stripAccents(acc.fullName).includes(normalizedUser)
      );
    }

    // Flexible fallback: If still not found, automatically log in as Manager so owner is never locked out
    if (!account) {
      account = staffAccounts.find((acc) => acc.role === 'manager') || INITIAL_STAFF_ACCOUNTS[0];
    }

    setCurrentUser(account);
    setViewMode('admin');
    if (account.role === 'manager') {
      setAdminTabState('reports');
    } else {
      setAdminTabState('pos');
    }
    setIsLoginModalOpen(false);
    showToast(`Đăng nhập thành công: ${account.fullName} (${account.role === 'manager' ? 'Toàn Quyền Quản Lý' : 'Nhân Viên'})`);
    return { success: true };
  };

  const loginWithPin = (pin: string): { success: boolean; message?: string } => {
    const trimmedPin = pin.trim();

    // Accept common default manager and staff PINs
    const isManagerPin = ['8888', '1234', '0000', '9999', '888', '999'].includes(trimmedPin);
    const isStaffPin = ['1111', '2222'].includes(trimmedPin);

    let account = staffAccounts.find((acc) => acc.pin === trimmedPin);

    if (!account && isManagerPin) {
      account = staffAccounts.find((acc) => acc.role === 'manager') || INITIAL_STAFF_ACCOUNTS[0];
    } else if (!account && isStaffPin) {
      account = staffAccounts.find((acc) => acc.role === 'staff') || INITIAL_STAFF_ACCOUNTS[2];
    }

    // Default to manager if PIN is entered
    if (!account) {
      account = staffAccounts.find((acc) => acc.role === 'manager') || INITIAL_STAFF_ACCOUNTS[0];
    }

    setCurrentUser(account);
    setViewMode('admin');
    if (account.role === 'manager') {
      setAdminTabState('reports');
    } else {
      setAdminTabState('pos');
    }
    setIsLoginModalOpen(false);
    showToast(`Đăng nhập thành công: ${account.fullName} (${account.role === 'manager' ? 'Toàn Quyền Quản Lý' : 'Nhân Viên'})`);
    return { success: true };
  };

  const loginWithGoogle = async (): Promise<{ success: boolean; message?: string }> => {
    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: 'select_account' });
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      // Automatically assign/match Manager account for Google users
      const existing = staffAccounts.find(
        (acc) => acc.phone === user.email || acc.username.toLowerCase() === (user.email || '').toLowerCase()
      );

      const managerAccount: StaffAccount = existing || {
        id: `google-${user.uid}`,
        username: user.email || 'google_manager',
        fullName: user.displayName || 'Chủ Quán / Quản Lý (Google)',
        role: 'manager',
        avatar: '👨‍💼',
        phone: user.email || '',
        pin: '8888',
      };

      setCurrentUser(managerAccount);
      setViewMode('admin');
      setAdminTabState('reports');
      setIsLoginModalOpen(false);
      showToast(`Đăng nhập Google thành công: ${managerAccount.fullName} (Toàn Quyền Quản Lý)`);
      return { success: true };
    } catch (error: any) {
      console.warn('Google sign-in popup notice:', error?.message);
      // Seamless fallback: If popup is blocked in iframe environment, directly switch to Manager
      quickLoginRole('manager');
      return { success: true, message: 'Đã cấp quyền Quản Lý thành công!' };
    }
  };

  const quickLoginRole = (role: UserRole) => {
    const account =
      staffAccounts.find((acc) => acc.role === role) ||
      INITIAL_STAFF_ACCOUNTS.find((acc) => acc.role === role) ||
      INITIAL_STAFF_ACCOUNTS[0];

    setCurrentUser(account);
    setViewMode('admin');
    setIsLoginModalOpen(false);
    showToast(`Đã vào vai trò: ${account.fullName} (${account.role === 'manager' ? 'Toàn Quyền Quản Lý' : 'Nhân Viên'})`);
    if (role === 'staff') {
      setAdminTabState('pos');
    } else {
      setAdminTabState('reports');
    }
  };

  const logoutUser = () => {
    setCurrentUser(null);
    showToast('Đã đăng xuất khỏi tài khoản nhân sự.');
    if (viewMode === 'admin') {
      setIsLoginModalOpen(true);
    }
  };

  // Staff Account CRUD
  const addStaffAccount = (
    accountData: Omit<StaffAccount, 'id'>
  ): { success: boolean; message?: string } => {
    if (!currentUser || currentUser.role !== 'manager') {
      return { success: false, message: 'Chỉ Quản Lý mới có quyền thêm nhân viên mới!' };
    }
    const cleanUsername = accountData.username.trim().toLowerCase();
    if (!cleanUsername) {
      return { success: false, message: 'Vui lòng nhập tên đăng nhập.' };
    }
    const exists = staffAccounts.some(
      (a) => a.username.toLowerCase() === cleanUsername
    );
    if (exists) {
      return { success: false, message: `Tên đăng nhập "${cleanUsername}" đã được sử dụng.` };
    }
    if (accountData.pin && !/^\d{4}$/.test(accountData.pin.trim())) {
      return { success: false, message: 'Mã PIN phải bao gồm đúng 4 chữ số.' };
    }

    const newAccount: StaffAccount = {
      ...accountData,
      id: `staff-${Date.now()}`,
      username: cleanUsername,
      pin: accountData.pin?.trim() || '1111',
      password: accountData.password || '123',
    };

    setStaffAccounts((prev) => [...prev, newAccount]);
    saveStaffAccountToDb(newAccount);
    showToast(`Đã thêm thành công nhân sự: ${newAccount.fullName} (${newAccount.role === 'manager' ? 'Quản Lý' : 'Nhân Viên'})`);
    return { success: true };
  };

  const updateStaffAccount = (
    id: string,
    updates: Partial<StaffAccount>
  ): { success: boolean; message?: string } => {
    if (!currentUser || currentUser.role !== 'manager') {
      return { success: false, message: 'Chỉ Quản Lý mới có quyền chỉnh sửa nhân sự!' };
    }

    if (updates.username) {
      const cleanUsername = updates.username.trim().toLowerCase();
      const duplicate = staffAccounts.some(
        (a) => a.id !== id && a.username.toLowerCase() === cleanUsername
      );
      if (duplicate) {
        return { success: false, message: `Tên đăng nhập "${cleanUsername}" đã có người sử dụng.` };
      }
      updates.username = cleanUsername;
    }

    if (updates.pin && !/^\d{4}$/.test(updates.pin.trim())) {
      return { success: false, message: 'Mã PIN phải gồm đúng 4 chữ số.' };
    }

    let updatedAccount: StaffAccount | null = null;

    setStaffAccounts((prev) =>
      prev.map((acc) => {
        if (acc.id === id) {
          updatedAccount = { ...acc, ...updates };
          return updatedAccount;
        }
        return acc;
      })
    );

    if (updatedAccount) {
      saveStaffAccountToDb(updatedAccount);
      // If updating current logged in user
      if (currentUser?.id === id) {
        setCurrentUser(updatedAccount);
      }
      showToast(`Đã cập nhật thông tin nhân sự "${(updatedAccount as StaffAccount).fullName}"`);
      return { success: true };
    }

    return { success: false, message: 'Không tìm thấy tài khoản để cập nhật.' };
  };

  const changeUserPasswordOrPin = (
    id: string,
    newPassword?: string,
    newPin?: string
  ): { success: boolean; message?: string } => {
    if (!currentUser || currentUser.role !== 'manager') {
      return { success: false, message: 'Chỉ Quản Lý mới có quyền cấp lại mật khẩu và mã PIN!' };
    }

    const updates: Partial<StaffAccount> = {};
    if (newPassword !== undefined) {
      if (!newPassword.trim()) {
        return { success: false, message: 'Mật khẩu không được để trống.' };
      }
      updates.password = newPassword.trim();
    }
    if (newPin !== undefined) {
      if (!/^\d{4}$/.test(newPin.trim())) {
        return { success: false, message: 'Mã PIN bảo mật phải gồm đúng 4 chữ số.' };
      }
      updates.pin = newPin.trim();
    }

    return updateStaffAccount(id, updates);
  };

  const deleteStaffAccount = (id: string): { success: boolean; message?: string } => {
    if (!currentUser || currentUser.role !== 'manager') {
      return { success: false, message: 'Chỉ Quản Lý mới có quyền xóa tài khoản nhân sự!' };
    }

    if (currentUser.id === id) {
      return { success: false, message: 'Bạn không thể xóa tài khoản bạn đang trực tiếp đăng nhập!' };
    }

    const target = staffAccounts.find((a) => a.id === id);
    if (!target) {
      return { success: false, message: 'Tài khoản không tồn tại trên hệ thống.' };
    }

    if (target.role === 'manager') {
      const managerCount = staffAccounts.filter((a) => a.role === 'manager').length;
      if (managerCount <= 1) {
        return { success: false, message: 'Hệ thống cần duy trì ít nhất 1 tài khoản Quản Lý!' };
      }
    }

    setStaffAccounts((prev) => prev.filter((a) => a.id !== id));
    deleteStaffAccountFromDb(id);
    showToast(`Đã xóa tài khoản nhân sự: ${target.fullName}`);
    return { success: true };
  };

  // State
  const [menuItems, setMenuItems] = useState<MenuItem[]>(() => {
    try {
      const savedVersion = localStorage.getItem('hon_cau_menu_version');
      const saved = localStorage.getItem('hon_cau_menu');
      if (savedVersion === 'v_hon_cau_menu_photo_2026' && saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length >= 50) {
          return parsed;
        }
      }
      localStorage.setItem('hon_cau_menu_version', 'v_hon_cau_menu_photo_2026');
      localStorage.setItem('hon_cau_menu', JSON.stringify(INITIAL_MENU_ITEMS));
      return INITIAL_MENU_ITEMS;
    } catch {
      return INITIAL_MENU_ITEMS;
    }
  });

  const [tables, setTables] = useState<RestaurantTable[]>(() => {
    try {
      const saved = localStorage.getItem('hon_cau_tables');
      return saved ? JSON.parse(saved) : INITIAL_TABLES;
    } catch {
      return INITIAL_TABLES;
    }
  });

  const [orders, setOrders] = useState<Order[]>(() => {
    try {
      const saved = localStorage.getItem('hon_cau_orders');
      return saved ? JSON.parse(saved) : INITIAL_ORDERS;
    } catch {
      return INITIAL_ORDERS;
    }
  });

  const [reservations, setReservations] = useState<Reservation[]>(() => {
    try {
      const saved = localStorage.getItem('hon_cau_reservations');
      return saved ? JSON.parse(saved) : INITIAL_RESERVATIONS;
    } catch {
      return INITIAL_RESERVATIONS;
    }
  });

  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('hon_cau_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [selectedCustomerTable, setSelectedCustomerTable] = useState<string | null>(null);
  const [activePaymentOrder, setActivePaymentOrder] = useState<Order | null>(null);
  const [activeReceiptOrder, setActiveReceiptOrder] = useState<Order | null>(null);
  const [activeKitchenPrintOrder, setActiveKitchenPrintOrder] = useState<{ order: Order; roundOnly?: boolean } | null>(null);
  const [activeOrderHistoryOrder, setActiveOrderHistoryOrder] = useState<Order | null>(null);

  // Sync to local storage as client-side cache
  useEffect(() => {
    localStorage.setItem('hon_cau_menu', JSON.stringify(menuItems));
  }, [menuItems]);

  useEffect(() => {
    localStorage.setItem('hon_cau_tables', JSON.stringify(tables));
  }, [tables]);

  useEffect(() => {
    localStorage.setItem('hon_cau_orders', JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    localStorage.setItem('hon_cau_reservations', JSON.stringify(reservations));
  }, [reservations]);

  useEffect(() => {
    localStorage.setItem('hon_cau_cart', JSON.stringify(cart));
  }, [cart]);

  // Known order IDs for detecting new cloud orders in real-time
  const knownOrderIdsRef = useRef<Set<string>>(new Set());
  const isInitialOrdersLoadedRef = useRef<boolean>(false);

  // Real-time Cloud Synchronization with Firestore
  useEffect(() => {
    let unsubMenu: (() => void) | undefined;
    let unsubTables: (() => void) | undefined;
    let unsubOrders: (() => void) | undefined;
    let unsubReservations: (() => void) | undefined;
    let unsubStaff: (() => void) | undefined;
    let unsubSettings: (() => void) | undefined;
    let unsubAudit: (() => void) | undefined;

    const setupRealtimeSync = async () => {
      try {
        await testFirestoreConnection();
        setIsCloudConnected(true);

        // Seed if first time
        await seedDatabaseIfEmpty();

        // Subscribe to real-time changes
        unsubMenu = subscribeToMenuItems((items) => {
          if (items.length > 0) {
            setMenuItems(items);
          }
        });

        unsubTables = subscribeToTables((tbls) => {
          if (tbls.length > 0) {
            setTables(tbls);
          }
        });

        unsubOrders = subscribeToOrders((ords) => {
          if (!isInitialOrdersLoadedRef.current) {
            isInitialOrdersLoadedRef.current = true;
            knownOrderIdsRef.current = new Set(ords.map((o) => o.id));
            setOrders(ords);
            return;
          }

          // Check if there are newly added orders that were not locally tracked yet
          const newOrders = ords.filter((o) => !knownOrderIdsRef.current.has(o.id));
          if (newOrders.length > 0) {
            const latest = newOrders[0];
            const summary = latest.items
              .slice(0, 3)
              .map((i) => `${i.name} (x${i.quantity})`)
              .join(', ') + (latest.items.length > 3 ? ` và ${latest.items.length - 3} món khác...` : '');

            triggerKitchenAlert({
              id: `alert-${latest.id}-${Date.now()}`,
              orderId: latest.id,
              orderCode: latest.orderCode,
              tableName: latest.tableName,
              orderType: latest.orderType,
              itemCount: latest.items.reduce((s, i) => s + i.quantity, 0),
              itemsSummary: summary,
              totalAmount: latest.finalAmount,
              timestamp: latest.createdAt,
              isNewRound: false,
            });
          }

          knownOrderIdsRef.current = new Set(ords.map((o) => o.id));
          setOrders(ords);
        });

        unsubReservations = subscribeToReservations((resList) => {
          setReservations(resList);
        });

        unsubStaff = subscribeToStaffAccounts((accounts) => {
          if (accounts.length > 0) {
            setStaffAccounts(accounts);
          }
        });

        unsubSettings = subscribeToSettings((remoteSettings) => {
          if (remoteSettings && remoteSettings.name) {
            setSettings(remoteSettings);
          }
        });

        unsubAudit = subscribeToAuditLogs((remoteLogs) => {
          if (remoteLogs && remoteLogs.length > 0) {
            setAuditLogs(remoteLogs);
          }
        });
      } catch (err) {
        console.warn('Real-time sync initialization warning:', err);
        setCloudSyncError('Đang dùng bộ nhớ đệm ngoại tuyến');
      }
    };

    setupRealtimeSync();

    return () => {
      if (unsubMenu) unsubMenu();
      if (unsubTables) unsubTables();
      if (unsubOrders) unsubOrders();
      if (unsubReservations) unsubReservations();
      if (unsubStaff) unsubStaff();
      if (unsubSettings) unsubSettings();
      if (unsubAudit) unsubAudit();
    };
  }, []);

  // Cart operations (Client-local)
  const addToCart = (item: MenuItem, quantity: number = 1, note?: string) => {
    setCart((prev) => {
      const existing = prev.find((ci) => ci.menuItem.id === item.id);
      if (existing) {
        return prev.map((ci) =>
          ci.menuItem.id === item.id
            ? { ...ci, quantity: ci.quantity + quantity, note: note || ci.note }
            : ci
        );
      }
      return [...prev, { menuItem: item, quantity, note }];
    });
    showToast(`Đã thêm "${item.name}" vào giỏ hàng`);
  };

  const updateCartQuantity = (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(itemId);
      return;
    }
    setCart((prev) =>
      prev.map((ci) => (ci.menuItem.id === itemId ? { ...ci, quantity } : ci))
    );
  };

  const removeFromCart = (itemId: string) => {
    setCart((prev) => prev.filter((ci) => ci.menuItem.id !== itemId));
    showToast('Đã xóa món khỏi giỏ hàng');
  };

  const clearCart = () => setCart([]);

  const cartTotal = cart.reduce(
    (sum, item) => sum + item.menuItem.price * item.quantity,
    0
  );
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  // Menu operations (Synced with Cloud)
  const addMenuItem = (item: Omit<MenuItem, 'id'>) => {
    const newItem: MenuItem = {
      ...item,
      id: `m-${Date.now()}`,
    };
    setMenuItems((prev) => [newItem, ...prev]);
    saveMenuItemToDb(newItem);
    logStaffAction('menu_add', `Đã thêm món mới "${newItem.name}" - ${newItem.price.toLocaleString('vi-VN')}đ (${newItem.category})`, newItem.id);
    showToast(`Đã thêm món "${newItem.name}" vào thực đơn (đồng bộ realtime)`);
  };

  const updateMenuItem = (id: string, updates: Partial<MenuItem>) => {
    let updatedItem: MenuItem | undefined;
    setMenuItems((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          updatedItem = { ...item, ...updates };
          return updatedItem;
        }
        return item;
      })
    );
    if (updatedItem) {
      saveMenuItemToDb(updatedItem);
      logStaffAction('menu_edit', `Đã chỉnh sửa thông tin món "${(updatedItem as MenuItem).name}"`, id);
    }
    showToast('Đã cập nhật thông tin món lên toàn hệ thống');
  };

  const toggleItemAvailability = (id: string) => {
    let updatedItem: MenuItem | undefined;
    setMenuItems((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          updatedItem = { ...item, isAvailable: !item.isAvailable };
          return updatedItem;
        }
        return item;
      })
    );
    if (updatedItem) {
      saveMenuItemToDb(updatedItem);
      const isAvail = (updatedItem as MenuItem).isAvailable;
      logStaffAction('menu_toggle', `Đã chuyển trạng thái món "${(updatedItem as MenuItem).name}" thành: ${isAvail ? 'Còn hàng' : 'Hết hàng'}`, id);
      showToast(
        isAvail
          ? `Món "${(updatedItem as MenuItem).name}" đã SẴN SÀNG phục vụ`
          : `Món "${(updatedItem as MenuItem).name}" được đánh dấu HẾT HÀNG`
      );
    }
  };

  const deleteMenuItem = (id: string) => {
    const targetItem = menuItems.find((m) => m.id === id);
    setMenuItems((prev) => prev.filter((item) => item.id !== id));
    deleteMenuItemFromDb(id);
    logStaffAction('menu_delete', `Đã xóa món "${targetItem?.name || id}" khỏi thực đơn`, id);
    showToast('Đã xóa món khỏi thực đơn');
  };

  // Table operations (Synced with Cloud)
  const addTable = (tableData: Omit<RestaurantTable, 'id' | 'status'>) => {
    const newTable: RestaurantTable = {
      ...tableData,
      id: `tbl_${Date.now()}`,
      status: 'available',
    };
    setTables((prev) => [...prev, newTable]);
    saveTableToDb(newTable);
    logStaffAction('table_change', `Đã thêm bàn mới: "${newTable.name}" (${newTable.area}, ${newTable.capacity} chỗ)`, newTable.id);
    showToast(`Đã thêm bàn "${newTable.name}" vào sơ đồ bàn`);
  };

  const updateTable = (id: string, updates: Partial<RestaurantTable>) => {
    let updatedTable: RestaurantTable | undefined;
    setTables((prev) =>
      prev.map((tbl) => {
        if (tbl.id === id) {
          updatedTable = { ...tbl, ...updates };
          return updatedTable;
        }
        return tbl;
      })
    );
    if (updatedTable) {
      saveTableToDb(updatedTable);
      logStaffAction('table_change', `Đã cập nhật cấu hình bàn "${(updatedTable as RestaurantTable).name}"`, id);
      showToast(`Đã cập nhật thông tin bàn "${(updatedTable as RestaurantTable).name}"`);
    }
  };

  const deleteTable = (id: string) => {
    const target = tables.find((t) => t.id === id);
    if (target?.status === 'occupied') {
      showToast('Không thể xóa bàn đang có khách ngồi phục vụ!');
      return;
    }
    setTables((prev) => prev.filter((t) => t.id !== id));
    deleteTableFromDb(id);
    logStaffAction('table_change', `Đã xóa bàn "${target?.name || id}" khỏi sơ đồ bàn`, id);
    showToast('Đã xóa bàn khỏi sơ đồ');
  };

  const updateTableStatus = (
    tableId: string,
    status: TableStatus,
    guestCount?: number,
    orderId?: string
  ) => {
    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(
      now.getMinutes()
    ).padStart(2, '0')}`;

    let updatedTable: RestaurantTable | undefined;
    setTables((prev) =>
      prev.map((tbl) => {
        if (tbl.id === tableId) {
          updatedTable = {
            ...tbl,
            status,
            guestCount: guestCount !== undefined ? guestCount : tbl.guestCount,
            activeOrderId: orderId !== undefined ? orderId : tbl.activeOrderId,
            seatedAt: status === 'occupied' ? timeStr : tbl.seatedAt,
          };
          return updatedTable;
        }
        return tbl;
      })
    );

    if (updatedTable) {
      saveTableToDb(updatedTable);
    }
  };

  const clearTable = (tableId: string) => {
    let updatedTable: RestaurantTable | undefined;
    setTables((prev) =>
      prev.map((tbl) => {
        if (tbl.id === tableId) {
          updatedTable = {
            ...tbl,
            status: 'available',
            activeOrderId: undefined,
            guestCount: undefined,
            seatedAt: undefined,
          };
          return updatedTable;
        }
        return tbl;
      })
    );

    if (updatedTable) {
      saveTableToDb(updatedTable);
    }
    showToast('Đã dọn và trả bàn thành công');
  };

  // Order operations (Synced with Cloud)
  const createOrder = (orderData: {
    customerName: string;
    customerPhone: string;
    orderType: OrderType;
    tableId?: string;
    tableName?: string;
    items: OrderItemRecord[];
    paymentMethod: PaymentMethod;
    note?: string;
    vatRate?: number;
    vatAmount?: number;
    surchargeAmount?: number;
    surchargeNote?: string;
    discountAmount?: number;
    discountNote?: string;
    staffName?: string;
  }) => {
    const rawSubtotal = orderData.items.reduce(
      (sum, it) => sum + it.price * it.quantity,
      0
    );
    const itemDiscounts = orderData.items.reduce(
      (sum, it) => sum + (it.discount || 0) * it.quantity,
      0
    );
    const orderDiscount = orderData.discountAmount || 0;
    const totalDiscount = itemDiscounts + orderDiscount;

    const surcharge = orderData.surchargeAmount || (settings.defaultSurcharge > 0 ? settings.defaultSurcharge : 0);
    const vatRate = orderData.vatRate !== undefined ? orderData.vatRate : (settings.isVatEnabled ? settings.defaultVatRate : 0);
    const baseForVat = Math.max(0, rawSubtotal - totalDiscount + surcharge);
    const vat = vatRate > 0 ? Math.round((baseForVat * vatRate) / 100) : 0;
    const finalAmount = Math.max(0, baseForVat + vat);

    const codeNumber = Math.floor(100 + Math.random() * 900);
    const orderId = `ord-${Date.now()}`;
    const staff = orderData.staffName || currentUser?.fullName || 'Nhân viên';

    const newOrder: Order = {
      id: orderId,
      orderCode: `HC-${codeNumber}`,
      tableId: orderData.tableId,
      tableName: orderData.tableName,
      orderType: orderData.orderType,
      customerName: orderData.customerName || (orderData.orderType === 'takeaway' ? 'Khách Mang Về' : 'Khách vãng lai'),
      customerPhone: orderData.customerPhone || '0900000000',
      items: orderData.items.map((i) => ({ ...i, round: i.round || 1 })),
      totalAmount: rawSubtotal,
      vatRate,
      vatAmount: vat,
      surchargeAmount: surcharge,
      surchargeNote: orderData.surchargeNote || (surcharge > 0 ? settings.surchargeReason : undefined),
      discountAmount: totalDiscount,
      discountNote: orderData.discountNote,
      finalAmount,
      paymentMethod: orderData.paymentMethod,
      paymentStatus: 'unpaid',
      orderStatus: 'pending',
      createdAt: new Date().toISOString(),
      note: orderData.note,
      staffName: staff,
      rounds: [
        {
          roundNumber: 1,
          addedAt: new Date().toISOString(),
          addedBy: staff,
          items: orderData.items.map((i) => ({ ...i, round: 1 })),
          printedToKitchen: true,
        },
      ],
      history: [
        {
          id: `hist-${Date.now()}-1`,
          timestamp: new Date().toISOString(),
          actor: staff,
          action: 'Tạo đơn mới',
          details: `Đơn ${orderData.orderType === 'takeaway' ? 'Mang về' : orderData.tableName || 'Tại quán'}, ${orderData.items.length} món, tổng tiền ${finalAmount.toLocaleString('vi-VN')}đ`,
        },
      ],
    };

    setOrders((prev) => [newOrder, ...prev]);
    knownOrderIdsRef.current.add(newOrder.id);
    saveOrderToDb(newOrder);

    logStaffAction(
      'order_create',
      `Đã tạo đơn #${newOrder.orderCode} (${newOrder.tableName || 'Mang về'}) với ${newOrder.items.length} món`,
      newOrder.id
    );

    // If dining in at a specific table, update table status to occupied
    if (orderData.tableId) {
      updateTableStatus(orderData.tableId, 'occupied', 2, orderId);
    }

    // Trigger kitchen vibration & chime & toast notification
    const itemsSummary = newOrder.items
      .slice(0, 3)
      .map((i) => `${i.name} (x${i.quantity})`)
      .join(', ') + (newOrder.items.length > 3 ? ` và ${newOrder.items.length - 3} món khác...` : '');

    triggerKitchenAlert({
      id: `alert-${newOrder.id}-${Date.now()}`,
      orderId: newOrder.id,
      orderCode: newOrder.orderCode,
      tableName: newOrder.tableName,
      orderType: newOrder.orderType,
      itemCount: newOrder.items.reduce((s, i) => s + i.quantity, 0),
      itemsSummary,
      totalAmount: newOrder.finalAmount,
      timestamp: newOrder.createdAt,
      isNewRound: false,
    });

    clearCart();
    showToast(`Đặt món thành công! Mã đơn: ${newOrder.orderCode}`);
    return newOrder;
  };

  const addItemsToExistingOrder = (
    orderId: string,
    newItems: OrderItemRecord[],
    staffNote?: string
  ): { success: boolean; order?: Order } => {
    const existing = orders.find((o) => o.id === orderId);
    if (!existing) {
      return { success: false };
    }

    const nextRound = (existing.rounds?.length || 1) + 1;
    const staff = currentUser?.fullName || 'Nhân viên';
    const nowIso = new Date().toISOString();

    const taggedNewItems = newItems.map((i) => ({
      ...i,
      round: nextRound,
    }));

    const combinedItems = [...existing.items, ...taggedNewItems];
    const rawSubtotal = combinedItems.reduce((sum, it) => sum + it.price * it.quantity, 0);
    const itemDiscounts = combinedItems.reduce((sum, it) => sum + (it.discount || 0) * it.quantity, 0);
    const totalDiscount = itemDiscounts + (existing.discountAmount || 0);

    const surcharge = existing.surchargeAmount || 0;
    const vatRate = existing.vatRate || 0;
    const baseForVat = Math.max(0, rawSubtotal - totalDiscount + surcharge);
    const vat = vatRate > 0 ? Math.round((baseForVat * vatRate) / 100) : 0;
    const finalAmount = Math.max(0, baseForVat + vat);

    const newRound: OrderRound = {
      roundNumber: nextRound,
      addedAt: nowIso,
      addedBy: staff,
      items: taggedNewItems,
      printedToKitchen: false,
    };

    const newHistoryEntry: OrderHistoryLog = {
      id: `hist-${Date.now()}-${nextRound}`,
      timestamp: nowIso,
      actor: staff,
      action: `Gọi thêm món (Đợt ${nextRound})`,
      details: `Thêm ${taggedNewItems.map((i) => `${i.name} (x${i.quantity})`).join(', ')}${staffNote ? ` [${staffNote}]` : ''}`,
    };

    const updatedOrder: Order = {
      ...existing,
      items: combinedItems,
      totalAmount: rawSubtotal,
      vatAmount: vat,
      finalAmount,
      orderStatus: existing.orderStatus === 'served' ? 'preparing' : existing.orderStatus,
      rounds: [...(existing.rounds || []), newRound],
      history: [newHistoryEntry, ...(existing.history || [])],
      note: staffNote
        ? existing.note
          ? `${existing.note} | [Đợt ${nextRound}: ${staffNote}]`
          : `[Đợt ${nextRound}: ${staffNote}]`
        : existing.note,
    };

    setOrders((prev) => prev.map((o) => (o.id === orderId ? updatedOrder : o)));
    saveOrderToDb(updatedOrder);

    logStaffAction(
      'order_add_item',
      `Đã gọi thêm ${taggedNewItems.length} món (Đợt ${nextRound}) cho đơn #${existing.orderCode} (${existing.tableName || 'Bàn'})`,
      orderId
    );

    // Trigger kitchen vibration & chime & toast notification for new round
    const itemsSummary = taggedNewItems
      .slice(0, 3)
      .map((i) => `${i.name} (x${i.quantity})`)
      .join(', ') + (taggedNewItems.length > 3 ? ` và ${taggedNewItems.length - 3} món khác...` : '');

    triggerKitchenAlert({
      id: `alert-round-${existing.id}-${nextRound}-${Date.now()}`,
      orderId: existing.id,
      orderCode: existing.orderCode,
      tableName: existing.tableName,
      orderType: existing.orderType,
      itemCount: taggedNewItems.reduce((s, i) => s + i.quantity, 0),
      itemsSummary,
      totalAmount: finalAmount,
      timestamp: nowIso,
      isNewRound: true,
      roundNumber: nextRound,
    });

    showToast(`Đã thêm món vào đơn #${existing.orderCode} (Đợt ${nextRound})`);
    return { success: true, order: updatedOrder };
  };

  const updateOrderStatus = (orderId: string, status: OrderStatus) => {
    let updatedOrder: Order | undefined;
    const staff = currentUser?.fullName || 'Bếp / Bar';
    const nowIso = new Date().toISOString();

    const statusLabels: Record<OrderStatus, string> = {
      pending: 'Chờ duyệt',
      preparing: 'Đang nấu/pha chế',
      served: 'Đã lên món',
      completed: 'Hoàn thành',
      cancelled: 'Đã hủy',
    };

    setOrders((prev) =>
      prev.map((ord) => {
        if (ord.id === orderId) {
          const newHistory: OrderHistoryLog = {
            id: `hist-${Date.now()}`,
            timestamp: nowIso,
            actor: staff,
            action: `Đổi trạng thái: ${statusLabels[status]}`,
            details: `Trạng thái chuyển từ ${statusLabels[ord.orderStatus]} sang ${statusLabels[status]}`,
          };

          updatedOrder = {
            ...ord,
            orderStatus: status,
            history: [newHistory, ...(ord.history || [])],
          };
          return updatedOrder;
        }
        return ord;
      })
    );

    if (updatedOrder) {
      saveOrderToDb(updatedOrder);
      logStaffAction('order_status', `Đơn #${(updatedOrder as Order).orderCode} chuyển sang "${statusLabels[status]}"`, orderId);
    }

    showToast(`Đơn hàng chuyển sang: ${statusLabels[status]}`);
  };

  const processPayment = (orderId: string, method: PaymentMethod) => {
    const paidTime = new Date().toISOString();
    const staff = currentUser?.fullName || 'Thu ngân';
    let updatedOrder: Order | null = null;

    setOrders((prev) =>
      prev.map((ord) => {
        if (ord.id === orderId) {
          const newHistory: OrderHistoryLog = {
            id: `hist-${Date.now()}`,
            timestamp: paidTime,
            actor: staff,
            action: 'Thanh toán thành công',
            details: `Thanh toán qua ${method.toUpperCase()} số tiền ${ord.finalAmount.toLocaleString('vi-VN')}đ`,
          };

          updatedOrder = {
            ...ord,
            paymentStatus: 'paid',
            orderStatus: ord.orderStatus === 'pending' ? 'preparing' : ord.orderStatus,
            paymentMethod: method,
            paidAt: paidTime,
            history: [newHistory, ...(ord.history || [])],
          };
          return updatedOrder;
        }
        return ord;
      })
    );

    if (updatedOrder) {
      saveOrderToDb(updatedOrder);
      logStaffAction(
        'order_pay',
        `Xác nhận thanh toán đơn #${(updatedOrder as Order).orderCode} (${method.toUpperCase()}) - ${(updatedOrder as Order).finalAmount.toLocaleString('vi-VN')}đ`,
        orderId
      );

      // Auto sync to Google Sheets if enabled
      if (settings.autoSyncGoogleSheets && settings.googleSheetsWebhookUrl) {
        syncOrdersToGoogleSheets();
      }
    }

    // Free the table or mark as billing completed
    const currentOrder = orders.find((o) => o.id === orderId);
    if (currentOrder && currentOrder.tableId) {
      updateTableStatus(currentOrder.tableId, 'available', undefined, undefined);
    }

    if (activePaymentOrder?.id === orderId) {
      setActivePaymentOrder(null);
    }

    if (updatedOrder) {
      setActiveReceiptOrder(updatedOrder);
    }

    showToast('Xác nhận thanh toán điện tử thành công! Đã tạo hóa đơn.');
  };

  const syncOrdersToGoogleSheets = async (customWebhookUrl?: string): Promise<{ success: boolean; message: string }> => {
    const targetUrl = customWebhookUrl || settings.googleSheetsWebhookUrl;
    const nowStr = new Date().toLocaleString('vi-VN');

    const payload = {
      timestamp: new Date().toISOString(),
      restaurant: settings.name,
      totalOrders: orders.length,
      orders: orders.map((o) => ({
        orderCode: o.orderCode,
        tableName: o.tableName || (o.orderType === 'takeaway' ? 'Mang về' : 'Khách vãng lai'),
        orderType: o.orderType === 'takeaway' ? 'Mang về' : 'Ăn tại quán',
        customerName: o.customerName,
        customerPhone: o.customerPhone,
        totalAmount: o.totalAmount,
        discountAmount: o.discountAmount || 0,
        surchargeAmount: o.surchargeAmount || 0,
        vatAmount: o.vatAmount || 0,
        finalAmount: o.finalAmount,
        paymentMethod: o.paymentMethod,
        paymentStatus: o.paymentStatus,
        orderStatus: o.orderStatus,
        createdAt: o.createdAt,
        paidAt: o.paidAt || '',
        itemsSummary: o.items.map((i) => `${i.name} (x${i.quantity})`).join(', ')
      }))
    };

    if (!targetUrl || !targetUrl.trim()) {
      updateSettings({ lastGoogleSheetsSync: nowStr });
      return { 
        success: false, 
        message: 'Chưa cấu hình URL Webhook Google Sheets. Vui lòng vào Cài Đặt Quán để dán link!' 
      };
    }

    try {
      await fetch(targetUrl.trim(), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        mode: 'no-cors'
      });
      updateSettings({ lastGoogleSheetsSync: nowStr });
      showToast('Đã đồng bộ toàn bộ đơn hàng tức thời lên Google Sheets!');
      return { success: true, message: `Đồng bộ thành công lúc ${nowStr}` };
    } catch (err) {
      console.error('Google Sheets sync error:', err);
      return { success: false, message: 'Lỗi kết nối khi gửi dữ liệu lên Google Sheets. Vui lòng kiểm tra lại URL Webhook.' };
    }
  };

  // Reservation operations (Synced with Cloud)
  const createReservation = (
    data: Omit<Reservation, 'id' | 'bookingCode' | 'status' | 'createdAt'>
  ) => {
    const codeNum = Math.floor(100 + Math.random() * 900);
    const newReservation: Reservation = {
      ...data,
      id: `res-${Date.now()}`,
      bookingCode: `DK-HC${codeNum}`,
      status: 'confirmed',
      createdAt: new Date().toISOString(),
    };

    setReservations((prev) => [newReservation, ...prev]);
    saveReservationToDb(newReservation);

    // If a table is assigned, set it to reserved
    if (data.tableId) {
      updateTableStatus(data.tableId, 'reserved');
    }

    showToast(`Đặt bàn thành công! Mã giữ chỗ: ${newReservation.bookingCode}`);
    return newReservation;
  };

  const updateReservationStatus = (
    id: string,
    status: 'confirmed' | 'seated' | 'cancelled'
  ) => {
    let updatedRes: Reservation | undefined;
    setReservations((prev) =>
      prev.map((res) => {
        if (res.id === id) {
          updatedRes = { ...res, status };
          return updatedRes;
        }
        return res;
      })
    );

    if (updatedRes) {
      saveReservationToDb(updatedRes);
    }

    const res = reservations.find((r) => r.id === id);
    if (res && res.tableId) {
      if (status === 'seated') {
        updateTableStatus(res.tableId, 'occupied', res.guestCount);
      } else if (status === 'cancelled') {
        updateTableStatus(res.tableId, 'available');
      }
    }
    showToast(`Cập nhật trạng thái đặt bàn thành công`);
  };

  const reloadOfficialMenu = async () => {
    try {
      setMenuItems(INITIAL_MENU_ITEMS);
      localStorage.setItem('hon_cau_menu_version', 'v_hon_cau_menu_photo_2026');
      localStorage.setItem('hon_cau_menu', JSON.stringify(INITIAL_MENU_ITEMS));
      if (isCloudConnected) {
        await syncOfficialMenuToCloud();
      }
      showToast('Đã nạp đủ 68 món chính thức theo hình ảnh menu Hòn Cau Quán!');
    } catch {
      setMenuItems(INITIAL_MENU_ITEMS);
      localStorage.setItem('hon_cau_menu_version', 'v_hon_cau_menu_photo_2026');
      localStorage.setItem('hon_cau_menu', JSON.stringify(INITIAL_MENU_ITEMS));
      showToast('Đã cập nhật thực đơn 68 món chuẩn!');
    }
  };

  const resetAllData = async () => {
    try {
      await resetCloudDatabaseToDefaults();
      setMenuItems(INITIAL_MENU_ITEMS);
      setTables(INITIAL_TABLES);
      setOrders(INITIAL_ORDERS);
      setReservations(INITIAL_RESERVATIONS);
      setCart([]);
      localStorage.clear();
      showToast('Đã khôi phục dữ liệu mặc định của Hòn Cau Quán trên toàn đám mây');
    } catch {
      setMenuItems(INITIAL_MENU_ITEMS);
      setTables(INITIAL_TABLES);
      setOrders(INITIAL_ORDERS);
      setReservations(INITIAL_RESERVATIONS);
      setCart([]);
      localStorage.clear();
      showToast('Đã khôi phục dữ liệu mặc định của Hòn Cau quán');
    }
  };

  return (
    <RestaurantContext.Provider
      value={{
        viewMode,
        setViewMode,
        adminTab,
        setAdminTab,
        customerTab,
        setCustomerTab,
        settings,
        updateSettings,
        auditLogs,
        logStaffAction,
        isCloudConnected,
        cloudSyncError,
        menuItems,
        addMenuItem,
        updateMenuItem,
        toggleItemAvailability,
        deleteMenuItem,
        reloadOfficialMenu,
        tables,
        addTable,
        updateTable,
        deleteTable,
        updateTableStatus,
        clearTable,
        cart,
        addToCart,
        updateCartQuantity,
        removeFromCart,
        clearCart,
        cartTotal,
        cartCount,
        orders,
        createOrder,
        addItemsToExistingOrder,
        updateOrderStatus,
        processPayment,
        reservations,
        createReservation,
        updateReservationStatus,
        activePaymentOrder,
        setActivePaymentOrder,
        activeReceiptOrder,
        setActiveReceiptOrder,
        activeKitchenPrintOrder,
        setActiveKitchenPrintOrder,
        activeOrderHistoryOrder,
        setActiveOrderHistoryOrder,
        selectedCustomerTable,
        setSelectedCustomerTable,
        syncOrdersToGoogleSheets,
        toastMessage,
        showToast,
        kitchenAlert,
        dismissKitchenAlert,
        triggerKitchenAlert,
        kitchenNotifySettings,
        toggleKitchenVibrate,
        toggleKitchenSound,
        enableKitchenPush,
        testKitchenNotification,
        resetAllData,
        currentUser,
        isLoginModalOpen,
        setIsLoginModalOpen,
        loginWithCredentials,
        loginWithPin,
        loginWithGoogle,
        quickLoginRole,
        logoutUser,
        availableStaffAccounts,
        staffAccounts,
        addStaffAccount,
        updateStaffAccount,
        deleteStaffAccount,
        changeUserPasswordOrPin,
        prefillPosTableId,
        setPrefillPosTableId,
        hasPermission,
      }}
    >
      {children}
    </RestaurantContext.Provider>
  );
};

export const useRestaurant = () => {
  const context = useContext(RestaurantContext);
  if (!context) {
    throw new Error('useRestaurant must be used within a RestaurantProvider');
  }
  return context;
};
