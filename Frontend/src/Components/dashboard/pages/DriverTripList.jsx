// src/Components/dashboard/pages/DriverTripList.jsx

import React, { useState, useEffect, useCallback } from "react";
import Swal from "sweetalert2";
import { FaListAlt, FaCheck } from "react-icons/fa";
import { useSelector } from "react-redux";
import { Loader2, Users, MessageSquare } from "lucide-react";
import { store } from "../../../state/store";
import axios from "axios";

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
  const capitalizedStatus = status
    ? status.charAt(0).toUpperCase() + status.slice(1).replace("_", " ")
    : "Unknown";
  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${style}`}
    >
      {capitalizedStatus}
    </span>
  );
};

export default function DriverTripList() {
  const token = useSelector((state) => state.user.accessToken);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("available");
  const [availableTrips, setAvailableTrips] = useState([]);
  const [assignedTrips, setAssignedTrips] = useState([]);
  const [isNotesModalOpen, setIsNotesModalOpen] = useState(false);
  const [selectedTripNotes, setSelectedTripNotes] = useState("");

  const fetchData = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    const api = createApiClient();
    try {
      const [availableRes, assignedRes] = await Promise.all([
        api.get("/api/v1/vehicle/driver/available-trips/"),
        api.get("/api/v1/vehicle/driver/trips/"),
      ]);
      setAvailableTrips(availableRes.data.results || availableRes.data || []);
      setAssignedTrips(assignedRes.data.results || assignedRes.data || []);
    } catch (error) {
      // *** SYNTAX ERROR FIX HERE ***
      // The { and } braces were missing in the previous version. They are now restored.
      console.error("Error fetching trip data:", error);
      Swal.fire("Error", "Could not load trip data. Please refresh.", "error");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleAcceptTrip = async (tripId) => {
    const result = await Swal.fire({
      title: "Accept this Trip?",
      text: "This action will assign the trip to you.",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#2563eb",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, Accept It!",
    });

    if (result.isConfirmed) {
      const api = createApiClient();
      try {
        await api.post(`/api/v1/vehicle/trips/${tripId}/accept/`);
        Swal.fire(
          "Accepted!",
          "The trip has been added to your assigned list.",
          "success"
        );
        fetchData();
      } catch (error) {
        const errorMsg =
          error.response?.data?.detail || "Could not accept the trip.";
        Swal.fire("Error", errorMsg, "error");
      }
    }
  };

  const handleUpdateStatus = async (tripId, newStatus) => {
    const api = createApiClient();
    try {
      await api.patch(`/api/v1/vehicle/trips/${tripId}/`, {
        status: newStatus,
      });
      Swal.fire("Success", `Trip status has been updated.`, "success");
      fetchData();
    } catch (error) {
      console.error("Error updating trip status:", error);
      Swal.fire("Error", "Could not update the trip status.", "error");
    }
  };

  const handleViewNotes = (notes) => {
    setSelectedTripNotes(notes);
    setIsNotesModalOpen(true);
  };

  // Helper for route display (Simplified version)
  const getRouteDisplayString = (trip) => {
    // Since both APIs now send the same nested route object, we only need one check.
    if (trip.route?.pickup?.name && trip.route?.drop?.name) {
      return `${trip.route.pickup.name} ➜ ${trip.route.drop.name}`;
    }
    // Fallback if route data is somehow missing
    return "مسیر نامشخص";
  };

  const getPassengerName = (trip) => {
    if (typeof trip.passenger_name === "string" && trip.passenger_name) {
      return trip.passenger_name;
    }
    if (typeof trip.passenger?.name === "string" && trip.passenger.name) {
      return trip.passenger.name;
    }
    return "نامشخص";
  };

  const renderTable = (trips, type) => (
    <table className="w-full text-sm text-center text-gray-500">
      <thead className="text-base text-gray-700 uppercase bg-gray-300">
        <tr>
          <th scope="col" className="px-5 py-3">
            مسافر
          </th>
          <th scope="col" className="px-5 py-3">
            مسیر
          </th>
          <th scope="col" className="px-5 py-3">
            تاریخ
          </th>
          <th scope="col" className="px-5 py-3">
            جزییات
          </th>
          <th scope="col" className="px-5 py-3">
            کرایه
          </th>
          <th scope="col" className="px-5 py-3 text-center">
            عملیات
          </th>
        </tr>
      </thead>
      <tbody>
        {trips.length > 0 ? (
          trips.map((trip, index) => (
            <tr
              key={trip.id || trip.pk}
              className={`border-b hover:bg-gray-50 ${
                index % 2 === 0 ? "bg-gray-100" : ""
              }`}
            >
              <td className="px-5 py-4 font-medium">
                {getPassengerName(trip)}
              </td>
              <td className="px-5 py-4">{getRouteDisplayString(trip)}</td>
              <td className="px-5 py-4 text-gray-600">
                {trip.scheduled_for ? (
                  <div className="text-blue-700">
                    <span className="font-semibold block">زمان‌بندی شده</span>
                    <span className="text-xs">
                      {new Date(trip.scheduled_for).toLocaleString()}
                    </span>
                  </div>
                ) : trip.request_time ? (
                  <div>
                    <span className="font-semibold block">درخواست شده</span>
                    <span className="text-xs">
                      {new Date(trip.request_time).toLocaleString()}
                    </span>
                  </div>
                ) : (
                  <span className="text-gray-500">-</span>
                )}
              </td>
              <td className="px-5 py-4">
                <div className="flex items-center justify-center gap-3">
                  <span
                    className="flex items-center gap-1.5"
                    title="Passenger Count"
                  >
                    <Users size={16} className="text-gray-500" />
                    {trip.passenger_count ?? "-"}
                  </span>
                  {trip.notes_for_driver && (
                    <>
                      <span className="text-gray-400">|</span>
                      <button
                        onClick={() => handleViewNotes(trip.notes_for_driver)}
                        className="text-blue-600 hover:text-blue-800"
                        title="View Notes"
                      >
                        <MessageSquare size={16} />
                      </button>
                    </>
                  )}
                </div>
              </td>
              <td className="px-5 py-4 font-semibold">
                {trip.fare ? `${trip.fare} AF` : "-"}
              </td>
              <td className="px-5 py-4 text-center">
                {type === "available" && (
                  <button
                    onClick={() => handleAcceptTrip(trip.pk)}
                    className="action-btn-green flex items-center justify-center gap-1 w-full"
                  >
                    <FaCheck /> قبول کردن
                  </button>
                )}
                {type === "assigned" && (
                  <>
                    {trip.status === "in_progress" ? (
                      <button
                        onClick={() => handleUpdateStatus(trip.id, "completed")}
                        className="action-btn-blue w-full"
                      >
                        تکمیل شد
                      </button>
                    ) : (
                      <StatusBadge status={trip.status} />
                    )}
                  </>
                )}
              </td>
            </tr>
          ))
        ) : (
          <tr>
            <td colSpan="6" className="text-center py-16 text-gray-500">
              {type === "available"
                ? "هیچ درخواست جدید سفری در مسیرهای شما وجود ندارد."
                : "شما هیچ سفر اختصاص یافته‌ای ندارید."}
            </td>
          </tr>
        )}
      </tbody>
    </table>
  );

  return (
    <>
      <div className="p-3 md-p-6 w-full">
        <div className="bg-white p-6 rounded-lg">
          <h1 className="text-2xl font-bold text-gray-800 mb-6 border-b pb-4 flex items-center gap-3">
            <span className="p-2 rounded-full bg-gray-300">
              <FaListAlt />
            </span>
            <span className="text-xl font-Ray_black text-gray-600">
              داشبورد راننده
            </span>
          </h1>
          <div className="mb-6 flex border-b">
            <button
              onClick={() => setActiveTab("available")}
              className={`px-4 py-2 font-semibold transition-colors ${
                activeTab === "available"
                  ? "border-b-2 border-blue-600 text-blue-600"
                  : "text-gray-500 hover:text-gray-800"
              }`}
            >
              درخواست‌های سفر موجود ({availableTrips.length})
            </button>
            <button
              onClick={() => setActiveTab("assigned")}
              className={`px-4 py-2 font-semibold transition-colors ${
                activeTab === "assigned"
                  ? "border-b-2 border-blue-600 text-blue-600"
                  : "text-gray-500 hover:text-gray-800"
              }`}
            >
              سفرهای اختصاص داده‌شده من ({assignedTrips.length})
            </button>
          </div>
          <div className="overflow-x-auto">
            {loading ? (
              <div className="flex justify-center items-center h-64">
                <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
              </div>
            ) : activeTab === "available" ? (
              renderTable(availableTrips, "available")
            ) : (
              renderTable(assignedTrips, "assigned")
            )}
          </div>
        </div>
      </div>
      {isNotesModalOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4"
          onClick={() => setIsNotesModalOpen(false)}
        >
          <div
            className="bg-white rounded-lg shadow-2xl p-6 max-w-md w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-semibold mb-4 text-gray-800 border-b pb-2">
              یادداشت مسافر
            </h3>
            <p className="text-gray-600 whitespace-pre-wrap">
              {selectedTripNotes}
            </p>
            <div className="mt-6 text-right">
              <button
                onClick={() => setIsNotesModalOpen(false)}
                className="secondry-btn"
              >
                بستن
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
