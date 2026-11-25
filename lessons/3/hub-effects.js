import { mountPixelBlast } from './pixel-blast.js';
import { mountSpotlight } from './spotlight-card.js';

const cleanups = [];
const field = document.querySelector('#pixel-field');
const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
function startEffects() {
  if (field) {
    try {
      const stop = mountPixelBlast(field, {
        color: '#3687d8', accentColor: '#69aeff', pixelSize: 2,
        patternScale: 2.6, patternDensity: .78, variation: 3,
        speed: reduced.matches ? 0 : .18, drift: reduced.matches ? 0 : .07,
        twinkle: 0, glow: .08, edgeFade: .3, softness: .2,
        hoverEffect: reduced.matches ? 'none' : 'reveal', hoverRadius: 100,
        enableRipples: !reduced.matches, rippleIntensityScale: .6,
        rippleSpeed: .25, intro: false, dpr: 1,
      });
      if (stop) cleanups.push(stop);
    } catch { /* The lesson remains fully usable without WebGL. */ }
  }
  document.querySelectorAll('.spotlight-card').forEach(card => {
    const stop = mountSpotlight(card, {
      spotlightColor: '#479bff', intensity: .08, borderGlow: .45,
      spotlightSize: 260, proximity: 60, smoothing: .45, flare: false,
    });
    if (stop) cleanups.push(stop);
  });
}
function stopEffects() { cleanups.splice(0).forEach(stop => stop()); }
startEffects();
addEventListener('pagehide', stopEffects);
addEventListener('pageshow', event => { if (event.persisted) startEffects(); });
reduced.addEventListener('change', () => { stopEffects(); startEffects(); });
