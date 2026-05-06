export type Page = 'live' | 'master' | 'logs';

export interface Part {
  code: string;
  name: string;
  target: number;
  actual: number;
  unitWeight: string;
  tolerance: string;
  vendor: string;
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
