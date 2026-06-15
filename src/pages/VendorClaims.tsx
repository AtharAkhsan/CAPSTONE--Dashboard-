import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText,
  DollarSign,
  Clock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Filter,
  RotateCcw,
  Eye,
  ChevronRight,
  Loader2,
  Send,
  PackageCheck,
  ClipboardCheck,
  Search,
  ArrowRight,
  ShieldAlert,
  Package,
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { cn } from '../lib/utils';
import type { ClaimReport, ClaimStatus, NgReport } from '../types';



const formatCurrency = (val: number | null) => {
  if (!val) return 'Rp 0';
  if (val >= 1_000_000) return `Rp ${(val / 1_000_000).toFixed(1)}M`;
  if (val >= 1_000) return `Rp ${(val / 1_000).toFixed(0)}K`;
  return `Rp ${val}`;
};

const formatDate = (d: string | null) => {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
};

interface StatusConfig {
  label: string;
  bg: string;
  icon: React.ReactNode;
  description: string;
}

const STATUS_CONFIG: Record<ClaimStatus, StatusConfig> = {
  draft: { label: 'Draft', bg: 'bg-gray-100 text-gray-700', icon: <FileText size={14} />, description: 'Claim sedang disiapkan oleh admin' },
  submitted: { label: 'New Claim', bg: 'bg-blue-100 text-blue-700', icon: <Send size={14} />, description: 'Claim baru dari admin — perlu ditinjau' },
  under_review: { label: 'Under Review', bg: 'bg-amber-100 text-amber-700', icon: <Search size={14} />, description: 'Sedang dalam pengecekan vendor' },
  accepted: { label: 'Accepted', bg: 'bg-green-100 text-green-700', icon: <CheckCircle2 size={14} />, description: 'Vendor menyetujui claim' },
  rejected: { label: 'Rejected', bg: 'bg-red-100 text-red-700', icon: <XCircle size={14} />, description: 'Vendor menolak claim' },
  replacement_sent: { label: 'Replacement Sent', bg: 'bg-purple-100 text-purple-700', icon: <Package size={14} />, description: 'Barang pengganti sudah dikirim' },
  resolved: { label: 'Resolved', bg: 'bg-emerald-100 text-emerald-700', icon: <PackageCheck size={14} />, description: 'Claim telah selesai' },
};


const VENDOR_TRANSITIONS: Partial<Record<ClaimStatus, { next: ClaimStatus[]; labels: Partial<Record<ClaimStatus, string>> }>> = {
  submitted: {
    next: ['under_review', 'accepted', 'rejected'],
    labels: { under_review: 'Mulai Review', accepted: 'Accept', rejected: 'Reject' },
  },
  under_review: {
    next: ['accepted', 'rejected'],
    labels: { accepted: 'Accept', rejected: 'Reject' },
  },
  accepted: {
    next: ['replacement_sent'],
    labels: { replacement_sent: 'Kirim Pengganti' },
  },
  replacement_sent: {
    next: ['resolved'],
    labels: { resolved: 'Selesaikan Claim' },
  },
};

const TRANSITION_COLORS: Partial<Record<ClaimStatus, string>> = {
  under_review: 'bg-amber-500 hover:bg-amber-600 text-white',
  accepted: 'bg-green-600 hover:bg-green-700 text-white',
  rejected: 'bg-red-600 hover:bg-red-700 text-white',
  replacement_sent: 'bg-purple-600 hover:bg-purple-700 text-white',
  resolved: 'bg-emerald-600 hover:bg-emerald-700 text-white',
};



const WORKFLOW_STEPS: ClaimStatus[] = ['submitted', 'under_review', 'accepted', 'replacement_sent', 'resolved'];

