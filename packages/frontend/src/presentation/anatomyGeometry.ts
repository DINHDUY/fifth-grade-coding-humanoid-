import { TONYBOT_DIMENSIONS, type Pose, type MotionJointId } from '../domain/motion';

export interface MapPoint { x: number; y: number }
export interface AnatomyGeometry {
  joints: Record<MotionJointId, MapPoint>;
  chains: MapPoint[][];
  feet: { center: MapPoint; angle: number }[];
}

const radians = (degrees: number) => degrees * Math.PI / 180;
const offset = (point: MapPoint, dx: number, dy: number): MapPoint => ({ x: point.x + dx, y: point.y + dy });

// A front-view teaching projection. Pitch has a small lateral projection so
// out-of-plane motion stays visible; this is not a rigid-body balance solver.
export function anatomyGeometry(pose: Pose): AnatomyGeometry {
  const joints = {} as Record<MotionJointId, MapPoint>;
  joints.head = { x: 0, y: 63 };
  const chains: MapPoint[][] = [];
  const feet: AnatomyGeometry['feet'] = [];
  for (const side of ['r', 'l'] as const) {
    const sign = side === 'r' ? -1 : 1; // Robot's right appears on the viewer's left.
    const shoulder = `${side}Shoulder` as const;
    const roll = `${side}ShoulderRoll` as const;
    const elbow = `${side}Elbow` as const;
    const pitch = radians(pose[shoulder]);
    const armRoll = radians(pose[roll]);
    const armSegment = (point: MapPoint, length: number, angle: number, spread: number): MapPoint =>
      offset(point, sign * (spread + length * (0.35 * Math.sin(angle) + Math.sin(armRoll) * Math.cos(angle))), length * Math.cos(armRoll) * Math.cos(angle));
    joints[shoulder] = { x: sign * 57, y: 83 };
    joints[roll] = offset(joints[shoulder], sign * (19 + 7 * Math.sin(pitch)), 19 * Math.cos(pitch));
    joints[elbow] = armSegment(joints[roll], 40, pitch, 4);
    const forearmAngle = pitch + radians(pose[elbow]);
    const wrist = armSegment(joints[elbow], 53, forearmAngle, 5);
    const hand = armSegment(wrist, 27, forearmAngle, 10);
    chains.push([joints[shoulder], joints[roll], joints[elbow], wrist, hand]);

    const hipRoll = `${side}HipRoll` as const;
    const hipPitch = `${side}HipPitch` as const;
    const knee = `${side}Knee` as const;
    const anklePitch = `${side}AnklePitch` as const;
    const ankleRoll = `${side}AnkleRoll` as const;
    const lean = radians(pose[hipRoll]);
    const thigh = radians(pose[hipPitch]);
    const shin = thigh + radians(pose[knee]);
    const ankle = shin + radians(pose[anklePitch]);
    const legSegment = (point: MapPoint, length: number, angle: number): MapPoint =>
      offset(point, sign * length * Math.sin(lean) + length * Math.sin(angle) * 0.35, length * Math.cos(lean) * Math.cos(angle));
    joints[hipRoll] = { x: sign * (TONYBOT_DIMENSIONS.footSpanMm - 78) / 2, y: 160 };
    joints[hipPitch] = legSegment(joints[hipRoll], 44, 0);
    joints[knee] = legSegment(joints[hipPitch], 60, thigh);
    joints[anklePitch] = legSegment(joints[knee], 63, shin);
    joints[ankleRoll] = legSegment(joints[anklePitch], 40, ankle);
    const foot = offset(joints[ankleRoll], 0, 16);
    feet.push({ center: foot, angle: pose[ankleRoll] });
    chains.push([joints[hipRoll], joints[hipPitch], joints[knee], joints[anklePitch], joints[ankleRoll], foot]);
  }
  return { joints, chains, feet };
}

export function anatomyViewBox(poses: Pose[]): string {
  const points: MapPoint[] = [{ x: -115, y: -18 }, { x: 115, y: TONYBOT_DIMENSIONS.heightMm + 12 }];
  for (const pose of poses) {
    const geometry = anatomyGeometry(pose);
    points.push(...geometry.chains.flat());
    for (const foot of geometry.feet) {
      points.push(offset(foot.center, -44, -44), offset(foot.center, 44, 44));
    }
  }
  const left = Math.min(...points.map((point) => point.x)) - 22;
  const top = Math.min(...points.map((point) => point.y)) - 18;
  const right = Math.max(...points.map((point) => point.x)) + 22;
  const bottom = Math.max(...points.map((point) => point.y)) + 18;
  return `${left} ${top} ${right - left} ${bottom - top}`;
}
