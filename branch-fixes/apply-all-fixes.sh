#!/usr/bin/env bash
# =============================================================================
# apply-all-fixes.sh
# Apply dependency fixes to all 6 Bolt.new component branches.
# Run this from the root of the V10 repo with push access:
#   bash branch-fixes/apply-all-fixes.sh
# =============================================================================

set -euo pipefail

REPO_DIR="$(git rev-parse --show-toplevel)"
PATCHES_DIR="$REPO_DIR/branch-fixes"

apply_fix() {
  local branch="$1"
  local patch="$2"

  echo ""
  echo "============================================"
  echo "Fixing branch: $branch"
  echo "============================================"

  git fetch origin "$branch" 2>/dev/null || true
  git checkout -B "$branch" "origin/$branch"
  git am --ignore-space-change --ignore-whitespace "$PATCHES_DIR/$patch"
  git push origin "HEAD:refs/heads/$branch"

  echo "✓ $branch — pushed successfully"
}

cd "$REPO_DIR"

apply_fix "Terminal-/-Feature"  "0001-fix-add-xterm-packages-canvas-confetti-exclude-compo.patch"
apply_fix "Cmpnt-/-WorkBench"   "0001-fix-Cmpnt-WorkBench-add-missing-packages-canvas-conf.patch"
apply_fix "Cmpnt/-Sidebar"      "0001-fix-Cmpnt-Sidebar-add-framer-motion-react-toastify-r.patch"
apply_fix "Cmpnt/-UI"           "0001-fix-Cmpnt-UI-add-radix-ui-react-dialog-framer-motion.patch"
apply_fix "Compnt-/-Chat"       "0001-fix-Compnt-Chat-add-ai-shiki-react-markdown-framer-m.patch"
apply_fix "Compnt-/-Header"     "0001-fix-Compnt-Header-add-codemirror-packages-uiw-codemi.patch"

echo ""
echo "============================================"
echo "All 6 branches fixed and pushed!"
echo "============================================"
echo ""
echo "Branch status:"
echo "  Terminal-/-Feature  — Fixed (added @xterm/xterm, @xterm/addon-fit, @xterm/addon-web-links, canvas-confetti)"
echo "  Cmpnt-/-WorkBench   — Fixed (added framer-motion, nanostores, @nanostores/react, react-toastify, react-resizable-panels, @radix-ui/react-dropdown-menu, canvas-confetti)"
echo "  Cmpnt/-Sidebar      — Fixed (added framer-motion, react-toastify, @radix-ui/react-dialog, canvas-confetti)"
echo "  Cmpnt/-UI           — Fixed (added @radix-ui/react-dialog, framer-motion, @nanostores/react, canvas-confetti)"
echo "  Compnt-/-Chat       — Fixed (added ai, shiki, react-markdown, framer-motion, react-toastify, nanostores, @nanostores/react, remix-utils, canvas-confetti)"
echo "  Compnt-/-Header     — Fixed (added @codemirror/* packages, @uiw/codemirror-theme-vscode, canvas-confetti)"
echo ""
echo "Each branch also has tsconfig.json updated to exclude the Bolt.new"
echo "component files (src/components-2/) from TypeScript type checking,"
echo "which fixes the 'Cannot find module' build errors."
