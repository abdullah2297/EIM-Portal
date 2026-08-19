/**
 * Seed generator for the EIM Portal JSON data store.
 *
 *   node scripts/seed.mjs
 *
 * Everything produced here is SAMPLE/PLACEHOLDER content: fictional people,
 * fictional projects and fictional results. Replace it through the admin panel
 * (or by editing the JSON files directly) with the department's real content.
 *
 * The generator is deterministic -- a fixed seed means re-running it produces
 * exactly the same data set, which keeps diffs readable.
 */

import fs from 'node:fs/promises';
import path from 'node:path';

const DATA_DIR = path.join(process.cwd(), 'data');

// -- Deterministic pseudo-random ---------------------------------------------
let seed = 20260818;
const rand = () => {
  seed = (seed * 1664525 + 1013904223) % 4294967296;
  return seed / 4294967296;
};
const pick = (arr) => arr[Math.floor(rand() * arr.length)];
const pickMany = (arr, count) => {
  const pool = [...arr];
  const out = [];
  for (let i = 0; i < count && pool.length; i += 1) {
    out.push(pool.splice(Math.floor(rand() * pool.length), 1)[0]);
  }
  return out;
};
const int = (min, max) => min + Math.floor(rand() * (max - min + 1));
const isoDate = (y, m, d) => new Date(Date.UTC(y, m - 1, d)).toISOString().slice(0, 10);

// ---------------------------------------------------------------------------
// Department
// ---------------------------------------------------------------------------
const PORTFOLIOS = [
  'Retail Banking',
  'Corporate & Institutional Banking',
  'Risk & Compliance',
  'Finance & Treasury',
  'Operations',
  'Digital Channels',
  'Human Resources',
  'Marketing & Customer Experience',
];

const department = {
  id: 'dept-dwh',
  name: 'Data Warehouse Department',
  shortName: 'DWH',
  portalName: 'EIM Portal',
  tagline: 'Enterprise Information Management, powered by our people.',
  establishedYear: '2011',
  overview:
    'The Data Warehouse Department is the single source of truth for enterprise data. We design, build and operate the data platforms that move information from source systems into governed, trusted and reusable data products - then turn those products into reporting, analytics and insight for every business area we support.',
  mission:
    'To deliver trusted, timely and well-governed data that helps every part of the organisation make better decisions faster.',
  vision:
    'To be recognised as the most reliable, innovative and people-focused data organisation in the group - a place where engineers, analysts and specialists do their best work together.',
  values: [
    { title: 'Trust in Data', description: 'Accuracy and transparency are non-negotiable in everything we publish.' },
    { title: 'One Team', description: 'Five teams, fifteen sub-teams, one shared backlog of outcomes.' },
    { title: 'Curiosity', description: 'We keep learning, experimenting and improving the way we work.' },
    { title: 'Ownership', description: 'We take responsibility end to end, from source system to dashboard.' },
    { title: 'Celebrate People', description: 'Recognition is part of the job, not an afterthought.' },
  ],
  responsibilities: [
    'Design and operate the enterprise data warehouse and its ingestion pipelines.',
    'Deliver regulatory, management and operational reporting across all portfolios.',
    'Own data governance, data quality, metadata and the enterprise data catalogue.',
    'Build advanced analytics and machine-learning products for business teams.',
    'Run the data platform, its performance, availability and production support.',
    'Enable self-service analytics through training, standards and reusable data models.',
  ],
  portfolios: PORTFOLIOS.map((name, index) => ({
    name,
    description: `PLACEHOLDER - short description of the ${name} portfolio and the data products delivered for it.`,
    teamCount: 2 + (index % 3),
  })),
  contact: {
    email: 'placeholder.dwh@example.com',
    phone: '+00 000 000 0000',
    location: 'PLACEHOLDER - building / floor',
    officeHours: 'Sunday to Thursday, 09:00 - 17:00',
    supportChannel: 'PLACEHOLDER - internal chat channel name',
  },
  stats: [
    { label: 'Team Members', value: 40, suffix: '+', icon: 'Groups' },
    { label: 'Main Teams', value: 5, suffix: '', icon: 'AccountTree' },
    { label: 'Sub-Teams', value: 15, suffix: '', icon: 'Hub' },
    { label: 'Business Portfolios', value: 8, suffix: '', icon: 'BusinessCenter' },
    { label: 'Active Initiatives', value: 12, suffix: '', icon: 'Lightbulb' },
    { label: 'Awards Won', value: 18, suffix: '', icon: 'EmojiEvents' },
  ],
};

