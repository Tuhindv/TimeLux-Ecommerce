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
    category: "Men's Watch",
    price: 12500,
    stock: 12,
    discountPercent: 15,
    offerActive: true,
    status: "Active",
    oldPrice: 16000,
    rating: 4.9,
    reviews: 42,
    brand: "Rolex",
    modelNumber: "TL-RG-001",
    color: "Champagne Gold & Obsidian",
    movement: "Swiss Automatic Self-Winding",
    dialSize: "41 mm",
    strapMaterial: "18K Gold-Plated Oyster Steel",
    waterproof: "100M / 10 ATM",
    warranty: "2 Years International Warranty",
    images: [
      "https://images.unsplash.com/photo-1523170335258-f5ed11844a49?w=900&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1547996160-81dfa63595aa?w=900&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=900&auto=format&fit=crop&q=80",
    ],
    description:
      "Swiss automatic movement\nAnti-reflective sapphire crystal glass\nBrushed 316L surgical grade stainless steel\nWater resistant up to 100 meters",
  },
  {
    id: "watch-002",
    name: "Classic Silver Watch",
    category: "Women's Watch",
    price: 9800,
    stock: 10,
    discountPercent: 10,
    offerActive: true,
    status: "Active",
    oldPrice: 12000,
    rating: 4.8,
    reviews: 31,
    brand: "Cartier",
    modelNumber: "TL-CS-002",
    color: "Sterling Silver & Ivory",
    movement: "High-Precision Swiss Quartz",
    dialSize: "34 mm",
    strapMaterial: "Genuine Italian Calfskin Leather",
    waterproof: "50M / 5 ATM",
    warranty: "2 Years Official Warranty",
    images: [
      "https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=900&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=900&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1509048191080-d2984bad6ae5?w=900&auto=format&fit=crop&q=80",
    ],
    description:
      "Minimalist sunray silver bezel\nGenuine hand-stitched leather strap\nScratch-resistant sapphire crystal\nUltra-slim 7mm case profile",
  },
  {
    id: "watch-003",
    name: "Luxury Black Watch",
    category: "Couple Watch",
    price: 15000,
    stock: 8,
    discountPercent: 20,
    offerActive: true,
    status: "Active",
    oldPrice: 18000,
    rating: 4.9,
    reviews: 54,
    brand: "Omega",
    modelNumber: "TL-LB-003",
    color: "Matte Onyx Black & Rose Gold",
    movement: "Co-Axial Master Chronometer",
    dialSize: "40 mm & 32 mm Pair",
    strapMaterial: "Anodized Milanese Mesh & Leather",
    waterproof: "100M / 10 ATM",
    warranty: "3 Years TimeLux Concierge Warranty",
    images: [
      "https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=900&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=900&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1542496658-e33a6d0d50f6?w=900&auto=format&fit=crop&q=80",
    ],
    description:
      "Matching His & Hers luxury pair\nMatte black ceramic PVD coating\nSuper-LumiNova hands and indices\nPresented in a dual mahogany gift box",
  },
  {
    id: "watch-004",
    name: "Imperial Chronograph Sovereign",
    category: "Men's Watch",
    price: 22500,
    stock: 6,
    discountPercent: 18,
    offerActive: true,
    status: "Active",
    oldPrice: 27500,
    rating: 5.0,
    reviews: 67,
    brand: "Patek Philippe",
    modelNumber: "TL-IC-004",
    color: "Midnight Blue & Gold",
    movement: "Flyback Automatic Calibre",
    dialSize: "42 mm",
    strapMaterial: "Alligator-Embossed Leather",
    waterproof: "120M / 12 ATM",
    warranty: "5 Years International Warranty",
    images: [
      "https://images.unsplash.com/photo-1547996160-81dfa63595aa?w=900&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1587836374828-4dbafa94cf0e?w=900&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1523170335258-f5ed11844a49?w=900&auto=format&fit=crop&q=80",
    ],
    description:
      "Triple sub-dial tachymeter chronograph\nExhibition sapphire caseback\n72-hour power reserve\nHand-polished champagne gold bezel",
  },
  {
    id: "watch-005",
    name: "Audemars Royal Oak Skeleton",
    category: "Men's Watch",
    price: 34000,
    stock: 5,
    discountPercent: 12,
    offerActive: true,
    status: "Active",
    oldPrice: 38600,
    rating: 4.9,
    reviews: 39,
    brand: "Audemars Piguet",
    modelNumber: "TL-RO-005",
    color: "Gunmetal Titanium & Gold",
    movement: "Openworked Tourbillon Automatic",
    dialSize: "41 mm",
    strapMaterial: "Integrated Brushed Titanium",
    waterproof: "100M / 10 ATM",
    warranty: "3 Years Official Warranty",
    images: [
      "https://images.unsplash.com/photo-1587836374828-4dbafa94cf0e?w=900&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1614164185128-e4ec99c436d7?w=900&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1539874754764-5a96559165b0?w=900&auto=format&fit=crop&q=80",
    ],
    description:
      "Iconic octagonal bezel with 8 hexagonal screws\nExposed mechanical bridge architecture\nGlareproofed sapphire crystal front and back\nButterfly deployment clasp",
  },
  {
    id: "watch-006",
    name: "Celeste Rose Gold Petite",
    category: "Women's Watch",
    price: 14200,
    stock: 14,
    discountPercent: 15,
    offerActive: true,
    status: "Active",
    oldPrice: 16700,
    rating: 4.9,
    reviews: 48,
    brand: "Cartier",
    modelNumber: "TL-CR-006",
    color: "Blush Rose Gold & Mother of Pearl",
    movement: "Swiss Precision Quartz",
    dialSize: "30 mm",
    strapMaterial: "18K Rose Gold Mesh Bracelet",
    waterproof: "50M / 5 ATM",
    warranty: "2 Years International Warranty",
    images: [
      "https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=900&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=900&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=900&auto=format&fit=crop&q=80",
    ],
    description:
      "Genuine Mother-of-Pearl iridescent dial\nCrystal-set hour markers\nAdjustable silky Milanese rose gold mesh\nHypoallergenic surgical steel case",
  },
  {
    id: "watch-007",
    name: "Carrera Heritage Diver 300M",
    category: "Men's Watch",
    price: 18900,
    stock: 9,
    discountPercent: 0,
    offerActive: false,
    status: "Active",
    oldPrice: 21000,
    rating: 4.8,
    reviews: 29,
    brand: "Tag Heuer",
    modelNumber: "TL-CH-007",
    color: "Abyssal Black & Silver",
    movement: "Calibre 5 Automatic",
    dialSize: "43 mm",
    strapMaterial: "Oyster Brushed Steel Link",
    waterproof: "300M / 30 ATM",
    warranty: "2 Years Official Warranty",
    images: [
      "https://images.unsplash.com/photo-1539874754764-5a96559165b0?w=900&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1542496658-e33a6d0d50f6?w=900&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1523170335258-f5ed11844a49?w=900&auto=format&fit=crop&q=80",
    ],
    description:
      "Unidirectional ceramic diving bezel\nScrew-down crown for 300m depth rating\nHigh-visibility luminous hands\nMicro-adjustable diver's extension clasp",
  },
  {
    id: "watch-008",
    name: "Eternity Duo Champagne Set",
    category: "Couple Watch",
    price: 26500,
    stock: 7,
    discountPercent: 22,
    offerActive: true,
    status: "Active",
    oldPrice: 34000,
    rating: 5.0,
    reviews: 61,
    brand: "Rolex",
    modelNumber: "TL-ED-008",
    color: "Two-Tone Champagne Gold & Silver",
    movement: "Perpetual Automatic Pair",
    dialSize: "41 mm & 31 mm",
    strapMaterial: "Jubilee Five-Piece Link Steel & Gold",
    waterproof: "100M / 10 ATM",
    warranty: "3 Years Couple Care Warranty",
    images: [
      "https://images.unsplash.com/photo-1542496658-e33a6d0d50f6?w=900&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1523170335258-f5ed11844a49?w=900&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=900&auto=format&fit=crop&q=80",
    ],
    description:
      "Signature fluted bezel on both timepieces\nCyclops date magnifier lens at 3 o'clock\nIdeal anniversary & wedding luxury gift set\nIncludes complimentary engraving card",
  },
  {
    id: "watch-009",
    name: "Cosmograph Daytona Gold",
    category: "Men's Watch",
    price: 29500,
    stock: 4,
    discountPercent: 10,
    offerActive: true,
    status: "Active",
    oldPrice: 32800,
    rating: 4.9,
    reviews: 44,
    brand: "Rolex",
    modelNumber: "TL-CD-009",
    color: "Yellow Gold & Espresso Black",
    movement: "Chronometer Certified Automatic",
    dialSize: "40 mm",
    strapMaterial: "Solid Gold-Tone Oyster Bracelet",
    waterproof: "100M / 10 ATM",
    warranty: "3 Years International Warranty",
    images: [
      "https://images.unsplash.com/photo-1614164185128-e4ec99c436d7?w=900&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1547996160-81dfa63595aa?w=900&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1587836374828-4dbafa94cf0e?w=900&auto=format&fit=crop&q=80",
    ],
    description:
      "Engraved tachymetric scale bezel\nTriplock winding crown system\nScratch-proof sapphire crystal\nCollector's edition presentation case",
  },
  {
    id: "watch-010",
    name: "Lumiere Diamond Marquise",
    category: "Women's Watch",
    price: 16800,
    stock: 11,
    discountPercent: 15,
    offerActive: true,
    status: "Active",
    oldPrice: 19800,
    rating: 4.9,
    reviews: 36,
    brand: "Omega",
    modelNumber: "TL-LD-010",
    color: "Warm Champagne & Pearl White",
    movement: "Swiss Quartz Calibre",
    dialSize: "32 mm",
    strapMaterial: "Polished Two-Tone Link Bracelet",
    waterproof: "50M / 5 ATM",
    warranty: "2 Years Official Warranty",
    images: [
      "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=900&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=900&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=900&auto=format&fit=crop&q=80",
    ],
    description:
      "Halo crystal-embellished bezel\nSilk-patterned ivory dial\nFeatherlight ergonomic wrist fit\nTarnish-resistant PVD gold plating",
  },
  {
    id: "watch-011",
    name: "Le Locle Vintage Mechanical",
    category: "Women's Watch",
    price: 11500,
    stock: 15,
    discountPercent: 0,
    offerActive: false,
    status: "Active",
    oldPrice: 13500,
    rating: 4.7,
    reviews: 22,
    brand: "Tissot",
    modelNumber: "TL-LL-011",
    color: "Antique Gold & Espresso Leather",
    movement: "Swiss Automatic Powermatic",
    dialSize: "35 mm",
    strapMaterial: "Top-Grain Vintage Saddle Leather",
    waterproof: "30M / 3 ATM",
    warranty: "2 Years Official Warranty",
    images: [
      "https://images.unsplash.com/photo-1509048191080-d2984bad6ae5?w=900&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1434056886845-dac89ffe9b56?w=900&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=900&auto=format&fit=crop&q=80",
    ],
    description:
      "Classic Roman numeral indices\nGuilloche textured center dial\nQuick-release interchangeable strap\nTimeless Parisian dress watch silhouette",
  },
  {
    id: "watch-012",
    name: "Symphony Royal Couple Edition",
    category: "Couple Watch",
    price: 21000,
    stock: 9,
    discountPercent: 16,
    offerActive: true,
    status: "Active",
    oldPrice: 25000,
    rating: 4.9,
    reviews: 47,
    brand: "Tissot",
    modelNumber: "TL-SR-012",
    color: "Rose Gold & Midnight Navy",
    movement: "Dual Swiss Quartz Movements",
    dialSize: "40 mm & 32 mm Pair",
    strapMaterial: "Fine Italian Navy Leather",
    waterproof: "50M / 5 ATM",
    warranty: "2 Years Couple Warranty",
    images: [
      "https://images.unsplash.com/photo-1434056886845-dac89ffe9b56?w=900&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=900&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1509048191080-d2984bad6ae5?w=900&auto=format&fit=crop&q=80",
    ],
    description:
      "Harmonized midnight blue sunray dials\nUltra-thin rose gold cases\nWater and sweat-resistant leather lining\nComplete His & Hers luxury gift set",
  },
];

