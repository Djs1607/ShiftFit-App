// ── "Add to Home Screen" instructions ───────────────────────────────
// Single source of truth for install-prompt copy, shared by the
// Onboarding install step and the permanent Profile "Install app"
// section — both platform-detect the same way and render the same
// content, so keep any wording/detection changes here.

import { useEffect, useState } from 'react';

export type InstallPlatform = 'ios-safari' | 'ios-other' | 'android' | 'other';

/** iOS browsers other than Safari itself embed their own UA token. */
const IOS_OTHER_BROWSER = /CriOS|FxiOS|EdgiOS|OPiOS|OPT\/|Mercury/i;

export function detectInstallPlatform(ua: string): InstallPlatform {
  const isIOS = /iPad|iPhone|iPod/i.test(ua);
  if (isIOS) return IOS_OTHER_BROWSER.test(ua) ? 'ios-other' : 'ios-safari';
  if (/Android/i.test(ua)) return 'android';
  return 'other';
}

export interface InstallContent {
  steps?: string[];
  message?: string;
}

export function getInstallContent(platform: InstallPlatform): InstallContent {
  switch (platform) {
    case 'ios-safari':
      return {
        steps: [
          "Tap the Share button in Safari's toolbar",
          'Scroll down and tap Add to Home Screen',
          'Tap Add in the top-right',
        ],
      };
    case 'ios-other':
      return {
        message: "Open this page in Safari to install — other iOS browsers can't add apps to your home screen.",
      };
    case 'android':
      return {
        steps: [
          'Tap the menu (three dots) in Chrome',
          'Tap Add to Home screen or Install app',
          'Tap Install to confirm',
        ],
      };
    default:
      return {
        message: "You're on desktop right now — you can install this later from your phone. Find it anytime in Profile.",
      };
  }
}

export function useInstallInstructions(): InstallContent & { platform: InstallPlatform } {
  const [platform] = useState<InstallPlatform>(() =>
    typeof navigator === 'undefined' ? 'other' : detectInstallPlatform(navigator.userAgent)
  );
  return { platform, ...getInstallContent(platform) };
}

/** True once the app is running installed (standalone display mode). */
export function useIsStandalone(): boolean {
  const [standalone, setStandalone] = useState(
    () => typeof window !== 'undefined' && !!window.matchMedia?.('(display-mode: standalone)').matches
  );
  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const mq = window.matchMedia('(display-mode: standalone)');
    const onChange = () => setStandalone(mq.matches);
    mq.addEventListener?.('change', onChange);
    return () => mq.removeEventListener?.('change', onChange);
  }, []);
  return standalone;
}

/** Renders the platform-detected install steps or fallback message. */
export function InstallInstructions({ className = '' }: { className?: string }) {
  const { steps, message } = useInstallInstructions();
  if (steps) {
    return (
      <ol className={`space-y-2.5 ${className}`}>
        {steps.map((s, i) => (
          <li key={i} className="flex items-start gap-3">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-action-primary-quiet text-[12px] font-semibold text-coral-300">
              {i + 1}
            </span>
            <span className="pt-0.5 text-[14px] leading-relaxed text-fg-secondary">{s}</span>
          </li>
        ))}
      </ol>
    );
  }
  return <p className={`text-[14px] leading-relaxed text-fg-secondary ${className}`}>{message}</p>;
}
