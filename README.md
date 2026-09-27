# Fifth Grade Coding Humanoid

Fifth Grade Coding Humanoid is a Grade 5 robotics and programming learning platform. Its first learning path, **TobyBot Mission Control**, helps students learn computational thinking by turning a HiWonder TonyBot humanoid robot into a hands-on programming partner.

Students move from physical movement and balance to visual programming, Python, sensors, voice commands, and applied computer vision. The goal is to make programming tangible: students write an idea, test it on a robot, observe what happens, and improve it.

## Learning journey

The curriculum is organized as four missions:

1. **Foundations and kinesthetic logic** — Explore TonyBot’s joints, degrees of freedom, balance, poses, and action sequences.
2. **Visual logic and block programming** — Use Scratch/WonderCode blocks, loops, conditionals, ultrasonic sensors, IMU data, and color-triggered actions.
3. **Text-based programming** — Translate block logic into Python functions, variables, voice commands, sensor checks, and safety responses.
4. **Applied AI and autonomy** — Combine camera vision, movement, and logic in an autonomous tracker or a robot-assistant capstone project.

## What students can do

- Build and complete mission objectives with visible progress tracking.
- Work in Navigator and Pilot pairs to practice collaboration and debugging.
- Explore local Scratch project examples for dancing, breathing lights, and walking in a circle.
- Experiment with an interactive color-tracking and proportional-control walkthrough.
- Export and import progress so learning can continue across classroom devices.
- Use the teacher print view for lesson planning and classroom reference.

## Safety-first robotics

Every new movement routine should be tested with TonyBot tethered or suspended in a harness. Students should begin with low-risk poses and short action groups on a clear, flat surface. The app provides learning simulations; it does not directly control a connected robot.

## Project structure

- `packages/frontend` — React, TypeScript, Vite, and PWA application.
- `scratch` — Local Scratch-style project guides and interactive examples.
- `knowledge-base` — Organized TonyBot documentation, source code, examples, and reference relationships for learning and AI-assisted support.
- `docs` — Original Mission Control prototype and project references.

## Knowledge base and AI-assisted learning

The `knowledge-base` gives instructors, students, and AI assistants a shared reference for the TonyBot learning journey. It brings together official TonyBot documentation, programming examples, Scratch projects, Python and Arduino source, hardware guidance, and related project relationships in one searchable place.

It helps instructors:

- Prepare lessons using accurate hardware, software, and programming references.
- Ask AI to explain a concept at a Grade 5 level or create differentiated explanations for different learners.
- Turn a mission objective into guided activities, discussion questions, debugging prompts, or assessment ideas.
- Find relevant examples across Scratch, Python, Arduino, sensors, vision, voice, and movement.
- Give students hints and next steps without immediately giving away the complete solution.

It helps students:

- Ask questions in everyday language, such as “Why did TonyBot fall when it turned?”
- Request explanations of code, sensors, loops, variables, functions, or robot balance.
- Translate a Scratch block sequence into Python and compare the two approaches.
- Get assisted programming support for a small, testable change to a routine.
- Debug errors by sharing the relevant code, observed behavior, and expected behavior.
- Connect a lesson to the robot’s hardware and understand why the program behaves the way it does.

### Suggested learning workflow

1. **Ask** a focused question about the mission or observed robot behavior.
2. **Explain** the idea in plain language before looking at code.
3. **Plan** a small change with a prediction of what should happen.
4. **Program** the change with AI assistance, keeping the student in control of the decisions.
5. **Test safely** with TonyBot tethered or harnessed when movement is involved.
6. **Reflect and improve** by comparing the result with the prediction and documenting what changed.

AI should act as a tutor, pair programmer, and debugging guide—not as a replacement for student reasoning. Instructors and students should verify generated code against the official documentation, test one change at a time, protect personal information, and never let generated movement code bypass the project’s safety practices.

## Run the learning app

From the repository root:

```bash
make install
make dev
```

Open the local Vite URL shown in the terminal. Useful commands include:

```bash
make check    # lint, test, and production build
make build    # build the GitHub Pages-ready PWA
make preview  # preview the production build
```

The finished app can be hosted as a GitHub Pages site. It uses hash-based routing, an offline app shell, and browser-local progress storage with JSON export/import.

### GitHub Pages deployment

This repository is configured for [DINHDUY/fifth-grade-coding-humanoid-](https://github.com/DINHDUY/fifth-grade-coding-humanoid-). Every push to the `master` branch starts `.github/workflows/deploy-frontend.yml`, builds `packages/frontend`, and publishes the resulting PWA through GitHub Pages.

For the first deployment, open the repository’s **Settings → Pages** and set **Build and deployment → Source** to **GitHub Actions**. The workflow requires the repository’s Pages and Actions settings to allow the declared `pages: write` and `id-token: write` permissions.

## Open-source and third-party materials

Original Fifth Grade Coding Humanoid code and documentation are available under the [MIT License](LICENSE). HiWonder TonyBot documentation, firmware, trademarks, imported examples, and other vendor materials remain subject to their own terms. See [THIRD-PARTY-NOTICES.md](THIRD-PARTY-NOTICES.md) for the project’s attribution and licensing boundary.

Contributions should follow [CONTRIBUTING.md](CONTRIBUTING.md), the [Code of Conduct](CODE_OF_CONDUCT.md), and the [Security Policy](SECURITY.md).