function WorkflowStepper({ currentStatus }: { currentStatus: ClaimStatus }) {
  const isRejected = currentStatus === 'rejected';
  const currentIndex = isRejected ? 2 : WORKFLOW_STEPS.indexOf(currentStatus);

  return (
    <div className="flex items-center gap-1 w-full">
      {WORKFLOW_STEPS.map((step, i) => {
        const config = STATUS_CONFIG[step];
        const isActive = i === currentIndex;
        const isDone = i < currentIndex && !isRejected;
        const isSkipped = isRejected && i >= 2;

        return (
          <React.Fragment key={step}>
            <div
              className={cn(
                "flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all whitespace-nowrap",
                isActive ? config.bg : isDone ? 'bg-emerald-50 text-emerald-600' : isSkipped ? 'bg-red-50 text-red-400 line-through' : 'bg-surface-container-high text-outline'
              )}
            >
              {isDone ? <CheckCircle2 size={12} /> : config.icon}
              <span className="hidden md:inline">{config.label}</span>
            </div>
            {i < WORKFLOW_STEPS.length - 1 && (
              <ChevronRight size={14} className={cn("shrink-0", isDone ? "text-emerald-400" : "text-outline-variant")} />
            )}
          </React.Fragment>
        );
      })}
      {isRejected && (
        <>
          <ChevronRight size={14} className="shrink-0 text-red-300" />
          <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider bg-red-100 text-red-700">
            <XCircle size={12} />
            <span className="hidden md:inline">Rejected</span>
          </div>
        </>
      )}
    </div>
  );
}



