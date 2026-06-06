/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ExpiryStatus } from './types';

// Strict Days Remaining Calculator
export function getDaysRemaining(expiryDateStr: string): number {
  if (!expiryDateStr) return 999;
  const expiryDate = new Date(expiryDateStr);
  const today = new Date();
  
  // Set times to midnight to avoid hour differences
  expiryDate.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);
  
  const diffTime = expiryDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
}

// Color coding calculator: Critical (Red 0-3 days), Warning (Yellow 4-7 days), Safe (Green > 7 days)
export function getExpiryStatus(days: number): ExpiryStatus {
  if (days <= 3) return ExpiryStatus.CRITICAL;
  if (days <= 7) return ExpiryStatus.WARNING;
  return ExpiryStatus.SAFE;
}

export function getExpiryColorClass(days: number, theme: 'light' | 'dark' = 'light'): {
  bg: string;
  text: string;
  border: string;
} {
  const status = getExpiryStatus(days);
  if (status === ExpiryStatus.CRITICAL) {
    return {
      bg: theme === 'light' ? 'bg-red-50 hover:bg-red-100' : 'bg-red-950/40 hover:bg-red-900/40',
      text: theme === 'light' ? 'text-red-700' : 'text-red-300',
      border: theme === 'light' ? 'border-red-200' : 'border-red-900/60'
    };
  }
  if (status === ExpiryStatus.WARNING) {
    return {
      bg: theme === 'light' ? 'bg-amber-50 hover:bg-amber-100' : 'bg-amber-950/40 hover:bg-amber-900/40',
      text: theme === 'light' ? 'text-amber-700' : 'text-amber-300',
      border: theme === 'light' ? 'border-amber-200' : 'border-amber-900/60'
    };
  }
  return {
    bg: theme === 'light' ? 'bg-emerald-50 hover:bg-emerald-100' : 'bg-emerald-950/40 hover:bg-emerald-900/40',
    text: theme === 'light' ? 'text-emerald-700' : 'text-emerald-300',
    border: theme === 'light' ? 'border-emerald-200' : 'border-emerald-900/60'
  };
}

