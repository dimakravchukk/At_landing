import { describe, it, expect } from 'vitest';
import { CONFIG } from './config';

describe('CONFIG shape', () => {
  it('has valid octave counts', () => {
    expect(CONFIG.octaves.coarse).toBeGreaterThan(0);
    expect(CONFIG.octaves.fine).toBeGreaterThanOrEqual(CONFIG.octaves.coarse);
  });

  it('has valid DPR limits', () => {
    expect(CONFIG.maxDpr.coarse).toBeGreaterThan(0);
    expect(CONFIG.maxDpr.fine).toBeGreaterThanOrEqual(CONFIG.maxDpr.coarse);
  });

  it('hotCore is 3 channels in 0-1 range', () => {
    expect(CONFIG.hotCore).toHaveLength(3);
    for (const ch of CONFIG.hotCore) {
      expect(ch).toBeGreaterThanOrEqual(0);
      expect(ch).toBeLessThanOrEqual(1);
    }
  });

  it('tap deltas are positive', () => {
    expect(CONFIG.tapPermDelta).toBeGreaterThan(0);
    expect(CONFIG.tapTranDelta).toBeGreaterThan(0);
  });

  it('initial energy values are non-negative', () => {
    expect(CONFIG.initialEnergyPerm).toBeGreaterThanOrEqual(0);
    expect(CONFIG.initialEnergyTran).toBeGreaterThanOrEqual(0);
  });

  it('tranDecayRate is positive', () => {
    expect(CONFIG.tranDecayRate).toBeGreaterThan(0);
  });

  it('permSquash and permScale are positive', () => {
    expect(CONFIG.permSquash).toBeGreaterThan(0);
    expect(CONFIG.permScale).toBeGreaterThan(0);
  });

  it('mouseSmoothing is in (0, 1]', () => {
    expect(CONFIG.mouseSmoothing).toBeGreaterThan(0);
    expect(CONFIG.mouseSmoothing).toBeLessThanOrEqual(1);
  });
});
