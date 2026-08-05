import 'src/global.css';

import Script from 'next/script';
import { Analytics } from '@vercel/analytics/next';
import { SpeedInsights } from '@vercel/speed-insights/next';

import { CONFIG } from 'src/config-global';
import { primary } from 'src/theme/core/palette';
import { I18nProvider } from 'src/locales/i18n-provider';
import { ThemeProvider } from 'src/theme/theme-provider';

import { ProgressBar } from 'src/components/progress-bar';
import { MotionLazy } from 'src/components/animate/motion-lazy';
import { detectSettings } from 'src/components/settings/server';
import { InitColorSchemeScript } from 'src/components/color-scheme-script';
import { defaultSettings, SettingsProvider } from 'src/components/settings';
import { MercadoPagoProvider } from 'src/components/mercado-pago/mercado-pago-provider';

// NB: MercadoPagoProvider vem do caminho direto, não do barril
// 'src/components/mercado-pago' — o barril reexporta os diálogos de checkout,
// que viriam junto para o bundle raiz.
//
// NB: apenas o provider JWT é importado. Importar os cinco (auth0/amplify/
// supabase/firebase) fazia o bundler incluir firebase, aws-amplify, @supabase e
// @auth0 no bundle do layout raiz — ou seja, em TODA página, inclusive as
// landings públicas — mesmo com CONFIG.auth.method fixo em 'jwt'. Para trocar de
// método, troque este import (e o CONFIG.auth.method) juntos.
import { AuthProvider } from 'src/auth/context/jwt';

import ClientAnalytics from './client-analytics';
import { ClientComponents } from './client-components';

// ----------------------------------------------------------------------

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: primary.main,
};

// Como o app é renderizado dinamicamente (o layout lê configurações via cookie),
// a função roda no servidor a cada request. Fixar a região em São Paulo (`gru1`)
// reduz o TTFB para o público no Brasil (o default da Vercel costuma ser US-East).
export const preferredRegion = 'gru1';

export const metadata = {
  metadataBase: new URL('https://www.attualize.com.br'),
  title: {
    default: 'Attualize HUB - Contabilidade Digital Especializada',
    template: `%s | ${CONFIG.site.name}`,
  },
  description:
    'Attualize Contábil é a contabilidade digital especializada em atender empresas nas áreas de beleza, saúde e bem-estar. Atendemos todo o Brasil com serviços personalizados e expertise no setor.',
  keywords: [
    'contabilidade digital',
    'contabilidade para psicólogos',
    'contabilidade para clínicas de estética',
    'abertura de empresa',
    'contabilidade online',
    'atendimento contábil',
    'gestão contábil',
  ],
  authors: [{ name: 'Attualize Contábil' }],
  creator: 'Attualize Contábil',
  publisher: 'Attualize Contábil',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: 'website',
    locale: 'pt_BR',
    url: 'https://www.attualize.com.br/',
    siteName: CONFIG.site.name,
    title: 'Attualize HUB - Contabilidade Digital Especializada',
    description:
      'Attualize Contábil é a contabilidade digital especializada em atender empresas nas áreas de beleza, saúde e bem-estar.',
    images: [
      {
        url: '/logo/attualize.png',
        width: 1200,
        height: 630,
        alt: 'Attualize HUB',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Attualize HUB - Contabilidade Digital Especializada',
    description:
      'Attualize Contábil é a contabilidade digital especializada em atender empresas nas áreas de beleza, saúde e bem-estar.',
    images: ['/logo/attualize.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    // Código do Google Search Console: defina NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION no .env
    ...(process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION && {
      google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION,
    }),
  },
};

export default async function RootLayout({ children }) {
  const lang = 'pt-BR';
  const settings = CONFIG.isStaticExport ? defaultSettings : await detectSettings();

  return (
    <html lang={lang} translate="no" suppressHydrationWarning>
      <head>
        {/* Charset PRIMEIRO no <head> (precisa estar nos primeiros 1024 bytes do HTML —
            requisito de Best Practices do Lighthouse). Como temos um <head> manual, o
            charset automático do Next pode cair depois dos demais tags; declaramos aqui. */}
        <meta charSet="utf-8" />
        {/* Bloqueia Google Translate (Chrome Translate / translate.google.com) para evitar
            que ele envolva nós de texto com <font> e quebre a virtual DOM do React. */}
        <meta name="google" content="notranslate" />
        <meta httpEquiv="Content-Language" content="pt-BR" />
        {/* Preconnect para Google Analytics - melhora tempo de conexão */}
        <link rel="preconnect" href="https://www.googletagmanager.com" />
        <link rel="dns-prefetch" href="https://www.googletagmanager.com" />
        {/* NB: o preload do banner mobile saiu daqui (era baixado em TODAS as páginas,
            prejudicando o FCP/banda no mobile). Agora vive só na landing de estética. */}
        <InitColorSchemeScript />
      </head>
      <body className="notranslate">
        {/* Google Analytics - Carregado com lazyOnload para não bloquear renderização inicial */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-L5BFBLV0Z4"
          strategy="lazyOnload"
        />
        <Script
          id="google-analytics"
          strategy="lazyOnload"
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'G-L5BFBLV0Z4', {
                send_page_view: false
              });
            `,
          }}
        />
        {/* NB: o LocalizationProvider (@mui/x-date-pickers + dayjs, ~25 KiB gz) saiu
            daqui — só as áreas autenticadas usam date pickers, então ele vive nos
            layouts de /dashboard e /portal-cliente. Mantê-lo aqui colocava os
            pickers no bundle de TODA página pública (blog, landings). */}
        <I18nProvider lang={lang}>
          <AuthProvider>
            <SettingsProvider
              settings={settings}
              caches={CONFIG.isStaticExport ? 'localStorage' : 'cookie'}
            >
              <ThemeProvider>
                <SpeedInsights />
                <MotionLazy>
                  <MercadoPagoProvider>
                    <ClientComponents>
                      <ProgressBar />
                      <Analytics />
                      <ClientAnalytics />
                      {children}
                    </ClientComponents>
                  </MercadoPagoProvider>
                </MotionLazy>
              </ThemeProvider>
            </SettingsProvider>
          </AuthProvider>
        </I18nProvider>
      </body>
    </html>
  );
}
