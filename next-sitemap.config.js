module.exports = {
    siteUrl: 'https://attualize.com.br',
    generateRobotsTxt: false, // robots.txt mantido manual em public/robots.txt
    priority: 0.7,
    changefreq: 'daily',
    exclude: ['/server-sitemap.xml'],
    robotsTxtOptions: {
      additionalSitemaps: [
        'https://attualize.com.br/server-sitemap.xml', // Sitemaps adicionais
      ],
    },
  }