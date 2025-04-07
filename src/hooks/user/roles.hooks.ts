import { CreatePermissionData, CreateRoleData, UpdateRoleData, AssignRoleData } from "@/schemas/user/roles.schema";
import apiClient from "@/lib/api-client";
import { handleServerError } from "@/lib/handle-server-error";
import { Permission, Role } from "@/schemas/user/user.schema";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

// Permission hooks
export const getPermissions = async (): Promise<{
  data: Permission[];
  total: number;
}> => {
  const response = await apiClient.get("/api/permissions");
  return response?.data;
};

export const useGetPermissions = (enabled = true) => {
  return useQuery({
    queryKey: ["permissions"],
    queryFn: getPermissions,
    staleTime: 0,
    refetchOnMount: true,
    enabled,
  });
};

export const createPermission = async (
  payload: CreatePermissionData
): Promise<{
  data: Permission;
}> => {
  const response = await apiClient.post("/api/permissions", payload);
  return response?.data;
};

export const useCreatePermission = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreatePermissionData) => createPermission(payload),
    throwOnError: false,
    onError: (err: Error) => {
      handleServerError(err);
    },
    onSuccess: async () => {
      toast("Permission created successfully!");
      await queryClient.invalidateQueries({
        queryKey: ["permissions"],
        exact: false,
      });
    },
  });
};

// Role hooks
export const getRoles = async (): Promise<{
  data: Role[];
  total: number;
}> => {
  const response = await apiClient.get("/api/roles");
  return response?.data;
};

export const useGetRoles = (enabled = true) => {
  return useQuery({
    queryKey: ["roles"],
    queryFn: getRoles,
    staleTime: 0,
    refetchOnMount: true,
    enabled,
  });
};

export const createRole = async (
  payload: CreateRoleData
): Promise<{
  data: Role;
}> => {
  const response = await apiClient.post("/api/roles", payload);
  return response?.data;
};

export const useCreateRole = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateRoleData) => createRole(payload),
    throwOnError: false,
    onError: (err: Error) => {
      handleServerError(err);
    },
    onSuccess: async () => {
      toast("Role created successfully!");
      await queryClient.invalidateQueries({
        queryKey: ["roles"],
        exact: false,
      });
    },
  });
};

export const updateRole = async (
  payload: UpdateRoleData
): Promise<{
  data: Role;
}> => {
  const response = await apiClient.put(`/api/roles/${payload.id}`, payload);
  return response?.data;
};

export const useUpdateRole = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: UpdateRoleData) => updateRole(payload),
    throwOnError: false,
    onError: (err: Error) => {
      handleServerError(err);
    },
    onSuccess: async () => {
      toast("Role updated successfully!");
      await queryClient.invalidateQueries({
        queryKey: ["roles"],
        exact: false,
      });
    },
  });
};

export const assignRole = async (
  payload: AssignRoleData
): Promise<void> => {
  await apiClient.post("/api/user/assign-role", payload);
};

export const useAssignRole = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: AssignRoleData) => assignRole(payload),
    throwOnError: false,
    onError: (err: Error) => {
      handleServerError(err);
    },
    onSuccess: async () => {
      toast("Role assigned successfully!");
      await queryClient.invalidateQueries({
        queryKey: ["users"],
        exact: false,
      });
    },
  });
};