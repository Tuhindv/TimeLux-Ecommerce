
import { useState } from "react";
import { Link } from "react-router-dom";

function Settings() {
  const [settings, setSettings] = useState({
    storeName: "TimeLux",
    tagline: "Luxury Watches, Timeless Style",
    phone: "01311657122",
    whatsapp: "01311657122",
    email: "timelux@example.com",
    address: "Gopalganj, Bangladesh",
    deliveryInside: "60",
    deliveryOutside: "120",
    facebook: "",
    instagram: "",
    announcement: "Welcome to TimeLux! Discover our premium watch collection.",
  });

  const [saved, setSaved] = useState(false);

  const handleChange = (e) => {
    setSettings({
      ...settings,
      [e.target.name]: e.target.value,
    });
    setSaved(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSaved(true);
  };

  const inputClass =
    "w-full rounded-lg border border-gray-700 bg-[#0b0b0b] px-4 py-3 text-white outline-none focus:border-[#d4af37]";

  const labelClass = "mb-2 block text-sm font-medium text-gray-300";

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
              className="block rounded-lg px-4 py-3 text-gray-400 hover:bg-[#222] hover:text-white"
            >
              Dashboard
            </Link>

            <Link
              to="/admin/products"
              className="block rounded-lg px-4 py-3 text-gray-400 hover:bg-[#222] hover:text-white"
            >
              Products
            </Link>

            <Link
              to="/admin/orders"
              className="block rounded-lg px-4 py-3 text-gray-400 hover:bg-[#222] hover:text-white"
            >
              Orders
            </Link>

            <Link
              to="/admin/customers"
              className="block rounded-lg px-4 py-3 text-gray-400 hover:bg-[#222] hover:text-white"
            >
              Customers
            </Link>

            <Link
              to="/admin/settings"
              className="block rounded-lg bg-[#d4af37] px-4 py-3 font-semibold text-black"
            >
              Settings
            </Link>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="min-w-0 flex-1 p-5 md:p-10">

          <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold">Website Settings</h1>
              <p className="mt-2 text-sm text-gray-400">
                Manage your TimeLux store information.
              </p>
            </div>

            <Link
              to="/admin"
              className="text-sm text-[#d4af37] hover:text-white"
            >
              ← Back to Dashboard
            </Link>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">

            {/* Store Information */}
            <section className="rounded-xl border border-gray-800 bg-[#151515] p-6">
              <h2 className="mb-6 text-xl font-bold text-[#d4af37]">
                Store Information
              </h2>

              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label className={labelClass}>Store Name</label>
                  <input
                    name="storeName"
                    value={settings.storeName}
                    onChange={handleChange}
                    className={inputClass}
                    required
                  />
                </div>

                <div>
                  <label className={labelClass}>Store Tagline</label>
                  <input
                    name="tagline"
                    value={settings.tagline}
                    onChange={handleChange}
                    className={inputClass}
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className={labelClass}>Store Address</label>
                  <textarea
                    name="address"
                    value={settings.address}
                    onChange={handleChange}
                    rows="2"
                    className={inputClass}
                  />
                </div>
              </div>
            </section>

            {/* Contact Information */}
            <section className="rounded-xl border border-gray-800 bg-[#151515] p-6">
              <h2 className="mb-6 text-xl font-bold text-[#d4af37]">
                Contact Information
              </h2>

              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label className={labelClass}>Contact Number</label>
                  <input
                    name="phone"
                    value={settings.phone}
                    onChange={handleChange}
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className={labelClass}>WhatsApp Number</label>
                  <input
                    name="whatsapp"
                    value={settings.whatsapp}
                    onChange={handleChange}
                    className={inputClass}
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className={labelClass}>Email Address</label>
                  <input
                    type="email"
                    name="email"
                    value={settings.email}
                    onChange={handleChange}
                    className={inputClass}
                  />
                </div>
              </div>
            </section>

            {/* Delivery Settings */}
            <section className="rounded-xl border border-gray-800 bg-[#151515] p-6">
              <h2 className="mb-6 text-xl font-bold text-[#d4af37]">
                Delivery Settings
              </h2>

              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label className={labelClass}>
                    Delivery Charge Inside District (৳)
                  </label>
                  <input
                    type="number"
                    min="0"
                    name="deliveryInside"
                    value={settings.deliveryInside}
                    onChange={handleChange}
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className={labelClass}>
                    Delivery Charge Outside District (৳)
                  </label>
                  <input
                    type="number"
                    min="0"
                    name="deliveryOutside"
                    value={settings.deliveryOutside}
                    onChange={handleChange}
                    className={inputClass}
                  />
                </div>
              </div>
            </section>

            {/* Social Media */}
            <section className="rounded-xl border border-gray-800 bg-[#151515] p-6">
              <h2 className="mb-6 text-xl font-bold text-[#d4af37]">
                Social Media Links
              </h2>

              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label className={labelClass}>Facebook Page URL</label>
                  <input
                    type="url"
                    name="facebook"
                    value={settings.facebook}
                    onChange={handleChange}
                    placeholder="https://facebook.com/yourpage"
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className={labelClass}>Instagram URL</label>
                  <input
                    type="url"
                    name="instagram"
                    value={settings.instagram}
                    onChange={handleChange}
                    placeholder="https://instagram.com/yourpage"
                    className={inputClass}
                  />
                </div>
              </div>
            </section>

            {/* Announcement */}
            <section className="rounded-xl border border-gray-800 bg-[#151515] p-6">
              <h2 className="mb-6 text-xl font-bold text-[#d4af37]">
                Website Announcement
              </h2>

              <label className={labelClass}>Announcement Message</label>

              <textarea
                name="announcement"
                value={settings.announcement}
                onChange={handleChange}
                rows="3"
                className={inputClass}
                placeholder="Write a message for your customers..."
              />
            </section>

            {/* Save Button */}
            <div className="flex flex-wrap items-center gap-4">
              <button
                type="submit"
                className="rounded-lg bg-[#d4af37] px-8 py-3 font-bold text-black transition hover:bg-white"
              >
                Save Settings
              </button>

              {saved && (
                <p className="text-sm text-green-400">
                  Settings saved in this demo session!
                </p>
              )}
            </div>

          </form>

          <p className="mt-6 text-xs text-gray-500">
            Demo mode: Settings are stored temporarily in the page state.
            They will reset after refreshing. Firebase integration is required
            for permanent storage.
          </p>

        </main>
      </div>
    </div>
  );
}

export default Settings;
