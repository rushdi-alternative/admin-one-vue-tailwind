<script setup>
import NoAcess from "@/components/NoAcess.vue";
import SectionMain from "@/components/SectionMain.vue";
import LayoutAuthenticated from "@/layouts/LayoutAuthenticated.vue";
import TableTasks from "@/components/TableTasks.vue";
import { permissionsToTaskView } from "@/commons/constant";

const currentUserPermissions = JSON.parse(localStorage.getItem('permissions'));
const hasAccessToTaskView = currentUserPermissions !== null && permissionsToTaskView.some(permission => currentUserPermissions.includes(permission));

</script>

<template>
  <LayoutAuthenticated>
    <SectionMain>
      <TableTasks  v-if="hasAccessToTaskView" />
      <NoAcess v-if="!hasAccessToTaskView" label="view tasks" />
    </SectionMain>
  </LayoutAuthenticated>
</template>
