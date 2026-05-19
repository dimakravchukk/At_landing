import type { StellarConfig } from './config';

/** Composite energy value sent to the shader each frame */
export function computeE(
  energyPerm: number,
  energyTran: number,
  cfg: Pick<StellarConfig, 'permSquash' | 'permScale'>,
): number {
  return Math.tanh(energyPerm * cfg.permSquash) * cfg.permScale + energyTran;
}

/** Exponential decay step for transient energy */
export function decayTran(energyTran: number, decayRate: number, dt: number): number {
  return energyTran * Math.exp(-decayRate * dt);
}
