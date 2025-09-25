import React, { useEffect, useState } from "react";

const BuyLocker = () => {
  const [lockers, setLockers] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchLockers = async () => {
    try {
      setLoading(true);
      const response = await fetch("http://localhost:3000/locker/get-all", {
        method: "GET",
        credentials: "include",
      });
      if (!response.ok) throw new Error("Failed to fetch lockers");
      const data = await response.json();
      setLockers(data.lockers || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLockers();
  }, []);

  const handleBuy = async (lockerId) => {
    try {
      const response = await fetch("http://localhost:3000/locker/buy", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lockerId }),
      });

      if (!response.ok) {
        const errData = await response.json();
        alert(errData.message || "Failed to buy locker");
        return;
      }

      const result = await response.json();
      alert(`Locker purchased successfully: ${result.message}`);
      fetchLockers(); // refresh list after purchase
    } catch (err) {
      console.error(err);
      alert("Error buying locker");
    }
  };

  if (loading) return <p className="text-center mt-6">Loading lockers...</p>;

  return (
    <div className="px-6 py-6">
      <h2 className="text-lg font-semibold text-gray-800 mb-4">
        Available Lockers
      </h2>

      {lockers.length === 0 ? (
        <p className="text-gray-600">No lockers found</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {lockers.map((locker) => {
            const isAvailable = !locker.userId && locker.isActive === false;

            return (
              <div
                key={locker.id}
                className="border rounded-lg p-4 shadow-sm flex flex-col justify-between bg-white"
              >
                <div>
                  <h3 className="font-semibold text-gray-900">
                    {locker.name}
                  </h3>
                  <p className="text-sm text-gray-600">
                    Price: ₹{locker.prices}
                  </p>
                  <p className="text-sm text-gray-500">
                    Status:{" "}
                    <span
                      className={
                        isAvailable ? "text-green-600" : "text-red-500"
                      }
                    >
                      {isAvailable ? "Available" : "Purchased"}
                    </span>
                  </p>
                  {locker.userId && (
                    <p className="text-xs text-gray-400 mt-1">
                      Owned by User ID: {locker.userId}
                    </p>
                  )}
                </div>

                <button
                  disabled={!isAvailable}
                  onClick={() => handleBuy(locker.id)}
                  className={`mt-4 px-4 py-2 rounded text-white font-medium ${
                    isAvailable
                      ? "bg-indigo-600 hover:bg-indigo-700"
                      : "bg-gray-400 cursor-not-allowed"
                  }`}
                >
                  {isAvailable ? "Buy" : "Not Available"}
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default BuyLocker;
