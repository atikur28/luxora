export const i18n = {
  locales: [
    { code: "en-US", name: "English", icon: "🇺🇸" },
    { code: "fr", name: "Français", icon: "🇫🇷" },
    { code: "bn", name: "বাংলাদেশ", icon: "BD" },
    { code: "de", name: "Deutschland", icon: "DE" },
  ],
  defaultLocale: "en-US",
};

export const getDirection = (locale: string) => "ltr";
export type I18nConfig = typeof i18n;
export type Locale = I18nConfig["locales"][number];
