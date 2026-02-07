import 'src/global.css';

import Script from 'next/script';
import dynamic from 'next/dynamic';
import { Analytics } from '@vercel/analytics/next';
import { SpeedInsights } from '@vercel/speed-insights/next';

import { CONFIG } from 'src/config-global';
import { primary } from 'src/theme/core/palette';
import { LocalizationProvider } from 'src/locales';
import { detectLanguage } from 'src/locales/server';
import { I18nProvider } from 'src/locales/i18n-provider';
import { ThemeProvider } from 'src/theme/theme-provider';
import { getInitColorSchemeScript } from 'src/theme/color-scheme-script';

import { ProgressBar } from 'src/components/progress-bar';
import { MotionLazy } from 'src/components/animate/motion-lazy';
import { detectSettings } from 'src/components/settings/server';
// import { MercadoPagoProvider } from 'src/components/mercado-pago'; // Removido temporariamente - será implementado depois
import { defaultSettings, SettingsProvider } from 'src/components/settings';

import { AuthProvider as JwtAuthProvider } from 'src/auth/context/jwt';
import { AuthProvider as Auth0AuthProvider } from 'src/auth/context/auth0';
import { AuthProvider as AmplifyAuthProvider } from 'src/auth/context/amplify';
import { AuthProvider as SupabaseAuthProvider } from 'src/auth/context/supabase';
import { AuthProvider as FirebaseAuthProvider } from 'src/auth/context/firebase';

import ClientAnalytics from './client-analytics';

// Lazy load de componentes não críticos para melhorar performance inicial
const Snackbar = dynamic(() => import('src/components/snackbar').then((mod) => ({ default: mod.Snackbar })), {
  ssr: false,
});

const SettingsDrawer = dynamic(() => import('src/components/settings').then((mod) => ({ default: mod.SettingsDrawer })), {
  ssr: false,
});

const CheckoutProvider = dynamic(() => import('src/sections/checkout/context').then((mod) => ({ default: mod.CheckoutProvider })), {
  ssr: false,
});

// ----------------------------------------------------------------------

const AuthProvider =
  (CONFIG.auth.method === 'amplify' && AmplifyAuthProvider) ||
  (CONFIG.auth.method === 'firebase' && FirebaseAuthProvider) ||
  (CONFIG.auth.method === 'supabase' && SupabaseAuthProvider) ||
  (CONFIG.auth.method === 'auth0' && Auth0AuthProvider) ||
  JwtAuthProvider;

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: primary.main,
};

export const metadata = {
  metadataBase: new URL('https://attualize.com.br'),
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
    url: 'https://attualize.com.br',
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
    // Adicione aqui quando tiver o código do Google Search Console
    // google: 'seu-codigo-google-search-console',
  },
};

export default async function RootLayout({ children }) {
  const lang = CONFIG.isStaticExport ? 'en' : await detectLanguage();
  const settings = CONFIG.isStaticExport ? defaultSettings : await detectSettings();

  const basePath = CONFIG.site.basePath || '';

  return (
    <html lang={lang ?? 'en'} suppressHydrationWarning>
      <head>
        {/* Preconnect para Google Analytics - melhora tempo de conexão */}
        <link rel="preconnect" href="https://www.googletagmanager.com" />
        <link rel="dns-prefetch" href="https://www.googletagmanager.com" />
        {/* Preload da imagem do banner mobile (LCP element crítico para página de estética) */}
        <link
          rel="preload"
          as="image"
          href={`${basePath}/assets/images/about/banner-6-mobile.png`}
          fetchPriority="high"
        />
      </head>
      <body>
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
        {getInitColorSchemeScript}
        <I18nProvider lang={CONFIG.isStaticExport ? undefined : lang}>
          <LocalizationProvider>
            <AuthProvider>
              <SettingsProvider
                settings={settings}
                caches={CONFIG.isStaticExport ? 'localStorage' : 'cookie'}
              >
                <ThemeProvider>
                  <SpeedInsights />
                  <MotionLazy>
                    {/* <MercadoPagoProvider> Removido temporariamente - será implementado depois */}
                      <CheckoutProvider>
                        <Snackbar />
                        <ProgressBar />
                        <SettingsDrawer />
                        <Analytics />
                        <ClientAnalytics />
                        {children}
                      </CheckoutProvider>
                    {/* </MercadoPagoProvider> */}
                  </MotionLazy>
                </ThemeProvider>
              </SettingsProvider>
            </AuthProvider>
          </LocalizationProvider>
        </I18nProvider>
      </body>
    </html>
  );
}
