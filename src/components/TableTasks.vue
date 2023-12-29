<script setup>
import { computed, ref, onMounted, watch, inject } from "vue";
import { useTaskStore } from "@/stores/task";
import CardBoxModalStateChanging from "@/components/CardBoxModalStateChanging.vue";
import CardBox from "@/components/CardBox.vue";
import CardBoxComponentTitle from "@/components/CardBoxComponentTitle.vue";
import BaseLevel from "@/components/BaseLevel.vue";
import BaseButtons from "@/components/BaseButtons.vue";
import BaseButton from "@/components/BaseButton.vue";
import { useStatusStore } from "@/stores/status";
import { useUserStore } from "@/stores/user";
import { usePriorityStore } from "@/stores/priorities";
import CardBoxModal from "./CardBoxModal.vue";
import { mdiPlus, mdiTrashCan, mdiBriefcase, mdiPencil } from "@mdi/js";
import { permissionsToTaskAdd, permissionsToTaskDelete, permissionsToTaskEdit } from "@/commons/constant";
import SectionTitleLineWithButton from "./SectionTitleLineWithButton.vue";

const taskStore = useTaskStore();
const statusStore = useStatusStore();
const priorityStore = usePriorityStore();
const userStore = useUserStore();

const apiBaseUrl = inject('apiBaseUrl');

const currentUserPermissions = JSON.parse(localStorage.getItem('permissions'));
const hasAccessToTaskCreate = currentUserPermissions !== null && permissionsToTaskAdd.some(permission => currentUserPermissions.includes(permission));
const hasAccessToTaskDelete = currentUserPermissions !== null && permissionsToTaskDelete.some(permission => currentUserPermissions.includes(permission));
const hasAccessToTaskEdit = currentUserPermissions !== null && permissionsToTaskEdit.some(permission => currentUserPermissions.includes(permission));

const modalChangeType = ref("");
const currentTask = ref(null);
const noOfTasks = ref(0);
const referenceId = ref(null);
const isModalOpen = ref(false);
const isLoading = ref(true);
const perPage = ref(10);
const currentPage = ref(0);
const checkedRows = ref([]);

const userList = ref([]);
const statusList = ref([]);
const priorityList = ref([]);

const defaultCreatedBySelected = 'all';
const defaultAssignedToSelected = 'all';
const defaultStatusSelected = 'all';
const defaultPrioritySelected = 'all';
const defaultSelectedPriorityId = 4; //urgent
const sortBy = 'priority_id';
const sort = 'desc';

const tasks = ref([]);
const numPages = ref(0);
const currentPageHuman = computed(() => currentPage.value + 1);
const pagesList = computed(() => {
  const pagesList = [];
  for (let i = 0; i < numPages.value; i++) {
    pagesList.push(i);
  }
  return pagesList;
});

const remove = (arr, cb) => {
  const newArr = [];
  arr.forEach((item) => {
    if (!cb(item)) {
      newArr.push(item);
    }
  });
  return newArr;
};

const checked = (isChecked, task) => {
  if (isChecked) {
    checkedRows.value.push(task);
  } else {
    checkedRows.value = remove(
      checkedRows.value,
      (row) => row.id === task.id
    );
  }
};

const goToPage = (page) => {
  isLoading.value = true;
  currentPage.value = page;
  fetchTasks();
};

async function fetchTasks(filters) {
  isLoading.value  = true;
  try {
    const response = await taskStore.tasksSummary(
      apiBaseUrl, {
        ...filters,
        limit: perPage.value,
        offset: currentPage.value * perPage.value,
    });

    tasks.value = response.data;
    numPages.value = Math.ceil(response.count / perPage.value);
    noOfTasks.value = response.count;
  } catch (error) {
    console.error("An error occurred:", error);
    throw error;
  } finally {
    setTimeout(() => {
      isLoading.value  = false;
    }, 500);
  }
}

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

const getFilters = () => {
  let filters = {};
  const createdBySelect = document.getElementById('createdBy');
  if (createdBySelect && createdBySelect.value !== defaultCreatedBySelected) {
    filters = { ...filters, 'created_by': createdBySelect.value };
  }

  const prioritySelect = document.getElementById('priority');
  if (prioritySelect && prioritySelect.value !== defaultPrioritySelected) {
    filters = { ...filters, 'priority_id': prioritySelect.value };
  }

  const statusSelect = document.getElementById('status');
  if (statusSelect && statusSelect.value !== defaultStatusSelected) {
    filters = { ...filters, 'status_id': statusSelect.value };
  }

  const assignToUserSelect = document.getElementById('assignedTo');
  if (assignToUserSelect && assignToUserSelect.value !== defaultAssignedToSelected) {
    filters = { ...filters, 'assigned_to_user_id': assignToUserSelect.value };
  }

  const sortBySelect = document.getElementById('sortBy');
  const sortSelect = document.getElementById('sort');
  if (sortSelect && sortBySelect) {
    filters = { ...filters, 'sort': [`${sortBySelect.value}:${sortSelect.value}`, 'id:desc'] };
  }

  return filters;
};

