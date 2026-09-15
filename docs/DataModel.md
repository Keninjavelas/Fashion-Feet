# Database Schema & Data Model

## Database Engine
- **Engine**: SQLite / Prisma ORM (`prisma/schema.prisma`)

## Core Entities

```prisma
model User {
  id            String    @id @default(uuid())
  email         String    @unique
  name          String?
  password      String?
  role          String    @default("CUSTOMER") // CUSTOMER | ADMIN
  phone         String?
  size          String?   // Saved footwear size preference e.g. "UK 7 / EU 40"
  active        Boolean   @default(true)
  mfaSecret     String?   // TOTP MFA secret key
  mfaEnabled    Boolean   @default(false)
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  wishlist      Wishlist[]
  enquiries     Enquiry[]
}

model Product {
  id                  String         @id @default(uuid())
  productCode         String?        // SKU identifier e.g. "FF-JUTTI-982"
  title               String
  description         String
  price               Float
  discount            Float          @default(0)
  category            String         // Wedding | Festive | Casual | Office | Luxury | Heritage
  gender              String         @default("Women") // Men | Women | Unisex
  material            String?
  colors              String?
  occasion            String?
  care                String?
  sizeGuide           String?
  featured            Boolean        @default(false)
  isNewArrival        Boolean        @default(false)
  isBestSeller        Boolean        @default(false)
  isFestivalExclusive Boolean        @default(false)
  hidden              Boolean        @default(false)
  archived            Boolean        @default(false)
  collectionId        String?
  createdAt           DateTime       @default(now())
  updatedAt           DateTime       @updatedAt
  images              ProductImage[]
  enquiries           Enquiry[]
}

model ProductImage {
  id        String   @id @default(uuid())
  url       String
  productId String
  product   Product  @relation(fields: [productId], references: [id], onDelete: Cascade)
}

model Collection {
  id          String   @id @default(uuid())
  name        String
  description String?
  banner      String?
  status      String   @default("DRAFT") // DRAFT | PUBLISHED
}

model Enquiry {
  id        String   @id @default(uuid())
  productId String?
  userId    String?
  name      String
  email     String
  phone     String?
  size      String?
  message   String
  status    String   @default("PENDING") // PENDING | CONTACTED | COMPLETED | CLOSED
  createdAt DateTime @default(now())
}

model MediaAsset {
  id        String   @id @default(uuid())
  name      String
  filename  String
  url       String
  type      String   // IMAGE | VIDEO | DOCUMENT
  folder    String   @default("misc")
  status    String   @default("PUBLISHED") // DRAFT | PUBLISHED
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model SiteSetting {
  id    String @id @default(uuid())
  key   String @unique
  value String
}

model Festival {
  id          String   @id @default(uuid())
  name        String
  slug        String   @unique
  theme       String   // diwali | holi | eid | christmas | lohri | baisakhi | default
  startDate   DateTime?
  endDate     DateTime?
  enabled     Boolean  @default(false)
}
```
