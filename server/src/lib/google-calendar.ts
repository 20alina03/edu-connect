/**
 * google-calendar.ts
 *
 * Creates Google Calendar events for both teacher and student when a booking is made.
 *
 * HOW TOKENS WORK WITH SUPABASE:
 * When a user signs in with Google (using signInWithOAuth with scopes),
 * Supabase stores provider_token and provider_refresh_token in the SESSION,
 * not in identity_data. These are only available client-side in the session object.
 *
 * Since the backend cannot access the live session token directly, we use
 * a different approach:
 * 1. Frontend passes provider_token to the backend when creating a booking
 * 2. Backend uses that token to create the calendar event for that user
 * 3. For the other party, we send a Google Calendar invite link via email
 *
 * ALTERNATIVELY (simpler, always works):
 * Generate "Add to Google Calendar" links for both parties and include
 * them in the confirmation email — no OAuth token needed server-side.
 */

export interface GoogleCalendarEventParams {
  subject: string;
  startAt: Date;
  durationMin: number;
  teacherName: string;
  studentName: string;
  mode: string;
  notes?: string | null;
}

/**
 * Build a Google Calendar "Add to Calendar" URL.
 * This works for any user without needing OAuth tokens.
 * Include this link in confirmation emails and booking success screens.
 */
export const buildGoogleCalendarLink = ({
  subject,
  startAt,
  durationMin,
  attendeeName,
  notes,
  mode,
}: {
  subject: string;
  startAt: Date;
  durationMin: number;
  attendeeName: string;
  notes?: string | null;
  mode?: string;
}): string => {
  const endAt = new Date(startAt.getTime() + durationMin * 60_000);

  // Format: 20260615T160000Z
  const fmt = (d: Date) =>
    d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");

  const modeLabel = mode === "home_visit" ? "Home Visit" : mode === "online" ? "Online" : (mode ?? "");

  const details = [
    `IlmRise session`,
    `With: ${attendeeName}`,
    modeLabel ? `Mode: ${modeLabel}` : null,
    `Duration: ${durationMin} minutes`,
    notes ? `Topic: ${notes}` : null,
  ]
    .filter(Boolean)
    .join("\n");

  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: `📚 ${subject} — IlmRise`,
    dates: `${fmt(startAt)}/${fmt(endAt)}`,
    details,
    sf: "true",
    output: "xml",
  });

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
};

/**
 * Create a Google Calendar event using an OAuth access token.
 * Used server-side when the frontend passes its provider_token.
 */
export const createCalendarEventWithToken = async ({
  accessToken,
  subject,
  startAt,
  durationMin,
  description,
  attendeeEmail,
}: {
  accessToken: string;
  subject: string;
  startAt: Date;
  durationMin: number;
  description: string;
  attendeeEmail?: string;
}): Promise<{ htmlLink?: string } | null> => {
  const endAt = new Date(startAt.getTime() + durationMin * 60_000);

  const event = {
    summary: subject,
    description,
    start: { dateTime: startAt.toISOString(), timeZone: "UTC" },
    end: { dateTime: endAt.toISOString(), timeZone: "UTC" },
    reminders: {
      useDefault: false,
      overrides: [
        { method: "email", minutes: 30 },
        { method: "popup", minutes: 10 },
      ],
    },
    ...(attendeeEmail ? { attendees: [{ email: attendeeEmail }] } : {}),
  };

  try {
    const res = await fetch(
      "https://www.googleapis.com/calendar/v3/calendars/primary/events?sendUpdates=all",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(event),
      },
    );

    if (!res.ok) {
      const body = await res.text();
      console.warn("[google-calendar] Event creation failed:", res.status, body);
      return null;
    }

    return await res.json() as { htmlLink?: string };
  } catch (err) {
    console.warn("[google-calendar] Network error:", err);
    return null;
  }
};

/**
 * Refresh a Google OAuth access token using a refresh token.
 */
export const refreshGoogleToken = async (refreshToken: string): Promise<string | null> => {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  if (!clientId || !clientSecret) return null;

  try {
    const res = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        refresh_token: refreshToken,
        grant_type: "refresh_token",
      }),
    });
    if (!res.ok) return null;
    const data = await res.json() as { access_token?: string };
    return data.access_token ?? null;
  } catch {
    return null;
  }
};