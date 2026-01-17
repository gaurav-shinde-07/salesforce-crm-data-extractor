# Salesforce CRM Data Extractor

A powerful Chrome extension for seamlessly extracting and managing Salesforce CRM data directly from your browser. Automatically captures leads, contacts, accounts, opportunities, and tasks with intelligent field detection.

##  Table of Contents

- [Installation](#installation)
- [Features](#features)
- [Data Extraction Strategy](#data-extraction-strategy)
- [Storage Schema](#storage-schema)
- [Supported Objects](#supported-objects)
- [Development](#development)

##  Installation

### For Users

Install from the [Chrome Web Store](#) (link will be available upon publication)

### For Developers

1. **Clone the repository:**
   ```bash
   git clone https://github.com/gaurav-shinde-07/salesforce-crm-data-extractor
   cd salesforce-crm-data-extractor
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Build the extension:**
   ```bash
   npm run build
   ```

4. **Load in Chrome:**
   - Open Chrome and navigate to `chrome://extensions/`
   - Enable **"Developer mode"** (toggle in top right corner)
   - Click **"Load unpacked"**
   - Select the project root directory
   - The extension icon will appear in your Chrome toolbar

5. **For development with auto-rebuild:**
   ```bash
   npm run dev
   ```

##  Features

- **Automatic Detection**: Identifies Salesforce objects from URL and page content
- **Intelligent Extraction**: Uses multiple strategies to extract data reliably
- **Local Storage**: All data stored securely in browser storage
- **Deduplication**: Automatically prevents duplicate records
- **Multi-Object Support**: Handles Leads, Contacts, Accounts, Opportunities, and Tasks

## 🔍 Data Extraction Strategy

The extension uses a dual-approach extraction method to ensure maximum data capture:

### Detection Method

The extension automatically detects which Salesforce object is being viewed by:

1. **URL Pattern Matching**: Checks for `/lightning/o/[ObjectType]/` patterns
2. **Fallback Analysis**: Falls back to document title analysis if URL detection fails
3. **Supported Objects**: Lead, Contact, Account, Opportunity, Task

### Primary Extraction: Lightning Data Table

For Lightning list views and data tables:

- **Row Selector**: `[role="row"]` - Identifies table rows
- **Cell Selector**: `[role="gridcell"]` - Extracts individual cell values
- **Processing**: Each row is systematically scanned for field values in order

**When it works:** List views, Lightning data tables, standard views

### Fallback Extraction: Link-Based Pattern Matching

When primary method yields no results (Kanban view, custom layouts):

1. **Scans hyperlinks** throughout the page
2. **Matches 18-character Salesforce IDs** by type:
   - **Leads**: IDs containing `00Q`
   - **Contacts**: IDs containing `003`
   - **Accounts**: IDs containing `001`
   - **Opportunities**: IDs containing `006`
   - **Tasks**: IDs containing `00T`

3. **Extracts record ID** using regex: `/([a-zA-Z0-9]{18})(?:\/|$|\?)/`
4. **Pulls display name** from hyperlink text
5. **Extracts contextual fields** from surrounding text

### Context Extraction

For fields not visible in tables, the extension analyzes surrounding text:

- **Email**: RFC 5322 pattern matching
- **Phone**: US format with optional country code
- **Company**: Matches "company:" or "account:" prefixes
- **Status**: Matches "status:" prefix or common values (open, closed, converted)
- **Source/Type**: Common Salesforce field values
- **Owner**: Matches "owner:" or "assigned:" prefixes

## 📦 Storage Schema

All extracted data is stored in `chrome.storage.local` under the `salesforce_data` key.

### Data Structure

```json
{
  "salesforce_data": {
    "leads": [
      {
        "id": "00Qfj000008vji9EAA",
        "name": "John Doe",
        "company": "Acme Corporation",
        "email": "john@acme.com",
        "phone": "555-1234",
        "status": "Open",
        "leadSource": "Web",
        "owner": "Jane Smith"
      }
    ],
    "contacts": [
      {
        "id": "003fj00000awVptAAE",
        "name": "Jane Smith",
        "email": "jane@example.com",
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
```

### Data Integrity

- **Deduplication**: Records identified by 18-character Salesforce ID; duplicates update existing records
- **Validation**: Records require minimum 2 fields with data (ID alone is filtered out)
- **Atomic Operations**: Service worker handles all storage operations to prevent race conditions

## 📊 Supported Objects & Fields

### Leads
- Name, Company, Email, Phone, Status, Lead Source, Owner

### Contacts
- Name, Email, Phone, Account Name, Title, Owner, Mailing Address

### Accounts
- Account Name, Website, Phone, Industry, Type, Owner, Annual Revenue

### Opportunities
- Opportunity Name, Amount, Stage, Probability, Close Date, Forecast Category, Owner, Associated Account

### Tasks
- Subject, Due Date, Status, Priority, Related To, Assigned To

## 🛠 Development

### Available Scripts

```bash
npm run build    # Production build
npm run dev      # Development build with file watching
npm run start    # Development server with hot reload
```

### Project Structure

```
salesforce-crm-data-extractor/
├── public/                  # Static files
│   ├── icons/               # Extension icons
│   └── popup.html           # Popup HTML file
├── src/                    # Source files
│   ├── background/          # Background scripts
│   ├── content/            # Content scripts
│   ├── options/            # Extension options page
│   ├── popup/              # Popup components
│   └── utils/              # Utility functions
├── .gitignore               # Git ignore file
├── manifest.json            # Chrome extension manifest
├── package.json             # NPM package file
└── README.md                # This README file
```

### Troubleshooting Common Issues

- **Extension not appearing in Chrome**: Ensure you enabled "Developer mode" and selected the correct project directory.
- **Data not extracting**: Check if the Salesforce object is supported and visible in the current view.
- **Contacting Support**: For unresolved issues, contact support@example.com

### Contributing

1. **Fork the repository**
2. **Create a new branch**: `git checkout -b feature/YourFeature`
3. **Make your changes**
4. **Commit your changes**: `git commit -m "Add your message"`
5. **Push to the branch**: `git push origin feature/YourFeature`
6. **Open a pull request**

### License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
