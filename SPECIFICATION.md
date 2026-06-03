# TaxBox NG — Technical Specification Document

> **Lagos PAYE 2026 Calculator — Nigeria Tax Act (NTA) Compliant**

---

## Document Control

| Field | Value |
|-------|-------|
| **Project Name** | TaxBox NG — Lagos PAYE 2026 |
| **Document Version** | 1.0 |
| **Date** | June 2026 |
| **Status** | Draft |
| **Prepared By** | Development Team |

---

## 1. Executive Summary

TaxBox NG is a single-page application (SPA) for computing Pay-As-You-Earn (PAYE) tax under the new Nigeria Tax Act (NTA) 2026. It serves three user personas — Individual Taxpayers, Corporate HR/Payroll Managers, and Tax Consultants — with role-based access, real-time dashboards, batch processing, and GDPR-compliant data handling.

---

## 2. System Architecture

### 2.1 High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Client Browser                        │
│  ┌───────────────────────────────────────────────────────┐  │
│  │              React SPA (Vite + TypeScript)            │  │
│  │  ┌─────────┐ ┌──────────┐ ┌──────────┐ ┌─────────┐  │  │
│  │  │ Auth    │ │ Tax      │ │ Dashboard│ │ CRUD    │  │  │
│  │  │ Module  │ │ Engine   │ │ Module   │ │ Module  │  │  │
│  │  └─────────┘ └──────────┘ └──────────┘ └─────────┘  │  │
│  │  ┌────────────────────────────────────────────────┐  │  │
│  │  │         LocalStorage / SessionStorage          │  │  │
│  │  └────────────────────────────────────────────────┘  │  │
│  └───────────────────────────────────────────────────────┘  │
│                           │                                  │
└───────────────────────────┼──────────────────────────────────┘
                            │
                    ┌───────┴───────┐
                    │  Future API   │
                    │  Gateway      │
                    └───────┬───────┘
                            │
              ┌─────────────┼─────────────┐
              │             │             │
        ┌─────┴─────┐ ┌────┴────┐ ┌────┴────┐
        │  Auth     │ │ PAYE    │ │ LIRS    │
        │  Service  │ │ Engine  │ │ Gateway │
        └───────────┘ └─────────┘ └─────────┘
```

### 2.2 Technology Stack

| Layer | Technology | Version | Rationale |
|-------|-----------|---------|-----------|
| **Frontend Framework** | React | 19.x | Component-based UI, large ecosystem |
| **Build Tool** | Vite | 8.x | Fast HMR, TypeScript-native |
| **Language** | TypeScript | 6.x | Type safety, better developer experience |
| **Styling** | Tailwind CSS | 4.x | Utility-first, rapid prototyping |
| **Charts** | Recharts | 3.x | Composable charting for React |
| **Validation** | Zod | 4.x | Runtime type validation, schema inference |
| **Excel/CSV** | SheetJS (xlsx) | 0.18.x | Excel file generation and parsing |
| **Routing** | React Router | 7.x | Declarative routing, nested layouts |
| **State Mgmt** | React Context | Built-in | Lightweight, no external deps needed |

### 2.3 Client-Side Data Storage

| Storage Type | Key Prefix | Purpose | Persistence |
|-------------|-----------|---------|-------------|
| localStorage | `taxbox_*` | User data, settings, feedback | Until cleared |
| localStorage | `taxbox_session` | Auth session token | Until logout |
| localStorage | `taxbox_consent` | Cookie consent preference | 1 year |
| localStorage | `taxbox_users` | Mock user database | Until cleared |
| localStorage | `taxbox_employees` | Employee records | Until cleared |
| localStorage | `taxbox_taxrecords` | Tax computation history | Until cleared |
| localStorage | `taxbox_feedback` | User feedback entries | Until cleared |
| localStorage | `taxbox_subscriptions` | Subscription data | Until cleared |

> **Note:** In production with a backend, localStorage will be replaced with server-side databases (PostgreSQL) and JWT-based sessions.

---

## 3. Core Tax Engine

### 3.1 Calculation Flow

```
Gross Income (annual)
    │
    ▼
Subtract Statutory Deductions:
  ├── NHF: 2.5% of Basic Salary
  ├── NHIS: Actual contribution
  ├── Pension: 8% of (Basic + Housing + Transport)
  └── Life Assurance: Actual premium
    │
    ▼
Income After Statutory Deductions
    │
    ▼
Subtract Rent Relief Allowance (RRA):
  └── 20% of annual rent paid, capped at ₦500,000
    │
    ▼
Chargeable Income
    │
    ▼
Apply Progressive Tax Brackets (2026):
  ┌────────────────────────┬─────────┐
  │ Band                   │ Rate    │
  ├────────────────────────┼─────────┤
  │ First ₦800,000         │   0%    │
  │ Next ₦2,200,000        │  15%    │
  │ Next ₦9,000,000        │  18%    │
  │ Next ₦13,000,000       │  21%    │
  │ Next ₦25,000,000       │  23%    │
  │ Above ₦50,000,000      │  25%    │
  └────────────────────────┴─────────┘
    │
    ▼
