export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import Link from "next/link";
import { PageHero } from "@/components/page-hero";
import { requireMemberUser } from "@/modules/auth/session";
import { listInboxMessages } from "@/modules/matrimonial/queries";

export const metadata: Metadata = {
  title: "Matrimonial messages",
  robots: { index: false, follow: false },
};

export default async function MatrimonialMessagesPage() {
  const user = await requireMemberUser();
  const messages = await listInboxMessages(user.id);

  return (
    <>
      <PageHero
        title="Matrimonial messages"
        description="Platform contact messages (email stub also queued to notification_outbox)."
        eyebrow="Matrimonial"
      />

      <section className="card">
        <p>
          <Link href="/members/matrimonial">← My profile</Link>
          {" · "}
          <Link href="/members/matrimonial/browse">Browse</Link>
        </p>

        {messages.length === 0 ? (
          <p className="muted">No messages yet.</p>
        ) : (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>When</th>
                  <th>Direction</th>
                  <th>With</th>
                  <th>Subject</th>
                  <th>Message</th>
                  <th>Profile</th>
                </tr>
              </thead>
              <tbody>
                {messages.map((m) => {
                  const incoming = m.to_user_id === user.id;
                  const other = incoming
                    ? m.from_name || `User #${m.from_user_id}`
                    : m.to_name || `User #${m.to_user_id}`;
                  return (
                    <tr key={m.id}>
                      <td>{m.created_at}</td>
                      <td>{incoming ? "Received" : "Sent"}</td>
                      <td>{other}</td>
                      <td>{m.subject ?? "—"}</td>
                      <td style={{ maxWidth: "20rem", whiteSpace: "pre-wrap" }}>
                        {m.body}
                      </td>
                      <td>
                        <Link
                          href={`/members/matrimonial/browse/${m.to_profile_id}`}
                        >
                          #{m.to_profile_id}
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </>
  );
}
