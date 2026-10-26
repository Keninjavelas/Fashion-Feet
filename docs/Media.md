# Media and brand assets

The production admin upload endpoint lives only in `apps/admin` and uses Vercel Blob. The shared `MediaAsset` table stores asset metadata and URLs. `src/lib/media.ts` resolves published assets and identifies where a URL is used before replacement or deletion. An upload alone does not place an image on a public page; a published product, collection, festival, setting, or Studio section must reference it.

The official brand logo is checked into `public/branding/fashion-feet-official.png` and rendered by `BrandLogo`. Two user-supplied past-exhibition photographs are checked into `public/exhibitions/` and rendered by `PastExhibitions`. These are authentic exhibition images; do not substitute them for product-specific catalogue photography.

Local SQLite development can use local uploads, but production must retain the Blob integration and its `BLOB_READ_WRITE_TOKEN` on the admin Vercel project. Never commit upload credentials or user-uploaded media from the local `public/uploads/` directory.
