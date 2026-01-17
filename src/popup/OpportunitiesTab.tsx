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
    <div className="p-4 text-gray-200">
      {/* Search + Filter + Sync */}
      <div className="mb-4 space-y-3">
        <input
          type="text"
          placeholder="Search opportunities by name, account..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-3 py-2 rounded-md text-sm bg-[#020617] border border-gray-700 text-gray-200 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500"
        />

        <div className="flex gap-2">
          <select
            value={stageFilter}
            onChange={(e) => setStageFilter(e.target.value)}
            className="flex-1 px-3 py-2 rounded-md text-sm bg-[#020617] border border-gray-700 text-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500"
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
            className="px-4 py-2 bg-green-600 text-black rounded-md hover:bg-green-700 text-sm whitespace-nowrap font-medium"
          >
            Sync
          </button>
        </div>
      </div>

      {/* Empty State */}
      {filteredData.length === 0 ? (
        <p className="text-gray-400 text-center py-8">
          No opportunities in this stage
        </p>
      ) : (
        <div className="space-y-3">
          {filteredData.map((opportunity) => (
            <div
              key={opportunity.id}
              className="p-3 rounded-lg bg-[#0f172a] border border-gray-700 hover:border-green-500/50 transition"
            >
              <div className="flex justify-between items-start gap-3">
                <div className="flex-1">
                  <h4 className="font-semibold text-white">{opportunity.name}</h4>
                  {opportunity.account && (
                    <p className="text-sm text-gray-300">{opportunity.account}</p>
                  )}

                  <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-gray-400">Amount: </span>
                      <span className="font-semibold text-gray-200">
                        {opportunity.amount || 'N/A'}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-400">Probability: </span>
                      <span className="font-semibold text-gray-200">
                        {opportunity.probability || 'N/A'}%
                      </span>
                    </div>
                  </div>

                  <div className="mt-2 flex gap-2 flex-wrap">
                    <span className="px-2 py-1 bg-green-900/40 text-green-300 text-xs rounded">
                      {opportunity.stage || 'No Stage'}
                    </span>
                    {opportunity.closeDate && (
                      <span className="px-2 py-1 bg-gray-800 text-gray-300 text-xs rounded">
                        Close: {opportunity.closeDate}
                      </span>
                    )}
                  </div>
                </div>

                <button
                  onClick={() => onDelete('opportunities', opportunity.id)}
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

export default OpportunitiesTab;
