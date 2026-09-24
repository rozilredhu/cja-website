"use client";

import { useId, useState } from "react";
import type { Official } from "@/content/types";

type Props = { official: Official; compact?: boolean };

function hasExpandableDetails(official: Official) {
  return Boolean(
    official.shortBio ||
      official.occupation ||
      official.appointedAs ||
      official.termStart ||
      official.termEnd ||
      official.socialUrl,
  );
}

function formatField(value: string | undefined) {
  const trimmed = value?.trim();
  return trimmed && trimmed.length > 0 ? trimmed : null;
}

export function OfficialCard({ official, compact = false }: Props) {
  const [expanded, setExpanded] = useState(false);
  const panelId = useId();

  const initials = official.fullName
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("");

  const expandable = !compact && hasExpandableDetails(official);
  const bio = formatField(official.shortBio);
  const occupation = formatField(official.occupation);
  const appointedAs = formatField(official.appointedAs);
  const termStart = formatField(official.termStart);
  const termEnd = formatField(official.termEnd);

  const photo = (
    <div className="official-photo" aria-hidden>
      {official.photoUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={official.photoUrl} alt="" />
      ) : (
        <span className="official-initials">{initials || "?"}</span>
      )}
    </div>
  );

  const identity = (
    <>
      <h3>{official.fullName}</h3>
      <p className="official-role">{official.designation}</p>
      <p className="official-cat">{official.category}</p>
    </>
  );

  return (
    <article
      className={[
        "official-card",
        compact ? "official-card--compact" : "",
        expandable ? "official-card--expandable" : "",
        expanded ? "official-card--expanded" : "",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {expandable ? (
        <>
          <button
            type="button"
            className="official-card-hit"
            aria-expanded={expanded}
            aria-controls={panelId}
            onClick={() => setExpanded((value) => !value)}
          >
            {photo}
            <div className="official-body official-body--summary">
              {identity}
              <span className="official-toggle-hint">
                <span>{expanded ? "Hide bio" : "View bio"}</span>
                <span className="official-toggle-icon" aria-hidden>
                  {expanded ? "−" : "+"}
                </span>
              </span>
            </div>
          </button>
          <div
            id={panelId}
            className="official-details"
            role="region"
            aria-label={`${official.fullName} biography`}
            hidden={!expanded}
          >
            <dl className="official-meta">
              <div>
                <dt>Role</dt>
                <dd>{official.designation}</dd>
              </div>
              {occupation ? (
                <div>
                  <dt>Occupation / workplace</dt>
                  <dd>{occupation}</dd>
                </div>
              ) : null}
              {appointedAs ? (
                <div>
                  <dt>Selected / appointed as</dt>
                  <dd>{appointedAs}</dd>
                </div>
              ) : null}
              {termStart || termEnd ? (
                <div>
                  <dt>Term</dt>
                  <dd>
                    {termStart ?? "TBD"}
                    {" – "}
                    {termEnd ?? "TBD"}
                  </dd>
                </div>
              ) : null}
            </dl>
            {bio ? <p className="muted official-bio">{bio}</p> : null}
            {official.socialUrl ? (
              <p>
                <a
                  href={official.socialUrl}
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  Public profile
                </a>
              </p>
            ) : null}
          </div>
        </>
      ) : (
        <>
          {photo}
          <div className="official-body">
            {identity}
            {!compact && bio ? (
              <p className="muted official-bio">{bio}</p>
            ) : null}
            {!compact && official.socialUrl ? (
              <p>
                <a
                  href={official.socialUrl}
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  Public profile
                </a>
              </p>
            ) : null}
          </div>
        </>
      )}
    </article>
  );
}
