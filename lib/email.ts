// ---------------------------------------------------------------------------
// Shared email layer — iCloud Mail SMTP via nodemailer.
//
// Env vars (see .env.local; mirror into Vercel for production):
//   SMTP_HOST / SMTP_PORT / SMTP_USER / SMTP_PASS
//     iCloud SMTP. SMTP_USER must be the account's primary @icloud.com
//     address (the Apple ID — a gmail — gets 550, the custom-domain aliases
//     get 535); SMTP_PASS is an app-specific password, NOT her real password.
//   CONTACT_EMAIL_TO
//     Riley's inbox (contact form + new-order notifications).
//     Defaults to riley@iocongraphics.com.
//
// Three kinds of mail leave this module:
//   • Automated customer alerts (order placed / queue moved / being drawn /
//     finished) — from orders@iocongraphics.com, Reply-To Riley, and only
//     when the customer chose email as their contact method.
//   • Custom mail Riley composes in the admin portal — from
//     riley@iocongraphics.com, since she's the one writing it.
//   • Mail to Riley (contact form, new-order notifications) — Reply-To the
//     customer when we have their email, so she can reply directly.
//
// When SMTP env vars are missing (fresh clone), every helper logs the message
// and returns instead of throwing, so dev works without credentials.
// ---------------------------------------------------------------------------

import 'server-only'
import nodemailer, { type Transporter } from 'nodemailer'
import { ORDER_TYPE_LABELS, CONTACT_METHOD_LABELS, type Order } from './orders'
import { PRODUCT_FORMAT_LABELS } from './products'
import { SITE_URL } from './site'

const ORDERS_FROM = { name: 'Íocón Orders', address: 'orders@iocongraphics.com' }
const RILEY_FROM = { name: 'Riley at Íocón', address: 'riley@iocongraphics.com' }
const RILEY_REPLY_TO = 'riley@iocongraphics.com'

function rileyInbox(): string {
  return process.env.CONTACT_EMAIL_TO || 'riley@iocongraphics.com'
}

export function isEmailConfigured(): boolean {
  return Boolean(process.env.SMTP_USER && process.env.SMTP_PASS)
}

let transporter: Transporter | null = null

function getTransporter(): Transporter | null {
  if (!isEmailConfigured()) return null
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.mail.me.com',
      port: Number(process.env.SMTP_PORT) || 587,
      secure: false, // STARTTLS on 587
      requireTLS: true,
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    })
  }
  return transporter
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

// Minimal branded shell: Times New Roman heading, olive wordmark, gold rule —
// mirrors the site's heading/accent roles without webfonts or images.
function brandedHtml(paragraphsHtml: string): string {
  return `<div style="max-width:560px;margin:0 auto;padding:24px;font-family:-apple-system,'Segoe UI',Helvetica,Arial,sans-serif;color:#333;font-size:15px;line-height:1.6;">
  <p style="font-family:'Times New Roman',Times,serif;font-size:26px;font-weight:bold;color:#8B8A00;margin:0 0 4px;">Íocón</p>
  <div style="border-bottom:2px solid #FFB101;margin-bottom:20px;"></div>
  ${paragraphsHtml}
  <p style="margin:24px 0 0;color:#777;font-size:13px;">Íocón · Hand made graphics for Irish dancers · iocongraphics.com</p>
</div>`
}

async function send(options: {
  to: string
  subject: string
  text: string
  html: string
  replyTo?: string
  fromName?: string
  from?: { name: string; address: string }
}): Promise<void> {
  const t = getTransporter()
  if (!t) {
    console.log(`[email skipped — SMTP not configured] "${options.subject}" → ${options.to}`)
    console.log(options.text)
    return
  }
  await t.sendMail({
    from: options.from ?? { name: options.fromName ?? ORDERS_FROM.name, address: ORDERS_FROM.address },
    to: options.to,
    subject: options.subject,
    text: options.text,
    html: options.html,
    replyTo: options.replyTo ?? RILEY_REPLY_TO,
  })
}

// --- Customer-facing order alerts ------------------------------------------

// Riley's July 2026 email pass: bodies end with a bare "— Riley"; the
// "reply to this email" invitation lives only in the order-placed body.
const SIGN_OFF_TEXT = '\n— Riley'
const SIGN_OFF_HTML = '<p style="margin:16px 0 0;">— Riley</p>'

