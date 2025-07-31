import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini AI - use a fallback if env var is not available
const apiKey = (import.meta as any).env?.VITE_GEMINI_API_KEY || '';
const genAI = new GoogleGenerativeAI(apiKey);

interface ParsedLocation {
  city: string | null;
  country: string;
  isGlobal: boolean;
}

interface CountryMapping {
  [key: string]: string; // country code/variant -> normalized country name
}

interface RegionMapping {
  [key: string]: string; // country name -> region
}

// Comprehensive country mappings
const COUNTRY_MAPPINGS: CountryMapping = {
  // United States variants
  'us': 'United States',
  'usa': 'United States',
  'united states': 'United States',
  'united states of america': 'United States',
  'ca usa': 'United States',
  'pittsburgh usa': 'United States',
  'raleigh durham us': 'United States',
  
  // Philippines variants
  'ph': 'Philippines',
  'philippines': 'Philippines',
  
  // United Kingdom
  'uk': 'United Kingdom',
  'united kingdom': 'United Kingdom',
  'gb': 'United Kingdom',
  'great britain': 'United Kingdom',
  'england': 'United Kingdom',
  
  // Canada
  'ca': 'Canada',
  'canada': 'Canada',
  
  // Australia
  'au': 'Australia',
  'australia': 'Australia',
  
  // European countries
  'de': 'Germany',
  'germany': 'Germany',
  'deutschland': 'Germany',
  
  'fr': 'France',
  'france': 'France',
  
  'es': 'Spain',
  'spain': 'Spain',
  'espana': 'Spain',
  
  'it': 'Italy',
  'italy': 'Italy',
  'italia': 'Italy',
  
  'nl': 'Netherlands',
  'netherlands': 'Netherlands',
  'holland': 'Netherlands',
  
  'se': 'Sweden',
  'sweden': 'Sweden',
  
  'no': 'Norway',
  'norway': 'Norway',
  
  'dk': 'Denmark',
  'denmark': 'Denmark',
  
  'fi': 'Finland',
  'finland': 'Finland',
  
  'pl': 'Poland',
  'poland': 'Poland',
  
  'cz': 'Czech Republic',
  'czech republic': 'Czech Republic',
  'czechia': 'Czech Republic',
  
  'at': 'Austria',
  'austria': 'Austria',
  
  'ch': 'Switzerland',
  'switzerland': 'Switzerland',
  
  'be': 'Belgium',
  'belgium': 'Belgium',
  
  'pt': 'Portugal',
  'portugal': 'Portugal',
  
  'ie': 'Ireland',
  'ireland': 'Ireland',
  
  'by': 'Belarus',
  'belarus': 'Belarus',
  
  // Asian countries
  'jp': 'Japan',
  'japan': 'Japan',
  
  'kr': 'South Korea',
  'south korea': 'South Korea',
  'korea': 'South Korea',
  
  'sg': 'Singapore',
  'singapore': 'Singapore',
  
  'in': 'India',
  'india': 'India',
  
  'cn': 'China',
  'china': 'China',
  
  // Middle Eastern countries
  'sa': 'Saudi Arabia',
  'saudi arabia': 'Saudi Arabia',
  'saudi': 'Saudi Arabia',
  
  'ae': 'UAE',
  'uae': 'UAE',
  'united arab emirates': 'UAE',
  
  'qa': 'Qatar',
  'qatar': 'Qatar',
  
  'kw': 'Kuwait',
  'kuwait': 'Kuwait',
  
  'bh': 'Bahrain',
  'bahrain': 'Bahrain',
  
  'om': 'Oman',
  'oman': 'Oman',
  
  'jo': 'Jordan',
  'jordan': 'Jordan',
  
  'lb': 'Lebanon',
  'lebanon': 'Lebanon',
  
  'il': 'Israel',
  'israel': 'Israel',
  
  'tr': 'Turkey',
  'turkey': 'Turkey',
  'türkiye': 'Turkey',
  
  'ir': 'Iran',
  'iran': 'Iran',
  
  'iq': 'Iraq',
  'iraq': 'Iraq',
  
  'eg': 'Egypt',
  'egypt': 'Egypt',
  
  // Other countries (will be classified as Global)
  'br': 'Brazil',
  'brazil': 'Brazil',
  
  'mx': 'Mexico',
  'mexico': 'Mexico',
  
  'ar': 'Argentina',
  'argentina': 'Argentina',
  
  'ru': 'Russia',
  'russia': 'Russia',
  
  'nz': 'New Zealand',
  'new zealand': 'New Zealand',
  
  'global': 'Global',
  'worldwide': 'Global',
  'international': 'Global',
};

