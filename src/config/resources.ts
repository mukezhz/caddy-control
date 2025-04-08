// Define the resource types available in the system
export type ResourceAction = 'view' | 'modify' | 'manage';

export interface Resource {
  id: string;
  name: string;
  description: string;
  availableActions: ResourceAction[];
}

// Define the resources available in the system
export const RESOURCES: Resource[] = [
  {
    id: 'domains',
    name: 'Domains',
    description: 'Manage domain configurations',
    availableActions: ['view', 'modify', 'manage'],
  },
  {
    id: 'proxies',
    name: 'Proxies',
    description: 'Configure proxy settings',
    availableActions: ['view', 'modify', 'manage'],
  },
  {
    id: 'api_keys',
    name: 'API Keys',
    description: 'Manage API keys for system access',
    availableActions: ['view', 'modify', 'manage'],
  },
  {
    id: 'users',
    name: 'Users',
    description: 'Manage user accounts',
    availableActions: ['view', 'modify', 'manage'],
  },
  {
    id: 'roles',
    name: 'Roles',
    description: 'Configure user roles',
    availableActions: ['view', 'modify', 'manage'],
  },
  {
    id: 'system',
    name: 'System',
    description: 'Access and control system settings',
    availableActions: ['view', 'manage'],
  },
  {
    id: 'dashboard',
    name: 'Dashboard',
    description: 'Access the system dashboard',
    availableActions: ['view'],
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
    modify: `Modify ${resource.name.toLowerCase()}`,
    manage: `Full management of ${resource.name.toLowerCase()}`
  };
  
  return actionDescriptions[action];
};