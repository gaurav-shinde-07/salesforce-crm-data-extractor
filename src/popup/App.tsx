import React, { useState, useEffect, FC } from 'react';
import LeadsTab from './LeadsTab';
import ContactsTab from './ContactsTab';
import AccountsTab from './AccountsTab';
import OpportunitiesTab from './OpportunitiesTab';
import TasksTab from './TasksTab';
import StorageService from '../utils/StorageService';

interface StorageData {
  leads: any[];
  contacts: any[];
  accounts: any[];
  opportunities: any[];
  tasks: any[];
  lastSync: Record<string, number>;
}

const App: FC = () => {
  const [activeTab, setActiveTab] = useState<string>('summary');
  const [data, setData] = useState<StorageData>({
    leads: [],
    contacts: [],
    accounts: [],
    opportunities: [],
    tasks: [],
    lastSync: {}
  });
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [message, setMessage] = useState<string>('');

  useEffect(() => {
    loadData();
    
    const handleStorageChange = (changes: Record<string, any>, areaName: string) => {
      if (areaName === 'local' && changes.salesforce_data) {
        setData(changes.salesforce_data.newValue || {
          leads: [],
          contacts: [],
          accounts: [],
          opportunities: [],
          tasks: [],
          lastSync: {}
        });
      }
    };

    chrome.storage.onChanged.addListener(handleStorageChange);
    
    const interval = setInterval(loadData, 2000);
    
    return () => {
      chrome.storage.onChanged.removeListener(handleStorageChange);
      clearInterval(interval);
    };
  }, []);

  const loadData = async () => {
    const storedData = await StorageService.getData();
    setData(storedData);
  };

  const handleSync = async (objectType: string) => {
    setIsLoading(true);
    setMessage(`Syncing ${objectType}...`);

    const response = await StorageService.extractCurrentObject();

    if (response?.success) {
      setMessage(`Synced ${response.count} ${response.objectType}`);
      await loadData();
      setTimeout(() => setMessage(''), 3000);
    } else {
      setMessage(`Failed to sync: ${response?.error}`);
      setTimeout(() => setMessage(''), 3000);
    }

    setIsLoading(false);
  };

  const handleDelete = async (objectType: string, recordId: string) => {
    if (window.confirm('Delete this record?')) {
      await StorageService.deleteRecord(objectType, recordId);
      await loadData();
    }
  };

  const handleClearAll = async () => {
    if (window.confirm('Clear all extracted data? This cannot be undone.')) {
      await StorageService.clearAll();
      await loadData();
    }
  };

  const handleExportJSON = () => {
    StorageService.exportAsJSON();
  };

  const handleExportCSV = () => {
    StorageService.exportAsCSV();
  };

  const totalRecords =
    data.leads.length +
    data.contacts.length +
    data.accounts.length +
    data.opportunities.length +
    data.tasks.length;

  const formatTime = (timestamp: number) => {
    if (!timestamp) return 'Never';
    const date = new Date(timestamp);
    return date.toLocaleTimeString();
  };

  return (
    <div className="w-full max-w-2xl bg-white">
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white p-4">
        <h1 className="text-lg font-bold">Salesforce CRM Extractor</h1>
        <p className="text-blue-100 text-sm">Extract and manage CRM data</p>
      </div>

      {message && (
        <div className="bg-blue-50 border-l-4 border-blue-500 p-3 mx-4 mt-4">
          <p className="text-sm text-blue-700">{message}</p>
        </div>
      )}

      {activeTab === 'summary' && (
        <div className="p-6">
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-gray-600 text-sm">Total Records</p>
              <p className="text-2xl font-bold text-blue-600">{totalRecords}</p>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg">
              <p className="text-gray-600 text-sm">Last Sync</p>
              <p className="text-xl font-bold text-purple-600">
                {formatTime(Math.max(...Object.values(data.lastSync) as number[]) || 0)}
              </p>
            </div>
          </div>

          <div className="space-y-3 mb-6">
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <span className="font-semibold text-gray-900">Leads</span>
              <span className="text-lg font-bold text-gray-600">{data.leads.length}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <span className="font-semibold text-gray-900">Contacts</span>
              <span className="text-lg font-bold text-gray-600">{data.contacts.length}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <span className="font-semibold text-gray-900">Accounts</span>
              <span className="text-lg font-bold text-gray-600">{data.accounts.length}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <span className="font-semibold text-gray-900">Opportunities</span>
              <span className="text-lg font-bold text-gray-600">{data.opportunities.length}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <span className="font-semibold text-gray-900">Tasks</span>
              <span className="text-lg font-bold text-gray-600">{data.tasks.length}</span>
            </div>
          </div>

          <div className="space-y-2">
            <button
              onClick={() => handleSync('current')}
              disabled={isLoading}
              className="w-full px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:bg-gray-400 font-medium"
            >
              {isLoading ? 'Syncing...' : 'Extract Current Page'}
            </button>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={handleExportJSON}
                className="px-3 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 text-sm font-medium"
              >
                Export JSON
              </button>
              <button
                onClick={handleExportCSV}
                className="px-3 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 text-sm font-medium"
              >
                Export CSV
              </button>
            </div>
            <button
              onClick={handleClearAll}
              className="w-full px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 text-sm font-medium"
            >
              Clear All Data
            </button>
          </div>
        </div>
      )}

      {activeTab === 'leads' && <LeadsTab data={data.leads} onDelete={handleDelete} onSync={handleSync} />}
      {activeTab === 'contacts' && <ContactsTab data={data.contacts} onDelete={handleDelete} onSync={handleSync} />}
      {activeTab === 'accounts' && <AccountsTab data={data.accounts} onDelete={handleDelete} onSync={handleSync} />}
      {activeTab === 'opportunities' && (
        <OpportunitiesTab data={data.opportunities} onDelete={handleDelete} onSync={handleSync} />
      )}
      {activeTab === 'tasks' && <TasksTab data={data.tasks} onDelete={handleDelete} onSync={handleSync} />}

      <div className="border-t border-gray-200 flex overflow-x-auto bg-gray-50">
        {[
          { id: 'summary', label: 'Summary', count: totalRecords },
          { id: 'leads', label: 'Leads', count: data.leads.length },
          { id: 'contacts', label: 'Contacts', count: data.contacts.length },
          { id: 'accounts', label: 'Accounts', count: data.accounts.length },
          { id: 'opportunities', label: 'Opportunities', count: data.opportunities.length },
          { id: 'tasks', label: 'Tasks', count: data.tasks.length }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 py-3 px-2 text-center text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
              activeTab === tab.id
                ? 'border-blue-500 text-blue-600 bg-white'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            <span>{tab.label}</span>
            <span className="ml-1 text-xs bg-gray-200 text-gray-700 px-2 py-0.5 rounded-full">
              {tab.count}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default App;
