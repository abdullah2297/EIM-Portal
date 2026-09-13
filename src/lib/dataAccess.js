import 'server-only';
import { listAll, readCollection } from './db';
import { ACTIVE_REGISTRATION_STATUS, EXECUTIVE_ROLES, EXECUTIVE_TIERS, PUBLIC_TRAINING_STATUS, RESOURCES } from './constants';
import { promoteFlagged, sortItems } from './query';
import { getEmployeeSession } from './employeeSession';

/**
 * Server-side read model.
 *
 * Server components use these helpers instead of calling the app's own HTTP
 * API: it avoids a pointless network hop during rendering and keeps the join
 * logic (employee -> team -> sub-team -> initiative) in one place.
 *
 * The public REST API remains the single interface for the browser and for
 * anything outside this app.
 */

/** @returns {Promise<Record<string, any>>} */
export function getDepartment() {
  return readCollection(RESOURCES.department);
}

export const getTeams = () => listAll(RESOURCES.teams);
export const getSubTeams = () => listAll(RESOURCES.subTeams);
export const getEmployees = () => listAll(RESOURCES.employees);
export const getTrainingTypes = () => listAll(RESOURCES.trainingTypes);
export const getTrainingCategories = () => listAll(RESOURCES.trainingCategories);
export const getTrainings = () => listAll(RESOURCES.trainings);
export const getInitiatives = () => listAll(RESOURCES.initiatives);
export const getAchievements = () => listAll(RESOURCES.achievements);
export const getAnnouncements = () => listAll(RESOURCES.announcements);
export const getSuccessStories = () => listAll(RESOURCES.successStories);
export const getCompetitions = () => listAll(RESOURCES.competitions);
export const getGallery = () => listAll(RESOURCES.gallery);
export const getRecognition = () => listAll(RESOURCES.recognition);

/** Builds id -> record maps for the three entities everything else references. */
export async function getLookups() {
  const [teams, subTeams, employees] = await Promise.all([
    getTeams(),
    getSubTeams(),
    getEmployees(),
  ]);

  return {
    teams,
    subTeams,
    employees,
    teamsById: Object.fromEntries(teams.map((t) => [t.id, t])),
    subTeamsById: Object.fromEntries(subTeams.map((s) => [s.id, s])),
    employeesById: Object.fromEntries(employees.map((e) => [e.id, e])),
  };
}

/** Minimal person shape used by avatars, contributor rows and leaderboards. */
export function toPersonSummary(employee) {
  if (!employee) return null;
  return {
    id: employee.id,
    fullName: employee.fullName,
    jobTitle: employee.jobTitle,
    role: employee.role,
    teamId: employee.teamId,
    subTeamId: employee.subTeamId,
    photo: employee.photo ?? null,
  };
}

/** C-level executives (CIO/CFO/CDO) - not tied to one team, shown as their own tier in the org chart. */
export function getExecutives(employees) {
  return employees
    .filter((employee) => EXECUTIVE_ROLES.includes(employee.role))
    .sort((a, b) => EXECUTIVE_ROLES.indexOf(a.role) - EXECUTIVE_ROLES.indexOf(b.role))
    .map(toPersonSummary);
}

/**
 * Who a C-level executive reports to, per `EXECUTIVE_TIERS` - the CEO has
 * none (top of the chain); everyone else resolves to whoever holds the role
 * in the tier directly above them.
 */
export function getExecutiveManager(employee, employees) {
  const tierIndex = EXECUTIVE_TIERS.findIndex((roles) => roles.includes(employee.role));
  if (tierIndex <= 0) return null;
  const managerRoles = EXECUTIVE_TIERS[tierIndex - 1];
  return toPersonSummary(employees.find((candidate) => managerRoles.includes(candidate.role)));
}

/** Resolves an array of employee ids into person summaries, dropping unknowns. */
export function resolvePeople(ids, employeesById) {
  return (Array.isArray(ids) ? ids : [])
    .map((id) => toPersonSummary(employeesById[id]))
    .filter(Boolean);
}

/** The logged-in employee's person summary, or null when signed out. */
export async function getCurrentEmployee() {
  const session = await getEmployeeSession();
  if (!session) return null;
  const employees = await getEmployees();
  const employee = employees.find((item) => item.id === session.sub);
  return employee ? toPersonSummary(employee) : null;
}

