// src/Components/dashboard/pages/RequestTrip.jsx

import React, { useState, useEffect, useCallback } from "react";
import Swal from "sweetalert2";
import { FaTaxi } from "react-icons/fa";
import { useSelector } from "react-redux";
import { Loader2, Users, Calendar, MessageSquare, Send } from "lucide-react"; // <-- Import new icons
import { store } from "../../../state/store";
import Select from "react-select";
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

const selectStyles = {
  /* ... No changes here ... */
};

export default function RequestTrip() {
  const token = useSelector((state) => state.user.accessToken);

  // --- NEW: Expanded state to manage all form fields and UI flow ---
  const [routeOptions, setRouteOptions] = useState([]);
  const [selectedRoute, setSelectedRoute] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false); // For confirmation modal

  // New form fields state
  const [passengerCount, setPassengerCount] = useState(1);
  const [notes, setNotes] = useState("");
  const [isScheduled, setIsScheduled] = useState(false);
  const [scheduledDateTime, setScheduledDateTime] = useState("");

  const fetchRoutes = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    const api = createApiClient();
    try {
      const response = await api.get("/api/v1/vehicle/vehicle/routes/");
      const routesData = response.data.results || response.data || [];

      const options = routesData
        .map((route) => ({
          value: route.pk,
          label: `${route.pickup.name} ➜ ${route.drop.name}`,
          price: route.price_af,
          driverCount: route.drivers.length,
        }))
        .filter((route) => route.driverCount > 0);
      setRouteOptions(options);
    } catch (error) {
      console.error("Error fetching routes:", error);
      Swal.fire("Error", "Could not load available routes.", "error");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchRoutes();
  }, [fetchRoutes]);

  // --- NEW: Form submission now opens a confirmation modal first ---
  const handleReviewTrip = (e) => {
    e.preventDefault();
    if (!selectedRoute) {
      Swal.fire("No Route Selected", "Please choose a route.", "warning");
      return;
    }
    if (isScheduled && !scheduledDateTime) {
      Swal.fire(
        "Time Required",
        "Please specify the date and time for the scheduled trip.",
        "warning"
      );
      return;
    }
    setIsModalOpen(true);
  };

  // --- NEW: Actual API submission logic ---
  const handleConfirmAndSubmit = async () => {
    setIsModalOpen(false);
    setSubmitting(true);

    const payload = {
      route_id: selectedRoute.value,
      passenger_count: passengerCount,
      notes_for_driver: notes,
      scheduled_for: isScheduled ? scheduledDateTime : null,
    };

    const api = createApiClient();
    try {
      await api.post("/api/v1/vehicle/trips/", payload);
      Swal.fire({
        icon: "success",
        title: "Trip Requested!",
        text: 'You can check the status in the "My Trips" section.',
        confirmButtonText: "Great!",
      });
      // Reset form to initial state
      setSelectedRoute(null);
      setPassengerCount(1);
      setNotes("");
      setIsScheduled(false);
      setScheduledDateTime("");
    } catch (error) {
      const errorMsg = error.response?.data?.detail || "Something went wrong.";
      Swal.fire("Request Failed", errorMsg, "error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <div className="p-3 md:p-6 w-full">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white p-6 shadow-md rounded-lg">
            <h1 className="text-2xl font-bold text-gray-800 mb-6 border-b pb-4 flex items-center gap-3">
              <span className="p-2 rounded-full bg-gray-300">
                <FaTaxi />
              </span>{" "}
              <span className="text-xl font-Ray_black text-gray-600">
                درخواست سفر جدید
              </span>{" "}
            </h1>
            {loading ? (
              <div className="flex justify-center items-center h-48">
                <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
              </div>
            ) : (
              // --- UPDATED FORM with new fields ---
              <form onSubmit={handleReviewTrip} className="space-y-6">
                <div>
                  <label className="block mb-2 font-medium text-gray-700">
                    مسیر خود را انتخاب کنید
                  </label>
                  <Select
                    options={routeOptions}
                    value={selectedRoute}
                    onChange={setSelectedRoute}
                    styles={selectStyles}
                    placeholder="یک مکان مبدا و مقصد را انتخاب کنید..."
                    noOptionsMessage={() => "No routes with available drivers."}
                    isClearable
                  />
                </div>

                {/* --- NEW DETAILED FIELDS SECTION --- */}
                {selectedRoute && (
                  <div className="space-y-6 border-t pt-6">
                    <div>
                      <label
                        htmlFor="passengerCount"
                        className="block mb-2 font-medium text-gray-700"
                      >
                        تعداد مسافران
                      </label>
                      <input
                        type="number"
                        id="passengerCount"
                        value={passengerCount}
                        onChange={(e) =>
                          setPassengerCount(Number(e.target.value))
                        }
                        min="1"
                        max="10"
                        className="w-full p-3 border border-gray-200 bg-gray-50 rounded-md"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="notes"
                        className="block mb-2 font-medium text-gray-700"
                      >
                        یادداشت برای راننده (اختیاری)
                      </label>
                      <textarea
                        id="notes"
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        rows="3"
                        placeholder="e.g., I have extra luggage."
                        className="w-full p-3 border border-gray-200 bg-gray-50 rounded-md"
                      />
                    </div>
                    <div className="pt-2">
                      <label className="flex items-center gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={isScheduled}
                          onChange={(e) => setIsScheduled(e.target.checked)}
                          className="h-5 w-5 rounded text-blue-600 focus:ring-blue-500"
                        />
                        <span className="font-medium">
                          آیا می‌خواهید سفر را برای زمان دیگری برنامه‌ریزی کنید؟
                        </span>
                      </label>
                      {isScheduled && (
                        <div className="mt-4">
                          <label
                            htmlFor="scheduledDateTime"
                            className="block mb-2 font-medium text-gray-700"
                          >
                            تاریخ و زمان حرکت
                          </label>
                          <input
                            type="datetime-local"
                            id="scheduledDateTime"
                            value={scheduledDateTime}
                            onChange={(e) =>
                              setScheduledDateTime(e.target.value)
                            }
                            className="w-full p-3 border border-gray-200 bg-gray-50 rounded-md"
                            required
                          />
                        </div>
                      )}
                    </div>
                  </div>
                )}

                <div className="pt-4">
                  <button
                    type="submit"
                    className="primary-btn w-full flex items-center justify-center disabled:bg-gray-400"
                    disabled={!selectedRoute || submitting || loading}
                  >
                    {submitting ? (
                      <Loader2 className="animate-spin" />
                    ) : (
                      "بررسی و درخواست سفر"
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>

      {/* --- NEW: CONFIRMATION MODAL --- */}
      {isModalOpen && selectedRoute && (
        <div
          className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4"
          dir="rtl"
        >
          <div className="bg-white rounded-lg shadow-2xl p-6 sm:p-8 max-w-lg w-full">
            <h3 className="text-2xl font-bold mb-6 text-center">
              تأیید جزئیات سفر
            </h3>
            <div className="space-y-4 text-gray-800">
              <div className="flex justify-between items-center border-b pb-3">
                <span className="font-semibold text-gray-600">مسیر:</span>
                <span className="font-bold text-lg">{selectedRoute.label}</span>
              </div>
              <div className="flex justify-between items-center border-b pb-3">
                <span className="font-semibold text-gray-600">
                  کرایه تخمینی:
                </span>
                <span className="font-bold text-lg text-green-600">
                  {selectedRoute.price} افغانی
                </span>
              </div>
              <div className="flex justify-between items-center border-b pb-3">
                <span className="font-semibold text-gray-600 flex items-center gap-2">
                  <Users size={18} /> مسافران:
                </span>
                <span className="font-bold">{passengerCount}</span>
              </div>
              {isScheduled && scheduledDateTime && (
                <div className="flex justify-between items-center border-b pb-3 text-blue-700">
                  <span className="font-semibold flex items-center gap-2">
                    <Calendar size={18} /> زمان تعیین‌شده:
                  </span>
                  <span className="font-bold">
                    {new Date(scheduledDateTime).toLocaleString()}
                  </span>
                </div>
              )}
              {notes && (
                <div className="border-b pb-3">
                  <span className="font-semibold text-gray-600 flex items-center gap-2 mb-2">
                    <MessageSquare size={18} /> یادداشت شما:
                  </span>
                  <p className="text-gray-700 bg-gray-100 p-3 rounded-md w-full">
                    {notes}
                  </p>
                </div>
              )}
            </div>
            <div className="mt-8 flex flex-col-reverse sm:flex-row gap-4">
              <button
                onClick={() => setIsModalOpen(false)}
                className="secondary-btn w-full"
              >
                ویرایش جزئیات
              </button>
              <button
                onClick={handleConfirmAndSubmit}
                className="primary-btn w-full flex justify-center items-center"
                disabled={submitting}
              >
                {submitting ? (
                  <Loader2 className="animate-spin" />
                ) : (
                  "تأیید و ارسال درخواست"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
