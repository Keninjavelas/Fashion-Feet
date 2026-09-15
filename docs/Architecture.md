# Fashion Feet Architecture Specification

## Overview
**Fashion Feet** is built as an exclusive luxury Punjabi footwear digital experience. The application separates the customer-facing **Storefront** from the internal **Admin Application**.

## Tech Stack & Core Infrastructure

- **Framework**: Next.js 15+ (App Router)
- **Language**: TypeScript (`strict: true`)
- **Database ORM**: Prisma ORM with SQLite (`prisma/dev.db`)
- **Authentication**: NextAuth.js v5 (JWT sessions with Credentials provider)
- **Styling**: Tailwind CSS v4 with custom CSS variables & theme tokens
- **Animations**: Framer Motion, HTML5 Canvas particle systems, CSS keyframes
- **Icons**: Lucide React

## Application Boundaries & Principles

1. **Boutique Selection Model (No Online Cart / Checkout)**:
   - Fashion Feet operates as an exclusive luxury boutique showroom where footwear is experienced in person for fit, feel, and finish.
   - Replaced e-commerce checkout with direct **Product Fitting Enquiries** and **Wishlist / Favorites**.

2. **Server/Client Component Separation**:
   - Page layouts (`StorefrontLayout.tsx`) are async Server Components executing Prisma queries on the server.
   - Interactive widgets (`EnquiryModal`, `SearchModal`, `InteractiveSizeFinderSection`) are Client Components.
   - DB adapters (`@prisma/adapter-better-sqlite3`) are isolated from Client Component bundles to prevent runtime errors.

3. **Global Seasonal Experience Engine**:
   - Seasonal presets (`normal`, `diwali`, `holi`, `eid`, `christmas`, `lohri`, `baisakhi`) apply via `data-theme` attribute on the root storefront wrapper.
   - Dynamic particle overlay canvases render themed ambient effects.
