import axios from '../plugins/axios';
import axiosMultipart from '../plugins/axiosMultipart';
import { defineStore } from "pinia";

export const useProjectStore = defineStore("project", {
  state: () => ({
    projects: [],
  }),
  actions: {
    objectToQueryParams(obj) {
      const queryParams = [];

      for (const key in obj) {
        if (Array.isArray(obj[key])) {
          obj[key].forEach((value) => {
            const newKey = key +"[]";
            queryParams.push(`${newKey}=${value}`);
          });
        } else {
          queryParams.push(`${key}=${obj[key]}`);
        }
      }

      return queryParams.join("&");
    },

    async allProjects(apiBaseUrl) {
      try {
        const response = await axios.get(`${apiBaseUrl}all-projects`);
        return response.data;
      } catch (error) {
        return error.response.data;
      }
    },

    async viewProject(apiBaseUrl, id) {
      try {
        const response = await axios.get(`${apiBaseUrl}project/${id}`);
        return response.data;
      } catch (error) {
        return error.response.data;
      }
    },

    async projectsSummary(apiBaseUrl, filters) {
      console.log(filters);
      try {
        const response = await axios.get(`${apiBaseUrl}projects-summary?${this.objectToQueryParams(filters)}`);
        return response.data;
      } catch (error) {
        return error.response.data;
      }
    },

    async projectNames(apiBaseUrl, filters) {
      try {
        const queryString = Object.entries(filters)
        .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
        .join('&');
        const response = await axios.get(`${apiBaseUrl}project-names?${queryString}`);
        return response.data;
      } catch (error) {
        return error.response.data;
      }
    },

    async projects(apiBaseUrl, filters) {
      try {
        const queryString = Object.entries(filters)
        .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
        .join('&');
        const response = await axios.get(`${apiBaseUrl}projects?${queryString}`);
        return response.data;
      } catch (error) {
        return error.response.data;
      }
    },

    async updateProject(apiBaseUrl, filters, id) {
      try {
        const response = await axios.put(`${apiBaseUrl}project/${id}`, filters);
        return response;
      } catch (error) {
        return error.response.data;
      }
    },

    async createProject(apiBaseUrl, form) {
      try {
        const response = await axios.post(`${apiBaseUrl}project`, form);
        return response;
      } catch (error) {
        return error.response.data;
      }
    },

    async deleteProject(apiBaseUrl, id) {
      try {
        const response = await axios.delete(`${apiBaseUrl}project/${id}`);
        return response;
      } catch (error) {
        return error.response.data;
      }
    },

    async addCommentToProject(apiBaseUrl, filters, id) {
      try {
        const response = await axiosMultipart.post(`${apiBaseUrl}project/${id}/add-comment`, filters);
        return response;
      } catch (error) {
        return error.response.data;
      }
    },

    async addMemberToProject(apiBaseUrl, filters) {
      //filters {project_id, user_id, created_by}
      try {
        const response = await axios.post(`${apiBaseUrl}project/member`, filters);
        return response;
      } catch (error) {
        return error.response.data;
      }
    },
  },
});

