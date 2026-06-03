# TaxBox NG — Cloud Hosting Costing Proposal

> **Launching the Lagos PAYE 2026 Calculator for Public Use in Nigeria**

---

## Document Control

| Field | Value |
|-------|-------|
| **Project** | TaxBox NG Production Deployment |
| **Version** | 1.0 |
| **Date** | June 2026 |
| **Prepared For** | Stakeholder Review |
| **Target Region** | Nigeria (Lagos primary) |

---

## 1. Executive Summary

This document outlines the estimated costs to deploy TaxBox NG to a production cloud environment accessible to the Nigerian public. Costs are presented in **Nigerian Naira (₦)** based on current provider pricing, with USD equivalents for international services.

**Total Estimated First-Year Cost:** **₦1,475,000 – ₦3,890,000** (~$1,000–$2,600 USD)

**Monthly Run Rate (Year 2+):** **₦90,000 – ₦275,000/month**

---

## 2. Architecture Overview

```
                     ┌─────────────┐
                     │  Cloudflare  │
                     │   (CDN +    │
                     │   DNS +     │
                     │   DDoS)     │
                     └──────┬──────┘
                            │
              ┌─────────────┼─────────────┐
              │             │             │
        ┌─────┴─────┐ ┌────┴────┐ ┌────┴────┐
        │  Static   │ │  Node   │ │  Postgres│
        │  Assets   │ │  API    │ │  DB      │
        │  (DO/Nginx)│ │  Server │ │  (Managed)│
        └───────────┘ └─────────┘ └─────────┘
              │
        ┌─────┴─────┐
        │  Object   │
        │  Storage  │
        │(Backups)  │
        └───────────┘
```

---

## 3. Hosting Options

### Option A: Nigerian Cloud Provider (Recommended for Local Launch)

| Provider | Location | Strengths |
|----------|----------|-----------|
| **RackCentre** | Lagos, Abuja | Nigerian-owned, local support, NGN billing |
| **MDXi (MainOne)** | Lagos | Tier III data center, Enterprise-grade |
| **Layer3** | Lagos | Competitive pricing, local presence |
| **WhoGoHost** | Lagos (RackCentre) | Budget-friendly, shared hosting available |

### Option B: International Provider (Better for Global Scaling)

| Provider | Est. Region | Strengths |
|----------|-------------|-----------|
| **DigitalOcean** | Amsterdam/Frankfurt | Developer-friendly, predictable pricing |
| **Hetzner** | Falkenstein/Helsinki | Best value for compute (€4-€40/mo) |
| **AWS** | eu-west-2 (London) | Full ecosystem, scaling, high cost |
| **Google Cloud** | europe-west2 (London) | GKE, BigQuery, higher cost |

### Recommendation

**Phase 1 (Launch):** RackCentre VPS + Cloudflare CDN — best balance of local latency, NGN billing, and cost.

**Phase 2 (Scale):** DigitalOcean App Platform + Managed Database for auto-scaling.

---

## 4. Detailed Cost Breakdown

### 4.1 One-Time Setup Costs

| Item | Details | Cost (₦) |
|------|---------|-----------|
| Domain Registration | `.com.ng` (e.g., taxbox.ng) — 1 year | 10,000 |
| Domain Privacy Protection | WHOIS privacy | 5,000 |
| SSL Certificate | Let's Encrypt (free) or PositiveSSL | 0–25,000 |
| Logo & Branding | Professional design | 100,000–250,000 |
| Legal Registration | CAC business registration (BN/RC) | 25,000–75,000 |
| NDPR Compliance Filing | Data Protection Audit (if required) | 50,000–200,000 |
| **Total One-Time** | | **₦190,000 – ₦565,000** |

### 4.2 Monthly Infrastructure Costs

