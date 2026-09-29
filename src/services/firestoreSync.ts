import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  onSnapshot,
  getDocs,
  writeBatch,
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType, testFirestoreConnection } from '../firebase';
import { MenuItem, RestaurantTable, Order, Reservation, StaffAccount, RestaurantSettings, StaffAuditLog } from '../types/restaurant';
import { 
  INITIAL_MENU_ITEMS, 
  INITIAL_TABLES, 
  INITIAL_ORDERS, 
  INITIAL_RESERVATIONS,
  INITIAL_STAFF_ACCOUNTS,
  INITIAL_SETTINGS,
  INITIAL_AUDIT_LOGS
} from '../data/initialData';

// Collections paths
const MENU_COLLECTION = 'menuItems';
const TABLES_COLLECTION = 'tables';
const ORDERS_COLLECTION = 'orders';
const RESERVATIONS_COLLECTION = 'reservations';
const STAFF_COLLECTION = 'staffAccounts';
const SETTINGS_COLLECTION = 'restaurantSettings';
const AUDIT_COLLECTION = 'auditLogs';

/**
 * Strips undefined values recursively so Firestore setDoc does not throw
 * "Function setDoc() called with invalid data. Unsupported field value: undefined"
 */
export function sanitizeForFirestore<T>(obj: T): T {
  if (obj === null || obj === undefined) return obj;
  if (Array.isArray(obj)) {
    return obj.map((item) => sanitizeForFirestore(item)) as unknown as T;
  }
  if (typeof obj === 'object') {
    const res: Record<string, any> = {};
    for (const [key, value] of Object.entries(obj)) {
      if (value !== undefined) {
        res[key] = sanitizeForFirestore(value);
      }
    }
    return res as unknown as T;
  }
  return obj;
}

/**
 * Check if the database has been initialized; if not, seed with rich initial data.
 */
export async function seedDatabaseIfEmpty() {
  try {
    await testFirestoreConnection();
    const menuSnapshot = await getDocs(collection(db, MENU_COLLECTION));
    const hasOfficialDishes = !menuSnapshot.empty && menuSnapshot.docs.some((d) => d.id === 'dt1' || d.id === 'kv1');

    if (menuSnapshot.empty) {
      console.log('Seeding initial restaurant data to Cloud Firestore...');
      const batch = writeBatch(db);

      // Seed menu items
      INITIAL_MENU_ITEMS.forEach((item) => {
        const ref = doc(db, MENU_COLLECTION, item.id);
        batch.set(ref, sanitizeForFirestore(item));
      });

      // Seed tables
      INITIAL_TABLES.forEach((table) => {
        const ref = doc(db, TABLES_COLLECTION, table.id);
        batch.set(ref, sanitizeForFirestore(table));
      });

      // Seed orders
      INITIAL_ORDERS.forEach((order) => {
        const ref = doc(db, ORDERS_COLLECTION, order.id);
        batch.set(ref, sanitizeForFirestore(order));
      });

      // Seed reservations
      INITIAL_RESERVATIONS.forEach((res) => {
        const ref = doc(db, RESERVATIONS_COLLECTION, res.id);
        batch.set(ref, sanitizeForFirestore(res));
      });

      // Seed staff accounts
      INITIAL_STAFF_ACCOUNTS.forEach((staff) => {
        const ref = doc(db, STAFF_COLLECTION, staff.id);
        batch.set(ref, sanitizeForFirestore(staff));
      });

      // Seed settings
      const settingsRef = doc(db, SETTINGS_COLLECTION, 'main');
      batch.set(settingsRef, sanitizeForFirestore(INITIAL_SETTINGS));

      // Seed initial audit logs
      INITIAL_AUDIT_LOGS.forEach((log) => {
        const ref = doc(db, AUDIT_COLLECTION, log.id);
        batch.set(ref, sanitizeForFirestore(log));
      });

      await batch.commit();
      console.log('Successfully seeded Cloud Firestore data for Hon Cau Quan!');
    } else if (!hasOfficialDishes) {
      // Migrate cloud menu to official 68 items
      console.log('Upgrading Cloud Firestore menu to official 68 items from menu photo...');
      await syncOfficialMenuToCloud();
    } else {
      // Also ensure staffAccounts collection is seeded if it doesn't exist yet
      const staffSnapshot = await getDocs(collection(db, STAFF_COLLECTION));
      if (staffSnapshot.empty) {
        const batch = writeBatch(db);
        INITIAL_STAFF_ACCOUNTS.forEach((staff) => {
          const ref = doc(db, STAFF_COLLECTION, staff.id);
          batch.set(ref, sanitizeForFirestore(staff));
        });
        await batch.commit();
        console.log('Successfully seeded Staff Accounts to Firestore!');
      }

      // Check settings collection
      const settingsSnapshot = await getDocs(collection(db, SETTINGS_COLLECTION));
      if (settingsSnapshot.empty) {
        await setDoc(doc(db, SETTINGS_COLLECTION, 'main'), sanitizeForFirestore(INITIAL_SETTINGS));
      }
    }
  } catch (error) {
    console.warn('Firestore initial check/seed error (may be offline):', error);
  }
}

