
import { useState, useEffect } from "react";
import ProductContext from "./productContext";
import { auth, db } from "../firebase";
import { onAuthStateChanged } from "firebase/auth";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  writeBatch,
} from "firebase/firestore";

const initialProducts = [
  {
    id: "watch-001",
    name: "Royal Gold Luxury Watch",
    category: "Luxury",
    price: 12500,
    stock: 12,
    discountPercent: 0,
    offerActive: false,
    status: "Active",
    oldPrice: 16000,
    rating: 4.8,
    reviews: 24,
  },
  {
    id: "watch-002",
    name: "Classic Silver Watch",
    category: "Classic",
    price: 9800,
    stock: 10,
    discountPercent: 0,
    offerActive: false,
    status: "Active",
    oldPrice: 12000,
    rating: 4.7,
    reviews: 18,
  },
  {
    id: "watch-003",
    name: "Luxury Black Watch",
    category: "Premium",
    price: 15000,
    stock: 8,
    discountPercent: 0,
    offerActive: false,
    status: "Active",
    oldPrice: 18000,
    rating: 4.9,
    reviews: 30,
  },
];

export function ProductProvider({ children }) {
  const [products, setProducts] = useState(() => {
    try {
      const saved = localStorage.getItem("timelux_products");
      return saved ? JSON.parse(saved) : initialProducts;
    } catch (error) {
      console.error("Product loading error:", error);
      return initialProducts;
    }
  });

  const [loading, setLoading] = useState(true);

  // Firestore থেকে সব পণ্য রিয়েল-টাইমে লোড
  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, "products"),
      (snapshot) => {
        const firestoreProducts = snapshot.docs.map((item) => ({
  ...item.data(),
  id: item.id,
}));

        setProducts(firestoreProducts);
        setLoading(false);
      },
      (error) => {
        console.error("Firestore product loading error:", error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  // পুরোনো LocalStorage পণ্য Firestore-এ একবার নেওয়া
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) return;

      try {
        const userDoc = await getDoc(doc(db, "users", user.uid));

        if (!userDoc.exists() || userDoc.data()?.role !== "admin") {
          return;
        }

        const productsSnapshot = await getDocs(
          collection(db, "products")
        );

        // Firestore-এ আগে থেকেই পণ্য থাকলে কিছু করা হবে না
        if (!productsSnapshot.empty) return;

        const savedProducts = localStorage.getItem("timelux_products");
        const oldProducts = savedProducts
          ? JSON.parse(savedProducts)
          : initialProducts;

        if (!Array.isArray(oldProducts) || oldProducts.length === 0) {
          return;
        }

        const batch = writeBatch(db);

        oldProducts.forEach((product) => {
          if (!product.id) return;

          const { id, ...productData } = product;

          batch.set(doc(db, "products", id), productData);
        });

        await batch.commit();

        console.log("Old products migrated to Firestore successfully!");
      } catch (error) {
        console.error("Product migration error:", error);
      }
    });

    return () => unsubscribe();
  }, []);

  // LocalStorage-এ পণ্যের একটি কপি রাখা
  useEffect(() => {
    localStorage.setItem("timelux_products", JSON.stringify(products));
  }, [products]);

  return (
    <ProductContext.Provider
      value={{ products, setProducts, loading }}
    >
      {children}
    </ProductContext.Provider>
  );
}