// Gold CTA button to the live queue — the placed / moved-up / being-drawn
// alerts end with it (Riley's spec); the finished email deliberately
// doesn't, since there's nothing left to wait for. Gold bg + dark text
// mirrors the site's CTA rule (never white on gold).
const WAITLIST_BUTTON_TEXT = `\n\nCheck the waitlist: ${SITE_URL}/waitlist`
const WAITLIST_BUTTON_HTML = `<div style="margin:24px 0 0;text-align:center;">
  <a href="${SITE_URL}/waitlist" style="display:inline-block;background-color:#FFB101;color:#362600;font-weight:bold;font-size:14px;padding:10px 24px;border-radius:8px;text-decoration:none;">Check Waitlist</a>
</div>`
const WAITLIST_BUTTON = { text: WAITLIST_BUTTON_TEXT, html: WAITLIST_BUTTON_HTML }

// --- Review ask -------------------------------------------------------------
// A row of five crown links; the nth opens /review?rating=n with that crown
// preselected. Deliberately a GET that only prefills — email link scanners
// follow URLs, so clicking must never create a review by itself.
//
// Each crown is the brand crown logo (public/brand/crown-email.png, rendered
// from crown.svg — Gmail strips SVG, so it must be a PNG) with alt="♛"
// (U+265B, a text glyph, not emoji) styled gold at a matching size: clients
// that block or fail to load the image show gold text crowns instead.

const CROWN_IMG = `${SITE_URL}/brand/crown-email.png`
const CROWN_RATIO = 200 / 104 // crown-email.png dimensions

function reviewCrownsHtml(heightPx: number): string {
  const width = Math.round(heightPx * CROWN_RATIO)
  return [1, 2, 3, 4, 5]
    .map(
      (n) =>
        `<a href="${SITE_URL}/review?rating=${n}" style="text-decoration:none;color:#FFB101;">` +
        `<img src="${CROWN_IMG}" width="${width}" height="${heightPx}" alt="&#9819;" ` +
        `style="vertical-align:middle;border:0;margin:0 3px;color:#FFB101;font-size:${heightPx}px;line-height:1;text-decoration:none;">` +
        `</a>`
    )
    .join('')
}

const REVIEW_ASK_TEXT = `\n\nLike what you see? Leave a review: ${SITE_URL}/review`

const REVIEW_ASK_HTML = `<div style="margin:24px 0 0;text-align:center;">
  <p style="margin:0 0 6px;font-weight:bold;">Like what you see? Leave a review — just tap a crown:</p>
  <p style="margin:0;">${reviewCrownsHtml(24)}</p>
</div>`

// Smaller, muted variant for the footer of Riley's custom mail.
const REVIEW_FOOTER_HTML = `<div style="margin:24px 0 0;text-align:center;">
  <p style="margin:0 0 4px;color:#777;font-size:13px;">Like what you see? Leave a review — just tap a crown:</p>
  <p style="margin:0;">${reviewCrownsHtml(16)}</p>
</div>`

function customerFirstName(order: Order): string {
  return order.name.trim().split(/\s+/)[0]
}

// Alerts only make sense for customers who chose email; for text/WhatsApp/
// Instagram customers Riley reaches out herself, so these quietly no-op.
async function sendCustomerAlert(
  order: Order,
  subject: string,
  bodyText: string,
  extra?: { text: string; html: string }
): Promise<void> {
  if (order.contactMethod !== 'email') return
  await send({
    to: order.contactValue,
    subject,
    text: `Hi ${customerFirstName(order)},\n\n${bodyText}\n${SIGN_OFF_TEXT}${extra?.text ?? ''}`,
    html: brandedHtml(
      `<p style="margin:0 0 12px;">Hi ${escapeHtml(customerFirstName(order))},</p>
  <p style="margin:0;">${escapeHtml(bodyText)}</p>
  ${SIGN_OFF_HTML}
  ${extra?.html ?? ''}`
    ),
  })
}

export async function sendOrderPlacedEmail(
  order: Order,
  queuePosition: number
): Promise<void> {
  const type = ORDER_TYPE_LABELS[order.orderType]
  await sendCustomerAlert(
    order,
    'Your Íocón order has been placed',
    `Thank you for your order! Your ${type} is in the queue and you're currently number ${queuePosition} in line. You'll receive another email once I begin your order. If you have any questions, you can reply to this email.`,
    WAITLIST_BUTTON
  )
}

