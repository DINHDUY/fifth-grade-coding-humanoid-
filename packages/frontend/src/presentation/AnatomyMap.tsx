import { useId, useMemo } from 'react';
import { MOTION_JOINTS, SERVO_MAP_SOURCE, TONYBOT_DIMENSIONS, initialPose, poseAtTime, stability, totalDuration, type Choreography, type MotionJointId, type Pose } from '../domain/motion';
import { anatomyGeometry, anatomyViewBox } from './anatomyGeometry';
import './anatomy.css';

export function AnatomyMap({ pose, choreography, selected, onSelect }: {
  pose: Pose;
  choreography: Choreography;
  selected: MotionJointId;
  onSelect: (id: MotionJointId) => void;
}) {
  const patternId = useId();
  const geometry = anatomyGeometry(pose);
  // Fit the whole routine, including interpolated arc extrema, once per edit.
  // Keeping this camera fixed while playing prevents distracting zoom changes.
  const viewBox = useMemo(() => anatomyViewBox([
    initialPose(), ...choreography.frames.map((frame) => frame.pose),
    ...Array.from({ length: 101 }, (_, index) => poseAtTime(choreography, totalDuration(choreography) * index / 100)),
  ]), [choreography]);
  const joint = MOTION_JOINTS.find((item) => item.id === selected)!;
  const headTurn = Math.sin(pose.head * Math.PI / 180);
  const selectedPoint = geometry.joints[selected];
  const cog = stability(pose);
  return <figure className="anatomy-figure">
    <div className="anatomy-feedback"><span>{joint.label}</span><b>{Math.round(pose[selected])}° <small>· simulated angle</small></b></div>
    <div className="anatomy-map">
      <svg viewBox={viewBox} preserveAspectRatio="xMidYMid meet" role="group" aria-label="TonyBot 17 DOF servo anatomy map">
        <title>TonyBot front view: 16 body bus servos and one PWM head servo</title>
        <defs><pattern id={patternId} width="16" height="16" patternUnits="userSpaceOnUse"><circle cx="2" cy="2" r="0.7" fill="#bfd0e9" /></pattern></defs>
        <rect x="-500" y="-300" width="1000" height="1100" fill={`url(#${patternId})`} />
        <g className="anatomy-dimensions" aria-hidden="true">
          <path d="M-112 0h-10m5 0v383m-5 0h10" />
          <text x="-125" y="191.5" textAnchor="middle" transform="rotate(-90 -125 191.5)">{TONYBOT_DIMENSIONS.heightMm} mm · standing</text>
        </g>
        <path className="anatomy-torso" d="M-50 74 L50 74 L53 137 L0 159 L-53 137 Z" />
        <path className="anatomy-brace" d="M0 54 V76 M-57 83 H57 M-45.5 160 H45.5" />
        <path className="anatomy-heartbeat" d="M-31 110 H-9 L-5 102 L2 122 L7 110 H31" />
        {geometry.chains.map((chain, index) => <polyline key={index} className="anatomy-limb" data-limb={index} points={chain.map((point) => `${point.x},${point.y}`).join(' ')} />)}
        {geometry.feet.map((foot, index) => <g key={index} transform={`translate(${foot.center.x} ${foot.center.y}) rotate(${foot.angle})`}>
          <path className="anatomy-foot" d="M-39 0 L-30 -10 H30 L39 0 Z" />
        </g>)}
        <g className="anatomy-head">
          <rect x="-23" y="0" width="46" height="52" rx="13" />
          <g transform={`translate(${headTurn * 8} 0)`}>
            <ellipse cx="-10" cy="27" rx={6 - Math.abs(headTurn) * 2} ry="7" />
            <ellipse cx="10" cy="27" rx={6 - Math.abs(headTurn) * 2} ry="7" />
          </g>
        </g>
        {MOTION_JOINTS.map((item) => {
          const point = geometry.joints[item.id];
          return <g key={item.id} role="button" tabIndex={0} aria-label={item.label} aria-pressed={selected === item.id}
            className={`anatomy-joint ${selected === item.id ? 'is-selected' : ''} ${item.busId === null ? 'is-pwm' : ''}`}
            data-joint={item.id} transform={`translate(${point.x} ${point.y})`} onClick={() => onSelect(item.id)}
            onKeyDown={(event) => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); onSelect(item.id); } }}>
            <title>{item.label}: {Math.round(pose[item.id])}° · {item.busId === null ? 'LFD-01M PWM' : 'LX-824HV bus'}</title>
            <circle className="anatomy-hit-area" r="12" />
            <circle className="anatomy-joint-ring" r="8.5" />
            <text y="3" textAnchor="middle">{item.diagramId}</text>
          </g>;
        })}
        <g className="anatomy-angle-indicator" transform={`translate(${selectedPoint.x} ${selectedPoint.y}) rotate(${pose[selected]})`} aria-hidden="true">
          <path d="M0 -11v-5" />
        </g>
        <g className="anatomy-cog" transform={`translate(${cog.x * 1.5} ${151 + cog.y})`} aria-label="Illustrative center of gravity">
          <circle r="7" /><path d="M-11 0h22M0 -11v22" />
        </g>
      </svg>
    </div>
    <figcaption className="anatomy-caption">
      <span>Front view · robot’s right is on your left</span>
      <span>16 × LX-824HV bus + 1 × LFD-01M head (PWM)</span>
      <span>Body: 383 × 190 × 105 mm · motion shown as a 2D projection</span>
      <a href={SERVO_MAP_SOURCE} target="_blank" rel="noreferrer">Official servo &amp; dimension diagrams ↗</a>
    </figcaption>
  </figure>;
}
