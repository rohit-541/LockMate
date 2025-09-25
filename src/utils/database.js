import * as XLSX from 'xlsx';

// Database configuration - Single master file in project root
const MASTER_DATABASE_FILE = '../../locker_database.xlsx';

const DATABASE_CONFIG = {
  users: {
    sheetName: 'Users',
    columns: ['ID', 'Name', 'Email', 'Phone', 'Password', 'LockerID', 'RegistrationDate', 'LastLogin', 'Status']
  },
  lockers: {
    sheetName: 'Lockers',
    columns: ['LockerID', 'Status', 'UserEmail', 'AssignedDate', 'LastOpened', 'LastClosed', 'Location', 'Size']
  },
  otps: {
    sheetName: 'OTPs',
    columns: ['ID', 'Phone', 'OTP', 'Expiry', 'Type', 'Used', 'CreatedAt']
  },
  transactions: {
    sheetName: 'Transactions',
    columns: ['ID', 'UserEmail', 'LockerID', 'Action', 'Timestamp', 'OTP', 'Status', 'Notes']
  },
  settings: {
    sheetName: 'Settings',
    columns: ['Key', 'Value', 'Description', 'UpdatedAt']
  }
};

// Utility functions
const generateId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

// Core database operations
export class Database {
  constructor() {
    this.cache = new Map();
    this.masterData = {};
    this.initialized = false;
  }

  // Initialize all database files
  initializeDatabase() {
    if (this.initialized) {
      console.log('Database already initialized, skipping...');
      return;
    }

    console.log('Initializing database...');
    this.loadMasterFile();
    this.initialized = true;
    console.log('Database initialized successfully!');
  }

  // Load master file
  loadMasterFile() {
    try {
      const workbook = XLSX.readFile(MASTER_DATABASE_FILE);
      console.log('Master file found, loading data...');
      Object.keys(DATABASE_CONFIG).forEach(tableName => {
        const config = DATABASE_CONFIG[tableName];
        if (workbook.Sheets[config.sheetName]) {
          const worksheet = workbook.Sheets[config.sheetName];
          this.masterData[tableName] = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
        } else {
          this.masterData[tableName] = [];
        }
      });
    } catch (error) {
      console.error('Error loading master file:', error);
      // Initialize with empty data if file doesn't exist
      Object.keys(DATABASE_CONFIG).forEach(table => {
        this.masterData[table] = [];
      });
    }
  }

  // Load table data
  loadTable(tableName) {
    const config = DATABASE_CONFIG[tableName];
    if (!config) throw new Error(`Table ${tableName} not found`);

    // Check cache first
    if (this.cache.has(tableName)) {
      return this.cache.get(tableName);
    }

    // Load from master data
    const data = this.masterData[tableName] || [];
    this.cache.set(tableName, data);
    return data;
  }

  // Find records by condition
  find(tableName, condition) {
    const data = this.loadTable(tableName);
    if (!condition) return data.slice(1); // Return all data except headers

    return data.slice(1).filter(record => {
      return Object.keys(condition).every(key => {
        const columnIndex = DATABASE_CONFIG[tableName].columns.indexOf(key);
        return columnIndex !== -1 && record[columnIndex] === condition[key];
      });
    });
  }

  // Find one record by condition
  findOne(tableName, condition) {
    const results = this.find(tableName, condition);
    return results.length > 0 ? results[0] : null;
  }

  // Get table statistics
  getStats(tableName) {
    const data = this.loadTable(tableName);
    return {
      totalRecords: data.length - 1, // Exclude header
      columns: DATABASE_CONFIG[tableName].columns,
      lastUpdated: new Date().toISOString()
    };
  }

  // Clear cache
  clearCache() {
    this.cache.clear();
  }

  // Export table to different formats
  exportTable(tableName, format = 'xlsx') {
    const data = this.loadTable(tableName);
    
    switch (format) {
      case 'csv':
        return XLSX.utils.sheet_to_csv(XLSX.utils.aoa_to_sheet(data));
      case 'json':
        return JSON.stringify(data, null, 2);
      default:
        return data;
    }
  }
}

// Create global database instance
export const db = new Database();

// Convenience functions for common operations
export const DatabaseOperations = {
  // User operations
  users: {
    create: (userData) => {
      console.log('User creation not supported in read-only mode');
      return null;
    },

    findByEmail: (email) => {
      return db.findOne('users', { Email: email });
    },

    authenticate: (email, password) => {
      const user = db.findOne('users', { Email: email, Password: password });
      return user;
    },

    updatePassword: (email, newPassword) => {
      console.log('Password update not supported in read-only mode');
      return false;
    },

    updateLocker: (email, lockerId) => {
      console.log('Locker update not supported in read-only mode');
      return false;
    },

    getAll: () => {
      return db.find('users');
    }
  },

  // Locker operations
  lockers: {
    getAvailable: () => {
      return db.find('lockers', { Status: 'Available' });
    },

    assign: (lockerId, userEmail) => {
      console.log('Locker assignment not supported in read-only mode');
      return false;
    },

    release: (lockerId) => {
      console.log('Locker release not supported in read-only mode');
      return false;
    },

    open: (lockerId) => {
      console.log('Locker open not supported in read-only mode');
      return false;
    },

    close: (lockerId) => {
      console.log('Locker close not supported in read-only mode');
      return false;
    },

    getByUser: (userEmail) => {
      return db.findOne('lockers', { UserEmail: userEmail });
    },

    getAll: () => {
      return db.find('lockers');
    }
  },

  // OTP operations
  otps: {
    create: (phone, type = 'general') => {
      console.log('OTP creation not supported in read-only mode');
      return null;
    },

    verify: (phone, otp) => {
      console.log('OTP verification not supported in read-only mode');
      return false;
    },

    cleanup: () => {
      console.log('OTP cleanup not supported in read-only mode');
    },

    getAll: () => {
      return db.find('otps');
    }
  },

  // Transaction operations
  transactions: {
    log: (userEmail, lockerId, action, otp = '', status = 'Success', notes = '') => {
      console.log('Transaction logging not supported in read-only mode');
      return null;
    },

    getUserHistory: (userEmail) => {
      return db.find('transactions', { UserEmail: userEmail });
    },

    getLockerHistory: (lockerId) => {
      return db.find('transactions', { LockerID: lockerId });
    },

    getAll: () => {
      return db.find('transactions');
    }
  },

  // Settings operations
  settings: {
    get: (key) => {
      const setting = db.findOne('settings', { Key: key });
      return setting ? setting[1] : null; // Return value
    },

    set: (key, value, description = '') => {
      console.log('Settings update not supported in read-only mode');
      return false;
    },

    getAll: () => {
      return db.find('settings');
    }
  }
};

// Initialize database on import
export const initializeDatabase = () => {
  db.initializeDatabase();
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
  console.log('OTP cleanup not supported in read-only mode');
};

export default db;