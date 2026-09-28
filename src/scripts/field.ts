/**
 * The site-wide WebGL background: one particle field that morphs between
 * five formations as the visitor scrolls. Everything animates on the GPU —
 * the position buffers are uploaded once and never touched again.
 *
 *   0  network sphere  (hero: the 98-site publishing network)
 *   1  stacked layers  (case studies: the full stack)
 *   2  flowing pipe    (automation: data moving through a pipeline)
 *   3  tile grid       (client work: 21 shipped sites)
 *   4  portal ring     (contact)
 */
import {
  AdditiveBlending,
  BufferAttribute,
  BufferGeometry,
  Color,
  LineSegments,
  NormalBlending,
  PerspectiveCamera,
  Points,
  Scene,
  ShaderMaterial,
  Vector3,
  WebGLRenderer,
} from 'three';

export const FORMATIONS = 5;
const NETWORK_NODES = 98;
const CLIENT_TILES = 21;
const SPHERE_R = 1.55;
const LAYER_TILT_SIN = Math.sin(0.34);
const LAYER_TILT_COS = Math.cos(0.34);

type Vec3 = [number, number, number];

interface Layout {
  offsets: Vec3[];
  scale: number;
  cameraZ: number;
}

const LAYOUTS: Record<'desktop' | 'mobile', Layout> = {
  desktop: {
    offsets: [[2.55, 0.05, 0], [2.3, 0, -1], [0, 0.1, -1.2], [0, 0, -2.2], [0, 0, -0.4]],
    scale: 1,
    cameraZ: 9,
  },
  mobile: {
    offsets: [[0, 2.5, -1.4], [0, 0.4, -2.4], [0, 0.2, -2], [0, 0, -3.5], [0, 0.2, -1.6]],
    scale: 0.72,
    cameraZ: 11.5,
  },
};

const PALETTE = {
  dark: { a: '#2dd4bf', b: '#f5a524', blending: AdditiveBlending },
  light: { a: '#0f766e', b: '#c2410c', blending: NormalBlending },
};

// ---------- formation builders (run once on the CPU) ----------

const GOLDEN = Math.PI * (3 - Math.sqrt(5));

function fibonacciPoint(i: number, n: number, r: number): Vec3 {
  const y = 1 - ((i + 0.5) / n) * 2;
  const rad = Math.sqrt(1 - y * y);
  const th = i * GOLDEN;
  return [Math.cos(th) * rad * r, y * r, Math.sin(th) * rad * r];
}

function sphere(i: number, n: number): Vec3 {
  if (Math.random() < 0.78) {
    const [x, y, z] = fibonacciPoint(i, n, SPHERE_R);
    const j = 1 + (Math.random() - 0.5) * 0.06;
    return [x * j, y * j, z * j];
  }
  // A soft inner volume so the sphere reads as a solid, not a shell
  const r = SPHERE_R * 0.92 * Math.cbrt(Math.random());
  const u = Math.random() * 2 - 1;
  const t = Math.random() * Math.PI * 2;
  const s = Math.sqrt(1 - u * u);
  return [r * s * Math.cos(t), r * u, r * s * Math.sin(t)];
}

function layers(i: number): Vec3 {
  // Four stacked platters: data, API, app, edge
  const layer = i % 4;
  const y = (layer - 1.5) * 0.72;
  const edge = Math.random() < 0.45;
  const r = edge ? 1.5 + Math.random() * 0.06 : 1.5 * Math.sqrt(Math.random());
  const a = Math.random() * Math.PI * 2;
  // Tilt each platter toward the camera; edge-on they read as speed streaks
  const z = Math.sin(a) * r;
  return [Math.cos(a) * r, y + z * LAYER_TILT_SIN + (Math.random() - 0.5) * 0.03, z * LAYER_TILT_COS];
}

