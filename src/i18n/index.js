import Vue from 'vue';
import VueI18n from 'vue-i18n';
import en from './en.json';

Vue.use(VueI18n);

const defaultLang = 'en';
export const i18n = new VueI18n({
  fallbackLocale: defaultLang,
  locale: defaultLang,
  messages: { en },
  silentTranslationWarn: true
});
