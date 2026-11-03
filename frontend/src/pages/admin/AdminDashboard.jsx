
import { Link, useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from "../../firebase";

const stats = [
  {
    title: "Total Products",
    value: "03",
    icon: "⌚",
    change: "Demo Data",
  },
  {
    title: "Total Orders",
    value: "00",
    icon: "📦",
    change: "No orders yet",
  },
  {
    title: "Total Customers",
    value: "00",
    icon: "👥",
    change: "No customers yet",
  },
  {
    title: "Total Sales",
    value: "৳0",
    icon: "৳",
    change: "Demo Data",
  },
];

const menuItems = [
  { name: "Dashboard", icon: "▦", path: "/admin" },
  { name: "Products", icon: "⌚", path: "/admin/products" },
  { name: "Orders", icon: "📦", path: "/admin/orders" },
  { name: "Customers", icon: "👥", path: "/admin/customers" },
  { name: "Settings", icon: "⚙", path: "/admin/settings" },
];

function AdminDashboard() {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/login", { replace: true });
    } catch (error) {
      console.error("Logout error:", error);
      alert("Logout করা যায়নি। আবার চেষ্টা করো।");
    }
  };

  return (
    <div className="min-h-screen bg-[#080808] text-white md:flex">

      {/* Sidebar */}
      <aside className="w-full border-r border-[#d4af37]/20 bg-[#111] md:min-h-screen md:w-64">

        <div className="border-b border-white/10 px-6 py-7">
          <Link
            to="/"
            className="text-2xl font-bold tracking-[4px] text-[#d4af37]"
          >
            TIMELUX
          </Link>

          <p className="mt-2 text-xs tracking-[3px] text-gray-500">
            ADMIN PANEL
          </p>
        </div>

        <nav className="flex gap-2 overflow-x-auto p-4 md:block md:space-y-2">
          {menuItems.map((item, index) => (
            <Link
              key={item.name}
              to={item.path}
              className={`flex shrink-0 items-center gap-3 px-4 py-3 text-sm transition hover:bg-[#d4af37]/10 hover:text-[#d4af37] ${
                index === 0
                  ? "border border-[#d4af37]/30 bg-[#d4af37]/10 text-[#d4af37]"
                  : "text-gray-400"
              }`}
            >
              <span className="text-lg">{item.icon}</span>
              {item.name}
            </Link>
          ))}
        </nav>

        <div className="hidden px-6 py-8 md:block">
          <Link
            to="/"
            className="text-sm text-gray-500 transition hover:text-[#d4af37]"
          >
            ← Back to Website
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="min-w-0 flex-1 px-5 py-8 md:px-10">

        {/* Top Header */}
        <header className="mb-10 flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-6">
          <div>
            <p className="text-xs tracking-[3px] text-[#d4af37]">
              OVERVIEW
            </p>

            <h1 className="mt-2 text-3xl font-bold">
              Admin Dashboard
            </h1>

            <p className="mt-2 text-sm text-gray-500">
              Welcome to your TimeLux control panel.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              to="/"
              className="border border-[#d4af37] px-5 py-3 text-sm text-[#d4af37] transition hover:bg-[#d4af37] hover:text-black"
            >
              VIEW WEBSITE ↗
            </Link>

            <button
              onClick={handleLogout}
              className="border border-red-500 px-5 py-3 text-sm text-red-500 transition hover:bg-red-500 hover:text-white"
            >
              LOGOUT ↗
            </button>
          </div>
        </header>

        {/* Statistics */}
        <section>
          <h2 className="mb-5 text-xl font-semibold">
            Store Overview
          </h2>

          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
            {stats.map((stat) => (
              <div
                key={stat.title}
                className="border border-white/10 bg-[#111] p-6 transition hover:border-[#d4af37]/50"
              >
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-400">
                    {stat.title}
                  </p>

                  <span className="text-2xl text-[#d4af37]">
                    {stat.icon}
                  </span>
                </div>

                <h3 className="mt-5 text-3xl font-bold">
                  {stat.value}
                </h3>

                <p className="mt-3 text-xs text-gray-500">
                  {stat.change}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Quick Actions */}
        <section className="mt-12">
          <h2 className="mb-5 text-xl font-semibold">
            Quick Actions
          </h2>

          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">

            <Link
              to="/admin/products"
              className="border border-white/10 bg-[#111] p-6 transition hover:border-[#d4af37]"
            >
              <span className="text-3xl text-[#d4af37]">＋</span>
              <h3 className="mt-4 font-semibold">Add New Product</h3>
              <p className="mt-2 text-sm text-gray-500">
                Add a new watch to your store.
              </p>
            </Link>

            <Link
              to="/admin/orders"
              className="border border-white/10 bg-[#111] p-6 transition hover:border-[#d4af37]"
            >
              <span className="text-3xl">📦</span>
              <h3 className="mt-4 font-semibold">Manage Orders</h3>
              <p className="mt-2 text-sm text-gray-500">
                View and update customer orders.
              </p>
            </Link>

            <Link
              to="/admin/customers"
              className="border border-white/10 bg-[#111] p-6 transition hover:border-[#d4af37]"
            >
              <span className="text-3xl">👥</span>
              <h3 className="mt-4 font-semibold">View Customers</h3>
              <p className="mt-2 text-sm text-gray-500">
                View your customer information.
              </p>
            </Link>

            <Link
              to="/admin/settings"
              className="border border-white/10 bg-[#111] p-6 transition hover:border-[#d4af37]"
            >
              <span className="text-3xl">⚙</span>
              <h3 className="mt-4 font-semibold">Store Settings</h3>
              <p className="mt-2 text-sm text-gray-500">
                Manage your store settings.
              </p>
            </Link>

          </div>
        </section>

        {/* Recent Orders */}
        <section className="mt-12 border border-white/10 bg-[#111] p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-xl font-semibold">
              Recent Orders
            </h2>

            <Link
              to="/admin/orders"
              className="text-sm text-[#d4af37] hover:text-white"
            >
              View All →
            </Link>
          </div>

          <div className="mt-8 overflow-x-auto">
            <table className="w-full min-w-[500px] text-left text-sm">
              <thead>
                <tr className="border-b border-white/10 text-gray-400">
                  <th className="pb-4">Order ID</th>
                  <th className="pb-4">Customer</th>
                  <th className="pb-4">Amount</th>
                  <th className="pb-4">Status</th>
                </tr>
              </thead>

              <tbody>
                <tr>
                  <td colSpan="4" className="py-10 text-center text-gray-500">
                    No orders available yet.
                    <p className="mt-2 text-xs">
                      Customer orders will appear here after Firebase integration.
                    </p>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* Footer */}
        <footer className="mt-12 border-t border-white/10 py-6 text-center">
          <p className="text-xs tracking-[3px] text-[#d4af37]">
            TIMELUX ADMIN
          </p>

          <p className="mt-2 text-xs text-gray-600">
            Luxury in Every Second. © 2026 TimeLux.
          </p>
        </footer>

      </main>
    </div>
  );
}

export default AdminDashboard;
