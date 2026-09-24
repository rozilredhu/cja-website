import type { Official } from "@/content/types";

type Props = { official: Official; compact?: boolean };

export function OfficialCard({ official, compact = false }: Props) {
  const initials = official.fullName
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("");

  return (
    <article className={`official-card${compact ? " official-card--compact" : ""}`}>
      <div className="official-photo" aria-hidden>
        {official.photoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={official.photoUrl} alt="" />
        ) : (
          <span className="official-initials">{initials || "?"}</span>
        )}
      </div>
      <div className="official-body">
        <h3>{official.fullName}</h3>
        <p className="official-role">{official.designation}</p>
        <p className="official-cat">{official.category}</p>
        {!compact && official.shortBio ? (
          <p className="muted official-bio">{official.shortBio}</p>
        ) : null}
        {!compact && official.socialUrl ? (
          <p>
            <a href={official.socialUrl} rel="noopener noreferrer" target="_blank">
              Public profile
            </a>
          </p>
        ) : null}
      </div>
    </article>
  );
}
