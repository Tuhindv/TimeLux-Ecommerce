
import { useState, useEffect, useRef } from "react";
import {
  useParams,
  Link,
  useNavigate,
  useSearchParams,
} from "react-router-dom";
import { useCart } from "../context/useCart";
import { useProducts } from "../context/useProducts";

const defaultImages = [
  "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=900",
  "https://images.unsplash.com/photo-1523170335258-f5ed11844a49?w=900",
  "https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=900",
];

const defaultImage = defaultImages[0];

function getProductImages(product) {
  let uploadedImages = [];

  if (Array.isArray(product.images)) {
    uploadedImages = product.images
      .map((image) => {
        if (typeof image === "string") return image;
        if (image && typeof image.src === "string") return image.src;
        return null;
      })
      .filter(Boolean);
  }

  if (uploadedImages.length > 0) return uploadedImages;

  if (typeof product.image === "string" && product.image.trim()) {
    return [product.image];
  }

  return defaultImages;
}

function ProductDetails() {
  const { id } = useParams();

  return <ProductDetailsContent key={id} id={id} />;
}

function ProductDetailsContent({ id }) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

const selectedCategory = searchParams.get("category") || "All";

  const { addToCart, buyNow } = useCart();
  const { products } = useProducts();

  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);


  // Fullscreen Gallery States
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);

  const dragStart = useRef({ x: 0, y: 0 });
  const imagePositionStart = useRef({ x: 0, y: 0 });
  const pointers = useRef(new Map());
  const pinchStart = useRef(null);

  const product = products.find((item) => item.id === id);

  const images = product ? getProductImages(product) : [];

  const safeSelectedImage =
    images[selectedImage] || images[0] || defaultImage;

  useEffect(() => {
  window.scrollTo(0, 0);
}, [id]);

  // Reset Zoom
  const resetZoom = () => {
    setZoom(1);
    setPosition({ x: 0, y: 0 });
  };

  // Open Fullscreen Gallery
  const openGallery = () => {
    resetZoom();
    setIsGalleryOpen(true);
  };

  // Close Fullscreen Gallery
  const closeGallery = () => {
    setIsGalleryOpen(false);
    setIsDragging(false);
    pointers.current.clear();
    pinchStart.current = null;
    resetZoom();
  };

  // Zoom In
  const zoomIn = () => {
    setZoom((previous) => Math.min(4, previous + 0.5));
  };

  // Zoom Out
  const zoomOut = () => {
    setZoom((previous) => {
      const next = Math.max(1, previous - 0.5);

      if (next === 1) {
        setPosition({ x: 0, y: 0 });
      }

      return next;
    });
  };

  // Mouse Wheel Zoom
  const handleWheel = (e) => {
    e.preventDefault();

    setZoom((previous) => {
      const next =
        e.deltaY < 0
          ? Math.min(4, previous + 0.25)
          : Math.max(1, previous - 0.25);

      if (next === 1) {
        setPosition({ x: 0, y: 0 });
      }

      return next;
    });
  };

  // Pointer Down: Drag / Pinch
  const handlePointerDown = (e) => {
    e.currentTarget.setPointerCapture(e.pointerId);

    pointers.current.set(e.pointerId, {
      x: e.clientX,
      y: e.clientY,
    });

    if (pointers.current.size === 2) {
      const points = Array.from(pointers.current.values());

      const distance = Math.hypot(
        points[0].x - points[1].x,
        points[0].y - points[1].y
      );

      pinchStart.current = {
        distance,
        zoom,
      };

      setIsDragging(false);
      return;
    }

    if (zoom > 1) {
      dragStart.current = {
        x: e.clientX,
        y: e.clientY,
      };

      imagePositionStart.current = position;
      setIsDragging(true);
    }
  };

  // Pointer Move
  const handlePointerMove = (e) => {
    if (!pointers.current.has(e.pointerId)) return;

    pointers.current.set(e.pointerId, {
      x: e.clientX,
      y: e.clientY,
    });

    if (pointers.current.size === 2 && pinchStart.current) {
      const points = Array.from(pointers.current.values());

      const distance = Math.hypot(
        points[0].x - points[1].x,
        points[0].y - points[1].y
      );

      const scale = distance / pinchStart.current.distance;

      const nextZoom = Math.max(
        1,
        Math.min(4, pinchStart.current.zoom * scale)
      );

      setZoom(nextZoom);

      if (nextZoom === 1) {
        setPosition({ x: 0, y: 0 });
      }

      return;
    }

    if (isDragging && zoom > 1) {
      setPosition({
        x:
          imagePositionStart.current.x +
          (e.clientX - dragStart.current.x),
        y:
          imagePositionStart.current.y +
          (e.clientY - dragStart.current.y),
      });
    }
  };

  // Pointer Up
  const handlePointerUp = (e) => {
    pointers.current.delete(e.pointerId);

    if (pointers.current.size < 2) {
      pinchStart.current = null;
    }

    setIsDragging(false);
  };
