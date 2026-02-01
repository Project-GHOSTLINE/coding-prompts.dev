import Link from 'next/link'

export default function SetupHub() {
  return (
    <div>
      <h1>Claude Code Setup & Configuration</h1>
      <p className="text-xl text-gray-600 mb-8">
        Step-by-step guides for installing and configuring Claude Code.
      </p>

      <div className="space-y-4">
        <Link href="/setup/statusline" className="block p-6 border rounded-lg hover:shadow">
          <h2 className="text-2xl font-bold mb-2">Statusline Setup & Customization</h2>
          <p className="text-gray-600">
            Configure Claude Code statusline display
          </p>
        </Link>

        <Link href="/setup/router" className="block p-6 border rounded-lg hover:shadow">
          <h2 className="text-2xl font-bold mb-2">Router Configuration Guide</h2>
          <p className="text-gray-600">
            Set up Claude Code router for optimal performance
          </p>
        </Link>
      </div>
    </div>
  )
}
