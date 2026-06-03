# TaxBox NG — Lagos PAYE 2026 User Guide

> **Your complete guide to using the Nigeria Tax Act (NTA) 2026-compliant PAYE Calculator**

---

## Table of Contents

1. [Getting Started](#1-getting-started)
2. [Dashboard Overview](#2-dashboard-overview)
3. [Individual Taxpayer Mode](#3-individual-taxpayer-mode)
4. [Corporate Payroll Mode](#4-corporate-payroll-mode)
5. [Tax Consultant Mode](#5-tax-consultant-mode)
6. [Employee Management](#6-employee-management)
7. [Tax Records](#7-tax-records)
8. [Subscription Plans](#8-subscription-plans)
9. [Feedback & Support](#9-feedback--support)
10. [GDPR & Legal](#10-gdpr--legal)

---

## 1. Getting Started

### 1.1 Creating an Account

```
┌─────────────────────────────────────────────┐
│                                             │
│   ┌──────────────────────────────────┐      │
│   │         TaxBox NG                │      │
│   │    Lagos PAYE 2026 — NTA        │      │
│   │                                  │      │
│   │   ┌──────────────────────────┐   │      │
│   │   │       Register           │   │      │
│   │   │   ┌──────────────────┐   │   │      │
│   │   │   │ Full Name        │   │   │      │
│   │   │   └──────────────────┘   │   │      │
│   │   │   ┌──────────────────┐   │   │      │
│   │   │   │ Email            │   │   │      │
│   │   │   └──────────────────┘   │   │      │
│   │   │   ┌──────────────────┐   │   │      │
│   │   │   │ Password         │   │   │      │
│   │   │   └──────────────────┘   │   │      │
│   │   │                          │   │      │
│   │   │   [Individual] [Corporate]│   │      │
│   │   │   [Consultant] [Admin]   │   │      │
│   │   │                          │   │      │
│   │   │   [ 🖱 Create Account ]   │   │      │
│   │   └──────────────────────────┘   │      │
│   │                                  │      │
│   └──────────────────────────────────┘      │
│                                             │
└─────────────────────────────────────────────┘
```

**Step-by-step:**

1. Navigate to the app URL and click **Register**
2. Enter your **Full Name**, **Email**, and **Password** (minimum 6 characters)
3. Select your **Account Type**:
   - **Individual Taxpayer** — for personal PAYE calculation
   - **Corporate HR** — for company-wide payroll processing
   - **Tax Consultant** — for audit and comparison tools
   - **Administrator** — full system access
4. If you selected Corporate or Consultant, enter your **Company/Firm Name**
5. Click **Create Account**
6. You will be automatically signed in and redirected to the Dashboard

### 1.2 Signing In

```
┌─────────────────────────────────────────────┐
│                                             │
│   ┌──────────────────────────────────┐      │
│   │         TaxBox NG                │      │
│   │                                  │      │
│   │   ┌──────────────────────────┐   │      │
│   │   │       Sign In            │   │      │
│   │   │   ┌──────────────────┐   │   │      │
│   │   │   │ Email            │   │   │      │
│   │   │   └──────────────────┘   │   │      │
│   │   │   ┌──────────────────┐   │   │      │
│   │   │   │ Password         │   │   │      │
│   │   │   └──────────────────┘   │   │      │
│   │   │                          │   │      │
│   │   │     [ 🖱 Sign In ]       │   │      │
│   │   └──────────────────────────┘   │      │
│   │                                  │      │
│   │   Demo: admin@taxbox.ng          │      │
│   │   Password: demo123              │      │
│   └──────────────────────────────────┘      │
│                                             │
└─────────────────────────────────────────────┘
```

**Demo credentials (all use password `demo123`):**

| Email | Role | Access Level |
|-------|------|-------------|
| admin@taxbox.ng | Admin | Full access to all features |
| hr@company.com | Corporate | Payroll, Employees, Tax Records |
| consultant@taxpro.com | Consultant | Audit, Comparison, Sandbox |
| user@example.com | Individual | Calculator only |

---

## 2. Dashboard Overview

After signing in, you land on the **Dashboard** — your real-time command centre.

```
┌─────────────────────────────────────────────────────┐
│  📊 Dashboard              ● All systems live       │
│  Welcome back, Name — role at Company               │
├─────────────────────────────────────────────────────┤
│ ┌────────┐ ┌──────────┐ ┌──────────┐ ┌─────────┐  │
│ │ 👥     │ │ 💰       │ │ 📊      │ │ 📈      │  │
│ │Total   │ │PAYE      │ │Total     │ │Avg.     │  │
│ │Employees│ │Collected │ │Payroll   │ │Eff Rate │  │
│ │  128   │ │₦4.5M     │ │₦18.0M   │ │ 12.4%   │  │
│ └────────┘ └──────────┘ └──────────┘ └─────────┘  │
├─────────────────────────────────────────────────────┤
│  ┌─────────────────────┐  ┌─────────────────────┐  │
│  │ PAYE Collection Trend│  │ Gross Payroll Trend │  │
│  │    [📈 LIVE]        │  │    [📈 LIVE]        │  │
│  │ ╱╲   ╱╲             │  │ ╱╲╱╲   ╱╲           │  │
│  │╱  ╲╱  ╲╱╲           │  │╱    ╲╱  ╲╱╲         │  │
│  └─────────────────────┘  └─────────────────────┘  │
├─────────────────────────────────────────────────────┤
│  Quick Actions                                       │
│  [🧮 Run PAYE] [👥 Manage] [⭐ Upgrade] [📋 View]  │
└─────────────────────────────────────────────────────┘
```

**Dashboard features:**
- **Live Stats Cards** — Employee count, PAYE collected, total payroll, effective tax rate — updated in real-time
- **Real-Time Charts** — Area charts showing PAYE collection and payroll trends, refreshing every 4 seconds
- **Quick Actions** — One-click navigation to key features

---

## 3. Individual Taxpayer Mode

### 3.1 Calculating Your PAYE

```
┌─────────────────────────────────────────────────────┐
│  Individual Tax Calculator  [Try Gross-Up →]        │
├─────────────────────────────────────────────────────┤
│ ┌─────────────────────────┐ ┌─────────────────────┐ │
│ │ Monthly Income Breakdown│ │ Your Summary        │ │
│ │                          │ │                     │ │
│ │ Basic Salary   [300,000]│ │ Monthly Net Pay     │ │
│ │ Housing Allow  [ 75,000]│ │   ₦237,450          │ │
│ │ Transport      [ 50,000]│ │                     │ │
│ │ Utility        [       ]│ │ Gross  │ Tax │ Rate │ │
│ │ Wardrobe       [       ]│ │ ₦500k │₦52k │10.4% │ │
│ │ Lunch          [       ]│ │                     │ │
│ │ Bonus          [       ]│ │ [📊 Donut Chart]    │ │
│ │ 13th Month     [       ]│ │                     │ │
│ │ Commission     [       ]│ │ ▼ Bracket breakdown │ │
│ │ Other Allow    [       ]│ │ First ₦800k @ 0%    │ │
│ │                          │ │ Next ₦2.2M @ 15%   │ │
│ │ ─── RRA Section ─────   │ └─────────────────────┘ │
│ │ Annual Rent   [600,000] │                         │
│ │ ☑ I have rent receipts  │                         │
│ │                          │                         │
│ │ [ 🖱 Calculate My PAYE ] │                         │
│ └─────────────────────────┘ └───────────────────────┘ │
└─────────────────────────────────────────────────────┘
```

**How to use:**

1. Navigate to **Tax Calculator** → **Individual Taxpayer** tab
2. Enter your monthly salary components:
   - **Basic Salary** — your base monthly pay
   - **Housing Allowance** — housing component of your salary
   - **Transport Allowance** — transport component
   - **Other Allowances** — utility, wardrobe, lunch, bonus, 13th month, commission
3. Enter your **Annual Rent Paid** (for Rent Relief Allowance)
4. Check **"I have rent receipts"** if you can provide proof of rent
5. Click **"Calculate My PAYE"**
6. View your **Monthly Net Pay**, **Tax Deducted**, and breakdown

**Understanding your results:**
- **Monthly Net Pay** — what hits your bank account after all deductions
- **PAYE Tax** — income tax deducted at source
- **Pension** — 8% of (Basic + Housing + Transport)
- **NHF** — 2.5% of Basic (National Housing Fund)
- **Rent Relief** — 20% of annual rent (max ₦500,000)
- **Effective Tax Rate** — total tax as percentage of chargeable income

### 3.2 Using the Reverse Calculator (Gross-Up)

```
┌──────────────────────────────────────────┐
│  Reverse Calculator (Gross-Up)            │
│                                           │
│  Desired Monthly Net Pay:  [₦  500,000]  │
│                              [Calculate]  │
│                                           │
│  ┌────────┐ ┌────────┐ ┌────────┐       │
│  │Required│ │Net Pay │ │Monthly │       │
│  │ Gross  │ │        │ │ Tax    │       │
│  │₦1.2M   │ │₦500k   │ │₦250k   │       │
│  └────────┘ └────────┘ └────────┘       │
│                                           │
│  ▼ Breakdown of Gross Income Components  │
│  Basic: ₦600,000                         │
│  Housing: ₦180,000                       │
│  ...                                     │
└──────────────────────────────────────────┘
```

**What is Gross-Up?** If you know how much you want to take home each month, the Reverse Calculator tells you what your gross salary needs to be.

**How to use:**
1. Click **"Try Reverse Calculator (Gross-Up)"** link
2. Enter your **Desired Monthly Net Pay**
3. Click **Calculate**
4. View the required gross salary and breakdown

---

## 4. Corporate Payroll Mode

### 4.1 Batch Processing

```
┌─────────────────────────────────────────────┐
│  Batch Payroll Processing                    │
│                                              │
│  Upload a CSV or Excel file matching the     │
│  standardised template. [Download Template]  │
│                                              │
│  ┌──────────────────────────────────────┐   │
│  │ Click to upload CSV or Excel file   │   │
│  └──────────────────────────────────────┘   │
│                                              │
│  ┌─────────┐ ┌──────────┐ ┌──────────┐    │
│  │Employees│ │Annual    │ │Monthly   │    │
│  │   15    │ │PAYE:₦5.2M│ │Net:₦8.1M │    │
│  └─────────┘ └──────────┘ └──────────┘    │
│                                              │
│  ┌────┬──────┬───────┬──────┬──────┬──────┐ │
│  │ ID │ Name │ Gross │ PAYE │ Net  │ Rate │ │
│  ├────┼──────┼───────┼──────┼──────┼──────┤ │
│  │001 │ John │ ₦500k │₦52k │₦448k│10.4% │ │
│  │002 │ Jane │ ₦750k │₦98k │₦652k│13.1% │ │
│  └────┴──────┴───────┴──────┴──────┴──────┘ │
│                                  [Export]    │
└─────────────────────────────────────────────┘
```

**Template format:**

| Column | Description | Required |
|--------|-------------|----------|
| EmployeeID | Unique identifier | Yes |
| Name | Employee full name | Yes |
| Basic | Monthly basic salary | Yes |
| Housing | Monthly housing allowance | Yes |
| Transport | Monthly transport allowance | Yes |
| Utility | Monthly utility allowance | No |
| Wardrobe | Monthly wardrobe allowance | No |
| Lunch | Monthly lunch allowance | No |
| Bonus | Monthly bonus | No |
| ThirteenthMonth | 13th month amount | No |
| Commission | Commission amount | No |
| OtherAllowances | Other allowances | No |
| NHF% | NHF percentage (default 2.5) | No |
| NHIS | NHIS contribution | No |
| Pension% | Pension percentage (default 8) | No |
| LifeAssurance | Life assurance premium | No |
| AnnualRent | Annual rent paid | No |
| HasRentReceipt | TRUE/FALSE | No |
| JoinDate | For mid-year calculations | No |
| ExitDate | For mid-year calculations | No |

**How to use:**
1. Click **"Download Template"** to get the standardised Excel template
2. Fill in employee data
3. Upload the file
4. View computed results in the table
5. Click **"Export to Excel"** to download LIRS-ready payroll sheets

### 4.2 Mid-Year Proration

For employees who join or leave mid-year, include their **JoinDate** and/or **ExitDate** in the upload. The engine automatically prorates the annual tax calculation for the actual months worked.

---

## 5. Tax Consultant Mode

### 5.1 Old PITA vs New NTA Comparison

```
┌─────────────────────────────────────────────────────┐
│  Regime Comparison                                   │
│                                                      │
│  Annual Gross Income:  [₦  6,000,000]  [Compare]   │
│                                                      │
│  ┌───────────────┐    ┌───────────────┐             │
│  │  Old PITA     │    │  New NTA      │             │
│  │  (CRA)        │    │  (RRA)        │             │
│  │               │    │               │             │
│  │ CRA: ₦1.4M   │    │ RRA: ₦500k   │             │
│  │ Tax:  ₦580k  │    │ Tax:  ₦503k  │             │
│  │ Net:  ₦5.4M  │    │ Net:  ₦5.5M  │             │
│  │ Rate: 12.7%  │    │ Rate: 10.8%  │             │
│  └───────────────┘    └───────────────┘             │
│                                                      │
│  ┌─────────────────────────────────────────┐        │
│  │ Difference Summary                       │        │
│  │ Tax Change   │ % Change   │ Monthly     │        │
│  │ -₦77,000     │ -13.3%     │ -₦6,417    │        │
│  │ (savings)    │            │ (savings)   │        │
│  └─────────────────────────────────────────┘        │
│                                                      │
│  ▼ New Regime Bracket Breakdown                     │
│  First ₦800,000 @ 0%  →  ₦0 on ₦800,000           │
│  Next ₦2,200,000 @ 15% →  ₦330,000 on ₦2,200,000  │
│  ...                                                │
└─────────────────────────────────────────────────────┘
```

**How to use:**
1. Navigate to **Tax Calculator** → **Tax Consultant** tab
2. Enter the employee's **Annual Gross Income**
3. Click **Compare**
4. Review side-by-side comparison of old PITA (with CRA) vs new NTA (with RRA)
5. View the **Difference Summary** showing tax savings or increases

### 5.2 Tax Optimisation Sandbox

```
┌─────────────────────────────────────────────────────┐
│  Tax Optimisation Sandbox                            │
│                                                      │
│  ┌─── Controls ─────────────────┐ ┌── Results ──┐  │
│  │ Basic Salary                 │ │ Annual:     │  │
│  │ [═══●═══════════════] ₦500k │ │ Gross: ₦6M  │  │
│  │                              │ │ Tax:  ₦503k │  │
│  │ Pension Contribution         │ │ Net:  ₦5.5M │  │
│  │ [═══●═══════════════]   8%   │ │              │  │
│  │                              │ │ Effective:   │  │
│  │ Life Assurance (annual)      │ │   10.8%      │  │
│  │ [═══●═══════════════] ₦100k │ │              │  │
│  │                              │ │ Monthly:     │  │
│  │ Annual Rent Paid             │ │ Net: ₦458k  │  │
│  │ [═══●═══════════════] ₦1.2M │ └──────────────┘  │
│  │                              │                    │
│  │ ☑ I have rent receipts       │                    │
│  └──────────────────────────────┘                    │
└─────────────────────────────────────────────────────┘
```

**How to use:**
1. Click **"Open Optimisation Sandbox"** from the Consultant tab
2. Adjust sliders to see real-time tax impact:
   - **Basic Salary** — see how raises affect tax
   - **Pension Contribution** — increase from 8% to 30% to reduce chargeable income
   - **Life Assurance Premium** — add voluntary life assurance for pre-tax deduction
   - **Annual Rent** — maximise your Rent Relief Allowance (capped at ₦500,000)
3. Watch the results update instantly as you slide
4. Use this to demonstrate legal tax savings to clients

---

## 6. Employee Management

```
┌─────────────────────────────────────────────────────┐
│  Employee Management              [+ Add Employee]  │
│  15 employee(s) on record                           │
│                                                     │
│  [Search employees..._____________________________] │
│                                                     │
│  ┌──────┬────────┬────────────┬──────┬──────┬─────┐│
│  │ Name │ Email  │ Dept       │Basic │Status│     ││
│  ├──────┼────────┼────────────┼──────┼──────┼─────┤│
│  │ John │ j@c.ng │ Engineering│₦500k │●active│Edit││
│  │ Jane │ jn@c.ng│ Marketing  │₦750k │●active│Edit││
│  └──────┴────────┴────────────┴──────┴──────┴─────┘│
└─────────────────────────────────────────────────────┘
```

**Available for:** Corporate HR and Admin roles

**Features:**
- **Add Employee** — full form with name, email, phone, department, role, join date, salary components
- **Edit/Delete** — modify or remove records
- **Search** — filter by name, email, or department
- Data is used by the Tax Records module for batch computation

---

## 7. Tax Records

```
┌─────────────────────────────────────────────────────┐
│  Tax Records                                         │
│  PAYE computation history by period                  │
│                                                     │
│  Year: [2026 ▼]  Month: [June ▼]  [Compute All]    │
│                                                     │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐           │
│  │Gross:    │ │PAYE:     │ │Net:      │           │
│  │₦7.5M     │ │₦1.2M     │ │₦6.3M     │           │
│  └──────────┘ └──────────┘ └──────────┘           │
│                                                     │
│  ┌──────┬───────┬──────┬──────┬──────┬──────┬─────┐│
│  │Name  │Gross  │PAYE  │Net   │Rate  │Status│     ││
│  ├──────┼───────┼──────┼──────┼──────┼──────┼─────┤│
│  │ John │₦500k │₦52k  │₦448k │10.4% │✓comp│Submit││
│  │ Jane │₦750k │₦98k  │₦652k │13.1% │✓comp│Submit││
│  └──────┴───────┴──────┴──────┴──────┴──────┴─────┘│
└─────────────────────────────────────────────────────┘
```

**Available for:** Admin, Corporate HR, Consultant

**How to use:**
1. Select **Year** and **Month**
2. Click **"Compute All for Period"** to compute PAYE for all employees
3. View summary totals (Gross, PAYE, Net)
4. Click **Submit** to change status from "computed" → "submitted"
5. Click **Approve** to change from "submitted" → "approved"

---

## 8. Subscription Plans

```
┌─────────────────────────────────────────────────────┐
│              Choose Your Plan                        │
├──────────┬──────────────────┬───────────────────────┤
│  Free    │   ⭐ Pro        │   👑 Enterprise       │
│          │   Most Popular    │                       │
│  Free    │ ₦15,000/yr       │ ₦75,000/yr            │
│          │                  │                       │
│  ✓ Basic │ ✓ All Free      │ ✓ All Pro             │
│  Calc    │   + Batch        │   + API Access        │
│  ✓ Gross │ ✓ Export         │ ✓ Priority Support    │
│  Up      │ ✓ Comparison     │                       │
│  ✓ RRA   │ ✓ Sandbox        │                       │
│          │ ✓ Employee CRUD  │                       │
│          │                  │                       │
│ [Current]│ [Subscribe]      │ [Subscribe]           │
└──────────┴──────────────────┴───────────────────────┘
```

**Plans at a glance:**

| Feature | Free | Pro (₦15k/yr) | Enterprise (₦75k/yr) |
|---------|------|----------------|----------------------|
| PAYE Calculator | ✓ | ✓ | ✓ |
| Reverse Calculator | ✓ | ✓ | ✓ |
| RRA Computation | ✓ | ✓ | ✓ |
| Batch Upload | — | ✓ | ✓ |
| CSV/Excel Export | — | ✓ | ✓ |
| Old vs New Comparison | — | ✓ | ✓ |
| Optimisation Sandbox | — | ✓ | ✓ |
| Employee CRUD | — | ✓ | ✓ |
| API Access | — | — | ✓ |
| Priority Support | — | — | ✓ |

---

## 9. Feedback & Support

### Submitting Feedback

```
┌─────────────────────────────────────────────┐
│  Send Feedback                               │
│                                              │
│  Name:    [_______________]                  │
│  Email:   [_______________]                  │
│  Role:    [Select role ▼]                    │
│  Category:[Bug Report     ▼]                 │
│                                              │
│  Rating:  ★ ★ ★ ★ ☆  (Good)                │
│                                              │
│  Message:                                    │
│  [____________________________________]      │
│  [____________________________________]      │
│                                              │
│  [Submit Feedback]  [Download CSV]           │
│                                               │
│  12 feedback entries stored locally           │
└─────────────────────────────────────────────┘
```

**How to submit:**
1. Navigate to **Feedback** in the sidebar
2. Fill in your name, email, and role
3. Select a category (Bug Report, Feature Request, etc.)
4. Rate your experience (1–5 stars)
5. Write your message
6. Click **Submit Feedback**

**For administrators:** Click **"Download Stored Feedback (CSV)"** to export all feedback as a CSV file for development team review.

---

## 10. GDPR & Legal

### Cookie Consent Banner

When you first visit the app, a cookie banner appears at the bottom:

```
┌─────────────────────────────────────────────────────┐
│ 🍪 We value your privacy                             │
│ We use essential cookies to make the Tool work.     │
│ [Essential Only]  [Accept All]                      │
└─────────────────────────────────────────────────────┘
```

- **Essential Only** — only necessary cookies for authentication and basic function
- **Accept All** — includes functional/preference cookies

### Your Rights (GDPR & NDPR)

Under the Nigerian Data Protection Regulation (NDPR) and EU GDPR, you have the right to:
- **Access** your data
- **Rectify** inaccurate data
- **Erase** your data
- **Restrict** processing
- **Export** your data (portability)
- **Withdraw** consent at any time

All your data is stored locally in your browser. Clearing your browser data will remove everything.

### Legal Pages

| Page | Route | Description |
|------|-------|-------------|
| Disclaimer | `/disclaimer` | Terms of use and liability limitations |
| Privacy Policy | `/privacy` | GDPR/NDPR-compliant data handling |
| Cookie Policy | `/cookies` | Detailed cookie usage explanation |

---

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl+1` | Switch to Individual Taxpayer tab |
| `Ctrl+2` | Switch to Corporate Payroll tab |
| `Ctrl+3` | Switch to Tax Consultant tab |
| `Ctrl+B` | Toggle sidebar |

---

## Troubleshooting

### Common Issues

| Issue | Solution |
|-------|----------|
| "No employees found" | Add employees via the Employee Management page first |
| Computation returns 0 | Check that salary components are entered correctly (not empty) |
| Can't access a feature | Check your subscription plan (Free plan has limited features) |
| Data lost | Data is stored in localStorage; clearing browser data deletes it |
| Wrong tax calculation | Verify input amounts and check the bracket breakdown details |

### Browser Support

- Google Chrome 90+
- Mozilla Firefox 88+
- Safari 14+
- Microsoft Edge 90+
- Opera 76+

---

> **Need more help?** Submit feedback through the app or contact support at support@taxbox.ng
