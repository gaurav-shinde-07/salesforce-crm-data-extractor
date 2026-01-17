import React, { useState, FC } from 'react';

interface Contact {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  account?: string;
  title?: string;
}

interface ContactsTabProps {
  data: Contact[];
  onDelete: (objectType: string, recordId: string) => void;
  onSync: (objectType: string) => void;
}

const ContactsTab: FC<ContactsTabProps> = ({ data, onDelete, onSync }) => {
  const [searchTerm, setSearchTerm] = useState<string>('');

  const filteredData = data.filter(
    (contact) =>
      contact.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.account?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-4">
      <div className="mb-4 flex gap-2">
        <input
          type="text"
          placeholder="Search contacts by name, email, account..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          onClick={() => onSync('contacts')}
          className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 text-sm"
        >
          Sync
        </button>
      </div>

      {filteredData.length === 0 ? (
        <p className="text-gray-500 text-center py-8">No contacts extracted yet</p>
      ) : (
        <div className="space-y-3">
          {filteredData.map((contact) => (
            <div key={contact.id} className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900">{contact.name}</h4>
                  {contact.title && <p className="text-sm text-gray-600">{contact.title}</p>}
                  <p className="text-sm text-gray-500">{contact.email}</p>
                  <p className="text-sm text-gray-500">{contact.phone}</p>
                  <p className="text-sm text-gray-500">{contact.account}</p>
                </div>
                <button
                  onClick={() => onDelete('contacts', contact.id)}
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

export default ContactsTab;
