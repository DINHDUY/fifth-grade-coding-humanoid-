import { describe, expect, it } from 'vitest';
import { BUS_SERVO_COUNT, DEFAULT_CHOREOGRAPHY, initialPose, MOTION_JOINTS, poseAtTime, stability, totalDuration } from '../domain/motion';
import { defaultMotionState, loadMotionState, MOTION_STORAGE_KEY, saveMotionState, telemetry } from '../infrastructure/motionSimulator';
import { anatomyGeometry, anatomyViewBox } from '../presentation/anatomyGeometry';

describe('motion sequencer domain', () => {
  it('interpolates poses and calculates duration', () => { expect(totalDuration(DEFAULT_CHOREOGRAPHY)).toBe(5); expect(poseAtTime(DEFAULT_CHOREOGRAPHY, 1.85).rKnee).toBeCloseTo(-21.5); });
  it('classifies balanced and offset poses', () => { expect(stability(initialPose()).stable).toBe(true); expect(stability({ ...initialPose(), rShoulder: 180, lShoulder: 0 }).stable).toBe(false); });
  it('persists sequencer state independently', () => { const storage = window.localStorage; const state = defaultMotionState(); saveMotionState(storage, state); expect(loadMotionState(storage).choreography.name).toBe('Custom Victory Dance'); });

  it('matches the official bus diagram and keeps the PWM head separate', () => {
    expect(MOTION_JOINTS).toHaveLength(17);
    expect(BUS_SERVO_COUNT).toBe(16);
    expect(MOTION_JOINTS.filter((joint) => joint.busId !== null).map((joint) => joint.busId).sort((a, b) => a! - b!)).toEqual(Array.from({ length: 16 }, (_, index) => index + 1));
    expect(MOTION_JOINTS.find((joint) => joint.id === 'head')).toMatchObject({ diagramId: 17, busId: null });
    expect(MOTION_JOINTS.find((joint) => joint.id === 'lKnee')?.busId).toBe(3);
    expect(MOTION_JOINTS.find((joint) => joint.id === 'rKnee')?.busId).toBe(11);
    expect(telemetry(defaultMotionState())).toMatchObject({ servoCount: 17, busServoCount: 16 });
  });

  it('migrates old choreography and shared knees without losing named joint edits', () => {
    const state = defaultMotionState();
    const frames = state.choreography.frames.map((frame) => ({ ...frame, pose: { head: 12, rShoulder: 100, knees: -23, lHipYaw: 10 } }));
    localStorage.setItem(MOTION_STORAGE_KEY, JSON.stringify({ ...state, selectedJoint: 'knees', choreography: { ...state.choreography, name: 'My routine', frames } }));
    const migrated = loadMotionState(localStorage);
    expect(migrated.choreography.name).toBe('My routine');
    expect(migrated.choreography.frames[0].pose).toMatchObject({ head: 12, rShoulder: 100, lKnee: -23, rKnee: -23, lShoulderRoll: 0 });
    expect(Object.keys(migrated.choreography.frames[0].pose)).toHaveLength(17);
    expect(migrated.selectedJoint).toBe('rKnee');
    saveMotionState(localStorage, migrated);
    expect(loadMotionState(localStorage)).toEqual(migrated);
  });

  it('renders two separate legs at the documented standing height and foot span', () => {
    const geometry = anatomyGeometry(initialPose());
    expect(geometry.feet.every((foot) => foot.center.y === 383)).toBe(true);
    expect(geometry.feet[1].center.x - geometry.feet[0].center.x + 78).toBe(169);
    const bent = anatomyGeometry({ ...initialPose(), rKnee: -30 });
    expect(bent.joints.rAnklePitch).not.toEqual(geometry.joints.rAnklePitch);
    expect(bent.joints.lAnklePitch).toEqual(geometry.joints.lAnklePitch);
    expect(geometry.joints.rShoulder.x).toBeLessThan(geometry.joints.lShoulder.x);
  });

  it('propagates every body target to its limb or foot instead of leaving fixed markers', () => {
    const neutral = anatomyGeometry(initialPose());
    for (const joint of MOTION_JOINTS.filter((joint) => joint.id !== 'head')) {
      expect(anatomyGeometry({ ...initialPose(), [joint.id]: 30 }), joint.label).not.toEqual(neutral);
    }
  });

  it('fits the default sequence without clipping limbs', () => {
    const poses = Array.from({ length: 101 }, (_, i) => poseAtTime(DEFAULT_CHOREOGRAPHY, i / 20));
    const [x, y, width, height] = anatomyViewBox(poses).split(' ').map(Number);
    for (const pose of poses) for (const point of anatomyGeometry(pose).chains.flat()) {
      expect(point.x).toBeGreaterThan(x + 10);
      expect(point.x).toBeLessThan(x + width - 10);
      expect(point.y).toBeGreaterThan(y + 10);
      expect(point.y).toBeLessThan(y + height - 10);
    }
  });
});
