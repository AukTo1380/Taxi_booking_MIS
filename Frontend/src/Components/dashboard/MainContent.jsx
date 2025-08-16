import React from "react";
import { useSelector } from "react-redux";
import Profile from "../../Pages/dashboard/Profiles.jsx";

// Import all possible page components
import VehicleManagement from "./pages/VehicleManagement.jsx";
import LocationManagement from "./pages/LocationManagement.jsx";
import RouteManagement from "./pages/RouteManagement.jsx";
import RequestTrip from "./pages/RequestTrip.jsx";
import MyTrips from "./pages/MyTrips.jsx";
import DriverTripList from "./pages/DriverTripList.jsx";
import AdminTripManagement from "./pages/AdminTripManagement.jsx";
import DriverApplications from "./pages/DriverApplications.jsx";
import UserManagement from "./pages/UserManagement.jsx";
import DriverManagement from "./pages/DriverManagement.jsx";
import AdminDashboard from "./pages/AdminDashboard.jsx"; // Ensure this is imported

const Placeholder = ({ title }) => (
  <div className="p-8">
    <h1 className="text-3xl font-bold">{title}</h1>
  </div>
);

const MainContent = ({ activeComponent }) => {
  const { profile } = useSelector((state) => state.user);

  const isAdmin = profile?.role === "admin";
  const isDriver = profile?.role === "driver";
  const isPassenger = profile?.role === "passenger";

  // --- FIX: The default component for an admin is the new Reporting Dashboard ---
  const getDefaultComponent = () => {
    if (isAdmin) return <AdminDashboard />;
    if (isDriver) return <DriverTripList />;
    if (isPassenger) return <RequestTrip />;
    return <Placeholder title="Dashboard" />;
  };

  const renderContent = () => {
    switch (activeComponent) {
      // Admin Pages
      // --- FIX: The `case` now matches the new sidebar `value` ---
      case "reporting":
        return isAdmin ? <AdminDashboard /> : null;

      // This is the old "dashboard" which we now call Trip Management
      case "trips":
        return isAdmin ? <AdminTripManagement /> : null;

      // All other cases remain the same but let's be explicit
      case "users":
        return isAdmin ? <UserManagement /> : null;
      case "drivers":
        return isAdmin ? <DriverManagement /> : null;
      case "locations":
        return isAdmin ? <LocationManagement /> : null;
      case "routes":
        return isAdmin ? <RouteManagement /> : null;
      case "applications":
        return isAdmin ? <DriverApplications /> : null;

      // Shared Page
      case "vehicles":
        return isAdmin || isDriver ? <VehicleManagement /> : null;

      // Driver Pages
      case "trip-requests":
        return isDriver ? <DriverTripList /> : null;

      // Passenger Pages
      case "request-trip":
        return isPassenger ? <RequestTrip /> : null;
      case "my-trips":
        return isPassenger ? <MyTrips /> : null;

      // Common Page
      case "profile":
        return <Profile />;

      // Default case now correctly handles the logic
      default:
        return getDefaultComponent();
    }
  };

  return <div className="min-h-full bg-gray-100">{renderContent()}</div>;
};

export default MainContent;
