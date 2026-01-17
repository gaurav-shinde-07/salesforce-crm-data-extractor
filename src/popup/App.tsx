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
    <div className="w-full h-full flex flex-col bg-[#0b0f14] text-gray-200 shadow-xl">

      {/* Header */}
      <div className="bg-black border-b border-green-500/30 p-4">
        <h1 className="text-lg font-bold text-green-400">
          Salesforce CRM Data Extractor
        </h1>
        <p className="text-sm text-green-300/80">
          Extract and manage Salesforce CRM data seamlessly from the browser.
        </p>
      </div>

      {/* Message */}
      {message && (
        <div className="mx-4 mt-3 p-3 rounded-md bg-green-900/30 border border-green-500/40">
          <p className="text-sm text-green-300">{message}</p>
        </div>
      )}

      {/* MAIN CONTENT (SCROLLABLE — IMPORTANT) */}
      <div className="flex-1 overflow-y-auto">
        {activeTab === 'summary' && (
          <div className="p-5">
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-[#111827] p-4 rounded-lg border border-gray-700">
                <p className="text-sm text-gray-400">Total Records</p>
                <p className="text-2xl font-bold text-green-400">{totalRecords}</p>
              </div>
              <div className="bg-[#111827] p-4 rounded-lg border border-gray-700">
                <p className="text-sm text-gray-400">Last Sync</p>
                <p className="text-lg font-semibold text-green-300">
                  {formatTime(Math.max(...Object.values(data.lastSync) as number[]) || 0)}
                </p>
              </div>
            </div>

            <div className="space-y-2 mb-6">
              {[
                ['Leads', data.leads.length],
                ['Contacts', data.contacts.length],
                ['Accounts', data.accounts.length],
                ['Opportunities', data.opportunities.length],
                ['Tasks', data.tasks.length]
              ].map(([label, count]) => (
                <div
                  key={label}
                  className="flex justify-between items-center px-4 py-3 bg-[#0f172a] rounded-md border border-gray-700"
                >
                  <span className="font-medium">{label}</span>
                  <span className="text-green-400 font-bold">{count}</span>
                </div>
              ))}
            </div>

            <div className="space-y-3">
              <button
                onClick={() => handleSync('current')}
                disabled={isLoading}
                className="w-full py-2 rounded-md bg-green-600 hover:bg-green-700 text-black font-semibold disabled:opacity-50"
              >
                {isLoading ? 'Syncing...' : 'Extract Current Page'}
              </button>

              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={handleExportJSON}
                  className="py-2 rounded-md bg-[#1f2937] hover:bg-[#374151] border border-gray-600"
                >
                  Export JSON
                </button>
                <button
                  onClick={handleExportCSV}
                  className="py-2 rounded-md bg-[#1f2937] hover:bg-[#374151] border border-gray-600"
                >
                  Export CSV
                </button>
              </div>

              <button
                onClick={handleClearAll}
                className="w-full py-2 rounded-md bg-red-600/80 hover:bg-red-700 text-white"
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
      </div>

      {/* Bottom Tabs */}
      <div className="border-t border-gray-700 flex bg-[#020617]">
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
            className={`flex-1 py-3 px-2 text-sm font-medium transition ${
              activeTab === tab.id
                ? 'text-green-400 border-b-2 border-green-500'
                : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            {tab.label}
            <span className="ml-1 text-xs bg-gray-700 px-2 py-0.5 rounded-full">
              {tab.count}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default App;
