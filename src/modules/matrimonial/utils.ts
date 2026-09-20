/** Age from DOB (YYYY-MM-DD). Never ask users to type age. */
export function ageFromDob(dob: string, now = new Date()): number | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dob.trim());
  if (!m) return null;
  const y = Number(m[1]);
  const mo = Number(m[2]);
  const d = Number(m[3]);
  if (!y || mo < 1 || mo > 12 || d < 1 || d > 31) return null;
  const birth = new Date(Date.UTC(y, mo - 1, d));
  if (Number.isNaN(birth.getTime())) return null;
  let age = now.getUTCFullYear() - y;
  const monthDiff = now.getUTCMonth() - (mo - 1);
  if (monthDiff < 0 || (monthDiff === 0 && now.getUTCDate() < d)) {
    age -= 1;
  }
  return age >= 0 && age < 130 ? age : null;
}

/** Feet + inches → cm (rounded). */
export function ftInToCm(feet: number, inches: number): number | null {
  if (!Number.isFinite(feet) || !Number.isFinite(inches)) return null;
  if (feet < 0 || inches < 0 || inches >= 12) return null;
  const totalIn = feet * 12 + inches;
  if (totalIn <= 0 || totalIn > 108) return null; // up to 9 ft
  return Math.round(totalIn * 2.54);
}

/** cm → { feet, inches } for form defaults. */
export function cmToFtIn(cm: number): { feet: number; inches: number } {
  const totalIn = Math.round(cm / 2.54);
  const feet = Math.floor(totalIn / 12);
  const inches = totalIn % 12;
  return { feet, inches };
}

export function formatHeightCm(cm: number | null | undefined): string | null {
  if (cm == null || !Number.isFinite(cm) || cm <= 0) return null;
  const { feet, inches } = cmToFtIn(cm);
  return `${cm} cm (${feet}'${inches}")`;
}

/** Public-facing first token of account name (privacy: no family-name collection). */
export function displayFirstName(fullName: string | null | undefined): string {
  const t = (fullName || "").trim();
  if (!t) return "Member";
  return t.split(/\s+/)[0] || "Member";
}

export function oppositeGender(
  gender: "man" | "woman",
): "man" | "woman" {
  return gender === "man" ? "woman" : "man";
}

/** Pending > 24h = overdue for admin inbox. */
export function isPendingOverdue(
  submittedAt: string | null | undefined,
  now = Date.now(),
): boolean {
  if (!submittedAt) return false;
  const iso = submittedAt.includes("T") ? submittedAt : `${submittedAt}Z`;
  const t = new Date(iso).getTime();
  if (!Number.isFinite(t)) return false;
  return now - t > 24 * 60 * 60 * 1000;
}

/** DOB lower/upper bounds as YYYY-MM-DD for age range SQL filters. */
export function dobBoundsForAgeRange(
  ageMin?: number,
  ageMax?: number,
  now = new Date(),
): { dobMax?: string; dobMin?: string } {
  const y = now.getUTCFullYear();
  const mo = String(now.getUTCMonth() + 1).padStart(2, "0");
  const d = String(now.getUTCDate()).padStart(2, "0");
  const today = `${y}-${mo}-${d}`;
  const out: { dobMax?: string; dobMin?: string } = {};
  // age >= ageMin → DOB <= today - ageMin years
  if (ageMin != null && Number.isFinite(ageMin)) {
    out.dobMax = shiftYears(today, -Math.floor(ageMin));
  }
  // age <= ageMax → DOB > today - (ageMax+1) years  (approx: DOB >= today - ageMax years - almost 1y)
  if (ageMax != null && Number.isFinite(ageMax)) {
    out.dobMin = shiftYears(today, -(Math.floor(ageMax) + 1));
  }
  return out;
}

function shiftYears(ymd: string, deltaYears: number): string {
  const [ys, ms, ds] = ymd.split("-").map(Number);
  const dt = new Date(Date.UTC(ys + deltaYears, ms - 1, ds));
  const y = dt.getUTCFullYear();
  const m = String(dt.getUTCMonth() + 1).padStart(2, "0");
  const d = String(dt.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}
