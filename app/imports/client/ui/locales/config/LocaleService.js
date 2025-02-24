export default class LocaleService {
  static STORAGE_KEY = 'userLocale';
  static DEFAULT_LOCALE = 'en';
  
  static getAvailableLocales() {
    return [
      { value: 'en', text: 'ENGLISH', flag: '🇬🇧' },
      { value: 'pt', text: 'PORTUGUÊS', flag: '🇧🇷' },
      { value: 'es', text: 'ESPAÑOL', flag: '🇪🇸' },
      { value: 'fr', text: 'FRANÇAIS', flag: '🇫🇷' }
    ];
  }

  static getSavedLocale() {
    return localStorage.getItem(this.STORAGE_KEY) || this.DEFAULT_LOCALE;
  }

  static saveLocale(locale) {
    localStorage.setItem(this.STORAGE_KEY, locale);
  }

  static async changeLocale(i18n, locale) {
    this.saveLocale(locale);
    i18n.locale = locale;
    
    // Cria um loading wall
    const loadingEl = document.createElement('div');
    loadingEl.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0,0,0,0.7);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 9999;
    `;
    loadingEl.innerHTML = '<div class="v-progress-circular primary--text" style="height: 70px; width: 70px;" role="progressbar" aria-valuemin="0" aria-valuemax="100"><svg xmlns="http://www.w3.org/2000/svg" viewBox="22.857142857142858 22.857142857142858 45.714285714285715 45.714285714285715" style="transform: rotate(0deg);"><circle fill="transparent" cx="45.714285714285715" cy="45.714285714285715" r="20" stroke-width="5.714285714285714" stroke-dasharray="125.664" stroke-dashoffset="125.66370614359172px" class="v-progress-circular__overlay"></circle></svg></div>';
    document.body.appendChild(loadingEl);

    // Aguarda um momento para mostrar o loading
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // Recarrega a página
    window.location.reload();
  }
}
