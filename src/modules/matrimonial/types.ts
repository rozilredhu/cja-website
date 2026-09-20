/** Matrimonial module (§3F) types */

export type MatrimonialGender = "man" | "woman";

export type MatrimonialStatus = "pending" | "approved" | "rejected";

export type MatrimonialProfileRow = {
  id: number;
  user_id: number;
  gender: MatrimonialGender;
  date_of_birth: string;
  height_cm: number | null;
  marital_status: string | null;
  city: string | null;
  province: string | null;
  education: string | null;
  occupation: string | null;
  gotra: string | null;
  mother_gotra: string | null;
  native_place: string | null;
  mother_tongue: string | null;
  diet: string | null;
  willing_to_relocate: number;
  partner_preferences: string | null;
  short_bio: string | null;
  photo_key: string | null;
  photo_url: string | null;
  status: MatrimonialStatus;
  admin_note: string | null;
  reviewed_at: string | null;
  reviewed_by: number | null;
  submitted_at: string | null;
  created_at: string;
  updated_at: string;
};

/** Public browse/detail card — never includes phone/email */
export type MatrimonialProfilePublic = {
  id: number;
  userId: number;
  /** First name / account display only — not full family names collected here */
  displayName: string;
  gender: MatrimonialGender;
  age: number;
  heightCm: number | null;
  heightLabel: string | null;
  maritalStatus: string | null;
  city: string | null;
  province: string | null;
  education: string | null;
  occupation: string | null;
  gotra: string | null;
  motherGotra: string | null;
  nativePlace: string | null;
  motherTongue: string | null;
  diet: string | null;
  willingToRelocate: boolean;
  partnerPreferences: string | null;
  shortBio: string | null;
  photoUrl: string | null;
  promoted: boolean;
  promotedUntil: string | null;
};

export type MatrimonialSearchFilters = {
  ageMin?: number;
  ageMax?: number;
  heightMinCm?: number;
  heightMaxCm?: number;
  city?: string;
  province?: string;
  education?: string;
  occupation?: string;
  gotra?: string;
  maritalStatus?: string;
};

export type MatrimonialFormState = {
  error?: string;
  ok?: boolean;
  message?: string;
};

export type MatrimonialContactMessageRow = {
  id: number;
  from_user_id: number;
  to_user_id: number;
  to_profile_id: number;
  subject: string | null;
  body: string;
  created_at: string;
  from_name?: string | null;
  from_email?: string | null;
  to_name?: string | null;
};

export type MatrimonialReportRow = {
  id: number;
  reporter_user_id: number;
  reported_profile_id: number;
  reason: string;
  details: string | null;
  status: "open" | "reviewed" | "dismissed";
  created_at: string;
};

export type AdminPendingProfile = MatrimonialProfileRow & {
  member_name: string | null;
  member_email: string | null;
  overdue: boolean;
};

export const CA_PROVINCES = [
  { code: "AB", name: "Alberta" },
  { code: "BC", name: "British Columbia" },
  { code: "MB", name: "Manitoba" },
  { code: "NB", name: "New Brunswick" },
  { code: "NL", name: "Newfoundland and Labrador" },
  { code: "NS", name: "Nova Scotia" },
  { code: "NT", name: "Northwest Territories" },
  { code: "NU", name: "Nunavut" },
  { code: "ON", name: "Ontario" },
  { code: "PE", name: "Prince Edward Island" },
  { code: "QC", name: "Quebec" },
  { code: "SK", name: "Saskatchewan" },
  { code: "YT", name: "Yukon" },
] as const;

export const MARITAL_STATUSES = [
  "Never married",
  "Divorced",
  "Widowed",
  "Separated",
] as const;

export const DIET_OPTIONS = [
  "Vegetarian",
  "Eggetarian",
  "Non-vegetarian",
  "Vegan",
  "Other",
] as const;
