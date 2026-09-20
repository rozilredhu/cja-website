import Link from "next/link";

export function MaintenancePage() {
  return (
    <section className="card" style={{ marginTop: "2rem", textAlign: "center" }}>
      <p className="eyebrow">Maintenance</p>
      <h1>We’ll be right back</h1>
      <p className="muted">
        The CJA website is temporarily in maintenance mode. Please check back
        shortly. Administrators can still sign in at the admin area.
      </p>
      <p style={{ marginTop: "1.25rem" }}>
        <Link href="/admin/login" className="btn-secondary">
          Admin sign-in
        </Link>
      </p>
    </section>
  );
}

export function MaintenanceBanner() {
  return (
    <div className="maintenance-banner" role="status">
      <strong>Maintenance mode is on.</strong> Public visitors see a maintenance
      page. Admin routes remain available.
    </div>
  );
}
