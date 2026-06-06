/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Trash2, 
  Users, 
  LineChart, 
  AlertCircle, 
  CheckCircle, 
  Languages, 
  Bell, 
  LayoutDashboard, 
  ScanLine, 
  ShieldAlert, 
  Printer, 
  BrainCircuit, 
  Settings, 
  LogOut, 
  Sun, 
  Moon, 
  Menu, 
  X,
  TrendingDown,
  Warehouse
} from 'lucide-react';

import { AuthScreen } from './components/AuthScreen';
import { InventoryPanel } from './components/InventoryPanel';
import { BarcodePanel } from './components/BarcodePanel';
import { KpdnPanel } from './components/KpdnPanel';
import { WrapPrintPanel } from './components/WrapPrintPanel';
import { AiPanel } from './components/AiPanel';

import { auth, isUsingMockSandbox } from './firebase/config';
import { dbService } from './firebase/dbService';
import { UserRole, InventoryItem, NotificationItem, ExpiryStatus } from './types';
import { TRANSLATIONS, detectBrowserLanguage, getDaysRemaining, getExpiryStatus } from './utils';

export default function App() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'inventory' | 'scan' | 'kpdn' | 'print' | 'ai' | 'settings'>('dashboard');
  const [language, setLanguage] = useState<'ms' | 'en'>('ms');
  const [themeMode, setThemeMode] = useState<'light' | 'dark'>('light');
  const [authReady, setAuthReady] = useState(false);
  const [user, setUser] = useState<{ uid: string; role: UserRole; name: string } | null>(null);

  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scanSearchQuery, setScanSearchQuery] = useState('');

  const t = TRANSLATIONS[language];

  // Load language preference from Local Storage on mount, fallback on browser detector
  useEffect(() => {
    const savedLang = localStorage.getItem('wrapstock_locale') as 'ms' | 'en';
    if (savedLang) {
      setLanguage(savedLang);
    } else {
      const detected = detectBrowserLanguage();
      setLanguage(detected);
    }

    const savedTheme = localStorage.getItem('wrapstock_theme') as 'light' | 'dark';
    if (savedTheme) {
      setThemeMode(savedTheme);
    } else {
      setThemeMode('light');
    }
  }, []);

  // Sync theme visual class on HTML document
  useEffect(() => {
    const root = window.document.documentElement;
    if (themeMode === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('wrapstock_theme', themeMode);
  }, [themeMode]);

  // Firebase auth state monitoring listener
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (firebaseUser) => {
      if (firebaseUser) {
        // Fetch matching profile and role
        const profile = await dbService.getCurrentUserProfile(firebaseUser.uid);
        if (profile) {
          setUser({
            uid: firebaseUser.uid,
            role: profile.role,
            name: profile.displayName || firebaseUser.displayName || 'Staf Koperasi'
          });
          
          // Load specific language preference stored in setting database if any
          const userSet = await dbService.getSettings(firebaseUser.uid);
          if (userSet) {
            setLanguage(userSet.language);
            setThemeMode(userSet.mode);
          }
        }
      } else {
        setUser(null);
      }
      setAuthReady(true);
    });

    return () => unsubscribe();
  }, []);

  // Fetch metrics data from database on load or refresh
  const loadStoreData = async () => {
    try {
      const items = await dbService.getInventory();
      setInventory(items);

      const alerts = await dbService.getNotifications();
      setNotifications(alerts);
    } catch (err) {
      console.error("Error loading store data metrics:", err);
    }
  };

  useEffect(() => {
    if (user) {
      loadStoreData();
    }
  }, [user]);

  // Log outs
  const handleLogout = async () => {
    try {
      await auth.signOut();
      setUser(null);
    } catch (e) {
      console.error(e);
    }
  };

  const changeLocale = async (lang: 'ms' | 'en') => {
    setLanguage(lang);
    localStorage.setItem('wrapstock_locale', lang);
    if (user) {
      await dbService.saveSettings(user.uid, { language: lang, mode: themeMode });
    }
  };

  const changeTheme = async (mode: 'light' | 'dark') => {
    setThemeMode(mode);
    if (user) {
      await dbService.saveSettings(user.uid, { language, mode });
    }
  };

  if (!authReady) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center font-sans">
        <div className="h-10 w-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mb-4" />
        <span className="text-sm font-semibold text-slate-400">Loading WrapStock Core...</span>
      </div>
    );
  }

  if (!user) {
    return <AuthScreen onAuthSuccess={(uid, role) => setUser({ uid, role, name: 'Demo User' })} language={language} themeMode={themeMode} />;
  }

  // Dashboard Stats Calculations
  const totalProductsCount = inventory.length;
  const totalQuantitySum = inventory.reduce((acc, i) => acc + i.quantity, 0);

  const expiryCounts = inventory.reduce((acc, item) => {
    const days = getDaysRemaining(item.expiryDate);
    const status = getExpiryStatus(days);
    acc[status] = (acc[status] || 0) + 1;
    return acc;
  }, { [ExpiryStatus.CRITICAL]: 0, [ExpiryStatus.WARNING]: 0, [ExpiryStatus.SAFE]: 0 });

  const lowStockThresholdCount = inventory.filter(i => i.quantity <= 10).length;

  return (
    <div className={`min-h-screen ${themeMode === 'light' ? 'bg-slate-50 text-slate-800' : 'bg-slate-950 text-slate-100'} flex flex-col font-sans transition-all duration-250`}>
      {/* Top Header Rail bar [Sticky/Responsive] */}
      <header className={`h-16 ${themeMode === 'light' ? 'bg-white border-b border-slate-200 text-slate-800' : 'bg-slate-900 border-b border-slate-800 text-white'} sticky top-0 z-50 px-4 flex items-center justify-between no-print transition-all duration-250`}>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setMobileMenuOpen(true)}
            className={`lg:hidden p-2 ${themeMode === 'light' ? 'text-slate-500 hover:text-slate-800 hover:bg-slate-100' : 'text-slate-400 hover:text-white hover:bg-slate-800'} rounded-lg`}
          >
            <Menu className="h-5 w-5" />
          </button>
          
          <div className="h-10 w-10 shrink-0 bg-emerald-500 rounded-xl flex items-center justify-center font-mono font-bold text-slate-950 text-xl shadow-md">
            WS
          </div>
          <div className="flex flex-col">
            <span className={`font-extrabold ${themeMode === 'light' ? 'text-slate-800' : 'text-white'} text-base tracking-tight leading-tight`}>WrapStock</span>
            <span className={`text-[10px] ${themeMode === 'light' ? 'text-slate-500' : 'text-slate-400'} font-sans tracking-wide truncate max-w-[120px] sm:max-w-none`}>{t.appTagline}</span>
          </div>
        </div>

        {/* Toolbar selectors */}
        <div className="flex items-center gap-3">
          {/* Language selector */}
          <div className={`flex ${themeMode === 'light' ? 'bg-slate-100 border border-slate-200' : 'bg-slate-950 border border-slate-800'} p-1 rounded-xl text-[10px] font-bold tracking-wider`}>
            <button
              onClick={() => changeLocale('ms')}
              className={`px-2.5 py-1.5 rounded-lg select-none transition-colors ${
                language === 'ms' 
                  ? 'bg-emerald-500 text-slate-950' 
                  : `${themeMode === 'light' ? 'text-slate-600 hover:text-slate-900' : 'text-slate-400 hover:text-white'}`
              }`}
            >
              BM
            </button>
            <button
              onClick={() => changeLocale('en')}
              className={`px-2.5 py-1.5 rounded-lg select-none transition-colors ${
                language === 'en' 
                  ? 'bg-emerald-500 text-slate-950' 
                  : `${themeMode === 'light' ? 'text-slate-600 hover:text-slate-900' : 'text-slate-400 hover:text-white'}`
              }`}
            >
              EN
            </button>
          </div>

          {/* Theme mode toggle */}
          <button
            onClick={() => changeTheme(themeMode === 'light' ? 'dark' : 'light')}
            className={`p-2 ${themeMode === 'light' ? 'text-slate-655 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 border border-slate-200' : 'text-slate-400 hover:text-white bg-slate-950 hover:bg-slate-800 border border-slate-800'} rounded-xl transition-colors`}
          >
            {themeMode === 'light' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
          </button>

          {/* Notification dropdown trigger */}
          <div className="relative">
            <button 
              onClick={() => setShowNotifications(!showNotifications)}
              className={`p-2 ${themeMode === 'light' ? 'text-slate-655 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 border border-slate-200' : 'text-slate-400 hover:text-white bg-slate-950 hover:bg-slate-800 border border-slate-800'} rounded-xl relative transition-colors`}
            >
              <Bell className="h-4 w-4" />
              {notifications.filter(n => !n.read).length > 0 && (
                <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-red-500 animate-pulse" />
              )}
            </button>

            {showNotifications && (
              <div className={`absolute right-0 mt-2 w-80 ${themeMode === 'light' ? 'bg-white border border-slate-200 text-slate-800 shadow-xl' : 'bg-slate-900 border border-slate-755/90 text-slate-300 shadow-2xl'} rounded-2xl p-4 overflow-hidden z-[999] max-h-96`}>
                <div className={`flex justify-between items-center border-b ${themeMode === 'light' ? 'border-slate-100' : 'border-slate-800'} pb-2 mb-3`}>
                  <span className={`font-bold text-xs uppercase tracking-wider ${themeMode === 'light' ? 'text-slate-800' : 'text-white'}`}>{t.recentNotifications}</span>
                  <span className="text-[10px] text-slate-400 font-mono">({notifications.filter(n => !n.read).length} unread)</span>
                </div>
                <div className="space-y-2 overflow-y-auto max-h-64 pr-1 text-slate-300">
                  {notifications.map((notif) => (
                    <div 
                      key={notif.id} 
                      onClick={async () => {
                        if (notif.id) {
                          await dbService.markNotificationAsRead(notif.id);
                          loadStoreData();
                        }
                      }}
                      className={`p-2.5 rounded-xl text-xs border transition-colors cursor-pointer ${
                        notif.read 
                          ? `${themeMode === 'light' ? 'bg-slate-50 border-slate-150 text-slate-400 hover:bg-slate-100' : 'bg-slate-900/30 border-slate-850 text-slate-500'}` 
                          : 'bg-emerald-500/10 border-emerald-500/30 hover:bg-emerald-500/20 text-emerald-800 dark:text-emerald-300'
                      }`}
                    >
                      <p className={`font-medium ${themeMode === 'light' ? 'text-slate-700' : 'text-slate-200'}`}>{notif.message}</p>
                      <span className="text-[9px] text-slate-500 font-mono mt-1 block">
                        {new Date(notif.createdAt).toLocaleTimeString()}
                      </span>
                    </div>
                  ))}
                  {notifications.length === 0 && (
                    <p className={`text-center py-6 ${themeMode === 'light' ? 'text-slate-400' : 'text-slate-500'} text-xs`}>{t.noNotifications}</p>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Logout button */}
          <button 
            onClick={handleLogout}
            className="p-2 text-red-400 hover:text-red-300 bg-red-950/20 hover:bg-red-950/50 rounded-xl border border-red-900/40 transition-colors cursor-pointer"
            title={t.logout}
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* SIDEBAR NAVIGATION (Desktop Breakpoint: is hidden on smaller devices) */}
        <aside className="hidden lg:flex w-64 bg-slate-900 border-r border-slate-800 flex-col py-6 px-4 justify-between shrink-0 no-print">
          <div className="space-y-6">
            <div className="px-3">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t.appName} SUITE</p>
              <h3 className="text-sm font-bold text-white mt-1 capitalize truncate">{user.name} ({user.role})</h3>
            </div>

            <nav className="space-y-1">
              {[
                { id: 'dashboard', label: t.dashboard, icon: LayoutDashboard },
                { id: 'inventory', label: t.inventory, icon: Warehouse },
                { id: 'scan', label: t.scan, icon: ScanLine },
                { id: 'kpdn', label: t.kpdnGuard, icon: ShieldAlert },
                { id: 'print', label: 'WrapPrint Tickets', icon: Printer },
                { id: 'ai', label: 'Gemini AI Advisor', icon: BrainCircuit }
              ].map((m) => {
                const Icon = m.icon;
                const isActive = activeTab === m.id;
                return (
                  <button
                    key={m.id}
                    onClick={() => setActiveTab(m.id as any)}
                    className={`nav-btn w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-semibold cursor-pointer select-none transition-all ${
                      isActive 
                        ? 'bg-emerald-500 text-slate-950 font-bold shadow-md shadow-emerald-500/10' 
                        : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    <span>{m.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl text-[10px] text-slate-500">
            <p className="font-mono">STATUS: Demo Sandbox</p>
            <p>Vite + React PWA engine</p>
          </div>
        </aside>

        {/* MOBILE SLIDE OVER MENU DRAWER */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-[100] lg:hidden no-print">
            <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs" onClick={() => setMobileMenuOpen(false)} />
            
            <aside className="fixed top-0 bottom-0 left-0 w-64 bg-slate-900 border-r border-slate-800 p-6 flex flex-col justify-between">
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-300 text-xs tracking-widest uppercase">Menu Utama</span>
                  <button onClick={() => setMobileMenuOpen(false)} className="p-1 px-1.5 bg-slate-800 rounded">
                    <X className="h-4 w-4 text-slate-400" />
                  </button>
                </div>

                <nav className="space-y-1">
                  {[
                    { id: 'dashboard', label: t.dashboard, icon: LayoutDashboard },
                    { id: 'inventory', label: t.inventory, icon: Warehouse },
                    { id: 'scan', label: t.scan, icon: ScanLine },
                    { id: 'kpdn', label: t.kpdnGuard, icon: ShieldAlert },
                    { id: 'print', label: 'WrapPrint Tickets', icon: Printer },
                    { id: 'ai', label: 'Gemini AI Advisor', icon: BrainCircuit }
                  ].map((m) => {
                    const Icon = m.icon;
                    const isActive = activeTab === m.id;
                    return (
                      <button
                        key={m.id}
                        onClick={() => {
                          setActiveTab(m.id as any);
                          setMobileMenuOpen(false);
                        }}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-semibold cursor-pointer select-none transition-all ${
                          isActive 
                            ? 'bg-emerald-500 text-slate-950 font-bold' 
                            : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                        }`}
                      >
                        <Icon className="h-5 w-5" />
                        <span>{m.label}</span>
                      </button>
                    );
                  })}
                </nav>
              </div>

              <div className="p-3 bg-slate-950 rounded-lg text-[9px] text-slate-600">
                <span>WrapStock v1.0.0</span>
              </div>
            </aside>
          </div>
        )}

        {/* MAIN DISPLAY WORKSPACE AREA (Adapts to Mobile, Tablet, Desktop fluid) */}
        <main className={`flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 space-y-6 print:p-0 ${themeMode === 'light' ? 'bg-slate-50 text-slate-800' : 'bg-slate-950 text-slate-100'}`}>
          
          {/* Tab Screen Core Route Router */}
          {activeTab === 'dashboard' && (
            <div className="space-y-6 no-print">
              {/* Responsive Stats summary widgets layout (Multi-columns on desktop, grid on iPad, rows on Mobile) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                
                {/* Total inventory widget */}
                <div className={`p-5 rounded-xl border flex items-center gap-4 transition-all duration-250 shadow-sm hover:shadow-md ${
                  themeMode === 'light' 
                    ? 'bg-white border-slate-200 text-slate-800' 
                    : 'bg-slate-900 border-slate-800 text-slate-100'
                }`}>
                  <div className={`h-12 w-12 rounded-xl flex items-center justify-center font-bold ${
                    themeMode === 'light' ? 'bg-emerald-50 text-emerald-600' : 'bg-emerald-500/10 text-emerald-400'
                  }`}>
                    <Warehouse className="h-6 w-6" />
                  </div>
                  <div className="flex flex-col">
                    <span className={`text-[11px] font-sans ${themeMode === 'light' ? 'text-slate-500' : 'text-slate-400'} uppercase tracking-wider font-bold`}>{t.totalProducts}</span>
                    <span className={`text-2xl font-extrabold font-mono leading-tight ${themeMode === 'light' ? 'text-slate-955' : 'text-white'}`}>{totalProductsCount}</span>
                  </div>
                </div>

                {/* Total quantities sums */}
                <div className={`p-5 rounded-xl border flex items-center gap-4 transition-all duration-250 shadow-sm hover:shadow-md ${
                  themeMode === 'light' 
                    ? 'bg-white border-slate-200 text-slate-800' 
                    : 'bg-slate-900 border-slate-800 text-slate-100'
                }`}>
                  <div className={`h-12 w-12 rounded-xl flex items-center justify-center font-bold ${
                    themeMode === 'light' ? 'bg-sky-50 text-sky-600' : 'bg-sky-500/10 text-sky-400'
                  }`}>
                    <LineChart className="h-6 w-6" />
                  </div>
                  <div className="flex flex-col">
                    <span className={`text-[11px] font-sans ${themeMode === 'light' ? 'text-slate-500' : 'text-slate-400'} uppercase tracking-wider font-bold`}>{t.totalQuantity}</span>
                    <span className={`text-2xl font-extrabold font-mono leading-tight ${themeMode === 'light' ? 'text-slate-955' : 'text-white'}`}>{totalQuantitySum}</span>
                  </div>
                </div>

                {/* Critical Expiry */}
                <div className={`p-5 rounded-xl border flex items-center gap-4 transition-all duration-250 shadow-sm hover:shadow-md ${
                  themeMode === 'light' 
                    ? 'bg-white border-slate-250 text-slate-800 ring-2 ring-red-100/50' 
                    : 'bg-slate-900 border-slate-800 text-slate-100 ring-2 ring-red-955/40'
                }`}>
                  <div className={`h-12 w-12 rounded-xl flex items-center justify-center font-bold animate-pulse ${
                    themeMode === 'light' ? 'bg-red-50 text-red-600' : 'bg-red-500/10 text-red-400'
                  }`}>
                    <AlertCircle className="h-6 w-6" />
                  </div>
                  <div className="flex flex-col">
                    <span className={`text-[11px] font-sans ${themeMode === 'light' ? 'text-slate-500' : 'text-slate-400'} uppercase tracking-wider font-bold`}>{t.criticalExpiry.split('(')[0]}</span>
                    <span className={`text-2xl font-extrabold font-mono leading-tight ${themeMode === 'light' ? 'text-slate-955' : 'text-white'}`}>
                      {expiryCounts[ExpiryStatus.CRITICAL]} <span className={`text-xs ${themeMode === 'light' ? 'text-red-600 font-bold' : 'text-red-400'}`}>({t.criticalTag})</span>
                    </span>
                  </div>
                </div>

                {/* Warning Expiry */}
                <div className={`p-5 rounded-xl border flex items-center gap-4 transition-all duration-250 shadow-sm hover:shadow-md ${
                  themeMode === 'light' 
                    ? 'bg-white border-slate-250 text-slate-800 ring-2 ring-amber-100/50' 
                    : 'bg-slate-900 border-slate-800 text-slate-100 ring-2 ring-amber-955/40'
                }`}>
                  <div className={`h-12 w-12 rounded-xl flex items-center justify-center font-bold ${
                    themeMode === 'light' ? 'bg-amber-50 text-amber-600' : 'bg-amber-500/10 text-amber-400'
                  }`}>
                    <AlertCircle className="h-6 w-6" />
                  </div>
                  <div className="flex flex-col">
                    <span className={`text-[11px] font-sans ${themeMode === 'light' ? 'text-slate-500' : 'text-slate-400'} uppercase tracking-wider font-bold`}>{t.warningExpiry.split('(')[0]}</span>
                    <span className={`text-2xl font-extrabold font-mono leading-tight ${themeMode === 'light' ? 'text-slate-955' : 'text-white'}`}>
                      {expiryCounts[ExpiryStatus.WARNING]} <span className={`text-xs ${themeMode === 'light' ? 'text-amber-600 font-bold' : 'text-amber-400'}`}>({t.warningTag})</span>
                    </span>
                  </div>
                </div>

              </div>

              {/* Fast links in Mobile banner */}
              <div className={`border rounded-2xl p-6 relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all duration-250 ${
                themeMode === 'light' 
                  ? 'bg-gradient-to-r from-emerald-50 to-teal-50 border-emerald-200 shadow-sm' 
                  : 'bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border-emerald-500/20 shadow-md'
              }`}>
                <div className="space-y-1 max-w-xl">
                  <span className={`font-bold text-xs uppercase tracking-wider ${themeMode === 'light' ? 'text-emerald-700 font-semibold' : 'text-emerald-400'}`}>Mulai Mengurus Serta-merta</span>
                  <h3 className={`text-lg font-bold ${themeMode === 'light' ? 'text-slate-800' : 'text-white'}`}>Adakah item baru sampai di stor koperasi?</h3>
                  <p className={`text-xs ${themeMode === 'light' ? 'text-slate-600' : 'text-slate-400'}`}>Gunakan scanner barkod pintar kami untuk menyemak harga siling mengikut Akta kawalan harga KPDN secara automatik.</p>
                </div>
                <button
                  onClick={() => setActiveTab('scan')}
                  className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs rounded-xl flex items-center gap-2 w-fit cursor-pointer transition-transform active:scale-95 select-none shadow-md"
                >
                  <ScanLine className="h-4 w-4 stroke-3" />
                  Buka Scanner Sekarang
                </button>
              </div>

              {/* Grid 2-cols: Recent updates lists vs alerts board (Excellent use on Tablet grids) */}
              <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                
                {/* Expired soon table summary (2-cols width) */}
                <div className={`border rounded-xl p-5 xl:col-span-2 shadow-sm transition-all duration-250 ${
                  themeMode === 'light' ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800'
                }`}>
                  <h4 className={`font-bold text-sm mb-4 ${themeMode === 'light' ? 'text-slate-700 animate-fade-in' : 'text-white'}`}>Urutan Barang Bakal Luput</h4>
                  <div className={`overflow-x-auto rounded-xl border ${themeMode === 'light' ? 'border-slate-150' : 'border-slate-800'}`}>
                    <table className="w-full text-left text-xs">
                      <thead className={`font-bold uppercase text-[10px] tracking-wider border-b ${
                        themeMode === 'light' ? 'bg-slate-50 text-slate-550 border-slate-150' : 'bg-slate-850 text-slate-400 border-slate-800'
                      }`}>
                        <tr>
                          <th className="px-6 py-3">Produk</th>
                          <th className="px-4 py-3">Kategori</th>
                          <th className="px-4 py-3 text-center">Baki Hari</th>
                        </tr>
                      </thead>
                      <tbody className={`divide-y text-xs ${
                        themeMode === 'light' ? 'divide-slate-100 text-slate-700' : 'divide-slate-805 text-slate-300'
                      }`}>
                        {inventory.slice(0, 5).map((item) => {
                          const days = getDaysRemaining(item.expiryDate);
                          return (
                            <tr key={item.id} className={`${themeMode === 'light' ? 'hover:bg-slate-50' : 'hover:bg-slate-800/40'} transition-all`}>
                              <td className={`px-6 py-4 font-bold ${themeMode === 'light' ? 'text-slate-850' : 'text-white'}`}>{item.name}</td>
                              <td className="px-4 py-4 italic text-slate-400">{item.category.split('(')[0]}</td>
                              <td className="px-4 py-4 text-center">
                                <span className={`px-2 py-0.5 rounded font-bold text-[10px] ${
                                  days <= 3 
                                    ? `${themeMode === 'light' ? 'bg-red-50 text-red-700 border border-red-150' : 'bg-red-955/40 text-red-400 border border-red-900/40'}` 
                                    : `${themeMode === 'light' ? 'bg-slate-100 text-slate-600 font-semibold' : 'bg-slate-950 text-slate-400'}`
                                }`}>
                                  {days} hari lagi ({item.expiryDate})
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                        {inventory.length === 0 && (
                          <tr>
                            <td colSpan={3} className={`text-center py-8 ${themeMode === 'light' ? 'text-slate-450' : 'text-slate-500'}`}>Tiada stok didaftarkan.</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Stock volume warnings widgets */}
                <div className={`border rounded-xl p-5 shadow-sm flex flex-col justify-between transition-all duration-250 ${
                  themeMode === 'light' ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800'
                }`}>
                  <div>
                    <h4 className={`font-bold text-sm mb-2 ${themeMode === 'light' ? 'text-slate-700 font-bold' : 'text-white'}`}>{t.lowStock}</h4>
                    <p className={`text-xs mb-3 ${themeMode === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>Item berikut memerlukan penambahan segera daripada pembuat pembekal:</p>
                    <div className="space-y-2 overflow-y-auto max-h-44">
                      {inventory.filter(i => i.quantity <= 10).map(item => (
                        <div key={item.id} className={`p-2.5 rounded-xl text-xs flex justify-between items-center ${
                          themeMode === 'light' 
                            ? 'bg-red-50 border border-red-100 text-red-800' 
                            : 'bg-red-955/20 border border-red-900/30 text-red-200'
                        }`}>
                          <span className={`font-bold truncate max-w-[140px] ${themeMode === 'light' ? 'text-slate-800' : 'text-white'}`}>{item.name}</span>
                          <span className={`font-mono text-[10px] font-bold px-1.5 py-0.5 rounded ${
                            themeMode === 'light' 
                              ? 'bg-red-100 border border-red-200 text-red-700 font-bold' 
                              : 'bg-red-500/10 border border-red-900/30 text-red-400'
                          }`}>Baki: {item.quantity} u</span>
                        </div>
                      ))}
                      {inventory.filter(i => i.quantity <= 10).length === 0 && (
                        <p className={`text-xs text-center py-8 ${themeMode === 'light' ? 'text-slate-450' : 'text-slate-600'}`}>Stok mencukupi untuk semua barangan.</p>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={() => setActiveTab('ai')}
                    className={`w-full mt-4 py-2.5 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 cursor-pointer select-none transition-colors ${
                      themeMode === 'light' 
                          ? 'bg-slate-100 hover:bg-slate-205 text-indigo-700 border border-slate-250 shadow-xs' 
                          : 'bg-slate-800 hover:bg-slate-750 text-emerald-400 border border-slate-750 shadow-md'
                    }`}
                  >
                    <BrainCircuit className="h-4 w-4" />
                    Consult Gemini for Order Plan
                  </button>
                </div>

              </div>
            </div>
          )}

          {activeTab === 'inventory' && (
            <InventoryPanel 
              language={language} 
              userRole={user.role} 
              userId={user.uid} 
              inventory={inventory} 
              onRefresh={loadStoreData} 
              initialSearchQuery={scanSearchQuery}
              clearInitialSearchQuery={() => setScanSearchQuery('')}
              themeMode={themeMode}
            />
          )}

          {activeTab === 'scan' && (
            <div className="max-w-2xl mx-auto space-y-6">
              <BarcodePanel 
                language={language} 
                onBarcodeDetected={(code) => {
                  setScanSearchQuery(code);
                  setActiveTab('inventory');
                }} 
                themeMode={themeMode}
              />
            </div>
          )}

          {activeTab === 'kpdn' && (
            <KpdnPanel 
              language={language} 
              userRole={user.role} 
              inventory={inventory} 
              themeMode={themeMode}
            />
          )}

          {activeTab === 'print' && (
            <WrapPrintPanel 
              language={language} 
              inventory={inventory} 
              themeMode={themeMode}
            />
          )}

          {activeTab === 'ai' && (
            <AiPanel 
              language={language} 
              inventory={inventory} 
              themeMode={themeMode}
            />
          )}

        </main>
      </div>

      {/* MOBILE BOTTOM NAVIGATION TRACK BAR (Strict touch constraints of 44px) */}
      <footer className={`lg:hidden h-16 ${themeMode === 'light' ? 'bg-white border-t border-slate-205 text-slate-800' : 'bg-slate-900 border-t border-slate-800 text-slate-100'} flex items-center justify-around px-2 sticky bottom-0 z-50 no-print max-w-full transition-all duration-250`}>
        {[
          { id: 'dashboard', label: t.dashboard, icon: LayoutDashboard },
          { id: 'inventory', label: 'Stok', icon: Warehouse },
          { id: 'scan', label: 'Imbas', icon: ScanLine },
          { id: 'kpdn', label: 'Ceilings', icon: ShieldAlert },
          { id: 'print', label: 'Tickets', icon: Printer },
          { id: 'ai', label: 'AI', icon: BrainCircuit }
        ].map((m) => {
          const Icon = m.icon;
          const isActive = activeTab === m.id;
          return (
            <button
              key={m.id}
              onClick={() => setActiveTab(m.id as any)}
              className={`p-2 flex flex-col items-center justify-center h-12 w-12 rounded-xl transition-all cursor-pointer ${
                isActive 
                  ? themeMode === 'light' ? 'text-emerald-600 bg-emerald-50 font-bold' : 'text-emerald-400 bg-slate-800'
                  : 'text-slate-500 hover:text-slate-350'
              }`}
              style={{ minHeight: '44px', minWidth: '44px' }}
            >
              <Icon className="h-5 w-5" />
              <span className="text-[9px] font-sans font-bold mt-0.5 truncate max-w-[40px]">{m.label.split(' ')[0]}</span>
            </button>
          );
        })}
      </footer>
    </div>
  );
}