// ---------------------------------------------------------------------------
// Teams and sub-teams
// ---------------------------------------------------------------------------
const TEAM_BLUEPRINT = [
  {
    id: 'team-engineering',
    name: 'Data Engineering & Integration',
    shortName: 'Engineering',
    icon: 'Engineering',
    description:
      'Builds and runs the pipelines that bring data from every source system into the warehouse - reliably, on schedule and at scale.',
    mission: 'Move every byte of enterprise data into a governed, reusable shape.',
    responsibilities: [
      'Design, build and maintain batch and streaming ingestion pipelines.',
      'Own the dimensional and data-vault models of the enterprise warehouse.',
      'Optimise load windows, orchestration and pipeline observability.',
      'Onboard new source systems and retire legacy feeds.',
    ],
    portfolios: ['Retail Banking', 'Corporate & Institutional Banking', 'Operations'],
    subTeams: [
      {
        name: 'Ingestion & ETL',
        description: 'Owns the batch ingestion estate: extraction, transformation and load orchestration across all source systems.',
        focusAreas: ['Batch pipelines', 'Orchestration', 'Source onboarding'],
      },
      {
        name: 'Streaming & Real-Time Data',
        description: 'Delivers event-driven and near real-time data products for operational and customer-facing use cases.',
        focusAreas: ['Event streaming', 'CDC', 'Real-time marts'],
      },
      {
        name: 'Data Modelling & Warehouse Design',
        description: 'Defines the conceptual, logical and physical models that keep the warehouse consistent and reusable.',
        focusAreas: ['Dimensional modelling', 'Data vault', 'Model governance'],
      },
    ],
  },
  {
    id: 'team-bi',
    name: 'Business Intelligence & Reporting',
    shortName: 'BI & Reporting',
    icon: 'InsertChart',
    description:
      'Turns warehouse data into the regulatory, management and operational reporting the organisation runs on every day.',
    mission: 'Every decision-maker gets the number they need, when they need it.',
    responsibilities: [
      'Deliver regulatory and statutory reporting to agreed deadlines.',
      'Build and maintain executive and management dashboards.',
      'Enable business users with self-service datasets and training.',
      'Certify report definitions and shared business metrics.',
    ],
    portfolios: ['Risk & Compliance', 'Finance & Treasury', 'Retail Banking', 'Marketing & Customer Experience'],
    subTeams: [
      {
        name: 'Regulatory Reporting',
        description: 'Produces statutory and regulatory submissions with full traceability back to source.',
        focusAreas: ['Regulatory packs', 'Audit trails', 'Submission calendars'],
      },
      {
        name: 'Management Reporting & Dashboards',
        description: 'Designs executive scorecards, KPI dashboards and the departmental reporting catalogue.',
        focusAreas: ['Executive dashboards', 'KPI design', 'Visual standards'],
      },
      {
        name: 'Self-Service BI Enablement',
        description: 'Equips business teams to answer their own questions safely with certified datasets and coaching.',
        focusAreas: ['Certified datasets', 'User training', 'BI community'],
      },
    ],
  },
  {
    id: 'team-governance',
    name: 'Data Governance & Quality',
    shortName: 'Governance',
    icon: 'VerifiedUser',
    description:
      'Protects the trust in our data - definitions, lineage, quality rules, privacy controls and the enterprise data catalogue.',
    mission: 'If it carries our name, it is accurate, documented and compliant.',
    responsibilities: [
      'Define and monitor enterprise data quality rules and scorecards.',
      'Maintain the business glossary, metadata and end-to-end lineage.',
      'Embed privacy-by-design and data classification standards.',
      'Chair the data governance forum and issue remediation tracking.',
    ],
    portfolios: ['Risk & Compliance', 'Operations', 'Human Resources'],
    subTeams: [
      {
        name: 'Data Quality Assurance',
        description: 'Runs the enterprise data quality framework: rules, scorecards, exception handling and remediation.',
        focusAreas: ['DQ rules', 'Scorecards', 'Remediation'],
      },
      {
        name: 'Metadata & Data Catalogue',
        description: 'Curates the business glossary, technical metadata and lineage across the data estate.',
        focusAreas: ['Business glossary', 'Lineage', 'Catalogue adoption'],
      },
      {
        name: 'Data Privacy & Compliance',
        description: 'Owns classification, masking, retention and regulatory alignment for all data assets.',
        focusAreas: ['Classification', 'Masking', 'Retention policy'],
      },
    ],
  },
  {
    id: 'team-analytics',
    name: 'Advanced Analytics & Data Science',
    shortName: 'Analytics',
    icon: 'Psychology',
    description:
      'Applies statistical modelling, machine learning and experimentation to turn warehouse data into forward-looking insight.',
    mission: 'Move the organisation from what happened to what happens next.',
    responsibilities: [
      'Develop predictive and prescriptive models for business portfolios.',
      'Productionise models with monitoring, retraining and governance.',
      'Partner with business teams on experiment design and measurement.',
      'Share analytics techniques across the wider department.',
    ],
    portfolios: ['Retail Banking', 'Risk & Compliance', 'Marketing & Customer Experience', 'Digital Channels'],
    subTeams: [
      {
        name: 'Customer Analytics',
        description: 'Segmentation, lifetime value, churn and next-best-action models for customer-facing teams.',
        focusAreas: ['Segmentation', 'Churn models', 'Campaign analytics'],
      },
      {
        name: 'Risk & Fraud Analytics',
        description: 'Scorecards, early-warning indicators and anomaly detection supporting risk and compliance.',
        focusAreas: ['Scorecards', 'Anomaly detection', 'Early warning'],
      },
      {
        name: 'ML Engineering & MLOps',
        description: 'Builds the pipelines, feature store and monitoring that keep models running in production.',
        focusAreas: ['Feature store', 'Model monitoring', 'Deployment pipelines'],
      },
    ],
  },
  {
    id: 'team-platform',
    name: 'Platform, Architecture & Support',
    shortName: 'Platform',
    icon: 'Dns',
    description:
      'Keeps the data platform fast, available and secure - architecture standards, environments, releases and production support.',
    mission: 'A platform the whole department can build on with confidence.',
    responsibilities: [
      'Own platform architecture, capacity planning and performance tuning.',
      'Administer database, storage and compute environments.',
      'Run CI/CD, release management and environment provisioning.',
      'Provide production support and incident management for data services.',
    ],
    portfolios: ['Operations', 'Digital Channels', 'Finance & Treasury'],
    subTeams: [
      {
        name: 'Platform Engineering & DBA',
        description: 'Administers the warehouse platform, tuning performance, storage and capacity.',
        focusAreas: ['Performance tuning', 'Capacity', 'Database administration'],
      },
      {
        name: 'DevOps & Release Management',
        description: 'Automates build, test and deployment across all data environments.',
        focusAreas: ['CI/CD', 'Environments', 'Release governance'],
      },
      {
        name: 'Production Support & Service Desk',
        description: 'First line for data incidents, service requests and the daily batch health check.',
        focusAreas: ['Incident management', 'Batch monitoring', 'Service requests'],
      },
    ],
  },
];

