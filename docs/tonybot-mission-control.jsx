import React, { useState, useMemo, useEffect, useRef, useCallback } from "react";
import {
  Bot, Cpu, Eye, Mic, Radar, Code2, CheckCircle2, Circle,
  ChevronRight, Users, Shuffle, Trophy, Rocket, Layers, Flag, X,
  Printer, ArrowLeft, Crosshair, Play, Pause, RotateCcw, Target,
  ExternalLink, Music, Sparkles, RefreshCw,
} from "lucide-react";

const HARDWARE = [
  { tag: "Actuation", name: "17 Serial Bus Servos", icon: Cpu, color: "#FF8A5B",
    desc: "Feed back angle, temperature, and voltage so TonyBot can walk, dance, and do push-ups without losing balance." },
  { tag: "AI Vision", name: "ESP32-S3 HD Camera", icon: Eye, color: "#4FD1FF",
    desc: "A 2MP camera that streams over Wi‑Fi and can track colors, recognize faces, and follow lines." },
  { tag: "Voice", name: "WonderEcho Module", icon: Mic, color: "#C6A6FF",
    desc: "Listens for spoken commands and runs the matching action, right on the robot — no internet needed." },
  { tag: "Sensors", name: "Ultrasonic + IMU", icon: Radar, color: "#6EE7B7",
    desc: "Measures distance to spot obstacles and tracks tilt so TonyBot knows when it's about to fall." },
];

const PHASES = [
  {
    id: 1, code: "Mission 1", name: "Foundations & Kinesthetic Logic", level: "Beginner", color: "#FF8A5B",
    focus: "Understand the hardware, feel how balance works, and build choreography with no syntax required.",
    objectives: [
      "Explain degrees of freedom and how joints mirror human movement",
      "Use the PC debugging software to pose TonyBot's arms and legs",
      "Build a sequence-based action group",
    ],
    activities: [
      { title: "Digital Marionette", detail: "Use the graphical slider software to pose TonyBot frame by frame, recording a custom 5‑second victory dance." },
      { title: "App Telemetry & Remote Control", detail: "Drive TonyBot with the tablet app and watch how shifting its center of gravity changes how stable each step feels." },
    ],
    assessment: "Compile and export a 3‑step action sequence — Bow → Stand → Wave — and play it back on the real robot.",
  },
  {
    id: 2, code: "Mission 2", name: "Visual Logic & Block-Based Programming", level: "Intermediate I", color: "#4FD1FF",
    focus: "Bring in loops, conditionals, and events using Scratch blocks, wired to real sensors.",
    objectives: [
      "Use sequences, repeat loops, and if–else blocks correctly",
      "Read ultrasonic and IMU sensor values inside a logic loop",
    ],
    activities: [
      { title: "Smart Guard Obstacle Avoider", detail: "Walk forward until the ultrasonic sensor reads under 20 cm, then step back, turn right, and speak a warning." },
      { title: "Color-Triggered Reflexes", detail: "Wire the vision blocks so a red block triggers a happy dance and a blue block triggers a crouch." },
    ],
    assessment: "Navigate a simple maze autonomously using only sensor‑triggered block scripts.",
  },
  {
    id: 3, code: "Mission 3", name: "Transition to Text & Structured Logic", level: "Intermediate II", color: "#C6A6FF",
    focus: "Carry the same logic from blocks into Python syntax — functions, variables, arguments.",
    objectives: [
      "Translate a block script into an equivalent Python structure",
      "Trace execution flow and debug a text-based error",
    ],
    activities: [
      { title: "Voice-Activated Commands", detail: "Map WonderEcho keywords to action groups in Python, so saying \"Forward\" calls walk_forward()." },
      { title: "The Balance Keepers", detail: "Read the IMU tilt angle in code and trigger a fall‑recovery or shutdown sequence when it exceeds a safe limit." },
    ],
    assessment: "Write a script that listens for a custom voice command, checks distance with the ultrasonic sensor, and reports it back.",
  },
  {
    id: 4, code: "Mission 4", name: "Applied AI & Autonomous Capstone", level: "Advanced", color: "#6EE7B7",
    focus: "Combine vision, movement, and logic into one open-ended autonomous project.",
    objectives: [
      "Explain color thresholding and face tracking at a basic level",
      "Design and defend an original vision‑plus‑movement routine",
    ],
    activities: [
      { title: "The Autonomous Tracker", detail: "Lock onto a moving colored ball with the camera feed and adjust the yaw servos to keep tracking it.", hasWalkthrough: true },
      { title: "Capstone: The Robot Assistant", detail: "In teams, combine face recognition, voice prompting, and movement so TonyBot greets a recognized user by name." },
    ],
    assessment: "Present the finished routine at a maker‑faire style showcase, explaining the code, the hardware, and what broke along the way.",
  },
];

