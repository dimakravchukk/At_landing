export const VERT = /* glsl */ `#version 300 es
in vec2 a_pos;
void main(){ gl_Position = vec4(a_pos, 0.0, 1.0); }`;
export function buildFrag(octaves) {
    return /* glsl */ `#version 300 es
precision highp float;
uniform vec2  u_res;
uniform float u_time;
uniform vec2  u_smoothMouse;
uniform float u_clickTime;
uniform float u_energy;
uniform vec3  u_hotCore;
out vec4 outColor;

float hash21(vec2 p){
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}
float vnoise(vec2 p){
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f*f*(3.0 - 2.0*f);
  float a = hash21(i);
  float b = hash21(i + vec2(1.0, 0.0));
  float c = hash21(i + vec2(0.0, 1.0));
  float d = hash21(i + vec2(1.0, 1.0));
  return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
}
float fbm(vec2 p){
  float v = 0.0, a = 0.5;
  for (int i = 0; i < ${octaves}; i++){
    v += a * vnoise(p);
    p = p * 2.02 + vec2(11.7, 7.3);
    a *= 0.5;
  }
  return v;
}

void main(){
  vec2 p = (gl_FragCoord.xy * 2.0 - u_res) / u_res.y;
  vec2 m = (u_smoothMouse * 2.0 - 1.0) * vec2(u_res.x / u_res.y, 1.0);
  vec2 uv = gl_FragCoord.xy / u_res;

  float r  = length(p);
  float th = atan(p.y, p.x);

  float E = u_energy;
  float omega = (0.55 + 0.30 * E) + 1.0 / (r + 0.2);
  float thp = th + omega * u_time + 0.4 * E;

  float s = sin(thp), co = cos(thp);
  mat2 R = mat2(co, -s, s, co);
  vec2 sampled = R * p * 3.0 + vec2(0.0, u_time * 0.04);
  float rho = fbm(sampled);

  float core  = exp(-r * 1.9);
  float halo  = exp(-r * 0.6);
  float armsK = 1.0 + 0.45 * E;
  float arms  = smoothstep(0.22, 0.82, rho) * exp(-r * 0.9) * armsK;

  vec3 bgTop = vec3(0.050);
  vec3 bgBot = vec3(0.004);
  vec3 bg    = mix(bgBot, bgTop, smoothstep(0.0, 1.0, uv.y));
  float life = fbm(p * 0.55 + vec2(u_time * 0.04, -u_time * 0.03));
  bg += vec3(0.022) * (life - 0.5);
  bg *= mix(0.65, 1.0, smoothstep(1.9, 0.2, r));

  vec3 col = bg;

  float meshT = fbm(p * 0.42 + vec2(u_time * 0.05, -u_time * 0.03));
  vec3 mono   = vec3(0.055 + 0.060 * meshT);

  col += u_hotCore * (core * 1.6 + arms * 1.1);
  col += mono      * (halo * 0.55 + arms * 0.4);

  col += vec3(1.0, 0.93, 0.78) * exp(-r * 7.0) * (0.9 + 0.4 * E);

  float dust = fbm(p * 0.7 + u_time * 0.03);
  col += mono * 0.42 * smoothstep(0.4, 0.9, dust) * exp(-r * 0.35);

  float spark = pow(hash21(floor(p * 600.0)), 60.0);
  col += vec3(0.9, 0.85, 1.0) * spark * 0.6;

  float mLen = length(m);
  vec2  mDir = m / max(mLen, 1e-4);
  vec2  pDir = p / max(r, 1e-4);
  float side = dot(pDir, mDir);
  float lit  = max(side, 0.0);
  float lit2 = lit * lit;
  float mag  = smoothstep(0.0, 0.7, mLen);

  col += u_hotCore * lit2 * mag * (0.55 * exp(-r * 0.45) + 0.25 * arms);
  col += mono      * max(-side, 0.0) * mag * 0.55 * exp(-r * 0.55);

  float beam = pow(lit, 14.0) * mag * exp(-r * 0.6);
  col += vec3(1.0, 0.92, 0.78) * beam * 0.45;

  col += u_hotCore * exp(-u_clickTime * 1.8) * exp(-r * 1.4) * (0.35 + 0.25 * min(E, 2.0));

  col = vec3(1.0) - exp(-1.5 * col);
  col = pow(col, vec3(1.0/2.2));
  col *= mix(0.78, 1.0, smoothstep(1.9, 0.2, length(p)));

  outColor = vec4(col, 1.0);
}`;
}