export default function VendorClaims() {
  const { userProfile, isInternal, isVendor } = useAuth();
  const [claims, setClaims] = useState<ClaimReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dateStart, setDateStart] = useState('');
  const [dateEnd, setDateEnd] = useState('');


  const [selectedClaim, setSelectedClaim] = useState<ClaimReport | null>(null);
  const [ngReports, setNgReports] = useState<NgReport[]>([]);
  const [loadingNg, setLoadingNg] = useState(false);


  const [actionTarget, setActionTarget] = useState<{ claim: ClaimReport; nextStatus: ClaimStatus } | null>(null);
  const [actionNotes, setActionNotes] = useState('');
  const [actionLoading, setActionLoading] = useState(false);


  const fetchClaims = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('claim_reports')
        .select('*, vendors(name)')
        .order('report_date', { ascending: false });

      if (error) {
        console.error('Error fetching claims:', error);
        return;
      }

      setClaims(
        (data || []).map((r: any) => ({
          ...r,
          vendor_name: r.vendors?.name || 'Unknown',
        }))
      );
    } catch (err) {
      console.error('Claims fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchClaims();
  }, [fetchClaims]);


  const fetchNgReports = useCallback(async (claim: ClaimReport) => {
    setLoadingNg(true);
    try {
      let query = supabase
        .from('ng_reports')
        .select('*, vendors(name)')
        .eq('vendor_id', claim.vendor_id)
        .gte('inspected_at', claim.period_start)
        .lte('inspected_at', claim.period_end + 'T23:59:59')
        .order('inspected_at', { ascending: false });

      const { data, error } = await query;
      if (error) {
        console.error('Error fetching NG reports:', error);
        return;
      }

      setNgReports(
        (data || []).map((r: any) => ({
          ...r,
          vendor_name: r.vendors?.name || 'Unknown',
        }))
      );
    } catch (err) {
      console.error('NG reports fetch error:', err);
    } finally {
      setLoadingNg(false);
    }
  }, []);


  useEffect(() => {
    if (selectedClaim) {
      fetchNgReports(selectedClaim);
    } else {
      setNgReports([]);
    }
  }, [selectedClaim, fetchNgReports]);


  const handleStatusChange = async () => {
    if (!actionTarget) return;
    setActionLoading(true);

    try {
      const updatePayload: any = {
        status: actionTarget.nextStatus,
      };


      if (actionNotes.trim()) {
        const existingNotes = actionTarget.claim.notes || '';
        const timestamp = new Date().toLocaleString('id-ID');
        const vendorNote = `\n[${timestamp} - ${userProfile?.display_name}] ${actionNotes.trim()}`;
        updatePayload.notes = existingNotes + vendorNote;
      }


      if (actionTarget.nextStatus === 'resolved') {
        updatePayload.resolved_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from('claim_reports')
        .update(updatePayload)
        .eq('id', actionTarget.claim.id);

      if (error) {
        console.error('Status update error:', error);
        alert('Gagal mengubah status: ' + error.message);
        return;
      }


      await fetchClaims();


      if (selectedClaim?.id === actionTarget.claim.id) {
        setSelectedClaim(prev => prev ? { ...prev, status: actionTarget.nextStatus, notes: updatePayload.notes || prev.notes } : null);
      }

      setActionTarget(null);
      setActionNotes('');
    } catch (err) {
      console.error('Status change failed:', err);
      alert('Terjadi kesalahan saat mengubah status');
    } finally {
      setActionLoading(false);
    }
  };


  const filteredClaims = useMemo(() => {
    let data = claims;
    if (statusFilter !== 'all') {
      data = data.filter(c => c.status === statusFilter);
    }
    if (dateStart) {
      data = data.filter(c => c.period_end >= dateStart);
    }
    if (dateEnd) {
      data = data.filter(c => c.period_start <= dateEnd);
    }
    return data;
  }, [claims, statusFilter, dateStart, dateEnd]);


  const kpi = useMemo(() => {
    const totalClaims = filteredClaims.length;
    const totalAmount = filteredClaims.reduce((s, c) => s + (c.claim_amount || 0), 0);
    const pendingActions = filteredClaims.filter(c => c.status === 'submitted' || c.status === 'under_review').length;
    const resolvedClaims = filteredClaims.filter(c => c.status === 'resolved').length;
    return { totalClaims, totalAmount, pendingActions, resolvedClaims };
  }, [filteredClaims]);


  const [page, setPage] = useState(1);
  const itemsPerPage = 8;
  const totalPages = Math.ceil(filteredClaims.length / itemsPerPage) || 1;
  const paginatedClaims = filteredClaims.slice((page - 1) * itemsPerPage, page * itemsPerPage);


  useEffect(() => { setPage(1); }, [statusFilter, dateStart, dateEnd]);

  const resetFilters = () => {
    setStatusFilter('all');
    setDateStart('');
    setDateEnd('');
  };


  return (
    <div className="space-y-8">

      <section className="bg-surface-container-lowest rounded-2xl p-6 md:p-8 shadow-sm border border-outline-variant/10 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-full bg-primary/5 -skew-x-12 translate-x-32" />
        <div className="relative z-10">
          <span className="text-[10px] font-bold text-primary uppercase tracking-[0.2em]">Vendor Portal</span>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight mt-1">Claim Reports</h1>
          <p className="text-outline text-sm mt-2 max-w-2xl">
            {isVendor
              ? `Daftar claim yang diajukan oleh admin terhadap ${userProfile?.vendor_name || 'vendor Anda'}. Tinjau dan lakukan tindak lanjut.`
              : 'Monitoring seluruh claim reports yang diajukan ke vendor.'}
          </p>
        </div>
      </section>


      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {[
          { label: 'Total Claims', value: kpi.totalClaims, icon: FileText, color: 'text-primary', bg: 'bg-primary/10' },
          { label: 'Total Amount', value: formatCurrency(kpi.totalAmount), icon: DollarSign, color: 'text-secondary', bg: 'bg-secondary/10' },
          { label: 'Need Action', value: kpi.pendingActions, icon: Clock, color: kpi.pendingActions > 0 ? 'text-amber-600' : 'text-outline', bg: kpi.pendingActions > 0 ? 'bg-amber-50' : 'bg-surface-container' },
          { label: 'Resolved', value: kpi.resolvedClaims, icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50' },
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
              <label className="text-[9px] font-bold text-outline uppercase tracking-widest">Status</label>
              <select
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
                className="w-full bg-surface-container px-3 py-2.5 rounded-xl border border-outline-variant/30 text-xs font-medium focus:ring-2 focus:ring-primary/20 outline-none transition-all cursor-pointer"
              >
                <option value="all">Semua Status</option>
                {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
                  <option key={key} value={key}>{cfg.label}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5 flex-1 min-w-[140px]">
              <label className="text-[9px] font-bold text-outline uppercase tracking-widest">Period Start</label>
              <input
                type="date"
                value={dateStart}
                onChange={e => setDateStart(e.target.value)}
                className="w-full bg-surface-container px-3 py-2.5 rounded-xl border border-outline-variant/30 text-xs font-medium focus:ring-2 focus:ring-primary/20 outline-none transition-all"
              />
            </div>
            <div className="space-y-1.5 flex-1 min-w-[140px]">
              <label className="text-[9px] font-bold text-outline uppercase tracking-widest">Period End</label>
              <input
                type="date"
                value={dateEnd}
                onChange={e => setDateEnd(e.target.value)}
                className="w-full bg-surface-container px-3 py-2.5 rounded-xl border border-outline-variant/30 text-xs font-medium focus:ring-2 focus:ring-primary/20 outline-none transition-all"
              />
            </div>
            <button
              onClick={resetFilters}
              className="flex items-center justify-center gap-1.5 px-4 py-2.5 text-xs font-bold text-outline hover:text-primary hover:bg-primary/5 rounded-xl transition-all shrink-0 h-[38px] border border-transparent hover:border-primary/20"
            >
              <RotateCcw size={14} />
              Reset
            </button>
          </div>
        </div>
      </section>


      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="flex flex-col items-center gap-3">
            <Loader2 size={28} className="text-primary animate-spin" />
            <p className="text-xs text-outline font-medium">Memuat data claim...</p>
          </div>
        </div>
      ) : filteredClaims.length === 0 ? (
        <div className="bg-surface-container-lowest rounded-2xl p-12 shadow-sm border border-outline-variant/10 text-center">
          <ClipboardCheck size={48} className="text-outline-variant mx-auto mb-4" />
          <h3 className="text-lg font-bold text-on-surface">Tidak Ada Claim</h3>
          <p className="text-sm text-outline mt-1">
            {statusFilter !== 'all' ? 'Tidak ada claim dengan filter yang dipilih.' : 'Belum ada claim yang diajukan.'}
          </p>
        </div>
      ) : (
        <section className="bg-surface-container-lowest rounded-2xl shadow-sm border border-outline-variant/10 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-surface-container-high">
                  <th className="px-6 py-4 text-[11px] font-bold text-outline uppercase tracking-wider">Period</th>
                  {isInternal && <th className="px-6 py-4 text-[11px] font-bold text-outline uppercase tracking-wider">Vendor</th>}
                  <th className="px-6 py-4 text-[11px] font-bold text-outline uppercase tracking-wider">Inspected</th>
                  <th className="px-6 py-4 text-[11px] font-bold text-outline uppercase tracking-wider">Total NG</th>
                  <th className="px-6 py-4 text-[11px] font-bold text-outline uppercase tracking-wider">NG Rate</th>
                  <th className="px-6 py-4 text-[11px] font-bold text-outline uppercase tracking-wider text-right">Amount</th>
                  <th className="px-6 py-4 text-[11px] font-bold text-outline uppercase tracking-wider text-center">Status</th>
                  <th className="px-6 py-4 text-[11px] font-bold text-outline uppercase tracking-wider text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/10">
                {paginatedClaims.map((claim) => {
                  const statusCfg = STATUS_CONFIG[claim.status] || STATUS_CONFIG.draft;
                  const transitions = VENDOR_TRANSITIONS[claim.status];

                  return (
                    <tr
                      key={claim.id}
                      className="hover:bg-surface-container-low transition-colors group"
                    >
                      <td className="px-6 py-5">
                        <div className="flex flex-col">
                          <span className="text-sm font-bold">{formatDate(claim.period_start)}</span>
                          <span className="text-[10px] text-outline">— {formatDate(claim.period_end)}</span>
                        </div>
                      </td>
                      {isInternal && (
                        <td className="px-6 py-5 text-sm font-medium">{claim.vendor_name}</td>
                      )}
                      <td className="px-6 py-5 text-sm font-mono">{claim.total_inspected}</td>
                      <td className="px-6 py-5 text-sm font-mono font-bold text-tertiary">{claim.total_ng}</td>
                      <td className="px-6 py-5">
                        <span className={cn(
                          "text-sm font-bold",
                          (claim.ng_rate_pct || 0) > 3 ? "text-tertiary" : "text-primary"
                        )}>
                          {claim.ng_rate_pct?.toFixed(1) || '0.0'}%
                        </span>
                      </td>
                      <td className="px-6 py-5 text-right">
                        <span className="text-sm font-bold">{formatCurrency(claim.claim_amount)}</span>
                        <span className="text-[10px] text-outline block">{claim.currency}</span>
                      </td>
                      <td className="px-6 py-5 text-center">
                        <span className={cn(
                          "inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider",
                          statusCfg.bg
                        )}>
                          {statusCfg.icon}
                          {statusCfg.label}
                        </span>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => setSelectedClaim(claim)}
                            className="p-2 rounded-lg hover:bg-surface-container-high transition-colors text-primary"
                            title="Lihat Detail"
                          >
                            <Eye size={18} />
                          </button>
                          {isVendor && transitions && transitions.next.map(nextStatus => (
                            <button
                              key={nextStatus}
                              onClick={() => setActionTarget({ claim, nextStatus })}
                              className={cn(
                                "px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all active:scale-95",
                                TRANSITION_COLORS[nextStatus] || 'bg-primary text-white'
                              )}
                            >
                              {transitions.labels[nextStatus]}
                            </button>
                          ))}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>


          <div className="px-6 py-4 flex items-center justify-between border-t border-outline-variant/10">
            <p className="text-[11px] font-semibold text-outline uppercase">
              Showing <span className="text-on-surface">{(page - 1) * itemsPerPage + 1}–{Math.min(page * itemsPerPage, filteredClaims.length)}</span> of <span className="text-on-surface">{filteredClaims.length}</span> claims
            </p>
            <div className="flex gap-2">
              <button
                disabled={page === 1}
                onClick={() => setPage(p => Math.max(1, p - 1))}
                className="w-8 h-8 flex items-center justify-center rounded-lg border border-outline-variant/20 text-outline hover:bg-surface-container-low transition-colors disabled:opacity-50"
              >
                <ChevronRight size={16} className="rotate-180" />
              </button>
              <button className="w-8 h-8 flex items-center justify-center rounded-lg bg-primary text-on-primary text-[11px] font-bold">{page}</button>
              <span className="px-2 self-center text-outline text-xs">/</span>
              <button className="w-8 h-8 flex items-center justify-center rounded-lg text-[11px] font-bold text-outline">{totalPages}</button>
              <button
                disabled={page === totalPages}
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                className="w-8 h-8 flex items-center justify-center rounded-lg border border-outline-variant/20 text-outline hover:bg-surface-container-low transition-colors disabled:opacity-50"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </section>
      )}


      <AnimatePresence>
        {selectedClaim && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={() => setSelectedClaim(null)}>
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.2 }}
              className="bg-surface-container-lowest w-full max-w-3xl max-h-[85vh] rounded-2xl shadow-2xl border border-outline-variant/20 overflow-hidden flex flex-col"
              onClick={e => e.stopPropagation()}
            >

              <div className="p-6 md:p-8 border-b border-outline-variant/10 shrink-0">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <span className={cn(
                        "inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider",
                        STATUS_CONFIG[selectedClaim.status]?.bg || 'bg-gray-100 text-gray-700'
                      )}>
                        {STATUS_CONFIG[selectedClaim.status]?.icon}
                        {STATUS_CONFIG[selectedClaim.status]?.label || selectedClaim.status}
                      </span>
                      <span className="text-[10px] text-outline font-medium">
                        {STATUS_CONFIG[selectedClaim.status]?.description}
                      </span>
                    </div>
                    <h2 className="text-xl font-bold">Claim Detail</h2>
                    <p className="text-sm text-outline mt-0.5">
                      {selectedClaim.vendor_name} • {formatDate(selectedClaim.period_start)} — {formatDate(selectedClaim.period_end)}
                    </p>
                  </div>
                  <button
                    onClick={() => setSelectedClaim(null)}
                    className="p-2 hover:bg-surface-container-high rounded-full transition-colors shrink-0"
                  >
                    <XCircle size={20} />
                  </button>
                </div>


                <div className="mt-4">
                  <WorkflowStepper currentStatus={selectedClaim.status} />
                </div>
              </div>


              <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6">

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-surface-container-low p-4 rounded-xl">
                    <p className="text-[10px] text-outline uppercase font-bold tracking-widest">Total Inspected</p>
                    <p className="text-2xl font-extrabold tracking-tighter mt-1">{selectedClaim.total_inspected}</p>
                  </div>
                  <div className="bg-surface-container-low p-4 rounded-xl">
                    <p className="text-[10px] text-outline uppercase font-bold tracking-widest">Total NG</p>
                    <p className="text-2xl font-extrabold tracking-tighter mt-1 text-tertiary">{selectedClaim.total_ng}</p>
                  </div>
                  <div className="bg-surface-container-low p-4 rounded-xl">
                    <p className="text-[10px] text-outline uppercase font-bold tracking-widest">NG Rate</p>
                    <p className={cn("text-2xl font-extrabold tracking-tighter mt-1", (selectedClaim.ng_rate_pct || 0) > 3 ? 'text-tertiary' : 'text-primary')}>
                      {selectedClaim.ng_rate_pct?.toFixed(1) || '0.0'}%
                    </p>
                  </div>
                  <div className="bg-surface-container-low p-4 rounded-xl">
                    <p className="text-[10px] text-outline uppercase font-bold tracking-widest">Claim Amount</p>
                    <p className="text-2xl font-extrabold tracking-tighter mt-1 text-secondary">
                      {formatCurrency(selectedClaim.claim_amount)}
                    </p>
                  </div>
                </div>


                {selectedClaim.notes && (
                  <div className="bg-blue-50 p-4 rounded-xl border border-blue-200">
                    <div className="flex items-center gap-2 mb-2">
                      <FileText size={16} className="text-blue-600" />
                      <h4 className="text-xs font-bold text-blue-700 uppercase tracking-wider">Catatan</h4>
                    </div>
                    <p className="text-sm text-blue-900 whitespace-pre-line leading-relaxed">{selectedClaim.notes}</p>
                  </div>
                )}


                <div>
                  <h4 className="text-sm font-bold uppercase tracking-wider flex items-center gap-2 mb-4">
                    <ShieldAlert size={16} className="text-tertiary" />
                    Detail NG Reports ({ngReports.length})
                  </h4>
                  {loadingNg ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 size={20} className="text-primary animate-spin" />
                    </div>
                  ) : ngReports.length === 0 ? (
                    <p className="text-sm text-outline text-center py-6 bg-surface-container-low rounded-xl">Tidak ada NG reports untuk periode ini</p>
                  ) : (
                    <div className="overflow-x-auto border border-outline-variant/10 rounded-xl">
                      <table className="w-full text-left">
                        <thead>
                          <tr className="bg-surface-container-high">
                            <th className="px-4 py-3 text-[10px] font-bold text-outline uppercase tracking-wider">Inspected At</th>
                            <th className="px-4 py-3 text-[10px] font-bold text-outline uppercase tracking-wider">Part</th>
                            <th className="px-4 py-3 text-[10px] font-bold text-outline uppercase tracking-wider">Fusion Result</th>
                            <th className="px-4 py-3 text-[10px] font-bold text-outline uppercase tracking-wider">NG Category</th>
                            <th className="px-4 py-3 text-[10px] font-bold text-outline uppercase tracking-wider">Weight Dev</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-outline-variant/10">
                          {ngReports.map(ng => (
                            <tr key={ng.id} className="hover:bg-surface-container-low transition-colors">
                              <td className="px-4 py-3 text-xs font-mono text-outline">{formatDate(ng.inspected_at)}</td>
                              <td className="px-4 py-3">
                                <div className="flex flex-col">
                                  <span className="text-xs font-bold">{ng.part_code}</span>
                                  {ng.part_name && <span className="text-[10px] text-outline">{ng.part_name}</span>}
                                </div>
                              </td>
                              <td className="px-4 py-3">
                                <span className="px-2 py-0.5 rounded text-[9px] font-bold uppercase bg-red-100 text-red-700">
                                  {ng.fusion_result.replace(/_/g, ' ')}
                                </span>
                              </td>
                              <td className="px-4 py-3">
                                <span className="px-2 py-0.5 rounded text-[9px] font-bold uppercase bg-amber-100 text-amber-700">
                                  {ng.ng_category.replace(/_/g, ' ')}
                                </span>
                              </td>
                              <td className="px-4 py-3 text-xs font-mono">
                                {ng.weight_deviation_pct !== null ? `${ng.weight_deviation_pct.toFixed(1)}%` : '—'}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>


                {isVendor && VENDOR_TRANSITIONS[selectedClaim.status] && (
                  <div className="bg-surface-container-low p-5 rounded-xl border border-outline-variant/20">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-on-surface mb-3 flex items-center gap-2">
                      <ArrowRight size={14} className="text-primary" />
                      Tindak Lanjut
                    </h4>
                    <p className="text-[11px] text-outline mb-4">
                      Pilih aksi untuk melanjutkan proses claim ini.
                    </p>
                    <div className="flex flex-wrap gap-3">
                      {VENDOR_TRANSITIONS[selectedClaim.status]!.next.map(nextStatus => (
                        <button
                          key={nextStatus}
                          onClick={() => setActionTarget({ claim: selectedClaim, nextStatus })}
                          className={cn(
                            "flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-bold transition-all active:scale-95 shadow-sm",
                            TRANSITION_COLORS[nextStatus] || 'bg-primary text-white'
                          )}
                        >
                          {STATUS_CONFIG[nextStatus]?.icon}
                          {VENDOR_TRANSITIONS[selectedClaim.status]!.labels[nextStatus]}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>


      <AnimatePresence>
        {actionTarget && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4" onClick={() => !actionLoading && setActionTarget(null)}>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.15 }}
              className="bg-surface-container-lowest w-full max-w-md rounded-2xl shadow-2xl border border-outline-variant/20 p-6 md:p-8"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className={cn("p-2.5 rounded-xl", STATUS_CONFIG[actionTarget.nextStatus]?.bg || 'bg-primary/10')}>
                  {STATUS_CONFIG[actionTarget.nextStatus]?.icon || <ArrowRight size={18} />}
                </div>
                <div>
                  <h3 className="text-lg font-bold">Konfirmasi Aksi</h3>
                  <p className="text-xs text-outline">
                    Ubah status ke <strong>{STATUS_CONFIG[actionTarget.nextStatus]?.label}</strong>
                  </p>
                </div>
              </div>

              <div className="bg-surface-container-low p-4 rounded-xl mb-4 text-sm text-outline">
                <p>{STATUS_CONFIG[actionTarget.nextStatus]?.description}</p>
                <div className="mt-2 pt-2 border-t border-outline-variant/10 text-xs">
                  <span className="font-bold text-on-surface">Claim:</span> {actionTarget.claim.vendor_name} • {formatDate(actionTarget.claim.period_start)} — {formatDate(actionTarget.claim.period_end)}
                </div>
              </div>

              <div className="space-y-2 mb-6">
                <label className="text-[10px] font-bold text-outline uppercase tracking-widest">
                  Catatan (Opsional)
                </label>
                <textarea
                  value={actionNotes}
                  onChange={e => setActionNotes(e.target.value)}
                  placeholder="Tambahkan catatan untuk tindak lanjut ini..."
                  className="w-full bg-surface-container px-4 py-3 rounded-xl border border-outline-variant/30 text-sm focus:ring-2 focus:ring-primary/20 outline-none resize-none transition-all"
                  rows={3}
                />
              </div>

              <div className="flex justify-end gap-3">
                <button
                  onClick={() => { setActionTarget(null); setActionNotes(''); }}
                  disabled={actionLoading}
                  className="px-5 py-2.5 rounded-xl font-medium text-sm text-outline hover:bg-surface-container-high transition-colors disabled:opacity-50"
                >
                  Batal
                </button>
                <button
                  onClick={handleStatusChange}
                  disabled={actionLoading}
                  className={cn(
                    "px-5 py-2.5 rounded-xl font-bold text-sm transition-all shadow-sm disabled:opacity-50 flex items-center gap-2 active:scale-95",
                    TRANSITION_COLORS[actionTarget.nextStatus] || 'bg-primary text-white'
                  )}
                >
                  {actionLoading && <Loader2 size={16} className="animate-spin" />}
                  {actionLoading ? 'Memproses...' : 'Konfirmasi'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
