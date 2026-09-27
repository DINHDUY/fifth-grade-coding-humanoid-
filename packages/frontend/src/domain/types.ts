export type IconName = 'cpu' | 'eye' | 'mic' | 'radar' | 'music' | 'sparkles' | 'refresh';

export interface HardwareFeature {
  tag: string;
  name: string;
  icon: IconName;
  color: string;
  description: string;
}

export interface Activity { title: string; detail: string; walkthrough?: boolean }
export interface Mission {
  id: number;
  code: string;
  name: string;
  level: string;
  color: string;
  focus: string;
  objectives: string[];
  activities: Activity[];
  assessment: string;
}

export interface ScratchProject {
  id: string;
  title: string;
  icon: IconName;
  color: string;
  description: string;
  tag: string;
  localUrl: string;
  externalUrl: string;
}

export interface TrackerStep { id: string; title: string; icon: IconName; explain: string; code: string }
export interface AppState { completed: string[]; roster: string[] }
export interface PersistedState { version: 1; state: AppState }

export interface RobotTelemetry { connected: boolean; battery: number; distance: number; tilt: number }
export interface RobotAdapter {
  connect(): Promise<void>;
  disconnect(): Promise<void>;
  getTelemetry(): Promise<RobotTelemetry>;
  runActionGroup(id: number, count?: number): Promise<void>;
  safeStop(): Promise<void>;
}
