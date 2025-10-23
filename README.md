# Swedish Business Lead Scraper - Apify Actor

An Apify actor that automatically searches Google Maps for Swedish businesses across multiple cities and categories, collecting public business data for micro-influencer marketing lead generation.

## Features

- 🇸🇪 **Swedish Market Focus**: Searches businesses across major Swedish cities
- 🏪 **Multi-Category Support**: Cafés, gyms, beauty salons, restaurants, and more
- 📊 **Structured Data**: Collects name, address, website, phone, rating, and review count
- 🔄 **Deduplication**: Prevents duplicate entries based on business name and location
- 💾 **Clean Output**: Stores data in Apify dataset for easy export

## Use Case

This actor serves as the first step in a micro-influencer marketing pipeline:
1. **Lead Collection** (this actor) - Find potential businesses
2. **Enrichment** - Add social media profiles, owner info
3. **Scoring** - Rank by marketing potential
4. **Outreach** - Automated contact campaigns

## Input Configuration

```json
{
  "cities": ["Stockholm", "Gothenburg", "Malmö", "Uppsala"],
  "categories": ["café", "gym", "beauty salon"],
  "maxResultsPerSearch": 20,
  "countryCode": "Sweden"
}
```

## Output Format

```json
{
  "name": "Business Name",
  "address": "Street Address, City",
  "city": "Stockholm",
  "category": "café",
  "website": "https://example.com",
  "phone": "+46 70 123 4567",
  "rating": 4.5,
  "reviewCount": 127,
  "googleMapsUrl": "https://maps.google.com/...",
  "scrapedAt": "2025-10-24T10:30:00.000Z"
}
```

## Setup

1. Create a new actor in Apify Console
2. Copy the code files to your actor
3. Configure input settings
4. Run the actor

## Requirements

- Apify account
- Google Maps Scraper API access (via Apify)

## License

MIT
