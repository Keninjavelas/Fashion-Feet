import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import PreferencesClient from "./PreferencesClient";

export default async function PreferencesPage() {
  const session = await auth();
  const dbUser = session?.user?.email 
    ? await prisma.user.findUnique({ where: { email: session.user.email } }) 
    : null;
    
  const initialData = dbUser?.preferences ? JSON.parse(dbUser.preferences) : null;

  return <PreferencesClient initialData={initialData} />;
}
