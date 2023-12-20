import axios from '../plugins/axios';
import { defineStore } from "pinia";

export const useRoleStore = defineStore("role", {
  state: () => ({
    roles: [],
  }),
  actions: {

    async allRoles(apiBaseUrl) {
      try {
        const response = await axios.get(`${apiBaseUrl}all-roles`);
        return response.data;
      } catch (error) {
        return error.response.data;
      }
    },
    async roles(apiBaseUrl, filters) {
      try {
        const queryString = Object.entries(filters)
        .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
        .join('&');
        const response = await axios.get(`${apiBaseUrl}roles?${queryString}`);
        return response.data;
      } catch (error) {
        return error.response.data;
      }
    },
    async viewRole(apiBaseUrl, id) {
      try {
        const response = await axios.get(`${apiBaseUrl}role/${id}`);
        return response.data;
      } catch (error) {
        return error.response.data;
      }
    },
    async updateRolePermission(apiBaseUrl, filters, id) {
      try {
        const response = await axios.put(`${apiBaseUrl}roles-permissions/${id}`, filters);
        return response.data;
      } catch (error) {
        return error.response.data;
      }
    },
    async updateRole(apiBaseUrl, filters, id) {
      try {
        const response = await axios.put(`${apiBaseUrl}role/${id}`, filters);
        return response.data;
      } catch (error) {
        return error.response.data;
      }
    },
    async deleteRole(apiBaseUrl, id) {
      try {
        const response = await axios.delete(`${apiBaseUrl}role/${id}`);
        return response.data;
      } catch (error) {
        return error.response.data;
      }
    },
    async createRole(apiBaseUrl, filters) {
      try {
        const response = await axios.post(`${apiBaseUrl}role`, filters);
        return response;
      } catch (error) {
        return error.response.data;
      }
    },
  },
});

