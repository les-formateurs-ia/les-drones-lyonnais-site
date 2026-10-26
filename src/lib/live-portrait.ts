// Living portraits: the team's own photos, brought to life in WebGL without any library.
// One fragment shader warps the still photo by zones, driven by a few landmarks per
// photo (eyes, head, chin; tongue for Pop):
// - breathing: the chest and shoulders rise and widen slightly;
// - the head sways, turns towards the pointer (inner features move more than the
//   outline, which reads as a 3D turn) and the irises follow it;
// - the eyes blink: eyelids drawn in the colour of the skin under each eye;
// - Pop pants (his tongue stretches) and blinks.
// Until WebGL is ready — or without it, or with reduced motion — the plain photo shows.

export interface PortraitRig {
  /** Eye centres and half-sizes, in texture coordinates (0–1, origin top left). */
  eyes: [cx: number, cy: number, hw: number, hh: number][];
  /** Head centre and radii. */
  head: [cx: number, cy: number, rx: number, ry: number];
  /** Where the chin meets the neck. */
  chin: number;
  /** Pop's tongue: centre x, top y, half width, height. */
  tongue?: [cx: number, top: number, hw: number, h: number];
}

const VERT = `
attribute vec2 aPos;
varying vec2 vUv;
void main() {
  vUv = vec2(aPos.x * 0.5 + 0.5, 0.5 - aPos.y * 0.5);
  gl_Position = vec4(aPos, 0.0, 1.0);
}`;

const FRAG = `
precision highp float;
varying vec2 vUv;
uniform sampler2D uTex;
uniform vec2 uCover;
uniform vec2 uLook;
uniform float uTime, uBlink, uBreath, uPant, uDog;
uniform vec4 uEyeL, uEyeR, uHead, uTongue;
uniform float uChin;

vec2 rot(vec2 p, vec2 piv, float a) {
  p -= piv;
  float c = cos(a), s = sin(a);
  return vec2(c * p.x - s * p.y, s * p.x + c * p.y) + piv;
}

float eyeMask(vec2 uv, vec4 e) {
  return 1.0 - smoothstep(0.5, 1.0, length((uv - e.xy) / e.zw));
}

vec3 lid(vec3 col, vec2 src, vec4 e) {
  vec2 q = (src - e.xy) / e.zw;
  float zone = 1.0 - smoothstep(1.05, 1.35, length(q * vec2(0.92, 0.75)));
  float lidY = mix(-1.5, 1.15, uBlink);
  float cover = smoothstep(lidY + 0.2, lidY - 0.2, q.y) * zone;
  // Eyelid colour: the skin of the cheek just under the eye (above it lies the brow).
  vec3 skin = texture2D(uTex, e.xy + vec2(0.0, e.w * 3.2)).rgb;
  skin *= mix(1.0, 0.86, smoothstep(lidY - 0.9, lidY, q.y));
  col = mix(col, skin, cover);
  float lash = (1.0 - smoothstep(0.0, 0.22, abs(q.y - lidY))) * zone * smoothstep(0.08, 0.3, uBlink);
  return mix(col, vec3(0.13, 0.08, 0.06), lash * 0.75);
}

void main() {
  // Square canvas over a (nearly square) photo, "object-fit: cover".
  vec2 uv = 0.5 + (vUv - 0.5) * uCover;

  // Breathing: chest and shoulders rise and widen.
  float body = smoothstep(uChin - 0.02, uChin + 0.2, uv.y);
  vec2 shiftBody = vec2((uv.x - uHead.x) * uBreath * 0.012, -uBreath * 0.006) * body;

  // Head: sway, turn towards the pointer, slight roll around the neck.
  float hd = length((uv - uHead.xy) / uHead.zw);
  float wHead = 1.0 - smoothstep(0.85, 1.3, hd);
  float wInner = 1.0 - smoothstep(0.25, 0.8, hd);
  float roll = uLook.x * 0.03 + sin(uTime * 0.55) * 0.012;
  vec2 piv = vec2(uHead.x, uChin + 0.05);
  vec2 shiftHead = uLook * vec2(0.010, 0.007)
    + vec2(sin(uTime * 0.43) * 0.003, sin(uTime * 0.71) * 0.002 - uBreath * 0.002)
    + (uv - rot(uv, piv, -roll))
    + uLook * vec2(0.009, 0.006) * wInner;

  vec2 shift = mix(shiftBody, shiftHead, wHead);

  // Irises follow the pointer inside each eye.
  vec2 irisL = uLook * vec2(uEyeL.z * 0.22, uEyeL.w * 0.22);
  vec2 irisR = uLook * vec2(uEyeR.z * 0.22, uEyeR.w * 0.22);
  shift += (irisL * eyeMask(uv, uEyeL) + irisR * eyeMask(uv, uEyeR)) * wHead;

  // Pop pants: the tongue stretches down from its root.
  if (uDog > 0.5) {
    vec2 tq = (uv - vec2(uTongue.x, uTongue.y + uTongue.w * 0.5)) / vec2(uTongue.z * 1.3, uTongue.w * 0.75);
    float tm = 1.0 - smoothstep(0.75, 1.25, length(tq));
    shift.y += (uv.y - uTongue.y) * 0.16 * uPant * tm;
  }

  vec2 src = uv - shift;
  vec4 col = texture2D(uTex, src);
  if (uBlink > 0.001) {
    col.rgb = lid(col.rgb, src, uEyeL);
    col.rgb = lid(col.rgb, src, uEyeR);
  }
  gl_FragColor = col;
}`;

