/**
 * The site's gated sections, mirroring the navbar - each employee account is
 * granted access to a subset of these (see `employee-credentials.sections`),
 * enforced in `middleware.js`. `/` and `/search` are intentionally excluded:
 * they stay reachable to any logged-in employee regardless of permissions.
 */
export const SITE_SECTIONS = [
  { key: 'department', label: 'Department', paths: ['/department'] },
  { key: 'ourSquads', label: 'Our Squads', paths: ['/our-squads', '/teams', '/sub-teams', '/employees'] },
  { key: 'initiatives', label: 'Initiatives', paths: ['/initiatives'] },
  { key: 'learning', label: 'L&D', paths: ['/learning'] },
  { key: 'achievements', label: 'Achievements', paths: ['/achievements', '/success-stories'] },
  { key: 'announcements', label: 'Announcements', paths: ['/announcements'] },
  { key: 'competitions', label: 'Competitions', paths: ['/competitions'] },
  { key: 'gallery', label: 'Gallery', paths: ['/gallery'] },
  { key: 'recognition', label: 'Recognition', paths: ['/recognition'] },
  { key: 'contact', label: 'Contact', paths: ['/contact'] },
];

export const ALL_SECTION_KEYS = SITE_SECTIONS.map((section) => section.key);

/**
 * Finds which section (if any) a path belongs to, matching the longest
 * configured prefix. Returns `null` for `/`, `/search`, or anything else not
 * covered by a section - those stay reachable to any logged-in employee.
 * @param {string} pathname
 * @returns {string | null}
 */
export function resolveSectionForPath(pathname) {
  let match = null;
  let matchLength = 0;

  SITE_SECTIONS.forEach((section) => {
    section.paths.forEach((prefix) => {
      const hits = pathname === prefix || pathname.startsWith(`${prefix}/`);
      if (hits && prefix.length > matchLength) {
        match = section.key;
        matchLength = prefix.length;
      }
    });
  });

  return match;
}
