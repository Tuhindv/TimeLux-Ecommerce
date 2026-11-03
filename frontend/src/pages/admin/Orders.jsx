
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  collection,
  onSnapshot,
  doc,
  updateDoc,
  query,
  orderBy,
} from "firebase/firestore";
import { db } from "../../firebase";

const statuses = [
  "Pending",
  "Confirmed",
  "Processing",
  "Shipped",
  "Out for Delivery",
  "Delivered",
  "Cancelled",
  "Returned",
];

function Orders() {
  const [orders, setOrders] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const [error, setError] = useState("");

  // Load orders from Firestore in real time
  useEffect(() => {
    const ordersQuery = query(
      collection(db, "orders"),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(
      ordersQuery,
      (snapshot) => {
        const firestoreOrders = snapshot.docs.map((item) => {
          const data = item.data();
          const customer = data.customer || {};
          const products = Array.isArray(data.products)
            ? data.products
            : [];

          const orderDate = data.createdAt?.toDate
            ? data.createdAt.toDate()
            : data.createdAt
              ? new Date(data.createdAt)
              : null;

          return {
            id: item.id,
            customer: customer.fullName || "Unknown Customer",
            phone: customer.phone || "N/A",
            email: customer.email || "N/A",
            product: products
              .map((product) => product.name || product.title || "Watch")
              .join(", "),
            quantity: products.reduce(
              (sum, product) =>
                sum + Number(product.quantity || 1),
              0
            ),
            products,
            subtotal: Number(data.subtotal || 0),
            deliveryCharge: Number(data.deliveryCharge || 0),
            total: Number(data.total || 0),
            fullAddress: customer.address || "N/A",
upazila: customer.area || "N/A",
district: customer.district || "N/A",
            instructions: customer.instructions || "",
            date: orderDate
              ? orderDate.toLocaleString("en-BD")
              : "Date unavailable",
            status: data.status || "Pending",
            paymentMethod: data.paymentMethod || "N/A",
            orderType: data.orderType || "N/A",
          };
        });

        setOrders(firestoreOrders);
        setLoading(false);
        setError("");
      },
      (err) => {
        console.error("Orders loading error:", err);
        setError("Orders could not be loaded. Please check Firebase Rules.");
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  // Search orders
  const filteredOrders = orders.filter(
    (order) =>
      order.id.toLowerCase().includes(search.toLowerCase()) ||
      order.customer.toLowerCase().includes(search.toLowerCase()) ||
      order.phone.includes(search)
  );

  // Update order status in Firestore
  const updateStatus = async (id, newStatus) => {
    try {
      setUpdatingId(id);
      setError("");

      await updateDoc(doc(db, "orders", id), {
        status: newStatus,
      });
    } catch (err) {
      console.error("Order status update error:", err);
      setError("Order status could not be updated.");
    } finally {
      setUpdatingId(null);
    }
  };

  const getStatusStyle = (status) => {
    const styles = {
      Pending: "bg-yellow-900/40 text-yellow-400",
      Confirmed: "bg-blue-900/40 text-blue-400",
      Processing: "bg-purple-900/40 text-purple-400",
      Shipped: "bg-indigo-900/40 text-indigo-400",
      "Out for Delivery": "bg-orange-900/40 text-orange-400",
      Delivered: "bg-green-900/40 text-green-400",
      Cancelled: "bg-red-900/40 text-red-400",
      Returned: "bg-gray-700 text-gray-300",
    };

    return styles[status] || "bg-gray-700 text-white";
  };

  const pendingCount = orders.filter(
    (order) => order.status === "Pending"
  ).length;

  const deliveredCount = orders.filter(
    (order) => order.status === "Delivered"
  ).length;

  const totalRevenue = orders
    .filter((order) => order.status === "Delivered")
    .reduce((sum, order) => sum + order.total, 0);

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
              className="block rounded-lg bg-[#d4af37] px-4 py-3 font-semibold text-black"
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
              className="block rounded-lg px-4 py-3 text-gray-400 hover:bg-[#222] hover:text-white"
            >
              Settings
            </Link>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="min-w-0 flex-1 p-5 md:p-10">
          <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold">Orders Management</h1>
              <p className="mt-2 text-sm text-gray-400">
                Manage and track customer orders.
              </p>
            </div>

            <Link
              to="/admin"
              className="text-sm text-[#d4af37] hover:text-white"
            >
              ← Back to Dashboard
            </Link>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-5 rounded-lg border border-red-800 bg-red-900/20 p-4 text-sm text-red-400">
              {error}
            </div>
          )}

          {/* Statistics */}
          <div className="mb-8 grid grid-cols-1 gap-5 sm:grid-cols-3">
            <div className="rounded-xl border border-gray-800 bg-[#151515] p-5">
              <p className="text-sm text-gray-400">Total Orders</p>
              <h2 className="mt-2 text-3xl font-bold text-[#d4af37]">
                {orders.length}
              </h2>
            </div>

            <div className="rounded-xl border border-gray-800 bg-[#151515] p-5">
              <p className="text-sm text-gray-400">Pending Orders</p>
              <h2 className="mt-2 text-3xl font-bold text-yellow-400">
                {pendingCount}
              </h2>
            </div>

            <div className="rounded-xl border border-gray-800 bg-[#151515] p-5">
              <p className="text-sm text-gray-400">Delivered Revenue</p>
              <h2 className="mt-2 text-3xl font-bold text-green-400">
                ৳{totalRevenue.toLocaleString("en-BD")}
              </h2>
              <p className="mt-1 text-xs text-gray-500">
                {deliveredCount} delivered orders
              </p>
            </div>
          </div>

          {/* Search */}
          <div className="mb-6">
            <input
              type="text"
              placeholder="Search by Order ID, Customer or Phone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-lg border border-gray-700 bg-[#151515] px-4 py-3 outline-none focus:border-[#d4af37]"
            />
          </div>

          {/* Orders Table */}
          <div className="overflow-x-auto rounded-xl border border-gray-800 bg-[#151515]">
            <table className="w-full min-w-[950px] text-left">
              <thead className="border-b border-gray-800 bg-[#202020]">
                <tr className="text-sm text-gray-400">
                  <th className="p-5">Order ID</th>
                  <th className="p-5">Customer</th>
                  <th className="p-5">Product</th>
                  <th className="p-5">Total</th>
                  <th className="p-5">Date</th>
                  <th className="p-5">Status</th>
                  <th className="p-5">Action</th>
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="7" className="p-8 text-center text-gray-400">
                      Loading orders...
                    </td>
                  </tr>
                ) : filteredOrders.map((order) => (
                  <tr
                    key={order.id}
                    className="border-b border-gray-800 text-sm last:border-0"
                  >
                    <td className="p-5 font-semibold text-[#d4af37]">
                      {order.id}
                    </td>

                    <td className="p-5">
                      <p className="font-semibold">{order.customer}</p>
                      <p className="mt-1 text-xs text-gray-500">
                        {order.phone}
                      </p>
                    </td>

                    <td className="p-5">
                      <p>{order.product}</p>
                      <p className="mt-1 text-xs text-gray-500">
                        Quantity: {order.quantity}
                      </p>
                    </td>

                    <td className="p-5 font-semibold">
                      ৳{order.total.toLocaleString("en-BD")}
                    </td>

                    <td className="p-5 text-gray-400">{order.date}</td>

                    <td className="p-5">
                      <select
                        value={order.status}
                        disabled={updatingId === order.id}
                        onChange={(e) =>
                          updateStatus(order.id, e.target.value)
                        }
                        className={`rounded-lg border border-gray-700 bg-[#202020] px-3 py-2 text-xs outline-none disabled:opacity-50 ${getStatusStyle(order.status)}`}
                      >
                        {statuses.map((status) => (
                          <option
                            key={status}
                            value={status}
                            className="bg-[#151515] text-white"
                          >
                            {status}
                          </option>
                        ))}
                      </select>
                    </td>

                    <td className="p-5">
                      <button
                        onClick={() => setSelectedOrder(order)}
                        className="font-semibold text-[#d4af37] hover:text-white"
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                ))}

                {!loading && filteredOrders.length === 0 && (
                  <tr>
                    <td colSpan="7" className="p-8 text-center text-gray-500">
                      No orders found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Order Details Modal */}
          {selectedOrder && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
              <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-xl border border-gray-700 bg-[#151515] p-6">

                <div className="mb-6 flex items-center justify-between">
                  <h2 className="text-xl font-bold text-[#d4af37]">
                    Order Details
                  </h2>

                  <button
                    onClick={() => setSelectedOrder(null)}
                    className="text-2xl text-gray-400 hover:text-white"
                  >
                    ×
                  </button>
                </div>

                <div className="space-y-4 text-sm">
                  <div>
                    <p className="text-gray-500">Order ID</p>
                    <p className="font-semibold">{selectedOrder.id}</p>
                  </div>

                  <div>
                    <p className="text-gray-500">Customer Name</p>
                    <p>{selectedOrder.customer}</p>
                  </div>

                  <div>
                    <p className="text-gray-500">Mobile Number</p>
                    <p>{selectedOrder.phone}</p>
                  </div>

                  <div>
                    <p className="text-gray-500">Email</p>
                    <p>{selectedOrder.email}</p>
                  </div>

                  <div>
                    <p className="text-gray-500">Products</p>
                    {selectedOrder.products.map((product, index) => (
                      <div key={index} className="mt-2 border-b border-gray-800 pb-2">
                        <p>{product.name || product.title || "Watch"}</p>
                        <p className="text-gray-500">
                          Quantity: {product.quantity || 1}
                        </p>
                        <p className="text-gray-500">
                          Price: ৳{Number(product.price || 0).toLocaleString("en-BD")}
                        </p>
                      </div>
                    ))}
                  </div>

                  <div className="rounded-lg border border-gray-800 bg-[#202020] p-4">
  <p className="mb-3 font-semibold text-[#d4af37]">
    Delivery Address
  </p>

  <div className="space-y-3 text-sm">
    <div>
      <p className="text-gray-500">Full Address</p>
      <p>{selectedOrder.fullAddress}</p>
    </div>

    <div>
      <p className="text-gray-500">Upazila</p>
      <p>{selectedOrder.upazila}</p>
    </div>

    <div>
      <p className="text-gray-500">District</p>
      <p>{selectedOrder.district}</p>
    </div>
  </div>
</div>

                  {selectedOrder.instructions && (
                    <div>
                      <p className="text-gray-500">Special Instructions</p>
                      <p>{selectedOrder.instructions}</p>
                    </div>
                  )}

                  <div>
                    <p className="text-gray-500">Order Date</p>
                    <p>{selectedOrder.date}</p>
                  </div>

                  <div>
                    <p className="text-gray-500">Payment Method</p>
                    <p>{selectedOrder.paymentMethod}</p>
                  </div>

                  <div>
                    <p className="text-gray-500">Order Type</p>
                    <p>{selectedOrder.orderType}</p>
                  </div>

                  <div>
                    <p className="text-gray-500">Order Status</p>
                    <p className="text-[#d4af37]">{selectedOrder.status}</p>
                  </div>

                  <div className="border-t border-gray-700 pt-4">
                    <p className="text-gray-500">Subtotal</p>
                    <p>৳{selectedOrder.subtotal.toLocaleString("en-BD")}</p>

                    <p className="mt-2 text-gray-500">Delivery Charge</p>
                    <p>৳{selectedOrder.deliveryCharge.toLocaleString("en-BD")}</p>

                    <p className="mt-3 text-gray-500">Total Amount</p>
                    <p className="text-2xl font-bold text-[#d4af37]">
                      ৳{selectedOrder.total.toLocaleString("en-BD")}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setSelectedOrder(null)}
                  className="mt-6 w-full rounded-lg bg-[#d4af37] py-3 font-bold text-black hover:bg-white"
                >
                  Close
                </button>
              </div>
            </div>
          )}

        </main>
      </div>
    </div>
  );
}

export default Orders;
