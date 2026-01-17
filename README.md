Salesforce CRM Data Extractor Chrome Extension

Installation

For Developers

1. Clone the repository:
   git clone [<repository-url>](https://github.com/gaurav-shinde-07/salesforce-crm-data-extractor)
   cd salesforce-crm-extractor

2. Install dependencies:
   npm install

3. Build the extension:
   npm run build

4. Load the extension in Chrome:
   - Open Chrome and navigate to chrome://extensions/
   - Enable "Developer mode" (toggle in top right)
   - Click "Load unpacked"
   - Select the project root directory
   - The extension icon will appear in your Chrome toolbar

For Users

Simply install from the Chrome Web Store (if published).

DOM Extraction Strategy

Detection

The extension automatically detects which Salesforce object is being viewed by:
1. Checking the URL for /lightning/o/[ObjectType]/ patterns
2. Falling back to document title analysis
3. Supported objects: Lead, Contact, Account, Opportunity, Task

Extraction Method

Primary Extraction: Lightning Data Table

The extension first attempts to extract data from Salesforce's Lightning data table using:
- Selector: [role="row"] for table rows
- Selector: [role="gridcell"] for individual cell values
- Each row is processed to extract field values from cells in order

Fallback Extraction: Link-Based Pattern Matching

If the primary method yields no results (e.g., Kanban view or page layout changes), the extension uses link-based pattern matching:

1. Scans all hyperlinks in the page
2. Matches 18-character Salesforce record IDs by type:
   - Leads: IDs containing "00Q"
   - Contacts: IDs containing "003"
   - Accounts: IDs containing "001"
   - Opportunities: IDs containing "006"
   - Tasks: IDs containing "00T"

3. Extracts record ID using regex: /\/([a-zA-Z0-9]{18})(?:\/|$|\?)/
4. Pulls display name from link text
5. Extracts contextual fields (email, phone, company, status) from surrounding text

Context Extraction

For fields not present in table cells, the extension extracts values from surrounding text using regex patterns:
- Email: RFC 5322 pattern
- Phone: US phone number format with optional country code
- Company: "company:" or "account:" prefixes
- Status: "status:" prefix or common values (open, closed, converted)
- Source/Type: Common Salesforce field values
- Owner: "owner:" or "assigned:" prefixes

Field Coverage by Object

Leads: name, company, email, phone, status, lead source, owner
Contacts: name, email, phone, account name, title, owner, mailing address
Accounts: account name, website, phone, industry, type, owner, annual revenue
Opportunities: opportunity name, amount, stage, probability, close date, forecast category, owner, associated account
Tasks: subject, due date, status, priority, related to, assigned to

Storage Schema

Data Structure

All extracted data is stored in chrome.storage.local under a single key "salesforce_data":

{
  "salesforce_data": {
    "leads": [
      {
        "id": "00Qfj000008vji9EAA",
        "name": "rok",
        "company": "Acme Corporation",
        "email": "rok@gmail.com",
        "phone": "555-1234",
        "status": "Open",
        "leadSource": "Web",
        "owner": "Jane Smith"
      }
    ],
    "contacts": [
      {
        "id": "003fj00000awVptAAE",
        "name": " Smith",
        "email": "smith@example.com",
        "phone": "555-5678",
        "accountName": "Example Inc",
        "title": "Manager",
        "contactOwner": "John Doe",
        "mailingAddress": "123 Main St"
      }
    ],
    "accounts": [
      {
        "id": "001fj00000XYZAAA",
        "accountName": "Global Tech Solutions",
        "website": "www.globaltech.com",
        "phone": "555-0000",
        "industry": "Technology",
        "type": "Customer",
        "accountOwner": "Sales Rep Name",
        "annualRevenue": "5000000"
      }
    ],
    "opportunities": [
      {
        "id": "006fj00000OpnameAAB",
        "opportunityName": "Enterprise License Deal",
        "stage": "Proposal",
        "amount": "250000",
        "probability": "75",
        "closeDate": "2025-03-31",
        "forecastCategory": "Pipeline",
        "opportunityOwner": "Sales Rep Name",
        "associatedAccount": "Global Tech Solutions"
      }
    ],
    "tasks": [
      {
        "id": "00Tfj000001TASKAA",
        "subject": "Follow up with client",
        "dueDate": "2025-02-15",
        "status": "Open",
        "priority": "High",
        "relatedTo": "Global Tech Solutions",
        "assignedTo": "John Doe"
      }
    ],
    "lastSync": {
      "leads": 1705420800000,
      "contacts": 1705420800000,
      "accounts": 1705420800000,
      "opportunities": 1705420800000,
      "tasks": 1705420800000
    }
  }
}

Data Integrity

- Deduplication: Records are identified by their 18-character Salesforce ID. Duplicate extractions update existing records rather than creating duplicates.
- Validation: Records with only an ID and no other meaningful fields are filtered out (require minimum 2 fields with data).
- Atomic Updates: The service worker handles all storage operations to prevent race conditions.
