export const strings = {
  // ── Loading ──────────────────────────────────────────────────────────────
  loading_mark: '?',

  // ── Error screen ─────────────────────────────────────────────────────────
  error_emoji: '😕',

  // ── Location input ───────────────────────────────────────────────────────
  location_heading:       'Where are you?',
  location_subtext:       'Enter your city or zip code',
  location_placeholder:   'City or zip code',
  location_cta:           'Get the weather',
  location_settings_link: 'Enable location in Settings',
  location_fallback_city: 'your area',

  // ── Errors ───────────────────────────────────────────────────────────────
  error_message:            'Something went wrong.',
  error_retry:              'Try again',
  error_location_not_found: "Couldn't find that location — try a city name or zip code",
  error_connection:         'Check your connection and try again',
  error_permissions:        'Could not check location permissions.',
  error_gps:                'Could not get your location.',
  error_weather_fetch:      'Could not fetch weather.',

  // ── Weather condition (line 1 under temperature) ─────────────────────────
  condition_clear:   'Clear Skies!',
  condition_night:   'Clear Night',
  condition_cloudy:  'Cloudy Today',
  condition_foggy:   'Super Foggy!',
  condition_drizzle: 'Light Drizzle',
  condition_rain:    "It's Raining!",
  condition_snow:    "It's Snowing!",
  condition_storm:   'Thunderstorm!',

  // ── Clothing advice (line 2 under temperature) ───────────────────────────
  clothing_scorching: 'Stay cool out there!',
  clothing_warm:      'No jacket needed!',
  clothing_mild:      'Grab a light jacket!',
  clothing_cool:      'Wear your jacket!',
  clothing_cold:      'Bundle up!',
  clothing_frozen:    'Full winter gear!',

  // ── Menu ─────────────────────────────────────────────────────────────────
  menu_settings:             'Settings',
  menu_acknowledgements:     'Acknowledgements',
  menu_location_permissions: 'Location Permissions',
  menu_write_review:         'Write a Review',
  menu_support:              'Support this App',

  // ── Tip jar ──────────────────────────────────────────────────────────────
  tip_subtitle:    'Supporting a dad making an app to help his kid wear a jacket when it is cold outside!',
  tip_unavailable: 'Tips are not available right now.',
  tip_thank_you:   'Thank you so much!',

  // ── Acknowledgements ─────────────────────────────────────────────────────
  ack_data_source: 'Weather data provided by Open-Meteo (open-meteo.com)',
} as const;
