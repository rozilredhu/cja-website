import { getDb } from "@/lib/db";
import type { AuthUser } from "@/modules/auth/roles";
import type {
  BusinessListingPublic,
  BusinessListingRow,
  DirectoryProfilePublic,
  DirectoryProfileRow,
} from "./types";

/**
 * Phone + address are visible only to logged-in members who have themselves
 * opted into the directory. Enforced server-side on every browse/detail query.
 */
export async function viewerCanSeeSensitive(
  viewer: AuthUser | null,
): Promise<boolean> {
  if (!viewer) return false;
  try {
    const db = await getDb();
    const row = await db
      .prepare(
        `SELECT opted_in, disabled FROM directory_profiles
         WHERE user_id = ? LIMIT 1`,
      )
      .bind(viewer.id)
      .first<{ opted_in: number; disabled: number }>();
    return Boolean(row && row.opted_in && !row.disabled);
  } catch {
    return false;
  }
}

export function resolvePhotoUrl(
  photoKey: string | null | undefined,
  photoUrl: string | null | undefined,
): string | null {
  if (photoUrl && photoUrl.trim()) return photoUrl.trim();
  // R2 keys are not publicly URL-mapped yet — return null until MEDIA serving exists
  if (photoKey && photoKey.trim()) return null;
  return null;
}

export function toPublicProfile(
  row: DirectoryProfileRow,
  canViewSensitive: boolean,
  promo?: { endsAt: string } | null,
): DirectoryProfilePublic {
  const showPhone = Boolean(row.show_phone);
  const showAddress = Boolean(row.show_address);
  const showEducation = Boolean(row.show_education);
  const showPhoto = Boolean(row.show_photo);

  return {
    id: row.id,
    userId: row.user_id,
    displayName: row.display_name || "Member",
    city: row.city,
    province: row.province,
    education: showEducation ? row.education : null,
    bio: row.bio,
    photoUrl: showPhoto
      ? resolvePhotoUrl(row.photo_key, row.photo_url)
      : null,
    phone:
      canViewSensitive && showPhone && row.phone ? row.phone : null,
    addressLine:
      canViewSensitive && showAddress && row.address_line
        ? row.address_line
        : null,
    canViewSensitive,
    promoted: Boolean(promo?.endsAt),
    promotedUntil: promo?.endsAt ?? null,
  };
}

export function toPublicBusiness(
  row: BusinessListingRow,
  canViewSensitive: boolean,
  promo?: { endsAt: string } | null,
): BusinessListingPublic {
  return {
    id: row.id,
    userId: row.user_id,
    name: row.name,
    description: row.description,
    city: row.city,
    province: row.province,
    website: row.website,
    email: canViewSensitive ? row.email : null,
    photoUrl: resolvePhotoUrl(row.photo_key, row.photo_url),
    phone: canViewSensitive && row.phone ? row.phone : null,
    addressLine:
      canViewSensitive && row.address_line ? row.address_line : null,
    canViewSensitive,
    promoted: Boolean(promo?.endsAt),
    promotedUntil: promo?.endsAt ?? null,
  };
}
