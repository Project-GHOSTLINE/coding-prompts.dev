import Link from 'next/link'

export default function Home() {
  return (
    <div>
      <section className="text-center py-12">
        <h1 className="text-5xl font-bold mb-4">Claude Code Guides</h1>
        <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
          Troubleshooting, setup guides, and feature tutorials for Claude Code.
        </p>
      </section>

      <section className="grid md:grid-cols-2 gap-6 mb-12">
        <Link href="/troubleshooting" className="p-6 border rounded-lg hover:shadow-lg transition">
          <h2 className="text-2xl font-bold mb-2">🔧 Troubleshooting</h2>
          <p className="text-gray-600 mb-4">Fix common errors and issues</p>
          <ul className="text-sm space-y-1">
            <li>• Exit Code 1</li>
            <li>• Permission Issues</li>
            <li>• 5-Hour Limit</li>
          </ul>
        </Link>

        <Link href="/setup" className="p-6 border rounded-lg hover:shadow-lg transition">
          <h2 className="text-2xl font-bold mb-2">⚙️ Setup & Config</h2>
          <p className="text-gray-600 mb-4">Installation and configuration</p>
          <ul className="text-sm space-y-1">
            <li>• Statusline Setup</li>
            <li>• Router Config</li>
            <li>• MCP Integration</li>
          </ul>
        </Link>

        <Link href="/features" className="p-6 border rounded-lg hover:shadow-lg transition">
          <h2 className="text-2xl font-bold mb-2">✨ Features</h2>
          <p className="text-gray-600 mb-4">Learn powerful features</p>
          <ul className="text-sm space-y-1">
            <li>• Sequential Thinking</li>
            <li>• Save Conversations</li>
            <li>• Output Styling</li>
          </ul>
        </Link>

        <Link href="/vs" className="p-6 border rounded-lg hover:shadow-lg transition">
          <h2 className="text-2xl font-bold mb-2">⚖️ Comparisons</h2>
          <p className="text-gray-600 mb-4">Claude Code vs alternatives</p>
          <ul className="text-sm space-y-1">
            <li>• vs Cursor</li>
            <li>• vs Codex</li>
            <li>• vs GPT-5</li>
          </ul>
        </Link>
      </section>

      <section className="bg-blue-50 p-8 rounded-lg">
        <h2 className="text-2xl font-bold mb-4">🚀 Most Popular Guides</h2>
        <div className="space-y-3">
          <Link href="/troubleshooting/exit-code-1" className="block p-4 bg-white rounded hover:shadow">
            <h3 className="font-bold">Fix {'"'}Process Exited with Code 1{'"'}</h3>
            <p className="text-sm text-gray-600">Common fix for permission and configuration errors</p>
          </Link>
          <Link href="/troubleshooting/dangerously-skip-permissions" className="block p-4 bg-white rounded hover:shadow">
            <h3 className="font-bold">Dangerously Skip Permissions Guide</h3>
            <p className="text-sm text-gray-600">Complete setup and security guide</p>
          </Link>
          <Link href="/setup/statusline" className="block p-4 bg-white rounded hover:shadow">
            <h3 className="font-bold">Statusline Setup & Customization</h3>
            <p className="text-sm text-gray-600">Step-by-step terminal statusline tutorial</p>
          </Link>
        </div>
      </section>
    </div>
  )
}
