export const metadata = {
  title: "Fashion Feet Admin Console",
  description: "Internal Executive Management System"
};

export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#12080C] font-sans antialiased text-[#F6F2EB]">
      {children}
    </div>
  );
}
