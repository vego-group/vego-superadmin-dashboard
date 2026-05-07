# MyVego Superadmin Dashboard — User Guide

**Version:** 1.0  
**Audience:** Management, Sales Team, Operations Staff  
**Platform:** MyVego (myvego.sa)

---

## Table of Contents

1. [Getting Started — Login](#1-getting-started--login)
2. [Understanding Your Role](#2-understanding-your-role)
3. [Navigating the Dashboard](#3-navigating-the-dashboard)
4. [Overview Page](#4-overview-page)
5. [Battery Swapping Cabinets](#5-battery-swapping-cabinets)
6. [Fast Charging Stations](#6-fast-charging-stations)
7. [Motorcycles](#7-motorcycles)
8. [Companies (Fleets)](#8-companies-fleets)
9. [Admins Management](#9-admins-management)
10. [Users Management](#10-users-management)
11. [Sales Team Management](#11-sales-team-management)
12. [Financial Reports](#12-financial-reports)
13. [Devices](#13-devices)
14. [Alarms & Alerts](#14-alarms--alerts)
15. [Settings](#15-settings)
16. [Sales Staff View](#16-sales-staff-view)
17. [Language & Mobile Use](#17-language--mobile-use)
18. [Common Workflows (Step-by-Step)](#18-common-workflows-step-by-step)
19. [Status Colors — Quick Reference](#19-status-colors--quick-reference)

---

## 1. Getting Started — Login

### How to Log In

1. Open the MyVego dashboard in your browser.
2. Enter your **phone number** (9 digits, Saudi format — the +966 country code is added automatically).
3. Click **Send OTP**.
4. A 6-digit code will be sent to your phone.
5. Type the code into the six boxes on screen (the cursor moves forward automatically as you type).
6. Click **Verify & Login**.

You will be redirected automatically to the right section based on your role:
- **Superadmin / Admin** → Main Dashboard
- **Sales Staff** → Sales Dashboard

> **Didn't receive the code?** Click **Resend** below the code boxes to request a new one.

---

## 2. Understanding Your Role

The system has three levels of access. What you can see and do depends on which role you have been assigned.

| Role | Where You Land | What You Can Do |
|------|---------------|-----------------|
| **Superadmin** | Main Dashboard | Full access to everything |
| **Admin** | Main Dashboard | Full access to everything |
| **Sales** | Sales Dashboard | Users, Companies, Motorcycles, Pricing, About Us |

If you try to visit a section you do not have access to, the system will redirect you to your correct area automatically.

---

## 3. Navigating the Dashboard

The **sidebar** (the panel on the left side of the screen) is how you move between sections.

### Main Menu Items

| Menu Item | What It Does |
|-----------|-------------|
| **Overview** | Home screen — key numbers and alerts at a glance |
| **Battery Swapping** | Manage battery swap cabinets across all cities |
| **Fast Charging** | Manage fast-charging pile stations |
| **Motorcycles** | View and manage the motorcycle fleet |
| **Companies** | Manage delivery company accounts |
| **Admins** | Add and manage system administrators |
| **Users** | View and manage app users |
| **Sales** | Manage sales team members |
| **Financial** | View transactions, revenue, and reports |
| **Devices** | Combined view of all connected IoT hardware |
| **Alarms** | View and resolve device alerts and faults |

### Settings (expandable)

Click **Settings** in the sidebar to expand a submenu:

| Submenu Item | Purpose |
|-------------|---------|
| **Pricing** | Set and update service pricing |
| **My Account** | Edit your own profile and password |
| **Warranty Policy** | Edit warranty terms shown in the app |
| **Terms of Use** | Edit the app's terms and conditions |
| **Privacy Policy** | Edit the data privacy policy |
| **About Us** | Edit company information |

### Other Sidebar Controls

- **Language toggle** (bottom of sidebar) — Switch between English and Arabic
- **Logout** — Click to sign out securely

---

## 4. Overview Page

The Overview page is the first thing you see after logging in. It gives you a real-time summary of platform activity.

### Summary Cards (top row)

Four cards show the most important numbers at a glance:

- **Total Users** — All registered app users
- **Total Admins** — All active system administrators
- **Battery Swap Active** — Number of operational swap cabinets
- **Fast Charging Active** — Number of operational charging stations

### Charts

- **Revenue Trends** — A chart showing income over time
- **Stats by City** — Breakdown of activity by city
- **Region Status** — Geographic overview of operations

### Recent Alarms (top-right)

Shows the 5 most recent device alerts. Each alarm has a color to indicate its type:

| Color | Alarm Type |
|-------|-----------|
| 🔴 Red | Overvoltage |
| 🟠 Orange | Vehicle or Motor Fault |
| 🟡 Amber | Low Battery |
| 🟣 Purple | Firmware Update Needed |

- Click **View All** to open the full Alarms page.
- Click the **checkmark (✓)** icon on any alarm to mark it as resolved.

---

## 5. Battery Swapping Cabinets

**Location:** Sidebar → Battery Swapping

This section manages the physical battery exchange stations installed across cities.

### Summary Cards

| Card | What It Shows |
|------|--------------|
| **Total Cabinets** | All cabinets in the system |
| **Active** | Online and operational |
| **Inactive** | Currently offline |
| **Maintenance** | Under repair or flagged as faulty |

### Finding a Cabinet

Use the **search box** to find a cabinet by its ID, name, city, address, or province.

Use the **Status filter** to narrow results:
- All Status
- Active
- Inactive
- Offline
- Maintenance
- Faulty

### Cabinet Cards

Each cabinet is shown as a card containing:
- Cabinet name and address
- Status badge (color-coded)
- Cabinet ID
- Province / Region
- GPS Coordinates
- Slot availability bar (how many slots are free vs. occupied)
- Total slot count

### Actions on Each Cabinet

| Button | What It Does |
|--------|-------------|
| **View** (eye icon) | Opens the detailed cabinet page |
| **Edit** (pencil icon) | Edit cabinet information |
| **Delete** (trash icon) | Remove the cabinet permanently |

### Adding a New Cabinet

1. Click the **+ Add Cabinet** button (top right).
2. Fill in the form:
   - **Cabinet ID** *(required)* — Unique identifier
   - **Name** — Display name
   - **Address** *(required)* — Full street address
   - **City** *(required)*
   - **Province** *(required)*
   - **Slots Count** — Number of battery slots
   - **Location** — Click the map to pin the exact location
3. Click **Save**.

### Cabinet Detail Page

Click **View** on any cabinet to open its detail page.

**Top stats row shows:**
- Total Slots
- Occupied Slots
- Reserved Slots
- Empty Slots
- Doors Currently Open

**Slot Map:**

A visual grid shows every slot's current state:

| Icon / Color | Slot State |
|-------------|-----------|
| 🔋 Yellow | Reserved |
| ⚡ Blue | Occupied (battery inside) |
| ○ Gray | Empty |
| 🔓 | Door is open |

Click any slot to see battery details:
- Battery ID
- Charge percentage
- State of Health (SOH %)
- Cycle count (how many charges it has had)

**Slot actions** (for admins): Reserve, Disable, Release.

---

## 6. Fast Charging Stations

**Location:** Sidebar → Fast Charging

This section works exactly like Battery Swapping but manages fast-charging pile stations instead.

**Summary cards show:** Total Charging Piles, Active, Inactive, Maintenance.

The same search, filter, add, edit, view, and delete actions are available. Fields include Station ID, Name, Address, City, Province, and Ports Count.

---

## 7. Motorcycles

**Location:** Sidebar → Motorcycles

Manage the fleet of motorcycles used by delivery companies.

### Summary Cards

Total Motorcycles / Active / Inactive / Maintenance

### Finding a Motorcycle

Search by: Device ID, City, Driver Name, or Battery ID.

Filter by status: All / Active / Inactive / Maintenance.

### Motorcycle Table Columns

| Column | What It Shows |
|--------|--------------|
| **Device ID** | Unique motorcycle identifier and plate number |
| **Status** | Active (green), Inactive (gray), Maintenance (orange) |
| **Battery** | Battery ID, charge %, State of Health, cycle count |
| **Driver** | Assigned driver name and phone number |
| **Fleet** | Which company this motorcycle belongs to |
| **Location** | Current city |
| **Battery Type** | Type of battery installed |
| **Actions** | Assign Battery button |

### Assigning a Battery to a Motorcycle

1. Find the motorcycle in the table.
2. Click **Assign Battery**.
3. Select a battery from the dropdown list.
4. Click **Confirm**.
5. The table updates immediately.

---

## 8. Companies (Fleets)

**Location:** Sidebar → Companies

Manage the delivery companies and fleet operators registered on the platform.

### Summary Cards

Total Companies / Approved / Pending / Suspended

### Company Table Columns

| Column | What It Shows |
|--------|--------------|
| **Company** | Company name, system ID, company code |
| **Contact** | Contact person name and phone |
| **City** | City of operation |
| **Motorcycles** | Used / Maximum allowed (e.g., 5 / 10) |
| **Drivers** | Assigned / Maximum allowed (e.g., 3 / 5) |
| **Billing** | Prepaid or postpaid account type |
| **Status** | Current approval status |
| **Actions** | View, Approve, Reject, Suspend, Reactivate, Delete |

### Company Status Lifecycle

A company moves through these stages:

```
Pending → Approved → (can be Suspended) → Reactivated
        ↘ Rejected
```

| Status | Color | Available Actions |
|--------|-------|-----------------|
| **Pending** | Yellow | Approve, Reject |
| **Approved** | Green | Suspend, Delete |
| **Rejected** | Red | Delete |
| **Suspended** | Gray | Reactivate, Delete |

### Approving or Rejecting a Company

1. Find a company with **Pending** status.
2. Click **View** (eye icon) to review their details.
3. Check:
   - Company name, contact person, phone, email
   - City, region, address
   - Commercial registration number
   - Billing type and fleet/driver capacity limits
   - Uploaded registration documents
4. Click **Approve** to activate the company, or **Reject** to deny.
5. The status badge updates immediately.

### Suspending a Company

1. Find an **Approved** company.
2. Click the **Suspend** action.
3. Enter a reason (optional).
4. Confirm — the company is suspended and cannot operate until reactivated.

---

## 9. Admins Management

**Location:** Sidebar → Admins

Add and manage the people who have access to this dashboard.

### Summary Cards

Total Admins / Active / Inactive / Suspended

### Admin Table Columns

| Column | What It Shows |
|--------|--------------|
| **Admin** | Name and system ID |
| **Contact** | Email and phone number |
| **Joined** | Date they were added |
| **Status** | Active / Inactive / Suspended badge |
| **Actions** | View details, Delete |

### Adding a New Admin

1. Click **+ Add Admin** (top right).
2. Fill in the form:
   - **Full Name** *(required)*
   - **Phone** *(required)* — Saudi phone number
   - **Email** *(required)*
   - **Role** — Choose: Admin, SuperAdmin, or SubAdmin
   - **Password** *(required)* — Must be at least 8 characters with uppercase, lowercase, numbers, and a symbol
   - **Confirm Password** — Must match
3. Click **Create**.

### Deleting an Admin

1. Find the admin in the table.
2. Click the **trash (🗑)** icon.
3. A confirmation dialog will appear with the admin's name.
4. Click **Delete** to confirm, or **Cancel** to go back.

> **Important:** Deleting an admin is permanent and cannot be undone.

---

## 10. Users Management

**Location:** Sidebar → Users

View and manage the end users of the MyVego app (delivery personnel and customers).

### Finding a User

Search by: name, phone number, or email.

Filter by status: All / Active / Inactive / Suspended.

### Adding a New User

1. Click **+ Add User**.
2. Fill in:
   - **Full Name** *(required)*
   - **Phone** *(required)*
   - **Email** *(optional)*
3. Click **Save**.

### User Actions

- **View** — See full user profile details
- **Delete** — Remove the user (with confirmation)

---

## 11. Sales Team Management

**Location:** Sidebar → Sales

Manage the sales team members who use the Sales Dashboard.

### Summary Cards

Total Sales Members / Active / Inactive / Suspended

### Sales Member Information

Each member shows:
- Name
- Email
- Phone number
- Status
- Registration date
- Phone verification status (verified / unverified)

### Actions

- **Search** by name, phone, or email
- **Add** a new sales member
- **View** member details
- **Delete** a member

---

## 12. Financial Reports

**Location:** Sidebar → Financial

View revenue, transactions, and financial settlements.

### Filtering by Date

At the top of the page, use the date range filters:
- **From Date** — Start of the reporting period
- **To Date** — End of the reporting period
- **Reset** — Clear the filters and return to default view

All numbers on the page update automatically when you change the date range.

### Summary Cards (5 Metrics)

| Card | Color | What It Shows |
|------|-------|--------------|
| **Total Revenue** | Green | Total income in SAR |
| **Total Transactions** | Blue | Number of transactions completed |
| **Avg. Transaction** | Purple | Average transaction value in SAR |
| **Pending Holds** | Orange | Amounts currently on hold |
| **Refunds** | Red | Total refunded amounts in SAR |

### Transaction Log Table

Shows individual transactions with:

| Column | What It Shows |
|--------|--------------|
| **Type** | Swap, Charge, Refund, or Adjustment |
| **User** | Who made the transaction |
| **Reserved Amount** | SAR amount reserved at start |
| **Deducted Amount** | SAR amount actually charged |
| **Status** | Settled, Charging, Pending, Refunded |
| **Timestamp** | Date and time of transaction |

You can filter the transaction list by type using the dropdown filter above the table.

---

## 13. Devices

**Location:** Sidebar → Devices

A unified view of **all** connected IoT hardware in one place — both battery swap cabinets and fast charging stations together.

### Filters

- **Search** — Find by device ID, name, city, or location
- **Type** — Cabinet or Charging
- **Status** — Active, Inactive, Offline, Faulty, Maintenance
- **City** — Filter by location

### Table Columns

Device ID / Type / Name / Location / City / Status / Available Slots or Ports / Date Added

---

## 14. Alarms & Alerts

**Location:** Sidebar → Alarms (or click **View All** on the Overview page)

This page shows all alerts generated by connected devices.

### Alarm Types

| Alarm | Color | What It Means |
|-------|-------|--------------|
| **Overvoltage** | 🔴 Red | Electrical voltage too high — urgent |
| **Vehicle Fault** | 🟠 Orange | Problem detected with the motorcycle |
| **Low Battery** | 🟡 Amber | Battery charge critically low |
| **Firmware Update** | 🟣 Purple | Device software needs to be updated |
| **Motor Fault** | 🔴 Red | Motor malfunction detected |
| **Brake Fault** | 🟠 Orange | Brake system issue |
| **Rear Wheel Lock** | 🟡 Yellow | Wheel lock is engaged |

### Alarm Table Columns

| Column | What It Shows |
|--------|--------------|
| **Device Info** | Serial number and device ID |
| **Alarm Type** | Type of alert |
| **Date & Time** | When the alert was triggered |
| **Status** | Resolved or Unresolved |
| **Actions** | Mark as resolved |

### Resolving an Alarm

1. Find the alarm in the table.
2. Click the **checkmark (✓)** button in the Actions column.
3. The status changes to **Resolved**.

### Filtering Alarms

- **Search** by serial number or alarm type
- **Status filter**: All / Active (Unresolved) / Resolved

---

## 15. Settings

**Location:** Sidebar → Settings (click to expand)

### Pricing

Configure the pricing structure for all services.

- Set rates per transaction type (swap, charge, etc.)
- Adjust pricing tiers
- Click **Save** to apply changes

### My Account

Edit your own administrator profile.

**Editable fields:**
- Full Name
- Email
- Phone
- Address, City, Country
- Profile picture
- Password (requires current password to change)

### Content Pages (Warranty, Terms, Privacy, About Us)

These four sections each contain a **text editor** where you can update the written content that appears in the app for end users.

- Edit the text as needed
- Click **Save** when done
- Changes reflect in the app immediately

---

## 16. Sales Staff View

If you are logged in as a **Sales** team member, you land on a dedicated Sales Dashboard at `/sales/dashboard` with a simplified interface focused on sales operations.

### Sales Dashboard Summary Cards

- Total Users on the platform
- Total Companies / Fleets
- Total Motorcycles
- Total Batteries

### Infrastructure Section

Shows the current counts and availability:
- Battery Swap Cabinets (Active / Total)
- Fast Charging Piles (Active / Total)
- Motorcycles (Active / Total)
- Batteries (Available / Total)

### Financial Section

- Total Revenue (SAR)
- Total Transactions
- Average Transaction (SAR)
- Platform Income
- Settled Amount

### Sales Staff Access

Sales staff can navigate to:
- **Users** — View platform users
- **Companies** — View managed companies
- **Motorcycles** — View fleet motorcycles
- **Pricing** — View (read only) pricing information
- **About Us** — View company information

> Sales staff can view data but do not have access to administrative functions such as adding admins, approving companies, or managing alarms.

---

## 17. Language & Mobile Use

### Switching Languages

Click the **Language button** at the bottom of the sidebar to switch between:
- **English** (default)
- **عربي** (Arabic)

When Arabic is selected, the entire interface switches to Arabic text and the layout is automatically mirrored for right-to-left reading.

### Using on Mobile or Tablet

The dashboard is fully responsive — it works on phones and tablets as well as desktop computers.

- On small screens, the sidebar becomes a collapsible menu (accessible via the menu icon)
- Long tables convert to scrollable card layouts for easier reading
- All buttons and touch targets are sized for finger use

---

## 18. Common Workflows (Step-by-Step)

### How to Add a New Battery Cabinet

1. Go to **Battery Swapping** in the sidebar.
2. Click **+ Add Cabinet** (top right corner).
3. Enter the Cabinet ID, Name, Address, City, Province, and number of slots.
4. Click the map to pin the exact location.
5. Click **Save** — the cabinet appears in the grid immediately.

---

### How to Approve a New Company

1. Go to **Companies** in the sidebar.
2. Look for a company with a **Pending** (yellow) badge.
3. Click the **View** (👁) icon to open its details.
4. Review the company information and uploaded documents.
5. Click **Approve** — the status changes to **Approved** (green).

---

### How to Assign a Battery to a Motorcycle

1. Go to **Motorcycles** in the sidebar.
2. Find the motorcycle in the table.
3. Click **Assign Battery**.
4. Choose a battery from the dropdown.
5. Click **Confirm** — the table updates with the new battery details.

---

### How to Add a New Admin

1. Go to **Admins** in the sidebar.
2. Click **+ Add Admin**.
3. Enter the name, phone, email, role, and password.
4. Click **Create** — the new admin can now log in.

---

### How to Delete an Admin

1. Go to **Admins** in the sidebar.
2. Find the admin you want to remove.
3. Click the **trash (🗑)** icon in their row.
4. Read the confirmation message — it shows the admin's name.
5. Click **Delete** to confirm.

> This action cannot be undone.

---

### How to View a Financial Report

1. Go to **Financial** in the sidebar.
2. Set the **From Date** and **To Date** at the top.
3. The five summary cards update to show totals for that period.
4. Scroll down to see individual transactions in the log.
5. Use the **Type** filter to view only specific transaction types.

---

### How to Resolve an Alarm

1. Go to **Alarms** in the sidebar, or click **View All** on the Overview page.
2. Find the unresolved alarm.
3. Click the **checkmark (✓)** icon in the Actions column.
4. The alarm status changes to **Resolved**.

---

### How to Suspend a Company

1. Go to **Companies** in the sidebar.
2. Find the **Approved** company.
3. Click the **Suspend** button.
4. Enter a reason if needed.
5. Confirm — the company is suspended until reactivated.

---

## 19. Status Colors — Quick Reference

The same color system is used consistently across every section of the dashboard.

| Color | Meaning |
|-------|---------|
| 🟢 **Green** | Active, Approved, Operational, Settled — everything is working normally |
| 🟡 **Yellow** | Pending, Reserved, Waiting for action — needs attention |
| 🟠 **Orange** | Offline, Maintenance, Warning — something needs to be checked |
| 🔴 **Red** | Faulty, Rejected, Critical Error — immediate attention required |
| ⚫ **Gray** | Inactive, Disabled, Suspended — not currently in use |
| 🔵 **Blue** | Informational status, occupied, secondary actions |
| 🟣 **Purple** | System-level alerts such as firmware updates |

---

*This document covers all features available in the MyVego Superadmin Dashboard. For technical support or to report an issue, contact your system administrator.*
