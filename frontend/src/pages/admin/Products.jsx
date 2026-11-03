

import {
  doc,
  setDoc,
  deleteDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../../firebase";

import { uploadImage } from "../../cloudinary";
import { useState } from "react";
import { Link } from "react-router-dom";
import { useProducts } from "../../context/useProducts";

function getFinalPrice(product) {
  if (product.offerActive && Number(product.discountPercent) > 0) {
    return Math.round(
      Number(product.price) *
        (1 - Number(product.discountPercent) / 100)
    );
  }

  return Number(product.price);
}

const emptyForm = {
  name: "",
  brand: "",
  modelNumber: "",
  category: "",
  price: "",
  stock: "",
isAvailable: true,
discountPercent: "0",
offerActive: false,

  color: "",
  strapMaterial: "",
  dialSize: "",
  movement: "",
  waterproof: "",
  warranty: "",
  description: "",

  showBrand: true,
  showModelNumber: true,
  showColor: true,
  showMovement: true,
  showDialSize: true,
  showStrapMaterial: true,
  showWaterproof: true,
  showWarranty: true,

  images: [],
};

const specificationOptions = [
  ["showBrand", "Brand"],
  ["showModelNumber", "Model Number"],
  ["showColor", "Color"],
  ["showMovement", "Movement"],
  ["showDialSize", "Dial Size"],
  ["showStrapMaterial", "Strap Material"],
  ["showWaterproof", "Waterproof"],
  ["showWarranty", "Warranty"],
];

function getImageSrc(image) {
  if (typeof image === "string") return image;
  if (image && typeof image.src === "string") return image.src;
  return "";
}

function Products() {
  const { products } = useProducts();

  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [imageUrl, setImageUrl] = useState("");
  const [uploading, setUploading] = useState(false);

  const filteredProducts = products
  .filter((product) =>
    product.name.toLowerCase().includes(search.toLowerCase())
  )
  .sort((a, b) => {
    const timeA = a.createdAt?.toMillis
      ? a.createdAt.toMillis()
      : 0;

    const timeB = b.createdAt?.toMillis
      ? b.createdAt.toMillis()
      : 0;

    return timeB - timeA;
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setForm((previous) => ({
      ...previous,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const resetForm = () => {
    setForm(emptyForm);
    setImageUrl("");
    setEditingId(null);
    setShowForm(false);
  };

// Upload images to Cloudinary
const handleImageUpload = async (e) => {
  const files = Array.from(e.target.files || []);

  const remaining = 8 - form.images.length;

  if (remaining <= 0) {
    alert("Maximum 8 images allowed.");
    e.target.value = "";
    return;
  }

  const selectedFiles = files
    .filter((file) => file.type.startsWith("image/"))
    .slice(0, remaining);

  if (selectedFiles.length === 0) {
    alert("Please select valid image files.");
    e.target.value = "";
    return;
  }

  try {
    setUploading(true);

    const uploadedImages = await Promise.all(
      selectedFiles.map(async (file) => {
        const imageUrl = await uploadImage(file);
        console.log("CLOUDINARY UPLOADED URL:", imageUrl);

        return {
          type: "url",
          src: imageUrl,
        };
      })
    );

    setForm((previous) => ({
      ...previous,
      images: [...previous.images, ...uploadedImages],
    }));

    alert("Images uploaded successfully!");
  } catch (error) {
    console.error("Cloudinary upload error:", error);
    alert(error.message || "Image upload failed.");
  } finally {
    setUploading(false);
    e.target.value = "";
  }
};

// Image URL diye add
const addImageUrl = () => {
  const url = imageUrl.trim();

  if (!url) {
    alert("Please enter an image URL.");
    return;
  }

  if (form.images.length >= 8) {
    alert("Maximum 8 images allowed.");
    return;
  }

  try {
    const parsed = new URL(url);

    if (!["http:", "https:"].includes(parsed.protocol)) {
      throw new Error("Invalid URL");
    }
  } catch {
    alert("Please enter a valid HTTP or HTTPS image URL.");
    return;
  }

  setForm((previous) => ({
    ...previous,
    images: [...previous.images, { type: "url", src: url }],
  }));

  setImageUrl("");
};

  // Image remove
  const removeImage = (index) => {
    setForm((previous) => {
      const image = previous.images[index];

      if (
        image?.type === "file" &&
        typeof image.src === "string" &&
        image.src.startsWith("blob:")
      ) {
        URL.revokeObjectURL(image.src);
      }

      return {
        ...previous,
        images: previous.images.filter((_, i) => i !== index),
      };
    });
  };

  // Product save / update
  const handleSubmit = async (e) => {
    e.preventDefault();

    const discount = Number(form.discountPercent);
    const price = Number(form.price);
    const stock =
  form.stock.trim() === "" ? 0 : Number(form.stock);

    if (
  !form.name.trim() ||
  !form.category.trim() ||
  !form.price
) {
      alert("Please fill in all required fields.");
      return;
    }

    if (!Number.isFinite(price) || price <= 0) {
      alert("Please enter a valid price.");
      return;
    }

    if (!Number.isInteger(stock) || stock < 0) {
      alert("Please enter a valid stock quantity.");
      return;
    }

    if (!Number.isFinite(discount) || discount < 0 || discount > 90) {
      alert("Discount must be between 0 and 90%.");
      return;
    }

    const productData = {
      name: form.name.trim(),
      brand: form.brand.trim(),
      modelNumber: form.modelNumber.trim(),
      category: form.category.trim(),

      price,
stock,
isAvailable: form.isAvailable,
discountPercent: discount,
offerActive: form.offerActive && discount > 0,
      color: form.color.trim(),
      strapMaterial: form.strapMaterial.trim(),
      dialSize: form.dialSize.trim(),
      movement: form.movement.trim(),
      waterproof: form.waterproof.trim(),
      warranty: form.warranty.trim(),
      description: form.description.trim(),

      showBrand: form.showBrand,
      showModelNumber: form.showModelNumber,
      showColor: form.showColor,
      showMovement: form.showMovement,
      showDialSize: form.showDialSize,
      showStrapMaterial: form.showStrapMaterial,
      showWaterproof: form.showWaterproof,
      showWarranty: form.showWarranty,

      images: form.images,
      status: "Active",
    };

    try {
  if (editingId !== null) {
    await setDoc(
      doc(db, "products", editingId),
      productData,
      { merge: true }
    );

    alert("Product updated successfully!");
  } else {
    const newId = `watch-${Date.now()}`;

    await setDoc(doc(db, "products", newId), {
  ...productData,
  rating: 0,
  reviews: 0,
  createdAt: serverTimestamp(),
});

    alert("Product added successfully!");
  }

  resetForm();
} catch (error) {
  console.error("Product save error:", error);
  alert("Product save failed. Please try again.");
}
};
  // Existing product edit
  const handleEdit = (product) => {
    setForm({
      ...emptyForm,
      ...product,

      price: String(product.price),
      stock: String(product.stock),
      isAvailable: product.isAvailable ?? true,
      discountPercent: String(product.discountPercent ?? 0),
      offerActive: product.offerActive ?? false,

      showBrand: product.showBrand ?? true,
      showModelNumber: product.showModelNumber ?? true,
      showColor: product.showColor ?? true,
      showMovement: product.showMovement ?? true,
      showDialSize: product.showDialSize ?? true,
      showStrapMaterial: product.showStrapMaterial ?? true,
      showWaterproof: product.showWaterproof ?? true,
      showWarranty: product.showWarranty ?? true,

      images: product.images ?? [],
    });

    setEditingId(product.id);
    setShowForm(true);
  };

  // Product delete
  const handleDelete = async (id) => {
  if (window.confirm("Are you sure you want to delete this product?")) {
    try {
      await deleteDoc(doc(db, "products", id));
      alert("Product deleted successfully!");
    } catch (error) {
      console.error("Product delete error:", error);
      alert("Product delete failed. Please try again.");
    }
  }
};

  const previewPrice = form.price
    ? Math.round(
        Number(form.price) *
          (1 -
            (form.offerActive ? Number(form.discountPercent) : 0) / 100)
      )
    : 0;

  return (
    <div className="min-h-screen bg-[#0b0b0b] text-white">
      <div className="flex min-h-screen">

        {/* Sidebar */}
        <aside className="hidden w-64 border-r border-gray-800 bg-[#111] p-6 md:block">
          <Link to="/" className="text-2xl font-bold text-[#d4af37]">
            TimeLux
          </Link>

          <p className="mb-10 mt-2 text-xs tracking-widest text-gray-500">
            ADMIN PANEL
          </p>

          <nav className="space-y-3">
            <Link
              to="/admin"
              className="block rounded-lg px-4 py-3 text-gray-400 hover:bg-[#222]"
            >
              Dashboard
            </Link>

            <Link
              to="/admin/products"
              className="block rounded-lg bg-[#d4af37] px-4 py-3 font-semibold text-black"
            >
              Products
            </Link>

            <Link
              to="/admin/orders"
              className="block rounded-lg px-4 py-3 text-gray-400 hover:bg-[#222]"
            >
              Orders
            </Link>

            <Link
              to="/admin/customers"
              className="block rounded-lg px-4 py-3 text-gray-400 hover:bg-[#222]"
            >
              Customers
            </Link>

            <Link
              to="/admin/settings"
              className="block rounded-lg px-4 py-3 text-gray-400 hover:bg-[#222]"
            >
              Settings
            </Link>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="min-w-0 flex-1 p-5 md:p-10">

          {/* Header */}
          <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold">Products</h1>
              <p className="mt-2 text-sm text-gray-400">
                Manage products, images, prices and offers.
              </p>
            </div>

            <Link to="/admin" className="text-sm text-[#d4af37]">
              ← Back to Dashboard
            </Link>
          </div>

          {/* Statistics */}
          <div className="mb-8 grid grid-cols-1 gap-5 sm:grid-cols-3">

            <div className="rounded-xl border border-gray-800 bg-[#151515] p-5">
              <p className="text-sm text-gray-400">Total Products</p>
              <h2 className="mt-2 text-3xl font-bold text-[#d4af37]">
                {products.length}
              </h2>
            </div>

            <div className="rounded-xl border border-gray-800 bg-[#151515] p-5">
              <p className="text-sm text-gray-400">Total Stock</p>
              <h2 className="mt-2 text-3xl font-bold">
                {products.reduce(
                  (sum, item) => sum + Number(item.stock || 0),
                  0
                )}
              </h2>
            </div>

            <div className="rounded-xl border border-gray-800 bg-[#151515] p-5">
              <p className="text-sm text-gray-400">Active Offers</p>
              <h2 className="mt-2 text-3xl font-bold text-green-400">
                {products.filter((item) => item.offerActive).length}
              </h2>
            </div>

          </div>

          {/* Search and Add */}
          <div className="mb-6 flex flex-col gap-4 sm:flex-row">

            <input
              type="text"
              placeholder="Search products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 rounded-lg border border-gray-700 bg-[#151515] px-4 py-3 outline-none focus:border-[#d4af37]"
            />

            <button
              onClick={() => {
                resetForm();
                setShowForm(true);
              }}
              className="rounded-lg bg-[#d4af37] px-6 py-3 font-bold text-black hover:bg-white"
            >
              + Add New Product
            </button>

          </div>

          {/* Add / Edit Form */}
          {showForm && (
            <form
              onSubmit={handleSubmit}
              className="mb-8 space-y-7 rounded-xl border border-gray-800 bg-[#151515] p-6"
            >

              <h2 className="text-xl font-bold text-[#d4af37]">
                {editingId !== null ? "Edit Product" : "Add New Product"}
              </h2>

              {/* Basic Information */}
              <section>
                <h3 className="mb-4 font-semibold text-[#d4af37]">
                  Product Information
                </h3>

                <div className="grid gap-4 sm:grid-cols-2">

                  {[
                    ["name", "Product Name", true],
                    ["brand", "Brand", false],
                    ["modelNumber", "Model Number", false],
                    ["price", "Regular Price (৳)", true],
                    ["stock", "Stock Quantity (Optional)", false],
                    ["color", "Color", false],
                    ["strapMaterial", "Strap Material", false],
                    ["dialSize", "Dial Size (e.g. 42 mm)", false],
                    ["movement", "Movement (e.g. Quartz)", false],
                    ["waterproof", "Waterproof (e.g. 30M / 50M)", false],
                    ["warranty", "Warranty (e.g. 1 Year)", false],
                  ].map(([name, placeholder, required]) => (
                    <input
                      key={name}
                      name={name}
                      value={form[name]}
                      onChange={handleChange}
                      placeholder={placeholder}
                      required={required}
                      type={
                        name === "price" || name === "stock"
                          ? "number"
                          : "text"
                      }
                      min={
                        name === "price"
                          ? "1"
                          : name === "stock"
                            ? "0"
                            : undefined
                      }
                      className="w-full rounded-lg border border-gray-700 bg-[#0b0b0b] p-3 outline-none focus:border-[#d4af37]"
                    />
                  ))}

                  <div>
  <label className="mb-2 block text-sm font-semibold text-[#d4af37]">
    Watch Category *
  </label>

  <select
    name="category"
    value={form.category}
    onChange={handleChange}
    required
    className="w-full rounded-lg border border-gray-700 bg-[#0b0b0b] p-3 text-white outline-none focus:border-[#d4af37]"
  >
    <option value="">Select Watch Category</option>
    <option value="Men's Watch">Men's Watch</option>
    <option value="Women's Watch">Women's Watch</option>
    <option value="Couple Watch">Couple Watch</option>
  </select>
</div>


                </div>
                {/* Product Availability */}
<label className="mt-5 flex cursor-pointer items-center justify-between rounded-lg border border-gray-700 bg-[#0b0b0b] p-4">

  <div>
    <span className="block font-semibold">
      Product Availability
    </span>

    <span className="text-xs text-gray-400">
      Allow customers to order this product
    </span>
  </div>

  <div className="flex items-center gap-3">

    <span className={`text-sm font-semibold ${
      form.isAvailable ? "text-green-400" : "text-red-400"
    }`}>
      {form.isAvailable ? "Available" : "Unavailable"}
    </span>

    <input
      type="checkbox"
      name="isAvailable"
      checked={form.isAvailable}
      onChange={handleChange}
      className="h-5 w-5 accent-[#d4af37]"
    />

  </div>
</label> 

                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  placeholder="Product Description"
                  rows="4"
                  className="mt-4 w-full rounded-lg border border-gray-700 bg-[#0b0b0b] p-3 outline-none focus:border-[#d4af37]"
                />

              </section>

              {/* Specification Visibility */}
              <section className="rounded-xl border border-[#d4af37]/30 bg-[#0b0b0b] p-5">

                <h3 className="text-lg font-bold text-[#d4af37]">
                  Specification Display Settings
                </h3>

                <p className="mb-5 mt-2 text-sm text-gray-400">
                  Choose which specifications customers can see on the
                  Product Details page.
                </p>

                <div className="grid gap-3 sm:grid-cols-2">

                  {specificationOptions.map(([name, label]) => (
                    <label
                      key={name}
                      className="flex cursor-pointer items-center justify-between rounded-lg border border-gray-800 p-4 transition hover:border-[#d4af37]/50"
                    >
                      <span className="font-medium">{label}</span>

                      <div className="flex items-center gap-3">
                        <span
                          className={`text-xs font-semibold ${
                            form[name] ? "text-green-400" : "text-gray-500"
                          }`}
                        >
                          {form[name] ? "Visible" : "Hidden"}
                        </span>

                        <input
                          type="checkbox"
                          name={name}
                          checked={form[name] ?? true}
                          onChange={handleChange}
                          className="h-5 w-5 accent-[#d4af37]"
                        />
                      </div>
                    </label>
                  ))}

                </div>
              </section>

              {/* Product Images */}
              <section className="border-t border-gray-800 pt-6">

                <h3 className="mb-2 font-semibold text-[#d4af37]">
                  Product Photos
                </h3>

                <p className="mb-4 text-sm text-gray-400">
                  Add up to 8 images. Upload from computer or paste an image URL.
                </p>

                <label className="mb-4 block cursor-pointer rounded-lg border border-dashed border-[#d4af37] bg-[#0b0b0b] p-6 text-center hover:bg-[#202020]">

                  <span className="font-semibold text-[#d4af37]">
                    + Select Images From Computer
                  </span>

                  <span className="mt-2 block text-xs text-gray-400">
                    JPG, PNG, WEBP — Maximum 8 images
                  </span>

                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageUpload}
                    disabled={form.images.length >= 8 || uploading}
                    className="hidden"
                  />

                </label>

                <div className="mb-4 flex flex-col gap-3 sm:flex-row">

                  <input
                    type="url"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    placeholder="Paste image URL (https://...)"
                    className="min-w-0 flex-1 rounded-lg border border-gray-700 bg-[#0b0b0b] p-3 outline-none focus:border-[#d4af37]"
                    disabled={uploading || form.images.length >= 8}
                  />

                  <button
                    type="button"
                    onClick={addImageUrl}
                    disabled={form.images.length >=8||uploading }
                    className="rounded-lg border border-[#d4af37] px-5 py-3 text-[#d4af37] disabled:opacity-40"
                  >
                    Add Image URL
                  </button>

                </div>

                <p className="mb-3 text-sm text-gray-400">
                  Selected Images: {form.images.length}/8
                </p>

                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-5">

                  {form.images.map((image, index) => {
                    const imageSrc = getImageSrc(image);
                    console.log("Product Image URL:", imageSrc);

                    return (
                      <div key={`${imageSrc}-${index}`} className="relative">

                        <img
                          src={imageSrc || undefined}
                          alt={`Product ${index + 1}`}
                          className="h-32 w-full rounded-lg border border-gray-700 bg-white object-contain"
                        />

                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute right-2 top-2 rounded-full bg-red-600 px-2 py-1 text-xs font-bold text-white"
                        >
                          Remove
                        </button>

                        <p className="mt-1 text-center text-xs text-gray-400">
                          {index === 0 ? "Main Image" : `Image ${index + 1}`}
                        </p>

                      </div>
                    );
                  })}

                </div>
              </section>

              {/* Discount */}
              <section className="border-t border-gray-800 pt-6">

                <h3 className="mb-4 font-semibold text-[#d4af37]">
                  Price & Special Offer
                </h3>

                <div className="grid gap-4 sm:grid-cols-2">

                  <div>
                    <label className="mb-2 block text-sm text-gray-400">
                      Discount Percentage (%)
                    </label>

                    <input
                      name="discountPercent"
                      type="number"
                      min="0"
                      max="90"
                      value={form.discountPercent}
                      onChange={handleChange}
                      className="w-full rounded-lg border border-gray-700 bg-[#0b0b0b] p-3 outline-none focus:border-[#d4af37]"
                    />
                  </div>

                  <label className="flex items-center gap-3 rounded-lg border border-gray-700 bg-[#0b0b0b] p-3">

                    <input
                      name="offerActive"
                      type="checkbox"
                      checked={form.offerActive}
                      onChange={handleChange}
                      className="h-5 w-5 accent-[#d4af37]"
                    />

                    <span>
                      <span className="block font-semibold">
                        Activate Offer
                      </span>

                      <span className="text-xs text-gray-400">
                        Show discount for this product
                      </span>
                    </span>

                  </label>
                </div>

                <div className="mt-5 rounded-lg border border-[#d4af37]/30 bg-[#d4af37]/10 p-4">

                  <p className="text-sm text-gray-300">
                    Customer Price Preview
                  </p>

                  <div className="mt-2 flex flex-wrap items-center gap-3">

                    {form.offerActive &&
                      Number(form.discountPercent) > 0 && (
                        <span className="text-gray-400 line-through">
                          ৳{Number(form.price || 0).toLocaleString("en-BD")}
                        </span>
                      )}

                    <span className="text-2xl font-bold text-[#d4af37]">
                      ৳{previewPrice.toLocaleString("en-BD")}
                    </span>

                    {form.offerActive &&
                      Number(form.discountPercent) > 0 && (
                        <span className="rounded-full bg-red-600 px-3 py-1 text-xs font-bold">
                          {form.discountPercent}% OFF
                        </span>
                      )}

                  </div>
                </div>
              </section>

              {/* Form Buttons */}
              <div className="flex flex-wrap gap-3">

                <button
  type="submit"
  disabled={uploading}
  className="rounded-lg bg-[#d4af37] px-6 py-3 font-bold text-black hover:bg-white disabled:cursor-not-allowed disabled:opacity-50"
>
  {uploading
    ? "Uploading Images..."
    : editingId !== null
      ? "Update Product"
      : "Save Product"}
</button>

                <button
                  type="button"
                  onClick={resetForm}
                  className="rounded-lg border border-gray-600 px-6 py-3 hover:bg-gray-800"
                >
                  Cancel
                </button>

              </div>

            </form>
          )}

          {/* Product List */}
          <div className="overflow-x-auto rounded-xl border border-gray-800 bg-[#151515]">

            <table className="w-full min-w-[950px] text-left">

              <thead className="border-b border-gray-800 bg-[#202020]">
                <tr className="text-sm text-gray-400">
                  <th className="p-5">Image</th>
                  <th className="p-5">Product</th>
                  <th className="p-5">Category</th>
                  <th className="p-5">Regular Price</th>
                  <th className="p-5">Offer</th>
                  <th className="p-5">Customer Price</th>
                  <th className="p-5">Stock</th>
                  <th className="p-5">Availability</th>
                  <th className="p-5">Actions</th>
                </tr>
              </thead>

              <tbody>

                {filteredProducts.map((product) => {
                  const firstImage = product.images?.[0];
                  const imageSrc = getImageSrc(firstImage);

                  return (
                    <tr
                      key={product.id}
                      className="border-b border-gray-800 text-sm last:border-0"
                    >

                      <td className="p-5">
                        {imageSrc ? (
                          <img
                            src={imageSrc}
                            alt={product.name}
                            className="h-14 w-14 rounded-lg bg-white object-contain"
                          />
                        ) : (
                          <span className="text-xs text-gray-500">
                            No Image
                          </span>
                        )}
                      </td>

                      <td className="p-5 font-semibold">
                        {product.name}

                        <span className="block text-xs text-gray-500">
                          {product.modelNumber || ""}
                        </span>
                      </td>

                      <td className="p-5 text-gray-400">
                        {product.category}
                      </td>

                      <td className="p-5 text-gray-400">
                        ৳{Number(product.price).toLocaleString("en-BD")}
                      </td>

                      <td className="p-5">
                        {product.offerActive ? (
                          <span className="rounded-full bg-red-900/40 px-3 py-1 text-xs font-bold text-red-400">
                            {product.discountPercent}% OFF
                          </span>
                        ) : (
                          <span className="text-gray-500">No Offer</span>
                        )}
                      </td>

                      <td className="p-5 font-bold text-[#d4af37]">
                        ৳{getFinalPrice(product).toLocaleString("en-BD")}
                      </td>

                      <td className="p-5">{product.stock}</td>
                      <td className="p-5">
  {Number(product.stock) <= 0 ? (
    <span className="text-red-400">Out of Stock</span>
  ) : product.isAvailable === false ? (
    <span className="text-red-400">Unavailable</span>
  ) : (
    <span className="text-green-400">Available</span>
  )}
</td>

                      <td className="p-5">
                        <div className="flex gap-3">

                          <button
                            onClick={() => handleEdit(product)}
                            className="text-[#d4af37] hover:text-white"
                          >
                            Edit
                          </button>

                          <button
                            onClick={() => handleDelete(product.id)}
                            className="text-red-400 hover:text-red-300"
                          >
                            Delete
                          </button>

                        </div>
                      </td>

                    </tr>
                  );
                })}

                {filteredProducts.length === 0 && (
                  <tr>
                    <td colSpan="9" className="p-8 text-center text-gray-500">
                      No products found.
                    </td>
                  </tr>
                )}

              </tbody>
            </table>
          </div>

          <p className="mt-4 text-xs text-gray-500">
            Cloudinary is used for permanent product image hosting.
Product information is currently saved in browser LocalStorage.
          </p>

        </main>
      </div>
    </div>
  );
}

export default Products;
