## 2026-11-10T19:01:02Z

You are teamwork_worker assigned to implement Milestone M4: Sycomo Animation & Easing Calibration (Natural Inertia, Micro-staggering & 60/120fps Fluidity).

Working directory: /home/shadymui/sycomosite/.agents/teamwork/teamwork_worker_anim/
Project root: /home/shadymui/sycomosite
Original request: /home/shadymui/sycomosite/.agents/teamwork/ORIGINAL_REQUEST.md
Domain Skill: /home/shadymui/.gemini/config/skills/emil-design-eng/SKILL.md

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

EXCLUSIVE WRITE OWNERSHIP:
You own exclusively:
- `src/app/globals.css`
- `src/components/ScrollDirector.tsx`
DO NOT modify any other files unless strictly necessary. DO NOT touch test suites or mock test results.

IMPLEMENTATION SPECIFICATION (Synthesized from 3 Explorers & Emil Kowalski Design Engineering):

1. Logo Flight & --p (`src/app/globals.css`):
   - Update `:root` transition:
     `transition: --p 1.05s cubic-bezier(0.25, 1, 0.5, 1);`
   - Optimize `.site-header`: remove the conflicting `transition: opacity 0.95s ...`; keep `opacity: var(--p); will-change: opacity;`.
   - Promote `.logo-fly` to compositor layer:
     Add `will-change: transform; backface-visibility: hidden;`.
   - Harmonize `.massa`:
     `transition: translate 1.25s cubic-bezier(0.25, 1, 0.5, 1), opacity 1.25s cubic-bezier(0.25, 1, 0.5, 1);`.

