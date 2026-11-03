import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase";
import { useCart } from "../context/useCart";
import { formatTaka, getProductImage, handleImageFallback } from "../utils/watchHelpers";

function generateOrderId() {
  return `TL-${Date.now()}`;
}

export default function Checkout() {
  const location = useLocation();
  const {
    cartItems,
    buyNowItem,
    checkoutMode,
    clearCart,
    clearBuyNow,
  } = useCart();

  // URL query source flag as safety confirmation
  const searchParams = new URLSearchParams(location.search);
  const isBuyNowFromUrl = searchParams.get("source") === "buy_now";

  // Active intent resolution: strictly buy_now only if buyNowItem exists and either mode or url specifies buy_now
  const isBuyNow = Boolean(buyNowItem && (checkoutMode === "buy_now" || isBuyNowFromUrl));

  // Resolved items for this checkout session
  const activeItems = isBuyNow && buyNowItem ? [buyNowItem] : cartItems;
  const activeTotal = activeItems.reduce((acc, item) => acc + item.price * item.quantity, 0);

  const [submittedOrder, setSubmittedOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    email: "",
    district: "",
    area: "",
    address: "",
    instructions: "",
  });

  useEffect(() => {
    document.title = "Checkout — TimeLux Luxury Watches";
  }, []);

  const deliveryCharge = activeItems.length > 0 ? 100 : 0;
  const grandTotal = activeTotal + deliveryCharge;

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (activeItems.length === 0) {
      setError("Your selection is empty.");
      return;
    }

    if (!/^01[3-9]\d{8}$/.test(formData.phone.trim())) {
      setError("Please enter a valid 11-digit Bangladeshi mobile number (e.g. 017XXXXXXXX).");
      return;
    }

    setLoading(true);
    const orderId = generateOrderId();

    const orderPayload = {
      orderId,
      customer: { ...formData },
      products: [...activeItems],
      purchasedProductIds: activeItems.map((item) => item.id),
      subtotal: activeTotal,
      deliveryCharge,
      total: grandTotal,
      paymentMethod: "Cash on Delivery",
      orderType: isBuyNow ? "Buy Now" : "Cart",
      status: "Pending",
      createdAt: serverTimestamp(),
    };

    try {
      await setDoc(doc(db, "orders", orderId), orderPayload);

      setSubmittedOrder({
        ...orderPayload,
        createdAt: new Date().toISOString(),
      });

      if (isBuyNow) {
        clearBuyNow();
      } else {
        clearCart();
      }
    } catch (err) {
      console.error("Order submission failed:", err);
      setError("Could not complete order. Please verify your connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  // =========================================
  // ORDER CONFIRMATION SCREEN
  // =========================================
  if (submittedOrder) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#09090b] px-4 py-12 text-[#f5f1e8]">
        <div className="w-full max-w-xl rounded-2xl border border-[#d4af37]/40 bg-[#141416] p-6 text-center sm:p-10 shadow-2xl">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border-2 border-[#d4af37] text-3xl text-[#d4af37]">
            ✓
          </div>

          <p className="mt-5 text-[10px] font-semibold tracking-[4px] text-[#d4af37] uppercase">
            TimeLux Concierge
          </p>

          <h1 className="mt-2 text-2xl sm:text-3xl font-bold tracking-tight text-[#f5f1e8]">
            Order Confirmed
          </h1>

          <p className="mt-2 text-xs text-gray-400">
            Thank you for selecting TimeLux. Your order has been placed into our priority queue.
          </p>

          <div className="mt-6 rounded-xl border border-white/10 bg-[#09090b] p-5 text-left text-xs">
            <div className="flex justify-between border-b border-white/10 pb-3">
              <span className="text-gray-400">Order Reference</span>
              <span className="font-mono font-bold text-[#d4af37]">{submittedOrder.orderId}</span>
            </div>

            <dl className="mt-3 space-y-2.5 divide-y divide-white/5">
              <div className="flex justify-between pt-1">
                <dt className="text-gray-400">Customer</dt>
                <dd className="font-medium text-[#f5f1e8]">{submittedOrder.customer.fullName}</dd>
              </div>
              <div className="flex justify-between pt-2">
                <dt className="text-gray-400">Mobile</dt>
                <dd className="font-mono text-[#f5f1e8]">{submittedOrder.customer.phone}</dd>
              </div>
              <div className="flex justify-between pt-2">
                <dt className="text-gray-400">Destination</dt>
                <dd className="font-medium text-[#f5f1e8] text-right">
                  {submittedOrder.customer.district}, {submittedOrder.customer.area}
                </dd>
              </div>
              <div className="pt-2">
                <dt className="text-gray-400 mb-1">Items</dt>
                <dd className="space-y-1">
                  {submittedOrder.products.map((item) => (
                    <div key={item.id} className="flex justify-between text-gray-300">
                      <span>{item.name} × {item.quantity}</span>
                      <span className="font-mono text-[#d4af37]">{formatTaka(item.price * item.quantity)}</span>
                    </div>
                  ))}
                </dd>
              </div>
              <div className="flex justify-between pt-3 text-sm font-bold text-[#f5f1e8]">
                <dt>Total Amount</dt>
                <dd className="text-[#d4af37]">{formatTaka(submittedOrder.total)}</dd>
              </div>
            </dl>
          </div>

          <div className="mt-6 flex flex-col sm:flex-row justify-center gap-3">
            <Link
              to="/"
              className="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-[#d4af37] to-[#b8964e] px-6 py-3 text-xs font-bold tracking-wider text-[#09090b] transition hover:from-white hover:to-white"
            >
              RETURN TO HOME →
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // =========================================
  // EMPTY CHECKOUT SCREEN
  // =========================================
  if (activeItems.length === 0) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[#09090b] px-4 py-16 text-center text-[#f5f1e8]">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-[#d4af37]/30 bg-[#d4af37]/10 text-2xl text-[#d4af37]">
          ⌚
        </div>
        <h1 className="mt-5 text-2xl font-bold">Your Checkout is Empty</h1>
        <p className="mt-2 text-xs text-gray-400 max-w-sm">
          Please choose a timepiece before entering the checkout sequence.
        </p>
        <Link
          to="/#collection"
          className="mt-6 inline-flex rounded-xl bg-[#d4af37] px-8 py-3 text-xs font-bold tracking-wider text-[#09090b] transition hover:bg-white"
        >
          EXPLORE TIMEPIECES →
        </Link>
      </div>
    );
  }

  // =========================================
  // MAIN CHECKOUT FORM
  // =========================================
  return (
    <div className="min-h-screen bg-[#09090b] text-[#f5f1e8]">
      {/* Compact Dedicated Luxury Checkout Header */}
      <header className="sticky top-0 z-40 border-b border-[#d4af37]/25 bg-[#141416]/95 px-4 py-3.5 backdrop-blur-md sm:px-8">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <Link
            to="/"
            className="text-lg font-bold tracking-[3px] text-[#d4af37] hover:text-white transition"
          >
            TIMELUX
          </Link>

          <div className="flex items-center gap-4 text-xs">
            <span className="hidden sm:inline-flex items-center gap-1.5 text-gray-400">
              <span className="text-[#d4af37]">🔒</span> Encrypted Checkout
            </span>

            {isBuyNow && buyNowItem ? (
              <Link
                to={`/product/${buyNowItem.id}`}
                className="font-medium text-[#d4af37] hover:underline"
              >
                ← Back to Product
              </Link>
            ) : (
              <Link
                to="/cart"
                className="font-medium text-[#d4af37] hover:underline"
              >
                ← Back to Bag
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Checkout Form Content */}
      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 md:py-12">
        <div className="mb-8">
          <p className="text-[10px] sm:text-xs font-semibold tracking-[3px] text-[#d4af37] uppercase">
            {isBuyNow ? "Instant Direct Order" : "Standard Bag Order"}
          </p>
          <h1 className="mt-1 text-2xl sm:text-3xl font-bold tracking-tight text-[#f5f1e8]">
            Finalize Your Order
          </h1>
          <p className="mt-1 text-xs text-gray-400">
            No account required. Cash on Delivery nationwide.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="grid items-start gap-8 lg:grid-cols-3">
          {/* Form Fields: 2 Columns */}
          <div className="space-y-6 lg:col-span-2">
            {/* 01. Contact Information */}
            <section className="rounded-2xl border border-white/10 bg-[#141416] p-5 sm:p-7">
              <h2 className="text-xs font-bold tracking-wider text-[#d4af37] uppercase">
                01. Customer Details
              </h2>

              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label htmlFor="checkout-fullName" className="block text-xs font-medium text-gray-300">
                    Full Name *
                  </label>
                  <input
                    id="checkout-fullName"
                    name="fullName"
                    type="text"
                    required
                    autoComplete="name"
                    value={formData.fullName}
                    onChange={handleChange}
                    placeholder="e.g. Rahim Ahmed"
                    className="mt-1.5 w-full rounded-lg border border-white/15 bg-[#09090b] px-3.5 py-2.5 text-xs text-[#f5f1e8] outline-none transition focus:border-[#d4af37] focus:ring-1 focus:ring-[#d4af37]"
                  />
                </div>

                <div>
                  <label htmlFor="checkout-phone" className="block text-xs font-medium text-gray-300">
                    Mobile Phone (11 digits) *
                  </label>
                  <input
                    id="checkout-phone"
                    name="phone"
                    type="tel"
                    required
                    maxLength={11}
                    autoComplete="tel"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="01XXXXXXXXX"
                    className="mt-1.5 w-full rounded-lg border border-white/15 bg-[#09090b] px-3.5 py-2.5 font-mono text-xs text-[#f5f1e8] outline-none transition focus:border-[#d4af37] focus:ring-1 focus:ring-[#d4af37]"
                  />
                </div>

                <div>
                  <label htmlFor="checkout-email" className="block text-xs font-medium text-gray-300">
                    Email Address (Optional)
                  </label>
                  <input
                    id="checkout-email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="your@email.com"
                    className="mt-1.5 w-full rounded-lg border border-white/15 bg-[#09090b] px-3.5 py-2.5 text-xs text-[#f5f1e8] outline-none transition focus:border-[#d4af37] focus:ring-1 focus:ring-[#d4af37]"
                  />
                </div>
              </div>
            </section>

            {/* 02. Shipping Address */}
            <section className="rounded-2xl border border-white/10 bg-[#141416] p-5 sm:p-7">
              <h2 className="text-xs font-bold tracking-wider text-[#d4af37] uppercase">
                02. Delivery Address
              </h2>

              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="checkout-district" className="block text-xs font-medium text-gray-300">
                    District *
                  </label>
                  <input
                    id="checkout-district"
                    name="district"
                    type="text"
                    required
                    autoComplete="address-level1"
                    value={formData.district}
                    onChange={handleChange}
                    placeholder="e.g. Dhaka, Chittagong..."
                    className="mt-1.5 w-full rounded-lg border border-white/15 bg-[#09090b] px-3.5 py-2.5 text-xs text-[#f5f1e8] outline-none transition focus:border-[#d4af37] focus:ring-1 focus:ring-[#d4af37]"
                  />
                </div>

                <div>
                  <label htmlFor="checkout-area" className="block text-xs font-medium text-gray-300">
                    Thana / Upazila / Area *
                  </label>
                  <input
                    id="checkout-area"
                    name="area"
                    type="text"
                    required
                    autoComplete="address-level2"
                    value={formData.area}
                    onChange={handleChange}
                    placeholder="e.g. Gulshan, Dhanmondi..."
                    className="mt-1.5 w-full rounded-lg border border-white/15 bg-[#09090b] px-3.5 py-2.5 text-xs text-[#f5f1e8] outline-none transition focus:border-[#d4af37] focus:ring-1 focus:ring-[#d4af37]"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label htmlFor="checkout-address" className="block text-xs font-medium text-gray-300">
                    Full Street Address *
                  </label>
                  <textarea
                    id="checkout-address"
                    name="address"
                    required
                    rows={3}
                    autoComplete="street-address"
                    value={formData.address}
                    onChange={handleChange}
                    placeholder="House number, road number, landmark..."
                    className="mt-1.5 w-full rounded-lg border border-white/15 bg-[#09090b] px-3.5 py-2.5 text-xs text-[#f5f1e8] outline-none transition focus:border-[#d4af37] focus:ring-1 focus:ring-[#d4af37]"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label htmlFor="checkout-instructions" className="block text-xs font-medium text-gray-300">
                    Special Delivery Instructions (Optional)
                  </label>
                  <textarea
                    id="checkout-instructions"
                    name="instructions"
                    rows={2}
                    value={formData.instructions}
                    onChange={handleChange}
                    placeholder="e.g. Call before delivery, deliver after 2 PM..."
                    className="mt-1.5 w-full rounded-lg border border-white/15 bg-[#09090b] px-3.5 py-2.5 text-xs text-[#f5f1e8] outline-none transition focus:border-[#d4af37] focus:ring-1 focus:ring-[#d4af37]"
                  />
                </div>
              </div>
            </section>

            {/* 03. Payment Option */}
            <section className="rounded-2xl border border-white/10 bg-[#141416] p-5 sm:p-7">
              <h2 className="text-xs font-bold tracking-wider text-[#d4af37] uppercase">
                03. Payment Method
              </h2>

              <div className="mt-3 flex items-center justify-between rounded-xl border border-[#d4af37]/40 bg-[#d4af37]/5 p-4">
                <div className="flex items-center gap-3">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#d4af37] text-[10px] font-bold text-[#09090b]">
                    ✓
                  </span>
                  <div>
                    <p className="text-xs font-bold text-[#f5f1e8]">Cash on Delivery (COD)</p>
                    <p className="text-[11px] text-gray-400">Inspect your timepiece upon delivery, then pay the courier.</p>
                  </div>
                </div>
                <span className="text-xs font-mono text-[#d4af37]">Available</span>
              </div>
            </section>
          </div>

          {/* Right Column: Order Summary */}
          <aside className="rounded-2xl border border-[#d4af37]/30 bg-[#141416] p-6 shadow-xl lg:sticky lg:top-20">
            <p className="text-[10px] font-semibold uppercase tracking-[3px] text-[#d4af37]">
              Order Summary
            </p>
            <h2 className="mt-1 text-base font-bold text-[#f5f1e8]">Review Selected Items</h2>

            {/* Product Items List */}
            <div className="mt-4 max-h-60 overflow-y-auto space-y-3 divide-y divide-white/5 pr-1">
              {activeItems.map((item) => (
                <div key={item.id} className="flex gap-3 pt-3 first:pt-0">
                  <img
                    src={getProductImage(item)}
                    alt={item.name}
                    onError={handleImageFallback}
                    className="h-14 w-14 shrink-0 rounded-lg object-cover bg-[#09090b]"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-[#f5f1e8] line-clamp-1">{item.name}</p>
                    <p className="text-[11px] text-gray-400">Qty: {item.quantity}</p>
                    <p className="text-xs font-bold text-[#d4af37]">
                      {formatTaka(item.price * item.quantity)}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Pricing Details */}
            <dl className="mt-5 space-y-2.5 divide-y divide-white/5 border-t border-white/10 pt-4 text-xs text-gray-300">
              <div className="flex justify-between pt-1">
                <span>Subtotal</span>
                <span className="font-mono text-[#f5f1e8]">{formatTaka(activeTotal)}</span>
              </div>
              <div className="flex justify-between pt-2">
                <span>Delivery Charge</span>
                <span className="font-mono text-[#f5f1e8]">{formatTaka(deliveryCharge)}</span>
              </div>
              <div className="flex justify-between pt-3 text-sm font-bold text-[#f5f1e8]">
                <span>Total Due</span>
                <span className="font-extrabold text-[#d4af37]">{formatTaka(grandTotal)}</span>
              </div>
            </dl>

            {error && (
              <div role="alert" className="mt-4 rounded-lg bg-red-900/30 border border-red-500/40 p-3 text-xs text-red-300">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="mt-6 flex w-full items-center justify-center rounded-xl bg-gradient-to-r from-[#d4af37] to-[#b8964e] py-3.5 text-xs font-bold tracking-widest text-[#09090b] shadow-[0_4px_16px_rgba(212,175,87,0.25)] transition hover:from-white hover:to-white disabled:opacity-50"
            >
              {loading ? "CONFIRMING ORDER..." : "PLACE ORDER (CASH ON DELIVERY) →"}
            </button>

            <p className="mt-3 text-center text-[10px] text-gray-400 leading-4">
              By confirming, you agree to TimeLux customer service terms and order verification via phone.
            </p>
          </aside>
        </form>
      </main>
    </div>
  );
}
