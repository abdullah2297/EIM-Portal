import { listAll, readCollection } from '@/lib/db';
import { RESOURCES } from '@/lib/constants';
import { handleError, ok } from '@/lib/apiResponse';

/**
 * GET /api/stats
 *
 * Live counts derived from the data files, so the numbers on the home page and
 * the admin dashboard never drift away from the actual content.
 */

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const [
      teams,
      subTeams,
      employees,
      initiatives,
      achievements,
      announcements,
      successStories,
      competitions,
      gallery,
      recognition,
      submissions,
      department,
    ] = await Promise.all([
      listAll(RESOURCES.teams),
      listAll(RESOURCES.subTeams),
      listAll(RESOURCES.employees),
      listAll(RESOURCES.initiatives),
      listAll(RESOURCES.achievements),
      listAll(RESOURCES.announcements),
      listAll(RESOURCES.successStories),
      listAll(RESOURCES.competitions),
      listAll(RESOURCES.gallery),
      listAll(RESOURCES.recognition),
      listAll(RESOURCES.submissions),
      readCollection(RESOURCES.department),
    ]);

    const counts = {
      teams: teams.length,
      subTeams: subTeams.length,
      employees: employees.length,
      initiatives: initiatives.length,
      achievements: achievements.length,
      announcements: announcements.length,
      successStories: successStories.length,
      competitions: competitions.length,
      gallery: gallery.length,
      recognition: recognition.length,
      submissions: submissions.length,
      portfolios: Array.isArray(department?.portfolios) ? department.portfolios.length : 0,
      activeCompetitions: competitions.filter((c) => c.status === 'Active').length,
      activeInitiatives: initiatives.filter((c) => c.status === 'In Progress').length,
      newSubmissions: submissions.filter((s) => s.status === 'New').length,
    };

    /** The six headline tiles rendered on the home page and department page. */
    const highlights = [
      { key: 'employees', label: 'Colleagues', value: counts.employees, icon: 'Groups' },
      { key: 'teams', label: 'Main Teams', value: counts.teams, icon: 'AccountTree' },
      { key: 'subTeams', label: 'Sub-Teams', value: counts.subTeams, icon: 'Hub' },
      { key: 'portfolios', label: 'Portfolios Supported', value: counts.portfolios, icon: 'BusinessCenter' },
      { key: 'initiatives', label: 'Initiatives', value: counts.initiatives, icon: 'Lightbulb' },
      { key: 'achievements', label: 'Achievements & Awards', value: counts.achievements, icon: 'EmojiEvents' },
    ];

    return ok({ counts, highlights });
  } catch (error) {
    return handleError(error);
  }
}
