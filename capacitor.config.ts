import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.crowthertech.errandbuddy',
  appName: 'Errand Buddy',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
    allowNavigation: [
      '*.base44.app',
      '*.base44.com',
      'cordial-errand-buddy-go.base44.app'
    ]
  }
};

export default config;