interface Live {
  canvas: HTMLCanvasElement;
  gl: WebGLRenderingContext;
  u: Record<string, WebGLUniformLocation | null>;
  rig: PortraitRig;
  look: [number, number];
  target: [number, number];
  blink: { next: number; start: number; double: boolean };
  seed: number;
  visible: boolean;
}

const lives: Live[] = [];
let pointer: [number, number] | null = null;
let lastPointer = 0;
let raf = 0;

function compile(gl: WebGLRenderingContext, type: number, src: string) {
  const s = gl.createShader(type)!;
  gl.shaderSource(s, src);
  gl.compileShader(s);
  if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s) ?? 'shader');
  return s;
}

function setup(canvas: HTMLCanvasElement, img: HTMLImageElement, rig: PortraitRig): Live | null {
  const gl = canvas.getContext('webgl', { premultipliedAlpha: true, alpha: true, antialias: false });
  if (!gl) return null;
  const prog = gl.createProgram()!;
  gl.attachShader(prog, compile(gl, gl.VERTEX_SHADER, VERT));
  gl.attachShader(prog, compile(gl, gl.FRAGMENT_SHADER, FRAG));
  gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return null;
  gl.useProgram(prog);

  const buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
  const aPos = gl.getAttribLocation(prog, 'aPos');
  gl.enableVertexAttribArray(aPos);
  gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

  const tex = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, tex);
  gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

  const names = ['uTex', 'uCover', 'uLook', 'uTime', 'uBlink', 'uBreath', 'uPant', 'uDog', 'uEyeL', 'uEyeR', 'uHead', 'uTongue', 'uChin'];
  const u = Object.fromEntries(names.map((n) => [n, gl.getUniformLocation(prog, n)]));

  // Cover: crop the longer side of the photo so it fills the square canvas.
  const ar = img.naturalWidth / img.naturalHeight;
  gl.uniform2f(u.uCover, ar > 1 ? 1 / ar : 1, ar > 1 ? 1 : ar);
  const [l, r] = rig.eyes;
  gl.uniform4f(u.uEyeL, ...l);
  gl.uniform4f(u.uEyeR, ...(r ?? l));
  gl.uniform4f(u.uHead, ...rig.head);
  gl.uniform1f(u.uChin, rig.chin);
  gl.uniform4f(u.uTongue, ...(rig.tongue ?? [0, 0, 0, 0]));
  gl.uniform1f(u.uDog, rig.tongue ? 1 : 0);

  return {
    canvas,
    gl,
    u,
    rig,
    look: [0, 0],
    target: [0, 0],
    blink: { next: performance.now() + 1200 + Math.random() * 2500, start: -1, double: false },
    seed: Math.random() * 100,
    visible: false,
  };
}

