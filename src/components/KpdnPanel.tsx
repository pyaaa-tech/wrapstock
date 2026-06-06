/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { dbService } from '../firebase/dbService';
import { KpdnPrice, InventoryItem, UserRole } from '../types';
import { AlertTriangle, Plus, Trash2, ArrowLeftRight, CheckCircle2, ShieldAlert } from 'lucide-react';
import { TRANSLATIONS } from '../utils';

interface KpdnPanelProps {
  language: 'ms' | 'en';
  userRole: UserRole;
  inventory: InventoryItem[];
  themeMode?: 'light' | 'dark';
}

export function KpdnPanel({ language, userRole, inventory, themeMode = 'light' }: KpdnPanelProps) {
  const [limits, setLimits] = useState<KpdnPrice[]>([]);
  const [product, setProduct] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const t = TRANSLATIONS[language];
  const isAdmin = userRole === UserRole.ADMIN;

  const loadLimits = async () => {
    try {
      const data = await dbService.getKpdnPrices();
      setLimits(data);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadLimits();
  }, [inventory]);

  const handleAddLimit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!product || !maxPrice) return;
    setLoading(true);
    try {
      await dbService.saveKpdnPrice({
        product,
        maxPrice: parseFloat(maxPrice)
      });
      setProduct('');
      setMaxPrice('');
      await loadLimits();
      setMessage(language === 'ms' ? 'Kawalan harga baru berjaya ditambah.' : 'New price ceiling saved successfully.');
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteLimit = async (id: string) => {
    if (!confirm(language === 'ms' ? 'Hapus kawalan harga ini?' : 'Delete this price limit?')) return;
    try {
      await dbService.deleteKpdnPrice(id);
      await loadLimits();
    } catch (err) {
      console.error(err);
    }
  };

  // Helper matching products currently in inventory that violate limits
  const getViolationsList = () => {
    const list: { item: InventoryItem; limit: KpdnPrice }[] = [];
    inventory.forEach(item => {
      limits.forEach(lim => {
        if (
          item.name.toLowerCase().includes(lim.product.toLowerCase()) ||
          lim.product.toLowerCase().includes(item.name.toLowerCase())
        ) {
          if (item.sellingPrice > lim.maxPrice) {
            list.push({ item, limit: lim });
          }
        }
      });
    });
    return list;
  };

  const violations = getViolationsList();

  return (
    <div className="space-y-6 animate-fade-in">
      <div className={`border rounded-xl p-6 shadow-sm transition-all duration-250 ${
        themeMode === 'light' ? 'bg-white border-slate-205' : 'bg-slate-900 border-slate-800 shadow-xl'
      }`}>
        <h3 className={`text-xl font-bold flex items-center gap-2 ${themeMode === 'light' ? 'text-slate-805' : 'text-white'}`}>
          <ShieldAlert className="h-6 w-6 text-red-500 animate-pulse" />
          {t.kpdnTitle}
        </h3>
        <p className={`text-sm mt-1 ${themeMode === 'light' ? 'text-slate-600' : 'text-slate-400'}`}>
          {t.kpdnSubtitle}
        </p>

        {violations.length > 0 && (
          <div className={`mt-4 border rounded-xl p-4 space-y-3 ${
            themeMode === 'light' ? 'bg-red-50 border-red-200 text-red-800' : 'bg-red-955/40 border-red-900/60 text-red-100'
          }`}>
            <h4 className="text-xs font-bold uppercase tracking-widest flex items-center gap-1.5 text-red-700 dark:text-red-300">
              <AlertTriangle className="h-4 w-4 text-red-500 animate-bounce" />
              ⚠ Amaran KPDN: Pelanggaran Harga Siling Telah Dikesan ({violations.length})
            </h4>
            <div className={`divide-y text-xs flex flex-col gap-2 ${themeMode === 'light' ? 'divide-red-200' : 'divide-red-900/40'}`}>
              {violations.map(({ item, limit }, index) => (
                <div key={item.id || index} className="pt-2 flex justify-between items-center">
                  <div>
                    <span className={`font-bold ${themeMode === 'light' ? 'text-slate-900' : 'text-white'}`}>{item.name}</span>
                    <span className={`ml-2 font-mono ${themeMode === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>({item.barcode})</span>
                  </div>
                  <div className="text-right">
                    <span className={`mr-2 line-through ${themeMode === 'light' ? 'text-slate-500' : 'text-slate-350'}`}>Max RM {limit.maxPrice.toFixed(2)}</span>
                    <span className="text-red-650 dark:text-red-400 font-mono font-bold text-sm">RM {item.sellingPrice.toFixed(2)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Limits management form - restricted to Admins */}
        <div className={`border rounded-xl p-6 shadow-sm h-fit transition-all duration-250 ${
          themeMode === 'light' ? 'bg-white border-slate-205' : 'bg-slate-900 border-slate-800 shadow-xl'
        }`}>
          <h4 className={`font-bold mb-4 ${themeMode === 'light' ? 'text-slate-800 font-bold' : 'text-white'}`}>{t.addCeiling}</h4>
          {isAdmin ? (
            <form onSubmit={handleAddLimit} className="space-y-4">
              {message && (
                <div className={`p-3 border text-xs rounded-xl flex items-center gap-2 ${
                  themeMode === 'light' ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-emerald-950/25 border-emerald-900/60 text-emerald-300'
                }`}>
                  <CheckCircle2 className="h-4 w-4" />
                  <span>{message}</span>
                </div>
              )}
              
              <div>
                <label className={`block text-xs font-semibold uppercase tracking-wider mb-1.5 ${themeMode === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>Nama Barangan Terkawal</label>
                <input
                  type="text"
                  value={product}
                  onChange={(e) => setProduct(e.target.value)}
                  placeholder="Contoh: Gula"
                  className={`w-full border focus:border-emerald-505 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500 ${
                    themeMode === 'light' ? 'bg-slate-50 border-slate-200 text-slate-800' : 'bg-slate-950 border-slate-750 text-slate-200'
                  }`}
                  required
                />
              </div>

              <div>
                <label className={`block text-xs font-semibold uppercase tracking-wider mb-1.5 ${themeMode === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>Harga Siling (RM)</label>
                <input
                  type="number"
                  step="0.01"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  placeholder="Contoh: 2.85"
                  className={`w-full border focus:border-emerald-505 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500 ${
                    themeMode === 'light' ? 'bg-slate-50 border-slate-200 text-slate-800' : 'bg-slate-950 border-slate-750 text-slate-200'
                  }`}
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-slate-950 font-bold rounded-xl text-sm transition-colors cursor-pointer shadow-sm"
              >
                {t.save}
              </button>
            </form>
          ) : (
            <div className={`p-4 rounded-xl text-xs flex items-start gap-2 border ${
              themeMode === 'light' ? 'bg-slate-50 border-slate-200 text-slate-550' : 'bg-slate-850 border-slate-750 text-slate-400'
            }`}>
              <AlertTriangle className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
              <span>Hanya pentadbir (Admin) sahaja yang dibenarkan menukar atau menambah had harga siling KPDN di kedai. Peranan staff adalah membaca dan melapor.</span>
            </div>
          )}
        </div>

        {/* Database entries */}
        <div className={`border rounded-xl p-6 shadow-sm transition-all duration-250 ${
          themeMode === 'light' ? 'bg-white border-slate-205' : 'bg-slate-900 border-slate-800 shadow-xl'
        }`}>
          <h4 className={`font-bold mb-4 ${themeMode === 'light' ? 'text-slate-800' : 'text-white'}`}>Senarai Terkawal Rasmi Kedai</h4>
          <div className={`overflow-x-auto rounded-xl border ${themeMode === 'light' ? 'border-slate-150' : 'border-slate-705'}`}>
            <table className="w-full text-left text-xs">
              <thead className={`font-bold tracking-wider uppercase border-b ${
                themeMode === 'light' ? 'bg-slate-50 text-slate-600 border-slate-150' : 'bg-slate-750 text-slate-300 border-slate-700'
              }`}>
                <tr>
                  <th className="px-4 py-3">Nama Produk Terkawal</th>
                  <th className="px-4 py-3">{t.ceilingPrice}</th>
                  {isAdmin && <th className="px-4 py-3 text-right">Tindakan</th>}
                </tr>
              </thead>
              <tbody className={`divide-y ${themeMode === 'light' ? 'divide-slate-100 text-slate-700' : 'divide-slate-700/60 text-slate-305'}`}>
                {limits.map((l) => {
                  return (
                    <tr key={l.id} className={`transition-all ${themeMode === 'light' ? 'hover:bg-slate-50/50' : 'hover:bg-slate-750/30'}`}>
                      <td className={`px-4 py-3.5 font-bold ${themeMode === 'light' ? 'text-slate-900' : 'text-white'}`}>{l.product}</td>
                      <td className="px-4 py-3.5 font-mono font-semibold text-emerald-650 dark:text-emerald-400">RM {l.maxPrice.toFixed(2)}</td>
                      {isAdmin && (
                        <td className="px-4 py-3.5 text-right">
                          <button
                            onClick={() => handleDeleteLimit(l.id || '')}
                            className={`p-1 rounded-lg transition-colors cursor-pointer ${
                              themeMode === 'light' ? 'bg-red-50 hover:bg-red-100 text-red-700' : 'bg-red-950/20 hover:bg-red-950/60 text-red-405'
                            }`}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </td>
                      )}
                    </tr>
                  )
                })}
                {limits.length === 0 && (
                  <tr>
                    <td colSpan={3} className="text-center py-6 text-slate-500">Tiada item terkawal didaftarkan.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
