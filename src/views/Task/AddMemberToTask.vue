<script setup>
import NoAccess from "@/components/NoAcess.vue";
import SectionMain from "@/components/SectionMain.vue";
import CreateMemberToTask from "@/components/CreateMemberToTask.vue";
import { permissionsToAddMembersTask } from "@/commons/constant";
import LayoutAuthenticated from "@/layouts/LayoutAuthenticated.vue";

const currentUserPermissions = JSON.parse(localStorage.getItem('permissions'));
const hasAccessToAddMemberToTask = currentUserPermissions !== null && permissionsToAddMembersTask.some(permission => currentUserPermissions.includes(permission));

</script>

<template>
  <LayoutAuthenticated>
    <SectionMain>
      <CreateMemberToTask v-if="hasAccessToAddMemberToTask" />
      <NoAccess v-if="!hasAccessToAddMemberToTask" label="add member to the task" />
    </SectionMain>
  </LayoutAuthenticated>
</template>
