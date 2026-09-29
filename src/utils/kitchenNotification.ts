/**
 * Utilities for Kitchen Staff Notifications:
 * - Haptic / Vibration API (navigator.vibrate)
 * - Web Audio API synthesizer for crystal-clear restaurant order chimes
 * - Web Push / Desktop Notifications (window.Notification)
 */

export interface KitchenAlertData {
  id: string;
  orderId: string;
  orderCode: string;
  tableName?: string;
  orderType: 'dine_in' | 'takeaway';
  itemCount: number;
  itemsSummary: string;
  totalAmount: number;
  timestamp: string;
  isNewRound?: boolean;
  roundNumber?: number;
}

// Global audio context singleton to reuse
let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  try {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return null;
    if (!audioCtx || audioCtx.state === 'closed') {
      audioCtx = new AudioContextClass();
    }
    return audioCtx;
  } catch (err) {
    console.warn('AudioContext not supported or blocked:', err);
    return null;
  }
}

/**
 * Triggers device vibration using the Vibration API.
 * Uses a rhythmic kitchen alert pattern: buzz - pause - buzz - pause - long buzz.
 */
export function triggerKitchenVibration(pattern: number[] = [280, 120, 280, 120, 450]): boolean {
  if (typeof window === 'undefined') return false;

  try {
    if ('vibrate' in navigator && typeof navigator.vibrate === 'function') {
      // Some browsers require user gesture first or silently ignore if not supported
      const result = navigator.vibrate(pattern);
      return result;
    }
  } catch (err) {
    console.warn('Vibration API error:', err);
  }
  return false;
}

/**
 * Synthesizes a pleasant, audible restaurant kitchen bell chime (Ding-Dong / Chime)
 * using the Web Audio API without needing external sound files.
 */
export function playKitchenChime(volume = 0.75): void {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    if (ctx.state === 'suspended') {
      ctx.resume().catch(() => {
        // User gesture may be required
      });
    }

    const now = ctx.currentTime;

    // Harmonic bell sequence: F5 (698.46 Hz) -> A5 (880.00 Hz) -> C6 (1046.50 Hz)
    const notes = [
      { freq: 698.46, start: 0, duration: 0.22, gain: 0.5 },
      { freq: 880.00, start: 0.16, duration: 0.28, gain: 0.6 },
      { freq: 1046.50, start: 0.32, duration: 0.55, gain: 0.7 }
    ];

    notes.forEach(({ freq, start, duration, gain }) => {
      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();

      // Sine wave with a touch of brightness
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + start);

      // Volume envelope: rapid attack + smooth exponential decay
      const peakGain = Math.max(0.01, Math.min(1.0, gain * volume));
      gainNode.gain.setValueAtTime(0.001, now + start);
      gainNode.gain.exponentialRampToValueAtTime(peakGain, now + start + 0.02);
      gainNode.gain.exponentialRampToValueAtTime(0.001, now + start + duration);

      osc.connect(gainNode);
      gainNode.connect(ctx.destination);

      osc.start(now + start);
      osc.stop(now + start + duration);
    });
  } catch (err) {
    console.warn('Unable to play synthesized kitchen chime:', err);
  }
}

/**
 * Request permission for Desktop / Browser Push Notifications
 */
export async function requestPushPermission(): Promise<'granted' | 'denied' | 'default' | 'unsupported'> {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return 'unsupported';
  }

  try {
    const permission = await Notification.requestPermission();
    return permission;
  } catch (err) {
    console.warn('Push permission request error:', err);
    return 'denied';
  }
}

/**
 * Dispatches a native browser desktop notification if permission has been granted
 */
export function sendBrowserPushNotification(
  title: string,
  body: string,
  tag = 'kitchen-order'
): boolean {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return false;
  }

  if (Notification.permission === 'granted') {
    try {
      const notif = new Notification(title, {
        body,
        icon: '/favicon.ico',
        tag,
        requireInteraction: false,
      });

      notif.onclick = () => {
        window.focus();
        notif.close();
      };

      // Auto close after 8s
      setTimeout(() => {
        try {
          notif.close();
        } catch {
          // ignore
        }
      }, 8000);

      return true;
    } catch (err) {
      console.warn('Browser push notification error:', err);
    }
  }

  return false;
}
