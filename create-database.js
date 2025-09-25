import * as XLSX from 'xlsx';

// Database configuration
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

// Create initial data
const createInitialData = () => {
  const data = {};

  // Users table (empty with headers)
  data.users = [DATABASE_CONFIG.users.columns];

  // Lockers table with initial data
  data.lockers = [DATABASE_CONFIG.lockers.columns];
  for (let i = 1; i <= 20; i++) {
    data.lockers.push([
      `L${i.toString().padStart(3, '0')}`, // LockerID
      'Available', // Status
      '', // UserEmail
      '', // AssignedDate
      '', // LastOpened
      '', // LastClosed
      `Floor ${Math.ceil(i / 5)}`, // Location
      i <= 10 ? 'Small' : 'Large' // Size
    ]);
  }

  // OTPs table (empty with headers)
  data.otps = [DATABASE_CONFIG.otps.columns];

  // Transactions table (empty with headers)
  data.transactions = [DATABASE_CONFIG.transactions.columns];

  // Settings table with initial data
  data.settings = [DATABASE_CONFIG.settings.columns];
  data.settings.push([
    'OTP_EXPIRY_SECONDS', '30', 'OTP expiry time in seconds', new Date().toISOString()
  ]);
  data.settings.push([
    'MAX_LOGIN_ATTEMPTS', '3', 'Maximum login attempts before lockout', new Date().toISOString()
  ]);
  data.settings.push([
    'LOCKER_COUNT', '20', 'Total number of lockers', new Date().toISOString()
  ]);
  data.settings.push([
    'SYSTEM_STATUS', 'ACTIVE', 'Current system status', new Date().toISOString()
  ]);

  return data;
};

// Create Excel file
const createExcelFile = () => {
  const workbook = XLSX.utils.book_new();
  const data = createInitialData();

  Object.keys(data).forEach(tableName => {
    const config = DATABASE_CONFIG[tableName];
    const ws = XLSX.utils.aoa_to_sheet(data[tableName]);
    XLSX.utils.book_append_sheet(workbook, ws, config.sheetName);
  });

  XLSX.writeFile(workbook, 'locker_database.xlsx');
  console.log('Database file created successfully: locker_database.xlsx');
};

createExcelFile();