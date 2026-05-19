import { describe, it, expect } from 'vitest';
import { VERT, buildFrag } from './shaders';

describe('VERT', () => {
  it('is a non-empty string', () => {
    expect(typeof VERT).toBe('string');
    expect(VERT.length).toBeGreaterThan(0);
  });

  it('declares a_pos attribute', () => {
    expect(VERT).toContain('a_pos');
  });

  it('writes gl_Position', () => {
    expect(VERT).toContain('gl_Position');
  });
});

describe('buildFrag', () => {
  it('returns a string', () => {
    expect(typeof buildFrag(4)).toBe('string');
  });

  it('inlines the requested octave count', () => {
    expect(buildFrag(4)).toContain('i < 4');
    expect(buildFrag(6)).toContain('i < 6');
  });

  it('does not mix up octave counts', () => {
    expect(buildFrag(4)).not.toContain('i < 6');
    expect(buildFrag(6)).not.toContain('i < 4');
  });

  it('declares all expected uniforms', () => {
    const frag = buildFrag(4);
    for (const u of ['u_res', 'u_time', 'u_smoothMouse', 'u_clickTime', 'u_energy', 'u_hotCore']) {
      expect(frag).toContain(u);
    }
  });

  it('writes to outColor', () => {
    expect(buildFrag(4)).toContain('outColor');
  });

  it('is a valid GLSL 300 es shader (starts with version directive)', () => {
    expect(buildFrag(4).trimStart()).toMatch(/^#version 300 es/);
  });
});
