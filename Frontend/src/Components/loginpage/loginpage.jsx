import axios from "axios";
import React, { useEffect } from "react";
import { useImmerReducer } from "use-immer";
import { Link, useNavigate } from "react-router-dom";
import jwt_decode from "jwt-decode";
import CryptoJS from "crypto-js";
import { FiMail } from "react-icons/fi";
import { CgProfile } from "react-icons/cg";
import { MdOutlineLock } from "react-icons/md";
import { FaLock, FaUser } from "react-icons/fa";
const BASE_URL = import.meta.env.VITE_BASE_URL;

function LoginPage() {
  const navigate = useNavigate();

  const initialState = {
    emailValue: "",
    passwordValue: "",
    sendRequest: 0,
    token: "",
    error: null,
    currentUser: false,
  };

  function reducerFunction(draft, action) {
    switch (action.type) {
      case "catchUserEmailChange":
        draft.emailValue = action.emailChosen;
        break;
      case "catchUserPassword":
        draft.passwordValue = action.passwordChosen;
        break;
      case "catchSendRequest":
        draft.sendRequest += 1;
        break;
      case "catchToken":
        draft.token = action.tokenValue;
        break;
      case "login":
        draft.currentUser = true;
        break;
      case "setError":
        draft.error = action.errorMessage;
        break;
      default:
        return draft;
    }
  }

  const [state, dispatch] = useImmerReducer(reducerFunction, initialState);

  useEffect(() => {
    const existingToken = localStorage.getItem("auth_token");
    if (existingToken) {
      dispatch({
        type: "catchToken",
        tokenValue: existingToken,
      });
      dispatch({
        type: "login",
      });
      navigate("/dashboard"); // Redirect to dashboard if already logged in
    }
  }, [navigate]);

  const handleLoginForm = (e) => {
    e.preventDefault();
    dispatch({ type: "catchSendRequest" });
  };

  useEffect(() => {
    if (state.sendRequest > 0 && !state.token) {
      const source = axios.CancelToken.source();

      async function signIn() {
        try {
          const response = await axios.post(
            `${BASE_URL}/api/v1/auth/api/token/`,
            {
              email: state.emailValue,
              password: state.passwordValue,
            },
            { cancelToken: source.token }
          );

          const { access, refresh } = response.data;
          if (access && refresh) {
            // Decode the access token to get user data (role, is_admin, etc.)
            const decodToken = jwt_decode(access);
            const secretKey = "TET4-1"; // Use a strong secret key
            const hashData = (data) => {
              return CryptoJS.AES.encrypt(
                JSON.stringify(data),
                secretKey
              ).toString();
            };
            // Store user data from the decoded access token
            localStorage.setItem("username", hashData(decodToken.first_name));
            localStorage.setItem("role", hashData(decodToken.role)); // assuming `role` is in the token
            localStorage.setItem("email", hashData(decodToken.email));
            localStorage.setItem(
              "phone_number",
              hashData(decodToken.phone_number)
            );
            localStorage.setItem("id", hashData(decodToken.user_id));

            // Store the tokens in localStorage
            localStorage.setItem("login_timestamp", new Date().getTime());
            localStorage.setItem("auth_token", hashData(access)); // Store access token
            // Store the token in state and set the user as logged in
            dispatch({
              type: "catchToken",
              tokenValue: access,
            });
            dispatch({
              type: "login",
            });

            // Redirect to the dashboard after successful login
            navigate("/dashboard");
          } else {
            dispatch({
              type: "setError",
              errorMessage: "Authentication failed. Please try again.",
            });
          }
        } catch (error) {
          if (error.response) {
            dispatch({
              type: "setError",
              errorMessage: error.response.data.non_field_errors
                ? error.response.data.non_field_errors[0]
                : "An unexpected error occurred.",
            });
          } else {
            dispatch({
              type: "setError",
              errorMessage: "An error occurred while trying to login.",
            });
          }
        }
      }

      signIn();

      return () => {
        source.cancel();
      };
    }
  }, [state.sendRequest, state.emailValue, state.passwordValue, state.token]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-100 flex items-center justify-center p-4">
      <div className="w-full max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 place-content-center md:gap-6 bg-white shadow-2xl rounded-2xl overflow-hidden p-3 lg:p-6">
        {/* Left Section (Login Form) */}
        <div className="w-full flex flex-col rounded-lg justify-center  shadow-lg col-span-1 border ">
          {/* Header Section */}
          <div className="relative h-32 bg-green flex items-center justify-center rounded-t-lg">
            <div className="absolute -bottom-10 left-1/2 transform -translate-x-1/2 bg-white p-4 rounded-full shadow-lg border-4 border-white">
              <FaUser className="text-green" size={50} />
            </div>
          </div>

          {/* Login Form Section */}
          <div className="px-4 py-12">
            <h2 className="text-3xl font-bold text-center text-gray-800 mb-6">
              ورود به حساب
            </h2>
            <form onSubmit={handleLoginForm} className="space-y-6">
              {/* Email Field */}
              <div className="relative">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  ایمیل:
                </label>
                <div className="relative">
                  <input
                    type="email"
                    value={state.emailValue}
                    onChange={(e) =>
                      dispatch({
                        type: "catchUserEmailChange",
                        emailChosen: e.target.value,
                      })
                    }
                    placeholder="example@example.com"
                    className="w-full px-4 py-3 text-lg pl-12 border border-gray-300 rounded-lg focus:outline-none "
                  />
                  <FiMail
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400"
                    size={20}
                  />
                </div>
              </div>
              {/* Password Field */}
              <div className="relative">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  رمز عبور:
                </label>
                <div className="relative">
                  <input
                    type="password"
                    value={state.passwordValue}
                    onChange={(e) =>
                      dispatch({
                        type: "catchUserPassword",
                        passwordChosen: e.target.value,
                      })
                    }
                    placeholder="********"
                    className="w-full px-4 py-3 pl-12 text-lg border border-gray-300 rounded-lg focus:outline-none "
                  />
                  <FaLock
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400"
                    size={20}
                  />
                </div>
              </div>
              {/* Error Message */}
              {state.error && (
                <div className="text-red-500 text-center text-sm mt-2">
                  {state.error}
                </div>
              )}
              {/* Success Message */}
              {state.currentUser && (
                <div className="text-green-500 text-center text-sm mt-2">
                  You are logged in!
                </div>
              )}
              {/* Submit Button */}
              <button
                type="submit"
                className="w-full py-3 bg-green hover:bg-green/80 text-white font-semibold rounded-lg hover:bg-green-600 transition-all"
              >
                ورود
              </button>
            </form>
            {/* Forgot Password Link */}
            <div className="mt-6 text-center">
              <Link
                to="/forgot-password"
                className="text-sm text-green-500 hover:text-blue-800 transition-all"
              >
                رمز عبور خود را فراموش کرده‌اید؟
              </Link>
            </div>
          </div>
        </div>

        {/* Right Section (Image + Company Logo & Name) */}
        <div className="flex flex-col items-center  col-span-2  space-y-4">
          {/* Company Logo & Name */}
          <div className="flex justify-center gap-x-10 items-center bg-green rounded-t-lg lg:h-[130px] w-full">
            <div className="border rounded-full  p-2 w-24 h-24 bg-white">
              {" "}
              <img
                src="/Tamadon.png"
                alt="Company Logo"
                className="h-20 w-20"
              />
            </div>
            <div>
              <h2 className="text-2xl lg:text-5xl font-bold text-gray-100 mt-2">
                {" "}
                مطبعه تمدن
              </h2>
              <h2 className="text-2xl lg:text-xl font-bold text-gray-100 mt-1">
                {" "}
                Tamadon printing press
              </h2>
            </div>
          </div>
          {/* Image */}
          <img
            src="/login.png"
            alt="Login Illustration"
            className="h-60 w-60 lg:h-[400px] lg:w-auto object-cover"
          />
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
