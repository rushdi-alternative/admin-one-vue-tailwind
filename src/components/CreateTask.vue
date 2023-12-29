<script setup>
import { ref, onMounted, inject } from "vue";
import CardBox from "@/components/CardBox.vue";
import { useStatusStore } from "@/stores/status";
import { usePriorityStore } from "@/stores/priorities";
import FormField from "./FormField.vue";
import FormControl from "./FormControl.vue";
import BaseButtons from "./BaseButtons.vue";
import BaseButton from "./BaseButton.vue";
import { useProjectStore } from "@/stores/project";
import { useUserStore } from "@/stores/user";
import { useTaskStore } from "@/stores/task";
import { removeNullProperties } from "@/commons/constant";
import { useRouter } from "vue-router";

const router = useRouter();

const statusStore = useStatusStore();
const priorityStore = usePriorityStore();
const projectStore = useProjectStore();
const userStore = useUserStore();
const taskStore = useTaskStore();


const apiBaseUrl = inject('apiBaseUrl');

const isLoading = ref(true);

const userList = ref([]);
const statusList = ref([]);
const priorityList = ref([]);
const projectList = ref([]);

const errorMessage = ref('');
const errorName = ref('');
const errorEstimatedHours = ref('');
const errorSpentHours = ref('');

const name = ref(null);
const description = ref(null);
const startDate = ref(null);
const endDate = ref(null);
const estimatedHours = ref(null);
const spentHours = ref(null);
const assignedTo = ref(null);

const defaultName = ref('');
const defaultDescription = ref('');
const defaultStartDate = ref(null);
const defaultEndDate = ref(null);
const defaultEstimatedHours = ref('');
const defaultSpentHours = ref('');
const defaultAssignedTo = ref(null);

