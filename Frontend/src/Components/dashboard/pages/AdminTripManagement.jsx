// src/Components/dashboard/pages/AdminTripManagement.jsx

import React, { useState, useEffect, useCallback, useMemo } from "react";
import Swal from "sweetalert2";
import { FaTaxi, FaTimes } from "react-icons/fa";
import { useSelector } from "react-redux";
import { Loader2, Users, Calendar, MessageSquare } from "lucide-react";
import { store } from "../../../state/store";
import axios from "axios";
import Select from "react-select";
import { motion, AnimatePresence } from "framer-motion";

const BASE_URL = import.meta.env.VITE_BASE_URL || "http://127.0.0.1:8000";

const createApiClient = () => {
  const api = axios.create({ baseURL: BASE_URL });
  api.interceptors.request.use((config) => {
    const token = store.getState().user.accessToken;
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  });
  return api;
};

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
      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${style}`}
    >
      {statusText}
    </span>
  );
};

const AssignmentModal = ({ trip, drivers, onClose, onAssign }) => {
  // This component remains unchanged. It works as is.
  const [selectedDriver, setSelectedDriver] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!trip) return null;

  const handleConfirm = async () => {
    if (!selectedDriver) {
      Swal.fire("No Driver", "Please select a driver to assign.", "warning");
      return;
    }
    setIsSubmitting(true);
    await onAssign(trip.id, selectedDriver.value);
    setIsSubmitting(false);
  };
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        className="bg-white rounded-lg shadow-xl w-full max-w-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 border-b flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-800">
            Assign Driver to Trip
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-800"
          >
            <FaTimes size={20} />
          </button>
        </div>
        <div className="p-6 space-y-4">
          <div className="flex justify-between items-center">
            <p className="font-semibold text-gray-600">Passenger:</p>
            <p>{trip.passenger}</p>
          </div>
          <div className="flex justify-between items-center">
            <p className="font-semibold text-gray-600">Route:</p>
            <p className="font-medium">
              {trip.route.pickup.name} ➜ {trip.route.drop.name}
            </p>
          </div>
          <div className="flex justify-between items-center">
            <p className="font-semibold text-gray-600 flex items-center gap-2">
              <Users size={16} /> Passengers:
            </p>
            <p>{trip.passenger_count}</p>
          </div>
          {trip.scheduled_for && (
            <div className="flex justify-between items-center text-blue-700">
              <p className="font-semibold flex items-center gap-2">
                <Calendar size={16} /> Scheduled For:
              </p>
              <p className="font-bold">
                {new Date(trip.scheduled_for).toLocaleString()}
              </p>
            </div>
          )}
          {trip.notes_for_driver && (
            <div className="space-y-1">
              <p className="font-semibold text-gray-600 flex items-center gap-2">
                <MessageSquare size={16} /> Passenger Note:
              </p>
              <p className="text-gray-700 bg-gray-100 p-3 rounded-md">
                {trip.notes_for_driver}
              </p>
            </div>
          )}
          <div>
            <label className="block mb-2 font-medium">Select Driver:</label>
            <Select
              options={drivers}
              value={selectedDriver}
              onChange={setSelectedDriver}
              placeholder="Search for a driver..."
              isClearable
            />
          </div>
        </div>
        <div className="p-4 bg-gray-50 flex justify-end gap-3">
          <button onClick={onClose} className="secondary-btn">
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            className="primary-btn flex items-center justify-center"
            disabled={!selectedDriver || isSubmitting}
          >
            {isSubmitting ? (
              <Loader2 className="animate-spin" />
            ) : (
              "Confirm Assignment"
            )}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

// --- NEW: Filter Buttons Component ---
const FilterControls = ({ activeFilter, setActiveFilter }) => {
  const filterOptions = [
    { label: "All", value: "all" },
    { label: "Requested", value: "requested" },
    { label: "In Progress", value: "in_progress" },
    { label: "Completed", value: "completed" },
    { label: "Cancelled", value: "cancelled" },
  ];

  return (
    <div className="mb-6 flex flex-wrap gap-2">
      {filterOptions.map((option) => (
        <button
          key={option.value}
          onClick={() => setActiveFilter(option.value)}
          className={`px-4 py-2 text-sm font-semibold rounded-full transition-colors duration-200 ${
            activeFilter === option.value
              ? "bg-primary text-white shadow"
              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
          }`}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
};

export default function AdminTripManagement() {
  const token = useSelector((state) => state.user.accessToken);
  const [loading, setLoading] = useState(true);
  const [driverOptions, setDriverOptions] = useState([]);
  const [assigningTrip, setAssigningTrip] = useState(null);

  // --- NEW: State for filtering ---
  const [allTrips, setAllTrips] = useState([]); // Master list of all trips
  const [activeFilter, setActiveFilter] = useState("all"); // Current active filter

  const fetchData = useCallback(async () => {
    // ... (fetchData logic remains the same, but it now sets allTrips)
    if (!token) return;
    setLoading(true);
    const api = createApiClient();
    try {
      const [tripsRes, profilesRes] = await Promise.all([
        api.get("/api/v1/vehicle/admin/trips/"),
        api.get("/api/v1/profiles/all/"),
      ]);
      setAllTrips(tripsRes.data.results || tripsRes.data || []); // <-- Populates the master list
      const allProfiles = profilesRes.data?.profiles?.results || [];
      const drivers = allProfiles.filter((p) => p.role === "driver");
      setDriverOptions(
        drivers.map((d) => ({ value: d.user_pkid, label: d.full_name }))
      );
    } catch (error) {
      console.error("Error fetching data:", error);
      Swal.fire(
        "Error",
        "Could not load data. Please refresh the page.",
        "error"
      );
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // --- NEW: Memoized filtering logic ---
  // This creates the list of trips to display based on the active filter.
  // It runs automatically whenever `allTrips` or `activeFilter` changes.
  const filteredTrips = useMemo(() => {
    if (activeFilter === "all") {
      return allTrips;
    }
    return allTrips.filter((trip) => trip.status === activeFilter);
  }, [allTrips, activeFilter]);

  const handleAssignDriver = async (tripId, driverId) => {
    // This function remains unchanged.
    const api = createApiClient();
    try {
      await api.patch(`/api/v1/vehicle/trips/${tripId}/`, {
        driver: driverId,
        status: "in_progress",
      });
      Swal.fire("Success!", "Trip has been assigned to the driver.", "success");
      setAssigningTrip(null);
      fetchData();
    } catch (error) {
      console.error("Error assigning driver:", error.response?.data || error);
      Swal.fire("Error", "Failed to assign trip.", "error");
    }
  };

  return (
    <>
      <AnimatePresence>
        {assigningTrip && (
          <AssignmentModal
            trip={assigningTrip}
            drivers={driverOptions}
            onClose={() => setAssigningTrip(null)}
            onAssign={handleAssignDriver}
          />
        )}
      </AnimatePresence>

      <div className="p-3 md:p-6 w-full">
        <div className="bg-white p-6  rounded-lg ">
          <h1 className="text-2xl font-bold text-gray-800 mb-6 border-b pb-4 flex items-center gap-3">
            <span className="p-2 rounded-full bg-gray-300">
              <FaTaxi />
            </span>{" "}
            <span className="text-xl font-Ray_black text-gray-600">
              مدیریت سفرها
            </span>{" "}
          </h1>

          {/* --- NEW: Add the filter controls UI --- */}
          <FilterControls
            activeFilter={activeFilter}
            setActiveFilter={setActiveFilter}
          />

          <div className="overflow-x-auto">
            {loading ? (
              <div className="flex justify-center items-center h-64">
                <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
              </div>
            ) : (
              <table className="w-full text-sm text-center text-gray-500">
                <thead className="text-base text-gray-700 uppercase bg-gray-300">
                  <tr>
                    <th className="px-5 py-3">مسافر</th>
                    <th className="px-5 py-3">مسیر</th>
                    <th className="px-5 py-3">تاریخ</th>
                    <th className="px-5 py-3">جزئیات</th>
                    <th className="px-5 py-3">وضعیت</th>
                    <th className="px-5 py-3 text-center">عملیات</th>
                  </tr>
                </thead>
                <tbody>
                  {/* --- UPDATED: Map over `filteredTrips` instead of `trips` --- */}
                  {filteredTrips.length > 0 ? (
                    filteredTrips.map((trip, index) => (
                      <tr
                        key={trip.id}
                        className={`border-b hover:bg-gray-50 ${
                          index % 2 === 0 ? "bg-gray-100" : ""
                        } `}
                      >
                        <td className="px-5 py-4 font-medium">
                          {trip.passenger}
                        </td>
                        <td className="px-5 py-4">
                          {trip.route.pickup.name} ➜ {trip.route.drop.name}
                        </td>
                        <td className="px-5 py-4 text-gray-600">
                          {trip.scheduled_for ? (
                            <div className="text-blue-700">
                              <span className="font-semibold block">
                                زمان‌بندی‌شده
                              </span>
                              <span className="text-xs">
                                {new Date(trip.scheduled_for).toLocaleString()}
                              </span>
                            </div>
                          ) : (
                            <div>
                              <span className="font-semibold block">
                                درخواست شده
                              </span>
                              <span className="text-xs">
                                {new Date(trip.request_time).toLocaleString()}
                              </span>
                            </div>
                          )}
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <span
                              className="flex items-center gap-1.5"
                              title="Passenger Count"
                            >
                              <Users size={16} className="text-gray-500" />
                              {trip.passenger_count}
                            </span>
                            {trip.notes_for_driver && (
                              <span className="text-gray-400">|</span>
                            )}
                            {trip.notes_for_driver && (
                              <span className="text-blue-600" title="Has Notes">
                                <MessageSquare size={16} />
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <StatusBadge status={trip.status} />
                        </td>
                        <td className="px-5 py-4 text-center">
                          {trip.status === "requested" ? (
                            <button
                              onClick={() => setAssigningTrip(trip)}
                              className="secondary-btn"
                            >
                              تعیین راننده
                            </button>
                          ) : (
                            <span className="font-medium text-gray-800">
                              {trip.driver_name || "N/A"}
                            </span>
                          )}
                        </td>
                      </tr>
                    ))
                  ) : (
                    // --- UPDATED: Dynamic "no results" message ---
                    <tr>
                      <td
                        colSpan="6"
                        className="text-center py-16 text-gray-500"
                      >
                        سفری با فیلتر انتخاب‌شده یافت نشد.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