const teams = TEAM_BLUEPRINT.map((team, index) => ({
  id: team.id,
  name: team.name,
  shortName: team.shortName,
  icon: team.icon,
  description: team.description,
  mission: team.mission,
  responsibilities: team.responsibilities,
  portfolios: team.portfolios,
  leadId: null,
  order: index + 1,
}));

const subTeams = [];
TEAM_BLUEPRINT.forEach((team) => {
  team.subTeams.forEach((sub, i) => {
    subTeams.push({
      id: `${team.id.replace('team-', 'sub-')}-${i + 1}`,
      teamId: team.id,
      name: sub.name,
      description: sub.description,
      focusAreas: sub.focusAreas,
      responsibilities: [
        `Deliver the ${sub.name.toLowerCase()} roadmap agreed with the ${team.shortName} team.`,
        'Maintain documentation, runbooks and handover notes for owned components.',
        'Support incident triage and root-cause analysis within the sub-team scope.',
      ],
      portfolios: pickMany(team.portfolios, Math.min(2, team.portfolios.length)),
      leadId: null,
    });
  });
});

// ---------------------------------------------------------------------------
// Employees
// ---------------------------------------------------------------------------
const FIRST_NAMES = [
  'Amina', 'Karim', 'Noor', 'Yousef', 'Salma', 'Tarek', 'Lina', 'Omar', 'Hana', 'Ziad',
  'Farah', 'Adam', 'Mariam', 'Hassan', 'Dina', 'Rami', 'Layla', 'Sami', 'Nadia', 'Fadi',
  'Rania', 'Bilal', 'Yasmin', 'Khaled', 'Sara', 'Mostafa', 'Reem', 'Ali', 'Malak', 'Sherif',
  'Jana', 'Hadi', 'Nour', 'Tamer', 'Aya', 'Wael', 'Habiba', 'Ihab', 'Menna', 'Ashraf',
];
const LAST_NAMES = [
  'Halabi', 'Fahmy', 'Rashid', 'Mansour', 'Darwish', 'Sabry', 'Nasser', 'Zaki', 'Farouk',
  'Bishara', 'Kamal', 'Aziz', 'Shaker', 'Gaber', 'Hilal', 'Morsi', 'Rifai', 'Selim',
  'Talaat', 'Yassin', 'Adel', 'Bakr', 'Ezzat', 'Ghanem', 'Hamdy', 'Ibrahim', 'Kassem',
  'Lotfy', 'Maher', 'Nabil', 'Osman', 'Qasim', 'Riad', 'Shafik', 'Tawfik', 'Wahba',
  'Younis', 'Zohdi', 'Amer', 'Botros',
];

const ROLE_BANDS = ['Head', 'Manager', 'Team Lead', 'Senior Specialist', 'Specialist', 'Analyst', 'Associate'];

const TITLES_BY_TEAM = {
  'team-engineering': ['Data Engineer', 'ETL Developer', 'Integration Engineer', 'Data Modeller', 'Streaming Engineer'],
  'team-bi': ['BI Developer', 'Reporting Analyst', 'Dashboard Designer', 'BI Consultant', 'Regulatory Reporting Analyst'],
  'team-governance': ['Data Governance Analyst', 'Data Quality Analyst', 'Metadata Steward', 'Privacy Analyst'],
  'team-analytics': ['Data Scientist', 'Analytics Consultant', 'ML Engineer', 'Quantitative Analyst'],
  'team-platform': ['Platform Engineer', 'Database Administrator', 'DevOps Engineer', 'Production Support Engineer'],
};

const EXPERTISE_POOL = [
  'SQL Optimisation', 'Data Modelling', 'ETL Design', 'Apache Spark', 'Kafka Streaming',
  'Python', 'Power BI', 'Tableau', 'Data Vault 2.0', 'Dimensional Modelling',
  'Airflow Orchestration', 'Data Quality Frameworks', 'Metadata Management', 'Machine Learning',
  'Feature Engineering', 'Regulatory Reporting', 'Cloud Data Platforms', 'CI/CD Automation',
  'Performance Tuning', 'Incident Management', 'Data Privacy', 'Statistical Modelling',
  'Dashboard Design', 'Requirements Analysis', 'Stakeholder Management',
];

const SKILL_POOL = [
  'SQL', 'Python', 'Spark', 'Kafka', 'Power BI', 'Airflow', 'dbt', 'Docker', 'Git',
  'Data Modelling', 'Statistics', 'Communication', 'Problem Solving', 'Mentoring',
];

const HOBBY_POOL = [
  'Football', 'Chess', 'Photography', 'Hiking', 'Cooking', 'Reading', 'Cycling', 'Painting',
  'Running', 'Board games', 'Guitar', 'Swimming', 'Gardening', 'Calligraphy', 'Travel',
  'Podcasting', 'Baking', 'Astronomy', 'Table tennis', 'Volunteering',
];

const INTEREST_POOL = [
  'Open-source data tooling', 'AI ethics', 'Mentoring juniors', 'Data storytelling',
  'Sustainability', 'FinTech trends', 'Public speaking', 'Community building',
  'Product thinking', 'Automation', 'Design systems', 'Behavioural economics',
];

const LANGUAGE_POOL = ['Arabic', 'English', 'French', 'German', 'Spanish'];

