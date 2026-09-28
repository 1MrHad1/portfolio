import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
import type { Field } from './field';

gsap.registerPlugin(ScrollTrigger);

const root = document.documentElement;
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

// ---------- smooth scroll ----------
let lenis: Lenis | null = null;
if (!reducedMotion) {
  lenis = new Lenis({ lerp: 0.11 });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((t) => lenis?.raf(t * 1000));
  gsap.ticker.lagSmoothing(0);
}

document.querySelectorAll<HTMLAnchorElement>('a[href^="#"]').forEach((a) => {
  a.addEventListener('click', (e) => {
    const id = a.getAttribute('href');
    const target = id && id.length > 1 ? document.querySelector<HTMLElement>(id) : null;
    if (!target) return;
    e.preventDefault();
    if (lenis) lenis.scrollTo(target, { offset: -72 });
    else target.scrollIntoView();
    history.replaceState(null, '', id);
  });
});

// ---------- scroll progress + nav state ----------
const bar = document.querySelector<HTMLElement>('.progress i');
ScrollTrigger.create({
  start: 0,
  end: 'max',
  onUpdate: (self) => bar && (bar.style.transform = `scaleX(${self.progress})`),
});

const navLinks = new Map<string, HTMLElement>();
document.querySelectorAll<HTMLAnchorElement>('.nav-links a').forEach((a) => navLinks.set(a.hash, a));
document.querySelectorAll<HTMLElement>('main section[id]').forEach((section) => {
  ScrollTrigger.create({
    trigger: section,
    start: 'top 50%',
    end: 'bottom 50%',
    onToggle: (self) => navLinks.get(`#${section.id}`)?.classList.toggle('on', self.isActive),
  });
});

const nav = document.querySelector<HTMLElement>('.nav');
ScrollTrigger.create({ start: 40, end: 'max', onToggle: (self) => nav?.classList.toggle('solid', self.isActive) });

// ---------- reveals ----------
if (!reducedMotion) {
  root.classList.add('motion');

  gsap.fromTo(
    '.hero [data-r]',
    { y: 28, opacity: 0 },
    { y: 0, opacity: 1, duration: 1.1, ease: 'power3.out', stagger: 0.08, delay: 0.15 },
  );

  gsap.utils.toArray<HTMLElement>('main section:not(.hero) [data-r]').forEach((el) => {
    gsap.fromTo(
      el,
      { y: 36, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: 0.9,
        ease: 'power3.out',
        delay: Number(el.dataset.r || 0) * 0.07,
        scrollTrigger: { trigger: el, start: 'top 88%', once: true },
      },
    );
  });
}

// Automation flows animate their packet only while visible
document.querySelectorAll<HTMLElement>('.flow').forEach((flow) => {
  ScrollTrigger.create({ trigger: flow, start: 'top 90%', end: 'bottom 10%', onToggle: (s) => flow.classList.toggle('live', s.isActive) });
});

// ---------- 3D tilt + spotlight on cards ----------
if (finePointer && !reducedMotion) {
  document.querySelectorAll<HTMLElement>('[data-tilt]').forEach((card) => {
    const max = Number(card.dataset.tilt || 6);
    card.addEventListener('pointermove', (e) => {
      const r = card.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width;
      const y = (e.clientY - r.top) / r.height;
      card.style.setProperty('--mx', `${x * 100}%`);
      card.style.setProperty('--my', `${y * 100}%`);
      card.style.setProperty('--rx', `${(0.5 - y) * max}deg`);
      card.style.setProperty('--ry', `${(x - 0.5) * max}deg`);
    });
    card.addEventListener('pointerleave', () => {
      card.style.setProperty('--rx', '0deg');
      card.style.setProperty('--ry', '0deg');
    });
  });

  // Buttons lean toward the cursor
  document.querySelectorAll<HTMLElement>('[data-magnetic]').forEach((el) => {
    el.addEventListener('pointermove', (e) => {
      const r = el.getBoundingClientRect();
      gsap.to(el, { x: (e.clientX - r.left - r.width / 2) * 0.25, y: (e.clientY - r.top - r.height / 2) * 0.35, duration: 0.4 });
    });
    el.addEventListener('pointerleave', () => gsap.to(el, { x: 0, y: 0, duration: 0.6, ease: 'elastic.out(1, 0.4)' }));
  });
}

// ---------- client-work filters ----------
const grid = document.getElementById('grid');
document.querySelectorAll<HTMLButtonElement>('.filt').forEach((b) => {
  b.addEventListener('click', () => {
    document.querySelectorAll('.filt').forEach((x) => x.setAttribute('aria-pressed', 'false'));
    b.setAttribute('aria-pressed', 'true');
    const f = b.dataset.f;
    grid?.querySelectorAll<HTMLElement>('.site').forEach((c) => {
      c.hidden = !(f === 'all' || c.dataset.plat === f);
    });
    ScrollTrigger.refresh();
  });
});

// ---------- theme ----------
let field: Field | null = null;
document.getElementById('themeToggle')?.addEventListener('click', () => {
  const next = root.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
  root.setAttribute('data-theme', next);
  try {
    localStorage.setItem('theme', next);
  } catch {}
  field?.setTheme(next);
});

// ---------- WebGL field (loaded after first paint so it never blocks the LCP) ----------
function hasWebGL() {
  try {
    const c = document.createElement('canvas');
    return !!(c.getContext('webgl2') || c.getContext('webgl'));
  } catch {
    return false;
  }
}

async function bootField() {
  const canvas = document.querySelector<HTMLCanvasElement>('#field');
  if (!canvas || !hasWebGL()) {
    root.classList.add('no-webgl');
    return;
  }
  const { createField } = await import('./field');
  try {
    field = createField(canvas, {
      reducedMotion,
      tween: (target, value, duration) =>
        gsap.to(target, { value, duration, ease: 'power2.inOut', overwrite: true }),
    });
  } catch {
    root.classList.add('no-webgl');
    return;
  }
  canvas.classList.add('ready');

  const sections = gsap.utils.toArray<HTMLElement>('[data-formation]');
  const apply = (el: HTMLElement, instant = false) =>
    field?.goTo(Number(el.dataset.formation), Number(el.dataset.intensity || 1), instant);

  // Start in whichever formation the current scroll position calls for
  const mid = window.innerHeight / 2;
  const initial = sections.filter((s) => s.getBoundingClientRect().top < mid).pop() ?? sections[0];
  if (initial) apply(initial, true);

  sections.forEach((el) => {
    ScrollTrigger.create({
      trigger: el,
      start: 'top 55%',
      end: 'bottom 55%',
      onToggle: (self) => self.isActive && apply(el),
    });
  });

  lenis?.on('scroll', (e: Lenis) => field?.setAgitation(e.velocity));
}

const idle = (cb: () => void) =>
  'requestIdleCallback' in window ? window.requestIdleCallback(cb, { timeout: 1200 }) : setTimeout(cb, 200);
idle(bootField);
