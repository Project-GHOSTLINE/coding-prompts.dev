interface ArticleSchemaProps {
  headline: string
  datePublished: string
  dateModified: string
  author?: string
}

export function ArticleSchema({
  headline,
  datePublished,
  dateModified,
  author = 'Coding Prompts'
}: ArticleSchemaProps) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'Article',
          headline,
          datePublished,
          dateModified,
          author: {
            '@type': 'Person',
            name: author
          }
        })
      }}
    />
  )
}
