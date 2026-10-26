import { redirect } from "next/navigation";
import { getAuthenticatedAdmin } from "@/lib/adminAuth";
import EditorPreviewClient from "./EditorPreviewClient";

export default async function EditorPreviewPage() {
  const admin = await getAuthenticatedAdmin();
  if (!admin) redirect("/admin/login");

  return <EditorPreviewClient />;
}
