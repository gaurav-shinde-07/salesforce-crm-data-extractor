import React, { useState, useMemo, FC } from 'react';

interface Opportunity {
  id: string;
  name: string;
  account?: string;
  stage?: string;
  amount?: string;
  probability?: string;
  closeDate?: string;
}

interface OpportunitiesTabProps {
  data: Opportunity[];
  onDelete: (objectType: string, recordId: string) => void;
  onSync: (objectType: string) => void;
}

const OpportunitiesTab: FC<OpportunitiesTabProps> = ({ data, onDelete, onSync }) => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [stageFilter, setStageFilter] = useState<string>('All');

  const predefinedStages = ['Prospecting', 'Qualification', 'Proposal', 'Negotiation', 'Closed Won', 'Closed Lost'];
  const extractedStages = Array.from(new Set(data.map(o => o.stage).filter(Boolean) as string[]));
  const allStages = Array.from(new Set([...predefinedStages, ...extractedStages]));
  
  const opportunitiesByStage = useMemo(() => {
    const grouped: Record<string, Opportunity[]> = {};
    allStages.forEach((stage) => {
      grouped[stage] = [];
    });
    grouped['Other'] = [];

    data.forEach((opp) => {
      const stage = opp.stage || 'Other';
      if (stage in grouped) {
        grouped[stage].push(opp);
      } else {
        grouped['Other'].push(opp);
      }
    });

    return grouped;
  }, [data, allStages]);

  const filteredData =
    stageFilter === 'All'
      ? data.filter((opp) =>
          opp.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          opp.account?.toLowerCase().includes(searchTerm.toLowerCase())
        )
      : (opportunitiesByStage[stageFilter] || []).filter((opp) =>
          opp.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          opp.account?.toLowerCase().includes(searchTerm.toLowerCase())
        );

  return (
    <div className="p-4">
      <div className="mb-4 space-y-3">
        <input
          type="text"
          placeholder="Search opportunities by name, account..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        <div className="flex gap-2">
          <select
            value={stageFilter}
            onChange={(e) => setStageFilter(e.target.value)}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="All">All Stages</option>
            {allStages.map((stage) => (
              <option key={stage} value={stage}>
                {stage}
              </option>
            ))}
          </select>
          <button
            onClick={() => onSync('opportunities')}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 text-sm whitespace-nowrap"
          >
            Sync
          </button>
        </div>
      </div>

      {filteredData.length === 0 ? (
        <p className="text-gray-500 text-center py-8">No opportunities in this stage</p>
      ) : (
        <div className="space-y-3">
          {filteredData.map((opportunity) => (
            <div key={opportunity.id} className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900">{opportunity.name}</h4>
                  <p className="text-sm text-gray-600">{opportunity.account}</p>

                  <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-gray-600">Amount: </span>
                      <span className="font-semibold text-gray-900">{opportunity.amount || 'N/A'}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Probability: </span>
                      <span className="font-semibold text-gray-900">{opportunity.probability || 'N/A'}%</span>
                    </div>
                  </div>

                  <div className="mt-2 flex gap-2">
                    <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded">
                      {opportunity.stage || 'No Stage'}
                    </span>
                    {opportunity.closeDate && (
                      <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded">
                        Close: {opportunity.closeDate}
                      </span>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => onDelete('opportunities', opportunity.id)}
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

export default OpportunitiesTab;
