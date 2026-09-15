"use client";

import { useState } from "react";
import { CheckCircle2, Loader2 } from "lucide-react";
import { updateNotifications } from "../actions";
import { useRouter } from "next/navigation";

export default function NotificationsClient({ initialData }: { initialData: any }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const defaultNotifications = {
    newCollections: true,
    festivals: true,
    discounts: true,
    stores: true,
    restock: false,
  };

  const [notifications, setNotifications] = useState(initialData || defaultNotifications);

  const toggle = (key: keyof typeof notifications) => {
    setNotifications({ ...notifications, [key]: !notifications[key] });
  };

  const handleSave = async () => {
    setLoading(true);
    const data = JSON.stringify(notifications);
    const res = await updateNotifications(data);
    setLoading(false);
    if (res.success) {
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
      router.refresh();
    } else {
      alert(res.error);
    }
  };

  return (
    <div className="space-y-8 max-w-3xl relative">
      {success && (
        <div className="absolute -top-16 right-0 bg-green-50 text-green-700 px-4 py-2 text-sm flex items-center gap-2 border border-green-200 shadow-sm animate-in fade-in slide-in-from-top-2 z-10">
          <CheckCircle2 className="w-4 h-4" /> Notifications updated
        </div>
      )}
      
      <div className="border-b border-black/5 pb-4">
        <h1 className="font-serif text-3xl md:text-4xl text-[var(--color-brand-900)] mb-2">Notifications</h1>
        <p className="text-gray-600">Control how and when we contact you.</p>
      </div>

      <div className="bg-white border border-black/5 shadow-sm">
        <div className="p-6 md:p-8 space-y-6">
          <NotificationToggle 
            title="New Collection Launches" 
            description="Be the first to know when we release new Jutti designs." 
            isOn={notifications.newCollections} 
            onToggle={() => toggle("newCollections")} 
          />
          <hr className="border-black/5" />
          <NotificationToggle 
            title="Festival Collections" 
            description="Alerts for special festival themes like Diwali, Holi, and Eid." 
            isOn={notifications.festivals} 
            onToggle={() => toggle("festivals")} 
          />
          <hr className="border-black/5" />
          <NotificationToggle 
            title="Special Discounts" 
            description="Exclusive offers, early access, and seasonal sales." 
            isOn={notifications.discounts} 
            onToggle={() => toggle("discounts")} 
          />
          <hr className="border-black/5" />
          <NotificationToggle 
            title="New Store Openings" 
            description="Get notified when we open physical boutiques near you." 
            isOn={notifications.stores} 
            onToggle={() => toggle("stores")} 
          />
          <hr className="border-black/5" />
          <NotificationToggle 
            title="Back in Stock" 
            description="Updates on products you've favorited that are restocked." 
            isOn={notifications.restock} 
            onToggle={() => toggle("restock")} 
          />
        </div>
        
        <div className="p-6 md:p-8 pt-0 mt-4">
          <button 
            onClick={handleSave}
            disabled={loading}
            className="px-8 py-3 bg-[var(--color-brand-900)] text-white font-medium uppercase tracking-widest text-sm hover:bg-[var(--color-accent-gold)] transition-colors disabled:opacity-70 flex items-center justify-center min-w-[200px]"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Save Preferences"}
          </button>
        </div>
      </div>
    </div>
  );
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
