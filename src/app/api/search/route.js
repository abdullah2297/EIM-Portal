import { listAll } from '@/lib/db';
import { RESOURCES, ROUTES, SEARCH_GROUPS } from '@/lib/constants';
import { RESOURCE_CONFIG } from '@/lib/resourceConfig';
import { searchItems } from '@/lib/query';
import { handleError, ok } from '@/lib/apiResponse';

/**
 * Global search across every public content type.
 *
 *   GET /api/search?q=term&limit=5
 *
 * Results are grouped by content type in the order defined by SEARCH_GROUPS,
 * so the UI can render one section per group without re-sorting.
 */

export const dynamic = 'force-dynamic';

/** Maps a search group key -> collection name + result shape. */
const GROUP_SOURCES = {
  employees: {
    resource: RESOURCES.employees,
    href: (item) => ROUTES.employee(item.id),
    title: (item) => item.fullName,
    subtitle: (item) => item.jobTitle,
  },
  teams: {
    resource: RESOURCES.teams,
    href: (item) => ROUTES.team(item.id),
    title: (item) => item.name,
    subtitle: (item) => item.shortName,
  },
  subTeams: {
    resource: RESOURCES.subTeams,
    href: (item) => ROUTES.subTeam(item.id),
    title: (item) => item.name,
    subtitle: (item) => 'Sub-team',
  },
  initiatives: {
    resource: RESOURCES.initiatives,
    href: (item) => `/initiatives?initiative=${item.id}`,
    title: (item) => item.title,
    subtitle: (item) => item.category,
  },
  achievements: {
    resource: RESOURCES.achievements,
    href: () => '/achievements',
    title: (item) => item.title,
    subtitle: (item) => item.category,
  },
  announcements: {
    resource: RESOURCES.announcements,
    href: (item) => `/announcements?announcement=${item.id}`,
    title: (item) => item.title,
    subtitle: (item) => item.category,
  },
  successStories: {
    resource: RESOURCES.successStories,
    href: (item) => `/success-stories?story=${item.id}`,
    title: (item) => item.title,
    subtitle: (item) => item.type,
  },
  competitions: {
    resource: RESOURCES.competitions,
    href: (item) => `/competitions/${item.id}`,
    title: (item) => item.name,
    subtitle: (item) => item.status,
  },
};

function excerpt(item, fields) {
  for (const field of fields) {
    const value = item?.[field];
    if (typeof value === 'string' && value.trim().length > 20) {
      return value.length > 160 ? `${value.slice(0, 157)}...` : value;
    }
  }
  return '';
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const term = (searchParams.get('q') ?? '').trim();
    const parsedLimit = Number.parseInt(searchParams.get('limit') ?? '', 10);
    const limit = Number.isFinite(parsedLimit) && parsedLimit > 0 ? Math.min(parsedLimit, 25) : 6;

    if (term.length < 2) {
      return ok({ term, total: 0, groups: [] });
    }

    const groups = [];
    let total = 0;

    for (const group of SEARCH_GROUPS) {
      const source = GROUP_SOURCES[group.key];
      if (!source) continue;

      const config = RESOURCE_CONFIG[source.resource];
      const items = await listAll(source.resource);
      const matches = searchItems(items, term, config.searchable);
      total += matches.length;

      if (matches.length === 0) continue;

      groups.push({
        key: group.key,
        label: group.label,
        icon: group.icon,
        count: matches.length,
        results: matches.slice(0, limit).map((item) => ({
          id: item.id,
          title: source.title(item),
          subtitle: source.subtitle(item),
          excerpt: excerpt(item, config.searchable),
          href: source.href(item),
        })),
      });
    }

    return ok({ term, total, groups });
  } catch (error) {
    return handleError(error);
  }
}
