(function(){const t=document.createElement("link").relList;if(t&&t.supports&&t.supports("modulepreload"))return;for(const a of document.querySelectorAll('link[rel="modulepreload"]'))u(a);new MutationObserver(a=>{for(const c of a)if(c.type==="childList")for(const d of c.addedNodes)d.tagName==="LINK"&&d.rel==="modulepreload"&&u(d)}).observe(document,{childList:!0,subtree:!0});function r(a){const c={};return a.integrity&&(c.integrity=a.integrity),a.referrerPolicy&&(c.referrerPolicy=a.referrerPolicy),a.crossOrigin==="use-credentials"?c.credentials="include":a.crossOrigin==="anonymous"?c.credentials="omit":c.credentials="same-origin",c}function u(a){if(a.ep)return;a.ep=!0;const c=r(a);fetch(a.href,c)}})();const i={octaves:{coarse:4,fine:6},maxDpr:{coarse:1.5,fine:1.75},hotCore:[1,.74,.34],initialEnergyPerm:20,initialEnergyTran:20,tapPermDelta:.35,tapTranDelta:.7,tranDecayRate:.7,permSquash:.22,permScale:4,mouseSmoothing:.12},A=`#version 300 es
in vec2 a_pos;
void main(){ gl_Position = vec4(a_pos, 0.0, 1.0); }`;function P(o){return`#version 300 es
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
  for (int i = 0; i < ${o}; i++){
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
}`}function M(o,t,r){return Math.tanh(o*r.permSquash)*r.permScale+t}function C(o,t,r){return o*Math.exp(-.7*r)}const s=document.getElementById("stage"),x=matchMedia("(pointer: coarse)").matches||matchMedia("(max-width: 720px)").matches,L=x?i.octaves.coarse:i.octaves.fine,R=x?i.maxDpr.coarse:i.maxDpr.fine,e=s.getContext("webgl2",{antialias:!0,premultipliedAlpha:!1,powerPreference:"high-performance"});if(!e)throw document.body.innerHTML='<div style="padding:40px;color:#ffe7c4;font-family:monospace">WebGL2 not supported.</div>',new Error("WebGL2 not supported");function y(o,t){const r=e.createShader(o);if(e.shaderSource(r,t),e.compileShader(r),!e.getShaderParameter(r,e.COMPILE_STATUS)){const u=e.getShaderInfoLog(r);throw e.deleteShader(r),new Error(`Shader compile failed:
${u}`)}return r}function m(o,t){const r=e.getUniformLocation(o,t);if(!r)throw new Error(`Uniform '${t}' not found`);return r}const n=e.createProgram();e.attachShader(n,y(e.VERTEX_SHADER,A));e.attachShader(n,y(e.FRAGMENT_SHADER,P(L)));e.linkProgram(n);if(!e.getProgramParameter(n,e.LINK_STATUS))throw new Error(`Program link failed:
${e.getProgramInfoLog(n)}`);const D=e.createBuffer();e.bindBuffer(e.ARRAY_BUFFER,D);e.bufferData(e.ARRAY_BUFFER,new Float32Array([-1,-1,3,-1,-1,3]),e.STATIC_DRAW);const w=e.getAttribLocation(n,"a_pos");e.enableVertexAttribArray(w);e.vertexAttribPointer(w,2,e.FLOAT,!1,0,0);const l={res:m(n,"u_res"),time:m(n,"u_time"),smoothMouse:m(n,"u_smoothMouse"),clickTime:m(n,"u_clickTime"),energy:m(n,"u_energy"),hotCore:m(n,"u_hotCore")},v=Math.min(window.devicePixelRatio||1,R);function g(){s.width=Math.max(1,Math.floor(s.clientWidth*v)),s.height=Math.max(1,Math.floor(s.clientHeight*v)),e.viewport(0,0,s.width,s.height)}g();new ResizeObserver(g).observe(s);window.addEventListener("orientationchange",g);const h=[.5,.5],f=[.5,.5];let b=-1e3,E=i.initialEnergyPerm,p=i.initialEnergyTran;function T(o){const t=s.getBoundingClientRect();h[0]=(o.clientX-t.left)/t.width,h[1]=1-(o.clientY-t.top)/t.height}window.addEventListener("pointermove",T,{passive:!0});window.addEventListener("pointerdown",o=>{T(o),b=performance.now()/1e3,E+=i.tapPermDelta,p+=i.tapTranDelta},{passive:!0});const F=performance.now()/1e3;let _=performance.now()/1e3;function S(){const o=performance.now()/1e3,t=Math.min(.1,o-_);_=o,f[0]+=(h[0]-f[0])*i.mouseSmoothing,f[1]+=(h[1]-f[1])*i.mouseSmoothing,p=C(p,i.tranDecayRate,t);const r=M(E,p,i);e.useProgram(n),e.uniform2f(l.res,s.width,s.height),e.uniform1f(l.time,o-F),e.uniform2f(l.smoothMouse,f[0],f[1]),e.uniform1f(l.clickTime,Math.max(0,o-b)),e.uniform1f(l.energy,r),e.uniform3f(l.hotCore,i.hotCore[0],i.hotCore[1],i.hotCore[2]),e.drawArrays(e.TRIANGLES,0,3),requestAnimationFrame(S)}requestAnimationFrame(S);
