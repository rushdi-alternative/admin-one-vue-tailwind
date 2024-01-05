import axios from '../plugins/axios';
import { defineStore } from "pinia";

export const useUserStore = defineStore("user", {
  state: () => ({
    users: [],
  }),
  actions: {
    async allUsers(apiBaseUrl) {
      try {
        const response = await axios.get(`${apiBaseUrl}all-users`);
        return response.data;
      } catch (error) {
        return error.response.data;
      }
    },
    async usersSummary(apiBaseUrl, filters) {
      try {
        const queryString = Object.entries(filters)
        .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
        .join('&');
        const response = await axios.get(`${apiBaseUrl}users?${queryString}`);
        return response.data;
      } catch (error) {
        return error.response.data;
      }
    },
    async updateUser(apiBaseUrl, filters, id) {
      try {
        const response = await axios.put(`${apiBaseUrl}user/${id}`, filters);
        return response;
      } catch (error) {
        return error.response.data;
      }
    },
    async activateDeactivateUser(apiBaseUrl, id) {
      try {
        const response = await axios.put(`${apiBaseUrl}user/${id}/activate-deactivate-user`);
        return response;
      } catch (error) {
        return error.response.data;
      }
    },
    async updateUserRole(apiBaseUrl, filters, id) {
      try {
        const response = await axios.post(`${apiBaseUrl}user/${id}/update-role`, filters);
        return response;
      } catch (error) {
        return error.response.data;
      }
    },
    async createUser(apiBaseUrl, form) {
      try {
        const response = await axios.post(`${apiBaseUrl}create-user`, form);
        return response;
      } catch (error) {
        return error.response.data;
      }
    },
    async deleteUser(apiBaseUrl, id) {
      try {
        const response = await axios.delete(`${apiBaseUrl}user/${id}`);
        return response;
      } catch (error) {
        return error.response.data;
      }
    },

    async changeUserPassword(apiBaseUrl, filters, id) {
      try {
        userProfile(apiBaseUrl);
        const response = await axios.put(`${apiBaseUrl}user/${id}/change-password`, filters);
        return response;
      } catch (error) {
        return error.response.data;
      }
    },
    async userProfile(apiBaseUrl) {
      //will need to add to all the api calls to check the user changes
      try {
        const response = await axios.get(`${apiBaseUrl}profile`);
        const user = response.data.user;
        localStorage.setItem('userId', user.id);
        localStorage.setItem('userName', user.name);
        localStorage.setItem('roleId', user.role_id);
        localStorage.setItem('roleName', user.role);
        localStorage.setItem('permissions', JSON.stringify(user.permissions));
        return true;
      } catch (error) {
        return error.response.data;
      }
    },
  },
});
