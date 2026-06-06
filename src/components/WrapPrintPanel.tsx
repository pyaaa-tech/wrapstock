/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { InventoryItem } from '../types';
import { TRANSLATIONS, getDummyBarcodeUrl, getDummyQrCodeUrl } from '../utils';
import { Printer, FileText, CheckSquare, Square } from 'lucide-react';

interface WrapPrintPanelProps {
  language: 'ms' | 'en';
  inventory: InventoryItem[];
  themeMode?: 'light' | 'dark';
}

export function WrapPrintPanel({ language, inventory, themeMode = 'light' }: WrapPrintPanelProps) {
  const [selectedItemIds, setSelectedItemIds] = useState<string[]>([]);
  const t = TRANSLATIONS[language];

  const toggleSelect = (id: string) => {
    if (selectedItemIds.includes(id)) {
      setSelectedItemIds(selectedItemIds.filter(i => i !== id));
    } else {
      setSelectedItemIds([...selectedItemIds, id]);
    }
  };

  const selectAll = () => {
    if (selectedItemIds.length === inventory.length) {
      setSelectedItemIds([]);
    } else {
      setSelectedItemIds(inventory.map(i => i.id || ''));
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const printableItems = inventory.filter(item => selectedItemIds.includes(item.id || ''));

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Settings Panel */}
      <div className={`border rounded-xl p-6 shadow-sm no-print transition-all duration-250 ${
        themeMode === 'light' ? 'bg-white border-slate-205' : 'bg-slate-900 border-slate-800 shadow-xl'
      }`}>
        <h3 className={`text-xl font-bold flex items-center gap-2 ${themeMode === 'light' ? 'text-slate-805' : 'text-white'}`}>
          <Printer className="h-6 w-6 text-emerald-555" />
          {t.printTagsTitle}
        </h3>
        <p className={`text-sm mt-1 ${themeMode === 'light' ? 'text-slate-600' : 'text-slate-400'}`}>
          {t.printTagsSubtitle}
        </p>

        <div className="mt-6 flex flex-wrap gap-3 items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={selectAll}
              className={`py-2 px-3 rounded-lg text-xs font-semibold cursor-pointer select-none border transition-colors ${
                themeMode === 'light' 
                  ? 'bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-700' 
                  : 'bg-slate-700 hover:bg-slate-650 border-slate-600 text-slate-300'
              }`}
            >
              {selectedItemIds.length === inventory.length ? 'Nyahpilih Semua' : 'Pilih Semua Item'}
            </button>
            <span className={`text-xs font-sans font-medium ${themeMode === 'light' ? 'text-slate-555' : 'text-slate-400'}`}>
              {selectedItemIds.length} item bersedia dicetak.
            </span>
          </div>

          <div className="flex gap-2">
            <button
              onClick={handlePrint}
              disabled={printableItems.length === 0}
              className="py-2.5 px-4 bg-emerald-505 hover:bg-emerald-600 active:bg-emerald-700 text-slate-950 font-bold rounded-xl text-sm flex items-center gap-2 transition-transform active:scale-95 disabled:opacity-50 disabled:pointer-events-none cursor-pointer shadow-sm"
            >
              <Printer className="h-4 w-4" />
              {t.print}
            </button>
          </div>
        </div>

        {/* Catalog checklist */}
        <div className={`mt-4 border rounded-xl max-h-48 overflow-y-auto divide-y ${
          themeMode === 'light' ? 'border-slate-150 divide-slate-100' : 'border-slate-750 divide-slate-750/60'
        }`}>
          {inventory.map((item) => {
            const isSelected = selectedItemIds.includes(item.id || '');
            return (
              <div
                key={item.id}
                onClick={() => toggleSelect(item.id || '')}
                className={`p-3 text-xs flex items-center justify-between cursor-pointer select-none transition-colors ${
                  isSelected 
                    ? `${themeMode === 'light' ? 'bg-slate-50 text-slate-900 border-l-4 border-l-emerald-500' : 'bg-slate-755/55 text-white'}` 
                    : `${themeMode === 'light' ? 'hover:bg-slate-50 text-slate-600' : 'hover:bg-slate-755/20 text-slate-400'}`
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`h-4 w-4 border rounded flex items-center justify-center transition-all ${
                    isSelected ? 'border-emerald-500 bg-emerald-500 text-slate-955' : 'border-slate-400'
                  }`}>
                    {isSelected ? <CheckSquare className="h-3.5 w-3.5 stroke-3 text-slate-950" /> : <Square className="h-3.5 w-3.5 text-slate-400" />}
                  </div>
                  <div>
                    <span className={`font-bold ${themeMode === 'light' ? 'text-slate-800' : 'text-white'}`}>{item.name}</span>
                    <span className={`ml-2 font-mono ${themeMode === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>({item.barcode})</span>
                  </div>
                </div>
                <div className="font-mono font-bold text-emerald-650 dark:text-emerald-400">
                  RM {item.sellingPrice.toFixed(2)}
                </div>
              </div>
            );
          })}
          {inventory.length === 0 && (
            <div className={`p-4 text-center text-xs ${themeMode === 'light' ? 'text-slate-505' : 'text-slate-400'}`}>Sila tambahkan produk di bahagian pengurusan stok terlebih dahulu.</div>
          )}
        </div>
      </div>

      {/* Tags grid preview inside web UI */}
      {printableItems.length > 0 ? (
        <div className="space-y-4">
          <h4 className={`text-xs font-bold uppercase tracking-widest no-print ${themeMode === 'light' ? 'text-slate-555' : 'text-slate-400'}`}>{t.preview}</h4>
          
          <div className={`grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 p-6 rounded-2xl border-2 border-dashed print:bg-white print:border-none print:p-0 ${
            themeMode === 'light' ? 'bg-slate-50 border-slate-200' : 'bg-slate-950 border-slate-705/60'
          }`}>
            {printableItems.map((item) => {
              return (
                <div 
                  key={item.id} 
                  className="bg-white border-2 border-dashed border-slate-350 p-6 flex flex-col justify-between h-80 rounded-xl shadow-md text-slate-900 select-none print:shadow-none print:border-black print:rounded-none relative overflow-hidden"
                >
                  {/* Top stamp */}
                  <div className="border-b-2 border-slate-900 pb-2 flex justify-between items-center">
                    <span className="text-[10px] font-bold tracking-widest text-slate-500 uppercase font-sans">KOPERASI COOP PRINT</span>
                    <span className="text-[9px] bg-slate-100 border border-slate-300 font-mono font-semibold text-slate-600 rounded px-1.5 py-0.5">RM SUNDRY</span>
                  </div>

                  {/* Product title */}
                  <div className="my-3 text-center">
                    <h2 className="text-lg font-bold tracking-tight text-slate-950 font-sans line-clamp-2 h-14 select-text">
                      {item.name}
                    </h2>
                  </div>

                  {/* Selling Price */}
                  <div className="bg-slate-50 border border-slate-100 p-2.5 rounded-lg flex items-center justify-between my-2 select-text">
                    <span className="text-xs font-medium text-slate-500 tracking-wider">HARGA RUNCIT:</span>
                    <span className="text-3xl font-extrabold tracking-tighter text-emerald-600 font-mono">
                      RM {item.sellingPrice.toFixed(2)}
                    </span>
                  </div>

                  {/* QR & Barcode bottom row */}
                  <div className="flex items-end justify-between border-t border-slate-200 pt-3 flex-1">
                    {/* Simulated barcode */}
                    <div className="flex flex-col items-center flex-1 max-w-[60%]">
                      <img 
                        src={getDummyBarcodeUrl(item.barcode)} 
                        alt="EAN-13" 
                        referrerPolicy="no-referrer"
                        className="h-8 max-h-10 w-auto object-contain object-left mb-1" 
                      />
                      <span className="font-mono text-[9px] text-slate-600 tracking-widest">{item.barcode}</span>
                    </div>

                    {/* Scanner QR */}
                    <div className="h-14 w-14 shrink-0 flex items-center justify-center p-0.5 border border-slate-250 rounded-lg">
                      <img 
                        src={getDummyQrCodeUrl({ name: item.name, price: item.sellingPrice, barcode: item.barcode })} 
                        alt="QR Shelf Scanner" 
                        referrerPolicy="no-referrer"
                        className="h-full w-full object-contain" 
                      />
                    </div>
                  </div>

                  {/* Perforation guide line (Only printed representing paper tag cut line) */}
                  <div className="absolute top-0 right-0 left-0 h-0.5 border-t border-dashed border-slate-300 print:hidden" />
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className={`p-8 text-center border-2 border-dashed rounded-2xl py-16 no-print ${
          themeMode === 'light' ? 'bg-white border-slate-205 text-slate-500' : 'bg-slate-850/50 border-slate-700 text-slate-400'
        }`}>
          <FileText className="h-10 w-10 mx-auto text-slate-400 mb-3 animate-bounce" />
          <p className="font-bold text-sm">Belum Memilih Tanda Harga</p>
          <p className={`text-xs mt-1 max-w-sm mx-auto ${themeMode === 'light' ? 'text-slate-505' : 'text-slate-500'}`}>
            Gunakan kotak pilihan di atas untuk memilih sekurang-kurangnya satu produk untuk dipaparkan dalam Mod Cetak Label.
          </p>
        </div>
      )}
    </div>
  );
}
