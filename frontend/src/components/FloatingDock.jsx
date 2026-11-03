import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { useCart } from "../context/useCart";

// Crisp SVG Icons for the Liquid Glass Floating Dock
function HomeIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.85" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M3 9.5L12 3l9 6.5V20a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1V9.5z" />
    </svg>
  );
}

function CollectionIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.85" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3" y="3" width="7" height="7" rx="1.75" />
      <rect x="14" y="3" width="7" height="7" rx="1.75" />
      <rect x="3" y="14" width="7" height="7" rx="1.75" />
      <rect x="14" y="14" width="7" height="7" rx="1.75" />
    </svg>
  );
}

function MensWatchIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.85" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M9 2h6l1 4h-8l1-4z" />
      <circle cx="12" cy="12" r="6" />
      <polyline points="12 9 12 12 14.5 13.5" />
      <path d="M9 22h6l1-4h-8l1 4z" />
    </svg>
  );
}

function WomensWatchIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.85" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M10 2.5h4l.5 3.5h-5l.5-3.5z" />
      <circle cx="12" cy="12" r="5.5" />
      <path d="M12 9.2l1.2 2.8-1.2 2.8-1.2-2.8 1.2-2.8z" />
      <path d="M10 21.5h4l.5-3.5h-5l.5 3.5z" />
    </svg>
  );
}

function CoupleWatchIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.85" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="9" cy="12" r="5" />
      <circle cx="15" cy="12" r="5" />
      <polyline points="9 10 9 12 10.5 13" />
    </svg>
  );
}

function OffersIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.85" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 2l2.4 5.2L20 8.5l-4 4.1.9 5.7-4.9-2.7-4.9 2.7.9-5.7-4-4.1 5.6-1.3L12 2z" />
    </svg>
  );
}

function CartIcon({ count }) {
  return (
    <div className="relative flex items-center justify-center">
      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.85" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
        <line x1="3" y1="6" x2="21" y2="6" />
        <path d="M16 10a4 4 0 0 1-8 0" />
      </svg>
      {count > 0 && (
        <span
          className=" -right-2.5 -top-2.5 absolute flex h-4 min-w-4 items-center justify-center rounded-full bg-gradient-to-r from-[#f7df8b] to-[#d4af37] px-1 text-[9px] font-black text-[#070709] shadow-sm ring-1 ring-[#121216]"
          aria-label={`${count} items in cart`}
        >
          {count > 99 ? "99+" : count}
        </span>
      )}
    </div>
  );
}

