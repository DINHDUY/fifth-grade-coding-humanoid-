# Tonybot Breathing Light Scratch Project

Plan for a WonderCode/Scratch program that makes Tonybot's ultrasonic RGB
lights smoothly brighten and dim like a breathing light.

The design is based on the imported Tonybot Scratch documentation and uses the
`Tonybot Main Program`, `Repeat`, and `Glowy Ultrasonic Sensor` blocks.

Source:

- `knowledge-base/markdown/5-scratch-programming-projects-d83ef5c713.md`

## Goal

The program should:

1. Initialize Tonybot safely.
2. Control the ultrasonic RGB LEDs.
3. Gradually increase and decrease LED brightness.
4. Optionally cycle through multiple colors.
5. Turn the LEDs off when the program finishes.

## Setup in WonderCode

1. Open WonderCode.
2. Add the extension `Robot -> Tonybot`.
3. Add the `Glowy Ultrasonic Sensor` extension.
4. Connect Tonybot over USB.
5. Select the correct CH340 COM port.
6. Use Upload Mode when transferring the program.

The ultrasonic sensor is pre-installed on Tonybot and communicates through
I2C. The official documentation uses the same extension to control its RGB
lights.

## Reusable Scratch blocks

### `Tonybot Initialize`

```text
Tonybot Main Program
run action group (0) once
wait (1) seconds
```

This establishes a known robot posture before the light program starts.

### `Set All LEDs (red) (green) (blue)`

Use the Glowy Ultrasonic Sensor color block to set both RGB lights:

```text
set left RGB to (red) (green) (blue)
set right RGB to (red) (green) (blue)
```

If the extension provides one block for all LEDs, use that block instead.

### `Breathing Color (red) (green) (blue)`

Create a Scratch variable named `brightness` and use it to scale the color.

```text
set brightness to (0)

repeat (10)
    set all LEDs to:
        red = (red * brightness / 10)
        green = (green * brightness / 10)
        blue = (blue * brightness / 10)
    change brightness by (1)
    wait (0.1) seconds

repeat (10)
    set all LEDs to:
        red = (red * brightness / 10)
        green = (green * brightness / 10)
        blue = (blue * brightness / 10)
    change brightness by (-1)
    wait (0.1) seconds
```

Start with 10 brightness steps. Increase to 20 steps for a slower, smoother
fade.

### `Lights Off`

```text
set all LEDs to red (0), green (0), blue (0)
```

Call this block at the end of the program or before disconnecting Tonybot.

## Main program: blue breathing light

```text
when green flag clicked

Tonybot Initialize
set brightness to (0)

repeat (20)
    Breathing Color (0) (0) (255)

Lights Off
```

The official example uses blue light and flashes approximately every two
seconds. Use a dimly lit environment to see the effect clearly.

## Optional multicolor version

```text
when green flag clicked

Tonybot Initialize
set brightness to (0)

forever
    Breathing Color (0) (0) (255)
    Breathing Color (0) (255) (0)
    Breathing Color (255) (0) (0)
end
```

This cycles through blue, green, and red. Use the same RGB values for the
left and right LEDs for a synchronized effect.

## Tuning

Change one setting at a time:

- Increase the number of brightness steps for a smoother fade.
- Increase the wait time for a slower breathing rhythm.
- Change the RGB values to select another color.
- Use different left and right RGB values for a two-color effect.
- Increase the repeat count for a longer demonstration.

## Upload and validation

1. Save the Scratch project.
2. Click `Upload`.
3. Wait for the upload-success message.
4. Test one color before enabling the multicolor loop.
5. Confirm that the LEDs brighten and dim smoothly.
6. Run `Lights Off` before disconnecting or powering down Tonybot.

The official sample is named `02 Breathing Light Program.sb3`. It can be
opened in WonderCode and used as a reference implementation.
