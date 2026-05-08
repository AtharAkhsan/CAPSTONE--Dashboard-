import React from 'react';
import { motion } from 'framer-motion';
import {
  Activity, XCircle, AlertTriangle, DollarSign, Filter, RotateCcw,
  TrendingUp, PieChart as PieChartIcon, BarChart3, Cpu, FileWarning,
  ShieldAlert, Info, Zap, AlertCircle
} from 'lucide-react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell, Legend
} from 'recharts';
import { useAuth } from '../context/AuthContext';
import { useQCData } from '../hooks/useQCData';
import { cn } from '../lib/utils';

const COLORS = ['#004ac6', '#ae0010', '#f59e0b', '#10b981', '#8b5cf6', '#ec4899'];

const formatCurrency = (val: number) => {
  if (val >= 1_000_000) return `Rp ${(val / 1_000_000).toFixed(1)}M`;
  if (val >= 1_000) return `Rp ${(val / 1_000).toFixed(0)}K`;
  return `Rp ${val}`;
};

const statusColor: Record<string, string> = {
  draft: 'bg-gray-100 text-gray-700',
  submitted: 'bg-blue-100 text-blue-700',
  acknowledged: 'bg-amber-100 text-amber-700',
  resolved: 'bg-green-100 text-green-700',
  disputed: 'bg-red-100 text-red-700',
  pending: 'bg-amber-100 text-amber-700',
  reviewed: 'bg-blue-100 text-blue-700',
  claim_filed: 'bg-red-100 text-red-700',
};

const alertIcon = (type: string) => {
  switch (type) {
    case 'warning': return <AlertTriangle size={18} className="text-amber-500" />;
    case 'danger': return <ShieldAlert size={18} className="text-red-500" />;
    case 'anomaly': return <Zap size={18} className="text-purple-500" />;
    default: return <Info size={18} className="text-blue-500" />;
  }
};

const alertBorder = (type: string) => {
  switch (type) {
    case 'warning': return 'border-l-amber-500 bg-amber-50';
    case 'danger': return 'border-l-red-500 bg-red-50';
    case 'anomaly': return 'border-l-purple-500 bg-purple-50';
    default: return 'border-l-blue-500 bg-blue-50';
  }
};