// Keyboard Controls
useEffect(() => {
  if (!isGalleryOpen) return;

  const handleKeyDown = (e) => {
    if (e.key === "Escape") {
      setIsGalleryOpen(false);
      setIsDragging(false);
      pointers.current.clear();
      pinchStart.current = null;
      setZoom(1);
      setPosition({ x: 0, y: 0 });
    }

    if (e.key === "+" || e.key === "=") {
      setZoom((previous) => Math.min(4, previous + 0.5));
    }

    if (e.key === "-") {
      setZoom((previous) => {
        const next = Math.max(1, previous - 0.5);

        if (next === 1) {
          setPosition({ x: 0, y: 0 });
        }

        return next;
      });
    }

    if (e.key === "ArrowRight" && images.length > 0) {
      setSelectedImage((previous) =>
        (previous + 1) % images.length
      );
      setZoom(1);
      setPosition({ x: 0, y: 0 });
    }

    if (e.key === "ArrowLeft" && images.length > 0) {
      setSelectedImage((previous) =>
        previous === 0 ? images.length - 1 : previous - 1
      );
      setZoom(1);
      setPosition({ x: 0, y: 0 });
    }
  };

  window.addEventListener("keydown", handleKeyDown);

  return () => {
    window.removeEventListener("keydown", handleKeyDown);
  };
}, [isGalleryOpen, images.length]);
  if (!product) {
  return (
    <div className="min-h-screen bg-[#080808] p-10 text-center text-white">
      Loading product...
    </div>
  );
}
  // Product Price
  const hasOffer =
    product.offerActive && Number(product.discountPercent) > 0;

  const finalPrice = hasOffer
    ? Math.round(
        product.price * (1 - product.discountPercent / 100)
      )
    : product.price;

  
    // Premium Benefits
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
    if (product.stock <= 0) {
      alert("This product is currently out of stock.");
      return;
    }

    if (quantity > product.stock) {
      alert("Selected quantity exceeds available stock.");
      return;
    }

    addToCart({
      id: product.id,
      name: product.name,
      price: finalPrice,
      originalPrice: product.price,
      discountPercent: hasOffer ? product.discountPercent : 0,
      image: safeSelectedImage,
      images: product.images || [],
      quantity,
    });

    alert("Product added to cart successfully!");
  };

  // Buy Now: Separate Checkout
  const handleBuyNow = () => {
    if (product.stock <= 0) {
      alert("This product is currently out of stock.");
      return;
    }

    if (quantity > product.stock) {
      alert("Selected quantity exceeds available stock.");
      return;
    }

    const selectedProduct = {
      id: product.id,
      name: product.name,
      price: finalPrice,
      originalPrice: product.price,
      discountPercent: hasOffer ? product.discountPercent : 0,
      image: safeSelectedImage,
      images: product.images || [],
      quantity,
    };

    buyNow(selectedProduct);

    navigate("/checkout");
  };