const FUN_FACT_POOL = [
  'Has visited 14 countries and counting.',
  'Can solve a Rubik\'s cube in under a minute.',
  'Once wrote a SQL query that ran for three days - and fixed it in ten minutes.',
  'Bakes the department\'s birthday cakes.',
  'Plays in a weekend five-a-side league.',
  'Collects vintage keyboards.',
  'Speaks three languages and is learning a fourth.',
  'Runs a small photography account with 5k followers.',
  'Has never missed a Monday stand-up in four years.',
  'Makes the best karkade in the office kitchen.',
];

const QUOTE_POOL = [
  'Good data is a team sport.',
  'If it is not documented, it does not exist.',
  'Automate the boring, focus on the valuable.',
  'Ask the question behind the question.',
  'Small improvements, shipped often.',
  'Trust is built one clean load at a time.',
];

const employees = [];
const employeeCount = 40;
let nameIndex = 0;

subTeams.forEach((sub, subIndex) => {
  // Between 2 and 3 people per sub-team, giving ~40 in total.
  const headcount = subIndex < 10 ? 3 : 2;
  for (let i = 0; i < headcount && employees.length < employeeCount; i += 1) {
    const first = FIRST_NAMES[nameIndex % FIRST_NAMES.length];
    const last = LAST_NAMES[(nameIndex * 7 + 3) % LAST_NAMES.length];
    nameIndex += 1;

    const isLead = i === 0;
    const role = isLead ? 'Team Lead' : pick(ROLE_BANDS.slice(3));
    const titleBase = pick(TITLES_BY_TEAM[sub.teamId]);
    const jobTitle = isLead ? `${sub.name} Lead` : `${role === 'Senior Specialist' ? 'Senior ' : ''}${titleBase}`;
    const id = `emp-${String(employees.length + 1).padStart(3, '0')}`;
    const fullName = `${first} ${last}`;

    employees.push({
      id,
      fullName,
      jobTitle,
      role,
      teamId: sub.teamId,
      subTeamId: sub.id,
      email: `${first.toLowerCase()}.${last.toLowerCase()}@example.com`,
      extension: `${int(1000, 9999)}`,
      location: 'PLACEHOLDER - building / floor',
      joinedDate: isoDate(int(2013, 2024), int(1, 12), int(1, 28)),
      photo: null,
      bio: `${first} works in the ${sub.name} sub-team, where the focus is ${sub.focusAreas
        .map((f) => f.toLowerCase())
        .join(', ')}. ${isLead ? 'Leads the sub-team and its delivery roadmap.' : 'Contributes across delivery, support and continuous improvement.'}`,
      quote: pick(QUOTE_POOL),
      responsibilities: [
        `Deliver ${sub.focusAreas[0].toLowerCase()} work for the ${sub.name} sub-team.`,
        'Review peer work and maintain technical documentation.',
        isLead
          ? 'Plan the sub-team backlog and represent it in departmental forums.'
          : 'Support incident triage and root-cause analysis on owned components.',
      ],
      expertise: pickMany(EXPERTISE_POOL, int(3, 5)),
      skills: pickMany(SKILL_POOL, 5).map((name) => ({ name, level: int(60, 96) })),
      hobbies: pickMany(HOBBY_POOL, int(2, 4)),
      interests: pickMany(INTEREST_POOL, int(2, 3)),
      languages: pickMany(LANGUAGE_POOL, int(2, 3)),
      achievements: [
        `Completed ${int(2, 9)} delivery milestones in the current roadmap.`,
        'PLACEHOLDER - add a real achievement for this colleague.',
      ],
      awards: rand() > 0.55
        ? [
            {
              title: pick([
                'Employee of the Quarter',
                'Innovation Award',
                'Collaboration Award',
                'Delivery Excellence Award',
              ]),
              issuer: 'Data Warehouse Department',
              year: String(int(2023, 2026)),
            },
          ]
        : [],
      initiativeIds: [],
      funFacts: pickMany(FUN_FACT_POOL, int(1, 3)),
      featured: false,
    });
  }
});

// Attach leads to teams and sub-teams.
subTeams.forEach((sub) => {
  const lead = employees.find((e) => e.subTeamId === sub.id && e.role === 'Team Lead');
  sub.leadId = lead ? lead.id : null;
});
// The first person becomes the department head, so they are excluded from the
// team-manager promotion below.
const headEmployee = employees[0];
headEmployee.role = 'Head';
headEmployee.jobTitle = 'Head of Data Warehouse Department';
headEmployee.joinedDate = isoDate(2013, 4, 15);
headEmployee.bio =
  'Leads the Data Warehouse Department across its five main teams and fifteen sub-teams, with a focus on trusted data, delivery discipline and building a department people are proud to work in.';
headEmployee.responsibilities = [
  'Set the strategy and roadmap for the Data Warehouse Department.',
  'Represent the department with business portfolios and executive stakeholders.',
  'Grow the team through mentoring, hiring and career development.',
];

// The head no longer leads a sub-team: promote the next person in that one.
subTeams
  .filter((sub) => sub.leadId === headEmployee.id)
  .forEach((sub) => {
    const successor = employees.find((e) => e.subTeamId === sub.id && e.id !== headEmployee.id);
    if (successor) {
      successor.role = 'Team Lead';
      successor.jobTitle = `${sub.name} Lead`;
      sub.leadId = successor.id;
    } else {
      sub.leadId = null;
    }
  });

teams.forEach((team) => {
  const candidate = employees.find(
    (e) => e.teamId === team.id && e.role === 'Team Lead' && e.id !== headEmployee.id,
  );
  if (candidate) {
    candidate.role = 'Manager';
    candidate.jobTitle = `${team.shortName} Team Manager`;
    team.leadId = candidate.id;
  }
});

