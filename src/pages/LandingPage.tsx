import { useEffect } from "react";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";

export default function LandingPage() {
  const navigate= useNavigate();
  useEffect(()=>{
    if(localStorage.getItem("token")){
        navigate("/dashboard");
    }
  },[])
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-900 text-white">
      <h1 className="text-4xl font-bold mb-6">Welcome to Notes App</h1>
      <p className="text-gray-400 mb-8">Organize your notes securely in one place</p>
      
      <div className="flex gap-4">
        <Link
          to="/auth/login"
          className="px-6 py-2 rounded-lg bg-blue-500 hover:bg-blue-600 transition"
        >
          Login
        </Link>
        <Link
          to="/auth/signup"
          className="px-6 py-2 rounded-lg bg-green-500 hover:bg-green-600 transition"
        >
          Register
        </Link>
      </div>
    </div>
  );
}
