import { initializeApp, getApps, type FirebaseApp } from 'firebase/app';
import {
  getMessaging,
  getToken,
  isSupported,
  onMessage,
  type MessagePayload,
} from 'firebase/messaging';
import { apiClient } from '@/services/apiClient';
import { loadFirebaseConfig } from '@/services/firebaseConfig';
import type { FcmTokenResponse } from '@/types/notify';

const storedTokenKey = 'fcmToken';
const storedUserAgentKey = 'fcmTokenBrowser';

const resolveBrowserType = () => {
  if (typeof navigator === 'undefined') {
    return 'unknown';
  }
  return navigator.userAgent || 'unknown';
};

const ensureFirebaseApp = (config: Awaited<ReturnType<typeof loadFirebaseConfig>>): FirebaseApp => {
  if (getApps().length > 0) {
    return getApps()[0];
  }
  return initializeApp(config);
};

const clearStoredToken = () => {
  localStorage.removeItem(storedTokenKey);
  localStorage.removeItem(storedUserAgentKey);
};

const registerFcmToken = async (token: string, browserType: string) => {
  const storedToken = localStorage.getItem(storedTokenKey);
  const storedBrowserType = localStorage.getItem(storedUserAgentKey);

  if (storedToken === token && storedBrowserType === browserType) {
    return;
  }

  await apiClient.post('/notify/token', {
    deviceType: 'WEB',
    browserType,
    token,
  });

  localStorage.setItem(storedTokenKey, token);
  localStorage.setItem(storedUserAgentKey, browserType);
};

const fetchServerFcmToken = async (browserType: string) => {
  const { data } = await apiClient.get<FcmTokenResponse>('/notify/token', {
    params: { 'device-type': 'WEB', 'browser-type': browserType },
  });
  return data;
};

const needsTokenRefresh = (
  serverToken: FcmTokenResponse | null,
  storedToken: string | null,
  storedBrowserType: string | null,
  browserType: string,
) => {
  if (!serverToken || !serverToken.enabled) {
    return true;
  }
  if (!storedToken || storedToken !== serverToken.token) {
    return true;
  }
  if (storedBrowserType !== browserType) {
    return true;
  }
  return false;
};

export const initFcm = async (onForegroundMessage: (payload: MessagePayload) => void) => {
  const supported = await isSupported();
  if (!supported || typeof window === 'undefined' || typeof Notification === 'undefined') {
    return { unsubscribe: () => {} };
  }

  const permission = await Notification.requestPermission();
  if (permission !== 'granted') {
    return { unsubscribe: () => {} };
  }

  try {
    const config = await loadFirebaseConfig();
    const app = ensureFirebaseApp(config);

    let registration: ServiceWorkerRegistration | undefined;
    if ('serviceWorker' in navigator) {
      registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
    }

    const messaging = getMessaging(app);
    const browserType = resolveBrowserType();
    let serverToken: FcmTokenResponse | null = null;
    try {
      serverToken = await fetchServerFcmToken(browserType);
    } catch {
      serverToken = null;
    }

    const storedToken = localStorage.getItem(storedTokenKey);
    const storedBrowserType = localStorage.getItem(storedUserAgentKey);
    const shouldRefresh = needsTokenRefresh(serverToken, storedToken, storedBrowserType, browserType);

    if (shouldRefresh) {
      clearStoredToken();
      const token = await getToken(messaging, {
        vapidKey: config.vapidKey,
        serviceWorkerRegistration: registration,
      });
      if (token) {
        try {
          await registerFcmToken(token, browserType);
        } catch {
          // 토큰 등록 실패는 UX에 영향이 없도록 무시
        }
      }
    }

    const unsubscribe = onMessage(messaging, onForegroundMessage);
    return { unsubscribe };
  } catch {
    return { unsubscribe: () => {} };
  }
};
