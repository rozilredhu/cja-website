export type OfficialStatus = "active" | "inactive" | "archived";

export type OfficialRow = {
  id: number;
  full_name: string;
  designation: string;
  category: string;
  photo_url: string | null;
  photo_key: string | null;
  join_date: string | null;
  short_bio: string | null;
  term_start: string | null;
  term_end: string | null;
  social_url: string | null;
  display_order: number;
  status: OfficialStatus;
  tenure_label: string | null;
  created_at: string;
  updated_at: string;
};

export type OfficialCategoryRow = {
  id: number;
  name: string;
  display_order: number;
  active: number;
};

export type NewsArticleRow = {
  id: number;
  title: string;
  slug: string;
  meta_description: string;
  body: string;
  published: number;
  published_at: string | null;
  author: string | null;
  featured: number;
  created_at: string;
  updated_at: string;
};

export type FeatureFlagRow = {
  key: string;
  enabled: number;
  label: string;
  updated_at: string;
};

export type FeatureFlagKey =
  | "directory"
  | "matrimonial"
  | "promotions"
  | "services"
  | "volunteer_form";

export type UserAdminRow = {
  id: number;
  email: string;
  name: string;
  role: "admin" | "member";
  disabled: number;
  email_verified_at: string | null;
  created_at: string;
};

export type AdminFormState = {
  error?: string;
  success?: string;
};

export type DashboardCounts = {
  matrimonialPending: number;
  matrimonialOverdue: number;
  servicesPending: number;
  servicesOverdue: number;
  directoryDisabledProfiles: number;
  directoryDisabledBusinesses: number;
  newsDrafts: number;
  membersDisabled: number;
  officialsActive: number;
  maintenanceMode: boolean;
};
