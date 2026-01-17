import React, { useState, FC } from 'react';

interface Lead {
  id: string;
  name: string;
  company?: string;
  email?: string;
  phone?: string;
  status?: string;
}

interface LeadsTabProps {
  data: Lead[];
  onDelete: (objectType: string, recordId: string) => void;
  onSync: (objectType: string) => void;
}

const LeadsTab: FC<LeadsTabProps> = ({ data, onDelete, onSync }) => {
  const [searchTerm, setSearchTerm] = useState<string>('');

  const filteredData = data.filter(
    (lead) =>
      lead.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.company?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-4">
      <div className="mb-4 flex gap-2">
        <input
          type="text"
          placeholder="Search leads by name, company, email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          onClick={() => onSync('leads')}
          className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 text-sm"
        >
          Sync
        </button>
      </div>

      {filteredData.length === 0 ? (
        <p className="text-gray-500 text-center py-8">No leads extracted yet</p>
      ) : (
        <div className="space-y-3">
          {filteredData.map((lead) => (
            <div key={lead.id} className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900">{lead.name}</h4>
                  <p className="text-sm text-gray-600">{lead.company}</p>
                  <p className="text-sm text-gray-500">{lead.email}</p>
                  <p className="text-sm text-gray-500">{lead.phone}</p>
                  <span className="inline-block mt-2 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                    {lead.status || 'Status Unknown'}
                  </span>
                </div>
                <button
                  onClick={() => onDelete('leads', lead.id)}
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

export default LeadsTab;
