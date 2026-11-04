import Login from "./pages/Login";
import AdminRoute from "./components/AdminRoute";
import { useState, useEffect } from "react";

import { Outlet } from "react-router-dom";
import Footer from "./components/Footer";

import Cart from "./pages/Cart";
import { Routes, Route, Link } from "react-router-dom";
import ProductDetails from "./pages/ProductDetails";
import { useCart } from "./context/useCart";
import { useProducts } from "./context/useProducts";
import Checkout from "./pages/Checkout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import Products from "./pages/admin/Products";
import Orders from "./pages/admin/Orders";
import Customers from "./pages/admin/Customers";
import Settings from "./pages/admin/Settings";

// Default images for demo products
const watchImages = {
  "watch-001":
    "https://images.unsplash.com/photo-1523170335258-f5ed11844a49?w=700",

  "watch-002":
    "https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=700",

  "watch-003":
    "https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=700",
};

const defaultImage =
  "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=700";

// Get uploaded product image first
function getProductImage(product) {
  if (Array.isArray(product.images) && product.images.length > 0) {
    const firstImage = product.images[0];

    if (typeof firstImage === "string" && firstImage.trim()) {
      return firstImage;
    }

    if (
      typeof firstImage === "object" &&
      firstImage !== null &&
      firstImage.src
    ) {
      return firstImage.src;
    }
  }

  if (typeof product.image === "string" && product.image.trim()) {
    return product.image;
  }

  return watchImages[product.id] || defaultImage;
}

// Calculate discounted price
function getFinalPrice(product) {
  if (product.offerActive && product.discountPercent > 0) {
    return Math.round(
      product.price * (1 - product.discountPercent / 100)
    );
  }

  return product.price;
}
// Hero Slider Images
const heroImages = [
  "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=1000",
  "https://images.unsplash.com/photo-1523170335258-f5ed11844a49?w=1000",
  "https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=1000",
  "https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=1000",
  "https://images.unsplash.com/photo-1547996160-81dfa63595aa?w=1000",
];

