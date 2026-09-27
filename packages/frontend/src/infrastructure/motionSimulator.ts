import { BUS_SERVO_COUNT, clampJoint, DEFAULT_CHOREOGRAPHY, initialPose, MOTION_JOINTS, poseAtTime, stability, totalDuration, type MotionSimulatorState, type Pose } from '../domain/motion';

export const MOTION_STORAGE_KEY = 'tonybot-motion-sequencer-state';

export const defaultMotionState = (): MotionSimulatorState => ({ choreography: structuredClone(DEFAULT_CHOREOGRAPHY), currentTime: 2.5, selectedFrame: 2, selectedJoint: 'rShoulder', playing: false, torqueHold: true, synced: false });

function migratePose(value: unknown): Pose {
  const pose = initialPose();
  const old = value && typeof value === 'object' ? value as Record<string, unknown> : {};
  for (const joint of MOTION_JOINTS) {
    const angle = old[joint.id] ?? ((joint.id === 'lKnee' || joint.id === 'rKnee') ? old.knees : undefined);
    if (typeof angle === 'number' && Number.isFinite(angle)) pose[joint.id] = clampJoint(joint, angle);
  }
  return pose;
}

export function loadMotionState(storage: Storage | undefined): MotionSimulatorState {
  if (!storage) return defaultMotionState();
  try {
    const stored = JSON.parse(storage.getItem(MOTION_STORAGE_KEY) ?? 'null');
    if (stored?.version !== undefined && stored.version !== 2) return defaultMotionState();
    const value = (stored?.version === 2 ? stored.state : stored) as Partial<MotionSimulatorState> | null;
    if (!value?.choreography?.frames?.length) return defaultMotionState();
    const choreography = value.choreography;
    if (!choreography.frames.every((frame, index, frames) => Number.isFinite(frame.time) && frame.time >= 0 && (index === 0 || frame.time > frames[index - 1].time))) return defaultMotionState();
    const selectedFrame = Number.isInteger(value.selectedFrame) ? Math.max(0, Math.min(value.selectedFrame!, choreography.frames.length - 1)) : 0;
    const selectedJoint = MOTION_JOINTS.some((joint) => joint.id === value.selectedJoint) ? value.selectedJoint! : 'rKnee';
    return { ...defaultMotionState(), ...value,
      selectedFrame, selectedJoint,
      currentTime: Number.isFinite(value.currentTime) ? Math.max(0, Math.min(value.currentTime!, totalDuration(choreography))) : choreography.frames[selectedFrame].time,
      choreography: { ...choreography, frames: choreography.frames.map((frame) => ({ ...frame, pose: migratePose(frame.pose) })) }, playing: false };
  } catch { return defaultMotionState(); }
}

export const saveMotionState = (storage: Storage | undefined, state: MotionSimulatorState): void => storage?.setItem(MOTION_STORAGE_KEY, JSON.stringify({ version: 2, state: { ...state, playing: false } }));

export function telemetry(state: MotionSimulatorState): { connected: boolean; busReady: boolean; servoCount: number; busServoCount: number; battery: number; cog: ReturnType<typeof stability> } {
  return { connected: true, busReady: true, servoCount: MOTION_JOINTS.length, busServoCount: BUS_SERVO_COUNT, battery: 86, cog: stability(poseAtTime(state.choreography, state.currentTime)) };
}

export class MotionSimulator {
  private state: MotionSimulatorState;
  constructor(initial = defaultMotionState()) { this.state = initial; }
  getState(): MotionSimulatorState { return this.state; }
  setPose(pose: Pose): void { const frames = this.state.choreography.frames.map((frame, index) => index === this.state.selectedFrame ? { ...frame, pose } : frame); this.state = { ...this.state, choreography: { ...this.state.choreography, frames } }; }
  advance(delta: number): MotionSimulatorState { if (!this.state.playing) return this.state; const duration = totalDuration(this.state.choreography); const next = this.state.currentTime + delta; if (next >= duration && this.state.choreography.loop) return this.updateTime(next % duration); return this.updateTime(Math.min(next, duration), next < duration); }
  private updateTime(currentTime: number, playing = this.state.playing): MotionSimulatorState { const frame = this.state.choreography.frames.reduce((selected, item, index) => item.time <= currentTime ? index : selected, 0); this.state = { ...this.state, currentTime, selectedFrame: frame, playing }; return this.state; }
  togglePlaying(): MotionSimulatorState { this.state = { ...this.state, playing: !this.state.playing }; return this.state; }
  stop(): MotionSimulatorState { this.state = { ...this.state, playing: false, currentTime: 0, selectedFrame: 0 }; return this.state; }
}
