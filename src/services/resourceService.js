import { http } from './httpClient';
import { buildQuery } from '@/lib/query';

/**
 * Builds a typed CRUD client for one collection.
 *
 * Every content type shares the same REST contract, so the service layer is
 * generated rather than copy-pasted eleven times.
 *
 * @param {string} resource the URL segment, e.g. `employees`
 */
export function createResourceService(resource) {
  const base = `/api/${resource}`;

  return {
    resource,

    /**
     * @param {Record<string, any>} [params] q, sort, order, page, pageSize, limit, ids + filters
     * @returns {Promise<{ items: any[], meta: any }>}
     */
    async list(params = {}) {
      const { data, meta } = await http.get(`${base}${buildQuery(params)}`);
      return { items: Array.isArray(data) ? data : [], meta };
    },

    /** @param {string} id */
    async get(id) {
      const { data } = await http.get(`${base}/${encodeURIComponent(id)}`);
      return data;
    },

    /** @param {Record<string, any>} payload */
    async create(payload) {
      const { data } = await http.post(base, payload);
      return data;
    },

    /**
     * @param {string} id
     * @param {Record<string, any>} payload
     */
    async update(id, payload) {
      const { data } = await http.put(`${base}/${encodeURIComponent(id)}`, payload);
      return data;
    },

    /** @param {string} id */
    async remove(id) {
      const { data } = await http.del(`${base}/${encodeURIComponent(id)}`);
      return data;
    },
  };
}

export default createResourceService;
