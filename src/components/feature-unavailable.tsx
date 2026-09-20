import Link from "next/link";
import { PageHero } from "@/components/page-hero";

type Props = {
  title: string;
  moduleLabel: string;
};

export function FeatureUnavailable({ title, moduleLabel }: Props) {
  return (
    <>
      <PageHero title={title} description={`${moduleLabel} is temporarily unavailable.`} eyebrow="Unavailable" />
      <section className="card">
        <p className="form-error">
          {moduleLabel} has been turned off by an administrator.
        </p>
        <p>
          <Link href="/members">← Member area</Link>
        </p>
      </section>
    </>
  );
}
