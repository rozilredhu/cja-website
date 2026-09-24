/**
 * Precompute one year of Hindu panchang days for Mississauga / GTA
 * (America/Toronto) using the MIT `panchanga` engine (astronomy-engine).
 *
 * Usage: node scripts/generate-hindu-calendar.mjs
 * Output: src/content/hindu-calendar.json
 */
import { writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  dailyPanchanga,
  tithiBoundaries,
  computeFestivals,
  allRules,
} from "panchanga";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT = join(__dirname, "../src/content/hindu-calendar.json");

/** CJA mailing area — Mississauga / GTA */
const LOCATION = {
  name: "Mississauga, ON (GTA)",
  latitude: 43.589,
  longitude: -79.644,
  timeZone: "America/Toronto",
};

const MONTH_LABELS = {
  Chaitra: "Chaitra",
  Vaishakha: "Vaishakha",
  Jyeshtha: "Jyeshtha",
  Ashadha: "Ashadha",
  Shravana: "Shravana",
  Bhadrapada: "Bhadrapada",
  Ashwina: "Ashwina",
  Kartika: "Kartika",
  Margashirsha: "Margashirsha",
  Pausha: "Pausha",
  Magha: "Magha",
  Phalguna: "Phalguna",
};

const FESTIVAL_LABELS = {
  "krishna-janmashtami": "Krishna Janmashtami",
  "ganesh-chaturthi": "Ganesh Chaturthi",
  "sharadiya-navratri": "Sharadiya Navratri begins",
  "vijayadashami": "Vijayadashami (Dussehra)",
  "durga-ashtami": "Durga Ashtami",
  "maha-navami": "Maha Navami",
  "karva-chauth": "Karva Chauth",
  "diwali": "Diwali (Deepavali)",
  "govardhan-puja": "Govardhan Puja",
  "bhai-dooj": "Bhai Dooj",
  "makar-sankranti": "Makar Sankranti",
  "holi": "Holi",
  "rama-navami": "Rama Navami",
  "hanuman-jayanti": "Hanuman Jayanti",
  "akshaya-tritiya": "Akshaya Tritiya",
  "guru-purnima": "Guru Purnima",
  "nag-panchami": "Nag Panchami",
  "raksha-bandhan": "Raksha Bandhan",
  "hartalika-teej": "Hartalika Teej",
  "rishi-panchami": "Rishi Panchami",
  "balram-jayanti": "Balram Jayanti",
  "navpatrika-puja": "Navpatrika Puja",
  "kalparambha": "Kalparambha",
  "chhath-puja": "Chhath Puja",
  "vasant-panchami": "Vasant Panchami",
  "maha-shivaratri": "Maha Shivaratri",
  "ugadi": "Ugadi / Gudi Padwa",
  "gudi-padwa": "Gudi Padwa",
  "varalakshmi-vrat": "Varalakshmi Vrat",
  "onam": "Onam",
  "pongal": "Pongal",
  "buddha-purnima": "Buddha Purnima",
  "narak-chaturdashi": "Narak Chaturdashi",
  "dhanteras": "Dhanteras",
};

function titleizeId(id) {
  if (FESTIVAL_LABELS[id]) return FESTIVAL_LABELS[id];
  // ekadashi-ashwina-krishna → Ekadashi (Ashwina Krishna)
  const ek = id.match(/^ekadashi-(.+)-(shukla|krishna)$/);
  if (ek) {
    return `Ekadashi (${titleWord(ek[1])} ${titleWord(ek[2])})`;
  }
  const pr = id.match(/^pradosh-(.+)-(shukla|krishna)$/);
  if (pr) {
    return `Pradosh Vrat (${titleWord(pr[1])} ${titleWord(pr[2])})`;
  }
  const am = id.match(/^amavasya-(.+)$/);
  if (am) return `Amavasya (${titleWord(am[1])})`;
  const pu = id.match(/^purnima-(?:vrat|snana)-(.+)$/);
  if (pu) return `Purnima (${titleWord(pu[1])})`;
  const ms = id.match(/^masik-shivaratri-(.+)$/);
  if (ms) return `Masik Shivaratri (${titleWord(ms[1])})`;
  const sk = id.match(/^sankashti-chaturthi-(.+)$/);
  if (sk) return `Sankashti Chaturthi (${titleWord(sk[1])})`;
  const sa = id.match(/^sankranti-(.+)$/);
  if (sa) return `Sankranti (${titleWord(sa[1])})`;
  return id
    .split("-")
    .map(titleWord)
    .join(" ");
}

function titleWord(w) {
  if (!w) return w;
  return w.charAt(0).toUpperCase() + w.slice(1);
}

