"use client";

/**
 * A two-note chime for the end of a focus block, synthesized rather than
 * shipped as an audio file. It only ever runs after the user pressed Start,
 * so no autoplay policy is being worked around.
 */
export function playChime(): void {
  try {
    const AudioCtor =
      window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtor) return;

    const ctx = new AudioCtor();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const t = ctx.currentTime;

    osc.type = "sine";
    osc.frequency.setValueAtTime(880, t);
    osc.frequency.setValueAtTime(1318.5, t + 0.15);

    // Ramped rather than switched, so it reads as a chime and not a click.
    gain.gain.setValueAtTime(0.0001, t);
    gain.gain.exponentialRampToValueAtTime(0.16, t + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.55);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(t);
    osc.stop(t + 0.56);
    osc.onended = () => void ctx.close();
  } catch {
    // Sound is a nicety; a browser that refuses it changes nothing else.
  }
}
