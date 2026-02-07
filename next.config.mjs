const isStaticExport = 'false';

const nextConfig = {
  trailingSlash: true,
  basePath: process.env.NEXT_PUBLIC_BASE_PATH,
  env: {
    BUILD_STATIC_EXPORT: isStaticExport,
  },
  modularizeImports: {
    '@mui/icons-material': {
      transform: '@mui/icons-material/{{member}}',
    },
    '@mui/material': {
      transform: '@mui/material/{{member}}',
    },
    '@mui/lab': {
      transform: '@mui/lab/{{member}}',
    },
    '@iconify/react': {
      transform: '@iconify/react/dist/iconify.js',
      skipDefaultConversion: true,
    },
    'date-fns': {
      transform: 'date-fns/{{member}}',
    },
    'lodash': {
      transform: 'lodash/{{member}}',
    },
  },
  experimental: {
    optimizePackageImports: [
      '@mui/material',
      '@mui/icons-material',
      '@mui/lab',
      '@iconify/react',
      'date-fns',
    ],
    turbotrace: {
      logLevel: 'error',
    },
  },
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production' ? {
      exclude: ['error', 'warn'],
    } : false,
  },
  // Otimização de imagens
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60,
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

    return config;
  },
  ...(isStaticExport === 'true' && {
    output: 'export',
  }),
  reactStrictMode: true,
  swcMinify: true,
};

export default nextConfig;
