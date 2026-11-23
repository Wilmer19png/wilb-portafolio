// t('clave.anidada') para el navegador y para el render de las páginas.
import es from '../i18n/es.js';
import en from '../i18n/en.js';

export const dictionaries = { es, en };

export function translate(lang, key) {
  const value = key.split('.').reduce((obj, k) => (obj == null ? obj : obj[k]), dictionaries[lang]);
  if (value == null) {
    // Falta la traducción: se ve en pantalla para no esconder el hueco
    return lang === 'es' ? `TODO:${key}` : translate('es', key);
  }
  return value;
}

// En el navegador el idioma sale de <html lang>
export const currentLang = () =>
  typeof document !== 'undefined' && document.documentElement.lang === 'en' ? 'en' : 'es';

export const t = (key, lang = currentLang()) => translate(lang, key);