async function fetchUsers() {
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

async function fetchStatus() {
  isLoading.value  = true;
  try {
    const response = await statusStore.statuses(apiBaseUrl, { all: true });
    statusList.value = response.data;
  } catch (error) {
    console.error("An error occurred:", error);
    throw error;
  } finally {
    isLoading.value  = false;
  }
}

async function fetchPriorities() {
  isLoading.value  = true;
  try {
    const response = await priorityStore.priorities(apiBaseUrl, { all: true });
    priorityList.value = response.data;
  } catch (error) {
    console.error("An error occurred:", error);
    throw error;
  } finally {
    isLoading.value  = false;
  }
}

const accesptedStatusList = ['Open', 'In Progress', 'On Hold', 'Overdue'];
async function fetchProjects() {
  isLoading.value  = true;
  try {
    const response = await projectStore.projectNames(
      apiBaseUrl,
      {
        status: accesptedStatusList,
        all: true
      }
    );

    projectList.value = response.data;
  } catch (error) {
    console.error("An error occurred:", error);
    throw error;
  } finally {
    isLoading.value  = false;
  }
}

onMounted(() => {
  fetchUsers();
  fetchStatus();
  fetchPriorities();
  fetchProjects();

  const currentDate = new Date();
  const year = currentDate.getFullYear();
  const month = String(currentDate.getMonth() + 1).padStart(2, '0');
  const day = String(currentDate.getDate()).padStart(2, '0');

  startDate.value = `${year}-${month}-${day}`;
  const nextMonth = new Date(year, currentDate.getMonth() + 1, day);
  const nextYear = nextMonth.getFullYear();
  const nextMonthFormatted = String(nextMonth.getMonth() + 1).padStart(2, '0');
  endDate.value = `${nextYear}-${nextMonthFormatted}-${day}`;

  defaultName.value = '';
  defaultDescription.value = '';
  defaultStartDate.value = startDate.value;
  defaultEndDate.value = endDate.value;
  defaultAssignedTo.value = null;
});

const handleCallback = (result) => {
  console.log("Handle Call Back");
  return null;
};

const resetForm = () => {

  name.value = defaultName.value;
  description.value = defaultDescription.value;
  startDate.value = defaultStartDate.value;
  endDate.value = defaultEndDate.value;
  estimatedHours.value = defaultEstimatedHours.value;
  spentHours.value = defaultSpentHours.value;
  assignedTo.value = defaultAssignedTo.value;

  const statusSelect = document.getElementById("status_id");
  if (statusSelect) {
    statusSelect.selectedIndex = 0;
  }

  const prioritySelect = document.getElementById("priority_id");
  if (prioritySelect) {
    prioritySelect.selectedIndex = 0;
  }

  const projectSelect = document.getElementById("project_id");
  if (projectSelect) {
    projectSelect.selectedIndex = 0;
  }
};

const submitForm = async () => {
  errorName.value = '';
  errorEstimatedHours.value = '';
  errorSpentHours.value = '';

  if (!name.value ) {
    errorName.value = "You need to specify a task name to create a task";
    return;
  }

  try {
    const statusSelect = document.getElementById("status_id");
    const prioritySelect = document.getElementById("priority_id");
    const projectSelect = document.getElementById("project_id");
    const formFilters = {
      name: name.value,
      description: description.value,
      start_date: startDate.value,
      end_date: endDate.value,
      estimated_hours: estimatedHours.value,
      spent_hours: spentHours.value,
      assigned_to_user_id: assignedTo.value,
      priority_id:prioritySelect.value,
      status_id:statusSelect.value,
      project_id:projectSelect.value,
    };

    // console.log(formFilters)

    removeNullProperties(formFilters);
    const response = await taskStore.createTask(apiBaseUrl, formFilters);
    router.push(`/task/${response.data.data.id}`);
  } catch (error) {
    errorMessage.value = "An error occurred while submitting the form.";
  }
};
</script>

<template>
  <div v-if="isLoading" class="text-center p-4">
    <div class="flex justify-center items-center">
      <div class="w-5 h-5 border-t-4 border-blue-500 border-solid rounded-full animate-spin"></div>
    </div>
  </div>
  <div v-else>
    <div class="grid">
      <CardBox form @submit.prevent="submit">
        <div class="mb-3">
          <div v-if="errorMessage" class="text-red-500">{{ errorMessage }}</div>
          <div v-if="errorName" class="text-red-500">{{ errorName }}</div>
          <b><label for="name" class="required">Task Name</label></b>
        </div>
        <FormField>
            <FormControl class="" id="name" type="text" v-model="name" placeholder="Name your new Task" />
        </FormField>
        <FormField label="Related Project">
          <select
            id="project_id"
            class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
            small
          >
            <option
              v-for="project in projectList"
              :key="project.id"
              :value="project.id"
            >
              {{ project.name }}
            </option>
          </select>
        </FormField>
        <FormField label="Description" help="Describe the task in short">
          <FormControl
            type="textarea"
            placeholder="Describe the task"
          />
        </FormField>
        <FormField>
          <FormField label="Start Date">
            <FormControl type="date" name="start_date" v-model="startDate" />
          </FormField>
          <FormField label="End Date">
            <FormControl type="date" name="end_date" v-model="endDate" />
          </FormField>
        </FormField>
        <FormField>
          <FormField label="Status">
            <select
              id="status_id"
              class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
              small
            >
              <option
                v-for="status in statusList"
                :key="status.id"
                :value="status.id"
              >
                {{ status.name }}
              </option>
            </select>
          </FormField>
          <FormField label="Priority">
            <select
              id="priority_id"
              class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
              small
            >
              <option
                v-for="priority in priorityList"
                :key="priority.id"
                :value="priority.id"
              >
                {{ priority.name }}
              </option>
            </select>
          </FormField>
        </FormField>
        <FormField label="Assign User to this Project">
          <select
            v-if="userList[0]"
            id="assigned_to_user_id"
            class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
            v-model="assignedTo"
            small
          >
          <option v-for="user in userList" :key="user.id" :value="user.id">
            <span v-if="user.id !== 'all'">{{ user.email }}</span>
          </option>
          </select>
        </FormField>

        <template #footer>
          <BaseButtons>
            <BaseButton type="submit" color="info" label="Submit" @click="submitForm" />
            <BaseButton type="reset" color="info" outline label="Reset" @click="resetForm" />
          </BaseButtons>
        </template>
      </CardBox>
    </div>
  </div>
</template>
