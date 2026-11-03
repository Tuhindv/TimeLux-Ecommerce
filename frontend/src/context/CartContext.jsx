

import { useState } from "react";
import CartContext from "./cartContext";

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState([]);

  // Buy Now-এর জন্য আলাদা Checkout State
  const [buyNowItem, setBuyNowItem] = useState(null);

  // Add product to cart
  const addToCart = (product) => {
    const addedQuantity = product.quantity ?? 1;

    setCartItems((previousItems) => {
      const existingProduct = previousItems.find(
        (item) => item.id === product.id
      );

      if (existingProduct) {
        return previousItems.map((item) =>
          item.id === product.id
            ? {
                ...item,
                quantity: item.quantity + addedQuantity,
              }
            : item
        );
      }

      return [
        ...previousItems,
        { ...product, quantity: addedQuantity },
      ];
    });
  };

  // Buy Now: Cart পরিবর্তন না করে আলাদা Checkout
  const buyNow = (product) => {
    setBuyNowItem({
      ...product,
      quantity: product.quantity ?? 1,
    });
  };

  // Checkout-এর জন্য কোন পণ্য ব্যবহার হবে
  const checkoutItems = buyNowItem
    ? [buyNowItem]
    : cartItems;

  // Buy Now Checkout শেষ হলে আলাদা Selection পরিষ্কার
  const clearBuyNow = () => {
    setBuyNowItem(null);
  };

  // Increase quantity
  const increaseQuantity = (id) => {
    setCartItems((items) =>
      items.map((item) =>
        item.id === id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      )
    );
  };

  // Decrease quantity
  const decreaseQuantity = (id) => {
    setCartItems((items) =>
      items
        .map((item) =>
          item.id === id
            ? { ...item, quantity: item.quantity - 1 }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  // Remove product
  const removeFromCart = (id) => {
    setCartItems((items) =>
      items.filter((item) => item.id !== id)
    );
  };

  // Clear cart
  const clearCart = () => {
    setCartItems([]);
  };

  // Total quantity
  const cartCount = cartItems.reduce(
    (total, item) => total + item.quantity,
    0
  );

  // Total price
  const cartTotal = cartItems.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );

  // Checkout total
  const checkoutTotal = checkoutItems.reduce(
    (total, item) => total + item.price * item.quantity,
    0
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

        // Buy Now এবং Checkout
        buyNow,
        buyNowItem,
        checkoutItems,
        checkoutTotal,
        clearBuyNow,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}