/**
 * Merges cached localStorage products with the full 12-item curated catalog
 * so existing browsers with only 3 cached demo watches immediately receive
 * the full 12-watch showcase while preserving any custom admin products.
 */
function loadMergedInitialProducts() {
  try {
    const saved = localStorage.getItem("timelux_products");
    if (!saved) return initialProducts;

    const parsed = JSON.parse(saved);
    if (!Array.isArray(parsed) || parsed.length === 0) return initialProducts;

    const savedMap = new Map(parsed.map((item) => [item.id, item]));

    // Ensure all 12 curated watches exist with upgraded metadata & images
    const merged = initialProducts.map((curated) => {
      const existing = savedMap.get(curated.id);
      if (!existing) return curated;
      savedMap.delete(curated.id);
      return {
        ...curated,
        ...existing,
        // Ensure upgraded category, brand, and multi-photo gallery are populated
        category:
          existing.category &&
          !["Luxury", "Classic", "Premium"].includes(existing.category)
            ? existing.category
            : curated.category,
        brand: existing.brand || curated.brand,
        images:
          Array.isArray(existing.images) && existing.images.length > 0
            ? existing.images
            : curated.images,
        description: existing.description || curated.description,
        movement: existing.movement || curated.movement,
        dialSize: existing.dialSize || curated.dialSize,
        strapMaterial: existing.strapMaterial || curated.strapMaterial,
        waterproof: existing.waterproof || curated.waterproof,
        warranty: existing.warranty || curated.warranty,
      };
    });

    // Append any custom admin-created watches
    for (const customItem of savedMap.values()) {
      merged.unshift(customItem);
    }

    return merged;
  } catch (error) {
    console.warn("Product loading error:", error);
    return initialProducts;
  }
}

