// Motion is decorative; links and details remain usable without JavaScript.
const motionPreference = matchMedia('(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)');
const surfaces = [...document.querySelectorAll('.product-stage, .brief-exhibit, .service-row')];
let pending = null;
let frame = 0;
function reset(surface) {
  surface.classList.remove('pointer-active');
  for (const key of ['--pointer-x', '--pointer-y', '--tilt-x', '--tilt-y', '--tint']) surface.style.removeProperty(key);
}
function flush() {
  frame = 0;
  if (!pending || !motionPreference.matches || document.hidden) return;
  const {surface, x, y} = pending;
  surface.style.setProperty('--pointer-x', `${x * 12}px`);
  surface.style.setProperty('--pointer-y', `${y * 9}px`);
  surface.style.setProperty('--tilt-x', `${-y * 7}deg`);
  surface.style.setProperty('--tilt-y', `${x * 9}deg`);
  surface.style.setProperty('--tint', `${25 + x * 35}deg`);
  surface.classList.add('pointer-active');
}
for (const surface of surfaces) {
  surface.classList.add('motion-surface');
  surface.addEventListener('pointermove', event => {
    if (!motionPreference.matches || event.pointerType !== 'mouse') return;
    const box = surface.getBoundingClientRect();
    const clamp = value => Math.max(-1, Math.min(1, value));
    pending = {surface, x: clamp(2 * (event.clientX - box.left) / box.width - 1), y: clamp(2 * (event.clientY - box.top) / box.height - 1)};
    if (!frame) frame = requestAnimationFrame(flush);
  }, {passive: true});
  const leave = () => { if (pending?.surface === surface) pending = null; reset(surface); };
  surface.addEventListener('pointerleave', leave);
  surface.addEventListener('pointercancel', leave);
}
const resetAll = () => { pending = null; cancelAnimationFrame(frame); frame = 0; surfaces.forEach(reset); };
motionPreference.addEventListener('change', resetAll);
document.addEventListener('visibilitychange', () => { if (document.hidden) resetAll(); });
window.addEventListener('blur', resetAll);