const SCRATCH_PROJECTS = [
  {
    id: "moonwalk",
    title: "Moonwalk-Inspired Dance",
    icon: Music,
    color: "#4FD1FF",
    desc: "A short, safe, moonwalk-inspired routine built from TonyBot's prebuilt dance action groups — intro, repeated backward glide, accent turn, and a safe stop.",
    tag: "Mission 2 · Scratch",
    url: "https://claude.ai/artifact/71ay8ZcbDaqRigkinNaC2a",
  },
  {
    id: "breathing-light",
    title: "Breathing Light",
    icon: Sparkles,
    color: "#8C6BFF",
    desc: "The ultrasonic RGB LEDs smoothly brighten and dim like a breathing light, with an optional multicolor cycling version.",
    tag: "Mission 2 · Scratch",
    url: "https://claude.ai/artifact/N6oXc3rZJifB1uzUeL1hhh",
  },
  {
    id: "walk-circle",
    title: "Walk in a Circle",
    icon: RefreshCw,
    color: "#4FA3FF",
    desc: "Repeated forward-and-turn segments trace a circular path, with a configurable Walk Circle block for segment count and direction.",
    tag: "Mission 2 · Scratch",
    url: "https://claude.ai/artifact/RiRPQeh2XUQdBTQoB2N3Bm",
  },
];

const TRACKER_STEPS = [
  {
    id: "see",
    title: "1. See the ball",
    icon: Eye,
    explain: "The camera grabs a frame and looks only for pixels inside a chosen color range — this is color thresholding. Everything else in the frame is ignored.",
    code: `# pseudocode — color thresholding
frame = camera.read()
mask = threshold(frame, color="orange", 
                  low=(5,150,150), high=(20,255,255))
ball = find_largest_blob(mask)`,
  },
  {
    id: "locate",
    title: "2. Find its position",
    icon: Crosshair,
    explain: "Once a blob is found, its center point (cx, cy) tells us where the ball is in the frame. We compare that to the frame's center to get an error — how far off-target we are.",
    code: `if ball is not None:
    cx, cy = ball.center
    frame_center_x = frame.width / 2
    error_x = cx - frame_center_x
else:
    error_x = 0  # ball not visible`,
  },
  {
    id: "adjust",
    title: "3. Adjust the yaw servo",
    icon: Radar,
    explain: "A small proportional controller: the bigger the error, the bigger the correction. gain controls how aggressively TonyBot turns to re-center the ball.",
    code: `gain = 0.05
yaw_angle += error_x * gain
yaw_angle = clamp(yaw_angle, -90, 90)
set_servo("yaw", yaw_angle)`,
  },
  {
    id: "loop",
    title: "4. Repeat, forever",
    icon: Play,
    explain: "Wrap steps 1–3 in a loop that runs continuously, so TonyBot keeps re-centering the ball as it moves — this is the full tracking behavior.",
    code: `while True:
    frame = camera.read()
    mask = threshold(frame, color="orange", ...)
    ball = find_largest_blob(mask)
    if ball is not None:
        error_x = ball.center[0] - frame.width/2
        yaw_angle += error_x * gain
        set_servo("yaw", clamp(yaw_angle, -90, 90))`,
  },
];

function useCompletion() {
  const [done, setDone] = useState(() => new Set());
  const toggle = (key) =>
    setDone((prev) => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });
  return [done, toggle];
}

function ProgressRing({ pct, color }) {
  const r = 17;
  const c = 2 * Math.PI * r;
  return (
    <svg width="42" height="42" viewBox="0 0 42 42">
      <circle cx="21" cy="21" r={r} fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="4" />
      <circle
        cx="21" cy="21" r={r} fill="none" stroke={color} strokeWidth="4"
        strokeDasharray={c} strokeDashoffset={c - (pct / 100) * c}
        strokeLinecap="round" transform="rotate(-90 21 21)"
        style={{ transition: "stroke-dashoffset 400ms ease" }}
      />
      <text x="21" y="25" textAnchor="middle" fontSize="11" fill="#F1F3FF" fontFamily="Space Mono, monospace">
        {pct}%
      </text>
    </svg>
  );
}

function ProgressBar({ pct, color }) {
  return (
    <div style={styles.barTrack}>
      <div style={{ ...styles.barFill, width: `${pct}%`, background: color }} />
    </div>
  );
}

function Checkline({ checked, onClick, color, children }) {
  return (
    <button onClick={onClick} style={styles.checklineBtn}>
      {checked ? <CheckCircle2 size={16} color={color} /> : <Circle size={16} color="#5B6390" />}
      <span style={{ textDecoration: checked ? "line-through" : "none", opacity: checked ? 0.6 : 1 }}>
        {children}
      </span>
    </button>
  );
}

