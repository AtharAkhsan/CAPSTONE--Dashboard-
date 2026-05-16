import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, Eye, EyeOff, AlertCircle, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    setError(null);
    setLoading(true);

    const { error: authError } = await signIn(email, password);
    if (authError) {
      setError(authError);
      setLoading(false);
    } else {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface flex relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/4" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-secondary/5 rounded-full translate-y-1/3 -translate-x-1/4" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] opacity-[0.02]">
          <svg viewBox="0 0 200 200" className="w-full h-full">
            <defs>
              <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                <path d="M 20 0 L 0 0 0 20" fill="none" stroke="currentColor" strokeWidth="0.5" />
              </pattern>
            </defs>
            <rect width="200" height="200" fill="url(#grid)" />
          </svg>
        </div>
      </div>

      {/* Left decorative panel - hidden on mobile */}
      <div className="hidden lg:flex flex-col justify-center flex-1 px-16 relative z-10">
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center">
              <ShieldCheck className="text-white" size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold tracking-tight text-on-surface">
                Precision IQC
              </h1>
              <p className="text-[10px] font-bold text-outline uppercase tracking-[0.2em]">
                Quality Control Dashboard
              </p>
            </div>
          </div>
          <h2 className="text-5xl font-extrabold tracking-tight text-on-surface leading-[1.1] max-w-lg">
            Industrial Quality
            <span className="text-primary"> Monitoring</span> System
          </h2>
          <p className="text-outline mt-6 text-base leading-relaxed max-w-md">
            Real-time KPI tracking, vendor performance analytics, and automated defect classification
            powered by AI sensor fusion.
          </p>
          <div className="mt-12 flex items-center gap-8">
            {[
              { label: 'Active Sensors', value: '24/7' },
              { label: 'AI Accuracy', value: '98.4%' },
              { label: 'Response Time', value: '<1.2s' },
            ].map((stat) => (
              <div key={stat.label} className="flex flex-col">
                <span className="text-2xl font-extrabold text-primary tracking-tighter">
                  {stat.value}
                </span>
                <span className="text-[10px] text-outline font-bold uppercase tracking-widest mt-1">
                  {stat.label}
                </span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Right login panel */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-16 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-3 mb-10 justify-center">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
              <ShieldCheck className="text-white" size={20} />
            </div>
            <div>
              <h1 className="text-xl font-extrabold tracking-tight">Precision IQC</h1>
              <p className="text-[9px] font-bold text-outline uppercase tracking-[0.15em]">
                Quality Control Dashboard
              </p>
            </div>
          </div>

          <div className="bg-surface-container-lowest rounded-2xl p-8 md:p-10 shadow-xl border border-outline-variant/10">
            <div className="mb-8">
              <h3 className="text-2xl font-extrabold tracking-tight">Welcome back</h3>
              <p className="text-outline text-sm mt-2">
                Sign in to access your dashboard
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-outline uppercase tracking-widest">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@company.com"
                  className="w-full bg-surface-container px-4 py-3 rounded-xl border border-outline-variant/30 text-sm text-on-surface placeholder:text-outline-variant focus:ring-2 focus:ring-primary/20 focus:border-primary/40 outline-none transition-all"
                  autoComplete="email"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-outline uppercase tracking-widest">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-surface-container px-4 py-3 pr-12 rounded-xl border border-outline-variant/30 text-sm text-on-surface placeholder:text-outline-variant focus:ring-2 focus:ring-primary/20 focus:border-primary/40 outline-none transition-all"
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-outline hover:text-on-surface transition-colors p-1"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-2 bg-tertiary/10 text-tertiary px-4 py-3 rounded-xl text-xs font-medium border border-tertiary/20"
                >
                  <AlertCircle size={16} />
                  {error}
                </motion.div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 bg-primary text-on-primary font-bold text-sm uppercase tracking-widest rounded-xl hover:bg-primary-container transition-all shadow-lg active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading && <Loader2 size={18} className="animate-spin" />}
                {loading ? 'Signing in...' : 'Sign In'}
              </button>
            </form>

            <div className="mt-8 pt-6 border-t border-outline-variant/10 space-y-3">
              <p className="text-[10px] text-outline text-center uppercase tracking-widest font-bold">
                Demo Credentials
              </p>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setEmail('admin@iqcprecision.com');
                    setPassword('Admin123!');
                  }}
                  className="bg-surface-container hover:bg-surface-container-high px-3 py-2.5 rounded-xl text-left transition-colors border border-outline-variant/10"
                >
                  <span className="text-[10px] text-primary font-bold uppercase tracking-wider block">
                    Admin
                  </span>
                  <span className="text-[10px] text-outline truncate block mt-0.5">
                    admin@iqcprecision.com
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setEmail('vendor@jayapresisi.com');
                    setPassword('Vendor123!');
                  }}
                  className="bg-surface-container hover:bg-surface-container-high px-3 py-2.5 rounded-xl text-left transition-colors border border-outline-variant/10"
                >
                  <span className="text-[10px] text-secondary font-bold uppercase tracking-wider block">
                    Vendor
                  </span>
                  <span className="text-[10px] text-outline truncate block mt-0.5">
                    vendor@jayapresisi.com
                  </span>
                </button>
              </div>
            </div>
          </div>

          <p className="text-center text-[10px] text-outline mt-6 uppercase tracking-widest font-medium">
            © 2026 IQC Precision Systems
          </p>
        </motion.div>
      </div>
    </div>
  );
}