/**
 * Update cloud menu with the official 68 dishes from the menu photo.
 * Deletes legacy dummy items (hs1, hs2, c1, etc.) and uploads INITIAL_MENU_ITEMS.
 */
export async function syncOfficialMenuToCloud(): Promise<void> {
  try {
    const menuSnapshot = await getDocs(collection(db, MENU_COLLECTION));
    const batch = writeBatch(db);

    // Delete any old items that are not in the new INITIAL_MENU_ITEMS
    const newIds = new Set(INITIAL_MENU_ITEMS.map((i) => i.id));
    menuSnapshot.docs.forEach((d) => {
      if (!newIds.has(d.id)) {
        batch.delete(d.ref);
      }
    });

    // Write all 68 official menu items
    INITIAL_MENU_ITEMS.forEach((item) => {
      const ref = doc(db, MENU_COLLECTION, item.id);
      batch.set(ref, sanitizeForFirestore(item));
    });

    await batch.commit();
    console.log('Successfully synced 68 official menu items to Cloud Firestore!');
  } catch (error) {
    console.warn('Could not sync official menu to Cloud Firestore:', error);
  }
}

/**
 * Reset cloud database to factory defaults
 */
export async function resetCloudDatabaseToDefaults(): Promise<void> {
  try {
    const batch = writeBatch(db);

    // Replace menu items
    INITIAL_MENU_ITEMS.forEach((item) => {
      const ref = doc(db, MENU_COLLECTION, item.id);
      batch.set(ref, sanitizeForFirestore(item));
    });

    // Replace tables
    INITIAL_TABLES.forEach((table) => {
      const ref = doc(db, TABLES_COLLECTION, table.id);
      batch.set(ref, sanitizeForFirestore(table));
    });

    // Replace orders
    INITIAL_ORDERS.forEach((order) => {
      const ref = doc(db, ORDERS_COLLECTION, order.id);
      batch.set(ref, sanitizeForFirestore(order));
    });

    // Replace reservations
    INITIAL_RESERVATIONS.forEach((res) => {
      const ref = doc(db, RESERVATIONS_COLLECTION, res.id);
      batch.set(ref, sanitizeForFirestore(res));
    });

    // Replace staff accounts
    INITIAL_STAFF_ACCOUNTS.forEach((staff) => {
      const ref = doc(db, STAFF_COLLECTION, staff.id);
      batch.set(ref, sanitizeForFirestore(staff));
    });

    await batch.commit();
    console.log('Cloud database reset to initial defaults.');
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, 'all');
    throw error;
  }
}

/**
 * Real-time listener for Menu Items
 */
export function subscribeToMenuItems(onUpdate: (items: MenuItem[]) => void) {
  const colRef = collection(db, MENU_COLLECTION);
  return onSnapshot(
    colRef,
    (snapshot) => {
      if (!snapshot.empty) {
        const items = snapshot.docs.map((d) => d.data() as MenuItem);
        onUpdate(items);
      }
    },
    (error) => {
      handleFirestoreError(error, OperationType.GET, MENU_COLLECTION);
    }
  );
}

/**
 * Real-time listener for Tables
 */
export function subscribeToTables(onUpdate: (tables: RestaurantTable[]) => void) {
  const colRef = collection(db, TABLES_COLLECTION);
  return onSnapshot(
    colRef,
    (snapshot) => {
      if (!snapshot.empty) {
        const tables = snapshot.docs.map((d) => d.data() as RestaurantTable);
        // Keep standard sorting by name/id
        tables.sort((a, b) => a.id.localeCompare(b.id));
        onUpdate(tables);
      }
    },
    (error) => {
      handleFirestoreError(error, OperationType.GET, TABLES_COLLECTION);
    }
  );
}

/**
 * Real-time listener for Orders
 */
export function subscribeToOrders(onUpdate: (orders: Order[]) => void) {
  const colRef = collection(db, ORDERS_COLLECTION);
  return onSnapshot(
    colRef,
    (snapshot) => {
      if (!snapshot.empty) {
        const orders = snapshot.docs.map((d) => d.data() as Order);
        // Sort newest first
        orders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        onUpdate(orders);
      }
    },
    (error) => {
      handleFirestoreError(error, OperationType.GET, ORDERS_COLLECTION);
    }
  );
}

/**
 * Real-time listener for Reservations
 */
export function subscribeToReservations(onUpdate: (reservations: Reservation[]) => void) {
  const colRef = collection(db, RESERVATIONS_COLLECTION);
  return onSnapshot(
    colRef,
    (snapshot) => {
      if (!snapshot.empty) {
        const reservations = snapshot.docs.map((d) => d.data() as Reservation);
        reservations.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        onUpdate(reservations);
      }
    },
    (error) => {
      handleFirestoreError(error, OperationType.GET, RESERVATIONS_COLLECTION);
    }
  );
}

/**
 * Save or update a MenuItem to Firestore
 */
export async function saveMenuItemToDb(item: MenuItem): Promise<void> {
  try {
    const cleanItem = sanitizeForFirestore(item);
    const ref = doc(db, MENU_COLLECTION, cleanItem.id);
    await setDoc(ref, cleanItem, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `${MENU_COLLECTION}/${item.id}`);
  }
}

