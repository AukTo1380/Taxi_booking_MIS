// src/Components/dashboard/pages/MyTrips.jsx

import React, { useState, useEffect, useCallback } from "react";
import Swal from "sweetalert2";
import { FaListAlt } from "react-icons/fa";
import { useSelector } from "react-redux";
import { Loader2, Users, Calendar, MessageSquare } from "lucide-react"; // <-- Import new icons
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

export default function MyTrips() {
  const token = useSelector((state) => state.user.accessToken);
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);

  // --- NEW STATE for the notes modal ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTripNotes, setSelectedTripNotes] = useState("");

  const fetchTripData = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    const api = createApiClient();
    try {
      // The API response now includes passenger_count, notes_for_driver, and scheduled_for
      const tripsResponse = await api.get("/api/v1/vehicle/trips/");
      const tripsData = Array.isArray(tripsResponse.data.results)
        ? tripsResponse.data.results
        : tripsResponse.data || [];
      setTrips(tripsData);
    } catch (error) {
      console.error("Error fetching trip data:", error);
      Swal.fire("Error", "Could not load your trip history.", "error");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchTripData();
  }, [fetchTripData]);

  // --- NEW: Function to open the notes modal ---
  const handleViewNotes = (notes) => {
    setSelectedTripNotes(notes);
    setIsModalOpen(true);
  };

  return (
    <>
      <div className="p-3 md:p-6 w-full">
        <div className="bg-white p-6  rounded-lg m">
          <h1 className="text-2xl font-bold text-gray-800 mb-6 border-b pb-4 flex items-center gap-3">
            <span className="p-2 rounded-full bg-gray-300">
              <FaListAlt />
            </span>{" "}
            <span className="text-xl font-Ray_black text-gray-600">
              تاریخچه سفرهای من
            </span>{" "}
          </h1>

          <div className="overflow-x-auto">
            {loading ? (
              <div className="flex justify-center items-center h-64">
                <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
              </div>
            ) : (
              <table className="w-full text-sm text-center text-gray-500">
                {/* --- UPDATED TABLE HEADERS --- */}
                <thead className="text-base text-gray-700 uppercase bg-gray-300">
                  <tr>
                    <th scope="col" className="px-6 py-3">
                      مسیر
                    </th>
                    <th scope="col" className="px-6 py-3">
                      تاریخ
                    </th>
                    <th scope="col" className="px-6 py-3">
                      جزئیات
                    </th>
                    <th scope="col" className="px-6 py-3">
                      کرایه
                    </th>
                    <th scope="col" className="px-6 py-3 text-center">
                      وضعیت
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {Array.isArray(trips) && trips.length > 0 ? (
                    trips.map((trip, index) => (
                      <tr
                        key={trip.id}
                        className={`border-b hover:bg-gray-50 ${
                          index % 2 === 0 ? "bg-gray-100" : ""
                        } `}
                      >
                        {/* Route (Unchanged) */}
                        <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
                          {trip.route
                            ? `${trip.route.pickup.name} ➜ ${trip.route.drop.name}`
                            : "N/A"}
                        </td>

                        {/* --- NEW: Conditional Date Column --- */}
                        <td className="px-6 py-4 text-gray-600">
                          {trip.scheduled_for ? (
                            <div className="flex items-center gap-2 text-blue-700">
                              <Calendar size={14} />
                              <div>
                                <span className="block font-semibold">
                                  زمان‌بندی شده برای
                                </span>
                                <span className="text-xs">
                                  {new Date(
                                    trip.scheduled_for
                                  ).toLocaleString()}
                                </span>
                              </div>
                            </div>
                          ) : (
                            <div>
                              <span className="block font-semibold">
                                درخواست شده در
                              </span>
                              <span className="text-xs">
                                {new Date(trip.request_time).toLocaleString()}
                              </span>
                            </div>
                          )}
                        </td>

                        {/* --- NEW: Details Column with Passenger Count and Notes Button --- */}
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-4">
                            <span
                              className="flex items-center gap-1.5"
                              title="Passenger Count"
                            >
                              <Users size={16} className="text-gray-500" />
                              {trip.passenger_count}
                            </span>
                            {trip.notes_for_driver && (
                              <button
                                onClick={() =>
                                  handleViewNotes(trip.notes_for_driver)
                                }
                                className="text-blue-600 hover:text-blue-800"
                                title="View Notes"
                              >
                                <MessageSquare size={16} />
                              </button>
                            )}
                          </div>
                        </td>

                        {/* Fare (Unchanged) */}
                        <td className="px-6 py-4 font-semibold">
                          {trip.fare} AF
                        </td>

                        {/* Status (Unchanged) */}
                        <td className="px-6 py-4 text-center">
                          <StatusBadge status={trip.status} />
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan="5"
                        className="text-center py-16 text-gray-500"
                      >
                        شما هنوز هیچ سفری درخواست نکرده‌اید.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

      {/* --- NEW: Notes Viewer Modal --- */}
      {isModalOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4"
          onClick={() => setIsModalOpen(false)}
        >
          <div
            className="bg-white rounded-lg shadow-2xl p-6 max-w-md w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-semibold mb-4 text-gray-800 border-b pb-2">
              Notes for Driver
            </h3>
            <p className="text-gray-600 whitespace-pre-wrap">
              {selectedTripNotes}
            </p>
            <div className="mt-6 text-right">
              <button
                onClick={() => setIsModalOpen(false)}
                className="secondary-btn"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
