
import { useState } from "react";
import { Link } from "react-router-dom";

const initialCustomers = [
  {
    id: 1,
    name: "Rahim Ahmed",
    phone: "01712345678",
    email: "rahim@example.com",
    address: "Gopalganj Sadar, Gopalganj",
    totalOrders: 2,
    totalSpent: 25200,
    joined: "2026-10-20",
  },
  {
    id: 2,
    name: "Karim Hasan",
    phone: "01812345678",
    email: "karim@example.com",
    address: "Dhaka, Bangladesh",
    totalOrders: 3,
    totalSpent: 29700,
    joined: "2026-10-22",
  },
  {
    id: 3,
    name: "Sakib Islam",
    phone: "01912345678",
    email: "sakib@example.com",
    address: "Tungipara, Gopalganj",
    totalOrders: 1,
    totalSpent: 15100,
    joined: "2026-10-25",
  },
  {
    id: 4,
    name: "Nusrat Jahan",
    phone: "01612345678",
    email: "nusrat@example.com",
    address: "Faridpur, Bangladesh",
    totalOrders: 4,
    totalSpent: 42000,
    joined: "2026-10-27",
  },
];

function Customers() {
  const [customers] = useState(initialCustomers);
  const [search, setSearch] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  const filteredCustomers = customers.filter((customer) =>
    `${customer.name} ${customer.phone} ${customer.email}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  const totalOrders = customers.reduce(
    (sum, customer) => sum + customer.totalOrders,
    0
  );

  const totalSpent = customers.reduce(
    (sum, customer) => sum + customer.totalSpent,
    0
  );

  const averageSpent =
    customers.length > 0 ? totalSpent / customers.length : 0;

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
              className="block rounded-lg bg-[#d4af37] px-4 py-3 font-semibold text-black"
            >
              Customers
            </Link>

            <Link
              to="/admin/settings"
              className="block rounded-lg px-4 py-3 text-gray-400 hover:bg-[#222] hover:text-white"
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
              <h1 className="text-3xl font-bold">
                Customer Management
              </h1>

              <p className="mt-2 text-sm text-gray-400">
                View and manage your TimeLux customers.
              </p>
            </div>

            <Link
              to="/admin"
              className="text-sm text-[#d4af37] hover:text-white"
            >
              ← Back to Dashboard
            </Link>
          </div>

          {/* Statistics */}
          <div className="mb-8 grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">

            <div className="rounded-xl border border-gray-800 bg-[#151515] p-5">
              <p className="text-sm text-gray-400">
                Total Customers
              </p>

              <h2 className="mt-2 text-3xl font-bold text-[#d4af37]">
                {customers.length}
              </h2>
            </div>

            <div className="rounded-xl border border-gray-800 bg-[#151515] p-5">
              <p className="text-sm text-gray-400">
                Total Orders
              </p>

              <h2 className="mt-2 text-3xl font-bold">
                {totalOrders}
              </h2>
            </div>

            <div className="rounded-xl border border-gray-800 bg-[#151515] p-5">
              <p className="text-sm text-gray-400">
                Total Customer Spending
              </p>

              <h2 className="mt-2 text-3xl font-bold text-green-400">
                ৳{totalSpent.toLocaleString("en-BD")}
              </h2>
            </div>

          </div>

          {/* Average Spending */}
          <div className="mb-8 rounded-xl border border-gray-800 bg-[#151515] p-5">
            <p className="text-sm text-gray-400">
              Average Spending Per Customer
            </p>

            <h2 className="mt-2 text-2xl font-bold text-[#d4af37]">
              ৳{Math.round(averageSpent).toLocaleString("en-BD")}
            </h2>
          </div>

          {/* Search */}
          <div className="mb-6">
            <input
              type="text"
              placeholder="Search by name, phone or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-lg border border-gray-700 bg-[#151515] px-4 py-3 outline-none focus:border-[#d4af37]"
            />
          </div>

          {/* Customer Table */}
          <div className="overflow-x-auto rounded-xl border border-gray-800 bg-[#151515]">
            <table className="w-full min-w-[900px] text-left">

              <thead className="border-b border-gray-800 bg-[#202020]">
                <tr className="text-sm text-gray-400">
                  <th className="p-5">Customer</th>
                  <th className="p-5">Phone</th>
                  <th className="p-5">Total Orders</th>
                  <th className="p-5">Total Spent</th>
                  <th className="p-5">Joined Date</th>
                  <th className="p-5">Action</th>
                </tr>
              </thead>

              <tbody>
                {filteredCustomers.map((customer) => (
                  <tr
                    key={customer.id}
                    className="border-b border-gray-800 text-sm last:border-0"
                  >
                    <td className="p-5">
                      <p className="font-semibold">
                        {customer.name}
                      </p>

                      <p className="mt-1 text-xs text-gray-500">
                        {customer.email}
                      </p>
                    </td>

                    <td className="p-5 text-gray-300">
                      {customer.phone}
                    </td>

                    <td className="p-5">
                      {customer.totalOrders}
                    </td>

                    <td className="p-5 font-semibold text-[#d4af37]">
                      ৳{customer.totalSpent.toLocaleString("en-BD")}
                    </td>

                    <td className="p-5 text-gray-400">
                      {customer.joined}
                    </td>

                    <td className="p-5">
                      <button
                        onClick={() => setSelectedCustomer(customer)}
                        className="font-semibold text-[#d4af37] hover:text-white"
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                ))}

                {filteredCustomers.length === 0 && (
                  <tr>
                    <td
                      colSpan="6"
                      className="p-8 text-center text-gray-500"
                    >
                      No customers found.
                    </td>
                  </tr>
                )}
              </tbody>

            </table>
          </div>

          {/* Customer Details Modal */}
          {selectedCustomer && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">

              <div className="w-full max-w-lg rounded-xl border border-gray-700 bg-[#151515] p-6">

                <div className="mb-6 flex items-center justify-between">
                  <h2 className="text-xl font-bold text-[#d4af37]">
                    Customer Details
                  </h2>

                  <button
                    onClick={() => setSelectedCustomer(null)}
                    className="text-2xl text-gray-400 hover:text-white"
                  >
                    ×
                  </button>
                </div>

                <div className="space-y-4 text-sm">

                  <div>
                    <p className="text-gray-500">Full Name</p>
                    <p className="font-semibold">
                      {selectedCustomer.name}
                    </p>
                  </div>

                  <div>
                    <p className="text-gray-500">Mobile Number</p>
                    <p>{selectedCustomer.phone}</p>
                  </div>

                  <div>
                    <p className="text-gray-500">Email Address</p>
                    <p>{selectedCustomer.email}</p>
                  </div>

                  <div>
                    <p className="text-gray-500">Delivery Address</p>
                    <p>{selectedCustomer.address}</p>
                  </div>

                  <div>
                    <p className="text-gray-500">Total Orders</p>
                    <p>{selectedCustomer.totalOrders}</p>
                  </div>

                  <div>
                    <p className="text-gray-500">Total Spending</p>
                    <p className="text-xl font-bold text-[#d4af37]">
                      ৳{selectedCustomer.totalSpent.toLocaleString("en-BD")}
                    </p>
                  </div>

                  <div>
                    <p className="text-gray-500">Customer Since</p>
                    <p>{selectedCustomer.joined}</p>
                  </div>

                </div>

                <button
                  onClick={() => setSelectedCustomer(null)}
                  className="mt-6 w-full rounded-lg bg-[#d4af37] py-3 font-bold text-black hover:bg-white"
                >
                  Close
                </button>

              </div>
            </div>
          )}

          <p className="mt-4 text-xs text-gray-500">
            Demo mode: These are sample customer records.
            Real customer information will appear after Firebase integration.
          </p>

        </main>
      </div>
    </div>
  );
}

export default Customers;
