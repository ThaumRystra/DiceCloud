import VueI18n from 'vue-i18n';
import messages from './locales';
import Vue from 'vue';

Vue.use(VueI18n);

function detectBrowserLocale() {
  const availableLocales = Object.keys(messages);
  const browserLocale = navigator.language || navigator.languages[0] || 'en';
  const locale = browserLocale.split('-')[0];

  return availableLocales.includes(locale) ? locale : 'en';
}
const i18n = new VueI18n({
  locale: detectBrowserLocale(),
  fallbackLocale: 'en',
    messages: {
    'en': messages.en,
    'pt': messages.pt,
    'es': messages.es,
    'fr': messages.fr
  },
});

export default i18n;
