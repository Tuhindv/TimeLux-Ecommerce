import { useState, useEffect, useMemo, useRef } from "react";
import { Routes, Route, Link, useSearchParams, useNavigate } from "react-router-dom";
import Login from "./pages/Login";
import AdminRoute from "./components/AdminRoute";
import Cart from "./pages/Cart";
import ProductDetails from "./pages/ProductDetails";
import Checkout from "./pages/Checkout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import Products from "./pages/admin/Products";
import Orders from "./pages/admin/Orders";
import Customers from "./pages/admin/Customers";
import Settings from "./pages/admin/Settings";
import StorefrontLayout from "./components/StorefrontLayout";
import ProductCard from "./components/ProductCard";
import { useCart } from "./context/useCart";
import { useProducts } from "./context/useProducts";
import {
  getFinalPrice,
  getProductImage,
  formatTaka,
  handleImageFallback,
} from "./utils/watchHelpers";

// Curated Animated Hero Watch Showcase Slides
const heroShowcaseSlides = [
  {
    id: "watch-001",
    badge: "SWISS AUTOMATIC • EDITION 01",
    title: "Royal Gold Chronograph",
    brand: "ROLEX GENÈVE",
    price: 10625,
    oldPrice: 12500,
    spec1: "100M Waterproof",
    spec2: "Sapphire Crystal",
    spec3: "18K Champagne Gold",
    image:
      "https://images.unsplash.com/photo-1523170335258-f5ed11844a49?w=1200&auto=format&fit=crop&q=85",
  },
  {
    id: "watch-004",
    badge: "FLYBACK CALIBRE • EDITION 02",
    title: "Imperial Sovereign Blue",
    brand: "PATEK PHILIPPE",
    price: 18450,
    oldPrice: 22500,
    spec1: "72H Power Reserve",
    spec2: "Tachymeter Scale",
    spec3: "Exhibition Caseback",
    image:
      "https://images.unsplash.com/photo-1547996160-81dfa63595aa?w=1200&auto=format&fit=crop&q=85",
  },
  {
    id: "watch-005",
    badge: "OPENWORKED TOURBILLON • EDITION 03",
    title: "Royal Oak Skeleton",
    brand: "AUDEMARS PIGUET",
    price: 29920,
    oldPrice: 34000,
    spec1: "Brushed Titanium",
    spec2: "Octagonal Bezel",
    spec3: "Swiss Mechanical",
    image:
      "https://images.unsplash.com/photo-1587836374828-4dbafa94cf0e?w=1200&auto=format&fit=crop&q=85",
  },
  {
    id: "watch-003",
    badge: "HIS & HERS PAIR • EDITION 04",
    title: "Onyx Black Couple Set",
    brand: "OMEGA CO-AXIAL",
    price: 12000,
    oldPrice: 15000,
    spec1: "40mm & 32mm Pair",
    spec2: "Ceramic Matte PVD",
    spec3: "Luxury Gift Box",
    image:
      "https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=1200&auto=format&fit=crop&q=85",
  },
  {
    id: "watch-002",
    badge: "TIMELESS ELEGANCE • EDITION 05",
    title: "Classic Silver Minimalist",
    brand: "CARTIER PARIS",
    price: 8820,
    oldPrice: 9800,
    spec1: "Ultra-Slim 7mm",
    spec2: "Italian Calfskin",
    spec3: "Sunray Silver Dial",
    image:
      "https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=1200&auto=format&fit=crop&q=85",
  },
];