| Item | Spec | Option A: Nigerian Provider | Option B: International |
|------|------|:---------------------------:|:-----------------------:|
| **VPS / App Server** | 2 vCPU, 4GB RAM, 80GB SSD | ₦25,000 (RackCentre) | ~₦22,000 ($15 USD, Hetzner) |
| **Database Server** | 2 vCPU, 4GB RAM, 50GB SSD (PostgreSQL) | ₦25,000 (bundled VPS) | ~₦15,000 ($10 USD, DO Managed) |
| **Object Storage** | 100GB (backups + assets) | ₦5,000 (S3-compatible) | ~₦4,500 ($3 USD) |
| **CDN** | Cloudflare Pro (better caching + WAF) | ₦7,500 ($5 USD) | ₦7,500 ($5 USD) |
| **Email Service** | SendGrid Essentials (12k emails/mo) | ₦7,500 ($5 USD) | ₦7,500 ($5 USD) |
| **Monitoring** | UptimeRobot + Sentry | ₦7,500 ($5 USD) | ₦7,500 ($5 USD) |
| **Backups** | Automated daily + weekly | Included | Included |
| **SSL** | Auto-renewal (Let's Encrypt) | Free | Free |
| **Total Monthly** | | **~₦77,500** | **~₦64,000** |

### 4.3 Annual Summary

| Category | Option A (Nigerian) | Option B (International) |
|----------|:-------------------:|:------------------------:|
| One-Time Setup | ₦190,000 – ₦565,000 | ₦190,000 – ₦565,000 |
| Monthly Infrastructure | ₦77,500 | ₦64,000 |
| **Year 1 Total** | **~₦1,120,000 – ₦1,495,000** | **~₦958,000 – ₦1,333,000** |
| **Year 2+ (Annual)** | **~₦930,000** | **~₦768,000** |

---

## 5. Detailed Provider Comparison

### 5.1 RackCentre (Nigeria) — Recommended

```
Plan: RackPrime VPS-4
CPU:   4 vCPU
RAM:   8 GB
SSD:   100 GB NVMe
Bandwidth: 2 TB
Price:  ₦30,000/month
Stack:  LEMP + Node.js via reverse proxy
Addons: Daily backup (+₦5,000/mo)
        cPanel (+₦3,500/mo) — optional
Total:  ₦35,000–38,500/month
```

**Contact:** www.rackcentre.com.ng | Lagos, Nigeria

### 5.2 WhoGoHost (Nigeria) — Budget Option

```
Plan: Cloud Super VPS 4
CPU:   4 vCPU
RAM:   4 GB
SSD:   80 GB
Bandwidth: 1 TB
Price:  ₦15,000/month
Note:   Shared environment, lower I/O
```

### 5.3 DigitalOcean — International

```
Plan: Basic Droplet + Managed DB
App Server:   $12/mo (2 vCPU, 2GB RAM)
DB Server:    $15/mo (1 vCPU, 2GB RAM, PostgreSQL)
Spaces:       $5/mo (250GB object storage)
Load Balancer:$12/mo (if scaling needed)
Total:        $32–44/mo (~₦48,000–66,000)
```

### 5.4 Hetzner — Best Value International

```
Plan: CX32 + Managed DB
App Server:   €8.50/mo (4 vCPU, 8GB RAM)
DB Server:    €7/mo (1 vCPU, 2GB RAM on same VPS)
Volume:       €0.06/GB/mo (backups)
Total:        ~€16/mo (~₦27,000)
```

---

## 6. Payroll & Operational Costs (Annual)

For ongoing maintenance and development after launch:

| Role | Engagement | Est. Annual Cost (₦) |
|------|-----------|:---------------------:|
| Full-Stack Developer | Part-time (20h/week) | 2,400,000 |
| UI/UX Designer | As needed (5h/week) | 600,000 |
| Tax Consultant / Domain Expert | Advisory (2h/week) | 500,000 |
| Customer Support | Part-time (10h/week) | 900,000 |
| Content Writer (FAQ, Guides) | One-off | 150,000 |
| **Total Annual Operational** | | **₦4,550,000** |

---

## 7. Scaling Projections

### Phase 1: MVP Launch (Month 1–3)

| Metric | Target |
|--------|--------|
| Users | 50–200 |
| Concurrent Users | 10–30 |
| Monthly Bandwidth | 50–200 GB |
| Infrastructure Cost | ₦77,500/mo |

### Phase 2: Growth (Month 4–12)

| Metric | Target |
|--------|--------|
| Users | 500–2,000 |
| Concurrent Users | 50–150 |
| Monthly Bandwidth | 200–500 GB |
| Infrastructure Cost | ₦150,000–200,000/mo |
| **Upgrade:** Add load balancer, second app server | |

### Phase 3: Scale (Year 2+)

| Metric | Target |
|--------|--------|
| Users | 5,000+ |
| Concurrent Users | 200–500 |
| Monthly Bandwidth | 500 GB–2 TB |
| Infrastructure Cost | ₦300,000–500,000/mo |
| **Upgrade:** Kubernetes cluster, multi-region, managed Redis | |

---

## 8. Payment Processing (Future Monetisation)

For Pro (₦15,000/yr) and Enterprise (₦75,000/yr) subscription collections:

| Provider | Setup Fee | Transaction Fee | Settlement |
|----------|:---------:|:---------------:|:----------:|
| **Paystack** (Recommended) | ₦0 | 1.5% + ₦100 | NGN, 1-2 days |
| **Flutterwave** | ₦0 | 1.4% + ₦0 | NGN, 24hrs |
| **Interswitch** | ₦50,000+ | ~1.5% | NGN, 48hrs |
| **Bank Transfer** | ₦0 | ₦50/txn | Manual |

**Paystack Integration Cost:** ₦0 setup + 1.5% per transaction.
At 100 Pro subscribers: ₦1,500,000 revenue, ₦22,500 + ₦10,000 fees = ₦32,500 (~2.2%)

---

## 9. Budget Summary by Tier

### Launch Budget (Recommended)

| Item | Cost (₦) |
|------|:---------:|
| Domain (.com.ng, 1 year) | 10,000 |
| SSL Certificate | Free |
| RackCentre VPS (1 month) | 35,000 |
| Cloudflare Pro (1 month) | 7,500 |
| SendGrid (1 month) | 7,500 |
| Monitoring (1 month) | 7,500 |
| Branding & Logo | 150,000 |
| CAC Registration | 50,000 |
| Developer (Month 1) | 400,000 |
| **Total Month 1** | **₦667,500** |
| **Monthly Recurring (after launch)** | **~₦497,500** (incl. dev) |

### Minimum Viable Budget

| Item | Cost (₦) |
|------|:---------:|
| Domain (.com.ng, 1 year) | 10,000 |
| SSL (Let's Encrypt) | Free |
| WhoGoHost VPS (1 month) | 15,000 |
| Cloudflare Free | Free |
| Self-managed email | Free |
| **Monthly Total** | **~₦15,000** |
| **Year 1 Total** | **~₦190,000** |

---

## 10. Recommended Go-Live Checklist

- [ ] Register company with CAC (BN or RC)
- [ ] Register domain name (e.g., taxbox.ng)
- [ ] File NDPR compliance with NITDA (if handling user data server-side)
- [ ] Set up cloud VPS with Nigerian provider (RackCentre recommended)
- [ ] Configure Cloudflare DNS + CDN + DDoS protection
- [ ] Deploy build artefacts (Nginx reverse proxy serving Vite build)
- [ ] Set up SSL (Let's Encrypt certbot auto-renewal)
- [ ] Configure automated daily backups
- [ ] Set up monitoring (UptimeRobot, Sentry)
- [ ] Implement server-side API (if expanding beyond client-only)
- [ ] Set up Paystack integration for subscription payments
- [ ] Write Terms of Service & Privacy Policy (displayed in app)
- [ ] Set up customer support email (support@taxbox.ng)
- [ ] Performance test with Lighthouse + GTmetrix
- [ ] Beta test with 10–20 users before public launch

---

## 11. Risk Assessment

| Risk | Impact | Probability | Mitigation |
|------|:------:|:-----------:|------------|
| Currency fluctuation (NGN) | Medium | High | Price in USD for international providers; NGN for local |
| Nigerian FX liquidity issues | High | Medium | Maintain USD buffer with international provider |
| Power/infrastructure outage | High | Medium | Use provider with generator backup; Cloudflare always-on |
| Regulatory change (tax law) | Medium | Medium | Modular engine; update brackets via config |
| Data privacy breach | High | Low | No server-side PII initially; full encryption later |
| Provider price increase | Low | Medium | Lock in annual pricing; have migration plan |

---

## 12. Appendix: Provider Contact Information

| Provider | Website | Nigerian Office |
|----------|---------|-----------------|
| RackCentre | rackcentre.com.ng | Lagos, Abuja |
| MDXi / MainOne | mainone.net | Lagos |
| Layer3 | layer3.ng | Lagos |
| WhoGoHost | whogohost.com.ng | Lagos |
| Paystack | paystack.com | Lagos (now Stripe) |
| Cloudflare | cloudflare.com | Global (no NG office) |

---

> **Prepared by:** TaxBox NG Development Team
> **Date:** June 2026
> **All prices are estimates and subject to change. NGN rates based on ~₦1,500/$1 USD.**
