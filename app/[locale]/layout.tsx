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

// Fonts
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export async function generateMetadata() {
  const {
    site: { slogan, name, description, url },
  } = await getSetting();
  return {
    title: {
      template: `%s | ${name}`,
      default: `${name}. ${slogan}`,
    },
    description,
    metadataBase: new URL(url),
  };
}

type AppLayoutProps = {
  params: { locale: string } | Promise<{ locale: string }>;
  children: React.ReactNode;
};

export default async function AppLayout({
  params,
  children,
}: AppLayoutProps): Promise<ReactNode> {
  const resolvedParams = await params;
  const { locale } = resolvedParams;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  if (!routing.locales.includes(locale as any)) {
    notFound();
  }

  const [setting, messages] = await Promise.all([getSetting(), getMessages()]);

  const currencyCookie = (await cookies()).get("currency");
  const currency = currencyCookie ? currencyCookie.value : "USD";

  return (
    <html
      lang={locale}
      dir={getDirection(locale) === "rtl" ? "rtl" : "ltr"}
      suppressHydrationWarning
    >
      <body
        className={`min-h-screen ${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <NextIntlClientProvider locale={locale} messages={messages}>
          <ClientProviders setting={{ ...setting, currency }}>
            {children}
          </ClientProviders>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
