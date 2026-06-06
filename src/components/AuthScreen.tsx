/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { LogIn, UserPlus, Shield, User, Globe, AlertCircle } from 'lucide-react';
import { auth, isUsingMockSandbox } from '../firebase/config';
import { signInWithPopup, GoogleAuthProvider, signOut } from 'firebase/auth';
import { dbService } from '../firebase/dbService';
import { UserRole } from '../types';

interface AuthScreenProps {
  onAuthSuccess: (uid: string, role: UserRole) => void;
  language: 'ms' | 'en';
  themeMode?: 'light' | 'dark';
}

export function AuthScreen({ onAuthSuccess, language, themeMode = 'light' }: AuthScreenProps) {
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [email, setEmail] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [selectedRole, setSelectedRole] = useState<UserRole>(UserRole.STAFF);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const provider = new GoogleAuthProvider();

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError('');
    try {
      if (isUsingMockSandbox) {
        // Mock success with Google
        const mockUid = 'google_sandbox_user_99';
        await dbService.createUserProfile(mockUid, {
          email: 'koperasi_staff@gmail.com',
          displayName: 'Nur Farhana (Coop Staff)',
          role: selectedRole,
        });
        onAuthSuccess(mockUid, selectedRole);
        return;
      }

      const result = await signInWithPopup(auth, provider);
      if (result.user) {
        let profile = await dbService.getCurrentUserProfile(result.user.uid);
        if (!profile) {
          // Auto create role
          await dbService.createUserProfile(result.user.uid, {
            email: result.user.email || '',
            displayName: result.user.displayName || 'Ahli Koperasi',
            role: selectedRole
          });
          profile = {
            uid: result.user.uid,
            email: result.user.email || '',
            displayName: result.user.displayName || 'Ahli Koperasi',
            role: selectedRole,
            createdAt: new Date().toISOString(),
            lastActive: new Date().toISOString()
          };
        }
        onAuthSuccess(result.user.uid, profile.role);
      }
    } catch (err: any) {
      console.error(err);
      setError(err?.message || 'Login failed. Please connect Firebase properly.');
    } finally {
      setLoading(false);
    }
  };

  // Quick sandbox bypass login for testing roles rapidly
  const handleSandboxDemo = (role: UserRole) => {
    setLoading(true);
    setTimeout(() => {
      const mockUid = role === UserRole.ADMIN ? 'mock_admin_111' : 'mock_staff_222';
      const name = role === UserRole.ADMIN ? 'Ahmad Sazali (Coop Admin)' : 'Siti Norhaliza (Coop Staff)';
      const emailAddr = role === UserRole.ADMIN ? 'admin@koperasi.my' : 'staff@koperasi.my';
      
      dbService.createUserProfile(mockUid, {
        email: emailAddr,
        displayName: name,
        role: role
      }).then(() => {
        onAuthSuccess(mockUid, role);
      }).catch(err => setError(String(err)))
        .finally(() => setLoading(false));
    }, 400);
  };

  const strings = {
    ms: {
      title: "Pendaftaran WrapStock",
      subtitle: "Urus stok barangan runcit dan patuhi harga siling KPDN dalam satu aplikasi pintar.",
      testAsAdmin: "Teroka sebagai Admin (Kuasa Penuh)",
      testAsStaff: "Teroka sebagai Staff (Imbas & Kemaskini)",
      selectRole: "Pilih Peranan Anda:",
      googleBtn: "Mulakan dengan Log Masuk Google",
      sandboxBtn: "Log Masuk Mock Sandbox (Pintas Cloud)",
      secRulesDesc: "WrapStock dilengkapi kawalan pintu keselamatan Firestore yang disahkan kental.",
      termsText: "Aplikasi ini mematuhi Akta Kawalan Harga & Antipencatutan serta garis panduan privasi PDPA."
    },
    en: {
      title: "WrapStock Registration",
      subtitle: "Manage grocery inventory and align with KPDN ceiling price limits in a unified application.",
      testAsAdmin: "Explore as Admin (Full Control)",
      testAsStaff: "Explore as Staff (Scan & Edit Only)",
      selectRole: "Select Your Access Level:",
      googleBtn: "Launch via Google Authentication",
      sandboxBtn: "Launch Demo Sandbox (Bypass Cloud Setup)",
      secRulesDesc: "WrapStock comes hardened with verified Firestore defensive rules.",
      termsText: "Fully compliant with local pricing guidelines and PDPA security laws."
    }
  }[language];

  return (
    <div className={`min-h-screen ${themeMode === 'light' ? 'bg-slate-50' : 'bg-slate-900'} flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 transition-colors duration-250`}>
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-emerald-500 text-slate-900 font-bold mb-4 shadow-lg shadow-emerald-500/20 text-2xl font-mono">
          WS
        </div>
        <h2 className={`text-3xl font-bold tracking-tight ${themeMode === 'light' ? 'text-slate-900 font-bold' : 'text-white'} font-sans`}>
          {strings.title}
        </h2>
        <p className={`mt-2 text-sm ${themeMode === 'light' ? 'text-slate-600' : 'text-slate-400'}`}>
          {strings.subtitle}
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className={`py-8 px-4 shadow-xl border rounded-2xl sm:px-10 transition-all ${
          themeMode === 'light' ? 'bg-white border-slate-205' : 'bg-slate-800 border-slate-700/60'
        }`}>
          {error && (
            <div className={`mb-4 ${themeMode === 'light' ? 'bg-red-50 border-red-200 text-red-700' : 'bg-red-955/40 border-red-900/60 text-red-300'} p-3 rounded-lg text-xs flex items-start gap-2 border`}>
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Role selector BEFORE signing in */}
          <div className="mb-6">
            <label className={`block text-xs font-semibold ${themeMode === 'light' ? 'text-slate-500' : 'text-slate-400'} uppercase tracking-wider mb-2`}>
              {strings.selectRole}
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setSelectedRole(UserRole.STAFF)}
                className={`py-3 px-4 flex flex-col items-center justify-center border rounded-xl text-center transition-all cursor-pointer ${
                  selectedRole === UserRole.STAFF
                    ? `${themeMode === 'light' ? 'border-emerald-500 bg-emerald-50 text-emerald-700 font-bold' : 'border-emerald-500 bg-emerald-950/20 text-emerald-305'}`
                    : `${themeMode === 'light' ? 'border-slate-200 bg-slate-50 text-slate-500 hover:text-slate-700 hover:bg-slate-100' : 'border-slate-700 bg-slate-850 text-slate-400 hover:text-slate-300 hover:border-slate-600'}`
                }`}
              >
                <User className="h-5 w-5 mb-1" />
                <span className="text-xs font-semibold">Staff Cooperatives</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedRole(UserRole.ADMIN)}
                className={`py-3 px-4 flex flex-col items-center justify-center border rounded-xl text-center transition-all cursor-pointer ${
                  selectedRole === UserRole.ADMIN
                    ? `${themeMode === 'light' ? 'border-emerald-500 bg-emerald-50 text-emerald-700 font-bold' : 'border-emerald-500 bg-emerald-950/20 text-emerald-305'}`
                    : `${themeMode === 'light' ? 'border-slate-200 bg-slate-50 text-slate-500 hover:text-slate-700 hover:bg-slate-100' : 'border-slate-700 bg-slate-850 text-slate-400 hover:text-slate-300 hover:border-slate-600'}`
                }`}
              >
                <Shield className="h-5 w-5 mb-1" />
                <span className="text-xs font-semibold">Administrator</span>
              </button>
            </div>
          </div>

          <div className="space-y-4">
            <button
              onClick={handleGoogleLogin}
              disabled={loading}
              className={`w-full flex items-center justify-center py-3 px-4 border rounded-xl shadow-sm text-sm font-medium transition-colors cursor-pointer disabled:opacity-50 ${
                themeMode === 'light' 
                  ? 'border-slate-300 text-slate-700 bg-white hover:bg-slate-50' 
                  : 'border-slate-700 text-slate-200 bg-slate-850 hover:bg-slate-750'
              }`}
            >
              <Globe className="h-5 w-5 mr-3 text-emerald-555" />
              {strings.googleBtn}
            </button>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className={`w-full border-t ${themeMode === 'light' ? 'border-slate-205' : 'border-slate-700'}`} />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className={`${themeMode === 'light' ? 'bg-white text-slate-450' : 'bg-slate-800 text-slate-405'} px-2 font-bold tracking-wide`}>ATAU / OR</span>
              </div>
            </div>

            {/* Direct testing buttons for quick evaluation inside local sandboxes */}
            <div className="space-y-2">
              <button
                onClick={() => handleSandboxDemo(UserRole.STAFF)}
                className="w-full flex items-center justify-center py-2.5 px-4 rounded-xl text-xs font-bold text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-250 transition-colors cursor-pointer"
                disabled={loading}
              >
                ⚡ {strings.testAsStaff}
              </button>
              <button
                onClick={() => handleSandboxDemo(UserRole.ADMIN)}
                className="w-full flex items-center justify-center py-2.5 px-4 rounded-xl text-xs font-bold text-sky-800 bg-sky-50 hover:bg-sky-100 border border-sky-250 transition-colors cursor-pointer"
                disabled={loading}
              >
                ⚡ {strings.testAsAdmin}
              </button>
            </div>
          </div>

          <div className="mt-6 text-center text-slate-450 text-[11px] leading-relaxed">
            <p className="mb-2">🔒 {strings.secRulesDesc}</p>
            <p>{strings.termsText}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