// Feature eight people on the home page and directory.
[0, 4, 9, 14, 19, 24, 30, 35].forEach((i) => {
  if (employees[i]) employees[i].featured = true;
});

// Department leadership: the five team managers plus a department head.
department.leadershipIds = teams.map((t) => t.leadId).filter(Boolean);
department.headId = headEmployee.id;

// ---------------------------------------------------------------------------
// Initiatives
// ---------------------------------------------------------------------------
const INITIATIVE_BLUEPRINT = [
  ['Pipeline Automation Programme', 'Automation', 'team-engineering', 'Completed', 'Replace manual load scheduling with fully orchestrated, self-healing pipelines.'],
  ['Real-Time Customer Events Platform', 'Automation', 'team-engineering', 'In Progress', 'Stand up an event-streaming backbone for near real-time customer data.'],
  ['Warehouse Model Refresh', 'Governance', 'team-engineering', 'In Progress', 'Modernise the core warehouse model to a data-vault foundation.'],
  ['Executive Dashboard Redesign', 'Analytics', 'team-bi', 'Completed', 'Rebuild the executive scorecard around a certified metric layer.'],
  ['Regulatory Reporting Acceleration', 'Performance', 'team-bi', 'In Progress', 'Cut the regulatory submission cycle time by automating reconciliation.'],
  ['Self-Service BI Academy', 'Culture', 'team-bi', 'In Progress', 'Train business users to build their own certified reports safely.'],
  ['Enterprise Data Quality Framework', 'Data Quality', 'team-governance', 'Completed', 'Introduce a single rules engine and scorecard for data quality.'],
  ['Data Catalogue Adoption Drive', 'Governance', 'team-governance', 'In Progress', 'Get every critical data element documented and discoverable.'],
  ['Privacy by Design Rollout', 'Governance', 'team-governance', 'Planned', 'Embed classification and masking into every new data product.'],
  ['Customer Churn Early Warning', 'Analytics', 'team-analytics', 'Completed', 'Predict at-risk customers early enough for retention teams to act.'],
  ['Fraud Anomaly Detection Uplift', 'Analytics', 'team-analytics', 'In Progress', 'Improve detection rates while reducing false positives.'],
  ['Feature Store Foundation', 'Automation', 'team-analytics', 'Planned', 'Give data scientists a shared, governed feature store.'],
  ['Platform Performance Tuning', 'Performance', 'team-platform', 'Completed', 'Reduce nightly batch runtime and stabilise the load window.'],
  ['Zero-Downtime Release Pipeline', 'Automation', 'team-platform', 'In Progress', 'Ship data changes without taking reporting offline.'],
  ['Production Support Playbooks', 'Culture', 'team-platform', 'Completed', 'Document every recurring incident with a tested runbook.'],
];

const IMPACT_LABELS = [
  ['Runtime saved', 'hours / month'],
  ['Manual effort removed', 'hours / week'],
  ['Reports migrated', 'reports'],
  ['Data quality score', '%'],
  ['Incidents avoided', 'per quarter'],
  ['Users enabled', 'colleagues'],
];

const initiatives = INITIATIVE_BLUEPRINT.map(([title, category, teamId, status, objective], index) => {
  const teamMembers = employees.filter((e) => e.teamId === teamId);
  const contributors = pickMany(teamMembers, int(3, 5)).map((e) => e.id);
  const teamSubTeams = subTeams.filter((s) => s.teamId === teamId);
  const startYear = 2024 + (index % 2);
  return {
    id: `ini-${String(index + 1).padStart(3, '0')}`,
    title,
    summary: `${objective} PLACEHOLDER - replace with the department's own initiative summary.`,
    description: `This initiative was raised by the ${teams.find((t) => t.id === teamId).name} team to address a recurring pain point in day-to-day delivery. The team ran a short discovery, agreed the target outcome with stakeholders, then delivered in increments so value landed early.\n\nPLACEHOLDER - replace this description with the real background, approach and lessons learned.`,
    category,
    teamIds: [teamId],
    subTeamIds: teamSubTeams.length ? pickMany(teamSubTeams, int(1, Math.min(2, teamSubTeams.length))).map((s) => s.id) : [],
    contributorIds: contributors,
    startDate: isoDate(startYear, int(1, 8), int(1, 28)),
    endDate: isoDate(startYear + 1, int(1, 11), int(1, 28)),
    objective,
    impact: pickMany(IMPACT_LABELS, 3).map(([label, unit]) => ({
      label,
      value: `${int(12, 480)} ${unit}`,
    })),
    status,
    image: null,
    tags: pickMany(['automation', 'quality', 'performance', 'self-service', 'governance', 'ml'], 3),
    relatedAchievementIds: [],
    attachment: null,
    featured: index === 1 || index === 6,
  };
});

// Link initiatives back onto contributor profiles.
initiatives.forEach((ini) => {
  ini.contributorIds.forEach((empId) => {
    const emp = employees.find((e) => e.id === empId);
    if (emp && emp.initiativeIds.length < 4) emp.initiativeIds.push(ini.id);
  });
});

