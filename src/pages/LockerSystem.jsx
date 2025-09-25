import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { ShoppingCart, Database, Folder, LayoutDashboard} from "lucide-react";

import BuyLocker from "../components/BuyLocker";
import MyLockers from "../components/MyLockers";
import config from "../config";
const LockerDashboard = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState("buy"); // default tab = Buy Locker

    const handleDashboardNavigation = () => {
      navigate('/dashboard')  
    };

    const renderContent = () => {
        switch (activeTab) {
            case "buy":
                return <BuyLocker />;
            case "mylockers":
                return <MyLockers />;
            default:
                return null;
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-white to-indigo-50">
            {/* Header */}
            <header className="flex items-center justify-between px-6 py-4 bg-white shadow-sm">
                <div>
                    <h1 className="text-xl font-bold text-gray-900">Locker System</h1>
                    <p className="text-sm text-gray-600">
                        Welcome, <span className="font-medium">{user?.name || "Guest"}</span>
                    </p>
                </div>

                <div className="flex items-center gap-6">
                    <button
                        onClick={() => navigate("/database")}
                        className="flex items-center gap-2 text-gray-700 hover:text-indigo-600"
                    >
                        <Database size={18} /> Database
                    </button>
                    <button
                        onClick={handleDashboardNavigation}
                        className="flex items-center gap-2 text-red-500 hover:text-red-600"
                    >
                        <LayoutDashboard size={18} /> Dashboard
                    </button>
                </div>
            </header>

            {/* Tabs */}
            <div className="px-6 mt-6 flex justify-center">
                <div className="flex gap-4 w-full max-w-4xl">
                    <button
                        onClick={() => setActiveTab("buy")}
                        className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg font-medium border shadow
              ${activeTab === "buy"
                                ? "bg-indigo-600 text-white border-indigo-600"
                                : "bg-white text-gray-600 hover:bg-indigo-50 border-gray-300"}`}
                    >
                        <ShoppingCart size={18} /> Buy Locker
                    </button>

                    <button
                        onClick={() => setActiveTab("mylockers")}
                        className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg font-medium border shadow
              ${activeTab === "mylockers"
                                ? "bg-indigo-600 text-white border-indigo-600"
                                : "bg-white text-gray-600 hover:bg-indigo-50 border-gray-300"}`}
                    >
                        <Folder size={18} /> My Lockers
                    </button>
                </div>
            </div>

            {/* Content */}
            <main className="mt-6 px-6">{renderContent()}</main>
        </div>
    );
};

export default LockerDashboard;
