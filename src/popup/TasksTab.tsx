import React, { useState, FC } from 'react';

interface Task {
  id: string;
  subject: string;
  dueDate?: string;
  status?: string;
  priority?: string;
  assignee?: string;
}

interface TasksTabProps {
  data: Task[];
  onDelete: (objectType: string, recordId: string) => void;
  onSync: (objectType: string) => void;
}

const TasksTab: FC<TasksTabProps> = ({ data, onDelete, onSync }) => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('All');

  const predefinedStatuses = ['Not Started', 'In Progress', 'Completed', 'Waiting on someone else', 'Deferred'];
  const extractedStatuses = Array.from(new Set(data.map(t => t.status).filter(Boolean) as string[]));
  const allStatuses = Array.from(new Set([...predefinedStatuses, ...extractedStatuses]));

  const filteredData = data.filter((task) => {
    const matchesSearch =
      !searchTerm ||
      task.subject?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.assignee?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All' || task.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getPriorityColor = (priority?: string): string => {
    switch (priority?.toLowerCase()) {
      case 'high':
        return 'bg-red-900/40 text-red-300';
      case 'medium':
        return 'bg-yellow-900/40 text-yellow-300';
      case 'low':
        return 'bg-green-900/40 text-green-300';
      default:
        return 'bg-gray-800 text-gray-300';
    }
  };

  return (
    <div className="p-4 text-gray-200">
      {/* Search + Filter + Sync */}
      <div className="mb-4 space-y-3">
        <input
          type="text"
          placeholder="Search tasks by subject, assignee..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-3 py-2 rounded-md text-sm bg-[#020617] border border-gray-700 text-gray-200 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500"
        />

        <div className="flex gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="flex-1 px-3 py-2 rounded-md text-sm bg-[#020617] border border-gray-700 text-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            <option value="All">All Statuses</option>
            {allStatuses.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
          <button
            onClick={() => onSync('tasks')}
            className="px-4 py-2 bg-green-600 text-black rounded-md hover:bg-green-700 text-sm whitespace-nowrap font-medium"
          >
            Sync
          </button>
        </div>
      </div>

      {/* Empty State */}
      {filteredData.length === 0 ? (
        <p className="text-gray-400 text-center py-8">
          No tasks found
        </p>
      ) : (
        <div className="space-y-3">
          {filteredData.map((task) => (
            <div
              key={task.id}
              className="p-3 rounded-lg bg-[#0f172a] border border-gray-700 hover:border-green-500/50 transition"
            >
              <div className="flex justify-between items-start gap-3">
                <div className="flex-1">
                  <h4 className="font-semibold text-white">{task.subject}</h4>
                  <p className="text-sm text-gray-300">
                    Assigned to: {task.assignee || 'Unknown'}
                  </p>
                  {task.dueDate && (
                    <p className="text-sm text-gray-400">
                      Due: {task.dueDate}
                    </p>
                  )}

                  <div className="mt-2 flex gap-2 flex-wrap">
                    <span className="px-2 py-1 bg-green-900/40 text-green-300 text-xs rounded">
                      {task.status || 'No Status'}
                    </span>
                    <span className={`px-2 py-1 text-xs rounded ${getPriorityColor(task.priority)}`}>
                      {task.priority || 'Normal'}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => onDelete('tasks', task.id)}
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

export default TasksTab;