watch(perPage, async () => {
  currentPage.value = 0;

  await nextTick();
  fetchTasks(getFilters());
});

onMounted(async () => {
  await fetchUsers();
  await fetchStatus();
  await fetchPriorities();
  await fetchTasks({ 'priority_id': defaultSelectedPriorityId, 'sort': ['id:desc', `${sortBy}:${sort}`] });
});

const openModal = (type, task, refId) => {
  currentTask.value = task;
  referenceId.value = refId;
  modalChangeType.value = type;
  isModalOpen.value = true;
};

const updateSearch = () => {
  fetchTasks(getFilters());
}

const isOpenConfirmationModal = ref(false);

const confirmationTitle = ref(null);
const confirmationBtn = ref(null);
const handleCallback = (result) => {
  if (result) {
    if (result.error !== undefined) {
      confirmationTitle.value = result.error;
      confirmationBtn.value="danger";
    } else {
      confirmationTitle.value = result.data.message;
      confirmationBtn.value="success";
    }
    isOpenConfirmationModal.value = true;
  }
  fetchTasks(getFilters());
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
      <SectionTitleLineWithButton :icon="mdiBriefcase" title="Tasks" main>
        <BaseButton
          href="/task/create"
          :icon="mdiPlus"
          label="Add Task"
          color="contrast"
          rounded-full
          small
          v-if="hasAccessToTaskCreate"
        />
      </SectionTitleLineWithButton>
      <CardBox>
        <div class="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div class="flex flex-col">
            <label for="createdBy">Created By:</label>
            <select id="createdBy" v-if="userList[0]"
              class="select-box bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
              v-model="defaultCreatedBySelected" @change="updateSearch()" small>
              <option value="all">All</option>
              <option v-for="user in userList" :key="user.id" :value="user.id">
                <span>{{ user.name }} &lt;&lt; {{ user.email }} &gt;&gt;</span>
              </option>
            </select>
          </div>
          <div class="flex flex-col">
            <label for="priority">Priority:</label>
            <select id="priority" v-if="priorityList[0]" name="priority"
              class="select-box bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
              v-model="defaultSelectedPriorityId" @change="updateSearch()" small>
              <option value="all">All</option>
              <option v-for="priority in priorityList" :key="priority.id" :value="priority.id">
                {{ priority.name }}
              </option>
            </select>
          </div>
          <div class="flex flex-col">
            <label for="status">Status:</label>
            <select id="status" v-if="statusList[0]"
              class="select-box bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
              v-model="defaultStatusSelected" @change="updateSearch()" small>
              <option value="all">All</option>
              <option v-for="status in statusList" :key="status.id" :value="status.id">
                {{ status.name }}
              </option>
            </select>
          </div>
          <div class="flex flex-col">
            <label for="assignedTo">Assigned To:</label>
            <select id="assignedTo" v-if="userList[0]"
              class="select-box bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
              v-model="defaultAssignedToSelected" @change="updateSearch()" small>
              <option value="all">All</option>
              <option v-for="user in userList" :key="user.id" :value="user.id">
                <span v-if="user.id === 'all'">{{ user.name }}</span>
                <span v-else>{{ user.name }} &lt;&lt; {{ user.email }} &gt;&gt;</span>
              </option>
            </select>
          </div>
        </div>

        <div class="flex items-center justify-end mt-4">
          <label for="SortBy" class="mr-4">Sort :</label>
          <select id="sortBy"
            class="select-box bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500 inline mr-4"
            v-model="sortBy" @change="updateSearch()" small>
            <option value="assigned_to_user_id">Assigned User</option>
            <option value="created_by">Created By</option>
            <option value="priority_id" selected>Priority</option>
            <option value="status_id">Status</option>
          </select>
          <select id="sort"
            class="select-box bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500 inline"
            v-model="sort" @change="updateSearch()" small>
            <option value="asc" selected>ASC</option>
            <option value="desc">DESC</option>
          </select>
        </div>
      </CardBox>
    </div>
    <br />
    <div class="grid">
      <div class="grid grid-cols-1 gap-6 mb-6 lg:grid-cols-2">
        <CardBox v-for="task in tasks" :key="task.id">
          <div class="space-y-3">
            <div>
              <div class="mb-3 w-full" v-if="hasAccessToTaskEdit">
                <router-link
                  :to="{ name: 'TaskDetails', params: { id: task.id } }"
                  class="hover:bg-gray-900 w-full"
                >
                  <b>
                    <CardBoxComponentTitle :title="task.name" :icon="mdiPencil" />
                  </b>
                </router-link>
                {{ task.description }}
              </div>
              <div class="mb-3 w-full" v-else>
                <CardBoxComponentTitle :title="task.name" />
              </div>

              <div class="flex mb-3 gap-6">
                <div class="flex-1 gap-6">
                  <div class="mb-1 w-full">
                    <b>Status</b>
                  </div>
                  <div class="mb-3 w-full">
                    <div v-if="hasAccessToTaskEdit">
                      <select v-model="task.status_id"
                        class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                        @change="openModal('status', task, $event.target.value)" small>
                        <option v-for="status in statusList" :key="status.id" :value="status.id">
                          {{ status.name }}
                        </option>
                      </select>
                    </div>
                    <div v-else>
                      {{ statusList.find(status => status.id === task.status_id).name }}
                    </div>
                  </div>
                </div>

                <div class="flex-1 gap-6 text-right">
                  <div class="mb-1 w-full">
                    <b>Priority</b>
                  </div>
                  <div class="mb-3 w-full">
                    <div v-if="hasAccessToTaskEdit">
                      <select v-model="task.priority_id"
                        class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                        @change="openModal('priority', task, $event.target.value)" small>
                        <option v-for="priority in priorityList" :key="priority.id" :value="priority.id">
                          {{ priority.name }}
                        </option>
                      </select>
                    </div>
                    <div v-else>
                      {{ priorityList.find(priority => priority.id === task.priority_id).name }}
                    </div>
                  </div>
                </div>
              </div>

              <div class="gap-6 mb-3">
                <div class="mb-2 w-full">
                  <label><b>Progress</b></label>
                </div>
                <div class="mb-3">
                  <progress class="flex w-2/5 self-center lg:w-full" max="100" :value="task.progress">
                  {{ task.progress }}
                </progress>
                </div>
              </div>

              <div class="flex mb-3">
                <div class="flex-1 gap-6">
                  <div class="mb-1 w-full">
                    <b>Start Date</b>
                  </div>
                  <div class="mb-3 w-full">
                    {{ task.start_date }}
                  </div>
                </div>
                <div class="flex-1 gap-6 text-right">
                  <div class="mb-1 w-full">
                    <b>End Date</b>
                  </div>
                  <div class="mb-3 w-full">
                    {{ task.end_date !== null ? task.end_date : '-' }}
                  </div>
                </div>
              </div>

              <div class="flex mb-3">
                <div class="flex-1 gap-6">
                  <div class="mb-3 w-full">
                    <b>Created By</b>
                  </div>
                  <div class="mb-3 w-full">
                    {{ task.userDetails.name }}
                  </div>
                </div>
                <div class="flex-1 gap-6 text-right">
                  <div class="flex-1 gap-6">
                    <div class="mb-3 w-full">
                      <b>Assigned To</b>
                    </div>
                    <div class="mb-3 w-full">
                      <div v-if="hasAccessToTaskEdit">
                        <select v-if="userList[0]"
                          class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                          v-model="task.assigned_to_user_id"
                          @change="openModal('assigned_to', task, $event.target.value)" small>
                          <option value="">Unassign User</option>
                          <option v-for="user in userList" :key="user.id" :value="user.id">
                            {{ user.email }}
                          </option>
                        </select>
                      </div>
                      <div v-else>
                        {{ task.assigned_to_user_id !== null ? userList.find(user => user.id === task.assigned_to_user_id)?.email : 'Not Assinged' }}
                      </div>
                    </div>
                  </div>
                </div>

              </div>

              <div class="mb-3 w-full">
                <div class="text-right">
                  <BaseButton
                  color="danger"
                  :icon="mdiTrashCan"
                  small
                  @click="openModal('delete', task, $event.target.value)"
                  v-if="hasAccessToTaskDelete"
                />
                </div>
              </div>
            </div>
          </div>
        </CardBox>
      </div>

      <div class="p-3 lg:px-6 border-t border-gray-100 dark:border-slate-800">
        <BaseLevel>
          <BaseButtons>
            <BaseButton v-for="page in pagesList" :key="page" :active="page === currentPage" :label="page + 1"
              :color="page === currentPage ? 'lightDark' : 'whiteDark'" small @click="goToPage(page)" />
          </BaseButtons>
          <small>
            Per Page
            <select v-model="perPage"
              class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
              name="perPage">
              <option value="2">2</option>
              <option value="4">4</option>
              <option value="10">10</option>
              <option value="25">25</option>
              <option value="50">50</option>
              <option value="100">100</option>
            </select>
            {{ noOfTasks }} task{{ noOfTasks === 1 ? '' : 's' }} / {{ currentPageHuman }} of {{ numPages }} page
          </small>
        </BaseLevel>
      </div>
      <CardBoxModalStateChanging v-if="currentTask" v-model="isModalOpen" title="Update the Task" button-label="Yes"
        has-cancel modal-type="task" :change="modalChangeType" :id="currentTask.id" :reference-id="referenceId"
        :callback="handleCallback">
        <p>
          {{ modalChangeType === 'delete'
            ? 'Are you sure you want to delete the task'
            : modalChangeType === 'assigned_to'
              ? referenceId === ''
                ? 'Are you sure you want to unassign the current user from this task?'
                : 'Are you sure you want to assign the selected user to this task?'
              : `Are you sure you want to change the ${modalChangeType === 'status' ? 'status' : 'priority'}?`
          }}
        </p>
      </CardBoxModalStateChanging>
      <CardBoxModal v-model="isOpenConfirmationModal" title="" :button="confirmationBtn">
        {{ confirmationTitle }}
      </CardBoxModal>
    </div>
  </div>
</template>
