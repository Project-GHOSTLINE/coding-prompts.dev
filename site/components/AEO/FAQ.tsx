import { FAQSchema } from '@/components/Schema/FAQSchema'

interface FAQItem {
  question: string
  answer: string
}

export function FAQ({ items }: { items: FAQItem[] }) {
  return (
    <>
      <FAQSchema faqs={items} />
      <section className="my-12">
        <h2 className="text-3xl font-bold mb-6">Frequently Asked Questions</h2>
        <div className="space-y-6">
          {items.map((item, index) => (
            <div key={index} className="border-l-4 border-blue-500 pl-6 py-2">
              <h3 className="text-xl font-semibold mb-3">{item.question}</h3>
              <p className="text-gray-700 leading-relaxed">{item.answer}</p>
            </div>
          ))}
        </div>
      </section>
    </>
  )
}
