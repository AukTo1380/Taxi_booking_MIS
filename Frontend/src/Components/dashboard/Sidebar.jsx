import React, { useState } from "react";
import {
  FaSignOutAlt,
  FaUser,
  FaCar,
  FaRoute,
  FaMapMarkedAlt,
  FaTaxi,
  FaListAlt,
  FaBars,
  FaTimes,
  FaUserCheck,
  FaUsersCog,
  FaCarAlt,
} from "react-icons/fa";
import { useSelector, useDispatch } from "react-redux";
import { signOutSuccess } from "../../state/userSlice/userSlice";
import { Link, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import { MdDashboard, MdDashboardCustomize } from "react-icons/md"; // A good icon for the reporting dashboard

const Sidebar = ({ setActiveComponent, activeComponent }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const MySwal = withReactContent(Swal);
  const { profile } = useSelector((state) => state.user);
  const [isOpen, setIsOpen] = useState(true); // Default to open on desktop

  const handleSignOut = () => {
    MySwal.fire({
      title: "Are you sure?",
      text: "You will be logged out!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      confirmButtonText: "Yes, sign out!",
    }).then((result) => {
      if (result.isConfirmed) {
        dispatch(signOutSuccess());
        navigate("/sign-in");
      }
    });
  };

 const allMenuItems = [
   // --- ADMIN SECTION ---
   {
     name: "داشبورد",
     value: "dashboard",
     icon: <MdDashboardCustomize />,
     roles: ["admin"],
   },
   {
     name: "مدیریت کاربران",
     value: "users",
     icon: <FaUsersCog />,
     roles: ["admin"],
   },
   {
     name: "مدیریت راننده‌ها",
     value: "drivers",
     icon: <FaCarAlt />,
     roles: ["admin"],
   },
   {
     name: "مدیریت سفرها",
     value: "trips",
     icon: <FaTaxi />,
     roles: ["admin"],
   },
   {
     name: "درخواست‌های راننده",
     value: "applications",
     icon: <FaUserCheck />,
     roles: ["admin"],
   },
   {
     name: "مدیریت وسایل نقلیه",
     value: "vehicles",
     icon: <FaCar />,
     roles: ["admin"],
   },
   {
     name: "مکان‌ها",
     value: "locations",
     icon: <FaMapMarkedAlt />,
     roles: ["admin"],
   },
   {
     name: "مسیرها",
     value: "routes",
     icon: <FaRoute />,
     roles: ["admin"],
   },
   // --- DRIVER SECTION ---
   {
     name: "سفرهای موجود",
     value: "trip-requests",
     icon: <FaListAlt />,
     roles: ["driver"],
   },
   {
     name: "وسایل نقلیه من",
     value: "vehicles",
     icon: <FaCar />,
     roles: ["driver"],
   },
   // --- PASSENGER SECTION ---
   {
     name: "درخواست سفر",
     value: "request-trip",
     icon: <FaTaxi />,
     roles: ["passenger"],
   },
   {
     name: "سفرهای من",
     value: "my-trips",
     icon: <FaListAlt />,
     roles: ["passenger"],
   },
   // --- COMMON SECTION ---
   {
     name: "پروفایل",
     value: "profile",
     icon: <FaUser />,
     roles: ["admin", "driver", "passenger"],
   },
   {
     name: "خروج",
     value: "signout",
     icon: <FaSignOutAlt />,
     roles: ["admin", "driver", "passenger"],
   },
 ];


  const accessibleComponents = allMenuItems.filter((item) =>
    item.roles.includes(profile?.role)
  );

  return (
    <>
      <div
        className={` h-full transition-all duration-300 ease-in-out bg-secondary shadow-lg ${
          isOpen ? "w-[70px] md:w-[80px] lg:w-64" : "w-0"
        } overflow-hidden`}
      >
        <header className="flex items-center justify-center lg:justify-start gap-5 p-5 font-bold text-xl">
          <Link
            to="/"
            className="flex items-center justify-center p-2 bg-gray-300 h-8 w-8 md:h-10 md:w-10 rounded-full"
          >
            <FaTaxi className="text-black" />
          </Link>
          <Link
            to="/"
            className="text-xl font-Ray_black text-black whitespace-nowrap hidden lg:inline"
          >
            YouRide
          </Link>
        </header>

        <ul className="mx-2 mt-4 space-y-1">
          {accessibleComponents.map((component) => (
            <li key={component.value}>
              <a
                onClick={() => {
                  if (component.value === "signout") {
                    handleSignOut();
                  } else {
                    setActiveComponent(component.value);
                  }
                  if (window.innerWidth < 1024) setIsOpen(false);
                }}
                className={`relative flex items-center justify-center lg:justify-start gap-x-3 w-full px-4 rounded-md py-3 transition-all duration-300 cursor-pointer ${
                  activeComponent === component.value
                    ? "bg-gray-200 text-primary" // Active link style
                    : "hover:bg-gray-200 text-black" // Hover style
                }`}
              >
                <span className="text-xl">{component.icon}</span>
                <span className="text-base font-semibold whitespace-nowrap hidden lg:inline">
                  {component.name}
                </span>
              </a>
            </li>
          ))}
        </ul>
      </div>

      {/* Mobile Toggle Buttons */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-5 left-5 z-40 bg-blue-600 text-white p-3 rounded-full shadow-lg block lg:hidden"
        >
          <FaBars size={20} />
        </button>
      )}
      {isOpen && (
        <button
          onClick={() => setIsOpen(false)}
          className="fixed top-2.5 left-2.5 z-40 bg-red-500 text-white p-2 rounded-full shadow-lg block lg:hidden"
        >
          <FaTimes size={16} />
        </button>
      )}
    </>
  );
};

export default Sidebar;