// src/Components/dashboard/pages/LocationManagement.jsx

import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { FaRegEdit, FaMapMarkedAlt } from "react-icons/fa";
import { IoTrashSharp } from "react-icons/io5";
import { useSelector } from "react-redux";
import { Loader2, ChevronLeft, ChevronRight } from "lucide-react";
import { store } from "../../../state/store";

const BASE_URL = import.meta.env.VITE_BASE_URL || "http://127.0.0.1:8000";

// Reusable API client
const createApiClient = () => {
  const api = axios.create({ baseURL: BASE_URL });
  api.interceptors.request.use((config) => {
    const token = store.getState().user.accessToken;
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  });
  return api;
};

export default function LocationManagement() {
  const token = useSelector((state) => state.user.accessToken);
  const [locations, setLocations] = useState([]);
  const [name, setName] = useState("");
  const [editingLocation, setEditingLocation] = useState(null);
  const [loading, setLoading] = useState(true);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const PAGE_SIZE = 10;

  const fetchLocations = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const api = createApiClient();
      const response = await api.get("/api/v1/vehicle/locations/", {
        params: { page: currentPage, page_size: PAGE_SIZE },
      });

      const locationsData = Array.isArray(response.data.results)
        ? response.data.results
        : response.data;
      const count =
        response.data.count !== undefined
          ? response.data.count
          : locationsData.length;

      setLocations(locationsData);
      setTotalPages(Math.ceil(count / PAGE_SIZE));
    } catch (error) {
      console.error("Error fetching locations:", error);
      Swal.fire("Error", "Could not fetch locations.", "error");
    } finally {
      setLoading(false);
    }
  }, [token, currentPage]);

  useEffect(() => {
    fetchLocations();
  }, [fetchLocations]);

  const resetForm = () => {
    setName("");
    setEditingLocation(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = { name };
    const api = createApiClient();

    const url = editingLocation
      ? `/api/v1/vehicle/locations/${editingLocation.id}/`
      : "/api/v1/vehicle/locations/";
    const method = editingLocation ? "put" : "post";

    try {
      await api[method](url, data);
      Swal.fire({
        icon: "success",
        title: "Success!",
        text: `Location ${editingLocation ? "updated" : "added"} successfully.`,
      });
      resetForm();
      fetchLocations();
    } catch (error) {
      const errorMsg = error.response?.data?.name?.[0] || "An error occurred.";
      Swal.fire("Error", errorMsg, "error");
    }
  };

  const handleEdit = (location) => {
    setEditingLocation(location);
    setName(location.name);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "This will be permanently deleted!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
    });

    if (result.isConfirmed) {
      try {
        const api = createApiClient();
        await api.delete(`/api/v1/vehicle/locations/${id}/`);
        Swal.fire("Deleted!", "The location has been deleted.", "success");
        fetchLocations();
      } catch (error) {
        Swal.fire("Error", "Failed to delete the location.", "error");
      }
    }
  };

  return (
    <div className="p-3 md:p-6 w-full px-5">
      <div className="w-full py-4 px-5  bg-white pb-14 rounded-md">
        <h1 className="text-2xl font-bold text-gray-800 mb-6 border-b pb-4 flex items-center gap-3">
          <span className="p-2 rounded-full bg-gray-300">
            <FaMapMarkedAlt />{" "}
          </span>{" "}
          <span className="text-xl font-Ray_black text-gray-600">
            {editingLocation ? "ویرایش مکان" : "افزودن مکان جدید"}
          </span>{" "}
        </h1>

        <form
          onSubmit={handleSubmit}
          className="max-w-xl mx-auto flex flex-col md:flex-row items-center gap-4"
        >
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g., Central Airport"
            className="w-full input-field1"
            required
          />
          <div className="flex items-center gap-4">
            <button
              type="submit"
              className="rounded-md border border-transparent bg-primary px-8 py-3 text-base font-medium text-white hover:bg-white hover:border hover:border-primary hover:text-primary focus:outline-none cursor-pointer  transition-colors duration-500 whitespace-nowrap"
            >
              {editingLocation ? "Update" : "Add"}
            </button>
            {editingLocation && (
              <button
                type="button"
                onClick={resetForm}
                className="secondry-btn"
              >
                لغو
              </button>
            )}
          </div>
        </form>

        <div
          id="location-table"
          className="w-full max-w-2xl mx-auto bg-white mt-10 border border-gray-200 overflow-x-auto"
        >
          <table className="w-full text-sm text-center text-gray-500">
            <thead className="text-base text-gray-700 uppercase bg-gray-300">
              <tr>
                <th scope="col" className="px-6 py-3">
                  نام مکان
                </th>
                <th scope="col" className="px-6 py-3 text-center">
                  عملیات
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="2" className="text-center py-10">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto text-blue-600" />
                  </td>
                </tr>
              ) : Array.isArray(locations) && locations.length > 0 ? (
                locations.map((location , index) => (
                  <tr
                    key={location.id}
                    className={`border-b hover:bg-gray-50 ${
                      index % 2 === 0 ? "bg-gray-100" : ""
                    } `}
                  >
                    <td className="px-6 py-4 font-medium text-gray-900">
                      {location.name}
                    </td>
                    <td className="px-6 py-4 flex items-center justify-center gap-4">
                      <button
                        onClick={() => handleEdit(location)}
                        className="text-blue-600 hover:text-blue-800"
                        title="Edit Location"
                      >
                        <FaRegEdit size={20} />
                      </button>
                      <button
                        onClick={() => handleDelete(location.id)}
                        className="text-red-600 hover:text-red-800"
                        title="Delete Location"
                      >
                        <IoTrashSharp size={20} />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="2" className="text-center py-10 text-gray-500">
                    No locations have been added yet.
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
