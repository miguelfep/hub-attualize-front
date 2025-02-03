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
  },
  webpack(config) {
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

    return config;
  },
  ...(isStaticExport === 'true' && {
    output: 'export',
  }),
  reactStrictMode: true,
  swcMinify: true,
};

export default nextConfig;
