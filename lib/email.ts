// ---------------------------------------------------------------------------
// Shared email layer — iCloud Mail SMTP via nodemailer.
//
// Env vars (see .env.local; mirror into Vercel for production):
//   SMTP_HOST / SMTP_PORT / SMTP_USER / SMTP_PASS
//     iCloud SMTP. SMTP_USER is Riley's Apple ID; SMTP_PASS is an
//     app-specific password, NOT her real password.
//   CONTACT_EMAIL_TO
//     Riley's inbox (contact form + new-order notifications).
//     Defaults to riley@iocongraphics.com.
//
// Two kinds of mail leave this module:
//   • Automated customer alerts (order placed / queue moved / being drawn /
//     finished) — from orders@iocongraphics.com, Reply-To Riley, and only
//     when the customer chose email as their contact method.
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

const ORDERS_FROM = { name: 'Íocón Orders', address: 'orders@iocongraphics.com' }
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
  <p style="margin:24px 0 0;color:#777;font-size:13px;">Íocón · Hand made graphics for the Irish Dance world · iocongraphics.com</p>
</div>`
}

async function send(options: {
  to: string
  subject: string
  text: string
  html: string
  replyTo?: string
  fromName?: string
}): Promise<void> {
  const t = getTransporter()
  if (!t) {
    console.log(`[email skipped — SMTP not configured] "${options.subject}" → ${options.to}`)
    console.log(options.text)
    return
  }
  await t.sendMail({
    from: { name: options.fromName ?? ORDERS_FROM.name, address: ORDERS_FROM.address },
    to: options.to,
    subject: options.subject,
    text: options.text,
    html: options.html,
    replyTo: options.replyTo ?? RILEY_REPLY_TO,
  })
}

// --- Customer-facing order alerts ------------------------------------------

const SIGN_OFF_TEXT = '\n— Riley\n\nQuestions? Just reply to this email.'
const SIGN_OFF_HTML =
  '<p style="margin:16px 0 0;">— Riley</p><p style="margin:16px 0 0;color:#777;">Questions? Just reply to this email.</p>'

function customerFirstName(order: Order): string {
  return order.name.trim().split(/\s+/)[0]
}

// Alerts only make sense for customers who chose email; for text/WhatsApp/
// Instagram customers Riley reaches out herself, so these quietly no-op.
async function sendCustomerAlert(
  order: Order,
  subject: string,
  bodyText: string
): Promise<void> {
  if (order.contactMethod !== 'email') return
  await send({
    to: order.contactValue,
    subject,
    text: `Hi ${customerFirstName(order)},\n\n${bodyText}\n${SIGN_OFF_TEXT}`,
    html: brandedHtml(
      `<p style="margin:0 0 12px;">Hi ${escapeHtml(customerFirstName(order))},</p>
  <p style="margin:0;">${escapeHtml(bodyText)}</p>
  ${SIGN_OFF_HTML}`
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
    `Thanks for your order! Your ${type} is in the queue — you're currently number ${queuePosition} in line. I'll email you when I start drawing it.`
  )
}

export async function sendQueueUpdateEmail(
  order: Order,
  queuePosition: number
): Promise<void> {
  const type = ORDER_TYPE_LABELS[order.orderType]
  await sendCustomerAlert(
    order,
    "You've moved up in the Íocón queue",
    `Good news — you've moved up in the queue. You're now number ${queuePosition} in line for your ${type}.`
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
      `I've started drawing your ${type}. I'll email you as soon as it's finished.`
    )
  } else {
    await sendCustomerAlert(
      order,
      'Your Íocón order is finished',
      `Your ${type} is finished! I'll be in touch shortly to get it to you.`
    )
  }
}

// Custom one-off mail Riley composes in the admin portal (/admin → Email).
// Same branded shell, greeting, and sign-off as the automated alerts. The
// portal only offers customers who chose email as their contact method, and
// each recipient gets their own message — addresses are never shared.
export async function sendCustomEmail(
  recipient: { email: string; firstName: string },
  subject: string,
  message: string
): Promise<void> {
  await send({
    to: recipient.email,
    subject,
    text: `Hi ${recipient.firstName},\n\n${message}\n${SIGN_OFF_TEXT}`,
    html: brandedHtml(
      `<p style="margin:0 0 12px;">Hi ${escapeHtml(recipient.firstName)},</p>
  <p style="margin:0;white-space:pre-wrap;">${escapeHtml(message)}</p>
  ${SIGN_OFF_HTML}`
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
