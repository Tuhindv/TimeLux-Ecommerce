

import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase";
import { useState } from "react";
import { Link } from "react-router-dom";
import { useCart } from "../context/useCart";

function Checkout() {
  const {
  clearCart,
  buyNowItem,
  checkoutItems,
  checkoutTotal,
  clearBuyNow,
} = useCart();

  const isBuyNow = Boolean(buyNowItem);

  const [submittedOrder, setSubmittedOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    email: "",
    district: "",
    area: "",
    address: "",
    instructions: "",
  });

  const [error, setError] = useState("");

  // Delivery Charge and Grand Total
  const deliveryCharge = checkoutItems.length > 0 ? 100 : 0;
  const grandTotal = checkoutTotal + deliveryCharge;

  // Form Input Change
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
  e.preventDefault();
  setError("");

  if (checkoutItems.length === 0) {
    setError("Your cart is empty.");
    return;
  }

  if (!/^01[3-9]\d{8}$/.test(formData.phone.trim())) {
    setError("Please enter a valid 11-digit Bangladeshi mobile number.");
    return;
  }

  setLoading(true);

  const orderId = `TL-${Date.now()}`;

  const order = {
    orderId,
    customer: { ...formData },
    products: [...checkoutItems],
    // Comment verification-এর জন্য
  purchasedProductIds: checkoutItems.map((item) => item.id),
    subtotal: checkoutTotal,
    deliveryCharge,
    total: grandTotal,
    paymentMethod: "Cash on Delivery",
    orderType: isBuyNow ? "Buy Now" : "Cart",
    status: "Pending",
    createdAt: serverTimestamp(),
  };

  try {
    await setDoc(doc(db, "orders", orderId), order);

    setSubmittedOrder({
      ...order,
      createdAt: new Date().toISOString(),
    });

    if (isBuyNow) {
      clearBuyNow();
    } else {
      clearCart();
    }
  } catch (error) {
    console.error("Order save error:", error);
    setError("Order could not be placed. Please try again.");
  } finally {
    setLoading(false);
  }
};
    // Demo confirmation only.
    // Firebase order saving will be added later.
    

  // =========================================
  // ORDER CONFIRMATION SCREEN
  // =========================================

  if (submittedOrder) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#080808] px-5 py-12 text-white">
        <div className="w-full max-w-2xl border border-[#d4af37]/40 bg-[#111] p-7 text-center md:p-12">

          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full border-2 border-[#d4af37] text-4xl text-[#d4af37]">
            ✓
          </div>

          <p className="mt-7 text-sm tracking-[5px] text-[#d4af37]">
            TIMELUX
          </p>

          <h1 className="mt-5 text-3xl font-bold md:text-4xl">
            Order Placed{" "}
            <span className="text-[#d4af37]">
              Successfully!
            </span>
          </h1>

          <p className="mt-4 leading-7 text-gray-400">
            Thank you for shopping with TimeLux.
            Your order confirmation is ready.
          </p>

          <div className="mt-8 border border-white/10 bg-[#080808] p-5 text-left">

            <div className="flex flex-wrap justify-between gap-3 border-b border-white/10 pb-4">
              <span className="text-gray-400">Order ID</span>
              <span className="font-semibold text-[#d4af37]">
                {submittedOrder.orderId}
              </span>
            </div>

            <div className="space-y-4 py-5 text-sm">

              <div className="flex justify-between gap-3">
                <span className="text-gray-400">Order Type</span>
                <span>{submittedOrder.orderType}</span>
              </div>

              <div className="flex justify-between gap-3">
                <span className="text-gray-400">Customer Name</span>
                <span>{submittedOrder.customer.fullName}</span>
              </div>

              <div className="flex justify-between gap-3">
                <span className="text-gray-400">Mobile Number</span>
                <span>{submittedOrder.customer.phone}</span>
              </div>

              {submittedOrder.customer.email && (
                <div className="flex justify-between gap-3">
                  <span className="text-gray-400">Email</span>
                  <span>{submittedOrder.customer.email}</span>
                </div>
              )}

              <div className="flex justify-between gap-3">
                <span className="text-gray-400">District</span>
                <span>{submittedOrder.customer.district}</span>
              </div>

              <div className="flex justify-between gap-3">
                <span className="text-gray-400">Area</span>
                <span>{submittedOrder.customer.area}</span>
              </div>

              <div className="border-t border-white/10 pt-4">
                <p className="mb-2 text-gray-400">
                  Delivery Address
                </p>
                <p className="leading-6">
                  {submittedOrder.customer.address}
                </p>
              </div>

              {submittedOrder.customer.instructions && (
                <div className="border-t border-white/10 pt-4">
                  <p className="mb-2 text-gray-400">
                    Delivery Instructions
                  </p>
                  <p className="leading-6">
                    {submittedOrder.customer.instructions}
                  </p>
                </div>
              )}

              <div className="border-t border-white/10 pt-4">
                <p className="mb-3 text-gray-400">
                  Ordered Products
                </p>

                {submittedOrder.products.map((item) => (
                  <div
                    key={item.id}
                    className="flex justify-between gap-3 py-2"
                  >
                    <span>
                      {item.name} × {item.quantity}
                    </span>

                    <span className="text-[#d4af37]">
                      ৳
                      {(item.price * item.quantity).toLocaleString("en-BD")}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-3 border-t border-white/10 pt-5 text-sm">

              <div className="flex justify-between">
                <span className="text-gray-400">Subtotal</span>
                <span>
                  ৳{submittedOrder.subtotal.toLocaleString("en-BD")}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-400">
                  Delivery Charge
                </span>
                <span>
                  ৳{submittedOrder.deliveryCharge.toLocaleString("en-BD")}
                </span>
              </div>

              <div className="flex justify-between text-lg font-bold">
                <span>Grand Total</span>
                <span className="text-[#d4af37]">
                  ৳{submittedOrder.total.toLocaleString("en-BD")}
                </span>
              </div>
            </div>

            <div className="mt-5 border border-[#d4af37]/30 p-4">
              <p className="text-[#d4af37]">
                Payment Method
              </p>
              <p className="mt-1">
                {submittedOrder.paymentMethod}
              </p>
            </div>
          </div>

          <p className="mt-6 text-xs leading-6 text-gray-500">
            Your order has been successfully saved.
Our team will contact you to confirm your order.
          </p>

          <div className="mt-8 flex flex-col justify-center gap-4 sm:flex-row">

            <Link
              to="/"
              className="inline-block bg-[#d4af37] px-8 py-4 font-bold text-black transition hover:bg-white"
            >
              CONTINUE SHOPPING →
            </Link>

            {submittedOrder.orderType === "Buy Now" && (
              <Link
                to="/cart"
                className="inline-block border border-[#d4af37] px-8 py-4 font-bold text-[#d4af37] transition hover:bg-[#d4af37] hover:text-black"
              >
                VIEW MY CART
              </Link>
            )}

          </div>
        </div>
      </div>
    );
  }

  // =========================================
  // EMPTY CHECKOUT SCREEN
  // =========================================

  if (checkoutItems.length === 0) {
    return (
      <div className="min-h-screen bg-[#080808] px-6 py-20 text-center text-white">

        <h1 className="text-3xl font-bold">
          Your Checkout Is Empty
        </h1>

        <p className="mt-4 text-gray-400">
          Please select a watch before checkout.
        </p>

        <Link
          to="/"
          className="mt-7 inline-block bg-[#d4af37] px-8 py-3 font-bold text-black"
        >
          EXPLORE WATCHES
        </Link>

      </div>
    );
  }

  // =========================================
  // CHECKOUT PAGE
  // =========================================

  return (
    <div className="min-h-screen bg-[#080808] px-5 py-12 text-white md:px-16">
      <div className="mx-auto max-w-6xl">

        {/* Header */}

        <div className="mb-10 flex items-center justify-between">

          <Link
            to="/"
            className="text-2xl font-bold tracking-[4px] text-[#d4af37]"
          >
            TIMELUX
          </Link>

          {isBuyNow ? (
            <Link
              to="/"
              className="text-sm text-gray-400 hover:text-[#d4af37]"
            >
              ← Back to Product
            </Link>
          ) : (
            <Link
              to="/cart"
              className="text-sm text-gray-400 hover:text-[#d4af37]"
            >
              ← Back to Cart
            </Link>
          )}

        </div>

        <h1 className="mb-3 text-3xl font-bold md:text-4xl">
          Checkout
        </h1>

        <p className="mb-4 text-gray-400">
          Complete your details to place your order.
          No account or login required.
        </p>

        <p className="mb-10 text-sm text-[#d4af37]">
          {isBuyNow
            ? "Buy Now Checkout — Selected product only"
            : "Cart Checkout — All cart products"}
        </p>

        <form onSubmit={handleSubmit}>
          <div className="grid gap-10 lg:grid-cols-3">

            {/* CUSTOMER INFORMATION */}

            <div className="space-y-8 lg:col-span-2">

              <section className="border border-white/10 bg-[#111] p-6 md:p-8">

                <h2 className="mb-6 text-xl font-semibold text-[#d4af37]">
                  01. Customer Information
                </h2>

                <div className="grid gap-5 md:grid-cols-2">

                  <div className="md:col-span-2">
                    <label className="mb-2 block text-sm text-gray-300">
                      Full Name *
                    </label>

                    <input
                      type="text"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleChange}
                      placeholder="Enter your full name"
                      required
                      className="w-full border border-white/10 bg-[#080808] px-4 py-3 outline-none focus:border-[#d4af37]"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm text-gray-300">
                      Mobile Number *
                    </label>

                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="01XXXXXXXXX"
                      required
                      maxLength={11}
                      className="w-full border border-white/10 bg-[#080808] px-4 py-3 outline-none focus:border-[#d4af37]"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm text-gray-300">
                      Email (Optional)
                    </label>

                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="your@email.com"
                      className="w-full border border-white/10 bg-[#080808] px-4 py-3 outline-none focus:border-[#d4af37]"
                    />
                  </div>

                </div>
              </section>

              {/* DELIVERY ADDRESS */}

              <section className="border border-white/10 bg-[#111] p-6 md:p-8">

                <h2 className="mb-6 text-xl font-semibold text-[#d4af37]">
                  02. Delivery Address
                </h2>

                <div className="space-y-5">

                  <div className="grid gap-5 md:grid-cols-2">

                    <div>
                      <label className="mb-2 block text-sm text-gray-300">
                        District *
                      </label>

                      <input
                        type="text"
                        name="district"
                        value={formData.district}
                        onChange={handleChange}
                        placeholder="Enter your district"
                        required
                        className="w-full border border-white/10 bg-[#080808] px-4 py-3 outline-none focus:border-[#d4af37]"
                      />
                    </div>

                    <div>
                      <label className="mb-2 block text-sm text-gray-300">
                        Area / Upazila *
                      </label>

                      <input
                        type="text"
                        name="area"
                        value={formData.area}
                        onChange={handleChange}
                        placeholder="Enter your area"
                        required
                        className="w-full border border-white/10 bg-[#080808] px-4 py-3 outline-none focus:border-[#d4af37]"
                      />
                    </div>

                  </div>

                  <div>
                    <label className="mb-2 block text-sm text-gray-300">
                      Full Address *
                    </label>

                    <textarea
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      placeholder="House number, road, village, landmark..."
                      rows={4}
                      required
                      className="w-full border border-white/10 bg-[#080808] px-4 py-3 outline-none focus:border-[#d4af37]"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm text-gray-300">
                      Delivery Instructions (Optional)
                    </label>

                    <textarea
                      name="instructions"
                      value={formData.instructions}
                      onChange={handleChange}
                      placeholder="Any special delivery instructions?"
                      rows={2}
                      className="w-full border border-white/10 bg-[#080808] px-4 py-3 outline-none focus:border-[#d4af37]"
                    />
                  </div>

                </div>
              </section>

              {/* PAYMENT METHOD */}

              <section className="border border-white/10 bg-[#111] p-6 md:p-8">

                <h2 className="mb-6 text-xl font-semibold text-[#d4af37]">
                  03. Payment Method
                </h2>

                <label className="flex cursor-pointer items-center gap-3 border border-[#d4af37] bg-[#d4af37]/10 p-5">

                  <input
                    type="radio"
                    name="payment"
                    value="cod"
                    defaultChecked
                    className="accent-[#d4af37]"
                  />

                  <div>
                    <p className="font-semibold">
                      Cash on Delivery
                    </p>

                    <p className="mt-1 text-sm text-gray-400">
                      Pay when your watch arrives.
                    </p>
                  </div>

                </label>
              </section>

            </div>

            {/* ORDER SUMMARY */}

            <aside className="h-fit border border-white/10 bg-[#111] p-6">

              <h2 className="mb-6 text-xl font-semibold text-[#d4af37]">
                Order Summary
              </h2>

              <div className="space-y-5">

                {checkoutItems.map((item) => (
                  <div key={item.id} className="flex gap-4">

                    <img
                      src={
                        item.images?.[0]?.src ||
                        item.images?.[0] ||
                        item.image ||
                        ""
                      }
                      alt={item.name}
                      className="h-20 w-20 object-cover"
                    />

                    <div className="flex-1">

                      <h3 className="font-semibold">
                        {item.name}
                      </h3>

                      <p className="mt-1 text-sm text-gray-400">
                        Quantity: {item.quantity}
                      </p>

                      <p className="mt-1 text-[#d4af37]">
                        ৳
                        {(item.price * item.quantity).toLocaleString("en-BD")}
                      </p>

                    </div>
                  </div>
                ))}

              </div>

              <div className="my-6 border-t border-white/10" />

              <div className="space-y-4 text-sm">

                <div className="flex justify-between text-gray-400">
                  <span>Subtotal</span>
                  <span>
                    ৳{checkoutTotal.toLocaleString("en-BD")}
                  </span>
                </div>

                <div className="flex justify-between text-gray-400">
                  <span>Delivery Charge</span>
                  <span>
                    ৳{deliveryCharge.toLocaleString("en-BD")}
                  </span>
                </div>

                <div className="flex justify-between border-t border-white/10 pt-5 text-lg font-bold">

                  <span>Grand Total</span>

                  <span className="text-[#d4af37]">
                    ৳{grandTotal.toLocaleString("en-BD")}
                  </span>

                </div>
              </div>

              {error && (
                <p className="mt-5 text-sm text-red-400">
                  {error}
                </p>
              )}

              <button
  type="submit"
  disabled={loading}
  className="mt-7 w-full bg-[#d4af37] py-4 font-bold text-black transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-50"
>
  {loading ? "PLACING ORDER..." : "PLACE ORDER →"}
</button>

              <p className="mt-4 text-center text-xs leading-5 text-gray-500">
                By placing your order, you agree to our shopping terms.
              </p>

            </aside>

          </div>
        </form>
      </div>
    </div>
  );
}

export default Checkout;
