import { useState, useEffect, useRef, memo } from "react";
import { Link } from "react-router-dom";
import { useCart } from "../context/useCart";
import { useToast } from "../context/useToast";
import {
  getProductImage,
  getProductImages,
  getFinalPrice,
  hasActiveDiscount,
  formatTaka,
  handleImageFallback,
} from "../utils/watchHelpers";

function ProductCardComponent({ watch, index = 0 }) {
  const { addToCart } = useCart();
  const { showToast } = useToast();

  const [hasEntered, setHasEntered] = useState(
    () => typeof IntersectionObserver === "undefined"
  );
  const [isAdding, setIsAdding] = useState(false);
  const [hoveredPhotoIdx, setHoveredPhotoIdx] = useState(0);

  const cardRef = useRef(null);
  const spotlightRef = useRef(null);

  const staggerDelay = Math.min(240, (index % 6) * 40);

  useEffect(() => {
    const el = cardRef.current;
    if (!el || hasEntered) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setHasEntered(true);
          observer.unobserve(el);
        }
      },
      { threshold: 0.08, rootMargin: "70px 0px" }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [hasEntered]);

  const gallery = getProductImages(watch);
  const primaryImage = getProductImage(watch);
  const activeImage = gallery[hoveredPhotoIdx] || primaryImage;
  const finalPrice = getFinalPrice(watch);
  const hasOffer = hasActiveDiscount(watch);
  const isOutOfStock = typeof watch.stock === "number" && watch.stock <= 0;

  // Interactive Liquid Glass cursor spotlight (zero React state re-renders)
  const handlePointerMove = (e) => {
    if (!cardRef.current || !spotlightRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    spotlightRef.current.style.background = `radial-gradient(280px circle at ${x}px ${y}px, rgba(247, 223, 139, 0.16), rgba(212, 175, 55, 0.05) 45%, transparent 75%)`;
    spotlightRef.current.style.opacity = "1";
  };

  const handlePointerLeave = () => {
    if (spotlightRef.current) {
      spotlightRef.current.style.opacity = "0";
    }
    setHoveredPhotoIdx(0);
  };

  const handlePointerEnter = () => {
    if (gallery.length > 1) {
      setHoveredPhotoIdx(1);
    }
  };

  const handleCardAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (isOutOfStock) {
      showToast({
        title: "Out of Stock",
        message: `${watch.name} is currently out of stock.`,
        link: null,
      });
      return;
    }

    setIsAdding(true);
    addToCart({
      id: watch.id,
      name: watch.name,
      price: finalPrice,
      originalPrice: Number(watch.price) || finalPrice,
      discountPercent: hasOffer ? Number(watch.discountPercent) || 0 : 0,
      image: primaryImage,
      images: gallery,
      stock: typeof watch.stock === "number" ? watch.stock : 99,
      quantity: 1,
    });

    showToast({
      title: "Added to Bag",
      message: `${watch.name} added to your selection.`,
      link: "/cart",
      linkText: "View Bag",
    });

    setTimeout(() => {
      setIsAdding(false);
    }, 500);
  };

  return (
    <article
      ref={cardRef}
      onPointerMove={handlePointerMove}
      onPointerEnter={handlePointerEnter}
      onPointerLeave={handlePointerLeave}
      style={{
        transitionDelay: hasEntered ? "0ms" : `${staggerDelay}ms`,
      }}
      className={`liquid-glass dock-card-hover group relative flex flex-col justify-between overflow-hidden rounded-2xl p-3 sm:p-4 ${
        hasEntered
          ? "opacity-100 translate-y-0"
          : "opacity-0 translate-y-6 pointer-events-none"
      }`}
    >
      {/* Top Specular Liquid Glass Edge Highlight */}
      <div
        className="pointer-events-none absolute inset-x-4 top-0 z-10 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent"
        aria-hidden="true"
      />

      {/* Interactive Cursor-Tracking Liquid Glass Spotlight */}
      <div
        ref={spotlightRef}
        className="pointer-events-none absolute inset-0 z-0 opacity-0 transition-opacity duration-300"
        aria-hidden="true"
      />

      <div className="relative z-10">
        {/* Product Media Frame */}
        <div className="relative aspect-square w-full overflow-hidden rounded-xl border border-white/10 bg-[#0b0b0e]">
          <Link
            to={`/product/${watch.id}`}
            aria-label={`View ${watch.name} details`}
            className="block h-full w-full outline-none focus-visible:ring-2 focus-visible:ring-[#d4af37]"
          >
            <img
              src={activeImage}
              alt={watch.name}
              loading="lazy"
              onError={handleImageFallback}
              className="h-full w-full object-cover object-center transition-all duration-700 ease-out group-hover:scale-110"
            />
          </Link>

          {/* Top Left Discount Pill (Liquid Glass Red/Gold) */}
          {hasOffer && (
            <span className="absolute left-2.5 top-2.5 rounded-full border border-white/25 bg-gradient-to-r from-red-600/90 to-amber-600/90 px-2.5 py-0.5 text-[10px] font-extrabold tracking-wider text-white shadow-lg backdrop-blur-md">
              −{watch.discountPercent}%
            </span>
          )}

          {/* Top Right Rating / Sold Out Pill */}
          {isOutOfStock ? (
            <span className="absolute right-2.5 top-2.5 rounded-full border border-white/15 bg-black/80 px-2.5 py-0.5 text-[10px] font-semibold text-gray-300 backdrop-blur-md">
              Sold Out
            </span>
          ) : (
            <span className="absolute right-2.5 top-2.5 flex items-center gap-1 rounded-full border border-white/15 bg-black/65 px-2 py-0.5 text-[10px] font-bold text-[#f7df8b] backdrop-blur-md">
              <span>★</span>
              <span>{watch.rating || "4.9"}</span>
            </span>
          )}

          {/* Multi-Angle Dots Indicator on Hover */}
          {gallery.length > 1 && (
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex items-center gap-1.5 rounded-full bg-black/55 px-2 py-1 opacity-0 backdrop-blur-md transition-opacity duration-300 group-hover:opacity-100">
              {gallery.slice(0, 3).map((_, idx) => (
                <button
                  key={idx}
                  type="button"
                  aria-label={`Preview angle ${idx + 1}`}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setHoveredPhotoIdx(idx);
                  }}
                  className={`h-1.5 rounded-full transition-all ${
                    hoveredPhotoIdx === idx
                      ? "w-4 bg-[#f7df8b]"
                      : "w-1.5 bg-white/50 hover:bg-white"
                  }`}
                />
              ))}
            </div>
          )}
        </div>

        {/* Product Information */}
        <div className="mt-3.5">
          {/* Brand & Category Row */}
          <div className="flex items-center justify-between gap-2">
            <span className="text-[10px] font-extrabold uppercase tracking-[2px] text-[#d4af37] truncate">
              {watch.brand || "TIMELUX"}
            </span>
            <span className="rounded-full border border-white/10 bg-white/[0.04] px-2 py-0.5 text-[9px] font-medium text-gray-300 truncate">
              {watch.category || "Luxury"}
            </span>
          </div>

          {/* Product Name: 2 lines reserved */}
          <h3 className="mt-1.5 h-10 line-clamp-2 text-xs sm:text-sm font-semibold leading-5 text-[#f7f4ed] transition-colors group-hover:text-[#f7df8b]">
            <Link
              to={`/product/${watch.id}`}
              className="outline-none focus-visible:underline"
            >
              {watch.name}
            </Link>
          </h3>

          {/* Pricing Row */}
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-base sm:text-lg font-extrabold text-[#f7df8b]">
              {formatTaka(finalPrice)}
            </span>
            {hasOffer && (
              <span className="text-xs text-gray-400 line-through">
                {formatTaka(watch.price)}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Action CTA Baseline */}
      <div className="relative z-10 mt-3.5 flex items-center gap-2 pt-1">
        <button
          type="button"
          onClick={handleCardAddToCart}
          disabled={isOutOfStock || isAdding}
          aria-label={
            isOutOfStock
              ? `${watch.name} is out of stock`
              : `Add ${watch.name} to cart`
          }
          className={`flex flex-1 items-center justify-center gap-1.5 rounded-xl border py-2.5 text-center text-xs font-extrabold tracking-wider transition-all duration-300 outline-none focus-visible:ring-2 focus-visible:ring-[#d4af37] ${
            isOutOfStock
              ? "cursor-not-allowed border-white/10 bg-white/5 text-gray-500"
              : isAdding
              ? "border-[#f7df8b] bg-[#f7df8b] text-[#070709] scale-[0.98]"
              : "border-[#d4af37]/80 bg-gradient-to-r from-[#f7df8b] via-[#d4af37] to-[#b58e31] text-[#070709] shadow-[0_4px_15px_rgba(212,175,55,0.25),inset_0_1px_1px_rgba(255,255,255,0.6)] hover:shadow-[0_6px_22px_rgba(212,175,55,0.45)] hover:brightness-110 active:scale-[0.97]"
          }`}
        >
          {isOutOfStock ? "OUT OF STOCK" : isAdding ? "ADDED TO BAG ✓" : "ADD TO CART"}
        </button>

        <Link
          to={`/product/${watch.id}`}
          aria-label={`Inspect ${watch.name}`}
          title="View Full Specifications"
          className="liquid-orb flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-xs text-gray-200 transition-transform duration-200 hover:scale-110 hover:text-[#f7df8b] hover:border-[#d4af37]/60"
        >
          ↗
        </Link>
      </div>
    </article>
  );
}

export const ProductCard = memo(ProductCardComponent);
export default ProductCard;
