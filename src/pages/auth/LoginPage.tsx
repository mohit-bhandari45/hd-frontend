import React, { useState } from "react";
import {
  api,
  SIGNIN_ENDPOINT,
  GET_OTP,
  RESEND_OTP_ENDPOINT,
} from "../../lib/api";
import { useNavigate } from "react-router-dom";

const LoginPage: React.FC = () => {
  const [formData, setFormData] = useState({
    email: "",
    otp: "",
  });
  const [showOtpField, setShowOtpField] = useState(false);
  const [keepLoggedIn, setKeepLoggedIn] = useState(false);
  const navigate = useNavigate();
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSendOtp = async () => {
    setShowOtpField(true);
    if (formData.email) {
      try {
        const res = await api.post(GET_OTP, { email: formData.email });
        if (res.status == 200) {
          setShowOtpField(true);
        }
      } catch (e) {
        console.log(e);
      }
    }
  };

  const handleSignIn = async () => {
    if (formData.otp) {
      try {
        const res = await api.post(SIGNIN_ENDPOINT, formData);
        if (res.status == 200) {
          const token = (res.data as { token: string }).token;
          localStorage.setItem("token", token);
          navigate("/dashboard");
        }
      } catch (e) {
        console.log(e);
      }
    }
  };

  const handleResendOtp = async () => {
    try {
      const res = await api.post(RESEND_OTP_ENDPOINT, {
        email: formData.email,
      });
      if (res.status == 200) {
      }
    } catch (e) {
      console.log(e);
    }
  };

  return (
    <div className="min-h-screen bg-white flex">
      {/* Left side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center py-8">
        {/* Logo  */}
        <div
          className="absolute top-6 left-6 flex p-4 items-center gap-2 
                  lg:static lg:mb-10 lg:self-start justify-center w-full lg:w-auto"
        >
          <img src="/icon.png" alt="logo" className="h-10 w-auto" />
          <span className="text-2xl font-bold text-gray-900">HD</span>
        </div>

        <div className="w-full lg:w-3/4 xl:w-2/3 px-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-semibold text-gray-900 mb-2 ">
              Sign in
            </h1>
            <p className="text-sm text-gray-500">
              Please login to continue to your account.
            </p>
          </div>

          {/* Form */}
          <div className="space-y-4">
            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm text-gray-600 mb-2"
              >
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full px-3 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                placeholder="jonas_kahnwald@gmail.com"
              />
            </div>

            {/* OTP Field - Shows only after email is entered and user requests OTP */}
            {showOtpField && (
              <div>
                <label
                  htmlFor="otp"
                  className="block text-sm text-gray-600 mb-2"
                >
                  OTP
                </label>
                <div className="relative">
                  <input
                    type="text"
                    id="otp"
                    name="otp"
                    value={formData.otp}
                    onChange={handleInputChange}
                    className="w-full px-3 py-3 pr-10 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    placeholder="Enter OTP"
                    maxLength={6}
                  />
                  <div className="absolute right-3 top-3">
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      className="text-gray-400"
                    >
                      <path d="M9 12l2 2 4-4"></path>
                      <path d="M21 12c-1 0-3-1-3-3s2-3 3-3 3 1 3 3-2 3-3 3"></path>
                      <path d="M3 12c1 0 3-1 3-3s-2-3-3-3-3 1-3 3 2 3 3 3"></path>
                    </svg>
                  </div>
                </div>

                {/* Resend OTP */}
                <div className="mt-2 text-right">
                  <button
                    onClick={handleResendOtp}
                    className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                  >
                    Resend OTP
                  </button>
                </div>
              </div>
            )}

            {/* Keep me logged in checkbox - only show when OTP field is visible */}
            {showOtpField && (
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="keepLoggedIn"
                  checked={keepLoggedIn}
                  onChange={(e) => setKeepLoggedIn(e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="keepLoggedIn" className="text-sm text-gray-600">
                  Keep me logged in
                </label>
              </div>
            )}

            {/* Send OTP / Sign In Button */}
            {!showOtpField ? (
              <button
                onClick={handleSendOtp}
                disabled={!formData.email}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200 mt-6 disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                Send OTP
              </button>
            ) : (
              <button
                onClick={handleSignIn}
                disabled={!formData.otp}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200 mt-6 disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                Sign in
              </button>
            )}
          </div>

          {/* Footer */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-500">
              Need an account?{" "}
              <a
                href="/auth/signup"
                className="text-blue-600 hover:text-blue-800 font-medium"
              >
                Create one
              </a>
            </p>
          </div>
        </div>
      </div>

      
      {/* Right side  */}
      <div className="hidden lg:block lg:w-1/2 relative overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center">
          <img
            src="/right-column.png" 
            alt="Login illustration"
            className="w-full h-full object-cover"
          />
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
