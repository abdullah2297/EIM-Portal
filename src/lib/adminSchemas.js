import {
  ACHIEVEMENT_CATEGORIES,
  ACHIEVEMENT_SCOPES,
  ANNOUNCEMENT_CATEGORIES,
  COMPETITION_STATUS,
  GALLERY_CATEGORIES,
  INITIATIVE_CATEGORIES,
  INITIATIVE_STATUS,
  RECOGNITION_TYPES,
  RESOURCES,
  ROLE_BANDS,
  STORY_TYPES,
  SUBMISSION_STATUS,
  SUBMISSION_TYPES,
} from './constants';
import { ICON_NAMES } from '@/components/ui/Icon';

/**
 * Field definitions that drive the whole admin panel.
 *
 * Adding a field to a content type means adding one entry here: the table
 * columns, the create/edit form, the validation and the payload shape all read
 * from this file. There is no per-resource form component to maintain.
 *
 * Supported field types:
 *   text | textarea | number | date | select | tags | checkbox
 *   relation  (single id from another collection)
 *   relations (many ids from another collection)
 *   repeater  (list of objects, described by `fields`)
 *   file      (single uploaded attachment, stored as { name, url, size })
 *   image     (URL string - paste a link or upload a file)
 *   images    (up to 3 URL strings - paste links or upload files)
 */

const asOptions = (values) => values.map((value) => ({ value, label: value }));

