import { Resend } from 'resend'
import type { Appointment, VetService } from '@prisma/client'
import { logger } from '../utils/logger'

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null
const EMAIL_FROM = process.env.EMAIL_FROM ?? 'Petshop <reservas@petshop.cl>'

function formatCLP(amount: number): string {
  return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(amount)
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
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
                    <td style="padding:12px 16px;font-size:13px;color:#111827;text-align:right;border-bottom:1px solid #e5e7eb;font-weight:bold;">${escapeHtml(service.name)}</td>
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
                    <td style="padding:12px 16px;font-size:13px;color:#111827;text-align:right;border-bottom:1px solid #e5e7eb;">${escapeHtml(appointment.petName)}</td>
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

function buildCancellationHtml(appointment: Appointment, service: VetService, reason: string): string {
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
                <div style="width:56px;height:56px;background-color:#dc2626;border-radius:50%;display:inline-block;line-height:56px;font-size:28px;color:#ffffff;">&#10005;</div>
              </td>
            </tr>
            <tr>
              <td align="center" style="padding:12px 24px 0 24px;">
                <h1 style="margin:0;font-size:22px;color:#111827;">Cita cancelada</h1>
                <p style="margin:8px 0 0 0;font-size:14px;color:#6b7280;">Orden #${appointment.appointmentNumber}</p>
              </td>
            </tr>
            <tr>
              <td style="padding:24px;">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e5e7eb;border-radius:12px;">
                  <tr>
                    <td style="padding:12px 16px;font-size:13px;color:#6b7280;border-bottom:1px solid #e5e7eb;">Servicio</td>
                    <td style="padding:12px 16px;font-size:13px;color:#111827;text-align:right;border-bottom:1px solid #e5e7eb;font-weight:bold;">${escapeHtml(service.name)}</td>
                  </tr>
                  <tr>
                    <td style="padding:12px 16px;font-size:13px;color:#6b7280;border-bottom:1px solid #e5e7eb;">Fecha</td>
                    <td style="padding:12px 16px;font-size:13px;color:#111827;text-align:right;border-bottom:1px solid #e5e7eb;">${dateLabel}</td>
                  </tr>
                  <tr>
                    <td style="padding:12px 16px;font-size:13px;color:#6b7280;">Hora</td>
                    <td style="padding:12px 16px;font-size:13px;color:#111827;text-align:right;">${appointment.startTime} - ${appointment.endTime}</td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr>
              <td style="padding:0 24px 24px 24px;">
                <p style="margin:0 0 4px 0;font-size:13px;color:#6b7280;">Motivo:</p>
                <p style="margin:0;font-size:13px;color:#111827;background-color:#fef2f2;border:1px solid #fecaca;border-radius:8px;padding:10px 12px;">${escapeHtml(reason)}</p>
              </td>
            </tr>
            <tr>
              <td align="center" style="padding:0 24px 24px 24px;">
                <p style="margin:0;font-size:13px;color:#6b7280;">Si tienes dudas, contáctanos para agendar una nueva hora.</p>
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

function buildRescheduleHtml(
  appointment: Appointment,
  service: VetService,
  oldDateLabel: string,
  oldTime: string,
  reason: string,
): string {
  const newDateLabel = new Date(appointment.date).toLocaleDateString('es-CL', {
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
                <div style="width:56px;height:56px;background-color:#2563eb;border-radius:50%;display:inline-block;line-height:56px;font-size:26px;color:#ffffff;">&#8635;</div>
              </td>
            </tr>
            <tr>
              <td align="center" style="padding:12px 24px 0 24px;">
                <h1 style="margin:0;font-size:22px;color:#111827;">Cita reagendada</h1>
                <p style="margin:8px 0 0 0;font-size:14px;color:#6b7280;">Orden #${appointment.appointmentNumber}</p>
              </td>
            </tr>
            <tr>
              <td style="padding:24px;">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e5e7eb;border-radius:12px;">
                  <tr>
                    <td style="padding:12px 16px;font-size:13px;color:#6b7280;border-bottom:1px solid #e5e7eb;">Servicio</td>
                    <td style="padding:12px 16px;font-size:13px;color:#111827;text-align:right;border-bottom:1px solid #e5e7eb;font-weight:bold;">${escapeHtml(service.name)}</td>
                  </tr>
                  <tr>
                    <td style="padding:12px 16px;font-size:13px;color:#6b7280;border-bottom:1px solid #e5e7eb;">Antes</td>
                    <td style="padding:12px 16px;font-size:13px;color:#9ca3af;text-align:right;text-decoration:line-through;border-bottom:1px solid #e5e7eb;">${oldDateLabel} · ${oldTime}</td>
                  </tr>
                  <tr>
                    <td style="padding:12px 16px;font-size:13px;color:#6b7280;">Ahora</td>
                    <td style="padding:12px 16px;font-size:14px;color:#2563eb;text-align:right;font-weight:bold;">${newDateLabel} · ${appointment.startTime}</td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr>
              <td style="padding:0 24px 24px 24px;">
                <p style="margin:0 0 4px 0;font-size:13px;color:#6b7280;">Motivo del cambio:</p>
                <p style="margin:0;font-size:13px;color:#111827;background-color:#eff6ff;border:1px solid #bfdbfe;border-radius:8px;padding:10px 12px;">${escapeHtml(reason)}</p>
              </td>
            </tr>
            <tr>
              <td align="center" style="padding:0 24px 24px 24px;">
                <p style="margin:0;font-size:13px;color:#6b7280;">Tu pago ya realizado sigue siendo válido — no necesitas volver a pagar. Te esperamos en la nueva fecha y hora.</p>
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

export async function sendAppointmentCancellation(
  appointment: Appointment,
  service: VetService,
  reason: string,
): Promise<void> {
  if (!resend) {
    logger.warn('RESEND_API_KEY not configured — skipping appointment cancellation email')
    return
  }
  try {
    const { error, data } = await resend.emails.send({
      from: EMAIL_FROM,
      to: appointment.ownerEmail,
      subject: `Cita cancelada — ${appointment.appointmentNumber}`,
      html: buildCancellationHtml(appointment, service, reason),
    })
    if (error) {
      logger.error(`Resend rejected appointment cancellation email for ${appointment.appointmentNumber}`, error)
      return
    }
    logger.info(`Appointment cancellation email sent for ${appointment.appointmentNumber} (resend id: ${data?.id})`)
  } catch (error) {
    logger.error(`Failed to send appointment cancellation email for ${appointment.appointmentNumber}`, error)
  }
}

export async function sendAppointmentReschedule(
  appointment: Appointment,
  service: VetService,
  oldDate: Date,
  oldTime: string,
  reason: string,
): Promise<void> {
  if (!resend) {
    logger.warn('RESEND_API_KEY not configured — skipping appointment reschedule email')
    return
  }
  const oldDateLabel = oldDate.toLocaleDateString('es-CL', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
  try {
    const { error, data } = await resend.emails.send({
      from: EMAIL_FROM,
      to: appointment.ownerEmail,
      subject: `Cita reagendada — ${appointment.appointmentNumber}`,
      html: buildRescheduleHtml(appointment, service, oldDateLabel, oldTime, reason),
    })
    if (error) {
      logger.error(`Resend rejected appointment reschedule email for ${appointment.appointmentNumber}`, error)
      return
    }
    logger.info(`Appointment reschedule email sent for ${appointment.appointmentNumber} (resend id: ${data?.id})`)
  } catch (error) {
    logger.error(`Failed to send appointment reschedule email for ${appointment.appointmentNumber}`, error)
  }
}
