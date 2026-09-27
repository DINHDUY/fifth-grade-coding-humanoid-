# Tonybot Moonwalk-Inspired Scratch Routine

Plan for a WonderCode/Scratch routine that gives Tonybot a short, safe,
moonwalk-inspired dance sequence. This uses Tonybot's prebuilt action groups
and does not reproduce copyrighted music or choreography.

## Goal

The program should:

1. Initialize Tonybot in a stable standing pose.
2. Play a short introduction.
3. Perform a repeated backward-gliding dance pattern.
4. Add a dance accent or turn.
5. Stop and return to a stable standing pose.

Tonybot uses numbered action groups through `runActionGroup(id, count)`. The
imported source identifies these useful groups:

| Action group | Meaning |
|---:|---|
| 0 | Stand/stop |
| 1 | Walk forward |
| 2 | Walk backward |
| 3 | Turn left |
| 4 | Turn right |
| 9 | Wave |
| 150–158 | Dance actions |

Action-group mappings can depend on the installed firmware. Test each group
before using it in the final routine.

Sources:

- `knowledge-base/raw/github/Hiwonder-Tonybot/README.md`
- `knowledge-base/raw/github/Hiwonder-Tonybot/Arduino/AI大模型应用课程/01 大模型应用程序/Tonybot_AI/WonderLLM.cpp`
- `knowledge-base/markdown/5-scratch-programming-projects-d83ef5c713.md`

## Setup in WonderCode

1. Open WonderCode on a Windows computer.
2. Add the extension `Robot -> Tonybot`.
3. Connect Tonybot over USB.
4. Select the correct CH340 COM port.
5. Do not use `COM1` unless it is confirmed to be the robot controller.
6. Use Upload Mode when transferring the program.

The official guide describes the Tonybot extension, CH340 port, and upload
workflow in section 5.1.2 of the imported Scratch documentation.

## Reusable My Blocks

### `Tonybot Initialize`

Scratch structure:

```text
Tonybot Main Program
run action group (0) once
wait (1) seconds
```

This establishes a known standing pose before every performance.

### `Run Action Group (id) (repeat count)`

Wrap the Tonybot action-group block in a reusable custom block:

```text
run action group (id) (repeat count)
wait until the action group finishes
```

Use a repeat count of `1` during testing. Avoid indefinite repeats.

### `Moonwalk Step`

Start with this conservative pattern:

```text
run action group (2) once
wait (0.3) seconds
run action group (0) once
wait (0.2) seconds
```

Tune the delays experimentally. If the backward action does not look right,
test the dance groups instead of combining group 2 with group 0.

### `Moonwalk Accent`

```text
run action group (150) once
wait (0.2) seconds
```

Test groups 150 through 158 individually and select the most suitable accent.
Do not assume that any one group is a moonwalk.

### `Safe Stop`

```text
run action group (0) once
wait (1) seconds
```

Keep this block available as an emergency stop and call it at the end of the
routine.

## Proposed choreography

```text
when green flag clicked
Tonybot Initialize

run action group (9) once
wait (1) seconds

repeat (4)
    Moonwalk Step
    Moonwalk Accent
    wait (0.5) seconds

run action group (3) once
wait (0.3) seconds

repeat (2)
    Moonwalk Step
    run action group (150) once
    wait (0.5) seconds

Safe Stop
```

If the backward step does not create a convincing effect, substitute one of
the tested groups 151–158 as a complete prebuilt dance phrase.

## Tuning sequence

Change only one variable at a time:

- Backward action-group repeat count
- Delay after the backward step
- Dance action-group selection
- Number of repetitions
- Turn timing
- Starting and ending posture

Use a flat, non-slippery surface and leave clear space around the robot.

## Validation and safety

Test in this order:

1. Run `Tonybot Initialize` only.
2. Test action groups 150–158 one at a time.
3. Test one `Moonwalk Step`.
4. Run two steps.
5. Run the complete routine at low repetition counts.
6. Confirm that `Safe Stop` always returns Tonybot to a stable pose.

Do not use continuous loops until the robot consistently returns to a stable
standing pose. Avoid movement experiments near obstacles or while the robot is
on an unstable or slippery surface.
