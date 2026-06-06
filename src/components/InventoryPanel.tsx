/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { dbService } from '../firebase/dbService';
import { InventoryItem, UserRole, CATEGORIES, ExpiryStatus } from '../types';
import { 
  getDaysRemaining, 
  getExpiryColorClass, 
  getExpiryStatus, 
  TRANSLATIONS 
} from '../utils';
import { 
  Search, 
  SlidersHorizontal, 
  Download, 
  Plus, 
  Trash2, 
  Edit, 
  FileSpreadsheet, 
  Sparkles, 
  AlertTriangle, 
  FolderPlus, 
  CalendarClock 
} from 'lucide-react';

interface InventoryPanelProps {
  language: 'ms' | 'en';
  userRole: UserRole;
  userId: string;
  inventory: InventoryItem[];
  onRefresh: () => void;
  initialSearchQuery?: string;
  clearInitialSearchQuery?: () => void;
  themeMode?: 'light' | 'dark';
}

export function InventoryPanel({ 
  language, 
  userRole, 
  userId, 
  inventory, 
  onRefresh,
  initialSearchQuery = '',
  clearInitialSearchQuery,
  themeMode = 'light'
}: InventoryPanelProps) {
  const [searchTerm, setSearchTerm] = useState(initialSearchQuery);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'expiry' | 'quantity'>('expiry');
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    if (initialSearchQuery) {
      setSearchTerm(initialSearchQuery);
      if (clearInitialSearchQuery) {
        clearInitialSearchQuery();
      }
    }
  }, [initialSearchQuery, clearInitialSearchQuery]);
  
  // Form fields
  const [editId, setEditId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [barcode, setBarcode] = useState('');
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [quantity, setQuantity] = useState('10');
  const [unitPrice, setUnitPrice] = useState('1.50');
  const [sellingPrice, setSellingPrice] = useState('2.00');
  const [supplier, setSupplier] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [notes, setNotes] = useState('');
  
  // Real-time KPDN alert state
  const [kpdnCeiling, setKpdnCeiling] = useState<number | null>(null);
  
  const t = TRANSLATIONS[language];
  const isAdmin = userRole === UserRole.ADMIN;

  // Real-time price ceiling validation check
  useEffect(() => {
    const checkKpdnCeiling = async () => {
      if (!name) {
        setKpdnCeiling(null);
        return;
      }
      try {
        const limits = await dbService.getKpdnPrices();
        const match = limits.find(l => 
          name.toLowerCase().includes(l.product.toLowerCase()) || 
          l.product.toLowerCase().includes(name.toLowerCase())
        );
        setKpdnCeiling(match ? match.maxPrice : null);
      } catch (err) {
        console.error(err);
      }
    };
    checkKpdnCeiling();
  }, [name]);

  const handleOpenAddForm = () => {
    setEditId(null);
    setName('');
    setBarcode('');
    setCategory(CATEGORIES[0]);
    setQuantity('10');
    setUnitPrice('1.50');
    setSellingPrice('2.00');
    setSupplier('');
    setExpiryDate(new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]); // 2 weeks out defaulted
    setNotes('');
    setShowForm(true);
  };

  const handleOpenEditForm = (item: InventoryItem) => {
    setEditId(item.id || null);
    setName(item.name);
    setBarcode(item.barcode);
    setCategory(item.category);
    setQuantity(String(item.quantity));
    setUnitPrice(String(item.unitPrice));
    setSellingPrice(String(item.sellingPrice));
    setSupplier(item.supplier);
    setExpiryDate(item.expiryDate);
    setNotes(item.notes);
    setShowForm(true);
  };

  const handleDeleteItem = async (id: string) => {
    if (!isAdmin) {
      alert(language === 'ms' ? 'Hanya pentadbir (Admin) boleh menghapus produk.' : 'Only administrators can delete products.');
      return;
    }
    if (!confirm(language === 'ms' ? 'Sahkah anda ingin menghapus item ini daripada inventori?' : 'Are you sure you want to delete this product?')) return;
    try {
      await dbService.deleteInventoryItem(id);
      onRefresh();
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload: InventoryItem = {
        name,
        barcode,
        category,
        quantity: parseInt(quantity) || 0,
        unitPrice: parseFloat(unitPrice) || 0,
        sellingPrice: parseFloat(sellingPrice) || 0,
        supplier,
        dateAdded: new Date().toISOString(),
        expiryDate,
        notes,
        createdBy: userId
      };
      if (editId) {
        payload.id = editId;
      }

      await dbService.saveInventoryItem(payload);
      setShowForm(false);
      onRefresh();
    } catch (err) {
      console.error(err);
    }
  };

  // CSV Exporter
  const handleExportCSV = () => {
    if (inventory.length === 0) return;
    
    const headers = ["Product Name", "Barcode", "Category", "Quantity", "Unit Cost (RM)", "Selling Price (RM)", "Expiry Date", "Supplier", "Notes"];
    const rows = inventory.map(item => [
      `"${item.name}"`,
      `"${item.barcode}"`,
      `"${item.category}"`,
      item.quantity,
      item.unitPrice.toFixed(2),
      item.sellingPrice.toFixed(2),
      item.expiryDate,
      `"${item.supplier}"`,
      `"${item.notes}"`
    ]);

    const csvContent = [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `wrapstock_inventory_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Processing listing: search, filter, and sorting
  const getProcessedInventory = () => {
    let result = [...inventory];
    
    // Search
    if (searchTerm) {
      const cleanTerm = searchTerm.toLowerCase();
      result = result.filter(item => 
        item.name.toLowerCase().includes(cleanTerm) || 
        item.barcode.includes(cleanTerm)
      );
    }

    // Category filter
    if (selectedCategory) {
      result = result.filter(item => item.category === selectedCategory);
    }

    // Sort
    if (sortBy === 'name') {
      result.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortBy === 'expiry') {
      result.sort((a, b) => new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime());
    } else if (sortBy === 'quantity') {
      result.sort((a, b) => a.quantity - b.quantity);
    }

    return result;
  };

  const processedList = getProcessedInventory();

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Filtering rails */}
      <div className={`border rounded-xl p-4 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between no-print transition-all duration-250 ${
        themeMode === 'light' ? 'bg-white border-slate-205' : 'bg-slate-900 border-slate-800 shadow-xl'
      }`}>
        <div className="relative w-full md:max-w-md">
          <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-500" />
          <input
            type="text"
            placeholder={t.placeholderSearch}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={`w-full border focus:border-emerald-500 rounded-xl pl-10 pr-4 py-3 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500 ${
              themeMode === 'light' ? 'bg-slate-50 border-slate-200 text-slate-800' : 'bg-slate-950 border-slate-805 text-slate-205'
            }`}
          />
        </div>

        <div className="flex flex-wrap gap-2 w-full md:w-auto items-center">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className={`border focus:border-emerald-505 rounded-xl px-3 py-2 text-xs focus:outline-none cursor-pointer ${
              themeMode === 'light' ? 'bg-slate-50 border-slate-200 text-slate-700' : 'bg-slate-955 border-slate-805 text-slate-300'
            }`}
          >
            <option value="">{t.filterCategory}</option>
            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className={`border focus:border-emerald-505 rounded-xl px-3 py-2 text-xs focus:outline-none cursor-pointer ${
              themeMode === 'light' ? 'bg-slate-50 border-slate-200 text-slate-700' : 'bg-slate-955 border-slate-805 text-slate-300'
            }`}
          >
            <option value="expiry">{t.sortBy}: {t.sortExpiry}</option>
            <option value="name">{t.sortBy}: {t.sortName}</option>
            <option value="quantity">{t.sortBy}: {t.sortQty}</option>
          </select>

          <button
            onClick={handleExportCSV}
            className={`py-2 px-3 text-xs font-semibold border border-dashed rounded-xl flex items-center gap-1.5 cursor-pointer select-none transition-colors ${
              themeMode === 'light' 
                ? 'bg-slate-100 hover:bg-slate-200 border-slate-250 text-slate-700' 
                : 'bg-slate-800 hover:bg-slate-750 border-slate-700 text-slate-300'
            }`}
          >
            <Download className="h-3.5 w-3.5" />
            Eksport CSV
          </button>

          <button
            onClick={handleOpenAddForm}
            className="py-2 px-3 text-xs bg-emerald-500 hover:bg-emerald-600 font-bold rounded-xl text-slate-950 flex items-center gap-1.5 cursor-pointer select-none transition-colors shadow-sm"
          >
            <Plus className="h-3.5 w-3.5 stroke-3" />
            {t.addProduct}
          </button>
        </div>
      </div>

      {/* Main Stock spreadsheet visual lists */}
      <div className={`border rounded-xl p-6 shadow-sm relative overflow-hidden transition-all duration-250 ${
        themeMode === 'light' ? 'bg-white border-slate-205' : 'bg-slate-900 border-slate-800 shadow-xl'
      }`}>
        <h3 className={`font-bold text-lg mb-4 flex items-center gap-2 ${themeMode === 'light' ? 'text-slate-800' : 'text-white'}`}>
          <FileSpreadsheet className="h-5 w-5 text-emerald-555" />
          Katalog Barangan Koperasi ({processedList.length})
        </h3>

        <div className={`overflow-x-auto rounded-xl border font-sans ${themeMode === 'light' ? 'border-slate-150' : 'border-slate-800'}`}>
          <table className={`w-full text-left text-xs ${themeMode === 'light' ? 'text-slate-700' : 'text-slate-300'}`}>
            <thead className={`font-bold uppercase text-[10px] tracking-wider select-none border-b ${
              themeMode === 'light' ? 'bg-slate-50 text-slate-550 border-slate-150' : 'bg-slate-800 text-slate-300 border-slate-700'
            }`}>
              <tr>
                <th className="px-4 py-3">{t.productName}</th>
                <th className="px-4 py-3">Kod Barkod</th>
                <th className="px-4 py-3">{t.category}</th>
                <th className="px-4 py-3 text-center">{t.quantity}</th>
                <th className="px-4 py-3 text-right">{t.sellingPrice}</th>
                <th className="px-4 py-3 text-center">Tarikh Luput</th>
                <th className="px-4 py-3 text-right no-print">Tindakan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-705/60 text-xs">
              {processedList.map((item) => {
                const days = getDaysRemaining(item.expiryDate);
                const statusColors = getExpiryColorClass(days);
                
                return (
                  <tr key={item.id} className={`transition-colors border-b ${
                    themeMode === 'light' ? 'hover:bg-slate-50 border-slate-100' : 'hover:bg-slate-805/40 border-slate-805'
                  }`}>
                    <td className={`px-4 py-3.5 font-bold truncate max-w-[200px] ${themeMode === 'light' ? 'text-slate-900' : 'text-white'}`}>{item.name}</td>
                    <td className={`px-4 py-3.5 font-mono select-text font-medium ${themeMode === 'light' ? 'text-slate-550' : 'text-slate-400'}`}>{item.barcode}</td>
                    <td className={`px-4 py-3.5 italic ${themeMode === 'light' ? 'text-slate-550' : 'text-slate-400'}`}>{item.category.split('(')[0]}</td>
                    <td className="px-4 py-3.5 text-center font-mono">
                      <span className={`px-2 py-0.5 rounded-md font-bold text-[10px] ${
                        item.quantity <= 10 
                          ? `${themeMode === 'light' ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-red-950/40 text-red-400 border border-red-900/40'}` 
                          : `${themeMode === 'light' ? 'bg-slate-100 text-slate-700 border border-slate-200' : 'bg-slate-900 text-slate-300'}`
                      }`}>
                        {item.quantity}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-right font-mono font-semibold text-emerald-600 dark:text-emerald-400">RM {item.sellingPrice.toFixed(2)}</td>
                    <td className="px-4 py-3.5 text-center">
                      <span className={`px-2.5 py-1 text-[10px] font-bold rounded-lg border flex items-center justify-center gap-1 ${
                        themeMode === 'light' 
                          ? days <= 3 ? 'bg-red-50 border-red-200 text-red-700 font-bold' : days <= 7 ? 'bg-amber-50 border-amber-200 text-amber-800' : 'bg-slate-100 border-slate-200 text-slate-700'
                          : statusColors.bg + ' ' + statusColors.text + ' ' + statusColors.border
                      }`}>
                        <CalendarClock className="h-3 w-3 shrink-0" />
                        <span>{item.expiryDate} ({days}d)</span>
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-right no-print">
                      <div className="flex gap-2 justify-end">
                        <button
                          onClick={() => handleOpenEditForm(item)}
                          className={`p-1 px-1.5 rounded-lg text-[11px] font-medium flex items-center gap-1 transition-colors cursor-pointer ${
                            themeMode === 'light' ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200' : 'bg-slate-700 hover:bg-slate-650 text-slate-300'
                          }`}
                        >
                          <Edit className="h-3 w-3" />
                        </button>
                        {isAdmin && (
                          <button
                            onClick={() => handleDeleteItem(item.id || '')}
                            className={`p-1 px-1.5 rounded-lg text-[11px] font-medium flex items-center gap-1 transition-colors cursor-pointer ${
                              themeMode === 'light' ? 'bg-red-5 border-red-100 text-red-700' : 'bg-red-950/20 hover:bg-red-955/65 text-red-400'
                            }`}
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
              {processedList.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-center py-10 text-slate-500 font-sans">
                    {t.emptyInventory}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Editor sidebar / drawer modal */}
      {showForm && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs flex justify-end z-[999] no-print">
          <div className={`w-full max-w-lg border-l p-6 flex flex-col justify-between overflow-y-auto transition-all duration-250 ${
            themeMode === 'light' ? 'bg-white border-slate-205 text-slate-800' : 'bg-slate-900 border-slate-750 text-slate-100'
          }`}>
            <div>
              <div className={`flex items-center justify-between border-b pb-3 mb-6 ${themeMode === 'light' ? 'border-slate-100' : 'border-slate-850'}`}>
                <h4 className={`font-bold text-lg ${themeMode === 'light' ? 'text-slate-800' : 'text-white'}`}>
                  {editId ? t.editProduct : t.addProduct}
                </h4>
                <button
                  onClick={() => setShowForm(false)}
                  className={`p-1 text-xs rounded-lg ${themeMode === 'light' ? 'bg-slate-100 text-slate-600 hover:text-slate-800' : 'bg-slate-800 text-slate-300 hover:text-white'}`}
                >
                  {t.cancel}
                </button>
              </div>

              <form id="drawer-form" onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className={`block text-xs font-semibold ${themeMode === 'light' ? 'text-slate-500' : 'text-slate-400'} uppercase tracking-wider mb-1`}>Nama Produk</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Contoh: Milo Coklat Pek 1kg"
                    className={`w-full border focus:border-emerald-505 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500 ${
                      themeMode === 'light' ? 'bg-slate-50 border-slate-200 text-slate-800' : 'bg-slate-950 border-slate-805 text-slate-200'
                    }`}
                    required
                  />
                </div>

                <div>
                  <label className={`block text-xs font-semibold ${themeMode === 'light' ? 'text-slate-500' : 'text-slate-400'} uppercase tracking-wider mb-1`}>Kod Barkod (EAN/UPC)</label>
                  <input
                    type="text"
                    value={barcode}
                    onChange={(e) => setBarcode(e.target.value)}
                    placeholder="Contoh: 9556001091234"
                    className={`w-full border focus:border-emerald-505 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500 ${
                      themeMode === 'light' ? 'bg-slate-50 border-slate-200 text-slate-800' : 'bg-slate-950 border-slate-850 text-slate-200'
                    }`}
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={`block text-xs font-semibold ${themeMode === 'light' ? 'text-slate-500' : 'text-slate-400'} uppercase tracking-wider mb-1`}>Kategori</label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className={`w-full border focus:border-emerald-505 rounded-xl px-3 py-2.5 text-sm focus:outline-none cursor-pointer ${
                        themeMode === 'light' ? 'bg-slate-50 border-slate-200 text-slate-650' : 'bg-slate-950 border-slate-805 text-slate-350'
                      }`}
                    >
                      {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>

                  <div>
                    <label className={`block text-xs font-semibold ${themeMode === 'light' ? 'text-slate-500' : 'text-slate-400'} uppercase tracking-wider mb-1`}>Kuantiti Stok</label>
                    <input
                      type="number"
                      value={quantity}
                      onChange={(e) => setQuantity(e.target.value)}
                      className={`w-full border focus:border-emerald-505 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500 ${
                        themeMode === 'light' ? 'bg-slate-50 border-slate-205 text-slate-800' : 'bg-slate-950 border-slate-850 text-slate-200'
                      }`}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={`block text-xs font-semibold ${themeMode === 'light' ? 'text-slate-500' : 'text-slate-400'} uppercase tracking-wider mb-1`}>Harga Kos Unit (RM)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={unitPrice}
                      onChange={(e) => setUnitPrice(e.target.value)}
                      className={`w-full border focus:border-emerald-505 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500 ${
                        themeMode === 'light' ? 'bg-slate-50 border-slate-205 text-slate-800' : 'bg-slate-950 border-slate-850 text-slate-200'
                      }`}
                      required
                    />
                  </div>

                  <div>
                    <label className={`block text-xs font-semibold ${themeMode === 'light' ? 'text-slate-500' : 'text-slate-400'} uppercase tracking-wider mb-1`}>Harga Jual Runcit (RM)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={sellingPrice}
                      onChange={(e) => setSellingPrice(e.target.value)}
                      className={`w-full border focus:border-emerald-505 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500 ${
                        themeMode === 'light' ? 'bg-slate-50 border-slate-205 text-slate-800' : 'bg-slate-950 border-slate-850 text-slate-200'
                      }`}
                      required
                    />
                  </div>
                </div>

                {/* Real-time price check notification popup inside editor drawer */}
                {kpdnCeiling !== null && (
                  <div className={`p-3 rounded-xl border text-xs flex gap-2.5 leading-relaxed items-start ${
                    parseFloat(sellingPrice) > kpdnCeiling
                      ? `${themeMode === 'light' ? 'bg-red-50 border-red-200 text-red-750 font-medium' : 'bg-red-955/40 border-red-900/60 text-red-300'}`
                      : `${themeMode === 'light' ? 'bg-emerald-50 border-emerald-250 text-emerald-805 font-medium' : 'bg-emerald-955/30 border-emerald-900/60 text-emerald-305'}`
                  }`}>
                    <AlertTriangle className={`h-5 w-5 shrink-0 mt-0.5 ${
                      parseFloat(sellingPrice) > kpdnCeiling ? 'text-red-500 animate-pulse' : 'text-emerald-500'
                    }`} />
                    <div>
                      <span className="font-bold">{t.kpdnTitle} Check:</span>
                      <p>
                        {parseFloat(sellingPrice) > kpdnCeiling
                          ? `Haram! Harga jualan RM ${parseFloat(sellingPrice).toFixed(2)} melebihi had harga siling KPDN (RM ${kpdnCeiling.toFixed(2)}) untuk barangan terkawal ini!`
                          : `Harga patuh! Harga jualan berada di dalam lingkungan harga siling kawalan (Maksimum RM ${kpdnCeiling.toFixed(2)}).`
                        }
                      </p>
                    </div>
                  </div>
                )}

                <div>
                  <label className={`block text-xs font-semibold ${themeMode === 'light' ? 'text-slate-500' : 'text-slate-400'} uppercase tracking-wider mb-1`}>Tarikh Tamat Tempoh / Expiry Date</label>
                  <input
                    type="date"
                    value={expiryDate}
                    onChange={(e) => setExpiryDate(e.target.value)}
                    className={`w-full border focus:border-emerald-505 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500 ${
                      themeMode === 'light' ? 'bg-slate-50 border-slate-205 text-slate-800' : 'bg-slate-950 border-slate-850 text-slate-200'
                    }`}
                    required
                  />
                </div>

                <div>
                  <label className={`block text-xs font-semibold ${themeMode === 'light' ? 'text-slate-500' : 'text-slate-400'} uppercase tracking-wider mb-1`}>Nama Pembekal (Supplier)</label>
                  <input
                    type="text"
                    value={supplier}
                    onChange={(e) => setSupplier(e.target.value)}
                    placeholder="Contoh: Milo Distributors Sdn Bhd"
                    className={`w-full border focus:border-emerald-505 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500 ${
                      themeMode === 'light' ? 'bg-slate-50 border-slate-205 text-slate-800' : 'bg-slate-950 border-slate-850 text-slate-200'
                    }`}
                  />
                </div>

                <div>
                  <label className={`block text-xs font-semibold ${themeMode === 'light' ? 'text-slate-500' : 'text-slate-400'} uppercase tracking-wider mb-1`}>Catatan Tambahan</label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Contoh: Simpan di rak baris tengah"
                    className={`w-full border focus:border-emerald-505 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500 h-16 ${
                      themeMode === 'light' ? 'bg-slate-50 border-slate-205 text-slate-800' : 'bg-slate-950 border-slate-855 text-slate-200'
                    }`}
                  />
                </div>
              </form>
            </div>

            <div className={`mt-8 flex gap-3 border-t pt-4 ${themeMode === 'light' ? 'border-slate-100' : 'border-slate-850'}`}>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className={`flex-1 py-3 font-bold rounded-xl text-xs sm:text-sm cursor-pointer select-none transition-colors ${
                  themeMode === 'light' 
                    ? 'bg-slate-105 hover:bg-slate-200 border border-slate-200 text-slate-700' 
                    : 'bg-slate-800 hover:bg-slate-755 border border-slate-700 text-slate-300'
                }`}
              >
                {t.cancel}
              </button>
              <button
                type="submit"
                form="drawer-form"
                className="flex-1 py-3 bg-emerald-500 hover:bg-emerald-600 outline-none text-slate-950 font-bold rounded-xl text-xs sm:text-sm cursor-pointer select-none transition-colors"
              >
                {t.save}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
