export interface StellarConfig {
  /** fBM quality — number of octaves on coarse (touch/mobile) and fine (desktop) */
  octaves: { coarse: number; fine: number };

  /** Maximum device pixel ratio on coarse vs fine displays */
  maxDpr: { coarse: number; fine: number };

  /** Hot-core colour as linear RGB 0–1  (default: amber) */
  hotCore: [number, number, number];

  // ── Initial energy state ──────────────────────────────────────────────────
  /** Permanent baseline energy at startup (normally 0; raise to pre-warm the vortex) */
  initialEnergyPerm: number;
  /** Transient energy injected at startup */
  initialEnergyTran: number;

  // ── Tap / click strength ─────────────────────────────────────────────────
  /** Permanent energy added per tap — accumulates forever, never decays */
  tapPermDelta: number;
  /** Transient energy added per tap — decays with `tranDecayRate` */
  tapTranDelta: number;

  // ── Energy physics ───────────────────────────────────────────────────────
  /** Decay rate γ for transient energy  (higher = faster fade) */
  tranDecayRate: number;
  /** tanh squash factor applied to permanent energy before display */
  permSquash: number;
  /** Scale factor applied after tanh squash */
  permScale: number;

  // ── Mouse smoothing ──────────────────────────────────────────────────────
  /** Lerp factor per frame for mouse position smoothing (0–1; higher = snappier) */
  mouseSmoothing: number;
}

export const CONFIG: StellarConfig = {
  octaves:  { coarse: 4, fine: 6 },
  maxDpr:   { coarse: 1.5, fine: 1.75 },

  hotCore: [1.00, 0.74, 0.34],   // amber  ≈ oklch(0.95 0.18 60)

  initialEnergyPerm: 20.0,
  initialEnergyTran: 20.0,

  tapPermDelta: 0.35,
  tapTranDelta: 0.70,

  tranDecayRate: 0.7,
  permSquash:    0.22,
  permScale:     4.0,

  mouseSmoothing: 0.12,
};
