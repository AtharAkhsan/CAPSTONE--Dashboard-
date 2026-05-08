export type Page = 'qc' | 'live' | 'master' | 'logs';

export interface Part {
  code: string;
  name: string;
  target: number;
  actual: number;
  unitWeight: string;
  tolerance: string;
  vendor: string;
  vendor_id?: string;
  timestamp?: string;
  status?: 'PASSED' | 'REJECTED';
}

export interface LogEntry extends Part {
  id: string;
  timestamp: string;
  aiCount: number;
  sensorWeight: string;
  status: 'PASSED' | 'REJECTED';
  proofUrl?: string;
}

export interface UserProfile {
  id: string;
  auth_uid: string;
  email: string;
  display_name: string;
  role: 'superadmin' | 'admin' | 'manager' | 'vendor_viewer';
  vendor_id: string | null;
  is_active: boolean;
  vendor_name?: string;
}

export interface VerificationLog {
  id: string;
  timestamp: string;
  ai_count: number;
  load_cell_count: number;
  final_count: number;
  diff_pct: number;
  status: string;
  part_code: string;
  target_qty: number;
}

export interface NgReport {
  id: string;
  vendor_id: string;
  part_code: string;
  part_name: string | null;
  inspected_at: string;
  fusion_result: 'NG_BERAT' | 'NG_VISUAL' | 'NG_KEDUANYA';
  ng_category: 'UNDERWEIGHT' | 'OVERWEIGHT' | 'VISUAL_DEFECT' | 'WEIGHT_VISUAL_COMBINED' | 'OTHER';
  status: 'pending' | 'reviewed' | 'claim_filed' | 'resolved';
  weight_deviation_pct: number | null;
  vendor_name?: string;
}

export interface ClaimReport {
  id: string;
  vendor_id: string;
  period_start: string;
  period_end: string;
  report_date: string;
  total_inspected: number;
  total_ng: number;
  ng_rate_pct: number | null;
  status: 'draft' | 'submitted' | 'acknowledged' | 'resolved' | 'disputed';
  claim_amount: number | null;
  currency: string;
  notes: string | null;
  vendor_name?: string;
}

export interface FilterState {
  dateStart: string;
  dateEnd: string;
  vendorId: string;
  partCode: string;
}

export interface AlertItem {
  id: string;
  type: 'warning' | 'danger' | 'info' | 'anomaly';
  title: string;
  message: string;
  value?: string;
}
