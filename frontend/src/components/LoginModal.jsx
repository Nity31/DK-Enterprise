import React, { useState } from 'react';
import axios from 'axios';
import { Lock, Key, ShieldCheck, AlertCircle } from 'lucide-react';

export default function LoginModal({ onLoginSuccess }) {
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await axios.post('/api/auth/login', { password });
      if (res.data.token) {
        localStorage.setItem('dk_auth_token', res.data.token);
        axios.defaults.headers.common['Authorization'] = `Bearer ${res.data.token}`;
        onLoginSuccess();
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Invalid Master Password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4">
      <div className="bg-slate-900 text-white rounded-3xl shadow-2xl border border-slate-800 max-w-md w-full p-8 space-y-6">
        {/* Header Branding */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center justify-center p-3 bg-sky-600/20 rounded-2xl border border-sky-500/30">
            <img 
              src="/dk_logo.png" 
              alt="DK Enterprise Logo" 
              className="h-14 w-auto object-contain drop-shadow"
            />
          </div>
          <div>
            <h2 className="text-2xl font-black tracking-tight uppercase">DK Enterprise</h2>
            <p className="text-xs text-sky-400 font-bold mt-0.5">Master Security Lock Screen</p>
          </div>
        </div>

        {/* Security Notice */}
        <div className="bg-slate-800/80 p-3.5 rounded-2xl border border-slate-700 text-xs flex items-center gap-3">
          <ShieldCheck className="w-5 h-5 text-emerald-400 flex-shrink-0" />
          <span className="text-slate-300 font-medium">
            This system is protected with encrypted authentication. Enter your Master Password to access financial records.
          </span>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-3 rounded-xl text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5 flex items-center gap-1.5">
              <Key className="w-4 h-4 text-sky-400" /> Enter Master Password
            </label>
            <input
              type="password"
              required
              autoFocus
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-sky-500 transition font-mono"
              placeholder="••••••••"
            />
            <span className="text-[10px] text-slate-500 mt-1 block">Default Master Password: <strong className="text-sky-400">admin</strong></span>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-sky-600 hover:bg-sky-500 font-bold text-white text-sm rounded-xl transition shadow-lg flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            ) : (
              <>
                <Lock className="w-4 h-4" /> Unlock System Access
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
