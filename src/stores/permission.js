import axios from '../plugins/axios';
import { defineStore } from "pinia";

export const usePermissionStore = defineStore("permission", {
  state: () => ({
    permissions: [],
  }),
  actions: {
    async permissions(apiBaseUrl, filters) {
      try {
        const queryString = Object.entries(filters)
        .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
        .join('&');
        const response = await axios.get(`${apiBaseUrl}permissions?${queryString}`);
        return response.data;
      } catch (error) {
        return error.response.data;
      }
    },
    async viewPermission(apiBaseUrl, id) {
      try {
        const response = await axios.get(`${apiBaseUrl}permission/${id}`);
        return response.data;
      } catch (error) {
        return error.response.data;
      }
    },
    async createPermission(apiBaseUrl, filters) {
      try {
        const response = await axios.post(`${apiBaseUrl}permission`, filters);
        return response;
      } catch (error) {
        return error.response.data;
      }
    },
  },
});

