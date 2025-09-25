import React, { useEffect, useState } from "react";

const MyLockers = () => {
  const [lockers, setLockers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedLocker, setSelectedLocker] = useState(null);
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [verified, setVerified] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    const fetchLockers = async () => {
      try {
        const res = await fetch("http://localhost:3000/locker/get-by-user-id", {
          method: "GET",
          credentials: "include",
        });
        const data = await res.json();
        if (data.lockers) setLockers(data.lockers);
      } catch (err) {
        console.error("Error fetching lockers:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchLockers();
  }, []);

  const handleSendOtp = async (lockerId) => {
    setActionLoading(true);
    try {
      const res = await fetch("http://localhost:3000/locker/send-otp", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lockerId }),
      });
      const data = await res.json();
      if (res.ok) {
        setOtpSent(true);
        setSelectedLocker(lockerId);
        alert("OTP sent successfully!");
      } else {
        alert(data.message || "Failed to send OTP");
      }
    } catch (err) {
      console.error(err);
      alert("Error sending OTP");
    } finally {
      setActionLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otp || !selectedLocker) return;
    setActionLoading(true);
    try {
      const res = await fetch("http://localhost:3000/locker/verify-otp", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lockerId: selectedLocker, otp }),
      });
      const data = await res.json();
      if (res.ok) {
        setVerified(true);
        alert("Locker verified!");
      } else {
        alert(data.message || "Invalid OTP");
      }
    } catch (err) {
      console.error(err);
      alert("Error verifying OTP");
    } finally {
      setActionLoading(false);
    }
  };

  const handleLockerAction = async (lockerId, action) => {
    setActionLoading(true);
    try {
      const res = await fetch(`http://localhost:3000/locker/${action}`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lockerId }),
      });
      console.log(JSON.stringify({lockerId}))
      const data = await res.json();
      if (res.ok) {
        alert(`Locker ${action}ed successfully!`);
        // Update locker status locally
        setLockers((prev) =>
          prev.map((l) =>
            l.id === lockerId ? { ...l, status: action === "open" ? "OPEN" : "CLOSED" } : l
          )
        );
      } else {
        alert(data.message || `Failed to ${action} locker`);
      }
    } catch (err) {
      console.error(err);
      alert("Error performing action");
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) return <p className="text-center text-gray-500 mt-6">Loading lockers...</p>;
  if (lockers.length === 0) return <p className="text-center text-gray-500 mt-6">No lockers found.</p>;

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {lockers.map((locker) => (
        <div
          key={locker.id}
          className="bg-white rounded-xl shadow-md border border-gray-200 p-4 flex flex-col justify-between"
        >
          <div>
            <h2 className="text-lg font-semibold text-gray-900">{locker.name}</h2>
            <p className="text-sm text-gray-500">₹{locker.prices}</p>
          </div>

          <div className="mt-3 flex flex-wrap gap-2">
            <span
              className={`px-2 py-1 text-xs font-medium rounded-full ${
                locker.status === "OPEN"
                  ? "bg-green-100 text-green-700"
                  : "bg-red-100 text-red-700"
              }`}
            >
              {locker.status === "OPEN" ? "Open" : "Closed"}
            </span>

            <span
              className={`px-2 py-1 text-xs font-medium rounded-full ${
                locker.isActive ? "bg-blue-100 text-blue-700" : "bg-gray-200 text-gray-600"
              }`}
            >
              {locker.isActive ? "Active" : "Expired"}
            </span>
          </div>

          <div className="mt-4 text-xs text-gray-500">
            <p>Created: {new Date(locker.createdAt).toLocaleString()}</p>
            <p>Updated: {new Date(locker.updatedAt).toLocaleString()}</p>
          </div>

          <div className="mt-4 flex flex-col gap-2">
            {!otpSent || selectedLocker !== locker.id ? (
              <button
                disabled={actionLoading}
                onClick={() => handleSendOtp(locker.id)}
                className="px-3 py-1 bg-indigo-500 text-white rounded hover:bg-indigo-600 disabled:opacity-50"
              >
                Generate OTP
              </button>
            ) : !verified ? (
              <>
                <input
                  type="text"
                  placeholder="Enter OTP"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  className="border px-2 py-1 rounded w-full text-sm"
                />
                <button
                  disabled={actionLoading}
                  onClick={handleVerifyOtp}
                  className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
                >
                  Verify OTP
                </button>
              </>
            ) : (
              <div className="flex gap-2">
                <button
                  disabled={actionLoading}
                  onClick={() => handleLockerAction(locker.id, "open")}
                  className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
                >
                  Open
                </button>
                <button
                  disabled={actionLoading}
                  onClick={() => handleLockerAction(locker.id, "close")}
                  className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 disabled:opacity-50"
                >
                  Close
                </button>
                <button
                  disabled={actionLoading}
                  onClick={() => handleLockerAction(locker.id, "empty")}
                  className="px-3 py-1 bg-violet-500 text-white rounded hover:bg-violet-600 disabled:opacity-50"
                >
                  Empty
                </button>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default MyLockers;
