# ShiftFit

A fitness app for shift workers. Matches workout intensity to your daily fatigue based on your shift rotation.

## Quick Start

```bash
npm install
npm run dev
```

Then open http://localhost:5173

## Tech Stack

- React 19 + TypeScript
- Vite
- Tailwind CSS v3.4
- shadcn/ui
- React Router
- React Hook Form + Zod

## Features

- Shift pattern builder (4on/4off, Mon-Fri, custom rotations)
- Fatigue scoring based on shift schedule
- Workout recommendations matched to energy levels
- Live workout tracker with rest timer
- Sleep logging
- Progress tracking

## Data

All data is stored locally in your browser via localStorage. No backend required for local testing.
