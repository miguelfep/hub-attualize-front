module.exports = {
    siteUrl: 'https://www.attualize.com.br',
    trailingSlash: true,
    generateRobotsTxt: false, // robots.txt mantido manual em public/robots.txt
    priority: 0.7,
    changefreq: 'daily',
    exclude: ['/server-sitemap.xml'],
    robotsTxtOptions: {
      additionalSitemaps: [
        'https://www.attualize.com.br/server-sitemap.xml', // Sitemaps adicionais
      ],
    },
  }