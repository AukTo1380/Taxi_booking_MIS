import React from "react";
import { FaTshirt, FaUsers, FaSyncAlt } from "react-icons/fa";
import { PiChartLineUp } from "react-icons/pi";
import { GiGolfFlag } from "react-icons/gi";
import { SlDirections } from "react-icons/sl";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

// Components
import OrderStatusChart from "./OrderStatusChart";
import TopSaleProducts from "./TopSaleProducts";
import {
  fetchProductSalesSummary,
  fetchRecentOrders,
  fetchProduct,
} from "../../services/api";

// THE FIX: The component now accepts `setActiveComponent` as a prop from its parent
const Dashboard = ({ setActiveComponent }) => {
  const queryClient = useQueryClient();

  // Data fetching for dashboard cards (no changes to this section)
  const {
    data: salesSummary = [],
    isLoading: summaryLoading,
    isError: summaryError,
  } = useQuery({
    queryKey: ["productSalesSummary"],
    queryFn: fetchProductSalesSummary,
    staleTime: 5 * 60 * 1000,
  });

  // Data fetching for total product count (no changes to this section)
  const {
    data: productsData,
    isLoading: productsLoading,
    isError: productsError,
  } = useQuery({
    queryKey: ["productsCount"],
    queryFn: () => fetchProduct({ page_size: 1 }),
  });

  // Data fetching for the recent orders table (no changes to this section)
  const {
    data: recentOrders = [],
    isLoading: ordersLoading,
    isError: ordersError,
  } = useQuery({
    queryKey: ["recentOrders"],
    queryFn: fetchRecentOrders,
  });

  // Derived state for overall loading and error status (no changes to this section)
  const isLoading = summaryLoading || productsLoading;
  const hasError = summaryError || productsError || ordersError;

  // Calculate stats for display cards (no changes to this section)
  const stats = {
    sales: salesSummary.reduce(
      (sum, item) => sum + (item?.total_sales || 0),
      0
    ),
    orders: salesSummary.reduce(
      (sum, item) => sum + (item?.total_orders || 0),
      0
    ),
    products: productsData?.count || 0,
    customers: salesSummary.reduce(
      (sum, item) => sum + (item?.total_customers || 0),
      0
    ),
    returns: salesSummary.reduce(
      (sum, item) => sum + (item?.total_returns || 0),
      0
    ),
  };

  // Function to manually refresh all dashboard data (no changes to this section)
  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ["productSalesSummary"] });
    queryClient.invalidateQueries({ queryKey: ["productsCount"] });
    queryClient.invalidateQueries({ queryKey: ["recentOrders"] });
  };

  // Error handling JSX (no changes to this section)
  if (hasError) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md text-center max-w-md">
          <h2 className="text-xl font-bold text-red-600 mb-4">
            Dashboard Error
          </h2>
          <p className="mb-4">
            We couldn't load the dashboard data. Please try again.
          </p>
          <button
            onClick={handleRefresh}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6  min-h-screen">
      {/* Header (no changes to this section) */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Dashboard Overview</h1>
        <button
          onClick={handleRefresh}
          className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg shadow hover:bg-gray-100 transition-colors"
          disabled={isLoading}
        >
          <FaSyncAlt className={`${isLoading ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      {/* Stats Cards Grid (no changes to this section) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-6">
        <StatCard
          icon={<PiChartLineUp className="text-green-600 text-2xl" />}
          title="Sales"
          value={`$${stats.sales.toLocaleString()}`}
          loading={isLoading}
          bgColor="bg-green-100"
        />
        <StatCard
          icon={<GiGolfFlag className="text-blue-600 text-2xl" />}
          title="Orders"
          value={stats.orders.toLocaleString()}
          loading={isLoading}
          bgColor="bg-blue-100"
        />
        <StatCard
          icon={<FaTshirt className="text-indigo-600 text-2xl" />}
          title="Products"
          value={stats.products.toLocaleString()}
          loading={isLoading}
          bgColor="bg-indigo-100"
        />
        <StatCard
          icon={<FaUsers className="text-orange-600 text-2xl" />}
          title="Customers"
          value={stats.customers.toLocaleString()}
          loading={isLoading}
          bgColor="bg-orange-100"
        />
        <StatCard
          icon={<SlDirections className="text-rose-600 text-2xl" />}
          title="Returns"
          value={stats.returns.toLocaleString()}
          loading={isLoading}
          bgColor="bg-rose-100"
        />
      </div>

      {/* Charts Section (no changes to this section) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <OrderStatusChart isLoading={isLoading} />
        <TopSaleProducts isLoading={isLoading} />
      </div>

      {/* Recent Orders Table */}
      {/* THE FIX: Pass the setActiveComponent prop down to the table component */}
      <RecentOrdersTable
        orders={recentOrders}
        loading={ordersLoading}
        setActiveComponent={setActiveComponent}
      />
    </div>
  );
};

// --- Sub-components for the Dashboard ---

const StatCard = ({ icon, title, value, loading, bgColor }) => (
  <div className="bg-white p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow flex items-center gap-4">
    <div className={`p-3 ${bgColor} rounded-md`}>{icon}</div>
    <div>
      <p className="text-sm text-gray-500 font-medium">{title}</p>
      {loading ? (
        <Skeleton width={60} height={24} />
      ) : (
        <h2 className="text-xl font-bold">{value}</h2>
      )}
    </div>
  </div>
);

// THE FIX: The table component now accepts and uses the setActiveComponent prop
const RecentOrdersTable = ({ orders, loading, setActiveComponent }) => (
  <div className="bg-white p-5 rounded-lg shadow-md hover:shadow-lg transition-shadow overflow-x-auto">
    <div className="flex justify-between items-center mb-4">
      <h2 className="text-lg font-semibold text-gray-700">Recent Orders</h2>
      {/* THE FIX: This button now correctly navigates to the 'orders' component */}
      <button
        onClick={() => setActiveComponent("orders")}
        className="text-sm text-blue-600 hover:text-blue-800"
      >
        View All
      </button>
    </div>

    {loading ? (
      <Skeleton count={5} height={60} className="mb-2" />
    ) : (
      <div className="w-full overflow-x-auto">
        <table className="min-w-[900px] border w-full text-sm text-left text-gray-600">
          <thead className="bg-gray-100 text-xs text-gray-500 uppercase">
            <tr>
              <th className="p-3">Date</th>
              <th className="p-3">Customer</th>
              <th className="p-3">Product (First Item)</th>
              <th className="p-3">Status</th>
              <th className="p-3">Qty</th>
              <th className="p-3">Total</th>
              <th className="p-3">Shipping</th>
              <th className="p-3 text-center">Action</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              // THE FIX: Pass setActiveComponent down to each individual row
              <OrderRow
                key={order.id}
                order={order}
                setActiveComponent={setActiveComponent}
              />
            ))}
          </tbody>
        </table>
      </div>
    )}
  </div>
);

// THE FIX: The row component now accepts and uses the setActiveComponent prop
const OrderRow = ({ order, setActiveComponent }) => {
  const firstItem = order.orderitem?.[0];
  const product = firstItem?.product || {};

  const getStatusClass = (status) => {
    switch (status) {
      case "Fulfilled":
        return "bg-green-100 text-green-800";
      case "Pending":
        return "bg-yellow-100 text-yellow-800";
      case "Cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <tr className="border-b hover:bg-gray-50 transition duration-200 overflow-x-scroll">
      <td className="p-3 whitespace-nowrap">
        {new Date(order.date).toLocaleDateString()}
      </td>
      <td className="p-3 font-medium text-gray-700">
        {order.full_name || "N/A"}
      </td>
      <td className="p-3 flex items-center gap-3">
        <img
          src={product.image_url || "https://placehold.co/100x100"}
          alt={product.product_name || "Product"}
          className="w-12 h-12 object-cover rounded-md"
        />
        <div>
          <span className="font-medium">{product.product_name || "N/A"}</span>
          {order.orderitem?.length > 1 && (
            <p className="text-xs text-gray-500">
              + {order.orderitem.length - 1} more
            </p>
          )}
        </div>
      </td>
      <td className="p-3">
        <span
          className={`px-2 py-1 text-xs rounded-full font-medium ${getStatusClass(
            order.order_status
          )}`}
        >
          {order.order_status}
        </span>
      </td>
      <td className="p-3">{firstItem?.qty || "N/A"}</td>
      <td className="p-3 font-semibold">
        ${(parseFloat(order.total) || 0.0).toFixed(2)}
      </td>
      <td className="p-3">${(order.shippingCost || 0.0).toFixed(2)}</td>
      <td className="p-3 text-center">
        {/* THE FIX: This button now correctly navigates to the 'orders' component */}
        <button
          onClick={() => setActiveComponent("orders")}
          className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-xs transition-colors"
        >
          View
        </button>
      </td>
    </tr>
  );
};

export default Dashboard;
