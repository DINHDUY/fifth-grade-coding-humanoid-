# Tonybot Walk-in-a-Circle Scratch Project

Plan for a WonderCode/Scratch program that makes Tonybot travel around a
circular path using repeated forward and turning action groups.

Tonybot uses numbered action groups through `runActionGroup(id, count)`. The
documented mappings used here are:

| Action group | Meaning |
|---:|---|
| 0 | Stand/stop |
| 1 | Walk forward |
| 3 | Turn left |
| 4 | Turn right |

Action-group behavior can depend on the installed firmware. Test each group
before building the final routine.

Sources:

- `knowledge-base/raw/github/Hiwonder-Tonybot/README.md`
- `knowledge-base/raw/github/Hiwonder-Tonybot/Arduino/AI大模型应用课程/01 大模型应用程序/Tonybot_AI/WonderLLM.cpp`
- `knowledge-base/markdown/5-scratch-programming-projects-d83ef5c713.md`

## Setup in WonderCode

1. Open WonderCode.
2. Add the extension `Robot -> Tonybot`.
3. Connect Tonybot over USB.
4. Select the correct CH340 COM port.
5. Use Upload Mode.
6. Test all movement blocks on a clear, flat surface.

## Reusable Scratch blocks

### `Tonybot Initialize`

```text
Tonybot Main Program
run action group (0) once
wait (1) seconds
```

### `Move Forward`

```text
run action group (1) once
wait (0.3) seconds
```

### `Turn Right`

```text
run action group (4) once
wait (0.3) seconds
```

### `Turn Left`

```text
run action group (3) once
wait (0.3) seconds
```

### `Safe Stop`

```text
run action group (0) once
wait (1) seconds
```

### `Circle Segment (direction)`

```text
Move Forward

if <direction = right> then
    Turn Right
else
    Turn Left
end
```

One segment is a short forward movement followed by a small turn. Repeating
segments produces a polygon that approximates a circle.

## First prototype

Start with a 12-segment circle:

```text
when green flag clicked

Tonybot Initialize

repeat (12)
    Circle Segment (right)
end

Safe Stop
```

Try 16 or 20 segments for a smoother path after the 12-segment version is
stable.

## Adjust the circle size

The radius depends on the ratio between forward movement and turning:

- Larger radius: perform more forward movements before each turn.
- Smaller radius: turn more frequently.
- Tighter turn: repeat the turn action group.
- Wider turn: reduce the turn action-group repeat count.

Example larger-radius segment:

```text
repeat (2)
    Move Forward
end
Turn Right
```

Example smaller-radius segment:

```text
Move Forward
Turn Right
Turn Right
```

Tune these variations carefully because action-group distance and turn angle
depend on the robot firmware.

## Configurable circle block

Create a custom block named:

```text
Walk Circle (segments) (direction)
```

Scratch logic:

```text
define Walk Circle (segments) (direction)

repeat (segments)
    Move Forward

    if <direction = right> then
        Turn Right
    else
        Turn Left
    end
end
```

Main program:

```text
when green flag clicked

Tonybot Initialize
Walk Circle (16) (right)
Safe Stop
```

## Multiple laps

```text
when green flag clicked

Tonybot Initialize

repeat (2)
    Walk Circle (16) (right)
end

Safe Stop
```

Use one lap during initial testing. Add more laps only after Tonybot reliably
completes a full circle.

## Optional LED feedback

The Glowy Ultrasonic Sensor extension can show the routine state:

```text
set RGB LEDs to blue
Walk Circle (16) (right)
set RGB LEDs to green
Safe Stop
set RGB LEDs to off
```

## Validation and safety

Test in this order:

1. Test `Tonybot Initialize`.
2. Test `Move Forward` once.
3. Test `Turn Right` once.
4. Test one circle segment.
5. Test four segments.
6. Test one complete 12-segment circle.
7. Tune segment count, movement count, and timing.
8. Test the left-turn version.
9. Add multiple laps only after the single-lap version is stable.

Keep Tonybot away from walls, cables, stairs, and slippery surfaces. This
routine creates a polygon approximation of a circle; exact circular motion
requires tuning the action-group distances and turn angles for the specific
Tonybot firmware.
