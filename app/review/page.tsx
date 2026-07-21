import ReviewForm from '@/components/ReviewForm'

export const metadata = { title: 'Leave a Review — Íocón Graphics' }

// Landing page for the review asks in Riley's emails (finished-order alert +
// the footer of her custom mail). Each crown in those emails links here as
// /review?rating=N, preselecting that crown — email clients can't submit
// forms reliably, and a plain GET must never create a review (link-scanning
// bots follow those), so the click only prefills.

export default async function ReviewPage({
  searchParams,
}: {
  searchParams: Promise<{ rating?: string }>
}) {
  const { rating } = await searchParams
  const parsed = Number(rating)
  const initialRating = Number.isInteger(parsed) && parsed >= 1 && parsed <= 5 ? parsed : 0

  return (
    <div className="max-w-lg mx-auto px-4 sm:px-6 py-12">
      <h1 className="font-heading text-4xl font-bold text-olive-800 mb-2">Leave a Review</h1>
      <p className="text-stone-500 text-sm mb-8">
        Ordered from Íocón before? Rate your experience and tell others how it went.
      </p>
      <div className="bg-white rounded-2xl border border-stone-200 p-6 sm:p-8 shadow-sm">
        <ReviewForm initialRating={initialRating} />
      </div>
    </div>
  )
}
