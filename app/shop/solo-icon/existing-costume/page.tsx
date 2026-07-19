import CostumeOrderForm from '@/components/CostumeOrderForm'

export const metadata = { title: 'Solo Icon — Íocón Graphics' }

export default function SoloIconExistingPage() {
  return (
    <CostumeOrderForm
      orderType="solo-icon"
      title="Solo Icon"
      intro="I will create a digital icon of a costume you already own. Fill in the details below and upload costume photos — the more info the better!"
      trail={[
        { label: 'Shop', href: '/shop' },
        { label: 'Solo Icon', href: '/shop/solo-icon' },
      ]}
      sectionNoun="dancer"
      minSections={1}
      maxSections={1}
      fixedCount
    />
  )
}
