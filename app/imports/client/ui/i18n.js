import Vue from 'vue';
import VueI18n from 'vue-i18n';

// Importa os arquivos de tradução
import en from '/imports/client/ui/locales/en.json';
import ptBR from '/imports/client/ui/locales/pt-BR.json';

Vue.use(VueI18n);

// Cria a instância do i18n
const i18n = new VueI18n({
  // Tenta pegar o idioma salvo, senão usa inglês
  locale: localStorage.getItem('locale') || 'en',
  // Se uma tradução não existir, usa inglês como fallback
  fallbackLocale: 'en',
  // Mensagens de tradução
  messages: {
    en,
    'pt-BR': ptBR,
  },
});

export default i18n;
