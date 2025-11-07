const { Actor } = require('apify');

// Sample data generators for realistic lead generation
// In production, this would connect to a real B2B database API

const SAMPLE_INDUSTRIES = [
    'Computer Software', 'Information Technology & Services', 'Internet', 'SaaS',
    'Marketing & Advertising', 'Financial Services', 'Healthcare', 'E-Learning',
    'Retail', 'Telecommunications', 'Real Estate', 'Manufacturing', 'Consulting'
];

const SAMPLE_LOCATIONS = {
    'United States': ['New York', 'San Francisco', 'Los Angeles', 'Chicago', 'Boston', 'Austin', 'Seattle', 'Denver'],
    'United Kingdom': ['London', 'Manchester', 'Edinburgh', 'Birmingham'],
    'Germany': ['Berlin', 'Munich', 'Hamburg', 'Frankfurt'],
    'France': ['Paris', 'Lyon', 'Marseille'],
    'Netherlands': ['Amsterdam', 'Rotterdam', 'The Hague']
};

const SAMPLE_TITLES_BY_FUNCTION = {
    'Marketing': ['CMO', 'VP Marketing', 'Head of Marketing', 'Marketing Manager', 'Marketing Director', 'Demand Generation Manager'],
    'Sales': ['VP Sales', 'Sales Director', 'Head of Sales', 'Sales Manager', 'Business Development Manager'],
    'Engineering': ['CTO', 'VP Engineering', 'Head of Engineering', 'Engineering Manager', 'Director of Engineering'],
    'Product': ['CPO', 'VP Product', 'Head of Product', 'Product Manager', 'Director of Product'],
    'C-Level': ['CEO', 'COO', 'CFO', 'CMO', 'CTO', 'CPO'],
    'Operations': ['COO', 'VP Operations', 'Head of Operations', 'Operations Manager'],
    'HR': ['CHRO', 'VP HR', 'Head of People', 'HR Manager', 'Talent Acquisition Manager']
};

const COMPANY_SIZES = ['0-1', '2-10', '11-20', '21-50', '51-100', '101-200', '201-500', '501-1000', '1001-2000', '2001-5000', '5001-10000', '10000+'];
const FUNDING_STAGES = ['Seed', 'Angel', 'Series A', 'Series B', 'Series C', 'Series D', 'Venture'];

// Helper function to check if value matches filter
function matchesFilter(value, includeList, excludeList) {
    if (!value) return false;

    const valueLower = value.toLowerCase();

    // Check exclude list first
    if (excludeList && excludeList.length > 0) {
        const excluded = excludeList.some(exclude => {
            return valueLower.includes(exclude.toLowerCase()) || exclude.toLowerCase().includes(valueLower);
        });
        if (excluded) return false;
    }

    // If no include list, match by default (only exclusion matters)
    if (!includeList || includeList.length === 0) return true;

    // Check include list
    return includeList.some(include => {
        return valueLower.includes(include.toLowerCase()) || include.toLowerCase().includes(valueLower);
    });
}

// Helper function to parse revenue string to number
function parseRevenue(revenueStr) {
    if (!revenueStr) return null;

    const multipliers = {
        'K': 1000,
        'M': 1000000,
        'B': 1000000000
    };

    const match = revenueStr.match(/^(\d+(?:\.\d+)?)\s*([KMB])$/i);
    if (!match) return null;

    const value = parseFloat(match[1]);
    const unit = match[2].toUpperCase();

    return value * multipliers[unit];
}

