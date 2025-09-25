import { DatabaseOperations, db } from './database.js';

// Legacy compatibility functions
export const saveToCSV = (data, filename) => {
  console.warn('saveToCSV is deprecated. Use DatabaseOperations instead.');
  // Implementation for backward compatibility
};

export const loadFromCSV = (filename) => {
  console.warn('loadFromCSV is deprecated. Use DatabaseOperations instead.');
  return [];
};

// Initialize data files using new database
export const initializeDataFiles = () => {
  console.log('Initializing data files using new database system...');
  db.initializeDatabase();
};

// User management functions
export const registerUser = (userData) => {
  try {
    DatabaseOperations.users.create(userData);
    return true;
  } catch (error) {
    console.error('Error registering user:', error);
    return false;
  }
};

export const authenticateUser = (email, password) => {
  return DatabaseOperations.users.authenticate(email, password);
};

export const getUserByEmail = (email) => {
  return DatabaseOperations.users.findByEmail(email);
};

// Locker management functions
export const getAvailableLockers = () => {
  return DatabaseOperations.lockers.getAvailable();
};

export const assignLocker = (lockerId, userEmail) => {
  const success = DatabaseOperations.lockers.assign(lockerId, userEmail);
  if (success) {
    DatabaseOperations.transactions.log(userEmail, lockerId, 'ASSIGN', '', 'Success', 'Locker assigned to user');
  }
  return success;
};

export const getUserLocker = (userEmail) => {
  const locker = DatabaseOperations.lockers.getByUser(userEmail);
  return locker ? locker[0] : null; // Return LockerID
};

// OTP management functions
export const generateOTP = (phone, type = 'password_reset') => {
  const otpRecord = DatabaseOperations.otps.create(phone, type);
  return otpRecord[2]; // Return OTP
};

export const verifyOTP = (phone, otp) => {
  return DatabaseOperations.otps.verify(phone, otp);
};

export const updatePassword = (email, newPassword) => {
  const success = db.update('users', { Email: email }, { Password: newPassword });
  if (success) {
    DatabaseOperations.transactions.log(email, '', 'PASSWORD_RESET', '', 'Success', 'Password updated via OTP');
  }
  return success;
};

// Additional utility functions
export const getDatabaseStats = () => {
  return {
    users: db.getStats('users'),
    lockers: db.getStats('lockers'),
    otps: db.getStats('otps'),
    transactions: db.getStats('transactions'),
    settings: db.getStats('settings')
  };
};

export const exportDatabase = (format = 'xlsx') => {
  const tables = ['users', 'lockers', 'otps', 'transactions', 'settings'];
  const exportData = {};
  
  tables.forEach(table => {
    exportData[table] = db.exportTable(table, format);
  });
  
  return exportData;
};

export const cleanupExpiredOTPs = () => {
  DatabaseOperations.otps.cleanup();
};

// Export the database operations for direct use
export { DatabaseOperations, db };