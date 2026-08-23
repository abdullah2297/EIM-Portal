/**
 * Shared JSDoc type definitions for the whole portal.
 *
 * The project is written in JavaScript, so these typedefs are the contract:
 * editors and `checkJs` tooling pick them up, and every service / component
 * references them in its own JSDoc.
 *
 * @module lib/types
 */

/**
 * @typedef {Object} SkillLevel
 * @property {string} name
 * @property {number} level 0-100
 */

/**
 * @typedef {Object} AwardRef
 * @property {string} title
 * @property {string} issuer
 * @property {string} year
 */

/**
 * @typedef {Object} ImpactMetric
 * @property {string} label
 * @property {string} value
 */

/**
 * @typedef {Object} Attachment
 * @property {string} name
 * @property {string} url
 * @property {string} size
 */

/**
 * @typedef {Object} Team
 * @property {string} id
 * @property {string} name
 * @property {string} shortName
 * @property {string} icon Material icon name
 * @property {string} description
 * @property {string} mission
 * @property {string[]} responsibilities
 * @property {string[]} portfolios
 * @property {string|null} leadId
 * @property {number} order
 * @property {boolean} featured
 */

/**
 * @typedef {Object} SubTeam
 * @property {string} id
 * @property {string} teamId
 * @property {string} name
 * @property {string} description
 * @property {string[]} responsibilities
 * @property {string[]} portfolios
 * @property {string[]} focusAreas
 * @property {string|null} leadId
 * @property {boolean} featured
 */

/**
 * @typedef {Object} Employee
 * @property {string} id
 * @property {string} fullName
 * @property {string} jobTitle
 * @property {string} teamId
 * @property {string} subTeamId
 * @property {string} role Seniority band used by the role filter
 * @property {string} email
 * @property {string} extension
 * @property {string} location
 * @property {string} joinedDate ISO date
 * @property {string|null} photo Null renders the initials avatar placeholder
 * @property {string} bio
 * @property {string} quote
 * @property {string[]} responsibilities
 * @property {string[]} expertise
 * @property {SkillLevel[]} skills
 * @property {string[]} hobbies
 * @property {string[]} interests
 * @property {string[]} achievements
 * @property {AwardRef[]} awards
 * @property {string[]} initiativeIds
 * @property {string[]} funFacts
 * @property {string[]} languages
 * @property {boolean} featured
 */

/**
 * @typedef {Object} Initiative
 * @property {string} id
 * @property {string} title
 * @property {string} summary
 * @property {string} description
 * @property {string} category
 * @property {string[]} teamIds
 * @property {string[]} subTeamIds
 * @property {string[]} contributorIds
 * @property {string} startDate
 * @property {string} endDate
 * @property {string} objective
 * @property {ImpactMetric[]} impact
 * @property {string} status
 * @property {string|null} image
 * @property {string[]} tags
 * @property {string[]} relatedAchievementIds
 * @property {Attachment|null} attachment Optional zip explaining the initiative in detail
 * @property {boolean} featured
 */

/**
 * @typedef {Object} Achievement
 * @property {string} id
 * @property {string} title
 * @property {string} description
 * @property {string} category
 * @property {string} scope Department | Team | Sub-Team | Employee - which Achievements page section this belongs to
 * @property {string} date
 * @property {string[]} teamIds
 * @property {string[]} subTeamIds
 * @property {string[]} employeeIds
 * @property {string[]} images Up to 3 image URLs
 * @property {string} issuer
 * @property {string} level
 * @property {string} icon
 * @property {boolean} featured
 */

/**
 * @typedef {Object} Announcement
 * @property {string} id
 * @property {string} title
 * @property {string} date
 * @property {string} category
 * @property {string} authorId
 * @property {string} summary
 * @property {string} content
 * @property {string|null} image
 * @property {string|null} teamId
 * @property {Attachment[]} attachments
 * @property {boolean} pinned
 * @property {boolean} featured
 * @property {string|null} eventDate Set when the announcement is an event
 * @property {string|null} eventLocation
 */

/**
 * @typedef {Object} SuccessStory
 * @property {string} id
 * @property {string} title
 * @property {string|null} coverImage
 * @property {string} summary
 * @property {string} challenge
 * @property {string} solution
 * @property {string} result
 * @property {ImpactMetric[]} impact
 * @property {string[]} keyAchievements
 * @property {string[]} contributorIds
 * @property {string} teamId
 * @property {string} type Project | Team | Employee
 * @property {string} date
 * @property {boolean} featured
 */

/**
 * @typedef {Object} Prize
 * @property {number} rank
 * @property {string} title
 * @property {string} description
 */

/**
 * @typedef {Object} Competition
 * @property {string} id
 * @property {string} name
 * @property {string} summary
 * @property {string} description
 * @property {string} category
 * @property {string} startDate
 * @property {string} endDate
 * @property {string} status Upcoming | Active | Completed
 * @property {string[]} rules
 * @property {string} eligibility
 * @property {string[]} howToParticipate
 * @property {Prize[]} prizes
 * @property {string[]} participantIds
 * @property {string[]} winnerIds
 * @property {string|null} image
 * @property {Attachment|null} attachment Optional zip with the brief, datasets or supporting files
 * @property {boolean} featured
 */

/**
 * @typedef {Object} GalleryItem
 * @property {string} id
 * @property {string} title
 * @property {string} category
 * @property {string} event
 * @property {string} date
 * @property {string|null} image
 * @property {string} caption
 * @property {string|null} teamId
 */

/**
 * @typedef {Object} Recognition
 * @property {string} id
 * @property {string} type
 * @property {string} title
 * @property {string} message
 * @property {string|null} fromEmployeeId
 * @property {string|null} toEmployeeId
 * @property {string|null} toTeamId
 * @property {string} date
 * @property {string} quarter
 * @property {boolean} featured
 */

/**
 * @typedef {Object} Submission
 * @property {string} id
 * @property {string} type
 * @property {string} name
 * @property {string} email
 * @property {string} subject
 * @property {string} message
 * @property {string|null} competitionId
 * @property {string|null} employeeId
 * @property {Attachment|null} attachment The entry file submitted for a competition, if any
 * @property {string} createdAt
 * @property {string} status
 */

/**
 * @typedef {Object} ApiEnvelope
 * @property {boolean} success
 * @property {*} [data]
 * @property {{ message: string, code: string, details?: * }} [error]
 * @property {{ total: number, page: number, pageSize: number, totalPages: number }} [meta]
 */

export {};
