import {
  mdiMenu,
  mdiClockOutline,
  mdiCloud,
  mdiCrop,
  mdiAccount,
  mdiCogOutline,
  mdiEmail,
  mdiLogout,
  mdiThemeLightDark,
  mdiGithub,
  mdiReact,
  mdiFaceManProfile,
  mdiPlus,
  mdiBriefcase,
} from "@mdi/js";
import {
  permissionsToAddMembersProject,
  permissionsToAddMembersTask,
  permissionsToPermissionAdd,
  permissionsToPermissionView,
  permissionsToProjectAdd,
  permissionsToProjectView,
  permissionsToRoleAdd,
  permissionsToRoleView,
  permissionsToTaskAdd,
  permissionsToTaskView,
  permissionsToUserAdd,
  permissionsToUserView,
  permissionsToViewMembersProject,
  permissionsToViewMembersTask
} from "./commons/constant";

const currentUserPermissions = JSON.parse(localStorage.getItem('permissions'));

const hasAccessToProjectCreate = currentUserPermissions !== null && permissionsToProjectAdd.some(permission => currentUserPermissions.includes(permission));
const hasAccessToProjectView = currentUserPermissions !== null && permissionsToProjectView.some(permission => currentUserPermissions.includes(permission));

const hasAccessToAddMemberToProject = currentUserPermissions !== null && permissionsToAddMembersProject.some(permission => currentUserPermissions.includes(permission));
// const hasAccessToViewMemberToProject = currentUserPermissions !== null && permissionsToViewMembersProject.some(permission => currentUserPermissions.includes(permission));

const hasAccessToTaskCreate = currentUserPermissions !== null && permissionsToTaskAdd.some(permission => currentUserPermissions.includes(permission));
const hasAccessToTaskView = currentUserPermissions !== null && permissionsToTaskView.some(permission => currentUserPermissions.includes(permission));

const hasAccessToAddMemberToTask = currentUserPermissions !== null && permissionsToAddMembersTask.some(permission => currentUserPermissions.includes(permission));
// const hasAccessToViewMemberToTask = currentUserPermissions !== null && permissionsToViewMembersTask.some(permission => currentUserPermissions.includes(permission));

const hasAccessToUserCreate = currentUserPermissions !== null && permissionsToUserAdd.some(permission => currentUserPermissions.includes(permission));
const hasAccessToUserView = currentUserPermissions !== null && permissionsToUserView.some(permission => currentUserPermissions.includes(permission));

const hasAccessToRoleCreate = currentUserPermissions !== null && permissionsToRoleAdd.some(permission => currentUserPermissions.includes(permission));
const hasAccessToRoleView = currentUserPermissions !== null && permissionsToRoleView.some(permission => currentUserPermissions.includes(permission));

const hasAccessToPermissionCreate = currentUserPermissions !== null && permissionsToPermissionAdd.some(permission => currentUserPermissions.includes(permission));
const hasAccessToPermissionView = currentUserPermissions !== null && permissionsToPermissionView.some(permission => currentUserPermissions.includes(permission));

const menuItems = [];

if (hasAccessToProjectCreate || hasAccessToProjectView) {
  const projectMenu = {
    icon: mdiBriefcase,
    label: "My Projects",
    menu: [],
  };

  if (hasAccessToProjectView) {
    projectMenu.menu.push({
      to: "/projects",
      icon: mdiFaceManProfile,
      label: "View",
    });
  }

  if (hasAccessToProjectCreate) {
    projectMenu.menu.push({
      to: "/project/create",
      icon: mdiPlus,
      label: "Add",
    });
  }

  if (hasAccessToAddMemberToProject) {
    projectMenu.menu.push({
      isDivider: true,
    });
    if (hasAccessToAddMemberToProject) {
      projectMenu.menu.push({
        to: "/project/member/add",
        icon: mdiPlus,
        label: "Add Member to Project",
      });
    }
  }

  menuItems.push(projectMenu);
}

if (hasAccessToTaskCreate || hasAccessToTaskView) {
  const taskMenu = {
    icon: mdiBriefcase,
    label: "My Tasks",
    menu: [],
  };

  if (hasAccessToTaskView) {
    taskMenu.menu.push({
      to: "/tasks",
      icon: mdiFaceManProfile,
      label: "View",
    });
  }

  if (hasAccessToTaskCreate) {
    taskMenu.menu.push({
      to: "/task/create",
      icon: mdiPlus,
      label: "Add",
    });
  }

  if (hasAccessToAddMemberToTask) {
    taskMenu.menu.push({
      isDivider: true,
    });
    if (hasAccessToAddMemberToTask) {
      taskMenu.menu.push({
        to: "/task/member/add",
        icon: mdiPlus,
        label: "Add Member to Task",
      });
    }
  }

  menuItems.push(taskMenu);
}

if (hasAccessToUserCreate || hasAccessToUserView) {
  const usersMenu = {
    icon: mdiFaceManProfile,
    label: "Users",
    menu: [],
  };

  if (hasAccessToUserView) {
    usersMenu.menu.push({
      to: "/users",
      icon: mdiFaceManProfile,
      label: "View",
    });
  }

  if (hasAccessToUserCreate) {
    usersMenu.menu.push({
      to: "/user/create",
      icon: mdiPlus,
      label: "Add",
    });
  }

  menuItems.push(usersMenu);
}

if (hasAccessToRoleCreate || hasAccessToRoleView) {
  const rolesMenu = {
    icon: mdiCogOutline,
    label: "Roles",
    menu: [],
  };

  if (hasAccessToRoleView) {
    rolesMenu.menu.push({
      to: "/roles",
      icon: mdiFaceManProfile,
      label: "View",
    });
  }

  if (hasAccessToRoleCreate) {
    rolesMenu.menu.push({
      to: "/role/create",
      icon: mdiPlus,
      label: "Add",
    });
  }

  menuItems.push(rolesMenu);
}

if (hasAccessToPermissionCreate || hasAccessToPermissionView) {
  const permissionsMenu = {
    icon: mdiCogOutline,
    label: "Permissions",
    menu: [],
  };

  if (hasAccessToPermissionView) {
    permissionsMenu.menu.push({
      to: "/permissions",
      icon: mdiFaceManProfile,
      label: "View",
    });
  }

  if (hasAccessToPermissionCreate) {
    permissionsMenu.menu.push({
      to: "/permission/create",
      icon: mdiPlus,
      label: "Add",
    });
  }

  menuItems.push(permissionsMenu);
}

menuItems.push(
  {
    isCurrentUser: true,
    menu: [
      {
        icon: mdiAccount,
        label: "My Profile",
        to: "/profile",
      },
      // {
      //   icon: mdiCogOutline,
      //   label: "Settings",
      // },
      // {
      //   icon: mdiEmail,
      //   label: "Messages",
      // },
      {
        isDivider: true,
      },
      {
        icon: mdiLogout,
        label: "Log Out",
        isLogout: true,
      },
    ],
  },
  {
    icon: mdiThemeLightDark,
    label: "Light/Dark",
    isDesktopNoLabel: true,
    isToggleLightDark: true,
  },
  // {
  //   icon: mdiLogout,
  //   label: "Log out",
  //   isDesktopNoLabel: true,
  //   isLogout: true,
  // }
);

export default menuItems;
