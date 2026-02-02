import Link from 'next/link'

export default function TroubleshootingHub() {
  return (
    <div>
      <h1>Claude Code Troubleshooting</h1>
      <p className="text-xl text-gray-600 mb-8">
        Solutions for common Claude Code errors and issues.
      </p>

      <div className="space-y-4">
        <Link href="/troubleshooting/exit-code-1" className="block p-6 border rounded-lg hover:shadow">
          <h2 className="text-2xl font-bold mb-2">Fix {'"'}Process Exited with Code 1{'"'}</h2>
          <p className="text-gray-600">
            Common fix for permission and configuration errors
          </p>
        </Link>

        <Link href="/troubleshooting/dangerously-skip-permissions" className="block p-6 border rounded-lg hover:shadow">
          <h2 className="text-2xl font-bold mb-2">Dangerously Skip Permissions Guide</h2>
          <p className="text-gray-600">
            Complete setup and security guide
          </p>
        </Link>

        <Link href="/troubleshooting/5-hour-limit" className="block p-6 border rounded-lg hover:shadow">
          <h2 className="text-2xl font-bold mb-2">Approaching 5-Hour Limit</h2>
          <p className="text-gray-600">
            Understand and manage usage limits
          </p>
        </Link>
      </div>
    </div>
  )
}
