"use client";

import { useMemo, useState } from "react";
import type { HinduCalendarData, HinduDay } from "@/lib/hindu-calendar";

type Props = {
  data: HinduCalendarData;
  initialMonthKey: string;
};

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] as const;

function padGrid(days: HinduDay[]): (HinduDay | null)[] {
  if (days.length === 0) return [];
  const first = days[0];
  const [y, m, d] = first.date.split("-").map(Number);
  // Use UTC noon to avoid TZ shift for weekday of civil date
  const startDow = new Date(Date.UTC(y, m - 1, d, 12)).getUTCDay();
  const cells: (HinduDay | null)[] = Array(startDow).fill(null);
  cells.push(...days);
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}

export function HinduCalendarView({ data, initialMonthKey }: Props) {
  const [monthKey, setMonthKey] = useState(initialMonthKey);

  const monthIndex = data.months.findIndex((m) => m.key === monthKey);
  const meta = data.months[monthIndex] ?? data.months[0];

  const days = useMemo(
    () => data.days.filter((d) => d.date.startsWith(monthKey)),
    [data.days, monthKey],
  );

  const cells = useMemo(() => padGrid(days), [days]);

  const todayYmd = useMemo(
    () =>
      new Intl.DateTimeFormat("en-CA", {
        timeZone: data.location.timeZone,
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      }).format(new Date()),
    [data.location.timeZone],
  );

  function go(delta: number) {
    const next = data.months[monthIndex + delta];
    if (next) setMonthKey(next.key);
  }

  return (
    <div className="hindu-cal">
      <div className="hindu-cal-toolbar card">
        <button
          type="button"
          className="btn btn-secondary"
          onClick={() => go(-1)}
          disabled={monthIndex <= 0}
          aria-label="Previous month"
        >
          ← Prev
        </button>
        <div className="hindu-cal-toolbar-center">
          <h2 className="hindu-cal-month-title">{meta?.gregorianLabel}</h2>
          {meta ? (
            <p className="muted hindu-cal-hindu-month">
              Hindu month: {meta.hinduMonthDominant.en}
              <span className="hindu-cal-range-hint">
                {" "}
                (purnimanta · {data.location.name})
              </span>
            </p>
          ) : null}
        </div>
        <button
          type="button"
          className="btn btn-secondary"
          onClick={() => go(1)}
          disabled={monthIndex >= data.months.length - 1}
          aria-label="Next month"
        >
          Next →
        </button>
      </div>

      <section className="card hindu-cal-grid-wrap" aria-label="Month grid">
        <div className="hindu-cal-grid" role="grid">
          {WEEKDAYS.map((w) => (
            <div key={w} className="hindu-cal-grid-head" role="columnheader">
              {w}
            </div>
          ))}
          {cells.map((day, i) =>
            day ? (
              <a
                key={day.date}
                href={`#day-${day.date}`}
                className={[
                  "hindu-cal-cell",
                  day.date === todayYmd ? "is-today" : "",
                  day.tithi.isPurnima ? "is-purnima" : "",
                  day.tithi.isAmavasya ? "is-amavasya" : "",
                  day.festivals.length ? "has-festival" : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
                role="gridcell"
              >
                <span className="hindu-cal-cell-date">{Number(day.date.slice(8))}</span>
                <span className="hindu-cal-cell-tithi">{day.tithi.name}</span>
                {day.tithi.isPurnima ? (
                  <span className="hindu-cal-badge purnima">Purnima</span>
                ) : null}
                {day.tithi.isAmavasya ? (
                  <span className="hindu-cal-badge amavasya">Amavasya</span>
                ) : null}
                {day.festivals[0] ? (
                  <span className="hindu-cal-cell-fest" title={day.festivals.map((f) => f.name).join(", ")}>
                    {day.festivals[0].name}
                  </span>
                ) : null}
              </a>
            ) : (
              <div key={`empty-${i}`} className="hindu-cal-cell is-empty" role="gridcell" />
            ),
          )}
        </div>
      </section>

      <section className="section-block hindu-cal-list" aria-labelledby="day-list-heading">
        <h2 id="day-list-heading" className="section-title">
          Day-by-day · {meta?.gregorianLabel}
        </h2>
        <ul className="hindu-cal-day-list">
          {days.map((day) => (
            <li key={day.date} id={`day-${day.date}`} className="card hindu-cal-day">
              <div className="hindu-cal-day-head">
                <div>
                  <h3>
                    {day.date}
                    <span className="muted"> · {day.weekdayShort}</span>
                  </h3>
                  <p className="muted hindu-cal-day-month">
                    {day.hinduMonth.en}
                    {" · "}
                    {day.tithi.paksha === "shukla" ? "Shukla" : "Krishna"} paksha
                  </p>
                </div>
                <div className="hindu-cal-day-badges">
                  {day.tithi.isPurnima ? (
                    <span className="hindu-cal-badge purnima">Purnima</span>
                  ) : null}
                  {day.tithi.isAmavasya ? (
                    <span className="hindu-cal-badge amavasya">Amavasya</span>
                  ) : null}
                  {day.date === todayYmd ? (
                    <span className="hindu-cal-badge today">Today</span>
                  ) : null}
                </div>
              </div>

              <dl className="hindu-cal-dl">
                <div>
                  <dt>Tithi</dt>
                  <dd>
                    <strong>{day.tithi.fullName}</strong>
                  </dd>
                </div>
                <div>
                  <dt>Starts</dt>
                  <dd>
                    {day.tithi.start
                      ? `${day.tithi.start.time} (${day.tithi.start.date})`
                      : "—"}
                  </dd>
                </div>
                <div>
                  <dt>Ends</dt>
                  <dd>
                    {day.tithi.end
                      ? `${day.tithi.end.time} (${day.tithi.end.date})`
                      : "—"}
                  </dd>
                </div>
                {day.nakshatra ? (
                  <div>
                    <dt>Nakshatra</dt>
                    <dd>{day.nakshatra.name}</dd>
                  </div>
                ) : null}
                {day.sunrise || day.sunset ? (
                  <div>
                    <dt>Sunrise / sunset</dt>
                    <dd>
                      {day.sunrise?.time ?? "—"} / {day.sunset?.time ?? "—"}
                    </dd>
                  </div>
                ) : null}
              </dl>

              {day.festivals.length > 0 ? (
                <div className="hindu-cal-festivals">
                  <h4>Festivals & observances</h4>
                  <ul>
                    {day.festivals.map((f) => (
                      <li key={f.id}>{f.name}</li>
                    ))}
                  </ul>
                </div>
              ) : (
                <p className="muted hindu-cal-no-fest">No major listed observance.</p>
              )}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
