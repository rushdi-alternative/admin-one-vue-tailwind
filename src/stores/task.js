import axios from '../plugins/axios';
import axiosMultipart from '../plugins/axiosMultipart';
import { defineStore } from "pinia";
import { useUserStore } from './user';

export const useTaskStore = defineStore("task", {
  state: () => ({
    tasks: [],
    userStore: useUserStore(),
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

    async allTasks(apiBaseUrl) {
      try {
        const response = await axios.get(`${apiBaseUrl}all-tasks`);
        return response.data;
      } catch (error) {
        return error.response.data;
      }
    },

    async viewTask(apiBaseUrl, id) {
      try {
        await this.userStore.userProfile(apiBaseUrl);
        const response = await axios.get(`${apiBaseUrl}task/${id}`);
        return response.data;
      } catch (error) {
        return error.response.data;
      }
    },
    async createTask(apiBaseUrl, form) {
      try {
        const response = await axios.post(`${apiBaseUrl}task`, form);
        return response;
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
    async deletetask(apiBaseUrl, id) {
      try {
        const response = await axios.delete(`${apiBaseUrl}task/${id}`);
        return response;
      } catch (error) {
        return error.response.data;
      }
    },

    async addCommentToTask(apiBaseUrl, filters, id) {
      try {
        console.log('hello');
        const response = await axiosMultipart.post(`${apiBaseUrl}task/${id}/add-comment`, filters);
        console.log(response);
        return response;
      } catch (error) {
        return error.response;
      }
    },

    async addMemberToTask(apiBaseUrl, filters) {
      //filters {project_id, user_id, created_by}
      try {
        const response = await axios.post(`${apiBaseUrl}task/member`, filters);
        return response;
      } catch (error) {
        return error.response.data;
      }
    },
  },
});

