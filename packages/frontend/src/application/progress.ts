import type { AppState, Mission, PersistedState } from '../domain/types';

export const STORAGE_KEY = 'tonybot-mission-control-state';
export const DEFAULT_STATE: AppState = { completed: [], roster: ['Ada', 'Sam', 'Priya', 'Leo'] };

export const missionKeys = (mission: Mission): string[] => [
  ...mission.objectives.map((_, index) => `p${mission.id}-obj-${index}`),
  ...mission.activities.map((_, index) => `p${mission.id}-act-${index}`)
];

export const completionPercent = (mission: Mission, completed: Set<string>): number => {
  const keys = missionKeys(mission);
  return Math.round((keys.filter((key) => completed.has(key)).length / keys.length) * 100);
};

export const overallPercent = (missions: Mission[], completed: Set<string>): number => {
  const keys = missions.flatMap(missionKeys);
  return Math.round((keys.filter((key) => completed.has(key)).length / keys.length) * 100);
};

export const serializeState = (state: AppState): string => JSON.stringify({ version: 1, state } satisfies PersistedState, null, 2);

export const parseState = (raw: string): AppState => {
  const value: unknown = JSON.parse(raw);
  if (!value || typeof value !== 'object' || !('version' in value) || value.version !== 1 || !('state' in value)) throw new Error('Unsupported progress file.');
  const state = value.state;
  if (!state || typeof state !== 'object' || !('completed' in state) || !('roster' in state) || !Array.isArray(state.completed) || !Array.isArray(state.roster) || !state.completed.every((item) => typeof item === 'string') || !state.roster.every((item) => typeof item === 'string')) throw new Error('Invalid progress file.');
  return { completed: state.completed, roster: state.roster };
};

export const loadState = (storage: Storage | undefined): AppState => {
  if (!storage) return DEFAULT_STATE;
  try { const raw = storage.getItem(STORAGE_KEY); return raw ? parseState(raw) : DEFAULT_STATE; } catch { return DEFAULT_STATE; }
};

export const saveState = (storage: Storage | undefined, state: AppState): void => storage?.setItem(STORAGE_KEY, serializeState(state));

export const createPairs = (names: string[], random: () => number = Math.random): Array<{ navigator: string; pilot: string | null }> => {
  const shuffled = [...names].sort(() => random() - 0.5);
  const pairs: Array<{ navigator: string; pilot: string | null }> = [];
  for (let index = 0; index < shuffled.length; index += 2) pairs.push({ navigator: shuffled[index], pilot: shuffled[index + 1] ?? null });
  return pairs;
};