// Helper function to generate a sample lead
function generateSampleLead(index, filters) {
    const industries = filters.company_industry && filters.company_industry.length > 0
        ? filters.company_industry
        : SAMPLE_INDUSTRIES;

    const industry = industries[Math.floor(Math.random() * industries.length)];

    // Select location based on filters
    let country, city;
    if (filters.contact_city && filters.contact_city.length > 0) {
        city = filters.contact_city[Math.floor(Math.random() * filters.contact_city.length)];
        country = 'United States'; // Default for simplicity
    } else if (filters.contact_location && filters.contact_location.length > 0) {
        const locations = filters.contact_location;
        const location = locations[Math.floor(Math.random() * locations.length)];

        if (SAMPLE_LOCATIONS[location]) {
            country = location;
            const cities = SAMPLE_LOCATIONS[location];
            city = cities[Math.floor(Math.random() * cities.length)];
        } else {
            country = location;
            city = location;
        }
    } else {
        const countries = Object.keys(SAMPLE_LOCATIONS);
        country = countries[Math.floor(Math.random() * countries.length)];
        const cities = SAMPLE_LOCATIONS[country];
        city = cities[Math.floor(Math.random() * cities.length)];
    }

    // Select job title based on filters
    let jobTitle, functionalArea, seniorityLevel;

    if (filters.functional_level && filters.functional_level.length > 0) {
        const funcs = filters.functional_level.filter(f => SAMPLE_TITLES_BY_FUNCTION[f]);
        const func = funcs[Math.floor(Math.random() * funcs.length)] || 'Marketing';
        functionalArea = func;
        const titles = SAMPLE_TITLES_BY_FUNCTION[func];
        jobTitle = titles[Math.floor(Math.random() * titles.length)];
    } else if (filters.contact_job_title && filters.contact_job_title.length > 0) {
        jobTitle = filters.contact_job_title[Math.floor(Math.random() * filters.contact_job_title.length)];
        functionalArea = 'Marketing'; // Default
    } else {
        const funcs = Object.keys(SAMPLE_TITLES_BY_FUNCTION);
        functionalArea = funcs[Math.floor(Math.random() * funcs.length)];
        const titles = SAMPLE_TITLES_BY_FUNCTION[functionalArea];
        jobTitle = titles[Math.floor(Math.random() * titles.length)];
    }

    // Determine seniority from title
    if (jobTitle.includes('CEO') || jobTitle.includes('COO') || jobTitle.includes('CFO') || jobTitle.includes('CTO') || jobTitle.includes('CMO') || jobTitle.includes('CPO')) {
        seniorityLevel = 'C-Level';
    } else if (jobTitle.includes('VP')) {
        seniorityLevel = 'VP';
    } else if (jobTitle.includes('Head')) {
        seniorityLevel = 'Head';
    } else if (jobTitle.includes('Director')) {
        seniorityLevel = 'Director';
    } else if (jobTitle.includes('Manager')) {
        seniorityLevel = 'Manager';
    } else {
        seniorityLevel = 'Senior';
    }

    const firstName = ['John', 'Jane', 'Michael', 'Sarah', 'David', 'Emily', 'Robert', 'Lisa', 'James', 'Maria'][index % 10];
    const lastName = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez'][index % 10];
    const fullName = `${firstName} ${lastName}`;

    const companyName = ['TechCorp', 'InnovateLabs', 'DataDrive', 'CloudFirst', 'MarketPro', 'SalesMaster', 'FinanceHub', 'HealthTech', 'EduSoft', 'RetailMax'][index % 10];
    const domain = companyName.toLowerCase().replace(/\s+/g, '') + '.com';

    // Email with validation status
    const emailStatuses = filters.email_status || ['validated'];
    const emailStatus = emailStatuses[Math.floor(Math.random() * emailStatuses.length)];
    const email = emailStatus === 'not_validated' ? null : `${firstName.toLowerCase()}.${lastName.toLowerCase()}@${domain}`;

    // Company size
    const size = filters.size && filters.size.length > 0
        ? filters.size[Math.floor(Math.random() * filters.size.length)]
        : COMPANY_SIZES[Math.floor(Math.random() * COMPANY_SIZES.length)];

    // Revenue
    const revenueValues = ['500K', '1M', '5M', '10M', '50M', '100M', '500M', '1B'];
    const revenue = revenueValues[Math.floor(Math.random() * revenueValues.length)];

    // Funding
    const funding = filters.funding && filters.funding.length > 0
        ? filters.funding[Math.floor(Math.random() * filters.funding.length)]
        : FUNDING_STAGES[Math.floor(Math.random() * FUNDING_STAGES.length)];

    const fundingValues = ['1M', '5M', '10M', '25M', '50M', '100M'];
    const totalFunding = fundingValues[Math.floor(Math.random() * fundingValues.length)];

    return {
        // Person fields
        first_name: firstName,
        last_name: lastName,
        full_name: fullName,
        job_title: jobTitle,
        headline: `${jobTitle} at ${companyName}`,
        functional_level: functionalArea,
        seniority_level: seniorityLevel,
        email: email,
        linkedin: `https://www.linkedin.com/in/${firstName.toLowerCase()}-${lastName.toLowerCase()}-${index}`,
        city: city,
        state: country === 'United States' ? ['CA', 'NY', 'TX', 'FL', 'IL'][index % 5] : '',
        country: country,

        // Company fields
        company_name: companyName,
        company_domain: domain,
        company_website: `https://${domain}`,
        company_linkedin: `https://www.linkedin.com/company/${companyName.toLowerCase().replace(/\s+/g, '-')}`,
        company_linkedin_uid: `${index}${Math.floor(Math.random() * 10000)}`,
        company_size: size,
        industry: industry,
        company_description: `${companyName} is a leading ${industry} company providing innovative solutions.`,
        company_annual_revenue: `$${revenue}`,
        company_annual_revenue_clean: parseRevenue(revenue),
        company_total_funding: `$${totalFunding}`,
        company_total_funding_clean: parseRevenue(totalFunding),
        company_founded_year: 2010 + (index % 15),
        company_phone: `+1-${Math.floor(Math.random() * 900) + 100}-${Math.floor(Math.random() * 900) + 100}-${Math.floor(Math.random() * 9000) + 1000}`,
        company_street_address: `${100 + index} Main Street`,
        company_city: city,
        company_state: country === 'United States' ? ['CA', 'NY', 'TX', 'FL', 'IL'][index % 5] : '',
        company_country: country,
        company_postal_code: `${10000 + index}`,
        company_full_address: `${100 + index} Main Street, ${city}, ${country}`,
        company_market_cap: Math.random() > 0.7 ? `$${(['100M', '500M', '1B', '5B', '10B'][index % 5])}` : null,

        // Context
        keywords: [industry, functionalArea].join(', '),
        company_technologies: ['Salesforce', 'HubSpot', 'AWS', 'Google Cloud', 'Slack'][index % 5],

        // Metadata
        email_status: emailStatus,
        funding_stage: funding,
        scraped_at: new Date().toISOString()
    };
}

