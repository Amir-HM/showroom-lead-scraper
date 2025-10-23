# Deployment Guide

## How to Deploy to Apify

### Option 1: Apify Console (Recommended for Beginners)

1. **Create Account**
   - Go to [apify.com](https://apify.com)
   - Sign up for a free account

2. **Create New Actor**
   - Click "Actors" in the left menu
   - Click "Create new" → "Empty actor"
   - Name it "swedish-business-scraper"

3. **Upload Code**
   - Go to the "Source" tab
   - Delete the default code
   - Copy and paste the contents of `main.js`
   - Click "Save"

4. **Configure Actor**
   - Go to "Input" tab
   - Copy the contents of `.actor/input_schema.json`
   - Paste into the input schema editor
   - Click "Save"

5. **Set Dependencies**
   - Go to "Package.json" tab
   - Copy the contents of `package.json`
   - Paste and save

6. **Build and Run**
   - Click "Build"
   - Wait for build to complete
   - Click "Start" to run the actor
   - View results in the "Runs" tab

### Option 2: Apify CLI (For Developers)

1. **Install Apify CLI**
   ```bash
   npm install -g apify-cli
   ```

2. **Login to Apify**
   ```bash
   apify login
   ```

3. **Navigate to Project**
   ```bash
   cd showroom_lead_scraper
   ```

4. **Initialize (if needed)**
   ```bash
   apify init
   ```

5. **Push to Apify**
   ```bash
   apify push
   ```

6. **Run the Actor**
   ```bash
   apify call
   ```

### Option 3: GitHub Integration

1. Push this code to a GitHub repository
2. In Apify Console, connect your GitHub account
3. Create new actor and select "GitHub" as source
4. Select your repository
5. Apify will automatically sync and build

## Configuration Tips

### Proxy Settings
- **Free accounts**: Use Apify Proxy with datacenter IPs
- **Paid accounts**: Use residential proxies for better success rate
- Configure in input: `"useApifyProxy": true`

### Rate Limiting
- Start with `maxResultsPerSearch: 10-20` to test
- Increase gradually based on your needs
- Watch for Google Maps rate limits

### Cost Optimization
- Each search query consumes compute units
- Fewer cities/categories = lower cost
- Use specific searches rather than broad ones

## Monitoring

- View logs in real-time during actor runs
- Check dataset for scraped results
- Monitor compute unit usage in account dashboard

## Troubleshooting

### Actor Fails to Build
- Check `package.json` syntax
- Ensure all files are properly uploaded
- Review build logs for specific errors

### No Results Returned
- Verify proxy configuration
- Check if searches are too specific
- Review actor logs for error messages

### Duplicate Results
- The deduplication logic should handle this
- Check if placeId is being captured correctly

## Next Steps

After successful deployment:
1. Schedule regular runs (Apify Scheduler)
2. Export data to Google Sheets, CSV, or JSON
3. Integrate with webhooks for automation
4. Build enrichment pipeline (step 2)
