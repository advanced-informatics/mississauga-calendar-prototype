// Test addresses: real Mississauga street names with made-up house numbers. Shown as "<street>, Mississauga",
// with no postal code (Carol and Katie, 29 Oct). Collection rules are invented. No WIS or City data.
// Each address has a weekday (0 = Sunday) and which week of the two-week cycle recycling falls on.
// Garbage and recycling alternate weekly; organics are collected every week.
// Addresses with no City collection still appear in the search, with a reason (noService) that picks the message.
// Descriptions, reason wording and links are placeholders, not City content.
window.CALENDAR_DATA = {
  wasteTypes: {
    garbage: {
      label: 'General waste', colour: '#8a6d3b',
      description: 'Place bags or a garbage cart at the curb by 7 a.m. on collection day. Bags must not weigh more than 23 kg.',
      link: '#garbage'
    },
    recycling: {
      label: 'Recycling', colour: '#1f6fb2',
      description: 'Rinse containers and put them loose in the blue cart. No plastic bags or soft plastics.',
      link: '#recycling'
    },
    organics: {
      label: 'Organics', colour: '#2e8540',
      description: 'Food scraps and soiled paper go in the green bin. Use certified compostable bags or paper bags.',
      link: '#organics'
    }
  },
  // Why an address has no City collection (Figma 154:53, frame 208:3129). Placeholder wording until the City supplies its own.
  noServiceReasons: {
    business: {
      text: 'This is a business address. Businesses arrange their own waste collection with a private contractor.',
      link: '#business-waste'
    },
    condo: {
      text: 'This building is collected by a private contractor arranged by the building management, not by the City.',
      link: '#multi-residential'
    },
    development: {
      text: 'This is a new development that the City does not collect from yet.',
      link: '#new-developments'
    }
  },
  monthsAhead: 12,
  addresses: [
    { id: 'a0', label: '300 City Centre Drive, Mississauga', weekday: 5, recyclingWeek: 1 },
    { id: 'a1', label: '245 Queen Street South, Mississauga', weekday: 5, recyclingWeek: 0 },
    { id: 'a2', label: '85 Lakeshore Road East, Mississauga', weekday: 3, recyclingWeek: 1 },
    { id: 'a3', label: '95 Lakeshore Road East, Mississauga', weekday: 3, recyclingWeek: 1 },
    { id: 'a4', label: '3420 Mississauga Road, Mississauga', weekday: 1, recyclingWeek: 0 },
    { id: 'a5', label: '6900 Airport Road, Mississauga', weekday: null, recyclingWeek: 0, noService: 'development' },
    { id: 'a6', label: '3115 Argentia Road, Mississauga', weekday: null, recyclingWeek: 0, noService: 'business' },
    { id: 'a7', label: '4090 Confederation Parkway, Mississauga', weekday: null, recyclingWeek: 0, noService: 'condo' }
  ]
};
