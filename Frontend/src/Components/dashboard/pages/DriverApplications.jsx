// src/Components/dashboard/pages/DriverApplications.jsx

import React, { useState, useEffect, useCallback } from "react";
import Swal from "sweetalert2";
import axios from "axios";
import { store } from "../../../state/store";
import { Loader2 } from "lucide-react";
import { FaUserCheck, FaUserTimes, FaShieldAlt } from "react-icons/fa";

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
    pending: "bg-yellow-100 text-yellow-800",
    approved: "bg-green-100 text-green-700",
    denied: "bg-red-100 text-red-700",
  };
  const style =
    statusStyles[status?.toLowerCase()] || "bg-gray-100 text-gray-700";
  const statusText = status
    ? status.charAt(0).toUpperCase() + status.slice(1)
    : "Unknown";
  return (
    <span
      className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ${style}`}
    >
      {statusText}
    </span>
  );
};

export default function DriverApplications() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchApplications = useCallback(async () => {
    setLoading(true);
    const api = createApiClient();
    try {
      const response = await api.get("/api/v1/vehicle/admin/applications/");
      setApplications(response.data.results || response.data || []);
    } catch (error) {
      Swal.fire("Error", "Could not load applications.", "error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  const handleReview = async (applicationId, newStatus) => {
    const api = createApiClient();
    try {
      await api.patch(`/api/v1/vehicle/admin/applications/${applicationId}/`, {
        status: newStatus,
      });
      Swal.fire("Success", `Application has been ${newStatus}.`, "success");
      fetchApplications();
    } catch (error) {
      Swal.fire("Error", "Could not update application status.", "error");
    }
  };

  return (
    <div className="p-3 md:p-6 w-full">
      <div className="bg-white p-6 rounded-lg">
        <h1 className="text-2xl font-bold text-gray-800 mb-6 border-b pb-4 flex items-center gap-3">
          <span className="p-2 rounded-full bg-gray-300">
            <FaShieldAlt />
          </span>{" "}
          <span className="text-xl font-Ray_black text-gray-600">
            درخواست‌های راننده
          </span>{" "}
        </h1>
        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
            </div>
          ) : (
            <table className="w-full text-sm text-center text-gray-500">
              <thead className="text-base text-gray-700 uppercase bg-gray-300">
                <tr>
                  <th className="px-6 py-3">متقاضی</th>
                  <th className="px-6 py-3">شماره گواهی‌نامه</th>
                  <th className="px-6 py-3">تجربه</th>
                  <th className="px-6 py-3 text-center">وضعیت</th>
                  <th className="px-6 py-3 text-center">عملیات</th>
                </tr>
              </thead>
              <tbody>
                {applications.length > 0 ? (
                  applications.map((app, index) => (
                    <tr
                      key={app.id}
                      className={`border-b hover:bg-gray-50 ${
                        index % 2 === 0 ? "bg-gray-100" : ""
                      } `}
                    >
                      <td className="px-6 py-4 font-medium">
                        {app.applicant_name}
                        <br />
                        <span className="text-xs text-gray-500">
                          {app.applicant_email}
                        </span>
                      </td>
                      <td className="px-6 py-4">{app.license_number}</td>
                      <td className="px-6 py-4">
                        {app.years_of_experience} years
                      </td>
                      <td className="px-6 py-4 text-center">
                        <StatusBadge status={app.status} />
                      </td>
                      <td className="px-6 py-4 text-center">
                        {app.status === "pending" && (
                          <div className="flex justify-center gap-2">
                            <button
                              onClick={() => handleReview(app.id, "approved")}
                              className="action-btn-green flex items-center gap-1"
                            >
                              <FaUserCheck /> تأیید
                            </button>
                            <button
                              onClick={() => handleReview(app.id, "denied")}
                              className="action-btn-red flex items-center gap-1"
                            >
                              <FaUserTimes /> رد کردن
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="text-center py-16 text-gray-500">
                      درخواستی در حال انتظار یافت نشد.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
