import { useState, useEffect } from 'react';
import { DatabaseOperations, getDatabaseStats, exportDatabase } from '../utils/localStorageDB.js';
import { Download, RefreshCw, Trash2, Eye, Settings, BarChart3 } from 'lucide-react';

const DatabaseManager = ({ onBack }) => {
  const [stats, setStats] = useState({});
  const [selectedTable, setSelectedTable] = useState('users');
  const [tableData, setTableData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadStats();
    loadTableData();
  }, [selectedTable]);

  const loadStats = async () => {
    try {
      const stats = getDatabaseStats();
      setStats(stats);
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const loadTableData = async () => {
    setIsLoading(true);
    try {
      let data = [];
      switch (selectedTable) {
        case 'users':
          data = await DatabaseOperations.getAllUsers();
          break;
        case 'lockers':
          data = await DatabaseOperations.getAllLockers();
          break;
        case 'otps':
          data = await DatabaseOperations.getAllOTPs();
          break;
        case 'transactions':
          data = await DatabaseOperations.getAllTransactions();
          break;
        default:
          data = [];
      }
      setTableData(data);
    } catch (error) {
      console.error('Error loading table data:', error);
      setTableData([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleExport = async () => {
    try {
      await exportDatabase();
      alert('Database exported successfully!');
    } catch (error) {
      console.error('Error exporting database:', error);
      alert('Failed to export database.');
    }
  };

  const handleClearData = async () => {
    if (window.confirm('Are you sure you want to clear all data? This action cannot be undone.')) {
      try {
        await DatabaseOperations.clearAllData();
        await loadStats();
        await loadTableData();
        alert('All data cleared successfully!');
      } catch (error) {
        console.error('Error clearing data:', error);
        alert('Failed to clear data.');
      }
    }
  };

  const getTableColumns = () => {
    switch (selectedTable) {
      case 'users':
        return ['ID', 'Name', 'Email', 'Phone', 'LockerID', 'RegistrationDate', 'LastLogin', 'Status'];
      case 'lockers':
        return ['LockerID', 'Status', 'UserEmail', 'AssignedDate', 'LastOpened', 'LastClosed', 'Location', 'Size'];
      case 'otps':
        return ['ID', 'Phone', 'OTP', 'Expiry', 'Type', 'Used', 'CreatedAt'];
      case 'transactions':
        return ['ID', 'UserEmail', 'LockerID', 'Action', 'Timestamp', 'Details'];
      default:
        return [];
    }
  };

  const formatValue = (value, column) => {
    if (value === null || value === undefined) return '-';
    if (column.includes('Date') || column.includes('Timestamp')) {
      return new Date(value).toLocaleString();
    }
    return value.toString();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Database Manager</h1>
              <p className="text-sm text-gray-600">Manage your locker system data</p>
            </div>
            <button
              onClick={onBack}
              className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900"
            >
              ← Back to Dashboard
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {Object.entries(stats).map(([table, count]) => (
            <div key={table} className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center">
                <div className="p-2 bg-indigo-100 rounded-lg">
                  <BarChart3 className="h-6 w-6 text-indigo-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 capitalize">{table}</p>
                  <p className="text-2xl font-bold text-gray-900">{count}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Controls */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center space-x-4">
              <select
                value={selectedTable}
                onChange={(e) => setSelectedTable(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="users">Users</option>
                <option value="lockers">Lockers</option>
                <option value="otps">OTPs</option>
                <option value="transactions">Transactions</option>
              </select>
              
              <button
                onClick={loadTableData}
                disabled={isLoading}
                className="flex items-center px-3 py-2 text-sm text-gray-600 hover:text-gray-900 disabled:opacity-50"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                Refresh
              </button>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={handleExport}
                className="flex items-center px-4 py-2 bg-green-600 text-white text-sm rounded-md hover:bg-green-700"
              >
                <Download className="h-4 w-4 mr-2" />
                Export Data
              </button>
              
              <button
                onClick={handleClearData}
                className="flex items-center px-4 py-2 bg-red-600 text-white text-sm rounded-md hover:bg-red-700"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Clear All Data
              </button>
            </div>
          </div>
        </div>

        {/* Data Table */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900 capitalize">
              {selectedTable} ({tableData.length} records)
            </h3>
          </div>
          
          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            </div>
          ) : tableData.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">No data available</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    {getTableColumns().map((column) => (
                      <th
                        key={column}
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        {column}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {tableData.map((row, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      {getTableColumns().map((column) => (
                        <td
                          key={column}
                          className="px-6 py-4 whitespace-nowrap text-sm text-gray-900"
                        >
                          {formatValue(row[column], column)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Pagination */}
        {tableData.length > 0 && (
          <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6 mt-4">
            <div className="flex-1 flex justify-between sm:hidden">
              <button className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
                Previous
              </button>
              <button className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
                Next
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Showing <span className="font-medium">1</span> to{' '}
                  <span className="font-medium">{tableData.length}</span> of{' '}
                  <span className="font-medium">{tableData.length}</span> results
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DatabaseManager;