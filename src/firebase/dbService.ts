/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  onSnapshot 
} from 'firebase/firestore';
import { db, auth, isUsingMockSandbox, handleFirestoreError, OperationType } from './config';
import { InventoryItem, KpdnPrice, NotificationItem, UserSettings, StorageReport, UserProfile, UserRole } from '../types';

// Default KPDN Controlled Prices
export const DEFAULT_KPDN_PRICES: KpdnPrice[] = [
  { id: 'gula_kasar', product: 'Gula Pasir Kasar (Pek 1kg)', maxPrice: 2.85 },
  { id: 'gula_halus', product: 'Gula Pasir Halus (Pek 1kg)', maxPrice: 2.95 },
  { id: 'minyak_pek', product: 'Minyak Masak (Polibeg 1kg)', maxPrice: 2.50 },
  { id: 'tepung', product: 'Tepung Gandum (Pek 1kg)', maxPrice: 3.10 },
  { id: 'beras_tempatan', product: 'Beras Putih Tempatan (Kasut 5kg)', maxPrice: 13.00 },
  { id: 'telur_a', product: 'Telur Ayam Gred A (Sarang 30 Biji)', maxPrice: 13.50 }
];

// Helper to write to local storage sandbox
const getMockData = <T>(key: string, defaultValue: T): T => {
  const data = localStorage.getItem(`wrapstock_${key}`);
  return data ? JSON.parse(data) : defaultValue;
};

const saveMockData = <T>(key: string, data: T) => {
  localStorage.setItem(`wrapstock_${key}`, JSON.stringify(data));
};

// Seed initial values in sandbox if empty
if (localStorage.getItem('wrapstock_seeded_kpdn') !== 'true') {
  saveMockData('kpdn_prices', DEFAULT_KPDN_PRICES);
  saveMockData('seeded_kpdn', 'true');
  
  // Seed initial dummy inventory
  const initialInventory: InventoryItem[] = [
    {
      id: 'inv_1',
      name: 'Gula Pasir Kasar (Pek 1kg)',
      barcode: '9556001091101',
      category: 'Makanan Terproses (Processed Food)',
      quantity: 50,
      unitPrice: 2.60,
      sellingPrice: 2.80, // Safe (Under Ceiling 2.85)
      supplier: 'Malayan Sugar Refineries',
      dateAdded: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      expiryDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 15 days out
      notes: 'Rak A1',
      createdBy: 'mock_staff'
    },
    {
      id: 'inv_2',
      name: 'Susu UHT Dutch Lady Coklat 1L',
      barcode: '9556001091202',
      category: 'Minuman (Drinks)',
      quantity: 12,
      unitPrice: 5.20,
      sellingPrice: 6.50,
      supplier: 'Dutch Lady Industries Bhd',
      dateAdded: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      expiryDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 2 days (Critical)
      notes: 'Fridge Depan',
      createdBy: 'mock_staff'
    },
    {
      id: 'inv_3',
      name: 'Minyak Masak (Polibeg 1kg)',
      barcode: '9556001091303',
      category: 'Makanan Terproses (Processed Food)',
      quantity: 5, // Low stock alert
      unitPrice: 2.30,
      sellingPrice: 2.90, // VIOLATION! (Ceiling price is 2.50)
      supplier: 'Sime Darby Oils',
      dateAdded: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
      expiryDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 5 days (Warning)
      notes: 'Rak Belakang',
      createdBy: 'mock_admin'
    }
  ];
  saveMockData('inventory', initialInventory);

  const initialNotifications: NotificationItem[] = [
    {
      id: 'notif_1',
      type: 'kpdn',
      message: '⚠ Amaran Harga: Produk "Minyak Masak (Polibeg 1kg)" dijual pada harga RM 2.90, melebihi harga siling KPDN (RM 2.50).',
      createdAt: new Date().toISOString(),
      read: false
    },
    {
      id: 'notif_2',
      type: 'expiry',
      message: 'Susu UHT Dutch Lady Coklat 1L akan tamat tempoh dalam masa 2 hari.',
      createdAt: new Date().toISOString(),
      read: false
    }
  ];
  saveMockData('notifications', initialNotifications);
}

