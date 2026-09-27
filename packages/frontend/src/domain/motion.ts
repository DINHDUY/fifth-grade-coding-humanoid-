export type MotionJointId = 'head' | 'rShoulder' | 'rShoulderRoll' | 'rElbow' | 'lShoulder' | 'lShoulderRoll' | 'lElbow' | 'lKnee' | 'rKnee' | 'lHipRoll' | 'rHipRoll' | 'lHipPitch' | 'rHipPitch' | 'lAnklePitch' | 'rAnklePitch' | 'lAnkleRoll' | 'rAnkleRoll';

export interface MotionJoint {
  id: MotionJointId;
  diagramId: number;
  busId: number | null;
  group: 'Head' | 'Right arm' | 'Left arm' | 'Right leg' | 'Left leg';
  label: string;
  angle: number;
  min: number;
  max: number;
  temperature: number;
  color: string;
}

export type Pose = Record<MotionJointId, number>;
export type Transition = 'Neutral' | 'Smooth' | 'Bipedal' | 'XP Bonus';

export interface MotionFrame {
  id: string;
  label: string;
  time: number;
  pose: Pose;
  transition: Transition;
}

export interface Choreography {
  name: string;
  frames: MotionFrame[];
  loop: boolean;
}

export interface MotionTelemetry {
  connected: boolean;
  busReady: boolean;
  servoCount: number;
  battery: number;
  cog: { x: number; y: number; stable: boolean };
}

export interface MotionSimulatorState {
  choreography: Choreography;
  currentTime: number;
  selectedFrame: number;
  selectedJoint: MotionJointId;
  playing: boolean;
  torqueHold: boolean;
  synced: boolean;
}

// IDs follow Hiwonder's front-view 17-DOF diagram. Robot right is viewer left.
// #17 is the separate PWM head servo, not a seventeenth bus address.
// Degree ranges are simulator editing limits, not calibrated hardware limits.
// Sources and dimension interpretation: docs/tonybot-servo-map.md.
const joint = (id: MotionJointId, diagramId: number, name: string, group: MotionJoint['group'], min = -60, max = 60): MotionJoint => ({
  id, diagramId, busId: diagramId === 17 ? null : diagramId, group,
  label: `#${String(diagramId).padStart(2, '0')} ${name}`, angle: 0, min, max,
  temperature: diagramId === 17 ? 31 : 34, color: group === 'Head' ? '#5d46c7' : '#087d91',
});

export const MOTION_JOINTS: MotionJoint[] = [
  joint('head', 17, 'Head yaw (PWM)', 'Head', -90, 90),
  joint('rShoulder', 16, 'R. Shoulder pitch', 'Right arm', 0, 180),
  joint('rShoulderRoll', 15, 'R. Shoulder roll', 'Right arm', -90, 90),
  joint('rElbow', 14, 'R. Elbow', 'Right arm', 0, 180),
  joint('lShoulder', 8, 'L. Shoulder pitch', 'Left arm', 0, 180),
  joint('lShoulderRoll', 7, 'L. Shoulder roll', 'Left arm', -90, 90),
  joint('lElbow', 6, 'L. Elbow', 'Left arm', 0, 180),
  joint('rHipRoll', 13, 'R. Hip roll', 'Right leg', -45, 45),
  joint('rHipPitch', 12, 'R. Hip pitch', 'Right leg'),
  joint('rKnee', 11, 'R. Knee', 'Right leg', -45, 45),
  joint('rAnklePitch', 10, 'R. Ankle pitch', 'Right leg'),
  joint('rAnkleRoll', 9, 'R. Ankle roll', 'Right leg', -45, 45),
  joint('lHipRoll', 5, 'L. Hip roll', 'Left leg', -45, 45),
  joint('lHipPitch', 4, 'L. Hip pitch', 'Left leg'),
  joint('lKnee', 3, 'L. Knee', 'Left leg', -45, 45),
  joint('lAnklePitch', 2, 'L. Ankle pitch', 'Left leg'),
  joint('lAnkleRoll', 1, 'L. Ankle roll', 'Left leg', -45, 45),
];

export const TONYBOT_DIMENSIONS = { heightMm: 383, widthMm: 190, depthMm: 105, footSpanMm: 169 };
export const BUS_SERVO_COUNT = MOTION_JOINTS.filter((item) => item.busId !== null).length;
export const SERVO_MAP_SOURCE = 'https://www.hiwonder.com/products/tonybot';

export const initialPose = (): Pose => Object.fromEntries(MOTION_JOINTS.map((joint) => [joint.id, joint.angle])) as Pose;

export const DEFAULT_CHOREOGRAPHY: Choreography = {
  name: 'Custom Victory Dance',
  loop: false,
  frames: [
    { id: 'ready', label: 'Ready Stance', time: 0, pose: initialPose(), transition: 'Neutral' },
    { id: 'bow', label: 'Deep Bow (Greeting)', time: 1.2, pose: { ...initialPose(), rKnee: -28, lKnee: -28, rHipPitch: 20, lHipPitch: 20 }, transition: 'Smooth' },
    { id: 'wave', label: 'Wave Right Hand', time: 2.5, pose: { ...initialPose(), rShoulder: 120, rShoulderRoll: 15, rElbow: 45, rKnee: -15, lKnee: -15 }, transition: 'Neutral' },
    { id: 'groove', label: 'Hip Sway & Groove', time: 3.8, pose: { ...initialPose(), rKnee: -15, lKnee: -15, rHipRoll: 12, lHipRoll: -12, lShoulder: 70 }, transition: 'Bipedal' },
    { id: 'finale', label: 'Victory Pose Finale', time: 5, pose: { ...initialPose(), rShoulder: 140, lShoulder: 140, head: 12 }, transition: 'XP Bonus' },
  ],
};

export const clampJoint = (joint: MotionJoint, value: number): number => Math.max(joint.min, Math.min(joint.max, value));

export function poseAtTime(choreography: Choreography, time: number): Pose {
  const frames = choreography.frames;
  if (!frames.length) return initialPose();
  if (time <= frames[0].time) return { ...frames[0].pose };
  const last = frames[frames.length - 1];
  if (time >= last.time) return { ...last.pose };
  const right = frames.findIndex((frame) => frame.time >= time);
  const after = frames[right];
  const before = frames[right - 1];
  const amount = (time - before.time) / (after.time - before.time);
  return Object.fromEntries(MOTION_JOINTS.map((joint) => [joint.id, before.pose[joint.id] + (after.pose[joint.id] - before.pose[joint.id]) * amount])) as Pose;
}

export const totalDuration = (choreography: Choreography): number => choreography.frames.at(-1)?.time ?? 0;

export const stability = (pose: Pose): MotionTelemetry['cog'] => {
  const x = Math.round((pose.rShoulder - pose.lShoulder) / 10);
  const y = Math.round(((pose.lKnee + pose.rKnee) / 2 + 15) / 4);
  return { x, y, stable: Math.abs(x) <= 14 && Math.abs(y) <= 14 };
};
