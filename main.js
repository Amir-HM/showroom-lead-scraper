const { Actor } = require('apify');
const { PlaywrightCrawler } = require('crawlee');

// Helper function to create search queries
function generateSearchQueries(cities, categories, countryCode) {
    const queries = [];
    
    for (const city of cities) {
        for (const category of categories) {
            queries.push({
                searchUrl: `https://www.google.com/maps/search/${encodeURIComponent(category)}/@0,0,12z?hl=en&entry=ttu`,
                location: `${city}, ${countryCode}`,
                city: city,
                category: category
            });
        }
    }
    
    return queries;
}

// Helper function to scroll and load results in Google Maps
async function scrollResults(page, maxResults) {
    console.log(`📜 Scrolling to load up to ${maxResults} results...`);
    
    // Wait for results container
    await page.waitForSelector('div[role="feed"]', { timeout: 10000 });
    
    let previousHeight = 0;
    let scrollAttempts = 0;
    const maxScrollAttempts = 50;
    
    while (scrollAttempts < maxScrollAttempts) {
        await page.evaluate(() => {
            const resultsPanel = document.querySelector('div[role="feed"]');
            if (resultsPanel) {
                resultsPanel.scrollTop = resultsPanel.scrollHeight;
            }
        });
        
        await page.waitForTimeout(1500);
        
        const currentResults = await page.$$eval('div[role="feed"] > div > div[class*="Nv2PK"]', els => els.length);
        console.log(`   Found ${currentResults} results so far...`);
        
        if (currentResults >= maxResults) {
            console.log(`✅ Reached target of ${maxResults} results`);
            break;
        }
        
        const currentHeight = await page.evaluate(() => {
            const resultsPanel = document.querySelector('div[role="feed"]');
            return resultsPanel ? resultsPanel.scrollHeight : 0;
        });
        
        if (currentHeight === previousHeight) {
            console.log('⏹️  Reached end of results');
            break;
        }
        
        previousHeight = currentHeight;
        scrollAttempts++;
    }
}

// Extract business data from Google Maps
async function extractBusinesses(page, city, category) {
    return await page.evaluate((city, category) => {
        const businesses = [];
        const results = document.querySelectorAll('div[role="feed"] > div > div[class*="Nv2PK"]');
        
        results.forEach((result) => {
            try {
                const nameEl = result.querySelector('div[class*="qBF1Pd"]') || result.querySelector('a[class*="hfpxzc"]');
                const name = nameEl?.getAttribute('aria-label') || nameEl?.textContent?.trim() || '';
                
                if (!name || name.length < 2) return;
                
                const ratingEl = result.querySelector('span[role="img"]');
                const ratingText = ratingEl?.getAttribute('aria-label') || '';
                const ratingMatch = ratingText.match(/([0-9.]+)\s*star/i);
                const rating = ratingMatch ? parseFloat(ratingMatch[1]) : null;
                
                const reviewEl = result.querySelector('span[aria-label*="reviews"]') || result.querySelector('span[aria-label*="review"]');
                const reviewText = reviewEl?.getAttribute('aria-label') || reviewEl?.textContent || '';
                const reviewMatch = reviewText.match(/([0-9,]+)/);
                const reviewCount = reviewMatch ? parseInt(reviewMatch[1].replace(/,/g, '')) : 0;
                
                const addressEls = result.querySelectorAll('div[class*="W4Efsd"] span');
                let address = '';
                addressEls.forEach(el => {
                    const text = el.textContent?.trim() || '';
                    if (text && !text.includes('·') && !text.match(/^[0-9.]+$/)) {
                        if (!address) address = text;
                    }
                });
                
                const categoryEls = result.querySelectorAll('div[class*="W4Efsd"] span');
                let businessCategory = '';
                categoryEls.forEach(el => {
                    const text = el.textContent?.trim() || '';
                    if (text.includes('·')) {
                        const parts = text.split('·');
                        if (parts[0] && !parts[0].match(/^\d/)) {
                            businessCategory = parts[0].trim();
                        }
                    }
                });
                
                const linkEl = result.querySelector('a[href*="/maps/place/"]');
                const googleMapsUrl = linkEl ? linkEl.href : '';
                
                let placeId = '';
                if (googleMapsUrl) {
                    const placeIdMatch = googleMapsUrl.match(/!1s([^!]+)/);
                    placeId = placeIdMatch ? placeIdMatch[1] : '';
                }
                
                businesses.push({
                    name: name,
                    address: address,
                    city: city,
                    searchCategory: category,
                    businessCategory: businessCategory || category,
                    website: null,
                    phone: null,
                    rating: rating,
                    reviewCount: reviewCount,
                    googleMapsUrl: googleMapsUrl,
                    placeId: placeId,
                    latitude: null,
                    longitude: null,
                    scrapedAt: new Date().toISOString()
                });
            } catch (err) {
                console.error('Error extracting business:', err.message);
            }
        });
        
        return businesses;
    }, city, category);
}

