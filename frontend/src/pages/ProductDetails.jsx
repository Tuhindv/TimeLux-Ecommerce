import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useCart } from "../context/useCart";
import { useProducts } from "../context/useProducts";
import { useToast } from "../context/useToast";
import {
  getProductImage,
  getProductImages,
  getFinalPrice,
  hasActiveDiscount,
  formatTaka,
  handleImageFallback,
  DEFAULT_WATCH_IMAGE,
} from "../utils/watchHelpers";

export default function ProductDetails() {
  const { id } = useParams();
  return <ProductDetailsContent key={id} id={id} />;
}

function ProductDetailsContent({ id }) {
  const navigate = useNavigate();
  const { addToCart, buyNow } = useCart();
  const { products } = useProducts();
  const { showToast } = useToast();

  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [showAllImages, setShowAllImages] = useState(false);

  // Fullscreen Gallery States
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);

  const dragStart = useRef({ x: 0, y: 0 });
  const imagePositionStart = useRef({ x: 0, y: 0 });
  const pointers = useRef(new Map());
  const pinchStart = useRef(null);
  const previousFocusRef = useRef(null);

  const product = products.find((item) => item.id === id);

  // Authoritative images list
  const images = product ? getProductImages(product) : [DEFAULT_WATCH_IMAGE];
  const safeSelectedImage = images[selectedImage] || images[0] || DEFAULT_WATCH_IMAGE;

  // Scroll to top and update document title
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
    if (product?.name) {
      document.title = `${product.name} — TimeLux Luxury Watches`;
    } else {
      document.title = "Watch Details — TimeLux";
    }
  }, [id, product?.name]);

  // Body scroll lock & focus management for Fullscreen Gallery
  useEffect(() => {
    if (isGalleryOpen) {
      previousFocusRef.current = document.activeElement;
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";

      return () => {
        document.body.style.overflow = originalOverflow;
        if (previousFocusRef.current && typeof previousFocusRef.current.focus === "function") {
          previousFocusRef.current.focus();
        }
      };
    }
  }, [isGalleryOpen]);

  // Reset Zoom
  const resetZoom = useCallback(() => {
    setZoom(1);
    setPosition({ x: 0, y: 0 });
  }, []);

  // Reliable image switcher
  const goToImage = useCallback(
    (nextIndex) => {
      setSelectedImage(nextIndex);
      resetZoom();
    },
    [resetZoom]
  );

  // Open Fullscreen Gallery
  const openGallery = () => {
    resetZoom();
    setIsGalleryOpen(true);
  };

  // Close Fullscreen Gallery
  const closeGallery = useCallback(() => {
    setIsGalleryOpen(false);
    setIsDragging(false);
    pointers.current.clear();
    pinchStart.current = null;
    resetZoom();
  }, [resetZoom]);

  // Zoom In / Out
  const zoomIn = () => setZoom((prev) => Math.min(4, prev + 0.5));
  const zoomOut = () => {
    setZoom((prev) => {
      const next = Math.max(1, prev - 0.5);
      if (next === 1) setPosition({ x: 0, y: 0 });
      return next;
    });
  };

  // Mouse Wheel Zoom
  const handleWheel = (e) => {
    e.preventDefault();
    setZoom((prev) => {
      const next = e.deltaY < 0 ? Math.min(4, prev + 0.25) : Math.max(1, prev - 0.25);
      if (next === 1) setPosition({ x: 0, y: 0 });
      return next;
    });
  };

  // Pointer Down for drag / pinch
  const handlePointerDown = (e) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });

    if (pointers.current.size === 2) {
      const points = Array.from(pointers.current.values());
      const distance = Math.hypot(points[0].x - points[1].x, points[0].y - points[1].y);
      pinchStart.current = { distance, zoom };
      setIsDragging(false);
      return;
    }

    if (zoom > 1) {
      dragStart.current = { x: e.clientX, y: e.clientY };
      imagePositionStart.current = position;
      setIsDragging(true);
    }
  };

  const handlePointerMove = (e) => {
    if (!pointers.current.has(e.pointerId)) return;
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });

    if (pointers.current.size === 2 && pinchStart.current) {
      const points = Array.from(pointers.current.values());
      const distance = Math.hypot(points[0].x - points[1].x, points[0].y - points[1].y);
      const scale = distance / pinchStart.current.distance;
      const nextZoom = Math.max(1, Math.min(4, pinchStart.current.zoom * scale));
      setZoom(nextZoom);
      if (nextZoom === 1) setPosition({ x: 0, y: 0 });
      return;
    }

    if (isDragging && zoom > 1) {
      setPosition({
        x: imagePositionStart.current.x + (e.clientX - dragStart.current.x),
        y: imagePositionStart.current.y + (e.clientY - dragStart.current.y),
      });
    }
  };

  const handlePointerUp = (e) => {
    pointers.current.delete(e.pointerId);
    if (pointers.current.size < 2) pinchStart.current = null;
    setIsDragging(false);
  };

  // Keyboard navigation inside gallery
  useEffect(() => {
    if (!isGalleryOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        closeGallery();
      } else if (e.key === "+" || e.key === "=") {
        zoomIn();
      } else if (e.key === "-") {
        zoomOut();
      } else if (e.key === "ArrowRight" && images.length > 0) {
        goToImage((selectedImage + 1) % images.length);
      } else if (e.key === "ArrowLeft" && images.length > 0) {
        goToImage(selectedImage === 0 ? images.length - 1 : selectedImage - 1);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isGalleryOpen, images.length, selectedImage, closeGallery, goToImage]);

  if (!product) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 py-16 text-center">
        <h1 className="text-2xl font-bold text-[#f5f1e8]">Timepiece Not Found</h1>
        <p className="mt-2 text-sm text-gray-400">
          The requested luxury watch may have been discontinued or moved.
        </p>
        <Link
          to="/#collection"
          className="mt-6 inline-flex rounded-lg bg-[#d4af37] px-6 py-3 text-xs font-bold tracking-wider text-[#09090b] transition hover:bg-white"
        >
          EXPLORE TIMEPIECES →
        </Link>
      </div>
    );
  }

  const finalPrice = getFinalPrice(product);
  const hasOffer = hasActiveDiscount(product);
  const isOutOfStock = typeof product.stock === "number" && product.stock <= 0;

  // Premium benefits from description
  const premiumBenefits = (product.description || "")
    .split(/\n+/)
    .map((item) => item.replace(/^[\s•\-*]+/, "").trim())
    .filter(Boolean);

  // Specifications
  const allSpecifications = [
    ["Brand", product.brand, product.showBrand],
    ["Model Number", product.modelNumber, product.showModelNumber],
    ["Color", product.color, product.showColor],
    ["Movement", product.movement, product.showMovement],
    ["Dial Size", product.dialSize, product.showDialSize],
    ["Strap Material", product.strapMaterial, product.showStrapMaterial],
    ["Waterproof", product.waterproof, product.showWaterproof],
    ["Warranty", product.warranty, product.showWarranty],
  ];

  const specifications = allSpecifications.filter(
    ([, value, isVisible]) =>
      isVisible !== false &&
      value !== undefined &&
      value !== null &&
      String(value).trim() !== ""
  );

  // Add to Cart
  const handleAddToCart = () => {
    if (isOutOfStock) {
      showToast({
        title: "Out of Stock",
        message: "This timepiece is currently out of stock.",
        link: null,
      });
      return;
    }

    if (quantity > product.stock) {
      showToast({
        title: "Stock Limit",
        message: `Only ${product.stock} units currently available.`,
        link: null,
      });
      return;
    }

    addToCart({
      id: product.id,
      name: product.name,
      price: finalPrice,
      originalPrice: Number(product.price) || finalPrice,
      discountPercent: hasOffer ? Number(product.discountPercent) || 0 : 0,
      image: safeSelectedImage,
      images: images,
      stock: typeof product.stock === "number" ? product.stock : 99,
      quantity,
    });

    showToast({
      title: "Added to Bag",
      message: `${quantity} × ${product.name} added to your bag.`,
      link: "/cart",
      linkText: "View Bag",
    });
  };

  // Buy Now
  const handleBuyNow = () => {
    if (isOutOfStock) {
      showToast({
        title: "Out of Stock",
        message: "This timepiece is currently out of stock.",
        link: null,
      });
      return;
    }

    if (quantity > product.stock) {
      showToast({
        title: "Stock Limit",
        message: `Only ${product.stock} units currently available.`,
        link: null,
      });
      return;
    }

    buyNow({
      id: product.id,
      name: product.name,
      price: finalPrice,
      originalPrice: Number(product.price) || finalPrice,
      discountPercent: hasOffer ? Number(product.discountPercent) || 0 : 0,
      image: safeSelectedImage,
      images: images,
      stock: typeof product.stock === "number" ? product.stock : 99,
      quantity,
    });

    navigate("/checkout?source=buy_now");
  };

  // WhatsApp order
  const handleWhatsApp = () => {
    const message = `Hello TimeLux! I would like to order:

Timepiece: ${product.name}
Unit Price: ${formatTaka(finalPrice)}
Quantity: ${quantity}
Total Amount: ${formatTaka(finalPrice * quantity)}`;

    window.open(
      `https://wa.me/8801311657122?text=${encodeURIComponent(message)}`,
      "_blank",
      "noopener,noreferrer"
    );
  };

  const visibleImages = showAllImages ? images : images.slice(0, 4);
  const hiddenCount = Math.max(0, images.length - 4);

  return (
    <>
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 md:py-10">
        {/* Navigation Breadcrumb */}
        <nav aria-label="Breadcrumb" className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <Link to="/" className="hover:text-[#d4af37] transition">Home</Link>
            <span>/</span>
            <Link to="/#collection" className="hover:text-[#d4af37] transition">Collection</Link>
            <span>/</span>
            <span className="text-[#d4af37] font-medium truncate max-w-[200px] sm:max-w-xs">{product.name}</span>
          </div>

          <Link
            to="/cart"
            className="inline-flex items-center gap-1.5 rounded-lg border border-[#d4af37]/30 bg-[#141416] px-3.5 py-1.5 text-xs font-semibold text-[#d4af37] transition hover:bg-[#d4af37] hover:text-[#09090b]"
          >
            Shopping Bag →
          </Link>
        </nav>

        {/* Product Details Grid */}
        <div className="grid items-start gap-8 lg:grid-cols-2 lg:gap-14">
          {/* Left Column: Gallery */}
          <div className="lg:sticky lg:top-8">
            {/* Primary Display Frame */}
            <div className="group relative aspect-square w-full overflow-hidden rounded-2xl border border-[#d4af37]/25 bg-[#141416] shadow-[0_8px_30px_rgba(0,0,0,0.5)]">
              {hasOffer && (
                <span className="absolute left-4 top-4 z-10 rounded-full bg-red-600 px-3 py-1 text-xs font-bold text-white shadow-md">
                  {product.discountPercent}% OFF
                </span>
              )}

              <button
                type="button"
                onClick={openGallery}
                aria-label="View high resolution image in fullscreen"
                className="block h-full w-full cursor-zoom-in outline-none"
              >
                <img
                  src={safeSelectedImage}
                  alt={product.name}
                  onError={handleImageFallback}
                  className="h-full w-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
                />
              </button>

              <button
                type="button"
                onClick={openGallery}
                className="absolute bottom-4 right-4 flex items-center gap-1.5 rounded-lg border border-white/10 bg-[#09090b]/80 px-3 py-1.5 text-xs text-gray-200 backdrop-blur-md transition hover:border-[#d4af37] hover:text-[#d4af37]"
              >
                <span>⛶</span> Zoom / Gallery
              </button>
            </div>

            {/* Thumbnail Row */}
            {images.length > 1 && (
              <div className="mt-3 flex gap-2.5 overflow-x-auto pb-2">
                {visibleImages.map((image, index) => (
                  <button
                    key={`${image}-${index}`}
                    type="button"
                    onClick={() => goToImage(index)}
                    aria-label={`Select product image ${index + 1}`}
                    className={`relative h-18 w-18 sm:h-20 sm:w-20 shrink-0 overflow-hidden rounded-xl border-2 transition-all ${
                      selectedImage === index
                        ? "border-[#d4af37] shadow-[0_0_12px_rgba(212,175,87,0.3)]"
                        : "border-white/10 hover:border-[#d4af37]/50 opacity-70 hover:opacity-100"
                    }`}
                  >
                    <img
                      src={image}
                      alt={`View ${index + 1}`}
                      onError={handleImageFallback}
                      className="h-full w-full object-cover"
                    />
                  </button>
                ))}

                {!showAllImages && hiddenCount > 0 && (
                  <button
                    type="button"
                    onClick={() => setShowAllImages(true)}
                    className="flex h-18 w-18 sm:h-20 sm:w-20 shrink-0 items-center justify-center rounded-xl border border-[#d4af37]/40 bg-[#141416] text-sm font-bold text-[#d4af37] transition hover:bg-[#d4af37] hover:text-[#09090b]"
                  >
                    +{hiddenCount}
                  </button>
                )}

                {showAllImages && images.length > 4 && (
                  <button
                    type="button"
                    onClick={() => {
                      setShowAllImages(false);
                      if (selectedImage > 3) setSelectedImage(0);
                    }}
                    className="flex h-18 w-18 sm:h-20 sm:w-20 shrink-0 items-center justify-center rounded-xl border border-white/20 bg-[#141416] text-xs text-gray-300 transition hover:border-[#d4af37]"
                  >
                    Less
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Right Column: Information & Purchase */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-[3px] text-[#d4af37]">
              {product.brand || "TIMELUX LUXURY COLLECTION"}
            </p>

            <h1 className="mt-2 text-2xl font-bold tracking-tight text-[#f5f1e8] sm:text-3xl lg:text-4xl">
              {product.name}
            </h1>

            {product.modelNumber && (
              <p className="mt-1 text-xs font-mono text-gray-400">
                Model: {product.modelNumber}
              </p>
            )}

            {/* Price Box */}
            <div className="mt-5 flex items-baseline gap-3 rounded-xl border border-[#d4af37]/20 bg-[#141416] p-4">
              <span className="text-2xl sm:text-3xl font-extrabold text-[#d4af37]">
                {formatTaka(finalPrice)}
              </span>

              {hasOffer && (
                <>
                  <span className="text-base text-gray-400 line-through">
                    {formatTaka(product.price)}
                  </span>
                  <span className="rounded-md bg-red-600/90 px-2 py-0.5 text-xs font-bold text-white">
                    Save {formatTaka(product.price - finalPrice)}
                  </span>
                </>
              )}
            </div>

            {/* Quantity Selector */}
            <div className="mt-6 flex items-center gap-4">
              <span className="text-xs font-semibold tracking-wider text-gray-300">QUANTITY</span>
              <div className="flex items-center rounded-lg border border-white/15 bg-[#141416]">
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  disabled={isOutOfStock || quantity <= 1}
                  className="px-3.5 py-2 text-base text-gray-300 transition hover:bg-white/10 disabled:opacity-30"
                  aria-label="Decrease quantity"
                >
                  −
                </button>
                <span className="min-w-10 text-center font-mono text-sm font-semibold text-[#f5f1e8]">
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.min(product.stock || 99, q + 1))}
                  disabled={isOutOfStock || quantity >= (product.stock || 99)}
                  className="px-3.5 py-2 text-base text-gray-300 transition hover:bg-white/10 disabled:opacity-30"
                  aria-label="Increase quantity"
                >
                  +
                </button>
              </div>

              {typeof product.stock === "number" && (
                <span className="text-xs text-gray-400">
                  {product.stock > 0 ? `${product.stock} units available` : "Currently sold out"}
                </span>
              )}
            </div>

            {/* Action Buttons */}
            <div className="mt-6 grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={handleAddToCart}
                disabled={isOutOfStock}
                className="flex items-center justify-center rounded-xl border border-[#d4af37] bg-transparent py-3 text-xs font-bold tracking-wider text-[#d4af37] transition hover:bg-[#d4af37] hover:text-[#09090b] disabled:cursor-not-allowed disabled:opacity-30"
              >
                ADD TO BAG
              </button>

              <button
                type="button"
                onClick={handleBuyNow}
                disabled={isOutOfStock}
                className="flex items-center justify-center rounded-xl border border-[#d4af37] bg-gradient-to-r from-[#d4af37] to-[#b8964e] py-3 text-xs font-bold tracking-wider text-[#09090b] shadow-[0_4px_16px_rgba(212,175,87,0.25)] transition hover:from-white hover:to-white disabled:cursor-not-allowed disabled:opacity-30"
              >
                BUY NOW
              </button>
            </div>

            {/* WhatsApp Order Direct */}
            <button
              type="button"
              onClick={handleWhatsApp}
              disabled={isOutOfStock}
              className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-emerald-600/50 bg-emerald-950/40 py-3 text-xs font-bold tracking-wider text-emerald-400 transition hover:bg-emerald-600 hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
            >
              <span>✆</span> ORDER DIRECT VIA WHATSAPP
            </button>

            {/* Assurances */}
            <div className="mt-6 grid grid-cols-2 gap-2 text-xs text-gray-400">
              <div className="flex items-center gap-2 rounded-lg border border-white/5 bg-white/[0.02] p-2.5">
                <span className="text-[#d4af37]">✓</span> Cash on Delivery
              </div>
              <div className="flex items-center gap-2 rounded-lg border border-white/5 bg-white/[0.02] p-2.5">
                <span className="text-[#d4af37]">✓</span> 100% Authentic
              </div>
              <div className="flex items-center gap-2 rounded-lg border border-white/5 bg-white/[0.02] p-2.5">
                <span className="text-[#d4af37]">✓</span> Nationwide Delivery
              </div>
              <div className="flex items-center gap-2 rounded-lg border border-white/5 bg-white/[0.02] p-2.5">
                <span className="text-[#d4af37]">✓</span> Customer Support
              </div>
            </div>

            {/* Premium Benefits */}
            {premiumBenefits.length > 0 && (
              <div className="mt-8 rounded-2xl border border-[#d4af37]/25 bg-[#141416] p-5 sm:p-6">
                <h2 className="text-sm font-bold tracking-wider text-[#d4af37] uppercase">
                  TimeLux Highlights
                </h2>
                <div className="mt-4 grid gap-2.5 sm:grid-cols-2">
                  {premiumBenefits.map((benefit, idx) => (
                    <div key={idx} className="flex items-start gap-2.5 text-xs leading-5 text-gray-300">
                      <span className="mt-0.5 text-[#d4af37]">✦</span>
                      <span>{benefit}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Specifications Table */}
            {specifications.length > 0 && (
              <div className="mt-6 rounded-2xl border border-white/10 bg-[#141416] p-5">
                <h2 className="text-sm font-bold tracking-wider text-[#d4af37] uppercase">
                  Specifications
                </h2>
                <dl className="mt-3 divide-y divide-white/5">
                  {specifications.map(([label, val]) => (
                    <div key={label} className="flex justify-between py-2 text-xs">
                      <dt className="text-gray-400">{label}</dt>
                      <dd className="font-medium text-[#f5f1e8] text-right">{val}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            )}
          </div>
        </div>

        {/* Explore More Collection */}
        {products.filter((p) => p.id !== id).length > 0 && (
          <section className="mt-16 border-t border-white/10 pt-12">
            <h2 className="text-xl font-bold tracking-tight text-[#f5f1e8]">
              More from the <span className="text-[#d4af37]">Collection</span>
            </h2>
            <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {products
                .filter((p) => p.id !== id)
                .slice(0, 4)
                .map((item) => (
                  <Link
                    key={item.id}
                    to={`/product/${item.id}`}
                    className="group rounded-xl border border-white/10 bg-[#141416] p-3 transition hover:border-[#d4af37]/60"
                  >
                    <div className="aspect-square w-full overflow-hidden rounded-lg bg-[#0e0e10]">
                      <img
                        src={getProductImage(item)}
                        alt={item.name}
                        onError={handleImageFallback}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    </div>
                    <p className="mt-2 text-[10px] tracking-wider text-[#d4af37] uppercase truncate">
                      {item.category}
                    </p>
                    <h3 className="mt-1 text-xs font-semibold text-[#f5f1e8] line-clamp-1 group-hover:text-[#d4af37]">
                      {item.name}
                    </h3>
                    <p className="mt-1 text-xs font-bold text-[#d4af37]">
                      {formatTaka(getFinalPrice(item))}
                    </p>
                  </Link>
                ))}
            </div>
          </section>
        )}
      </div>

      {/* FULLSCREEN IMAGE GALLERY MODAL */}
      {isGalleryOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`Fullscreen gallery for ${product.name}`}
          className="fixed inset-0 z-[100] flex flex-col bg-black/95 backdrop-blur-md"
        >
          {/* Modal Header */}
          <div className="flex items-center justify-between border-b border-white/10 px-4 py-3 sm:px-6">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={closeGallery}
                className="rounded-lg border border-[#d4af37]/40 bg-[#141416] px-3.5 py-1.5 text-xs font-semibold text-[#d4af37] transition hover:bg-[#d4af37] hover:text-[#09090b]"
              >
                ← Back
              </button>
              <div className="text-xs">
                <p className="font-semibold text-[#f5f1e8] line-clamp-1">{product.name}</p>
                <p className="text-gray-400">
                  Image {selectedImage + 1} of {images.length}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={closeGallery}
              aria-label="Close fullscreen gallery"
              className="flex h-8 w-8 items-center justify-center rounded-full border border-white/20 text-lg text-gray-300 transition hover:bg-white hover:text-black"
            >
              ×
            </button>
          </div>

          {/* Interactive Zoom Surface */}
          <div className="relative flex min-h-0 flex-1 items-center justify-center overflow-hidden">
            {/* Previous Button (Pointer events isolated to prevent drag cancellation) */}
            {images.length > 1 && (
              <button
                type="button"
                onPointerDown={(e) => e.stopPropagation()}
                onPointerUp={(e) => e.stopPropagation()}
                onClick={(e) => {
                  e.stopPropagation();
                  goToImage(selectedImage === 0 ? images.length - 1 : selectedImage - 1);
                }}
                aria-label="Previous image"
                className="absolute left-3 sm:left-6 z-30 flex h-12 w-12 items-center justify-center rounded-full border border-[#d4af37]/40 bg-[#141416]/90 text-2xl font-bold text-[#f5f1e8] shadow-2xl transition hover:bg-[#d4af37] hover:text-[#09090b]"
              >
                ‹
              </button>
            )}

            {/* Zoom / Pan viewport */}
            <div
              className="flex h-full w-full items-center justify-center touch-none select-none"
              onWheel={handleWheel}
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onPointerCancel={handlePointerUp}
            >
              <img
                src={safeSelectedImage}
                alt={product.name}
                draggable="false"
                onError={handleImageFallback}
                style={{
                  transform: `translate(${position.x}px, ${position.y}px) scale(${zoom})`,
                  transition: isDragging ? "none" : "transform 0.15s ease-out",
                  cursor: zoom > 1 ? "grab" : "zoom-in",
                }}
                className="max-h-[75vh] max-w-[85vw] object-contain select-none"
              />
            </div>

            {/* Next Button (Pointer events isolated) */}
            {images.length > 1 && (
              <button
                type="button"
                onPointerDown={(e) => e.stopPropagation()}
                onPointerUp={(e) => e.stopPropagation()}
                onClick={(e) => {
                  e.stopPropagation();
                  goToImage((selectedImage + 1) % images.length);
                }}
                aria-label="Next image"
                className="absolute right-3 sm:right-6 z-30 flex h-12 w-12 items-center justify-center rounded-full border border-[#d4af37]/40 bg-[#141416]/90 text-2xl font-bold text-[#f5f1e8] shadow-2xl transition hover:bg-[#d4af37] hover:text-[#09090b]"
              >
                ›
              </button>
            )}
          </div>

          {/* Gallery Controls & Thumbnails */}
          <div className="border-t border-white/10 bg-[#141416]/80 px-4 py-3 sm:px-6">
            <div className="flex flex-wrap items-center justify-center gap-3">
              <button
                type="button"
                onClick={zoomOut}
                disabled={zoom <= 1}
                aria-label="Zoom out"
                className="h-8 w-8 rounded-lg border border-white/20 text-base text-gray-200 hover:border-[#d4af37] disabled:opacity-30"
              >
                −
              </button>
              <span className="min-w-14 text-center font-mono text-xs text-gray-300">
                {Math.round(zoom * 100)}%
              </span>
              <button
                type="button"
                onClick={zoomIn}
                disabled={zoom >= 4}
                aria-label="Zoom in"
                className="h-8 w-8 rounded-lg border border-white/20 text-base text-gray-200 hover:border-[#d4af37] disabled:opacity-30"
              >
                +
              </button>
              <button
                type="button"
                onClick={resetZoom}
                className="rounded-lg border border-white/20 px-3 py-1 text-xs text-gray-300 hover:border-[#d4af37]"
              >
                Reset
              </button>
            </div>

            {/* Thumbnails */}
            {images.length > 1 && (
              <div className="mt-3 flex justify-center gap-2 overflow-x-auto pb-1">
                {images.map((image, idx) => (
                  <button
                    key={`${image}-${idx}`}
                    type="button"
                    onClick={() => goToImage(idx)}
                    aria-label={`Select image ${idx + 1}`}
                    className={`h-12 w-12 shrink-0 overflow-hidden rounded-lg border-2 transition ${
                      selectedImage === idx ? "border-[#d4af37]" : "border-white/20 opacity-60"
                    }`}
                  >
                    <img
                      src={image}
                      alt={`Thumbnail ${idx + 1}`}
                      onError={handleImageFallback}
                      className="h-full w-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