export default function FloatingDock() {
  const location = useLocation();
  const navigate = useNavigate();
  const { cartCount } = useCart();

  // Fixed-position slot refs (never change size, preventing layout jitter/oscillation)
  const slotRefs = useRef([]);
  // Inner visual orb refs (animated purely via GPU transform: translate3d & scale)
  const orbRefs = useRef([]);
  const rafId = useRef(null);

  // Smooth Critically-Damped Lerp state (zero overshoot / zero vibration)
  const animState = useRef([]);
  const mouseYRef = useRef(null);
  const focusedIndexRef = useRef(null);

  const [activeTooltipIndex, setActiveTooltipIndex] = useState(null);
  const [focusedIndex, setFocusedIndex] = useState(null);
  const [touchPreviewIndex, setTouchPreviewIndex] = useState(null);

  const touchStartPos = useRef({ x: 0, y: 0, time: 0 });
  const isDragging = useRef(false);

  const queryParams = useMemo(() => new URLSearchParams(location.search), [location.search]);
  const currentCategory = queryParams.get("category");
  const isHomePage = location.pathname === "/";
  const isCartPage = location.pathname === "/cart";
  const currentHash = location.hash;

  const dockActions = useMemo(
    () => [
      {
        id: "home",
        label: "Home",
        to: "/",
        icon: <HomeIcon />,
        isActive: isHomePage && !currentHash && !currentCategory,
        onClick: () => {
          if (isHomePage) {
            navigate("/");
            window.scrollTo({ top: 0, behavior: "smooth" });
          } else {
            navigate("/");
          }
        },
      },
      {
        id: "collection",
        label: "All Watches",
        to: "/#collection",
        icon: <CollectionIcon />,
        isActive:
          isHomePage &&
          currentHash === "#collection" &&
          (!currentCategory || currentCategory === "All"),
        onClick: () => {
          navigate("/#collection");
          setTimeout(() => {
            document.getElementById("collection")?.scrollIntoView({ behavior: "smooth" });
          }, 60);
        },
      },
      {
        id: "mens-watches",
        label: "Men's Watches",
        to: "/?category=Men%27s+Watch#collection",
        icon: <MensWatchIcon />,
        isActive: isHomePage && currentCategory === "Men's Watch",
        onClick: () => {
          navigate("/?category=Men%27s+Watch#collection");
          setTimeout(() => {
            document.getElementById("collection")?.scrollIntoView({ behavior: "smooth" });
          }, 80);
        },
      },
      {
        id: "womens-watches",
        label: "Women's Watches",
        to: "/?category=Women%27s+Watch#collection",
        icon: <WomensWatchIcon />,
        isActive: isHomePage && currentCategory === "Women's Watch",
        onClick: () => {
          navigate("/?category=Women%27s+Watch#collection");
          setTimeout(() => {
            document.getElementById("collection")?.scrollIntoView({ behavior: "smooth" });
          }, 80);
        },
      },
      {
        id: "couple-watches",
        label: "Couple Watches",
        to: "/?category=Couple+Watch#collection",
        icon: <CoupleWatchIcon />,
        isActive: isHomePage && currentCategory === "Couple Watch",
        onClick: () => {
          navigate("/?category=Couple+Watch#collection");
          setTimeout(() => {
            document.getElementById("collection")?.scrollIntoView({ behavior: "smooth" });
          }, 80);
        },
      },
      {
        id: "offers",
        label: "Exclusive Offers",
        to: "/?category=Offers#collection",
        icon: <OffersIcon />,
        isActive: isHomePage && currentCategory === "Offers",
        onClick: () => {
          navigate("/?category=Offers#collection");
          setTimeout(() => {
            document.getElementById("collection")?.scrollIntoView({ behavior: "smooth" });
          }, 80);
        },
      },
      {
        id: "cart",
        label: `Shopping Bag (${cartCount})`,
        to: "/cart",
        icon: <CartIcon count={cartCount} />,
        isActive: isCartPage,
        onClick: () => {
          navigate("/cart");
        },
      },
    ],
    [isHomePage, isCartPage, currentHash, currentCategory, cartCount, navigate]
  );

  // Initialize smooth interpolation state
  useEffect(() => {
    animState.current = dockActions.map((_, i) => ({
      scale: animState.current[i]?.scale || 1,
      targetScale: 1,
      shiftX: animState.current[i]?.shiftX || 0,
      targetShiftX: 0,
    }));
  }, [dockActions]);

  // Critically damped smooth animation loop (zero layout shift, zero jitter)
  const startSmoothLoop = useCallback(() => {
    if (rafId.current) return;

    function tick() {
      const isMobile = typeof window !== "undefined" && window.innerWidth < 768;
      // Balanced, refined max scale: 1.36x on desktop, 1.24x on mobile
      const maxScale = isMobile ? 1.24 : 1.36;
      const maxShiftX = isMobile ? 4 : 7;
      const falloffRadius = isMobile ? 85 : 110;
      const mouseY = mouseYRef.current;

      let closestIdx = null;
      let closestDist = Infinity;

      // 1. Measure against FIXED slot positions so centers never shift during scaling
      slotRefs.current.forEach((slotEl, idx) => {
        const state = animState.current[idx];
        if (!slotEl || !state) return;

        if (mouseY !== null) {
          const rect = slotEl.getBoundingClientRect();
          const centerY = rect.top + rect.height / 2;
          const dist = Math.abs(mouseY - centerY);

          if (dist < closestDist) {
            closestDist = dist;
            closestIdx = idx;
          }

          if (dist < falloffRadius) {
            // Smooth cosine bell curve
            const normalized = dist / falloffRadius;
            const curve = 0.5 * (1 + Math.cos(normalized * Math.PI));
            state.targetScale = 1 + (maxScale - 1) * curve;
            state.targetShiftX = maxShiftX * curve;
          } else {
            state.targetScale = 1;
            state.targetShiftX = 0;
          }
        } else if (focusedIndexRef.current === idx) {
          state.targetScale = isMobile ? 1.2 : 1.28;
          state.targetShiftX = 5;
        } else {
          state.targetScale = 1;
          state.targetShiftX = 0;
        }
      });

      if (mouseY !== null && closestDist < 34) {
        setActiveTooltipIndex((prev) => (prev !== closestIdx ? closestIdx : prev));
      } else if (mouseY === null) {
        setActiveTooltipIndex((prev) => (prev !== null ? null : prev));
      }

      // 2. Smooth exponential interpolation (Lerp factor 0.18 = silky smooth, no bounce/vibration)
      let stillMoving = false;
      const lerpFactor = 0.18;

      orbRefs.current.forEach((orbEl, idx) => {
        const state = animState.current[idx];
        if (!orbEl || !state) return;

        state.scale += (state.targetScale - state.scale) * lerpFactor;
        state.shiftX += (state.targetShiftX - state.shiftX) * lerpFactor;

        if (
          Math.abs(state.targetScale - state.scale) > 0.002 ||
          Math.abs(state.targetShiftX - state.shiftX) > 0.05
        ) {
          stillMoving = true;
        } else {
          state.scale = state.targetScale;
          state.shiftX = state.targetShiftX;
        }

        orbEl.style.transform = `translate3d(${state.shiftX.toFixed(2)}px, 0, 0) scale(${state.scale.toFixed(3)})`;
      });

      if (stillMoving || mouseYRef.current !== null) {
        rafId.current = requestAnimationFrame(tick);
      } else {
        rafId.current = null;
      }
    }

    rafId.current = requestAnimationFrame(tick);
  }, []);

  const handlePointerMove = (e) => {
    if (e.pointerType === "touch") return;
    mouseYRef.current = e.clientY;
    startSmoothLoop();
  };

  const handlePointerLeave = () => {
    mouseYRef.current = null;
    startSmoothLoop();
  };

  const handleTouchPointerDown = (e, index) => {
    if (e.pointerType !== "touch") return;
    touchStartPos.current = { x: e.clientX, y: e.clientY, time: e.timeStamp };
    isDragging.current = false;
    setTouchPreviewIndex(index);
    mouseYRef.current = e.clientY;
    startSmoothLoop();
  };

  const handleTouchPointerMove = (e) => {
    if (e.pointerType !== "touch") return;
    const dx = Math.abs(e.clientX - touchStartPos.current.x);
    const dy = Math.abs(e.clientY - touchStartPos.current.y);
    if (dx > 8 || dy > 8) {
      isDragging.current = true;
    }
    mouseYRef.current = e.clientY;
    startSmoothLoop();
  };

  const handleTouchPointerUp = (e, action) => {
    if (e.pointerType !== "touch") return;
    const wasDragging = isDragging.current;
    setTouchPreviewIndex(null);
    mouseYRef.current = null;
    startSmoothLoop();

    if (!wasDragging) {
      action.onClick();
    }
  };

  const handleTouchPointerCancel = () => {
    setTouchPreviewIndex(null);
    isDragging.current = false;
    mouseYRef.current = null;
    startSmoothLoop();
  };

  const handleItemFocus = (index) => {
    focusedIndexRef.current = index;
    setFocusedIndex(index);
    startSmoothLoop();
  };

  const handleItemBlur = () => {
    focusedIndexRef.current = null;
    setFocusedIndex(null);
    startSmoothLoop();
  };

  useEffect(() => {
    return () => {
      if (rafId.current) cancelAnimationFrame(rafId.current);
    };
  }, []);

  return (
    <aside
      aria-label="Store navigation dock"
      className="fixed left-2 sm:left-4 top-1/2 -translate-y-1/2 z-50 select-none print:hidden"
    >
      {/* Steady-Width iOS Liquid Glass Dock Container */}
      <nav
        onPointerMove={handlePointerMove}
        onPointerLeave={handlePointerLeave}
        onPointerCancel={handleTouchPointerCancel}
        className="liquid-glass relative flex w-[54px] sm:w-[64px] flex-col items-center gap-2 sm:gap-2.5 rounded-[26px] py-3 sm:py-3.5 transition-colors duration-300 hover:border-[#d4af37]/45"
      >
        {/* Top Specular Liquid Glass Sheen */}
        <div
          className="pointer-events-none absolute inset-x-3 top-0 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent"
          aria-hidden="true"
        />

        {dockActions.map((action, index) => {
          const isCurrentActive = action.isActive;
          const isTooltipVisible =
            activeTooltipIndex === index ||
            focusedIndex === index ||
            touchPreviewIndex === index;

          return (
            <div
              key={action.id}
              ref={(el) => (slotRefs.current[index] = el)}
              className="relative flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center"
            >
              {/* Active Left Indicator Bar */}
              {isCurrentActive && (
                <span
                  className="-left-2 sm:-left-2.5 absolute top-1/2 -translate-y-1/2 h-4 w-1 rounded-r-full bg-gradient-to-b from-[#f7df8b] to-[#d4af37] shadow-[0_0_10px_#d4af37]"
                  aria-hidden="true"
                />
              )}

              {/* GPU-Transformed Circular Liquid Glass Orb */}
              <Link
                ref={(el) => (orbRefs.current[index] = el)}
                to={action.to}
                aria-label={action.label}
                aria-current={isCurrentActive ? "page" : undefined}
                onClick={(e) => {
                  e.preventDefault();
                  action.onClick();
                }}
                onFocus={() => handleItemFocus(index)}
                onBlur={handleItemBlur}
                onPointerDown={(e) => handleTouchPointerDown(e, index)}
                onPointerMove={handleTouchPointerMove}
                onPointerUp={(e) => handleTouchPointerUp(e, action)}
                className={`group relative flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-full outline-none will-change-transform transition-colors duration-200 focus-visible:ring-2 focus-visible:ring-[#d4af37] ${
                  isCurrentActive
                    ? "liquid-orb-active text-[#f7df8b]"
                    : "liquid-orb text-[#d6d2c9] hover:text-[#f7df8b] hover:border-[#d4af37]/55"
                }`}
              >
                {/* Inner Specular Highlight Arc */}
                <span
                  className="pointer-events-none absolute inset-x-1.5 top-1 h-2 rounded-full bg-gradient-to-b from-white/25 to-transparent opacity-75"
                  aria-hidden="true"
                />
                {action.icon}
              </Link>

              {/* Floating Pill Tooltip to the Right */}
              <div
                role="tooltip"
                aria-hidden={!isTooltipVisible}
                className={`liquid-glass pointer-events-none absolute left-full ml-4 top-1/2 -translate-y-1/2 z-50 whitespace-nowrap rounded-full px-3.5 py-1.5 text-xs font-bold tracking-wider text-[#f7f4ed] shadow-[0_10px_28px_rgba(0,0,0,0.7)] transition-all duration-200 ease-out ${
                  isTooltipVisible
                    ? "opacity-100 translate-x-0 scale-100 border-[#d4af37]/50"
                    : "opacity-0 -translate-x-1.5 scale-95 pointer-events-none"
                }`}
              >
                <span className="text-[#d4af37] mr-1.5">✦</span>
                {action.label}
              </div>
            </div>
          );
        })}
      </nav>
    </aside>
  );
}
