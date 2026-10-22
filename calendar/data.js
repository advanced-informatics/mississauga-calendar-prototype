// Fake addresses and collection rules. No WIS data.
// Each address has a weekday (0 = Sunday) and which week of the two-week cycle recycling falls on.
// Garbage and recycling alternate weekly; organics are collected every week. One address has no service.
// Descriptions and links are placeholders, not City content.
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
  monthsAhead: 2,
  addresses: [
    { id: 'a1', label: '120 Sample Street, Mississauga',   weekday: 5, recyclingWeek: 0 },
    { id: 'a2', label: '50 Harbour Road, Mississauga',     weekday: 3, recyclingWeek: 1 },
    { id: 'a3', label: '60 Harbour Road, Mississauga',     weekday: 3, recyclingWeek: 1 },
    { id: 'a4', label: '7 Lakeview Crescent, Mississauga', weekday: 1, recyclingWeek: 0 },
    { id: 'a5', label: '1 Test Industrial Way, Mississauga', weekday: null, recyclingWeek: 0 }
  ]
};
