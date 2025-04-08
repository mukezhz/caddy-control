import { CreatePermissionData, CreateRoleData, UpdateRoleData, AssignRoleData } from "@/schemas/user/roles.schema";
import apiClient from "@/lib/api-client";
import { handleServerError } from "@/lib/handle-server-error";
import { Permission, Role } from "@/schemas/user/user.schema";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

// Define query keys as constants
const QUERY_KEYS = {
  PERMISSIONS: "permissions",
  ROLES: "roles",
  USERS: "users",
} as const;

type PermissionsResponse = {
  data: Permission[];
  total: number;
};

type PermissionResponse = {
  data: Permission;
};

type RolesResponse = {
  data: Role[];
  total: number;
};

type RoleResponse = {
  data: Role;
};

// API service functions
export const roleService = {
  // Permission functions
  getPermissions: async (): Promise<PermissionsResponse> => {
    const response = await apiClient.get("/api/permissions");
    return response?.data;
  },
  
  createPermission: async (payload: CreatePermissionData): Promise<PermissionResponse> => {
    const response = await apiClient.post("/api/permissions", payload);
    return response?.data;
  },
  
  // Role functions
  getRoles: async (): Promise<RolesResponse> => {
    const response = await apiClient.get("/api/roles");
    return response?.data;
  },
  
  createRole: async (payload: CreateRoleData): Promise<RoleResponse> => {
    const response = await apiClient.post("/api/roles", payload);
    return response?.data;
  },
  
  updateRole: async (payload: UpdateRoleData): Promise<RoleResponse> => {
    const response = await apiClient.put(`/api/roles/${payload.id}`, payload);
    return response?.data;
  },
  
  assignRole: async (payload: AssignRoleData): Promise<void> => {
    await apiClient.post("/api/user/assign-role", payload);
  }
};

// Permission hooks
export const useGetPermissions = (enabled = true) => {
  return useQuery({
    queryKey: [QUERY_KEYS.PERMISSIONS],
    queryFn: roleService.getPermissions,
    staleTime: 0,
    refetchOnMount: true,
    enabled,
  });
};

export const useCreatePermission = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: roleService.createPermission,
    throwOnError: false,
    onError: handleServerError,
    onSuccess: async () => {
      toast("Permission created successfully!");
      await queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.PERMISSIONS],
        exact: false,
      });
    },
  });
};

// Role hooks
export const useGetRoles = (enabled = true) => {
  return useQuery({
    queryKey: [QUERY_KEYS.ROLES],
    queryFn: roleService.getRoles,
    staleTime: 0,
    refetchOnMount: true,
    enabled,
  });
};

export const useCreateRole = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: roleService.createRole,
    throwOnError: false,
    onError: handleServerError,
    onSuccess: async () => {
      toast("Role created successfully!");
      await queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.ROLES],
        exact: false,
      });
    },
  });
};

export const useUpdateRole = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: roleService.updateRole,
    throwOnError: false,
    onError: handleServerError,
    onSuccess: async () => {
      toast("Role updated successfully!");
      await queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.ROLES],
        exact: false,
      });
    },
  });
};

export const useAssignRole = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: roleService.assignRole,
    throwOnError: false,
    onError: handleServerError,
    onSuccess: async () => {
      toast("Role assigned successfully!");
      await queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.USERS],
        exact: false,
      });
    },
  });
};