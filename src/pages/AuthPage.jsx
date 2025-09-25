import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

const AuthPage = () => {
  const { user, generateOtp, verifyOtp, register, loginUser } = useAuth();
  const navigate = useNavigate();

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      navigate("/dashboard");
    }
  }, [user, navigate]);

  const [activeTab, setActiveTab] = useState("login"); // "login" or "signup"
  const [step, setStep] = useState(1); // Signup steps
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    mobile: "",
    password: "",
  });

  // --- Handlers ---
  const handleGenerateOtp = async (e) => {
    e.preventDefault();
    try {
      await generateOtp(email);
      setStep(2);
    } catch (error) {
      alert(error.message);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    try {
      await verifyOtp(email, otp);
      setStep(3);
    } catch (error) {
      alert(error.message);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      await register(formData, email);
      alert("Registration Successful!");
      setStep(1);
      setEmail("");
      setOtp("");
      setFormData({ name: "", mobile: "", password: "" });
      setActiveTab("login"); // Switch to login after registration
    } catch (error) {
      alert("Registration failed: " + error.message);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      await loginUser(email, formData.password);
      alert("Login Successful!");
    } catch (error) {
      alert("Login failed: " + error.message);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center w-full min-h-screen ">
      <div class="flex items-center justify-center my-5 rounded-full">
        <img src="../src/assets/images.jpg" alt="Logo" class="max-w-4/5 rounded-full max-h-4/5" />
      </div>

      <div className="bg-white shadow-2xl rounded-3xl w-full max-w-md p-6">
        {/* Tabs */}
        <div className="flex justify-around mb-6 bg-blue-100 rounded-2xl overflow-hidden">
          <button
            className={`flex-1 py-2 text-lg font-semibold transition ${activeTab === "login"
                ? "bg-blue-300 text-white rounded-2xl shadow-inner"
                : "text-blue-700 hover:bg-blue-200"
              }`}
            onClick={() => {
              setActiveTab("login");
              setStep(1);
              setEmail("");
              setOtp("");
              setFormData({ name: "", mobile: "", password: "" });
            }}
          >
            Login
          </button>
          <button
            className={`flex-1 py-2 text-lg font-semibold transition ${activeTab === "signup"
                ? "bg-blue-300 text-white rounded-2xl shadow-inner"
                : "text-blue-700 hover:bg-blue-200"
              }`}
            onClick={() => {
              setActiveTab("signup");
              setStep(1);
              setEmail("");
              setOtp("");
              setFormData({ name: "", mobile: "", password: "" });
            }}
          >
            Sign Up
          </button>
        </div>

        {/* Login Form */}
        {activeTab === "login" && (
          <form onSubmit={handleLogin} className="space-y-4">
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-blue-300 outline-none"
            />
            <input
              type="password"
              placeholder="Password"
              value={formData.password}
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
              required
              className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-blue-300 outline-none"
            />
            <button className="w-full bg-blue-400 text-white py-2 rounded-xl hover:bg-blue-500 transition">
              Login
            </button>
          </form>
        )}

        {/* Signup Steps */}
        {activeTab === "signup" && (
          <>
            {step === 1 && (
              <form onSubmit={handleGenerateOtp} className="space-y-4">
                <input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-blue-300 outline-none"
                />
                <button className="w-full bg-blue-400 text-white py-2 rounded-xl hover:bg-blue-500 transition">
                  Generate OTP
                </button>
              </form>
            )}
            {step === 2 && (
              <form onSubmit={handleVerifyOtp} className="space-y-4">
                <input
                  type="text"
                  placeholder="Enter OTP"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  required
                  className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-blue-300 outline-none"
                />
                <button className="w-full bg-green-400 text-white py-2 rounded-xl hover:bg-green-500 transition">
                  Verify OTP
                </button>
              </form>
            )}
            {step === 3 && (
              <form onSubmit={handleRegister} className="space-y-4">
                <input
                  type="text"
                  placeholder="Full Name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  required
                  className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-blue-300 outline-none"
                />
                <input
                  type="tel"
                  placeholder="Mobile Number"
                  value={formData.mobile}
                  onChange={(e) =>
                    setFormData({ ...formData, mobile: e.target.value })
                  }
                  required
                  className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-blue-300 outline-none"
                />
                <input
                  type="password"
                  placeholder="Password"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  required
                  className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-blue-300 outline-none"
                />
                <button className="w-full bg-purple-400 text-white py-2 rounded-xl hover:bg-purple-500 transition">
                  Register
                </button>
              </form>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default AuthPage;
