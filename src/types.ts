export type Page = 'qc' | 'live' | 'master' | 'logs' | 'claims';

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

export type ClaimStatus = 'draft' | 'submitted' | 'under_review' | 'accepted' | 'rejected' | 'replacement_sent' | 'resolved';

export interface ClaimReport {
  id: string;
  vendor_id: string;
  period_start: string;
  period_end: string;
  report_date: string;
  total_inspected: number;
  total_ng: number;
  ng_rate_pct: number | null;
  ng_category_breakdown: Record<string, number> | null;
  part_breakdown: Record<string, any>[] | null;
  status: ClaimStatus;
  claim_amount: number | null;
  currency: string;
  report_url: string | null;
  supporting_docs_urls: string[] | null;
  generated_by: string | null;
  generated_at: string;
  submitted_at: string | null;
  resolved_at: string | null;
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
