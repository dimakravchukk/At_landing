import { CONFIG } from './config';
import { VERT, buildFrag } from './shaders';
import { computeE, decayTran } from './energy';

const canvas = document.getElementById('stage') as HTMLCanvasElement;

const isCoarse = matchMedia('(pointer: coarse)').matches || matchMedia('(max-width: 720px)').matches;
const OCTAVES  = isCoarse ? CONFIG.octaves.coarse : CONFIG.octaves.fine;
const MAX_DPR  = isCoarse ? CONFIG.maxDpr.coarse  : CONFIG.maxDpr.fine;

// ── WebGL ─────────────────────────────────────────────────────────────────────
const gl = canvas.getContext('webgl2', {
  antialias: true,
  premultipliedAlpha: false,
  powerPreference: 'high-performance',
}) as WebGL2RenderingContext | null;

if (!gl) {
  document.body.innerHTML = '<div style="padding:40px;color:#ffe7c4;font-family:monospace">WebGL2 not supported.</div>';
  throw new Error('WebGL2 not supported');
}

function compileShader(type: number, src: string): WebGLShader {
  const sh = gl!.createShader(type)!;
  gl!.shaderSource(sh, src);
  gl!.compileShader(sh);
  if (!gl!.getShaderParameter(sh, gl!.COMPILE_STATUS)) {
    const log = gl!.getShaderInfoLog(sh);
    gl!.deleteShader(sh);
    throw new Error(`Shader compile failed:\n${log}`);
  }
  return sh;
}

function getUniform(prog: WebGLProgram, name: string): WebGLUniformLocation {
  const loc = gl!.getUniformLocation(prog, name);
  if (!loc) throw new Error(`Uniform '${name}' not found`);
  return loc;
}

const prog = gl.createProgram()!;
gl.attachShader(prog, compileShader(gl.VERTEX_SHADER,   VERT));
gl.attachShader(prog, compileShader(gl.FRAGMENT_SHADER, buildFrag(OCTAVES)));
gl.linkProgram(prog);
if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
  throw new Error(`Program link failed:\n${gl.getProgramInfoLog(prog)}`);
}

const buf = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, buf);
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
const aPos = gl.getAttribLocation(prog, 'a_pos');
gl.enableVertexAttribArray(aPos);
gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

const U = {
  res:         getUniform(prog, 'u_res'),
  time:        getUniform(prog, 'u_time'),
  smoothMouse: getUniform(prog, 'u_smoothMouse'),
  clickTime:   getUniform(prog, 'u_clickTime'),
  energy:      getUniform(prog, 'u_energy'),
  hotCore:     getUniform(prog, 'u_hotCore'),
};

// ── Canvas resize ─────────────────────────────────────────────────────────────
const dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR);

function resize(): void {
  canvas.width  = Math.max(1, Math.floor(canvas.clientWidth  * dpr));
  canvas.height = Math.max(1, Math.floor(canvas.clientHeight * dpr));
  gl!.viewport(0, 0, canvas.width, canvas.height);
}
resize();
new ResizeObserver(resize).observe(canvas);
window.addEventListener('orientationchange', resize);

// ── Input ─────────────────────────────────────────────────────────────────────
const mouse       = [0.5, 0.5];
const smoothMouse = [0.5, 0.5];
let clickAt    = -1000;
let energyPerm = CONFIG.initialEnergyPerm;
let energyTran = CONFIG.initialEnergyTran;

function setMouseFromEvent(e: PointerEvent): void {
  const r = canvas.getBoundingClientRect();
  mouse[0] =       (e.clientX - r.left) / r.width;
  mouse[1] = 1.0 - (e.clientY - r.top)  / r.height;
}

window.addEventListener('pointermove', setMouseFromEvent, { passive: true });
window.addEventListener('pointerdown', (e: PointerEvent) => {
  setMouseFromEvent(e);
  clickAt = performance.now() / 1000;
  energyPerm += CONFIG.tapPermDelta;
  energyTran += CONFIG.tapTranDelta;
}, { passive: true });

// ── Render loop ───────────────────────────────────────────────────────────────
const start  = performance.now() / 1000;
let lastTick = performance.now() / 1000;

function render(): void {
  const now = performance.now() / 1000;
  const dt  = Math.min(0.1, now - lastTick);
  lastTick  = now;

  smoothMouse[0] += (mouse[0] - smoothMouse[0]) * CONFIG.mouseSmoothing;
  smoothMouse[1] += (mouse[1] - smoothMouse[1]) * CONFIG.mouseSmoothing;

  energyTran = decayTran(energyTran, CONFIG.tranDecayRate, dt);
  const E    = computeE(energyPerm, energyTran, CONFIG);

  gl!.useProgram(prog);
  gl!.uniform2f(U.res,         canvas.width, canvas.height);
  gl!.uniform1f(U.time,        now - start);
  gl!.uniform2f(U.smoothMouse, smoothMouse[0], smoothMouse[1]);
  gl!.uniform1f(U.clickTime,   Math.max(0, now - clickAt));
  gl!.uniform1f(U.energy,      E);
  gl!.uniform3f(U.hotCore,     CONFIG.hotCore[0], CONFIG.hotCore[1], CONFIG.hotCore[2]);
  gl!.drawArrays(gl!.TRIANGLES, 0, 3);

  requestAnimationFrame(render);
}

requestAnimationFrame(render);
