import CostumeOrderForm from '@/components/CostumeOrderForm'

export const metadata = { title: 'Group Icons — Íocón Graphics' }

export default function GroupIconsPage() {
  return (
    <CostumeOrderForm
      orderType="group-icons"
      title="Group Icons"
      intro="Icons of multiple dancers side by side. Each dancer gets their own section below — add as many as you need, and fill in each dancer's costume details and photos."
      sectionNoun="dancer"
      minSections={2}
    />
  )
}