/** Everything the home page renders, gathered in one pass. */
export async function getHomePageData() {
  const [
    department,
    lookups,
    initiatives,
    achievements,
    announcements,
    successStories,
    competitions,
  ] = await Promise.all([
    getDepartment(),
    getLookups(),
    getInitiatives(),
    getAchievements(),
    getAnnouncements(),
    getSuccessStories(),
    getCompetitions(),
  ]);

  const { teams, subTeams, employees, employeesById, teamsById } = lookups;

  const teamsWithCounts = sortItems(teams, 'order', 'asc').map((team) => ({
    ...team,
    memberCount: employees.filter((e) => e.teamId === team.id).length,
    subTeamCount: subTeams.filter((s) => s.teamId === team.id).length,
    lead: toPersonSummary(employeesById[team.leadId]),
    subTeams: subTeams
      .filter((s) => s.teamId === team.id)
      .map((sub) => ({
        ...sub,
        lead: toPersonSummary(employeesById[sub.leadId]),
        memberCount: employees.filter((e) => e.subTeamId === sub.id).length,
      })),
  }));

  const featuredEmployees = promoteFlagged(employees)
    .slice(0, 8)
    .map((employee) => ({
      ...employee,
      team: teamsById[employee.teamId] ?? null,
    }));

  return {
    department,
    stats: {
      employees: employees.length,
      teams: teams.length,
      subTeams: subTeams.length,
      portfolios: department?.portfolios?.length ?? 0,
      initiatives: initiatives.length,
      achievements: achievements.length,
    },
    teams: teamsWithCounts,
    featuredEmployees,
    announcements: sortItems(announcements, 'date', 'desc').slice(0, 4).map((item) => ({
      ...item,
      author: toPersonSummary(employeesById[item.authorId]),
    })),
    achievements: promoteFlagged(sortItems(achievements, 'date', 'desc')).slice(0, 3),
    initiatives: promoteFlagged(sortItems(initiatives, 'startDate', 'desc'))
      .slice(0, 3)
      .map((item) => ({
        ...item,
        teams: (item.teamIds ?? []).map((id) => teamsById[id]).filter(Boolean),
      })),
    successStories: promoteFlagged(sortItems(successStories, 'date', 'desc'))
      .slice(0, 2)
      .map((item) => ({
        ...item,
        team: teamsById[item.teamId] ?? null,
        contributors: resolvePeople(item.contributorIds, employeesById),
      })),
    competitions: sortItems(
      competitions.filter((c) => c.status !== 'Completed'),
      'startDate',
      'asc',
    ).slice(0, 3),
  };
}

/** Full department page model: teams, sub-teams and the org chart. */
export async function getDepartmentPageData() {
  const [department, lookups, initiatives, achievements] = await Promise.all([
    getDepartment(),
    getLookups(),
    getInitiatives(),
    getAchievements(),
  ]);

  const { teams, subTeams, employees, employeesById, teamsById } = lookups;

  return {
    department,
    stats: {
      employees: employees.length,
      teams: teams.length,
      subTeams: subTeams.length,
      portfolios: department?.portfolios?.length ?? 0,
      initiatives: initiatives.length,
      achievements: achievements.length,
    },
    head: toPersonSummary(employeesById[department?.headId]),
    leadership: resolvePeople(department?.leadershipIds, employeesById),
    executives: getExecutives(employees),
    champions: employees
      .filter((employee) => employee.featured)
      .slice(0, 4)
      .map((employee) => ({ ...employee, teamName: teamsById[employee.teamId]?.shortName })),
    teams: sortItems(teams, 'order', 'asc').map((team) => ({
      ...team,
      lead: toPersonSummary(employeesById[team.leadId]),
      memberCount: employees.filter((e) => e.teamId === team.id).length,
      subTeams: subTeams
        .filter((s) => s.teamId === team.id)
        .map((sub) => ({
          ...sub,
          lead: toPersonSummary(employeesById[sub.leadId]),
          memberCount: employees.filter((e) => e.subTeamId === sub.id).length,
        })),
    })),
  };
}

