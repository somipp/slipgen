# Payslip Generator Design Guidelines - Compact Version

## Design Foundation

**System:** Material Design + Carbon Design Hybrid
**Principles:** Clarity over decoration | Workflow efficiency | Data integrity | Professional credibility

---

## Typography

**Fonts:**
- Primary: Inter (Google Fonts)
- Monospace: JetBrains Mono (IDs, account numbers)

**Scale:**
```
Display:    32px/2rem, font-semibold     - Dashboard headers
Heading 1:  24px/1.5rem, font-semibold   - Section headers
Heading 2:  20px/1.25rem, font-medium    - Card titles
Heading 3:  18px/1.125rem, font-medium   - Form sections
Body Large: 16px/1rem, font-normal       - Form labels
Body:       14px/0.875rem, font-normal   - Inputs, tables
Small:      12px/0.75rem, font-normal    - Captions
Micro:      11px/0.6875rem, font-normal  - Validation messages
```

**Line Heights:** Headings `leading-tight` (1.25) | Body `leading-normal` (1.5) | Labels `leading-relaxed` (1.625)

---

## Layout & Spacing

**Spacing Units (4px base):** 2, 3, 4, 6, 8, 12, 16, 20, 24

**Application:**
- Component padding: `p-4, p-6, p-8`
- Sections: `space-y-6, space-y-8`
- Form gaps: `gap-4, gap-6`
- Page margins: `px-6 md:px-8 lg:px-12`

**Containers:**
- Dashboard: `max-w-7xl mx-auto`
- Single-column forms: `max-w-2xl`
- Split views: `max-w-6xl`

**Grid:**
- Dashboard: 12-column, `gap-6`
- Preview: 40% form / 60% preview
- Employee cards: `grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6`

**Breakpoints:** Mobile <640px | Tablet 640-1024px | Desktop >1024px

---

## Components

### Navigation
- **Top Nav:** Fixed `h-16`, logo left, user profile right, horizontal menu (hamburger on mobile)
- **Sidebar:** `w-64` (collapsible), vertical nav with icon + label
- **Breadcrumbs:** Below nav for multi-step workflows

### Forms

**Input Fields:**
```
- Label: text-sm font-medium mb-2
- Height: h-10 or h-11
- Border: 1px solid, rounded-md
- Focus: 2px border, distinct outline
- Error: Red border + icon + message below
- Required: Red asterisk (*) next to label
- Helper text: text-xs, subtle
```

**Variants:**
- **Text:** Standard single-line
- **Numeric:** Right-aligned for currency/numbers
- **Textarea:** `min-h-24` for addresses/notes
- **Disabled:** `opacity-50`, no pointer events

**Select Dropdowns:**
- Height matches inputs (`h-10/h-11`)
- Chevron right-aligned
- Options: `max-h-60` with scroll
- Search-enabled for long lists

**Radio/Checkbox:**
- Size: `w-5 h-5` (20x20px)
- Label spacing: `ml-2`
- Group: `space-y-3` vertical, `space-x-6` horizontal

**Date Picker:**
- Format: DD MMM YYYY (e.g., 15 Jan 2024)
- Quick actions: This month, Last month, Custom

**File Upload:**
```
- Drop zone: border-dashed border-2, min-h-32
- Text: "Drop CSV file or click to browse"
- Formats: .csv, .xlsx
- Preview list with remove option
- Progress bar for large files
```

### Data Display

**Tables:**
```
- Sticky header on scroll
- Alternating rows for readability
- Cell padding: px-4 py-3
- Horizontal borders between rows
- Action column: Right-aligned icons
- Mobile: Stack to cards <768px
```

**Cards:**
- Padding: `p-6`
- Rounded: `rounded-lg`
- Shadow: `shadow-sm`, `shadow-md` on hover
- Structure: Header + Body + Footer

**Employee Cards:**
- Photo placeholder, Name (font-semibold), ID, Department, Quick actions

**Status Badges:**
- Size: `text-xs px-2.5 py-1 rounded-full`
- Variants: Success, Warning, Error, Info, Neutral

### Buttons

