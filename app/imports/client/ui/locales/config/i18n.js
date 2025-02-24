import VueI18n from 'vue-i18n';
import messages from '../languages';
import Vue from 'vue';
import LocaleService from './LocaleService.js';

Vue.use(VueI18n);

const i18n = new VueI18n(
  {
  locale: LocaleService.getSavedLocale(), fallbackLocale: 'en', 
  messages: {
    'en': messages.en,
    'pt': messages.pt,
    'es': messages.es,
    'fr': messages.fr
  }
});

export default i18n;