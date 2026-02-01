interface QuickAnswerProps {
  solution: string
  verification?: string
}

export function QuickAnswer({ solution, verification }: QuickAnswerProps) {
  return (
    <div className="bg-green-50 border border-green-200 p-6 rounded-lg my-8">
      <div className="font-bold text-lg mb-4">⚡ Quick Answer</div>
      <div className="space-y-2">
        <p><strong>Solution:</strong> {solution}</p>
        {verification && <p><strong>Verify:</strong> {verification}</p>}
      </div>
    </div>
  )
}
