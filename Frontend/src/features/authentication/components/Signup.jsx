// src/features/authentication/components/SignUpPage.jsx

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Input from "../components/Input";
import { Loader, Lock, Mail, User, Briefcase } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import PasswordStrengthMeter from "../components/PasswordStrengthMeter";
import { useDispatch, useSelector } from "react-redux";
import { createUser, clearUserError } from "../../../state/userSlice/userSlice";
import { toast } from "react-hot-toast";

const SignUpPage = () => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState(""); // <-- ADDED: Password confirmation state
  const [role, setRole] = useState("passenger"); // <-- ADDED: Role state, default to passenger

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector((state) => state.user);

  useEffect(() => {
    dispatch(clearUserError());
  }, [dispatch]);

  const handleSignup = (e) => {
    e.preventDefault();

    // --- ADDED: Frontend validation ---
    if (password !== password2) {
      toast.error("Passwords do not match.");
      return;
    }
    // ---

    const userData = {
      first_name: firstName,
      last_name: lastName,
      username,
      email,
      password,
      password2, // <-- ADDED: Pass confirmation password
      role, // <-- ADDED: Pass role
    };

    dispatch(createUser(userData))
      .unwrap()
      .then(() => {
        navigate("/sign-in");
      })
      .catch((err) => {
        console.error("Signup failed:", err);
      });
  };

  return (
    <div
      className="w-full min-h-screen flex p-6 justify-center items-center py-8"
      style={{
        backgroundImage: 'url("/eur.png")',
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundAttachment: "fixed",
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-md w-full bg-gray-900/70 backdrop-blur-xl rounded-2xl shadow-xl overflow-hidden relative z-20 border border-gray-700"
      >
        <div className="p-8">
          <motion.h2
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-2xl font-extrabold mb-8 text-center bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 text-transparent bg-clip-text"
          >
            Create User Account
          </motion.h2>

          <form onSubmit={handleSignup}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
              >
                <Input
                  icon={User}
                  type="text"
                  placeholder="First Name"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  required
                />
              </motion.div>
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.5 }}
              >
                <Input
                  icon={User}
                  type="text"
                  placeholder="Last Name"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  required
                />
              </motion.div>
            </div>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.6 }}
            >
              <Input
                icon={User}
                type="text"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.7 }}
            >
              <Input
                icon={Mail}
                type="email"
                placeholder="Email Address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </motion.div>

            {/* --- ADDED: Role Selection Dropdown --- */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.8 }}
              className="relative"
            >
              <Briefcase
                className="absolute top-1/2 left-3 -translate-y-1/2 text-gray-400"
                size={20}
              />
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                required
                className="w-full bg-gray-800 text-white pl-10 pr-4 py-3 rounded-lg border border-transparent focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500 transition duration-200"
              >
                <option value="passenger">Passenger</option>
                <option value="driver">Driver</option>
              </select>
            </motion.div>
            {/* --- END: Role Selection --- */}

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.9 }}
            >
              <Input
                icon={Lock}
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </motion.div>

            {/* --- ADDED: Password Confirmation Input --- */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 1.0 }}
            >
              <Input
                icon={Lock}
                type="password"
                placeholder="Confirm Password"
                value={password2}
                onChange={(e) => setPassword2(e.target.value)}
                required
              />
            </motion.div>
            {/* --- END: Password Confirmation --- */}

            {password && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="mt-4"
              >
                <PasswordStrengthMeter password={password} />
              </motion.div>
            )}

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="w-full mt-6 py-3 px-4 bg-gradient-to-r from-cyan-500 via-blue-600 to-purple-700 text-white font-bold rounded-lg shadow-lg hover:from-cyan-600 hover:via-blue-700 hover:to-purple-800 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 focus:ring-offset-gray-900 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              type="submit"
              disabled={loading}
            >
              {loading ? (
                <Loader className="animate-spin mx-auto" size={24} />
              ) : (
                "Register"
              )}
            </motion.button>
          </form>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 1.2 }}
          className="px-8 py-4 bg-gray-800/70 flex justify-center"
        >
          <p className="text-sm text-gray-300">
            Do you have an account?{" "}
            <Link
              to={"/sign-in"}
              className="text-cyan-400 hover:underline font-semibold"
            >
              Login
            </Link>
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default SignUpPage;
