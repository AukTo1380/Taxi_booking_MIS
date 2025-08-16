// src/Components/dashboard/pages/RouteManagement.jsx

import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { FaRegEdit, FaRoute } from "react-icons/fa";
import { IoTrashSharp } from "react-icons/io5";
import { useSelector } from "react-redux";
import { Loader2 } from "lucide-react";
import { store } from "../../../state/store";
import Select from "react-select";

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
  control: (provided) => ({
    ...provided,
    backgroundColor: "#f3f4f6",
    border: "1px solid #e5e7eb",
    borderRadius: "0.375rem",
    minHeight: "42px",
    boxShadow: "none",
    "&:hover": { borderColor: "#9ca3af" },
  }),
  option: (provided, state) => ({
    ...provided,
    backgroundColor: state.isSelected
      ? "#2563eb"
      : state.isFocused
      ? "#dbeafe"
      : "white",
    color: state.isSelected ? "white" : "black",
    cursor: "pointer",
  }),
};

export default function RouteManagement() {
  const token = useSelector((state) => state.user.accessToken);

  const initialFormState = {
    pickup: null,
    drop: null,
    price_af: "",
    drivers: [],
    vehicles: [],
  };
  const [formData, setFormData] = useState(initialFormState);
  const [routes, setRoutes] = useState([]);
  const [editingRoute, setEditingRoute] = useState(null);
  const [loading, setLoading] = useState(true);
  const [locationOptions, setLocationOptions] = useState([]);
  const [driverOptions, setDriverOptions] = useState([]);
  const [vehicleOptions, setVehicleOptions] = useState([]);

  const fetchRelatedData = useCallback(async () => {
    if (!token) return;
    try {
      const api = createApiClient();
      const [locationsRes, profilesRes, vehiclesRes] = await Promise.all([
        api.get("/api/v1/vehicle/locations/"),
        api.get("/api/v1/profiles/all/"),
        api.get("/api/v1/vehicle/vehicles/"),
      ]);

      const locations = locationsRes.data.results || locationsRes.data || [];
      setLocationOptions(
        locations.map((loc) => ({ value: loc.pk, label: loc.name }))
      );

      const profiles = profilesRes.data?.profiles?.results || [];
      const drivers = profiles.filter((p) => p.role === "driver");

      // --- THIS IS THE FINAL, GUARANTEED FIX ---
      // The correct field name from the ProfileSerializer is `user_pkid`.
      setDriverOptions(
        drivers.map((d) => ({ value: d.user_pkid, label: d.full_name }))
      );
      // --- END OF FIX ---

      const vehicles = vehiclesRes.data.results || vehiclesRes.data || [];
      setVehicleOptions(
        vehicles.map((v) => ({
          value: v.pk,
          label: `${v.model} - ${v.plate_number}`,
        }))
      );
    } catch (error) {
      console.error("Error fetching related data:", error);
      Swal.fire("Data Loading Error", "Could not load required data.", "error");
    }
  }, [token]);

  const fetchRoutes = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const api = createApiClient();
      const response = await api.get("/api/v1/vehicle/vehicle/routes/");
      setRoutes(response.data.results || response.data || []);
    } catch (error) {
      console.error("Error fetching routes:", error);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchRelatedData().then(() => {
      fetchRoutes();
    });
  }, [fetchRelatedData, fetchRoutes]);

  const resetForm = () => {
    setFormData(initialFormState);
    setEditingRoute(null);
  };

  const handleSelectChange = (selectedOption, actionMeta) => {
    const { name } = actionMeta;
    setFormData((prev) => ({
      ...prev,
      [name]: selectedOption || (Array.isArray(prev[name]) ? [] : null),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (
      !formData.pickup?.value ||
      !formData.drop?.value ||
      !formData.price_af
    ) {
      Swal.fire(
        "Missing Information",
        "Please select pickup, drop-off, and set a price.",
        "error"
      );
      return;
    }
    if (formData.pickup.value === formData.drop.value) {
      Swal.fire(
        "Invalid Route",
        "Pickup and Drop-off locations cannot be the same.",
        "error"
      );
      return;
    }

    const payload = {
      pickup_id: formData.pickup.value,
      drop_id: formData.drop.value,
      price_af: formData.price_af,
      drivers: Array.isArray(formData.drivers)
        ? formData.drivers.map((d) => d.value)
        : [],
      vehicles: Array.isArray(formData.vehicles)
        ? formData.vehicles.map((v) => v.value)
        : [],
    };

    const api = createApiClient();
    const url = editingRoute
      ? `/api/v1/vehicle/vehicle/routes/${editingRoute.pk}/`
      : "/api/v1/vehicle/vehicle/routes/";
    const method = editingRoute ? "put" : "post";

    try {
      await api[method](url, payload);
      Swal.fire(
        "Success!",
        `Route ${editingRoute ? "updated" : "created"} successfully.`,
        "success"
      );
      resetForm();
      fetchRoutes();
    } catch (error) {
      const errorData = error.response?.data;
      const errorMsg =
        errorData?.non_field_errors?.[0] ||
        Object.values(errorData).flat().join(" ") ||
        "An error occurred.";
      Swal.fire("Submission Error", errorMsg, "error");
    }
  };

  const handleEdit = (route) => {
    setEditingRoute(route);
    setFormData({
      pickup: locationOptions.find((opt) => opt.value === route.pickup.pk),
      drop: locationOptions.find((opt) => opt.value === route.drop.pk),
      price_af: route.price_af,
      drivers: route.drivers
        .map((id) => driverOptions.find((d) => d.value === id))
        .filter(Boolean),
      vehicles: route.vehicles
        .map((id) => vehicleOptions.find((v) => v.value === id))
        .filter(Boolean),
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (pk) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete it!",
    });
    if (result.isConfirmed) {
      try {
        const api = createApiClient();
        await api.delete(`/api/v1/vehicle/vehicle/routes/${pk}/`);
        Swal.fire("Deleted!", "The route has been deleted.", "success");
        fetchRoutes();
      } catch (error) {
        Swal.fire("Error", "Failed to delete the route.", "error");
      }
    }
  };

  return (
    <div className="p-3 md:p-6 w-full px-5">
      <div className="w-full py-4 px-5 shadow-lg bg-white pb-14 rounded-md">
        <h1 className="text-2xl font-bold text-gray-800 mb-6 border-b pb-4 flex items-center gap-3">
          <span className="p-2 rounded-full bg-gray-300">
            <FaRoute />
          </span>{" "}
          <span className="text-xl font-Ray_black text-gray-600">
            {editingRoute ? "ویرایش مسیر" : "ایجاد مسیر جدید"}
          </span>{" "}
        </h1>
        <form onSubmit={handleSubmit} className="max-w-4xl mx-auto space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block mb-2 font-medium">مکان سوار شدن</label>
              <Select
                name="pickup"
                options={locationOptions}
                value={formData.pickup}
                onChange={handleSelectChange}
                styles={selectStyles}
                placeholder="جستجو..."
              />
            </div>
            <div>
              <label className="block mb-2 font-medium">مکان پیاده شدن</label>
              <Select
                name="drop"
                options={locationOptions}
                value={formData.drop}
                onChange={handleSelectChange}
                styles={selectStyles}
                placeholder="جستجو..."
              />
            </div>
          </div>
          <div>
            <label className="block mb-2 font-medium">قیمت (افغانی)</label>
            <input
              type="number"
              step="0.01"
              value={formData.price_af}
              onChange={(e) =>
                setFormData({ ...formData, price_af: e.target.value })
              }
              className="w-full input-field"
              placeholder="مثلاً ۲۵۰.۰۰"
              required
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block mb-2 font-medium">رانندگان موجود</label>
              <Select
                isMulti
                name="drivers"
                options={driverOptions}
                value={formData.drivers}
                onChange={handleSelectChange}
                styles={selectStyles}
                placeholder="انتخاب کنید..."
              />
            </div>
            <div>
              <label className="block mb-2 font-medium">وسایط موجود</label>
              <Select
                isMulti
                name="vehicles"
                options={vehicleOptions}
                value={formData.vehicles}
                onChange={handleSelectChange}
                styles={selectStyles}
                placeholder="انتخاب کنید..."
              />
            </div>
          </div>
          <div className="flex justify-center gap-4 pt-4">
            <button type="submit" className="primary-btn">
              {editingRoute ? "به‌روزرسانی مسیر" : "ایجاد مسیر"}
            </button>
            {editingRoute && (
              <button
                type="button"
                onClick={resetForm}
                className="secondary-btn"
              >
                لغو ویرایش
              </button>
            )}
          </div>
        </form>

        <div
          id="route-table"
          className="w-full mx-auto bg-white mt-10 border border-gray-200 overflow-x-auto"
        >
          <table className="w-full text-sm text-center text-gray-500">
            <thead className="text-base text-gray-700 uppercase bg-gray-300">
              <tr>
                <th scope="col" className="px-6 py-3">
                  مسیر
                </th>
                <th scope="col" className="px-6 py-3">
                  قیمت
                </th>
                <th scope="col" className="px-6 py-3">
                  رانندگان منصوب شده
                </th>
                <th scope="col" className="px-6 py-3 text-center">
                  عملیات
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="4" className="text-center py-10">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto text-blue-600" />
                  </td>
                </tr>
              ) : routes.length > 0 ? (
                routes.map((route,index) => (
                  <tr
                    key={route.pk}
                    className={`border-b hover:bg-gray-50 ${
                      index % 2 === 0 ? "bg-gray-100" : ""
                    } `}
                  >
                    <td className="px-6 py-4 font-medium text-gray-900">
                      {route.pickup.name} ➜ {route.drop.name}
                    </td>
                    <td className="px-6 py-4">{route.price_af} AF</td>
                    <td className="px-6 py-4 text-xs">
                      {route.drivers
                        .map(
                          (driverId) =>
                            driverOptions.find((d) => d.value === driverId)
                              ?.label || `ID:${driverId}`
                        )
                        .join(", ") || "None"}
                    </td>
                    <td className="px-6 py-4 flex items-center justify-center gap-4">
                      <button
                        onClick={() => handleEdit(route)}
                        className="text-blue-600 hover:text-blue-800"
                        title="Edit Route"
                      >
                        <FaRegEdit size={20} />
                      </button>
                      <button
                        onClick={() => handleDelete(route.pk)}
                        className="text-red-600 hover:text-red-800"
                        title="Delete Route"
                      >
                        <IoTrashSharp size={20} />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="text-center py-10 text-gray-500">
                    هنوز هیچ مسیری ایجاد نشده است{" "}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
