import { useState, useEffect, useMemo, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import type { VerificationLog, NgReport, ClaimReport, FilterState, AlertItem } from '../types';

interface VendorOption {
  id: string;
  name: string;
}

interface QCData {
  verificationLogs: VerificationLog[];
  ngReports: NgReport[];
  claimReports: ClaimReport[];
  vendors: VendorOption[];
  loading: boolean;
  filters: FilterState;
  setFilters: (filters: FilterState) => void;
  resetFilters: () => void;
  // Computed KPIs
  totalInspections: number;
  totalNG: number;
  ngRate: number;
  totalClaimAmount: number;
  // Chart data
  distributionData: { name: string; value: number; color: string }[];
  trendData: { date: string; avgDiffPct: number }[];
  sensorData: { timestamp: string; ai_count: number; load_cell_count: number; final_count: number }[];
  ngCategoryData: { category: string; count: number }[];
  ngStatusData: { status: string; count: number; color: string }[];
  claimStatusData: { status: string; count: number; amount: number }[];
  vendorNGData: { vendor: string; ngCount: number; ngRate: number }[];
  alerts: AlertItem[];
}

const DEFAULT_FILTERS: FilterState = {
  dateStart: '',
  dateEnd: '',
  vendorId: '',
  partCode: '',
};

const NG_RATE_THRESHOLD = 5;
const PENDING_ALERT_THRESHOLD = 10;
const DIFF_PCT_ANOMALY_THRESHOLD = 10;

export function useQCData(): QCData {
  const { userProfile, isVendor } = useAuth();
  const [verificationLogs, setVerificationLogs] = useState<VerificationLog[]>([]);
  const [ngReports, setNgReports] = useState<NgReport[]>([]);
  const [claimReports, setClaimReports] = useState<ClaimReport[]>([]);
  const [vendors, setVendors] = useState<VendorOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFiltersState] = useState<FilterState>(DEFAULT_FILTERS);

  const setFilters = useCallback((newFilters: FilterState) => {
    setFiltersState(newFilters);
  }, []);

  const resetFilters = useCallback(() => {
    setFiltersState(DEFAULT_FILTERS);
  }, []);

  // Fetch all data
  const userProfileId = userProfile?.id;
  useEffect(() => {
    if (!userProfileId) return;
    
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch verification_logs
        let vQuery = supabase.from('verification_logs').select('*').order('timestamp', { ascending: false });
        const { data: vLogs } = await vQuery;
        setVerificationLogs((vLogs || []) as VerificationLog[]);

        // Fetch ng_reports (RLS handles vendor filtering)
        let ngQuery = supabase.from('ng_reports').select('*, vendors(name)').order('inspected_at', { ascending: false });
        const { data: ngData } = await ngQuery;
        setNgReports(
          (ngData || []).map((r: any) => ({
            ...r,
            vendor_name: r.vendors?.name || 'Unknown',
          }))
        );

        // Fetch claim_reports (RLS handles vendor filtering)
        let claimQuery = supabase.from('claim_reports').select('*, vendors(name)').order('report_date', { ascending: false });
        const { data: claimData } = await claimQuery;
        setClaimReports(
          (claimData || []).map((r: any) => ({
            ...r,
            vendor_name: r.vendors?.name || 'Unknown',
          }))
        );

        // Fetch vendors (for filter dropdown)
        if (!isVendor) {
          const { data: vendorData } = await supabase.from('vendors').select('id, name').order('name');
          // Deduplicate by name
          const uniqueVendors = (vendorData || []).reduce((acc: VendorOption[], v: any) => {
            if (!acc.find(x => x.name === v.name)) acc.push({ id: v.id, name: v.name });
            return acc;
          }, []);
          setVendors(uniqueVendors);
        }
      } catch (err) {
        console.error('QC data fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [userProfileId, isVendor]);

  // Filtered data
  const filteredVerificationLogs = useMemo(() => {
    let data = verificationLogs;
    if (filters.dateStart) {
      data = data.filter(d => d.timestamp >= filters.dateStart);
    }
    if (filters.dateEnd) {
      const end = filters.dateEnd + 'T23:59:59';
      data = data.filter(d => d.timestamp <= end);
    }
    if (filters.partCode) {
      data = data.filter(d => d.part_code === filters.partCode);
    }
    return data;
  }, [verificationLogs, filters]);

  const filteredNgReports = useMemo(() => {
    let data = ngReports;
    if (filters.dateStart) {
      data = data.filter(d => d.inspected_at >= filters.dateStart);
    }
    if (filters.dateEnd) {
      const end = filters.dateEnd + 'T23:59:59';
      data = data.filter(d => d.inspected_at <= end);
    }
    if (filters.vendorId) {
      data = data.filter(d => d.vendor_id === filters.vendorId);
    }
    if (filters.partCode) {
      data = data.filter(d => d.part_code === filters.partCode);
    }
    return data;
  }, [ngReports, filters]);

  const filteredClaimReports = useMemo(() => {
    let data = claimReports;
    if (filters.vendorId) {
      data = data.filter(d => d.vendor_id === filters.vendorId);
    }
    if (filters.dateStart) {
      data = data.filter(d => d.period_end >= filters.dateStart);
    }
    if (filters.dateEnd) {
      data = data.filter(d => d.period_start <= filters.dateEnd);
    }
    return data;
  }, [claimReports, filters]);

  // KPIs
  const totalInspections = filteredVerificationLogs.length;
  const totalNG = filteredNgReports.length;
  const ngRate = totalInspections > 0 ? (totalNG / totalInspections) * 100 : 0;
  const totalClaimAmount = filteredClaimReports.reduce((sum, c) => sum + (c.claim_amount || 0), 0);

  // Distribution data (pie/donut)
  const distributionData = useMemo(() => {
    const okCount = filteredVerificationLogs.filter(v => 
      v.status.includes('VERIFIED') || v.status === 'PASSED' || v.status === 'PASS'
    ).length;
    const ngCount = filteredNgReports.length;
    const claimFiled = filteredNgReports.filter(n => n.status === 'claim_filed').length;
    const resolved = filteredNgReports.filter(n => n.status === 'resolved').length;

    return [
      { name: 'OK', value: okCount, color: '#004ac6' },
      { name: 'Reject', value: ngCount, color: '#ae0010' },
      { name: 'Claim Filed', value: claimFiled, color: '#f59e0b' },
      { name: 'Resolved', value: resolved, color: '#10b981' },
    ];
  }, [filteredVerificationLogs, filteredNgReports]);

  // Trend data (line chart)
  const trendData = useMemo(() => {
    const grouped = filteredVerificationLogs.reduce((acc: Record<string, number[]>, log) => {
      const date = log.timestamp.split('T')[0] || log.timestamp.split(' ')[0];
      if (!acc[date]) acc[date] = [];
      acc[date].push(Math.abs(log.diff_pct));
      return acc;
    }, {});

    return Object.entries(grouped)
      .map(([date, values]: [string, number[]]) => ({
        date,
        avgDiffPct: parseFloat((values.reduce((s: number, v: number) => s + v, 0) / values.length).toFixed(2)),
      }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }, [filteredVerificationLogs]);

  // Sensor comparison data
  const sensorData = useMemo(() => {
    return filteredVerificationLogs.slice(0, 20).map(log => {
      // Convert UTC timestamp to WIB (GMT+7)
      const rawDate = new Date(log.timestamp);
      let timeLabel = '';
      if (!isNaN(rawDate.getTime())) {
        const wib = new Date(rawDate.getTime() + 7 * 60 * 60 * 1000);
        timeLabel = String(wib.getUTCHours()).padStart(2, '0') + ':' + String(wib.getUTCMinutes()).padStart(2, '0');
      } else {
        timeLabel = log.timestamp.split('T')[1]?.substring(0, 5) || log.timestamp.split(' ')[1]?.substring(0, 5) || '';
      }
      return {
        timestamp: timeLabel,
        ai_count: parseFloat(log.ai_count.toFixed(1)),
        load_cell_count: log.load_cell_count,
        final_count: log.final_count,
      };
    }).reverse();
  }, [filteredVerificationLogs]);

  // NG category distribution
  const ngCategoryData = useMemo(() => {
    const counts: Record<string, number> = {};
    filteredNgReports.forEach(ng => {
      counts[ng.ng_category] = (counts[ng.ng_category] || 0) + 1;
    });
    return Object.entries(counts)
      .map(([category, count]) => ({ category, count }))
      .sort((a, b) => b.count - a.count);
  }, [filteredNgReports]);

  // NG status distribution
  const ngStatusData = useMemo(() => {
    const statusColors: Record<string, string> = {
      pending: '#f59e0b',
      reviewed: '#3b82f6',
      claim_filed: '#ef4444',
      resolved: '#10b981',
    };
    const counts: Record<string, number> = {};
    filteredNgReports.forEach(ng => {
      counts[ng.status] = (counts[ng.status] || 0) + 1;
    });
    return Object.entries(counts).map(([status, count]) => ({
      status,
      count,
      color: statusColors[status] || '#6b7280',
    }));
  }, [filteredNgReports]);

  // Claim status overview
  const claimStatusData = useMemo(() => {
    const grouped: Record<string, { count: number; amount: number }> = {};
    filteredClaimReports.forEach(c => {
      if (!grouped[c.status]) grouped[c.status] = { count: 0, amount: 0 };
      grouped[c.status].count += 1;
      grouped[c.status].amount += (c.claim_amount || 0);
    });
    return Object.entries(grouped).map(([status, data]) => ({
      status,
      count: data.count,
      amount: data.amount,
    }));
  }, [filteredClaimReports]);

  // Vendor NG ranking
  const vendorNGData = useMemo(() => {
    const vendorCounts: Record<string, { name: string; ngCount: number }> = {};
    filteredNgReports.forEach(ng => {
      const name = ng.vendor_name || ng.vendor_id;
      if (!vendorCounts[ng.vendor_id]) {
        vendorCounts[ng.vendor_id] = { name, ngCount: 0 };
      }
      vendorCounts[ng.vendor_id].ngCount += 1;
    });

    return Object.values(vendorCounts)
      .map(v => ({
        vendor: v.name,
        ngCount: v.ngCount,
        ngRate: totalInspections > 0 ? (v.ngCount / totalInspections) * 100 : 0,
      }))
      .sort((a, b) => b.ngCount - a.ngCount);
  }, [filteredNgReports, totalInspections]);

  // Alerts
  const alerts = useMemo(() => {
    const items: AlertItem[] = [];

    // NG Rate > threshold
    if (ngRate > NG_RATE_THRESHOLD) {
      items.push({
        id: 'ng-rate-high',
        type: 'warning',
        title: 'Reject Rate Tinggi',
        message: `Reject Rate saat ini ${ngRate.toFixed(1)}% — melebihi threshold ${NG_RATE_THRESHOLD}%`,
        value: `${ngRate.toFixed(1)}%`,
      });
    }

    // Many pending Reject
    const pendingCount = filteredNgReports.filter(n => n.status === 'pending').length;
    if (pendingCount > PENDING_ALERT_THRESHOLD) {
      items.push({
        id: 'pending-high',
        type: 'danger',
        title: 'Banyak Reject Pending',
        message: `${pendingCount} laporan reject masih berstatus pending — segera tindak lanjuti`,
        value: `${pendingCount}`,
      });
    }

    // Diff pct anomaly
    const recentLogs = filteredVerificationLogs.slice(0, 10);
    const highDiffLogs = recentLogs.filter(l => Math.abs(l.diff_pct) > DIFF_PCT_ANOMALY_THRESHOLD);
    if (highDiffLogs.length > 0) {
      items.push({
        id: 'diff-anomaly',
        type: 'anomaly',
        title: 'Anomali Discrepancy Terdeteksi',
        message: `${highDiffLogs.length} inspeksi terbaru memiliki diff_pct > ${DIFF_PCT_ANOMALY_THRESHOLD}%`,
        value: `${highDiffLogs.length} log`,
      });
    }

    // Vendor with highest Reject
    if (vendorNGData.length > 0 && vendorNGData[0].ngCount > 3) {
      items.push({
        id: 'vendor-high-ng',
        type: 'info',
        title: 'Vendor dengan Reject Tertinggi',
        message: `${vendorNGData[0].vendor} memiliki ${vendorNGData[0].ngCount} laporan reject`,
        value: vendorNGData[0].vendor,
      });
    }

    return items;
  }, [ngRate, filteredNgReports, filteredVerificationLogs, vendorNGData]);

  return {
    verificationLogs: filteredVerificationLogs,
    ngReports: filteredNgReports,
    claimReports: filteredClaimReports,
    vendors,
    loading,
    filters,
    setFilters,
    resetFilters,
    totalInspections,
    totalNG,
    ngRate,
    totalClaimAmount,
    distributionData,
    trendData,
    sensorData,
    ngCategoryData,
    ngStatusData,
    claimStatusData,
    vendorNGData,
    alerts,
  };
}
