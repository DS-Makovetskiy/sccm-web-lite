export interface Computer {
  name: string;
  fio:  string;
}

export interface Preset {
  name: string;
  ip:   string;
}

export interface ReservedComputer {
  name:   string;
  target: string;
}

export interface Settings {
  cmrcviewer_path: string;
  presets: Preset[];
  dataSource: 'csv' | 'ps' | 'direct-ad';
  csvPath: string;
  psScriptPath: string;
  reservedComputers: ReservedComputer[];
  showReservedComputersBlock: boolean;
  showPresetsBlock: boolean;
  theme: string;
}

export type AlertState = {
  message:  string;
  severity: 'success' | 'error';
} | null;

export type Theme = 'light' | 'dark' | 'system';