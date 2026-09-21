// Short audible + haptic cue, shared by every timer that needs one.

export function beep(times = 1) {
  try {
    const ctx = new AudioContext();
    for (let i = 0; i < times; i++) {
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.connect(g); g.connect(ctx.destination);
      o.frequency.value = 880;
      const t0 = ctx.currentTime + i * 0.35;
      g.gain.setValueAtTime(0.15, t0);
      o.start(t0);
      o.stop(t0 + 0.25);
    }
    setTimeout(() => ctx.close(), 400 + times * 350);
  } catch { /* audio unavailable */ }
  try { navigator.vibrate?.(times > 1 ? [200, 100, 200] : 200); } catch { /* no vibration */ }
}