// Translations dictionary
export const TRANSLATIONS = {
  ms: {
    appName: "WrapStock",
    appTagline: "Sistem Inventori Pintar Koperasi & Runcit",
    dashboard: "Papan Pemuka",
    inventory: "Pengurusan Stok",
    scan: "Imbas Barkod",
    kpdnGuard: "KPDN Price Guard",
    wrapPrint: "Sijil WrapPrint",
    aiAssistant: "Asisten AI Gemini",
    settings: "Tetapan",
    staffs: "Kakitangan",
    
    // Auth
    welcomeBack: "Selamat Kembali",
    loginDesc: "Log masuk untuk mengakses inventori dan harga siling KPDN.",
    googleLogin: "Log Masuk dengan Google",
    registerTitle: "Daftar Akaun Baru",
    registerDesc: "Daftar koperasi atau kedai runcit anda dalam talian seketika.",
    sessionSaved: "Sesi Disimpan",
    logout: "Log Keluar",
    
    // Dashboard
    totalProducts: "Jumlah Produk",
    totalQuantity: "Jumlah Kuantiti",
    criticalExpiry: "Tamat Tempoh Kritikal (0-3 Hari)",
    warningExpiry: "Amaran Tamat Tempoh (4-7 Hari)",
    safeExpiry: "Tahap Selamat (> 7 Hari)",
    recentNotifications: "Notifikasi Terkini",
    inventoryGraph: "Ringkasan Kelayakan Inventori",
    criticalTag: "Kritikal",
    warningTag: "Amaran",
    safeTag: "Selamat",
    lowStock: "Stok Rendah (< 10 unit)",
    
    // Form & Table fields
    productName: "Nama Produk",
    barcode: "Kod Barkod (EAN/UPC)",
    category: "Kategori",
    quantity: "Kuantiti",
    unitPrice: "Harga Kos (RM)",
    sellingPrice: "Harga Jual (RM)",
    supplier: "Pembekal / Pengedar",
    expiryDate: "Tarikh Tamat Tempoh",
    notes: "Nota Tambahan / Lokasi Rak",
    dateAdded: "Tarikh Ditambah",
    actions: "Tindakan",
    placeholderSearch: "Cari produk dengan nama atau barkod...",
    filterCategory: "Semua Kategori",
    sortBy: "Isih Mengikut",
    sortName: "Nama",
    sortExpiry: "Tarikh Luput",
    sortQty: "Kuantiti",
    addProduct: "Tambah Produk Baru",
    editProduct: "Kemaskini Produk",
    save: "Simpan Rekod",
    cancel: "Batal",
    delete: "Hapus",
    emptyInventory: "Tiada inventori ditemui.",
    
    // Barcode scanner
    startScan: "Mulai Imbasan Kamera",
    stopScan: "Hentikan Imbasan",
    scanSuccess: "Barkod Berjaya Diimbas",
    cameraPermission: "Memerlukan kebenaran kamera untuk mengimbas",
    barcodePlaceholder: "Kod diimbas automatik masuk di sini...",
    
    // KPDN Price Guard
    kpdnTitle: "KPDN Price Guard (Kawalan Harga Malaysia)",
    kpdnSubtitle: "Pantau kepatuhan harga runcit koperasi anda terhadap had harga siling KPDN.",
    ceilingPrice: "Harga Siling",
    currentPrice: "Harga Anda",
    complianceStatus: "Status Kepatuhan",
    complianceOK: "✓ Kepatuhan OK",
    complianceViolated: "⚠ Harga Lebih Siling!",
    kpdnWarningAlert: "⚠ Perhatian: Harga jualan produk melebihi had siling harga kawalan KPDN!",
    addCeiling: "Tambah Barangan Terkawal Baru",
    
    // WrapPrint Tag
    printTagsTitle: "Penaik Tag Harga WrapPrint",
    printTagsSubtitle: "Cetak label tanda harga patuh KPDN dengan Barkod dan QR Code automatik.",
    generateTag: "Penjana Label Harga",
    preview: "Ulasan Cetakan (Print Preview)",
    print: "Cetak Label",
    exportPdf: "Eksport PDF",
    
    // AI Assistant
    aiTitle: "Analitis Pintar Gemini AI Lite",
    aiSubtitle: "Dapatkan ramalan stok, amaran diskaun baki luput, dan laporan mingguan pintar.",
    generateAiAnalysis: "Buat Analitis Stok Bersama Gemini AI",
    askAi: "Tanya AI sesuatu tentang inventori anda...",
    send: "Hantar",
    aiPlaceholder: "Berapa unit produk yang patut saya diskaun kerana tarikh luput semakin hampir?",
    suggestRestock: "Cadangan Tambah Stok",
    discountAdvise: "Cadangan Promosi & Harga",
    weeklyReport: "Laporan Mingguan",
    
    // Settings
    langMalay: "Bahasa Melayu",
    langEnglish: "English",
    themeMode: "Mod Visual",
    lightMode: "Mod Terang (Light Mode)",
    darkMode: "Mod Gelap (Dark Mode)",
    userManagement: "Urus Pengguna & Kakitangan",
    role: "Peranan Kuasa",
    adminRole: "Pentadbir (Admin)",
    staffRole: "Kakitangan (Staff)",
    
    // Notification items
    markedRead: "Telah dibaca",
    noNotifications: "Tiada notifikasi baru."
  },
  en: {
    appName: "WrapStock",
    appTagline: "Smart Retail & Cooperative Inventory System",
    dashboard: "Dashboard",
    inventory: "Stock Management",
    scan: "Scan Barcode",
    kpdnGuard: "KPDN Price Guard",
    wrapPrint: "WrapPrint Sijil",
    aiAssistant: "Gemini AI Assistant",
    settings: "Settings",
    staffs: "Staff Directory",
    
    // Auth
    welcomeBack: "Welcome Back",
    loginDesc: "Log in to access inventory records and monitor KPDN ceiling compliance.",
    googleLogin: "Sign In with Google",
    registerTitle: "Register Store Accounts",
    registerDesc: "Set up your school coop or store online within seconds.",
    sessionSaved: "Remembered Session",
    logout: "Log Out",
    
    // Dashboard
    totalProducts: "Total Products",
    totalQuantity: "Total Quantity",
    criticalExpiry: "Critical Expiry (0-3 Days)",
    warningExpiry: "Expiry Warning (4-7 Days)",
    safeExpiry: "Safe Storage (> 7 Days)",
    recentNotifications: "Recent Notifications",
    inventoryGraph: "Inventory Status Breakdown",
    criticalTag: "Critical",
    warningTag: "Warning",
    safeTag: "Safe",
    lowStock: "Low Stock (< 10 units)",
    
    // Form & Table fields
    productName: "Product Name",
    barcode: "Barcode Code (EAN/UPC)",
    category: "Category",
    quantity: "Quantity",
    unitPrice: "Unit Cost (RM)",
    sellingPrice: "Selling Price (RM)",
    supplier: "Supplier / Distributor",
    expiryDate: "Expiry Date",
    notes: "Notes / Shelf Placement",
    dateAdded: "Added Date",
    actions: "Actions",
    placeholderSearch: "Search catalog by title or barcode...",
    filterCategory: "All Categories",
    sortBy: "Sort By",
    sortName: "Name",
    sortExpiry: "Expiry Date",
    sortQty: "Quantity",
    addProduct: "Add New Product",
    editProduct: "Edit Product",
    save: "Save Item",
    cancel: "Cancel",
    delete: "Delete",
    emptyInventory: "No inventory records loaded.",
    
    // Barcode scanner
    startScan: "Start Camera Scan",
    stopScan: "Stop Scanner",
    scanSuccess: "Barcode Scanned Successfully",
    cameraPermission: "Requires camera permissions for WebRTC scanning",
    barcodePlaceholder: "Parsed barcode inserts automatically...",
    
    // KPDN Price Guard
    kpdnTitle: "KPDN Price Guard (Malaysian Controlled Goods)",
    kpdnSubtitle: "Ensure your selling prices fit within the ceiling pricing limits regulated by KPDN.",
    ceilingPrice: "Ceiling Limit",
    currentPrice: "Current Price",
    complianceStatus: "Compliance Status",
    complianceOK: "✓ Compliant",
    complianceViolated: "⚠ Exceeds Ceiling!",
    kpdnWarningAlert: "⚠ Attention: Selling price exceeds KPDN regulated price ceiling guidelines!",
    addCeiling: "Add Controlled Good Limit",
    
    // WrapPrint Tag
    printTagsTitle: "WrapPrint Pricing Tickets",
    printTagsSubtitle: "Generate print-ready shelves tags including QR Codes, barcode references and ceiling markers.",
    generateTag: "Generate Pricetags",
    preview: "Print Preview Screen",
    print: "Print Label Ticket",
    exportPdf: "Export PDF Format",
    
    // AI Assistant
    aiTitle: "Gemini AI Intelligent Analysis",
    aiSubtitle: "Review quick stock predictions, expiry alerts, discount guides, and compile reports.",
    generateAiAnalysis: "Generate Inventory Health Report with Gemini",
    askAi: "Ask prompt questions to Gemini AI about stock levels...",
    send: "Send",
    aiPlaceholder: "What promotions should I run on products nearing expiration date?",
    suggestRestock: "Suggest Re-order Volume",
    discountAdvise: "Sales Discounts Insights",
    weeklyReport: "Weekly Store Review",
    
    // Settings
    langMalay: "Bahasa Melayu",
    langEnglish: "English",
    themeMode: "Display theme",
    lightMode: "Light Theme",
    darkMode: "Dark Theme",
    userManagement: "Access Management",
    role: "User Privileges",
    adminRole: "Administrator",
    staffRole: "Staff Associate",
    
    // Notification items
    markedRead: "Marked as read",
    noNotifications: "No pending alerts."
  }
};

// Automatic browser language detection
export function detectBrowserLanguage(): 'ms' | 'en' {
  const browserLang = navigator.language || (navigator as any).userLanguage || '';
  if (browserLang.toLowerCase().includes('ms') || browserLang.toLowerCase().includes('my')) {
    return 'ms';
  }
  return 'en';
}

// Simulated Barcode generation helper (since we use vanilla JavaScript / HTML layouts for print outputs)
export function getDummyBarcodeUrl(code: string): string {
  // Return an inline SVG generator or placeholder barcode render
  return `https://bwipjs-api.metafloor.com/?bcid=code128&text=${encodeURIComponent(code)}&scale=3&rotate=N&includetext`;
}

export function getDummyQrCodeUrl(item: { name: string; price: number; barcode: string }): string {
  // Uses a public QR code renderer for shelf scanning
  const qrText = `Verify WrapStock: ${item.name} | Price: RM ${item.price.toFixed(2)} | Barcode: ${item.barcode}`;
  return `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(qrText)}`;
}
