// tools-stack.js — Tools desktop stack (not used in current bento layout)
// The current implementation uses a static bento grid (no JS stack).
// This module is a placeholder for if the stacked card UI is re-introduced.

export function initToolsStack() {
  // The tools section currently uses a static bento grid HTML.
  // No JS stack behavior is needed.
  // If arrow key navigation is needed, uncomment and configure below.

  // Arrow keys: left/right to cycle cards (desktop only)
  if (!window.__arrowKeyInit) {
    window.__arrowKeyInit = true;
    document.addEventListener('keydown', function(e) {
      if (window.innerWidth <= 768) return;
      if (e.target && (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA')) return;
      // Stack navigation placeholder — extend if stack UI is added back
    });
  }
}
