const SALESFORCE_OBJECTS = {
  LEADS: 'leads',
  CONTACTS: 'contacts',
  ACCOUNTS: 'accounts',
  OPPORTUNITIES: 'opportunities',
  TASKS: 'tasks'
} as const;

type SalesforceObjectType = typeof SALESFORCE_OBJECTS[keyof typeof SALESFORCE_OBJECTS];

interface ExtractedRecord {
  id: string;
  [key: string]: string | number;
}

function detectObjectType(): SalesforceObjectType | null {
  const url = window.location.href;

  if (url.includes('/lightning/o/Lead/')) return SALESFORCE_OBJECTS.LEADS;
  if (url.includes('/lightning/o/Contact/')) return SALESFORCE_OBJECTS.CONTACTS;
  if (url.includes('/lightning/o/Account/')) return SALESFORCE_OBJECTS.ACCOUNTS;
  if (url.includes('/lightning/o/Opportunity/')) return SALESFORCE_OBJECTS.OPPORTUNITIES;
  if (url.includes('/lightning/o/Task/')) return SALESFORCE_OBJECTS.TASKS;

  const title = document.title.toLowerCase();
  if (title.includes('lead')) return SALESFORCE_OBJECTS.LEADS;
  if (title.includes('contact')) return SALESFORCE_OBJECTS.CONTACTS;
  if (title.includes('account')) return SALESFORCE_OBJECTS.ACCOUNTS;
  if (title.includes('opportunity')) return SALESFORCE_OBJECTS.OPPORTUNITIES;
  if (title.includes('task')) return SALESFORCE_OBJECTS.TASKS;

  return null;
}

