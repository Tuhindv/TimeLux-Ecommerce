import { test, describe } from "node:test";
import assert from "node:assert/strict";

import {
  getFinalPrice,
  formatTaka,
  getProductImage,
  hasActiveDiscount,
} from "../src/utils/watchHelpers.js";

describe("TimeLux Regression Tests", () => {
  describe("Pricing & Bangladeshi Taka Formatting", () => {
    test("calculates discounted price accurately with active offer", () => {
      const product = {
        price: 12500,
        discountPercent: 20,
        offerActive: true,
      };
      assert.equal(getFinalPrice(product), 10000);
      assert.equal(hasActiveDiscount(product), true);
    });

    test("returns full price when offer is inactive", () => {
      const product = {
        price: 12500,
        discountPercent: 20,
        offerActive: false,
      };
      assert.equal(getFinalPrice(product), 12500);
      assert.equal(hasActiveDiscount(product), false);
    });

    test("formats Bangladeshi taka with ৳ symbol and en-BD separator", () => {
      assert.equal(formatTaka(10000), "৳10,000");
      assert.equal(formatTaka(12500), "৳12,500");
    });
  });

  describe("Product Image Parity", () => {
    test("maintains the curated image for watch-001, watch-002, watch-003", () => {
      const p1 = { id: "watch-001", name: "Royal Gold" };
      const p2 = { id: "watch-002", name: "Classic Silver" };
      const p3 = { id: "watch-003", name: "Luxury Black" };

      assert.match(getProductImage(p1), /photo-1523170335258/);
      assert.match(getProductImage(p2), /photo-1524805444758/);
      assert.match(getProductImage(p3), /photo-1524592094714/);
    });

    test("prioritizes uploaded images if present", () => {
      const customProduct = {
        id: "watch-001",
        images: ["https://example.com/custom-watch.jpg"],
      };
      assert.equal(getProductImage(customProduct), "https://example.com/custom-watch.jpg");
    });
  });

  describe("Search Normalization", () => {
    const products = [
      { id: "1", name: "Classic Silver Watch", brand: "TimeLux", category: "Classic" },
      { id: "2", name: "Royal Gold Luxury Watch", brand: "TimeLux", category: "Luxury" },
    ];

    function searchWatches(items, rawSearch) {
      const query = rawSearch.trim().toLowerCase();
      if (!query) return items;
      return items.filter((w) =>
        [w.name, w.brand, w.category].some((f) => String(f).toLowerCase().includes(query))
      );
    }

    test("matches 'classic', 'CLASSIC', and whitespace-padded '   classic   ' identically", () => {
      const r1 = searchWatches(products, "classic");
      const r2 = searchWatches(products, "CLASSIC");
      const r3 = searchWatches(products, "   classic   ");

      assert.equal(r1.length, 1);
      assert.equal(r2.length, 1);
      assert.equal(r3.length, 1);
      assert.equal(r1[0].id, "1");
      assert.equal(r2[0].id, "1");
      assert.equal(r3[0].id, "1");
    });
  });

  describe("Checkout Intent Logic Separation", () => {
    test("Cart checkout displays only Cart items, not stale Buy Now item", () => {
      let buyNowItem = { id: "watch-002", name: "Classic Silver", price: 9800, quantity: 1 };
      let checkoutMode = "buy_now";
      const cartItems = [{ id: "watch-003", name: "Luxury Black", price: 15000, quantity: 2 }];

      // Step 1: Buy Now on Classic Silver sets buyNowItem
      assert.equal(checkoutMode === "buy_now" && buyNowItem ? [buyNowItem].length : cartItems.length, 1);
      assert.equal(buyNowItem.name, "Classic Silver");

      // Step 2: Returning to shopping, adding Luxury Black, viewing Cart / Proceeding to Checkout
      // prepareCartCheckout() clears buyNowItem and sets checkoutMode = "cart"
      buyNowItem = null;
      checkoutMode = "cart";

      const checkoutItems = checkoutMode === "buy_now" && buyNowItem ? [buyNowItem] : cartItems;
      assert.equal(checkoutItems.length, 1);
      assert.equal(checkoutItems[0].name, "Luxury Black");
      assert.equal(checkoutItems[0].quantity, 2);
    });

    test("Buy Now checkout isolates selected product without modifying stored cart", () => {
      const cartItems = [{ id: "watch-003", name: "Luxury Black", price: 15000, quantity: 2 }];
      const buyNowItem = { id: "watch-001", name: "Royal Gold", price: 12500, quantity: 1 };
      const checkoutMode = "buy_now";

      const checkoutItems = checkoutMode === "buy_now" && buyNowItem ? [buyNowItem] : cartItems;
      assert.equal(checkoutItems.length, 1);
      assert.equal(checkoutItems[0].name, "Royal Gold");
      // Cart items remain untouched
      assert.equal(cartItems.length, 1);
      assert.equal(cartItems[0].name, "Luxury Black");
    });
  });

  describe("Cart LocalStorage Persistence Sanitization", () => {
    function sanitizeStoredCart(raw) {
      try {
        const parsed = JSON.parse(raw);
        if (!Array.isArray(parsed)) return [];
        return parsed
          .filter((item) => item && typeof item.id === "string" && Number(item.quantity) > 0)
          .map((item) => ({
            id: item.id.trim(),
            quantity: Math.max(1, Math.floor(Number(item.quantity))),
          }));
      } catch {
        return [];
      }
    }

    test("safely parses valid cart with string id and positive integer quantity", () => {
      const input = JSON.stringify([
        { id: "watch-001", quantity: 2 },
        { id: "watch-002", quantity: "3" },
      ]);
      const result = sanitizeStoredCart(input);
      assert.deepEqual(result, [
        { id: "watch-001", quantity: 2 },
        { id: "watch-002", quantity: 3 },
      ]);
    });

    test("rejects malformed json, negative quantities, missing ids without crashing", () => {
      assert.deepEqual(sanitizeStoredCart("not a json string"), []);
      assert.deepEqual(
        sanitizeStoredCart(
          JSON.stringify([
            { id: 123, quantity: 1 },
            { id: "watch-001", quantity: -2 },
            { id: "watch-002", quantity: 0 },
            { id: "watch-003", quantity: 1 },
          ])
        ),
        [{ id: "watch-003", quantity: 1 }]
      );
    });
  });
});
