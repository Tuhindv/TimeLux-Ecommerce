
import { Link } from "react-router-dom";
import { useCart } from "../context/useCart";

function Cart() {
  const {
    cartItems,
    increaseQuantity,
    decreaseQuantity,
    removeFromCart,
    clearCart,
    cartTotal,
    cartCount,
  } = useCart();

  const deliveryCharge = cartItems.length > 0 ? 100 : 0;
  const grandTotal = cartTotal + deliveryCharge;

  return (
    <div className="min-h-screen bg-[#080808] px-5 py-10 text-white md:px-16">

      {/* Header */}
      <header className="mb-10 flex items-center justify-between border-b border-[#d4af37]/30 pb-6">
        <Link
          to="/"
          className="text-2xl font-bold tracking-[4px] text-[#d4af37]"
        >
          TIMELUX
        </Link>

        <Link
          to="/"
          className="text-sm text-gray-400 transition hover:text-[#d4af37]"
        >
          ← Continue Shopping
        </Link>
      </header>

      {/* Page Title */}
      <div className="mb-10">
        <p className="text-sm tracking-[4px] text-[#d4af37]">
          YOUR SELECTION
        </p>

        <div className="mt-3 flex flex-wrap items-center justify-between gap-4">
          <h1 className="text-4xl font-bold">
            Shopping <span className="text-[#d4af37]">Cart</span>
          </h1>

          {cartItems.length > 0 && (
            <span className="text-sm text-gray-400">
              {cartCount} Items in Cart
            </span>
          )}
        </div>
      </div>

      {/* Empty Cart */}
      {cartItems.length === 0 ? (
        <div className="border border-white/10 bg-[#111] px-5 py-20 text-center">

          <div className="mb-6 text-7xl">
            🛒
          </div>

          <h2 className="text-2xl font-semibold">
            Your Cart is Empty
          </h2>

          <p className="mt-3 text-gray-400">
            You haven't added any watches to your cart yet.
          </p>

          <Link
            to="/"
            className="mt-8 inline-block bg-[#d4af37] px-8 py-4 font-bold text-black transition hover:bg-white"
          >
            EXPLORE WATCHES →
          </Link>

        </div>
      ) : (

        <div className="grid items-start gap-10 lg:grid-cols-3">

          {/* Cart Products */}
          <div className="space-y-5 lg:col-span-2">

            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <h2 className="text-xl font-semibold">
                Cart Items
              </h2>

              <button
                onClick={() => {
                  if (window.confirm("Are you sure you want to clear your cart?")) {
                    clearCart();
                  }
                }}
                className="text-sm text-red-400 transition hover:text-red-300"
              >
                Clear Cart
              </button>
            </div>

            {cartItems.map((item) => (

              <div
                key={item.id}
                className="grid gap-5 border border-white/10 bg-[#111] p-5 sm:grid-cols-[150px_1fr]"
              >

                {/* Product Image */}
                <img
                  src={item.image}
                  alt={item.name}
                  className="h-40 w-full object-cover"
                />

                {/* Product Details */}
                <div className="flex flex-col justify-between">

                  <div className="flex items-start justify-between gap-3">

                    <div>
                      <p className="text-xs tracking-[3px] text-[#d4af37]">
                        TIMELUX COLLECTION
                      </p>

                      <h3 className="mt-2 text-xl font-semibold">
                        {item.name}
                      </h3>

                      <p className="mt-2 text-lg font-bold text-[#d4af37]">
                        ৳{item.price.toLocaleString("en-BD")}
                      </p>
                    </div>

                    {/* Remove Button */}
                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="text-sm text-red-400 transition hover:text-red-300"
                    >
                      ✕ Remove
                    </button>

                  </div>

                  <div className="mt-5 flex flex-wrap items-center justify-between gap-4">

                    {/* Quantity Control */}
                    <div>
                      <p className="mb-2 text-xs text-gray-400">
                        Quantity
                      </p>

                      <div className="flex w-fit items-center border border-white/20">

                        <button
                          onClick={() => decreaseQuantity(item.id)}
                          className="px-4 py-2 transition hover:bg-[#333]"
                          aria-label="Decrease quantity"
                        >
                          −
                        </button>

                        <span className="min-w-10 text-center">
                          {item.quantity}
                        </span>

                        <button
                          onClick={() => increaseQuantity(item.id)}
                          className="px-4 py-2 transition hover:bg-[#333]"
                          aria-label="Increase quantity"
                        >
                          +
                        </button>

                      </div>
                    </div>

                    {/* Item Subtotal */}
                    <div className="text-right">
                      <p className="text-xs text-gray-400">
                        Subtotal
                      </p>

                      <p className="mt-1 font-semibold text-[#d4af37]">
                        ৳{(item.price * item.quantity).toLocaleString("en-BD")}
                      </p>
                    </div>

                  </div>

                </div>
              </div>

            ))}

            {/* Continue Shopping */}
            <Link
              to="/"
              className="inline-block pt-3 text-sm text-[#d4af37] transition hover:text-white"
            >
              ← Continue Shopping
            </Link>

          </div>

          {/* Order Summary */}
          <div className="h-fit border border-[#d4af37]/30 bg-[#111] p-6">

            <p className="text-xs tracking-[4px] text-[#d4af37]">
              ORDER DETAILS
            </p>

            <h2 className="mb-7 mt-3 text-2xl font-bold">
              Order Summary
            </h2>

            {/* Product Count */}
            <div className="flex justify-between border-b border-white/10 py-4 text-sm text-gray-400">
              <span>Total Products</span>
              <span>{cartItems.length}</span>
            </div>

            {/* Quantity */}
            <div className="flex justify-between border-b border-white/10 py-4 text-sm text-gray-400">
              <span>Total Quantity</span>
              <span>{cartCount}</span>
            </div>

            {/* Subtotal */}
            <div className="flex justify-between border-b border-white/10 py-4 text-sm text-gray-400">
              <span>Subtotal</span>
              <span>
                ৳{cartTotal.toLocaleString("en-BD")}
              </span>
            </div>

            {/* Delivery */}
            <div className="flex justify-between border-b border-white/10 py-4 text-sm text-gray-400">
              <span>Delivery Charge</span>
              <span>
                ৳{deliveryCharge.toLocaleString("en-BD")}
              </span>
            </div>

            {/* Grand Total */}
            <div className="flex justify-between gap-3 py-6 text-xl font-bold">
              <span>Grand Total</span>

              <span className="text-[#d4af37]">
                ৳{grandTotal.toLocaleString("en-BD")}
              </span>
            </div>

            {/* Checkout Link */}
            <Link
              to="/checkout"
              className="block w-full bg-[#d4af37] py-4 text-center font-bold text-black transition hover:bg-white"
            >
              PROCEED TO CHECKOUT →
            </Link>

            <p className="mt-4 text-center text-xs leading-6 text-gray-500">
              Secure Shopping · Cash on Delivery Available
            </p>

          </div>

        </div>
      )}

      {/* Footer */}
      <footer className="mt-20 border-t border-white/10 py-8 text-center">
        <p className="text-sm tracking-[3px] text-[#d4af37]">
          TIMELUX
        </p>

        <p className="mt-2 text-xs text-gray-600">
          Luxury in Every Second. © 2026 TimeLux.
        </p>
      </footer>

    </div>
  );
}

export default Cart;
