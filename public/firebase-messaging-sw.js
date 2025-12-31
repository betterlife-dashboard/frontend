/* eslint-disable no-restricted-globals */
importScripts('https://www.gstatic.com/firebasejs/10.14.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.14.1/firebase-messaging-compat.js');
const loadConfig = () =>
  fetch('/firebase-config.json', { cache: 'no-store' })
    .then((response) => (response.ok ? response.json() : null))
    .catch(() => null);

loadConfig().then((config) => {
  if (!config || !config.apiKey) {
    return;
  }
  firebase.initializeApp(config);
  const messaging = firebase.messaging();

  messaging.onBackgroundMessage((payload) => {
    const title =
      payload?.notification?.title ||
      payload?.data?.title ||
      '새 알림';
    const body =
      payload?.notification?.body ||
      payload?.data?.body ||
      '';
    const link = payload?.data?.link || '/';
    const notificationOptions = {
      body,
      data: { link },
      icon: '/icon.svg',
    };
    self.registration.showNotification(title, notificationOptions);
  });
});

self.addEventListener('notificationclick', (event) => {
  const link = event?.notification?.data?.link;
  event.notification.close();
  if (!link) {
    return;
  }
  event.waitUntil(
    clients
      .matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        const existing = clientList.find((client) => 'focus' in client);
        if (existing) {
          existing.focus();
          existing.navigate(link);
          return;
        }
        return clients.openWindow(link);
      }),
  );
});
