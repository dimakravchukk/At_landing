/** Composite energy value sent to the shader each frame */
export function computeE(energyPerm, energyTran, cfg) {
    return Math.tanh(energyPerm * cfg.permSquash) * cfg.permScale + energyTran;
}
/** Exponential decay step for transient energy */
export function decayTran(energyTran, decayRate, dt) {
    return energyTran * Math.exp(-decayRate * dt);
}
