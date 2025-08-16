import React, { useState, useEffect, useRef } from "react";
import { FiSearch } from "react-icons/fi";
import { X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { FaTaxi } from "react-icons/fa";

const SearchBar = ({ searchQuery, setSearchQuery }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [inputValue, setInputValue] = useState(searchQuery);
  const [recentSearches, setRecentSearches] = useState([]);
  const modalRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handler = setTimeout(() => {
      if (inputValue !== searchQuery) {
        setSearchQuery(inputValue);
        if (inputValue.trim() !== "") {
          navigate("/");
        }
      }
    }, 300);
    return () => clearTimeout(handler);
  }, [inputValue, searchQuery, setSearchQuery, navigate]);

  useEffect(() => {
    setInputValue(searchQuery);
  }, [searchQuery]);

  useEffect(() => {
    const savedSearches =
      JSON.parse(localStorage.getItem("recentSearches")) || [];
    setRecentSearches(savedSearches);
  }, []);

  useEffect(() => {
    localStorage.setItem("recentSearches", JSON.stringify(recentSearches));
  }, [recentSearches]);

  const handleSearchClick = () => setIsExpanded(true);
  const handleCancelClick = () => {
    setIsExpanded(false);
    setInputValue(searchQuery);
  };
  const handleClearInput = () => setInputValue("");

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const trimmedValue = inputValue.trim();
    if (trimmedValue && !recentSearches.includes(trimmedValue)) {
      setRecentSearches((prev) => [trimmedValue, ...prev.slice(0, 4)]);
    }
    setSearchQuery(trimmedValue);
    setIsExpanded(false);
  };

  const handleSuggestionClick = (term) => {
    setInputValue(term);
    setSearchQuery(term);
    setIsExpanded(false);
    navigate("/");
  };

  useEffect(() => {
    document.body.style.overflow = isExpanded ? "hidden" : "auto";
    return () => (document.body.style.overflow = "auto");
  }, [isExpanded]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (modalRef.current && !modalRef.current.contains(e.target)) {
        setIsExpanded(false);
        setInputValue(searchQuery);
      }
    };
    if (isExpanded) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isExpanded]);

  const constantItems = [
    "تویوتا کرولا",
    "موتر شاسی بلند",
    "موتر لوکس",
    "کرایه برای عروسی",
    "کرایه روزانه",
    "انتقال از میدان هوایی",
  ];

  const backdropVariants = { hidden: { opacity: 0 }, visible: { opacity: 1 } };

  return (
    <div className={`relative ${isExpanded ? "w-full" : ""}`}>
      <div
        className="flex items-center gap-2 bg-white border hover:bg-gray-300 rounded-full px-1.5 md:px-4 py-1.5 transition-all duration-300 cursor-pointer"
        onClick={handleSearchClick}
      >
        <FiSearch size={24} className="text-primary" />
        <span className="hidden md:block bg-transparent outline-none w-32 text-gray-500 text-sm truncate">
          {searchQuery || "جستجوی موتر یا محل..."}
        </span>
      </div>

      <AnimatePresence>
        {isExpanded && (
          <>
            <motion.div
              className="fixed inset-0 bg-black/50 z-30"
              variants={backdropVariants}
              initial="hidden"
              animate="visible"
              exit="hidden"
              onClick={handleCancelClick}
            />
            <motion.div
              ref={modalRef}
              className="fixed top-0 left-0 right-0 px-8 pb-20 py-3 bg-white w-full z-40"
              initial={{ y: -30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -30, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <div className="md:flex justify-between items-center border-gray-200 px-4">
                <div className="flex items-center justify-between gap-x-1 mb-3 md:mb-0">
                  <div to="/" className="flex items-center gap-x-3">
                    {/* Replaced text with logo */}
                    <FaTaxi className="text-2xl " />
                    <p className="text-2xl font-bold">کابل سنپ</p>
                  </div>
                  <button
                    onClick={handleCancelClick}
                    className="md:hidden py-2 text-gray-800 font-semibold hover:text-gray-500 text-lg transition"
                  >
                    لغو
                  </button>
                </div>
                <form
                  onSubmit={handleSearchSubmit}
                  className="relative flex items-center gap-2 hover:bg-gray-300 bg-gray-200 border rounded-full px-4 py-2 transition-all duration-300"
                >
                  <FiSearch
                    size={24}
                    className="text-gray-500 hidden md:block"
                  />
                  <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder="موتر، مدل یا محل کرایه را جستجو کنید..."
                    className="flex bg-transparent w-[800px] outline-none text-gray-800"
                    autoFocus
                  />
                  {inputValue && (
                    <button
                      type="button"
                      onClick={handleClearInput}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-800"
                    >
                      <X size={20} />
                    </button>
                  )}
                </form>
                <button
                  onClick={handleCancelClick}
                  className="hidden md:block py-2 text-gray-800 font-semibold hover:text-gray-500 text-lg transition"
                >
                  لغو
                </button>
              </div>

              <div className="md:w-[850px] mx-auto mt-6">
                <h4 className="text-gray-500 text-md font-semibold p-4">
                  جستجوهای محبوب
                </h4>
                <ul className="flex items-center flex-wrap gap-4 mb-4 px-4">
                  {constantItems.map((item, index) => (
                    <li
                      key={index}
                      onClick={() => handleSuggestionClick(item)}
                      className="text-black text-base py-1.5 hover:bg-gray-300 px-5 rounded-full bg-gray-200 cursor-pointer"
                    >
                      {item}
                    </li>
                  ))}
                </ul>
                {recentSearches.length > 0 && (
                  <>
                    <h4 className="text-gray-500 text-md font-semibold p-4">
                      جستجوهای اخیر
                    </h4>
                    <ul className="flex items-center flex-wrap gap-4 mb-4 px-4">
                      {recentSearches.map((item, index) => (
                        <li
                          key={index}
                          onClick={() => handleSuggestionClick(item)}
                          className="text-black text-base py-1.5 hover:bg-gray-300 px-5 rounded-full bg-gray-100 cursor-pointer"
                        >
                          {item}
                        </li>
                      ))}
                    </ul>
                  </>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SearchBar;
