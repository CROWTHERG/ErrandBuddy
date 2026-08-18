import React, { useEffect } from "react";
import { Package } from "lucide-react";

// Your real production domain — update this if it ever changes
const CANONICAL_HOST = "www.errandbuddy.name.ng";

export default function AuthLayout({ icon: Icon, title, subtitle, footer, children }) {
  // If we're being viewed on Base44's hosted domain (e.g. bounced here
  // after logout, since Base44's auth backend ignores our redirect URL),
  // immediately forward to the real production domain, preserving the
  // path and any query params (like a reset token).
  //
  // Skip this entirely inside the native app (Capacitor) — there, the
  // WebView always runs on "localhost", which will never match
  // CANONICAL_HOST, so without this guard it would incorrectly treat
  // every load as "wrong domain" and hand off to the system browser.
  useEffect(() => {
    const isNative = window.Capacitor?.isNativePlatform?.() === true;
    if (isNative) return;

    if (window.location.hostname !== CANONICAL_HOST) {
      window.location.replace(
        `https://${CANONICAL_HOST}${window.location.pathname}${window.location.search}`
      );
    }
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-background px-4">
      <div className="flex-1 flex flex-col items-center justify-center">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary mb-3">
              <Package className="w-7 h-7 text-primary-foreground" aria-hidden="true" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">Errand Buddy</h1>
            <p className="text-muted-foreground mt-1 text-sm">{subtitle || title}</p>
          </div>
          <div className="bg-card rounded-2xl shadow-sm border border-border p-8">
            {children}
          </div>
          {footer && (
            <p className="text-center text-sm text-muted-foreground mt-6">{footer}</p>
          )}
        </div>
      </div>
      <footer className="py-6 text-center">
        <p className="text-xs text-muted-foreground">© 2025 Errand Buddy. All rights reserved.</p>
      </footer>
    </div>
  );
}