function tiles(i: number): Vec3 {
  const cols = 7;
  const tile = i % CLIENT_TILES;
  const cx = ((tile % cols) - (cols - 1) / 2) * 1.32;
  const cy = (1 - Math.floor(tile / cols)) * 0.92;
  const w = 1.12;
  const h = 0.7;
  let x: number;
  let y: number;
  if (Math.random() < 0.55) {
    // Outline — pick a point on the rectangle's perimeter
    const p = Math.random() * 2 * (w + h);
    if (p < w) [x, y] = [p - w / 2, h / 2];
    else if (p < w + h) [x, y] = [w / 2, h / 2 - (p - w)];
    else if (p < 2 * w + h) [x, y] = [w / 2 - (p - w - h), -h / 2];
    else [x, y] = [-w / 2, -h / 2 + (p - 2 * w - h)];
  } else {
    [x, y] = [(Math.random() - 0.5) * w, (Math.random() - 0.5) * h];
  }
  return [cx + x, cy + y, (Math.random() - 0.5) * 0.05];
}

function ring(): Vec3 {
  const a = Math.random() * Math.PI * 2;
  const tube = Math.random() * Math.PI * 2;
  const tr = 0.32 * Math.sqrt(Math.random());
  const R = 2.3 + Math.cos(tube) * tr;
  return [Math.cos(a) * R, Math.sin(a) * R * 0.92, Math.sin(tube) * tr];
}

// ---------- shaders ----------

const COMMON = /* glsl */ `
  uniform float uTime;
  uniform float uMorph;
  uniform float uScale;
  uniform vec3 uOff[${FORMATIONS}];

  vec3 rotY(vec3 p, float a) {
    float c = cos(a), s = sin(a);
    return vec3(c * p.x + s * p.z, p.y, -s * p.x + c * p.z);
  }
  vec3 rotZ(vec3 p, float a) {
    float c = cos(a), s = sin(a);
    return vec3(c * p.x - s * p.y, s * p.x + c * p.y, p.z);
  }
  vec3 place(vec3 p, vec3 off) { return p * uScale + off; }
`;

const FIELD_VERT = /* glsl */ `
  ${COMMON}
  uniform float uSize;
  uniform float uPixelRatio;
  uniform float uIntensity;
  uniform vec3 uPointer;

  attribute vec3 aP1;
  attribute vec3 aP3;
  attribute vec3 aP4;
  attribute vec3 aRnd; // x: stagger, y: size/brightness, z: hot (0|1)

  varying float vAlpha;
  varying float vHot;

  vec3 pipe() {
    // Particles stream left to right along a twisting tube
    float x = mod(aRnd.x * 12.0 + uTime * (0.35 + aRnd.y * 0.25), 12.0) - 6.0;
    float ang = aRnd.y * 6.2831 + x * 1.3 + uTime * 0.4;
    float r = 0.25 + 0.3 * aRnd.x * (0.6 + 0.4 * sin(x * 0.8));
    return vec3(x, sin(x * 0.55 + 0.6) * 0.55 + sin(ang) * r, cos(ang) * r);
  }

  float seg(float k) {
    return smoothstep(0.0, 1.0, clamp((uMorph - k) * 1.35 - aRnd.x * 0.35, 0.0, 1.0));
  }

  void main() {
    vec3 f0 = place(rotY(position, uTime * 0.07), uOff[0]);
    // No spin: a Y-rotation would swing the tilted platters back to edge-on
    vec3 f1 = place(aP1 + vec3(0.0, sin(uTime * 0.6 + aP1.x * 0.7) * 0.02, 0.0), uOff[1]);
    vec3 f2 = place(pipe(), uOff[2]);
    vec3 f3 = place(aP3 + vec3(0.0, sin(uTime * 0.8 + aP3.x * 0.9) * 0.025, 0.0), uOff[3]);
    vec3 f4 = place(rotZ(aP4, uTime * 0.06), uOff[4]);

    float t1 = seg(0.0), t2 = seg(1.0), t3 = seg(2.0), t4 = seg(3.0);
    vec3 p = mix(f0, f1, t1);
    p = mix(p, f2, t2);
    p = mix(p, f3, t3);
    p = mix(p, f4, t4);

    // Burst outward mid-transition so morphs read as a scatter-and-regroup
    vec3 dir = normalize(vec3(aRnd.x - 0.5, aRnd.y - 0.5, fract(aRnd.x * 7.31) - 0.5) + 1e-4);
    float mid = t1 * (1.0 - t1) + t2 * (1.0 - t2) + t3 * (1.0 - t3) + t4 * (1.0 - t4);
    p += dir * mid * 2.2;

    // Idle shimmer
    float k = aRnd.x * 43.0;
    p += vec3(sin(uTime * 0.9 + k), cos(uTime * 0.7 + k * 1.3), sin(uTime * 0.6 + k * 0.7))
      * 0.018;

    // Pointer pushes particles away
    vec2 d = p.xy - uPointer.xy;
    float f = (1.0 - smoothstep(0.0, 1.25, length(d))) * uPointer.z;
    p.xy += normalize(d + 1e-4) * f * 0.5;
    p.z += f * 0.5;

    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_Position = projectionMatrix * mv;
    gl_PointSize = uSize * (0.5 + aRnd.y * 0.9) * (1.0 + aRnd.z * 1.1) * uPixelRatio / -mv.z;

    vAlpha = (0.3 + aRnd.y * 0.7) * uIntensity * smoothstep(22.0, 5.0, -mv.z);
    vHot = aRnd.z;
  }
`;

