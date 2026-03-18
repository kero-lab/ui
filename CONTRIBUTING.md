# Contributing to @kero-lab/ui

Shared React component library used by KeroHub and RemHub.

## Quick Start

```bash
git clone https://github.com/kero-lab/ui.git
cd ui
bun install
```

### Development

```bash
# Run Storybook (component playground)
bun run storybook

# Run tests
bun run test

# Typecheck
bun run typecheck
```

Storybook runs at `http://localhost:6006` and is the best way to develop and preview components.

## How We Work

Same workflow as KeroHub — see the [KeroHub CONTRIBUTING.md](https://github.com/kero-lab/kerohub/blob/main/CONTRIBUTING.md) for full details on branching, PRs, and commit conventions.

**Key difference:** Changes to this package need to be published before consumers (KeroHub, RemHub) can use them. After your PR is merged, the project owner will tag a release (`v0.x.0`) which triggers publishing to GitHub Packages.

## Adding a Component

1. Create the component in `src/components/`
2. Export it from `src/index.ts`
3. Add a Storybook story in the same directory
4. Run `bun run typecheck` to verify

## Tech Stack

- React 19
- Radix UI primitives
- Tailwind CSS 4
- Storybook 10
- Vitest for testing
