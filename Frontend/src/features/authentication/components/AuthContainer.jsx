import React, { useState } from "react";
import SignUpPage from "./Signup";
import LoginPage from "./Signin";
import { FaGoogle, FaFacebook, FaGithub, FaLinkedinIn } from "react-icons/fa";

const AuthContainer = () => {
  const [isActive, setIsActive] = useState(false);

  const toggleActive = () => {
    setIsActive(!isActive);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-r from-gray-200 to-indigo-100">
      <div
        className={`relative bg-white rounded-3xl shadow-xl w-full max-w-4xl min-h-[480px] overflow-hidden ${
          isActive ? "active" : ""
        }`}
      >
        {/* Sign Up Form */}
        <div
          className={`absolute top-0 h-full w-1/2 transition-all duration-700 ease-in-out ${
            isActive
              ? "left-0 opacity-100 z-20"
              : "left-0 opacity-0 z-10 pointer-events-none"
          }`}
        >
          <div className="h-full flex items-center justify-center px-10">
            <SignUpPage />
          </div>
        </div>

        {/* Sign In Form */}
        <div
          className={`absolute top-0 h-full w-1/2 transition-all duration-700 ease-in-out ${
            isActive
              ? "left-0 opacity-0 z-10 pointer-events-none"
              : "left-0 opacity-100 z-20"
          }`}
        >
          <div className="h-full flex items-center justify-center px-10">
            <LoginPage />
          </div>
        </div>

        {/* Toggle Container */}
        <div
          className={`absolute top-0 left-1/2 w-1/2 h-full overflow-hidden transition-all duration-700 ease-in-out z-30 ${
            isActive
              ? "-translate-x-full rounded-r-[150px] rounded-l-none"
              : "rounded-l-[150px]"
          }`}
        >
          <div
            className={`relative h-full w-[200%] bg-gradient-to-r from-indigo-500 to-indigo-700 text-white transition-transform duration-700 ${
              isActive ? "translate-x-1/2" : "translate-x-0"
            }`}
          >
            {/* Welcome Back Panel */}
            <div
              className={`absolute w-1/2 h-full flex flex-col items-center justify-center px-8 text-center transition-all duration-700 ${
                isActive ? "translate-x-0" : "-translate-x-[200%]"
              }`}
            >
              <h1 className="text-2xl font-bold mb-4">Welcome Back!</h1>
              <p className="text-sm mb-6">
                Enter your personal details to use all of site features
              </p>
              <button
                onClick={toggleActive}
                className="bg-transparent border border-white text-white text-sm font-semibold uppercase px-8 py-2 rounded-md"
              >
                Sign In
              </button>
            </div>

            {/* Register Panel */}
            <div
              className={`absolute right-0 w-1/2 h-full flex flex-col items-center justify-center px-8 text-center transition-all duration-700 ${
                isActive ? "translate-x-[200%]" : "translate-x-0"
              }`}
            >
              <h1 className="text-2xl font-bold mb-4">Hello, Friend!</h1>
              <p className="text-sm mb-6">
                Register with your personal details to use all of site features
              </p>
              <button
                onClick={toggleActive}
                className="bg-transparent border border-white text-white text-sm font-semibold uppercase px-8 py-2 rounded-md"
              >
                Sign Up
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthContainer;