// ---------------------------------------------------------------------------
// Achievements & awards
// ---------------------------------------------------------------------------
const ACHIEVEMENT_BLUEPRINT = [
  ['Group Data Excellence Award', 'Award', 'Recognised group-wide for the enterprise data quality framework.', 'team-governance', 'Group'],
  ['Best Internal Innovation', 'Award', 'Voted best internal innovation of the year by the technology community.', 'team-engineering', 'Group'],
  ['Zero Regulatory Findings', 'Milestone', 'A full reporting cycle closed with no regulatory findings raised.', 'team-bi', 'Department'],
  ['99.9% Batch Availability', 'Milestone', 'Twelve consecutive months above the batch availability target.', 'team-platform', 'Department'],
  ['Data Catalogue 1000 Assets', 'Milestone', 'One thousand critical data assets fully documented and certified.', 'team-governance', 'Department'],
  ['Analytics Model of the Year', 'Award', 'Churn early-warning model recognised for measurable business impact.', 'team-analytics', 'Group'],
  ['Cloud Platform Certification', 'Certification', 'Eight engineers certified on the enterprise cloud data platform.', 'team-platform', 'External'],
  ['Team Collaboration Award', 'Team Achievement', 'Cross-team delivery of the executive dashboard redesign.', 'team-bi', 'Department'],
  ['Employee Recognition - Q1', 'Employee Recognition', 'Quarterly recognition for outstanding individual contribution.', 'team-engineering', 'Department'],
  ['Employee Recognition - Q2', 'Employee Recognition', 'Quarterly recognition for outstanding individual contribution.', 'team-analytics', 'Department'],
  ['Service Desk Satisfaction 4.8/5', 'Milestone', 'Highest ever internal satisfaction score for data support.', 'team-platform', 'Department'],
  ['Green Data Initiative', 'Award', 'Recognised for reducing compute footprint across the warehouse.', 'team-engineering', 'External'],
];

const ACHIEVEMENT_ICONS = ['EmojiEvents', 'MilitaryTech', 'WorkspacePremium', 'Verified', 'Star', 'Diamond'];

// Which Achievements page section each category defaults into.
const CATEGORY_TO_SCOPE = {
  Milestone: 'Department',
  'Employee Recognition': 'Employee',
  'Team Achievement': 'Team',
  Award: 'Team',
  Certification: 'Employee',
};

const achievements = ACHIEVEMENT_BLUEPRINT.map(([title, category, description, teamId, level], index) => {
  const teamMembers = employees.filter((e) => e.teamId === teamId);
  return {
    id: `ach-${String(index + 1).padStart(3, '0')}`,
    title,
    description: `${description} PLACEHOLDER - add the department's own supporting detail.`,
    category,
    scope: CATEGORY_TO_SCOPE[category] ?? 'Team',
    date: isoDate(2025 + (index % 2), int(1, 12), int(1, 28)),
    teamIds: [teamId],
    subTeamIds: [],
    employeeIds: pickMany(teamMembers, int(1, 3)).map((e) => e.id),
    images: [],
    issuer: level === 'External' ? 'PLACEHOLDER - external body' : 'Data Warehouse Department',
    level,
    icon: ACHIEVEMENT_ICONS[index % ACHIEVEMENT_ICONS.length],
    featured: index < 3,
  };
});

// ---------------------------------------------------------------------------
// Announcements & events
// ---------------------------------------------------------------------------
const ANNOUNCEMENT_BLUEPRINT = [
  ['Q3 Department Town Hall', 'Event', 'Join the whole department for the quarterly update, roadmap review and recognition awards.'],
  ['New Data Catalogue Release', 'Release', 'Version 2 of the enterprise data catalogue is live with improved lineage and search.'],
  ['Updated Data Classification Policy', 'Policy', 'The refreshed classification policy takes effect from the start of next month.'],
  ['Welcome to Our New Joiners', 'Celebration', 'Five colleagues joined the department this quarter across three teams.'],
  ['Advanced SQL Training Series', 'Training', 'A six-week internal training series open to every member of the department.'],
  ['Batch Window Change Notice', 'Update', 'The nightly batch window moves by 30 minutes from the first of next month.'],
  ['Innovation Day 2026', 'Event', 'A full day to prototype ideas that make our data work better. Teams of up to four.'],
  ['Self-Service BI Office Hours', 'Training', 'Weekly drop-in sessions for anyone building their own reports.'],
  ['Data Quality Scorecard Refresh', 'Release', 'Scorecards now refresh twice daily with new drill-through to failing rules.'],
  ['Department Away Day Photos', 'Celebration', 'Photos from the away day are now available in the portal gallery.'],
];

const announcements = ANNOUNCEMENT_BLUEPRINT.map(([title, category, summary], index) => {
  const author = pick(employees.filter((e) => ['Head', 'Manager', 'Team Lead'].includes(e.role)));
  const isEvent = category === 'Event' || category === 'Training';
  const date = isoDate(2026, 8 - Math.floor(index / 2), int(1, 28));
  return {
    id: `ann-${String(index + 1).padStart(3, '0')}`,
    title,
    date,
    category,
    authorId: author?.id ?? employees[0].id,
    summary,
    content: `${summary}\n\nPLACEHOLDER - replace this body text with the full announcement, including any actions colleagues need to take and who to contact with questions.`,
    image: null,
    teamId: pick(teams).id,
    attachments: index % 4 === 0
      ? [{ name: 'PLACEHOLDER-attachment.pdf', url: '#', size: '—' }]
      : [],
    pinned: index === 0,
    featured: index === 0,
    eventDate: isEvent ? isoDate(2026, 9 + (index % 3), int(1, 28)) : null,
    eventLocation: isEvent ? 'PLACEHOLDER - room / link' : null,
  };
});

