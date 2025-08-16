// src/Components/dashboard/pages/VehicleManagement.jsx

import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { FaCar, FaRegEdit } from "react-icons/fa";
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
};
export default function VehicleManagement() {
  const { profile } = useSelector((state) => state.user);
  const token = useSelector((state) => state.user.accessToken);

  const initialFormState = {
    model: "",
    plate_number: "",
    type: "economy",
    license: null,
    driver: null, // Only used by admins
  };

  const [formData, setFormData] = useState(initialFormState);
  const [vehicles, setVehicles] = useState([]);
  const [editingVehicle, setEditingVehicle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [driverOptions, setDriverOptions] = useState([]);

  // Fetch drivers list (only for admins)
  useEffect(() => {
    if (profile?.role !== "admin" || !token) return;
    const fetchDrivers = async () => {
      try {
        const api = createApiClient();
        const response = await api.get("/api/v1/profiles/all/");
        const allProfiles = response.data?.profiles?.results || [];
        const drivers = allProfiles.filter((p) => p.role === "driver");
        setDriverOptions(
          drivers.map((d) => ({ value: d.user_pkid, label: d.full_name }))
        );
      } catch (error) {
        console.error("Error fetching drivers:", error);
      }
    };
    fetchDrivers();
  }, [profile, token]);

  // --- UPDATED: Fetch vehicles based on user role ---
  const fetchVehicles = useCallback(async () => {
    if (!token || !profile) return;
    setLoading(true);

    // Determine the correct API endpoint based on the user's role
    const endpoint =
      profile.role === "admin"
        ? "/api/v1/vehicle/admin/vehicles/"
        : "/api/v1/vehicle/driver/vehicles/";

    try {
      const api = createApiClient();
      const response = await api.get(endpoint);
      setVehicles(response.data.results || response.data || []);
    } catch (error) {
      console.error("Error fetching vehicles:", error);
      Swal.fire("Error", "Could not load vehicle data.", "error");
    } finally {
      setLoading(false);
    }
  }, [token, profile]);

  useEffect(() => {
    fetchVehicles();
  }, [fetchVehicles]);

  const resetForm = () => {
    setFormData(initialFormState);
    setEditingVehicle(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    setFormData((prev) => ({ ...prev, license: e.target.files[0] }));
  };

  const handleSelectChange = (selectedOption) => {
    setFormData((prev) => ({ ...prev, driver: selectedOption }));
  };

  // --- UPDATED: handleSubmit to use the correct endpoint ---
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (profile?.role === "admin" && !formData.driver && !editingVehicle) {
      Swal.fire(
        "Driver Required",
        "As an admin, you must select a driver when creating a new vehicle.",
        "error"
      );
      return;
    }

    const payload = new FormData();
    payload.append("model", formData.model);
    payload.append("plate_number", formData.plate_number);
    payload.append("type", formData.type);

    // Only admins can and should send the driver field
    if (profile?.role === "admin" && formData.driver) {
      payload.append("driver", formData.driver.value);
    }

    if (formData.license && formData.license instanceof File) {
      payload.append("license", formData.license);
    }

    const api = createApiClient();
    // Use the role-specific endpoint for creating, but the general one for updating
    const createEndpoint =
      profile.role === "admin"
        ? "/api/v1/vehicle/admin/vehicles/"
        : "/api/v1/vehicle/driver/vehicles/";

    const url = editingVehicle
      ? `/api/v1/vehicle/vehicles/${editingVehicle.id}/`
      : createEndpoint;
    const method = editingVehicle ? "patch" : "post";

    try {
      await api[method](url, payload, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      Swal.fire(
        "Success!",
        `Vehicle ${editingVehicle ? "updated" : "added"} successfully.`,
        "success"
      );
      resetForm();
      fetchVehicles();
    } catch (error) {
      const errorData = error.response?.data;
      const errorMsg =
        Object.values(errorData).flat().join(" ") || "An error occurred.";
      Swal.fire("Submission Error", errorMsg, "error");
    }
  };
  const handleEdit = (vehicle) => {
    setEditingVehicle(vehicle);
    setFormData({
      model: vehicle.model,
      plate_number: vehicle.plate_number,
      type: vehicle.type,
      license: null,
      // If admin, pre-fill the driver dropdown
      driver: driverOptions.find((opt) => opt.value === vehicle.driver) || null,
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
    });

    if (result.isConfirmed) {
      try {
        const api = createApiClient();
        await api.delete(`/api/v1/vehicle/vehicles/${id}/`);
        Swal.fire("Deleted!", "The vehicle has been deleted.", "success");
        fetchVehicles();
      } catch (error) {
        Swal.fire("Error", "Failed to delete the vehicle.", "error");
      }
    }
  };

  // --- RENDER LOGIC (UI is mostly the same, just controlled by `profile.role`) ---
  return (
    <div className="p-3 md:p-6 w-full px-5">
      <div className="w-full py-4 px-5 bg-gray-100 pb-14 rounded-md">
        <h1 className="text-2xl font-bold text-gray-800 mb-6 border-b pb-4 flex items-center gap-3">
          <span className="p-2 rounded-full bg-gray-300">
            <FaCar />
          </span>{" "}
          <span className="text-xl font-Ray_black text-gray-600">
            {editingVehicle ? "ویرایش وسیله نقلیه" : "مدیریت وسایل نقلیه"}{" "}
          </span>{" "}
        </h1>

        {/* --- The Form --- */}
        <form
          onSubmit={handleSubmit}
          className="max-w-2xl mx-auto space-y-6 bg-white p-6 rounded-lg"
        >
          {/* The "Assign to Driver" dropdown is now correctly shown only for Admins */}
          {profile?.role === "admin" && (
            <div>
              <label className="block mb-2 font-medium">تعیین به راننده</label>
              <Select
                name="driver"
                options={driverOptions}
                value={formData.driver}
                onChange={handleSelectChange}
                styles={selectStyles}
                placeholder="Select a driver..."
                isLoading={!driverOptions.length}
              />
            </div>
          )}

          {/* All other form fields are the same for both roles */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block mb-2 font-medium">مدل وسایط</label>
              <input
                name="model"
                value={formData.model}
                onChange={handleInputChange}
                className="w-full input-field"
                placeholder="e.g., Toyota Corolla"
                required
              />
            </div>
            <div>
              <label className="block mb-2 font-medium">شماره پلیت</label>
              <input
                name="plate_number"
                value={formData.plate_number}
                onChange={handleInputChange}
                className="w-full input-field"
                placeholder="e.g., 4-12345"
                required
              />
            </div>
          </div>
          <div>
            <label className="block mb-2 font-medium">نوع وسیله نقلیه</label>
            <select
              name="type"
              value={formData.type}
              onChange={handleInputChange}
              className="w-full input-field"
            >
              <option value="economy">اقتصادی</option>
              <option value="luxury">لوکس</option>
              <option value="suv">SUV</option>
              <option value="van">وان</option>
              <option value="electric">برقی</option>
            </select>
          </div>
          <div>
            <label className="block mb-2 font-medium">
              {editingVehicle
                ? "بارگذاری جواز رانندگی جدید (اختیاری)"
                : "اسکن جواز رانندگی"}
            </label>
            <input
              type="file"
              name="license"
              onChange={handleFileChange}
              className="w-full file-input"
              required={!editingVehicle}
            />
            {editingVehicle && (
              <p className="text-xs text-gray-500 mt-1">
                خالی بگذارید تا جواز فعلی حفظ شود.
              </p>
            )}
          </div>
          <div className="flex justify-center gap-4 pt-4">
            <button type="submit" className="primary-btn">
              {editingVehicle
                ? "به‌روزرسانی وسیله نقلیه"
                : "افزودن وسیله نقلیه"}
            </button>
            {editingVehicle && (
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

        {/* --- The Table --- */}
        <div className="w-full mx-auto bg-white mt-10 border border-gray-200 overflow-x-auto rounded-lg">
          <h3 className="text-xl text-center font-bold p-4 bg-gray-50 border-b">
            {profile?.role === "admin"
              ? "تمام وسایط ثبت‌شده"
              : "وسایط ثبت‌شده من"}
          </h3>
          <table className="w-full text-sm text-center text-gray-500">
            <thead className="text-base text-gray-700 uppercase bg-gray-300">
              <tr>
                <th scope="col" className="px-6 py-3">
                  مدل
                </th>
                <th scope="col" className="px-6 py-3">
                  شماره پلیت
                </th>
                <th scope="col" className="px-6 py-3">
                  نوع
                </th>
                {/* Driver column is only shown to Admins */}
                {profile?.role === "admin" && (
                  <th scope="col" className="px-6 py-3">
                    راننده
                  </th>
                )}
                <th scope="col" className="px-6 py-3 text-center">
                  عملیات
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td
                    colSpan={profile?.role === "admin" ? 5 : 4}
                    className="text-center py-10"
                  >
                    <Loader2 className="h-8 w-8 animate-spin mx-auto text-blue-600" />
                  </td>
                </tr>
              ) : vehicles.length > 0 ? (
                vehicles.map((vehicle,index) => (
                  <tr
                    key={vehicle.id}
                    className={`border-b hover:bg-gray-50 ${
                      index % 2 === 0 ? "bg-gray-100" : ""
                    } `}
                  >
                    <td className="px-6 py-4 font-medium">{vehicle.model}</td>
                    <td className="px-6 py-4">{vehicle.plate_number}</td>
                    <td className="px-6 py-4 capitalize">{vehicle.type}</td>
                    {profile?.role === "admin" && (
                      <td className="px-6 py-4">{vehicle.driver_name}</td>
                    )}
                    <td className="px-6 py-4 flex items-center justify-center gap-4">
                      <button
                        onClick={() => handleEdit(vehicle)}
                        className="text-blue-600 hover:text-blue-800"
                        title="Edit Vehicle"
                      >
                        <FaRegEdit size={20} />
                      </button>
                      <button
                        onClick={() => handleDelete(vehicle.id)}
                        className="text-red-600 hover:text-red-800"
                        title="Delete Vehicle"
                      >
                        <IoTrashSharp size={20} />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={profile?.role === "admin" ? 5 : 4}
                    className="text-center py-10 text-gray-500"
                  >
                    هیچ وسیله نقلیه‌ای یافت نشد.
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
