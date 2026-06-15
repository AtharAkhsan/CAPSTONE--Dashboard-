import React, { useState, useEffect } from 'react';
import {
  Activity,
  Database,
  AlertCircle,
  Settings,
  BarChart3,
  LogOut,
  Search,
  Download,
  Bell,
  Menu,
  ChevronRight,
  Cpu,
  Weight,
  Video,
  History,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Info,
  Maximize2,
  Filter,
  MoreVertical,
  ArrowRight,
  Gauge,
  Cloud,
  ShieldCheck,
  Save,
  Trash2,
  Edit2,
  Eye,
  Plus,
  Loader2,
  PieChart,
  FileText,
  Send,
  ClipboardList
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from './lib/utils';
import { Page, Part, LogEntry } from './types';
import { supabase } from './lib/supabase';
import { useAuth } from './context/AuthContext';
import LoginPage from './pages/LoginPage';
import QCAnalytics from './pages/QCAnalytics';
import VendorClaims from './pages/VendorClaims';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar
} from 'recharts';



const MOCK_PARTS: Part[] = [];

const MOCK_LOGS: LogEntry[] = [];

const LATENCY_DATA = [
  { time: '60m', val: 40 }, { time: '55m', val: 60 }, { time: '50m', val: 45 },
  { time: '45m', val: 70 }, { time: '40m', val: 90 }, { time: '35m', val: 30 },
  { time: '30m', val: 50 }, { time: '25m', val: 65 }, { time: '20m', val: 80 },
  { time: '15m', val: 55 }, { time: '10m', val: 40 }, { time: '5m', val: 35 },
];



const Sidebar = ({ activePage, setPage, isOpen }: { activePage: Page, setPage: (p: Page) => void, isOpen: boolean }) => {
  const { userProfile, isInternal, signOut } = useAuth();

  const allNavItems = [
    { id: 'qc', label: 'QC Analytics', icon: PieChart, internalOnly: false },
    { id: 'live', label: 'Live Inspection', icon: Activity, internalOnly: true },
    { id: 'master', label: 'Master Data', icon: Database, internalOnly: true },
    { id: 'history', label: 'History', icon: ClipboardList, internalOnly: false },
    { id: 'logs', label: 'Discrepancy Reports', icon: AlertCircle, internalOnly: false },
    { id: 'claims', label: 'Claims', icon: FileText, internalOnly: false },
  ];

  const navItems = allNavItems.filter(item => !item.internalOnly || isInternal);

  const roleBadge = userProfile?.role === 'vendor_viewer'
    ? { label: 'VENDOR', color: 'bg-secondary/10 text-secondary' }
    : { label: userProfile?.role?.toUpperCase() || 'USER', color: 'bg-primary/10 text-primary' };

  return (
    <aside className={cn(
      "w-64 h-screen fixed left-0 top-0 bg-surface-container-low border-r border-outline-variant/30 flex flex-col z-50 transition-transform duration-300 lg:translate-x-0",
      isOpen ? "translate-x-0" : "-translate-x-full"
    )}>
      <div className="p-6 border-b border-outline-variant/10">
        <h2 className="text-xl font-bold tracking-tight">Precision IQC</h2>
        <p className="text-[10px] text-outline uppercase font-bold tracking-widest mt-1">Quality Control Dashboard</p>
      </div>

      <nav className="flex-1 px-3 py-6 space-y-1">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setPage(item.id as Page)}
            className={cn(
              "w-full flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium transition-all duration-200",
              activePage === item.id
                ? "bg-surface-container-high text-primary border-l-4 border-primary"
                : "text-outline hover:bg-surface-container-high/50 hover:text-on-surface"
            )}
          >
            <item.icon size={20} className={activePage === item.id ? "fill-primary/10" : ""} />
            {item.label}
          </button>
        ))}
      </nav>

      <div className="p-4 border-t border-outline-variant/10 space-y-3">
        {userProfile && (
          <div className="px-3 py-2">
            <p className="text-xs font-bold text-on-surface truncate">{userProfile.display_name}</p>
            <p className="text-[10px] text-outline truncate mt-0.5">{userProfile.email}</p>
            <span className={cn("inline-block mt-1.5 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider", roleBadge.color)}>
              {roleBadge.label}
            </span>
          </div>
        )}
        <button
          onClick={signOut}
          className="w-full flex items-center gap-3 px-3 py-2 text-outline hover:text-tertiary text-xs font-medium transition-colors"
        >
          <LogOut size={18} />
          Log Out
        </button>
      </div>
    </aside>
  );
};

const TopBar = ({ title, onMenuClick }: { title: string, onMenuClick: () => void }) => {
  return (
    <header className="h-16 fixed top-0 right-0 left-0 lg:left-64 bg-surface/80 backdrop-blur-md border-b border-outline-variant/30 flex items-center justify-between px-4 md:px-8 z-20">
      <div className="flex items-center gap-4 md:gap-8">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 hover:bg-surface-container-high rounded-lg transition-colors"
        >
          <Menu size={20} />
        </button>
        <span className="text-base md:text-lg font-semibold truncate max-w-[120px] md:max-w-none">IQC Precision</span>
      </div>

      <div className="flex items-center gap-2 md:gap-4">
        <div className="flex items-center gap-1 md:gap-2 ml-1 md:ml-2">
          <button className="p-2 rounded-full text-outline hover:bg-surface-container-high transition-colors">
            <Bell size={20} />
          </button>
          <div className="w-8 h-8 rounded-full bg-surface-container-highest overflow-hidden border border-outline-variant/30 ml-1 md:ml-2">
            <img
              src="https://picsum.photos/seed/engineer/100/100"
              alt="Profile"
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
        </div>
      </div>
    </header>
  );
};