/** Full profile model for `/employees/[employeeId]`. */
export async function getEmployeeProfile(employeeId) {
  const [lookups, initiatives, achievements, recognition, competitions, successStories] =
    await Promise.all([
      getLookups(),
      getInitiatives(),
      getAchievements(),
      getRecognition(),
      getCompetitions(),
      getSuccessStories(),
    ]);

  const { employeesById, teamsById, subTeamsById, employees } = lookups;
  const employee = employeesById[employeeId];
  if (!employee) return null;

  const team = teamsById[employee.teamId] ?? null;
  const subTeam = subTeamsById[employee.subTeamId] ?? null;
  const isExecutive = EXECUTIVE_ROLES.includes(employee.role);

  return {
    employee,
    team,
    subTeam,
    manager: isExecutive ? getExecutiveManager(employee, employees) : toPersonSummary(employeesById[team?.leadId]),
    subTeamLead: toPersonSummary(employeesById[subTeam?.leadId]),
    colleagues: employee.subTeamId
      ? employees.filter((e) => e.subTeamId === employee.subTeamId && e.id !== employee.id).map(toPersonSummary)
      : [],
    initiatives: initiatives.filter((i) => (i.contributorIds ?? []).includes(employee.id)),
    achievements: achievements.filter((a) => (a.employeeIds ?? []).includes(employee.id)),
    stories: successStories.filter((s) => (s.contributorIds ?? []).includes(employee.id)),
    recognition: recognition
      .filter((r) => r.toEmployeeId === employee.id)
      .map((r) => ({ ...r, from: toPersonSummary(employeesById[r.fromEmployeeId]) })),
    competitionsWon: competitions.filter((c) => (c.winnerIds ?? []).includes(employee.id)),
  };
}

/** Full detail model for `/teams/[teamId]`. */
export async function getTeamDetail(teamId) {
  const [lookups, initiatives, achievements] = await Promise.all([
    getLookups(),
    getInitiatives(),
    getAchievements(),
  ]);
  const { teamsById, subTeamsById, employeesById, subTeams, employees } = lookups;
  const team = teamsById[teamId];
  if (!team) return null;

  return {
    team,
    lead: toPersonSummary(employeesById[team.leadId]),
    subTeams: subTeams
      .filter((s) => s.teamId === team.id)
      .map((sub) => ({
        ...sub,
        lead: toPersonSummary(employeesById[sub.leadId]),
        memberCount: employees.filter((e) => e.subTeamId === sub.id).length,
      })),
    members: employees.filter((e) => e.teamId === team.id),
    initiatives: initiatives.filter((i) => (i.teamIds ?? []).includes(team.id)),
    achievements: achievements.filter((a) => (a.teamIds ?? []).includes(team.id)),
  };
}

/** Full detail model for `/sub-teams/[subTeamId]`. */
export async function getSubTeamDetail(subTeamId) {
  const [lookups, initiatives, achievements] = await Promise.all([
    getLookups(),
    getInitiatives(),
    getAchievements(),
  ]);
  const { subTeamsById, teamsById, employeesById, employees } = lookups;
  const subTeam = subTeamsById[subTeamId];
  if (!subTeam) return null;

  return {
    subTeam,
    team: teamsById[subTeam.teamId] ?? null,
    lead: toPersonSummary(employeesById[subTeam.leadId]),
    members: employees.filter((e) => e.subTeamId === subTeam.id),
    initiatives: initiatives.filter((i) => (i.subTeamIds ?? []).includes(subTeam.id)),
    achievements: achievements.filter((a) => (a.subTeamIds ?? []).includes(subTeam.id)),
  };
}

/** Ids of every team / sub-team, used by generateStaticParams-style helpers. */
export async function getAllTeamIds() {
  const teams = await getTeams();
  return teams.map((t) => t.id);
}

export async function getAllSubTeamIds() {
  const subTeams = await getSubTeams();
  return subTeams.map((s) => s.id);
}

/** Full detail model for `/competitions/[competitionId]`. */
export async function getCompetitionDetail(competitionId) {
  const [competitions, lookups] = await Promise.all([getCompetitions(), getLookups()]);
  const competition = competitions.find((c) => c.id === competitionId);
  if (!competition) return null;

  const { employeesById } = lookups;

  // A handful of winners from other past competitions, most recent first -
  // shown in place of a live leaderboard, which no longer applies now that
  // entries are judged from submitted files rather than a live score.
  const pastWinners = sortItems(
    competitions.filter((c) => c.id !== competition.id && c.status === 'Completed' && c.winnerIds?.length),
    'endDate',
    'desc',
  )
    .slice(0, 3)
    .flatMap((pastCompetition) =>
      (pastCompetition.winnerIds ?? []).slice(0, 3).map((id, index) => ({
        key: `${pastCompetition.id}-${id}`,
        competition: pastCompetition,
        person: toPersonSummary(employeesById[id]),
        rank: index + 1,
      })),
    );

  return {
    competition,
    participants: resolvePeople(competition.participantIds, employeesById),
    winners: resolvePeople(competition.winnerIds, employeesById),
    pastWinners,
    related: competitions
      .filter((c) => c.id !== competition.id && c.category === competition.category)
      .slice(0, 3),
  };
}

