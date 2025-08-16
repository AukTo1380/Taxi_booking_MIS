// src/Pages/BecomeADriver.jsx
import React, { useState } from "react";
import Swal from "sweetalert2";
import { Loader2 } from "lucide-react";
import axios from "axios";
import { store } from "../state/store";
import { Link } from "react-router-dom";

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

export default function BecomeADriverPage() {
  const [formData, setFormData] = useState({
    license_number: "",
    years_of_experience: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    const api = createApiClient();
    try {
      await api.post("/api/v1/vehicle/driver/apply/", formData);
      Swal.fire(
        "Application Submitted!",
        "An admin will review your application shortly.",
        "success"
      );
      setSubmitted(true);
    } catch (error) {
      const errorMsg =
        error.response?.data?.detail ||
        "Failed to submit application. You may have already applied.";
      Swal.fire("Submission Error", errorMsg, "error");
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="p-8 bg-gray-50 min-h-screen flex items-center justify-center">
        <div className="max-w-md mx-auto bg-white p-8 rounded-lg shadow-md text-center">
          <h1 className="text-2xl font-bold text-green-600 mb-4">Thank You!</h1>
          <p className="text-gray-700">
            Your application has been received. We will review it and get back
            to you soon.
          </p>
          <Link to="/dashboard" className="primary-btn mt-6 inline-block">
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <div className="max-w-md mx-auto bg-white p-8 rounded-lg shadow-md">
        <h1 className="text-2xl font-bold text-center mb-6 text-gray-800">
          Become a Driver
        </h1>
        <p className="text-center text-gray-600 mb-6">
          Fill out the form below to start the application process.
        </p>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="license_number" className="block mb-2 font-medium">
              Driver's License Number
            </label>
            <input
              type="text"
              name="license_number"
              value={formData.license_number}
              onChange={handleChange}
              required
              className="w-full input-field"
              placeholder="e.g., A12345678"
            />
          </div>
          <div>
            <label
              htmlFor="years_of_experience"
              className="block mb-2 font-medium"
            >
              Years of Driving Experience
            </label>
            <input
              type="number"
              name="years_of_experience"
              value={formData.years_of_experience}
              onChange={handleChange}
              required
              className="w-full input-field"
              placeholder="e.g., 5"
            />
          </div>
          <button
            type="submit"
            className="primary-btn w-full flex items-center justify-center"
            disabled={submitting}
          >
            {submitting ? (
              <Loader2 className="animate-spin" />
            ) : (
              "Submit Application"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
