import React, { useState, useEffect, useCallback } from "react"; // <-- THIS LINE IS NOW FIXED
import Swal from "sweetalert2";
import { FaUsers, FaCar, FaTaxi, FaUserCheck, FaListAlt } from "react-icons/fa";
import { Loader2 } from "lucide-react";
import { store } from "../../../state/store";
import axios from "axios";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const BASE_URL = import.meta.env.VITE_BASE_URL || "http://127.0.0.1:8000";
// Standard API client for making authenticated requests
const createApiClient = () => {
  const api = axios.create({ baseURL: BASE_URL });
  api.interceptors.request.use((config) => {
    const token = store.getState().user.accessToken;
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  });
  return api;
};

// Reusable component for the KPI cards at the top of the dashboard
const StatCard = ({ icon, title, value, color }) => (
  <div className="bg-white p-6 rounded-lg shadow-md flex items-center gap-6 transition-transform hover:scale-105">
    <div className={`text-3xl p-4 rounded-full ${color}`}>{icon}</div>
    <div>
      <p className="text-gray-500 font-semibold">{title}</p>
      <p className="text-3xl font-bold text-gray-800">{value}</p>
    </div>
  </div>
);

// Reusable component for displaying trip status
const StatusBadge = ({ status }) => {
  const statusStyles = {
    requested: "bg-blue-100 text-blue-800",
    in_progress: "bg-yellow-100 text-yellow-800",
    completed: "bg-green-100 text-green-800",
    cancelled: "bg-red-100 text-red-800",
  };
  const style =
    statusStyles[status?.toLowerCase()] || "bg-gray-100 text-gray-700";
  const statusText = status
    ? status.charAt(0).toUpperCase() + status.slice(1).replace("_", " ")
    : "Unknown";
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${style}`}
    >
      {statusText}
    </span>
  );
};

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetches all dashboard data from the single, efficient backend endpoint
  const fetchData = useCallback(async () => {
    setLoading(true);
    const api = createApiClient();
    try {
      const response = await api.get("/api/v1/vehicle/admin/dashboard-stats/");
      setStats(response.data);
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      Swal.fire(
        "Error",
        "Could not load dashboard data. Please try refreshing the page.",
        "error"
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Render a loading spinner while data is being fetched
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-100">
        <Loader2 className="h-16 w-16 animate-spin text-blue-600" />
      </div>
    );
  }

  // Render an error message if fetching failed
  if (!stats) {
    return (
      <div className="p-8 text-center text-red-500 font-semibold">
        Failed to load dashboard data.
      </div>
    );
  }

  // Render the full dashboard once data is available
  return (
    <div className="p-4 md:p-6 bg-gray-100">
      {/* KPI Stat Cards Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 mb-8">
        <StatCard
          icon={<FaUsers />}
          title="کاربران مجموعی"
          value={stats.kpi.total_users}
          color="bg-blue-100 text-blue-600"
        />
        <StatCard
          icon={<FaCar />}
          title="رانندگان مجموعی"
          value={stats.kpi.total_drivers}
          color="bg-yellow-100 text-yellow-600"
        />
        <StatCard
          icon={<FaUsers />}
          title="مسافران"
          value={stats.kpi.total_passengers}
          color="bg-green-100 text-green-600"
        />
        <StatCard
          icon={<FaTaxi />}
          title="سفرهای مجموعی"
          value={stats.kpi.total_trips}
          color="bg-indigo-100 text-indigo-600"
        />
        <StatCard
          icon={<FaUserCheck />}
          title="درخواست‌های در انتظار"
          value={stats.kpi.pending_applications}
          color="bg-red-100 text-red-600"
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Chart Section */}
        <div className="xl:col-span-2 bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-bold text-gray-700 mb-4">
            سفرها در ۷ روز گذشته
          </h2>
          <ResponsiveContainer width="100%" height={350}>
            <BarChart
              data={stats.chart_data}
              margin={{ top: 5, right: 20, left: -10, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="date" />
              <YAxis allowDecimals={false} />
              <Tooltip
                contentStyle={{
                  background: "white",
                  border: "1px solid #ccc",
                  borderRadius: "0.5rem",
                }}
              />
              <Legend />
              <Bar
                dataKey="trips"
                fill="#3b82f6"
                name="Total Trips"
                barSize={30}
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Recent Trips Section */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-bold text-gray-700 mb-4 flex items-center gap-3">
            <FaListAlt /> درخواست‌های سفر اخیر
          </h2>
          <div className="space-y-4">
            {stats.recent_trips.length > 0 ? (
              stats.recent_trips.map((trip) => (
                <div key={trip.id} className="border-b pb-3 last:border-b-0">
                  <div className="flex justify-between items-center">
                    <p className="font-semibold text-gray-800">
                      {trip.passenger_name}
                    </p>
                    <StatusBadge status={trip.status} />
                  </div>
                  <p className="text-sm text-gray-600 mt-1">
                    {trip.route_display}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    {new Date(trip.request_time).toLocaleString()}
                  </p>
                </div>
              ))
            ) : (
              <p className="text-center text-gray-500 py-8">
                هیچ سفر اخیر یافت نشد.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
