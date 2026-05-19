import { describe, it, expect } from 'vitest';
import { computeE, decayTran } from './energy';
const cfg = { permSquash: 0.22, permScale: 4.0 };
describe('computeE', () => {
    it('returns zero when both accumulators are zero', () => {
        expect(computeE(0, 0, cfg)).toBe(0);
    });
    it('adds transient energy directly', () => {
        const E = computeE(0, 5, cfg);
        expect(E).toBeCloseTo(5, 5);
    });
    it('tanh-squashes permanent energy so it saturates', () => {
        const low = computeE(1, 0, cfg);
        const high = computeE(50, 0, cfg);
        // both positive, high > low, but high < permScale (saturated)
        expect(high).toBeGreaterThan(low);
        expect(high).toBeLessThanOrEqual(cfg.permScale);
    });
    it('permanent contribution approaches permScale asymptotically', () => {
        const E = computeE(1000, 0, cfg);
        expect(E).toBeCloseTo(cfg.permScale, 3);
    });
    it('sums permanent and transient contributions', () => {
        const permOnly = computeE(10, 0, cfg);
        const tranOnly = computeE(0, 3, cfg);
        expect(computeE(10, 3, cfg)).toBeCloseTo(permOnly + tranOnly, 10);
    });
    it('initial values from config produce non-zero energy', () => {
        // mirrors what the browser does at startup with the user's config
        const E = computeE(20, 20, cfg);
        expect(E).toBeGreaterThan(0);
        // tanh(20*0.22)*4 ≈ 4, plus transient 20 → E ≈ 24
        expect(E).toBeGreaterThan(20);
    });
});
describe('decayTran', () => {
    it('returns zero when energy is zero', () => {
        expect(decayTran(0, 1.5, 1)).toBe(0);
    });
    it('reduces energy over time', () => {
        expect(decayTran(10, 1.5, 0.1)).toBeLessThan(10);
    });
    it('never goes negative', () => {
        expect(decayTran(10, 1.5, 100)).toBeGreaterThanOrEqual(0);
    });
    it('matches e^(-γ·dt) formula exactly', () => {
        const γ = 1.5, dt = 0.05, E0 = 8;
        expect(decayTran(E0, γ, dt)).toBeCloseTo(E0 * Math.exp(-γ * dt), 10);
    });
    it('higher decay rate fades faster', () => {
        const slow = decayTran(10, 0.5, 1);
        const fast = decayTran(10, 1.5, 1);
        expect(fast).toBeLessThan(slow);
    });
    it('dt=0 leaves energy unchanged', () => {
        expect(decayTran(7.5, 1.5, 0)).toBeCloseTo(7.5, 10);
    });
});
