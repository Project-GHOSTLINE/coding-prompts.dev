'use client'

import { useState } from 'react'

interface TerminalBlockProps {
  title?: string
  content?: string
  copyText?: string
  variant?: 'terminal' | 'error' | 'note'
}

export function TerminalBlock({
  title = 'Terminal output',
  content = '',
  copyText,
  variant = 'terminal'
}: TerminalBlockProps) {
  const [copied, setCopied] = useState(false)

  const textToCopy = copyText ?? content

  const handleCopy = async () => {
    if (!textToCopy) return

    try {
      await navigator.clipboard.writeText(textToCopy)
      setCopied(true)
      setTimeout(() => setCopied(false), 1200)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  const variantStyles = {
    terminal: 'bg-gray-950 border-white/10',
    error: 'bg-red-950/80 border-red-800/30',
    note: 'bg-blue-950/80 border-blue-800/30'
  }

  return (
    <div
      role="region"
      aria-label={title}
      data-clipboard={textToCopy}
      data-clipboard-title={title}
      className={`not-prose relative my-4 rounded-xl border ${variantStyles[variant]} shadow-sm`}
    >
      {/* Header with title and copy button */}
      <div className="flex justify-between items-center px-4 pt-4 pb-3 border-b border-white/10">
        <span className="text-gray-400 text-xs font-semibold uppercase tracking-wide">
          {title}
        </span>
        <button
          type="button"
          onClick={handleCopy}
          data-clipboard-button="true"
          aria-label={title ? `Copy terminal output: ${title}` : 'Copy terminal output'}
          title="Copy"
          className="px-3 py-1 text-xs font-medium text-gray-300 bg-gray-800 hover:bg-gray-700 rounded border border-gray-600 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {copied ? 'Copied' : 'Copy'}
        </button>
      </div>

      {/* Content */}
      <pre
        className="mt-3 overflow-x-auto rounded-lg bg-black/40 px-4 py-4 text-[13px] sm:text-sm md:text-base leading-relaxed font-mono text-white antialiased whitespace-pre"
        aria-label={title ? `Terminal output: ${title}` : 'Terminal output'}
      >
        {content}
      </pre>
    </div>
  )
}
