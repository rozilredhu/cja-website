import { redirect } from "next/navigation";

/** Documents nav target now lives on About CJA. */
export default function DocumentsPage() {
  redirect("/about#document-centre");
}
