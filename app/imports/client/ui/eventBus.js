// Simple event bus to replace Vue 2's $root.$on/$emit (removed in Vue 3)
const listeners = {};

export const eventBus = {
  on(event, callback) {
    if (!listeners[event]) listeners[event] = [];
    listeners[event].push(callback);
  },
  off(event, callback) {
    if (!listeners[event]) return;
    listeners[event] = listeners[event].filter(cb => cb !== callback);
  },
  emit(event, ...args) {
    if (!listeners[event]) return;
    listeners[event].forEach(cb => cb(...args));
  },
};
