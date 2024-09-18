module.exports = {
    siteUrl: 'https://attualizecontabil.com.br',
    generateRobotsTxt: true, // opcional
    priority: null,
    changefreq: null,
    exclude: ['/server-sitemap.xml', '/post/*'],
    robotsTxtOptions: {
      additionalSitemaps: ['https://attualizecontabil.com.br/server-sitemap.xml'],
    },
  }