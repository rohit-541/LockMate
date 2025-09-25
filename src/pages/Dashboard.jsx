import React from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { FaUserCircle } from "react-icons/fa";

export default function Dashboard() {
  const { user, logoutUser } = useAuth();
  const navigate = useNavigate();

  if (!user) {
    return <p className="text-center mt-10 text-lg">Loading your cutu-puchu info...</p>;
  }

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-blue-50 rounded-2xl shadow-lg text-center">
      {/* Profile Icon */}
      <FaUserCircle className="mx-auto text-blue-400 text-8xl mb-4" />

      {/* Welcome */}
      <h2 className="text-3xl font-bold text-blue-600 mb-2">Welcome, {user.name}!</h2>

      {/* User Info */}
      <ul className="text-left space-y-2 bg-white p-4 rounded-xl shadow-inner">
        <li>
          <strong>Name:</strong> {user.name}
        </li>
        <li>
          <strong>Mobile:</strong> {user.mobile}
        </li>
        <li>
          <strong>Email:</strong> {user.email}
        </li>
        <li>
          <strong>Created At:</strong> {new Date(user.createdAt).toLocaleString()}
        </li>
        <li>
          <strong>Last Updated:</strong> {new Date(user.updatedAt).toLocaleString()}
        </li>
      </ul>

      {/* Buttons */}
      <div className="mt-6 flex justify-center gap-4">
        <button
          onClick={() => navigate("/locker")}
          className="bg-blue-400 text-white px-4 py-2 rounded-xl hover:bg-blue-500 transition"
        >
          Locker Dashboard
        </button>
        <button
          onClick={logoutUser}
          className="bg-gray-300 text-gray-700 px-4 py-2 rounded-xl hover:bg-gray-400 transition"
        >
          Logout
        </button>
      </div>
    </div>
  );
}
