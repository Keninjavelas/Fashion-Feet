import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import NotificationsClient from "./NotificationsClient";

export default async function NotificationsPage() {
  const session = await auth();
  const dbUser = session?.user?.email 
    ? await prisma.user.findUnique({ where: { email: session.user.email } }) 
    : null;
    
  const initialData = dbUser?.notifications ? JSON.parse(dbUser.notifications) : null;

  return <NotificationsClient initialData={initialData} />;
}

function NotificationToggle({ title, description, isOn, onToggle }: any) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div>
        <h3 className="font-medium text-gray-900 mb-1">{title}</h3>
        <p className="text-sm text-gray-500">{description}</p>
      </div>
      <button 
        onClick={onToggle}
        className="relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none"
        style={{ backgroundColor: isOn ? 'var(--color-brand-900)' : '#e5e7eb' }}
      >
        <span 
          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${isOn ? 'translate-x-5' : 'translate-x-0'}`} 
        />
      </button>
    </div>
  );
}
