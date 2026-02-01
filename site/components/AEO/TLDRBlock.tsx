export function TLDRBlock({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-blue-50 border-l-4 border-blue-600 p-6 my-8 rounded-r-lg">
      <div className="font-bold text-sm uppercase text-blue-800 mb-2">TL;DR</div>
      <div className="text-lg leading-relaxed">{children}</div>
    </div>
  )
}
