/** Services marketplace types */

export type ServiceListingStatus =
  | "pending_payment"
  | "pending_approval"
  | "live"
  | "rejected"
  | "expired";

export type ServicePlanTier = "monthly" | "quarterly" | "annual";

export type ServiceAvailability =
  | "24_7"
  | "weekdays"
  | "weekends"
  | "by_appointment";

export type ServiceCategoryRow = {
  slug: string;
  name: string;
  description: string | null;
  sort_order: number;
  active: number;
  created_at: string;
};

export type ServiceListingRow = {
  id: number;
  user_id: number;
  category_slug: string;
  business_name: string;
  description: string | null;
  contact_phone: string | null;
  contact_email: string | null;
  city: string;
  province: string;
  price_cents: number | null;
  price_range: string | null;
  avg_rating: number;
  review_count: number;
  lat: number | null;
  lng: number | null;
  availability: ServiceAvailability;
  languages: string;
  years_experience: number;
  verified_licensed: number;
  plan_tier: ServicePlanTier | null;
  amount_cents: number | null;
  duration_days: number | null;
  status: ServiceListingStatus;
  stripe_session_id: string | null;
  payment_ref: string | null;
  paid_at: string | null;
  approved_at: string | null;
  expires_at: string | null;
  rejected_reason: string | null;
  disabled: number;
  created_at: string;
  updated_at: string;
};

export type ServiceListingPublic = ServiceListingRow & {
  category_name?: string;
};

export type ServiceListingAdmin = ServiceListingRow & {
  member_email?: string;
  member_name?: string;
  category_name?: string;
};

export type ServiceFormState = {
  error?: string;
  ok?: boolean;
  message?: string;
  listingId?: number;
};

export type ServiceSort =
  | "relevance"
  | "price_asc"
  | "price_desc"
  | "rating"
  | "experience"
  | "distance";

export type ServiceBrowseFilters = {
  q?: string;
  category?: string;
  city?: string;
  province?: string;
  priceMinCents?: number;
  priceMaxCents?: number;
  minRating?: number;
  availability?: ServiceAvailability;
  language?: string;
  minExperience?: number;
  verifiedOnly?: boolean;
  sort?: ServiceSort;
  /** Browser geolocation for distance sort */
  userLat?: number;
  userLng?: number;
};

/** Re-export provinces list from directory for forms */
export { CA_PROVINCES } from "@/modules/directory/types";

export const SERVICE_AVAILABILITY_OPTIONS: {
  value: ServiceAvailability;
  label: string;
}[] = [
  { value: "24_7", label: "24/7" },
  { value: "weekdays", label: "Weekdays" },
  { value: "weekends", label: "Weekends" },
  { value: "by_appointment", label: "By appointment" },
];

export const LANGUAGE_SUGGESTIONS = [
  "English",
  "French",
  "Punjabi",
  "Hindi",
  "Urdu",
  "Gujarati",
  "Tamil",
  "Spanish",
  "Mandarin",
  "Cantonese",
] as const;