// ---------------------------------------------------------------------------
// Success stories
// ---------------------------------------------------------------------------
const STORY_BLUEPRINT = [
  ['From Three Days to Three Hours', 'Project', 'team-engineering'],
  ['One Number, One Definition', 'Project', 'team-bi'],
  ['How We Reached a 98% Data Quality Score', 'Team', 'team-governance'],
  ['Catching Churn Before It Happens', 'Project', 'team-analytics'],
  ['A Night Shift That Finally Sleeps', 'Team', 'team-platform'],
  ['From Analyst to Data Engineer in 18 Months', 'Employee', 'team-engineering'],
  ['The Report Nobody Had to Ask For', 'Project', 'team-bi'],
  ['Rebuilding Trust With Finance', 'Team', 'team-governance'],
];

const successStories = STORY_BLUEPRINT.map(([title, type, teamId], index) => {
  const teamMembers = employees.filter((e) => e.teamId === teamId);
  return {
    id: `sto-${String(index + 1).padStart(3, '0')}`,
    title,
    coverImage: null,
    summary: `PLACEHOLDER - a one paragraph summary of "${title}", written for colleagues outside the team.`,
    challenge:
      'PLACEHOLDER - describe the problem as it was experienced by the business: what was slow, unreliable or unclear, and what it cost the organisation.',
    solution:
      'PLACEHOLDER - describe what the team actually built or changed, the approach taken and the decisions that mattered most.',
    result:
      'PLACEHOLDER - describe the measurable outcome and how the business area responded to it.',
    impact: pickMany(IMPACT_LABELS, 3).map(([label, unit]) => ({ label, value: `${int(15, 320)} ${unit}` })),
    keyAchievements: [
      'PLACEHOLDER - key achievement one.',
      'PLACEHOLDER - key achievement two.',
      'PLACEHOLDER - key achievement three.',
    ],
    contributorIds: pickMany(teamMembers, int(2, 4)).map((e) => e.id),
    teamId,
    type,
    date: isoDate(2025 + (index % 2), int(1, 12), int(1, 28)),
    featured: index === 0,
  };
});

// ---------------------------------------------------------------------------
// Competitions
// ---------------------------------------------------------------------------
const COMPETITION_BLUEPRINT = [
  ['SQL Sprint Challenge', 'Active', 'Technical', 'Solve a set of increasingly difficult SQL problems against the clock.'],
  ['Dashboard Design Cup', 'Active', 'Design', 'Redesign a real departmental dashboard and pitch it to a judging panel.'],
  ['Data Quality Bug Hunt', 'Active', 'Quality', 'Find and document the highest-impact data quality issues across the estate.'],
  ['Automation Idea Marathon', 'Upcoming', 'Innovation', 'Pitch an idea that removes manual work from a recurring process.'],
  ['Warehouse Trivia Night', 'Upcoming', 'Social', 'A light-hearted quiz on data, the department and general knowledge.'],
  ['Hack the Batch', 'Completed', 'Technical', 'A two-day hackathon to shorten the nightly batch window.'],
  ['Best Runbook Award', 'Completed', 'Quality', 'Write the clearest, most useful production support runbook.'],
  ['Storytelling With Data', 'Completed', 'Design', 'Turn one dataset into the most compelling five-minute story.'],
];

const PRIZE_SETS = [
  [
    { rank: 1, title: 'PLACEHOLDER - first prize', description: 'PLACEHOLDER - describe the first place prize.' },
    { rank: 2, title: 'PLACEHOLDER - second prize', description: 'PLACEHOLDER - describe the second place prize.' },
    { rank: 3, title: 'PLACEHOLDER - third prize', description: 'PLACEHOLDER - describe the third place prize.' },
  ],
];

const competitions = COMPETITION_BLUEPRINT.map(([name, status, category, summary], index) => {
  const participants = pickMany(employees, int(10, 22)).map((e) => e.id);
  const startOffsetMonth = status === 'Completed' ? -6 : status === 'Active' ? -1 : 2;
  const startDate = isoDate(2026, Math.max(1, Math.min(12, 8 + startOffsetMonth)), int(1, 20));
  const endDate = isoDate(2026, Math.max(1, Math.min(12, 8 + startOffsetMonth + 2)), int(1, 28));

  return {
    id: `cmp-${String(index + 1).padStart(3, '0')}`,
    name,
    summary,
    description: `${summary}\n\nPLACEHOLDER - replace with the full competition brief: background, judging criteria, and what participants should prepare.`,
    category,
    startDate,
    endDate,
    status,
    rules: [
      'Open to all members of the Data Warehouse Department.',
      'Individual entries unless the brief states otherwise.',
      'Submissions must use approved, non-production data only.',
      'The judging panel\'s decision is final.',
      'PLACEHOLDER - add any department-specific rule here.',
    ],
    eligibility: 'All permanent and contract colleagues within the Data Warehouse Department.',
    howToParticipate: [
      'Read the competition brief and the rules in full.',
      'Register your entry using the Participate Now button on this page.',
      'Prepare and submit your entry as a zip file before the closing date.',
      'Attend the results session to see the winners.',
    ],
    prizes: PRIZE_SETS[0],
    participantIds: participants,
    winnerIds: status === 'Completed' ? pickMany(participants, Math.min(3, participants.length)) : [],
    image: null,
    attachment: null,
    featured: index === 0,
  };
});

// ---------------------------------------------------------------------------
// Gallery
// ---------------------------------------------------------------------------
const GALLERY_EVENTS = [
  ['Department Away Day', 'Team Activities'],
  ['Annual Awards Night', 'Awards'],
  ['Innovation Day', 'Events'],
  ['Ramadan Iftar', 'Celebrations'],
  ['Hack the Batch', 'Competitions'],
  ['New Joiner Welcome', 'Celebrations'],
  ['Town Hall', 'Events'],
  ['Volunteering Day', 'Team Activities'],
];

