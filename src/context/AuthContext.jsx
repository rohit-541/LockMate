import React, { createContext, useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import config from "../config";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true); // optional, to manage auth loading state

    // Fetch user from backend
    useEffect(() => {
        console.log('AuthProvider mounting, fetchUser about to run');
        fetchUser();
    }, []);

    const fetchUser = async () => {
        try {
            console.log('fetchUser called');
            const response = await fetch(`${config.baseURL}/auth/me`, {
                method: "GET",
                credentials: "include",
            });
            console.log('me response status:', response.status);
            if (response.ok) {
                const userData = await response.json();
                setUser(userData.user); // ✅ Set only the actual user object

            } else {
                console.log('fetchUser not OK, setting user null');
                setUser(null);
            }
        } catch (err) {
            console.log('fetchUser error:', err);
            setUser(null);
        } finally {
            setLoading(false);
        }
    };


    const loginUser = async (email, password) => {
        const payload = { email, password };

        const response = await fetch(`${config.baseURL}/auth/login`, {
            method: "POST",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || "Login failed");
        }

        // Fetch user after login
        await fetchUser();
        navigate("/dashboard");
    };

    const logoutUser = async () => {
        await fetch(`${config.baseURL}/auth/logout`, {
            method: "GET",
            credentials: "include",
        });
        setUser(null);
        navigate("/");
    };

    const generateOtp = async (email) => {
        const payload = { email };

        const response = await fetch(`${config.baseURL}/auth/send-otp`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || "Failed to send OTP.");
        }

        return await response.json();
    };

    const verifyOtp = async (email, otp) => {
        const payload = { email, otp: Number(otp) };

        const response = await fetch(`${config.baseURL}/auth/verify-otp`, {
            method: "POST",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || "Failed to verify OTP.");
        }

        return await response.json();
    };

    const register = async (formData, email) => {
        const payload = {
            name: formData.name,
            mobile: formData.mobile,
            password: formData.password,
        };

        const response = await fetch(`${config.baseURL}/auth/register`, {
            method: "POST",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || "Registration failed");
        }

        await loginUser(email, formData.password);
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                loading,
                loginUser,
                logoutUser,
                register,
                generateOtp,
                verifyOtp,
                fetchUser,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