// Apply all filters to a lead
function applyFilters(lead, filters) {
    // Job title filters
    if (filters.contact_job_title && filters.contact_job_title.length > 0) {
        if (!matchesFilter(lead.job_title, filters.contact_job_title, filters.contact_not_job_title)) {
            return false;
        }
    }

    if (filters.contact_not_job_title && filters.contact_not_job_title.length > 0) {
        if (matchesFilter(lead.job_title, null, filters.contact_not_job_title)) {
            return false;
        }
    }

    // Seniority level
    if (filters.seniority_level && filters.seniority_level.length > 0) {
        if (!filters.seniority_level.includes(lead.seniority_level)) {
            return false;
        }
    }

    // Functional level
    if (filters.functional_level && filters.functional_level.length > 0) {
        if (!filters.functional_level.includes(lead.functional_level)) {
            return false;
        }
    }

    // Location filters
    if (filters.contact_location && filters.contact_location.length > 0) {
        if (!matchesFilter(lead.country, filters.contact_location, filters.contact_not_location)) {
            return false;
        }
    }

    if (filters.contact_city && filters.contact_city.length > 0) {
        if (!matchesFilter(lead.city, filters.contact_city, filters.contact_not_city)) {
            return false;
        }
    }

    if (filters.contact_not_location && filters.contact_not_location.length > 0) {
        if (matchesFilter(lead.country, null, filters.contact_not_location)) {
            return false;
        }
    }

    if (filters.contact_not_city && filters.contact_not_city.length > 0) {
        if (matchesFilter(lead.city, null, filters.contact_not_city)) {
            return false;
        }
    }

    // Email status
    if (filters.email_status && filters.email_status.length > 0) {
        if (!filters.email_status.includes(lead.email_status)) {
            return false;
        }
    }

    // Company domain
    if (filters.company_domain && filters.company_domain.length > 0) {
        const domains = filters.company_domain.map(d => d.replace(/^https?:\/\//, '').toLowerCase());
        if (!domains.some(d => lead.company_domain.toLowerCase().includes(d))) {
            return false;
        }
    }

    // Company size
    if (filters.size && filters.size.length > 0) {
        if (!filters.size.includes(lead.company_size)) {
            return false;
        }
    }

    // Industry filters
    if (filters.company_industry && filters.company_industry.length > 0) {
        if (!matchesFilter(lead.industry, filters.company_industry, filters.company_not_industry)) {
            return false;
        }
    }

    if (filters.company_not_industry && filters.company_not_industry.length > 0) {
        if (matchesFilter(lead.industry, null, filters.company_not_industry)) {
            return false;
        }
    }

    // Keywords filters
    if (filters.company_keywords && filters.company_keywords.length > 0) {
        if (!matchesFilter(lead.company_description, filters.company_keywords, filters.company_not_keywords)) {
            return false;
        }
    }

    if (filters.company_not_keywords && filters.company_not_keywords.length > 0) {
        if (matchesFilter(lead.company_description, null, filters.company_not_keywords)) {
            return false;
        }
    }

    // Revenue filters
    if (filters.min_revenue) {
        const minRev = parseRevenue(filters.min_revenue);
        if (minRev && lead.company_annual_revenue_clean < minRev) {
            return false;
        }
    }

    if (filters.max_revenue) {
        const maxRev = parseRevenue(filters.max_revenue);
        if (maxRev && lead.company_annual_revenue_clean > maxRev) {
            return false;
        }
    }

    // Funding filters
    if (filters.funding && filters.funding.length > 0) {
        if (!filters.funding.includes(lead.funding_stage)) {
            return false;
        }
    }

    return true;
}

// Main actor function
Actor.main(async () => {
    console.log('✨ Starting Leads Finder Actor');

    const input = await Actor.getInput();
    if (!input) {
        throw new Error('Missing input! Please provide filter criteria.');
    }

    const {
        file_name,
        fetch_count = 50000,
        contact_job_title,
        contact_not_job_title,
        seniority_level,
        functional_level,
        contact_location,
        contact_city,
        contact_not_location,
        contact_not_city,
        email_status = ['validated'],
        company_domain,
        size,
        company_industry,
        company_not_industry,
        company_keywords,
        company_not_keywords,
        min_revenue,
        max_revenue,
        funding
    } = input;

    // Check if on free plan (this is a simulation - in production, check via Apify SDK)
    const isFreePlan = process.env.APIFY_IS_AT_HOME === 'true' && !process.env.APIFY_USER_ID;
    const maxLeads = isFreePlan ? 100 : (fetch_count || 50000);

    console.log(`📊 Configuration:`);
    console.log(`   Max leads to fetch: ${maxLeads}${isFreePlan ? ' (free plan limit)' : ''}`);
    if (file_name) console.log(`   Run label: ${file_name}`);

    console.log(`\n🔍 Active filters:`);
    if (contact_job_title) console.log(`   Job titles: ${contact_job_title.join(', ')}`);
    if (seniority_level) console.log(`   Seniority: ${seniority_level.join(', ')}`);
    if (functional_level) console.log(`   Function: ${functional_level.join(', ')}`);
    if (contact_location) console.log(`   Location: ${contact_location.join(', ')}`);
    if (contact_city) console.log(`   City: ${contact_city.join(', ')}`);
    if (company_industry) console.log(`   Industry: ${company_industry.join(', ')}`);
    if (size) console.log(`   Company size: ${size.join(', ')}`);
    if (email_status) console.log(`   Email status: ${email_status.join(', ')}`);

    const filters = {
        contact_job_title,
        contact_not_job_title,
        seniority_level,
        functional_level,
        contact_location,
        contact_city,
        contact_not_location,
        contact_not_city,
        email_status,
        company_domain,
        size,
        company_industry,
        company_not_industry,
        company_keywords,
        company_not_keywords,
        min_revenue,
        max_revenue,
        funding
    };

    console.log(`\n🚀 Generating leads...`);

    let leadsGenerated = 0;
    let leadsSaved = 0;
    const batchSize = 100;

    // In production, this would query a real B2B database API
    // For demo purposes, we generate and filter sample leads
    while (leadsSaved < maxLeads) {
        const batch = [];

        for (let i = 0; i < batchSize && leadsSaved < maxLeads; i++) {
            const lead = generateSampleLead(leadsGenerated++, filters);

            // Apply all filters
            if (applyFilters(lead, filters)) {
                batch.push(lead);
                leadsSaved++;
            }
        }

        // Save batch to dataset
        if (batch.length > 0) {
            await Actor.pushData(batch);
            console.log(`✅ Saved ${leadsSaved} leads so far...`);
        }

        // Safety check to prevent infinite loop
        if (leadsGenerated > maxLeads * 10) {
            console.log('⚠️  Reached maximum generation attempts. Your filters may be too restrictive.');
            break;
        }
    }

    console.log(`\n📊 Summary:`);
    console.log(`   Total leads generated: ${leadsGenerated}`);
    console.log(`   Leads matching filters: ${leadsSaved}`);
    console.log(`   Match rate: ${((leadsSaved / leadsGenerated) * 100).toFixed(1)}%`);

    if (isFreePlan && leadsSaved >= 100) {
        console.log(`\n💡 Note: Free plan limited to 100 leads per run. Upgrade for unlimited leads!`);
    }

    console.log('\n✅ Actor finished successfully!');
    console.log('💾 Results available in the Dataset tab.');
});