function extractValueFromContext(text: string, fieldType: string): string {
  const patterns: Record<string, RegExp[]> = {
    email: [/([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/],
    phone: [/\+?1?\s*\(?([0-9]{3})\)?[-.\s]?([0-9]{3})[-.\s]?([0-9]{4})/],
    company: [/company[:\s]+([^,\n]+)/i, /account[:\s]+([^,\n]+)/i],
    status: [/status[:\s]+([^,\n]+)/i, /(open|closed|converted|not started|in progress|completed|waiting|deferred)/i],
    stage: [/stage[:\s]+([^,\n]+)/i, /(prospecting|qualification|proposal|negotiation|closed won|closed lost)/i],
    source: [/source[:\s]+([^,\n]+)/i, /(web|phone|referral|campaign)/i],
    owner: [/owner[:\s]+([^,\n]+)/i, /assigned[:\s]+([^,\n]+)/i]
  };
  
  const regexes = patterns[fieldType] || [];
  for (let regex of regexes) {
    const match = text.match(regex);
    if (match) return match[1] || match[0];
  }
  return '';
}

const EXTRACTORS: Record<SalesforceObjectType, () => ExtractedRecord[]> = {
  leads: extractLeads,
  contacts: extractContacts,
  accounts: extractAccounts,
  opportunities: extractOpportunities,
  tasks: extractTasks
};

function extractLeads(): ExtractedRecord[] {
  const leads: ExtractedRecord[] = [];
  
  let rows = document.querySelectorAll('[role="row"]');
  if (rows.length > 0) {
    rows.forEach((row) => {
      const recordId = (row as HTMLElement).getAttribute('data-record-id');
      if (!recordId) return;
      
      const cells = row.querySelectorAll('[role="gridcell"]');
      if (cells.length >= 5) {
        const nameCell = (cells[0] as HTMLElement)?.innerText?.trim() || '';
        if (!nameCell || nameCell === 'Name' || nameCell === 'Developer Edition') return;
        
        leads.push({
          id: recordId,
          name: nameCell,
          company: (cells[1] as HTMLElement)?.innerText?.trim() || '',
          email: (cells[2] as HTMLElement)?.innerText?.trim() || '',
          phone: (cells[3] as HTMLElement)?.innerText?.trim() || '',
          leadSource: (cells.length > 5 ? (cells[5] as HTMLElement)?.innerText?.trim() : '') || '',
          status: (cells[4] as HTMLElement)?.innerText?.trim() || '',
          owner: (cells.length > 6 ? (cells[6] as HTMLElement)?.innerText?.trim() : '') || ''
        });
      }
    });
  }
  
  if (leads.length === 0) {
    const allLinks = document.querySelectorAll('a[href]');
    const seen = new Set<string>();
    const leadIdPattern = /\/([a-zA-Z0-9]{18})(?:\/|$|\?)/;
    
    allLinks.forEach((link) => {
      const href = (link as HTMLAnchorElement).href;
      if (!href.includes('00Q')) return;
      
      const match = href.match(leadIdPattern);
      if (!match) return;
      
      const recordId = match[1];
      if (seen.has(recordId)) return;
      seen.add(recordId);
      
      const name = (link as HTMLElement).innerText.trim();
      if (!name || name.length < 2 || name.includes('My') || name.startsWith('Mr.')) return;
      
      const parent = (link as HTMLElement).closest('tr') || (link as HTMLElement).closest('li') || (link as HTMLElement).closest('div');
      const parentText = parent?.innerText || '';
      
      leads.push({
        id: recordId,
        name: name,
        company: extractValueFromContext(parentText, 'company'),
        email: extractValueFromContext(parentText, 'email'),
        phone: extractValueFromContext(parentText, 'phone'),
        status: extractValueFromContext(parentText, 'status'),
        leadSource: extractValueFromContext(parentText, 'source'),
        owner: extractValueFromContext(parentText, 'owner')
      });
    });
  }

  return leads;
}

function extractContacts(): ExtractedRecord[] {
  const contacts: ExtractedRecord[] = [];

  const rows = document.querySelectorAll('[role="row"]');
  if (rows.length > 0) {
    rows.forEach((row) => {
      const recordId = (row as HTMLElement).getAttribute('data-record-id');
      if (!recordId) return;
      
      const cells = row.querySelectorAll('[role="gridcell"]');
      if (cells.length >= 5) {
        const nameCell = (cells[0] as HTMLElement)?.innerText?.trim() || '';
        if (!nameCell || nameCell === 'Name') return;
        
        contacts.push({
          id: recordId,
          name: nameCell,
          email: (cells[1] as HTMLElement)?.innerText?.trim() || '',
          phone: (cells[2] as HTMLElement)?.innerText?.trim() || '',
          accountName: (cells[3] as HTMLElement)?.innerText?.trim() || '',
          title: (cells[4] as HTMLElement)?.innerText?.trim() || '',
          contactOwner: (cells.length > 5 ? (cells[5] as HTMLElement)?.innerText?.trim() : '') || '',
          mailingAddress: (cells.length > 6 ? (cells[6] as HTMLElement)?.innerText?.trim() : '') || ''
        });
      }
    });
  }
  
  if (contacts.length === 0) {
    const allLinks = document.querySelectorAll('a[href]');
    const seen = new Set<string>();
    const contactIdPattern = /\/([a-zA-Z0-9]{18})(?:\/|$|\?)/;
    
    allLinks.forEach((link) => {
      const href = (link as HTMLAnchorElement).href;
      if (!href.includes('003')) return;
      
      const match = href.match(contactIdPattern);
      if (!match) return;
      
      const recordId = match[1];
      if (seen.has(recordId)) return;
      seen.add(recordId);
      
      const name = (link as HTMLElement).innerText.trim();
      if (!name || name.length < 2 || name.includes('My') || name.startsWith('Mr.')) return;
      
      const parent = (link as HTMLElement).closest('tr') || (link as HTMLElement).closest('li') || (link as HTMLElement).closest('div');
      const parentText = parent?.innerText || '';
      
      contacts.push({
        id: recordId,
        name: name,
        email: extractValueFromContext(parentText, 'email'),
        phone: extractValueFromContext(parentText, 'phone'),
        accountName: extractValueFromContext(parentText, 'company'),
        title: extractValueFromContext(parentText, 'title'),
        contactOwner: extractValueFromContext(parentText, 'owner'),
        mailingAddress: ''
      });
    });
  }

  return contacts;
}

function extractAccounts(): ExtractedRecord[] {
  const accounts: ExtractedRecord[] = [];

  const rows = document.querySelectorAll('[role="row"]');
  if (rows.length > 0) {
    rows.forEach((row) => {
      const recordId = (row as HTMLElement).getAttribute('data-record-id');
      if (!recordId) return;
      
      const cells = row.querySelectorAll('[role="gridcell"]');
      if (cells.length >= 4) {
        const accountNameCell = (cells[0] as HTMLElement)?.innerText?.trim() || '';
        if (!accountNameCell || accountNameCell === 'Account Name') return;
        
        accounts.push({
          id: recordId,
          accountName: accountNameCell,
          website: (cells.length > 3 ? (cells[3] as HTMLElement)?.innerText?.trim() : '') || '',
          phone: (cells[2] as HTMLElement)?.innerText?.trim() || '',
          industry: (cells[1] as HTMLElement)?.innerText?.trim() || '',
          type: (cells.length > 4 ? (cells[4] as HTMLElement)?.innerText?.trim() : '') || '',
          accountOwner: (cells.length > 5 ? (cells[5] as HTMLElement)?.innerText?.trim() : '') || '',
          annualRevenue: (cells.length > 6 ? (cells[6] as HTMLElement)?.innerText?.trim() : '') || ''
        });
      }
    });
  }
  
  if (accounts.length === 0) {
    const allLinks = document.querySelectorAll('a[href]');
    const seen = new Set<string>();
    const accountIdPattern = /\/([a-zA-Z0-9]{18})(?:\/|$|\?)/;
    
    allLinks.forEach((link) => {
      const href = (link as HTMLAnchorElement).href;
      if (!href.includes('001')) return;
      
      const match = href.match(accountIdPattern);
      if (!match) return;
      
      const recordId = match[1];
      if (seen.has(recordId)) return;
      seen.add(recordId);
      
      const name = (link as HTMLElement).innerText.trim();
      if (!name || name.length < 2 || name.includes('My')) return;
      
      const parent = (link as HTMLElement).closest('tr') || (link as HTMLElement).closest('li') || (link as HTMLElement).closest('div');
      const parentText = parent?.innerText || '';
      
      accounts.push({
        id: recordId,
        accountName: name,
        website: extractValueFromContext(parentText, 'website'),
        phone: extractValueFromContext(parentText, 'phone'),
        industry: extractValueFromContext(parentText, 'industry'),
        type: '',
        accountOwner: extractValueFromContext(parentText, 'owner'),
        annualRevenue: ''
      });
    });
  }

  return accounts;
}

function extractOpportunities(): ExtractedRecord[] {
  const opportunities: ExtractedRecord[] = [];

  const kanbanCards = document.querySelectorAll('[data-qa="kanban-card"]');
  if (kanbanCards.length > 0) {
    kanbanCards.forEach((card) => {
      opportunities.push({
        id: (card as HTMLElement).getAttribute('data-record-id') || generateId(),
        opportunityName: (card.querySelector('[data-qa="card-title"]') as HTMLElement)?.innerText?.trim() || '',
        stage: (document.querySelector('[data-qa="card-stage"]') as HTMLElement)?.innerText?.trim() || '',
        amount: (card.querySelector('[data-qa="card-amount"]') as HTMLElement)?.innerText?.trim() || '',
        probability: (card.querySelector('[data-qa="card-probability"]') as HTMLElement)?.innerText?.trim() || '',
        closeDate: (card.querySelector('[data-qa="card-close-date"]') as HTMLElement)?.innerText?.trim() || '',
        forecastCategory: (card.querySelector('[data-qa="card-forecast"]') as HTMLElement)?.innerText?.trim() || '',
        opportunityOwner: (card.querySelector('[data-qa="card-owner"]') as HTMLElement)?.innerText?.trim() || '',
        associatedAccount: ''
      });
    });
  }

  if (opportunities.length === 0) {
    const rows = document.querySelectorAll('[role="row"]');
    if (rows.length > 0) {
      rows.forEach((row) => {
        const recordId = (row as HTMLElement).getAttribute('data-record-id');
        if (!recordId) return;
        
        const cells = row.querySelectorAll('[role="gridcell"]');
        if (cells.length >= 6) {
          const oppNameCell = (cells[0] as HTMLElement)?.innerText?.trim() || '';
          if (!oppNameCell || oppNameCell === 'Opportunity Name') return;
          
          opportunities.push({
            id: recordId,
            opportunityName: oppNameCell,
            stage: (cells[1] as HTMLElement)?.innerText?.trim() || '',
            amount: (cells[2] as HTMLElement)?.innerText?.trim() || '',
            probability: (cells[3] as HTMLElement)?.innerText?.trim() || '',
            closeDate: (cells[4] as HTMLElement)?.innerText?.trim() || '',
            forecastCategory: (cells.length > 6 ? (cells[6] as HTMLElement)?.innerText?.trim() : '') || '',
            opportunityOwner: (cells.length > 7 ? (cells[7] as HTMLElement)?.innerText?.trim() : '') || '',
            associatedAccount: (cells[5] as HTMLElement)?.innerText?.trim() || ''
          });
        }
      });
    }
  }
  
  if (opportunities.length === 0) {
    const allLinks = document.querySelectorAll('a[href]');
    const seen = new Set<string>();
    const opportunityIdPattern = /\/([a-zA-Z0-9]{18})(?:\/|$|\?)/;
    
    allLinks.forEach((link) => {
      const href = (link as HTMLAnchorElement).href;
      if (!href.includes('006')) return;
      
      const match = href.match(opportunityIdPattern);
      if (!match) return;
      
      const recordId = match[1];
      if (seen.has(recordId)) return;
      seen.add(recordId);
      
      const name = (link as HTMLElement).innerText.trim();
      if (!name || name.length < 2 || name.includes('My')) return;
      
      const parent = (link as HTMLElement).closest('tr') || (link as HTMLElement).closest('li') || (link as HTMLElement).closest('div');
      const parentText = parent?.innerText || '';
      
      opportunities.push({
        id: recordId,
        opportunityName: name,
        stage: extractValueFromContext(parentText, 'stage'),
        amount: extractValueFromContext(parentText, 'amount'),
        probability: extractValueFromContext(parentText, 'probability'),
        closeDate: extractValueFromContext(parentText, 'closeDate'),
        forecastCategory: '',
        opportunityOwner: extractValueFromContext(parentText, 'owner'),
        associatedAccount: extractValueFromContext(parentText, 'account')
      });
    });
  }

  return opportunities;
}

function extractTasks(): ExtractedRecord[] {
  const tasks: ExtractedRecord[] = [];

  const rows = document.querySelectorAll('[role="row"]');
  if (rows.length > 0) {
    rows.forEach((row) => {
      const recordId = (row as HTMLElement).getAttribute('data-record-id');
      if (!recordId) return;
      
      const cells = row.querySelectorAll('[role="gridcell"]');
      if (cells.length >= 5) {
        const subjectCell = (cells[0] as HTMLElement)?.innerText?.trim() || '';
        if (!subjectCell || subjectCell === 'Subject') return;
        
        tasks.push({
          id: recordId,
          subject: subjectCell,
          dueDate: (cells[1] as HTMLElement)?.innerText?.trim() || '',
          status: (cells[2] as HTMLElement)?.innerText?.trim() || '',
          priority: (cells[3] as HTMLElement)?.innerText?.trim() || '',
          relatedTo: (cells.length > 5 ? (cells[5] as HTMLElement)?.innerText?.trim() : '') || '',
          assignedTo: (cells[4] as HTMLElement)?.innerText?.trim() || ''
        });
      }
    });
  }
  
  if (tasks.length === 0) {
    const allLinks = document.querySelectorAll('a[href]');
    const seen = new Set<string>();
    const taskIdPattern = /\/([a-zA-Z0-9]{18})(?:\/|$|\?)/;
    
    allLinks.forEach((link) => {
      const href = (link as HTMLAnchorElement).href;
      if (!href.includes('00T')) return;
      
      const match = href.match(taskIdPattern);
      if (!match) return;
      
      const recordId = match[1];
      if (seen.has(recordId)) return;
      seen.add(recordId);
      
      const name = (link as HTMLElement).innerText.trim();
      if (!name || name.length < 2 || name.includes('My')) return;
      
      const parent = (link as HTMLElement).closest('tr') || (link as HTMLElement).closest('li') || (link as HTMLElement).closest('div');
      const parentText = parent?.innerText || '';
      
      tasks.push({
        id: recordId,
        subject: name,
        dueDate: extractValueFromContext(parentText, 'dueDate'),
        status: extractValueFromContext(parentText, 'status'),
        priority: extractValueFromContext(parentText, 'priority'),
        relatedTo: extractValueFromContext(parentText, 'relatedTo'),
        assignedTo: extractValueFromContext(parentText, 'assignedTo')
      });
    });
  }

  return tasks;
}

function extractDetailView(objectTypeParam: string): ExtractedRecord | null {
  const record: ExtractedRecord = {
    id: extractFieldValue('ID') || generateId(),
    name: '',
    opportunityName: '',
    accountName: '',
    stage: '',
    amount: '',
    probability: '',
    closeDate: '',
    forecastCategory: '',
    opportunityOwner: '',
    associatedAccount: '',
    email: '',
    phone: '',
    industry: '',
    website: '',
    type: '',
    accountOwner: '',
    annualRevenue: '',
    subject: '',
    dueDate: '',
    status: '',
    priority: '',
    relatedTo: '',
    assignedTo: '',
    company: '',
    title: '',
    contactOwner: '',
    mailingAddress: '',
    leadSource: '',
    owner: ''
  };

  const fieldElements = document.querySelectorAll('[data-qa*="field"]');
  fieldElements.forEach((el) => {
    const label = (el.querySelector('label') as HTMLElement)?.innerText?.toLowerCase() || '';
    const value = (el.querySelector('[class*="value"], span:not(label)') as HTMLElement)?.innerText?.trim() || '';

    if (label.includes('name')) record.name = value;
    if (label.includes('opportunity name')) record.opportunityName = value;
    if (label.includes('account name')) record.accountName = value;
    if (label.includes('stage')) record.stage = value;
    if (label.includes('amount')) record.amount = value;
    if (label.includes('probability')) record.probability = value;
    if (label.includes('close date')) record.closeDate = value;
    if (label.includes('forecast category')) record.forecastCategory = value;
    if (label.includes('opportunity owner')) record.opportunityOwner = value;
    if (label.includes('associated account')) record.associatedAccount = value;
    if (label.includes('account owner')) record.accountOwner = value;
    if (label.includes('contact owner')) record.contactOwner = value;
    if (label.includes('email')) record.email = value;
    if (label.includes('phone')) record.phone = value;
    if (label.includes('industry')) record.industry = value;
    if (label.includes('website')) record.website = value;
    if (label.includes('type')) record.type = value;
    if (label.includes('annual revenue')) record.annualRevenue = value;
    if (label.includes('subject')) record.subject = value;
    if (label.includes('due date')) record.dueDate = value;
    if (label.includes('status')) record.status = value;
    if (label.includes('priority')) record.priority = value;
    if (label.includes('related to')) record.relatedTo = value;
    if (label.includes('assigned')) record.assignedTo = value;
    if (label.includes('company')) record.company = value;
    if (label.includes('title')) record.title = value;
    if (label.includes('mailing address')) record.mailingAddress = value;
    if (label.includes('lead source')) record.leadSource = value;
    if (label.includes('owner')) record.owner = value;
  });

  if (!record.name && !record.opportunityName && !record.accountName) {
    const heading = document.querySelector('h1, [class*="title"]');
    record.name = (heading as HTMLElement)?.innerText?.trim() || '';
  }

  return record.name || record.opportunityName || record.accountName ? record : null;
}

function extractFieldValue(fieldLabel: string): string {
  const fields = document.querySelectorAll('[role="main"] *');
  for (let field of fields) {
    if ((field as HTMLElement).innerText?.includes(fieldLabel)) {
      return ((field.nextElementSibling as HTMLElement)?.innerText?.trim() || '');
    }
  }
  return '';
}

function generateId(): string {
  return `extracted_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

function showExtractionStatus(
  status: 'success' | 'error' | 'loading',
  message: string,
  objectType: string | null
): void {
  const host = document.createElement('div');
  host.id = 'sf-extractor-status';
  
  const shadow = host.attachShadow({ mode: 'open' });

  const statusClass = status === 'success' ? 'bg-success' : status === 'error' ? 'bg-error' : 'bg-loading';
  const icon = status === 'success' ? '[OK]' : status === 'error' ? '[ERROR]' : '[WAIT]';

  shadow.innerHTML = `
    <style>
      .status-indicator {
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 12px 20px;
        border-radius: 8px;
        color: white;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto;
        font-size: 14px;
        z-index: 999999;
        animation: slideIn 0.3s ease-out;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      }
      
      @keyframes slideIn {
        from {
          transform: translateX(400px);
          opacity: 0;
        }
        to {
          transform: translateX(0);
          opacity: 1;
        }
      }
      
      .bg-success { background-color: #10b981; }
      .bg-error { background-color: #ef4444; }
      .bg-loading { background-color: #3b82f6; }
      
      .icon { margin-right: 8px; font-weight: bold; }
    </style>
    <div class="status-indicator ${statusClass}">
      <span class="icon">${icon}</span>
      <span>${message}</span>
    </div>
  `;

  document.body.appendChild(host);

  setTimeout(() => {
    host.remove();
  }, 3000);
}

chrome.runtime.onMessage.addListener((request: any, _sender, sendResponse) => {
  if (request.action === 'extractCurrentObject') {
    const objectType = detectObjectType();

    if (!objectType) {
      showExtractionStatus('error', 'Could not detect Salesforce object type', null);
      sendResponse({ success: false, error: 'Unknown object type' });
      return;
    }

    showExtractionStatus('loading', `Extracting ${objectType}...`, objectType);

    const extractor = EXTRACTORS[objectType];
    if (!extractor) {
      showExtractionStatus('error', `Unsupported object: ${objectType}`, objectType);
      sendResponse({ success: false, error: 'Unsupported object' });
      return;
    }

    const data = extractor();

    if (data.length === 0) {
      showExtractionStatus('error', 'No data found to extract', objectType);
      sendResponse({ success: false, error: 'No data found' });
      return;
    }

    chrome.runtime.sendMessage(
      {
        action: 'extractData',
        objectType: objectType,
        data: data
      },
      (response: any) => {
        if (response?.success) {
          showExtractionStatus('success', `Extracted ${data.length} ${objectType}`, objectType);
          sendResponse({ success: true, count: data.length, objectType });
        } else {
          showExtractionStatus('error', 'Failed to store data', objectType);
          sendResponse({ success: false, error: 'Storage failed' });
        }
      }
    );

    return true;
  }
});
