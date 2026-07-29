import CostumeOrderForm from '@/components/CostumeOrderForm'

export const metadata = { title: 'Through the Years — Íocón Graphics' }

export default function ThroughTheYearsPage() {
  return (
    <CostumeOrderForm
      orderType="through-the-years"
      title="Through the Years"
      intro="Each icon in this drawing will have a section within this order form. Fill out the form as you would like to see the dancers from left to right."
      sectionNoun="age"
      minSections={2}
    />
  )
}
