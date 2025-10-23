# 🎉 Deployment Success!

## Repository Information
- **GitHub Repository**: https://github.com/Amir-HM/showroom-lead-scraper
- **Git Remote**: origin (https://github.com/Amir-HM/showroom-lead-scraper.git)

## Apify Actor Information
- **Actor ID**: ks1hgl5tF06RIHMuJ
- **Actor Name**: showroom-lead-scraper
- **Version**: 1.0
- **Build Status**: ✅ Successfully Built
- **Actor URL**: https://console.apify.com/actors/ks1hgl5tF06RIHMuJ
- **Latest Build**: https://console.apify.com/actors/ks1hgl5tF06RIHMuJ#/builds/1.0.1
- **Apify Username**: synk

## Quick Commands

### Git Commands
```bash
# Add files and commit
git add .
git commit -m "Your commit message"

# Push to GitHub
git push origin main

# Pull latest changes
git pull origin main
```

### Apify CLI Commands
```bash
# Check login status
apify info

# Push actor to Apify (build and deploy)
apify push

# Run actor locally
apify run

# Pull actor from Apify
apify pull

# View actor info
apify info

# Call/run the actor
apify call ks1hgl5tF06RIHMuJ
```

## How to Run Your Actor

### Option 1: From Apify Console (Web UI)
1. Go to: https://console.apify.com/actors/ks1hgl5tF06RIHMuJ
2. Click "Input" tab
3. Configure cities and categories
4. Click "Start" button
5. View results in the "Runs" tab

### Option 2: Via Apify CLI
```bash
cd /Users/amir/Desktop/Projects/Code/automations/showroom_lead_scraper
apify call ks1hgl5tF06RIHMuJ
```

### Option 3: Via API
```bash
curl -X POST https://api.apify.com/v2/acts/ks1hgl5tF06RIHMuJ/runs \
  -H "Authorization: Bearer YOUR_API_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "cities": ["Stockholm", "Gothenburg"],
    "categories": ["café", "gym"],
    "maxResultsPerSearch": 20
  }'
```

## Making Updates

When you make changes to your code:

1. **Commit to Git**:
   ```bash
   git add .
   git commit -m "Description of changes"
   git push origin main
   ```

2. **Deploy to Apify**:
   ```bash
   apify push
   ```

## Viewing Results

After running the actor:
- Results are stored in Apify Dataset
- Export as JSON, CSV, Excel, or HTML
- Access via API or download from console

## Cost Information

The actor uses:
- Apify compute units based on runtime
- Google Maps Scraper actor (called internally)
- Residential proxies for better success rates

Tip: Start with small searches to test and monitor costs!

## Support Links

- **Apify Documentation**: https://docs.apify.com
- **Apify CLI Docs**: https://docs.apify.com/cli
- **Actor Console**: https://console.apify.com/actors/ks1hgl5tF06RIHMuJ
- **GitHub Repo**: https://github.com/Amir-HM/showroom-lead-scraper

## Next Steps

1. ✅ Repository created on GitHub
2. ✅ Code pushed to GitHub
3. ✅ Actor deployed to Apify
4. ✅ Actor successfully built
5. 🚀 Ready to run your first scraping job!

### Run your first test:
```bash
# Navigate to project
cd /Users/amir/Desktop/Projects/Code/automations/showroom_lead_scraper

# Run the actor
apify call ks1hgl5tF06RIHMuJ
```

Happy scraping! 🎯
