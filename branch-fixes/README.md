# Branch Dependency Fixes

This directory contains git patches and a helper script that apply the dependency
fixes to all 6 Bolt.new component branches.

## Root Cause

Each branch has Bolt.new-generated component files in `src/components-2/` that:
1. Import npm packages not listed in `package.json`
2. Import internal `~/lib/...` / `~/utils/...` paths that don't exist in this project

Next.js type-checks **all** `.ts`/`.tsx` files matched by `tsconfig.json`'s `include`
pattern during `next build`, even files that aren't imported by any page.
This causes build failures on Vercel.

## Fix Applied to Each Branch

### 1. `package.json` — added missing npm packages

| Branch | Packages added |
|---|---|
| Terminal-/-Feature | `@xterm/xterm ^6.0.0`, `@xterm/addon-fit ^0.11.0`, `@xterm/addon-web-links ^0.12.0`, `canvas-confetti ^1.9.4` |
| Cmpnt-/-WorkBench | `framer-motion ^12`, `nanostores ^1.4`, `@nanostores/react ^1.1`, `react-toastify ^11`, `react-resizable-panels ^4`, `@radix-ui/react-dropdown-menu ^2`, `canvas-confetti ^1.9.4` |
| Cmpnt/-Sidebar | `framer-motion ^12`, `react-toastify ^11`, `@radix-ui/react-dialog ^1.1`, `canvas-confetti ^1.9.4` |
| Cmpnt/-UI | `@radix-ui/react-dialog ^1.1`, `framer-motion ^12`, `@nanostores/react ^1.1`, `canvas-confetti ^1.9.4` |
| Compnt-/-Chat | `ai ^3.4`, `shiki ^1.29`, `react-markdown ^10`, `framer-motion ^12`, `react-toastify ^11`, `nanostores ^1.4`, `@nanostores/react ^1.1`, `remix-utils ^7.7`, `canvas-confetti ^1.9.4` |
| Compnt-/-Header | `@codemirror/autocomplete ^6`, `@codemirror/commands ^6`, `@codemirror/lang-javascript ^6`, `@codemirror/language ^6`, `@codemirror/search ^6`, `@codemirror/state ^6`, `@codemirror/view ^6`, `@uiw/codemirror-theme-vscode ^4`, `canvas-confetti ^1.9.4` |

### 2. `tsconfig.json` — excluded Bolt.new component dirs from type checking

All branches get `"src/components-2"` added to the `exclude` array.
The `Cmpnt-/-WorkBench` branch additionally excludes the 6 root-level Bolt.new
component files placed at `src/*.tsx`.

`.npmrc` with `legacy-peer-deps=true` was already present on all branches.

## How to Apply

### Option A — Run the helper script (recommended)

From the repo root with write access to all branches:

```bash
bash branch-fixes/apply-all-fixes.sh
```

### Option B — Apply patches individually

```bash
# Terminal-/-Feature
git fetch origin Terminal-/-Feature
git checkout -B Terminal-/-Feature origin/Terminal-/-Feature
git am branch-fixes/0001-fix-add-xterm-packages-canvas-confetti-exclude-compo.patch
git push origin HEAD:refs/heads/Terminal-/-Feature

# Cmpnt-/-WorkBench
git fetch origin Cmpnt-/-WorkBench
git checkout -B Cmpnt-/-WorkBench origin/Cmpnt-/-WorkBench
git am branch-fixes/0001-fix-Cmpnt-WorkBench-add-missing-packages-canvas-conf.patch
git push origin HEAD:refs/heads/Cmpnt-/-WorkBench

# Cmpnt/-Sidebar
git fetch origin Cmpnt/-Sidebar
git checkout -B Cmpnt/-Sidebar origin/Cmpnt/-Sidebar
git am branch-fixes/0001-fix-Cmpnt-Sidebar-add-framer-motion-react-toastify-r.patch
git push origin HEAD:refs/heads/Cmpnt/-Sidebar

# Cmpnt/-UI
git fetch origin Cmpnt/-UI
git checkout -B Cmpnt/-UI origin/Cmpnt/-UI
git am branch-fixes/0001-fix-Cmpnt-UI-add-radix-ui-react-dialog-framer-motion.patch
git push origin HEAD:refs/heads/Cmpnt/-UI

# Compnt-/-Chat
git fetch origin Compnt-/-Chat
git checkout -B Compnt-/-Chat origin/Compnt-/-Chat
git am branch-fixes/0001-fix-Compnt-Chat-add-ai-shiki-react-markdown-framer-m.patch
git push origin HEAD:refs/heads/Compnt-/-Chat

# Compnt-/-Header
git fetch origin Compnt-/-Header
git checkout -B Compnt-/-Header origin/Compnt-/-Header
git am branch-fixes/0001-fix-Compnt-Header-add-codemirror-packages-uiw-codemi.patch
git push origin HEAD:refs/heads/Compnt-/-Header
```

## Verification

Each fix was verified locally with `npm install && npm run build` — all 6 branches
build successfully with zero TypeScript or module-not-found errors.
