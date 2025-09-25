import { useState, useEffect } from 'react';
import { LogOut, Lock, Unlock, ShoppingCart, Clock, CheckCircle, AlertCircle, Database, BarChart3 } from 'lucide-react';
import { DatabaseOperations } from '../utils/localStorageDB.js';
import DatabaseManager from './DatabaseManager';

const LockerDashboard = ({ user, onLogout }) => {
  const [activeTab, setActiveTab] = useState('buy');
  const [availableLockers, setAvailableLockers] = useState([]);
  const [userLocker, setUserLocker] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [otpData, setOtpData] = useState({ otp: '', phone: user?.Phone || '' });
  const [showOTPModal, setShowOTPModal] = useState(false);
  const [otpType, setOtpType] = useState('');
  const [showDatabaseManager, setShowDatabaseManager] = useState(false);
  const [otpTimer, setOtpTimer] = useState(0);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    let interval;
    if (otpTimer > 0) {
      interval = setInterval(() => {
        setOtpTimer(prev => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [otpTimer]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const lockers = await DatabaseOperations.getAllLockers();
      const available = lockers.filter(locker => locker.Status === 'Available');
      setAvailableLockers(available);

      if (user?.LockerID) {
        const userLockerData = lockers.find(locker => locker.LockerID === user.LockerID);
        setUserLocker(userLockerData);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBuyLocker = async (lockerId) => {
    if (!user) return;

    setIsLoading(true);
    try {
      const success = await DatabaseOperations.assignLocker(user.Email, lockerId);
      if (success) {
        await loadData();
        alert('Locker assigned successfully!');
      } else {
        alert('Failed to assign locker. Please try again.');
      }
    } catch (error) {
      console.error('Error assigning locker:', error);
      alert('Failed to assign locker. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenLocker = async () => {
    if (!user?.LockerID) return;

    setOtpType('open');
    setOtpData({ otp: '', phone: user.Phone });
    setShowOTPModal(true);
  };

  const handleCloseLocker = async () => {
    if (!user?.LockerID) return;

    setOtpType('close');
    setOtpData({ otp: '', phone: user.Phone });
    setShowOTPModal(true);
  };

  const generateOTP = async () => {
    setIsLoading(true);
    try {
      const otp = await DatabaseOperations.generateOTP(otpData.phone, otpType);
      if (otp) {
        setOtpData(prev => ({ ...prev, otp: otp }));
        setOtpTimer(30);
        alert(`OTP generated: ${otp}`);
      } else {
        alert('Failed to generate OTP. Please try again.');
      }
    } catch (error) {
      console.error('Error generating OTP:', error);
      alert('Failed to generate OTP. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const verifyOTP = async () => {
    setIsLoading(true);
    try {
      const isValid = await DatabaseOperations.verifyOTP(otpData.phone, otpData.otp);
      if (isValid) {
        if (otpType === 'open') {
          await DatabaseOperations.openLocker(user.LockerID);
          alert('Locker opened successfully!');
        } else if (otpType === 'close') {
          await DatabaseOperations.closeLocker(user.LockerID);
          alert('Locker closed successfully!');
        }
        setShowOTPModal(false);
        await loadData();
      } else {
        alert('Invalid OTP. Please try again.');
      }
    } catch (error) {
      console.error('Error verifying OTP:', error);
      alert('OTP verification failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem('locker_user');
    onLogout();
  };

  if (showDatabaseManager) {
    return <DatabaseManager onBack={() => setShowDatabaseManager(false)} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Locker System</h1>
              <p className="text-sm text-gray-600">Welcome, {user?.Name}</p>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowDatabaseManager(true)}
                className="flex items-center px-3 py-2 text-sm text-gray-600 hover:text-gray-900"
              >
                <Database className="h-4 w-4 mr-2" />
                Database
              </button>
              <button
                onClick={handleLogout}
                className="flex items-center px-3 py-2 text-sm text-red-600 hover:text-red-900"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* User Locker Status */}
        {userLocker && (
          <div className="mb-8 bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Your Locker</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-blue-50 rounded-lg p-4">
                <div className="flex items-center">
                  <Lock className="h-8 w-8 text-blue-600" />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-blue-900">Locker ID</p>
                    <p className="text-lg font-bold text-blue-600">{userLocker.LockerID}</p>
                  </div>
                </div>
              </div>
              <div className="bg-green-50 rounded-lg p-4">
                <div className="flex items-center">
                  <CheckCircle className="h-8 w-8 text-green-600" />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-green-900">Status</p>
                    <p className="text-lg font-bold text-green-600">{userLocker.Status}</p>
                  </div>
                </div>
              </div>
              <div className="bg-purple-50 rounded-lg p-4">
                <div className="flex items-center">
                  <Clock className="h-8 w-8 text-purple-600" />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-purple-900">Assigned</p>
                    <p className="text-sm text-purple-600">{new Date(userLocker.AssignedDate).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="mb-8">
          <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
            {[
              { id: 'buy', label: 'Buy Locker', icon: ShoppingCart },
              { id: 'open', label: 'Open Locker', icon: Unlock },
              { id: 'close', label: 'Close Locker', icon: Lock }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 flex items-center justify-center px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'bg-white text-indigo-600 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <tab.icon className="h-4 w-4 mr-2" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-lg shadow-sm">
          {activeTab === 'buy' && (
            <div className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Available Lockers</h2>
              {isLoading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {availableLockers.map((locker) => (
                    <div
                      key={locker.LockerID}
                      className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-medium text-gray-900">{locker.LockerID}</h3>
                          <p className="text-sm text-gray-500">{locker.Location}</p>
                          <p className="text-sm text-gray-500">Size: {locker.Size}</p>
                        </div>
                        <button
                          onClick={() => handleBuyLocker(locker.LockerID)}
                          className="px-3 py-1 bg-indigo-600 text-white text-sm rounded-md hover:bg-indigo-700"
                        >
                          Buy
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'open' && (
            <div className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Open Locker</h2>
              {userLocker ? (
                <div className="text-center">
                  <Unlock className="h-16 w-16 text-indigo-600 mx-auto mb-4" />
                  <p className="text-gray-600 mb-6">Click the button below to open your locker</p>
                  <button
                    onClick={handleOpenLocker}
                    disabled={isLoading}
                    className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                  >
                    Open Locker
                  </button>
                </div>
              ) : (
                <div className="text-center">
                  <AlertCircle className="h-16 w-16 text-yellow-500 mx-auto mb-4" />
                  <p className="text-gray-600">You don't have a locker assigned. Please buy a locker first.</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'close' && (
            <div className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Close Locker</h2>
              {userLocker ? (
                <div className="text-center">
                  <Lock className="h-16 w-16 text-indigo-600 mx-auto mb-4" />
                  <p className="text-gray-600 mb-6">Click the button below to close your locker</p>
                  <button
                    onClick={handleCloseLocker}
                    disabled={isLoading}
                    className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
                  >
                    Close Locker
                  </button>
                </div>
              ) : (
                <div className="text-center">
                  <AlertCircle className="h-16 w-16 text-yellow-500 mx-auto mb-4" />
                  <p className="text-gray-600">You don't have a locker assigned. Please buy a locker first.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* OTP Modal */}
      {showOTPModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {otpType === 'open' ? 'Open Locker' : 'Close Locker'}
            </h3>
            <p className="text-gray-600 mb-4">
              Enter the OTP sent to {otpData.phone}
            </p>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  OTP Code
                </label>
                <input
                  type="text"
                  value={otpData.otp}
                  onChange={(e) => setOtpData(prev => ({ ...prev, otp: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Enter OTP"
                />
              </div>
              
              <div className="flex space-x-3">
                <button
                  onClick={generateOTP}
                  disabled={isLoading || otpTimer > 0}
                  className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50"
                >
                  {otpTimer > 0 ? `Resend in ${otpTimer}s` : 'Generate OTP'}
                </button>
                <button
                  onClick={verifyOTP}
                  disabled={isLoading || !otpData.otp}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
                >
                  Verify OTP
                </button>
              </div>
              
              <button
                onClick={() => setShowOTPModal(false)}
                className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LockerDashboard;