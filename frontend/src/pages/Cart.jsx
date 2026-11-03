import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../context/useCart";
import { formatTaka, getProductImage, handleImageFallback } from "../utils/watchHelpers";

export default function Cart() {
  const navigate = useNavigate();
  const {
    cartItems,
    increaseQuantity,
    decreaseQuantity,
    removeFromCart,
    clearCart,
    cartTotal,
    cartCount,
    prepareCartCheckout,
  } = useCart();

  useEffect(() => {
    document.title = "Shopping Bag — TimeLux Luxury Watches";
  }, []);

  const deliveryCharge = cartItems.length > 0 ? 100 : 0;
  const grandTotal = cartTotal + deliveryCharge;

  const handleProceedToCheckout = () => {
    prepareCartCheckout();
    navigate("/checkout");
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 md:py-12">
      {/* Header */}
      <header className="mb-8 flex items-center justify-between border-b border-[#d4af37]/20 pb-5">
        <div>
          <p className="text-[10px] sm:text-xs font-semibold tracking-[4px] text-[#d4af37] uppercase">
            Curated Selection
          </p>
          <h1 className="mt-1 text-2xl sm:text-3xl font-bold tracking-tight text-[#f5f1e8]">
            Shopping <span className="text-[#d4af37]">Bag</span>
          </h1>
        </div>

        <Link
          to="/#collection"
          className="text-xs font-semibold text-[#d4af37] transition hover:text-[#f5f1e8]"
        >
          ← Continue Shopping
        </Link>
      </header>

      {/* Empty Bag State */}
      {cartItems.length === 0 ? (
        <div className="rounded-2xl border border-[#d4af37]/20 bg-[#141416] px-6 py-20 text-center shadow-lg">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-[#d4af37]/30 bg-[#d4af37]/10 text-2xl text-[#d4af37]">
            👜
          </div>
          <h2 className="mt-5 text-xl font-bold text-[#f5f1e8]">Your Bag is Empty</h2>
          <p className="mt-2 text-xs text-gray-400 max-w-sm mx-auto leading-5">
            You haven’t added any luxury timepieces yet. Explore our handcrafted collections.
          </p>
          <Link
            to="/#collection"
            className="mt-6 inline-flex rounded-xl bg-gradient-to-r from-[#d4af37] to-[#b8964e] px-8 py-3 text-xs font-bold tracking-widest text-[#09090b] shadow-md transition hover:from-white hover:to-white"
          >
            EXPLORE TIMEPIECES →
          </Link>
        </div>
      ) : (
        <div className="grid items-start gap-8 lg:grid-cols-3">
          {/* Cart Products List */}
          <div className="space-y-4 lg:col-span-2">
            <div className="flex items-center justify-between border-b border-white/10 pb-3 text-xs text-gray-400">
              <span>{cartCount} {cartCount === 1 ? "Item" : "Items"} in Bag</span>
              <button
                type="button"
                onClick={() => {
                  if (window.confirm("Remove all items from your bag?")) {
                    clearCart();
                  }
                }}
                className="text-red-400 hover:text-red-300 transition"
              >
                Clear All
              </button>
            </div>

            {cartItems.map((item) => (
              <article
                key={item.id}
                className="flex flex-col sm:flex-row gap-4 rounded-xl border border-white/10 bg-[#141416] p-4 shadow-sm transition hover:border-[#d4af37]/40"
              >
                {/* Product Thumbnail */}
                <Link
                  to={`/product/${item.id}`}
                  className="aspect-square h-28 w-28 shrink-0 overflow-hidden rounded-lg bg-[#0e0e10] self-center sm:self-start"
                >
                  <img
                    src={getProductImage(item)}
                    alt={item.name}
                    onError={handleImageFallback}
                    className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
                  />
                </Link>

                {/* Details */}
                <div className="flex flex-1 flex-col justify-between">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-[10px] tracking-wider uppercase text-[#d4af37]">
                        {item.category || "TIMELUX"}
                      </p>
                      <h2 className="mt-1 text-sm font-semibold text-[#f5f1e8] line-clamp-1">
                        <Link to={`/product/${item.id}`} className="hover:text-[#d4af37] transition">
                          {item.name}
                        </Link>
                      </h2>
                      <p className="mt-1 text-sm font-bold text-[#d4af37]">
                        {formatTaka(item.price)}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => removeFromCart(item.id)}
                      aria-label={`Remove ${item.name}`}
                      className="text-xs text-gray-400 hover:text-red-400 transition"
                    >
                      ✕
                    </button>
                  </div>

                  {/* Quantity and Subtotal */}
                  <div className="mt-4 flex items-center justify-between border-t border-white/5 pt-3">
                    <div className="flex items-center rounded-lg border border-white/15 bg-[#09090b]">
                      <button
                        type="button"
                        onClick={() => decreaseQuantity(item.id)}
                        aria-label="Decrease quantity"
                        className="px-2.5 py-1 text-xs text-gray-300 hover:bg-white/10"
                      >
                        −
                      </button>
                      <span className="min-w-8 text-center font-mono text-xs font-semibold text-[#f5f1e8]">
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => increaseQuantity(item.id)}
                        aria-label="Increase quantity"
                        className="px-2.5 py-1 text-xs text-gray-300 hover:bg-white/10"
                      >
                        +
                      </button>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] text-gray-400 block">Item Subtotal</span>
                      <span className="font-semibold text-xs text-[#f5f1e8]">
                        {formatTaka(item.price * item.quantity)}
                      </span>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>

          {/* Order Summary Card */}
          <aside className="rounded-2xl border border-[#d4af37]/30 bg-[#141416] p-6 shadow-xl">
            <p className="text-[10px] font-semibold uppercase tracking-[3px] text-[#d4af37]">
              Order Summary
            </p>
            <h2 className="mt-1 text-lg font-bold text-[#f5f1e8]">Estimated Total</h2>

            <dl className="mt-5 space-y-3 divide-y divide-white/5 text-xs text-gray-300">
              <div className="flex justify-between pt-2">
                <span>Total Items</span>
                <span className="font-mono text-[#f5f1e8]">{cartCount}</span>
              </div>
              <div className="flex justify-between pt-2">
                <span>Subtotal</span>
                <span className="font-mono text-[#f5f1e8]">{formatTaka(cartTotal)}</span>
              </div>
              <div className="flex justify-between pt-2">
                <span>Nationwide Delivery</span>
                <span className="font-mono text-[#f5f1e8]">{formatTaka(deliveryCharge)}</span>
              </div>
              <div className="flex justify-between pt-3 text-sm font-bold text-[#f5f1e8]">
                <span>Grand Total</span>
                <span className="text-[#d4af37] font-extrabold">{formatTaka(grandTotal)}</span>
              </div>
            </dl>

            <button
              type="button"
              onClick={handleProceedToCheckout}
              className="mt-6 flex w-full items-center justify-center rounded-xl bg-gradient-to-r from-[#d4af37] to-[#b8964e] py-3.5 text-xs font-bold tracking-widest text-[#09090b] shadow-[0_4px_16px_rgba(212,175,87,0.25)] transition hover:from-white hover:to-white"
            >
              PROCEED TO CHECKOUT →
            </button>

            <p className="mt-3 text-center text-[10px] text-gray-400">
              Cash on delivery available nationwide across Bangladesh.
            </p>
          </aside>
        </div>
      )}
    </div>
  );
}
