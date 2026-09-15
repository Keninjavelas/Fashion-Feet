import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { StorefrontLayout } from "@/components/layout/StorefrontLayout";

export default function PrivacyPolicy() {
  return (
    <StorefrontLayout>
      <div className="pt-32 pb-24 min-h-screen bg-[var(--color-brand-50)]">
        <div className="max-w-4xl mx-auto px-4 md:px-8">
          <Breadcrumbs items={[{ label: "Privacy Policy" }]} />
          <div className="bg-white p-8 md:p-12 shadow-sm border border-black/5 mt-8">
            <h1 className="font-serif text-4xl text-[var(--color-brand-900)] mb-8">Privacy Policy</h1>
            <div className="prose max-w-none text-gray-600 space-y-6">
              <p>Last updated: {new Date().toLocaleDateString()}</p>
              <h2 className="text-xl font-bold text-[var(--color-brand-900)] mt-8">1. Introduction</h2>
              <p>
                Welcome to Fashion Feet. We respect your privacy and are committed to protecting your personal data. 
                This privacy policy will inform you as to how we look after your personal data when you visit our 
                website and tell you about your privacy rights and how the law protects you.
              </p>
              <h2 className="text-xl font-bold text-[var(--color-brand-900)] mt-8">2. The data we collect about you</h2>
              <p>
                Personal data, or personal information, means any information about an individual from which that person can be identified.
                We may collect, use, store and transfer different kinds of personal data about you which we have grouped together as follows:
              </p>
              <ul className="list-disc pl-5 space-y-2">
                <li><strong>Identity Data</strong> includes first name, last name, username or similar identifier.</li>
                <li><strong>Contact Data</strong> includes billing address, delivery address, email address and telephone numbers.</li>
                <li><strong>Financial Data</strong> includes payment card details (processed securely by our payment providers).</li>
                <li><strong>Transaction Data</strong> includes details about payments to and from you and other details of products you have purchased from us.</li>
              </ul>
              <h2 className="text-xl font-bold text-[var(--color-brand-900)] mt-8">3. How we use your personal data</h2>
              <p>
                We will only use your personal data when the law allows us to. Most commonly, we will use your personal data in the following circumstances:
              </p>
              <ul className="list-disc pl-5 space-y-2">
                <li>Where we need to perform the contract we are about to enter into or have entered into with you.</li>
                <li>Where it is necessary for our legitimate interests (or those of a third party) and your interests and fundamental rights do not override those interests.</li>
                <li>Where we need to comply with a legal obligation.</li>
              </ul>
              
              <div className="mt-12 p-6 bg-[var(--color-brand-50)] text-sm italic">
                Note: This is a placeholder Privacy Policy template for demonstration purposes. Before deploying to production, 
                this document should be reviewed and updated by legal counsel.
              </div>
            </div>
          </div>
        </div>
      </div>
    </StorefrontLayout>
  );
}
