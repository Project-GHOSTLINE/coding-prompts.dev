import Link from 'next/link'

export default function ComparisonsHub() {
  return (
    <div>
      <h1>Claude Code Comparisons</h1>
      <p className="text-xl text-gray-600 mb-8">
        How does Claude Code compare to other AI coding tools?
      </p>

      <div className="space-y-4">
        <Link href="/vs/cursor" className="block p-6 border rounded-lg hover:shadow">
          <h2 className="text-2xl font-bold mb-2">Claude Code vs Cursor</h2>
          <p className="text-gray-600 mb-2">
            Detailed comparison of features, pricing, and performance
          </p>
        </Link>
      </div>
    </div>
  )
}
