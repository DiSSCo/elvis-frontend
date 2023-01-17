import { createI18n } from 'vue-i18n';
import en from './en.json';

const defaultLang = 'en';

const i18n = createI18n({
  locale: defaultLang,
  fallbackLocale: defaultLang,
  silentTranslationWarn: true,
  messages: { en },
});

export default i18n;
