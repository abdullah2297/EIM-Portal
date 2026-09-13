import { getCurrentEmployee, getExecutives, getHomePageData, getLookups, toPersonSummary } from '@/lib/dataAccess';
import { HeroSection } from '@/components/home/HeroSection';
import { StatsSection } from '@/components/home/StatsSection';
import { LandingLoginSection } from '@/components/home/LandingLoginSection';
import {
  AchievementsSection,
  AnnouncementsSection,
  CompetitionsSection,
  CtaSection,
  FeaturedEmployeesSection,
  InitiativesSection,
  OrgChartSection,
  QuickLinksSection,
  SuccessStoriesSection,
  TeamsSection,
} from '@/components/home/HomeSections';

// Content is read from the JSON data store on every request so edits made in
// the admin panel appear on the portal immediately.
export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Home',
  description:
    'Explore the Data Warehouse Department: our teams, our people, our initiatives, achievements and community.',
};

/**
 * Home page.
 *
 * Rendered on the server from the JSON data store so the first paint already
 * contains real content; the interactive listing pages fetch through the REST
 * service layer instead.
 */
export default async function HomePage() {
  const [data, lookups, me] = await Promise.all([
    getHomePageData(),
    getLookups(),
    getCurrentEmployee(),
  ]);
  const head = toPersonSummary(lookups.employeesById[data.department?.headId]);
  const executives = getExecutives(lookups.employees);

  // Logged-out visitors only get a teaser of the home page - the rest of the
  // site is gated behind login by middleware, and `/` is the one page that
  // must stay reachable so it can show this instead of nothing at all.
  if (!me) {
    return (
      <>
        <HeroSection department={data.department} stats={data.stats} />
        <div id="department" className="anchor-target">
          <StatsSection stats={data.stats} />
        </div>
        <div id="achievements" className="anchor-target">
          <AchievementsSection achievements={data.achievements} teamsById={lookups.teamsById} />
        </div>
        <LandingLoginSection />
      </>
    );
  }

  return (
    <>
      <HeroSection department={data.department} stats={data.stats} />
      <StatsSection stats={data.stats} />
      <OrgChartSection
        departmentName={data.department?.shortName ?? 'DWH'}
        head={head}
        executives={executives}
        teams={data.teams}
      />
      <TeamsSection teams={data.teams} />
      <FeaturedEmployeesSection employees={data.featuredEmployees} />
      <AnnouncementsSection announcements={data.announcements} teamsById={lookups.teamsById} />
      <AchievementsSection achievements={data.achievements} teamsById={lookups.teamsById} />
      <InitiativesSection initiatives={data.initiatives} />
      <SuccessStoriesSection stories={data.successStories} />
      <CompetitionsSection competitions={data.competitions} />
      <QuickLinksSection />
      <CtaSection head={head ? { ...head, jobTitle: head.jobTitle } : null} />
    </>
  );
}
