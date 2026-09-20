export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PageHero } from "@/components/page-hero";
import { OfficialForm } from "@/modules/admin/components/official-form";
import {
  getOfficialById,
  listActiveCategoryNames,
} from "@/modules/admin/queries";
import { requireAdminUser } from "@/modules/auth/session";

type Props = { params: Promise<{ id: string }> };

export const metadata: Metadata = {
  title: "Admin — Edit official",
  robots: { index: false, follow: false },
};

export default async function AdminEditOfficialPage({ params }: Props) {
  await requireAdminUser();
  const { id: idRaw } = await params;
  const id = Number(idRaw);
  if (!Number.isFinite(id)) notFound();

  const [official, categories] = await Promise.all([
    getOfficialById(id),
    listActiveCategoryNames(),
  ]);
  if (!official) notFound();

  return (
    <>
      <PageHero
        title={`Edit: ${official.full_name}`}
        description="Update fields, photo URL / R2 key, or status."
        eyebrow="Admin · Officials"
      />
      <section className="card">
        <p>
          <Link href="/admin/officials">← Officials list</Link>
        </p>
        <OfficialForm official={official} categories={categories} />
      </section>
    </>
  );
}
