import React, { useState, useEffect } from "react";
import { Search, User, ShoppingBag, Menu, X, Heart } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { toast } from "react-hot-toast";
import { useSelector } from "react-redux";
import SearchBar from "./SearchBar";
import MobileMenu from "./MobileMenu";

import { FaTaxi } from "react-icons/fa";
const navbarItems = [
  { name: "صفحه اصلی", path: "/" }, // Home
  { name: "شهر ها", path: "/city" }, // Category
  { name: "تماس با ما", path: "/contact" }, // Contact Us
  { name: "درباره ما", path: "/about" }, // About Us
];

const BASE_URL = import.meta.env.VITE_BASE_URL || "http://127.0.0.1:8000";
const Header = ({ searchQuery, setSearchQuery }) => {
  const { cartItems } = useSelector((state) => state.user);
  const cartCount = (cartItems || []).reduce((sum, item) => sum + item.qty, 0);
  const navigate = useNavigate();

  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileCategoryOpen, setIsMobileCategoryOpen] = useState(false);
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      <header
        className={`sticky top-0 z-30 bg-primary transition-all duration-300 ${
          isScrolled ? "" : "bg-primary"
        }`}
      >
        <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center lg:hidden">
              <button
                onClick={() => setMobileMenuOpen(true)}
                className="p-2 text-white"
              >
                <Menu size={24} />
              </button>
            </div>

            <div className="flex items-center gap-x-10">
              <div className="items-center hidden md:flex">
                <Link to="/" className="flex items-center gap-x-3">
                  <p className="text-3xl font-Ray_black text-white ">
                    {" "}
                    YouRIDe
                  </p>
                </Link>
              </div>

              <div className="hidden lg:flex lg:items-center gap-x-6 ">
                {navbarItems.map((item, index) => {
                  return (
                    <div key={index} className="">
                      <Link
                        to={item.path}
                        className={`text-lg font-medium ${
                          isScrolled ? "text-white" : "text-white"
                        } hover:text-white/50 transition-colors duration-200`}
                      >
                        {item.name}
                      </Link>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="flex items-center justify-end gap-x-4">
              <SearchBar
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
              />
              <Link
                to="/dashboard"
                className="p-2 text-white border rounded-full hidden lg:block transition-colors duration-200"
              >
                <User size={24} />
              </Link>
              <button
                onClick={() => navigate("/city")}
                className="border py-2 px-4 text-white rounded-md font-semibold"
              >
                درخواست تاکسی
              </button>
            </div>
          </div>
        </nav>
      </header>
      <AnimatePresence>
        {isMobileMenuOpen && (
          <MobileMenu
            isMobileMenuOpen={isMobileMenuOpen}
            setMobileMenuOpen={setMobileMenuOpen}
            navbarItems={navbarItems}
            isMobileCategoryOpen={isMobileCategoryOpen}
            setIsMobileCategoryOpen={setIsMobileCategoryOpen}
          />
        )}
      </AnimatePresence>
    </>
  );
};

export default Header;
