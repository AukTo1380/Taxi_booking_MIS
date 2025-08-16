// src/components/Pagination.jsx

import React from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  // Don't render pagination if there's only one page or less
  if (totalPages <= 1) {
    return null;
  }

  const handlePrevious = () => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (currentPage < totalPages) {
      onPageChange(currentPage + 1);
    }
  };

  // Create an array of page numbers to render
  const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <nav className="flex items-center justify-between border-t border-gray-200 px-4 sm:px-0 mt-5">
      <div className="-mt-px flex w-0 flex-1">
        <button
          onClick={handlePrevious}
          disabled={currentPage === 1}
          className="inline-flex items-center border-t-2 border-transparent pr-1 pt-4 text-sm font-medium text-gray-500 hover:border-gray-300 hover:text-gray-700 disabled:text-gray-300 disabled:cursor-not-allowed"
        >
          <ArrowLeft
            className="mr-3 h-5 w-5 text-gray-400"
            aria-hidden="true"
          />
          Previous
        </button>
      </div>
      <div className="hidden md:-mt-px md:flex">
        {pageNumbers.map((number) => (
          <button
            key={number}
            onClick={() => onPageChange(number)}
            className={`inline-flex items-center border-t-2 px-4 pt-4 text-sm font-medium ${
              currentPage === number
                ? "border-indigo-500 text-indigo-600"
                : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
            }`}
          >
            {number}
          </button>
        ))}
      </div>
      <div className="-mt-px flex w-0 flex-1 justify-end">
        <button
          onClick={handleNext}
          disabled={currentPage === totalPages}
          className="inline-flex items-center border-t-2 border-transparent pl-1 pt-4 text-sm font-medium text-gray-500 hover:border-gray-300 hover:text-gray-700 disabled:text-gray-300 disabled:cursor-not-allowed"
        >
          Next
          <ArrowRight
            className="ml-3 h-5 w-5 text-gray-400"
            aria-hidden="true"
          />
        </button>
      </div>
    </nav>
  );
};

export default Pagination;
