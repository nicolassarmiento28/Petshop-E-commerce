import { Resend } from 'resend'
import type { Appointment, VetService } from '@prisma/client'
import { logger } from '../utils/logger'

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null
const EMAIL_FROM = process.env.EMAIL_FROM ?? 'Petshop <reservas@petshop.cl>'

function formatCLP(amount: number): string {
  return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(amount)
}

function buildConfirmationHtml(appointment: Appointment, service: VetService): string {
  const dateLabel = new Date(appointment.date).toLocaleDateString('es-CL', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  return `
<!DOCTYPE html>
<html lang="es">
  <body style="margin:0;padding:0;background-color:#f3f4f6;font-family:Arial,Helvetica,sans-serif;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f3f4f6;padding:24px 0;">
      <tr>
        <td align="center">
          <table role="presentation" width="480" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border-radius:16px;overflow:hidden;">
            <tr>
              <td align="center" style="background:linear-gradient(135deg,#1e40af,#2563eb);padding:32px 24px;">
                <div style="font-size:32px;line-height:1;">🐾</div>
                <div style="color:#ffffff;font-size:20px;font-weight:bold;margin-top:8px;">Petshop</div>
              </td>
            </tr>
            <tr>
              <td align="center" style="padding:24px 24px 0 24px;">
                <div style="width:56px;height:56px;background-color:#22c55e;border-radius:50%;display:inline-block;line-height:56px;font-size:28px;color:#ffffff;">&#10003;</div>
              </td>
            </tr>
            <tr>
              <td align="center" style="padding:12px 24px 0 24px;">
                <h1 style="margin:0;font-size:22px;color:#111827;">Cita confirmada</h1>
                <p style="margin:8px 0 0 0;font-size:14px;color:#6b7280;">Orden #${appointment.appointmentNumber}</p>
              </td>
            </tr>
            <tr>
              <td style="padding:24px;">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e5e7eb;border-radius:12px;">
                  <tr>
                    <td style="padding:12px 16px;font-size:13px;color:#6b7280;border-bottom:1px solid #e5e7eb;">Servicio</td>
                    <td style="padding:12px 16px;font-size:13px;color:#111827;text-align:right;border-bottom:1px solid #e5e7eb;font-weight:bold;">${service.name}</td>
                  </tr>
                  <tr>
                    <td style="padding:12px 16px;font-size:13px;color:#6b7280;border-bottom:1px solid #e5e7eb;">Fecha</td>
                    <td style="padding:12px 16px;font-size:13px;color:#111827;text-align:right;border-bottom:1px solid #e5e7eb;">${dateLabel}</td>
                  </tr>
                  <tr>
                    <td style="padding:12px 16px;font-size:13px;color:#6b7280;border-bottom:1px solid #e5e7eb;">Hora</td>
                    <td style="padding:12px 16px;font-size:13px;color:#111827;text-align:right;border-bottom:1px solid #e5e7eb;">${appointment.startTime} - ${appointment.endTime}</td>
                  </tr>
                  <tr>
                    <td style="padding:12px 16px;font-size:13px;color:#6b7280;border-bottom:1px solid #e5e7eb;">Mascota</td>
                    <td style="padding:12px 16px;font-size:13px;color:#111827;text-align:right;border-bottom:1px solid #e5e7eb;">${appointment.petName}</td>
                  </tr>
                  <tr>
                    <td style="padding:12px 16px;font-size:13px;color:#6b7280;">Monto pagado</td>
                    <td style="padding:12px 16px;font-size:15px;color:#2563eb;text-align:right;font-weight:bold;">${formatCLP(service.price)}</td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr>
              <td align="center" style="padding:0 24px 24px 24px;">
                <p style="margin:0;font-size:13px;color:#6b7280;">Te esperamos en la fecha y hora reservada. Si necesitas reagendar, contáctanos.</p>
              </td>
            </tr>
            <tr>
              <td style="background-color:#f9fafb;padding:20px 24px;border-top:1px solid #e5e7eb;">
                <p style="margin:0;font-size:12px;color:#6b7280;">Av. Libertad 535, Viña del Mar, Chile</p>
                <p style="margin:4px 0 0 0;font-size:12px;color:#6b7280;">+56 9 1234 5678 &middot; contacto@petshop.cl</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`
}

export async function sendAppointmentConfirmation(
  appointment: Appointment,
  service: VetService,
): Promise<void> {
  if (!resend) {
    logger.warn('RESEND_API_KEY not configured — skipping appointment confirmation email')
    return
  }
  try {
    const { error, data } = await resend.emails.send({
      from: EMAIL_FROM,
      to: appointment.ownerEmail,
      subject: `Cita confirmada — ${appointment.appointmentNumber}`,
      html: buildConfirmationHtml(appointment, service),
    })
    if (error) {
      logger.error(`Resend rejected appointment confirmation email for ${appointment.appointmentNumber}`, error)
      return
    }
    logger.info(`Appointment confirmation email sent for ${appointment.appointmentNumber} (resend id: ${data?.id})`)
  } catch (error) {
    logger.error(`Failed to send appointment confirmation email for ${appointment.appointmentNumber}`, error)
  }
}