function HomePage() {
  const navigate = useNavigate();
  const { cartCount, cartTotal } = useCart();
  const { products, loading } = useProducts();
  const [searchParams, setSearchParams] = useSearchParams();

  const [rawCategory, setRawCategory] = useState("All");
  const [selectedBrand, setSelectedBrand] = useState("All");
  const [search, setSearch] = useState("");
  const [priceSort, setPriceSort] = useState("default");
  const [showBrandMenu, setShowBrandMenu] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);
  const [currentHero, setCurrentHero] = useState(0);
  const [slideDirection, setSlideDirection] = useState("right");

  const searchContainerRef = useRef(null);

  const categoryParam = searchParams.get("category");
  const selectedCategory = categoryParam || rawCategory;

  const handleSelectCategory = (cat) => {
    setRawCategory(cat);
    if (cat === "All") {
      setSearchParams({});
    } else {
      setSearchParams({ category: cat });
    }
  };

  useEffect(() => {
    if (categoryParam || window.location.hash === "#collection") {
      requestAnimationFrame(() => {
        document.getElementById("collection")?.scrollIntoView({ behavior: "smooth" });
      });
    }
  }, [categoryParam]);

  useEffect(() => {
    document.title = "TimeLux — Luxury Watches & Timeless Elegance";
  }, []);

  // Automatic Hero Watch Slide-in Carousel (every 5 seconds)
  useEffect(() => {
    const timer = setInterval(() => {
      setSlideDirection("right");
      setCurrentHero((prev) => (prev + 1) % heroShowcaseSlides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  // Close search dropdown on outside click
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target)) {
        setSearchFocused(false);
      }
    };
    document.addEventListener("pointerdown", handleOutsideClick);
    return () => document.removeEventListener("pointerdown", handleOutsideClick);
  }, []);

  // Active watches
  const activeWatches = useMemo(() => {
    return (products || [])
      .filter((product) => product.status === "Active")
      .sort((a, b) => {
        const getTime = (p) => {
          if (p.createdAt?.toMillis) return p.createdAt.toMillis();
          if (p.createdAt instanceof Date) return p.createdAt.getTime();
          return 0;
        };
        return getTime(b) - getTime(a);
      });
  }, [products]);

  // Unique brands
  const brands = useMemo(() => {
    return [
      ...new Set(activeWatches.map((w) => w.brand?.trim()).filter(Boolean)),
    ].sort();
  }, [activeWatches]);

  // Normalized search & category filtering
  const filteredWatches = useMemo(() => {
    const query = search.trim().toLowerCase();

    return activeWatches.filter((watch) => {
      const watchCat = (watch.category || "").toLowerCase();
      const targetCat = selectedCategory.toLowerCase();

      const categoryMatch =
        selectedCategory === "All" ||
        (selectedCategory === "Offers" &&
          watch.offerActive &&
          Number(watch.discountPercent) > 0) ||
        watchCat === targetCat ||
        (targetCat.includes("men") &&
          watchCat.includes("men") &&
          !watchCat.includes("women")) ||
        (targetCat.includes("women") && watchCat.includes("women")) ||
        (targetCat.includes("couple") && watchCat.includes("couple"));

      const brandMatch =
        selectedBrand === "All" ||
        (watch.brand || "").trim().toLowerCase() === selectedBrand.toLowerCase();

      const searchMatch =
        !query ||
        [watch.name, watch.brand, watch.category, watch.modelNumber, watch.color].some(
          (field) => String(field || "").toLowerCase().includes(query)
        );

      return categoryMatch && brandMatch && searchMatch;
    });
  }, [activeWatches, selectedCategory, selectedBrand, search]);

  // Sorted watches based on effective discounted price
  const sortedWatches = useMemo(() => {
    const list = [...filteredWatches];
    if (priceSort === "low-to-high") {
      return list.sort((a, b) => getFinalPrice(a) - getFinalPrice(b));
    }
    if (priceSort === "high-to-low") {
      return list.sort((a, b) => getFinalPrice(b) - getFinalPrice(a));
    }
    return list;
  }, [filteredWatches, priceSort]);

  // Instant search suggestions for the Amazon-style top search bar
  const searchSuggestions = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return activeWatches.slice(0, 4);
    return activeWatches
      .filter((w) =>
        [w.name, w.brand, w.category, w.modelNumber].some((f) =>
          String(f || "").toLowerCase().includes(q)
        )
      )
      .slice(0, 5);
  }, [activeWatches, search]);

  const resetAllFilters = () => {
    setRawCategory("All");
    setSelectedBrand("All");
    setSearch("");
    setPriceSort("default");
    setShowBrandMenu(false);
    setSearchParams({});
  };

  const hasActiveFilters =
    selectedCategory !== "All" ||
    selectedBrand !== "All" ||
    search.trim() !== "" ||
    priceSort !== "default";

  const activeSlide = heroShowcaseSlides[currentHero] || heroShowcaseSlides[0];

  const handleHeroChange = (nextIdx, dir = "right") => {
    setSlideDirection(dir);
    setCurrentHero(nextIdx);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setSearchFocused(false);
    document.getElementById("collection")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="relative min-h-screen">
      {/* Ambient Background Light Orbs for iOS Liquid Glass Refraction */}
      <div
        className="pointer-events-none fixed left-1/4 top-16 -z-10 h-96 w-96 rounded-full bg-[#d4af37]/[0.07] blur-[120px]"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none fixed right-10 top-1/3 -z-10 h-[28rem] w-[28rem] rounded-full bg-amber-500/[0.05] blur-[140px]"
        aria-hidden="true"
      />

      {/* ====================================================================
          AMAZON-INSPIRED PROMINENT LIQUID GLASS HEADER & SEARCH BAR
         ==================================================================== */}
      <header className="sticky top-0 z-40 border-b border-white/10 bg-[#08080b]/80 backdrop-blur-2xl">
        {/* Main Top Row */}
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6 md:px-10">
          {/* Brand Logo + Location Badge */}
          <div className="flex items-center gap-4">
            <Link
              to="/"
              onClick={resetAllFilters}
              className="group flex items-center gap-2.5 outline-none focus-visible:ring-2 focus-visible:ring-[#d4af37]"
            >
              <span className="liquid-orb-active flex h-9 w-9 items-center justify-center rounded-xl text-sm font-black text-[#f7df8b] transition-transform duration-300 group-hover:scale-110">
                ⌚
              </span>
              <div>
                <span className="block text-lg font-black tracking-[4px] text-transparent bg-clip-text bg-gradient-to-r from-[#f7df8b] via-[#d4af37] to-[#b58e31] sm:text-xl">
                  TIMELUX
                </span>
                <span className="block text-[9px] tracking-[2px] text-gray-400 uppercase">
                  Geneva • Dhaka
                </span>
              </div>
            </Link>

            {/* Amazon-style Delivery Badge */}
            <div className="hidden xl:flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-1.5 text-[11px] text-gray-300">
              <span className="text-[#d4af37]">📍</span>
              <div>
                <span className="block text-[9px] text-gray-400 leading-none">
                  Deliver to
                </span>
                <span className="font-bold text-[#f7f4ed]">Bangladesh 🇧🇩</span>
              </div>
            </div>
          </div>

          {/* CENTER: Amazon-Inspired Full-Width Prominent Search Bar with Hover & Liquid Glass */}
          <div
            ref={searchContainerRef}
            className="relative order-3 w-full flex-1 lg:order-2 lg:mx-4 lg:max-w-2xl"
          >
            <form
              onSubmit={handleSearchSubmit}
              className={`liquid-glass group flex w-full items-center overflow-hidden rounded-2xl transition-all duration-300 ${
                searchFocused
                  ? "border-[#d4af37] shadow-[0_0_32px_rgba(212,175,55,0.32),inset_0_1px_2px_rgba(255,255,255,0.4)] scale-[1.01]"
                  : "hover:border-[#d4af37]/65 hover:shadow-[0_0_24px_rgba(212,175,55,0.2)] hover:scale-[1.005]"
              }`}
            >
              {/* Left Category Selector inside Search Bar */}
              <label htmlFor="header-category-select" className="sr-only">
                Search Category
              </label>
              <select
                id="header-category-select"
                value={selectedCategory}
                onChange={(e) => handleSelectCategory(e.target.value)}
                className="h-11 cursor-pointer border-r border-white/10 bg-white/[0.04] px-3 text-xs font-semibold text-[#d6d2c9] outline-none transition hover:bg-white/[0.09] hover:text-[#f7df8b]"
              >
                <option value="All" className="bg-[#121216] text-white">
                  All Watches
                </option>
                <option value="Men's Watch" className="bg-[#121216] text-white">
                  Men&apos;s
                </option>
                <option value="Women's Watch" className="bg-[#121216] text-white">
                  Women&apos;s
                </option>
                <option value="Couple Watch" className="bg-[#121216] text-white">
                  Couple
                </option>
                <option value="Offers" className="bg-[#121216] text-white">
                  Offers %
                </option>
              </select>

              {/* Center Search Input */}
              <div className="relative flex-1">
                <input
                  type="search"
                  value={search}
                  onFocus={() => setSearchFocused(true)}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setSearchFocused(true);
                  }}
                  placeholder="Search Rolex, Omega, Cartier, Men's, Couple watches..."
                  aria-label="Search luxury watches"
                  className="h-11 w-full bg-transparent px-4 text-xs sm:text-sm text-[#f7f4ed] placeholder:text-gray-400 outline-none"
                />
                {search && (
                  <button
                    type="button"
                    onClick={() => setSearch("")}
                    aria-label="Clear search query"
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-full bg-white/10 px-2 py-0.5 text-xs text-gray-300 hover:bg-white/20 hover:text-white"
                  >
                    ✕
                  </button>
                )}
              </div>

              {/* Right Golden Search CTA Button */}
              <button
                type="submit"
                aria-label="Search watches"
                className="flex h-11 items-center justify-center gap-1.5 bg-gradient-to-r from-[#f7df8b] via-[#d4af37] to-[#b58e31] px-5 text-xs font-black tracking-wider text-[#070709] transition-all duration-300 hover:brightness-110 active:scale-95"
              >
                <svg
                  className="h-4 w-4"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
                <span className="hidden sm:inline">SEARCH</span>
              </button>
            </form>

            {/* Instant Live Search Suggestions Dropdown (Liquid Glass) */}
            {searchFocused && (
              <div className="liquid-glass absolute left-0 right-0 top-full z-50 mt-2 overflow-hidden rounded-2xl border border-[#d4af37]/40 p-3 shadow-[0_24px_60px_rgba(0,0,0,0.85)]">
                <div className="mb-2 flex items-center justify-between px-2 text-[10px] font-bold uppercase tracking-wider text-[#d4af37]">
                  <span>
                    {search.trim()
                      ? `Matching Timepieces (${searchSuggestions.length})`
                      : "Popular Curated Timepieces"}
                  </span>
                  <button
                    type="button"
                    onClick={() => setSearchFocused(false)}
                    className="text-gray-400 hover:text-white"
                  >
                    Close ✕
                  </button>
                </div>

                {searchSuggestions.length > 0 ? (
                  <div className="divide-y divide-white/5">
                    {searchSuggestions.map((item) => (
                      <Link
                        key={item.id}
                        to={`/product/${item.id}`}
                        onClick={() => setSearchFocused(false)}
                        className="flex items-center justify-between gap-3 rounded-xl p-2 transition hover:bg-white/[0.08]"
                      >
                        <div className="flex items-center gap-3">
                          <img
                            src={getProductImage(item)}
                            alt={item.name}
                            onError={handleImageFallback}
                            className="h-11 w-11 rounded-lg object-cover border border-white/10"
                          />
                          <div>
                            <p className="text-xs font-bold text-[#f7f4ed]">
                              {item.name}
                            </p>
                            <p className="text-[10px] text-gray-400">
                              {item.brand} • {item.category}
                            </p>
                          </div>
                        </div>
                        <span className="text-xs font-extrabold text-[#f7df8b]">
                          {formatTaka(getFinalPrice(item))}
                        </span>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <p className="py-4 text-center text-xs text-gray-400">
                    No matching watches found for &ldquo;{search}&rdquo;.
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Right Actions: Brand Filter & Shopping Bag */}
          <div className="order-2 flex items-center gap-2.5 sm:gap-3 lg:order-3">
            {/* Brand Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowBrandMenu(!showBrandMenu)}
                aria-expanded={showBrandMenu}
                aria-haspopup="true"
                className="liquid-glass flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-bold text-[#f7f4ed] transition hover:border-[#d4af37]/60 hover:text-[#f7df8b]"
              >
                <span>⌚ {selectedBrand === "All" ? "Brands" : selectedBrand}</span>
                <span className="text-[10px] text-[#d4af37]">▾</span>
              </button>

              {showBrandMenu && (
                <div className="liquid-glass absolute right-0 top-full z-50 mt-2 max-h-72 w-52 overflow-y-auto rounded-2xl border border-[#d4af37]/40 py-2 shadow-2xl">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedBrand("All");
                      setShowBrandMenu(false);
                    }}
                    className={`block w-full px-4 py-2 text-left text-xs transition ${
                      selectedBrand === "All"
                        ? "bg-[#d4af37]/20 font-bold text-[#f7df8b]"
                        : "text-gray-300 hover:bg-white/10 hover:text-white"
                    }`}
                  >
                    All Luxury Brands ({activeWatches.length})
                  </button>
                  {brands.map((b) => (
                    <button
                      key={b}
                      type="button"
                      onClick={() => {
                        setSelectedBrand(b);
                        setShowBrandMenu(false);
                        document
                          .getElementById("collection")
                          ?.scrollIntoView({ behavior: "smooth" });
                      }}
                      className={`block w-full px-4 py-2 text-left text-xs transition ${
                        selectedBrand === b
                          ? "bg-[#d4af37]/20 font-bold text-[#f7df8b]"
                          : "text-gray-300 hover:bg-white/10 hover:text-white"
                      }`}
                    >
                      {b}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Shopping Bag Pill with Live Counter & Total */}
            <Link
              to="/cart"
              aria-label="View shopping bag"
              className="liquid-glass-gold flex items-center gap-2.5 rounded-xl px-3.5 py-2 text-xs font-bold text-[#f7f4ed] transition hover:scale-105 hover:border-[#f7df8b]"
            >
              <span className="relative text-sm">
                👜
                {cartCount > 0 && (
                  <span className=" -right-2 -top-2 absolute flex h-4 min-w-4 items-center justify-center rounded-full bg-[#f7df8b] px-1 text-[9px] font-black text-[#070709]">
                    {cartCount}
                  </span>
                )}
              </span>
              <span className="hidden sm:inline font-mono text-[#f7df8b]">
                {cartCount > 0 ? formatTaka(cartTotal) : "Bag"}
              </span>
            </Link>
          </div>
        </div>

        {/* Amazon-Style Secondary Quick Category & Brand Bar */}
        <div className="border-t border-white/5 bg-white/[0.02] px-4 py-2 sm:px-6 md:px-10">
          <div className="mx-auto flex max-w-7xl items-center gap-2 overflow-x-auto no-scrollbar text-xs">
            {[
              ["All Timepieces", "All"],
              ["Men's Watches", "Men's Watch"],
              ["Women's Watches", "Women's Watch"],
              ["Couple Sets", "Couple Watch"],
              ["🔥 Special Offers", "Offers"],
            ].map(([label, catVal]) => {
              const active = selectedCategory === catVal;
              return (
                <button
                  key={catVal}
                  type="button"
                  onClick={() => {
                    handleSelectCategory(catVal);
                    document
                      .getElementById("collection")
                      ?.scrollIntoView({ behavior: "smooth" });
                  }}
                  className={`shrink-0 rounded-full px-3.5 py-1 text-[11px] font-bold transition-all duration-200 ${
                    active
                      ? "bg-gradient-to-r from-[#f7df8b] to-[#d4af37] text-[#070709] shadow-[0_0_15px_rgba(212,175,55,0.4)]"
                      : "text-gray-300 hover:bg-white/10 hover:text-[#f7df8b]"
                  }`}
                >
                  {label}
                </button>
              );
            })}

            <span className="mx-1 h-3.5 w-px bg-white/15 shrink-0" />

            {["Rolex", "Omega", "Cartier", "Patek Philippe"].map((b) => (
              <button
                key={b}
                type="button"
                onClick={() => {
                  setSelectedBrand(selectedBrand === b ? "All" : b);
                  document
                    .getElementById("collection")
                    ?.scrollIntoView({ behavior: "smooth" });
                }}
                className={`shrink-0 rounded-full border px-3 py-0.5 text-[11px] font-medium transition ${
                  selectedBrand === b
                    ? "border-[#d4af37] bg-[#d4af37]/20 text-[#f7df8b]"
                    : "border-white/10 text-gray-400 hover:border-[#d4af37]/50 hover:text-gray-200"
                }`}
              >
                {b}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* ====================================================================
          ANIMATED HERO SHOWCASE — SLIDING WATCHES FROM ONE SIDE + LIQUID GLASS
         ==================================================================== */}
      <section className="px-4 pt-6 pb-4 sm:px-6 md:px-10 md:pt-8">
        <div className="liquid-glass relative mx-auto max-w-7xl overflow-hidden rounded-[32px] p-6 sm:p-8 md:p-11">
          {/* Specular Top Sheen */}
          <div
            className="pointer-events-none absolute inset-x-10 top-0 h-px bg-gradient-to-r from-transparent via-white/50 to-transparent"
            aria-hidden="true"
          />

          {/* Ambient Glows inside Hero */}
          <div
            className="pointer-events-none absolute -left-24 -top-24 h-80 w-80 rounded-full bg-[#d4af37]/15 blur-3xl"
            aria-hidden="true"
          />
          <div
            className="pointer-events-none absolute -right-20 -bottom-20 h-96 w-96 rounded-full bg-amber-500/10 blur-3xl"
            aria-hidden="true"
          />

          <div className="relative z-10 grid items-center gap-8 lg:grid-cols-12">
            {/* Left 6 Cols: Animated Hero Typography & Live Slide Info */}
            <div className="lg:col-span-6">
              <div
                key={`text-${activeSlide.id}`}
                className="animate-hero-slide-left"
              >
                <span className="liquid-glass-gold inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-[10px] sm:text-xs font-extrabold tracking-[3px] text-[#f7df8b]">
                  <span className="h-2 w-2 rounded-full bg-[#f7df8b] animate-ping" />
                  {activeSlide.badge}
                </span>

                <h1 className="mt-4 text-3xl font-black leading-[1.1] tracking-tight text-[#f7f4ed] sm:text-5xl lg:text-6xl">
                  YOUR TIME.
                  <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#f7df8b] via-[#d4af37] to-[#b58e31]">
                    {activeSlide.title.toUpperCase()}
                  </span>
                </h1>

                <p className="mt-4 max-w-xl text-xs sm:text-sm leading-6 text-gray-300">
                  Experience handcrafted horology with our{" "}
                  <strong className="text-[#f7df8b]">{activeSlide.brand}</strong>{" "}
                  collection. Engineered with sapphire crystal glass, luminous
                  hands, and timeless prestige.
                </p>

                {/* Live Featured Watch Price & Specs Bar */}
                <div className="mt-5 flex flex-wrap items-center gap-3">
                  <div className="liquid-glass rounded-2xl px-4 py-2.5">
                    <span className="block text-[10px] uppercase tracking-wider text-gray-400">
                      Special Offer Price
                    </span>
                    <div className="flex items-baseline gap-2">
                      <span className="text-xl font-black text-[#f7df8b]">
                        {formatTaka(activeSlide.price)}
                      </span>
                      <span className="text-xs text-gray-400 line-through">
                        {formatTaka(activeSlide.oldPrice)}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {[activeSlide.spec1, activeSlide.spec2, activeSlide.spec3].map(
                      (sp) => (
                        <span
                          key={sp}
                          className="liquid-glass rounded-xl px-3 py-2 text-[11px] font-semibold text-gray-200"
                        >
                          ✦ {sp}
                        </span>
                      )
                    )}
                  </div>
                </div>

                {/* Hero CTAs */}
                <div className="mt-7 flex flex-wrap items-center gap-3.5">
                  <button
                    type="button"
                    onClick={() => navigate(`/product/${activeSlide.id}`)}
                    className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-[#f7df8b] via-[#d4af37] to-[#b58e31] px-7 py-3.5 text-xs font-black tracking-widest text-[#070709] shadow-[0_10px_28px_rgba(212,175,55,0.35)] transition-all duration-300 hover:scale-105 hover:brightness-110"
                  >
                    INSPECT TIMEPIECE →
                  </button>

                  <a
                    href="#collection"
                    className="liquid-glass inline-flex items-center gap-2 rounded-2xl px-6 py-3.5 text-xs font-bold tracking-wider text-[#f7f4ed] transition-all duration-300 hover:scale-105 hover:border-[#d4af37] hover:text-[#f7df8b]"
                  >
                    EXPLORE ALL 12 WATCHES
                  </a>
                </div>
              </div>
            </div>

            {/* Right 6 Cols: Directional Sliding Watch Showcase + Floating Liquid Glass Badges */}
            <div className="lg:col-span-6">
              <div className="relative">
                {/* Main Animated Watch Stage */}
                <div
                  key={`slide-${currentHero}-${slideDirection}`}
                  className={`relative aspect-[16/11] w-full overflow-hidden rounded-[26px] border border-white/20 bg-[#0b0b0e] shadow-[0_25px_60px_rgba(0,0,0,0.85)] ${
                    slideDirection === "right"
                      ? "animate-hero-slide-right"
                      : "animate-hero-slide-left"
                  }`}
                >
                  <img
                    src={activeSlide.image}
                    alt={activeSlide.title}
                    onError={handleImageFallback}
                    className="h-full w-full object-cover object-center transition-transform duration-1000 hover:scale-105"
                  />

                  {/* Subtle Dark Vignette for Badge Contrast */}
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/75 via-black/15 to-transparent" />

                  {/* Floating Liquid Glass Badge Top-Left */}
                  <div className="liquid-glass animate-gentle-float absolute left-4 top-4 rounded-2xl px-3.5 py-2 text-xs">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-[#f7df8b]">
                      {activeSlide.brand}
                    </p>
                    <p className="font-semibold text-white">{activeSlide.spec1}</p>
                  </div>

                  {/* Floating Liquid Glass Price Pill Bottom-Left */}
                  <div className="liquid-glass-gold animate-badge-float absolute bottom-5 left-4 right-4 flex items-center justify-between rounded-2xl px-4 py-3 sm:right-auto sm:min-w-[270px]">
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-[#f7df8b]">
                        Featured Timepiece
                      </p>
                      <p className="text-sm font-extrabold text-white">
                        {activeSlide.title}
                      </p>
                    </div>
                    <span className="ml-4 rounded-xl bg-[#f7df8b] px-3 py-1.5 text-xs font-black text-[#070709]">
                      {formatTaka(activeSlide.price)}
                    </span>
                  </div>

                  {/* Prev / Next Slide Controls */}
                  <div className="absolute right-4 top-4 flex items-center gap-2">
                    <button
                      type="button"
                      aria-label="Previous watch slide"
                      onClick={() =>
                        handleHeroChange(
                          currentHero === 0
                            ? heroShowcaseSlides.length - 1
                            : currentHero - 1,
                          "left"
                        )
                      }
                      className="liquid-orb flex h-9 w-9 items-center justify-center rounded-full text-base font-bold text-white transition hover:scale-110 hover:text-[#f7df8b]"
                    >
                      ‹
                    </button>
                    <button
                      type="button"
                      aria-label="Next watch slide"
                      onClick={() =>
                        handleHeroChange(
                          (currentHero + 1) % heroShowcaseSlides.length,
                          "right"
                        )
                      }
                      className="liquid-orb flex h-9 w-9 items-center justify-center rounded-full text-base font-bold text-white transition hover:scale-110 hover:text-[#f7df8b]"
                    >
                      ›
                    </button>
                  </div>

                  {/* Live 5-Second Gold Progress Bar */}
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/10">
                    <div
                      key={`prog-${currentHero}`}
                      className="animate-hero-progress h-full bg-gradient-to-r from-[#f7df8b] to-[#d4af37]"
                    />
                  </div>
                </div>

                {/* Sliding Thumbnail Filmstrip Queue (Incoming Watches from Side) */}
                <div className="mt-3.5 grid grid-cols-5 gap-2.5">
                  {heroShowcaseSlides.map((slide, idx) => {
                    const isCurrent = currentHero === idx;
                    return (
                      <button
                        key={slide.id}
                        type="button"
                        onClick={() =>
                          handleHeroChange(
                            idx,
                            idx > currentHero ? "right" : "left"
                          )
                        }
                        aria-label={`Select ${slide.title}`}
                        className={`group relative overflow-hidden rounded-2xl border p-1 transition-all duration-300 ${
                          isCurrent
                            ? "border-[#f7df8b] bg-[#d4af37]/20 scale-105 shadow-[0_6px_20px_rgba(212,175,55,0.3)]"
                            : "border-white/10 bg-white/[0.03] opacity-65 hover:opacity-100 hover:scale-105"
                        }`}
                      >
                        <div className="aspect-[4/3] w-full overflow-hidden rounded-xl">
                          <img
                            src={slide.image}
                            alt={slide.title}
                            onError={handleImageFallback}
                            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                          />
                        </div>
                        <p className="mt-1 truncate text-[9px] font-bold text-gray-200 px-1">
                          {slide.brand.split(" ")[0]}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ====================================================================
          CURATED CATEGORY SPOTLIGHT PILLS (LIQUID GLASS)
         ==================================================================== */}
      <section className="px-4 py-4 sm:px-6 md:px-10">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
          {[
            {
              title: "Men's Horology",
              cat: "Men's Watch",
              sub: "Chronographs & Divers",
              img: "https://images.unsplash.com/photo-1523170335258-f5ed11844a49?w=400&auto=format&fit=crop&q=80",
            },
            {
              title: "Women's Elegance",
              cat: "Women's Watch",
              sub: "Rose Gold & Mother of Pearl",
              img: "https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=400&auto=format&fit=crop&q=80",
            },
            {
              title: "Couple Gift Sets",
              cat: "Couple Watch",
              sub: "Matching His & Hers Pairs",
              img: "https://images.unsplash.com/photo-1542496658-e33a6d0d50f6?w=400&auto=format&fit=crop&q=80",
            },
            {
              title: "Privilege Offers",
              cat: "Offers",
              sub: "Up to 22% Off Luxury Pieces",
              img: "https://images.unsplash.com/photo-1587836374828-4dbafa94cf0e?w=400&auto=format&fit=crop&q=80",
            },
          ].map((spot) => {
            const active = selectedCategory === spot.cat;
            return (
              <button
                key={spot.cat}
                type="button"
                onClick={() => {
                  handleSelectCategory(active ? "All" : spot.cat);
                  document
                    .getElementById("collection")
                    ?.scrollIntoView({ behavior: "smooth" });
                }}
                className={`liquid-glass dock-card-hover flex items-center gap-3 rounded-2xl p-2.5 sm:p-3 text-left ${
                  active ? "border-[#f7df8b] ring-1 ring-[#f7df8b]/50" : ""
                }`}
              >
                <img
                  src={spot.img}
                  alt={spot.title}
                  onError={handleImageFallback}
                  className="h-12 w-12 sm:h-14 sm:w-14 shrink-0 rounded-xl object-cover border border-white/15"
                />
                <div className="min-w-0">
                  <p className="truncate text-xs sm:text-sm font-bold text-[#f7f4ed]">
                    {spot.title}
                  </p>
                  <p className="truncate text-[10px] text-[#d4af37]">
                    {spot.sub}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* ====================================================================
          MAIN COLLECTION SECTION (FLOATING-DOCK HOVER CARDS)
         ==================================================================== */}
      <section
        id="collection"
        className="scroll-mt-28 px-4 py-8 sm:px-6 md:px-10 md:py-12"
      >
        <div className="mx-auto max-w-7xl">
          {/* Header & Sort Controls */}
          <div className="liquid-glass flex flex-col gap-4 rounded-2xl p-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
            <div>
              <p className="text-[10px] font-extrabold tracking-[4px] text-[#d4af37] uppercase">
                TimeLux Vault • Hover to Magnify
              </p>
              <h2 className="mt-1 text-xl sm:text-2xl font-black tracking-tight text-[#f7f4ed]">
                {selectedCategory === "All"
                  ? "Complete Luxury Collection"
                  : selectedCategory === "Offers"
                  ? "Special Privilege Offers"
                  : selectedCategory}
              </h2>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold text-[#f7df8b]">
                {sortedWatches.length}{" "}
                {sortedWatches.length === 1 ? "Timepiece" : "Timepieces"}
              </span>

              <div className="flex items-center gap-2">
                <label htmlFor="price-sort" className="sr-only">
                  Sort products
                </label>
                <select
                  id="price-sort"
                  value={priceSort}
                  onChange={(e) => setPriceSort(e.target.value)}
                  className="liquid-glass cursor-pointer rounded-xl px-3.5 py-2 text-xs font-semibold text-[#f7f4ed] outline-none transition hover:border-[#d4af37]"
                >
                  <option value="default" className="bg-[#121216]">
                    Sort: Featured
                  </option>
                  <option value="low-to-high" className="bg-[#121216]">
                    Price: Low to High
                  </option>
                  <option value="high-to-low" className="bg-[#121216]">
                    Price: High to Low
                  </option>
                </select>
              </div>
            </div>
          </div>

          {/* Active Filter Chips */}
          {hasActiveFilters && (
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <span className="text-xs text-gray-400">Active Filters:</span>

              {selectedCategory !== "All" && (
                <button
                  type="button"
                  onClick={() => handleSelectCategory("All")}
                  className="liquid-glass-gold inline-flex items-center gap-1.5 rounded-full px-3.5 py-1 text-xs font-bold text-[#f7df8b]"
                >
                  <span>Category: {selectedCategory}</span>
                  <span>✕</span>
                </button>
              )}

              {selectedBrand !== "All" && (
                <button
                  type="button"
                  onClick={() => setSelectedBrand("All")}
                  className="liquid-glass-gold inline-flex items-center gap-1.5 rounded-full px-3.5 py-1 text-xs font-bold text-[#f7df8b]"
                >
                  <span>Brand: {selectedBrand}</span>
                  <span>✕</span>
                </button>
              )}

              {search.trim() !== "" && (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  className="liquid-glass-gold inline-flex items-center gap-1.5 rounded-full px-3.5 py-1 text-xs font-bold text-[#f7df8b]"
                >
                  <span>Search: &ldquo;{search.trim()}&rdquo;</span>
                  <span>✕</span>
                </button>
              )}

              {priceSort !== "default" && (
                <button
                  type="button"
                  onClick={() => setPriceSort("default")}
                  className="liquid-glass-gold inline-flex items-center gap-1.5 rounded-full px-3.5 py-1 text-xs font-bold text-[#f7df8b]"
                >
                  <span>
                    Sort:{" "}
                    {priceSort === "low-to-high" ? "Low to High" : "High to Low"}
                  </span>
                  <span>✕</span>
                </button>
              )}

              <button
                type="button"
                onClick={resetAllFilters}
                className="ml-1 text-xs font-bold text-[#d4af37] underline underline-offset-4 hover:text-white"
              >
                Clear All
              </button>
            </div>
          )}

          {/* Product Grid */}
          {loading ? (
            <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 sm:gap-6">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                <div
                  key={i}
                  className="liquid-glass aspect-[3/4] animate-pulse rounded-2xl"
                />
              ))}
            </div>
          ) : sortedWatches.length > 0 ? (
            <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 sm:gap-6">
              {sortedWatches.map((watch, index) => (
                <ProductCard key={watch.id} watch={watch} index={index} />
              ))}
            </div>
          ) : (
            <div className="liquid-glass mt-12 rounded-3xl p-12 text-center">
              <p className="text-4xl">⌚</p>
              <h3 className="mt-4 text-lg font-bold text-[#f7f4ed]">
                No Matching Timepieces Found
              </h3>
              <p className="mt-2 text-xs text-gray-400">
                Try clearing your search filter or exploring all luxury categories.
              </p>
              <button
                type="button"
                onClick={resetAllFilters}
                className="mt-6 inline-flex rounded-xl bg-gradient-to-r from-[#f7df8b] to-[#d4af37] px-6 py-2.5 text-xs font-black text-[#070709] transition hover:scale-105"
              >
                Reset All Filters
              </button>
            </div>
          )}
        </div>
      </section>

      {/* ====================================================================
          ABOUT & CRAFTSMANSHIP SECTION
         ==================================================================== */}
      <section
        id="about"
        className="scroll-mt-24 px-4 py-12 sm:px-6 md:px-10"
      >
        <div className="liquid-glass mx-auto max-w-7xl rounded-3xl p-8 sm:p-12 text-center">
          <p className="text-[10px] font-bold tracking-[4px] text-[#d4af37] uppercase">
            The TimeLux Standard
          </p>
          <h2 className="mt-2 text-2xl sm:text-3xl font-black tracking-tight text-[#f7f4ed]">
            Every Second Tells a Story
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-xs sm:text-sm leading-6 text-gray-300">
            TimeLux curates fine wristwatches that unite Swiss-inspired precision
            with enduring aesthetics. Every timepiece undergoes multi-point
            inspection before express delivery to your doorstep in Bangladesh.
          </p>

          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            {[
              ["100% Authentic Quality", "Verified movements & sapphire glass"],
              ["Nationwide Express COD", "Inspect your watch upon delivery"],
              ["Official Warranty Care", "Up to 5 years concierge coverage"],
            ].map(([title, desc]) => (
              <div
                key={title}
                className="rounded-2xl border border-white/10 bg-white/[0.03] p-5"
              >
                <p className="text-sm font-bold text-[#f7df8b]">✦ {title}</p>
                <p className="mt-1 text-xs text-gray-400">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ====================================================================
          CONTACT & CONCIERGE SECTION (#contact)
         ==================================================================== */}
      <section
        id="contact"
        className="scroll-mt-24 px-4 py-10 sm:px-6 md:px-10"
      >
        <div className="mx-auto max-w-5xl">
          <div className="text-center">
            <p className="text-[10px] font-bold tracking-[4px] text-[#d4af37] uppercase">
              Personal Horology Concierge
            </p>
            <h2 className="mt-2 text-2xl sm:text-3xl font-black text-[#f7f4ed]">
              Connect With TimeLux
            </h2>
          </div>

          <div className="mt-8 grid gap-5 sm:grid-cols-3">
            <div className="liquid-glass dock-card-hover rounded-2xl p-6 text-center">
              <span className="text-2xl text-[#f7df8b]">✆</span>
              <h3 className="mt-3 text-sm font-bold text-[#f7f4ed]">
                WhatsApp Concierge
              </h3>
              <p className="mt-1 text-xs text-gray-400">+880 1311-657122</p>
              <a
                href="https://wa.me/8801311657122"
                target="_blank"
                rel="noreferrer"
                className="mt-4 inline-block text-xs font-bold text-[#f7df8b] hover:underline"
              >
                Chat Live →
              </a>
            </div>

            <div className="liquid-glass dock-card-hover rounded-2xl p-6 text-center">
              <span className="text-2xl text-[#f7df8b]">✉</span>
              <h3 className="mt-3 text-sm font-bold text-[#f7f4ed]">
                Email Support
              </h3>
              <p className="mt-1 text-xs text-gray-400">timelux@example.com</p>
              <a
                href="mailto:timelux@example.com"
                className="mt-4 inline-block text-xs font-bold text-[#f7df8b] hover:underline"
              >
                Send Inquiry →
              </a>
            </div>

            <div className="liquid-glass dock-card-hover rounded-2xl p-6 text-center">
              <span className="text-2xl text-[#f7df8b]">📍</span>
              <h3 className="mt-3 text-sm font-bold text-[#f7f4ed]">
                Express Delivery
              </h3>
              <p className="mt-1 text-xs text-gray-400">
                Cash on Delivery across Bangladesh
              </p>
              <span className="mt-4 inline-block text-xs font-bold text-gray-300">
                24–72 Hours Dispatch
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ====================================================================
          PREMIUM FOOTER
         ==================================================================== */}
      <footer className="mt-8 border-t border-white/10 bg-[#050507] px-4 py-12 sm:px-6 md:px-10">
        <div className="mx-auto grid max-w-7xl gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <h3 className="text-xl font-black tracking-[4px] text-[#d4af37]">
              TIMELUX
            </h3>
            <p className="mt-3 text-xs leading-6 text-gray-400">
              Luxury in Every Second. Discover fine timepieces crafted for
              elegance, mechanical precision, and enduring prestige.
            </p>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#f7df8b]">
              Collections
            </h4>
            <ul className="mt-4 space-y-2.5 text-xs text-gray-400">
              <li>
                <button
                  type="button"
                  onClick={() => handleSelectCategory("Men's Watch")}
                  className="hover:text-[#f7df8b] transition"
                >
                  Men&apos;s Luxury Watches
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => handleSelectCategory("Women's Watch")}
                  className="hover:text-[#f7df8b] transition"
                >
                  Women&apos;s Timepieces
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => handleSelectCategory("Couple Watch")}
                  className="hover:text-[#f7df8b] transition"
                >
                  Couple Gift Sets
                </button>
              </li>
              <li>
                <a href="#contact" className="hover:text-[#f7df8b] transition">
                  Contact &amp; Support
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#f7df8b]">
              Customer Care
            </h4>
            <ul className="mt-4 space-y-2.5 text-xs text-gray-400">
              <li>
                <a
                  href="https://wa.me/8801311657122"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-[#f7df8b] transition"
                >
                  WhatsApp Concierge
                </a>
              </li>
              <li>
                <Link to="/cart" className="hover:text-[#f7df8b] transition">
                  Shopping Bag
                </Link>
              </li>
              <li>
                <Link to="/checkout" className="hover:text-[#f7df8b] transition">
                  Direct Checkout
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#f7df8b]">
              VIP Concierge
            </h4>
            <p className="mt-4 text-xs leading-5 text-gray-400">
              Need assistance choosing the right timepiece? Speak directly with
              our watch specialists.
            </p>
            <a
              href="https://wa.me/8801311657122"
              target="_blank"
              rel="noreferrer"
              className="liquid-glass-gold mt-4 inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold text-[#f7df8b] transition hover:scale-105"
            >
              <span>✆</span> Chat on WhatsApp
            </a>
          </div>
        </div>

        <div className="mx-auto mt-10 max-w-7xl border-t border-white/5 pt-6 text-center">
          <p className="text-[11px] text-gray-500">
            © 2026 TimeLux. All Rights Reserved. Luxury in Every Second.
          </p>
        </div>
      </footer>
    </div>
  );
}

// Main Application Routes
export default function App() {
  return (
    <Routes>
      {/* Storefront Layout with Floating Dock */}
      <Route element={<StorefrontLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/product/:id" element={<ProductDetails />} />
        <Route path="/cart" element={<Cart />} />
      </Route>

      {/* Checkout uses compact dedicated header without dock */}
      <Route path="/checkout" element={<Checkout />} />

      {/* Admin Login */}
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