2. Liquid Curtain `IntroCurtain` (`src/app/globals.css` & `src/components/ScrollDirector.tsx`):
   - In `globals.css`:
     - `.intro`: `animation: intro-done 0s linear 1.12s forwards;`
     - `.intro-sheet`: `animation: intro-fall 0.98s cubic-bezier(0.16, 1, 0.3, 1) 0.12s both; will-change: transform; transform: translate3d(0, 0, 0);`
   - In `src/components/ScrollDirector.tsx`:
     - Update `DELAY_INGRESSO_MS = 1180;` to synchronize fallback with the curtain completion (so `--p` doesn't fire while curtain still covers the screen).

3. `<CheComputer>` & `.uso` Micro-Staggering (`src/app/globals.css`):
   - In `.uso`: Set `opacity: var(--p); transition: opacity 0.5s cubic-bezier(0.16, 1, 0.3, 1);` (remove container translate animation).
   - `.uso-domanda`:
     `opacity: 0; transform: translateY(16px); will-change: transform, opacity; transition: opacity 0.65s cubic-bezier(0.16, 1, 0.3, 1), transform 0.65s cubic-bezier(0.16, 1, 0.3, 1); transition-delay: 0ms;`
     `.figs-on .uso-domanda { opacity: 1; transform: translateY(0); }`
   - `.uso-dot`:
     `display: inline-block; opacity: 0; transform: scale(0.92); transform-origin: center; will-change: transform, opacity; transition: opacity 0.45s cubic-bezier(0.16, 1, 0.3, 1), transform 0.45s cubic-bezier(0.16, 1, 0.3, 1); transition-delay: 50ms;`
     `.figs-on .uso-dot { opacity: 1; transform: scale(1); }`
   - `.uso-testo`:
     `opacity: 0; transform: translateY(12px); will-change: transform, opacity; transition: opacity 0.65s cubic-bezier(0.16, 1, 0.3, 1), transform 0.65s cubic-bezier(0.16, 1, 0.3, 1); transition-delay: 80ms;`
     `.figs-on .uso-testo { opacity: 1; transform: translateY(0); }`
   - `.uso-testo > span`:
     `display: inline-block; opacity: 0; transform: translateY(8px); will-change: transform, opacity; transition: opacity 0.5s cubic-bezier(0.16, 1, 0.3, 1), transform 0.5s cubic-bezier(0.16, 1, 0.3, 1);`
     `.figs-on .uso-testo > span:nth-of-type(1) { opacity: 1; transform: translateY(0); transition-delay: 110ms; }`
     `.figs-on .uso-testo > span:nth-of-type(2) { opacity: 1; transform: translateY(0); transition-delay: 150ms; }`
     `.figs-on .uso-testo > span:nth-of-type(3) { opacity: 1; transform: translateY(0); transition-delay: 190ms; }`
   - `.uso-testo em`:
     `display: inline-block; opacity: 0; transform: translateY(8px); will-change: transform, opacity; transition: opacity 0.55s cubic-bezier(0.16, 1, 0.3, 1), transform 0.55s cubic-bezier(0.16, 1, 0.3, 1); transition-delay: 230ms;`
     `.figs-on .uso-testo em { opacity: 1; transform: translateY(0); }`
   - Accessibility: In `@media (prefers-reduced-motion: reduce)`, set `opacity: 1 !important; transform: none !important; transition: none !important;` for `.uso`, `.uso-domanda`, `.uso-dot`, `.uso-testo`, `.uso-testo > span`, `.uso-testo em`.

4. Responsive Cards & Modals (`src/app/globals.css`):
   - `.alb-mobile-card`:
     - Asymmetric active feedback: `:active { transform: scale(0.978); box-shadow: 0 2px 8px -2px rgba(32, 32, 28, 0.06); }` with `transition: transform 160ms cubic-bezier(0.16, 1, 0.3, 1), box-shadow 160ms ease;` (release: `transition: transform 220ms cubic-bezier(0.16, 1, 0.3, 1), box-shadow 220ms ease;`).
     - Micro-staggering entrance:
       `@keyframes albMobileCardEnter { from { opacity: 0; transform: translateY(14px) scale(0.985); } to { opacity: 1; transform: translateY(0) scale(1); } }`
       `.alb-mobile-card { animation: albMobileCardEnter 0.38s cubic-bezier(0.16, 1, 0.3, 1) both; }`
       `.alb-mobile-card:nth-child(1) { animation-delay: 40ms; }`
       `.alb-mobile-card:nth-child(2) { animation-delay: 85ms; }`
       `.alb-mobile-card:nth-child(3) { animation-delay: 130ms; }`
       `.alb-mobile-card:nth-child(4) { animation-delay: 175ms; }`
       `.alb-mobile-card:nth-child(n+5) { animation-delay: 220ms; }`
       CRITICAL: Strictly vertical `translateY` and `scale <= 1`, never `translateX` or `scale > 1`, so that `scrollWidth <= innerWidth + 1` at 320px/375px/390px viewports.
   - `.alb-card` (desktop):
     - Wrap `:hover` rules in `@media (hover: hover) and (pointer: fine)`.
     - Add tactile active press:
       `.alb-card:active { transform: perspective(1100px) rotateX(var(--tilt-rx, 0deg)) rotateY(var(--tilt-ry, 0deg)) scale3d(0.982, 0.982, 0.982); }`
   - Modal / Bottom Sheet:
     - Mobile drawer: `.project-modal.alb-modal` on max-width 859.98px:
       `animation: albModalSlideUp 0.28s cubic-bezier(0.32, 0.72, 0, 1);`
     - Backdrop: `.alb-modal-backdrop`:
       `animation: albModalFadeIn 0.24s cubic-bezier(0.16, 1, 0.3, 1);`
     - Close button: `.alb-modal-close:active { transform: scale(0.92); }` with `transition: transform 160ms cubic-bezier(0.16, 1, 0.3, 1);`.
     - CTA button: `.alb-modal-cta-btn`: replace `transition: all` with explicit properties and add `:active { transform: scale(0.97); }`.

5. Verification:
   Run the following verification commands and record their exact outputs in your report:
   - `npm run lint`
   - `npm run build`
   - `node e2e/runner.mjs`
   - `node e2e/adversarial-layout.mjs`
   - `node e2e/adversarial-stress.mjs`
   All must pass with exit code 0.
