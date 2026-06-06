/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export enum UserRole {
  ADMIN = 'admin',
  STAFF = 'staff'
}

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  role: UserRole;
  createdAt: string;
  lastActive: string;
}

export interface InventoryItem {
  id?: string;
  name: string;
  barcode: string;
  category: string;
  quantity: number;
  unitPrice: number;
  sellingPrice: number;
  supplier: string;
  dateAdded: string;
  expiryDate: string;
  notes: string;
  imageUrl?: string;
  createdBy: string;
}

export interface KpdnPrice {
  id?: string;
  product: string;
  maxPrice: number;
}

export interface NotificationItem {
  id?: string;
  type: 'expiry' | 'low_stock' | 'kpdn';
  message: string;
  createdAt: string;
  read: boolean;
}

export interface UserSettings {
  language: 'ms' | 'en';
  mode: 'light' | 'dark';
}

export interface StorageReport {
  id?: string;
  title: string;
  summary: string;
  fastMoving: string[];
  slowMoving: string[];
  highRisk: string[];
  generatedAt: string;
}

export enum ExpiryStatus {
  CRITICAL = 'critical', // 0-3 days
  WARNING = 'warning',   // 4-7 days
  SAFE = 'safe'          // >7 days
}

export const CATEGORIES = [
  'Makanan Terproses (Processed Food)',
  'Bahan Segar (Fresh Goods)',
  'Minuman (Drinks)',
  'Penjagaan Diri (Personal Care)',
  'Peralatan Rumah (Household)',
  'Peralatan Sekolah (Stationery)',
  'Lain-lain (Others)'
];