/** @type {Record<string, { label: string, labelPlural: string, icon: string, columns: any[], fields: any[], group?: string }>} */
export const ADMIN_SCHEMAS = {
  [RESOURCES.teams]: {
    label: 'Team',
    labelPlural: 'Teams',
    icon: 'Groups',
    group: 'Organisation',
    columns: [
      { key: 'name', label: 'Team', primary: true },
      { key: 'shortName', label: 'Short name' },
      { key: 'order', label: 'Order' },
    ],
    fields: [
      { name: 'name', label: 'Team name', type: 'text', required: true, section: 'Basics' },
      { name: 'shortName', label: 'Short name', type: 'text', required: true, section: 'Basics' },
      { name: 'icon', label: 'Icon', type: 'select', options: asOptions(ICON_NAMES), section: 'Basics' },
      { name: 'order', label: 'Display order', type: 'number', section: 'Basics' },
      { name: 'description', label: 'Description', type: 'textarea', required: true, full: true, section: 'Content' },
      { name: 'mission', label: 'Mission', type: 'textarea', full: true, section: 'Content' },
      { name: 'responsibilities', label: 'Responsibilities', type: 'tags', full: true, section: 'Content' },
      { name: 'portfolios', label: 'Supported portfolios', type: 'tags', full: true, section: 'Content' },
      { name: 'leadId', label: 'Team manager', type: 'relation', resource: RESOURCES.employees, labelField: 'fullName', section: 'People' },
    ],
  },

  [RESOURCES.subTeams]: {
    label: 'Sub-Team',
    labelPlural: 'Sub-Teams',
    icon: 'AccountTree',
    group: 'Organisation',
    columns: [
      { key: 'name', label: 'Sub-team', primary: true },
      { key: 'teamId', label: 'Team', relation: RESOURCES.teams, labelField: 'shortName' },
    ],
    fields: [
      { name: 'name', label: 'Sub-team name', type: 'text', required: true, section: 'Basics' },
      { name: 'teamId', label: 'Parent team', type: 'relation', resource: RESOURCES.teams, labelField: 'name', required: true, section: 'Basics' },
      { name: 'description', label: 'Description', type: 'textarea', required: true, full: true, section: 'Content' },
      { name: 'focusAreas', label: 'Focus areas', type: 'tags', full: true, section: 'Content' },
      { name: 'responsibilities', label: 'Responsibilities', type: 'tags', full: true, section: 'Content' },
      { name: 'portfolios', label: 'Supported portfolios', type: 'tags', full: true, section: 'Content' },
      { name: 'leadId', label: 'Sub-team lead', type: 'relation', resource: RESOURCES.employees, labelField: 'fullName', section: 'People' },
    ],
  },

  [RESOURCES.employees]: {
    label: 'Employee',
    labelPlural: 'Employees',
    icon: 'Badge',
    group: 'People',
    columns: [
      { key: 'fullName', label: 'Name', primary: true, avatar: true },
      { key: 'jobTitle', label: 'Job title' },
      { key: 'teamId', label: 'Team', relation: RESOURCES.teams, labelField: 'shortName' },
      { key: 'role', label: 'Role' },
      { key: 'featured', label: 'Featured', boolean: true },
    ],
    fields: [
      { name: 'fullName', label: 'Full name', type: 'text', required: true, section: 'Basics' },
      { name: 'jobTitle', label: 'Job title', type: 'text', required: true, section: 'Basics' },
      { name: 'role', label: 'Seniority band', type: 'select', options: asOptions(ROLE_BANDS), required: true, section: 'Basics' },
      { name: 'teamId', label: 'Team', type: 'relation', resource: RESOURCES.teams, labelField: 'name', required: true, section: 'Basics' },
      { name: 'subTeamId', label: 'Sub-team', type: 'relation', resource: RESOURCES.subTeams, labelField: 'name', section: 'Basics' },
      { name: 'email', label: 'Email', type: 'text', inputType: 'email', section: 'Contact' },
      { name: 'extension', label: 'Extension', type: 'text', section: 'Contact' },
      { name: 'location', label: 'Location', type: 'text', section: 'Contact' },
      { name: 'joinedDate', label: 'Joined date', type: 'date', section: 'Contact' },
      { name: 'photo', label: 'Photo URL', type: 'text', hint: 'Leave empty to show the initials avatar placeholder.', section: 'Contact' },
      { name: 'bio', label: 'Short introduction', type: 'textarea', full: true, required: true, section: 'Profile' },
      { name: 'quote', label: 'Personal quote', type: 'text', full: true, section: 'Profile' },
      { name: 'responsibilities', label: 'Responsibilities', type: 'tags', full: true, section: 'Profile' },
      { name: 'expertise', label: 'Areas of expertise', type: 'tags', full: true, section: 'Profile' },
      {
        name: 'skills',
        label: 'Skills',
        type: 'repeater',
        full: true,
        section: 'Profile',
        fields: [
          { name: 'name', label: 'Skill', type: 'text' },
          { name: 'level', label: 'Level (0-100)', type: 'number' },
        ],
      },
      { name: 'hobbies', label: 'Hobbies', type: 'tags', full: true, section: 'Personal' },
      { name: 'interests', label: 'Interests', type: 'tags', full: true, section: 'Personal' },
      { name: 'languages', label: 'Languages', type: 'tags', full: true, section: 'Personal' },
      { name: 'funFacts', label: 'Fun facts', type: 'tags', full: true, section: 'Personal' },
      { name: 'achievements', label: 'Achievements', type: 'tags', full: true, section: 'Recognition' },
      {
        name: 'awards',
        label: 'Awards & prizes',
        type: 'repeater',
        full: true,
        section: 'Recognition',
        fields: [
          { name: 'title', label: 'Award', type: 'text' },
          { name: 'issuer', label: 'Issuer', type: 'text' },
          { name: 'year', label: 'Year', type: 'text' },
        ],
      },
      { name: 'featured', label: 'Feature on the home page', type: 'checkbox', section: 'Recognition' },
    ],
  },

  [RESOURCES.initiatives]: {
    label: 'Initiative',
    labelPlural: 'Initiatives',
    icon: 'Lightbulb',
    group: 'Content',
    columns: [
      { key: 'title', label: 'Initiative', primary: true },
      { key: 'category', label: 'Category' },
      { key: 'status', label: 'Status', badge: true },
      { key: 'teamIds', label: 'Teams', relations: RESOURCES.teams, labelField: 'shortName' },
    ],
    fields: [
      { name: 'title', label: 'Title', type: 'text', required: true, section: 'Basics' },
      { name: 'category', label: 'Category', type: 'select', options: asOptions(INITIATIVE_CATEGORIES), required: true, section: 'Basics' },
      { name: 'status', label: 'Status', type: 'select', options: asOptions(Object.values(INITIATIVE_STATUS)), required: true, section: 'Basics' },
      { name: 'startDate', label: 'Start date', type: 'date', section: 'Basics' },
      { name: 'endDate', label: 'End date', type: 'date', section: 'Basics' },
      { name: 'summary', label: 'Summary', type: 'textarea', full: true, required: true, section: 'Content' },
      { name: 'description', label: 'Full description', type: 'textarea', full: true, rows: 8, section: 'Content' },
      { name: 'objective', label: 'Objective', type: 'textarea', full: true, section: 'Content' },
      { name: 'image', label: 'Image', type: 'image', full: true, section: 'Content' },
      { name: 'tags', label: 'Tags', type: 'tags', full: true, section: 'Content' },
      {
        name: 'attachment',
        label: 'Detailed brief (zip)',
        type: 'file',
        accept: '.zip',
        full: true,
        hint: 'Optional. Upload a zip file with the full write-up, diagrams or supporting documents.',
        section: 'Content',
      },
      {
        name: 'impact',
        label: 'Impact metrics',
        type: 'repeater',
        full: true,
        section: 'Results',
        fields: [
          { name: 'label', label: 'Metric', type: 'text' },
          { name: 'value', label: 'Value', type: 'text' },
        ],
      },
      { name: 'teamIds', label: 'Teams', type: 'relations', resource: RESOURCES.teams, labelField: 'name', required: true, full: true, section: 'People' },
      { name: 'subTeamIds', label: 'Sub-teams', type: 'relations', resource: RESOURCES.subTeams, labelField: 'name', full: true, section: 'People' },
      { name: 'contributorIds', label: 'Employees who worked on this', type: 'relations', resource: RESOURCES.employees, labelField: 'fullName', full: true, section: 'People' },
      { name: 'relatedAchievementIds', label: 'Related achievements', type: 'relations', resource: RESOURCES.achievements, labelField: 'title', full: true, section: 'Results' },
      { name: 'featured', label: 'Feature this initiative', type: 'checkbox', section: 'Results' },
    ],
  },

  [RESOURCES.achievements]: {
    label: 'Achievement',
    labelPlural: 'Achievements',
    icon: 'EmojiEvents',
    group: 'Content',
    columns: [
      { key: 'title', label: 'Achievement', primary: true },
      { key: 'scope', label: 'Scope' },
      { key: 'category', label: 'Category' },
      { key: 'date', label: 'Date', date: true },
      { key: 'featured', label: 'Featured', boolean: true },
    ],
    fields: [
      { name: 'title', label: 'Title', type: 'text', required: true, section: 'Basics' },
      {
        name: 'scope',
        label: 'Scope',
        type: 'select',
        options: asOptions(ACHIEVEMENT_SCOPES),
        required: true,
        hint: 'Which section of the Achievements page this belongs to.',
        section: 'Basics',
      },
      { name: 'category', label: 'Category', type: 'select', options: asOptions(ACHIEVEMENT_CATEGORIES), required: true, section: 'Basics' },
      { name: 'date', label: 'Date', type: 'date', required: true, section: 'Basics' },
      { name: 'level', label: 'Level', type: 'select', options: asOptions(['Department', 'Group', 'External']), section: 'Basics' },
      { name: 'icon', label: 'Badge icon', type: 'select', options: asOptions(ICON_NAMES), section: 'Basics' },
      { name: 'issuer', label: 'Issued by', type: 'text', section: 'Basics' },
      { name: 'description', label: 'Description', type: 'textarea', full: true, required: true, section: 'Content' },
      { name: 'images', label: 'Images', type: 'images', full: true, section: 'Content' },
      { name: 'teamIds', label: 'Teams', type: 'relations', resource: RESOURCES.teams, labelField: 'name', full: true, section: 'People' },
      { name: 'subTeamIds', label: 'Sub-teams', type: 'relations', resource: RESOURCES.subTeams, labelField: 'name', full: true, section: 'People' },
      { name: 'employeeIds', label: 'Employees recognised', type: 'relations', resource: RESOURCES.employees, labelField: 'fullName', full: true, section: 'People' },
      { name: 'featured', label: 'Feature this achievement', type: 'checkbox', section: 'Content' },
    ],
  },

  [RESOURCES.announcements]: {
    label: 'Announcement',
    labelPlural: 'Announcements',
    icon: 'Campaign',
    group: 'Content',
    columns: [
      { key: 'title', label: 'Announcement', primary: true },
      { key: 'category', label: 'Category' },
      { key: 'date', label: 'Date', date: true },
      { key: 'pinned', label: 'Pinned', boolean: true },
    ],
    fields: [
      { name: 'title', label: 'Title', type: 'text', required: true, section: 'Basics' },
      { name: 'category', label: 'Category', type: 'select', options: asOptions(ANNOUNCEMENT_CATEGORIES), required: true, section: 'Basics' },
      { name: 'date', label: 'Publish date', type: 'date', required: true, section: 'Basics' },
      { name: 'authorId', label: 'Author', type: 'relation', resource: RESOURCES.employees, labelField: 'fullName', section: 'Basics' },
      { name: 'teamId', label: 'Related team', type: 'relation', resource: RESOURCES.teams, labelField: 'name', section: 'Basics' },
      { name: 'summary', label: 'Summary', type: 'textarea', full: true, required: true, section: 'Content' },
      { name: 'content', label: 'Full content', type: 'textarea', full: true, rows: 8, section: 'Content' },
      { name: 'image', label: 'Image URL', type: 'text', full: true, section: 'Content' },
      { name: 'eventDate', label: 'Event date', type: 'date', hint: 'Only for events and training.', section: 'Event' },
      { name: 'eventLocation', label: 'Event location', type: 'text', section: 'Event' },
      {
        name: 'attachments',
        label: 'Attachments',
        type: 'repeater',
        full: true,
        section: 'Event',
        fields: [
          { name: 'name', label: 'File name', type: 'text' },
          { name: 'url', label: 'URL', type: 'text' },
          { name: 'size', label: 'Size', type: 'text' },
        ],
      },
      { name: 'pinned', label: 'Pin to the top', type: 'checkbox', section: 'Content' },
      { name: 'featured', label: 'Feature on the news page', type: 'checkbox', section: 'Content' },
    ],
  },

  [RESOURCES.successStories]: {
    label: 'Success Story',
    labelPlural: 'Success Stories',
    icon: 'AutoStories',
    group: 'Content',
    columns: [
      { key: 'title', label: 'Story', primary: true },
      { key: 'type', label: 'Type' },
      { key: 'teamId', label: 'Team', relation: RESOURCES.teams, labelField: 'shortName' },
      { key: 'date', label: 'Date', date: true },
    ],
    fields: [
      { name: 'title', label: 'Title', type: 'text', required: true, section: 'Basics' },
      { name: 'type', label: 'Story type', type: 'select', options: asOptions(STORY_TYPES), required: true, section: 'Basics' },
      { name: 'teamId', label: 'Team', type: 'relation', resource: RESOURCES.teams, labelField: 'name', required: true, section: 'Basics' },
      { name: 'date', label: 'Date', type: 'date', section: 'Basics' },
      { name: 'coverImage', label: 'Cover image URL', type: 'text', section: 'Basics' },
      { name: 'summary', label: 'Summary', type: 'textarea', full: true, required: true, section: 'Story' },
      { name: 'challenge', label: 'The challenge', type: 'textarea', full: true, section: 'Story' },
      { name: 'solution', label: 'The solution', type: 'textarea', full: true, section: 'Story' },
      { name: 'result', label: 'The result', type: 'textarea', full: true, section: 'Story' },
      { name: 'keyAchievements', label: 'Key achievements', type: 'tags', full: true, section: 'Results' },
      {
        name: 'impact',
        label: 'Impact metrics',
        type: 'repeater',
        full: true,
        section: 'Results',
        fields: [
          { name: 'label', label: 'Metric', type: 'text' },
          { name: 'value', label: 'Value', type: 'text' },
        ],
      },
      { name: 'contributorIds', label: 'Contributors', type: 'relations', resource: RESOURCES.employees, labelField: 'fullName', full: true, section: 'People' },
      { name: 'featured', label: 'Feature this story', type: 'checkbox', section: 'Results' },
    ],
  },

  [RESOURCES.competitions]: {
    label: 'Competition',
    labelPlural: 'Competitions',
    icon: 'SportsEsports',
    group: 'Engagement',
    columns: [
      { key: 'name', label: 'Competition', primary: true },
      { key: 'status', label: 'Status', badge: true },
      { key: 'category', label: 'Category' },
      { key: 'endDate', label: 'Closes', date: true },
    ],
    fields: [
      { name: 'name', label: 'Competition name', type: 'text', required: true, section: 'Basics' },
      { name: 'category', label: 'Category', type: 'text', required: true, section: 'Basics' },
      { name: 'status', label: 'Status', type: 'select', options: asOptions(Object.values(COMPETITION_STATUS)), required: true, section: 'Basics' },
      { name: 'startDate', label: 'Start date', type: 'date', required: true, section: 'Basics' },
      { name: 'endDate', label: 'End date', type: 'date', required: true, section: 'Basics' },
      { name: 'image', label: 'Image', type: 'image', full: true, section: 'Basics' },
      { name: 'summary', label: 'Summary', type: 'textarea', full: true, required: true, section: 'Content' },
      { name: 'description', label: 'Full brief', type: 'textarea', full: true, rows: 8, section: 'Content' },
      { name: 'eligibility', label: 'Eligibility', type: 'textarea', full: true, section: 'Rules' },
      { name: 'rules', label: 'Rules', type: 'tags', full: true, section: 'Rules' },
      { name: 'howToParticipate', label: 'How to participate', type: 'tags', full: true, section: 'Rules' },
      {
        name: 'prizes',
        label: 'Prizes',
        type: 'repeater',
        full: true,
        section: 'Prizes',
        fields: [
          { name: 'rank', label: 'Rank', type: 'number' },
          { name: 'title', label: 'Prize', type: 'text' },
          { name: 'description', label: 'Description', type: 'text' },
        ],
      },
      {
        name: 'attachment',
        label: 'Competition files (zip)',
        type: 'file',
        accept: '.zip',
        full: true,
        hint: 'Optional. Upload a zip with the brief, datasets or supporting files participants need.',
        section: 'Content',
      },
      { name: 'participantIds', label: 'Participants', type: 'relations', resource: RESOURCES.employees, labelField: 'fullName', full: true, section: 'Results' },
      { name: 'winnerIds', label: 'Winners (in order)', type: 'relations', resource: RESOURCES.employees, labelField: 'fullName', full: true, section: 'Results' },
      { name: 'featured', label: 'Feature this competition', type: 'checkbox', section: 'Results' },
    ],
  },

  [RESOURCES.gallery]: {
    label: 'Gallery Item',
    labelPlural: 'Gallery',
    icon: 'PhotoLibrary',
    group: 'Engagement',
    columns: [
      { key: 'title', label: 'Photo', primary: true },
      { key: 'category', label: 'Category' },
      { key: 'event', label: 'Event' },
      { key: 'date', label: 'Date', date: true },
    ],
    fields: [
      { name: 'title', label: 'Title', type: 'text', required: true, section: 'Basics' },
      { name: 'category', label: 'Category', type: 'select', options: asOptions(GALLERY_CATEGORIES), required: true, section: 'Basics' },
      { name: 'event', label: 'Event', type: 'text', required: true, section: 'Basics' },
      { name: 'date', label: 'Date', type: 'date', section: 'Basics' },
      { name: 'image', label: 'Image URL', type: 'text', full: true, hint: 'Leave empty to show the labelled placeholder tile.', section: 'Content' },
      { name: 'caption', label: 'Caption', type: 'textarea', full: true, section: 'Content' },
      { name: 'teamId', label: 'Related team', type: 'relation', resource: RESOURCES.teams, labelField: 'name', section: 'Content' },
    ],
  },

  [RESOURCES.recognition]: {
    label: 'Recognition',
    labelPlural: 'Recognition',
    icon: 'Celebration',
    group: 'Engagement',
    columns: [
      { key: 'title', label: 'Recognition', primary: true },
      { key: 'type', label: 'Type' },
      { key: 'quarter', label: 'Quarter' },
      { key: 'date', label: 'Date', date: true },
    ],
    fields: [
      { name: 'title', label: 'Title', type: 'text', required: true, section: 'Basics' },
      { name: 'type', label: 'Type', type: 'select', options: asOptions(RECOGNITION_TYPES), required: true, section: 'Basics' },
      { name: 'quarter', label: 'Quarter', type: 'text', section: 'Basics' },
      { name: 'date', label: 'Date', type: 'date', required: true, section: 'Basics' },
      { name: 'message', label: 'Citation / message', type: 'textarea', full: true, required: true, section: 'Content' },
      { name: 'fromEmployeeId', label: 'From', type: 'relation', resource: RESOURCES.employees, labelField: 'fullName', section: 'People' },
      { name: 'toEmployeeId', label: 'To (employee)', type: 'relation', resource: RESOURCES.employees, labelField: 'fullName', section: 'People' },
      { name: 'toTeamId', label: 'To (team)', type: 'relation', resource: RESOURCES.teams, labelField: 'name', section: 'People' },
      { name: 'featured', label: 'Feature on the recognition wall', type: 'checkbox', section: 'Content' },
    ],
  },

  [RESOURCES.submissions]: {
    label: 'Submission',
    labelPlural: 'Inbox',
    icon: 'Inbox',
    group: 'Engagement',
    readOnlyCreate: true,
    columns: [
      { key: 'subject', label: 'Subject', primary: true },
      { key: 'type', label: 'Type' },
      { key: 'name', label: 'From' },
      { key: 'competitionId', label: 'Competition', relation: RESOURCES.competitions, labelField: 'name' },
      { key: 'status', label: 'Status', badge: true },
      { key: 'createdAt', label: 'Received', date: true },
    ],
    fields: [
      { name: 'subject', label: 'Subject', type: 'text', required: true, section: 'Basics' },
      { name: 'type', label: 'Type', type: 'select', options: asOptions(SUBMISSION_TYPES), section: 'Basics' },
      { name: 'status', label: 'Status', type: 'select', options: asOptions(SUBMISSION_STATUS), section: 'Basics' },
      { name: 'name', label: 'From', type: 'text', section: 'Basics' },
      { name: 'email', label: 'Email', type: 'text', inputType: 'email', section: 'Basics' },
      { name: 'competitionId', label: 'Competition', type: 'relation', resource: RESOURCES.competitions, labelField: 'name', section: 'Basics' },
      { name: 'employeeId', label: 'Employee', type: 'relation', resource: RESOURCES.employees, labelField: 'fullName', section: 'Basics' },
      { name: 'message', label: 'Message', type: 'textarea', full: true, rows: 8, section: 'Content' },
      {
        name: 'attachment',
        label: 'Entry file',
        type: 'file',
        accept: '.zip',
        full: true,
        hint: 'The zip file the participant submitted, if any.',
        section: 'Content',
      },
    ],
  },
};

