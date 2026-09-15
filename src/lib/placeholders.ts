/**
 * Local, neutral stand-ins used when no managed media asset is attached yet.
 *
 * These deliberately contain no photography. Storefront imagery must never fall
 * back to third-party stock photos: doing so both misrepresents the product and
 * makes the storefront depend on an external host at render time. Real product
 * and homepage imagery is attached through the Media Library.
 */
export const PLACEHOLDER_PRODUCT_IMAGE = "/placeholders/product-placeholder.svg";

export const PLACEHOLDER_HOMEPAGE_IMAGE = "/placeholders/homepage-placeholder.svg";
