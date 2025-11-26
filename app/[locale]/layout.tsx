// app/[locale]/layout.tsx
import ClientProviders from "@/components/shared/client-providers";
import { getDirection } from "@/i18n-config";
import { routing } from "@/i18n/routing";
import { getSetting } from "@/lib/actions/setting.actions";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { Geist, Geist_Mono } from "next/font/google";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import { ReactNode } from "react";
import "../globals.css";

// Fonts (still SSR-safe)
const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

type AppLayoutProps = {
  params: { locale: string } | Promise<{ locale: string }>;
  children: ReactNode;
};

export default async function AppLayout({ params, children }: AppLayoutProps) {
  const resolvedParams = await params;
  const { locale } = resolvedParams;

  if (!routing.locales.includes(locale as any)) notFound();

  const [setting, messages] = await Promise.all([getSetting(), getMessages()]);

  const currencyCookie = (await cookies()).get("currency");
  const currency = currencyCookie ? currencyCookie.value : "USD";

  // Compose a static class string (avoid dynamic client-only variables here)
  const bodyClass = `min-h-screen antialiased`;

  return (
    <html lang={locale} dir={getDirection(locale) === "rtl" ? "rtl" : "ltr"} suppressHydrationWarning>
      <body className={bodyClass} suppressHydrationWarning>
        <NextIntlClientProvider locale={locale} messages={messages}>
          <ClientProviders setting={{ ...setting, currency }}>
            {children}
          </ClientProviders>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
