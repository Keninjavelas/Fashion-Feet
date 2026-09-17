import { StorefrontLayout } from "@/components/layout/StorefrontLayout";

export const metadata = {
  title: "Accessibility Statement | Fashion Feet",
  description: "Fashion Feet is committed to ensuring digital accessibility for all customers."
};

export default function AccessibilityPage() {
  return (
    <StorefrontLayout>
      <div className="pt-32 pb-24 min-h-screen bg-[var(--theme-color-bg)] text-[var(--theme-color-text)]">
        <div className="container mx-auto px-4 md:px-8 max-w-4xl space-y-8">
          <div className="text-center space-y-3">
            <span className="text-xs uppercase font-bold tracking-widest text-[var(--theme-color-accent)]">Inclusive Experience</span>
            <h1 className="font-serif text-4xl md:text-5xl font-bold">Accessibility Statement</h1>
            <p className="text-[var(--theme-color-text-muted)] text-sm max-w-xl mx-auto">
              Fashion Feet is dedicated to making our web storefront accessible to all customers, including people with visual, hearing, motor, or cognitive disabilities.
            </p>
          </div>

          <div className="bg-[var(--theme-color-surface)] p-8 md:p-12 rounded-3xl border border-[var(--theme-color-border)] shadow-md space-y-6 text-sm leading-relaxed">
            <section className="space-y-3">
              <h2 className="font-serif text-2xl font-bold text-[var(--theme-color-text)]">Our Conformance Standards</h2>
              <p className="text-[var(--theme-color-text-muted)]">
                We strive to conform to the <strong>Web Content Accessibility Guidelines (WCAG) 2.1 Level AA</strong> standards. Our storefront incorporates accessible contrast ratios, visible keyboard focus indicators, screen-reader landmark tags, and reduced-motion user preferences.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="font-serif text-2xl font-bold text-[var(--theme-color-text)]">Key Accessibility Features</h2>
              <ul className="list-disc list-inside space-y-2 text-[var(--theme-color-text-muted)]">
                <li><strong>Keyboard Operability:</strong> Full keyboard navigation across top navigation, seasonal theme selectors, search overlays, and product enquiry modals.</li>
                <li><strong>Visible Focus Rings:</strong> High-contrast focus outlines (`focus-visible`) for all interactive buttons and links.</li>
                <li><strong>Contrast Compliance:</strong> Handcrafted color tokens tailored across all 7 seasonal experiences (Diwali, Holi, Eid, Christmas, Lohri, Baisakhi, Normal Luxury Atelier) to ensure high text contrast.</li>
                <li><strong>Reduced Motion Support:</strong> Disables nonessential animations automatically when `prefers-reduced-motion: reduce` is enabled on your OS.</li>
              </ul>
            </section>

            <section className="space-y-3">
              <h2 className="font-serif text-2xl font-bold text-[var(--theme-color-text)]">Feedback & Assistance</h2>
              <p className="text-[var(--theme-color-text-muted)]">
                If you encounter any accessibility barriers while browsing Fashion Feet or need assistance submitting a product enquiry, please reach our concierge team through the <a href="/contact" className="text-[var(--theme-color-jewel)] underline font-bold">contact form</a>.
              </p>
            </section>
          </div>
        </div>
      </div>
    </StorefrontLayout>
  );
}