// Homepage
function HomePage() {
  const { cartCount } = useCart();
  const { products } = useProducts();
  const normalizeBrand = (brand) =>
  String(brand || "").trim().replace(/\s+/g, " ").toLowerCase();
    const [selectedCategory, setSelectedCategory] = useState("All");
    const [selectedBrand, setSelectedBrand] = useState("All");
const [showBrandMenu, setShowBrandMenu] = useState(false);
    useEffect(() => {
  if (window.location.hash === "#collection") {
    requestAnimationFrame(() => {
      document.getElementById("collection")?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    });
  }
}, []);
  const [search, setSearch] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [currentHero, setCurrentHero] = useState(0);

useEffect(() => {
  const sliderInterval = setInterval(() => {
    setCurrentHero((previous) => (previous + 1) % heroImages.length);
  }, 8000);

  return () => clearInterval(sliderInterval);
}, []);
  

  // Show only active products
  const watches = products
  .filter((product) => product.status === "Active")
  .sort((a, b) => {
    const getTime = (product) => {
      if (product.createdAt?.toMillis) {
        return product.createdAt.toMillis();
      }

      if (product.createdAt instanceof Date) {
        return product.createdAt.getTime();
      }

      return 0;
    };

    return getTime(b) - getTime(a);
  });
  const brands = [
  ...new Set(
    watches
      .map((watch) => String(watch.brand || "").trim().replace(/\s+/g, " "))
      .filter(Boolean)
  ),
].sort((a, b) => a.localeCompare(b));
    const filteredWatches = watches.filter((watch) => {
  const categoryMatch =
    selectedCategory === "All" ||
    watch.category === selectedCategory;

  const brandMatch =
  selectedBrand === "All" ||
  normalizeBrand(watch.brand) === normalizeBrand(selectedBrand);
  const searchText = search.toLowerCase();

  const searchMatch = [
    watch.name,
    watch.brand,
    watch.category,
  ].some((value) =>
    String(value || "").toLowerCase().includes(searchText)
  );

  return categoryMatch && brandMatch && searchMatch;
});

  return (
    <div className="min-h-screen bg-[#080808] text-[#F3EBDD]">

            {/* Navbar */}
      <nav className="sticky top-0 z-[100] w-full border-b border-[#b8964e]/30 bg-[#080808] px-6 py-2.5 md:px-16 md:py-3">

        <div className="flex items-center justify-between gap-4">

          {/* Logo */}
          <Link
            to="/"
            onClick={() => {
  setSelectedCategory("All");
  setSelectedBrand("All");
  setShowBrandMenu(false);
}}
            className="text-xl font-bold tracking-[3px] text-[#d4af37] md:text-2xl"
          >
            TIMELUX
          </Link>

          {/* Desktop Menu */}
          <div className="flex min-w-0 flex-1 items-center gap-6 overflow-x-auto whitespace-nowrap px-2 text-[13px] font-semibold tracking-wide md:flex-none md:overflow-visible">

            <button
              onClick={() => {
                setSelectedCategory("All");
                document.getElementById("collection")?.scrollIntoView({
                  behavior: "smooth",
                });
              }}
              className="relative py-2 text-[#F3EBDD] transition-all duration-300 hover:text-[#d4af37] hover:-translate-y-0.5"
            >
              Home
            </button>

            <button
              onClick={() => {
                setSelectedCategory("Men's Watch");
                document.getElementById("collection")?.scrollIntoView({
                  behavior: "smooth",
                });
              }}
              className="hover:text-[#d4af37]"
            >
              Men's Watch
            </button>

            <button
              onClick={() => {
                setSelectedCategory("Women's Watch");
                document.getElementById("collection")?.scrollIntoView({
                  behavior: "smooth",
                });
              }}
              className="hover:text-[#d4af37]"
            >
              Women's Watch
            </button>

            <button
              onClick={() => {
                setSelectedCategory("Couple Watch");
                document.getElementById("collection")?.scrollIntoView({
                  behavior: "smooth",
                });
              }}
              className="hover:text-[#d4af37]"
            >
              Couple Watch
            </button>
           
{/* Brand Menu */}
<div className="relative shrink-0">
  <button
    type="button"
    onClick={() => setShowBrandMenu((prev) => !prev)}
    aria-expanded={showBrandMenu}
    className="cursor-pointer whitespace-nowrap hover:text-[#d4af37]"
  >
    Brand ▾
  </button>
</div>
</div> 

{/* Brand Dropdown */}
{showBrandMenu && (
  <div className="fixed left-4 right-4 top-20 z-[9999] max-h-64 overflow-y-auto rounded-lg border border-[#d4af37]/30 bg-[#151515] py-2 shadow-xl md:absolute md:left-0 md:right-auto md:top-full md:mt-3 md:w-48">
    <button
      type="button"
      onClick={() => {
        setSelectedBrand("All");
        setShowBrandMenu(false);
        document.getElementById("collection")?.scrollIntoView({
          behavior: "smooth",
        });
      }}
      className="block w-full px-4 py-2 text-left text-sm hover:bg-[#d4af37]/10 hover:text-[#d4af37]"
    >
      All Brands
    </button>

    {brands.map((brand) => (
      <button
        key={brand}
        type="button"
        onClick={() => {
          setSelectedBrand(brand);
          setShowBrandMenu(false);
          document.getElementById("collection")?.scrollIntoView({
            behavior: "smooth",
          });
        }}
        className="block w-full px-4 py-2 text-left text-sm hover:bg-[#d4af37]/10 hover:text-[#d4af37]"
      >
        {brand}
      </button>
    ))}
  </div>
)}




          {/* Right Side Actions */}
          <div className="flex items-center gap-5 text-xl">

            <button
              aria-label="Search"
              onClick={() => setShowSearch(!showSearch)}
              className="hover:text-[#d4af37]"
            >
              ⌕
            </button>

            <Link to="/cart" aria-label="Cart" className="relative">
              🛒

              {cartCount > 0 && (
                <span className="absolute -right-3 -top-3 flex h-5 w-5 items-center justify-center rounded-full bg-[#d4af37] text-xs font-bold text-black">
                  {cartCount}
                </span>
              )}
            </Link>

           

          </div>
        </div>

        {/* Search Input */}
        {showSearch && (
          <div className="mt-5">
            <input
              type="search"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setSelectedCategory("All");
              }}
              placeholder="Search products by name, brand or category..."
              className="w-full rounded-lg border border-[#d4af37]/50 bg-[#151515] px-4 py-3 text-white outline-none focus:border-[#d4af37]"
            />
          </div>
        )}






      </nav>
{/* Premium Luxury Hero Section */}
<section className="px-4 pt-2 pb-0 md:px-16 md:pt-3 md:pb-0">
  <div className="relative mx-auto grid max-w-7xl items-center gap-2 overflow-hidden rounded-2xl border border-[#d4af37]/25 bg-gradient-to-r from-[#15130e] via-[#0b0b0b] to-[#111] p-2 shadow-[0_0_25px_rgba(212,175,55,0.08)] sm:p-3 md:grid-cols-2 md:gap-2 md:p-4">

    {/* Subtle Gold Glow */}
    <div className="pointer-events-none absolute -left-24 -top-24 h-64 w-64 rounded-full bg-[#d4af37]/[0.07] blur-3xl" />

    {/* Hero Content */}
    <div className="relative z-10">
      <p className="mb-3 text-xs font-semibold tracking-[5px] text-[#d4af37]">
        TIMELESS ELEGANCE
      </p>

      <h2 className="text-4xl font-bold leading-tight sm:text-5xl md:text-6xl">
        YOUR TIME.
        <br />
        <span className="text-[#d4af37]">YOUR STYLE.</span>
      </h2>

      <p className="mt-4 max-w-md text-sm leading-6 text-gray-400">
        Discover our exclusive collection of luxury watches.
        Crafted for those who value elegance, precision and style.
      </p>

      <a
        href="#collection"
        className="mt-6 inline-flex items-center rounded-md bg-gradient-to-r from-[#d4af37] to-[#b8964e] px-7 py-3 text-xs font-bold tracking-widest text-black shadow-lg shadow-[#d4af37]/10 transition duration-300 hover:scale-105 hover:from-white hover:to-white"
      >
        EXPLORE COLLECTION →
      </a>
    </div>

    {/* Watch Image Slider */}
    <div className="relative z-10 flex items-center justify-center">
      <div className="relative w-full overflow-hidden rounded-xl border border-[#d4af37]/20 shadow-[0_8px_30px_rgba(0,0,0,0.5)]">

        <img
          key={currentHero}
          src={heroImages[currentHero]}
          alt={`Luxury Watch ${currentHero + 1}`}
          className="h-[240px] w-full animate-[heroFade_1s_ease-in-out] object-cover object-center sm:h-[280px] md:h-[320px] lg:h-[350px]"
        />

        {/* Image Indicators */}
        <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-2">
          {heroImages.map((image, index) => (
            <button
              key={index}
              onClick={() => setCurrentHero(index)}
              aria-label={`Show watch image ${index + 1}`}
              className={`h-2 rounded-full transition-all duration-300 ${
                currentHero === index
                  ? "w-6 bg-[#d4af37]"
                  : "w-2 bg-white/60"
              }`}
            />
          ))}
        </div>

      </div>
    </div>

  </div>
