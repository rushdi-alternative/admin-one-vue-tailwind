<script setup>
import NoAcess from "@/components/NoAcess.vue";
import SectionMain from "@/components/SectionMain.vue";
import LayoutAuthenticated from "@/layouts/LayoutAuthenticated.vue";
import { permissionsToTaskEdit } from "@/commons/constant";
import DetailsTask from "@/components/DetailsTask.vue";

const currentUserPermissions = JSON.parse(localStorage.getItem('permissions'));
const hasAccessToTaskEdit = currentUserPermissions !== null && permissionsToTaskEdit.some(permission => currentUserPermissions.includes(permission));
</script>

<template>
  <LayoutAuthenticated>
    <SectionMain>
      <DetailsTask v-if="hasAccessToTaskEdit" />
      <NoAcess v-if="!hasAccessToTaskEdit" label="edit the task" />
    </SectionMain>
  </LayoutAuthenticated>
</template>
