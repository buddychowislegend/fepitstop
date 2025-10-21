import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/api/',
          '/analytics/',
          '/profile/',
          '/admin/',
          '/_next/',
          '/private/',
          '/dashboard/',
          '/settings/',
          '/billing/',
          '/payment/',
          '/reset-password/',
          '/forgot-password/'
        ],
      },
      {
        userAgent: 'Googlebot',
        allow: '/',
        disallow: [
          '/api/',
          '/analytics/',
          '/profile/',
          '/admin/',
          '/_next/',
          '/private/',
          '/dashboard/',
          '/settings/',
          '/billing/',
          '/payment/',
          '/reset-password/',
          '/forgot-password/'
        ],
      },
      {
        userAgent: 'Bingbot',
        allow: '/',
        disallow: [
          '/api/',
          '/analytics/',
          '/profile/',
          '/admin/',
          '/_next/',
          '/private/',
          '/dashboard/',
          '/settings/',
          '/billing/',
          '/payment/',
          '/reset-password/',
          '/forgot-password/'
        ],
      },
    ],
    sitemap: 'https://hireog.com/sitemap.xml',
    host: 'https://hireog.com'
  }
}

