interface StorageData {
  [key: string]: any;
  leads: any[];
  contacts: any[];
  accounts: any[];
  opportunities: any[];
  tasks: any[];
  lastSync: Record<string, number>;
}

interface ExtractMessage {
  action: 'extractData' | 'deleteRecord' | 'clearAllData';
  data?: any[];
  objectType?: string;
  recordId?: string;
}

chrome.runtime.onMessage.addListener((request: ExtractMessage, _sender, sendResponse) => {
  if (request.action === 'extractData') {
    const { data = [], objectType } = request;
    
    const validRecords = data.filter((record: any) => {
      const fieldCount = Object.values(record).filter(v => v && v.toString().trim().length > 0).length;
      return fieldCount > 1;
    });
    
    chrome.storage.local.get(['salesforce_data'], (result) => {
      const existing: StorageData = result.salesforce_data || {
        leads: [],
        contacts: [],
        accounts: [],
        opportunities: [],
        tasks: [],
        lastSync: {}
      };

      if (objectType && validRecords && validRecords.length > 0) {
        if (existing[objectType as keyof StorageData]) {
          validRecords.forEach((newRecord: any) => {
            const objectArray = existing[objectType as keyof StorageData] as any[];
            const existingIndex = objectArray.findIndex((r: any) => r.id === newRecord.id);
            if (existingIndex >= 0) {
              objectArray[existingIndex] = { ...objectArray[existingIndex], ...newRecord };
            } else {
              objectArray.push(newRecord);
            }
          });
        }

        existing.lastSync[objectType] = Date.now();
      }

      chrome.storage.local.set({ salesforce_data: existing }, () => {
        sendResponse({ success: true, count: validRecords.length, objectType, message: `Stored ${validRecords?.length || 0} ${objectType}` });
      });
    });
    return true;
  }

  if (request.action === 'deleteRecord') {
    const { objectType, recordId } = request;
    
    chrome.storage.local.get(['salesforce_data'], (result) => {
      const data: StorageData = result.salesforce_data || {};
      
      if (data[objectType as keyof StorageData]) {
        const objectArray = data[objectType as keyof StorageData] as any[];
        data[objectType as keyof StorageData] = objectArray.filter((record: any) => record.id !== recordId);
      }

      chrome.storage.local.set({ salesforce_data: data }, () => {
        sendResponse({ success: true });
      });
    });

    return true;
  }

  if (request.action === 'clearAllData') {
    const newData: StorageData = {
      leads: [],
      contacts: [],
      accounts: [],
      opportunities: [],
      tasks: [],
      lastSync: {}
    };
    chrome.storage.local.set({ 
      salesforce_data: newData
    }, () => {
      sendResponse({ success: true });
    });

    return true;
  }
});

chrome.storage.onChanged.addListener((changes, areaName) => {
  if (areaName === 'local' && changes.salesforce_data) {
    chrome.runtime.sendMessage({
      action: 'storageUpdated',
      data: changes.salesforce_data.newValue
    }).catch(() => {
    });
  }
});