Total Tax = Sum of all bracket taxes
Net Income = Gross Income - Deductions - Total Tax
Monthly = Annual / 12
```

### 3.2 Core Function: `calculateLagosPaye2026`

```
Input:  PayeInput { grossIncome, deductions, rent }
        isMonthly: boolean (default: true)

Output: PayeResult {
          grossIncome: number
          statutoryDeductions: DeductionBreakdown
          incomeAfterStatutoryDeductions: number
          rentRelief: number
          chargeableIncome: number
          taxBrackets: TaxBracket[]
          totalTax: number
          effectiveTaxRate: number
          netIncome: number
          monthly: MonthlyBreakdown
        }
```

### 3.3 Supporting Functions

| Function | Description |
|----------|-------------|
| `grossUpTargetNetPay()` | Binary search to find gross salary for desired net pay |
| `calculateMidYear()` | Prorate annual calculation for partial year |
| `calculateOldPita()` | Legacy PITA calculation for comparison (CRA-based) |
| `computeComparative()` | Side-by-side old vs new regime comparison |

---

## 4. Data Models

### 4.1 User & Auth

```typescript
interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'corporate' | 'consultant' | 'individual';
  company?: string;
  phone?: string;
}
```

### 4.2 Tax Calculation

```typescript
interface GrossIncome {
  basic: number; housing: number; transport: number;
  utility: number; wardrobe: number; lunch: number;
  bonus: number; thirteenthMonth: number;
  commission: number; otherAllowances: number;
}

interface PreTaxDeductions {
  nhfPercentage: number;    // default 2.5
  nhis: number;
  pensionPercentage: number; // default 8
  lifeAssurance: number;
}

interface RentInfo {
  annualRentPaid: number;
  hasRentReceipt: boolean;
}

interface PayeResult {
  grossIncome: number;
  statutoryDeductions: DeductionBreakdown;
  incomeAfterStatutoryDeductions: number;
  rentRelief: number;
  chargeableIncome: number;
  taxBrackets: TaxBracket[];
  totalTax: number;
  effectiveTaxRate: number;
  netIncome: number;
  monthly: MonthlyBreakdown;
}
```

### 4.3 Business Records

```typescript
interface Employee {
  id: string; companyId: string; name: string;
  email: string; phone: string; department: string;
  jobRole: string; joinDate: string;
  basicSalary: number; housing: number; transport: number;
  status: 'active' | 'inactive';
}

interface TaxRecord {
  id: string; employeeId: string; employeeName: string;
  companyId: string; taxYear: number; month: number;
  grossPay: number; taxDeducted: number; netPay: number;
  chargeableIncome: number; effectiveRate: number;
  status: 'computed' | 'submitted' | 'approved';
  createdAt: string;
}
```

### 4.4 Subscription

```typescript
interface Subscription {
  id: string; userId: string;
  tier: 'free' | 'pro' | 'enterprise';
  status: 'active' | 'inactive' | 'canceled' | 'past_due';
  startDate: string; endDate?: string;
  autoRenew: boolean;
}
```

---

## 5. Feature Matrix by User Role

| Feature | Individual | Corporate | Consultant | Admin |
|---------|:----------:|:---------:|:----------:|:-----:|
| PAYE Calculator | ✓ | ✓ | ✓ | ✓ |
| Reverse Calculator (Gross-Up) | ✓ | ✓ | ✓ | ✓ |
| RRA Computation | ✓ | ✓ | ✓ | ✓ |
| Real-Time Dashboard | ✓ | ✓ | ✓ | ✓ |
| Batch Payroll Upload | — | ✓ | — | ✓ |
| CSV/Excel Export | — | ✓ | ✓ | ✓ |
| Regime Comparison (Old vs New) | — | — | ✓ | ✓ |
| Optimisation Sandbox | — | — | ✓ | ✓ |
| Employee CRUD | — | ✓ | — | ✓ |
| Tax Records CRUD | — | ✓ | ✓ | ✓ |
| Subscription Management | ✓ | ✓ | ✓ | ✓ |
| Feedback Submission | ✓ | ✓ | ✓ | ✓ |
| Legal Pages (Public) | ✓ | ✓ | ✓ | ✓ |
| Manage Users | — | — | — | ✓ |

---

## 6. Route Structure

```
/login                          Public — Login page
/register                       Public — Registration page
/disclaimer                     Public — Legal disclaimer
/privacy                        Public — Privacy policy (GDPR/NDPR)
/cookies                        Public — Cookie policy

