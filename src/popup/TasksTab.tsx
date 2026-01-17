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
    const matchesSearch = !searchTerm || task.subject?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.assignee?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All' || task.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getPriorityColor = (priority?: string): string => {
    switch (priority?.toLowerCase()) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="p-4">
      <div className="mb-4 space-y-3">
        <input
          type="text"
          placeholder="Search tasks by subject, assignee..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        <div className="flex gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
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
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 text-sm whitespace-nowrap"
          >
            Sync
          </button>
        </div>
      </div>

      {filteredData.length === 0 ? (
        <p className="text-gray-500 text-center py-8">No tasks found</p>
      ) : (
        <div className="space-y-3">
          {filteredData.map((task) => (
            <div key={task.id} className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900">{task.subject}</h4>
                  <p className="text-sm text-gray-600">Assigned to: {task.assignee || 'Unknown'}</p>
                  {task.dueDate && <p className="text-sm text-gray-500">Due: {task.dueDate}</p>}

                  <div className="mt-2 flex gap-2">
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                      {task.status || 'No Status'}
                    </span>
                    <span className={`px-2 py-1 text-xs rounded ${getPriorityColor(task.priority)}`}>
                      {task.priority || 'Normal'}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => onDelete('tasks', task.id)}
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

export default TasksTab;
