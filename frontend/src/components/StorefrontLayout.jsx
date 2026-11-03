import { Outlet } from "react-router-dom";
import FloatingDock from "./FloatingDock";

/**
 * Shared layout wrapper for Storefront pages (Home, ProductDetails, Cart).
 * Mounts the FloatingDock exactly once and reserves left margin space
 * to guarantee that content, text, cards, and controls are never obscured.
 */
export default function StorefrontLayout() {
  return (
    <div className="relative min-h-screen bg-[#09090b] text-[#f5f1e8] selection:bg-[#d4af37]/30 selection:text-[#f5f1e8]">
      {/* Floating Glass Side Dock (Mounted once) */}
      <FloatingDock />

      {/* Reserved Layout Content Area */}
      <div className="w-full pl-14 sm:pl-16 md:pl-24 lg:pl-28 transition-all duration-300">
        <Outlet />
      </div>
    </div>
  );
}
