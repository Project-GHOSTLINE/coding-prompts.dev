import Link from 'next/link'

export default function FeaturesHub() {
  return (
    <div>
      <h1>Claude Code Features</h1>
      <p className="text-xl text-gray-600 mb-8">
        Learn powerful features to maximize your productivity with Claude Code.
      </p>

      <div className="space-y-4">
        <Link href="/features/sequential-thinking" className="block p-6 border rounded-lg hover:shadow">
          <h2 className="text-2xl font-bold mb-2">Sequential Thinking Mode</h2>
          <p className="text-gray-600 mb-2">
            Enable deeper reasoning with sequential thinking
          </p>
        </Link>
      </div>
    </div>
  )
}