/** Ordered list used by the sidebar, grouped by area. */
export const ADMIN_NAV_GROUPS = ['Organisation', 'People', 'Content', 'Engagement'];

/** @param {string} resource */
export function getAdminSchema(resource) {
  return ADMIN_SCHEMAS[resource] ?? null;
}

export const ADMIN_RESOURCES = Object.keys(ADMIN_SCHEMAS);

/** Builds an empty record from a schema so "new" forms start in a valid shape. */
export function emptyRecord(schema) {
  /** @type {Record<string, any>} */
  const record = {};
  schema.fields.forEach((field) => {
    switch (field.type) {
      case 'tags':
      case 'relations':
      case 'repeater':
      case 'images':
        record[field.name] = [];
        break;
      case 'checkbox':
        record[field.name] = false;
        break;
      case 'file':
        record[field.name] = null;
        break;
      case 'number':
        record[field.name] = '';
        break;
      default:
        record[field.name] = '';
    }
  });
  return record;
}

/** Groups a schema's fields into ordered sections for the form layout. */
export function groupFields(schema) {
  /** @type {Array<{ title: string, fields: any[] }>} */
  const sections = [];
  schema.fields.forEach((field) => {
    const title = field.section ?? 'Details';
    const existing = sections.find((section) => section.title === title);
    if (existing) existing.fields.push(field);
    else sections.push({ title, fields: [field] });
  });
  return sections;
}
