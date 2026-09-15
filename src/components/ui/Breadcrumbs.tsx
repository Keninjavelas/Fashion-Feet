import Link from 'next/link';
import { ChevronRight } from 'lucide-react';

interface BreadcrumbItem {
  label: string;
  href?: string;
}

export function Breadcrumbs({ items }: { items: BreadcrumbItem[] }) {
  return (
    <nav aria-label="Breadcrumb" className="mb-4">
      <ol className="flex items-center space-x-2 text-sm text-foreground/60">
        <li>
          <Link href="/" className="hover:text-[var(--color-brand-900)] transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--color-accent-gold)] rounded-sm">
            Home
          </Link>
        </li>
        {items.map((item, index) => (
          <li key={index} className="flex items-center space-x-2">
            <ChevronRight className="w-4 h-4 opacity-50" />
            {item.href ? (
              <Link href={item.href} className="hover:text-[var(--color-brand-900)] transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--color-accent-gold)] rounded-sm">
                {item.label}
              </Link>
            ) : (
              <span className="text-foreground/80 font-medium" aria-current="page">
                {item.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