const handleWhatsApp = () => {
  if (product.stock <= 0) {
    alert("This product is currently out of stock.");
    return;
  }

  if (quantity > product.stock) {
    alert("Selected quantity exceeds available stock.");
    return;
  }

  const message = `Hello TimeLux! I want to order:

Product: ${product.name}
Price: ৳${finalPrice}
Quantity: ${quantity}
Total: ৳${finalPrice * quantity}`;

  window.open(
    `https://wa.me/8801311657122?text=${encodeURIComponent(message)}`,
    "_blank"
  );
};

  
  return (
    <>
      <div className="min-h-screen bg-[#080808] px-5 py-8 text-white md:px-16">

        {/* Back to Home and Breadcrumb */}
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">

          <div>
            <Link
              to="/"
              className="inline-flex items-center gap-2 rounded-lg border border-[#d4af37]/50 px-4 py-2 text-sm font-semibold text-[#d4af37] transition hover:bg-[#d4af37] hover:text-black"
            >
              ← Back to Home
            </Link>
           <p className="mt-4 text-sm text-gray-500">
  <Link to="/" className="hover:text-[#d4af37]">
    Home
  </Link>

  {" / "}

  <Link
    to="/#collection"
    className="transition hover:text-[#d4af37]"
  >
    Watches
  </Link>

  {" / "}

  <span className="text-[#d4af37]">
    Product Details
  </span>
</p>
            
          </div>

          <Link
            to="/cart"
            className="text-[#d4af37] transition hover:text-white"
          >
            🛒 Shopping Cart
          </Link>
        </div>

        <div className="grid items-start gap-3 lg:grid-cols-2 lg:gap-12">

          {/* Product Gallery */}
          <div className="min-w-0 w-full lg:sticky lg:top-8">

            {/* Main Image */}
            <div className="group relative overflow-hidden rounded-xl border border-[#d4af37]/30 bg-[#111]">

              {hasOffer && (
                <span className="absolute left-5 top-5 z-10 rounded bg-red-600 px-4 py-2 text-sm font-bold">
                  {product.discountPercent}% OFF
                </span>
              )}

              <button
                type="button"
                onClick={openGallery}
                aria-label="Open full screen image gallery"
                className="block w-full cursor-zoom-in"
              >
                <img
                  src={safeSelectedImage}
                  alt={product.name}
                  onError={(event) => {
                    event.currentTarget.onerror = null;
                    event.currentTarget.src = defaultImage;
                  }}
                  className="h-[380px] w-full object-cover transition duration-500 group-hover:scale-105 md:h-[520px]"
                />
              </button>

              <button
                type="button"
                onClick={openGallery}
                className="absolute bottom-4 right-4 rounded-lg bg-black/75 px-4 py-2 text-sm text-white transition hover:bg-[#d4af37] hover:text-black"
              >
                ⛶ Click to Zoom
              </button>
            </div>
{/* Thumbnail Gallery - Mobile Horizontal Scroll */}
{images.length > 1 && (
  <div className="mt-3 w-full min-w-0 max-w-full">
    <div
      className="flex w-full max-w-full flex-nowrap gap-3 overflow-x-scroll overflow-y-hidden pb-3"
      style={{
        WebkitOverflowScrolling: "touch",
        touchAction: "pan-x",
        scrollbarWidth: "thin",
        scrollbarColor: "#d4af37 #151515",
      }}
    >
      {images.map((image, index) => (
        <button
          type="button"
          key={image + index}
          onClick={() => setSelectedImage(index)}
          className={`relative h-20 w-20 shrink-0 overflow-hidden rounded-lg border-2 ${
            selectedImage === index
              ? "border-[#d4af37]"
              : "border-white/10"
          }`}
        >
          <img
            src={image}
            alt={`Product view ${index + 1}`}
            onError={(event) => {
              event.currentTarget.onerror = null;
              event.currentTarget.src = defaultImage;
            }}
            className="h-full w-full object-cover"
          />
        </button>
      ))}
    </div>

    <p className="mt-1 text-center text-[10px] text-gray-500">
      Swipe left or right to view more images
    </p>
  </div>
)}
           
</div>
          {/* Product Information */}
          <div className="mt-2 lg:mt-0">
  <p className="text-xs font-semibold uppercase tracking-[4px] text-[#d4af37]">
              {product.brand || ""}
            </p>

           <h1 className="mt-1 text-3xl font-extrabold leading-tight text-white md:text-4xl">
              {product.name}
            </h1>

            {product.modelNumber && (
             <p className="mt-1 text-sm font-medium text-gray-300">
                Model: {product.modelNumber}
              </p>
            )}

            

            {/* Price */}
            <div className="mt-3 flex flex-wrap items-center gap-3">

              <span className="text-3xl font-bold text-[#d4af37]">
                ৳{finalPrice.toLocaleString("en-BD")}
              </span>

              {hasOffer && (
                <>
                  <span className="text-lg text-gray-500 line-through">
                    ৳{Number(product.price).toLocaleString("en-BD")}
                  </span>

                  <span className="rounded-full bg-red-600 px-3 py-1 text-sm font-bold">
                    {product.discountPercent}% OFF
                  </span>
                </>
              )}
            </div>

            {hasOffer && (
              <p className="mt-2 text-sm text-green-400">
                You Save ৳
                {(product.price - finalPrice).toLocaleString("en-BD")}
              </p>
            )}

  


            {/* Quantity */}
            <div className="mt-3">
              <p className="mb-2 text-sm font-semibold text-white">
                Quantity
              </p>

              <div className="flex w-fit items-center overflow-hidden rounded-lg border border-white/20">

                <button
                  type="button"
                  onClick={() =>
                    setQuantity(Math.max(1, quantity - 1))
                  }
                  disabled={product.stock <= 0}
                  className="px-5 py-3 hover:bg-[#222] disabled:opacity-40"
                >
                  −
                </button>

                <span className="min-w-12 text-center">
                  {quantity}
                </span>

                <button
                  type="button"
                  onClick={() =>
                    setQuantity(Math.min(product.stock, quantity + 1))
                  }
                  disabled={quantity >= product.stock}
                  className="px-5 py-3 hover:bg-[#222] disabled:opacity-40"
                >
                  +
                </button>

              </div>
            </div>

            {/* Total Price */}
            <div className="mt-3 flex items-center justify-between border-t border-white/10 pt-3">
              <span className="font-medium text-gray-300">
                Total Price
              </span>

              <span className="text-2xl font-bold text-[#d4af37]">
                ৳{(finalPrice * quantity).toLocaleString("en-BD")}
              </span>
            </div>

 
{/* Action Buttons */}
<div className="mt-3 grid grid-cols-2 gap-2 sm:gap-3">

  <button
    type="button"
    onClick={handleAddToCart}
    disabled={product.stock <= 0}
    className="rounded-lg border border-[#D6B66C] bg-gradient-to-r from-[#292216] via-[#3A2E19] to-[#292216] px-2 py-2.5 text-xs font-bold tracking-wide text-[#F3D98B] shadow-[0_3px_12px_rgba(214,182,108,0.12)] transition-all duration-300 hover:-translate-y-0.5 hover:border-[#F3D98B] hover:from-[#D6B66C] hover:to-[#B89445] hover:text-[#090909] hover:shadow-[0_5px_16px_rgba(214,182,108,0.3)] disabled:cursor-not-allowed disabled:opacity-40 sm:py-3 sm:text-sm"
  >
    ADD TO CART
  </button>

  <button
    type="button"
    onClick={handleBuyNow}
    disabled={product.stock <= 0}
    className="rounded-lg border-2 border-[#d4af37] bg-gradient-to-r from-[#d4af37] to-[#f5d76e] px-2 py-2.5 text-xs font-bold tracking-wide text-black shadow-md transition-all duration-300 hover:from-white hover:to-white disabled:cursor-not-allowed disabled:opacity-40 sm:py-3 sm:text-sm"
  >
    BUY NOW
  </button>

</div>

{/* WhatsApp Order Button */}
<button
  type="button"
  onClick={handleWhatsApp}
  disabled={product.stock <= 0}
  className="mt-2 flex w-full items-center justify-center gap-2 rounded-lg border-2 border-green-500 bg-green-700 px-3 py-2.5 text-xs font-bold tracking-wide text-white shadow-md transition-all duration-300 hover:bg-green-600 disabled:cursor-not-allowed disabled:opacity-40 sm:py-3 sm:text-sm"
>
  <span className="text-base">✆</span>
  ORDER VIA WHATSAPP
</button>

          
{/* Premium Benefits Main Card */}
<div className="mt-8 overflow-hidden rounded-2xl border border-[#d4af37]/40 bg-gradient-to-br from-[#1b1b1b] via-[#101010] to-[#080808] shadow-xl shadow-black/40">

  {/* Card Header */}
  <div className="border-b border-[#d4af37]/20 bg-[#d4af37]/5 px-5 py-6 sm:px-7">
    <div className="flex items-center gap-3">
      <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-[#d4af37]/30 bg-[#d4af37]/10 text-2xl text-[#d4af37]">
        ✦
      </div>

      <div>
        <p className="text-[10px] font-semibold uppercase tracking-[4px] text-[#d4af37]">
          TIMELUX EXCLUSIVE
        </p>
        <h2 className="mt-1 text-xl font-bold text-white sm:text-2xl">
          Premium Benefits
        </h2>
      </div>
    </div>

    <p className="mt-4 text-sm leading-7 text-gray-300">
      Discover the exceptional features and details of this timepiece.
    </p>
  </div>

  {/* Benefits Cards */}
  <div className="p-5 sm:p-7">
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">

      {premiumBenefits.length > 0 ? (
        premiumBenefits.map((benefit, index) => (
          <div
            key={index}
            className="group flex items-start gap-3 rounded-xl border border-white/10 bg-white/[0.03] p-4 transition-all duration-300 hover:border-[#d4af37]/60 hover:bg-[#d4af37]/5"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-[#d4af37]/30 bg-[#d4af37]/10 text-lg text-[#d4af37] transition group-hover:bg-[#d4af37] group-hover:text-black">
              ✓
            </div>

            <div className="min-w-0">
              <h3 className="text-sm font-semibold leading-6 text-white">
                {benefit}
              </h3>
              <p className="mt-1 text-xs text-gray-300">
                A detail of your TimeLux experience.
              </p>
            </div>
          </div>
        ))
      ) : (
        <p className="rounded-xl border border-white/10 bg-white/[0.03] p-4 text-sm text-gray-400 sm:col-span-2">
          Premium benefits will be updated soon.
        </p>
      )}

    </div>
  </div>

  {/* Card Footer */}
  <div className="border-t border-[#d4af37]/20 px-5 py-4 text-center">
    <p className="text-xs font-medium tracking-wider text-[#d4af37]">
      TIMELESS STYLE • TIMELESS ELEGANCE
    </p>
  </div>

</div>



            {/* Specifications */}
            {specifications.length > 0 && (
              <div className="mt-9 overflow-hidden rounded-xl border border-[#d4af37]/30 bg-[#111]">

                <div className="border-b border-white/10 px-5 py-5">
                  <h2 className="text-xl font-bold text-[#d4af37]">
                    Product Specifications
                  </h2>

                  <p className="mt-1 text-xs text-gray-300">
                    Product information and features
                  </p>
                </div>

                <div className="px-5 py-2">
                  {specifications.map(([label, value]) => (
                    <div
                      key={label}
                      className="flex justify-between gap-5 border-b border-white/5 py-4 text-sm last:border-0"
                    >
                      <span className="font-medium text-gray-300">
                        {label}
                      </span>

                      <span className="text-right font-medium text-white">
                        {value}
                      </span>
                    </div>
                  ))}
                </div>

              </div>
            )}

            {/* Service Information */}
            <div className="mt-7 grid grid-cols-1 gap-3 rounded-xl border border-white/10 p-5 text-sm text-gray-400 sm:grid-cols-2">
              <p>✓ Cash on Delivery Available</p>
              <p>✓ Delivery Across Bangladesh</p>
              <p>✓ Secure Order Process</p>
              <p>✓ Customer Support Available</p>
            </div>

          </div>
        </div>
      </div>
       
{/* ALL PRODUCTS - FILTER BY HOME PAGE CATEGORY */}

{(() => {
  const displayedProducts = products.filter((item) => {
    if (item.id === id || item.status !== "Active") {
      return false;
    }

    if (selectedCategory === "All") {
      return true;
    }

    return (
      item.category?.trim().toLowerCase() ===
      selectedCategory.trim().toLowerCase()
    );
  });

  if (displayedProducts.length === 0) return null;

  return (
    <section
      className="border-t border-[#d4af37]/20 bg-[#080808] px-5 py-12 md:px-16 md:py-16"
    >
      <div className="mb-8 text-center">
        <p className="text-xs font-semibold uppercase tracking-[4px] text-[#d4af37]">
          TIMELUX COLLECTION
        </p>

        <h2 className="mt-3 text-3xl font-bold text-white md:text-4xl">
          Explore Our Watches
        </h2>

        <p className="mt-3 text-sm text-gray-400">
          Discover more watches from our collection.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {displayedProducts.map((watch) => {
          const watchPrice =
            watch.offerActive &&
            Number(watch.discountPercent) > 0
              ? Math.round(
                  Number(watch.price) *
                  (1 - Number(watch.discountPercent) / 100)
                )
              : Number(watch.price);

          const watchImage =
            getProductImages(watch)[0] || defaultImage;

          return (
            <Link
              key={watch.id}
              to={`/product/${watch.id}?category=${encodeURIComponent(selectedCategory)}`}
              onClick={() => window.scrollTo(0, 0)}
              className="group overflow-hidden rounded-xl border border-white/10 bg-[#111] transition duration-300 hover:-translate-y-1 hover:border-[#d4af37]/60"
            >
              <div className="relative overflow-hidden">
                <img
                  src={watchImage}
                  alt={watch.name}
                  onError={(event) => {
                    event.currentTarget.onerror = null;
                    event.currentTarget.src = defaultImage;
                  }}
                  className="h-40 w-full object-cover transition duration-500 group-hover:scale-110 sm:h-56"
                />

                {watch.offerActive &&
                  Number(watch.discountPercent) > 0 && (
                    <span className="absolute left-2 top-2 rounded bg-red-600 px-2 py-1 text-[10px] font-bold text-white">
                      {watch.discountPercent}% OFF
                    </span>
                  )}
              </div>

              <div className="p-3 sm:p-4">
                {watch.brand && (
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-[#d4af37]">
                    {watch.brand}
                  </p>
                )}

                <h3 className="mt-2 line-clamp-2 text-sm font-bold text-white transition group-hover:text-[#d4af37] sm:text-base">
                  {watch.name}
                </h3>

                <p className="mt-3 text-lg font-bold text-[#d4af37]">
                  ৳{watchPrice.toLocaleString("en-BD")}
                </p>

                <p className="mt-2 text-xs font-semibold text-gray-400 transition group-hover:text-[#d4af37]">
                  VIEW DETAILS →
                </p>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
})()}

 

      {/* FULLSCREEN IMAGE GALLERY */}
      {isGalleryOpen && (
        <div
          className="fixed inset-0 z-[100] flex flex-col bg-black/95"
          role="dialog"
          aria-modal="true"
          aria-label="Product image gallery"
        >

          {/* Gallery Back Header */}
          <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">

            <button
              type="button"
              onClick={closeGallery}
              className="rounded-lg border border-yellow-500 px-5 py-2 text-sm font-semibold text-yellow-500 transition hover:bg-yellow-500 hover:text-black"
            >
              ← Back
            </button>

            <span className="text-sm text-white">
              Product Gallery
            </span>

          </div>

          {/* Gallery Header */}
          <div className="flex items-center justify-between border-b border-white/10 px-4 py-4 md:px-8">

            <div>
              <h2 className="font-semibold text-[#d4af37]">
                {product.name}
              </h2>

              <p className="mt-1 text-xs text-gray-400">
                Image {selectedImage + 1} of {images.length}
              </p>
            </div>

            <button
              type="button"
              onClick={closeGallery}
              aria-label="Close gallery"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-white/20 text-2xl hover:bg-white hover:text-black"
            >
              ×
            </button>

          </div>

          {/* Main Zoom Area */}
          <div
            className="relative flex min-h-0 flex-1 items-center justify-center overflow-hidden touch-none"
            onWheel={handleWheel}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
          >

            {/* Previous Image */}
            {images.length > 1 && (
              <button
                type="button"
                onClick={() => {
                  setSelectedImage((previous) =>
                    previous === 0 ? images.length - 1 : previous - 1
                  );
                  resetZoom();
                }}
                className="absolute left-3 z-20 flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-2xl hover:bg-[#d4af37] hover:text-black md:left-8"
                aria-label="Previous image"
              >
                ‹
              </button>
            )}

            {/* Zoomable Image */}
            <img
              src={safeSelectedImage}
              alt={product.name}
              draggable="false"
              onError={(event) => {
                event.currentTarget.onerror = null;
                event.currentTarget.src = defaultImage;
              }}
              style={{
                transform: `translate(${position.x}px, ${position.y}px) scale(${zoom})`,
                transition: isDragging ? "none" : "transform 0.15s ease",
                cursor: zoom > 1 ? "grab" : "zoom-in",
              }}
              className="max-h-[75vh] max-w-[85vw] select-none object-contain"
            />

            {/* Next Image */}
            {images.length > 1 && (
              <button
                type="button"
                onClick={() => {
                  setSelectedImage((previous) =>
                    (previous + 1) % images.length
                  );
                  resetZoom();
                }}
                className="absolute right-3 z-20 flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-2xl hover:bg-[#d4af37] hover:text-black md:right-8"
                aria-label="Next image"
              >
                ›
              </button>
            )}

          </div>

          {/* Gallery Controls */}
          <div className="border-t border-white/10 px-4 py-4">

            <div className="mb-4 flex flex-wrap items-center justify-center gap-3">

              <button
                type="button"
                onClick={zoomOut}
                disabled={zoom <= 1}
                className="h-10 w-10 rounded-lg border border-white/20 text-xl hover:border-[#d4af37] disabled:opacity-30"
                aria-label="Zoom out"
              >
                −
              </button>

              <span className="min-w-16 text-center text-sm text-gray-300">
                {Math.round(zoom * 100)}%
              </span>

              <button
                type="button"
                onClick={zoomIn}
                disabled={zoom >= 4}
                className="h-10 w-10 rounded-lg border border-white/20 text-xl hover:border-[#d4af37] disabled:opacity-30"
                aria-label="Zoom in"
              >
                +
              </button>

              <button
                type="button"
                onClick={resetZoom}
                className="rounded-lg border border-white/20 px-4 py-2 text-sm hover:border-[#d4af37]"
              >
                Reset Zoom
              </button>

            </div>

            {/* Fullscreen Thumbnails */}
            {images.length > 1 && (
              <div className="flex justify-center gap-2 overflow-x-auto pb-1">

                {images.map((image, index) => (
                  <button
                    type="button"
                    key={image + index}
                    onClick={() => {
                      setSelectedImage(index);
                      resetZoom();
                    }}
                    className={`h-14 w-14 shrink-0 overflow-hidden rounded-lg border-2 ${
                      selectedImage === index
                        ? "border-[#d4af37]"
                        : "border-white/20"
                    }`}
                  >
                    <img
                      src={image}
                      alt={`Thumbnail ${index + 1}`}
                      onError={(event) => {
                        event.currentTarget.onerror = null;
                        event.currentTarget.src = defaultImage;
                      }}
                      className="h-full w-full object-cover"
                    />
                  </button>
                ))}

              </div>
            )}

            <p className="mt-3 text-center text-xs text-gray-500">
              Scroll or use + / − to zoom. Drag to move. On mobile, use two fingers to zoom.
            </p>

          </div>
        </div>
      )}
    </>
  );
}

export default ProductDetails;