/**
 * Delete a MenuItem from Firestore
 */
export async function deleteMenuItemFromDb(itemId: string): Promise<void> {
  try {
    const ref = doc(db, MENU_COLLECTION, itemId);
    await deleteDoc(ref);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `${MENU_COLLECTION}/${itemId}`);
  }
}

/**
 * Save or update a Table in Firestore
 */
export async function saveTableToDb(table: RestaurantTable): Promise<void> {
  try {
    const cleanTable = sanitizeForFirestore(table);
    const ref = doc(db, TABLES_COLLECTION, cleanTable.id);
    await setDoc(ref, cleanTable, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `${TABLES_COLLECTION}/${table.id}`);
  }
}

/**
 * Delete a Table from Firestore
 */
export async function deleteTableFromDb(tableId: string): Promise<void> {
  try {
    const ref = doc(db, TABLES_COLLECTION, tableId);
    await deleteDoc(ref);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `${TABLES_COLLECTION}/${tableId}`);
  }
}

/**
 * Save or update an Order in Firestore
 */
export async function saveOrderToDb(order: Order): Promise<void> {
  try {
    const cleanOrder = sanitizeForFirestore(order);
    const ref = doc(db, ORDERS_COLLECTION, cleanOrder.id);
    await setDoc(ref, cleanOrder, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `${ORDERS_COLLECTION}/${order.id}`);
  }
}

/**
 * Save or update a Reservation in Firestore
 */
export async function saveReservationToDb(reservation: Reservation): Promise<void> {
  try {
    const cleanRes = sanitizeForFirestore(reservation);
    const ref = doc(db, RESERVATIONS_COLLECTION, cleanRes.id);
    await setDoc(ref, cleanRes, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `${RESERVATIONS_COLLECTION}/${reservation.id}`);
  }
}

/**
 * Real-time listener for Staff Accounts
 */
export function subscribeToStaffAccounts(onUpdate: (accounts: StaffAccount[]) => void) {
  const colRef = collection(db, STAFF_COLLECTION);
  return onSnapshot(
    colRef,
    (snapshot) => {
      if (!snapshot.empty) {
        const accounts = snapshot.docs.map((d) => d.data() as StaffAccount);
        onUpdate(accounts);
      }
    },
    (error) => {
      handleFirestoreError(error, OperationType.GET, STAFF_COLLECTION);
    }
  );
}

/**
 * Save or update a Staff Account in Firestore
 */
export async function saveStaffAccountToDb(account: StaffAccount): Promise<void> {
  try {
    const cleanAccount = sanitizeForFirestore(account);
    const ref = doc(db, STAFF_COLLECTION, cleanAccount.id);
    await setDoc(ref, cleanAccount, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `${STAFF_COLLECTION}/${account.id}`);
  }
}

/**
 * Delete a Staff Account from Firestore
 */
export async function deleteStaffAccountFromDb(accountId: string): Promise<void> {
  try {
    const ref = doc(db, STAFF_COLLECTION, accountId);
    await deleteDoc(ref);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `${STAFF_COLLECTION}/${accountId}`);
  }
}

/**
 * Real-time listener for Restaurant Settings
 */
export function subscribeToSettings(onUpdate: (settings: RestaurantSettings) => void) {
  const docRef = doc(db, SETTINGS_COLLECTION, 'main');
  return onSnapshot(
    docRef,
    (snapshot) => {
      if (snapshot.exists()) {
        onUpdate(snapshot.data() as RestaurantSettings);
      }
    },
    (error) => {
      handleFirestoreError(error, OperationType.GET, `${SETTINGS_COLLECTION}/main`);
    }
  );
}

/**
 * Save Restaurant Settings to Firestore
 */
export async function saveSettingsToDb(settings: RestaurantSettings): Promise<void> {
  try {
    const cleanSettings = sanitizeForFirestore(settings);
    const ref = doc(db, SETTINGS_COLLECTION, 'main');
    await setDoc(ref, cleanSettings, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `${SETTINGS_COLLECTION}/main`);
  }
}

/**
 * Real-time listener for Staff Audit Logs
 */
export function subscribeToAuditLogs(onUpdate: (logs: StaffAuditLog[]) => void) {
  const colRef = collection(db, AUDIT_COLLECTION);
  return onSnapshot(
    colRef,
    (snapshot) => {
      if (!snapshot.empty) {
        const logs = snapshot.docs.map((d) => d.data() as StaffAuditLog);
        logs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
        onUpdate(logs);
      }
    },
    (error) => {
      handleFirestoreError(error, OperationType.GET, AUDIT_COLLECTION);
    }
  );
}

/**
 * Save an Audit Log entry to Firestore
 */
export async function addAuditLogToDb(log: StaffAuditLog): Promise<void> {
  try {
    const cleanLog = sanitizeForFirestore(log);
    const ref = doc(db, AUDIT_COLLECTION, cleanLog.id);
    await setDoc(ref, cleanLog);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `${AUDIT_COLLECTION}/${log.id}`);
  }
}


