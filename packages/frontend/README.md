# Fifth Grade Coding Humanoid

The GitHub Pages-ready curriculum PWA. **TobyBot Mission Control** is the first learning path, focused on teaching Grade 5 students programming through robotics.

## Development

```bash
npm install
npm run dev
```

## Verification

```bash
npm run lint
npm test
npm run build
```

The production bundle is written to `dist/`. The app uses hash routing and a
relative asset base so it can be hosted from a GitHub Pages project path.

Progress is stored in the browser and can be exported/imported as a versioned
JSON file. Robot operations are represented by a mock adapter; no hardware
connection or backend is required.
