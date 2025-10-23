const { Actor, CheerioCrawler } = require('apify');
const { URL } = require('url');

// Helper function to create search queries
function generateSearchQueries(cities, categories, countryCode) {
    const queries = [];
    
    for (const city of cities) {
        for (const category of categories) {
            queries.push({
                searchUrl: `https://www.google.com/maps/search/${encodeURIComponent(category + ' in ' + city + ', ' + countryCode)}`,
                city: city,
                category: category
            });
        }
    }
    
    return queries;
}

// Helper function to extract business data from Google Maps HTML
function extractBusinessData($, city, category) {
    const businesses = [];
    
    // Google Maps uses various selectors for business listings
    // This is a simplified version - Google Maps is heavily JavaScript-based
    $('div[role="article"]').each((i, element) => {
        const $element = $(element);
        
        const name = $element.find('div.qBF1Pd').text().trim() || 
                     $element.find('h3').text().trim();
        
        if (!name) return;
        
        const address = $element.find('div.W4Efsd:nth-of-type(2) span').text().trim() ||
                       $element.find('.W4Efsd').first().text().trim();
        
        const ratingText = $element.find('span[role="img"]').attr('aria-label') || '';
        const rating = parseFloat(ratingText.match(/[\d.]+/)?.[0]) || null;
        
        const reviewText = $element.find('span.UY7F9').text().trim();
        const reviewCount = parseInt(reviewText.replace(/[^\d]/g, '')) || 0;
        
        const phone = $element.find('span.UsdlK').text().trim() || null;
        
        businesses.push({
            name: name,
            address: address,
            city: city,
            category: category,
            website: null, // Will be extracted from detail page if needed
            phone: phone,
            rating: rating,
            reviewCount: reviewCount,
            googleMapsUrl: null, // Will be updated if link is found
            placeId: null,
            latitude: null,
            longitude: null,
            scrapedAt: new Date().toISOString()
        });
    });
    
    return businesses;
}

// Main actor function
Actor.main(async () => {
    // Get input from Actor
    const input = await Actor.getInput();
    
    // Validate input
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
    
    console.log('🚀 Starting Swedish Business Lead Scraper');
    console.log(`📍 Cities: ${cities.join(', ')}`);
    console.log(`🏪 Categories: ${categories.join(', ')}`);
    console.log(`📊 Max results per search: ${maxResultsPerSearch}`);
    
    // Generate all search queries
    const searchQueries = generateSearchQueries(cities, categories, countryCode);
    console.log(`📋 Generated ${searchQueries.length} search queries`);
    
    // Set to track unique businesses (prevent duplicates)
    const seenBusinesses = new Set();
    let totalScraped = 0;
    let totalUnique = 0;
    
    // Use CheerioCrawler for each search query
    for (const searchQuery of searchQueries) {
        console.log(`\n🔍 Searching: ${searchQuery.category} in ${searchQuery.city}, ${countryCode}`);
        
        try {
            const results = [];
            
            // Create a crawler for this search
            const crawler = new CheerioCrawler({
                maxRequestsPerCrawl: 1,
                requestHandlerTimeoutSecs: 30,
                proxyConfiguration,
                async requestHandler({ $, request }) {
                    console.log(`📡 Fetched: ${request.url}`);
                    
                    // Extract business data from the page
                    const businesses = extractBusinessData($, searchQuery.city, searchQuery.category);
                    results.push(...businesses);
                    
                    console.log(`✅ Found ${businesses.length} businesses on this page`);
                },
                failedRequestHandler({ request }) {
                    console.error(`❌ Request failed: ${request.url}`);
                },
            });
            
            // Run the crawler with the search URL
            await crawler.run([searchQuery.searchUrl]);
            
            totalScraped += results.length;
            
            // Process and store results
            for (const business of results) {
                // Create unique identifier
                const uniqueId = `${business.name}-${business.address}`.toLowerCase();
                
                // Skip if already seen
                if (seenBusinesses.has(uniqueId)) {
                    console.log(`⏭️  Skipping duplicate: ${business.name}`);
                    continue;
                }
                
                // Skip if name is empty
                if (!business.name || business.name.length < 2) {
                    continue;
                }
                
                // Mark as seen
                seenBusinesses.add(uniqueId);
                totalUnique++;
                
                // Push to dataset
                await Actor.pushData(business);
                
                console.log(`💾 Saved: ${business.name} (${business.city})`);
            }
            
            // Small delay between searches to be respectful
            await Actor.utils.sleep(3000);
            
        } catch (error) {
            console.error(`❌ Error searching "${searchQuery.category} in ${searchQuery.city}":`, error.message);
            // Continue with next query even if one fails
            continue;
        }
    }
    
    // Final statistics
    console.log('\n📊 Scraping Complete!');
    console.log(`📈 Total businesses scraped: ${totalScraped}`);
    console.log(`✨ Unique businesses saved: ${totalUnique}`);
    console.log(`🗑️  Duplicates removed: ${totalScraped - totalUnique}`);
    console.log(`🎯 Searches performed: ${searchQueries.length}`);
    
    console.log('\n✅ Actor finished successfully!');
});