const FIELD_FRAG = /* glsl */ `
  uniform vec3 uColA;
  uniform vec3 uColB;
  varying float vAlpha;
  varying float vHot;

  void main() {
    float d = length(gl_PointCoord - 0.5);
    float a = smoothstep(0.5, 0.0, d);
    gl_FragColor = vec4(mix(uColA, uColB, vHot), a * a * vAlpha);
  }
`;

const NET_VERT = /* glsl */ `
  ${COMMON}
  uniform float uPixelRatio;
  attribute float aT;     // 0 at a segment's start vertex, 1 at its end
  attribute float aPhase; // per-segment pulse offset
  varying float vT;
  varying float vPhase;

  void main() {
    vec3 p = place(rotY(position, uTime * 0.07), uOff[0]);
    vT = aT;
    vPhase = aPhase;
    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_Position = projectionMatrix * mv;
    gl_PointSize = (10.0 + aPhase * 8.0) * uPixelRatio * 9.0 / -mv.z;
  }
`;

const LINE_FRAG = /* glsl */ `
  uniform float uTime;
  uniform float uNet;
  uniform vec3 uColA;
  uniform vec3 uColB;
  varying float vT;
  varying float vPhase;

  void main() {
    // A packet of light travels along every connection
    float head = fract(uTime * 0.28 + vPhase);
    float pulse = smoothstep(0.14, 0.0, abs(vT - head));
    vec3 col = mix(uColA, uColB, pulse);
    gl_FragColor = vec4(col, (0.2 + pulse * 0.8) * uNet);
  }
`;

const NODE_FRAG = /* glsl */ `
  uniform float uTime;
  uniform float uNet;
  uniform vec3 uColA;
  uniform vec3 uColB;
  varying float vPhase;

  void main() {
    float d = length(gl_PointCoord - 0.5);
    float core = smoothstep(0.22, 0.12, d);
    float halo = smoothstep(0.5, 0.0, d) * 0.35;
    float twinkle = 0.6 + 0.4 * sin(uTime * 2.0 + vPhase * 30.0);
    vec3 col = mix(uColA, uColB, step(0.82, vPhase));
    gl_FragColor = vec4(col, (core + halo) * twinkle * uNet);
  }
`;

// ---------- the field ----------

export interface Field {
  goTo(formation: number, intensity?: number, instant?: boolean): void;
  setTheme(theme: 'dark' | 'light'): void;
  destroy(): void;
}

interface Options {
  reducedMotion: boolean;
  /** Called with (uniform object, target value, duration) so the caller's tween library drives transitions. */
  tween: (target: { value: number }, value: number, duration: number) => void;
}