function resize(live: Live) {
  const dpr = Math.min(devicePixelRatio || 1, 2);
  const w = Math.round(live.canvas.clientWidth * dpr);
  if (w > 0 && live.canvas.width !== w) {
    live.canvas.width = w;
    live.canvas.height = w;
    live.gl.viewport(0, 0, w, w);
  }
}

// Eyelid position over a blink: quick close, slightly slower open.
function blinkAmount(live: Live, now: number) {
  const b = live.blink;
  if (b.start < 0 && now >= b.next) b.start = now;
  if (b.start < 0) return 0;
  const t = now - b.start;
  const CLOSE = 70;
  const OPEN = 110;
  if (t < CLOSE) return t / CLOSE;
  if (t < CLOSE + OPEN) return 1 - (t - CLOSE) / OPEN;
  if (b.double) {
    b.double = false;
    b.start = now + 90;
    b.next = b.start;
    return 0;
  }
  b.start = -1;
  b.next = now + 2200 + Math.random() * 3800;
  b.double = Math.random() < 0.2;
  return 0;
}

function frame(now: number) {
  raf = 0;
  const t = now / 1000;
  const idle = now - lastPointer > 2500;
  let any = false;
  for (const live of lives) {
    if (!live.visible) continue;
    any = true;
    // In the pinned team stage only the member in focus is shown.
    if (live.canvas.closest('[data-card]:not([data-active])') && innerWidth >= 1024) continue;
    resize(live);
    // Where to look: the pointer, or an idle glance around the room.
    if (pointer && !idle) {
      const r = live.canvas.getBoundingClientRect();
      const dx = (pointer[0] - (r.left + r.width / 2)) / Math.max(innerWidth * 0.4, 1);
      const dy = (pointer[1] - (r.top + r.height * 0.4)) / Math.max(innerHeight * 0.4, 1);
      live.target = [Math.max(-1, Math.min(1, dx)), Math.max(-1, Math.min(1, dy))];
    } else {
      const s = live.seed;
      live.target = [Math.sin(t * 0.35 + s) * 0.55, Math.sin(t * 0.23 + s * 2) * 0.3];
    }
    live.look[0] += (live.target[0] - live.look[0]) * 0.06;
    live.look[1] += (live.target[1] - live.look[1]) * 0.06;

    const { gl, u } = live;
    gl.uniform2f(u.uLook, live.look[0], live.look[1]);
    gl.uniform1f(u.uTime, t + live.seed);
    gl.uniform1f(u.uBreath, Math.sin((t + live.seed) * ((2 * Math.PI) / 4.2)));
    gl.uniform1f(u.uPant, (Math.sin((t + live.seed) * 2 * Math.PI * 1.6) + 1) / 2);
    gl.uniform1f(u.uBlink, blinkAmount(live, now));
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  }
  if (any) raf = requestAnimationFrame(frame);
}

function kick() {
  if (!raf) raf = requestAnimationFrame(frame);
}

export function initLivePortraits() {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const io = new IntersectionObserver((entries) => {
    for (const e of entries) {
      const live = lives.find((l) => l.canvas === e.target);
      if (live) live.visible = e.isIntersecting;
    }
    kick();
  });

  document.querySelectorAll<HTMLCanvasElement>('canvas[data-rig]').forEach((canvas) => {
    const rig = JSON.parse(canvas.dataset.rig!) as PortraitRig;
    const img = new Image();
    img.decoding = 'async';
    img.src = canvas.dataset.src!;
    img.decode().then(() => {
      try {
        const live = setup(canvas, img, rig);
        if (!live) return;
        lives.push(live);
        io.observe(canvas);
        canvas.classList.add('is-live');
      } catch {
        /* No WebGL: the still photo stays. */
      }
    });
  });

  addEventListener('scroll', kick, { passive: true });
  addEventListener(
    'pointermove',
    (e) => {
      pointer = [e.clientX, e.clientY];
      lastPointer = performance.now();
      kick();
    },
    { passive: true },
  );
}