// Riley (July 2026): no email for every one-step bump — only milestone
// positions feel like news ("you're number 10!", "you're number 5!").
// Alert on reaching the top five or any multiple of ten. If Riley wants to
// tune this herself someday, this predicate is what an admin-portal setting
// would replace.
export function isQueueAlertPosition(position: number): boolean {
  return position <= 5 || position % 10 === 0
}

export async function sendQueueUpdateEmail(
  order: Order,
  queuePosition: number
): Promise<void> {
  if (!isQueueAlertPosition(queuePosition)) return
  const type = ORDER_TYPE_LABELS[order.orderType]
  await sendCustomerAlert(
    order,
    "You've moved up in the Íocón queue",
    `Good news! You've moved up in the queue. You're now number ${queuePosition} in line for your ${type}.`,
    WAITLIST_BUTTON
  )
}

export async function sendOrderStatusEmail(
  order: Order,
  status: 'in-progress' | 'completed'
): Promise<void> {
  const type = ORDER_TYPE_LABELS[order.orderType]
  if (status === 'in-progress') {
    await sendCustomerAlert(
      order,
      'Your Íocón order is being drawn',
      `I've started your ${type}. You'll receive one last email as soon as it's finished.`,
      WAITLIST_BUTTON
    )
  } else {
    await sendCustomerAlert(
      order,
      'Your Íocón order is finished',
      `Your ${type} is finished! I'll be in touch with you shortly to get it to you.`,
      { text: REVIEW_ASK_TEXT, html: REVIEW_ASK_HTML }
    )
  }
}

// Custom one-off mail Riley composes in the admin portal (/admin → Email).
// Same branded shell, greeting, and sign-off as the automated alerts, but
// sent from Riley's own address — she's the one writing it, and replies
// should feel like a direct conversation with her. The portal only offers
// customers who chose email as their contact method, and each recipient gets
// their own message — addresses are never shared.
export async function sendCustomEmail(
  recipient: { email: string; firstName: string },
  subject: string,
  message: string
): Promise<void> {
  await send({
    from: RILEY_FROM,
    to: recipient.email,
    subject,
    text: `Hi ${recipient.firstName},\n\n${message}\n${SIGN_OFF_TEXT}${REVIEW_ASK_TEXT}`,
    html: brandedHtml(
      `<p style="margin:0 0 12px;">Hi ${escapeHtml(recipient.firstName)},</p>
  <p style="margin:0;white-space:pre-wrap;">${escapeHtml(message)}</p>
  ${SIGN_OFF_HTML}
  ${REVIEW_FOOTER_HTML}`
    ),
  })
}

// --- Mail to Riley ----------------------------------------------------------

export async function sendNewOrderNotification(
  order: Order,
  queuePosition: number
): Promise<void> {
  const lines = [
    `Name: ${order.name}`,
    `Contact: ${CONTACT_METHOD_LABELS[order.contactMethod]} — ${order.contactValue}`,
    `Order type: ${ORDER_TYPE_LABELS[order.orderType]}`,
    order.product ? `Product: ${PRODUCT_FORMAT_LABELS[order.product]}` : null,
    `Queue position: ${queuePosition}`,
  ].filter((l): l is string => l !== null)
  const detailsText = order.details ? `\n\nDetails:\n${order.details}` : ''
  await send({
    to: rileyInbox(),
    subject: `New order: ${ORDER_TYPE_LABELS[order.orderType]} — ${order.name}`,
    text: `${lines.join('\n')}${detailsText}`,
    html: brandedHtml(
      `<p style="margin:0;">${lines.map(escapeHtml).join('<br>')}</p>` +
        (order.details
          ? `<p style="margin:16px 0 4px;font-weight:bold;">Details</p><p style="margin:0;white-space:pre-wrap;">${escapeHtml(order.details)}</p>`
          : '')
    ),
    replyTo: order.contactMethod === 'email' ? order.contactValue : RILEY_REPLY_TO,
  })
}

export async function sendContactEmail(submission: {
  name: string
  email: string
  subject: string
  message: string
}): Promise<void> {
  const { name, email, subject, message } = submission
  await send({
    to: rileyInbox(),
    fromName: `${name} via iocongraphics.com`,
    subject: `Contact form: ${subject}`,
    text: `From: ${name} <${email}>\n\n${message}`,
    html: brandedHtml(
      `<p style="margin:0 0 12px;color:#777;">From: ${escapeHtml(name)} &lt;${escapeHtml(email)}&gt;</p>
  <p style="margin:0;white-space:pre-wrap;">${escapeHtml(message)}</p>`
    ),
    replyTo: email,
  })
}
