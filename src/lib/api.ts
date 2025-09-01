import axios from "axios";

// export const BASE_URL="http://localhost:5000";
export const BASE_URL="https://hd-backend-rvyb.onrender.com";


const api=axios.create({
    baseURL:BASE_URL,
    headers:{
        "Content-Type":"application/json",
    },
    // withCredentials: true
});

// =================== REQUEST INTERCEPTOR ===================
// Attach JWT token if present
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token"); 
    if (token) {
      config.headers!.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// =================== AUTH ENDPOINTS ===================

const AUTH_BASE = "/auth";
const REGISTER_ENDPOINT = `${AUTH_BASE}/register`;
const SIGNIN_ENDPOINT = `${AUTH_BASE}/signin`;
const GET_OTP = `${AUTH_BASE}/get-otp`;
const RESEND_OTP_ENDPOINT = `${AUTH_BASE}/resend-otp`;

// =================== USER ENDPOINTS ===================

const USER_BASE = "/user";
const CONTENT_ENDPOINT = `${USER_BASE}/content`;
const GET_OWN_DETAILS_ENDPOINT = `${USER_BASE}/me`;

export { api, REGISTER_ENDPOINT, SIGNIN_ENDPOINT, CONTENT_ENDPOINT,GET_OTP,RESEND_OTP_ENDPOINT,GET_OWN_DETAILS_ENDPOINT };