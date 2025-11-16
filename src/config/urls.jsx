// Centralized URL definitions and helpers

const withTrailingSlash = (s) => (s.endsWith("/") ? s.slice(0, -1) : s);

// Base URLs (overridable via Vite env variables)
const AUTH_BASE = withTrailingSlash(
  import.meta.env.VITE_AUTH_BASE_URL || "http://localhost:8010"
);
const ORG_BASE = withTrailingSlash(
  import.meta.env.VITE_ORG_BASE_URL || "http://localhost:8040"
);
const PROJECT_BASE = withTrailingSlash(
  import.meta.env.VITE_PROJECT_BASE_URL || "http://localhost:8050"
);

// Helper to join base + path safely
const join = (base, path = "") => {
  const b = withTrailingSlash(base);
  const p = path.startsWith("/") ? path : `/${path}`;
  return `${b}${p}`;
};

// Organisation service (8040)
export const ORG = {
  base: () => join(ORG_BASE, "/organisation"),
  create: () => join(ORG_BASE, "/organisation/create-org"),
  invite: () => join(ORG_BASE, "/organisation/invite"),
  updateRole: () => join(ORG_BASE, "/organisation/update-role"),
};

// Auth/Admin service (8010)
export const AUTH = {
  profile: (email) => join(AUTH_BASE, `/auth/profile/${email}`),
  profileUpdate: () => join(AUTH_BASE, "/auth/profile/update"),
  logout: () => join(AUTH_BASE, "/auth/logout"),
};

export const ADMIN = {
  users: ({ page = 0, size = 10 } = {}) =>
    join(AUTH_BASE, `/admin/dashboard/users?page=${page}&size=${size}`),
  toggleUserBlock: (userId) =>
    join(AUTH_BASE, `/admin/dashboard/users/${userId}/toggle-block`),
  projects: () => join(AUTH_BASE, "/admin/dashboard/projects"),
  salesGraph: (params) => join(AUTH_BASE, `/admin/dashboard/sales-graph${params ? `?${params}` : ""}`),
  salesGraphExcel: ({ startDate, endDate, groupBy }) =>
    join(
      AUTH_BASE,
      `/admin/dashboard/sales-graph/excel?startDate=${startDate}&endDate=${endDate}&groupBy=${groupBy}`
    ),
  salesGraphPdf: ({ startDate, endDate, groupBy }) =>
    join(
      AUTH_BASE,
      `/admin/dashboard/sales-graph/pdf?startDate=${startDate}&endDate=${endDate}&groupBy=${groupBy}`
    ),
};

// Project/Tasks/Sections/Chat (8050)
export const WS = {
  base: () => join(PROJECT_BASE, "/ws"),
};

export const SECTIONS = {
  byProject: (projectId) => join(PROJECT_BASE, `/sections/${projectId}`),
  create: () => join(PROJECT_BASE, "/sections/create"),
  update: (id) => join(PROJECT_BASE, `/sections/update/${id}`),
  remove: (id) => join(PROJECT_BASE, `/sections/delete/${id}`),
};

export const TASKS = {
  byProject: (projectId) => join(PROJECT_BASE, `/tasks/${projectId}`),
  create: () => join(PROJECT_BASE, "/tasks/create"),
  update: (id) => join(PROJECT_BASE, `/tasks/update/${id}`),
  move: (id, newSectionId) =>
    join(PROJECT_BASE, `/tasks/move/${id}?newSectionId=${newSectionId}`),
  generatePlan: () => join(PROJECT_BASE, "/tasks/generate-plan"),
  subtask: (id, index) => join(PROJECT_BASE, `/tasks/${id}/subtask/${index}`),
};

export const PROJECT = {
  update: (projectId) => join(PROJECT_BASE, `/project/update/${projectId}`),
  listByOrg: (orgId) => join(PROJECT_BASE, `/project/list/${orgId}`),
  listMembers: () => join(PROJECT_BASE, "/project/list/members"),
  create: () => join(PROJECT_BASE, "/project/create-project"),
};

export const MESSAGES = {
  byProject: (projectId) => join(PROJECT_BASE, `/messages/${projectId}`),
};

export const COMMENTS = {
  byTask: (taskId) => join(PROJECT_BASE, `/api/comments/${taskId}`),
};

// Image and placeholder URLs (static)
export const IMAGES = {
  LOGO_LIGHT: "https://i.ibb.co/BKFt5pPW/logo-dark.png",
  LOGO_DARK: "https://i.ibb.co/s9rf1nCJ/logo.png",
};

export default {
  AUTH_BASE,
  ORG_BASE,
  PROJECT_BASE,
  ORG,
  AUTH,
  ADMIN,
  WS,
  SECTIONS,
  TASKS,
  PROJECT,
  MESSAGES,
  COMMENTS,
  IMAGES,
};

