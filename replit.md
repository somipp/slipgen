# Hanva Payslip Generator

A professional payslip generator web application for Hanva Technologies that creates pixel-perfect PDF payslips matching the Infosys reference layout.

## Project Overview

**Tech Stack:**
- Frontend: React + TypeScript, Tailwind CSS, Shadcn UI
- Backend: Express.js, Puppeteer for PDF generation
- Database: PostgreSQL with Drizzle ORM
- File Handling: Multer for uploads, Papaparse for CSV parsing, JSZip for bulk downloads

**Key Features:**
- Single payslip generation with live PDF preview
- Bulk CSV upload with 4-step wizard (Upload → Map → Validate → Generate)
- Employee database management
- Company settings (logo, signature, company details)
- Pixel-perfect PDF generation matching exact Infosys layout
- Number-to-words conversion for net pay
- A4 and US Letter format support

## Database Schema

### Tables
1. **company_settings** - Company branding and information
2. **employees** - Employee profiles with bank and statutory details
3. **payslips** - Generated payslip records with all earnings/deductions

## Architecture

### Frontend Structure
- `/dashboard` - Stats cards, quick actions, getting started guide
- `/generate` - Single payslip form (40% form / 60% preview split)
- `/bulk-upload` - 4-step wizard for CSV bulk generation
- `/employees` - Employee database with search and CRUD operations
- `/settings` - Company settings with logo/signature upload

### Design System
- Primary font: Inter
- Monospace: JetBrains Mono (for IDs, account numbers)
- Professional blue theme matching Hanva branding
- Material Design + Carbon Design hybrid
- All components follow design_guidelines.md specifications

### Backend API Endpoints
(To be implemented in Task 2)
- `GET /api/employees` - List all employees
- `POST /api/employees` - Create employee
- `PUT /api/employees/:id` - Update employee
- `DELETE /api/employees/:id` - Delete employee
- `GET /api/company-settings` - Get company settings
- `PUT /api/company-settings` - Update company settings
- `POST /api/payslips/generate` - Generate single payslip PDF
- `POST /api/payslips/bulk-generate` - Generate multiple payslips from CSV
- `POST /api/upload/logo` - Upload company logo
- `POST /api/upload/signature` - Upload signature
- `POST /api/upload/csv` - Upload CSV file
- `GET /api/csv-template` - Download sample CSV template

## Development Status

### Completed
✅ Complete data schema with all tables and types
✅ All React components with exceptional visual quality
✅ Navigation sidebar with theme toggle
✅ Dashboard with stats and quick actions
✅ Single payslip generation form with preview layout
✅ Bulk upload wizard (4 steps)
✅ Employee database page with CRUD dialogs
✅ Company settings page with file upload UI
✅ Responsive design across all breakpoints
✅ Design system configured in tailwind.config.ts

### In Progress
- Backend implementation
- Database setup with Drizzle
- PDF generation with Puppeteer
- CSV parsing and validation
- File upload handling

### Next Steps
1. Install backend dependencies (puppeteer, multer, papaparse, jszip, number-to-words)
2. Implement all API endpoints
3. Create Puppeteer PDF template matching Infosys layout
4. Connect frontend to backend with React Query
5. Test all user journeys

## User Preferences
- Professional, clean UI focused on workflow efficiency
- Pixel-perfect PDF output matching reference image
- Minimal animations, functional-only interactions
- Data integrity and validation at every step
