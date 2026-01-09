# Scholars Application Parser

A local-first desktop application that automates processing of university Scholars Program applications submitted by email. 
It scans Outlook, extracts `.docx` attachments, parses structured form fields and essays, and exports a single consolidated 
Excel spreadsheet, reducing manual admin work from hours to minutes.

>**Built for accuracy, speed, and strict data privacy.**

## Why this project matters
Admins often process 50+ applications per term by manually opening emails, copying data from Word forms, and pasting into Excel. That process is slow, error-prone, and difficult to audit.

This tool:
- Cuts processing time from **hours to minutes**
- Reduces copy/paste errors
- Preserves **local data residency** (no cloud, no external APIs)
- Fits real administrative workflows

## System Architecture (at a glance)
<img width="965" height="643" alt="System Architecture Diagram" src="https://github.com/user-attachments/assets/f917130b-b1e0-4098-86d3-2888a7a992ba" />

**Electron UI (React + TypeScript)** → invokes → **Local Python engine** → writes → **Excel on local disk**  
No backend server. No network communication.

## Workflow
<img width="875" height="308" alt="Workflow Diagram" src="https://github.com/user-attachments/assets/8df1147d-d175-416a-a191-a34fc577b617" />

## Key Features
- 📥 **Outlook scanning**  
  Filter by folder, date range, and subject keywords.
- 📄 **DOCX parsing**  
  Extracts tables, checkbox fields, and essay sections.
- 📊 **Excel export**  
  Outputs one row per applicant in a single spreadsheet.
- 🔒 **Privacy-first**  
  Runs locally with no internet requirement.
- 📡 **Progress + logs**  
  Transparent run status and processing results.

## Design Decisions
- **Local-first by design**  
  All email access, parsing, and export happen on the user’s machine to support data residency and offline operation.
- **Separation of concerns**  
  The UI handles configuration and visibility, while the Python engine owns Outlook access, parsing, normalization, and export.
- **No local web server**  
  The UI invokes the engine as a local process, avoiding open ports and reducing security and deployment complexity.
- **Transparency over magic**  
  Real-time logs and explicit skip reasons make the tool auditable for administrative workflows.

## Tech Stack
- **UI:** Electron, React, TypeScript  
- **Engine:** Python, pywin32 (Outlook COM), python-docx, pandas, openpyxl  
- **Packaging:** electron-builder, PyInstaller  

