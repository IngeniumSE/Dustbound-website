/**
 * Public Dustbound Events feed (same URL the app uses).
 * @see https://ingeniumse.github.io/Dustbound-catalog/v1/events.json
 */

export const EVENTS_FEED_URL =
  'https://ingeniumse.github.io/Dustbound-catalog/v1/events.json';

export type EventPhase = 'upcoming' | 'active' | 'past';

export interface FeedEvent {
  id: string;
  title: string;
  summary?: string;
  startUtc: string;
  endUtc?: string;
  collectibleIds?: string[];
}

interface EventsDocument {
  schemaVersion?: number;
  eventsVersion?: number;
  events?: FeedEvent[];
}

export interface DisplayEvent {
  id: string;
  title: string;
  summary: string;
  phase: EventPhase;
  startUtc: Date;
  endUtc: Date;
  startLabel: string;
  endLabel: string | null;
  rangeLabel: string;
}

function effectiveEndUtc(event: FeedEvent): Date {
  const start = new Date(event.startUtc);
  if (event.endUtc) return new Date(event.endUtc);
  return new Date(start.getTime() + 24 * 60 * 60 * 1000);
}

export function classifyEvent(event: FeedEvent, now = new Date()): EventPhase {
  const start = new Date(event.startUtc);
  const end = effectiveEndUtc(event);
  if (start.getTime() > now.getTime()) return 'upcoming';
  if (now.getTime() < end.getTime()) return 'active';
  return 'past';
}

function formatUtc(date: Date): string {
  return new Intl.DateTimeFormat('en-GB', {
    timeZone: 'UTC',
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(date);
}

export function toDisplayEvent(event: FeedEvent, now = new Date()): DisplayEvent {
  const startUtc = new Date(event.startUtc);
  const endUtc = effectiveEndUtc(event);
  const phase = classifyEvent(event, now);
  const startLabel = `${formatUtc(startUtc)} UTC`;
  const hasExplicitEnd = Boolean(event.endUtc);
  const endLabel = hasExplicitEnd || phase !== 'upcoming' ? `${formatUtc(endUtc)} UTC` : null;
  const rangeLabel = endLabel ? `${startLabel} – ${endLabel}` : `From ${startLabel}`;

  return {
    id: event.id,
    title: event.title,
    summary: event.summary?.trim() || '',
    phase,
    startUtc,
    endUtc,
    startLabel,
    endLabel,
    rangeLabel,
  };
}

/** Active + upcoming only, soonest first — mirrors app Events list. */
export function selectLiveEvents(events: FeedEvent[], now = new Date()): DisplayEvent[] {
  return events
    .map((e) => toDisplayEvent(e, now))
    .filter((e) => e.phase === 'active' || e.phase === 'upcoming')
    .sort((a, b) => a.startUtc.getTime() - b.startUtc.getTime() || a.id.localeCompare(b.id));
}

export async function fetchLiveEvents(
  url = EVENTS_FEED_URL,
  now = new Date(),
): Promise<{ events: DisplayEvent[]; version: number | null; ok: boolean }> {
  try {
    const res = await fetch(url, {
      headers: { Accept: 'application/json', 'Cache-Control': 'no-cache' },
    });
    if (!res.ok) {
      return { events: [], version: null, ok: false };
    }
    const doc = (await res.json()) as EventsDocument;
    const raw = Array.isArray(doc.events) ? doc.events : [];
    return {
      events: selectLiveEvents(raw, now),
      version: typeof doc.eventsVersion === 'number' ? doc.eventsVersion : null,
      ok: true,
    };
  } catch {
    return { events: [], version: null, ok: false };
  }
}
