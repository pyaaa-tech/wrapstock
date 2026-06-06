/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { Camera, RefreshCw, CheckSquare, Search, AlertCircle, ScanLine } from 'lucide-react';
import { TRANSLATIONS } from '../utils';

interface BarcodePanelProps {
  language: 'ms' | 'en';
  onBarcodeDetected: (barcode: string) => void;
  onClose?: () => void;
  themeMode?: 'light' | 'dark';
}

export function BarcodePanel({ language, onBarcodeDetected, onClose, themeMode = 'light' }: BarcodePanelProps) {
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState('');
  const [error, setError] = useState('');
  
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const t = TRANSLATIONS[language];

  // Dummy physical barcode sheet matching Malaysian retail staples to permit instant testing
  const SIMULATED_PRODUCTS = [
    { name: "Gula Pasir Kasar (Pek 1kg)", code: "9556001091101" },
    { name: "Susu Dutch Lady Coklat 1L", code: "9556001091202" },
    { name: "Minyak Masak Pek Polibeg 1kg", code: "9556001091303" },
    { name: "Tepung Gandum sauh 1kg", code: "9556001091404" },
    { name: "Milo Coklat Pek 1kg", code: "9551002091505" }
  ];

  const startCamera = async () => {
    setError('');
    setIsScanning(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } } 
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }

      // Simulate canvas matching to read barcode values or check if detector exists (Chromium only)
      const interval = setInterval(() => {
        if ('BarcodeDetector' in window) {
          // Native barcode reader is supported on modern systems
          const detector = new (window as any).BarcodeDetector({ formats: ['ean_13', 'ean_8', 'upc_a'] });
          if (videoRef.current && videoRef.current.readyState === videoRef.current.HAVE_ENOUGH_DATA) {
            detector.detect(videoRef.current).then((barcodes: any[]) => {
              if (barcodes.length > 0) {
                const code = barcodes[0].rawValue;
                handleSuccess(code);
                clearInterval(interval);
              }
            }).catch((err: any) => console.log(err));
          }
        }
      }, 800);

      return () => clearInterval(interval);
    } catch (err: any) {
      console.warn("Camera streaming is restricted. Using simulated barcode reader instead.");
      setError(t.cameraPermission + " or running inside blocked iframe context. Sandbox selector ready below.");
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsScanning(false);
  };

  useEffect(() => {
    return () => stopCamera();
  }, []);

  const handleSuccess = (code: string) => {
    setScanResult(code);
    stopCamera();
    onBarcodeDetected(code);
    if (onClose) onClose();
  };

  const handleSimulationTrigger = (code: string) => {
    handleSuccess(code);
  };

  return (
    <div className={`border rounded-xl p-6 shadow-sm relative overflow-hidden transition-all duration-250 ${
      themeMode === 'light' ? 'bg-white border-slate-205' : 'bg-slate-900 border-slate-800 shadow-xl'
    }`}>
      <div className={`flex items-center justify-between border-b pb-4 mb-4 ${themeMode === 'light' ? 'border-slate-100' : 'border-slate-700'}`}>
        <div className="flex items-center gap-3">
          <ScanLine className="h-6 w-6 text-emerald-500 animate-pulse" />
          <h3 className={`font-bold text-lg ${themeMode === 'light' ? 'text-slate-805' : 'text-white'}`}>{t.scan}</h3>
        </div>
        {onClose && (
          <button 
            onClick={onClose} 
            className={`text-xs px-2.5 py-1.5 font-semibold rounded-lg ${
              themeMode === 'light' ? 'bg-slate-100 hover:bg-slate-200 text-slate-700' : 'bg-slate-755 hover:bg-slate-700 text-slate-300'
            }`}
          >
            {t.cancel}
          </button>
        )}
      </div>

      {error && (
        <div className={`mb-4 p-3 rounded-xl flex items-start gap-2.5 text-xs border ${
          themeMode === 'light' ? 'bg-amber-50 border-amber-250 text-amber-800' : 'bg-amber-955/40 border-amber-900/60 text-amber-200'
        }`}>
          <AlertCircle className="h-5 w-5 shrink-0 text-amber-600" />
          <div>
            <p className="font-bold">Iframe Camera Intersect Guide:</p>
            <p>{error}</p>
          </div>
        </div>
      )}

      {/* Screen area */}
      <div className={`relative aspect-video rounded-xl border flex flex-col items-center justify-center overflow-hidden h-64 w-full ${
        themeMode === 'light' ? 'bg-slate-100 border-slate-200' : 'bg-slate-950 border-slate-800'
      }`}>
        {isScanning ? (
          <>
            <video ref={videoRef} className="absolute inset-0 w-full h-full object-cover" playsInline />
            {/* Guide overlay */}
            <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-4 bg-black/30">
              <div className="flex justify-between">
                <div className="w-6 h-6 border-t-2 border-l-2 border-emerald-400" />
                <div className="w-6 h-6 border-t-2 border-r-2 border-emerald-400" />
              </div>
              <div className="w-full h-0.5 bg-emerald-400/80 animate-bounce" />
              <div className="flex justify-between">
                <div className="w-6 h-6 border-b-2 border-l-2 border-emerald-400" />
                <div className="w-6 h-6 border-b-2 border-r-2 border-emerald-400" />
              </div>
            </div>
          </>
        ) : (
          <div className="text-center p-6 flex flex-col items-center">
            <div className={`h-16 w-16 rounded-full flex items-center justify-center border mb-4 animate-pulse ${
              themeMode === 'light' ? 'bg-slate-50 border-slate-150' : 'bg-slate-800 border-slate-705'
            }`}>
              <Camera className="h-8 w-8 text-slate-400" />
            </div>
            <p className={`text-xs max-w-sm font-semibold ${themeMode === 'light' ? 'text-slate-505' : 'text-slate-400'}`}>
              Press the button below to turn on WebRTC camera streams and point at standard retail codes such as UPC/EAN.
            </p>
          </div>
        )}
      </div>

      <div className="mt-4 flex gap-3">
        {!isScanning ? (
          <button
            onClick={startCamera}
            className="flex-1 py-3 bg-emerald-500 hover:bg-emerald-600 font-bold text-slate-950 rounded-xl text-sm flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-sm"
          >
            <Camera className="h-4 w-4" />
            {t.startScan}
          </button>
        ) : (
          <button
            onClick={stopCamera}
            className="flex-1 py-3 bg-red-650 hover:bg-red-700 font-bold text-white rounded-xl text-sm flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <RefreshCw className="h-4 w-4 animate-spin" />
            {t.stopScan}
          </button>
        )}
      </div>

      {/* Dynamic Sandbox Simulator */}
      <div className={`mt-6 border-t pt-4 ${themeMode === 'light' ? 'border-slate-100' : 'border-slate-700/60'}`}>
        <h4 className={`text-xs font-bold uppercase tracking-wider mb-2 ${themeMode === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>Simulated Barcodes (Click to Scan Instantly)</h4>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {SIMULATED_PRODUCTS.map((prod) => (
            <button
              key={prod.code}
              onClick={() => handleSimulationTrigger(prod.code)}
              className={`p-2.5 text-left border rounded-xl text-[11px] truncate flex flex-col justify-between gap-1 transition-all cursor-pointer ${
                themeMode === 'light' 
                  ? 'bg-slate-50 hover:bg-slate-100 text-slate-705 border-slate-200' 
                  : 'bg-slate-850 hover:bg-slate-800 text-slate-300 border-slate-705'
              }`}
            >
              <span className={`font-bold truncate ${themeMode === 'light' ? 'text-slate-900' : 'text-white'}`}>{prod.name}</span>
              <span className="font-mono text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">{prod.code}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