function PairingTool() {
  const [names, setNames] = useState(["Ada", "Sam", "Priya", "Leo"]);
  const [input, setInput] = useState("");
  const [pairs, setPairs] = useState(null);

  const addName = () => {
    const v = input.trim();
    if (!v) return;
    setNames((n) => [...n, v]);
    setInput("");
  };
  const removeName = (i) => setNames((n) => n.filter((_, idx) => idx !== i));

  const shuffle = () => {
    if (names.length < 2) return;
    const shuffled = [...names].sort(() => Math.random() - 0.5);
    const result = [];
    for (let i = 0; i < shuffled.length; i += 2) {
      if (shuffled[i + 1]) {
        const swap = Math.random() < 0.5;
        result.push({
          navigator: swap ? shuffled[i + 1] : shuffled[i],
          pilot: swap ? shuffled[i] : shuffled[i + 1],
        });
      } else {
        result.push({ navigator: shuffled[i], pilot: null });
      }
    }
    setPairs(result);
  };

  return (
    <div style={styles.panel}>
      <div style={styles.panelHeadRow}>
        <Users size={18} color="#C6A6FF" />
        <span style={styles.panelHeadText}>Navigator &amp; Pilot pairing</span>
      </div>
      <p style={styles.mutedSmall}>
        One student tracks the logic on paper, the other tests it on TonyBot. Add your roster, then shuffle.
      </p>
      <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && addName()}
          placeholder="Add a student name"
          style={styles.input}
        />
        <button onClick={addName} style={styles.smallBtn}>Add</button>
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 10 }}>
        {names.map((n, i) => (
          <span key={i} style={styles.chip}>
            {n}
            <X size={12} style={{ marginLeft: 6, cursor: "pointer" }} onClick={() => removeName(i)} />
          </span>
        ))}
      </div>
      <button onClick={shuffle} style={styles.primaryBtn} disabled={names.length < 2}>
        <Shuffle size={15} /> Shuffle pairs
      </button>
      {pairs && (
        <div style={{ marginTop: 14, display: "flex", flexDirection: "column", gap: 8 }}>
          {pairs.map((p, i) => (
            <div key={i} style={styles.pairRow}>
              <span style={styles.pairBadge("#4FD1FF")}>Navigator · {p.navigator}</span>
              {p.pilot ? (
                <span style={styles.pairBadge("#FF8A5B")}>Pilot · {p.pilot}</span>
              ) : (
                <span style={styles.mutedSmall}>solo this round</span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ---------------- Mission Control view ---------------- */

function MissionControlView({ selected, setSelected, done, toggle, phaseItemKeys, pctFor, overallPct, openWalkthrough }) {
  const phase = PHASES.find((p) => p.id === selected);
  return (
    <>
      <div style={styles.hudRow}>
        {HARDWARE.map((h) => (
          <div key={h.name} style={{ ...styles.hudCard, borderColor: h.color + "55" }}>
            <div style={{ ...styles.hudIconWrap, background: h.color + "22", color: h.color }}>
              <h.icon size={16} />
            </div>
            <div>
              <div style={{ ...styles.hudTag, color: h.color }}>{h.tag}</div>
              <div style={styles.hudName}>{h.name}</div>
              <div style={styles.hudDesc}>{h.desc}</div>
            </div>
          </div>
        ))}
      </div>

      <div style={styles.body}>
        <div style={styles.pathCol}>
          <div style={styles.sectionLabel}><Layers size={14} /> Mission path</div>
          {PHASES.map((p, i) => {
            const pct = pctFor(p);
            const active = p.id === selected;
            return (
              <div key={p.id} style={{ display: "flex", flexDirection: "column" }}>
                <button
                  onClick={() => setSelected(p.id)}
                  style={{
                    ...styles.node,
                    borderColor: active ? p.color : "rgba(255,255,255,0.1)",
                    background: active ? p.color + "1A" : "rgba(255,255,255,0.03)",
                  }}
                >
                  <div style={{ ...styles.nodeDot, background: p.color, opacity: pct === 100 ? 1 : 0.55 }}>
                    {pct === 100 ? <Trophy size={13} color="#0B0E1F" /> : <span style={styles.nodeNum}>{p.id}</span>}
                  </div>
                  <div style={{ textAlign: "left", flex: 1 }}>
                    <div style={styles.nodeCode}>{p.code} · {p.level}</div>
                    <div style={styles.nodeName}>{p.name}</div>
                  </div>
                  <ChevronRight size={16} color={active ? p.color : "#5B6390"} />
                </button>
                {i < PHASES.length - 1 && <div style={styles.connector} />}
              </div>
            );
          })}
          <div style={{ marginTop: 18 }}>
            <PairingTool />
          </div>
        </div>

        <div style={styles.detailCol}>
          <div style={{ ...styles.detailCard, borderTop: `3px solid ${phase.color}` }}>
            <div style={styles.detailHeadRow}>
              <Rocket size={18} color={phase.color} />
              <span style={{ ...styles.detailEyebrow, color: phase.color }}>{phase.code} · {phase.level}</span>
            </div>
            <h2 style={styles.detailTitle}>{phase.name}</h2>
            <p style={styles.detailFocus}>{phase.focus}</p>
            <ProgressBar pct={pctFor(phase)} color={phase.color} />

            <div style={styles.blockLabel}>Learning objectives</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {phase.objectives.map((o, i) => {
                const key = `p${phase.id}-obj-${i}`;
                return (
                  <Checkline key={key} checked={done.has(key)} onClick={() => toggle(key)} color={phase.color}>
                    {o}
                  </Checkline>
                );
              })}
            </div>

            <div style={styles.blockLabel}>Core activities</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {phase.activities.map((a, i) => {
                const key = `p${phase.id}-act-${i}`;
                const checked = done.has(key);
                return (
                  <div key={key} style={{ ...styles.activityCard, borderColor: checked ? phase.color + "66" : "rgba(255,255,255,0.08)" }}>
                    <button onClick={() => toggle(key)} style={styles.checkBtn}>
                      {checked ? <CheckCircle2 size={18} color={phase.color} /> : <Circle size={18} color="#5B6390" />}
                    </button>
                    <div style={{ flex: 1 }}>
                      <div style={{ ...styles.activityTitle, textDecoration: checked ? "line-through" : "none", opacity: checked ? 0.6 : 1 }}>
                        {a.title}
                      </div>
                      <div style={styles.activityDetail}>{a.detail}</div>
                      {a.hasWalkthrough && (
                        <button onClick={openWalkthrough} style={{ ...styles.walkthroughBtn, borderColor: phase.color + "66", color: phase.color }}>
                          <Code2 size={13} /> Open code walkthrough
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            <div style={{ ...styles.assessCard, borderColor: phase.color + "55" }}>
              <div style={styles.assessHeadRow}>
                <Flag size={15} color={phase.color} />
                <span style={{ ...styles.assessLabel, color: phase.color }}>Mission checkpoint</span>
              </div>
              <p style={styles.assessText}>{phase.assessment}</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

/* ---------------- Printable teacher view ---------------- */

function PrintView() {
  return (
    <div style={styles.printPage}>
      <div style={styles.printOnlyBar} className="no-print">
        <button onClick={() => window.print()} style={styles.printBtn}>
          <Printer size={15} /> Print this page
        </button>
        <span style={styles.printHint}>Prints in light mode, one mission per section.</span>
      </div>

      <div style={styles.printHeader}>
        <div>
          <div style={styles.printEyebrow}>HiWonder TonyBot · Grade 5 Curriculum</div>
          <h1 style={styles.printH1}>Teacher Reference — All Missions</h1>
        </div>
        <div style={styles.printMeta}>
          <div>Class: _______________________</div>
          <div>Date: ________________________</div>
        </div>
      </div>

      <div style={styles.printHardwareRow}>
        {HARDWARE.map((h) => (
          <div key={h.name} style={styles.printHwCell}>
            <strong>{h.tag}</strong> — {h.name}: {h.desc}
          </div>
        ))}
      </div>

      {PHASES.map((p) => (
        <div key={p.id} style={styles.printSection} className="print-section">
          <div style={{ ...styles.printPhaseBar, background: p.color }} />
          <div style={styles.printSectionInner}>
            <div style={styles.printPhaseHead}>
              {p.code} · {p.level} — {p.name}
            </div>
            <p style={styles.printFocus}>{p.focus}</p>

            <div style={styles.printColLabel}>Learning objectives</div>
            <ul style={styles.printList}>
              {p.objectives.map((o, i) => (
                <li key={i} style={styles.printListItem}>
                  <span style={styles.printCheckbox} /> {o}
                </li>
              ))}
            </ul>

            <div style={styles.printColLabel}>Core activities</div>
            <ul style={styles.printList}>
              {p.activities.map((a, i) => (
                <li key={i} style={styles.printListItem}>
                  <span style={styles.printCheckbox} /> <strong>{a.title}.</strong> {a.detail}
                </li>
              ))}
            </ul>

            <div style={styles.printAssess}>
              <strong>Mission checkpoint:</strong> {p.assessment}
            </div>
          </div>
        </div>
      ))}

      <div style={styles.printFooterNote}>
        Safety note: keep TonyBot tethered or suspended by a harness during initial code testing on every new routine.
      </div>
    </div>
  );
}

/* ---------------- Vision tracking walkthrough ---------------- */

function TrackerWalkthrough({ onBack }) {
  const [openStep, setOpenStep] = useState("see");
  const [ball, setBall] = useState({ x: 250, y: 90 });
  const [reticle, setReticle] = useState({ x: 150, y: 90 });
  const [tracking, setTracking] = useState(false);
  const dragging = useRef(false);
  const svgRef = useRef(null);

  const FRAME_W = 300;
  const FRAME_H = 180;
  const gain = 0.12;

  useEffect(() => {
    if (!tracking) return;
    const id = setInterval(() => {
      setReticle((r) => {
        const errorX = ball.x - r.x;
        const errorY = ball.y - r.y;
        return { x: r.x + errorX * gain, y: r.y + errorY * gain };
      });
    }, 60);
    return () => clearInterval(id);
  }, [tracking, ball]);

  const errorX = Math.round(ball.x - reticle.x);
  const yawEstimate = Math.round(errorX * 0.05 * 10) / 10;

  const pointerToLocal = (e) => {
    const rect = svgRef.current.getBoundingClientRect();
    const scaleX = FRAME_W / rect.width;
    const scaleY = FRAME_H / rect.height;
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    return {
      x: Math.max(14, Math.min(FRAME_W - 14, (clientX - rect.left) * scaleX)),
      y: Math.max(14, Math.min(FRAME_H - 14, (clientY - rect.top) * scaleY)),
    };
  };

  const onDown = (e) => { dragging.current = true; setBall(pointerToLocal(e)); };
  const onMove = (e) => { if (dragging.current) setBall(pointerToLocal(e)); };
  const onUp = () => { dragging.current = false; };

  const reset = () => {
    setTracking(false);
    setBall({ x: 250, y: 90 });
    setReticle({ x: 150, y: 90 });
  };

  return (
    <div>
      <button onClick={onBack} style={styles.backBtn}><ArrowLeft size={15} /> Back to mission control</button>

      <div style={{ ...styles.detailCard, borderTop: "3px solid #6EE7B7", marginTop: 14 }}>
        <div style={styles.detailHeadRow}>
          <Target size={18} color="#6EE7B7" />
          <span style={{ ...styles.detailEyebrow, color: "#6EE7B7" }}>Mission 4 · Code walkthrough</span>
        </div>
        <h2 style={styles.detailTitle}>The Autonomous Tracker</h2>
        <p style={styles.detailFocus}>
          TonyBot's camera finds a colored ball and its yaw servo keeps turning to re-center it.
          Drag the ball around the frame below, then hit run to see the tracking loop catch up to it —
          the same proportional-control idea as the code on the right.
        </p>

        <div style={styles.trackerLayout}>
          <div>
            <svg
              ref={svgRef}
              viewBox={`0 0 ${FRAME_W} ${FRAME_H}`}
              style={styles.trackerFrame}
              onMouseDown={onDown} onMouseMove={onMove} onMouseUp={onUp} onMouseLeave={onUp}
              onTouchStart={onDown} onTouchMove={onMove} onTouchEnd={onUp}
            >
              <rect x="0" y="0" width={FRAME_W} height={FRAME_H} fill="#0B0E1F" rx="10" />
              <line x1={FRAME_W / 2} y1="0" x2={FRAME_W / 2} y2={FRAME_H} stroke="#2A3160" strokeWidth="1" strokeDasharray="4 4" />
              <circle cx={ball.x} cy={ball.y} r="12" fill="#FF8A5B" style={{ cursor: "grab" }} />
              <text x={ball.x} y={ball.y + 26} textAnchor="middle" fontSize="8" fill="#9BA2C7" fontFamily="Space Mono, monospace">ball</text>
              <circle cx={reticle.x} cy={reticle.y} r="16" fill="none" stroke="#6EE7B7" strokeWidth="2" />
              <line x1={reticle.x - 22} y1={reticle.y} x2={reticle.x + 22} y2={reticle.y} stroke="#6EE7B7" strokeWidth="1" />
              <line x1={reticle.x} y1={reticle.y - 22} x2={reticle.x} y2={reticle.y + 22} stroke="#6EE7B7" strokeWidth="1" />
            </svg>

            <div style={styles.trackerControls}>
              <button onClick={() => setTracking((t) => !t)} style={styles.primaryBtnSmall}>
                {tracking ? <Pause size={14} /> : <Play size={14} />} {tracking ? "Pause" : "Run tracking loop"}
              </button>
              <button onClick={reset} style={styles.smallBtn}><RotateCcw size={13} /> Reset</button>
            </div>

            <div style={styles.telemetry}>
              <div><span style={styles.mutedSmall}>error_x</span><div style={styles.telemetryVal}>{errorX}px</div></div>
              <div><span style={styles.mutedSmall}>yaw adjust</span><div style={styles.telemetryVal}>{yawEstimate}°</div></div>
            </div>
          </div>

          <div style={styles.stepsCol}>
            {TRACKER_STEPS.map((s) => {
              const open = openStep === s.id;
              return (
                <div key={s.id} style={{ ...styles.stepCard, borderColor: open ? "#6EE7B766" : "rgba(255,255,255,0.08)" }}>
                  <button onClick={() => setOpenStep(open ? null : s.id)} style={styles.stepHeadBtn}>
                    <s.icon size={15} color="#6EE7B7" />
                    <span style={styles.stepTitle}>{s.title}</span>
                    <ChevronRight size={15} color="#5B6390" style={{ marginLeft: "auto", transform: open ? "rotate(90deg)" : "none", transition: "transform 150ms" }} />
                  </button>
                  {open && (
                    <div style={styles.stepBody}>
                      <p style={styles.stepExplain}>{s.explain}</p>
                      <pre style={styles.codeBlock}><code>{s.code}</code></pre>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------------- Scratch projects view ---------------- */

function ScratchProjectsView() {
  return (
    <div>
      <div style={styles.detailHeadRow}>
        <Code2 size={18} color="#4FD1FF" />
        <span style={{ ...styles.detailEyebrow, color: "#4FD1FF" }}>Mission 2 · WonderCode / Scratch</span>
      </div>
      <h2 style={styles.detailTitle}>Scratch Projects</h2>
      <p style={styles.detailFocus}>
        Three ready-to-build WonderCode routines, each with real Scratch-style block diagrams, setup steps, and a safety-first testing order. Open one to follow along in WonderCode.
      </p>

      <div style={styles.projectsGrid}>
        {SCRATCH_PROJECTS.map((p) => (
          <a key={p.id} href={p.url} target="_blank" rel="noopener noreferrer" style={{ ...styles.projectCard, borderColor: p.color + "55" }}>
            <div style={{ ...styles.projectIconWrap, background: p.color + "22", color: p.color }}>
              <p.icon size={20} />
            </div>
            <div style={{ ...styles.projectTag, color: p.color }}>{p.tag}</div>
            <div style={styles.projectTitle}>{p.title}</div>
            <p style={styles.projectDesc}>{p.desc}</p>
            <div style={{ ...styles.projectLink, color: p.color }}>
              Open project <ExternalLink size={13} />
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}

/* ---------------- Root app ---------------- */

export default function TonyBotMissionControl() {
  const [view, setView] = useState("control"); // control | print | walkthrough
  const [selected, setSelected] = useState(1);
  const [done, toggle] = useCompletion();

  const phaseItemKeys = useCallback((p) => [
    ...p.objectives.map((_, i) => `p${p.id}-obj-${i}`),
    ...p.activities.map((_, i) => `p${p.id}-act-${i}`),
  ], []);

  const pctFor = (p) => {
    const keys = phaseItemKeys(p);
    const completed = keys.filter((k) => done.has(k)).length;
    return Math.round((completed / keys.length) * 100);
  };

  const overallPct = useMemo(() => {
    const all = PHASES.flatMap(phaseItemKeys);
    const completed = all.filter((k) => done.has(k)).length;
    return Math.round((completed / all.length) * 100);
  }, [done, phaseItemKeys]);

  return (
    <div style={styles.page}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:wght@500;700;800&family=Space+Mono:wght@400;700&family=Inter:wght@400;500;600&display=swap');
        * { box-sizing: border-box; }
        ::selection { background: #FF8A5B55; }
        button:disabled { opacity: 0.4; cursor: not-allowed; }
        @media print {
          .no-print, .app-chrome { display: none !important; }
          .print-section { break-inside: avoid; page-break-after: auto; }
        }
      `}</style>

      <div style={styles.header} className="app-chrome">
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={styles.botIconWrap}><Bot size={22} color="#0B0E1F" /></div>
          <div>
            <div style={styles.eyebrow}>HiWonder TonyBot · Grade 5 Curriculum</div>
            <h1 style={styles.h1}>Mission Control</h1>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <nav style={styles.tabRow}>
            <button onClick={() => setView("control")} style={styles.tabBtn(view === "control")}>Mission control</button>
            <button onClick={() => setView("projects")} style={styles.tabBtn(view === "projects")}><Code2 size={13} /> Scratch projects</button>
            <button onClick={() => setView("print")} style={styles.tabBtn(view === "print")}><Printer size={13} /> Teacher print view</button>
          </nav>
          {view === "control" && (
            <div style={styles.overallWrap}>
              <ProgressRing pct={overallPct} color="#6EE7B7" />
              <div>
                <div style={styles.mutedSmall}>Program complete</div>
                <div style={styles.overallLabel}>{overallPct === 100 ? "All missions flown" : "In progress"}</div>
              </div>
            </div>
          )}
        </div>
      </div>

      {view === "print" ? (
        <PrintView />
      ) : (
        <div style={{ maxWidth: 1180, margin: "0 auto" }}>
          {view === "walkthrough" ? (
            <TrackerWalkthrough onBack={() => setView("control")} />
          ) : view === "projects" ? (
            <ScratchProjectsView />
          ) : (
            <MissionControlView
              selected={selected} setSelected={setSelected}
              done={done} toggle={toggle}
              phaseItemKeys={phaseItemKeys} pctFor={pctFor} overallPct={overallPct}
              openWalkthrough={() => setView("walkthrough")}
            />
          )}
          <div style={styles.footer} className="app-chrome">
            <Code2 size={13} color="#5B6390" />
            <span>Tethered or harnessed testing recommended for every new routine — gravity doesn't do retakes.</span>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    background: "radial-gradient(circle at 15% 0%, #171C3D 0%, #0D1026 45%, #0A0C1E 100%)",
    color: "#F1F3FF",
    fontFamily: "'Inter', sans-serif",
    padding: "28px 24px 40px",
  },
  header: {
    display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap",
    gap: 16, maxWidth: 1180, margin: "0 auto 22px",
  },
  botIconWrap: {
    width: 42, height: 42, borderRadius: 10,
    background: "linear-gradient(135deg, #FF8A5B, #FFC98A)",
    display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
  },
  eyebrow: { fontSize: 12, letterSpacing: 0.3, color: "#8890B5", fontFamily: "'Space Mono', monospace" },
  h1: { fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 800, fontSize: 30, margin: "2px 0 0" },
  overallWrap: { display: "flex", alignItems: "center", gap: 10 },
  overallLabel: { fontSize: 14, fontWeight: 600 },
  mutedSmall: { fontSize: 12, color: "#8890B5" },

  tabRow: { display: "flex", gap: 6, background: "rgba(255,255,255,0.04)", padding: 4, borderRadius: 10 },
  tabBtn: (active) => ({
    display: "flex", alignItems: "center", gap: 6,
    background: active ? "rgba(255,255,255,0.1)" : "transparent",
    border: "none", borderRadius: 8, padding: "7px 12px",
    color: active ? "#F1F3FF" : "#8890B5", fontSize: 13, fontWeight: 600, cursor: "pointer",
  }),

  hudRow: {
    maxWidth: 1180, margin: "0 auto 26px",
    display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))", gap: 10,
  },
  hudCard: { display: "flex", gap: 10, alignItems: "flex-start", background: "rgba(255,255,255,0.03)", border: "1px solid", borderRadius: 12, padding: "12px 14px" },
  hudIconWrap: { width: 30, height: 30, borderRadius: 8, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" },
  hudTag: { fontSize: 10, fontFamily: "'Space Mono', monospace", letterSpacing: 0.4 },
  hudName: { fontSize: 13.5, fontWeight: 600, margin: "2px 0 3px" },
  hudDesc: { fontSize: 12, color: "#9BA2C7", lineHeight: 1.4 },

  body: { maxWidth: 1180, margin: "0 auto", display: "grid", gridTemplateColumns: "340px 1fr", gap: 20 },
  sectionLabel: { display: "flex", alignItems: "center", gap: 6, fontSize: 12, fontFamily: "'Space Mono', monospace", color: "#8890B5", marginBottom: 10 },
  pathCol: { display: "flex", flexDirection: "column" },
  node: {
    display: "flex", alignItems: "center", gap: 10, width: "100%", textAlign: "left",
    border: "1px solid", borderRadius: 12, padding: "10px 12px", cursor: "pointer", color: "#F1F3FF",
  },
  nodeDot: { width: 26, height: 26, borderRadius: "50%", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" },
  nodeNum: { fontSize: 12, fontWeight: 700, color: "#0B0E1F" },
  nodeCode: { fontSize: 10.5, fontFamily: "'Space Mono', monospace", color: "#8890B5" },
  nodeName: { fontSize: 13.5, fontWeight: 600, marginTop: 1 },
  connector: { width: 1, height: 14, background: "rgba(255,255,255,0.14)", marginLeft: 23 },

  panel: { background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 14, padding: 16 },
  panelHeadRow: { display: "flex", alignItems: "center", gap: 8 },
  panelHeadText: { fontSize: 14, fontWeight: 700 },
  input: { flex: 1, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 8, padding: "7px 10px", color: "#F1F3FF", fontSize: 13, outline: "none" },
  smallBtn: { display: "flex", alignItems: "center", gap: 6, background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 8, padding: "7px 12px", color: "#F1F3FF", fontSize: 13, cursor: "pointer" },
  chip: { display: "inline-flex", alignItems: "center", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 20, padding: "4px 10px", fontSize: 12.5 },
  primaryBtn: {
    marginTop: 14, width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
    background: "linear-gradient(135deg, #C6A6FF, #8F6FE0)", border: "none", borderRadius: 10, padding: "10px 12px",
    color: "#0B0E1F", fontWeight: 700, fontSize: 13.5, cursor: "pointer",
  },
  primaryBtnSmall: {
    display: "flex", alignItems: "center", gap: 6,
    background: "linear-gradient(135deg, #6EE7B7, #45C98F)", border: "none", borderRadius: 8, padding: "8px 14px",
    color: "#0B0E1F", fontWeight: 700, fontSize: 13, cursor: "pointer",
  },
  pairRow: { display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", background: "rgba(255,255,255,0.03)", borderRadius: 8, padding: "7px 10px" },
  pairBadge: (c) => ({ fontSize: 12, fontWeight: 600, color: c, background: c + "1A", border: `1px solid ${c}44`, borderRadius: 20, padding: "3px 9px" }),

  detailCol: {},
  detailCard: { background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 16, padding: "22px 24px 26px" },
  detailHeadRow: { display: "flex", alignItems: "center", gap: 8 },
  detailEyebrow: { fontSize: 12, fontFamily: "'Space Mono', monospace", letterSpacing: 0.3 },
  detailTitle: { fontFamily: "'Bricolage Grotesque', sans-serif", fontSize: 24, fontWeight: 800, margin: "8px 0 6px" },
  detailFocus: { fontSize: 14.5, color: "#B7BEE0", lineHeight: 1.55, maxWidth: 640, margin: "0 0 14px" },

  barTrack: { height: 6, borderRadius: 4, background: "rgba(255,255,255,0.08)", overflow: "hidden", marginBottom: 20 },
  barFill: { height: "100%", borderRadius: 4, transition: "width 400ms ease" },

  blockLabel: { fontSize: 12.5, fontWeight: 700, color: "#8890B5", margin: "20px 0 10px" },
  checklineBtn: { display: "flex", alignItems: "center", gap: 9, background: "none", border: "none", color: "#F1F3FF", fontSize: 13.5, textAlign: "left", cursor: "pointer", padding: "3px 0" },
  activityCard: { display: "flex", gap: 10, alignItems: "flex-start", border: "1px solid", borderRadius: 12, padding: "12px 14px", background: "rgba(255,255,255,0.02)" },
  checkBtn: { background: "none", border: "none", cursor: "pointer", padding: 2, marginTop: 1 },
  activityTitle: { fontSize: 14, fontWeight: 700, marginBottom: 3 },
  activityDetail: { fontSize: 13, color: "#9BA2C7", lineHeight: 1.5 },
  walkthroughBtn: {
    display: "inline-flex", alignItems: "center", gap: 6, marginTop: 8,
    background: "transparent", border: "1px solid", borderRadius: 8, padding: "5px 10px", fontSize: 12, fontWeight: 600, cursor: "pointer",
  },

  assessCard: { marginTop: 22, border: "1px solid", borderRadius: 12, padding: "14px 16px", background: "rgba(255,255,255,0.02)" },
  assessHeadRow: { display: "flex", alignItems: "center", gap: 7 },
  assessLabel: { fontSize: 12.5, fontWeight: 700, fontFamily: "'Space Mono', monospace" },
  assessText: { fontSize: 13.5, color: "#D6DAF2", lineHeight: 1.55, margin: "6px 0 0" },

  footer: { maxWidth: 1180, margin: "26px auto 0", display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: "#5B6390" },

  /* scratch projects */
  projectsGrid: {
    display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 14, marginTop: 22,
  },
  projectCard: {
    display: "block", textDecoration: "none", color: "#F1F3FF",
    background: "rgba(255,255,255,0.03)", border: "1px solid", borderRadius: 14,
    padding: "18px 18px 16px", transition: "transform 150ms ease",
  },
  projectIconWrap: {
    width: 38, height: 38, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 12,
  },
  projectTag: { fontSize: 10.5, fontFamily: "'Space Mono', monospace", letterSpacing: 0.4, marginBottom: 6 },
  projectTitle: { fontSize: 16, fontWeight: 700, marginBottom: 6 },
  projectDesc: { fontSize: 13, color: "#9BA2C7", lineHeight: 1.55, margin: "0 0 16px" },
  projectLink: { fontSize: 12.5, fontWeight: 700, display: "inline-flex", alignItems: "center", gap: 6 },

  /* walkthrough */
  backBtn: { display: "flex", alignItems: "center", gap: 6, background: "none", border: "none", color: "#8890B5", fontSize: 13, cursor: "pointer", padding: "6px 0" },
  trackerLayout: { display: "grid", gridTemplateColumns: "300px 1fr", gap: 22, marginTop: 6 },
  trackerFrame: { width: "100%", borderRadius: 10, border: "1px solid rgba(255,255,255,0.1)", touchAction: "none", cursor: "grab" },
  trackerControls: { display: "flex", gap: 8, marginTop: 10 },
  telemetry: { display: "flex", gap: 20, marginTop: 14, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 10, padding: "10px 14px" },
  telemetryVal: { fontFamily: "'Space Mono', monospace", fontSize: 16, fontWeight: 700, color: "#6EE7B7" },

  stepsCol: { display: "flex", flexDirection: "column", gap: 8 },
  stepCard: { border: "1px solid", borderRadius: 12, background: "rgba(255,255,255,0.02)", overflow: "hidden" },
  stepHeadBtn: { width: "100%", display: "flex", alignItems: "center", gap: 8, background: "none", border: "none", padding: "12px 14px", cursor: "pointer", color: "#F1F3FF" },
  stepTitle: { fontSize: 13.5, fontWeight: 700 },
  stepBody: { padding: "0 14px 14px" },
  stepExplain: { fontSize: 13, color: "#B7BEE0", lineHeight: 1.55, margin: "0 0 10px" },
  codeBlock: {
    background: "#0B0E1F", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 8,
    padding: "12px 14px", fontSize: 12.5, lineHeight: 1.6, color: "#9BE8B5",
    fontFamily: "'Space Mono', monospace", overflowX: "auto", margin: 0,
  },

  /* print view */
  printPage: { maxWidth: 900, margin: "0 auto", background: "#FFFFFF", color: "#161A2E", borderRadius: 12, padding: "26px 30px 34px" },
  printOnlyBar: { display: "flex", alignItems: "center", gap: 12, marginBottom: 18 },
  printBtn: { display: "flex", alignItems: "center", gap: 7, background: "#161A2E", color: "#fff", border: "none", borderRadius: 8, padding: "8px 14px", fontSize: 13, fontWeight: 600, cursor: "pointer" },
  printHint: { fontSize: 12, color: "#8890B5" },
  printHeader: { display: "flex", justifyContent: "space-between", alignItems: "flex-end", borderBottom: "2px solid #161A2E", paddingBottom: 12, marginBottom: 16 },
  printEyebrow: { fontSize: 11, letterSpacing: 0.3, color: "#7B8199", fontFamily: "'Space Mono', monospace" },
  printH1: { fontFamily: "'Bricolage Grotesque', sans-serif", fontSize: 22, fontWeight: 800, margin: "2px 0 0" },
  printMeta: { fontSize: 12, color: "#3A3F55", lineHeight: 1.9, textAlign: "right" },
  printHardwareRow: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "4px 20px", marginBottom: 20, fontSize: 11.5, color: "#3A3F55", lineHeight: 1.5 },
  printHwCell: {},
  printSection: { display: "flex", gap: 12, marginBottom: 18 },
  printPhaseBar: { width: 5, borderRadius: 3, flexShrink: 0 },
  printSectionInner: { flex: 1 },
  printPhaseHead: { fontSize: 15, fontWeight: 800, marginBottom: 4 },
  printFocus: { fontSize: 12.5, color: "#3A3F55", margin: "0 0 10px", lineHeight: 1.5 },
  printColLabel: { fontSize: 11, fontWeight: 700, color: "#7B8199", textTransform: "uppercase", letterSpacing: 0.4, margin: "10px 0 5px" },
  printList: { listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: 5 },
  printListItem: { fontSize: 12.5, lineHeight: 1.5, display: "flex", gap: 8, alignItems: "flex-start" },
  printCheckbox: { width: 11, height: 11, border: "1.5px solid #161A2E", borderRadius: 3, flexShrink: 0, marginTop: 2 },
  printAssess: { fontSize: 12.5, background: "#F4F5FA", borderRadius: 8, padding: "9px 12px", marginTop: 10, lineHeight: 1.5 },
  printFooterNote: { fontSize: 11.5, color: "#7B8199", borderTop: "1px solid #E4E6F0", paddingTop: 12, marginTop: 6 },
};
