// Shared watch and image utility functions

export const DEFAULT_WATCH_IMAGE =
  "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=900&auto=format&fit=crop&q=80";

export const CURATED_WATCH_IMAGES = {
  "watch-001":
    "https://images.unsplash.com/photo-1523170335258-f5ed11844a49?w=900&auto=format&fit=crop&q=80",
  "watch-002":
    "https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=900&auto=format&fit=crop&q=80",
  "watch-003":
    "https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=900&auto=format&fit=crop&q=80",
  "watch-004":
    "https://images.unsplash.com/photo-1547996160-81dfa63595aa?w=900&auto=format&fit=crop&q=80",
  "watch-005":
    "https://images.unsplash.com/photo-1587836374828-4dbafa94cf0e?w=900&auto=format&fit=crop&q=80",
  "watch-006":
    "https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=900&auto=format&fit=crop&q=80",
  "watch-007":
    "https://images.unsplash.com/photo-1539874754764-5a96559165b0?w=900&auto=format&fit=crop&q=80",
  "watch-008":
    "https://images.unsplash.com/photo-1542496658-e33a6d0d50f6?w=900&auto=format&fit=crop&q=80",
  "watch-009":
    "https://images.unsplash.com/photo-1614164185128-e4ec99c436d7?w=900&auto=format&fit=crop&q=80",
  "watch-010":
    "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=900&auto=format&fit=crop&q=80",
  "watch-011":
    "https://images.unsplash.com/photo-1509048191080-d2984bad6ae5?w=900&auto=format&fit=crop&q=80",
  "watch-012":
    "https://images.unsplash.com/photo-1434056886845-dac89ffe9b56?w=900&auto=format&fit=crop&q=80",
};

/**
 * Returns the primary image for a product.
 * Consistent across cards, details, cart, and checkout.
 */
export function getProductImage(product) {
  if (!product) return DEFAULT_WATCH_IMAGE;

  // 1. Uploaded images array
  if (Array.isArray(product.images) && product.images.length > 0) {
    const first = product.images[0];
    if (typeof first === "string" && first.trim()) return first.trim();
    if (first && typeof first.src === "string" && first.src.trim()) return first.src.trim();
  }

  // 2. Direct single image field
  if (typeof product.image === "string" && product.image.trim()) {
    return product.image.trim();
  }

  // 3. Known ID curated fallback
  if (product.id && CURATED_WATCH_IMAGES[product.id]) {
    return CURATED_WATCH_IMAGES[product.id];
  }

  return DEFAULT_WATCH_IMAGE;
}

/**
 * Returns all available images for a product gallery.
 * Always includes the primary product image first to ensure parity with cards.
 */
export function getProductImages(product) {
  if (!product) return [DEFAULT_WATCH_IMAGE];

  let list = [];

  if (Array.isArray(product.images) && product.images.length > 0) {
    list = product.images
      .map((item) => {
        if (typeof item === "string" && item.trim()) return item.trim();
        if (item && typeof item.src === "string" && item.src.trim()) return item.src.trim();
        return null;
      })
      .filter(Boolean);
  }

  if (list.length === 0 && typeof product.image === "string" && product.image.trim()) {
    list = [product.image.trim()];
  }

  if (list.length === 0 && product.id && CURATED_WATCH_IMAGES[product.id]) {
    list = [CURATED_WATCH_IMAGES[product.id]];
  }

  if (list.length === 0) {
    list = [DEFAULT_WATCH_IMAGE];
  }

  return list;
}

/**
 * Calculates effective price after discount.
 */
export function getFinalPrice(product) {
  if (!product) return 0;
  const rawPrice = Number(product.price) || 0;
  const discount = Number(product.discountPercent) || 0;
  if (product.offerActive && discount > 0) {
    return Math.round(rawPrice * (1 - discount / 100));
  }
  return rawPrice;
}

/**
 * Checks if a product has an active discount.
 */
export function hasActiveDiscount(product) {
  return Boolean(product && product.offerActive && Number(product.discountPercent) > 0);
}

/**
 * Format currency in Bangladeshi Taka
 */
export function formatTaka(amount) {
  const num = Number(amount) || 0;
  return `৳${num.toLocaleString("en-BD")}`;
}

/**
 * Safe image fallback that prevents infinite onError loops.
 */
export function handleImageFallback(event, fallback = DEFAULT_WATCH_IMAGE) {
  const target = event.currentTarget;
  if (target.dataset.hasFailed) return;
  target.dataset.hasFailed = "true";
  target.src = fallback;
}
