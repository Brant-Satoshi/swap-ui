import { cookies } from "next/headers";
import { getRequestConfig } from "next-intl/server";

const locales = ["en", "cn"] as const;
const defaultLocale = "en";

export default getRequestConfig(async () => {
  const store = await cookies();
  const cookieLocale = store.get("locale")?.value;
  const isValidLocale =
    cookieLocale && locales.includes(
      cookieLocale as (typeof locales)[number]
    );
  const locale: string = isValidLocale ? cookieLocale : defaultLocale;

  return {
    locale,
    messages: (await import(`../../messages/${locale}.json`)).default,
  };
});
