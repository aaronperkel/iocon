// Sign-in code email for the admin portal. Self-contained on purpose — it
// mirrors the SMTP transport setup in lib/email.ts (orders/contact mail)
// rather than importing it; keep the transport config in the two files in
// sync. Missing SMTP env logs the code instead of sending, same as the
// other email helpers.

import nodemailer, { type Transporter } from 'nodemailer'

let transporter: Transporter | null = null

function getTransporter(): Transporter | null {
  if (!(process.env.SMTP_USER && process.env.SMTP_PASS)) return null
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

export async function sendLoginCodeEmail(to: string, code: string): Promise<void> {
  const subject = 'Your Íocón admin sign-in code'
  const text = `Your sign-in code is ${code}. It expires in 10 minutes.\n\nIf you didn't try to sign in to the Íocón admin page, you can ignore this email.`
  const t = getTransporter()
  if (!t) {
    console.log(`[email skipped — SMTP not configured] "${subject}" → ${to}`)
    console.log(text)
    return
  }
  await t.sendMail({
    // TODO: switch to noreply@iocongraphics.com once Aaron adds that alias to
    // Riley's iCloud+ custom domain — iCloud rejects sends from unregistered
    // aliases, so flipping it early would break admin login emails.
    from: { name: 'Íocón Admin', address: 'orders@iocongraphics.com' },
    to,
    subject,
    text,
    html: `<div style="max-width:560px;margin:0 auto;padding:24px;font-family:-apple-system,'Segoe UI',Helvetica,Arial,sans-serif;color:#333;font-size:15px;line-height:1.6;">
  <p style="font-family:'Times New Roman',Times,serif;font-size:26px;font-weight:bold;color:#8B8A00;margin:0 0 4px;">Íocón</p>
  <div style="border-bottom:2px solid #FFB101;margin-bottom:20px;"></div>
  <p style="margin:0 0 12px;">Your sign-in code is:</p>
  <p style="font-family:'Times New Roman',Times,serif;font-size:32px;font-weight:bold;letter-spacing:6px;margin:0 0 16px;">${code}</p>
  <p style="margin:0;">It expires in 10 minutes. If you didn&#39;t try to sign in to the Íocón admin page, you can ignore this email.</p>
  <p style="margin:24px 0 0;color:#777;font-size:13px;">Íocón · Hand made graphics for the Irish Dance world · iocongraphics.com</p>
</div>`,
  })
}