export function ProductProvider({ children }) {
  const [products, setProducts] = useState(() => loadMergedInitialProducts());

  const [loading, setLoading] = useState(() =>
    Boolean(
      import.meta.env.VITE_FIREBASE_PROJECT_ID &&
        import.meta.env.VITE_FIREBASE_PROJECT_ID !== "timelux-demo"
    )
  );

  // Firestore live sync when valid Firebase project ID is configured
  useEffect(() => {
    const isConfigured = Boolean(
      import.meta.env.VITE_FIREBASE_PROJECT_ID &&
        import.meta.env.VITE_FIREBASE_PROJECT_ID !== "timelux-demo"
    );

    if (!isConfigured) {
      return;
    }

    try {
      const unsubscribe = onSnapshot(
        collection(db, "products"),
        (snapshot) => {
          const firestoreProducts = snapshot.docs.map((item) => ({
            id: item.id,
            ...item.data(),
          }));

          if (firestoreProducts.length > 0) {
            setProducts(firestoreProducts);
          }
          setLoading(false);
        },
        (error) => {
          console.warn("Firestore product listener notice:", error.message);
          setLoading(false);
        }
      );

      return () => unsubscribe();
    } catch (error) {
      console.warn("Firestore initialization notice:", error.message);
    }
  }, []);

  // Admin migration from localStorage to Firestore
  useEffect(() => {
    const isConfigured = Boolean(
      import.meta.env.VITE_FIREBASE_PROJECT_ID &&
        import.meta.env.VITE_FIREBASE_PROJECT_ID !== "timelux-demo" &&
        import.meta.env.VITE_FIREBASE_API_KEY
    );

    if (!isConfigured) return;

    try {
      const unsubscribe = onAuthStateChanged(auth, async (user) => {
        if (!user) return;

        try {
          const userDoc = await getDoc(doc(db, "users", user.uid));

          if (!userDoc.exists() || userDoc.data()?.role !== "admin") {
            return;
          }

          const productsSnapshot = await getDocs(collection(db, "products"));
          if (!productsSnapshot.empty) return;

          const savedProducts = localStorage.getItem("timelux_products");
          const oldProducts = savedProducts
            ? JSON.parse(savedProducts)
            : initialProducts;

          if (!Array.isArray(oldProducts) || oldProducts.length === 0) return;

          const batch = writeBatch(db);
          oldProducts.forEach((product) => {
            if (!product.id) return;
            const { id, ...productData } = product;
            batch.set(doc(db, "products", id), productData);
          });

          await batch.commit();
        } catch (error) {
          console.warn("Product migration notice:", error.message);
        }
      });

      return () => unsubscribe();
    } catch (err) {
      console.warn("Auth state listener notice:", err.message);
    }
  }, []);

  // Sync products copy to LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem("timelux_products", JSON.stringify(products));
    } catch (err) {
      console.warn("Could not cache products to localStorage:", err);
    }
  }, [products]);

  return (
    <ProductContext.Provider value={{ products, setProducts, loading }}>
      {children}
    </ProductContext.Provider>
  );
}

export default ProductProvider;
