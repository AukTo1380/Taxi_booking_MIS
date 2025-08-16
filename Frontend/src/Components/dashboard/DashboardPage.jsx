import React, { useState } from "react";
import Sidebar from "./Sidebar";
import MainContent from "./MainContent";
import { FaSearch, FaUser } from "react-icons/fa";
import { useSelector } from "react-redux";
import { AnimatePresence, motion } from "framer-motion";

const BASE_URL = import.meta.env.VITE_BASE_URL || "http://127.0.0.1:8000";

const DashboardPage = () => {
  const [activeComponent, setActiveComponent] = useState("dashboard");
  const [isFocused, setIsFocused] = useState(false);
  const { profile, loading } = useSelector((state) => state.user);

  const fullProfilePhotoUrl =
    profile?.profile_photo && !profile.profile_photo.startsWith("http")
      ? `${BASE_URL}${profile.profile_photo}`
      : profile?.profile_photo;

  if (loading && !profile) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        Loading...
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        Could not load profile. Please log in again.
      </div>
    );
  }

  return (
    <div className="flex h-screen w-full overflow-hidden bg-white">
      <Sidebar
        setActiveComponent={setActiveComponent}
        activeComponent={activeComponent}
      />
      <div className="flex flex-col flex-1 h-screen overflow-hidden">
        <header className="bg-white py-2 w-full flex items-center justify-between px-4 shadow-sm border-b">
          <div className="relative flex items-center">
            <FaSearch className="absolute left-3 text-gray-500 text-base pointer-events-none" />
            <input
              type="text"
              placeholder="Search..."
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              className={`pl-10 py-1.5 pr-5 rounded-full border border-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all duration-300 ease-in-out ${
                isFocused ? "w-60" : "w-48"
              } bg-gray-50`}
            />
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 cursor-pointer">
              <AnimatePresence mode="wait">
                <motion.div
                  key="profile"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center gap-2"
                >
                  {fullProfilePhotoUrl ? (
                    <img
                      src={fullProfilePhotoUrl}
                      alt="User"
                      className="w-8 h-8 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center">
                      <FaUser className="text-gray-600" />
                    </div>
                  )}
                  <span className="font-semibold text-gray-600">
                    {`${profile.first_name} ${profile.last_name}`}
                  </span>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto">
          <MainContent activeComponent={activeComponent} />
        </main>
      </div>
    </div>
  );
};

export default DashboardPage;
