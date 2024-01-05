<script setup>
import { ref, onMounted, inject } from "vue";
import CardBoxModalStateChanging from "@/components/CardBoxModalStateChanging.vue";
import CardBox from "@/components/CardBox.vue";
import FormControl from "./FormControl.vue";
import BaseButtons from "@/components/BaseButtons.vue";
import BaseButton from "@/components/BaseButton.vue";
import { useProjectStore } from "@/stores/project";
import { useTaskStore } from "@/stores/task";
import { useUserStore } from "@/stores/user";
import CardBoxModal from "./CardBoxModal.vue";
import SectionMain from "./SectionMain.vue";
import SectionTitleLineWithButton from "./SectionTitleLineWithButton.vue";
import { mdiPlus, mdiTrashCan, mdiBriefcase } from "@mdi/js";
import { useRoute } from 'vue-router';
import { removeNullProperties, removeZeroProperties, formatDate, percentageArray, isImageFile, permissionsToTaskEdit, permissionsToTaskAdd, formatTimestamp } from "@/commons/constant";

const currentUserPermissions = JSON.parse(localStorage.getItem('permissions'));
const hasAccessToTaskEdit = currentUserPermissions !== null && permissionsToTaskEdit.some(permission => currentUserPermissions.includes(permission));
const hasAccessToTaskAdd = currentUserPermissions !== null && permissionsToTaskAdd.some(permission => currentUserPermissions.includes(permission));

const route = useRoute();

const projectStore = useProjectStore();
const taskStore = useTaskStore();
const userStore = useUserStore();

const apiBaseUrl = inject('apiBaseUrl');
const apiBaseAssetsUrl = apiBaseUrl.replace('api', 'storage/assets/projects');

const modalChangeType = ref("");
const currentProject = ref(null);
const referenceId = ref(null);
const isModalOpen = ref(false);
const isLoading = ref(true);
const userList = ref([]);
const statusList = ref([]);
const priorityList = ref([]);

const project = ref(null);
const projectCommentList = ref([]);
const projectAttachmentList = ref([]);
const projectActivities = ref();

const newComment = ref('');
const newDescription = ref('');
const newName = ref('');
const progress = ref(0);
const startDate = ref(null);
const endDate = ref(null);
const errorMsg = ref('');

const fileInputCount = ref(0);