function ymdInTz(date, timeZone) {
  // en-CA gives YYYY-MM-DD
  return new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

function formatLocal(iso, timeZone) {
  if (!iso) return null;
  const d = new Date(iso);
  const date = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(d);
  const time = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(d);
  return { iso, date, time, display: `${date} ${time}` };
}

function addDaysYmd(ymd, days) {
  const [y, m, d] = ymd.split("-").map(Number);
  const utc = new Date(Date.UTC(y, m - 1, d));
  utc.setUTCDate(utc.getUTCDate() + days);
  return utc.toISOString().slice(0, 10);
}

function monthKeyFromYmd(ymd) {
  return ymd.slice(0, 7); // YYYY-MM
}

/** Civil noon UTC proxy that lands on the intended local civil day for Toronto */
function dateForLocalYmd(ymd, timeZone) {
  // Iterate a few UTC candidates around the date to find one whose local YMD matches
  const [y, m, d] = ymd.split("-").map(Number);
  for (const hour of [16, 12, 18, 8, 20]) {
    const cand = new Date(Date.UTC(y, m - 1, d, hour, 0, 0));
    if (ymdInTz(cand, timeZone) === ymd) return cand;
  }
  return new Date(`${ymd}T16:00:00Z`);
}

const todayYmd = ymdInTz(new Date(), LOCATION.timeZone);
const endYmd = addDaysYmd(todayYmd, 365); // exclusive end = today + 365 → 366 days? 
// "one full year from today" → today through today+364 inclusive = 365 days
const lastInclusive = addDaysYmd(todayYmd, 364);

console.log(`Generating ${todayYmd} … ${lastInclusive} (${LOCATION.timeZone})`);

const festivalYears = new Set([
  Number(todayYmd.slice(0, 4)),
  Number(lastInclusive.slice(0, 4)),
]);

const festivalsByDate = new Map();
for (const year of festivalYears) {
  const { results } = computeFestivals(year, LOCATION, {
    rules: allRules(year),
  });
  for (const f of results) {
    if (!f.date) continue;
    if (f.date < todayYmd || f.date > lastInclusive) continue;
    const list = festivalsByDate.get(f.date) ?? [];
    list.push({
      id: f.id,
      name: titleizeId(f.id),
    });
    festivalsByDate.set(f.date, list);
  }
}

const days = [];
for (let ymd = todayYmd; ymd <= lastInclusive; ymd = addDaysYmd(ymd, 1)) {
  const civil = dateForLocalYmd(ymd, LOCATION.timeZone);
  const p = dailyPanchanga(civil, LOCATION);
  if (p.date !== ymd) {
    console.warn(`date mismatch: wanted ${ymd}, got ${p.date}`);
  }

  const sunriseInstant = p.sunrise ? new Date(p.sunrise) : civil;
  const bounds = tithiBoundaries(sunriseInstant);
  const isPurnima = p.tithi.name === "Purnima" || p.tithi.number === 15;
  const isAmavasya = p.tithi.name === "Amavasya" || p.tithi.number === 30;

  const monthKey = p.month.purnimanta;
  const monthLabel = MONTH_LABELS[monthKey] ?? monthKey;

  // Deduplicate festival names for the day
  const rawFest = festivalsByDate.get(ymd) ?? [];
  const seen = new Set();
  const festivals = [];
  for (const f of rawFest) {
    if (seen.has(f.name)) continue;
    seen.add(f.name);
    festivals.push(f);
  }

  days.push({
    date: ymd,
    weekday: p.vara.name,
    weekdayShort: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][
      // ISO: compute from ymd
      (() => {
        const [yy, mm, dd] = ymd.split("-").map(Number);
        return new Date(Date.UTC(yy, mm - 1, dd, 17)).getUTCDay();
      })()
    ],
    hinduMonth: {
      key: monthKey,
      en: monthLabel,
      system: "purnimanta",
      paksha: p.tithi.paksha,
    },
    tithi: {
      number: p.tithi.number,
      name: p.tithi.name,
      paksha: p.tithi.paksha,
      fullName:
        p.tithi.name === "Purnima" || p.tithi.name === "Amavasya"
          ? p.tithi.name
          : `${titleWord(p.tithi.paksha)} ${p.tithi.name}`,
      start: formatLocal(bounds.start, LOCATION.timeZone),
      end: formatLocal(bounds.end ?? p.tithi.endsAt, LOCATION.timeZone),
      isPurnima,
      isAmavasya,
    },
    nakshatra: p.nakshatra
      ? {
          name: p.nakshatra.name,
          endsAt: formatLocal(p.nakshatra.endsAt, LOCATION.timeZone),
        }
      : null,
    sunrise: formatLocal(p.sunrise, LOCATION.timeZone),
    sunset: formatLocal(p.sunset, LOCATION.timeZone),
    festivals,
  });
}

const months = [];
const byMonth = new Map();
for (const day of days) {
  const mk = monthKeyFromYmd(day.date);
  if (!byMonth.has(mk)) byMonth.set(mk, []);
  byMonth.get(mk).push(day);
}
for (const [key, monthDays] of byMonth) {
  // Dominant Hindu month in this Gregorian month window
  const counts = new Map();
  for (const d of monthDays) {
    const k = d.hinduMonth.key;
    counts.set(k, (counts.get(k) ?? 0) + 1);
  }
  const dominant = [...counts.entries()].sort((a, b) => b[1] - a[1])[0][0];
  const label = MONTH_LABELS[dominant] ?? dominant;
  const [y, m] = key.split("-").map(Number);
  const gregorianLabel = new Intl.DateTimeFormat("en-CA", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(Date.UTC(y, m - 1, 1)));

  months.push({
    key,
    gregorianLabel,
    hinduMonthDominant: { key: dominant, en: label },
    dayCount: monthDays.length,
  });
}

const payload = {
  generatedAt: new Date().toISOString(),
  source: {
    library: "panchanga",
    version: "0.1.1",
    license: "MIT",
    method: "Drik Ganita / Smarta, purnimanta; astronomy-engine",
    note: "Indicative community calendar. Verify muhurat with a local pandit.",
  },
  location: LOCATION,
  range: { start: todayYmd, end: lastInclusive, dayCount: days.length },
  months,
  days,
};

mkdirSync(dirname(OUT), { recursive: true });
writeFileSync(OUT, JSON.stringify(payload, null, 2) + "\n");
console.log(`Wrote ${days.length} days, ${months.length} months → ${OUT}`);
console.log(
  `Festivals tagged on ${[...festivalsByDate.keys()].length} days`,
);
