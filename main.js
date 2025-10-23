const { Actor } = require('apify');

// Helper function to create search queries
function generateSearchQueries(cities, categories, countryCode) {
    const queries = [];
    
    for (const city of cities) {
        for (const category of categories) {
            queries.push({
                query: `${category} in ${city}, ${countryCode}`,
                city: city,
                category: category
            });
        }
    }
    
    return queries;
}

// Helper function to clean and normalize data
function cleanBusinessData(business, city, category) {
    return {
        name: business.title || business.name || '',
        address: business.address || business.location?.address || '',
        city: city,
        category: category,
        website: business.website || business.url || null,
        phone: business.phone || business.phoneNumber || null,
        rating: business.rating || business.totalScore || null,
        reviewCount: business.reviewsCount || business.reviews || 0,
        googleMapsUrl: business.url || business.link || '',
        placeId: business.placeId || business.id || '',
        latitude: business.location?.lat || null,
        longitude: business.location?.lng || null,
        scrapedAt: new Date().toISOString()
    };
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
    
    // Process each search query
    for (const searchQuery of searchQueries) {
        console.log(`\n🔍 Searching: ${searchQuery.query}`);
        
        try {
            // Call Google Maps Scraper actor
            const googleMapsScraperInput = {
                searchStringsArray: [searchQuery.query],
                maxCrawledPlacesPerSearch: maxResultsPerSearch,
                language: 'en',
                countryCode: 'se', // Sweden country code
                proxyConfig: proxyConfiguration,
                includeWebsites: true,
                includePhoneNumber: true,
                includeReviews: false, // We only need the count, not full reviews
                skipClosedPlaces: false
            };
            
            // Run the Google Maps Scraper
            const run = await Actor.call('compass/crawler-google-places', googleMapsScraperInput);
            
            // Get the results from the scraper's dataset
            const { items } = await Actor.apifyClient.dataset(run.defaultDatasetId).listItems();
            
            console.log(`✅ Found ${items.length} businesses`);
            totalScraped += items.length;
            
            // Process and store results
            for (const business of items) {
                // Create unique identifier
                const uniqueId = `${business.title || business.name}-${business.address || business.location?.address}`.toLowerCase();
                
                // Skip if already seen
                if (seenBusinesses.has(uniqueId)) {
                    console.log(`⏭️  Skipping duplicate: ${business.title || business.name}`);
                    continue;
                }
                
                // Mark as seen
                seenBusinesses.add(uniqueId);
                totalUnique++;
                
                // Clean and normalize the data
                const cleanedData = cleanBusinessData(business, searchQuery.city, searchQuery.category);
                
                // Push to dataset
                await Actor.pushData(cleanedData);
                
                console.log(`💾 Saved: ${cleanedData.name} (${cleanedData.city})`);
            }
            
            // Small delay between searches to be respectful
            await Actor.utils.sleep(2000);
            
        } catch (error) {
            console.error(`❌ Error searching "${searchQuery.query}":`, error.message);
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
