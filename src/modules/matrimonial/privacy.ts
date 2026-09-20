import type { MatrimonialProfilePublic, MatrimonialProfileRow } from "./types";
import {
  ageFromDob,
  displayFirstName,
  formatHeightCm,
} from "./utils";

export function resolvePhotoUrl(
  photoKey: string | null | undefined,
  photoUrl: string | null | undefined,
): string | null {
  if (photoUrl && photoUrl.trim()) return photoUrl.trim();
  if (photoKey && photoKey.trim()) return null;
  return null;
}

/**
 * Strip to public matrimonial view.
 * Never includes phone, email, exact address, income, or full family names.
 */
export function toPublicProfile(
  row: MatrimonialProfileRow,
  memberName: string | null | undefined,
  promo?: { endsAt: string } | null,
): MatrimonialProfilePublic | null {
  const age = ageFromDob(row.date_of_birth);
  if (age == null) return null;

  return {
    id: row.id,
    userId: row.user_id,
    displayName: displayFirstName(memberName),
    gender: row.gender,
    age,
    heightCm: row.height_cm,
    heightLabel: formatHeightCm(row.height_cm),
    maritalStatus: row.marital_status,
    city: row.city,
    province: row.province,
    education: row.education,
    occupation: row.occupation,
    gotra: row.gotra,
    motherGotra: row.mother_gotra,
    nativePlace: row.native_place,
    motherTongue: row.mother_tongue,
    diet: row.diet,
    willingToRelocate: Boolean(row.willing_to_relocate),
    partnerPreferences: row.partner_preferences,
    shortBio: row.short_bio,
    photoUrl: resolvePhotoUrl(row.photo_key, row.photo_url),
    promoted: Boolean(promo?.endsAt),
    promotedUntil: promo?.endsAt ?? null,
  };
}
