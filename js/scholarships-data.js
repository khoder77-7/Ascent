// Mock scholarship dataset — in production this comes from the matching API.
const SCHOLARSHIPS = [
  {
    id: 'stem-futures',
    name: 'Global STEM Futures Scholarship',
    amount: 10000,
    match: 96,
    deadline: 'Oct 14',
    field: 'Computer Science',
    level: "Bachelor's",
    need: false,
    requirements: ['Transcript', 'Recommendation letter', 'Personal statement', 'CV', 'Essay'],
    why: [
      'Your 3.8 GPA clears their 3.5 minimum with room to spare',
      'CS majors headed to the US are explicitly prioritized this cycle',
      'Your robotics award directly matches their "technical impact" criterion'
    ]
  },
  {
    id: 'first-gen-eng',
    name: 'First-Gen Engineering Award',
    amount: 5000,
    match: 91,
    deadline: 'Nov 2',
    field: 'Engineering',
    level: "Bachelor's",
    need: true,
    requirements: ['Transcript', 'Personal statement', 'Financial documentation'],
    why: [
      'Designed specifically for first-generation university students',
      'Your stated financial need matches their funding priority tier',
      'No recommendation letter required — one less blocker for you'
    ]
  },
  {
    id: 'women-data',
    name: 'Women in Data Science Grant',
    amount: 2500,
    match: 87,
    deadline: 'Nov 18',
    field: 'Data Science',
    level: "Bachelor's / Master's",
    need: false,
    requirements: ['CV', 'Essay', 'Portfolio link'],
    why: [
      'Open to adjacent majors — your CS background qualifies',
      'Portfolio-based, which plays to your published research',
      'Smaller applicant pool than similarly funded awards'
    ]
  },
  {
    id: 'diaspora-merit',
    name: 'Lebanon Diaspora Merit Fund',
    amount: 3000,
    match: 82,
    deadline: 'Dec 1',
    field: 'Any field',
    level: "Bachelor's",
    need: true,
    requirements: ['Transcript', 'Essay', 'Proof of nationality'],
    why: [
      'Restricted to Lebanese nationals studying abroad — direct match',
      'Merit threshold (3.3 GPA) comfortably cleared',
      'Essay prompt overlaps closely with your leadership material'
    ]
  },
  {
    id: 'intl-excellence',
    name: 'International Excellence Award — Toronto',
    amount: 8000,
    match: 79,
    deadline: 'Dec 12',
    field: 'STEM',
    level: "Bachelor's",
    need: false,
    requirements: ['Transcript', 'Recommendation letter', 'Essay'],
    why: [
      'University of Toronto is a strong signal match for your target school',
      'STEM-wide eligibility broadens your odds vs. major-specific funds',
      'Two recommendation letters required — start requesting early'
    ]
  },
  {
    id: 'future-builders',
    name: 'Future Builders Innovation Scholarship',
    amount: 6000,
    match: 74,
    deadline: 'Jan 9',
    field: 'Computer Science',
    level: "Bachelor's / Master's",
    need: false,
    requirements: ['CV', 'Project portfolio', 'Essay'],
    why: [
      'Rewards shipped projects over GPA — favors your portfolio',
      'Slightly competitive: average winner has 1+ published project',
      'Long runway to strengthen your submission before the deadline'
    ]
  }
];
