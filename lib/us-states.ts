// US state and territory name → USPS 2-letter abbreviation.
// Use toUsStateAbbrev() when normalizing a US `admin1` / `region` value for
// display so manual searches (which return full state names from Open-Meteo)
// match GPS results (which return USPS abbreviations from Apple's geocoder).

const NAME_TO_ABBREV: Record<string, string> = {
  Alabama:        'AL',
  Alaska:         'AK',
  Arizona:        'AZ',
  Arkansas:       'AR',
  California:     'CA',
  Colorado:       'CO',
  Connecticut:    'CT',
  Delaware:       'DE',
  Florida:        'FL',
  Georgia:        'GA',
  Hawaii:         'HI',
  Idaho:          'ID',
  Illinois:       'IL',
  Indiana:        'IN',
  Iowa:           'IA',
  Kansas:         'KS',
  Kentucky:       'KY',
  Louisiana:      'LA',
  Maine:          'ME',
  Maryland:       'MD',
  Massachusetts:  'MA',
  Michigan:       'MI',
  Minnesota:      'MN',
  Mississippi:    'MS',
  Missouri:       'MO',
  Montana:        'MT',
  Nebraska:       'NE',
  Nevada:         'NV',
  'New Hampshire':  'NH',
  'New Jersey':     'NJ',
  'New Mexico':     'NM',
  'New York':       'NY',
  'North Carolina': 'NC',
  'North Dakota':   'ND',
  Ohio:           'OH',
  Oklahoma:       'OK',
  Oregon:         'OR',
  Pennsylvania:   'PA',
  'Rhode Island': 'RI',
  'South Carolina': 'SC',
  'South Dakota':   'SD',
  Tennessee:      'TN',
  Texas:          'TX',
  Utah:           'UT',
  Vermont:        'VT',
  Virginia:       'VA',
  Washington:     'WA',
  'West Virginia':'WV',
  Wisconsin:      'WI',
  Wyoming:        'WY',

  // Federal district + commonly-returned territories
  'District of Columbia':            'DC',
  'American Samoa':                  'AS',
  Guam:                              'GU',
  'Northern Mariana Islands':        'MP',
  'Puerto Rico':                     'PR',
  'United States Virgin Islands':    'VI',
  'U.S. Virgin Islands':             'VI',
};

export function toUsStateAbbrev(name: string | undefined | null): string | undefined {
  if (!name) return name ?? undefined;
  return NAME_TO_ABBREV[name] ?? name;
}
