import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import ServicesCard from "../Components/Services/ServicesCard";
import Box from "@mui/material/Box";
import Masonry from "@mui/lab/Masonry";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";

const BASE_URL = import.meta.env.VITE_BASE_URL;

function Services() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;
  const navigate = useNavigate();

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const response = await axios.get(`${BASE_URL}/common/categories/`);
        setServices(response.data);
      } catch (err) {
        setError("عدم توانایی در بارگذاری خدمات");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchServices();
  }, []);

  // Scroll to top when the page changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [currentPage]);

  if (loading)
    return (
      <div className="w-full h-[300px] lg:h-[500px] flex items-center justify-center text-gray-500">
        <div className="flex items-center justify-center space-x-2">
          <div className="w-8 h-8 border-4 border-blue-500 border-dashed rounded-full animate-spin"></div>
          <span>در حال بارگذاری...</span>
        </div>
      </div>
    );

  if (error)
    return <div className="text-center text-red-500 mt-10">{error}</div>;

  // Pagination logic
  const totalPages = Math.ceil(services.length / itemsPerPage);
  const paginatedServices = services.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <section className="container mx-auto px-10 py-10">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
          محصولات ما
        </h1>
      </div>

      {services.length === 0 ? (
        <div className="text-center text-gray-500 dark:text-gray-100">
          هیچ محصولی یافت نشد
        </div>
      ) : (
        <>
          <Box sx={{ width: "100%", minHeight: 400 }}>
            <Masonry columns={{ xs: 1, sm: 2, md: 3, lg: 5 }} spacing={2}>
              {paginatedServices.map((service, index) => (
                <div
                  key={service.id}
                  onClick={() => navigate(`/services/${service.id}`)}
                >
                  <ServicesCard
                    service={service}
                    height={index % 3 === 0 ? "300px" : "350px"}
                  />
                </div>
              ))}
            </Masonry>
          </Box>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center space-x-2 mt-6">
              <button
                className={`px-3 py-1 text-sm flex items-center gap-x-1 ml-1.5 rounded-md border shadow-sm ${
                  currentPage === 1
                    ? "cursor-not-allowed text-gray-400 bg-gray-200"
                    : "text-gray-100 bg-green hover:bg-green-700"
                }`}
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              >
                <FaChevronRight /> قبلی
              </button>

              {[...Array(totalPages).keys()].map((num) => (
                <button
                  key={num + 1}
                  className={`px-3 py-1 text-sm rounded-md border shadow-md ${
                    currentPage === num + 1
                      ? "bg-green text-white border-green"
                      : "bg-white text-gray-700 hover:bg-gray-100"
                  }`}
                  onClick={() => setCurrentPage(num + 1)}
                >
                  {num + 1}
                </button>
              ))}

              <button
                className={`px-3 py-1 text-sm flex items-center gap-x-1 rounded-md border shadow-sm ${
                  currentPage === totalPages
                    ? "cursor-not-allowed text-gray-400 bg-gray-200"
                    : "text-gray-100 bg-green hover:bg-green-700"
                }`}
                disabled={currentPage === totalPages}
                onClick={() =>
                  setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                }
              >
                بعدی <FaChevronLeft />
              </button>
            </div>
          )}
        </>
      )}
    </section>
  );
}

export default Services;
