import axios from '../plugins/axios';
import { defineStore } from "pinia";

export const useTaskStore = defineStore("task", {
  state: () => ({
    tasks: [],
  }),
  actions: {
    async tasksSummary(apiBaseUrl, filters) {
      try {
        const queryString = Object.entries(filters)
        .map(([key, value]) => {
          if (Array.isArray(value)) {
            return `${encodeURIComponent(key)}=${value.map(encodeURIComponent).join(',')}`;
          } else {
            return `${encodeURIComponent(key)}=${encodeURIComponent(value)}`;
          }
        })
        .join('&');
        const response = await axios.get(`${apiBaseUrl}tasks-summary?${queryString}`);
        return response.data;
      } catch (error) {
        return error.response.data;
      }
    },
    async tasks(apiBaseUrl, filters) {
      try {
        const queryString = Object.entries(filters)
        .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
        .join('&');
        const response = await axios.get(`${apiBaseUrl}tasks?${queryString}`);
        return response.data;
      } catch (error) {
        return error.response.data;
      }
    },
    async updateTask(apiBaseUrl, filters, id) {
      try {
        const response = await axios.put(`${apiBaseUrl}task/${id}`, filters);
        return response;
      } catch (error) {
        return error.response.data;
      }
    },
  },
});

