// Define the resource types available in the system
export type ResourceAction = 'view' | 'manage';

export interface Resource {
  id: string;
  name: string;
  description: string;
  availableActions: ResourceAction[];
}

// Define the resources available in the system
export const RESOURCES: Resource[] = [
  {
    id: 'proxy_management',
    name: 'Proxy Management',
    description: 'Manage proxies and domain configurations',
    availableActions: ['view', 'manage'],
  },
  {
    id: 'api_management',
    name: 'API Management',
    description: 'Manage API keys for system access',
    availableActions: ['view', 'manage'],
  },
  {
    id: 'user_management',
    name: 'User Management',
    description: 'Manage user accounts and permissions',
    availableActions: ['view', 'manage'],
  },
];

// Helper function to generate permission name from resource and action
export const generatePermissionName = (resourceId: string, action: ResourceAction): string => {
  return `${resourceId}:${action}`;
};

// Helper function to get description for a permission
export const getPermissionDescription = (resourceId: string, action: ResourceAction): string => {
  const resource = RESOURCES.find(r => r.id === resourceId);
  if (!resource) return '';
  
  const actionDescriptions: Record<ResourceAction, string> = {
    view: `View ${resource.name.toLowerCase()}`,
    manage: `Full management of ${resource.name.toLowerCase()}`
  };
  
  return actionDescriptions[action];
};