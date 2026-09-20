/** Community Directory (§3D) types */

export type DirectoryProfileRow = {
  id: number;
  user_id: number;
  opted_in: number;
  disabled: number;
  display_name: string;
  phone: string | null;
  address_line: string | null;
  city: string | null;
  province: string | null;
  education: string | null;
  bio: string | null;
  photo_key: string | null;
  photo_url: string | null;
  show_phone: number;
  show_address: number;
  show_photo: number;
  show_education: number;
  opted_in_at: string | null;
  created_at: string;
  updated_at: string;
};

export type BusinessListingRow = {
  id: number;
  user_id: number;
  name: string;
  description: string | null;
  city: string | null;
  province: string | null;
  phone: string | null;
  email: string | null;
  website: string | null;
  address_line: string | null;
  photo_key: string | null;
  photo_url: string | null;
  opted_in: number;
  disabled: number;
  status: "active" | "pending" | "disabled";
  created_at: string;
  updated_at: string;
};

/** Public-facing profile after privacy stripping */
export type DirectoryProfilePublic = {
  id: number;
  userId: number;
  displayName: string;
  city: string | null;
  province: string | null;
  education: string | null;
  bio: string | null;
  photoUrl: string | null;
  /** Present only when viewer may see sensitive contact fields */
  phone: string | null;
  addressLine: string | null;
  canViewSensitive: boolean;
};

export type BusinessListingPublic = {
  id: number;
  userId: number;
  name: string;
  description: string | null;
  city: string | null;
  province: string | null;
  website: string | null;
  email: string | null;
  photoUrl: string | null;
  phone: string | null;
  addressLine: string | null;
  canViewSensitive: boolean;
};

export type DirectorySearchFilters = {
  q?: string;
  city?: string;
  province?: string;
};

export type DirectoryFormState = {
  error?: string;
  ok?: boolean;
  message?: string;
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
