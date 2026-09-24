export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AdminLoginForm } from "@/components/admin-login-form";
import { PageHero } from "@/components/page-hero";
import { isAdmin } from "@/modules/auth/roles";
import { getCurrentUser } from "@/modules/auth/session";
import { MemberLoginForm } from "@/modules/members/components/member-login-form";

export const metadata: Metadata = {
  title: "Login",
  description:
    "Sign in as a CJA member or administrator. One page, two account types.",
  robots: { index: false, follow: false },
};

export default async function UnifiedLoginPage() {
  const user = await getCurrentUser();
  if (isAdmin(user)) {
    redirect("/admin");
  }
  if (user?.role === "member") {
    redirect("/members");
  }

  return (
    <>
      <PageHero
        title="Sign in"
        description="Choose Admin or Regular users. Each section uses its own account type."
        eyebrow="Accounts"
      />
      <div className="login-split">
        <section className="card login-panel" id="admin">
          <h2>Admin login</h2>
          <p className="muted">
            Site administrators only. After sign-in you go to the admin hub
            (MFA if enabled).
          </p>
          <AdminLoginForm />
        </section>
        <section className="card login-panel" id="members">
          <h2>Regular users</h2>
          <p className="muted">
            Member accounts for directory, matrimonial, promotions, and
            Services listings.
          </p>
          <MemberLoginForm />
        </section>
      </div>
    </>
  );
}
