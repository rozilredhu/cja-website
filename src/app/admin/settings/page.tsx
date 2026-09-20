export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import Link from "next/link";
import { PageHero } from "@/components/page-hero";
import { setMaintenanceModeAction } from "@/modules/admin/actions";
import { isMaintenanceMode } from "@/modules/admin/site-settings";
import { requireAdminUser } from "@/modules/auth/session";

export const metadata: Metadata = {
  title: "Admin — Site settings",
  robots: { index: false, follow: false },
};

export default async function AdminSettingsPage() {
  await requireAdminUser();
  const maintenance = await isMaintenanceMode();

  return (
    <>
      <PageHero
        title="Site settings"
        description="Site-wide maintenance mode. When on, public pages show a maintenance page; /admin/* stays available."
        eyebrow="Admin"
      />

      <section className="card">
        <p>
          <Link href="/admin">← Admin dashboard</Link>
        </p>

        <h2>Maintenance mode</h2>
        <p>
          Current status:{" "}
          <strong>{maintenance ? "ON" : "OFF"}</strong>
        </p>
        <form action={setMaintenanceModeAction}>
          <input
            type="hidden"
            name="enabled"
            value={maintenance ? "0" : "1"}
          />
          <button type="submit" className="btn-primary">
            {maintenance ? "Turn maintenance OFF" : "Turn maintenance ON"}
          </button>
        </form>
      </section>
    </>
  );
}