const gallery = [];
GALLERY_EVENTS.forEach(([event, category], eventIndex) => {
  const shots = 3;
  for (let i = 0; i < shots; i += 1) {
    gallery.push({
      id: `gal-${String(gallery.length + 1).padStart(3, '0')}`,
      title: `${event} - photo ${i + 1}`,
      category,
      event,
      date: isoDate(2025 + (eventIndex % 2), int(1, 12), int(1, 28)),
      image: null,
      caption: 'PLACEHOLDER - upload the real photo and caption through the admin panel.',
      teamId: eventIndex % 2 === 0 ? pick(teams).id : null,
    });
  }
});

// ---------------------------------------------------------------------------
// Recognition wall
// ---------------------------------------------------------------------------
const RECOGNITION_MESSAGES = [
  'Stepped in during a critical incident and stayed until the batch was clean. Calm, clear and completely reliable.',
  'Took the time to walk three colleagues through the new model - patience that made the whole team faster.',
  'Turned a vague request into a dashboard the business now uses every single morning.',
  'Spotted a data quality issue nobody had noticed and fixed it before it reached a report.',
  'Volunteered to document the hardest part of the pipeline so the next person would not struggle.',
  'Made the new joiners feel at home from day one.',
  'Rebuilt a report in two days that had been stuck for two months.',
  'Consistently the first to offer help and the last to take credit.',
];

const recognition = [];
recognition.push({
  id: 'rec-001',
  type: 'Employee of the Quarter',
  title: 'Employee of the Quarter - Q2 2026',
  message: 'Recognised for outstanding delivery, mentoring and calm leadership through a demanding quarter.',
  fromEmployeeId: employees[0].id,
  toEmployeeId: employees[6]?.id ?? employees[1].id,
  toTeamId: null,
  date: isoDate(2026, 7, 2),
  quarter: 'Q2 2026',
  featured: true,
});
recognition.push({
  id: 'rec-002',
  type: 'Team of the Quarter',
  title: 'Team of the Quarter - Q2 2026',
  message: 'For delivering the data quality framework ahead of schedule and lifting scores across every portfolio.',
  fromEmployeeId: employees[0].id,
  toEmployeeId: null,
  toTeamId: 'team-governance',
  date: isoDate(2026, 7, 2),
  quarter: 'Q2 2026',
  featured: true,
});

RECOGNITION_MESSAGES.forEach((message, index) => {
  const from = pick(employees);
  let to = pick(employees);
  if (to.id === from.id) to = employees[(employees.indexOf(to) + 1) % employees.length];
  recognition.push({
    id: `rec-${String(index + 3).padStart(3, '0')}`,
    type: 'Appreciation',
    title: 'Thank you',
    message,
    fromEmployeeId: from.id,
    toEmployeeId: to.id,
    toTeamId: null,
    date: isoDate(2026, int(3, 8), int(1, 28)),
    quarter: 'Q2 2026',
    featured: false,
  });
});

// Historic quarters for the recognition history section.
[['Q1 2026', 5], ['Q4 2025', 12], ['Q3 2025', 20]].forEach(([quarter, empIndex], i) => {
  recognition.push({
    id: `rec-1${String(i + 1).padStart(2, '0')}`,
    type: 'Employee of the Quarter',
    title: `Employee of the Quarter - ${quarter}`,
    message: 'PLACEHOLDER - citation for this quarter.',
    fromEmployeeId: employees[0].id,
    toEmployeeId: employees[empIndex]?.id ?? employees[1].id,
    toTeamId: null,
    date: isoDate(2026 - (i > 0 ? 1 : 0), i === 0 ? 4 : 10 - i * 3, 2),
    quarter,
    featured: false,
  });
});

// ---------------------------------------------------------------------------
// Submissions (contact form inbox) - starts empty apart from one example.
// ---------------------------------------------------------------------------
const submissions = [
  {
    id: 'sub-001',
    type: 'Idea',
    name: 'PLACEHOLDER - sample submission',
    email: 'placeholder@example.com',
    subject: 'Example idea submitted through the Get Involved form',
    message:
      'This is a sample record so the admin inbox is not empty. Delete it once real submissions start arriving.',
    competitionId: null,
    employeeId: null,
    attachment: null,
    createdAt: new Date(Date.UTC(2026, 7, 10, 9, 30)).toISOString(),
    status: 'New',
  },
];

// ---------------------------------------------------------------------------
// Write everything out
// ---------------------------------------------------------------------------
const files = {
  'department.json': department,
  'teams.json': teams,
  'sub-teams.json': subTeams,
  'employees.json': employees,
  'initiatives.json': initiatives,
  'achievements.json': achievements,
  'announcements.json': announcements,
  'success-stories.json': successStories,
  'competitions.json': competitions,
  'gallery.json': gallery,
  'recognition.json': recognition,
  'submissions.json': submissions,
};

await fs.mkdir(DATA_DIR, { recursive: true });
for (const [name, payload] of Object.entries(files)) {
  await fs.writeFile(path.join(DATA_DIR, name), `${JSON.stringify(payload, null, 2)}\n`, 'utf8');
}

console.log('Seed complete:');
console.log(`  teams            ${teams.length}`);
console.log(`  sub-teams        ${subTeams.length}`);
console.log(`  employees        ${employees.length}`);
console.log(`  initiatives      ${initiatives.length}`);
console.log(`  achievements     ${achievements.length}`);
console.log(`  announcements    ${announcements.length}`);
console.log(`  success stories  ${successStories.length}`);
console.log(`  competitions     ${competitions.length}`);
console.log(`  gallery items    ${gallery.length}`);
console.log(`  recognitions     ${recognition.length}`);
