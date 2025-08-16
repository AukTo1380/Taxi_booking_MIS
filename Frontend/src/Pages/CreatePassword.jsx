import React, { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Lock, Loader } from "lucide-react";

const BASE_URL = import.meta.env.VITE_BASE_URL;

function CreateNewPassword() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const otp = searchParams.get("otp");
  const uuidb64 = searchParams.get("uuidb64");
  const refresh_token = searchParams.get("refresh_token");

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!password || !confirmPassword) {
      toast.error("Please fill out both password fields.");
      return;
    }
    if (confirmPassword !== password) {
      toast.error("Passwords do not match");
      return;
    }

    setIsLoading(true);
    const data = { password, otp, uuidb64, refresh_token };

    try {
      await axios.post(`${BASE_URL}/api/v1/auth/user/password-change/`, data);
      toast.success("Password changed successfully! You can now log in.");
      navigate("/sign-in");
    } catch (error) {
      toast.error(
        error.response?.data?.detail ||
          "An error occurred. The link may be invalid or expired."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="w-full h-screen flex justify-center items-center parallax-bg"
      style={{
        backgroundImage: 'url("/1.jpg")',
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundAttachment: "fixed",
      }}
    >
      <div
        className="absolute inset-0 bg-black bg-opacity-60 backdrop-blur-sm"
        style={{ zIndex: 1 }}
      ></div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-md w-full bg-gray-900/80 backdrop-blur-lg rounded-2xl shadow-xl overflow-hidden relative z-10 border border-white/20"
      >
        <div className="p-8">
          <motion.h2
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-3xl font-extrabold mb-2 text-center bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 text-transparent bg-clip-text"
          >
            Create New Password
          </motion.h2>
          <p className="text-center text-gray-400 mb-8">
            Your new password must be secure and different from previous ones.
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="relative"
            >
              <Lock
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                size={20}
              />
              <input
                type="password"
                placeholder="Enter New Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.6 }}
              className="relative"
            >
              <Lock
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                size={20}
              />
              <input
                type="password"
                placeholder="Confirm New Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
              />
            </motion.div>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="w-full py-3 px-4 bg-gradient-to-r from-cyan-500 via-blue-600 to-purple-700 text-white font-bold rounded-lg shadow-lg hover:from-cyan-600 hover:via-blue-700 hover:to-purple-800 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 focus:ring-offset-gray-900 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              type="submit"
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader className="w-6 h-6 animate-spin mx-auto" />
              ) : (
                "Save New Password"
              )}
            </motion.button>
          </form>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.8 }}
          className="px-8 py-4 bg-gray-800/70 flex justify-center"
        >
          <p className="text-sm text-gray-300">
            Back to{" "}
            <Link
              to="/sign-in"
              className="text-cyan-400 hover:underline font-semibold"
            >
              Login
            </Link>
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
}

export default CreateNewPassword;
