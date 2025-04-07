export type Permission = {
  id: string;
  name: string;
  description?: string;
}

export type Role = {
  id: string;
  name: string;
  description?: string;
  permissions: Permission[];
}

export type User = {
  id: string;
  username: string;
  forcePasswordChange: boolean;
  createdAt: string;
  role?: Role;
  isAdmin: boolean;
}