export default function QCAnalytics() {
  const { isInternal, isVendor, userProfile } = useAuth();
  const qc = useQCData();

  const uniqueParts = Array.from(new Set(qc.verificationLogs.map(l => l.part_code).filter(Boolean)));

  return (
    <div className="space-y-8">
      {/* Header */}
      <section className="bg-surface-container-lowest rounded-2xl p-6 md:p-8 shadow-sm border border-outline-variant/10 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-full bg-primary/5 -skew-x-12 translate-x-32" />
        <div className="relative z-10">
          <span className="text-[10px] font-bold text-primary uppercase tracking-[0.2em]">KPI Dashboard</span>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight mt-1">Quality Control Analytics</h1>
          <p className="text-outline text-sm mt-2 max-w-2xl">
            {isVendor
              ? `Monitoring kualitas untuk ${userProfile?.vendor_name || 'vendor Anda'}`
              : 'Overview performa kualitas seluruh vendor — inspeksi, NG, dan claim monitoring.'
            }
          </p>
        </div>
      </section>

      {/* Filter Bar */}
      <section className="bg-surface-container-lowest rounded-2xl p-4 md:p-6 shadow-sm border border-outline-variant/10">
        <div className="flex flex-col md:flex-row md:items-center gap-4 md:gap-6">
          <div className="flex items-center gap-3 shrink-0">
            <div className="p-2 bg-primary/10 rounded-xl">
              <Filter size={18} className="text-primary" />
            </div>
            <span className="text-[11px] font-bold uppercase tracking-widest text-on-surface">Filters</span>
          </div>
          <div className="h-px w-full md:w-px md:h-12 bg-outline-variant/20 shrink-0" />
          <div className="flex flex-wrap items-end gap-3 flex-1">
            <div className="space-y-1.5 flex-1 min-w-[140px]">
              <label className="text-[9px] font-bold text-outline uppercase tracking-widest">Start Date</label>
              <input
                type="date"
                value={qc.filters.dateStart}
                onChange={e => qc.setFilters({ ...qc.filters, dateStart: e.target.value })}
                className="w-full bg-surface-container px-3 py-2.5 rounded-xl border border-outline-variant/30 text-xs font-medium focus:ring-2 focus:ring-primary/20 outline-none transition-all"
              />
            </div>
            <div className="space-y-1.5 flex-1 min-w-[140px]">
              <label className="text-[9px] font-bold text-outline uppercase tracking-widest">End Date</label>
              <input
                type="date"
                value={qc.filters.dateEnd}
                onChange={e => qc.setFilters({ ...qc.filters, dateEnd: e.target.value })}
                className="w-full bg-surface-container px-3 py-2.5 rounded-xl border border-outline-variant/30 text-xs font-medium focus:ring-2 focus:ring-primary/20 outline-none transition-all"
              />
            </div>
            {isInternal && (
              <div className="space-y-1.5 flex-1 min-w-[160px]">
                <label className="text-[9px] font-bold text-outline uppercase tracking-widest">Vendor</label>
                <select
                  value={qc.filters.vendorId}
                  onChange={e => qc.setFilters({ ...qc.filters, vendorId: e.target.value })}
                  className="w-full bg-surface-container px-3 py-2.5 rounded-xl border border-outline-variant/30 text-xs font-medium focus:ring-2 focus:ring-primary/20 outline-none transition-all cursor-pointer"
                >
                  <option value="">Semua Vendor</option>
                  {qc.vendors.map(v => (
                    <option key={v.id} value={v.id}>{v.name}</option>
                  ))}
                </select>
              </div>
            )}
            <div className="space-y-1.5 flex-1 min-w-[140px]">
              <label className="text-[9px] font-bold text-outline uppercase tracking-widest">Part Code</label>
              <select
                value={qc.filters.partCode}
                onChange={e => qc.setFilters({ ...qc.filters, partCode: e.target.value })}
                className="w-full bg-surface-container px-3 py-2.5 rounded-xl border border-outline-variant/30 text-xs font-medium focus:ring-2 focus:ring-primary/20 outline-none transition-all cursor-pointer"
              >
                <option value="">Semua Part</option>
                {uniqueParts.map(p => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>
            <button
              onClick={qc.resetFilters}
              className="flex items-center justify-center gap-1.5 px-4 py-2.5 text-xs font-bold text-outline hover:text-primary hover:bg-primary/5 rounded-xl transition-all shrink-0 h-[38px] border border-transparent hover:border-primary/20"
            >
              <RotateCcw size={14} />
              Reset
            </button>
          </div>
        </div>
      </section>

      {/* KPI Summary Cards */}
      {qc.loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-3 border-primary/30 border-t-primary rounded-full animate-spin" />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {[
              { label: 'Total Inspeksi', value: qc.totalInspections, icon: Activity, color: 'text-primary', bg: 'bg-primary/10' },
              { label: 'Total NG', value: qc.totalNG, icon: XCircle, color: 'text-tertiary', bg: 'bg-tertiary/10' },
              { label: 'NG Rate', value: `${qc.ngRate.toFixed(1)}%`, icon: AlertTriangle, color: qc.ngRate > 5 ? 'text-tertiary' : 'text-primary', bg: qc.ngRate > 5 ? 'bg-tertiary/10' : 'bg-primary/10' },
              { label: 'Total Claim', value: formatCurrency(qc.totalClaimAmount), icon: DollarSign, color: 'text-secondary', bg: 'bg-secondary/10' },
            ].map((card, i) => (
              <motion.div
                key={card.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="bg-surface-container-lowest rounded-2xl p-5 md:p-6 shadow-sm border border-outline-variant/10 relative overflow-hidden group hover:shadow-md transition-shadow"
              >
                <div className={cn("absolute top-4 right-4 p-2 rounded-xl", card.bg)}>
                  <card.icon size={18} className={card.color} />
                </div>
                <p className="text-[10px] text-outline uppercase font-bold tracking-widest">{card.label}</p>
                <p className={cn("text-2xl md:text-3xl font-extrabold tracking-tighter mt-2", card.color)}>
                  {card.value}
                </p>
              </motion.div>
            ))}
          </div>

          {/* Alerts Panel */}
          {qc.alerts.length > 0 && (
            <section className="space-y-3">
              <h3 className="text-sm font-bold uppercase tracking-wider flex items-center gap-2">
                <AlertCircle size={16} className="text-tertiary" />
                Alerts & Insights
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {qc.alerts.map(alert => (
                  <div
                    key={alert.id}
                    className={cn("border-l-4 rounded-xl p-4 flex items-start gap-3", alertBorder(alert.type))}
                  >
                    {alertIcon(alert.type)}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-on-surface">{alert.title}</p>
                      <p className="text-xs text-outline mt-0.5 leading-relaxed">{alert.message}</p>
                    </div>
                    {alert.value && (
                      <span className="text-xs font-bold text-on-surface bg-white/80 px-2 py-1 rounded-lg shrink-0">
                        {alert.value}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Charts Row 1 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Distribution Pie */}
            <div className="bg-surface-container-lowest rounded-2xl p-6 shadow-sm border border-outline-variant/10">
              <h3 className="text-sm font-bold uppercase tracking-wider flex items-center gap-2 mb-6">
                <PieChartIcon size={16} className="text-primary" />
                Distribusi Hasil Inspeksi
              </h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={qc.distributionData.filter(d => d.value > 0)}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={90}
                      paddingAngle={3}
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {qc.distributionData.filter(d => d.value > 0).map((entry, i) => (
                        <Cell key={i} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Trend Discrepancy Line */}
            <div className="bg-surface-container-lowest rounded-2xl p-6 shadow-sm border border-outline-variant/10">
              <h3 className="text-sm font-bold uppercase tracking-wider flex items-center gap-2 mb-6">
                <TrendingUp size={16} className="text-primary" />
                Trend Discrepancy (avg diff_pct)
              </h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={qc.trendData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="date" tick={{ fontSize: 10 }} tickFormatter={d => d.slice(5)} />
                    <YAxis tick={{ fontSize: 10 }} unit="%" />
                    <Tooltip formatter={(val: number) => `${val}%`} />
                    <Line type="monotone" dataKey="avgDiffPct" stroke="#004ac6" strokeWidth={2} dot={{ r: 3 }} activeDot={{ r: 5 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Charts Row 2 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Sensor Comparison (internal only) */}
            {isInternal && (
              <div className="bg-surface-container-lowest rounded-2xl p-6 shadow-sm border border-outline-variant/10">
                <h3 className="text-sm font-bold uppercase tracking-wider flex items-center gap-2 mb-6">
                  <Cpu size={16} className="text-primary" />
                  Sensor Comparison (AI vs Load Cell vs Final)
                </h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={qc.sensorData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis dataKey="timestamp" tick={{ fontSize: 9 }} />
                      <YAxis tick={{ fontSize: 10 }} />
                      <Tooltip />
                      <Legend wrapperStyle={{ fontSize: 11 }} payload={[
                        { value: 'AI Count', type: 'square', color: '#004ac6' },
                        { value: 'Load Cell', type: 'square', color: '#f59e0b' },
                        { value: 'Final Count', type: 'square', color: '#10b981' },
                      ]} />
                      <Bar dataKey="ai_count" fill="#004ac6" name="AI Count" radius={[2, 2, 0, 0]} />
                      <Bar dataKey="load_cell_count" fill="#f59e0b" name="Load Cell" radius={[2, 2, 0, 0]} />
                      <Bar dataKey="final_count" fill="#10b981" name="Final Count" radius={[2, 2, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            {/* NG Category Distribution */}
            <div className="bg-surface-container-lowest rounded-2xl p-6 shadow-sm border border-outline-variant/10">
              <h3 className="text-sm font-bold uppercase tracking-wider flex items-center gap-2 mb-6">
                <BarChart3 size={16} className="text-tertiary" />
                Distribusi Kategori NG
              </h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={qc.ngCategoryData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis type="number" tick={{ fontSize: 10 }} />
                    <YAxis type="category" dataKey="category" tick={{ fontSize: 9 }} width={130} />
                    <Tooltip />
                    <Bar dataKey="count" fill="#ae0010" radius={[0, 4, 4, 0]} name="Jumlah NG">
                      {qc.ngCategoryData.map((_, i) => (
                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Charts Row 3 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* NG Status Stacked */}
            <div className="bg-surface-container-lowest rounded-2xl p-6 shadow-sm border border-outline-variant/10">
              <h3 className="text-sm font-bold uppercase tracking-wider flex items-center gap-2 mb-6">
                <FileWarning size={16} className="text-amber-500" />
                Status Penanganan NG
              </h3>
              <div className="space-y-3 mt-4">
                {qc.ngStatusData.map(item => {
                  const pct = qc.totalNG > 0 ? (item.count / qc.totalNG) * 100 : 0;
                  return (
                    <div key={item.status} className="space-y-1.5">
                      <div className="flex justify-between items-center">
                        <span className={cn("px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase", statusColor[item.status] || 'bg-gray-100 text-gray-600')}>
                          {item.status.replace('_', ' ')}
                        </span>
                        <span className="text-sm font-bold">{item.count} <span className="text-outline font-normal text-xs">({pct.toFixed(0)}%)</span></span>
                      </div>
                      <div className="w-full h-2 bg-surface-container-high rounded-full overflow-hidden">
                        <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, backgroundColor: item.color }} />
                      </div>
                    </div>
                  );
                })}
                {qc.ngStatusData.length === 0 && (
                  <p className="text-sm text-outline text-center py-8">Tidak ada data NG</p>
                )}
              </div>
            </div>

            {/* Claim Monitoring */}
            <div className="bg-surface-container-lowest rounded-2xl p-6 shadow-sm border border-outline-variant/10">
              <h3 className="text-sm font-bold uppercase tracking-wider flex items-center gap-2 mb-6">
                <DollarSign size={16} className="text-secondary" />
                Claim Monitoring
              </h3>
              {qc.claimReports.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="border-b border-outline-variant/10">
                        <th className="pb-3 text-[10px] font-bold text-outline uppercase tracking-wider">Vendor</th>
                        <th className="pb-3 text-[10px] font-bold text-outline uppercase tracking-wider">Period</th>
                        <th className="pb-3 text-[10px] font-bold text-outline uppercase tracking-wider text-right">Amount</th>
                        <th className="pb-3 text-[10px] font-bold text-outline uppercase tracking-wider text-center">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-outline-variant/10">
                      {qc.claimReports.map(c => (
                        <tr key={c.id} className="hover:bg-surface-container-low transition-colors">
                          <td className="py-3 text-xs font-medium">{c.vendor_name}</td>
                          <td className="py-3 text-xs text-outline font-mono">{c.period_start?.slice(5)} — {c.period_end?.slice(5)}</td>
                          <td className="py-3 text-xs font-bold text-right">{formatCurrency(c.claim_amount || 0)}</td>
                          <td className="py-3 text-center">
                            <span className={cn("px-2 py-0.5 rounded-full text-[9px] font-bold uppercase", statusColor[c.status] || 'bg-gray-100')}>
                              {c.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-sm text-outline text-center py-8">Tidak ada data claim</p>
              )}
              {/* Summary */}
              {qc.claimStatusData.length > 0 && (
                <div className="mt-4 pt-4 border-t border-outline-variant/10 flex flex-wrap gap-4">
                  {qc.claimStatusData.map(cs => (
                    <div key={cs.status} className="flex flex-col">
                      <span className="text-[9px] font-bold text-outline uppercase">{cs.status}</span>
                      <span className="text-sm font-bold">{cs.count} claims</span>
                      <span className="text-[10px] text-outline">{formatCurrency(cs.amount)}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Vendor NG Ranking (internal only) */}
          {isInternal && qc.vendorNGData.length > 0 && (
            <section className="bg-surface-container-lowest rounded-2xl p-6 shadow-sm border border-outline-variant/10">
              <h3 className="text-sm font-bold uppercase tracking-wider flex items-center gap-2 mb-6">
                <BarChart3 size={16} className="text-primary" />
                Vendor NG Ranking
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {qc.vendorNGData.map((v, i) => (
                  <div
                    key={v.vendor}
                    className={cn(
                      "p-4 rounded-xl border transition-all",
                      i === 0 ? "border-tertiary/30 bg-tertiary/5" : "border-outline-variant/10 bg-surface-container-low"
                    )}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold truncate mr-2">{v.vendor}</span>
                      {i === 0 && <AlertTriangle size={14} className="text-tertiary shrink-0" />}
                    </div>
                    <p className="text-2xl font-extrabold tracking-tighter">{v.ngCount}</p>
                    <p className="text-[10px] text-outline uppercase font-semibold">NG Reports</p>
                  </div>
                ))}
              </div>
            </section>
          )}
        </>
      )}
    </div>
  );
}
