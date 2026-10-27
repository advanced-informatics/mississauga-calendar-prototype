// Fake addresses and collection rules. No WIS data. Postal codes are made up, except City Hall's.
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
  monthsAhead: 12,
  addresses: [
    { id: 'a0', label: '300 City Centre Drive, Mississauga', weekday: 5, recyclingWeek: 1, postal: 'L5B 3C9' },
    { id: 'a1', label: '120 Sample Street, Mississauga',   weekday: 5, recyclingWeek: 0, postal: 'L5A 0A1' },
    { id: 'a2', label: '50 Harbour Road, Mississauga',     weekday: 3, recyclingWeek: 1, postal: 'L5H 0A2' },
    { id: 'a3', label: '60 Harbour Road, Mississauga',     weekday: 3, recyclingWeek: 1, postal: 'L5H 0A3' },
    { id: 'a4', label: '7 Lakeview Crescent, Mississauga', weekday: 1, recyclingWeek: 0, postal: 'L5E 0A4' },
    { id: 'a5', label: '1 Test Industrial Way, Mississauga', weekday: null, recyclingWeek: 0, postal: 'L4W 0A5' }
  ]
};