</section>



      

      {/* Collection Section */}
      <section id="collection" className="px-4 pt-2 pb-6 md:px-16 md:pt-3 md:pb-8">

        <div className="grid grid-cols-2 gap-3 rounded-2xl border border-[#d4af37]/30 bg-gradient-to-br from-[#151515] to-[#080808] p-3 shadow-[0_0_30px_rgba(212,175,55,0.08)] sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 sm:gap-5 sm:p-6">

          {filteredWatches.map((watch) => {
            const finalPrice = getFinalPrice(watch);

            const hasOffer =
              watch.offerActive && watch.discountPercent > 0;

            const productImage = getProductImage(watch);

            return (
              <div
  key={watch.id}
  className="group overflow-hidden rounded-2xl border border-[#d4af37]/20 bg-gradient-to-b from-[#171717] to-[#090909] shadow-lg shadow-black/30 transition-all duration-500 hover:-translate-y-2 hover:border-[#d4af37]/70 hover:shadow-[0_10px_35px_rgba(212,175,55,0.12)]"
>

                {/* Product Image */}
<div className="relative">
  <Link
  to={`/product/${watch.id}?category=${encodeURIComponent(selectedCategory)}`}
  aria-label={`View ${watch.name} details`}
  className="block cursor-pointer"
>
    <img
      src={productImage}
      alt={watch.name}
      onError={(event) => {
        event.currentTarget.onerror = null;
        event.currentTarget.src = defaultImage;
      }}
      className="h-56 w-full cursor-pointer object-cover transition duration-700 group-hover:scale-105 sm:h-64 lg:h-60"
    />
  </Link>

  {hasOffer && (
    <span className="absolute left-2 top-2 rounded-full bg-red-600 px-2 py-1 text-[9px] font-bold text-white sm:text-[10px]">
  {watch.discountPercent}% OFF
</span>
  )}
</div>

                
{/* Product Information */}
<div className="p-3 sm:p-4">

  {/* Category */}
  <p className="text-[10px] tracking-widest text-[#d4af37] sm:text-xs">
    {watch.category}
  </p>

  {/* Product Name */}
  <h3 className="mt-2 text-sm font-semibold sm:text-base">
    {watch.name}
  </h3>

  {/* Product Price */}
  <div className="mt-2 flex flex-wrap items-center gap-2">

    <p className="text-sm font-bold text-[#d4af37] sm:text-base">
      ৳{finalPrice.toLocaleString("en-BD")}
    </p>

    {hasOffer && (
      <p className="text-xs text-gray-500 line-through">
        ৳{watch.price.toLocaleString("en-BD")}
      </p>
    )}

  </div>

  {/* View Details Button */}
          <Link
  to={`/product/${watch.id}?category=${encodeURIComponent(selectedCategory)}`}
  className="mt-3 block w-full rounded-lg border border-[#D6B66C] bg-gradient-to-r from-[#D6B66C] to-[#B89445] py-2.5 text-center text-xs font-bold tracking-wider text-[#090B0E] shadow-[0_4px_15px_rgba(214,182,108,0.15)] transition-all duration-300 hover:-translate-y-0.5 hover:from-[#F3EBDD] hover:to-[#D6B66C] hover:shadow-[0_6px_20px_rgba(214,182,108,0.3)] sm:text-sm"
>
  View Details
</Link>

        </div>
      </div>
    );
  })}

  {filteredWatches.length === 0 && (
    <p className="col-span-full py-10 text-center text-gray-500">
      No watches found. Try another category or search.
    </p>
  )}