// Region mappings for filter dropdown
const REGION_MAPPINGS: RegionMapping = {
  // United States
  'United States': 'United States',
  
  // Europe
  'United Kingdom': 'Europe',
  'Germany': 'Europe',
  'France': 'Europe',
  'Spain': 'Europe',
  'Italy': 'Europe',
  'Netherlands': 'Europe',
  'Sweden': 'Europe',
  'Norway': 'Europe',
  'Denmark': 'Europe',
  'Finland': 'Europe',
  'Poland': 'Europe',
  'Czech Republic': 'Europe',
  'Austria': 'Europe',
  'Switzerland': 'Europe',
  'Belgium': 'Europe',
  'Portugal': 'Europe',
  'Ireland': 'Europe',
  'Belarus': 'Europe',
  
  // Asia
  'Japan': 'Asia',
  'South Korea': 'Asia',
  'Singapore': 'Asia',
  'India': 'Asia',
  'China': 'Asia',
  'Philippines': 'Asia',
  
  // Middle East
  'Saudi Arabia': 'Middle East',
  'UAE': 'Middle East',
  'Qatar': 'Middle East',
  'Kuwait': 'Middle East',
  'Bahrain': 'Middle East',
  'Oman': 'Middle East',
  'Jordan': 'Middle East',
  'Lebanon': 'Middle East',
  'Israel': 'Middle East',
  'Turkey': 'Middle East',
  'Iran': 'Middle East',
  'Iraq': 'Middle East',
  'Egypt': 'Middle East',
  
  // Global (everything else)
  'Global': 'Global',
  'Brazil': 'Global',
  'Mexico': 'Global',
  'Argentina': 'Global',
  'Russia': 'Global',
  'Canada': 'Global',
  'Australia': 'Global',
  'New Zealand': 'Global',
};

export async function parseLocationWithAI(rawLocation: string): Promise<ParsedLocation> {
  if (!rawLocation || rawLocation.trim() === '') {
    return { city: null, country: 'Unknown', isGlobal: false };
  }

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const prompt = `
You are a location parser that classifies locations into specific regions. You are ONLY given the location string from the database's location column. Do NOT consider any other data about the creator.

Given ONLY this location string, extract the city and country, then classify the country into one of these regions:

REGIONS:
- United States: Only locations in the United States of America
- Europe: European countries (UK, Germany, France, Spain, Italy, Netherlands, Sweden, Norway, Denmark, Finland, Poland, Czech Republic, Austria, Switzerland, Belgium, Portugal, Ireland, Belarus)
- Asia: Asian countries (Japan, South Korea, Singapore, India, China, Philippines)
- Middle East: Middle Eastern countries (Saudi Arabia, UAE, Qatar, Kuwait, Bahrain, Oman, Jordan, Lebanon, Israel, Turkey, Iran, Iraq, Egypt)
- Global: All other countries (Brazil, Mexico, Argentina, Russia, Canada, Australia, New Zealand, African countries, etc.)

IMPORTANT RULES:
1. ONLY use the provided location string - do NOT consider any other creator data
2. If the input is clearly not a location (like a paragraph or analysis), return "Global" as country
3. Extract city and country in a clean format from the location string only
4. Normalize country names to standard English names
5. If no city is found, set city to null
6. If the location is clearly global/international, set country to "Global"
7. Be very specific about region classification - only classify as Middle East if it's clearly a Middle Eastern country
8. Do NOT make assumptions based on other data - ONLY use the location string provided

Location string to analyze: "${rawLocation}"

Return ONLY a JSON object with this exact format:
{
  "city": "City Name or null",
  "country": "Country Name",
  "isGlobal": true/false
}

Examples:
- "New York, US" → {"city": "New York", "country": "United States", "isGlobal": false}
- "Manila, PH" → {"city": "Manila", "country": "Philippines", "isGlobal": false}
- "Dubai, UAE" → {"city": "Dubai", "country": "UAE", "isGlobal": false}
- "London, UK" → {"city": "London", "country": "United Kingdom", "isGlobal": false}
- "Global" → {"city": null, "country": "Global", "isGlobal": true}
- "Based on analysis..." → {"city": null, "country": "Global", "isGlobal": true}
`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Extract JSON from response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No JSON found in AI response');
    }

    const parsed = JSON.parse(jsonMatch[0]) as ParsedLocation;
    
    // Validate the response
    if (!parsed.country || typeof parsed.country !== 'string') {
      throw new Error('Invalid country in AI response');
    }

    return parsed;

  } catch (error) {
    // Removed debug logging for security
    // Fallback to manual parsing
    return parseLocationManually(rawLocation);
  }
}

