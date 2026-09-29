/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { RestaurantProvider, useRestaurant } from './context/RestaurantContext';
import { Header } from './components/Header';
import { CustomerView } from './components/customer/CustomerView';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { PaymentModal } from './components/PaymentModal';
import { ReceiptModal } from './components/ReceiptModal';
import { LoginModal } from './components/LoginModal';
import { KitchenTicketModal } from './components/KitchenTicketModal';
import { OrderHistoryModal } from './components/OrderHistoryModal';
import { KitchenNotificationToast } from './components/KitchenNotificationToast';
import { CheckCircle2, Phone, MapPin, Clock, Heart } from 'lucide-react';

const AppContent: React.FC = () => {
  const { viewMode, toastMessage, quickLoginRole, setViewMode, setAdminTab } = useRestaurant();

  return (
    <div className="min-h-screen flex flex-col bg-stone-50 text-stone-900">
      {/* Universal Header */}
      <Header />

      {/* Main View Port */}
      <main className="flex-1">
        {viewMode === 'customer' ? <CustomerView /> : <AdminDashboard />}
      </main>

      {/* Global Modals */}
      <PaymentModal />
      <ReceiptModal />
      <KitchenTicketModal />
      <OrderHistoryModal />
      <LoginModal />

      {/* High-priority Kitchen Order Alert & Vibration Toast */}
      <KitchenNotificationToast />

      {/* Global Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-5 duration-200">
          <div className="bg-stone-900 text-white px-4 py-2.5 rounded-xl shadow-xl flex items-center gap-2 text-xs font-medium border border-stone-800">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{toastMessage}</span>
          </div>
        </div>
      )}

      {/* Quiet Footer */}
      <footer className="bg-white border-t border-stone-200 text-stone-500 py-8 px-4 sm:px-6 lg:px-8 text-xs">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4 text-center sm:text-left">
            <span className="font-bold text-stone-900 text-sm">
              Hòn Cau Quán (Green Land)
            </span>
            <span className="hidden sm:inline text-stone-300">·</span>
            <span>Khu 2, đường Hùng Vương, Đặc khu Côn Đảo</span>
            <span className="hidden sm:inline text-stone-300">·</span>
            <span>Hotline đặt món: 0915.550.539 (Ms Quỳnh)</span>
          </div>

          <div className="text-center sm:text-right text-stone-500 flex flex-wrap items-center justify-center sm:justify-end gap-3">
            <span>© 2026 Hòn Cau Quán.</span>
            <button
              type="button"
              onClick={() => {
                quickLoginRole('manager');
                setViewMode('admin');
                setAdminTab('reports');
              }}
              className="text-amber-700 hover:text-amber-900 font-bold underline cursor-pointer flex items-center gap-1"
            >
              <span>👑 Vào trình quản lý (Admin)</span>
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default function App() {
  return (
    <RestaurantProvider>
      <AppContent />
    </RestaurantProvider>
  );
}
