import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: ['*', 'GPTBot', 'ChatGPT-User', 'Claude-Web', 'Google-Extended'],
        allow: '/',
      },
    ],
    sitemap: 'https://coding-prompts.dev/sitemap.xml',
  }
}