</div>
</section>
 


      {/* About Section */}
      <section id="about" className="bg-[#111] px-6 py-16 text-center">

        <p className="tracking-[4px] text-[#d4af37]">
          ABOUT TIMELUX
        </p>

        <h2 className="mt-4 text-3xl font-bold">
          Every Second Tells a Story
        </h2>

        <p className="mx-auto mt-5 max-w-2xl leading-7 text-gray-400">
          TimeLux brings together timeless design and modern elegance.
          Find the perfect watch for every moment of your life.
        </p>
      </section>

  


    </div>
  );
}
// Common Customer Layout
function CustomerLayout() {
  return (
    <>
      <Outlet />
      <Footer />
    </>
  );
}
// Main App Routes
function App() {
  return (
    <Routes>
      {/* Customer Pages with Common Footer */}
      <Route element={<CustomerLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/product/:id" element={<ProductDetails />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/checkout" element={<Checkout />} />
      </Route>

      {/* Login Route */}
      <Route path="/login" element={<Login />} />

      {/* Protected Admin Routes */}
      <Route
        path="/admin"
        element={
          <AdminRoute>
            <AdminDashboard />
          </AdminRoute>
        }
      />

      <Route
        path="/admin/products"
        element={
          <AdminRoute>
            <Products />
          </AdminRoute>
        }
      />

      <Route
        path="/admin/orders"
        element={
          <AdminRoute>
            <Orders />
          </AdminRoute>
        }
      />

      <Route
        path="/admin/customers"
        element={
          <AdminRoute>
            <Customers />
          </AdminRoute>
        }
      />

      <Route
        path="/admin/settings"
        element={
          <AdminRoute>
            <Settings />
          </AdminRoute>
        }
      />
    </Routes>
  );
}

export default App;