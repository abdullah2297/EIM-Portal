import { createResourceService } from './resourceService';
import { http } from './httpClient';
import { RESOURCES } from '@/lib/constants';
import { buildQuery } from '@/lib/query';

/**
 * The application's service layer.
 *
 * Components import from here and never touch `fetch` or a URL directly.
 */

export const teamsService = createResourceService(RESOURCES.teams);
export const subTeamsService = createResourceService(RESOURCES.subTeams);
export const employeesService = createResourceService(RESOURCES.employees);
export const trainingTypesService = createResourceService(RESOURCES.trainingTypes);
export const trainingCategoriesService = createResourceService(RESOURCES.trainingCategories);
export const trainingsService = createResourceService(RESOURCES.trainings);
export const trainingRegistrationsService = createResourceService(RESOURCES.trainingRegistrations);
export const initiativesService = createResourceService(RESOURCES.initiatives);
export const achievementsService = createResourceService(RESOURCES.achievements);
export const announcementsService = createResourceService(RESOURCES.announcements);
export const successStoriesService = createResourceService(RESOURCES.successStories);
export const competitionsService = createResourceService(RESOURCES.competitions);
export const galleryService = createResourceService(RESOURCES.gallery);
export const recognitionService = createResourceService(RESOURCES.recognition);
export const submissionsService = createResourceService(RESOURCES.submissions);

/** Resource name -> service, used by the schema-driven admin screens. */
export const SERVICE_BY_RESOURCE = {
  [RESOURCES.teams]: teamsService,
  [RESOURCES.subTeams]: subTeamsService,
  [RESOURCES.employees]: employeesService,
  [RESOURCES.trainingTypes]: trainingTypesService,
  [RESOURCES.trainingCategories]: trainingCategoriesService,
  [RESOURCES.trainings]: trainingsService,
  [RESOURCES.trainingRegistrations]: trainingRegistrationsService,
  [RESOURCES.initiatives]: initiativesService,
  [RESOURCES.achievements]: achievementsService,
  [RESOURCES.announcements]: announcementsService,
  [RESOURCES.successStories]: successStoriesService,
  [RESOURCES.competitions]: competitionsService,
  [RESOURCES.gallery]: galleryService,
  [RESOURCES.recognition]: recognitionService,
  [RESOURCES.submissions]: submissionsService,
};

export const departmentService = {
  async get() {
    const { data } = await http.get(`/api/${RESOURCES.department}`);
    return data;
  },
  async update(payload) {
    const { data } = await http.post(`/api/${RESOURCES.department}`, payload);
    return data;
  },
};

export const statsService = {
  async get() {
    const { data } = await http.get('/api/stats');
    return data;
  },
};

export const uploadsService = {
  /**
   * @param {File} file
   * @returns {Promise<{ name: string, url: string, size: string }>}
   */
  async upload(file) {
    const formData = new FormData();
    formData.append('file', file);
    const { data } = await http.postForm('/api/uploads', formData);
    return data;
  },
};

export const competitionEntryService = {
  /**
   * Attaches a zip entry to an existing participation record.
   * @param {string} competitionId
   * @param {{ employeeId?: string, name: string, email: string, message?: string, file: File }} payload
   */
  async submit(competitionId, { employeeId, name, email, message, file }) {
    const formData = new FormData();
    formData.append('employeeId', employeeId ?? '');
    formData.append('name', name ?? '');
    formData.append('email', email ?? '');
    formData.append('message', message ?? '');
    formData.append('file', file);
    const { data } = await http.postForm(`/api/competitions/${encodeURIComponent(competitionId)}/submit`, formData);
    return data;
  },
};

export const searchService = {
  /**
   * @param {string} term
   * @param {number} [limit] results per group
   */
  async search(term, limit) {
    const { data } = await http.get(`/api/search${buildQuery({ q: term, limit })}`);
    return data ?? { term, total: 0, groups: [] };
  },
};

export const contactService = {
  /** @param {{ name: string, email: string, type: string, subject: string, message: string }} payload */
  async submit(payload) {
    const { data } = await http.post('/api/contact', payload);
    return data;
  },
};

export const participationService = {
  /**
   * @param {{ competitionId: string, employeeId?: string, name: string, email: string, message?: string }} payload
   */
  async participate(payload) {
    const { data } = await http.post('/api/participate', payload);
    return data;
  },
};

export const authService = {
  async login(username, password) {
    const { data } = await http.post('/api/auth/login', { username, password });
    return data;
  },
  async logout() {
    const { data } = await http.post('/api/auth/logout');
    return data;
  },
  async session() {
    const { data } = await http.get('/api/auth/session');
    return data;
  },
};

export const employeeAuthService = {
  /** @param {{ email: string, password: string }} payload */
  async login(payload) {
    const { data } = await http.post('/api/employee-auth/login', payload);
    return data;
  },
  async logout() {
    const { data } = await http.post('/api/employee-auth/logout');
    return data;
  },
  async session() {
    const { data } = await http.get('/api/employee-auth/session');
    return data;
  },
};

export const employeeAccountsService = {
  async list() {
    const { data } = await http.get('/api/admin/employee-accounts');
    return data ?? [];
  },
  /** @param {{ employeeId: string, password: string, sections: string[] }} payload */
  async create(payload) {
    const { data } = await http.post('/api/admin/employee-accounts', { action: 'create', ...payload });
    return data;
  },
  /** @param {string} employeeId @param {string[]} sections */
  async updatePermissions(employeeId, sections) {
    const { data } = await http.post('/api/admin/employee-accounts', {
      action: 'update-permissions',
      employeeId,
      sections,
    });
    return data;
  },
  /** @param {string} employeeId */
  async reset(employeeId) {
    const { data } = await http.post('/api/admin/employee-accounts', { action: 'reset', employeeId });
    return data;
  },
};

export const trainingRegistrationService = {
  /** @param {string} trainingId @param {{ computerNumber: string, phoneNumber: string }} payload */
  async register(trainingId, payload) {
    const { data } = await http.post(`/api/trainings/${encodeURIComponent(trainingId)}/register`, payload);
    return data;
  },
  /** @param {string} trainingId */
  async cancel(trainingId) {
    const { data } = await http.post(`/api/trainings/${encodeURIComponent(trainingId)}/cancel`);
    return data;
  },
};

export { ApiError } from './httpClient';
