import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { StorefrontLayout } from "@/components/layout/StorefrontLayout";

export default function TermsOfService() {
  return (
    <StorefrontLayout>
      <div className="pt-32 pb-24 min-h-screen bg-[var(--color-brand-50)]">
        <div className="max-w-4xl mx-auto px-4 md:px-8">
          <Breadcrumbs items={[{ label: "Terms of Service" }]} />
          <div className="bg-white p-8 md:p-12 shadow-sm border border-black/5 mt-8">
            <h1 className="font-serif text-4xl text-[var(--color-brand-900)] mb-8">Terms of Service</h1>
            <div className="prose max-w-none text-gray-600 space-y-6">
              <p>Last updated: {new Date().toLocaleDateString()}</p>
              <h2 className="text-xl font-bold text-[var(--color-brand-900)] mt-8">1. Acceptance of Terms</h2>
              <p>
                By accessing and using this website, you accept and agree to be bound by the terms and provision of this agreement. 
                In addition, when using this website's particular services, you shall be subject to any posted guidelines or rules applicable to such services.
              </p>
              <h2 className="text-xl font-bold text-[var(--color-brand-900)] mt-8">2. Description of Service</h2>
              <p>
                Fashion Feet provides users with access to a rich collection of resources, including various communications tools, 
                forums, shopping services, and personalized content. You also understand and agree that the Service may include 
                advertisements and that these advertisements are necessary for Fashion Feet to provide the Service.
              </p>
              <h2 className="text-xl font-bold text-[var(--color-brand-900)] mt-8">3. User Registration</h2>
              <p>
                In consideration of your use of the Service, you agree to: (a) provide true, accurate, current and complete information about yourself 
                as prompted by the Service's registration form and (b) maintain and promptly update the Registration Data to keep it true, accurate, 
                current and complete.
              </p>
              <h2 className="text-xl font-bold text-[var(--color-brand-900)] mt-8">4. Products and Pricing</h2>
              <p>
                All products and prices are subject to change without notice. We reserve the right at any time to modify or discontinue 
                the Service (or any part or content thereof) without notice at any time. We shall not be liable to you or to any third-party 
                for any modification, price change, suspension or discontinuance of the Service.
              </p>
              
              <div className="mt-12 p-6 bg-[var(--color-brand-50)] text-sm italic">
                Note: This is a placeholder Terms of Service template for demonstration purposes. Before deploying to production, 
                this document should be reviewed and updated by legal counsel.
              </div>
            </div>
          </div>
        </div>
      </div>
    </StorefrontLayout>
  );
}
