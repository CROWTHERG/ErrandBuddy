import { useState, useEffect } from 'react';
import { X, Share, PlusSquare, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';

const DISMISS_KEY = 'eb_install_prompt_dismissed';

function isIos() {
  return /iphone|ipad|ipod/i.test(window.navigator.userAgent) && !window.MSStream;
}

function isInStandaloneMode() {
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    window.navigator.standalone === true
  );
}

export default function InstallPrompt() {
  const [visible, setVisible] = useState(false);
  const [platform, setPlatform] = useState(null); // 'ios' | 'android'
  const [deferredPrompt, setDeferredPrompt] = useState(null);

  useEffect(() => {
    if (isInStandaloneMode()) return; // already installed — never show
    if (localStorage.getItem(DISMISS_KEY) === 'true') return;

    if (isIos()) {
      // No native prompt exists on iOS — show our own instructions after a short delay
      const timer = setTimeout(() => {
        setPlatform('ios');
        setVisible(true);
      }, 2500);
      return () => clearTimeout(timer);
    }

    // Android/Chrome: capture the native prompt instead of letting the browser
    // show it on its own timing, so we control when/how it appears.
    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setPlatform('android');
      setVisible(true);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    setDeferredPrompt(null);
    setVisible(false);
    if (outcome !== 'accepted') {
      localStorage.setItem(DISMISS_KEY, 'true');
    }
  };

  const handleDismiss = () => {
    setVisible(false);
    localStorage.setItem(DISMISS_KEY, 'true');
  };

  if (!visible || !platform) return null;

  return (
    <div className="fixed bottom-20 left-0 right-0 z-[60] px-4 flex justify-center pointer-events-none">
      <div className="w-full max-w-md bg-card border border-border rounded-2xl shadow-lg p-4 flex items-start gap-3 pointer-events-auto">
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
          <Download className="w-5 h-5 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold">Install Errand Buddy</p>
          {platform === 'ios' ? (
            <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
              Tap <Share className="w-3.5 h-3.5 inline mx-0.5 -mt-0.5" /> then{' '}
              <span className="inline-flex items-center gap-0.5 font-medium text-foreground">
                "Add to Home Screen" <PlusSquare className="w-3.5 h-3.5" />
              </span>{' '}
              for quick access.
            </p>
          ) : (
            <p className="text-xs text-muted-foreground mt-1">
              Add to your home screen for a faster, app-like experience.
            </p>
          )}
          {platform === 'android' && (
            <Button onClick={handleInstallClick} size="sm" className="mt-2 h-8 rounded-lg text-xs">
              Install
            </Button>
          )}
        </div>
        <button
          onClick={handleDismiss}
          className="p-1 rounded-full hover:bg-muted transition-colors shrink-0"
          aria-label="Dismiss"
        >
          <X className="w-4 h-4 text-muted-foreground" />
        </button>
      </div>
    </div>
  );
}