/app/*                          Protected — Requires authentication
  /app/dashboard                All roles — Real-time dashboard
  /app/calculator               All roles — 3-tab PAYE calculator
  /app/employees                Admin, Corporate — Employee CRUD
  /app/tax-records              Admin, Corporate, Consultant — Tax records
  /app/subscription             All roles — Subscription plans
  /app/feedback                 All roles — Feedback form
  /app/disclaimer               All roles — Legal disclaimer (in-app)
  /app/privacy                  All roles — Privacy policy (in-app)
  /app/cookies                  All roles — Cookie policy (in-app)
```

---

## 7. Security & Compliance

### 7.1 Data Protection

- **Storage:** All user data stored client-side in localStorage (no server transmission)
- **Encryption:** Future server storage will use AES-256 at rest, TLS 1.3 in transit
- **Authentication:** Simulated auth with localStorage; production will use JWT + OAuth2
- **Session:** Session stored in localStorage, cleared on logout

### 7.2 Regulatory Compliance

| Regulation | Compliance Status | Notes |
|-----------|-----------------|-------|
| **Nigeria Tax Act (NTA) 2026** | ✓ Full | Tax brackets, RRA, deductions |
| **NDPR (Nigeria Data Protection Regulation)** | ✓ Full | Privacy policy, consent, rights |
| **GDPR (EU General Data Protection Regulation)** | ✓ Full | Data processing, consent, portability |
| **LIRS Guidelines** | ✓ Full | Lagos State PAYE computation rules |

### 7.3 Cookie Consent

- **Essential cookies:** Set without consent (session, auth)
- **Functional cookies:** Require opt-in consent
- **Analytics cookies:** Require opt-in consent (currently disabled)
- **Consent record:** Stored in `taxbox_consent` with 1-year expiry
- **Revocation:** User can clear browser cookies to reset consent

---

## 8. Validation Rules

| Rule | Implementation |
|------|---------------|
| No negative salary values | Zod `.nonnegative()` on all number fields |
| NHF percentage 0–100% | Zod `.min(0).max(100)` |
| Pension percentage 0–100% | Zod `.min(0).max(100)` |
| RRA capped at ₦500,000/year | `Math.min(annualRent * 0.2, 500_000)` |
| RRA requires rent receipt | `hasRentReceipt === true` check |
| Empty string validation | Zod `.min(1)` on required string fields |
| Email format validation | HTML5 `type="email"` + Zod string |

---

## 9. Performance Considerations

| Metric | Target | Current |
|--------|--------|---------|
| First Contentful Paint (FCP) | < 1.5s | ~0.8s (Vite optimised) |
| Time to Interactive (TTI) | < 2.0s | ~1.2s |
| Bundle Size (initial) | < 200KB | ~346KB gzipped (recharts) |
| Lighthouse Score | > 90 | TBD |
| Concurrent Users (client) | Unlimited | Client-side only |

**Optimisation opportunities:**
- Code-split recharts with dynamic import
- Lazy-load legal pages
- Implement virtual scrolling for large employee lists
- Tree-shake unused dependencies

---

## 10. Testing Strategy

| Type | Tools | Scope |
|------|-------|-------|
| **Unit Tests** | Vitest | Tax engine pure functions, validation schemas |
| **Component Tests** | React Testing Library | UI components, form validation |
| **Integration Tests** | Playwright | Multi-tab navigation, batch upload flow |
| **E2E Tests** | Playwright | Full user journey: login → calculate → export |

---

## 11. Deployment Architecture (Future)

```
┌─────────────────────────────────────────────────┐
│                  CDN (Cloudflare/Pusher)          │
│                       │                          │
│              ┌────────┴────────┐                  │
│              │   S3/DO Space   │                  │
│              │  (Static Build) │                  │
│              └────────┬────────┘                  │
│                       │                          │
│              ┌────────┴────────┐                  │
│              │  Load Balancer  │                  │
│              └────────┬────────┘                  │
│                       │                          │
│         ┌─────────────┼─────────────┐             │
│    ┌────┴────┐   ┌────┴────┐   ┌────┴────┐      │
│    │ Node.js │   │ Node.js │   │ Node.js │      │
│    │ API     │   │ API     │   │ API     │      │
│    └────┬────┘   └────┬────┘   └────┬────┘      │
│         └─────────────┼─────────────┘             │
│                       │                          │
│              ┌────────┴────────┐                  │
│              │  PostgreSQL    │                   │
│              │  + Redis Cache │                   │
│              └─────────────────┘                  │
└─────────────────────────────────────────────────┘
```

---

## 12. Glossary

| Term | Definition |
|------|-----------|
| **PAYE** | Pay-As-You-Earn — income tax deducted at source by employer |
| **NTA** | Nigeria Tax Act 2026 — current tax legislation |
| **PITA** | Personal Income Tax Act (old regime, pre-2026) |
| **RRA** | Rent Relief Allowance — 20% of rent paid, capped at ₦500k |
| **CRA** | Consolidated Relief Allowance (old regime, deprecated) |
| **NHF** | National Housing Fund — 2.5% of basic salary |
| **NHIS** | National Health Insurance Scheme |
| **LIRS** | Lagos State Internal Revenue Service |
| **NDPR** | Nigeria Data Protection Regulation |
| **Chargeable Income** | Income after all reliefs and deductions, on which tax is calculated |
| **Gross-Up** | Calculating required gross salary from desired net pay |
| **Effective Tax Rate** | Total tax as percentage of chargeable income |
