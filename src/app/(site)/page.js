import { getHomePageData, getLookups, toPersonSummary } from '@/lib/dataAccess';
import { HeroSection } from '@/components/home/HeroSection';
import { StatsSection } from '@/components/home/StatsSection';
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
  const [data, lookups] = await Promise.all([getHomePageData(), getLookups()]);
  const head = toPersonSummary(lookups.employeesById[data.department?.headId]);

  return (
    <>
      <HeroSection department={data.department} stats={data.stats} />
      <StatsSection stats={data.stats} />
      <OrgChartSection
        departmentName={data.department?.shortName ?? 'DWH'}
        head={head}
        teams={data.teams}
      />
      <TeamsSection teams={data.teams} />
      <FeaturedEmployeesSection employees={data.featuredEmployees} />
      <AnnouncementsSection announcements={data.announcements} />
      <AchievementsSection achievements={data.achievements} teamsById={lookups.teamsById} />
      <InitiativesSection initiatives={data.initiatives} />
      <SuccessStoriesSection stories={data.successStories} />
      <CompetitionsSection competitions={data.competitions} />
      <QuickLinksSection />
      <CtaSection head={head ? { ...head, jobTitle: head.jobTitle } : null} />
    </>
  );
}
