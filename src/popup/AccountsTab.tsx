import React, { useState, FC } from 'react';

interface Account {
  id: string;
  name: string;
  industry?: string;
  phone?: string;
  website?: string;
}

interface AccountsTabProps {
  data: Account[];
  onDelete: (objectType: string, recordId: string) => void;
  onSync: (objectType: string) => void;
}

const AccountsTab: FC<AccountsTabProps> = ({ data, onDelete, onSync }) => {
  const [searchTerm, setSearchTerm] = useState<string>('');

  const filteredData = data.filter(
    (account) =>
      account.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      account.industry?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      account.website?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-4">
      <div className="mb-4 flex gap-2">
        <input
          type="text"
          placeholder="Search accounts by name, industry, website..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          onClick={() => onSync('accounts')}
          className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 text-sm"
        >
          Sync
        </button>
      </div>

      {filteredData.length === 0 ? (
        <p className="text-gray-500 text-center py-8">No accounts extracted yet</p>
      ) : (
        <div className="space-y-3">
          {filteredData.map((account) => (
            <div key={account.id} className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900">{account.name}</h4>
                  {account.industry && <p className="text-sm text-gray-600">{account.industry}</p>}
                  <p className="text-sm text-gray-500">{account.phone}</p>
                  {account.website && <p className="text-sm text-blue-500">{account.website}</p>}
                </div>
                <button
                  onClick={() => onDelete('accounts', account.id)}
                  className="text-red-500 hover:text-red-700 text-sm font-medium"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AccountsTab;
