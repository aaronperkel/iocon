import CostumeOrderForm from '@/components/CostumeOrderForm'

export const metadata = { title: 'Through the Years — Íocón' }

export default function ThroughTheYearsPage() {
  return (
    <CostumeOrderForm
      orderType="through-the-years"
      title="Through the Years"
      intro="One dancer drawn across the ages. Add a section for each age you want included — each with its own costume details and photos from that era."
      sectionNoun="age"
      minSections={2}
    />
  )
}
