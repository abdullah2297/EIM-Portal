import { RESOURCES } from './constants';

/**
 * Server-side description of every collection exposed by the REST layer.
 *
 * `searchable`  fields scanned by the `q` query parameter and global search
 * `filterable`  query params accepted as equality / array-contains filters
 * `sort`        default sort applied when the request does not specify one
 * `label`       singular / plural labels reused by the admin panel
 * `idPrefix`    prefix for generated ids
 * `titleField`  field used as the display title in search results and tables
 */
export const RESOURCE_CONFIG = {
  [RESOURCES.teams]: {
    label: 'Team',
    labelPlural: 'Teams',
    idPrefix: 'team',
    titleField: 'name',
    searchable: ['name', 'shortName', 'description', 'mission', 'portfolios', 'responsibilities'],
    filterable: ['id', 'featured'],
    sort: { field: 'order', order: 'asc' },
    icon: 'Groups',
  },
  [RESOURCES.subTeams]: {
    label: 'Sub-Team',
    labelPlural: 'Sub-Teams',
    idPrefix: 'sub',
    titleField: 'name',
    searchable: ['name', 'description', 'focusAreas', 'portfolios', 'responsibilities'],
    filterable: ['teamId', 'leadId', 'featured'],
    sort: { field: 'name', order: 'asc' },
    icon: 'AccountTree',
  },
  [RESOURCES.employees]: {
    label: 'Employee',
    labelPlural: 'Employees',
    idPrefix: 'emp',
    titleField: 'fullName',
    searchable: [
      'fullName', 'jobTitle', 'bio', 'expertise', 'hobbies', 'interests', 'email', 'role',
    ],
    filterable: ['teamId', 'subTeamId', 'role', 'featured'],
    sort: { field: 'fullName', order: 'asc' },
    icon: 'Badge',
  },
  [RESOURCES.initiatives]: {
    label: 'Initiative',
    labelPlural: 'Initiatives',
    idPrefix: 'ini',
    titleField: 'title',
    searchable: ['title', 'summary', 'description', 'objective', 'category', 'tags'],
    filterable: ['teamIds', 'subTeamIds', 'category', 'status', 'featured'],
    sort: { field: 'startDate', order: 'desc' },
    icon: 'Lightbulb',
  },
  [RESOURCES.achievements]: {
    label: 'Achievement',
    labelPlural: 'Achievements',
    idPrefix: 'ach',
    titleField: 'title',
    searchable: ['title', 'description', 'category', 'issuer', 'level'],
    filterable: ['scope', 'teamIds', 'subTeamIds', 'category', 'level', 'featured'],
    sort: { field: 'date', order: 'desc' },
    icon: 'EmojiEvents',
  },
  [RESOURCES.announcements]: {
    label: 'Announcement',
    labelPlural: 'Announcements',
    idPrefix: 'ann',
    titleField: 'title',
    searchable: ['title', 'summary', 'content', 'category'],
    filterable: ['teamId', 'category', 'featured', 'pinned'],
    sort: { field: 'date', order: 'desc' },
    icon: 'Campaign',
  },
  [RESOURCES.successStories]: {
    label: 'Success Story',
    labelPlural: 'Success Stories',
    idPrefix: 'sto',
    titleField: 'title',
    searchable: ['title', 'summary', 'challenge', 'solution', 'result', 'keyAchievements'],
    filterable: ['teamId', 'type', 'featured'],
    sort: { field: 'date', order: 'desc' },
    icon: 'AutoStories',
  },
  [RESOURCES.competitions]: {
    label: 'Competition',
    labelPlural: 'Competitions',
    idPrefix: 'cmp',
    titleField: 'name',
    searchable: ['name', 'summary', 'description', 'category', 'eligibility'],
    filterable: ['status', 'category', 'featured'],
    sort: { field: 'startDate', order: 'desc' },
    icon: 'SportsEsports',
  },
  [RESOURCES.gallery]: {
    label: 'Gallery Item',
    labelPlural: 'Gallery',
    idPrefix: 'gal',
    titleField: 'title',
    searchable: ['title', 'caption', 'event', 'category'],
    filterable: ['category', 'event', 'teamId'],
    sort: { field: 'date', order: 'desc' },
    icon: 'PhotoLibrary',
  },
  [RESOURCES.recognition]: {
    label: 'Recognition',
    labelPlural: 'Recognition',
    idPrefix: 'rec',
    titleField: 'title',
    searchable: ['title', 'message', 'type', 'quarter'],
    filterable: ['type', 'quarter', 'toTeamId', 'toEmployeeId', 'featured'],
    sort: { field: 'date', order: 'desc' },
    icon: 'Celebration',
  },
  [RESOURCES.submissions]: {
    label: 'Submission',
    labelPlural: 'Submissions',
    idPrefix: 'sub',
    titleField: 'subject',
    searchable: ['name', 'email', 'subject', 'message', 'type'],
    filterable: ['type', 'status', 'competitionId', 'employeeId'],
    sort: { field: 'createdAt', order: 'desc' },
    icon: 'Inbox',
    /** Submissions are created by the public contact form, not by admins. */
    publicCreate: true,
  },
  [RESOURCES.department]: {
    label: 'Department',
    labelPlural: 'Department',
    idPrefix: 'dept',
    titleField: 'name',
    searchable: ['name', 'overview', 'mission', 'vision'],
    filterable: [],
    sort: null,
    icon: 'AccountBalance',
    singleton: true,
  },
};

/** @param {string} resource */
export function getResourceConfig(resource) {
  return RESOURCE_CONFIG[resource] ?? null;
}
