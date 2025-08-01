export function showNotification(message: string, type: 'success' | 'error'): void {
  const notificationId = `notification-${Date.now()}`;
  const notification = document.createElement('div');
  notification.id = notificationId;
  notification.className = `fixed top-5 right-5 p-4 rounded-lg shadow-lg text-white font-bold z-50 animate-fade-in-down ${type === 'success' ? 'bg-green-500' : 'bg-red-500'}`;
  notification.textContent = message;

  const mainContainer = document.querySelector('#app');
  if (mainContainer) {
    mainContainer.appendChild(notification);
  } else {
    document.body.appendChild(notification);
  }

  setTimeout(() => {
    notification.remove();
  }, 5000);
}
