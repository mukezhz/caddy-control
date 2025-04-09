export type Permission = {
  id: string;
  name: string;
  description: string | null;
}

export type Role = {
  id: string;
  name: string;
  description?: string | null;
  permissions?: Permission[];
}

export type User = {
  id: string;
  username: string;
  forcePasswordChange: boolean;
  createdAt: string | Date;
  role?: Role;
  isAdmin: boolean;
}