import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.anuragmaurya.gymai',
  appName: 'gym-ai',
  webDir: 'out',  // 👈 This is the important part!
  server: {
    androidScheme: 'https'
  }
};

export default config;