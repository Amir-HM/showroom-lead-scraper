# ✨ Leads Finder — Effortless Data Extraction

A cost-effective alternative to ZoomInfo, Lusha & Apollo. Get verified B2B emails, LinkedIn profiles, and rich firmographics at scale.

## 🚀 What this actor does

Leads Finder generates targeted B2B contact lists using advanced filters (job title, Location/City, industry, tech stack, revenue, funding, etc.) and returns verified emails, LinkedIn URLs, and detailed company data — ready for CRM or outreach.

**Free plan note:** Users on the free Apify plan can fetch up to 100 leads/run.

**Support:** codecrafter70@gmail.com

## 🧭 Quick start (UI)

1. Open the actor, set **📁 File name / Run label** (optional).
2. Choose your filters (e.g., **👔 Job Title** = "Marketing Manager", **🌍 Location** = "United States", **🏭 Industry** = "SaaS").
3. Set **#️⃣ Number of leads to fetch** (default 50,000; leave empty to fetch all that match).
4. Click **Run**. When finished, download results from the **Dataset** tab or use the **Overview** table.

**Location vs City:** Use Location for a region/country/state. To target a single city, leave Location empty and use City only. (Same logic for the Exclude fields.)

## 🧩 Input schema (fields you can use)

Fields accept arrays unless noted.

### General

- **fetch_count** (integer, default 50000) — Max leads to fetch. Leave empty to fetch all matches.
- **file_name** (string) — Custom run label / export name.

### People targeting

- **contact_job_title** / **contact_not_job_title** — Include/Exclude titles ("realtor", "software developer", "teacher", …).
- **seniority_level** — Founder, Owner, C-Level, Director, VP, Head, Manager, Senior, Entry, Trainee.
- **functional_level** — C-Level, Finance, Product, Engineering, Design, HR, IT, Legal, Marketing, Operations, Sales, Support.

### Location (Include)

- **contact_location** — Region/Country/State (e.g., EMEA, United States, California, US).
- **contact_city** — One or more cities (use this instead of Location when you want city-level targeting only).

### Location (Exclude)

- **contact_not_location** — Region/Country/State to exclude.
- **contact_not_city** — One or more cities to exclude.

### Email quality

- **email_status** — validated, not_validated, unknown (prefill: validated)

### Company targeting

- **company_domain** — Limit to specific domains (e.g., google.com, https://apple.com).
- **size** — 0–1, 2–10, 11–20, 21–50, 51–100, 101–200, 201–500, 501–1000, 1001–2000, 2001–5000, 10000+
- **company_industry** / **company_not_industry** — Include/Exclude industries.
- **company_keywords** / **company_not_keywords** — Include/Exclude free-text keywords.
- **min_revenue**, **max_revenue** — Revenue bands (100K → 10B).
- **funding** — Seed, Angel, Series A…F, Venture, Debt, Convertible, PE, Other.

## 📤 Output schema (what you get)

Results are written to the run's Dataset and rendered in the Overview table with these columns:

### Person

- first_name, last_name, full_name, job_title, headline, functional_level, seniority_level
- email (verified when available)
- linkedin (profile link)
- city, state, country

### Company

- company_name, company_domain, company_website (link), company_linkedin (link), company_linkedin_uid
- company_size, industry, company_description
- company_annual_revenue, company_annual_revenue_clean
- company_total_funding, company_total_funding_clean
- company_founded_year, company_phone
- company_street_address, company_city, company_state, company_country, company_postal_code, company_full_address
- company_market_cap (if public)

### Context

- keywords, company_technologies

## 🔎 Examples

### Example 1 — US SaaS marketing leaders

```json
{
  "contact_job_title": ["Head of Marketing", "VP Marketing", "CMO"],
  "functional_level": ["Marketing"],
  "contact_location": ["United States"],
  "company_industry": ["Computer Software", "Internet", "Information Technology & Services", "Marketing & Advertising", "SaaS"],
  "email_status": ["validated"],
  "fetch_count": 5000
}
```

### Example 2 — UK CTOs

```json
{
  "contact_job_title": ["CTO", "Head of Engineering", "VP Engineering"],
  "contact_location": ["United Kingdom"],
  "email_status": ["validated", "unknown"]
}
```

### Example 3 — Amsterdam city-only (no broader Location)

```json
{
  "contact_city": ["Amsterdam"],
  "contact_location": [],
  "email_status": ["validated"]
}
```

## ✅ Best practices

1. **Location vs City:** Choose one. Use Location for region/country/state or leave it empty and use City for city-only targeting. Same rule for Exclude.
2. **Start broad, then narrow.** Begin with Location + title, then add industry/revenue/funding.
3. **Use include & exclude.** Quickly remove irrelevant sectors with company_not_industry / company_not_keywords.
4. **Prefer validated emails.** Keep email_status = ["validated"] for outreach-ready lists; add unknown to increase volume.
5. **Deduplicate downstream.** If you merge runs, dedupe by email → linkedin → (full_name,company_domain).
6. **Stay compliant.** Use for B2B prospecting; follow GDPR/CCPA/PECR and local rules.

## 🧪 Output view (in the Apify UI)

The **Overview** tab shows a sortable table with links for company_website, linkedin, and company_linkedin. Export any time to CSV/JSON/XLSX from the Dataset.

## 🧰 API usage

Run via API with the same input JSON as the UI.

1. POST a run with your input JSON.
2. Poll for completion.
3. Fetch dataset items (JSON/CSV).

(See Apify docs for runs, datasets endpoints.)

## 💵 Pricing & limits

- From **$1.5 / 1,000 leads** (cheaper than typical ZoomInfo/Lusha/Apollo seat pricing).
- On the free Apify plan, the platform caps at **100 leads/run**.

## 🧯 Troubleshooting

- **Few or zero results?** Loosen filters (remove company_not_*, broaden Location, allow unknown email status). Try title synonyms ("Demand Gen" vs "Growth Marketing").
- **Too many results?** Add industry, revenue, funding, or switch from region to country/state/city.
- **Geography mismatches?** Don't mix broad regions with countries/states/cities; use either Location or City for the same target.

## ✨ Changelog (high level)

- **v1.1** — Simplified location filters: replaced Region/Country/State trio with Location (Region/Country/State) + City; mirrored for Exclude.
- **v1.0** — Initial release with People/Company/Tech/Revenue/Funding filters, validated email preference, and LinkedIn enrichment.

## 🏗️ Technical Notes

This actor is built with:
- Apify SDK for orchestration
- Comprehensive filtering engine
- Batch processing for optimal performance
- Free plan support with automatic capping

For production deployments, this actor can be integrated with real B2B data providers via API.

## 📄 License

MIT
