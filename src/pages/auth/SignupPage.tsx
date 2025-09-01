import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api, GET_OTP, REGISTER_ENDPOINT } from "../../lib/api";

const SignupPage: React.FC = () => {
  const [formData, setFormData] = useState({
    username: "",
    dob: "",
    email: "",
    otp: "",
  });

  const [showOtpField, setShowOtpField] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleGetOtp = async () => {
    if (!formData.username || !formData.dob || !formData.email) {
      setErrorMessage("Please fill all required fields");
      return;
    }

    setErrorMessage("");
    setSuccessMessage("");
    setLoading(true);

    try {
      const res = await api.post(GET_OTP, { email: formData.email });
      const data = res.data as { success: boolean };
      if (data.success) {
        setShowOtpField(true);
        setSuccessMessage("OTP sent to your email");
      }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (e: any) {
      setErrorMessage(e.response?.data?.error || "Failed to send OTP. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async () => {
    if (!formData.otp) {
      setErrorMessage("Please enter the OTP");
      return;
    }

    setErrorMessage("");
    setSuccessMessage("");
    setLoading(true);

    try {
      const res = await api.post(REGISTER_ENDPOINT, formData);
      if (res.status === 201) {
        const token = (res.data as { token: string }).token;
        localStorage.setItem("token", token);
        navigate("/dashboard");
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (e: any) {
      setErrorMessage(e.response?.data?.error || "Registration failed. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-wrap">
      {/* Left side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center relative">
        {/* Logo */}
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
            <h1 className="text-2xl font-semibold text-gray-900 mb-2">
              Sign up
            </h1>
            <p className="text-sm text-gray-500">
              Sign up to enjoy the feature of HD
            </p>
          </div>

          {/* Alerts */}
          <div className="space-y-2">
            {errorMessage && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded">
                {errorMessage}
              </div>
            )}
            {successMessage && (
              <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-2 rounded">
                {successMessage}
              </div>
            )}
          </div>

          {/* Form */}
          <div className="space-y-4 mt-4">
            {/* Full Name */}
            <div>
              <label htmlFor="username" className="block text-sm text-gray-600 mb-2">
                Your Name
              </label>
              <input
                type="text"
                id="username"
                name="username"
                value={formData.username}
                onChange={handleInputChange}
                className="w-full px-3 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                placeholder="Jonas Kahnwald"
              />
            </div>

            {/* Date of Birth */}
            <div>
              <label htmlFor="dob" className="block text-sm text-gray-600 mb-2">
                DOB
              </label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    className="text-gray-400"
                  >
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                    <line x1="16" y1="2" x2="16" y2="6"></line>
                    <line x1="8" y1="2" x2="8" y2="6"></line>
                    <line x1="3" y1="10" x2="21" y2="10"></line>
                  </svg>
                </div>
                <input
                  type="text"
                  id="dob"
                  name="dob"
                  value={formData.dob}
                  onChange={handleInputChange}
                  onFocus={(e) => (e.target.type = "date")}
                  onBlur={(e) => (e.target.type = "text")}
                  placeholder="Select your date of birth"
                  className="w-full pl-10 pr-3 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm text-gray-600 mb-2">
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

            {/* OTP Field */}
            {showOtpField && (
              <div>
                <label htmlFor="otp" className="block text-sm text-gray-600 mb-2">
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
                </div>
              </div>
            )}

            {/* Get OTP / Sign Up Button */}
            <button
              onClick={showOtpField ? handleSignUp : handleGetOtp}
              disabled={
                loading ||
                !formData.username ||
                !formData.dob ||
                !formData.email ||
                (showOtpField && !formData.otp)
              }
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200 mt-6 disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              {loading ? "Please wait..." : showOtpField ? "Sign up" : "Get OTP"}
            </button>
          </div>

          {/* Footer */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-500">
              Already have an account?{" "}
              <a
                href="/auth/login"
                className="text-blue-600 hover:text-blue-800 font-medium"
              >
                Sign in
              </a>
            </p>
          </div>
        </div>
      </div>

      {/* Right side */}
      <div className="hidden lg:block lg:w-1/2 h-screen relative overflow-hidden">
        <img
          src="/right-column.png"
          alt="Signup illustration"
          className="w-full h-full object-cover"
        />
      </div>
    </div>
  );
};

export default SignupPage;