/** Ids of every competition, used by generateStaticParams-style helpers. */
export async function getAllCompetitionIds() {
  const competitions = await getCompetitions();
  return competitions.map((c) => c.id);
}

export async function getAllEmployeeIds() {
  const employees = await getEmployees();
  return employees.map((e) => e.id);
}

const LD_MEGA_MENU_SAMPLE_SIZE = 3;

/** Training types/categories/trainings joined, restricted to publicly-visible statuses. */
async function getLdCatalogLookups() {
  const [types, categories, trainings] = await Promise.all([
    getTrainingTypes(),
    getTrainingCategories(),
    getTrainings(),
  ]);
  return {
    types,
    categories,
    trainings: trainings.filter((training) => PUBLIC_TRAINING_STATUS.includes(training.status)),
  };
}

/** Nav data for the L&D mega-menu: active types -> active categories -> sample courses. */
export async function getLdNavData() {
  const { types, categories, trainings } = await getLdCatalogLookups();

  const activeTypes = sortItems(types.filter((type) => type.active !== false), 'order', 'asc');
  const activeCategories = sortItems(
    categories.filter((category) => category.active !== false),
    'order',
    'asc',
  );

  return {
    types: activeTypes.map((type) => ({
      id: type.id,
      name: type.name,
      icon: type.icon,
      categories: activeCategories
        .filter((category) => category.trainingTypeId === type.id)
        .map((category) => ({
          id: category.id,
          name: category.name,
          courses: promoteFlagged(trainings.filter((training) => training.categoryId === category.id))
            .slice(0, LD_MEGA_MENU_SAMPLE_SIZE)
            .map((training) => ({ id: training.id, name: training.name })),
        })),
    })),
  };
}

/** Every publicly-visible training, joined with its category and training type. */
export async function getTrainingCatalogData() {
  const { types, categories, trainings } = await getLdCatalogLookups();
  const typesById = Object.fromEntries(types.map((type) => [type.id, type]));
  const categoriesById = Object.fromEntries(categories.map((category) => [category.id, category]));

  return sortItems(trainings, 'date', 'desc').map((training) => {
    const category = categoriesById[training.categoryId] ?? null;
    const type = category ? typesById[category.trainingTypeId] ?? null : null;
    return { ...training, category, type };
  });
}

/** Full detail model for `/learning/[trainingId]`. */
export async function getTrainingDetail(trainingId) {
  const { types, categories, trainings } = await getLdCatalogLookups();
  const training = trainings.find((item) => item.id === trainingId);
  if (!training) return null;

  const category = categories.find((item) => item.id === training.categoryId) ?? null;
  const type = category ? types.find((item) => item.id === category.trainingTypeId) ?? null : null;
  const related = trainings
    .filter((item) => item.id !== training.id && item.categoryId === training.categoryId)
    .slice(0, 3);

  const [registrations, session] = await Promise.all([
    listAll(RESOURCES.trainingRegistrations),
    getEmployeeSession(),
  ]);
  const forTraining = registrations.filter((item) => item.trainingId === trainingId);
  const registeredCount = forTraining.filter((item) => ACTIVE_REGISTRATION_STATUS.includes(item.status)).length;
  const myRegistration = session
    ? forTraining.find((item) => item.employeeId === session.sub && item.status !== 'Cancelled') ?? null
    : null;

  return { training, category, type, related, registeredCount, myRegistration };
}

/** This employee's own registrations, joined with each training, for "My Training". */
export async function getMyTrainingRegistrations(employeeId) {
  const [registrations, trainings] = await Promise.all([
    listAll(RESOURCES.trainingRegistrations),
    getTrainings(),
  ]);
  const trainingsById = Object.fromEntries(trainings.map((item) => [item.id, item]));

  const mine = registrations
    .filter((item) => item.employeeId === employeeId && item.status !== 'Cancelled')
    .map((item) => ({ ...item, training: trainingsById[item.trainingId] ?? null }))
    .filter((item) => item.training);

  return {
    upcoming: mine.filter((item) => item.training.status !== 'Completed'),
    completed: mine.filter((item) => item.training.status === 'Completed'),
  };
}

/** Ids of every publicly-visible training, used by generateStaticParams-style helpers. */
export async function getAllTrainingIds() {
  const trainings = await getTrainings();
  return trainings
    .filter((training) => PUBLIC_TRAINING_STATUS.includes(training.status))
    .map((training) => training.id);
}
