import type { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Volunteer",
  description:
    "Volunteer interest form for the Canadian Jats Association — see Contact.",
};

/**
 * Legacy path. Volunteer form is embedded on /contact#volunteer.
 * Server redirects cannot preserve URL hashes, so deep links should use
 * /contact#volunteer directly (homepage / About CTAs already do).
 */
export default function VolunteerRedirectPage() {
  redirect("/contact");
}
