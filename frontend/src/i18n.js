import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import fr from './locales/fr.json';
import en from './locales/en.json';

const resources = {
  fr: { translation: fr },
  en: { translation: en },
};

const LANG_STORAGE_KEY = 'africadata-lang';
const savedLang = typeof window !== 'undefined' ? window.localStorage.getItem(LANG_STORAGE_KEY) : null;
/** Français par défaut : sans ça, la langue du navigateur (souvent en) affiche « Library » au lieu de « Bibliothèque ». */
const initialLng = savedLang === 'en' || savedLang === 'fr' ? savedLang : 'fr';

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    lng: initialLng,
    fallbackLng: 'fr',
    supportedLngs: ['fr', 'en'],
    interpolation: {
      escapeValue: false,
    },
    detection: {
      order: ['localStorage'],
      caches: ['localStorage'],
      lookupLocalStorage: LANG_STORAGE_KEY,
    },
  });

export default i18n;
