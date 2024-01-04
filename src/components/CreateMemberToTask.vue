<script setup>
import { inject, onMounted, ref, watch } from "vue";
import CardBox from "@/components/CardBox.vue";
import FormControl from "./FormControl.vue";
import BaseButtons from "./BaseButtons.vue";
import BaseButton from "./BaseButton.vue";
import { handleError } from "@/commons/constant";
import SectionTitleLineWithButton from "./SectionTitleLineWithButton.vue";
import { mdiBriefcase, mdiMagnify } from "@mdi/js";
import FormField from "./FormField.vue";
import { useUserStore } from "@/stores/user";
import { useTaskStore } from "@/stores/task";

const taskStore = useTaskStore();
const userStore = useUserStore();

const apiBaseUrl = inject('apiBaseUrl');

const isLoading = ref(false);

const newPermissionName = ref('');
const defaultPermissionName = ref('');

const selectedTask = ref(null);
const selectedUser = ref(null);

const taskList = ref(null);
const userList = ref(null);

async function fetchAllTasks() {
  isLoading.value = true;
  try {
    const response = await taskStore.allTasks(apiBaseUrl);
    taskList.value = response.data;
  } catch (error) {
    console.error("An error occurred:", error);
    throw error;
  } finally {
    isLoading.value = false;
  }
}

async function fetchAllUsers() {
  isLoading.value = true;
  try {
    const response = await userStore.allUsers(apiBaseUrl);
    userList.value = response.users;
  } catch (error) {
    console.error("An error occurred:", error);
    throw error;
  } finally {
    isLoading.value = false;
  }
}

onMounted( async () => {
  await fetchAllUsers();
  await fetchAllTasks();
});

const resetForm = () => {
  newPermissionName.value = defaultPermissionName.value;
}

const errorMessage = ref('');
const errorName = ref('');
const successMessage = ref('');

const submitForm = async () => {
  errorMessage.value = '';
  errorName.value = '';
  successMessage.value = '';

  if (selectedTask.value === null) {
    errorName.value = "Task should be selected to proceed";
    return;
  }

  if (selectedUser.value === null) {
    errorName.value = "User should be selected to proceed";
    return;
  }

  try {
    const formFilters = {
      task_id: selectedTask.value,
      userid:selectedUser.value
    };
    const response = await taskStore.addMemberToTask(apiBaseUrl, formFilters);

    if(response.status === 201) {
      successMessage.value = response.data.message;
      resetForm();
    } else {
      errorMessage.value = (handleError(response));
    }

  } catch (error) {
    errorMessage.value = "An error occurred while assigning a member to the task.";
    if (error.name !== 'undefined') {
      errorMessage.value = error.name;
    }
  }
}

</script>

<template>
  <div v-if="isLoading" class="text-center p-4">
    <div class="flex justify-center items-center">
      <div class="w-5 h-5 border-t-4 border-blue-500 border-solid rounded-full animate-spin"></div>
    </div>
  </div>
  <div v-else>
    <div class="grid">
      <SectionTitleLineWithButton :icon="mdiBriefcase" title="Tasks" main>
        <BaseButton
          href="/tasks"
          :icon="mdiMagnify"
          label="View Tasks"
          color="contrast"
          rounded-full
          small
        />
      </SectionTitleLineWithButton>
      <CardBox form @submit.prevent="submitForm">
        <div v-if="errorMessage" class="text-red-500">{{ errorMessage }}</div>
        <div v-if="errorName" class="text-red-500">{{ errorName }}</div>
        <div v-if="successMessage" class="text-green-500">{{ successMessage }}</div>

        <div class="flex flex-wrap -mx-3 mb-2">
          <div class="w-full md:w-1/3 px-3 mb-6 md:mb-0">
            <FormField label="Task">
              <div class="relative">
                <select v-model="selectedTask" class="block appearance-none w-full bg-gray-200 border border-gray-200 text-gray-700 py-3 px-4 pr-8 rounded leading-tight focus:outline-none focus:bg-white focus:border-gray-500" id="grid-state">
                  <option disabled selected value="null">Select a Task</option>
                  <option v-for="task in taskList" :key="task.id" :value="task.id">{{ task.name }}</option>
                </select>
              </div>
            </FormField>
          </div>
          <div class="w-full md:w-1/3 px-3 mb-6 md:mb-0">
            <FormField label="User Name">
              <div class="relative">
                <select v-model="selectedUser" class="block appearance-none w-full bg-gray-200 border border-gray-200 text-gray-700 py-3 px-4 pr-8 rounded leading-tight focus:outline-none focus:bg-white focus:border-gray-500" id="grid-state">
                  <option disabled selected value="null">Select a User</option>
                  <option v-for="user in userList" :key="user.id" :value="user.id">{{ user.name }} {{`<< ${user.email} >>`}} </option>
                </select>
              </div>
            </FormField>
          </div>
        </div>

        <template #footer>
          <BaseButtons>
            <BaseButton type="submit" color="info" label="Create Mapping" @click="submitForm" />
            <BaseButton type="reset" color="info" outline label="Reset" @click="resetForm" />
          </BaseButtons>
        </template>
      </CardBox>
    </div>
  </div>
</template>
