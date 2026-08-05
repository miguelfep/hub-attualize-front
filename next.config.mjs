import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const packageJson = require('./package.json');

const isStaticExport = 'false';

const nextConfig = {
  trailingSlash: true,
  basePath: process.env.NEXT_PUBLIC_BASE_PATH,
  env: {
    BUILD_STATIC_EXPORT: isStaticExport,
    // Injetada em build-time para que src/config-global.js não precise importar
    // o package.json (que iria inteiro para o bundle do cliente).
    NEXT_PUBLIC_APP_VERSION: packageJson.version,
  },
  modularizeImports: {
    '@mui/icons-material': {
      transform: '@mui/icons-material/{{member}}',
    },
    '@mui/material': {
      transform: '@mui/material/{{member}}',
      skipDefaultConversion: false,
    },
    '@mui/lab': {
      transform: '@mui/lab/{{member}}',
    },
    '@iconify/react': {
      transform: '@iconify/react/dist/iconify.js',
      skipDefaultConversion: true,
    },
    'lodash': {
      transform: 'lodash/{{member}}',
    },
  },
  experimental: {
    // Inlina o CSS crítico no HTML — remove os <link> de CSS do caminho
    // crítico de render (PageSpeed: "Render-blocking requests").
    inlineCss: true,
    // Corrige o scroll não resetar ao navegar (ex.: listagem do blog → post).
    // O handler antigo acha o 1º nó do segmento novo; como metadata/CSS da
    // página sofrem hoisting pro <head>, ele caminha pelos irmãos dentro do
    // head, não acha nada rolável e desiste. O novo usa Fragment refs.
    appNewScrollHandler: true,
    optimizePackageImports: [
      '@mui/icons-material',
      '@mui/lab',
      '@iconify/react',
    ],
  },
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production' ? {
      exclude: ['error', 'warn'],
    } : false,
  },
  // Otimização de imagens
  images: {
    // Capas/imagens do blog servidas pelo storage da API (otimizadas via next/image)
    remotePatterns: [
      { protocol: 'https', hostname: 'api.attualizecontabil.com.br' },
      { protocol: 'https', hostname: 'attualizecontabil.com.br' },
      { protocol: 'http', hostname: 'localhost', port: '9443' },
    ],
    // Next 16 bloqueia IPs de loopback no optimizer (proteção SSRF); em dev a
    // API roda em localhost:9443, então liberamos apenas fora de produção.
    ...(process.env.NODE_ENV !== 'production' && { dangerouslyAllowLocalIP: true }),
    formats: ['image/avif', 'image/webp'],
    // Next 16 rejeita qualities fora da lista; 85 é o padrão do nosso <Image>
    qualities: [70, 75, 85],
    // Sem o 3840: `sizes` descreve o tamanho em CSS pixels e o browser multiplica
    // pelo DPR, então em telas retina um banner full-bleed (sizes="100vw") pedia
    // sempre a variante de 3840px — vários MB para um elemento de 480px de altura.
    // 2048 já cobre retina em telas grandes com folga.
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 2678400, // 31 dias (era 60s — re-otimizava direto)
  },
  // Headers de cache para assets estáticos
  async headers() {
    return [
      {
        source: '/assets/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/_next/static/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/_next/image',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/fonts/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/logo/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=604800, must-revalidate',
          },
        ],
      },
    ];
  },
  // Configuração do Turbopack (Next.js 16 usa Turbopack por padrão)
  turbopack: {
    // Configurações do Turbopack podem ser adicionadas aqui se necessário
  },
  webpack(config, { isServer }) {
    config.module.rules.push(
      {
        test: /\.svg$/,
        use: ['@svgr/webpack'],
      },
      {
        test: /pdf\.worker\.mjs$/,
        type: 'asset/resource',
        generator: {
          filename: 'static/worker/[name].[hash][ext]', // Salva o worker em uma pasta estática
        },
      }
    );

    // Garantir que o módulo ws seja resolvido corretamente no servidor
    if (isServer) {
      // Criar alias para o módulo ws compilado do Next.js
      config.resolve.alias = {
        ...config.resolve.alias,
        'next/dist/compiled/ws': 'ws',
      };
    }

    // Configuração para framer-motion no Next.js 16
    // Resolver framer-motion para evitar problemas com HMR
    config.resolve.alias = {
      ...config.resolve.alias,
      'framer-motion': require.resolve('framer-motion'),
    };

    // Configuração para evitar problemas com HMR e módulos ESM
    config.experiments = {
      ...config.experiments,
      topLevelAwait: true,
    };

    return config;
  },
  ...(isStaticExport === 'true' && {
    output: 'export',
  }),
  reactStrictMode: true,

  async redirects() {
    return [
      {
        source: '/dashboard/guias-fiscais',
        destination: '/dashboard/guias-e-documentos',
        permanent: true,
      },
      {
        source: '/dashboard/guias-fiscais/upload',
        destination: '/dashboard/guias-e-documentos/upload',
        permanent: true,
      },
      {
        source: '/dashboard/guias-fiscais/:id',
        destination: '/dashboard/guias-e-documentos/:id',
        permanent: true,
      },
      {
        source: '/dashboard/guias-fiscais/:id/edit',
        destination: '/dashboard/guias-e-documentos/:id/edit',
        permanent: true,
      },
      {
        source: '/dashboard/gerenciador-de-arquivos',
        destination: '/dashboard/guias-e-documentos',
        permanent: true,
      },
      {
        source: '/dashboard/gerenciador-de-arquivos/upload',
        destination: '/dashboard/guias-e-documentos/upload',
        permanent: true,
      },
      {
        source: '/dashboard/gerenciador-de-arquivos/:id',
        destination: '/dashboard/guias-e-documentos/:id',
        permanent: true,
      },
      {
        source: '/dashboard/gerenciador-de-arquivos/:id/edit',
        destination: '/dashboard/guias-e-documentos/:id/edit',
        permanent: true,
      },
      {
        source: '/portal-cliente/guias-fiscais',
        destination: '/portal-cliente/guias-e-documentos',
        permanent: true,
      },
      {
        source: '/portal-cliente/guias-fiscais/calendario',
        destination: '/portal-cliente/guias-e-documentos',
        permanent: true,
      },
      {
        source: '/portal-cliente/guias-fiscais/:id',
        destination: '/portal-cliente/guias-e-documentos/:id',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
