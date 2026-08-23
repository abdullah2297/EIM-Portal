/**
 * Application-wide constants. Nothing in the UI should hardcode a route,
 * a label, a page size or a status string -- it all lives here.
 */

export const SITE = {
  name: 'EIM Portal',
  shortName: 'EIM',
  tagline: 'Enterprise Information Management',
  description:
    'The digital hub of the Enterprise Information Management Department to explore our people, teams, initiatives, achievements and community.',
};

/** Canonical route table. Used by navigation, breadcrumbs and search results. */
export const ROUTES = {
  home: '/',
  department: '/department',
  ourSquads: '/our-squads',
  teams: '/teams',
  team: (id) => `/teams/${id}`,
  subTeams: '/sub-teams',
  subTeam: (id) => `/sub-teams/${id}`,
  employees: '/employees',
  employee: (id) => `/employees/${id}`,
  initiatives: '/initiatives',
  achievements: '/achievements',
  announcements: '/announcements',
  successStories: '/success-stories',
  competitions: '/competitions',
  competition: (id) => `/competitions/${id}`,
  gallery: '/gallery',
  recognition: '/recognition',
  search: '/search',
  contact: '/contact',
  admin: '/admin',
  adminLogin: '/admin/login',
  adminResource: (resource) => `/admin/${resource}`,
  adminResourceNew: (resource) => `/admin/${resource}/new`,
  adminResourceEdit: (resource, id) => `/admin/${resource}/${id}`,
};

/**
 * Primary navigation shown in the desktop header.
 * An entry is either a direct link (`href`) or a dropdown group (`children`,
 * itself a list of direct links) - see `flattenNav` for consumers (footer,
 * mobile drawer, 404 page) that only want the flat list of actual pages.
 */
export const PRIMARY_NAV = [
  { label: 'Home', href: ROUTES.home, icon: 'Home' },
  { label: 'Department', href: ROUTES.department, icon: 'AccountBalance' },
  {
    label: 'Our Squads',
    icon: 'Groups',
    children: [
      { label: 'Overview', href: ROUTES.ourSquads, icon: 'Insights' },
      { label: 'Teams', href: ROUTES.teams, icon: 'AccountTree' },
      { label: 'Sub-Teams', href: ROUTES.subTeams, icon: 'Hub' },
      { label: 'Champions', href: ROUTES.employees, icon: 'Badge' },
    ],
  },
  { label: 'Initiatives', href: ROUTES.initiatives, icon: 'Lightbulb' },
  {
    label: 'Achievements',
    icon: 'EmojiEvents',
    children: [
      { label: 'Achievements', href: ROUTES.achievements, icon: 'EmojiEvents' },
      { label: 'Success Stories', href: ROUTES.successStories, icon: 'AutoStories' },
    ],
  },
  { label: 'Announcements', href: ROUTES.announcements, icon: 'Campaign' },
  { label: 'Competitions', href: ROUTES.competitions, icon: 'SportsEsports' },
];

/** Secondary navigation shown under the "More" dropdown / drawer group. */
export const SECONDARY_NAV = [
  { label: 'Gallery', href: ROUTES.gallery, icon: 'PhotoLibrary' },
  { label: 'Recognition Wall', href: ROUTES.recognition, icon: 'Celebration' },
  { label: 'Contact / Get Involved', href: ROUTES.contact, icon: 'ContactSupport' },
];

/** Expands any dropdown groups in a nav list into their flat list of links. */
export function flattenNav(items) {
  return items.flatMap((item) => (item.children ? item.children : [item]));
}

/** Every collection exposed through the generic REST layer and admin panel. */
export const RESOURCES = {
  teams: 'teams',
  subTeams: 'sub-teams',
  employees: 'employees',
  initiatives: 'initiatives',
  achievements: 'achievements',
  announcements: 'announcements',
  successStories: 'success-stories',
  competitions: 'competitions',
  gallery: 'gallery',
  recognition: 'recognition',
  submissions: 'submissions',
  department: 'department',
};

export const RESOURCE_LIST = Object.values(RESOURCES);

/** Status vocabularies -- shared by data, filters, badges and admin forms. */
export const INITIATIVE_STATUS = {
  planned: 'Planned',
  inProgress: 'In Progress',
  completed: 'Completed',
  onHold: 'On Hold',
};

export const COMPETITION_STATUS = {
  upcoming: 'Upcoming',
  active: 'Active',
  completed: 'Completed',
};

export const ACHIEVEMENT_CATEGORIES = [
  'Award',
  'Certification',
  'Milestone',
  'Team Achievement',
  'Employee Recognition',
];

/** Which section of the Achievements page a record belongs to. */
export const ACHIEVEMENT_SCOPES = ['Department', 'Team', 'Sub-Team', 'Employee'];

export const ANNOUNCEMENT_CATEGORIES = [
  'Update',
  'Event',
  'Release',
  'Policy',
  'Celebration',
  'Training',
];

export const INITIATIVE_CATEGORIES = [
  'Automation',
  'Data Quality',
  'Performance',
  'Governance',
  'Analytics',
  'Culture',
];

export const STORY_TYPES = ['Project', 'Team', 'Employee'];

/** Seniority bands used by the employee role filter and the admin form. */
export const ROLE_BANDS = [
  'Director',
  'Head Manager',
  'Engineering Manager',
  'Principal Engineer',
  'Senior Engineer',
  'Engineer',
];

export const GALLERY_CATEGORIES = [
  'Events',
  'Team Activities',
  'Celebrations',
  'Awards',
  'Competitions',
];

export const RECOGNITION_TYPES = [
  'Employee of the Quarter',
  'Team of the Quarter',
  'Appreciation',
  'Award',
];

export const SUBMISSION_TYPES = [
  'Idea',
  'Success Story',
  'Initiative',
  'General Enquiry',
  'Competition Entry',
];

export const SUBMISSION_STATUS = ['New', 'In Review', 'Actioned', 'Archived'];

/** Search result grouping order used on /search. */
export const SEARCH_GROUPS = [
  { key: 'employees', label: 'Employees', icon: 'Badge' },
  { key: 'teams', label: 'Teams', icon: 'Groups' },
  { key: 'subTeams', label: 'Sub-Teams', icon: 'AccountTree' },
  { key: 'initiatives', label: 'Initiatives', icon: 'Lightbulb' },
  { key: 'achievements', label: 'Achievements', icon: 'EmojiEvents' },
  { key: 'announcements', label: 'Announcements', icon: 'Campaign' },
  { key: 'successStories', label: 'Success Stories', icon: 'AutoStories' },
  { key: 'competitions', label: 'Competitions', icon: 'SportsEsports' },
];

export const PAGE_SIZE = {
  employees: 12,
  cards: 9,
  list: 8,
  gallery: 16,
  admin: 10,
};

export const STORAGE_KEYS = {
  theme: 'eim-portal-theme',
};

export const DATE_FORMAT = {
  long: { day: 'numeric', month: 'long', year: 'numeric' },
  short: { day: '2-digit', month: 'short', year: 'numeric' },
  monthYear: { month: 'short', year: 'numeric' },
};

/** Placeholder marker used anywhere real business content is still missing. */
export const PLACEHOLDER = {
  text: 'PLACEHOLDER - content to be provided by the department.',
  image: 'PLACEHOLDER IMAGE',
  contactEmail: 'placeholder.dwh@example.com',
  phone: '+00 000 000 0000',
  location: 'PLACEHOLDER - office location',
};
