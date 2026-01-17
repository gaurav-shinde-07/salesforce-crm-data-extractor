interface StorageData {
  leads: any[];
  contacts: any[];
  accounts: any[];
  opportunities: any[];
  tasks: any[];
  lastSync: Record<string, number>;
}

class StorageService {
  static async getData(): Promise<StorageData> {
    return new Promise((resolve) => {
      chrome.storage.local.get(['salesforce_data'], (result) => {
        resolve((result.salesforce_data as StorageData) || {
          leads: [],
          contacts: [],
          accounts: [],
          opportunities: [],
          tasks: [],
          lastSync: {}
        });
      });
    });
  }

  static async saveData(data: StorageData): Promise<boolean> {
    return new Promise((resolve) => {
      chrome.storage.local.set({ salesforce_data: data }, () => {
        resolve(true);
      });
    });
  }

  static async deleteRecord(objectType: string, recordId: string): Promise<boolean> {
    return new Promise((resolve) => {
      chrome.runtime.sendMessage(
        { action: 'deleteRecord', objectType, recordId },
        (response: any) => {
          resolve(response?.success || false);
        }
      );
    });
  }

  static async clearAll(): Promise<boolean> {
    return new Promise((resolve) => {
      chrome.runtime.sendMessage(
        { action: 'clearAllData' },
        (response: any) => {
          resolve(response?.success || false);
        }
      );
    });
  }

  static async extractCurrentObject(_tabId: number | null = null): Promise<any> {
    return new Promise((resolve) => {
      const queryOptions = { active: true, currentWindow: true };
      
      chrome.tabs.query(queryOptions, (tabs) => {
        if (tabs.length === 0) {
          resolve({ success: false, error: 'No active tab' });
          return;
        }

        const tab = tabs[0];
        if (!tab.id) {
          resolve({ success: false, error: 'No tab ID' });
          return;
        }

        chrome.scripting.executeScript(
          {
            target: { tabId: tab.id },
            files: ['content-script.js']
          },
          () => {
            setTimeout(() => {
              chrome.tabs.sendMessage(
                tab.id!,
                { action: 'extractCurrentObject' },
                (response: any) => {
                  if (chrome.runtime.lastError) {
                    resolve({ success: false, error: 'Content script failed to load' });
                  } else {
                    resolve(response);
                  }
                }
              );
            }, 100);
          }
        );
      });
    });
  }

  static async exportAsJSON(): Promise<void> {
    const data = await this.getData();
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `salesforce-data-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  static async exportAsCSV(): Promise<void> {
    const data = await this.getData();
    let csv = '';
    for (const [objectType, records] of Object.entries(data)) {
      if (objectType === 'lastSync' || !Array.isArray(records) || records.length === 0) continue;

      csv += `\n${objectType.toUpperCase()}\n`;
      const headers = Object.keys(records[0]);
      csv += headers.join(',') + '\n';

      records.forEach((record: any) => {
        const values = headers.map((header) => {
          const value = record[header];
          return typeof value === 'string' ? `"${value.replace(/"/g, '""')}"` : value;
        });
        csv += values.join(',') + '\n';
      });
    }

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `salesforce-data-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  static getLastSyncTime(objectType: string): number | null {
    let timestamp: number | null = null;
    chrome.storage.local.get(['salesforce_data'], (result: any) => {
      const data = result.salesforce_data || {};
      timestamp = data.lastSync?.[objectType] || null;
    });
    return timestamp;
  }

  static formatTimestamp(timestamp: number | null): string {
    if (!timestamp) return 'Never';
    const date = new Date(timestamp);
    return date.toLocaleString();
  }
}

export default StorageService;
