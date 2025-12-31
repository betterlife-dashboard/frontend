export interface FirebaseWebConfig {
  apiKey: string;
  authDomain?: string;
  projectId: string;
  storageBucket?: string;
  messagingSenderId: string;
  appId: string;
  measurementId?: string;
  vapidKey?: string;
}

let configPromise: Promise<FirebaseWebConfig> | null = null;

export const loadFirebaseConfig = () => {
  if (!configPromise) {
    configPromise = fetch('/firebase-config.json', { cache: 'no-store' })
      .then(async (response) => {
        if (!response.ok) {
          throw new Error('Firebase 설정을 불러오지 못했습니다.');
        }
        return (await response.json()) as FirebaseWebConfig;
      })
      .then((config) => {
        if (!config?.apiKey || !config?.projectId || !config?.messagingSenderId || !config?.appId) {
          throw new Error('Firebase 설정이 비어 있습니다.');
        }
        return config;
      });
  }
  return configPromise;
};