const LiveInspection = ({ logs, setPage }: { logs: LogEntry[], setPage: (p: Page) => void }) => {
  const [telemetry, setTelemetry] = useState({
    partCode: 'SPR-0012',
    partName: 'Spur Gear 2.5g',
    vendor: 'PT. Sejahtera',
    targetQty: 100,
    aiCount: 99,
    weightData: 247.50,
    baseWeight: 2.50,
    decision: 'REJECT',
    status: 'ng',
    discrepancy: -1,
    uptime: '00:00:00'
  });

  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [frameUrl, setFrameUrl] = useState<string>('https://picsum.photos/seed/gears/800/450');

  useEffect(() => {

    const fetchCameraFrame = () => {
      const { data } = supabase.storage.from('camera_snapshots').getPublicUrl('latest_frame.jpg');
      setFrameUrl(`${data.publicUrl}?t=${new Date().getTime()}`);
    };


    fetchCameraFrame();
    const frameInterval = setInterval(fetchCameraFrame, 1500);


    const fetchLatestTelemetry = async () => {
      try {
        const { data, error } = await supabase
          .from('telemetry_logs')
          .select('*')
          .order('timestamp', { ascending: false })
          .limit(1)
          .single();

        if (data && !error) {
          setTelemetry({
            partCode: data.part_code || 'N/A',
            partName: data.part_name || 'N/A',
            vendor: data.vendor || 'N/A',
            targetQty: data.target_qty || 0,
            aiCount: data.ai_count || 0,
            weightData: data.weight_data || 0,
            baseWeight: data.base_weight || 0,
            decision: data.decision || 'UNKNOWN',
            status: data.status || 'unknown',
            discrepancy: data.discrepancy || 0,
            uptime: '00:00:00'
          });
          setLastUpdated(new Date(data.timestamp));
        }
      } catch (err) {
        console.error('Error fetching latest telemetry:', err);
      }
    };

    fetchLatestTelemetry();


    const channel = supabase.channel('telemetry_db_changes')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'telemetry_logs' },
        (payload) => {
          const data = payload.new;
          setTelemetry({
            partCode: data.part_code || 'N/A',
            partName: data.part_name || 'N/A',
            vendor: data.vendor || 'N/A',
            targetQty: data.target_qty || 0,
            aiCount: data.ai_count || 0,
            weightData: data.weight_data || 0,
            baseWeight: data.base_weight || 0,
            decision: data.decision || 'UNKNOWN',
            status: data.status || 'unknown',
            discrepancy: data.discrepancy || 0,
            uptime: '00:00:00'
          });
          setLastUpdated(data.timestamp ? new Date(data.timestamp) : new Date());
        }
      )
      .subscribe();

    return () => {
      clearInterval(frameInterval);
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <div className="space-y-8">

      <section className="bg-surface-container-lowest rounded-2xl p-8 shadow-sm border border-outline-variant/10 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-full bg-primary/5 -skew-x-12 translate-x-32" />
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-end gap-6">
          <div className="space-y-4">
            <div>
              <span className="text-[10px] font-bold text-primary uppercase tracking-[0.2em]">Current Inspection</span>
              <h1 className="text-3xl font-extrabold tracking-tight mt-1">Live Feed: Batch Active</h1>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-12">
              <div>
                <p className="text-[11px] text-outline uppercase font-bold">Part Code</p>
                <p className="text-lg font-bold">{telemetry.partCode}</p>
              </div>
              <div>
                <p className="text-[11px] text-outline uppercase font-bold">Part Name</p>
                <p className="text-lg font-bold">{telemetry.partName}</p>
              </div>
              <div>
                <p className="text-[11px] text-outline uppercase font-bold">Vendor</p>
                <p className="text-lg font-bold">{telemetry.vendor}</p>
              </div>
              <div>
                <p className="text-[11px] text-outline uppercase font-bold">Target Qty</p>
                <p className="text-lg font-bold text-primary">{telemetry.targetQty} pcs</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-[11px] text-outline font-bold uppercase">Last Sync</p>
              <p className="text-xl font-mono font-bold">{lastUpdated.toLocaleTimeString()}</p>
            </div>
            <div className="h-12 w-px bg-outline-variant/30" />
            <span className="flex items-center gap-2 px-3 py-1.5 bg-primary/10 text-primary rounded-full text-xs font-bold uppercase tracking-wider">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              Active Stream
            </span>
          </div>
        </div>
      </section>


      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

        <div className="bg-surface-container-lowest rounded-2xl overflow-hidden shadow-sm border border-outline-variant/10 flex flex-col">
          <div className="p-6 flex justify-between items-center border-b border-outline-variant/10">
            <div className="flex items-center gap-2">
              <Video size={18} className="text-primary" />
              <h3 className="text-sm font-bold uppercase tracking-wider">Live Camera Feed</h3>
            </div>
          </div>
          <div className="relative flex-1 bg-black overflow-hidden min-h-[300px]">
            <img
              src={frameUrl}
              alt="Camera Feed"
              className="absolute inset-0 w-full h-full object-cover opacity-60"
              referrerPolicy="no-referrer"
              onError={(e) => {

                (e.target as HTMLImageElement).src = 'https://picsum.photos/seed/gears/800/450';
              }}
            />
            <div className="absolute inset-0 p-8 flex flex-col justify-between">
              <div className="flex justify-between">
                <div className="w-16 h-16 border-t-4 border-l-4 border-white/40" />
                <div className="w-16 h-16 border-t-4 border-r-4 border-white/40" />
              </div>
              <div className="flex justify-center">
                <div className="bg-black/60 backdrop-blur-md px-6 py-3 rounded-xl border border-white/10 flex items-center gap-4">
                  <span className="text-[10px] font-bold text-white/60 uppercase">AI Visual Count</span>
                  <span className="text-3xl font-mono font-bold text-white">{telemetry.aiCount} pcs</span>
                </div>
              </div>
              <div className="flex justify-between">
                <div className="w-16 h-16 border-b-4 border-l-4 border-white/40" />
                <div className="w-16 h-16 border-b-4 border-r-4 border-white/40" />
              </div>
            </div>
          </div>
        </div>


        <div className="space-y-8">
          <div className="bg-surface-container-lowest p-8 rounded-2xl shadow-sm border border-outline-variant/10 relative overflow-hidden">
            <div className="flex justify-between items-start mb-6">
              <div className="flex items-center gap-2">
                <Weight size={18} className="text-primary" />
                <h3 className="text-sm font-bold uppercase tracking-wider">Live Weight Data</h3>
              </div>
              <span className="px-2 py-1 bg-surface-container text-[10px] font-bold rounded">UNIT: GRAM</span>
            </div>
            <div className="flex items-baseline gap-4">
              <span className="text-6xl font-extrabold tracking-tighter font-mono">{telemetry.weightData.toFixed(2)}</span>
              <span className="text-2xl font-bold text-outline-variant">g</span>
            </div>
            <div className="mt-6 flex items-center gap-3 p-4 bg-surface-container-low rounded-xl">
              <BarChart3 size={20} className="text-primary" />
              <div>
                <p className="text-[10px] text-outline font-bold uppercase">Weight Estimation</p>
                <p className="text-sm font-bold">{Math.round(telemetry.weightData / telemetry.baseWeight)} pcs <span className="text-[10px] font-normal text-outline-variant">({telemetry.baseWeight.toFixed(2)}g base)</span></p>
              </div>
            </div>
          </div>

          <div className={cn(
            "p-8 rounded-2xl shadow-lg relative overflow-hidden text-white transition-colors duration-500",
            (telemetry.decision.toUpperCase() === 'PASS' || telemetry.decision.toUpperCase() === 'PASSED' || telemetry.status.toUpperCase() === 'OK') ? "bg-green-600" : "bg-red-600"
          )}>
            <div className="absolute -right-4 -top-4 w-32 h-32 bg-white/10 rotate-45" />
            <div className="flex justify-between items-center relative z-10 mb-2">
              <h3 className="text-sm font-bold uppercase tracking-widest opacity-80">Final Decision</h3>
              {(telemetry.decision.toUpperCase() === 'PASS' || telemetry.decision.toUpperCase() === 'PASSED' || telemetry.status.toUpperCase() === 'OK') ? <CheckCircle2 size={20} /> : <AlertTriangle size={20} />}
            </div>
            <div className="flex items-center justify-between relative z-10">
              <div>
                <p className="text-7xl font-black tracking-tighter">{telemetry.decision}</p>
                <p className="text-sm font-bold mt-2 uppercase tracking-wide opacity-90">Discrepancy: {telemetry.discrepancy > 0 ? `+${telemetry.discrepancy}` : telemetry.discrepancy} pcs</p>
              </div>
              <div className="text-center">
                <div className="text-5xl font-black opacity-20 tracking-widest leading-none mb-1">{telemetry.status.toUpperCase()}</div>
                <div className="w-16 h-1 mx-auto bg-white/30 rounded-full" />
              </div>
            </div>
          </div>
        </div>
      </div>


      <section className="bg-surface-container-lowest rounded-2xl shadow-sm border border-outline-variant/10 overflow-hidden">
        <div className="px-8 py-6 border-b border-outline-variant/10 flex justify-between items-center">
          <h3 className="text-sm font-bold uppercase tracking-wider flex items-center gap-2">
            <History size={18} className="text-primary" />
            Recent Inspection Logs
          </h3>
          <button onClick={() => setPage('history')} className="text-xs font-bold text-primary flex items-center gap-1 hover:underline">
            View All History
            <ArrowRight size={14} />
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-surface-container-high">
                <th className="px-8 py-4 text-[11px] font-bold text-outline uppercase tracking-wider">ID</th>
                <th className="px-8 py-4 text-[11px] font-bold text-outline uppercase tracking-wider">Timestamp</th>
                <th className="px-8 py-4 text-[11px] font-bold text-outline uppercase tracking-wider">Part Code</th>
                <th className="px-8 py-4 text-[11px] font-bold text-outline uppercase tracking-wider">Target</th>
                <th className="px-8 py-4 text-[11px] font-bold text-outline uppercase tracking-wider">Detected</th>
                <th className="px-8 py-4 text-[11px] font-bold text-outline uppercase tracking-wider">Status</th>
                <th className="px-8 py-4 text-[11px] font-bold text-outline uppercase tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/10">
              {logs.slice(0, 3).map((log, i) => (
                <tr key={log.id} className="hover:bg-surface-container-low transition-colors">
                  <td className="px-8 py-5 text-xs font-mono text-primary font-bold">{logs.length - i}</td>
                  <td className="px-8 py-5 text-sm font-mono text-outline">{log.timestamp.split(' ')[1]}</td>
                  <td className="px-8 py-5 text-sm font-bold">{log.code}</td>
                  <td className="px-8 py-5 text-sm font-medium">{log.target}</td>
                  <td className={cn("px-8 py-5 text-sm font-bold", log.status === 'REJECTED' ? "text-tertiary" : "text-primary")}>{log.actual}</td>
                  <td className="px-8 py-5">
                    <span className={cn(
                      "px-3 py-1 text-[10px] font-bold uppercase rounded-full border",
                      log.status === 'REJECTED'
                        ? "bg-tertiary/10 text-tertiary border-tertiary/20"
                        : "bg-primary/10 text-primary border-primary/20"
                    )}>
                      {log.status === 'REJECTED' ? 'REJECTED' : 'PASSED'}
                    </span>
                  </td>
                  <td className="px-8 py-5">
                    <button className="text-primary hover:scale-110 transition-transform">
                      <Eye size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};

const MasterData = ({ parts, setParts, logs }: { parts: Part[], setParts: React.Dispatch<React.SetStateAction<Part[]>>, logs: LogEntry[] }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPart, setEditingPart] = useState<Part | null>(null);
  const [formData, setFormData] = useState<Partial<Part>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [page, setPage] = useState(1);
  const itemsPerPage = 5;

  const totalParts = parts.length;
  const criticalLogs = logs.filter(l => l.status === 'REJECTED').length;
  const complianceRate = logs.length > 0 ? ((logs.length - criticalLogs) / logs.length * 100).toFixed(1) : '100.0';

  const totalPages = Math.ceil(parts.length / itemsPerPage) || 1;
  const paginatedParts = parts.slice((page - 1) * itemsPerPage, page * itemsPerPage);

  const openForm = (part?: Part) => {
    if (part) {
      setEditingPart(part);
      setFormData(part);
    } else {
      setEditingPart(null);
      setFormData({});
    }
    setIsModalOpen(true);
  };

  const handleDelete = async (code: string) => {
    if (confirm('Are you sure you want to delete this part?')) {
      try {
        await supabase.from('parts').delete().eq('code', code);
        setParts(parts.filter(p => p.code !== code));
      } catch (err) {
        console.error(err);
        alert('Failed to delete part');
      }
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSaving) return;
    setIsSaving(true);
    try {
      const code = formData.code || `NEW-${Math.floor(Math.random() * 1000)}`;
      const weight_target_gram = parseFloat(formData.unitWeight?.replace(/[^\d.]/g, '') || '0');
      const weight_tolerance_gram = parseFloat(formData.tolerance?.replace(/[^\d.]/g, '') || '0');
      const vendorName = formData.vendor || 'Unknown Vendor';


      let vendor_id = '';
      const { data: vExist } = await supabase.from('vendors').select('id').eq('name', vendorName).single();
      if (vExist) vendor_id = vExist.id;
      else {
        const { data: vNew } = await supabase.from('vendors').insert({ name: vendorName, code: 'V-' + Math.floor(Math.random() * 10000) }).select('id').single();
        if (vNew) vendor_id = vNew.id;
      }

      const dbPayload = {
        code,
        name: formData.name,
        weight_target_gram,
        weight_tolerance_gram,
        vendor_id,
        target_qty: formData.target || 0,
        actual_qty: formData.actual || 0
      };

      if (editingPart) {
        await supabase.from('parts').update(dbPayload).eq('code', editingPart.code);
        setParts(parts.map(p => p.code === editingPart.code ? { ...p, ...formData, code } as Part : p));
      } else {
        await supabase.from('parts').insert(dbPayload);
        setParts([{ ...formData, code, actual: formData.actual || 0 } as Part, ...parts]);
      }
      setIsModalOpen(false);
    } catch (err) {
      console.error("Save failed:", err);
      alert("Failed to save part");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-12 bg-surface-container-lowest rounded-2xl p-6 md:p-8 shadow-sm border border-outline-variant/10 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-bl-full -mr-10 -mt-10" />
          <h3 className="text-primary font-bold text-[10px] uppercase tracking-[0.2em] mb-6">Inventory Health Overview</h3>
          <div className="flex flex-wrap items-end gap-6 md:gap-12">
            <div>
              <p className="text-3xl md:text-4xl font-bold tracking-tighter">{totalParts}</p>
              <p className="text-[10px] md:text-[11px] text-outline uppercase font-semibold mt-1">Total Registered Parts</p>
            </div>
            <div>
              <p className="text-3xl md:text-4xl font-bold text-primary tracking-tighter">{complianceRate}%</p>
              <p className="text-[10px] md:text-[11px] text-outline uppercase font-semibold mt-1">QC Compliance Rate</p>
            </div>
            <div>
              <p className="text-3xl md:text-4xl font-bold text-tertiary tracking-tighter">{criticalLogs}</p>
              <p className="text-[10px] md:text-[11px] text-outline uppercase font-semibold mt-1">Critical Discrepancies</p>
            </div>
          </div>
        </div>
      </div>

      <section className="bg-surface-container-lowest rounded-2xl shadow-sm border border-outline-variant/10 overflow-hidden">
        <div className="px-8 py-6 flex justify-between items-center border-b border-outline-variant/10">
          <div className="flex items-center gap-3">
            <Database size={18} className="text-primary" />
            <h2 className="text-sm font-bold uppercase tracking-wider">Active Component Registry</h2>
          </div>
          <div className="flex gap-2">
            <button onClick={() => openForm()} className="flex items-center gap-2 bg-primary text-on-primary px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-primary-container transition-colors">
              <Plus size={16} />
              Add Part
            </button>
            <button className="p-2 hover:bg-surface-container-high rounded-lg text-outline transition-colors">
              <Filter size={18} />
            </button>
            <button className="p-2 hover:bg-surface-container-high rounded-lg text-outline transition-colors">
              <Download size={18} />
            </button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-surface-container-high">
                <th className="px-8 py-4 text-[11px] font-bold text-outline uppercase tracking-wider">Part Code</th>
                <th className="px-8 py-4 text-[11px] font-bold text-outline uppercase tracking-wider">Part Name</th>
                <th className="px-8 py-4 text-[11px] font-bold text-outline uppercase tracking-wider">Target Qty</th>
                <th className="px-8 py-4 text-[11px] font-bold text-outline uppercase tracking-wider">Unit Weight</th>
                <th className="px-8 py-4 text-[11px] font-bold text-outline uppercase tracking-wider">Tolerance</th>
                <th className="px-8 py-4 text-[11px] font-bold text-outline uppercase tracking-wider">Vendor</th>
                <th className="px-8 py-4 text-[11px] font-bold text-outline uppercase tracking-wider text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/10">
              {paginatedParts.map((part) => (
                <tr key={part.code} className="hover:bg-surface-container-low transition-colors group">
                  <td className="px-8 py-5 text-sm font-mono font-bold text-primary">{part.code}</td>
                  <td className="px-8 py-5 text-sm font-semibold">{part.name}</td>
                  <td className="px-8 py-5 text-sm">{part.target} pcs</td>
                  <td className="px-8 py-5 text-sm">{part.unitWeight}</td>
                  <td className="px-8 py-5 text-sm font-mono text-outline">{part.tolerance}</td>
                  <td className="px-8 py-5 text-sm font-medium">{part.vendor}</td>
                  <td className="px-8 py-5 text-center">
                    <div className="flex justify-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => openForm(part)} className="text-outline hover:text-primary"><Edit2 size={18} /></button>
                      <button onClick={() => handleDelete(part.code)} className="text-outline hover:text-tertiary"><Trash2 size={18} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-8 py-5 flex items-center justify-between border-t border-outline-variant/10">
          <p className="text-[11px] font-semibold text-outline uppercase">Showing <span className="text-on-surface">{(page - 1) * itemsPerPage + 1}-{Math.min(page * itemsPerPage, parts.length)}</span> of <span className="text-on-surface">{parts.length}</span> parts</p>
          <div className="flex gap-2">
            <button disabled={page === 1} onClick={() => setPage(p => Math.max(1, p - 1))} className="w-8 h-8 flex items-center justify-center rounded-lg border border-outline-variant/20 text-outline hover:bg-surface-container-low transition-colors disabled:opacity-50">
              <ChevronRight size={16} className="rotate-180" />
            </button>
            <button className="w-8 h-8 flex items-center justify-center rounded-lg bg-primary text-on-primary text-[11px] font-bold">{page}</button>
            <span className="px-2 self-center text-outline text-xs">/</span>
            <button className="w-8 h-8 flex items-center justify-center rounded-lg text-[11px] font-bold text-outline">{totalPages}</button>
            <button disabled={page === totalPages} onClick={() => setPage(p => Math.min(totalPages, p + 1))} className="w-8 h-8 flex items-center justify-center rounded-lg border border-outline-variant/20 text-outline hover:bg-surface-container-low transition-colors disabled:opacity-50">
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </section>


      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-surface-container-lowest w-full max-w-lg rounded-2xl p-6 md:p-8 shadow-2xl border border-outline-variant/20"
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold">{editingPart ? 'Edit Part' : 'Add New Part'}</h2>
                <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-surface-container-high rounded-full"><XCircle size={20} /></button>
              </div>
              <form onSubmit={handleSave} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-outline">Part Code</label>
                    <input required className="w-full bg-surface-container px-3 py-2 rounded-lg border border-outline-variant/30 text-sm text-on-surface" value={formData.code || ''} onChange={e => setFormData({ ...formData, code: e.target.value })} disabled={!!editingPart} />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-outline">Part Name</label>
                    <input required className="w-full bg-surface-container px-3 py-2 rounded-lg border border-outline-variant/30 text-sm text-on-surface" value={formData.name || ''} onChange={e => setFormData({ ...formData, name: e.target.value })} />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-outline">Target Qty</label>
                    <input required type="number" className="w-full bg-surface-container px-3 py-2 rounded-lg border border-outline-variant/30 text-sm text-on-surface" value={formData.target || ''} onChange={e => setFormData({ ...formData, target: parseInt(e.target.value) })} />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-outline">Unit Weight</label>
                    <input required className="w-full bg-surface-container px-3 py-2 rounded-lg border border-outline-variant/30 text-sm text-on-surface" value={formData.unitWeight || ''} onChange={e => setFormData({ ...formData, unitWeight: e.target.value })} placeholder="e.g. 2.5g" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-outline">Tolerance</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-outline font-medium text-sm">±</span>
                      <input required className="w-full bg-surface-container pl-8 pr-3 py-2 rounded-lg border border-outline-variant/30 text-sm text-on-surface" value={formData.tolerance?.replace('±', '').trim() || ''} onChange={e => setFormData({ ...formData, tolerance: e.target.value })} placeholder="e.g. 1g" />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-outline">Vendor</label>
                    <input required className="w-full bg-surface-container px-3 py-2 rounded-lg border border-outline-variant/30 text-sm text-on-surface" value={formData.vendor || ''} onChange={e => setFormData({ ...formData, vendor: e.target.value })} />
                  </div>
                </div>
                <div className="pt-4 flex justify-end gap-3 border-t border-outline-variant/10 mt-6">
                  <button type="button" onClick={() => !isSaving && setIsModalOpen(false)} className="px-4 py-2 rounded-lg font-medium text-sm text-outline hover:bg-surface-container-high transition-colors disabled:opacity-50" disabled={isSaving}>Cancel</button>
                  <button type="submit" className="px-4 py-2 bg-primary text-on-primary rounded-lg font-medium text-sm hover:bg-primary-container transition-colors shadow-sm disabled:opacity-50 flex items-center gap-2" disabled={isSaving}>
                    {isSaving && <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                    {isSaving ? 'Saving...' : 'Save Part'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

const InspectionHistory = ({ logs }: { logs: LogEntry[] }) => {
  const [dateStart, setDateStart] = useState('');
  const [dateEnd, setDateEnd] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(1);
  const itemsPerPage = 10;

  const filteredLogs = React.useMemo(() => {
    let result = logs;
    if (dateStart) {
      result = result.filter(l => l.timestamp >= dateStart);
    }
    if (dateEnd) {
      result = result.filter(l => l.timestamp <= dateEnd + ' 23:59:59');
    }
    if (statusFilter === 'REJECTED') {
      result = result.filter(l => l.status === 'REJECTED');
    } else if (statusFilter === 'PASSED') {
      result = result.filter(l => l.status !== 'REJECTED');
    }
    return result;
  }, [logs, dateStart, dateEnd, statusFilter]);

  const totalPages = Math.ceil(filteredLogs.length / itemsPerPage) || 1;
  const paginatedLogs = filteredLogs.slice((page - 1) * itemsPerPage, page * itemsPerPage);


  useEffect(() => { setPage(1); }, [dateStart, dateEnd, statusFilter]);


  const handleExport = () => {
    const headers = ['ID', 'Timestamp', 'Part Code', 'Part Name', 'Target', 'Detected', 'Sensor Weight', 'Status', 'Vendor'];
    const rows = filteredLogs.map((l) => [
      logs.length - logs.indexOf(l), l.timestamp, l.code, l.name, l.target, l.actual, l.sensorWeight,
      l.status === 'REJECTED' ? 'REJECT' : 'PASS', l.vendor
    ]);
    const csv = [headers.join(','), ...rows.map(r => r.map(v => `"${v}"`).join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `inspection_history_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-8">
      <section className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 md:gap-6">
        <div>
          <h2 className="text-2xl md:text-4xl font-bold tracking-tight">Inspection History</h2>
          <p className="mt-1 md:mt-2 text-outline font-medium text-sm md:text-base">Complete record of all inspection results — both passed and rejected.</p>
        </div>
        <div className="flex flex-wrap items-center gap-3 bg-surface-container-low p-2 rounded-2xl">
          <div className="flex items-center gap-2 bg-surface-container-lowest px-3 py-2 rounded-xl shadow-sm">
            <Activity size={16} className="text-primary" />
            <input
              type="date"
              value={dateStart}
              onChange={e => setDateStart(e.target.value)}
              className="bg-transparent border-none text-sm font-medium focus:ring-0 p-0 w-[120px]"
            />
            <span className="text-outline text-xs">—</span>
            <input
              type="date"
              value={dateEnd}
              onChange={e => setDateEnd(e.target.value)}
              className="bg-transparent border-none text-sm font-medium focus:ring-0 p-0 w-[120px]"
            />
          </div>
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="bg-surface-container-lowest border-none px-4 py-2 rounded-xl shadow-sm text-sm font-medium focus:ring-0 cursor-pointer"
          >
            <option value="all">All Statuses</option>
            <option value="REJECTED">REJECT</option>
            <option value="PASSED">PASS</option>
          </select>
          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2 bg-on-surface text-white rounded-xl text-sm font-semibold hover:bg-on-surface/90 transition-all active:scale-95"
          >
            <Download size={16} />
            Export
          </button>
        </div>
      </section>


      <div className="grid grid-cols-3 gap-3 md:gap-4">
        <div className="bg-surface-container-lowest rounded-2xl p-4 md:p-6 shadow-sm border border-outline-variant/10">
          <p className="text-[9px] md:text-[10px] text-outline uppercase font-bold tracking-widest">Total Inspections</p>
          <p className="text-2xl md:text-3xl font-bold tracking-tighter mt-1">{filteredLogs.length}</p>
        </div>
        <div className="bg-surface-container-lowest rounded-2xl p-4 md:p-6 shadow-sm border border-outline-variant/10">
          <p className="text-[9px] md:text-[10px] text-green-600 uppercase font-bold tracking-widest">Passed</p>
          <p className="text-2xl md:text-3xl font-bold tracking-tighter mt-1 text-green-600">{filteredLogs.filter(l => l.status !== 'REJECTED').length}</p>
        </div>
        <div className="bg-surface-container-lowest rounded-2xl p-4 md:p-6 shadow-sm border border-outline-variant/10">
          <p className="text-[9px] md:text-[10px] text-tertiary uppercase font-bold tracking-widest">Rejected</p>
          <p className="text-2xl md:text-3xl font-bold tracking-tighter mt-1 text-red-600">{filteredLogs.filter(l => l.status === 'REJECTED').length}</p>
        </div>
      </div>


      <section className="w-full bg-surface-container-lowest rounded-2xl overflow-hidden shadow-sm border border-outline-variant/10">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-surface-container-high">
                <th className="px-4 md:px-6 py-4 text-xs font-bold uppercase tracking-widest text-outline">ID</th>
                <th className="px-4 md:px-6 py-4 text-xs font-bold uppercase tracking-widest text-outline hidden md:table-cell">Timestamp</th>
                <th className="px-4 md:px-6 py-4 text-xs font-bold uppercase tracking-widest text-outline">Part Info</th>
                <th className="px-4 md:px-6 py-4 text-xs font-bold uppercase tracking-widest text-outline">Target/Detected</th>
                <th className="px-4 md:px-6 py-4 text-xs font-bold uppercase tracking-widest text-outline">Status</th>
                <th className="px-4 md:px-6 py-4 text-xs font-bold uppercase tracking-widest text-outline hidden lg:table-cell">Vendor</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/10">
              {paginatedLogs.map((log, i) => (
                <tr
                  key={log.id}
                  className="hover:bg-surface-container-low transition-colors"
                >
                  <td className="px-4 md:px-6 py-4 md:py-5 text-xs font-mono text-primary font-bold">{logs.length - logs.indexOf(log)}</td>
                  <td className="px-4 md:px-6 py-4 md:py-5 text-sm font-medium text-outline hidden md:table-cell">{log.timestamp}</td>
                  <td className="px-4 md:px-6 py-4 md:py-5">
                    <div className="flex flex-col">
                      <span className="text-sm font-bold">{log.code}</span>
                      <span className="text-xs text-outline">{log.name}</span>
                    </div>
                  </td>
                  <td className="px-4 md:px-6 py-4 md:py-5">
                    <div className="text-sm font-mono flex items-center gap-2">
                      <span className="text-outline">{log.target}</span>
                      <span className="text-outline">/</span>
                      <span className={cn("font-bold", log.status === 'REJECTED' ? "text-tertiary" : "text-green-600")}>{log.actual}</span>
                    </div>
                  </td>

                  <td className="px-4 md:px-6 py-4 md:py-5">
                    <span className={cn(
                      "px-2 md:px-3 py-1 text-[9px] md:text-[10px] font-bold tracking-widest uppercase rounded",
                      log.status === 'REJECTED' ? "bg-red-600 text-white" : "bg-green-600 text-white"
                    )}>
                      {log.status === 'REJECTED' ? 'REJECT' : 'PASS'}
                    </span>
                  </td>
                  <td className="px-4 md:px-6 py-4 md:py-5 text-sm font-medium text-outline hidden lg:table-cell">{log.vendor}</td>
                </tr>
              ))}
              {paginatedLogs.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-outline text-sm">
                    No inspection records found for the selected filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="px-4 md:px-8 py-4 md:py-5 flex items-center justify-between border-t border-outline-variant/10">
          <p className="text-[10px] md:text-[11px] font-semibold text-outline uppercase">Showing <span className="text-on-surface">{filteredLogs.length > 0 ? (page - 1) * itemsPerPage + 1 : 0}-{Math.min(page * itemsPerPage, filteredLogs.length)}</span> of <span className="text-on-surface">{filteredLogs.length}</span></p>
          <div className="flex gap-1 md:gap-2">
            <button disabled={page === 1} onClick={() => setPage(p => Math.max(1, p - 1))} className="w-7 h-7 md:w-8 md:h-8 flex items-center justify-center rounded-lg border border-outline-variant/20 text-outline hover:bg-surface-container-low transition-colors disabled:opacity-50">
              <ChevronRight size={14} className="rotate-180" />
            </button>
            <button className="w-7 h-7 md:w-8 md:h-8 flex items-center justify-center rounded-lg bg-primary text-on-primary text-[10px] md:text-[11px] font-bold">{page}</button>
            <span className="px-1 md:px-2 self-center text-outline text-xs">/</span>
            <button className="w-7 h-7 md:w-8 md:h-8 flex items-center justify-center rounded-lg text-[10px] md:text-[11px] font-bold text-outline">{totalPages}</button>
            <button disabled={page === totalPages} onClick={() => setPage(p => Math.min(totalPages, p + 1))} className="w-7 h-7 md:w-8 md:h-8 flex items-center justify-center rounded-lg border border-outline-variant/20 text-outline hover:bg-surface-container-low transition-colors disabled:opacity-50">
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

const DiscrepancyLogs = ({ logs, setLogs, claimSentIds, setClaimSentIds }: { logs: LogEntry[], setLogs: React.Dispatch<React.SetStateAction<LogEntry[]>>, claimSentIds: Set<string>, setClaimSentIds: React.Dispatch<React.SetStateAction<Set<string>>> }) => {
  const { isInternal, isVendor, userProfile } = useAuth();
  const [dateStart, setDateStart] = useState('');
  const [dateEnd, setDateEnd] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');


  const [proofLog, setProofLog] = useState<LogEntry | null>(null);




  const [claimLog, setClaimLog] = useState<LogEntry | null>(null);
  const [claimForm, setClaimForm] = useState({
    periodStart: '',
    periodEnd: '',
    claimAmount: '',
    notes: '',
    vendorId: '',
  });
  const [claimSaving, setClaimSaving] = useState(false);


  const [vendorsList, setVendorsList] = useState<{ id: string; name: string }[]>([]);
  useEffect(() => {
    if (isInternal) {
      supabase.from('vendors').select('id, name').order('name').then(({ data }) => {
        if (data) {

          const unique = data.reduce((acc: { id: string; name: string }[], v: any) => {
            if (!acc.find(x => x.name === v.name)) acc.push({ id: v.id, name: v.name });
            return acc;
          }, []);
          setVendorsList(unique);
        }
      });
    }
  }, [isInternal]);


  const filteredLogs = React.useMemo(() => {
    let result = logs.filter(l => l.status === 'REJECTED');
    if (dateStart) {
      result = result.filter(l => l.timestamp >= dateStart);
    }
    if (dateEnd) {
      result = result.filter(l => l.timestamp <= dateEnd + ' 23:59:59');
    }
    return result;
  }, [logs, dateStart, dateEnd]);


  const handleExport = () => {
    const headers = ['ID', 'Timestamp', 'Part Code', 'Part Name', 'Target', 'Detected', 'Sensor Weight', 'Status', 'Vendor'];
    const rows = filteredLogs.map((l) => [
      logs.length - logs.indexOf(l), l.timestamp, l.code, l.name, l.target, l.actual, l.sensorWeight,
      l.status === 'REJECTED' ? 'REJECT' : 'PASS', l.vendor
    ]);
    const csv = [headers.join(','), ...rows.map(r => r.map(v => `"${v}"`).join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `inspection_logs_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };


  const openClaimForm = (log: LogEntry) => {
    const today = new Date().toISOString().split('T')[0];

    const monthStart = today.substring(0, 7) + '-01';
    setClaimForm({
      periodStart: monthStart,
      periodEnd: today,
      claimAmount: '',
      notes: `Discrepancy detected on ${log.code} (${log.name}) — Target: ${log.target}, Detected: ${log.actual}, Status: ${log.status}`,
      vendorId: log.vendor_id || '',
    });
    setClaimLog(log);
  };


  const handleSubmitClaim = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!claimLog || claimSaving) return;
    setClaimSaving(true);

    try {

      let vendorId = claimForm.vendorId || claimLog.vendor_id;
      if (!vendorId && claimLog.vendor && claimLog.vendor !== 'Unknown Vendor') {
        const { data: vendorData } = await supabase
          .from('vendors')
          .select('id')
          .eq('name', claimLog.vendor)
          .limit(1)
          .single();
        vendorId = vendorData?.id;
      }

      if (!vendorId) {
        alert('Silakan pilih vendor terlebih dahulu.');
        setClaimSaving(false);
        return;
      }

      const payload = {
        vendor_id: vendorId,
        period_start: claimForm.periodStart,
        period_end: claimForm.periodEnd,
        status: 'submitted',
        total_inspected: claimLog.target,
        total_ng: Math.abs(claimLog.actual - claimLog.target),
        ng_rate_pct: claimLog.target > 0 ? Math.abs((claimLog.actual - claimLog.target) / claimLog.target * 100) : 0,
        claim_amount: claimForm.claimAmount ? parseFloat(claimForm.claimAmount) : null,
        notes: claimForm.notes || null,
        report_url: claimLog.proofUrl || null,
        supporting_docs_urls: { verification_log_id: claimLog.id },
        generated_by: userProfile?.id || null,
        submitted_at: new Date().toISOString(),
      };

      const { error } = await supabase.from('claim_reports').insert(payload);

      if (error) {
        console.error('Claim insert error:', error);
        alert('Gagal membuat claim: ' + error.message);
        return;
      }

      alert('Claim request berhasil dikirim ke vendor!');

      setClaimSentIds(prev => new Set(prev).add(claimLog.id));
      setClaimLog(null);
      setClaimForm({ periodStart: '', periodEnd: '', claimAmount: '', notes: '', vendorId: '' });
    } catch (err) {
      console.error('Claim submission error:', err);
      alert('Terjadi kesalahan saat mengirim claim.');
    } finally {
      setClaimSaving(false);
    }
  };

  return (
    <div className="space-y-8">
      <section className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
        <div>
          <h2 className="text-4xl font-bold tracking-tight">Discrepancy Reports</h2>
          <p className="mt-2 text-outline font-medium">Rejected inspection logs requiring review and action.</p>
        </div>
        <div className="flex flex-wrap items-center gap-3 bg-surface-container-low p-2 rounded-2xl">
          <div className="flex items-center gap-2 bg-surface-container-lowest px-3 py-2 rounded-xl shadow-sm">
            <Activity size={16} className="text-primary" />
            <input
              type="date"
              value={dateStart}
              onChange={e => setDateStart(e.target.value)}
              className="bg-transparent border-none text-sm font-medium focus:ring-0 p-0 w-[120px]"
            />
            <span className="text-outline text-xs">—</span>
            <input
              type="date"
              value={dateEnd}
              onChange={e => setDateEnd(e.target.value)}
              className="bg-transparent border-none text-sm font-medium focus:ring-0 p-0 w-[120px]"
            />
          </div>
          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2 bg-on-surface text-white rounded-xl text-sm font-semibold hover:bg-on-surface/90 transition-all active:scale-95"
          >
            <Download size={16} />
            Export
          </button>
        </div>
      </section>


      <section className="w-full bg-surface-container-lowest rounded-2xl overflow-hidden shadow-sm border border-outline-variant/10">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-surface-container-high">
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-outline">ID</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-outline">Timestamp</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-outline">Part Info</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-outline">Target/Detected</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-outline">Status</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-outline text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/10">
              {filteredLogs.map((log, i) => (
                <tr
                  key={log.id}
                  className="hover:bg-surface-container-low transition-colors group"
                >
                  <td className="px-6 py-5 text-xs font-mono text-primary font-bold">{logs.length - logs.indexOf(log)}</td>
                  <td className="px-6 py-5 text-sm font-medium text-outline">{log.timestamp}</td>
                  <td className="px-6 py-5">
                    <div className="flex flex-col">
                      <span className="text-sm font-bold">{log.code}</span>
                      <span className="text-xs text-outline">{log.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="text-sm font-mono flex items-center gap-2">
                      <span className="text-outline">{log.target}</span>
                      <span className="text-outline">/</span>
                      <span className={cn("font-bold", log.status === 'REJECTED' ? "text-tertiary" : "text-green-600")}>{log.actual}</span>
                    </div>
                  </td>

                  <td className="px-6 py-5">
                    <span className={cn(
                      "px-3 py-1 text-[10px] font-bold tracking-widest uppercase rounded",
                      log.status === 'REJECTED' ? "bg-red-600 text-white" : "bg-green-600 text-white"
                    )}>
                      {log.status === 'REJECTED' ? 'REJECT' : 'PASS'}
                    </span>
                  </td>
                  <td className="px-6 py-5 text-center">
                    <div className="flex justify-center gap-2">

                      <button
                        onClick={() => setProofLog(log)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider bg-primary/10 text-primary hover:bg-primary/20 transition-all active:scale-95"
                      >
                        <Eye size={14} />
                        Check Proof
                      </button>

                      {isInternal && (
                        <button
                          onClick={() => !claimSentIds.has(log.id) && openClaimForm(log)}
                          disabled={claimSentIds.has(log.id)}
                          className={cn(
                            "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all",
                            claimSentIds.has(log.id)
                              ? "bg-surface-container-high text-outline cursor-not-allowed opacity-50"
                              : "bg-tertiary/10 text-tertiary hover:bg-tertiary/20 active:scale-95"
                          )}
                        >
                          {claimSentIds.has(log.id) ? (
                            <><CheckCircle2 size={14} /> Sent</>
                          ) : (
                            <><Send size={14} /> Send Request</>
                          )}
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>


      <AnimatePresence>
        {proofLog && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={() => setProofLog(null)}>
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.2 }}
              className="bg-surface-container-lowest w-full max-w-lg rounded-2xl shadow-2xl border border-outline-variant/20 overflow-hidden"
              onClick={e => e.stopPropagation()}
            >

              <div className="p-6 border-b border-outline-variant/10 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <h3 className="text-sm font-bold uppercase tracking-widest">Inspection Proof</h3>
                  <span className={cn("px-2 py-0.5 text-[10px] font-black text-white rounded", proofLog.status === 'REJECTED' ? 'bg-red-600' : 'bg-green-600')}>
                    {proofLog.status === 'REJECTED' ? 'REJECT' : 'PASS'}
                  </span>
                </div>
                <button onClick={() => setProofLog(null)} className="p-2 hover:bg-surface-container-high rounded-full transition-colors">
                  <XCircle size={20} />
                </button>
              </div>


              <div className="w-full h-56 bg-surface-container-highest relative overflow-hidden">
                <img
                  src={proofLog.proofUrl || 'https://picsum.photos/seed/heatmap/400/300'}
                  alt="Inspection Proof"
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://picsum.photos/seed/heatmap/400/300';
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex flex-col justify-end p-4">
                  <span className="text-white text-[10px] font-bold uppercase tracking-widest">Inspection Snapshot</span>
                  <span className="text-white/80 text-[10px]">{proofLog.timestamp}</span>
                </div>
              </div>


              <div className="p-6 space-y-4">
                <div className="flex flex-col">
                  <span className="text-[10px] text-outline font-bold uppercase tracking-widest">Log Detail</span>
                  <span className="text-sm font-bold mt-1">{proofLog.code} — {proofLog.name}</span>
                  <span className="text-xs text-outline mt-0.5">{proofLog.vendor}</span>
                </div>
                <div className="grid grid-cols-3 gap-2 py-4 border-y border-outline-variant/10">
                  <div className="flex flex-col items-center">
                    <span className="text-[10px] text-outline font-medium">Target</span>
                    <span className="text-lg font-bold">{proofLog.target}</span>
                  </div>
                  <div className="flex flex-col items-center border-x border-outline-variant/10">
                    <span className="text-[10px] text-outline font-medium">Detected</span>
                    <span className={cn("text-lg font-bold", proofLog.status === 'REJECTED' ? 'text-red-600' : 'text-green-600')}>{proofLog.actual}</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <span className="text-[10px] text-outline font-medium">Variance</span>
                    <span className={cn("text-lg font-bold", proofLog.status === 'REJECTED' ? 'text-red-600' : 'text-green-600')}>{proofLog.actual - proofLog.target} pcs</span>
                  </div>
                </div>
                {proofLog.status === 'REJECTED' ? (
                  <div className="bg-tertiary/10 p-4 rounded-xl flex gap-3">
                    <AlertTriangle size={20} className="text-tertiary shrink-0" />
                    <div>
                      <p className="text-xs font-bold text-tertiary leading-tight">Count Mismatch Detected</p>
                      <p className="text-[10px] text-tertiary/80 mt-1 leading-relaxed">Target quantity was {proofLog.target} units but detected count is {proofLog.actual} units — a discrepancy of {Math.abs(((proofLog.actual - proofLog.target) / proofLog.target * 100)).toFixed(1)}% which exceeds the 3% tolerance threshold.</p>
                    </div>
                  </div>
                ) : (
                  <div className="bg-primary/10 p-4 rounded-xl flex gap-3">
                    <CheckCircle2 size={20} className="text-primary shrink-0" />
                    <div>
                      <p className="text-xs font-bold text-primary leading-tight">Inspection Passed</p>
                      <p className="text-[10px] text-primary/80 mt-1 leading-relaxed">Target: {proofLog.target} units, Detected: {proofLog.actual} units. Variance within acceptable 3% tolerance.</p>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>


      <AnimatePresence>
        {claimLog && isInternal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={() => !claimSaving && setClaimLog(null)}>
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.2 }}
              className="bg-surface-container-lowest w-full max-w-xl rounded-2xl shadow-2xl border border-outline-variant/20 overflow-hidden"
              onClick={e => e.stopPropagation()}
            >

              <div className="p-6 border-b border-outline-variant/10 flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold">Send Claim Request</h3>
                  <p className="text-xs text-outline mt-0.5">Buat claim baru berdasarkan discrepancy log</p>
                </div>
                <button onClick={() => !claimSaving && setClaimLog(null)} className="p-2 hover:bg-surface-container-high rounded-full transition-colors">
                  <XCircle size={20} />
                </button>
              </div>


              <div className="px-6 pt-6">
                <div className="bg-surface-container-low rounded-xl p-4 flex gap-4 items-start">
                  <div className="w-24 h-16 rounded-lg overflow-hidden bg-surface-container-highest shrink-0">
                    <img
                      src={claimLog.proofUrl || 'https://picsum.photos/seed/heatmap/400/300'}
                      alt="Proof"
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://picsum.photos/seed/heatmap/400/300';
                      }}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-bold">{claimLog.code}</span>
                      <span className={cn("px-2 py-0.5 text-[9px] font-bold text-white rounded", claimLog.status === 'REJECTED' ? 'bg-red-600' : 'bg-green-600')}>
                        {claimLog.status === 'REJECTED' ? 'REJECT' : 'PASS'}
                      </span>
                    </div>
                    <p className="text-xs text-outline">{claimLog.name} • {claimLog.vendor}</p>
                    <p className="text-[10px] text-outline mt-1">Target: {claimLog.target} | Detected: {claimLog.actual} | Variance: {claimLog.actual - claimLog.target} pcs</p>
                  </div>
                </div>
              </div>


              <form onSubmit={handleSubmitClaim} className="p-6 space-y-4">

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-outline uppercase tracking-widest">Vendor *</label>
                  <select
                    required
                    value={claimForm.vendorId}
                    onChange={e => setClaimForm({ ...claimForm, vendorId: e.target.value })}
                    className="w-full bg-surface-container px-3 py-2.5 rounded-xl border border-outline-variant/30 text-sm font-medium focus:ring-2 focus:ring-primary/20 outline-none cursor-pointer"
                  >
                    <option value="">— Pilih Vendor —</option>
                    {vendorsList.map(v => (
                      <option key={v.id} value={v.id}>{v.name}</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-outline uppercase tracking-widest">Period Start</label>
                    <input
                      required
                      type="date"
                      value={claimForm.periodStart}
                      onChange={e => setClaimForm({ ...claimForm, periodStart: e.target.value })}
                      className="w-full bg-surface-container px-3 py-2.5 rounded-xl border border-outline-variant/30 text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-outline uppercase tracking-widest">Period End</label>
                    <input
                      required
                      type="date"
                      value={claimForm.periodEnd}
                      onChange={e => setClaimForm({ ...claimForm, periodEnd: e.target.value })}
                      className="w-full bg-surface-container px-3 py-2.5 rounded-xl border border-outline-variant/30 text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-outline uppercase tracking-widest">Claim Amount (IDR)</label>
                  <input
                    type="number"
                    placeholder="e.g. 2500000"
                    value={claimForm.claimAmount}
                    onChange={e => setClaimForm({ ...claimForm, claimAmount: e.target.value })}
                    className="w-full bg-surface-container px-3 py-2.5 rounded-xl border border-outline-variant/30 text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-outline uppercase tracking-widest">Notes</label>
                  <textarea
                    value={claimForm.notes}
                    onChange={e => setClaimForm({ ...claimForm, notes: e.target.value })}
                    className="w-full bg-surface-container px-3 py-2.5 rounded-xl border border-outline-variant/30 text-sm focus:ring-2 focus:ring-primary/20 outline-none resize-none"
                    rows={3}
                  />
                </div>

                <div className="flex justify-end gap-3 pt-2 border-t border-outline-variant/10">
                  <button
                    type="button"
                    onClick={() => !claimSaving && setClaimLog(null)}
                    disabled={claimSaving}
                    className="px-4 py-2.5 rounded-xl font-medium text-sm text-outline hover:bg-surface-container-high transition-colors disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={claimSaving}
                    className="px-5 py-2.5 bg-tertiary text-white rounded-xl font-bold text-sm hover:bg-tertiary-container transition-all shadow-sm disabled:opacity-50 flex items-center gap-2 active:scale-95"
                  >
                    {claimSaving && <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                    {claimSaving ? 'Sending...' : 'Send Claim Request'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

const SystemHealth = () => {
  return (
    <div className="space-y-8">
      <header className="mb-10 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-full bg-primary/5 -skew-x-12 translate-x-32" />
        <div className="relative z-10">
          <span className="text-[10px] font-bold text-primary uppercase tracking-[0.2em]">Clinical Architect v1.0</span>
          <h1 className="text-3xl font-extrabold tracking-tighter mt-1">System Health & Status</h1>
          <p className="text-outline mt-2 max-w-2xl">Real-time performance metrics and connectivity logs for localized edge processing units and industrial sensor arrays.</p>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <section className="bg-surface-container-lowest rounded-2xl p-8 shadow-sm border border-outline-variant/10">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-sm font-bold uppercase tracking-wider flex items-center gap-2">
              <Cpu size={18} className="text-primary" />
              Edge PC Resource Monitor
            </h2>
            <span className="flex items-center gap-2 px-3 py-1 bg-primary/10 text-primary rounded-full text-[10px] font-bold uppercase tracking-wider">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              LIVE
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 items-center">
            <div className="flex flex-col items-center">
              <div className="relative w-24 h-24 md:w-32 md:h-32 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90">
                  <circle className="text-surface-container-high" cx="64" cy="64" fill="transparent" r="58" stroke="currentColor" strokeWidth="8" />
                  <circle className="text-primary" cx="64" cy="64" fill="transparent" r="58" stroke="currentColor" strokeDasharray="364.4" strokeDashoffset="200.4" strokeWidth="8" />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-xl md:text-2xl font-bold">45%</span>
                  <span className="text-[8px] md:text-[10px] text-outline font-medium uppercase tracking-tighter">CPU LOAD</span>
                </div>
              </div>
            </div>
            <div className="flex flex-col items-center">
              <div className="relative w-24 h-24 md:w-32 md:h-32 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90">
                  <circle className="text-surface-container-high" cx="64" cy="64" fill="transparent" r="58" stroke="currentColor" strokeWidth="8" />
                  <circle className="text-primary" cx="64" cy="64" fill="transparent" r="58" stroke="currentColor" strokeDasharray="364.4" strokeDashoffset="236.8" strokeWidth="8" />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4">
                  <span className="text-base md:text-lg font-bold leading-tight">2.8 <span className="text-xs font-normal">GB</span></span>
                  <span className="text-[8px] md:text-[10px] text-outline font-medium uppercase tracking-tighter">OF 8GB RAM</span>
                </div>
              </div>
            </div>
          </div>
          <div className="mt-10 pt-6 border-t border-outline-variant/10 flex justify-between">
            <div className="flex items-center gap-4">
              <div className="flex flex-col">
                <span className="text-[10px] text-outline uppercase font-semibold">Temperature</span>
                <span className="text-sm font-semibold">52°C</span>
              </div>
              <div className="w-px h-8 bg-outline-variant/20" />
              <div className="flex flex-col">
                <span className="text-[10px] text-outline uppercase font-semibold">Uptime</span>
                <span className="text-sm font-semibold">14d 2h</span>
              </div>
            </div>
            <div className="flex flex-col text-right">
              <span className="text-[10px] text-outline uppercase font-semibold">Last Heartbeat</span>
              <span className="text-sm font-semibold">0.4ms ago</span>
            </div>
          </div>
        </section>

        <section className="bg-surface-container-lowest rounded-2xl p-8 shadow-sm border border-outline-variant/10">
          <h2 className="text-sm font-bold uppercase tracking-wider flex items-center gap-2 mb-6">
            <Activity size={18} className="text-primary" />
            Peripheral & Sensor Status
          </h2>
          <div className="space-y-3">
            {[
              { name: 'Camera Feed', info: '30 FPS • H.264 Stream', status: 'CONNECTED', color: 'bg-blue-500' },
              { name: 'Weight Scale Serial', info: '9600 baud • COM1', status: 'CONNECTED', color: 'bg-blue-500' },
              { name: 'Local Database', info: 'SQLite Active • 12.4 GB free', status: 'READY', color: 'bg-blue-500' },
              { name: 'Cloud Sync', info: 'Waiting / Offline • Last sync: 5m ago', status: 'RETRIEVING', color: 'bg-amber-500' },
            ].map((sensor) => (
              <div key={sensor.name} className="bg-surface-container-low p-4 rounded-xl flex items-center justify-between border border-transparent hover:border-outline-variant/20 transition-all">
                <div className="flex items-center gap-4">
                  <div className={cn("w-2.5 h-2.5 rounded-full", sensor.color)} />
                  <div>
                    <h3 className="text-sm font-bold">{sensor.name}</h3>
                    <p className="text-[11px] text-outline font-mono">{sensor.info}</p>
                  </div>
                </div>
                <span className={cn(
                  "text-[10px] font-bold px-3 py-1 rounded-full uppercase",
                  sensor.status === 'RETRIEVING' ? "bg-amber-100 text-amber-700" : "bg-primary/10 text-primary"
                )}>
                  {sensor.status}
                </span>
              </div>
            ))}
          </div>
        </section>
      </div>

      <section className="bg-surface-container-lowest rounded-2xl p-8 shadow-sm border border-outline-variant/10 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-full bg-primary/5 -skew-x-12 translate-x-48" />
        <h2 className="text-sm font-bold uppercase tracking-wider flex items-center gap-2 mb-8 relative z-10">
          <Gauge size={18} className="text-primary" />
          AI Engine Performance Metrics
        </h2>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 relative z-10">
          <div className="bg-surface-container-low p-6 rounded-xl border border-outline-variant/10">
            <span className="text-[10px] text-outline uppercase font-bold tracking-widest block mb-1">Avg Inference Time</span>
            <div className="flex items-baseline gap-2">
              <span className="text-5xl font-black tracking-tighter">1.2s</span>
              <span className="text-xs font-semibold text-primary">(-0.2s)</span>
            </div>
          </div>
          <div className="bg-surface-container-low p-6 rounded-xl border border-outline-variant/10">
            <span className="text-[10px] text-outline uppercase font-bold tracking-widest block mb-1">Total Scans Today</span>
            <div className="flex items-baseline gap-2">
              <span className="text-5xl font-black tracking-tighter">450</span>
              <span className="text-xs font-semibold text-primary">(Target: 500)</span>
            </div>
          </div>
          <div className="bg-surface-container-low p-6 rounded-xl border border-outline-variant/10">
            <span className="text-[10px] text-outline uppercase font-bold tracking-widest block mb-4">Latency Trend (1h)</span>
            <div className="h-16 flex items-end gap-1.5">
              {LATENCY_DATA.map((d, i) => (
                <div
                  key={i}
                  className={cn(
                    "flex-1 rounded-t-sm transition-all hover:bg-primary-container",
                    i === 5 ? "bg-primary" : "bg-outline-variant/30"
                  )}
                  style={{ height: `${d.val}%` }}
                />
              ))}
            </div>
            <div className="flex justify-between mt-2 text-[9px] font-bold text-outline uppercase tracking-wider">
              <span>60m ago</span>
              <span>Current</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

const SettingsPage = () => {
  return (
    <div className="space-y-8">
      <div className="flex justify-between items-end mb-10">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tighter">System Configuration</h2>
          <p className="text-outline text-sm mt-1 max-w-xl">Manage global hardware parameters, vision AI thresholds, and offsite synchronization protocols.</p>
        </div>
        <div className="hidden md:block text-right">
          <div className="text-[10px] text-outline uppercase tracking-widest font-bold">Node Identity</div>
          <div className="text-sm font-mono font-bold text-primary">PRECISION-FLOW-V2-088</div>
        </div>
      </div>

      <div className="space-y-8">
        <section className="bg-surface-container-lowest p-8 rounded-2xl shadow-sm border border-outline-variant/10 relative overflow-hidden group">
          <div className="flex items-center gap-3 mb-8">
            <div className="p-2.5 bg-primary/5 rounded-xl text-primary">
              <Settings size={20} />
            </div>
            <h3 className="text-[11px] font-bold uppercase tracking-[0.2em]">Hardware Configuration</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="space-y-2">
              <label className="block text-[10px] font-bold text-outline uppercase tracking-widest">Camera Input Source</label>
              <select className="w-full bg-surface-container border border-outline-variant/30 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary/20 outline-none">
                <option>USB Webcam (Integrated)</option>
                <option>IP Camera RTSP (Remote)</option>
                <option>GigE Vision Interface</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="block text-[10px] font-bold text-outline uppercase tracking-widest">Weight Scale COM Port</label>
              <select className="w-full bg-surface-container border border-outline-variant/30 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary/20 outline-none">
                <option>COM1 (System Default)</option>
                <option>COM3 (USB Serial)</option>
                <option>/dev/ttyUSB0 (Linux)</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="block text-[10px] font-bold text-outline uppercase tracking-widest">Baud Rate (bps)</label>
              <input type="number" className="w-full bg-surface-container border border-outline-variant/30 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary/20 outline-none" defaultValue={9600} />
            </div>
          </div>
        </section>

        <section className="bg-surface-container-lowest p-8 rounded-2xl shadow-sm border border-outline-variant/10 relative overflow-hidden group">
          <div className="flex items-center gap-3 mb-8">
            <div className="p-2.5 bg-primary/5 rounded-xl text-primary">
              <Eye size={20} />
            </div>
            <h3 className="text-[11px] font-bold uppercase tracking-[0.2em]">AI & Vision Parameters</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <label className="block text-[10px] font-bold text-outline uppercase tracking-widest">Confidence Threshold / Sigma</label>
                <span className="bg-primary/10 text-primary px-2 py-0.5 rounded text-[10px] font-mono font-bold">15%</span>
              </div>
              <input type="range" className="w-full h-2 bg-surface-container rounded-lg appearance-none cursor-pointer accent-primary" defaultValue={15} />
              <div className="flex justify-between text-[10px] text-outline font-bold">
                <span>RELAXED (0%)</span>
                <span>STRICT (100%)</span>
              </div>
            </div>
            <div className="flex items-center justify-between p-6 bg-surface-container-low border border-outline-variant/20 rounded-2xl">
              <div>
                <h4 className="text-sm font-bold">Save Heatmap Images on REJECT</h4>
                <p className="text-[11px] text-outline mt-1 leading-relaxed">Persists visual forensics for inspection failure analysis.</p>
              </div>
              <div className="w-12 h-6 bg-primary rounded-full relative cursor-pointer">
                <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full" />
              </div>
            </div>
          </div>
        </section>

        <section className="bg-surface-container-lowest p-8 rounded-2xl shadow-sm border border-outline-variant/10 relative overflow-hidden group">
          <div className="flex items-center gap-3 mb-8">
            <div className="p-2.5 bg-primary/5 rounded-xl text-primary">
              <Cloud size={20} />
            </div>
            <h3 className="text-[11px] font-bold uppercase tracking-[0.2em]">Database & Sync</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="flex items-center justify-between p-6 bg-surface-container-low border border-outline-variant/20 rounded-2xl">
              <div>
                <h4 className="text-sm font-bold">Enable Cloud Sync (Supabase)</h4>
                <p className="text-[11px] text-outline mt-1 leading-relaxed">Enable real-time offsite backup of inspection batch logs.</p>
              </div>
              <div className="w-12 h-6 bg-surface-container-highest rounded-full relative cursor-pointer">
                <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full" />
              </div>
            </div>
            <div className="space-y-2">
              <label className="block text-[10px] font-bold text-outline uppercase tracking-widest">Sync Interval (minutes)</label>
              <input type="text" className="w-full bg-surface-container border border-outline-variant/30 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary/20 outline-none" defaultValue="5" />
            </div>
          </div>
        </section>

        <div className="pt-6 flex justify-end gap-6 items-center">
          <button className="text-sm font-bold text-outline hover:text-on-surface transition-colors uppercase tracking-widest px-4 py-2">Discard Changes</button>
          <button className="px-10 py-4 bg-primary text-white rounded-xl font-bold text-sm tracking-widest uppercase hover:bg-primary-container transition-all shadow-lg active:scale-95 flex items-center gap-3">
            <Save size={18} />
            Save Configuration
          </button>
        </div>
      </div>
    </div>
  );
};

export default function App() {
  const { session, userProfile, loading: authLoading, isInternal } = useAuth();

  const isPage = (value: string | null): value is Page => {
    return value === 'qc' || value === 'live' || value === 'master' || value === 'logs' || value === 'claims' || value === 'history';
  };

  const [currentPage, setCurrentPage] = useState<Page>(() => {
    const storedPage = localStorage.getItem('dashboard_page');
    return isPage(storedPage) ? storedPage : 'qc';
  });

  useEffect(() => {
    localStorage.setItem('dashboard_page', currentPage);
  }, [currentPage]);

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);


  const [parts, setParts] = useState<Part[]>(MOCK_PARTS);
  const [logs, setLogs] = useState<LogEntry[]>(MOCK_LOGS);
  const [claimSentIds, setClaimSentIds] = useState<Set<string>>(new Set());

  const loadData = async () => {
    try {
      const { data: dbParts } = await supabase.from('parts').select('*, vendors(name)');

      let loadedParts: Part[] = MOCK_PARTS;

      if (dbParts && dbParts.length > 0) {
        const formattedParts: Part[] = dbParts.map((p: any) => ({
          code: p.code,
          name: p.name,
          target: p.target_qty || 0,
          actual: p.actual_qty || 0,
          unitWeight: p.weight_target_gram + ' g',
          tolerance: '± ' + p.weight_tolerance_gram + ' g',
          vendor: p.vendors?.name || 'Unknown Vendor',
          vendor_id: p.vendor_id,
        }));
        setParts(formattedParts);
        loadedParts = formattedParts;
      }

      const { data: dbLogs } = await supabase.from('verification_logs').select('*').order('timestamp', { ascending: false });
      if (dbLogs) {
        const formattedLogs: LogEntry[] = dbLogs.map((l: any) => {
          const partInfo = loadedParts.find((p: Part) => p.code === l.part_code);
          let tsStr = l.timestamp;
          const rawDate = new Date(l.timestamp);
          if (!isNaN(rawDate.getTime())) {

            const wibDate = new Date(rawDate.getTime() + 7 * 60 * 60 * 1000);
            tsStr = wibDate.getFullYear() + '-' +
              String(wibDate.getUTCMonth() + 1).padStart(2, '0') + '-' +
              String(wibDate.getUTCDate()).padStart(2, '0') + ' ' +
              String(wibDate.getUTCHours()).padStart(2, '0') + ':' +
              String(wibDate.getUTCMinutes()).padStart(2, '0') + ':' +
              String(wibDate.getUTCSeconds()).padStart(2, '0');
          }

          return {
            id: l.id,
            timestamp: tsStr,
            code: l.part_code,
            name: partInfo?.name || '',
            target: l.target_qty || 0,
            actual: l.final_count || 0,
            aiCount: l.ai_count || 0,
            sensorWeight: (l.load_cell_count || 0) + 'g',
            status: (() => {
              const target = l.target_qty || 0;
              const actual = l.final_count || 0;
              if (target === 0) return l.status;
              const diffPct = Math.abs((actual - target) / target) * 100;
              return diffPct > 3 ? 'REJECTED' : 'PASSED';
            })(),
            unitWeight: partInfo?.unitWeight || '',
            tolerance: partInfo?.tolerance || '',
            vendor: partInfo?.vendor || 'Unknown Vendor',
            vendor_id: partInfo?.vendor_id,
            proofUrl: l.image_url || ''
          };
        });
        setLogs(formattedLogs.length > 0 ? formattedLogs : MOCK_LOGS);
      }


      const { data: dbClaims } = await supabase.from('claim_reports').select('supporting_docs_urls');
      if (dbClaims) {
        const sentIds = new Set<string>();
        dbClaims.forEach((c: any) => {
          const doc = c.supporting_docs_urls;
          if (doc && typeof doc === 'object' && doc.verification_log_id) {
            sentIds.add(doc.verification_log_id);
          }
        });
        setClaimSentIds(sentIds);
      }

    } catch (e) {
      console.error("Data load error:", e);
    }
  };

  useEffect(() => { loadData(); }, []);

  const renderPage = () => {

    if (!isInternal && (currentPage === 'live' || currentPage === 'master')) {
      return <QCAnalytics />;
    }

    switch (currentPage) {
      case 'qc': return <QCAnalytics />;
      case 'live': return <LiveInspection logs={logs} setPage={setCurrentPage} />;
      case 'master': return <MasterData parts={parts} setParts={setParts} logs={logs} />;
      case 'history': return <InspectionHistory logs={logs} />;
      case 'logs': return <DiscrepancyLogs logs={logs} setLogs={setLogs} claimSentIds={claimSentIds} setClaimSentIds={setClaimSentIds} />;
      case 'claims': return <VendorClaims />;
      default: return <QCAnalytics />;
    }
  };


  if (authLoading) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 size={32} className="text-primary animate-spin" />
          <p className="text-sm text-outline font-medium">Loading...</p>
        </div>
      </div>
    );
  }


  if (!session || !userProfile) {
    return <LoginPage />;
  }

  return (
    <div className="min-h-screen bg-surface flex">

      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsSidebarOpen(false)}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 lg:hidden"
          />
        )}
      </AnimatePresence>

      <Sidebar
        activePage={currentPage}
        setPage={(p) => {
          setCurrentPage(p);
          setIsSidebarOpen(false);
        }}
        isOpen={isSidebarOpen}
      />

      <div className={cn(
        "flex-1 flex flex-col min-w-0 transition-all duration-300",
        "lg:ml-64"
      )}>
        <TopBar
          title={currentPage.charAt(0).toUpperCase() + currentPage.slice(1)}
          onMenuClick={() => setIsSidebarOpen(true)}
        />

        <main className="flex-1 pt-16 min-h-screen">
          <div className="p-4 md:p-10 max-w-7xl mx-auto">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentPage}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                {renderPage()}
              </motion.div>
            </AnimatePresence>
          </div>
        </main>

        <footer className="p-4 md:p-8 border-t border-outline-variant/10 flex justify-end text-outline text-[11px] font-medium tracking-wide">
          <div className="flex items-center gap-8 uppercase">
            <span>© 2026 IQC Precision Systems • All Rights Reserved</span>
          </div>
        </footer>
      </div>
    </div>
  );
}