export function parseLocationManually(rawLocation: string): ParsedLocation {
  const location = rawLocation.trim().toLowerCase();
  
  // Check if it's clearly not a location
  if (location.includes('based on') || location.includes('analysis') || location.length > 100) {
    return { city: null, country: 'Global', isGlobal: true };
  }

  // Check for global indicators
  if (location.includes('global') || location.includes('worldwide') || location.includes('international')) {
    return { city: null, country: 'Global', isGlobal: true };
  }

  // Try to extract city and country from the location string only
  const parts = location.split(/[,\s]+/).filter(Boolean);
  
  if (parts.length === 0) {
    return { city: null, country: 'Unknown', isGlobal: false };
  }

  // Try to find country in the parts
  let country = 'Unknown';
  let city = null;

  // First, try to match exact country codes/names from the location string
  for (let i = parts.length - 1; i >= 0; i--) {
    const part = parts[i];
    if (COUNTRY_MAPPINGS[part]) {
      country = COUNTRY_MAPPINGS[part];
      // Everything before this is the city
      if (i > 0) {
        city = parts.slice(0, i).join(' ').replace(/\b\w/g, c => c.toUpperCase());
      }
      break;
    }
  }

  // If no country found, try to match partial country names from the location string
  if (country === 'Unknown') {
    for (const [code, name] of Object.entries(COUNTRY_MAPPINGS)) {
      if (location.includes(code) || location.includes(name.toLowerCase())) {
        country = name;
        break;
      }
    }
  }

  // If still no country found, try to match common patterns from the location string only
  if (country === 'Unknown') {
    if (location.includes('us') || location.includes('usa')) {
      country = 'United States';
    } else if (location.includes('uk') || location.includes('england')) {
      country = 'United Kingdom';
    } else if (location.includes('ph') || location.includes('philippines')) {
      country = 'Philippines';
    } else if (location.includes('jp') || location.includes('japan')) {
      country = 'Japan';
    } else if (location.includes('kr') || location.includes('korea')) {
      country = 'South Korea';
    } else if (location.includes('sg') || location.includes('singapore')) {
      country = 'Singapore';
    } else if (location.includes('in') || location.includes('india')) {
      country = 'India';
    } else if (location.includes('cn') || location.includes('china')) {
      country = 'China';
    } else if (location.includes('sa') || location.includes('saudi')) {
      country = 'Saudi Arabia';
    } else if (location.includes('ae') || location.includes('uae')) {
      country = 'UAE';
    } else if (location.includes('qa') || location.includes('qatar')) {
      country = 'Qatar';
    } else if (location.includes('kw') || location.includes('kuwait')) {
      country = 'Kuwait';
    } else if (location.includes('bh') || location.includes('bahrain')) {
      country = 'Bahrain';
    } else if (location.includes('om') || location.includes('oman')) {
      country = 'Oman';
    } else if (location.includes('jo') || location.includes('jordan')) {
      country = 'Jordan';
    } else if (location.includes('lb') || location.includes('lebanon')) {
      country = 'Lebanon';
    } else if (location.includes('il') || location.includes('israel')) {
      country = 'Israel';
    } else if (location.includes('tr') || location.includes('turkey')) {
      country = 'Turkey';
    } else if (location.includes('ir') || location.includes('iran')) {
      country = 'Iran';
    } else if (location.includes('iq') || location.includes('iraq')) {
      country = 'Iraq';
    } else if (location.includes('eg') || location.includes('egypt')) {
      country = 'Egypt';
    } else {
      // Default to Global for unknown countries - do NOT make assumptions
      country = 'Global';
    }
  }

  return {
    city: city ? city.replace(/\b\w/g, c => c.toUpperCase()) : null,
    country: country === 'Unknown' ? 'Global' : country,
    isGlobal: country === 'Global'
  };
}

export function getDisplayLocation(parsedLocation: ParsedLocation): string {
  if (parsedLocation.isGlobal) {
    return 'Global';
  }
  
  if (parsedLocation.city) {
    return `${parsedLocation.city}, ${parsedLocation.country}`;
  }
  
  return parsedLocation.country;
}

export function normalizeCountry(country: string): string {
  const lower = country.toLowerCase().trim();
  return COUNTRY_MAPPINGS[lower] || country;
}

// New function to get region for filter dropdown
export function getRegionForFilter(country: string): string {
  return REGION_MAPPINGS[country] || 'Global';
}

// New function to get all available regions for filter dropdown
export function getAvailableRegions(): string[] {
  return ['United States', 'Europe', 'Asia', 'Middle East', 'Global'];
} 