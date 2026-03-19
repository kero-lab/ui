# @kero-lab/ui

[![CI](https://github.com/kero-lab/ui/actions/workflows/ci.yml/badge.svg)](https://github.com/kero-lab/ui/actions/workflows/ci.yml)

Shared React component library for the [Kero Lab](https://github.com/kero-lab) ecosystem — Radix UI primitives, Tailwind CSS 4, hooks, and utilities.

## Install

```bash
npm install @kero-lab/ui
```

> Requires `NPM_TOKEN` for GitHub Packages auth. See [CONTRIBUTING.md](CONTRIBUTING.md) for setup.

## Usage

```tsx
import { Button, Card, Badge } from '@kero-lab/ui';
import '@kero-lab/ui/globals.css';
```

## Storybook

```bash
npm install
npm run storybook    # http://localhost:6006
```

## Components

Primitives (Radix UI based): Button, Badge, Card, Checkbox, Collapsible, Dialog, Dropdown Menu, Input, Label, Scroll Area, Select, Separator, Sheet, Skeleton, Slider, Table, Tabs, Tooltip

Data display: Data Panel, Sparkline, Trend Indicator, Event Card, Event Timeline, Responsive Card, Expandable Row, Step Wizard, Cluster Summary

Animation: Audio Wave, Voice Wave, Noise Wave, Envelope Wave, Fan-out Stack

Admin: Admin Toolbar (provider + panels)

Hooks: `useDebounce`, `useMediaQuery`, `useReducedMotion`, `useScrollBob`, `useTimelineKeyboard`

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md). Run Storybook for component development — every component has a `.stories.tsx` file.

## License

MIT
