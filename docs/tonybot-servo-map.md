# Tonybot anatomy reference

The simulator uses Hiwonder's front-view **17-DOF diagram**, cross-checked against the PC software's **Human Mode** screenshot. Right and left refer to the robot: its right side is on the viewer's left.

| Joint | Robot right | Robot left |
| --- | --- | --- |
| Shoulder pitch (inner shoulder) | 16 | 8 |
| Shoulder roll (outer shoulder) | 15 | 7 |
| Elbow | 14 | 6 |
| Hip roll | 13 | 5 |
| Hip pitch | 12 | 4 |
| Knee | 11 | 3 |
| Ankle pitch | 10 | 2 |
| Ankle roll | 9 | 1 |

The separate head pan/yaw servo is **17 in the product illustration**, but is **not bus address 17**. The PC course explicitly limits Human Mode to bus IDs 1–16. The Arduino serial example operates the head using `Servo sonarServo`, `attach(IO_Servo)`, and `write(90)` separately from `LobotServoController`. The product lists LX-824HV high-voltage bus servos and the LFD-01M anti-blocking servo. Axis names describe the depicted mechanisms; the diagrams themselves label IDs.

## Dimensions and rendering

The product lists **383 × 190 × 105 mm**. Its dimension drawing additionally marks a **223 mm** hip-to-ground region, **169 mm** overall foot span and **78 mm** foot width. The map uses a 383-unit standing height, the 223-unit lower body region, and the foot measurements. Other individual link lengths are illustrative estimates from the front view, not manufacturer CAD. The 190 mm product width is not used to force the SVG aspect ratio; an outstretched-arm pose has a different bounding box.

The map uses uniform SVG scaling and fits the complete choreography into the viewport. Pitch motion has a small lateral projection to make depth motion visible in 2D. Head yaw changes the direction of the face; each of the 16 body joints has an independent target. Joint numbers stay on their physical pivots. Simulator degrees and editing limits are **not hardware pulse values or calibrated mechanical limits**. The PC course uses 0–1000 position units, not these degree values.

## Persistence

Sequencer storage version 2 retains named joint angles from earlier unversioned saves and expands `knees` into independent `lKnee` and `rKnee` targets. The earlier invented hip-yaw fields are removed and the previously absent shoulder-roll targets default to neutral. Removed selection IDs fall back to the right knee. This migration does not touch curriculum progress.

## Official sources (inspected September 27, 2026)

- [Tonybot product specifications](https://www.hiwonder.com/products/tonybot)
- [17-DOF numbered diagram](https://cdn.shopify.com/s/files/1/0084/2799/5187/files/1.1_81850a37-d893-4bab-9a72-739f29636879.jpg?v=1742894080)
- [Dimensional diagram](https://cdn.shopify.com/s/files/1/0084/2799/5187/files/19_9740a53f-b9e1-4c75-8468-41a4b902dad4.jpg?v=1742876125)
- [PC software course §3.1.3](https://wiki.hiwonder.com/projects/Tonybot/en/latest/docs/3.pc_software_action_control_course.html#_3-1-3-function-description)
- [Human Mode numbered screenshot](https://wiki.hiwonder.com/projects/Tonybot/en/latest/assets/image9.D7DAAOAF.webp)
- Bundled Arduino source: `knowledge-base/raw/github/Hiwonder-Tonybot/Arduino/串口通信实操课程/Tonybot_base/Tonybot_base.ino`, head control and setup.

The prior mock incorrectly numbered the head as bus 1, used paired odd/even body IDs, and added hip yaw. Those assignments were not from the official diagrams and have been replaced.