```
Primary:   Filled, h-10, px-6, font-medium (high emphasis)
Secondary: Outlined (medium emphasis)
Tertiary:  Text-only (low emphasis)
Icon:      w-10 h-10, tooltip
Loading:   Spinner + "Processing..." text
Disabled:  opacity-50, cursor-not-allowed
```

**Button Groups:**
- Download: Single PDF | ZIP | Combined
- Format: A4 | US Letter (segmented control)

**Tabs:**
- Horizontal with underline active
- Panel: `pt-6`

### Feedback

**Validation:**
- Inline errors: Red `text-sm` below input with icon
- Success: Green banner with checkmark
- Form summary: Expandable error panel at top

**Progress:**
- Linear bar: `h-2 rounded-full`
- Step indicator: 1. Upload → 2. Map → 3. Validate → 4. Generate
- Text: "Processing 45/500 payslips..."

**Alerts:**
- Toast: Bottom-right, auto-dismiss (5s)
- Banner: Top of content, dismissible
- Modal: Center screen for confirmations

### PDF Preview

**Layout:**
- Desktop: 40% form | 60% preview split-screen
- Aspect ratio preserved, scrollable
- Zoom: 50%, 75%, 100%, 125%, Fit-to-width
- Toggle: "Exact Print Preview"
- Loading: Skeleton screen

**Toolbar:**
- Actions: Download, Print, Copy Link
- Format switcher: A4/Letter
- Quality badge

### Bulk Upload Workflow

**Step 1 - Upload:**
- Large drop zone (`min-h-48`)
- Sample CSV download link
- Immediate validation feedback

**Step 2 - Column Mapping:**
- Two-column: CSV Columns → Payslip Fields
- Drag handles or dropdowns
- Auto-detect fields
- Preview first 5 rows

**Step 3 - Validation:**
- Row-by-row results table
- Expandable error details
- Download error report
- Skip or fix invalid rows

**Step 4 - Generation:**
- Progress: "Generating PDF 87/200..."
- Cancel button
- Summary: "195 succeeded, 5 failed" + download ZIP

---

## Dashboard Pages

**Landing:**
- Hero stats: Total payslips, Active employees, Templates (3-column)
- Quick actions: Large "Generate Single" & "Bulk Upload" buttons
- Recent activity table (last 10)
- First-time user guide

**Employee Database:**
- Search bar (sticky, `w-full max-w-md`)
- Filter tags: Department, Status
- Add New Employee (top right)
- List/Grid toggle
- Pagination

**Templates:**
- Grid of template cards
- Card info: Name, Fields count, Last used, Actions (Edit/Clone/Delete)
- Create Template wizard

---

## Accessibility

**Keyboard:**
- Logical tab order
- Focus ring: 2px offset
- Shortcuts: Ctrl+S (save), Ctrl+P (preview), Esc (close modals)

**Screen Readers:**
- Explicit labels (no placeholder-only)
- aria-live for status messages
- aria-label for icon buttons

**Touch Targets:**
- Minimum 44x44px on mobile
- Min 8px spacing between elements

**Loading States:**
- Skeleton screens for data fetch
- Spinners for actions
- Disable forms during submission

---

## Responsive Strategy

**Mobile (<640px):**
- Single column, stacked forms
- Hamburger menu
- Tables → stacked cards
- Preview → full-screen modal
- Full-width inputs, larger touch targets

**Tablet (640-1024px):**
- Simplified layouts
- Collapsible sidebar

**Desktop (>1024px):**
- Full multi-column layouts
- Split preview panels

---

## Visual Assets

**Icons Only (no hero images):**
- Upload, Success/Error/Warning for validation
- Action icons: Edit, Delete, Download, Print
- Navigation icons
- Document icon for PDF placeholder

**Logos:**
- Company logo: Top-left nav (`h-8` or `h-10`)
- Client logo: In PDF template

---

## Animation

**Minimal, functional only:**
```
- Modal transitions: duration-200 fade
- Loading pulse: Skeleton screens
- Expandables: transition-all duration-300
- NO decorative animations
```

---

**Design Goal:** Efficiency, accuracy, and professional credibility for HR users generating payslips at scale. Every element supports rapid data entry, clear validation, and confident PDF generation.