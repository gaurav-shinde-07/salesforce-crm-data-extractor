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
    <div className="p-4 text-gray-200">
      {/* Search + Sync */}
      <div className="mb-4 flex gap-2">
        <input
          type="text"
          placeholder="Search leads by name, company, email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1 px-3 py-2 rounded-md text-sm bg-[#020617] border border-gray-700 text-gray-200 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500"
        />
        <button
          onClick={() => onSync('leads')}
          className="px-4 py-2 bg-green-600 text-black rounded-md hover:bg-green-700 text-sm font-medium"
        >
          Sync
        </button>
      </div>

      {/* Empty State */}
      {filteredData.length === 0 ? (
        <p className="text-gray-400 text-center py-8">
          No leads extracted yet
        </p>
      ) : (
        <div className="space-y-3">
          {filteredData.map((lead) => (
            <div
              key={lead.id}
              className="p-3 rounded-lg bg-[#0f172a] border border-gray-700 hover:border-green-500/50 transition"
            >
              <div className="flex justify-between items-start gap-3">
                <div className="flex-1">
                  <h4 className="font-semibold text-white">{lead.name}</h4>
                  {lead.company && (
                    <p className="text-sm text-gray-300">{lead.company}</p>
                  )}
                  {lead.email && (
                    <p className="text-sm text-gray-400">{lead.email}</p>
                  )}
                  {lead.phone && (
                    <p className="text-sm text-gray-400">{lead.phone}</p>
                  )}
                  <span className="inline-block mt-2 px-2 py-1 bg-green-900/40 text-green-300 text-xs rounded">
                    {lead.status || 'Status Unknown'}
                  </span>
                </div>

                <button
                  onClick={() => onDelete('leads', lead.id)}
                  className="text-red-400 hover:text-red-500 text-sm font-medium"
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
