import calendarData from "@/content/hindu-calendar.json";

export type LocalInstant = {
  iso: string;
  date: string;
  time: string;
  display: string;
};

export type HinduDay = {
  date: string;
  weekday: string;
  weekdayShort: string;
  hinduMonth: {
    key: string;
    en: string;
    sa: string;
    system: string;
    paksha: string;
  };
  tithi: {
    number: number;
    name: string;
    paksha: string;
    fullName: string;
    start: LocalInstant | null;
    end: LocalInstant | null;
    isPurnima: boolean;
    isAmavasya: boolean;
  };
  nakshatra: { name: string; endsAt: LocalInstant | null } | null;
  sunrise: LocalInstant | null;
  sunset: LocalInstant | null;
  festivals: { id: string; name: string }[];
};

export type HinduMonthMeta = {
  key: string;
  gregorianLabel: string;
  hinduMonthDominant: { key: string; en: string; sa: string };
  dayCount: number;
};

export type HinduCalendarData = {
  generatedAt: string;
  source: {
    library: string;
    version: string;
    license: string;
    method: string;
    note: string;
  };
  location: {
    name: string;
    latitude: number;
    longitude: number;
    timeZone: string;
  };
  range: { start: string; end: string; dayCount: number };
  months: HinduMonthMeta[];
  days: HinduDay[];
};

export const hinduCalendar = calendarData as HinduCalendarData;

export function getMonthDays(monthKey: string): HinduDay[] {
  return hinduCalendar.days.filter((d) => d.date.startsWith(monthKey));
}

export function getMonthMeta(monthKey: string): HinduMonthMeta | undefined {
  return hinduCalendar.months.find((m) => m.key === monthKey);
}

/** Default month = month containing today, else first month in dataset. */
export function defaultMonthKey(todayYmd?: string): string {
  const today =
    todayYmd ??
    new Intl.DateTimeFormat("en-CA", {
      timeZone: hinduCalendar.location.timeZone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(new Date());
  const hit = hinduCalendar.months.find((m) => today.startsWith(m.key));
  return hit?.key ?? hinduCalendar.months[0]?.key ?? "";
}
