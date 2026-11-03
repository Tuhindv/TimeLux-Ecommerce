import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import CartContext from "./cartContext";
import { useProducts } from "./useProducts";
import { getProductImage, getProductImages, getFinalPrice } from "../utils/watchHelpers";

const STORAGE_KEY = "timelux_cart";

/**
 * Safely read persisted guest cart from localStorage.
 * Only validates product IDs and positive integer quantities.
 */
function readPersistedCart() {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];

    return parsed
      .filter((item) => item && typeof item.id === "string" && Number(item.quantity) > 0)
      .map((item) => ({
        id: item.id.trim(),
        quantity: Math.max(1, Math.floor(Number(item.quantity))),
      }));
  } catch (error) {
    console.warn("Could not read cart from localStorage:", error);
    return [];
  }
}

/**
 * Safely write validated guest cart to localStorage.
 */
function writePersistedCart(items) {
  if (typeof window === "undefined") return;
  try {
    const serialized = items.map((item) => ({
      id: item.id,
      quantity: item.quantity,
    }));
    localStorage.setItem(STORAGE_KEY, JSON.stringify(serialized));
  } catch (error) {
    console.warn("Could not persist cart to localStorage:", error);
  }
}

export function CartProvider({ children }) {
  const { products } = useProducts();

  // Lazy initialize state from localStorage
  const [rawCartItems, setRawCartItems] = useState(() => readPersistedCart());

  // Distinct Buy Now state
  const [buyNowItem, setBuyNowItem] = useState(null);
  const [checkoutMode, setCheckoutMode] = useState("cart"); // "cart" | "buy_now"

  const isInitialized = useRef(false);

  // Mark initialized after first mount
  useEffect(() => {
    isInitialized.current = true;
  }, []);

  // Save changes to localStorage, avoiding initial empty wipe
  useEffect(() => {
    if (!isInitialized.current) return;
    writePersistedCart(rawCartItems);
  }, [rawCartItems]);

  // Reconcile raw stored items with authoritative product data
  const cartItems = useMemo(() => {
    return rawCartItems.map((raw) => {
      const match = Array.isArray(products)
        ? products.find((p) => p.id === raw.id)
        : null;

      if (match) {
        const finalPrice = getFinalPrice(match);
        return {
          id: match.id,
          name: match.name,
          category: match.category,
          price: finalPrice,
          originalPrice: Number(match.price) || finalPrice,
          discountPercent: match.offerActive ? Number(match.discountPercent) || 0 : 0,
          image: getProductImage(match),
          images: getProductImages(match),
          stock: typeof match.stock === "number" ? match.stock : 99,
          quantity: raw.quantity,
        };
      }

      // Fallback if product is not yet in context or offline
      return {
        id: raw.id,
        name: raw.name || "Luxury Watch",
        price: Number(raw.price) || 0,
        originalPrice: Number(raw.originalPrice || raw.price) || 0,
        discountPercent: Number(raw.discountPercent) || 0,
        image: raw.image || getProductImage(raw),
        images: raw.images || [],
        stock: 99,
        quantity: raw.quantity,
      };
    });
  }, [rawCartItems, products]);

  // Add product to cart
  const addToCart = useCallback((product) => {
    const qtyToAdd = Math.max(1, Math.floor(Number(product.quantity) || 1));

    setRawCartItems((prev) => {
      const existingIndex = prev.findIndex((item) => item.id === product.id);
      if (existingIndex >= 0) {
        const updated = [...prev];
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: updated[existingIndex].quantity + qtyToAdd,
        };
        return updated;
      }
      return [...prev, { id: product.id, quantity: qtyToAdd }];
    });
  }, []);

  // Increase quantity
  const increaseQuantity = useCallback((id) => {
    setRawCartItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, quantity: item.quantity + 1 } : item
      )
    );
  }, []);

  // Decrease quantity (removes if <= 0)
  const decreaseQuantity = useCallback((id) => {
    setRawCartItems((prev) =>
      prev
        .map((item) =>
          item.id === id ? { ...item, quantity: item.quantity - 1 } : item
        )
        .filter((item) => item.quantity > 0)
    );
  }, []);

  // Remove single product
  const removeFromCart = useCallback((id) => {
    setRawCartItems((prev) => prev.filter((item) => item.id !== id));
  }, []);

  // Clear entire cart
  const clearCart = useCallback(() => {
    setRawCartItems([]);
  }, []);

  // Buy Now: explicit single-item checkout flow
  const buyNow = useCallback((product) => {
    const qty = Math.max(1, Math.floor(Number(product.quantity) || 1));
    const finalPrice = getFinalPrice(product);
    const resolvedItem = {
      id: product.id,
      name: product.name,
      price: finalPrice,
      originalPrice: Number(product.price) || finalPrice,
      discountPercent: product.offerActive ? Number(product.discountPercent) || 0 : 0,
      image: getProductImage(product),
      images: getProductImages(product),
      stock: typeof product.stock === "number" ? product.stock : 99,
      quantity: qty,
    };
    setBuyNowItem(resolvedItem);
    setCheckoutMode("buy_now");
  }, []);

  // Clear Buy Now intent
  const clearBuyNow = useCallback(() => {
    setBuyNowItem(null);
    setCheckoutMode("cart");
  }, []);

  // Explicitly select cart checkout intent
  const prepareCartCheckout = useCallback(() => {
    setBuyNowItem(null);
    setCheckoutMode("cart");
  }, []);

  // Checkout items determined strictly by checkoutMode and buyNowItem presence
  const isBuyNowActive = checkoutMode === "buy_now" && Boolean(buyNowItem);
  const checkoutItems = useMemo(
    () => (isBuyNowActive && buyNowItem ? [buyNowItem] : cartItems),
    [isBuyNowActive, buyNowItem, cartItems]
  );

  // Cart total count
  const cartCount = useMemo(
    () => cartItems.reduce((total, item) => total + item.quantity, 0),
    [cartItems]
  );

  // Cart total price
  const cartTotal = useMemo(
    () => cartItems.reduce((total, item) => total + item.price * item.quantity, 0),
    [cartItems]
  );

  // Checkout total price
  const checkoutTotal = useMemo(
    () => checkoutItems.reduce((total, item) => total + item.price * item.quantity, 0),
    [checkoutItems]
  );

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        increaseQuantity,
        decreaseQuantity,
        removeFromCart,
        clearCart,
        cartCount,
        cartTotal,

        // Buy Now & Checkout separation
        buyNow,
        buyNowItem,
        checkoutMode,
        setCheckoutMode,
        prepareCartCheckout,
        clearBuyNow,
        checkoutItems,
        checkoutTotal,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export default CartProvider;
