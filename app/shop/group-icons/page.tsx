import CostumeOrderForm from '@/components/CostumeOrderForm'

export const metadata = { title: 'Group Icons — Íocón Graphics' }

export default function GroupIconsPage() {
  return (
    <CostumeOrderForm
      orderType="group-icons"
      title="Group Icons"
      intro="Each icon in this drawing will have a section within this order form. Fill out the form as you would like to see the dancers from left to right."
      sectionNoun="dancer"
      minSections={2}
    />
  )
}
