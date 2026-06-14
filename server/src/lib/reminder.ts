const REMINDER_BEFORE_MS = 30 * 60 * 1000;

interface ReminderPayload {
  bookingId: string;
  startAt: Date;
  durationMin: number;
  subject: string;
  teacherEmail: string | null;
  teacherName: string;
  studentEmail: string | null;
  studentName: string;
  teacherCalendarLink?: string;
  studentCalendarLink?: string;
}

const sendBrevoEmail = async ({
  to,
  toName,
  subject,
  html,
}: {
  to: string;
  toName: string;
  subject: string;
  html: string;
}) => {
  const apiKey = process.env.BREVO_API_KEY;
  const fromEmail = process.env.EMAIL_FROM ?? "noreply@ilmrise.com";
  const fromName = process.env.EMAIL_FROM_NAME ?? "IlmRise";

  if (!apiKey) {
    console.warn("[reminder] BREVO_API_KEY not set — skipping email to", to);
    return;
  }

  try {
    const res = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: { "Content-Type": "application/json", "api-key": apiKey },
      body: JSON.stringify({
        sender: { name: fromName, email: fromEmail },
        to: [{ name: toName, email: to }],
        subject,
        htmlContent: html,
      }),
    });
    if (!res.ok) {
      console.error("[reminder] Brevo error:", res.status, await res.text());
    } else {
      console.log("[reminder] Email sent to", to);
    }
  } catch (err) {
    console.error("[reminder] Failed:", err);
  }
};

const buildReminderHtml = ({
  recipientName,
  role,
  subject,
  startAt,
  durationMin,
  otherPartyName,
  otherPartyRole,
  calendarLink,
}: {
  recipientName: string;
  role: "teacher" | "student";
  subject: string;
  startAt: Date;
  durationMin: number;
  otherPartyName: string;
  otherPartyRole: "teacher" | "student";
  calendarLink?: string;
}) => {
  const timeStr = startAt.toLocaleString("en-US", {
    weekday: "long", year: "numeric", month: "long",
    day: "numeric", hour: "2-digit", minute: "2-digit",
  });

  const calendarButton = calendarLink
    ? `<div style="margin: 20px 0;">
        <a href="${calendarLink}" target="_blank"
          style="display:inline-flex;align-items:center;gap:8px;background:#4285F4;color:white;
                 text-decoration:none;padding:12px 20px;border-radius:8px;font-size:14px;font-weight:600;">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
            <path d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V9h14v11z"/>
          </svg>
          Add to Google Calendar
        </a>
      </div>`
    : "";

  return `
  <div style="font-family:sans-serif;max-width:520px;margin:0 auto;padding:24px;color:#1a1a2e;">
    <div style="background:linear-gradient(135deg,#2d6a4f,#1b4332);border-radius:12px;padding:24px;color:white;margin-bottom:24px;">
      <h1 style="margin:0 0 4px;font-size:22px;">⏰ Session in 30 minutes</h1>
      <p style="margin:0;opacity:0.85;font-size:14px;">IlmRise reminder</p>
    </div>
    <p style="font-size:16px;">Hi <strong>${recipientName}</strong>,</p>
    <p>Your upcoming session starts in <strong>30 minutes</strong>.</p>
    <table style="width:100%;border-collapse:collapse;margin:16px 0;font-size:14px;">
      <tr style="border-bottom:1px solid #eee;">
        <td style="padding:8px 4px;color:#666;">Subject</td>
        <td style="padding:8px 4px;font-weight:600;">${subject}</td>
      </tr>
      <tr style="border-bottom:1px solid #eee;">
        <td style="padding:8px 4px;color:#666;">When</td>
        <td style="padding:8px 4px;font-weight:600;">${timeStr}</td>
      </tr>
      <tr style="border-bottom:1px solid #eee;">
        <td style="padding:8px 4px;color:#666;">Duration</td>
        <td style="padding:8px 4px;font-weight:600;">${durationMin} minutes</td>
      </tr>
      <tr>
        <td style="padding:8px 4px;color:#666;">${otherPartyRole === "teacher" ? "Your teacher" : "Your student"}</td>
        <td style="padding:8px 4px;font-weight:600;">${otherPartyName}</td>
      </tr>
    </table>
    ${calendarButton}
    <p style="font-size:13px;color:#666;">
      ${role === "student" ? "Please join on time. Your teacher will be waiting." : "Your student will be joining shortly. Please be ready."}
    </p>
    <div style="margin-top:24px;padding-top:16px;border-top:1px solid #eee;font-size:12px;color:#999;">
      Automated reminder from IlmRise. Do not reply to this email.
    </div>
  </div>`;
};

export const scheduleReminderEmails = async (payload: ReminderPayload) => {
  const { startAt, durationMin, subject, teacherEmail, teacherName, studentEmail, studentName, teacherCalendarLink, studentCalendarLink } = payload;

  const reminderAt = startAt.getTime() - REMINDER_BEFORE_MS;
  const delay = reminderAt - Date.now();

  if (delay <= 0) {
    console.log("[reminder] Booking too soon for reminder — skipping");
    return;
  }

  console.log(`[reminder] Scheduling for booking ${payload.bookingId} in ${Math.round(delay / 60000)} min`);

  setTimeout(async () => {
    const tasks: Promise<void>[] = [];

    if (teacherEmail) {
      tasks.push(sendBrevoEmail({
        to: teacherEmail,
        toName: teacherName,
        subject: `⏰ Reminder: ${subject} session in 30 minutes`,
        html: buildReminderHtml({
          recipientName: teacherName,
          role: "teacher",
          subject,
          startAt,
          durationMin,
          otherPartyName: studentName,
          otherPartyRole: "student",
          calendarLink: teacherCalendarLink,
        }),
      }));
    }

    if (studentEmail) {
      tasks.push(sendBrevoEmail({
        to: studentEmail,
        toName: studentName,
        subject: `⏰ Reminder: Your ${subject} session starts in 30 minutes`,
        html: buildReminderHtml({
          recipientName: studentName,
          role: "student",
          subject,
          startAt,
          durationMin,
          otherPartyName: teacherName,
          otherPartyRole: "teacher",
          calendarLink: studentCalendarLink,
        }),
      }));
    }

    await Promise.allSettled(tasks);
  }, delay);
};