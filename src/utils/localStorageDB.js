// Local Storage Database
const STORAGE_KEYS = {
    users: 'locker_users',
    lockers: 'locker_lockers',
    otps: 'locker_otps',
    transactions: 'locker_transactions',
    settings: 'locker_settings'
  };
  
  const generateId = () => {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  };
  
  // Initialize default data
  const initializeDefaultData = () => {
    console.log('Initializing localStorage database...');
    
    // Initialize lockers
    if (!localStorage.getItem(STORAGE_KEYS.lockers)) {
      const lockers = [];
      for (let i = 1; i <= 20; i++) {
        lockers.push({
          LockerID: `L${i.toString().padStart(3, '0')}`,
          Status: 'Available',
          UserEmail: '',
          AssignedDate: '',
          LastOpened: '',
          LastClosed: '',
          Location: `Floor ${Math.ceil(i / 5)}`,
          Size: i <= 10 ? 'Small' : 'Large'
        });
      }
      localStorage.setItem(STORAGE_KEYS.lockers, JSON.stringify(lockers));
      console.log('Initialized lockers data');
    }
  
    // Initialize settings
    if (!localStorage.getItem(STORAGE_KEYS.settings)) {
      const settings = [
        { Key: 'OTP_EXPIRY_SECONDS', Value: '30', Description: 'OTP expiry time in seconds', UpdatedAt: new Date().toISOString() },
        { Key: 'MAX_LOGIN_ATTEMPTS', Value: '3', Description: 'Maximum login attempts before lockout', UpdatedAt: new Date().toISOString() },
        { Key: 'LOCKER_COUNT', Value: '20', Description: 'Total number of lockers', UpdatedAt: new Date().toISOString() },
        { Key: 'SYSTEM_STATUS', Value: 'ACTIVE', Description: 'Current system status', UpdatedAt: new Date().toISOString() }
      ];
      localStorage.setItem(STORAGE_KEYS.settings, JSON.stringify(settings));
      console.log('Initialized settings data');
    }
  
    // Initialize other tables as empty arrays
    Object.keys(STORAGE_KEYS).forEach(key => {
      if (!localStorage.getItem(STORAGE_KEYS[key])) {
        localStorage.setItem(STORAGE_KEYS[key], JSON.stringify([]));
      }
    });
    
    console.log('localStorage database initialized successfully!');
  };
  
  // OTP file download function
  export const downloadOTPFile = (otp, phone, type = 'general') => {
    const content = `
  OTP Verification Details
  =======================
  
  Phone Number: ${phone}
  OTP Code: ${otp}
  Type: ${type}
  Generated At: ${new Date().toLocaleString()}
  Expires At: ${new Date(Date.now() + 30 * 1000).toLocaleString()}
  
  Instructions:
  1. Enter the OTP code in the application
  2. The OTP is valid for 30 seconds
  3. Do not share this OTP with anyone
  
  This is a test file for development purposes.
    `;
  
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `otp_${phone}_${Date.now()}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };
  
  // Main Database Operations - Fixed structure
  export const DatabaseOperations = {
    // User operations
    register: async (userData) => {
      try {
        const user = {
          ID: generateId(),
          Name: userData.name,
          Email: userData.email,
          Phone: userData.phone,
          Password: userData.password,
          LockerID: '',
          RegistrationDate: new Date().toISOString(),
          LastLogin: '',
          Status: 'Active'
        };
        
        const users = JSON.parse(localStorage.getItem(STORAGE_KEYS.users) || '[]');
        
        // Check if user already exists
        const existingUser = users.find(u => u.Email === userData.email);
        if (existingUser) {
          return null;
        }
        
        users.push(user);
        localStorage.setItem(STORAGE_KEYS.users, JSON.stringify(users));
        return user;
      } catch (error) {
        console.error('Error registering user:', error);
        return null;
      }
    },
  
    login: async (email, password) => {
      try {
        const users = JSON.parse(localStorage.getItem(STORAGE_KEYS.users) || '[]');
        const user = users.find(u => u.Email === email && u.Password === password);
        
        if (user) {
          // Update last login
          user.LastLogin = new Date().toISOString();
          localStorage.setItem(STORAGE_KEYS.users, JSON.stringify(users));
          return user;
        }
        return null;
      } catch (error) {
        console.error('Error logging in:', error);
        return null;
      }
    },
  
    generateOTP: async (phone, type = 'general') => {
      try {
        const otp = Math.floor(10000000 + Math.random() * 90000000).toString();
        const expiry = new Date(Date.now() + 30 * 1000).toISOString();
        
        const otpData = {
          ID: generateId(),
          Phone: phone,
          OTP: otp,
          Expiry: expiry,
          Type: type,
          Used: false,
          CreatedAt: new Date().toISOString()
        };
        
        // Remove old OTPs for this phone
        const otps = JSON.parse(localStorage.getItem(STORAGE_KEYS.otps) || '[]');
        const filteredOtps = otps.filter(o => o.Phone !== phone);
        
        // Add new OTP
        filteredOtps.push(otpData);
        localStorage.setItem(STORAGE_KEYS.otps, JSON.stringify(filteredOtps));
        
        // Download OTP file for testing
        downloadOTPFile(otp, phone, type);
        
        return otp;
      } catch (error) {
        console.error('Error generating OTP:', error);
        return null;
      }
    },
  
    verifyOTP: async (phone, otp) => {
      try {
        const otps = JSON.parse(localStorage.getItem(STORAGE_KEYS.otps) || '[]');
        const otpRecord = otps.find(o => o.Phone === phone && o.OTP === otp);
        
        if (otpRecord) {
          const now = new Date();
          const expiry = new Date(otpRecord.Expiry);
          
          if (now < expiry && !otpRecord.Used) {
            // Mark as used
            otpRecord.Used = true;
            localStorage.setItem(STORAGE_KEYS.otps, JSON.stringify(otps));
            return true;
          }
        }
        return false;
      } catch (error) {
        console.error('Error verifying OTP:', error);
        return false;
      }
    },
  
    resetPassword: async (phone, newPassword) => {
      try {
        const users = JSON.parse(localStorage.getItem(STORAGE_KEYS.users) || '[]');
        const user = users.find(u => u.Phone === phone);
        
        if (user) {
          user.Password = newPassword;
          localStorage.setItem(STORAGE_KEYS.users, JSON.stringify(users));
          return true;
        }
        return false;
      } catch (error) {
        console.error('Error resetting password:', error);
        return false;
      }
    },
  
    assignLocker: async (userEmail, lockerId) => {
      try {
        const lockers = JSON.parse(localStorage.getItem(STORAGE_KEYS.lockers) || '[]');
        const users = JSON.parse(localStorage.getItem(STORAGE_KEYS.users) || '[]');
        
        // Update locker
        const locker = lockers.find(l => l.LockerID === lockerId);
        if (locker && locker.Status === 'Available') {
          locker.Status = 'Occupied';
          locker.UserEmail = userEmail;
          locker.AssignedDate = new Date().toISOString();
          
          // Update user
          const user = users.find(u => u.Email === userEmail);
          if (user) {
            user.LockerID = lockerId;
          }
          
          localStorage.setItem(STORAGE_KEYS.lockers, JSON.stringify(lockers));
          localStorage.setItem(STORAGE_KEYS.users, JSON.stringify(users));
          
          // Log transaction
          DatabaseOperations.logTransaction(userEmail, lockerId, 'ASSIGN', '', 'Success', 'Locker assigned to user');
          
          return true;
        }
        return false;
      } catch (error) {
        console.error('Error assigning locker:', error);
        return false;
      }
    },
  
    openLocker: async (lockerId) => {
      try {
        const lockers = JSON.parse(localStorage.getItem(STORAGE_KEYS.lockers) || '[]');
        const locker = lockers.find(l => l.LockerID === lockerId);
        
        if (locker) {
          locker.LastOpened = new Date().toISOString();
          localStorage.setItem(STORAGE_KEYS.lockers, JSON.stringify(lockers));
          
          // Log transaction
          DatabaseOperations.logTransaction(locker.UserEmail, lockerId, 'OPEN', '', 'Success', 'Locker opened');
          
          return true;
        }
        return false;
      } catch (error) {
        console.error('Error opening locker:', error);
        return false;
      }
    },
  
    closeLocker: async (lockerId) => {
      try {
        const lockers = JSON.parse(localStorage.getItem(STORAGE_KEYS.lockers) || '[]');
        const locker = lockers.find(l => l.LockerID === lockerId);
        
        if (locker) {
          locker.LastClosed = new Date().toISOString();
          localStorage.setItem(STORAGE_KEYS.lockers, JSON.stringify(lockers));
          
          // Log transaction
          DatabaseOperations.logTransaction(locker.UserEmail, lockerId, 'CLOSE', '', 'Success', 'Locker closed');
          
          return true;
        }
        return false;
      } catch (error) {
        console.error('Error closing locker:', error);
        return false;
      }
    },
  
    getAllUsers: async () => {
      try {
        return JSON.parse(localStorage.getItem(STORAGE_KEYS.users) || '[]');
      } catch (error) {
        console.error('Error getting users:', error);
        return [];
      }
    },
  
    getAllLockers: async () => {
      try {
        return JSON.parse(localStorage.getItem(STORAGE_KEYS.lockers) || '[]');
      } catch (error) {
        console.error('Error getting lockers:', error);
        return [];
      }
    },
  
    getAllOTPs: async () => {
      try {
        return JSON.parse(localStorage.getItem(STORAGE_KEYS.otps) || '[]');
      } catch (error) {
        console.error('Error getting OTPs:', error);
        return [];
      }
    },
  
    getAllTransactions: async () => {
      try {
        return JSON.parse(localStorage.getItem(STORAGE_KEYS.transactions) || '[]');
      } catch (error) {
        console.error('Error getting transactions:', error);
        return [];
      }
    },
  
    logTransaction: (userEmail, lockerId, action, otp = '', status = 'Success', notes = '') => {
      try {
        const transaction = {
          ID: generateId(),
          UserEmail: userEmail,
          LockerID: lockerId,
          Action: action,
          Timestamp: new Date().toISOString(),
          OTP: otp,
          Status: status,
          Notes: notes
        };
        
        const transactions = JSON.parse(localStorage.getItem(STORAGE_KEYS.transactions) || '[]');
        transactions.push(transaction);
        localStorage.setItem(STORAGE_KEYS.transactions, JSON.stringify(transactions));
        
        return transaction;
      } catch (error) {
        console.error('Error logging transaction:', error);
        return null;
      }
    },
  
    clearAllData: async () => {
      try {
        Object.keys(STORAGE_KEYS).forEach(key => {
          localStorage.removeItem(STORAGE_KEYS[key]);
        });
        initializeDefaultData();
        return true;
      } catch (error) {
        console.error('Error clearing data:', error);
        return false;
      }
    }
  };
  
  // Initialize database
  export const initializeDatabase = () => {
    initializeDefaultData();
  };
  
  // Get database statistics
  export const getDatabaseStats = () => {
    const stats = {};
    Object.keys(STORAGE_KEYS).forEach(key => {
      const data = JSON.parse(localStorage.getItem(STORAGE_KEYS[key]) || '[]');
      stats[key] = data.length;
    });
    return stats;
  };
  
  // Export database
  export const exportDatabase = async () => {
    try {
      const data = {
        users: await DatabaseOperations.getAllUsers(),
        lockers: await DatabaseOperations.getAllLockers(),
        otps: await DatabaseOperations.getAllOTPs(),
        transactions: await DatabaseOperations.getAllTransactions()
      };
      
      const jsonString = JSON.stringify(data, null, 2);
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `locker_database_${new Date().toISOString().split('T')[0]}.json`;
      link.click();
      URL.revokeObjectURL(url);
      
      return true;
    } catch (error) {
      console.error('Error exporting database:', error);
      return false;
    }
  };
  
  export default DatabaseOperations;