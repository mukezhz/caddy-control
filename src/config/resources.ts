// Define the resource types available in the system
export type ResourceAction = "view" | "manage";

export interface Resource {
  id: string;
  name: string;
  description: string;
  availableActions: ResourceAction[];
}

export const Resources = {
  PROXY_MANAGEMENT: "proxy_management",
  API_MANAGEMENT: "api_management",
  USER_MANAGEMENT: "user_management",
  WithManage: (resource: string) => `${resource}:manage`,
  WithView: (resource: string) => `${resource}:view`,
};

// Define the resources available in the system
export const RESOURCES: Resource[] = [
  {
    id: Resources.PROXY_MANAGEMENT,
    name: "Proxy Management",
    description: "Manage proxies and domain configurations",
    availableActions: ["view", "manage"],
  },
  {
    id: Resources.API_MANAGEMENT,
    name: "API Management",
    description: "Manage API keys for system access",
    availableActions: ["view", "manage"],
  },
  {
    id: Resources.USER_MANAGEMENT,
    name: "User Management",
    description: "Manage user accounts and permissions",
    availableActions: ["view", "manage"],
  },
];

// Helper function to generate permission name from resource and action
export const generatePermissionName = (
  resourceId: string,
  action: ResourceAction
): string => {
  return `${resourceId}:${action}`;
};

// Helper function to get description for a permission
export const getPermissionDescription = (
  resourceId: string,
  action: ResourceAction
): string => {
  const resource = RESOURCES.find((r) => r.id === resourceId);
  if (!resource) return "";

  const actionDescriptions: Record<ResourceAction, string> = {
    view: `View ${resource.name.toLowerCase()}`,
    manage: `Full management of ${resource.name.toLowerCase()}`,
  };

  return actionDescriptions[action];
};
