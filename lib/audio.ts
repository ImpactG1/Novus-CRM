// Web Audio API synthetic chime and alert engine (zero external MP3 required)

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

export function playReminderSound(type: 'chime' | 'bell' | 'beep' | 'synth' = 'chime', volumePercent: number = 80) {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const gainNode = ctx.createGain();
    const gainValue = Math.max(0, Math.min(1, volumePercent / 100)) * 0.25; // comfortable volume ceiling
    gainNode.gain.setValueAtTime(gainValue, ctx.currentTime);
    gainNode.connect(ctx.destination);

    const now = ctx.currentTime;

    if (type === 'chime') {
      // Clean two-tone chime: 523Hz (C5) and 659Hz (E5)
      // Note 1: 523Hz
      const osc1 = ctx.createOscillator();
      const oscGain1 = ctx.createGain();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(523.25, now);
      oscGain1.gain.setValueAtTime(gainValue, now);
      oscGain1.gain.exponentialRampToValueAtTime(0.0001, now + 0.6);
      osc1.connect(oscGain1);
      oscGain1.connect(ctx.destination);
      osc1.start(now);
      osc1.stop(now + 0.6);

      // Note 2: 659Hz (harmonious E5) with slight offset
      const osc2 = ctx.createOscillator();
      const oscGain2 = ctx.createGain();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(659.25, now + 0.15);
      oscGain2.gain.setValueAtTime(gainValue * 1.1, now + 0.15);
      oscGain2.gain.exponentialRampToValueAtTime(0.0001, now + 1.2);
      osc2.connect(oscGain2);
      oscGain2.connect(ctx.destination);
      osc2.start(now + 0.15);
      osc2.stop(now + 1.2);

    } else if (type === 'bell') {
      // Resonant bell sound
      const osc = ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, now);
      osc.frequency.exponentialRampToValueAtTime(440, now + 0.8);
      gainNode.gain.setValueAtTime(gainValue, now);
      gainNode.gain.exponentialRampToValueAtTime(0.0001, now + 1.0);
      osc.connect(gainNode);
      osc.start(now);
      osc.stop(now + 1.0);

    } else if (type === 'beep') {
      // Crisp subtle double beep
      const osc1 = ctx.createOscillator();
      osc1.type = 'triangle';
      osc1.frequency.setValueAtTime(750, now);
      osc1.connect(gainNode);
      osc1.start(now);
      osc1.stop(now + 0.12);

      const osc2 = ctx.createOscillator();
      osc2.type = 'triangle';
      osc2.frequency.setValueAtTime(950, now + 0.18);
      osc2.connect(gainNode);
      osc2.start(now + 0.18);
      osc2.stop(now + 0.3);

    } else {
      // Modern synth chime
      const osc = ctx.createOscillator();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.4);
      gainNode.gain.setValueAtTime(gainValue * 0.4, now);
      gainNode.gain.exponentialRampToValueAtTime(0.0001, now + 0.7);
      osc.connect(gainNode);
      osc.start(now);
      osc.stop(now + 0.7);
    }
  } catch (err) {
    console.warn('Audio playback error (browser user-gesture policy):', err);
  }
}

// Request Desktop Notification Permission
export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return 'denied';
  }
  if (Notification.permission === 'granted') {
    return 'granted';
  }
  return await Notification.requestPermission();
}

// Send Desktop Notification
export function sendDesktopNotification(title: string, options?: NotificationOptions) {
  if (typeof window === 'undefined' || !('Notification' in window)) return;
  if (Notification.permission === 'granted') {
    try {
      new Notification(title, {
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        ...options,
      });
    } catch (e) {
      console.warn('Desktop notification failed:', e);
    }
  }
}