export function createField(canvas: HTMLCanvasElement, { reducedMotion, tween }: Options): Field {
  const renderer = new WebGLRenderer({ canvas, antialias: false, alpha: true, powerPreference: 'high-performance' });
  renderer.setClearColor(0x000000, 0);

  const scene = new Scene();
  const camera = new PerspectiveCamera(35, 1, 0.1, 60);

  const mobileQuery = window.matchMedia('(max-width: 760px)');
  const count = mobileQuery.matches ? 7000 : 15000;

  // --- particle buffers
  const p0 = new Float32Array(count * 3);
  const p1 = new Float32Array(count * 3);
  const p3 = new Float32Array(count * 3);
  const p4 = new Float32Array(count * 3);
  const rnd = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    p0.set(sphere(i, count), i * 3);
    p1.set(layers(i), i * 3);
    p3.set(tiles(i), i * 3);
    p4.set(ring(), i * 3);
    rnd.set([Math.random(), Math.random(), Math.random() < 0.06 ? 1 : 0], i * 3);
  }
  const geo = new BufferGeometry();
  geo.setAttribute('position', new BufferAttribute(p0, 3));
  geo.setAttribute('aP1', new BufferAttribute(p1, 3));
  geo.setAttribute('aP3', new BufferAttribute(p3, 3));
  geo.setAttribute('aP4', new BufferAttribute(p4, 3));
  geo.setAttribute('aRnd', new BufferAttribute(rnd, 3));

  const shared = {
    uTime: { value: 0 },
    uMorph: { value: 0 },
    uScale: { value: 1 },
    uOff: { value: Array.from({ length: FORMATIONS }, () => new Vector3()) },
    uPixelRatio: { value: 1 },
    uColA: { value: new Color() },
    uColB: { value: new Color() },
  };
  const uIntensity = { value: 1 };
  const uNet = { value: 1 };
  const uPointer = { value: new Vector3(0, 0, 0) };

  const fieldMat = new ShaderMaterial({
    uniforms: { ...shared, uSize: { value: 22 }, uIntensity, uPointer },
    vertexShader: FIELD_VERT,
    fragmentShader: FIELD_FRAG,
    transparent: true,
    depthWrite: false,
  });
  const field = new Points(geo, fieldMat);
  field.frustumCulled = false;
  scene.add(field);

  // --- network: 98 nodes, each linked to its nearest neighbours
  const nodes = Array.from({ length: NETWORK_NODES }, (_, i) => fibonacciPoint(i, NETWORK_NODES, SPHERE_R * 1.03));
  const linePos: number[] = [];
  const lineT: number[] = [];
  const linePhase: number[] = [];
  const seen = new Set<string>();
  nodes.forEach((a, i) => {
    nodes
      .map((b, j) => ({ j, d: (a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2 + (a[2] - b[2]) ** 2 }))
      .filter(({ j }) => j !== i)
      .sort((x, y) => x.d - y.d)
      .slice(0, 3)
      .forEach(({ j }) => {
        const key = i < j ? `${i}-${j}` : `${j}-${i}`;
        if (seen.has(key)) return;
        seen.add(key);
        const phase = Math.random();
        linePos.push(...a, ...nodes[j]);
        lineT.push(0, 1);
        linePhase.push(phase, phase);
      });
  });
  const lineGeo = new BufferGeometry();
  lineGeo.setAttribute('position', new BufferAttribute(new Float32Array(linePos), 3));
  lineGeo.setAttribute('aT', new BufferAttribute(new Float32Array(lineT), 1));
  lineGeo.setAttribute('aPhase', new BufferAttribute(new Float32Array(linePhase), 1));
  const lineMat = new ShaderMaterial({
    uniforms: { ...shared, uNet },
    vertexShader: NET_VERT,
    fragmentShader: LINE_FRAG,
    transparent: true,
    depthWrite: false,
  });
  const lines = new LineSegments(lineGeo, lineMat);
  lines.frustumCulled = false;
  scene.add(lines);

  const nodeGeo = new BufferGeometry();
  nodeGeo.setAttribute('position', new BufferAttribute(new Float32Array(nodes.flat()), 3));
  nodeGeo.setAttribute('aT', new BufferAttribute(new Float32Array(NETWORK_NODES), 1));
  nodeGeo.setAttribute('aPhase', new BufferAttribute(new Float32Array(nodes.map(() => Math.random())), 1));
  const nodeMat = new ShaderMaterial({
    uniforms: { ...shared, uNet },
    vertexShader: NET_VERT,
    fragmentShader: NODE_FRAG,
    transparent: true,
    depthWrite: false,
  });
  const nodePoints = new Points(nodeGeo, nodeMat);
  nodePoints.frustumCulled = false;
  scene.add(nodePoints);

  const materials = [fieldMat, lineMat, nodeMat];

  // --- theme
  function setTheme(theme: 'dark' | 'light') {
    const p = PALETTE[theme];
    shared.uColA.value.set(p.a);
    shared.uColB.value.set(p.b);
    for (const m of materials) {
      m.blending = p.blending;
      m.needsUpdate = true;
    }
  }

  // --- layout
  function applyLayout() {
    const layout = mobileQuery.matches ? LAYOUTS.mobile : LAYOUTS.desktop;
    layout.offsets.forEach((o, i) => shared.uOff.value[i].set(...o));
    shared.uScale.value = layout.scale;
    camera.position.z = layout.cameraZ;
  }

  function resize() {
    const w = window.innerWidth;
    const h = window.innerHeight;
    const dpr = Math.min(window.devicePixelRatio, 1.75);
    renderer.setPixelRatio(dpr);
    renderer.setSize(w, h, false);
    shared.uPixelRatio.value = dpr;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    applyLayout();
  }
  resize();
  window.addEventListener('resize', resize);

  // --- pointer → world position on the z = 0 plane
  const pointerNdc = { x: 0, y: 0, active: 0 };
  const onPointer = (e: PointerEvent) => {
    pointerNdc.x = (e.clientX / window.innerWidth) * 2 - 1;
    pointerNdc.y = -(e.clientY / window.innerHeight) * 2 + 1;
    pointerNdc.active = e.pointerType === 'mouse' ? 1 : 0;
  };
  const onLeave = () => (pointerNdc.active = 0);
  window.addEventListener('pointermove', onPointer, { passive: true });
  document.addEventListener('pointerleave', onLeave);
  const tmp = new Vector3();

  // --- loop
  let raf = 0;
  let last = performance.now();
  const speed = reducedMotion ? 0.12 : 1;

  function frame(now: number) {
    raf = requestAnimationFrame(frame);
    const dt = Math.min((now - last) / 1000, 0.05);
    last = now;
    shared.uTime.value += dt * speed;

    uNet.value = Math.max(0, 1 - Math.min(shared.uMorph.value, 1) * 1.4) * uIntensity.value;

    tmp.set(pointerNdc.x, pointerNdc.y, 0.5).unproject(camera).sub(camera.position).normalize();
    const dist = -camera.position.z / tmp.z;
    const px = camera.position.x + tmp.x * dist;
    const py = camera.position.y + tmp.y * dist;
    const u = uPointer.value;
    u.x += (px - u.x) * 0.12;
    u.y += (py - u.y) * 0.12;
    u.z += (pointerNdc.active * (reducedMotion ? 0 : 1) - u.z) * 0.06;

    camera.position.x += (pointerNdc.x * 0.25 - camera.position.x) * 0.04;
    camera.position.y += (pointerNdc.y * 0.18 - camera.position.y) * 0.04;
    camera.lookAt(0, 0, 0);

    renderer.render(scene, camera);
  }
  raf = requestAnimationFrame(frame);

  const onVisibility = () => {
    cancelAnimationFrame(raf);
    if (!document.hidden) {
      last = performance.now();
      raf = requestAnimationFrame(frame);
    }
  };
  document.addEventListener('visibilitychange', onVisibility);

  setTheme(document.documentElement.getAttribute('data-theme') === 'light' ? 'light' : 'dark');

  return {
    goTo(formation, intensity = 1, instant = false) {
      const f = Math.max(0, Math.min(FORMATIONS - 1, formation));
      if (instant || reducedMotion) {
        shared.uMorph.value = f;
        uIntensity.value = intensity;
        return;
      }
      const distance = Math.abs(shared.uMorph.value - f);
      tween(shared.uMorph, f, 1.4 + Math.min(distance, 3) * 0.35);
      tween(uIntensity, intensity, 1);
    },
    setTheme,
    destroy() {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
      window.removeEventListener('pointermove', onPointer);
      document.removeEventListener('pointerleave', onLeave);
      document.removeEventListener('visibilitychange', onVisibility);
      [geo, lineGeo, nodeGeo].forEach((g) => g.dispose());
      materials.forEach((m) => m.dispose());
      renderer.dispose();
    },
  };
}
