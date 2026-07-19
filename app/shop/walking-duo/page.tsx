import CostumeOrderForm from '@/components/CostumeOrderForm'

export const metadata = { title: 'Walking Duo — Íocón Graphics' }

export default function WalkingDuoPage() {
  return (
    <CostumeOrderForm
      orderType="walking-duo"
      title="Walking Duo"
      intro="Two dancers walking side by side. Fill in a section for each dancer — costume details, photos, and preferences are handled separately for each."
      sectionNoun="dancer"
      minSections={2}
      maxSections={2}
      fixedCount
    />
  )
}