// Main actor function
Actor.main(async () => {
    const input = await Actor.getInput();
    
    if (!input || !input.cities || !input.categories) {
        throw new Error('Missing required input: cities and categories are required');
    }
    
    const {
        cities = ['Stockholm', 'Gothenburg', 'Malmö'],
        categories = ['café', 'gym', 'beauty salon'],
        maxResultsPerSearch = 20,
        countryCode = 'Sweden',
        proxyConfiguration = { useApifyProxy: true }
    } = input;
    
    console.log('🚀 Starting Swedish Business Lead Scraper (Playwright)');
    console.log(`📍 Cities: ${cities.join(', ')}`);
    console.log(`🏪 Categories: ${categories.join(', ')}`);
    console.log(`📊 Max results per search: ${maxResultsPerSearch}`);
    
    const searchQueries = generateSearchQueries(cities, categories, countryCode);
    console.log(`📋 Generated ${searchQueries.length} search queries\n`);
    
    const seenBusinesses = new Set();
    let totalScraped = 0;
    let totalUnique = 0;
    
    // Create Playwright crawler
    const crawler = new PlaywrightCrawler({
        headless: true,
        maxRequestsPerCrawl: searchQueries.length,
        requestHandlerTimeoutSecs: 120,
        proxyConfiguration: await Actor.createProxyConfiguration(proxyConfiguration),
        
        async requestHandler({ page, request }) {
            const { city, category, location } = request.userData;
            
            console.log(`\n🔍 Searching: ${category} in ${city}`);
            
            try {
                await page.waitForLoadState('networkidle', { timeout: 30000 });
                
                console.log('🔎 Entering search query...');
                const searchBox = await page.waitForSelector('input[id="searchboxinput"]', { timeout: 10000 });
                await searchBox.fill(`${category} in ${location}`);
                
                const searchButton = await page.waitForSelector('button[id="searchbox-searchbutton"]', { timeout: 5000 });
                await searchButton.click();
                
                console.log('⏳ Waiting for results to load...');
                await page.waitForTimeout(3000);
                
                await scrollResults(page, maxResultsPerSearch);
                
                console.log('📊 Extracting business data...');
                const businesses = await extractBusinesses(page, city, category);
                
                console.log(`✅ Extracted ${businesses.length} businesses`);
                totalScraped += businesses.length;
                
                for (const business of businesses) {
                    const uniqueId = `${business.name}-${business.address}`.toLowerCase().replace(/\s+/g, '');
                    
                    if (seenBusinesses.has(uniqueId)) {
                        continue;
                    }
                    
                    if (!business.name || business.name.length < 2) {
                        continue;
                    }
                    
                    seenBusinesses.add(uniqueId);
                    totalUnique++;
                    
                    await Actor.pushData(business);
                    console.log(`💾 Saved: ${business.name}`);
                }
                
            } catch (error) {
                console.error(`❌ Error during scraping: ${error.message}`);
            }
        },
        
        failedRequestHandler({ request, error }) {
            console.error(`❌ Request failed for ${request.userData.city}: ${error.message}`);
        },
    });
    
    const requests = searchQueries.map(query => ({
        url: query.searchUrl,
        userData: {
            city: query.city,
            category: query.category,
            location: query.location
        }
    }));
    
    await crawler.run(requests);
    
    console.log('\n📊 Scraping Complete!');
    console.log(`📈 Total businesses found: ${totalScraped}`);
    console.log(`✨ Unique businesses saved: ${totalUnique}`);
    console.log(`🗑️  Duplicates removed: ${totalScraped - totalUnique}`);
    console.log(`🎯 Searches performed: ${searchQueries.length}`);
    console.log('\n✅ Actor finished successfully!');
});