export const dbService = {
  // ==================== USER PROFILES ====================
  async getCurrentUserProfile(uid: string): Promise<UserProfile | null> {
    if (isUsingMockSandbox) {
      const users = getMockData<UserProfile[]>('users', []);
      const user = users.find(u => u.uid === uid);
      if (!user) {
        // Auto-create workspace user as admin in sandbox
        const defaultUser: UserProfile = {
          uid,
          email: auth.currentUser?.email || 'memelanaa@gmail.com',
          displayName: auth.currentUser?.displayName || 'Admin WrapStock',
          role: UserRole.ADMIN,
          createdAt: new Date().toISOString(),
          lastActive: new Date().toISOString()
        };
        users.push(defaultUser);
        saveMockData('users', users);
        return defaultUser;
      }
      return user;
    }

    const path = `users/${uid}`;
    try {
      const docSnap = await getDoc(doc(db, 'users', uid));
      if (docSnap.exists()) {
        return { uid, ...docSnap.data() } as UserProfile;
      }
      return null;
    } catch (e) {
      return handleFirestoreError(e, OperationType.GET, path);
    }
  },

  async createUserProfile(uid: string, profile: Partial<UserProfile>): Promise<void> {
    if (isUsingMockSandbox) {
      const users = getMockData<UserProfile[]>('users', []);
      const index = users.findIndex(u => u.uid === uid);
      const newProfile: UserProfile = {
        uid,
        email: profile.email || '',
        displayName: profile.displayName || 'Staff Baru',
        role: profile.role || UserRole.STAFF,
        createdAt: new Date().toISOString(),
        lastActive: new Date().toISOString(),
        ...profile
      };
      if (index > -1) {
        users[index] = newProfile;
      } else {
        users.push(newProfile);
      }
      saveMockData('users', users);
      return;
    }

    const path = `users/${uid}`;
    try {
      await setDoc(doc(db, 'users', uid), {
        email: profile.email || '',
        displayName: profile.displayName || '',
        role: profile.role || UserRole.STAFF,
        createdAt: new Date().toISOString(),
        lastActive: new Date().toISOString(),
      });
    } catch (e) {
      handleFirestoreError(e, OperationType.WRITE, path);
    }
  },

  async getAllUsers(): Promise<UserProfile[]> {
    if (isUsingMockSandbox) {
      return getMockData<UserProfile[]>('users', []);
    }
    const path = 'users';
    try {
      const querySnap = await getDocs(collection(db, 'users'));
      return querySnap.docs.map(docSnap => ({ uid: docSnap.id, ...docSnap.data() } as UserProfile));
    } catch (e) {
      return handleFirestoreError(e, OperationType.LIST, path);
    }
  },

  async updateUserRole(uid: string, role: UserRole): Promise<void> {
    if (isUsingMockSandbox) {
      const users = getMockData<UserProfile[]>('users', []);
      const user = users.find(u => u.uid === uid);
      if (user) {
        user.role = role;
        user.lastActive = new Date().toISOString();
        saveMockData('users', users);
      }
      return;
    }
    const path = `users/${uid}`;
    try {
      await updateDoc(doc(db, 'users', uid), { role, lastActive: new Date().toISOString() });
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, path);
    }
  },

  async deleteUser(uid: string): Promise<void> {
    if (isUsingMockSandbox) {
      const users = getMockData<UserProfile[]>('users', []);
      const updated = users.filter(u => u.uid !== uid);
      saveMockData('users', updated);
      return;
    }
    const path = `users/${uid}`;
    try {
      await deleteDoc(doc(db, 'users', uid));
    } catch (e) {
      handleFirestoreError(e, OperationType.DELETE, path);
    }
  },

  // ==================== INVENTORY MANAGEMENT ====================
  async getInventory(): Promise<InventoryItem[]> {
    if (isUsingMockSandbox) {
      return getMockData<InventoryItem[]>('inventory', []);
    }
    const path = 'inventory';
    try {
      const querySnap = await getDocs(collection(db, 'inventory'));
      return querySnap.docs.map(docSnap => ({ id: docSnap.id, ...docSnap.data() } as InventoryItem));
    } catch (e) {
      return handleFirestoreError(e, OperationType.LIST, path);
    }
  },

  async saveInventoryItem(item: InventoryItem): Promise<string> {
    // ⚠ CHECK KPDN PRICE CEILING BEFORE SAVING
    const limits = await this.getKpdnPrices();
    const cleanName = item.name.toLowerCase();
    
    // Find matching controlled ceiling price
    const match = limits.find(lim => 
      cleanName.includes(lim.product.toLowerCase()) || 
      lim.product.toLowerCase().includes(cleanName)
    );

    if (match && item.sellingPrice > match.maxPrice) {
      // Trigger a real violation notification asynchronously
      this.createNotification({
        type: 'kpdn',
        message: `⚠ Amaran KPDN: Harga jualan produk "${item.name}" (RM ${item.sellingPrice.toFixed(2)}) melebihi harga siling yang ditetapkan (RM ${match.maxPrice.toFixed(2)}).`,
        createdAt: new Date().toISOString(),
        read: false
      }).catch(err => console.error(err));
    }

    if (isUsingMockSandbox) {
      const list = getMockData<InventoryItem[]>('inventory', []);
      const id = item.id || `inv_${Date.now()}`;
      const savedItem = { ...item, id };
      const index = list.findIndex(i => i.id === id);
      if (index > -1) {
        list[index] = savedItem;
      } else {
        list.push(savedItem);
      }
      saveMockData('inventory', list);
      return id;
    }

    const path = item.id ? `inventory/${item.id}` : 'inventory';
    try {
      if (item.id) {
        const docRef = doc(db, 'inventory', item.id);
        const { id, ...payload } = item;
        await setDoc(docRef, payload);
        return item.id;
      } else {
        const docRef = await addDoc(collection(db, 'inventory'), item);
        return docRef.id;
      }
    } catch (e) {
      return handleFirestoreError(e, OperationType.WRITE, path);
    }
  },

  async deleteInventoryItem(id: string): Promise<void> {
    if (isUsingMockSandbox) {
      const list = getMockData<InventoryItem[]>('inventory', []);
      const updated = list.filter(i => i.id !== id);
      saveMockData('inventory', updated);
      return;
    }
    const path = `inventory/${id}`;
    try {
      await deleteDoc(doc(db, 'inventory', id));
    } catch (e) {
      handleFirestoreError(e, OperationType.DELETE, path);
    }
  },

  // ==================== KPDN PRICES ====================
  async getKpdnPrices(): Promise<KpdnPrice[]> {
    if (isUsingMockSandbox) {
      return getMockData<KpdnPrice[]>('kpdn_prices', DEFAULT_KPDN_PRICES);
    }
    const path = 'kpdn_prices';
    try {
      const querySnap = await getDocs(collection(db, 'kpdn_prices'));
      const prices = querySnap.docs.map(docSnap => ({ id: docSnap.id, ...docSnap.data() } as KpdnPrice));
      if (prices.length === 0) {
        // Seed default prices in Firestore if empty
        const promises = DEFAULT_KPDN_PRICES.map(async (p) => {
          await setDoc(doc(db, 'kpdn_prices', p.id || ''), { product: p.product, maxPrice: p.maxPrice });
        });
        await Promise.all(promises);
        return DEFAULT_KPDN_PRICES;
      }
      return prices;
    } catch (e) {
      return handleFirestoreError(e, OperationType.LIST, path);
    }
  },

  async saveKpdnPrice(price: KpdnPrice): Promise<void> {
    if (isUsingMockSandbox) {
      const list = getMockData<KpdnPrice[]>('kpdn_prices', DEFAULT_KPDN_PRICES);
      const id = price.id || `kpdn_${Date.now()}`;
      const index = list.findIndex(p => p.id === id);
      const savedPrice = { ...price, id };
      if (index > -1) {
        list[index] = savedPrice;
      } else {
        list.push(savedPrice);
      }
      saveMockData('kpdn_prices', list);
      return;
    }
    const id = price.id || price.product.toLowerCase().replace(/[^a-z0-9]/g, '_');
    const path = `kpdn_prices/${id}`;
    try {
      await setDoc(doc(db, 'kpdn_prices', id), {
        product: price.product,
        maxPrice: price.maxPrice
      });
    } catch (e) {
      handleFirestoreError(e, OperationType.WRITE, path);
    }
  },

  async deleteKpdnPrice(id: string): Promise<void> {
    if (isUsingMockSandbox) {
      const list = getMockData<KpdnPrice[]>('kpdn_prices', DEFAULT_KPDN_PRICES);
      const updated = list.filter(p => p.id !== id);
      saveMockData('kpdn_prices', updated);
      return;
    }
    const path = `kpdn_prices/${id}`;
    try {
      await deleteDoc(doc(db, 'kpdn_prices', id));
    } catch (e) {
      handleFirestoreError(e, OperationType.DELETE, path);
    }
  },

  // ==================== NOTIFICATIONS ====================
  async getNotifications(): Promise<NotificationItem[]> {
    if (isUsingMockSandbox) {
      return getMockData<NotificationItem[]>('notifications', []);
    }
    const path = 'notifications';
    try {
      const querySnap = await getDocs(collection(db, 'notifications'));
      return querySnap.docs.map(docSnap => ({ id: docSnap.id, ...docSnap.data() } as NotificationItem));
    } catch (e) {
      return handleFirestoreError(e, OperationType.LIST, path);
    }
  },

  async createNotification(item: NotificationItem): Promise<string> {
    if (isUsingMockSandbox) {
      const list = getMockData<NotificationItem[]>('notifications', []);
      const id = `notif_${Date.now()}`;
      list.unshift({ ...item, id });
      saveMockData('notifications', list);
      return id;
    }
    const path = 'notifications';
    try {
      const docRef = await addDoc(collection(db, 'notifications'), item);
      return docRef.id;
    } catch (e) {
      return handleFirestoreError(e, OperationType.WRITE, path);
    }
  },

  async markNotificationAsRead(id: string): Promise<void> {
    if (isUsingMockSandbox) {
      const list = getMockData<NotificationItem[]>('notifications', []);
      const index = list.findIndex(n => n.id === id);
      if (index > -1) {
        list[index].read = true;
        saveMockData('notifications', list);
      }
      return;
    }
    const path = `notifications/${id}`;
    try {
      await updateDoc(doc(db, 'notifications', id), { read: true });
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, path);
    }
  },

  // ==================== USER SETTINGS ====================
  async getSettings(userId: string): Promise<UserSettings> {
    const defaultSettings: UserSettings = {
      language: 'ms', // Default Bahasa Melayu
      mode: 'light'
    };
    if (isUsingMockSandbox) {
      return getMockData<UserSettings>(`settings_${userId}`, defaultSettings);
    }
    const path = `settings/${userId}`;
    try {
      const docSnap = await getDoc(doc(db, 'settings', userId));
      if (docSnap.exists()) {
        return docSnap.data() as UserSettings;
      }
      return defaultSettings;
    } catch (e) {
      return defaultSettings; // Soft fallback
    }
  },

  async saveSettings(userId: string, settings: UserSettings): Promise<void> {
    if (isUsingMockSandbox) {
      saveMockData(`settings_${userId}`, settings);
      return;
    }
    const path = `settings/${userId}`;
    try {
      await setDoc(doc(db, 'settings', userId), settings);
    } catch (e) {
      handleFirestoreError(e, OperationType.WRITE, path);
    }
  },

  // ==================== HISTORIC INVENTORY REPORTS ====================
  async getReports(): Promise<StorageReport[]> {
    if (isUsingMockSandbox) {
      return getMockData<StorageReport[]>('reports', []);
    }
    const path = 'reports';
    try {
      const querySnap = await getDocs(collection(db, 'reports'));
      return querySnap.docs.map(docSnap => ({ id: docSnap.id, ...docSnap.data() } as StorageReport));
    } catch (e) {
      return handleFirestoreError(e, OperationType.LIST, path);
    }
  },

  async createReport(report: StorageReport): Promise<string> {
    if (isUsingMockSandbox) {
      const list = getMockData<StorageReport[]>('reports', []);
      const id = `rep_${Date.now()}`;
      list.unshift({ ...report, id });
      saveMockData('reports', list);
      return id;
    }
    const path = 'reports';
    try {
      const docRef = await addDoc(collection(db, 'reports'), report);
      return docRef.id;
    } catch (e) {
      return handleFirestoreError(e, OperationType.WRITE, path);
    }
  }
};
