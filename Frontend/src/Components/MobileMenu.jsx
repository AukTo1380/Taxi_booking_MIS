import React, { useEffect } from "react";
import { motion } from "framer-motion";
import { X, User } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { FaTaxi } from "react-icons/fa";

const mobileMenuVariants = {
  hidden: { x: "100%" }, // slide from right
  visible: { x: 0, transition: { duration: 0.3, ease: "easeInOut" } },
  exit: { x: "100%", transition: { duration: 0.2, ease: "easeIn" } },
};

const MobileMenu = ({
  isMobileMenuOpen,
  setMobileMenuOpen,
  navbarItems,
  setIsMobileCategoryOpen,
}) => {
  const navigate = useNavigate();

  // Prevent body scroll when menu is open
  useEffect(() => {
    document.body.style.overflow = isMobileMenuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMobileMenuOpen]);

  return (
    <>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={() => setMobileMenuOpen(false)}
        className="fixed inset-0 bg-black/50 z-40"
      />

      {/* Side Menu */}
      <motion.div
        dir="rtl"
        variants={mobileMenuVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        className="fixed top-0 right-0 h-full w-4/5 max-w-sm bg-gradient-to-b from-indigo-50 to-white z-50 p-6 border-l border-indigo-100"
      >
        {/* Top Logo and Controls */}
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-x-2">
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="p-1 text-primary"
            >
              <X size={24} />
            </button>
            <Link
              to="/account"
              className="p-2 text-primary transition-colors duration-200"
            >
              <User size={24} />
            </Link>
          </div>
          <Link
            to="/"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-x-3"
          >
            {/* Replaced text with logo */}
            <FaTaxi className="text-2xl " />
            <p className="text-2xl font-bold">کابل سنپ</p>
          </Link>
        </div>

        {/* Navigation Items */}
        <nav className="flex flex-col space-y-2">
          {navbarItems.map((item, index) => (
            <div key={index}>
              <div
                className="flex items-center justify-between text-gray-700 pr-4 py-2.5 bg-gray-200 hover:bg-primary hover:text-white rounded-lg transition-colors duration-150 cursor-pointer"
                onClick={() => {
                  if (item.isCategory) {
                    setIsMobileCategoryOpen((prev) => !prev);
                  } else {
                    navigate(item.path);
                    setMobileMenuOpen(false);
                  }
                  scrollTo(0, 0);
                }}
              >
                <span>{item.name}</span>
              </div>
            </div>
          ))}
        </nav>
      </motion.div>
    </>
  );
};

export default MobileMenu;