async function fetchProject() {
  const projectId = route.params.id;
  isLoading.value = true;
  try {
    const response = await projectStore.viewProject(apiBaseUrl, projectId);
    project.value = response.data;
    projectCommentList.value = response.data.comments;
    projectAttachmentList.value = response.data.attachments;
    projectActivities.value = response.data.activities;
    progress.value = response.data.progress;
    startDate.value = response.data.start_date;
    endDate.value = response.data.end_date;
    statusList.value = response.status.data;
    priorityList.value = response.priority.data;
  } catch (error) {
    console.error("An error occurred:", error);
    throw error;
  } finally {
    setTimeout(() => {
      isLoading.value = false;
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

async function fetchJKanban() {
  const tasks = project.value.tasks;
  const boardConfig = generateBoardConfig(tasks);

  window.KanbanTest = new jKanban({
    element: "#myKanban",
    gutter: "10px",
    widthBoard: "300px",
    dragItems: hasAccessToTaskEdit ? true : false,
    itemHandleOptions:{
      enabled: hasAccessToTaskEdit ? true : false,
    },
    click: function(el) {
      const taskId = el.querySelector('div[data-id]').dataset.id;
      window.open(`/task/${taskId}`, '_blank');
      // console.log(el, "Trigger on all items click!");
    },
    context: function(el, e) {
      console.log("Trigger on all items right-click!");
    },
    dropEl: function(el, target, source, sibling){
      // console.log(target.parentElement.getAttribute('data-id'));
      // console.log(el, target, source, sibling)
      const newStatus = target.parentElement.getAttribute('data-id');
      const taskId = el.querySelector('div[data-id]').dataset.id;
      const formData = {'status_id': newStatus};
      submitTaskChangeState(formData, taskId)
        .then(response => {
          console.log(response);
        })
        .catch(error => {
          console.error(error);
        });
    },
    buttonClick: function(el, boardId) {
      // create a form to enter element
      var formItem = document.createElement("form");
      formItem.setAttribute("class", "itemform");
      const priorityOptions = priorityList.value.map(priority => `<option value="${priority.id}">${priority.name}</option>`).join('');
      const usersOptions = '<option value="" selected disabled></option>' + userList.value.map(user => `<option value="${user.id}">${user.name}</option>`).join('');
      formItem.innerHTML =
      '<div class="form-group mb-2">' +
        '<input type="text" id="name" name="name" placeholder="Name your new Task" class="px-3 py-2 max-w-full focus:ring focus:outline-none border-gray-700 rounded w-full dark:placeholder-gray-400 h-12 border bg-white dark:bg-slate-800">' +
        '<input type="hidden" id="project_id" value = "'+ project.value.id +'" />' +
      '</div>' +
      '<div class="form-group mb-2">' +
        '<label>Start Date</label>' +
        '<input type="date" id="start_date" value="' + startDate.value + '" class="px-3 py-2 max-w-full focus:ring focus:outline-none border-gray-700 rounded w-full dark:placeholder-gray-400 h-12 border bg-white dark:bg-slate-800">' +
      '</div>' +
      '<div class="form-group mb-2">' +
        '<label>End Date</label>' +
        '<input type="date" id="end_date" value="' + endDate.value + '" class="px-3 py-2 max-w-full focus:ring focus:outline-none border-gray-700 rounded w-full dark:placeholder-gray-400 h-12 border bg-white dark:bg-slate-800">' +
      '</div>' +
      '<div class="form-group mb-2">' +
        '<label>Priority</label>' +
        '<select id="priority_id" class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" small>' +
          priorityOptions +
        '</select>' +
      '</div>' +
      '<div class="form-group mb-2">' +
        '<label>Assign To</label>' +
        '<select id="assigned_to_user_id" class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" small>' +
          usersOptions +
        '</select>' +
      '</div>' +
      '<div class="form-group">' +
        '<button type="submit" class="custom-submit">Submit</button>' +
        '<button type="button" id="CancelBtn" class="custom-cancel">Cancel</button>' +
      '</div>';

      KanbanTest.addForm(boardId, formItem);
      formItem.addEventListener("submit", function(e) {
        e.preventDefault();
        // console.log(boardId);
        const name = e.target[0].value;
        const start_date = document.getElementById("start_date").value;
        const end_date = document.getElementById("end_date").value;
        const priority_id = document.getElementById("priority_id").value;
        const assigned_to_user_id = document.getElementById("assigned_to_user_id").value;
        const project_id = document.getElementById("project_id").value;

        const formData = {'name':name, 'start_date':start_date, 'end_date':end_date, 'priority_id':priority_id, 'assigned_to_user_id': assigned_to_user_id, 'status_id':boardId, 'project_id': project_id};

        submitTask(formData)
          .then(response => {
            KanbanTest.addElement(boardId, {
              title: `<div data-id="${response.data.data.id}">${response.data.data.name}</div>`
            });
            formItem.parentNode.removeChild(formItem);
          })
          .catch(error => {
            console.error(error);
            console.log('error');
          });
      });
      document.getElementById("CancelBtn").onclick = function() {
        formItem.parentNode.removeChild(formItem);
      };
    },
    itemAddOptions: {
      enabled: hasAccessToTaskAdd ? true : false,
      content: '+ Add New Task',
      class: 'custom-button',
      footer: true
    },
    boards: boardConfig,
  });

    // var allEle = KanbanTest.getBoardElements("_todo");
    // allEle.forEach(function(item, index) {
    // //console.log(item);
    // });
}

const submitTask = async (formData) => {
  if (!formData.name ) {
    console.log( "You need to specify a task name to create a task");
    return;
  }

  try {
    const response = await taskStore.createTask(apiBaseUrl, formData);
    return response;
  } catch (error) {
    return (error);
  }
};

const submitTaskChangeState = async (formData, id) => {
  try {
    const response = await taskStore.updateTask(apiBaseUrl, formData, id);
    return response;
  } catch (error) {
    return (error);
  }
};

function generateBoardConfig(tasks) {
  const uniqueStatusNames = [...new Set(statusList.value.map(status => status.name))];

  return uniqueStatusNames.map(statusName => {
    const boardConfig = {
      id: `${getStatusIdByName(statusName)}`,
      title: `${capitalizeFirstLetter(statusName)}`,
      class: getStatusClassByName(statusName),
      item: tasks
        .filter(task => getStatusNameById(task.status_id) === statusName)
        .map(task => ({
          // title: task.name,
          title: `<div data-id="${task.id}">${task.name}</div>`,
          // ... other properties
        })),
    };

    return boardConfig;
  });
}

function getStatusNameById(statusId) {
  const status = statusList.value.find(s => s.id === statusId);
  return status ? status.name : '';
}

function getStatusIdByName(statusName) {
  const status = statusList.value.find(s => s.name === statusName);
  return status ? status.id : null;
}

function getStatusClassByName(statusName) {
  // Map status names to corresponding classes as needed
  const classMap = {
    Open: 'info,good',
    'In Progress': 'warning',
    Completed: 'success',
    'On Hold': 'error',
    'Overdue': 'danger',
    'Cancelled': 'danger',
    // Add more mappings as needed
  };

  return classMap[statusName] || '';
}

function capitalizeFirstLetter(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

onMounted(async () => {
  await fetchUsers();
  await fetchProject();
  await fetchJKanban();

});

const openModal = (type, project, refId) => {
  currentProject.value = project;
  referenceId.value = refId;
  modalChangeType.value = type;
  isModalOpen.value = true;
};

const isOpenConfirmationModal = ref(false);
const confirmationTitle = ref(null);
const confirmationBtn = ref(null);

const handleCallback = (result) => {
  if (result) {
    if (result.error !== undefined) {
      confirmationTitle.value = result.error;
      confirmationBtn.value = "danger";
    } else {
      confirmationTitle.value = result.data.message;
      confirmationBtn.value = "success";
    }
    isOpenConfirmationModal.value = true;
  }
  fetchProject();
};

const updateFileInputCount = () => {
  const fileInput = document.querySelector('#attachment');
  fileInputCount.value = fileInput.files.length;
};

const submitComment = async () => {
  errorMsg.value = '';

  const formData = new FormData();
  const fileInput = document.querySelector('#attachment');
  const selectedFiles = fileInput.files;

  if (newComment.value !== '') {
    formData.append('comment', newComment.value);
  }

  if (selectedFiles.length > 0) {
    for (let i = 0; i < selectedFiles.length; i++) {
      formData.append('attachments[]', selectedFiles[i]);
    }
  }

  if (startDate.value !== project.value.start_date) {
    formData.append('start_date', startDate.value);
  }

  if (endDate.value !== project.value.end_date) {
    formData.append('end_date', endDate.value);
  }

  if (progress.value !== project.value.progress) {
    formData.append('progress', progress.value);
  }

  if (newName.value !== '' && newName.value !== project.value.name) {
    formData.append('name', newName.value);
  }

  if (newDescription.value !== '' && newDescription.value !== project.value.description) {
    formData.append('description', newDescription.value);
  }

  if (
      !formData.has('comment') &&
      selectedFiles.length === 0 &&
      startDate.value === project.value.start_date &&
      endDate.value === project.value.end_date &&
      newName.value === project.value.name &&
      newDescription.value === project.value.description &&
      progress.value === project.value.progress
    ) {
    errorMsg.value = "Fill at least one criteria to update the project";
    return;
}

  try {
    await projectStore.addCommentToProject(apiBaseUrl, formData, project.value.id);
    newName.value = '';
    newDescription.value = '';
    newComment.value = '';
    fetchProject();
  } catch (error) {
    errorMsg.value = "An error occurred while adding the new comment. Please try again later.";
  }
}

</script>

<template>
  <SectionMain>
    <div v-if="isLoading" class="text-center p-4">
      <div class="flex justify-center items-center">
        <div class="w-5 h-5 border-t-4 border-blue-500 border-solid rounded-full animate-spin"></div>
      </div>
    </div>
    <div v-else>
      <div v-if="project">
        <SectionTitleLineWithButton :icon="mdiBriefcase" :title="project.name" main>
          <BaseButton
            href="/project/create"
            :icon="mdiPlus"
            label="Add Project"
            color="contrast"
            rounded-full
            small
          />
        </SectionTitleLineWithButton>
        <div class="grid grid-cols-1 gap-6 mb-6 ">
          <CardBox :key="project.id">
            <div class="flex flex-col gap-6">
              <div class="flex flex-col sm:flex-row gap-6">
                <div class="flex-1">
                  <div class="mb-1 w-full">
                    <b>Status</b>
                  </div>
                  <div class="mb-3 w-full">
                    <select v-model="project.status_id"
                      class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                      style="min-width: 120px;"
                      @change="openModal('status', project, $event.target.value)" small>
                      <option v-for="status in statusList" :key="status.id" :value="status.id">
                        {{ status.name }}
                      </option>
                    </select>
                  </div>
                </div>

                <div class="flex-1">
                  <div class="mb-1 w-full">
                    <b>Priority</b>
                  </div>
                  <div class="mb-3 w-full">
                    <select v-model="project.priority_id"
                      class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                      style="min-width: 120px;"
                      @change="openModal('priority', project, $event.target.value)" small>
                      <option v-for="priority in priorityList" :key="priority.id" :value="priority.id">
                        {{ priority.name }}
                      </option>
                    </select>
                  </div>
                </div>

                <div class="flex-1">
                  <div class="mb-1 w-full" style="min-width: 120px;">
                    <b>Start Date</b>
                  </div>
                  <div class="mb-3 w-full">
                    {{ project.start_date }}
                  </div>
                </div>

                <div class="flex-1">
                  <div class="mb-1 w-full" style="min-width: 120px;">
                    <b>End Date</b>
                  </div>
                  <div class="mb-3 w-full">
                    {{ project.end_date !== null ? project.end_date : '-' }}
                  </div>
                </div>

                <div class="flex-1">
                  <div class="mb-1 w-full">
                    <b>Created By</b>
                  </div>
                  <div class="mb-3 w-full whitespace-nowrap">
                    {{ project.userDetails.name }}
                  </div>
                </div>

                <div class="flex-1">
                  <div class="mb-1 w-full">
                    <b>Assigned To</b>
                  </div>
                  <div class="mb-3 w-full">
                    <select v-if="userList[0]"
                      class="select-box bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                      v-model="project.assigned_to_user_id"
                      @change="openModal('assigned_to', project, $event.target.value)" small>
                      <option value="">Unassign User</option>
                      <option v-for="user in userList" :key="user.id" :value="user.id">
                        <span v-if="user.id !== 'all'">{{ user.email }}</span>
                      </option>
                    </select>
                  </div>
                </div>

                <div>
                  <div class="mb-1 w-full"><b>&nbsp;</b></div>
                  <BaseButton
                    color="danger"
                    :icon="mdiTrashCan"
                    small
                    @click="openModal('delete', project, $event.target.value)"
                  />
                </div>
              </div>
            </div>
            <div class="flex flex-col gap-6">
              <div class="flex-1">
                <div class="mb-2 w-full">
                  <label><b>Progress</b></label>
                </div>
                <div class="flex-1">
                  <progress class="flex self-center lg:w-full" style="width:100%" max="100" :value="project.progress">
                    {{ project.progress }}
                  </progress>
                </div>
              </div>

              <div class="flex-1">
                <div class="mb-2 w-full">
                  <label><b>Description</b></label>
                </div>
                <div class="flex-1">
                  {{ project.description }}
                </div>
              </div>
            </div>
          </CardBox>

          <CardBox v-for="(data, index) in projectActivities" :key="data" class="text-justify">
            <div class="flex flex-row gap-6" :key="index">
              <div class="flex-1 gap-6 mb-3">
                <div v-if="data.description === 'Project created'">
                  {{ data.description }}
                </div>
                <div v-else>
                  <div v-if="data.properties.data.name !== undefined"><b>Project Name</b> - <span class="bold">{{ data.properties.data.name }}</span></div>
                  <div v-if="data.properties.data.description !== undefined"><b>Description</b> - <span class="bold">{{ data.properties.data.description }}</span></div>
                  <div v-if="data.properties.data.status_id !== undefined">
                    <b>Status updated to</b> -
                    <span class="bold">
                      {{ statusList.find(status => status.id === parseInt(data.properties.data.status_id))?.name || 'Status not found' }}
                    </span>
                  </div>
                  <div v-show="data.properties.data.priority_id !== undefined">
                    <b>Priority updated to </b> - <span class="bold">{{ priorityList.find(priority => priority.id === data.properties.data.priority_id)?.name || 'Priority not found' }}</span>
                  </div>
                  <div v-if="data.properties.data.start_date !== undefined"><b>Start Date</b> - <span class="bold">{{ data.properties.data.start_date }}</span></div>
                  <div v-if="data.properties.data.end_date !== undefined"><b>End Date</b> - <span class="bold">{{ data.properties.data.end_date }}</span></div>
                  <div v-if="data.properties.data.estimated_hours > 0"><b>Estimated hours</b> - <span class="bold">{{ data.properties.data.estimated_hours }} hrs</span></div>
                  <div v-if="data.properties.data.spent_hours > 0"><b>Spent hours</b> - <span class="bold">{{ data.properties.data.spent_hours }} hrs</span></div>
                  <div v-if="data.properties.data.progress > 0"><b>Progress</b> - <span class="bold">{{ data.properties.data.progress }}</span></div>
                  <div v-if="data.properties.data.assigned_to_user_id !== undefined">
                    <b>Assigned To</b> - <span class="bold">{{ userList.find(user => user.id === data.properties.data.assigned_to_user_id)?.name || 'User not found' }}</span>
                  </div>
                  <div v-if="data.properties.data.comment_id !== undefined">
                    <b>Comment</b> <br /> <span class="bold">{{ projectCommentList.find(comment => comment.id === data.properties.data.comment_id)?.comment_text || 'Comment not found' }}</span>
                  </div>
                  <div v-if="data.properties.data.attachment_ids !== undefined" class="flex flex-wrap">
                    <div v-for="(attachmentId, a_index) in data.properties.data.attachment_ids" :key="'attachment_'+a_index" class="flex-shrink-0 p-2">
                      <a v-if="isImageFile(projectAttachmentList.find(attachment => attachment.id === parseInt(attachmentId))?.file_name)"
                        :href="apiBaseAssetsUrl + project.id + '/' + projectAttachmentList.find(attachment => attachment.id === attachmentId)?.file_name"
                        target="_blank" rel="noopener noreferrer">
                          <div class="image-preview-container">
                            <img :src="apiBaseAssetsUrl + project.id + '/' + projectAttachmentList.find(attachment => attachment.id === attachmentId)?.file_name" alt="Attachment" class="image-preview">
                          </div>
                      </a>
                      <a v-else
                        :href="apiBaseAssetsUrl + project.id + '/' + projectAttachmentList.find(attachment => attachment.id === attachmentId)?.file_name"
                        download>
                          {{ projectAttachmentList.find(attachment => attachment.id === attachmentId)?.file_name }}
                      </a>
                    </div>
                  </div>
                </div>
                <div class="text-right"><hr>
                  <small>Updated by {{ userList.find(user => user.id === data.causer_id)?.name || 'User not found' }}  on  {{ formatTimestamp(data.created_at) }}</small>
                </div>
              </div>
            </div>
          </CardBox>
        </div>

        <CardBoxModalStateChanging v-if="currentProject" v-model="isModalOpen" title="Update the Project" button-label="Yes"
          has-cancel modal-type="project" :change="modalChangeType" :id="currentProject.id" :reference-id="referenceId"
          :callback="handleCallback">
          <p>
            {{ modalChangeType === 'delete'
              ? 'Are you sure you want to delete the project'
              : modalChangeType === 'assigned_to'
                ? referenceId === ''
                  ? 'Are you sure you want to unassign the current user from this project?'
                  : 'Are you sure you want to assign the selected user to this project?'
                : `Are you sure you want to change the ${modalChangeType === 'status' ? 'status' : 'priority'}?`
            }}
          </p>
        </CardBoxModalStateChanging>
        <CardBoxModal v-model="isOpenConfirmationModal" title="" :button="confirmationBtn">
          {{ confirmationTitle }}
        </CardBoxModal>
      </div>
      <div v-else>
        <p class="text-center">Project could not found!!! Please contact the administrator</p>
      </div>
    </div>
    <div v-if="project">
      <div v-if="hasAccessToTaskEdit">
        <SectionTitleLineWithButton :icon="mdiBriefcase" title="Tasks Related" main></SectionTitleLineWithButton>
        <div id="myKanban"></div>
      </div>
      <CardBox form @submit.prevent="submitComment">
        <div v-if="errorMsg" class="text-red-500">{{ errorMsg }}</div>
        <!-- <div class="flex-1 w-full">
          <label for="completed_progress" class="p-2">Update Project Name: </label>
          <FormControl class="flex-1 mb-3" v-model="newName" placeholder="Update the project Name" />
        </div>
        <div class="flex-1 w-full">
          <label for="completed_progress" class="p-2">Update Project Description: </label>
          <FormControl class="flex-1 mb-3" type="textarea" v-model="newDescription" placeholder="Update the project Description" />
        </div> -->
        <div class="flex flex-col sm:flex-row mb-3 gap-6">
          <div class="flex-1 w-full">
            <label for="completed_progress" class="p-2">Completed: </label>
            <select
              id="completed_progress"
              v-model="progress"
              class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500
              focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400
              dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
            >
              <option v-for="i in percentageArray()" :key="i" :value="i">
                {{ i }} %
              </option>
            </select>
          </div>

          <div class="flex-1 w-full sm:w-auto">
            <label for="completed_progress" class="p-2">Start Date: </label>
            <FormControl type="date" v-model="startDate" />
          </div>

          <div class="flex-1 w-full sm:w-auto">
            <label for="completed_progress" class="p-2">End Date: </label>
            <FormControl type="date" v-model="endDate" />
          </div>
        </div>
        <div class="flex flex-rows">
          <FormControl class="flex-1 mb-3" type="textarea" v-model="newComment" placeholder="Add a comment on the project" />
        </div>

        <div class="flex items-center justify-center w-full">
          <label for="attachment" class="flex flex-col items-center justify-center w-full h-64 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:hover:bg-bray-800 dark:bg-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:hover:border-gray-500 dark:hover:bg-gray-600">
            <div class="flex flex-col items-center justify-center pt-5 pb-6">
              <svg class="w-8 h-8 mb-4 text-gray-500 dark:text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16">
                <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"/>
              </svg>
              <p class="mb-2 text-sm text-gray-500 dark:text-gray-400"><span class="font-semibold">Click to upload</span> or drag and drop</p>
              <div v-if="fileInputCount > 0"> {{ fileInputCount }} file(s) selected</div>
            </div>
            <input id="attachment" type="file" multiple class="hidden" name="attachment[]" @change="updateFileInputCount" />
          </label>
        </div>

        <template #footer>
          <BaseButtons class="flex justify-end">
            <BaseButton type="submit" color="success" label="Update the Project"  @click="submitComment" />
          </BaseButtons>
        </template>
      </CardBox>
    </div>

  </SectionMain>
</template>

<style>
  .image-preview {
    width: 100px;
    height: 100px;
    object-fit: contain;
  }

  #myKanban {
    overflow-x: auto;
    padding: 20px 0;
  }

  .success {
    background: #00b961;
  }

  .primary {
    background: #0275d8;
  }

  .info {
    background: #2a92bf;
  }

  .warning {
    background: #f4ce46;
  }

  .danger {
    background: #d9534f;
  }

  .error {
    background: #fb7d44;
  }

  .custom-button {
    background-color: #4CAF50;
    border: none;
    color: white;
    padding: 7px 15px;
    margin: 10px;
    text-align: center;
    text-decoration: none;
    display: inline-block;
    font-size: 16px;
  }

  .custom-submit {
    background-color: #4CAF50 !important;
    border: none;
    color: white;
    padding: 7px 15px;
    margin: 0 10px 10px 10px;
    text-align: center;
    text-decoration: none;
    display: inline-block;
    font-size: 16px;
  }

  .custom-cancel {
    background-color: gainsboro !important;
    border: none;
    color: white;
    padding: 7px 15px;
    margin: 0 10px 10px 10px;
    text-align: center;
    text-decoration: none;
    display: inline-block;
    font-size: 16px;
  }
</style>
