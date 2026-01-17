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
    <div className="p-4 text-gray-200">
      {/* Search + Sync */}
      <div className="mb-4 flex gap-2">
        <input
          type="text"
          placeholder="Search contacts by name, email, account..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1 px-3 py-2 rounded-md text-sm bg-[#020617] border border-gray-700 text-gray-200 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500"
        />
        <button
          onClick={() => onSync('contacts')}
          className="px-4 py-2 bg-green-600 text-black rounded-md hover:bg-green-700 text-sm font-medium"
        >
          Sync
        </button>
      </div>

      {/* Empty State */}
      {filteredData.length === 0 ? (
        <p className="text-gray-400 text-center py-8">
          No contacts extracted yet
        </p>
      ) : (
        <div className="space-y-3">
          {filteredData.map((contact) => (
            <div
              key={contact.id}
              className="p-3 rounded-lg bg-[#0f172a] border border-gray-700 hover:border-green-500/50 transition"
            >
              <div className="flex justify-between items-start gap-3">
                <div className="flex-1">
                  <h4 className="font-semibold text-white">{contact.name}</h4>
                  {contact.title && (
                    <p className="text-sm text-gray-300">{contact.title}</p>
                  )}
                  {contact.email && (
                    <p className="text-sm text-gray-400">{contact.email}</p>
                  )}
                  {contact.phone && (
                    <p className="text-sm text-gray-400">{contact.phone}</p>
                  )}
                  {contact.account && (
                    <p className="text-sm text-green-400">{contact.account}</p>
                  )}
                </div>

                <button
                  onClick={() => onDelete('contacts', contact.id)}
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

export default ContactsTab;
